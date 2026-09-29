/* Alpha Academy Cambodia — Cambodian holiday calendar
   ---------------------------------------------------------------------------
   A whole year at a glance with the public holidays marked, plus the list of
   them underneath. The holidays themselves live in assets/js/kh-holidays.js —
   read the header of that file before changing any date, because those are a
   legal fact set by sub-decree and not something to guess at.

   THREE THINGS SHAPE THIS PAGE.

   1. TWO VIEWS, AND THE YEAR IS THE DEFAULT. Someone opening a holiday
      calendar is usually planning: when to close, when to book, how many
      working days are left. Twelve small months answer that in one screen.
      The month view is the other half of the job — it is the wall calendar,
      big enough to print the holiday's name inside the day it falls on
      rather than making the reader match a highlight to a list.

   2. WHAT IS NOT KNOWN IS SHOWN AS NOT KNOWN. The lunar holidays move every
      year and are set by sub-decree. Until a year's sub-decree has been
      entered into the data file, those four holidays appear in their own
      list, by name, marked as not yet fixed — never as a guessed date. A
      wrong Pchum Ben in a printed calendar is worse than a blank one.

   3. IT PRINTS. Half the use of a wall calendar is being on a wall. The
      print stylesheet drops the site chrome and keeps the grid.            */
(function () {
  'use strict';

  var root = document.getElementById('calRoot');
  var DATA = window.KH_HOLIDAYS;
  if (!root || !DATA) { return; }

  /* ------------------------------------------------------------- language */
  function lang() { return (window.AAi18n && window.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(o) { return (lang() === 'km' && o && o.km) ? o.km : (o ? o.en : ''); }

  var KHDIGIT = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  function num(n) {
    var s = String(n);
    if (lang() !== 'km') { return s; }
    return s.replace(/[0-9]/g, function (d) { return KHDIGIT[+d]; });
  }

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
  /* One letter per column: twelve of these grids share a screen. */
  var DOW_MIN = {
    en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    km: ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស']
  };

  var T = {
    total:    { en: '{n} public holiday days', km: 'ថ្ងៃឈប់សម្រាកសរុប {n} ថ្ងៃ' },
    totalOne: { en: '1 public holiday day',    km: 'ថ្ងៃឈប់សម្រាក ១ ថ្ងៃ' },
    totalNone:{ en: 'No public holidays',      km: 'គ្មានថ្ងៃឈប់សម្រាក' },
    listH:    { en: 'Public holidays in {y}',  km: 'ថ្ងៃឈប់សម្រាកឆ្នាំ {y}' },
    listHM:   { en: 'Public holidays in {m} {y}', km: 'ថ្ងៃឈប់សម្រាក ខែ{m} ឆ្នាំ {y}' },
    noneMonth:{ en: 'No public holiday falls in this month.', km: 'គ្មានថ្ងៃឈប់សម្រាកនៅក្នុងខែនេះទេ។' },
    partOf:   { en: 'day {a} of {b}', km: 'ថ្ងៃទី {a} ក្នុង {b}' },
    pendingH: { en: 'Dates set each year by sub-decree', km: 'កាលបរិច្ឆេទកំណត់ដោយអនុក្រឹត្យរៀងរាល់ឆ្នាំ' },
    pendingP: { en: 'These four follow the Khmer lunar calendar, so the Gregorian date moves every year and is fixed by the annual sub-decree. They are listed here by name until that year has been entered.',
                km: 'ទាំងបួននេះដើរតាមប្រតិទិនចន្ទគតិខ្មែរ ដូច្នេះកាលបរិច្ឆេទតាមសុរិយគតិផ្លាស់ប្តូររៀងរាល់ឆ្នាំ ហើយត្រូវកំណត់ដោយអនុក្រឹត្យប្រចាំឆ្នាំ។ វាត្រូវបានរាយឈ្មោះនៅទីនេះ រហូតទាល់តែឆ្នាំនោះត្រូវបានបញ្ចូល។' },
    days:     { en: '{n} days', km: '{n} ថ្ងៃ' },
    to:       { en: 'to', km: 'ដល់' },
    src:      { en: 'Source: ', km: 'ប្រភព៖ ' },
    noSrc:    { en: 'The sub-decree for this year has not been entered, so only the fixed-date holidays are shown on the grid.',
                km: 'អនុក្រឹត្យសម្រាប់ឆ្នាំនេះមិនទាន់បានបញ្ចូលទេ ដូច្នេះមានតែថ្ងៃឈប់សម្រាកកាលបរិច្ឆេទថេរប៉ុណ្ណោះដែលបង្ហាញលើតារាង។' },
    today:    { en: 'Today', km: 'ថ្ងៃនេះ' },
    noList:   { en: 'No holiday list has been found for this year, so no public holidays are marked. The lunar dates, holy days and other days are still shown.',
                km: 'រកមិនឃើញបញ្ជីថ្ងៃឈប់សម្រាកសម្រាប់ឆ្នាំនេះទេ ដូច្នេះមិនបានសម្គាល់ថ្ងៃឈប់សម្រាកទេ។ ថ្ងៃចន្ទគតិ ថ្ងៃសីល និងថ្ងៃផ្សេងៗនៅតែបង្ហាញ។' },
    obsH:     { en: 'Other days in {y}', km: 'ថ្ងៃផ្សេងៗឆ្នាំ {y}' },
    obsHM:    { en: 'Other days in {m} {y}', km: 'ថ្ងៃផ្សេងៗ ខែ{m} ឆ្នាំ {y}' },
    obsNone:  { en: 'Nothing else falls in this month.', km: 'គ្មានថ្ងៃផ្សេងទៀតក្នុងខែនេះទេ។' },
    kanBen:   { en: 'Kan Ben — Ben 1 to Ben {n}, the days leading up to Pchum Ben',
                km: 'កាន់បិណ្ឌ — បិណ្ឌ ១ ដល់បិណ្ឌ {n} មុនថ្ងៃភ្ជុំបិណ្ឌ' },
    nth:      { en: '{n} anniversary', km: 'ខួបលើកទី{n}' },
    sila:     { en: 'Buddhist holy day', km: 'ថ្ងៃសីល' },
    kor:      { en: 'Shaving day', km: 'ថ្ងៃកោរ' }
  };
  var OBS = window.KH_OBSERVANCES || null;
  function obsFor(y) {
    if (!OBS) { return { days: {}, list: [] }; }
    var raw = OBS.forYear(y), pubKeys = {};
    DATA.forYear(y).list.forEach(function (h) { pubKeys[h.key] = true; });
    function keep(e) { return !(e.pub && pubKeys[e.pub]); }
    var days = {};
    for (var k in raw.days) {
      if (!Object.prototype.hasOwnProperty.call(raw.days, k)) { continue; }
      var d = raw.days[k];
      days[k] = { sila: d.sila, kor: d.kor, ev: d.ev.filter(keep) };
    }
    return { days: days, list: raw.list.filter(keep) };
  }
  function ordEn(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /* ---------------------------------------------------------------- state */
  var TODAY = new Date();
  var TODAY_KEY = stamp(TODAY.getFullYear(), TODAY.getMonth() + 1, TODAY.getDate());
  var MIN_YEAR = 1975, MAX_YEAR = 2035;
  var year = TODAY.getFullYear();
  if (year < MIN_YEAR) { year = MIN_YEAR; }
  if (year > MAX_YEAR) { year = MAX_YEAR; }
  var month = TODAY.getMonth() + 1;      /* 1-12, only used by the month view */
  var mode = 'year';

  var el = {
    prev:  document.getElementById('calPrev'),
    next:  document.getElementById('calNext'),
    pick:  document.getElementById('calYear'),
    mpick: document.getElementById('calMonthPick'),
    modes: document.getElementById('calModes'),
    now:   document.getElementById('calNow'),
    count: document.getElementById('calCount'),
    src:   document.getElementById('calSource'),
    grid:  document.getElementById('calGrid'),
    big:   document.getElementById('calMonth'),
    listH: document.getElementById('calListH'),
    list:  document.getElementById('calList'),
    pend:  document.getElementById('calPending'),
    obsH:  document.getElementById('calObsH'),
    obs:   document.getElementById('calObs'),
    pendL: document.getElementById('calPendingList'),
    print: document.getElementById('calPrint')
  };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fill(tpl, map) {
    return tpl.replace(/\{(\w+)\}/g, function (_, k) { return map[k] == null ? '' : map[k]; });
  }
  function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }   /* m is 1-12 */

  /* ---------------------------------------------------------------- years */
  (function buildPicker() {
    var out = '';
    for (var y = MIN_YEAR; y <= MAX_YEAR; y++) {
      out += '<option value="' + y + '">' + y + '</option>';
    }
    el.pick.innerHTML = out;
  })();

  /* -------------------------------------------------------------- drawing */
  function render() {
    var info = DATA.forYear(year);
    var ob = obsFor(year);
    el.pick.value = String(year);
    paintMonthPicker();

    /* Only one of the two views is ever in the document's flow. */
    el.grid.hidden = mode !== 'year';
    el.big.hidden  = mode !== 'month';
    el.mpick.hidden = mode !== 'month';
    el.modes.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode));
    });

    var shown;                       /* the holidays the current view covers */
    if (mode === 'year') {
      var html = '';
      for (var m = 1; m <= 12; m++) { html += miniMonth(m, info.days, ob.days); }
      el.grid.innerHTML = html;
      shown = info.list;
      el.count.textContent = countLabel(info.days, null);
      el.listH.textContent = fill(t(T.listH), { y: num(year) });
      paintObs(ob.list, null);
    } else {
      el.mpick.value = String(month);
      el.big.innerHTML = bigMonth(month, info.days);
      paintObs(ob.list, month);
      shown = info.list.filter(function (h) { return touchesMonth(h, year, month); });
      el.count.textContent = countLabel(info.days, month);
      el.listH.textContent = fill(t(T.listHM), { m: MONTHS[lang()][month - 1], y: num(year) });
    }

    /* where the dates came from */
    if (info.noList) {
      el.src.textContent = t(T.noList);
      el.src.className = 'cal-src is-warn';
    } else if (info.source) {
      el.src.textContent = t(T.src) + t(info.source);
      el.src.className = info.provisional ? 'cal-src is-warn' : 'cal-src';
    } else {
      el.src.textContent = t(T.noSrc);
      el.src.className = 'cal-src is-warn';
    }

    /* the list */
    el.list.innerHTML = shown.length
      ? shown.map(function (h) { return row(h); }).join('')
      : '<li class="cal-none">' + esc(t(T.noneMonth)) + '</li>';

    /* what is not yet known */
    if (info.pending.length) {
      el.pend.hidden = false;
      el.pendL.innerHTML = info.pending.map(function (p) {
        return '<li><span class="nm">' + esc(t(p)) + '</span>' +
               '<span class="rule">' + esc(t(p.rule)) + '</span>' +
               '<span class="len">' + fill(t(T.days), { n: num(p.len) }) + '</span></li>';
      }).join('');
    } else {
      el.pend.hidden = true;
      el.pendL.innerHTML = '';
    }
  }

  /* The days that are not days off: international and national days, the
     lunar festivals and Kan Ben. On the year view the fifteen Ben days fold
     into one line; on the month view each one is listed, as the site does. */
  function paintObs(all, onlyMonth) {
    if (!el.obs) { return; }
    var rows = [], ben = [];
    all.forEach(function (o) {
      if (onlyMonth && +o.start.split('-')[1] !== onlyMonth) { return; }
      if (o.kind === 'ben' && !onlyMonth) { ben.push(o); return; }
      rows.push(o);
    });
    if (ben.length) {
      rows.push({ start: ben[0].start, kind: 'ben', len: ben.length,
                  en: fill(T.kanBen.en, { n: ben.length }),
                  km: fill(T.kanBen.km, { n: num(ben.length) }) });
      rows.sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
    }
    el.obsH.textContent = onlyMonth
      ? fill(t(T.obsHM), { m: MONTHS[lang()][onlyMonth - 1], y: num(year) })
      : fill(t(T.obsH), { y: num(year) });
    el.obs.innerHTML = rows.length
      ? rows.map(function (o) {
          return row({ start: o.start, len: o.len || 1, en: o.en, km: o.km, kind: o.kind });
        }).join('')
      : '<li class="cal-none">' + esc(t(T.obsNone)) + '</li>';
  }

  /* How many holiday days, for the whole year or for one month. */
  function countLabel(days, onlyMonth) {
    var n = 0;
    for (var k in days) {
      if (!Object.prototype.hasOwnProperty.call(days, k)) { continue; }
      if (onlyMonth && +k.split('-')[1] !== onlyMonth) { continue; }
      n++;
    }
    return n === 0 ? t(T.totalNone)
         : n === 1 ? t(T.totalOne)
         : fill(t(T.total), { n: num(n) });
  }

  /* A three-day holiday can start in one month and finish in the next, so
     "is it in this month" is a range test, not a comparison of two numbers. */
  function touchesMonth(h, y, m) {
    var b = h.start.split('-');
    var start = new Date(+b[0], +b[1] - 1, +b[2]);
    for (var i = 0; i < h.len; i++) {
      if (start.getFullYear() === y && start.getMonth() + 1 === m) { return true; }
      start.setDate(start.getDate() + 1);
    }
    return false;
  }

  function miniMonth(m, days, odays) {
    odays = odays || {};
    var first = new Date(year, m - 1, 1).getDay();      /* 0 = Sunday */
    var len = daysInMonth(year, m);

    var out = '<section class="cal-month" aria-label="' + esc(MONTHS[lang()][m - 1] + ' ' + year) + '">' +
              '<h3>' + esc(MONTHS[lang()][m - 1]) + '</h3><div class="cal-mgrid">';

    out += DOW_MIN[lang()].map(function (d, i) {
      return '<span class="cal-dow' + (i === 0 || i === 6 ? ' is-we' : '') + '">' + esc(d) + '</span>';
    }).join('');

    for (var i = 0; i < first; i++) { out += '<span class="cal-pad"></span>'; }

    for (var d = 1; d <= len; d++) {
      var key = stamp(year, m, d);
      var hol = days[key];
      var dow = new Date(year, m - 1, d).getDay();
      var cls = ['cal-d'];
      if (dow === 0 || dow === 6) { cls.push('is-we'); }
      if (hol) { cls.push('is-hol'); }
      var od = odays[key], names = [];
      if (hol) { names.push(t(hol)); }
      if (od && od.ev.length) {
        if (!hol) { cls.push('is-obs'); }
        od.ev.forEach(function (e) { names.push(t(e)); });
      }
      if (key === TODAY_KEY) { cls.push('is-today'); }
      out += '<span class="' + cls.join(' ') + '" id="c-' + key + '"' +
             (names.length ? ' title="' + esc(names.join(' · ')) + '"' : '') + '>' + num(d) + '</span>';
    }
    return out + '</div></section>';
  }

  /* The wall calendar. Big enough that the holiday's name goes inside the day
     it falls on, which is the whole reason to have a month view at all — a
     highlight you have to look up in a list underneath is the year view. */
  /* The Khmer lunar date, when assets/js/kh-lunar.js is on the page. It is
     always in Khmer script and Khmer numerals whichever language the rest of
     the page is in, because it is a Khmer reckoning — ៦កើត is the thing
     itself, not a translation of something. */
  var LUN = window.KhLunar || null;

  function lunarOf(y, m, d) {
    if (!LUN) { return null; }
    try { return LUN.of(y, m, d); } catch (e) { return null; }
  }

  /* "ខែផល្គុន – ចេត្រ · ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨" for the month heading. */
  function lunarHeading(m) {
    if (!LUN) { return ''; }
    var a = lunarOf(year, m, 1);
    var b = lunarOf(year, m, daysInMonth(year, m));
    if (!a || !b) { return ''; }
    var months = a.month === b.month ? 'ខែ' + a.month : 'ខែ' + a.month + ' – ' + b.month;
    return months + ' · ' + LUN.yearLabel(b);
  }

  function bigMonth(m, days) {
    var first = new Date(year, m - 1, 1).getDay();
    var len = daysInMonth(year, m);
    var prevLen = daysInMonth(m === 1 ? year - 1 : year, m === 1 ? 12 : m - 1);

    var sub = lunarHeading(m);
    var obsCache = {};
    function odayOf(cy, key) {
      if (!obsCache[cy]) { obsCache[cy] = obsFor(cy).days; }
      return obsCache[cy][key] || null;
    }
    var out = '<div class="cal-bighead">' +
                '<h3>' + esc(MONTHS[lang()][m - 1]) + ' ' + num(year) + '</h3>' +
                (sub ? '<p class="cal-bigsub">' + esc(sub) + '</p>' : '') +
              '</div><div class="cal-biggrid">';

    out += DOW[lang()].map(function (d, i) {
      return '<span class="cal-bdow' + (i === 0 || i === 6 ? ' is-we' : '') + '">' +
             '<b>' + esc(DOW_MIN[lang()][i]) + '</b><i>' + esc(d) + '</i></span>';
    }).join('');

    /* Six rows, so the grid keeps its height as you page through the year. */
    for (var cell = 0; cell < 42; cell++) {
      var d, cy = year, cm = m, out_of = false;
      if (cell < first) { d = prevLen - first + 1 + cell; out_of = true; cm = m - 1; }
      else if (cell >= first + len) { d = cell - first - len + 1; out_of = true; cm = m + 1; }
      else { d = cell - first + 1; }
      if (cm < 1)  { cm = 12; cy = year - 1; }
      if (cm > 12) { cm = 1;  cy = year + 1; }

      var key = stamp(cy, cm, d);
      var hol = days[key];
      var dow = new Date(cy, cm - 1, d).getDay();

      var cls = ['cal-b'];
      if (out_of) { cls.push('is-out'); }
      if (dow === 0 || dow === 6) { cls.push('is-we'); }
      if (hol && !out_of) { cls.push('is-hol'); }
      if (key === TODAY_KEY) { cls.push('is-today'); }

      var lun = lunarOf(cy, cm, d);
      /* The first day of a lunar month names it, the way a printed Khmer
         calendar does — otherwise the column is a wall of ៦កើត ៧កើត ៨កើត
         with nothing saying which month they belong to. */
      var lunText = lun
        ? (lun.day === 1 ? LUN.dayMonth(lun) : LUN.shortLabel(lun))
        : '';

      var od = odayOf(cy, key);
      if (od && od.sila) { cls.push('is-sila'); }
      var chips = (od && od.ev.length && !out_of)
        ? od.ev.map(function (e) {
            return '<span class="ob k-' + e.kind + '">' + esc(t(e)) + '</span>';
          }).join('')
        : '';

      out += '<div class="' + cls.join(' ') + '" id="c-' + key + '">' +
               '<span class="n">' + num(d) +
                 (od && od.sila ? '<i class="sila" title="' + esc(t(T.sila)) + '" aria-label="' + esc(t(T.sila)) + '">☸</i>' : '') +
               '</span>' +
               (lunText ? '<span class="lun">' + esc(lunText) +
                 (od && od.kor ? '<b class="kor">ថ្ងៃកោរ</b>' : '') + '</span>' : '') +
               (hol && !out_of
                 ? '<span class="ev">' + esc(t(hol)) +
                   (hol.of > 1 ? '<em>' + fill(t(T.partOf), { a: num(hol.part), b: num(hol.of) }) + '</em>' : '') +
                   '</span>'
                 : '') +
               chips +
             '</div>';
    }
    return out + '</div>';
  }

  function paintMonthPicker() {
    var want = MONTHS[lang()].join('|');
    if (el.mpick.getAttribute('data-built') === want) { return; }
    el.mpick.innerHTML = MONTHS[lang()].map(function (name, i) {
      return '<option value="' + (i + 1) + '">' + esc(name) + '</option>';
    }).join('');
    el.mpick.setAttribute('data-built', want);
  }

  function row(h) {
    var bits = h.start.split('-');
    var y = +bits[0], m = +bits[1], d = +bits[2];
    var endDate = new Date(y, m - 1, d + h.len - 1);
    var dow = DOW[lang()][new Date(y, m - 1, d).getDay()];

    var when = num(d) + ' ' + MONTHS[lang()][m - 1];
    if (h.len > 1) {
      when += ' – ' + num(endDate.getDate()) + ' ' + MONTHS[lang()][endDate.getMonth()];
    }

    var nth = h.nth > 0 ? (lang() === 'km' ? fill(T.nth.km, { n: num(h.nth) }) : fill(T.nth.en, { n: ordEn(h.nth) })) : '';
    return '<li class="cal-row' + (h.movable ? ' is-movable' : '') + (h.kind ? ' is-' + h.kind : '') + '" data-jump="' + esc(h.start) + '">' +
             '<span class="when"><b>' + esc(when) + '</b><small>' + esc(dow) +
               (h.len > 1 ? ' · ' + fill(t(T.days), { n: num(h.len) }) : '') + '</small></span>' +
             '<span class="what">' + esc(t(h)) + (nth ? ' <span class="nth">' + esc(nth) + '</span>' : '') +
               (h.note ? '<small>' + esc(t(h.note)) + '</small>' : '') + '</span>' +
           '</li>';
  }

  /* ----------------------------------------------------------------- wire */
  function go(y, m) {
    if (y < MIN_YEAR || y > MAX_YEAR) { return; }
    year = y;
    if (m) { month = m; }
    render();
  }

  /* One pair of arrows for both views: a year at a time on the year view, a
     month at a time on the month view, rolling over the year end. */
  function step(dir) {
    if (mode === 'year') { return go(year + dir); }
    var m = month + dir, y = year;
    if (m < 1)  { m = 12; y--; }
    if (m > 12) { m = 1;  y++; }
    go(y, m);
  }

  el.prev.addEventListener('click', function () { step(-1); });
  el.next.addEventListener('click', function () { step(1); });
  el.pick.addEventListener('change', function () { go(parseInt(el.pick.value, 10)); });
  el.mpick.addEventListener('change', function () { go(year, parseInt(el.mpick.value, 10)); });
  el.now.addEventListener('click', function () {
    go(TODAY.getFullYear(), TODAY.getMonth() + 1);
  });
  el.print.addEventListener('click', function () { window.print(); });

  el.modes.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) { return; }
    mode = b.getAttribute('data-mode');
    render();
  });

  /* Clicking a holiday in the list finds it on the grid. On a phone the list
     is a long way from the month it belongs to, which makes this the only
     practical way to connect the two. */
  el.list.addEventListener('click', jumpFrom);
  function jumpFrom(e) {
    var li = e.target.closest('[data-jump]');
    if (!li) { return; }
    var iso = li.getAttribute('data-jump');
    /* On the month view a holiday from another month has no cell to point at,
       so go to its month first and then find it. */
    if (mode === 'month') {
      var b = iso.split('-');
      if (+b[0] !== year || +b[1] !== month) { go(+b[0], +b[1]); }
    }
    var cell = document.getElementById('c-' + iso);
    if (!cell) { return; }
    root.querySelectorAll('.is-flash').forEach(function (n) { n.classList.remove('is-flash'); });
    cell.classList.add('is-flash');
    cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { cell.classList.remove('is-flash'); }, 2600);
  }

  if (el.obs) { el.obs.addEventListener('click', jumpFrom); }

  document.addEventListener('aa:langchange', render);

  render();
})();
