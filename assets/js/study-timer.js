/* Alpha Academy Cambodia — Study Timer
   ---------------------------------------------------------------------------
   A focus timer in the Pomodoro pattern: 25 minutes of work, a 5-minute
   break, and a longer break after every fourth session. Every length can be
   changed. Uses tools-core.js.

   FOUR THINGS DECIDE HOW THIS IS BUILT.

   1. THE CLOCK IS READ, NEVER COUNTED. As on the countdown, each tick works
      out end − Date.now(); nothing adds up seconds. A tab the browser has
      throttled to one tick a minute is still exact the moment you look.

   2. THE END IS ITS OWN TIMER. The display ticks with a chain of short
      timeouts, which a browser slows right down in a background tab. The
      chime does not ride on that chain: a single timeout is set for the
      exact end when the timer starts, so the bell rings on time while the
      student is in another tab doing the work.

   3. THE CHIME IS BUILT, NOT DOWNLOADED. Three notes from the Web Audio API,
      so it works offline. The audio context is opened on the first press of
      Start, because a browser will not let a page make sound before the
      reader has touched it. Phones also get a short vibration.

   4. NOTHING IS STORED. The lengths go in the address bar (#f=25&s=5&l=15&n=4)
      so a student can bookmark their own rhythm; the count of sessions and
      the log of what was worked on last only as long as the tab.          */
