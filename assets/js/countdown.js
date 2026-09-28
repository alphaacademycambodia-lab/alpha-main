/* Alpha Academy Cambodia — Countdown
   ---------------------------------------------------------------------------
   Count down to any date and time, or to one of the events in the list, and
   celebrate when it lands. No dependencies, no network, nothing stored.

   FIVE THINGS DECIDE HOW THIS IS BUILT.

   1. THE MOMENT IS THE POINT. A countdown that reaches zero and shows four
      zeros has failed at the one job it had. At zero the stage turns over,
      the confetti fires once and a chime plays, and the clock keeps counting
      the other way so the moment is still readable an hour later. Someone who
      opens the page within a day of the event gets the celebration too — a
      person visiting on New Year's morning is not late, they are on time.

   2. THE CLOCK IS READ FROM THE SYSTEM CLOCK, NEVER ACCUMULATED. Every tick
      recomputes `target - Date.now()` from scratch and then schedules itself
      to the next whole second. A setInterval(1000) that adds one second per
      firing drifts, and drifts badly once the tab is backgrounded and the
      browser throttles it to once a minute. This way a tab left open all
      night is exactly right the moment it is looked at again.

   3. NOTHING IS STORED, SO THE URL IS THE STORAGE. The Tools page promises
      that nothing is uploaded and nothing is stored, and a countdown you
      cannot come back to is not much use — so the chosen target is written
      into the address bar as `#t=...&n=...` and read back on load. That makes
      it bookmarkable and sendable over Telegram without a single byte kept
      anywhere.

   4. A DATE THAT COMES FROM A SUB-DECREE IS NOT GUESSED HERE EITHER. The
      Cambodian public holidays come from kh-holidays.js so there is one
      source of truth on the site. Its four lunar holidays have no Gregorian
      date until the annual sub-decree is entered there, so they are named and
      explained rather than offered as a countdown that would be wrong. Same
      rule for Chinese New Year: it is a table of published dates, and when
      the table runs out the event stops being offered instead of being
      extrapolated.

   5. LOCAL TIME, DELIBERATELY. "Midnight on 1 January" means midnight where
      the reader is standing, so every target is built with new Date(y, m, d,
      hh, mm) — local — and never parsed from a string. new Date('2026-01-01')
      is UTC midnight and lands on 31 December west of Greenwich.             */
