/* Alpha Academy Cambodia — Clock & Time
   ---------------------------------------------------------------------------
   THE CLOCK — an analogue clock whose hands can be dragged. The minute hand
   carries the hour hand with it (past 12 the hour moves on), the way a real
   clock does, so "twenty to five" can be seen as the hour hand nearly at 5.
   Beside it: the digital time in 12- and 24-hour form, and the time in
   English words and in Khmer (ម៉ោង ៤ និង ៤០ នាទី ល្ងាច).

   TIME LATER — add time to a start time, or find the time between two
   times, with the counting-on method written out: to the next hour, the
   whole hours, then the minutes that are left.

   PRACTISE — ten questions at a chosen level (o'clock and half past,
   quarters, five minutes, any minute): read the clock, or set it.

   Uses tools-core.js. Nothing is sent or stored; the address bar keeps the
   time and the tab: #tab=add&t=16:40                                      */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('ckRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh;
  var NS = 'http://www.w3.org/2000/svg';

  var T = {
    am: { en: 'am', km: 'ព្រឹក' }, pm: { en: 'pm', km: 'ល្ងាច' },
    h12: { en: '12-hour', km: '១២ ម៉ោង' }, h24: { en: '24-hour', km: '២៤ ម៉ោង' },
    from: { en: 'Start', km: 'ចាប់ផ្ដើម' }, to: { en: 'End', km: 'បញ្ចប់' },
    toHour: { en: 'From {a} to {b} is {m} min.', km: 'ពី {a} ដល់ {b} គឺ {m} នាទី។' },
    hours: { en: 'Then {h} whole hour{s}: {a} → {b}.', km: 'បន្ទាប់មក {h} ម៉ោងគត់៖ {a} → {b}។' },
    rest: { en: 'Then {m} min more: {a} → {b}.', km: 'បន្ទាប់មក {m} នាទីទៀត៖ {a} → {b}។' },
    total: { en: 'Altogether: {d}.', km: 'សរុប៖ {d}។' },
    landAt: { en: 'The time is {b}.', km: 'ម៉ោងគឺ {b}។' },
    nextDay: { en: 'This goes past midnight, into the next day.', km: 'វាហួសពាក់កណ្ដាលអធ្រាត្រ ចូលថ្ងៃបន្ទាប់។' },
    backDay: { en: 'This goes back past midnight, into the day before.', km: 'វាថយហួសពាក់កណ្ដាលអធ្រាត្រ ចូលថ្ងៃមុន។' },
    back: { en: 'Going back: {a} − {d} = {b}.', km: 'ថយក្រោយ៖ {a} − {d} = {b}។' },
    dur: { en: '{h} h {m} min', km: '{h} ម៉ោង {m} នាទី' },
    durM: { en: '{m} min', km: '{m} នាទី' },
    durH: { en: '{h} h', km: '{h} ម៉ោង' },
    qRead: { en: 'What time does the clock show?', km: 'នាឡិកាបង្ហាញម៉ោងប៉ុន្មាន?' },
    qSet: { en: 'Drag the hands to show {w}', km: 'អូសទ្រនិចឱ្យបង្ហាញ {w}' },
    q: { en: 'Question {i} of {n}', km: 'សំណួរទី {i} ក្នុងចំណោម {n}' },
    right: { en: 'Correct!', km: 'ត្រូវហើយ!' },
    wrong: { en: 'Not quite — it is {w}.', km: 'មិនទាន់ត្រូវ — គឺ {w}។' },
    score: { en: '{r} out of {n} correct', km: 'ត្រូវ {r} ក្នុងចំណោម {n}' },
    check: { en: 'Check', km: 'ពិនិត្យ' },
    next: { en: 'Next', km: 'បន្ទាប់' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }); }

  /* ------------------------------------------------------- words */
  var EN = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'quarter', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two',
    'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine'];
  function h12(h) { var x = h % 12; return x === 0 ? 12 : x; }
  function enWords(mm) {
    var h = Math.floor(mm / 60) % 24, m = mm % 60, w;
    if (m === 0) { w = h === 0 ? 'midnight' : h === 12 ? 'midday (noon)' : EN[h12(h)] + " o'clock"; }
    else if (m === 30) { w = 'half past ' + EN[h12(h)]; }
    else if (m < 30) { w = (m % 5 === 0 || m === 15 ? EN[m] : EN[m] + (m === 1 ? ' minute' : ' minutes')) + ' past ' + EN[h12(h)]; }
    else { var r = 60 - m; w = (r % 5 === 0 || r === 15 ? EN[r] : EN[r] + (r === 1 ? ' minute' : ' minutes')) + ' to ' + EN[h12(h + 1)]; }
    if (m === 0 && (h === 0 || h === 12)) { return w; }
    var hh = (m > 30 ? h + 1 : h) % 24;
    var part = hh === 0 || hh >= 20 ? 'at night' : hh < 12 ? 'in the morning' : hh < 17 ? 'in the afternoon' : 'in the evening';
    return w + ' ' + part;
  }
  function kmPart(h) { return h < 5 ? 'យប់' : h < 11 ? 'ព្រឹក' : h < 12 ? 'ព្រឹក' : h < 13 ? 'ថ្ងៃត្រង់' : h < 17 ? 'រសៀល' : h < 19 ? 'ល្ងាច' : 'យប់'; }
  function kmWords(mm) {
    var h = Math.floor(mm / 60) % 24, m = mm % 60, k = A.khDigits;
    if (m === 0 && h === 0) { return 'ម៉ោង ១២ យប់ (ពាក់កណ្ដាលអធ្រាត្រ)'; }
    var s = 'ម៉ោង ' + k(h12(h));
    s += m === 0 ? ' គត់' : m === 30 ? ' កន្លះ' : ' និង ' + k(m) + ' នាទី';
    return s + ' ' + kmPart(h);
  }
  function words(mm) { return A.lang() === 'km' ? kmWords(mm) : enWords(mm); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dig12(mm) { var h = Math.floor(mm / 60) % 24, m = mm % 60; return kh(h12(h) + ':' + pad(m)) + ' ' + t(h < 12 ? T.am : T.pm); }
  function dig24(mm) { var h = Math.floor(mm / 60) % 24, m = mm % 60; return kh(pad(h) + ':' + pad(m)); }
  function durStr(d) {
    var h = Math.floor(d / 60), m = d % 60;
    return h && m ? f(T.dur, { h: kh(h), m: kh(m) }) : h ? f(T.durH, { h: kh(h) }) : f(T.durM, { m: kh(m) });
  }
  function parseHM(s) { var m = /^(\d{1,2}):(\d{2})/.exec(s || ''); return m ? ((+m[1] % 24) * 60 + Math.min(59, +m[2])) : null; }

  /* ------------------------------------------------------ the clock face */
  function el(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) { e.setAttribute(k, attrs[k]); } return e; }
  function face(svg, mm, opt) {
    opt = opt || {};
    svg.setAttribute('viewBox', '0 0 240 240');
    svg.innerHTML = '';
    svg.appendChild(el('circle', { cx: 120, cy: 120, r: 112, class: 'ck-rim' }));
    svg.appendChild(el('circle', { cx: 120, cy: 120, r: 104, class: 'ck-face' }));
    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 90 : 96;
      svg.appendChild(el('line', { x1: 120 + Math.sin(a) * r1, y1: 120 - Math.cos(a) * r1, x2: 120 + Math.sin(a) * 101, y2: 120 - Math.cos(a) * 101, class: big ? 'ck-tick5' : 'ck-tick' }));
    }
    for (i = 1; i <= 12; i++) {
      var b = i * 30 * Math.PI / 180, txt = el('text', { x: 120 + Math.sin(b) * 75, y: 120 - Math.cos(b) * 75, class: 'ck-num' });
      txt.textContent = kh(i); svg.appendChild(txt);
    }
    if (opt.minutes) {
      for (i = 1; i <= 12; i++) {
        var c = i * 30 * Math.PI / 180, mt = el('text', { x: 120 + Math.sin(c) * 116, y: 120 - Math.cos(c) * 116, class: 'ck-mnum' });
        mt.textContent = kh((i * 5) % 60 === 0 ? '00' : i * 5); svg.appendChild(mt);
      }
    }
    var hg = el('g', { class: 'ck-hour', 'data-hand': 'h' }), mg = el('g', { class: 'ck-min', 'data-hand': 'm' });
    hg.appendChild(el('line', { x1: 120, y1: 132, x2: 120, y2: 62, class: 'ck-hh' }));
    mg.appendChild(el('line', { x1: 120, y1: 136, x2: 120, y2: 30, class: 'ck-mh' }));
    if (opt.drag) {
      hg.appendChild(el('circle', { cx: 120, cy: 66, r: 11, class: 'ck-grip' }));
      mg.appendChild(el('circle', { cx: 120, cy: 36, r: 11, class: 'ck-grip' }));
    }
    svg.appendChild(hg); svg.appendChild(mg);
    svg.appendChild(el('circle', { cx: 120, cy: 120, r: 6, class: 'ck-pin' }));
    setHands(svg, mm);
  }
  function setHands(svg, mm) {
    var m = mm % 60, h = (mm / 60) % 12;
    svg.querySelector('.ck-min').setAttribute('transform', 'rotate(' + (m * 6) + ' 120 120)');
    svg.querySelector('.ck-hour').setAttribute('transform', 'rotate(' + (h * 30) + ' 120 120)');
  }
  /* drag: returns the new minute-of-day */
  function dragger(svg, get, set, snapGet) {
    var hand = null;
    function ang(e) {
      var r = svg.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      var a = Math.atan2(x, -y) * 180 / Math.PI; return a < 0 ? a + 360 : a;
    }
    function move(e) {
      if (!hand) { return; }
      e.preventDefault();
      var a = ang(e), cur = get(), snap = snapGet();
      if (hand === 'm') {
        var m = Math.round(a / 6 / snap) * snap % 60, old = cur % 60, hour = Math.floor(cur / 60);
        if (old >= 45 && m < 15) { hour++; } else if (old < 15 && m >= 45) { hour--; }
        set(((hour * 60 + m) % 1440 + 1440) % 1440);
      } else {
        var half = cur >= 720 ? 720 : 0, mins = Math.round(a / 0.5 / snap) * snap % 720;
        set((half + mins) % 1440);
      }
    }
    svg.addEventListener('pointerdown', function (e) {
      var g = e.target.closest('[data-hand]');
      if (g) { hand = g.getAttribute('data-hand'); }
      else {   /* a tap on the face moves the nearer-in-angle hand */
        var a = ang(e), cur = get(), ma = (cur % 60) * 6, ha = ((cur / 60) % 12) * 30;
        var dm = Math.min(Math.abs(a - ma), 360 - Math.abs(a - ma)), dh = Math.min(Math.abs(a - ha), 360 - Math.abs(a - ha));
        hand = dm <= dh ? 'm' : 'h';
      }
      svg.setPointerCapture(e.pointerId); move(e);
    });
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerup', function () { hand = null; });
    svg.addEventListener('pointercancel', function () { hand = null; });
    svg.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 60, PageDown: -60 }[e.key];
      if (!d) { return; }
      e.preventDefault();
      var s = Math.abs(d) === 60 ? 60 : snapGet();
      set(((get() + (d > 0 ? s : -s)) % 1440 + 1440) % 1440);
    });
  }

  /* ---------------------------------------------------------- state */
  var H = A.readHash();
  var S = { tab: ['clock', 'add', 'quiz'].indexOf(H.tab) >= 0 ? H.tab : 'clock', mm: parseHM(H.t), snap: H.s === '1' ? 1 : 5, mode: H.m === 'btw' ? 'btw' : 'add', st: parseHM(H.a), dh: +H.dh || 1, dm: H.dm != null ? +H.dm : 35, en: parseHM(H.b), back: H.bk === '1' };
  if (S.mm == null) { S.mm = 16 * 60 + 40; }
  if (S.st == null) { S.st = 7 * 60 + 45; }
  if (S.en == null) { S.en = 11 * 60 + 20; }
  function save() {
    A.writeHash({ tab: S.tab === 'clock' ? '' : S.tab, t: pad(Math.floor(S.mm / 60)) + ':' + pad(S.mm % 60), s: S.snap === 1 ? '1' : '',
      m: S.mode === 'btw' ? 'btw' : '', a: pad(Math.floor(S.st / 60)) + ':' + pad(S.st % 60), dh: S.dh, dm: S.dm,
      b: pad(Math.floor(S.en / 60)) + ':' + pad(S.en % 60), bk: S.back ? '1' : '' });
  }

  var tabs = $('ckTabs');
  function paintTabs() {
    tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === S.tab)); });
    $('ckPaneC').hidden = S.tab !== 'clock';
    $('ckPaneA').hidden = S.tab !== 'add';
    $('ckPaneQ').hidden = S.tab !== 'quiz';
  }
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.tab = b.getAttribute('data-t'); paintTabs(); save();
    if (S.tab === 'quiz' && !Q) { newQuiz(); }
  });

  /* ============================================================ CLOCK */
  var big = $('ckBig');
  face(big, S.mm, { drag: true, minutes: true });
  function paintClock() {
    setHands(big, S.mm);
    big.setAttribute('aria-valuetext', words(S.mm));
    $('ck12').textContent = dig12(S.mm);
    $('ck24').textContent = dig24(S.mm);
    $('ckEn').textContent = enWords(S.mm);
    $('ckKm').textContent = kmWords(S.mm);
    $('ckL12').textContent = t(T.h12); $('ckL24').textContent = t(T.h24);
    $('ckSnap').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-s') === S.snap)); });
    $('ckAmpm').textContent = S.mm < 720 ? t(T.pm) + ' ⇄' : t(T.am) + ' ⇄';
  }
  dragger(big, function () { return S.mm; }, function (v) { S.mm = v; paintClock(); save(); }, function () { return S.snap; });
  $('ckNudge').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b) { return; }
    S.mm = ((S.mm + +b.getAttribute('data-d')) % 1440 + 1440) % 1440; paintClock(); save();
  });
  $('ckNow').addEventListener('click', function () { var d = new Date(); S.mm = d.getHours() * 60 + d.getMinutes(); paintClock(); save(); });
  $('ckAmpm').addEventListener('click', function () { S.mm = (S.mm + 720) % 1440; paintClock(); save(); });
  $('ckSnap').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.snap = +b.getAttribute('data-s'); paintClock(); save();
  });

  /* ======================================================= TIME LATER */
  var sA = $('ckSA'), sB = $('ckSB');
  face(sA, S.st, {}); face(sB, S.st, {});
  function hm(mm) { mm = ((mm % 1440) + 1440) % 1440; return pad(Math.floor(mm / 60)) + ':' + pad(mm % 60); }
  function paintAdd() {
    $('ckMode').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === S.mode)); });
    $('ckDurRow').hidden = S.mode !== 'add';
    $('ckEndRow').hidden = S.mode !== 'btw';
    $('ckDir').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-b') === '1') === S.back)); });
    if (document.activeElement !== $('ckStart')) { $('ckStart').value = hm(S.st); }
    if (document.activeElement !== $('ckEnd')) { $('ckEnd').value = hm(S.en); }
    if (document.activeElement !== $('ckDH')) { $('ckDH').value = S.dh; }
    if (document.activeElement !== $('ckDM')) { $('ckDM').value = S.dm; }
    var a = S.st, d, b, steps = [], day = '';
    if (S.mode === 'add') {
      d = Math.max(0, (S.dh | 0) * 60 + (S.dm | 0));
      b = S.back ? a - d : a + d;
      if (S.back) {
        steps.push(f(T.back, { a: dig12(a), d: durStr(d), b: dig12(((b % 1440) + 1440) % 1440) }));
        if (b < 0) { day = t(T.backDay); }
      }
    } else {
      b = S.en; d = (b - a + 1440) % 1440;
      if (b < a) { day = t(T.nextDay); }
    }
    if (!(S.mode === 'add' && S.back)) {
      if (b >= 1440) { day = t(T.nextDay); }
      /* count on: to the next hour, whole hours, the rest */
      var x = a, left = d, toH = (60 - a % 60) % 60;
      if (toH && left >= toH) { steps.push(f(T.toHour, { a: dig12(x % 1440), b: dig12((x + toH) % 1440), m: kh(toH) })); x += toH; left -= toH; }
      var hh = Math.floor(left / 60);
      if (hh) { steps.push(f(T.hours, { h: kh(hh), s: hh > 1 && A.lang() === 'en' ? 's' : '', a: dig12(x % 1440), b: dig12((x + hh * 60) % 1440) })); x += hh * 60; left -= hh * 60; }
      if (left) { steps.push(f(T.rest, { m: kh(left), a: dig12(x % 1440), b: dig12((x + left) % 1440) })); x += left; }
      steps.push(S.mode === 'add' ? f(T.landAt, { b: dig12(x % 1440) }) : f(T.total, { d: durStr(d) }));
    }
    if (day) { steps.push(day); }
    var bb = ((b % 1440) + 1440) % 1440;
    setHands(sA, a); setHands(sB, bb);
    $('ckLA').textContent = t(T.from) + ' · ' + dig12(a);
    $('ckLB').textContent = t(T.to) + ' · ' + dig12(bb);
    $('ckARes').textContent = S.mode === 'add' ? dig12(bb) + ' · ' + dig24(bb) : durStr(d);
    $('ckASteps').innerHTML = steps.map(function (s) { return '<li>' + A.esc(s) + '</li>'; }).join('');
  }
  $('ckMode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } S.mode = b.getAttribute('data-m'); paintAdd(); save(); });
  $('ckDir').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } S.back = b.getAttribute('data-b') === '1'; paintAdd(); save(); });
  $('ckStart').addEventListener('input', function () { var v = parseHM($('ckStart').value); if (v != null) { S.st = v; paintAdd(); save(); } });
  $('ckEnd').addEventListener('input', function () { var v = parseHM($('ckEnd').value); if (v != null) { S.en = v; paintAdd(); save(); } });
  $('ckDH').addEventListener('input', function () { var v = A.parse($('ckDH').value); if (v != null && !isNaN(v) && v >= 0) { S.dh = Math.min(99, Math.floor(v)); paintAdd(); save(); } });
  $('ckDM').addEventListener('input', function () { var v = A.parse($('ckDM').value); if (v != null && !isNaN(v) && v >= 0) { S.dm = Math.min(999, Math.floor(v)); paintAdd(); save(); } });
  $('ckAEx').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    var p = b.getAttribute('data-x').split('|');
    S.mode = p[0]; S.st = parseHM(p[1]);
    if (p[0] === 'add') { S.dh = +p[2]; S.dm = +p[3]; S.back = p[4] === '1'; } else { S.en = parseHM(p[2]); }
    $('ckStart').value = hm(S.st); $('ckEnd').value = hm(S.en); $('ckDH').value = S.dh; $('ckDM').value = S.dm;
    paintAdd(); save();
  });

  /* ========================================================= PRACTISE */
  var Q = null, qs = $('ckQ'), LV = [30, 15, 5, 1];
  face(qs, 0, { drag: true });
  var level = 1;
  function rnd(step) { return Math.floor(Math.random() * 12) * 60 + Math.floor(Math.random() * (60 / step)) * step + (Math.random() < 0.5 ? 0 : 720); }
  function newQuiz() { Q = { i: 0, n: 10, right: 0, cur: null, locked: false }; nextQ(); }
  function nextQ() {
    var step = LV[level], target = rnd(step), type = Q.i % 2 === 0 ? 'read' : 'set';
    Q.cur = { target: target, type: type, set: type === 'set' ? (target + 180 + 720) % 1440 - (target + 180 + 720) % step : target };
    Q.locked = false;
    paintQ();
  }
  function paintQ() {
    $('ckLevel').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-l') === level)); });
    $('ckQEnd').hidden = true; $('ckQGame').hidden = false;
    var c = Q.cur;
    $('ckQProg').textContent = f(T.q, { i: kh(Q.i + 1), n: kh(Q.n) }) + ' · ' + kh(Q.right) + ' ✓';
    $('ckQText').textContent = c.type === 'read' ? t(T.qRead) : f(T.qSet, { w: dig12(c.target) + ' (' + words(c.target) + ')' });
    qs.classList.toggle('ck-live', c.type === 'set');
    setHands(qs, c.type === 'read' ? c.target : c.set);
    $('ckQCheck').hidden = c.type !== 'set';
    $('ckQCheck').textContent = t(T.check);
    $('ckQFb').textContent = ''; $('ckQFb').className = 'tt-fb';
    $('ckQNext').hidden = true; $('ckQNext').textContent = t(T.next);
    var opts = $('ckQOpts');
    opts.hidden = c.type !== 'read';
    if (c.type === 'read') {
      if (!c.opts) {
        var o = [c.target], step = LV[level];
        var cand = [c.target + 60, c.target - 60, c.target + step * (Math.random() < 0.5 ? 1 : 2), c.target + 12 * 60 + 0, (c.target % 60) * 60 / 5 % 1440];
        /* the classic mistake: reading the hands the wrong way round */
        var hh = Math.floor((c.target % 720) / 60), mi = c.target % 60, swap = (mi / 5 % 12) * 60 + (hh * 5) % 60;
        cand.unshift(swap + (c.target >= 720 ? 720 : 0));
        cand.forEach(function (v) { v = ((v % 1440) + 1440) % 1440; if (o.length < 4 && o.every(function (x) { return x % 720 !== v % 720; })) { o.push(v); } });
        while (o.length < 4) { var r = rnd(step); if (o.every(function (x) { return x % 720 !== r % 720; })) { o.push(r); } }
        c.opts = o.sort(function () { return Math.random() - 0.5; });
      }
      opts.innerHTML = c.opts.map(function (v) { return '<button type="button" data-v="' + v + '">' + dig12(v) + '</button>'; }).join('');
    }
  }
  function answer(ok) {
    Q.locked = true;
    if (ok) { Q.right++; }
    $('ckQFb').textContent = ok ? t(T.right) : f(T.wrong, { w: dig12(Q.cur.target) + ' — ' + words(Q.cur.target) });
    $('ckQFb').className = 'tt-fb ' + (ok ? 'ok' : 'no');
    if (Q.cur.type === 'set') { setHands(qs, Q.cur.target); }
    $('ckQProg').textContent = f(T.q, { i: kh(Q.i + 1), n: kh(Q.n) }) + ' · ' + kh(Q.right) + ' ✓';
    $('ckQNext').hidden = false; $('ckQCheck').hidden = true;
    $('ckQNext').focus();
  }
  $('ckQOpts').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || Q.locked) { return; }
    var v = +b.getAttribute('data-v'), ok = v % 720 === Q.cur.target % 720;
    b.classList.add(ok ? 'is-ok' : 'is-no');
    if (!ok) { var r = $('ckQOpts').querySelector('[data-v="' + Q.cur.target + '"]'); if (r) { r.classList.add('is-ok'); } }
    answer(ok);
  });
  dragger(qs, function () { return Q && Q.cur ? Q.cur.set : 0; }, function (v) {
    if (!Q || Q.locked || Q.cur.type !== 'set') { return; }
    Q.cur.set = v; setHands(qs, v);
  }, function () { return LV[level] >= 5 ? 5 : 1; });
  $('ckQCheck').addEventListener('click', function () { if (!Q.locked) { answer(Q.cur.set % 720 === Q.cur.target % 720); } });
  $('ckQNext').addEventListener('click', function () {
    Q.i++;
    if (Q.i >= Q.n) {
      $('ckQGame').hidden = true; $('ckQEnd').hidden = false;
      $('ckQScore').textContent = f(T.score, { r: kh(Q.right), n: kh(Q.n) });
      return;
    }
    nextQ();
  });
  $('ckQAgain').addEventListener('click', newQuiz);
  $('ckLevel').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } level = +b.getAttribute('data-l'); newQuiz(); });

  /* ---------------------------------------------------------- language */
  document.addEventListener('aa:langchange', function () {
    face(big, S.mm, { drag: true, minutes: true }); face(sA, S.st, {}); face(sB, S.st, {}); face(qs, 0, { drag: true });
    paintClock(); paintAdd();
    if (Q) {
      if (!$('ckQEnd').hidden) { $('ckQScore').textContent = f(T.score, { r: kh(Q.right), n: kh(Q.n) }); }
      else if (!Q.locked) { paintQ(); } else { setHands(qs, Q.cur.target); }
    }
  });

  paintTabs(); paintClock(); paintAdd();
  if (S.tab === 'quiz') { newQuiz(); }
})();