(function () {
  'use strict';

  var A = window.AATool;
  var root = document.getElementById('stRoot');
  if (!root) { return; }

  var T = {
    focus: { en: 'Focus', km: 'ផ្ចង់អារម្មណ៍' },
    short: { en: 'Short break', km: 'សម្រាកខ្លី' },
    long:  { en: 'Long break', km: 'សម្រាកវែង' },
    start: { en: 'Start', km: 'ចាប់ផ្ដើម' },
    pause: { en: 'Pause', km: 'ផ្អាក' },
    resume:{ en: 'Resume', km: 'បន្ត' },
    ready: { en: 'Ready when you are', km: 'ត្រៀមរួចរាល់ពេលអ្នកចង់' },
    going: { en: 'Stay with it', km: 'បន្តផ្ចង់អារម្មណ៍' },
    rest:  { en: 'Stand up, stretch, drink water', km: 'ក្រោកឈរ លាតសន្ធឹងខ្លួន ផឹកទឹក' },
    paused:{ en: 'Paused', km: 'បានផ្អាក' },
    doneF: { en: 'Session done — time for a break', km: 'វគ្គបានបញ្ចប់ — ដល់ពេលសម្រាក' },
    doneB: { en: 'Break over — back to it', km: 'អស់ពេលសម្រាក — ត្រឡប់មករៀនវិញ' },
    until: { en: '{n} more until a long break', km: 'នៅ {n} វគ្គទៀតដល់ការសម្រាកវែង' },
    next:  { en: 'Long break next', km: 'បន្ទាប់គឺសម្រាកវែង' },
    count: { en: '{n} focus sessions · {m} min', km: 'ផ្ចង់អារម្មណ៍ {n} វគ្គ · {m} នាទី' },
    count1:{ en: '1 focus session · {m} min', km: 'ផ្ចង់អារម្មណ៍ ១ វគ្គ · {m} នាទី' },
    none:  { en: 'Finished sessions are listed here while this tab is open.', km: 'វគ្គដែលបានបញ្ចប់ នឹងបង្ហាញនៅទីនេះ ពេលផ្ទាំងនេះនៅបើក។' },
    untitled: { en: 'Focus session', km: 'វគ្គផ្ចង់អារម្មណ៍' },
    min:   { en: 'min', km: 'នាទី' }
  };

  function $(id) { return document.getElementById(id); }
  var el = {
    modes: $('stModes'), time: $('stTime'), ring: $('stRing'), status: $('stStatus'),
    go: $('stGo'), goText: $('stGoText'), reset: $('stReset'), skip: $('stSkip'),
    dots: $('stDots'), cycle: $('stCycle'), task: $('stTask'), log: $('stLog'), total: $('stTotal'),
    f: $('stF'), s: $('stS'), l: $('stL'), n: $('stN'), auto: $('stAuto'), sound: $('stSound'),
    live: $('stLive'), stage: $('stStage')
  };

  var CFG = { focus: 25, short: 5, long: 15, every: 4 };
  var S = {
    mode: 'focus', running: false, end: 0, left: CFG.focus * 60000,
    done: 0,          /* focus sessions finished in this tab */
    inCycle: 0,       /* focus sessions finished since the last long break */
    minutes: 0, log: []
  };
  var tick = null, endTimer = null, baseTitle = document.title;

  function len(mode) { return CFG[mode] * 60000; }

  /* ============================================================ drawing */
  function mmss(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var out = (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    return A.kh(out);
  }

  var CIRC = 2 * Math.PI * 104;
  function drawClock() {
    var left = S.running ? S.end - Date.now() : S.left;
    el.time.textContent = mmss(left);
    var frac = 1 - Math.max(0, Math.min(1, left / len(S.mode)));
    el.ring.style.strokeDasharray = CIRC;
    el.ring.style.strokeDashoffset = String(CIRC * (1 - frac));
    document.title = S.running || S.left < len(S.mode)
      ? mmss(left).replace(/[០-៩]/g, function (d) { return String('០១២៣៤៥៦៧៨៩'.indexOf(d)); }) + ' · ' + A.t(T[S.mode]) + ' — ' + baseTitle
      : baseTitle;
  }

  function drawAll() {
    root.setAttribute('data-mode', S.mode);
    Array.prototype.forEach.call(el.modes.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-m') === S.mode ? 'true' : 'false');
      var lbl = b.querySelector('small');
      if (lbl) { lbl.textContent = A.kh(CFG[b.getAttribute('data-m')]) + ' ' + A.t(T.min); }
    });
    var fresh = !S.running && S.left === len(S.mode);
    el.goText.textContent = A.t(S.running ? T.pause : (fresh ? T.start : T.resume));
    el.go.classList.toggle('is-on', S.running);
    el.status.textContent = A.t(S.running ? (S.mode === 'focus' ? T.going : T.rest) : (fresh ? (S.flash || T.ready) : T.paused));

    /* the cycle dots */
    var html = '';
    for (var i = 0; i < CFG.every; i++) {
      html += '<i class="' + (i < S.inCycle ? 'on' : (i === S.inCycle && S.mode === 'focus' ? 'now' : '')) + '"></i>';
    }
    el.dots.innerHTML = html;
    var left = CFG.every - S.inCycle;
    el.cycle.textContent = left <= 1 && S.mode === 'focus' ? A.t(T.next) : A.t(T.until).replace('{n}', A.kh(Math.max(0, S.mode === 'focus' ? left - 1 : left)));

    /* the log */
    el.total.textContent = (S.done === 1 ? A.t(T.count1) : A.t(T.count).replace('{n}', A.kh(S.done))).replace('{m}', A.kh(Math.round(S.minutes)));
    if (!S.log.length) {
      el.log.innerHTML = '<li class="st-empty">' + A.esc(A.t(T.none)) + '</li>';
    } else {
      el.log.innerHTML = S.log.slice().reverse().map(function (e) {
        return '<li><span class="t">' + A.esc(A.kh(e.at)) + '</span><span class="w">' + A.esc(e.task || A.t(T.untitled)) +
          '</span><span class="m">' + A.kh(e.min) + ' ' + A.esc(A.t(T.min)) + '</span></li>';
      }).join('');
    }
    drawClock();
  }

  /* ============================================================ running */
  function loop() {
    clearTimeout(tick);
    if (!S.running) { return; }
    drawClock();
    var left = S.end - Date.now();
    if (left <= 0) { finish(); return; }
    tick = setTimeout(loop, (left % 1000) + 20);
  }

  function start() {
    unlockAudio();
    S.flash = null;
    S.running = true;
    S.end = Date.now() + S.left;
    clearTimeout(endTimer);
    endTimer = setTimeout(function () { if (S.running && Date.now() >= S.end - 50) { finish(); } }, S.left + 30);
    drawAll(); loop();
  }
  function pause() {
    S.left = Math.max(0, S.end - Date.now());
    S.running = false;
    clearTimeout(tick); clearTimeout(endTimer);
    drawAll();
  }
  function setMode(m, keepFlash) {
    S.running = false;
    clearTimeout(tick); clearTimeout(endTimer);
    S.mode = m; S.left = len(m);
    if (!keepFlash) { S.flash = null; }
    drawAll();
  }

  function finish() {
    if (!S.running) { return; }
    S.running = false;
    clearTimeout(tick); clearTimeout(endTimer);
    var was = S.mode, next;
    if (was === 'focus') {
      S.done++; S.inCycle++; S.minutes += CFG.focus;
      var d = new Date();
      S.log.push({ at: (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(),
                   task: el.task.value.trim(), min: CFG.focus });
      next = S.inCycle >= CFG.every ? 'long' : 'short';
      S.flash = T.doneF;
    } else {
      if (was === 'long') { S.inCycle = 0; }
      next = 'focus';
      S.flash = T.doneB;
    }
    el.live.textContent = A.t(S.flash);
    chime(was === 'focus');
    if (navigator.vibrate) { try { navigator.vibrate([180, 90, 180]); } catch (e) {} }
    el.stage.classList.remove('is-ding'); void el.stage.offsetWidth; el.stage.classList.add('is-ding');
    setMode(next, true);
    if (el.auto.checked) { start(); }
  }

  /* ============================================================== sound */
  var ac = null;
  function unlockAudio() {
    if (ac || !el.sound.checked) { return; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) { return; }
    try { ac = new C(); } catch (e) { ac = null; }
  }
  function chime(up) {
    if (!el.sound.checked) { return; }
    unlockAudio();
    if (!ac) { return; }
    if (ac.state === 'suspended') { ac.resume(); }
    var notes = up ? [659.25, 783.99, 1046.5] : [1046.5, 783.99, 659.25];
    notes.forEach(function (fq, i) {
      var t0 = ac.currentTime + i * 0.22;
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = fq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.32, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      o.connect(g); g.connect(ac.destination);
      o.start(t0); o.stop(t0 + 0.95);
    });
  }

  /* ========================================================== settings */
  function clampInt(v, lo, hi, def) {
    var n = A.parse(v);
    if (n == null || isNaN(n)) { return def; }
    return Math.max(lo, Math.min(hi, Math.round(n)));
  }
  function readSettings(fromInputs) {
    if (fromInputs) {
      CFG.focus = clampInt(el.f.value, 1, 180, CFG.focus);
      CFG.short = clampInt(el.s.value, 1, 60, CFG.short);
      CFG.long = clampInt(el.l.value, 1, 90, CFG.long);
      CFG.every = clampInt(el.n.value, 2, 8, CFG.every);
    }
    if (S.inCycle >= CFG.every) { S.inCycle = 0; }
    A.writeHash({ f: CFG.focus, s: CFG.short, l: CFG.long, n: CFG.every });
  }
  function fillSettings() {
    el.f.value = CFG.focus; el.s.value = CFG.short; el.l.value = CFG.long; el.n.value = CFG.every;
  }

  /* ============================================================= events */
  el.go.addEventListener('click', function () { if (S.running) { pause(); } else { start(); } });
  el.reset.addEventListener('click', function () { setMode(S.mode); });
  el.skip.addEventListener('click', function () {
    var next = S.mode === 'focus' ? (S.inCycle + 1 >= CFG.every ? 'long' : 'short') : 'focus';
    if (S.mode === 'long') { S.inCycle = 0; }
    setMode(next);
  });
  el.modes.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-m]');
    if (b) { setMode(b.getAttribute('data-m')); }
  });
  [el.f, el.s, el.l, el.n].forEach(function (inp) {
    inp.addEventListener('change', function () {
      readSettings(true); fillSettings();
      if (!S.running) { S.left = len(S.mode); }
      drawAll();
    });
  });
  el.sound.addEventListener('change', function () { if (el.sound.checked) { unlockAudio(); chime(true); } });
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' || /INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)) { return; }
    e.preventDefault();
    if (S.running) { pause(); } else { start(); }
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { loop(); drawClock(); } });
  document.addEventListener('aa:langchange', drawAll);

  /* ================================================================ go */
  var q = A.readHash();
  CFG.focus = clampInt(q.f, 1, 180, 25);
  CFG.short = clampInt(q.s, 1, 60, 5);
  CFG.long = clampInt(q.l, 1, 90, 15);
  CFG.every = clampInt(q.n, 2, 8, 4);
  fillSettings();
  S.left = len('focus');
  drawAll();
})();