(function () {
  'use strict';

  var root = document.getElementById('cdRoot');
  if (!root) { return; }

  /* ------------------------------------------------------------- language */
  function lang() { return (window.AAi18n && window.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(o) { return (lang() === 'km' && o && o.km) ? o.km : (o ? o.en : ''); }

  var KHDIGIT = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  function num(n) {
    var s = String(n);
    if (lang() !== 'km') { return s; }
    return s.replace(/[0-9]/g, function (d) { return KHDIGIT[+d]; });
  }
  function pad2(n) { return num(n < 10 ? '0' + n : String(n)); }

  var MONTHS = {
    en: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'],
    km: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
         'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
  };
  var DOW = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    km: ['ថ្ងៃអាទិត្យ', 'ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍']
  };

  var T = {
    idle:     { en: 'Pick a date, or choose an event on the right.',
                km: 'សូមជ្រើសរើសកាលបរិច្ឆេទ ឬជ្រើសព្រឹត្តិការណ៍មួយនៅខាងស្តាំ។' },
    idleNarrow:{ en: 'Pick a date, or choose an event below.',
                km: 'សូមជ្រើសរើសកាលបរិច្ឆេទ ឬជ្រើសព្រឹត្តិការណ៍មួយខាងក្រោម។' },
    bad:      { en: 'That date is outside the years 1 to 9999.',
                km: 'កាលបរិច្ឆេទនោះនៅក្រៅចន្លោះឆ្នាំ ១ ដល់ ៩៩៩៩។' },
    counting: { en: 'Counting down to', km: 'កំពុងរាប់ថយក្រោយទៅ' },
    since:    { en: 'Time since', km: 'រយៈពេលចាប់តាំងពី' },
    myEvent:  { en: 'Your countdown', km: 'ការរាប់ថយក្រោយរបស់អ្នក' },
    days:     { en: 'Days',    km: 'ថ្ងៃ' },
    hours:    { en: 'Hours',   km: 'ម៉ោង' },
    mins:     { en: 'Minutes', km: 'នាទី' },
    secs:     { en: 'Seconds', km: 'វិនាទី' },
    allDay:   { en: 'All day', km: 'ពេញមួយថ្ងៃ' },
    atTime:   { en: 'at {t}',  km: 'ម៉ោង {t}' },
    hooray:   { en: 'It is here!', km: 'ដល់ពេលហើយ!' },
    totalD:   { en: '<b>{n}</b> days in total',   km: 'សរុប <b>{n}</b> ថ្ងៃ' },
    totalH:   { en: '<b>{n}</b> hours in total',  km: 'សរុប <b>{n}</b> ម៉ោង' },
    weeks:    { en: '{w} weeks and {d} days',     km: '{w} សប្តាហ៍ និង {d} ថ្ងៃ' },
    passedD:  { en: '<b>{n}</b> days ago',        km: '<b>{n}</b> ថ្ងៃមុន' },
    passedH:  { en: '<b>{n}</b> hours ago',       km: '<b>{n}</b> ម៉ោងមុន' },
    passedM:  { en: '<b>{n}</b> minutes ago',     km: '<b>{n}</b> នាទីមុន' },
    justNow:  { en: 'Just now',                   km: 'អម្បាញ់មិញ' },
    passedT:  { en: 'That moment has passed',     km: 'ពេលនោះបានកន្លងផុតទៅហើយ' },
    lands:    { en: 'Lands on a {d}',             km: 'ធ្លាក់លើ{d}' },
    wasA:     { en: 'It was a {d}',               km: 'វាជា{d}' },
    barP:     { en: '{p}% of the way from last year’s {n}',
                km: '{p}% នៃផ្លូវចាប់ពី{n}ឆ្នាំមុន' },
    copy:     { en: 'Copy link',   km: 'ចម្លងតំណ' },
    copied:   { en: 'Link copied', km: 'ចម្លងតំណរួច' },
    again:    { en: 'Celebrate again', km: 'អបអរម្តងទៀត' },
    soundOn:  { en: 'Chime on',  km: 'បើកសំឡេង' },
    soundOff: { en: 'Chime off', km: 'បិទសំឡេង' },
    inDays:   { en: 'in {n} days', km: '{n} ថ្ងៃទៀត' },
    inDay:    { en: 'in {n} day',  km: '{n} ថ្ងៃទៀត' },
    today:    { en: 'today',     km: 'ថ្ងៃនេះ' },
    tomorrow: { en: 'tomorrow',  km: 'ស្អែក' },
    grpKH:    { en: 'Cambodian public holidays', km: 'ថ្ងៃឈប់សម្រាកជាតិកម្ពុជា' },
    grpKHs:   { en: 'the next one of each, from the holiday calendar',
                km: 'លើកបន្ទាប់នៃនីមួយៗ ពីប្រតិទិនថ្ងៃឈប់សម្រាក' },
    grpWorld: { en: 'Dates people count to', km: 'កាលបរិច្ឆេទដែលគេរាប់ថយក្រោយ' },
    timer:    { en: 'Timer', km: 'កម្មវិធីកំណត់ម៉ោង' },
    tPaused:  { en: 'Timer paused', km: 'បានផ្អាកកម្មវិធីកំណត់ម៉ោង' },
    tUp:      { en: 'Time is up — over by', km: 'អស់ពេលហើយ — លើសពេល' },
    tUpName:  { en: 'Time is up!', km: 'អស់ពេលហើយ!' },
    tEnds:    { en: 'Ends at {t}', km: 'បញ្ចប់នៅម៉ោង {t}' },
    tEnded:   { en: 'Ended at {t}', km: 'បានបញ្ចប់នៅម៉ោង {t}' },
    tPausedL: { en: 'Paused — press Resume to carry on', km: 'បានផ្អាក — ចុច បន្ត ដើម្បីរាប់ទៀត' },
    tLen:     { en: 'Timer length <b>{n}</b>', km: 'រយៈពេល <b>{n}</b>' },
    tBar:     { en: '{p}% of the time used', km: 'បានប្រើអស់ {p}% នៃពេលវេលា' },
    start:    { en: 'Start',  km: 'ចាប់ផ្តើម' },
    pause:    { en: 'Pause',  km: 'ផ្អាក' },
    resume:   { en: 'Resume', km: 'បន្ត' },
    reset:    { en: 'Reset',  km: 'កំណត់ឡើងវិញ' },
    pendH:    { en: 'Set each year by sub-decree', km: 'កំណត់ជារៀងរាល់ឆ្នាំដោយអនុក្រឹត្យ' },
    pendP:    { en: 'These four follow the Khmer lunar calendar, so the Gregorian date moves every year and is fixed by the annual sub-decree. They are named here rather than counted down to, because a countdown to a guessed date is worse than none.',
                km: 'បួននេះដើរតាមប្រតិទិនចន្ទគតិខ្មែរ ដូច្នេះកាលបរិច្ឆេទសុរិយគតិផ្លាស់ប្តូររាល់ឆ្នាំ ហើយត្រូវកំណត់ដោយអនុក្រឹត្យប្រចាំឆ្នាំ។ យើងដាក់ឈ្មោះវានៅទីនេះ ជាជាងរាប់ថយក្រោយ ព្រោះការរាប់ថយក្រោយទៅកាន់កាលបរិច្ឆេទដែលទាយ គឺអាក្រក់ជាងគ្មានទៅទៀត។' }
  };

  /* ---------------------------------------------------------- date helpers */
  function fill(tpl, map) {
    return tpl.replace(/\{(\w+)\}/g, function (_, k) { return map[k] == null ? '' : map[k]; });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* Local midnight (or local hh:mm), never a parsed string. See note 5. */
  function at(y, m, d, hh, mm) { return new Date(y, m, d, hh || 0, mm || 0, 0, 0); }
  function isoDate(dt) {
    return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
  }
  function fmtDate(dt) {
    return DOW[lang()][dt.getDay()] + ', ' + num(dt.getDate()) + ' ' +
           MONTHS[lang()][dt.getMonth()] + ' ' + num(dt.getFullYear());
  }
  function fmtTime(dt) {
    return pad2(dt.getHours()) + ':' + pad2(dt.getMinutes());
  }
  /* The other language underneath, the same courtesy the date calculator
     pays: two people at one desk want two different readings of one date. */
  function fmtOther(dt) {
    var o = lang() === 'km' ? 'en' : 'km';
    function n(v) {
      return o === 'km' ? String(v).replace(/[0-9]/g, function (x) { return KHDIGIT[+x]; }) : String(v);
    }
    return DOW[o][dt.getDay()] + ', ' + n(dt.getDate()) + ' ' +
           MONTHS[o][dt.getMonth()] + ' ' + n(dt.getFullYear());
  }
  function fmtTimeS(dt) {
    return pad2(dt.getHours()) + ':' + pad2(dt.getMinutes()) + ':' + pad2(dt.getSeconds());
  }
  /* "1 d 02:05:00" style, like a phone timer. */
  function fmtDur(ms) {
    var sec = Math.round(ms / 1000);
    var d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600),
        m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var hms = pad2(h) + ':' + pad2(m) + ':' + pad2(s);
    var dw = lang() === 'km' ? 'ថ្ងៃ' : (d === 1 ? 'day' : 'days');
    return d ? num(d) + ' ' + dw + ' ' + hms : hms;
  }
  function startOfDay(dt) { return at(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0); }
  function wholeDaysBetween(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
  }

  /* ================================================================ events
     Two groups. The Cambodian one is read out of kh-holidays.js so the site
     has a single source of truth for a legal fact; the second is the short
     list of dates people actually ask a countdown for.

     CHINESE NEW YEAR IS A TABLE, NOT A FORMULA. It is the second new moon
     after the winter solstice in Chinese standard time, which is astronomy
     and cannot be done in ten lines. These are the published dates. When the
     table runs out the entry simply disappears from the list — the tool
     offers no date it cannot stand behind. Add years here when you need to. */
  var CNY = ['2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03',
             '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08'];

  /* Fixed Gregorian dates that are not Cambodian public holidays. */
  var WORLD = [
    { key: 'valentine', m: 2,  d: 14, em: '💐',
      en: "Valentine's Day",              km: 'ទិវានៃក្តីស្រឡាញ់' },
    { key: 'children',  m: 6,  d: 1,  em: '🧒',
      en: "International Children's Day", km: 'ទិវាកុមារអន្តរជាតិ' },
    { key: 'literacy',  m: 9,  d: 8,  em: '📖',
      en: 'International Literacy Day',   km: 'ទិវាអក្ខរកម្មអន្តរជាតិ' },
    { key: 'teachers',  m: 10, d: 5,  em: '🍎',
      en: "World Teachers' Day",          km: 'ទិវាគ្រូបង្រៀនពិភពលោក' },
    { key: 'christmas', m: 12, d: 25, em: '🎄',
      en: 'Christmas Day',                km: 'បុណ្យណូអែល' }
  ];

  /* An emoji per Cambodian holiday, keyed on the `key` kh-holidays.js gives
     each one. Anything without an entry falls back to the flag. */
  var KH_EMOJI = {
    newyear: '🎆', women: '💜', khmernew: '🎊', labour: '🛠️', kingbd: '👑',
    queenbd: '👑', constitution: '📜', kingfather: '🕊️', coronation: '👑',
    independence: '🇰🇭'
  };

  /* The next occurrence of a day that repeats on the same date every year,
     plus the previous one so the progress bar has something honest to
     measure from. `d` may be 29 February; that year simply has no occurrence
     and the search rolls on to the next one that does. */
  function annual(m1, d1, now) {
    var y = now.getFullYear(), next = null, prev = null, i;
    for (i = 0; i <= 5 && !next; i++) {
      var c = at(y + i, m1 - 1, d1, 0, 0);
      if (c.getMonth() === m1 - 1 && c.getDate() === d1 && c >= now) { next = c; }
    }
    if (!next) { return null; }
    for (i = 1; i <= 5 && !prev; i++) {
      var p = at(next.getFullYear() - i, m1 - 1, d1, 0, 0);
      if (p.getMonth() === m1 - 1 && p.getDate() === d1) { prev = p; }
    }
    return { when: next, prev: prev };
  }

  function buildEvents(now) {
    var kh = [], world = [], pending = [];

    /* ---- Cambodia, out of the holiday file ---- */
    if (window.KH_HOLIDAYS) {
      window.KH_HOLIDAYS.fixed.forEach(function (f) {
        var a = annual(f.m, f.d, now);
        if (!a) { return; }
        kh.push({
          key: 'kh-' + f.key, em: KH_EMOJI[f.key] || '🇰🇭',
          name: { en: f.en, km: f.km }, when: a.when, prev: a.prev, allDay: true
        });
      });

      /* A movable holiday only becomes an event once its year is in YEARS.
         Until then it is listed by name and left alone. */
      var years = window.KH_HOLIDAYS.years || {};
      window.KH_HOLIDAYS.movable.forEach(function (mv) {
        var found = null;
        [now.getFullYear(), now.getFullYear() + 1].forEach(function (y) {
          if (found) { return; }
          var iso = years[y] && years[y].dates && years[y].dates[mv.key];
          if (!iso) { return; }
          var b = String(iso).split('-');
          var dt = at(+b[0], +b[1] - 1, +b[2], 0, 0);
          if (dt >= now) { found = dt; }
        });
        if (found) {
          kh.push({
            key: 'kh-' + mv.key, em: '🌕', name: { en: mv.en, km: mv.km },
            when: found, prev: null, allDay: true
          });
        } else {
          pending.push({ en: mv.en, km: mv.km });
        }
      });
      kh.sort(function (a, b) { return a.when - b.when; });
    }

    /* ---- the rest of the world ---- */
    var cnyNext = null, cnyPrev = null;
    CNY.forEach(function (iso) {
      var b = iso.split('-');
      var dt = at(+b[0], +b[1] - 1, +b[2], 0, 0);
      if (dt < now) { cnyPrev = dt; } else if (!cnyNext) { cnyNext = dt; }
    });
    if (cnyNext) {
      world.push({
        key: 'cny', em: '🧧',
        name: { en: 'Chinese New Year', km: 'បុណ្យចូលឆ្នាំចិន' },
        when: cnyNext, prev: cnyPrev, allDay: true
      });
    }
    WORLD.forEach(function (w) {
      var a = annual(w.m, w.d, now);
      if (!a) { return; }
      world.push({
        key: w.key, em: w.em, name: { en: w.en, km: w.km },
        when: a.when, prev: a.prev, allDay: true
      });
    });
    world.sort(function (a, b) { return a.when - b.when; });

    return { kh: kh, world: world, pending: pending };
  }

  /* ================================================================= state */
  var el = {
    stage:   document.getElementById('cdStage'),
    eyebrow: document.getElementById('cdEyebrow'),
    hoorayText: document.getElementById('cdHoorayText'),
    name:    document.getElementById('cdName'),
    when:    document.getElementById('cdWhen'),
    clock:   document.getElementById('cdClock'),
    bar:     document.getElementById('cdBar'),
    barFill: document.getElementById('cdBarFill'),
    barText: document.getElementById('cdBarText'),
    facts:   document.getElementById('cdFacts'),
    copy:    document.getElementById('cdCopy'),
    copyT:   document.getElementById('cdCopyText'),
    sound:   document.getElementById('cdSound'),
    soundT:  document.getElementById('cdSoundText'),
    again:   document.getElementById('cdAgain'),
    confetti:document.getElementById('cdConfetti'),
    date:    document.getElementById('cdDate'),
    time:    document.getElementById('cdTime'),
    label:   document.getElementById('cdLabel'),
    allday:  document.getElementById('cdAllDay'),
    groups:  document.getElementById('cdGroups')
  };
  var units = {
    d: el.clock.querySelector('[data-u="d"] b'),
    h: el.clock.querySelector('[data-u="h"] b'),
    m: el.clock.querySelector('[data-u="m"] b'),
    s: el.clock.querySelector('[data-u="s"] b')
  };
  var secCard = el.clock.querySelector('[data-u="s"]');

  var state = {
    target: null,    /* Date */
    prev: null,      /* Date | null — the previous occurrence, for the bar */
    name: null,      /* {en,km} | string | null */
    allDay: true,
    key: null,       /* which preset is selected, if any */
    done: false,     /* has the celebration already fired for this target? */
    sound: true,
    lastSec: null,
    timer: null      /* {dur, rem} — rem is set only while paused */
  };

  var EVENTS = buildEvents(new Date());

  /* ------------------------------------------------------------- the sound
     Built with the Web Audio API rather than shipped as a file, so it still
     works with the network off — the same choice the kindergarten pages make.
     Three notes of a major triad, short and soft. If the browser has not
     unlocked audio yet the call simply does nothing; it is a garnish. */
  var actx = null;
  function chime() {
    if (!state.sound) { return; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { return; }
      if (!actx) { actx = new AC(); }
      if (actx.state === 'suspended' && actx.resume) { actx.resume(); }
      [0, 0.16, 0.32].forEach(function (delay, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine';
        o.frequency.value = [660, 880, 1320][i];
        var t0 = actx.currentTime + delay;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
        o.connect(g); g.connect(actx.destination);
        o.start(t0); o.stop(t0 + 0.9);
      });
    } catch (e) { /* a chime is never worth an error */ }
  }

  /* ---------------------------------------------------------- the confetti
     Pure CSS pieces, absolutely positioned inside the stage, removed once
     they have fallen. Skipped entirely under prefers-reduced-motion — the
     stylesheet hides the layer, and this checks too so the DOM stays clean. */
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function confetti() {
    if (REDUCED && REDUCED.matches) { return; }
    /* It falls over a brand-blue panel, so no blues — a blue piece on a blue
       ground is a piece that never arrives. */
    var colours = ['#f3b23f', '#e8734a', '#34a853', '#ffffff', '#ff7bac', '#ffe08a'];
    var html = '';
    for (var i = 0; i < 70; i++) {
      var left = Math.round(Math.random() * 100);
      var delay = (Math.random() * 1.6).toFixed(2);
      var dur = (2.6 + Math.random() * 2.4).toFixed(2);
      var dx = Math.round((Math.random() - 0.5) * 220);
      var spin = Math.round(360 + Math.random() * 900);
      var w = 6 + Math.round(Math.random() * 6);
      var c = colours[i % colours.length];
      html += '<i style="left:' + left + '%;background:' + c +
              ';width:' + w + 'px;height:' + (w + 6) + 'px' +
              ';--dx:' + dx + 'px;--spin:' + spin + 'deg' +
              ';animation-duration:' + dur + 's;animation-delay:' + delay + 's' +
              (i % 3 === 0 ? ';border-radius:50%' : '') + '"></i>';
    }
    el.confetti.innerHTML = html;
    window.setTimeout(function () { el.confetti.innerHTML = ''; }, 7000);
  }

  chime.unlock = function () {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { return; }
      if (!actx) { actx = new AC(); }
      if (actx.state === 'suspended' && actx.resume) { actx.resume(); }
    } catch (e) {}
  };

  function celebrate() {
    el.stage.classList.add('is-done');
    confetti();
    chime();
  }

  /* ================================================================ paint */
  function setTarget(dt, opts) {
    opts = opts || {};
    state.target = dt;
    if (!opts.timer) { state.timer = null; }
    state.prev = opts.prev || null;
    state.name = opts.name || null;
    state.allDay = opts.allDay !== false;
    state.key = opts.key || null;
    state.done = false;
    el.stage.classList.remove('is-done');
    el.confetti.innerHTML = '';
    markSelected();
    writeHash();
    tick();
  }

  function currentName() {
    if (!state.name) { return t(T.myEvent); }
    if (typeof state.name === 'string') { return state.name; }
    return t(state.name);
  }

  function idle(msg) {
    el.stage.classList.add('is-idle');
    el.stage.classList.remove('is-done');
    el.eyebrow.textContent = t(T.counting);
    el.name.textContent = msg;
    el.when.textContent = '';
  }

  function tick() {
    if (!state.target) {
      idle(window.innerWidth > 1040 ? t(T.idle) : t(T.idleNarrow));
      paintTimerUI();
      return;
    }
    el.stage.classList.remove('is-idle');

    var now = Date.now();
    var tm = state.timer;
    var left = (tm && tm.rem != null) ? tm.rem : state.target.getTime() - now;
    var past = left <= 0;

    /* The celebration fires when the moment arrives while the page is open,
       and also for anyone opening the page within a day of it — being early
       to New Year's morning should not mean missing the confetti. */
    if (past && !state.done) {
      state.done = true;
      if (left > -86400000) { celebrate(); }
      else { el.stage.classList.add('is-done'); }
    }

    var abs = Math.abs(left);
    var d = Math.floor(abs / 86400000);
    var h = Math.floor(abs % 86400000 / 3600000);
    var m = Math.floor(abs % 3600000 / 60000);
    var s = Math.floor(abs % 60000 / 1000);

    if (tm) {
      el.eyebrow.textContent = past ? t(T.tUp) : (tm.rem != null ? t(T.tPaused) : t(T.timer));
      el.name.textContent = past ? t(T.tUpName) : fmtDur(tm.dur);
    } else {
      el.eyebrow.textContent = past ? t(T.since) : t(T.counting);
      el.name.textContent = currentName();
    }

    /* The one thing on the page that is announced. It is written only when
       it changes, so a screen reader hears the celebration once rather than
       being read a clock sixty times a minute — which is also why nothing
       else here is a live region. */
    var say = past ? (tm ? t(T.tUpName) : currentName() + ' — ' + t(T.hooray)) : '';
    if (el.hoorayText.textContent !== say) { el.hoorayText.textContent = say; }

    if (tm && tm.rem != null) {
      el.when.innerHTML = esc(t(T.tPausedL));
    } else if (tm) {
      var endLine = fill(t(past ? T.tEnded : T.tEnds), { t: fmtTimeS(state.target) });
      if (wholeDaysBetween(new Date(now), state.target) !== 0) { endLine += ' · ' + fmtDate(state.target); }
      el.when.innerHTML = esc(endLine);
    } else {
      var line = fmtDate(state.target);
      if (!state.allDay) { line += ' · ' + fill(t(T.atTime), { t: fmtTime(state.target) }); }
      el.when.innerHTML = esc(line) + '<em>' + esc(fmtOther(state.target)) + '</em>';
    }

    units.d.textContent = num(d);
    units.h.textContent = pad2(h);
    units.m.textContent = pad2(m);
    units.s.textContent = pad2(s);

    if (s !== state.lastSec) {
      state.lastSec = s;
      secCard.classList.remove('is-tick');
      void secCard.offsetWidth;          /* restart the animation */
      secCard.classList.add('is-tick');
    }

    /* ---- the chips ---- */
    var chips = [];
    if (tm) {
      chips.push({ html: fill(t(T.tLen), { n: esc(fmtDur(tm.dur)) }), key: true });
    } else if (past) {
      /* "0 days ago" is a worse answer than "2 hours ago", so the biggest
         unit that is actually non-zero does the talking. */
      chips.push({
        html: d ? fill(t(T.passedD), { n: num(d) })
            : h ? fill(t(T.passedH), { n: num(h) })
            : m ? fill(t(T.passedM), { n: num(m) })
            : esc(t(T.justNow)),
        key: true
      });
      chips.push({ text: t(T.passedT) });
    } else {
      chips.push({ html: fill(t(T.totalD), { n: num(d) }), key: true });
      chips.push({ html: fill(t(T.totalH), { n: num(Math.floor(abs / 3600000)) }) });
      if (d >= 7) {
        chips.push({ text: fill(t(T.weeks), { w: num(Math.floor(d / 7)), d: num(d % 7) }) });
      }
    }
    if (!tm) {
      chips.push({ text: fill(t(past ? T.wasA : T.lands), { d: DOW[lang()][state.target.getDay()] }) });
    }
    el.facts.innerHTML = chips.map(function (c) {
      return '<li' + (c.key ? ' class="is-key"' : '') + '>' + (c.html || esc(c.text)) + '</li>';
    }).join('');

    /* ---- the progress bar ---- */
    if (tm && !past) {
      var tp = Math.max(0, Math.min(100, (tm.dur - left) / tm.dur * 100));
      el.barFill.style.width = tp.toFixed(2) + '%';
      el.barText.textContent = fill(t(T.tBar), { p: num(Math.floor(tp)) });
      el.bar.hidden = false;
    } else if (state.prev && !past) {
      var span = state.target.getTime() - state.prev.getTime();
      var gone = now - state.prev.getTime();
      var pct = Math.max(0, Math.min(100, gone / span * 100));
      el.barFill.style.width = pct.toFixed(2) + '%';
      el.barText.textContent = fill(t(T.barP), { p: num(Math.round(pct)), n: currentName() });
      el.bar.hidden = false;
    } else {
      el.bar.hidden = true;
    }

    el.again.hidden = !past;
    paintTimerUI();
    rollDay();
  }

  /* The "in N days" badge beside each event only changes once a day, and a
     holiday that has just gone past needs its next occurrence recomputed —
     both of which are a once-a-day job, not a sixty-times-a-minute one. */
  var lastListDay = null;
  function rollDay() {
    var today = isoDate(new Date());
    if (today === lastListDay) { return; }
    lastListDay = today;
    EVENTS = buildEvents(new Date());
    drawList();
  }

  /* ============================================================== the list */
  /* Deliberately the same measure the clock uses — whole days of elapsed
     time, not whole calendar days between the two dates. The two differ by
     one for most of any given day, and a list saying "in 33 days" beside a
     clock reading 32 would look like one of them was broken. Today and
     tomorrow are named rather than numbered, which is also what covers the
     cases where elapsed days rounds down to nothing. */
  function evBadge(ev) {
    var cal = wholeDaysBetween(new Date(), ev.when);
    if (cal === 0) { return t(T.today); }
    if (cal === 1) { return t(T.tomorrow); }
    var n = Math.floor((ev.when.getTime() - Date.now()) / 86400000);
    if (n <= 1) { return fill(t(T.inDay), { n: num(1) }); }
    return fill(t(T.inDays), { n: num(n) });
  }

  function groupHTML(title, sub, list) {
    if (!list.length) { return ''; }
    return '<div class="cd-group">' +
      '<h3>' + esc(title) + (sub ? ' <small>' + esc(sub) + '</small>' : '') + '</h3>' +
      '<ul class="cd-events">' + list.map(function (ev) {
        return '<li><button type="button" class="cd-ev" data-key="' + esc(ev.key) + '"' +
          ' aria-pressed="' + (state.key === ev.key ? 'true' : 'false') + '">' +
          '<span class="em" aria-hidden="true">' + ev.em + '</span>' +
          '<span class="nm">' + esc(t(ev.name)) +
            '<small>' + esc(fmtDate(ev.when)) + '</small></span>' +
          '<span class="in">' + esc(evBadge(ev)) + '</span>' +
          '</button></li>';
      }).join('') + '</ul></div>';
  }

  function drawList() {
    var html = groupHTML(t(T.grpKH), t(T.grpKHs), EVENTS.kh) +
               groupHTML(t(T.grpWorld), '', EVENTS.world);

    if (EVENTS.pending.length) {
      html += '<div class="cd-nodate"><h4>' + esc(t(T.pendH)) + '</h4>' +
        '<p>' + esc(t(T.pendP)) + '</p><ul>' +
        EVENTS.pending.map(function (p) { return '<li>' + esc(t(p)) + '</li>'; }).join('') +
        '</ul></div>';
    }
    el.groups.innerHTML = html;
  }

  function markSelected() {
    el.groups.querySelectorAll('.cd-ev').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-key') === state.key));
    });
  }

  function findEvent(key) {
    var all = EVENTS.kh.concat(EVENTS.world), i;
    for (i = 0; i < all.length; i++) { if (all[i].key === key) { return all[i]; } }
    return null;
  }

  /* ================================================================= hash
     The address bar is the only storage this tool has. `t` is a local
     wall-clock stamp, not a UTC one, because "midnight on 1 January" means
     midnight where the reader is. */
  var writingHash = false;
  function writeHash() {
    if (state.timer) {
      var tp = state.timer.rem != null
        ? 'dur=' + state.timer.dur + '&rem=' + state.timer.rem
        : 'dur=' + state.timer.dur + '&end=' + state.target.getTime();
      writingHash = true;
      try { history.replaceState(null, '', location.pathname + location.search + '#' + tp); }
      catch (e) { location.hash = tp; }
      writingHash = false;
      return;
    }
    if (!state.target) { return; }
    var d = state.target;
    var stamp = isoDate(d) + (state.allDay ? '' : 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()));
    var parts = ['t=' + stamp];
    if (state.key) { parts.push('e=' + encodeURIComponent(state.key)); }
    else if (typeof state.name === 'string' && state.name) {
      parts.push('n=' + encodeURIComponent(state.name));
    }
    writingHash = true;
    try {
      history.replaceState(null, '', location.pathname + location.search + '#' + parts.join('&'));
    } catch (e) { location.hash = parts.join('&'); }
    writingHash = false;
  }

  function readHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (!h) { return false; }
    var q = {};
    h.split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      if (i < 0) { return; }
      try { q[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1)); } catch (e) {}
    });

    if (q.dur && /^\d+$/.test(q.dur)) {
      var dur = Math.min(+q.dur, TMAX);
      if (dur > 0) {
        setFields(dur);
        if (q.end && /^\d+$/.test(q.end)) { startTimer(dur, +q.end); return true; }
        if (q.rem && /^\d+$/.test(q.rem)) {
          startTimer(dur, Date.now() + Math.min(+q.rem, dur));
          pauseTimer();
          return true;
        }
      }
    }
    if (q.e) {
      var ev = findEvent(q.e);
      if (ev) { pickEvent(ev); return true; }
    }
    if (!q.t) { return false; }
    var b = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(q.t);
    if (!b) { return false; }
    var allDay = b[4] == null;
    el.date.value = b[1] + '-' + b[2] + '-' + b[3];
    el.time.value = allDay ? '' : b[4] + ':' + b[5];
    el.label.value = q.n || '';
    fromForm();
    return true;
  }

  /* =============================================================== wiring */
  function fromForm() {
    var v = (el.date.value || '').split('-');
    if (v.length !== 3) { state.target = null; state.key = null; markSelected(); tick(); return; }
    var y = +v[0], mo = +v[1] - 1, da = +v[2];
    if (!(y >= 1 && y <= 9999)) { state.target = null; idle(t(T.bad)); return; }
    var hh = 0, mm = 0, allDay = true;
    var tv = (el.time.value || '').split(':');
    if (tv.length === 2 && tv[0] !== '') { hh = +tv[0]; mm = +tv[1]; allDay = false; }
    var label = (el.label.value || '').trim();
    setTarget(at(y, mo, da, hh, mm), {
      name: label || null, allDay: allDay, prev: null, key: null
    });
  }

  function pickEvent(ev) {
    el.date.value = isoDate(ev.when);
    el.time.value = '';
    el.label.value = '';
    setTarget(ev.when, { name: ev.name, allDay: true, prev: ev.prev, key: ev.key });
  }

  el.date.addEventListener('input', fromForm);
  el.time.addEventListener('input', fromForm);
  el.label.addEventListener('input', function () {
    /* Renaming should not throw away a chosen preset's date, only its name. */
    var label = (el.label.value || '').trim();
    state.name = label || (state.key ? (findEvent(state.key) || {}).name : null) || null;
    if (label) { state.key = null; markSelected(); }
    writeHash();
    tick();
  });

  el.allday.addEventListener('click', function () {
    el.time.value = '';
    fromForm();
  });

  el.groups.addEventListener('click', function (e) {
    var b = e.target.closest('[data-key]');
    if (!b) { return; }
    var ev = findEvent(b.getAttribute('data-key'));
    if (ev) { pickEvent(ev); }
  });

  el.again.addEventListener('click', function () { confetti(); chime(); });

  el.sound.addEventListener('click', function () {
    state.sound = !state.sound;
    el.sound.setAttribute('aria-pressed', String(state.sound));
    el.soundT.textContent = t(state.sound ? T.soundOn : T.soundOff);
    if (state.sound) { chime(); }        /* also unlocks audio for later */
  });

  el.copy.addEventListener('click', function () {
    var v = location.href;
    var done = function () {
      el.copy.classList.add('is-done');
      el.copyT.textContent = t(T.copied);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(done, function () {});
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = v;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  });

  /* ================================================================ timer
     Like the timer on a phone: dial in days, hours, minutes and seconds,
     then Start / Pause / Resume / Reset. The running timer is just an end
     moment, so it is read from the system clock like everything else here
     and stays exact in a background tab. Pausing freezes the remainder. */
  var TMAX = 365 * 86400000 + 23 * 3600000 + 59 * 60000 + 59000;
  var tf = {
    d: document.getElementById('cdTd'), h: document.getElementById('cdTh'),
    m: document.getElementById('cdTm'), s: document.getElementById('cdTs')
  };
  var TLIM = { d: 365, h: 23, m: 59, s: 59 };
  var tBox = document.getElementById('cdTimer');
  var tStart = document.getElementById('cdTStart');
  var tReset = document.getElementById('cdTReset');

  function clampField(k) {
    var v = parseInt(tf[k].value, 10);
    if (isNaN(v) || v < 0) { v = 0; }
    if (v > TLIM[k]) { v = TLIM[k]; }
    tf[k].value = String(v);
    return v;
  }
  function fieldsMs() {
    return ((clampField('d') * 24 + clampField('h')) * 60 + clampField('m')) * 60000 + clampField('s') * 1000;
  }
  function setFields(ms) {
    var sec = Math.round(ms / 1000);
    tf.d.value = Math.floor(sec / 86400);
    tf.h.value = Math.floor(sec % 86400 / 3600);
    tf.m.value = Math.floor(sec % 3600 / 60);
    tf.s.value = sec % 60;
  }
  function startTimer(dur, end) {
    el.date.value = ''; el.time.value = ''; el.label.value = '';
    state.timer = { dur: dur, rem: null };
    setTarget(new Date(end), { timer: true, allDay: false, key: null });
  }
  function pauseTimer() {
    if (!state.timer || state.timer.rem != null) { return; }
    state.timer.rem = Math.max(0, state.target.getTime() - Date.now());
    writeHash(); tick();
  }
  function resumeTimer() {
    if (!state.timer || state.timer.rem == null) { return; }
    state.target = new Date(Date.now() + state.timer.rem);
    state.timer.rem = null;
    writeHash(); tick();
  }
  function resetTimer() {
    if (state.timer) { setFields(state.timer.dur); }
    state.timer = null;
    state.target = null;
    state.done = false;
    el.stage.classList.remove('is-done');
    el.confetti.innerHTML = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    tick();
  }
  function paintTimerUI() {
    var tm = state.timer;
    var running = !!(tm && tm.rem == null && state.target && state.target.getTime() > Date.now());
    var paused = !!(tm && tm.rem != null);
    var label = running ? T.pause : paused ? T.resume : T.start;
    if (tStart.getAttribute('data-l') !== label.en) {
      tStart.setAttribute('data-l', label.en);
      tStart.textContent = t(label);
    }
    tBox.classList.toggle('is-running', running || paused);
    var lock = running || paused;
    Object.keys(tf).forEach(function (k) { tf[k].disabled = lock; });
    tBox.querySelectorAll('.cd-step').forEach(function (b) { b.disabled = lock; });
  }

  tStart.addEventListener('click', function () {
    chime.unlock();
    var tm = state.timer;
    if (tm && tm.rem != null) { resumeTimer(); return; }
    if (tm && state.target && state.target.getTime() > Date.now()) { pauseTimer(); return; }
    var dur = fieldsMs();
    if (dur <= 0) { tf.m.focus(); return; }
    startTimer(dur, Date.now() + dur);
  });
  tReset.addEventListener('click', resetTimer);
  tBox.addEventListener('click', function (e) {
    var b = e.target.closest('.cd-step');
    if (b && !b.disabled) {
      var k = b.getAttribute('data-f'), dir = +b.getAttribute('data-dir');
      var v = clampField(k) + dir;
      if (v < 0) { v = TLIM[k]; } else if (v > TLIM[k]) { v = 0; }   /* wraps like a phone dial */
      tf[k].value = String(v);
      return;
    }
    var p = e.target.closest('[data-sec]');
    if (p) { setFields(+p.getAttribute('data-sec') * 1000); }
  });
  Object.keys(tf).forEach(function (k) {
    tf[k].addEventListener('change', function () { clampField(k); });
    tf[k].addEventListener('focus', function () { tf[k].select(); });
  });

  window.addEventListener('hashchange', function () {
    if (!writingHash) { readHash(); }
  });

  /* A language switch changes the month names, the weekday, the numerals in
     the clock and every label in the event list, so everything is redrawn. */
  document.addEventListener('aa:langchange', function () {
    el.soundT.textContent = t(state.sound ? T.soundOn : T.soundOff);
    el.copyT.textContent = t(T.copy);
    el.again.textContent = t(T.again);
    tReset.textContent = t(T.reset);
    tStart.removeAttribute('data-l');
    lastListDay = null;
    drawList();
    markSelected();
    tick();
  });

  /* ----------------------------------------------------------------- run
     Recomputed from the system clock every tick and rescheduled to the next
     whole second, so a backgrounded tab is exact the moment it is looked at
     again rather than however many seconds behind the throttle left it. */
  function loop() {
    tick();
    window.setTimeout(loop, 1000 - (Date.now() % 1000) + 8);
  }

  el.date.setAttribute('min', '0001-01-01');
  el.date.setAttribute('max', '9999-12-31');
  el.soundT.textContent = t(T.soundOn);
  el.copyT.textContent = t(T.copy);
  el.again.textContent = t(T.again);
  tReset.textContent = t(T.reset);
  drawList();

  /* Landing with no target at all is a blank page, so the nearest Cambodian
     public holiday is offered rather than an empty stage. */
  if (!readHash()) {
    var first = EVENTS.kh[0] || EVENTS.world[0];
    if (first) { pickEvent(first); } else { tick(); }
  }
  loop();
})();
