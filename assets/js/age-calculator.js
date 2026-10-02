/* Alpha Academy Cambodia — Age & Khmer Zodiac
   ---------------------------------------------------------------------------
   Exact age from a date of birth, the next birthday, and the Khmer animal
   year (ឆ្នាំ), sak (ស័ក) and lunar birth date. Uses tools-core.js and
   kh-lunar.js; no network, nothing stored.

   FOUR THINGS DECIDE HOW THIS IS BUILT.

   1. AGE IS COUNTED THE WAY PEOPLE COUNT IT: whole years, then whole months,
      then the days left over. Dates are three integers and differences go
      through Date.UTC, exactly as on the date calculator, so the answer does
      not move with the reader's time zone or a daylight-saving change.

   2. THE KHMER YEAR TURNS AT KHMER NEW YEAR, NOT ON 1 JANUARY. Someone born
      in February 1990 is ឆ្នាំម្សាញ់ (Snake), not Horse, because the Horse
      year began in April. That is the single most common mistake when people
      look their animal up in a Chinese-zodiac table, so the page says which
      way it went. The cycle is the one kh-lunar.js counts, anchored on 2024 =
      ឆ្នាំរោង ឆស័ក.

   3. KHMER NEW YEAR FALLS ON 13 OR 14 APRIL. kh-lunar.js turns the year on
      the 14th. A birthday on 13–16 April is therefore flagged: the animal
      changes at the exact moment of Moha Sangkran, and a family's own
      reckoning wins over a web page.

   4. THE LUNAR DATE STARTS IN 1970. The Suriyeatr arithmetic in
      kh-lunar.js is counted forward from 1970, so the lunar birth date
      (៦កើត ខែចេត្រ) is shown from then on. The animal year and sak are a
      plain twelve- and ten-year cycle and are shown for any year.

   State lives in the address bar: #b=2010-05-17&on=2026-10-02             */
(function () {
  'use strict';

  var A = window.AATool;
  var root = document.getElementById('agRoot');
  if (!root) { return; }

  var ANIMAL_EN = [
    ['Rat', '🐀'], ['Ox', '🐂'], ['Tiger', '🐅'], ['Rabbit', '🐇'], ['Dragon', '🐉'], ['Snake', '🐍'],
    ['Horse', '🐎'], ['Goat', '🐐'], ['Monkey', '🐒'], ['Rooster', '🐓'], ['Dog', '🐕'], ['Pig', '🐖']
  ];
  var SAK_EN = ['10th (Samrithisak)', '1st (Ekasak)', '2nd (Tosak)', '3rd (Treisak)', '4th (Chattvasak)',
                '5th (Panchasak)', '6th (Chhasak)', '7th (Sappasak)', '8th (Atthasak)', '9th (Nappasak)'];
  var KH_ANIMALS = (window.KhLunar && window.KhLunar.animals) ||
    ['ជូត', 'ឆ្លូវ', 'ខាល', 'ថោះ', 'រោង', 'ម្សាញ់', 'មមី', 'មមែ', 'វក', 'រកា', 'ច', 'កុរ'];
  var KH_SAKS = (window.KhLunar && window.KhLunar.saks) ||
    ['សំរឹទ្ធិស័ក', 'ឯកស័ក', 'ទោស័ក', 'ត្រីស័ក', 'ចត្វាស័ក', 'បញ្ចស័ក', 'ឆស័ក', 'សប្តស័ក', 'អដ្ឋស័ក', 'នព្វស័ក'];

  var DOW = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    km: ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']
  };
  var MON = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    km: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
  };

  var T = {
    empty: { en: 'Enter a date of birth.', km: 'សូមបញ្ចូលថ្ងៃខែឆ្នាំកំណើត។' },
    future:{ en: 'That date of birth is after the date you are counting to.', km: 'ថ្ងៃកំណើតនោះ នៅក្រោយថ្ងៃដែលអ្នកកំពុងគណនា។' },
    y: { en: ['year', 'years'], km: 'ឆ្នាំ' },
    m: { en: ['month', 'months'], km: 'ខែ' },
    d: { en: ['day', 'days'], km: 'ថ្ងៃ' },
    old: { en: '{a} old', km: 'អាយុ {a}' },
    born: { en: 'Born on a {d}', km: 'កើតថ្ងៃ{d}' },
    tDays: { en: 'days alive', km: 'ថ្ងៃដែលបានរស់នៅ' },
    tWeeks: { en: 'weeks', km: 'សប្ដាហ៍' },
    tMonths: { en: 'months', km: 'ខែ' },
    tHours: { en: 'hours', km: 'ម៉ោង' },
    bdayToday: { en: 'Happy birthday! 🎂 Turning {n} today.', km: 'រីករាយថ្ងៃកំណើត! 🎂 គ្រប់ {n} ឆ្នាំថ្ងៃនេះ។' },
    nextB: { en: 'Next birthday: {date}, a {dow} — in {n} days, turning {age}.',
             km: 'ថ្ងៃកំណើតបន្ទាប់៖ {date} ថ្ងៃ{dow} — នៅ {n} ថ្ងៃទៀត គ្រប់ {age} ឆ្នាំ។' },
    nextB1: { en: 'Next birthday: tomorrow, {date} — turning {age}.', km: 'ថ្ងៃកំណើតបន្ទាប់៖ ថ្ងៃស្អែក {date} — គ្រប់ {age} ឆ្នាំ។' },
    feb29: { en: 'Born on 29 February: in a year without one, the birthday is counted here on 28 February.',
             km: 'កើតថ្ងៃទី ២៩ កុម្ភៈ៖ ក្នុងឆ្នាំដែលគ្មានថ្ងៃនោះ ថ្ងៃកំណើតត្រូវបានរាប់នៅទីនេះត្រឹមថ្ងៃទី ២៨ កុម្ភៈ។' },
    animal: { en: 'Year of the {en}', km: 'ឆ្នាំ{km}' },
    sak: { en: '{en} sak', km: '{km}' },
    early: { en: 'Born before Khmer New Year, so this is still the {prev} year that began in April {py} — not the {next} year a Chinese-zodiac table gives for {y}.',
             km: 'កើតមុនបុណ្យចូលឆ្នាំខ្មែរ ដូច្នេះនៅតែជាឆ្នាំ{prev} ដែលចាប់ផ្ដើមខែមេសា {py} — មិនមែនឆ្នាំ{next} ដូចតារាងឆ្នាំចិនសម្រាប់ឆ្នាំ {y} ទេ។' },
    nye: { en: 'Born during the Khmer New Year days. The animal year turns at the exact moment of Moha Sangkran, which is on 13 or 14 April depending on the year — if the family counts it differently, theirs is the one to trust.',
           km: 'កើតក្នុងថ្ងៃបុណ្យចូលឆ្នាំខ្មែរ។ ឆ្នាំសត្វប្ដូរនៅម៉ោងទេវតាចុះ (មហាសង្ក្រាន្ត) ដែលធ្លាក់ថ្ងៃទី ១៣ ឬ ១៤ មេសា អាស្រ័យលើឆ្នាំ — បើក្រុមគ្រួសាររាប់ខុសពីនេះ សូមជឿតាមក្រុមគ្រួសារ។' },
    lunar: { en: 'Lunar birth date', km: 'ថ្ងៃកំណើតតាមចន្ទគតិ' },
    noLunar: { en: 'The lunar date is calculated from 1970 onwards.', km: 'ថ្ងៃចន្ទគតិ ត្រូវបានគណនាចាប់ពីឆ្នាំ ១៩៧០ ឡើងទៅ។' },
    be: { en: 'Buddhist Era year', km: 'ឆ្នាំពុទ្ធសករាជ' }
  };

  function $(id) { return document.getElementById(id); }
  var el = {
    b: $('agB'), on: $('agOn'), today: $('agToday'), big: $('agBig'), alt: $('agAlt'), facts: $('agFacts'),
    next: $('agNext'), note: $('agNote'), noteText: $('agNoteText'), result: $('agResult'),
    zAnimal: $('agAnimal'), zEmoji: $('agEmoji'), zSak: $('agSak'), zLunar: $('agLunar'), zNote: $('agZNote'),
    zCard: $('agZodiac'), cycle: $('agCycle'), copy: $('agCopy'), quick: $('agQuick')
  };

  /* ============================================================== dates */
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) { return null; }
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = new Date(Date.UTC(y, mo - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) { return null; }
    return { y: y, m: mo, d: d };
  }
  function iso(o) { return o.y + '-' + (o.m < 10 ? '0' : '') + o.m + '-' + (o.d < 10 ? '0' : '') + o.d; }
  function dn(o) { return Math.round(Date.UTC(o.y, o.m - 1, o.d) / 86400000); }
  function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function dow(o) { return new Date(Date.UTC(o.y, o.m - 1, o.d)).getUTCDay(); }
  function todayO() { var t = new Date(); return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }; }
  function dateTxt(o) {
    return A.lang() === 'km'
      ? A.kh(o.d) + ' ' + MON.km[o.m - 1] + ' ' + A.kh(o.y)
      : o.d + ' ' + MON.en[o.m - 1] + ' ' + o.y;
  }
  /* the birthday in year y — 29 Feb becomes 28 Feb in a common year */
  function bdayIn(b, y) { return { y: y, m: b.m, d: Math.min(b.d, dim(y, b.m)) }; }

  function age(b, on) {
    var y = on.y - b.y;
    if (dn(bdayIn(b, on.y)) > dn(on)) { y--; }
    var anchor = bdayIn(b, b.y + y), m = 0;
    for (;;) {
      var nm = anchor.m + m + 1, ny = anchor.y + Math.floor((nm - 1) / 12);
      nm = (nm - 1) % 12 + 1;
      var cand = { y: ny, m: nm, d: Math.min(b.d, dim(ny, nm)) };
      if (dn(cand) > dn(on)) { break; }
      m++;
    }
    var mm = anchor.m + m, my = anchor.y + Math.floor((mm - 1) / 12);
    mm = (mm - 1) % 12 + 1;
    var from = { y: my, m: mm, d: Math.min(b.d, dim(my, mm)) };
    return { y: y, m: m, d: dn(on) - dn(from) };
  }

  function unit(n, k) {
    if (A.lang() === 'km') { return A.kh(n) + ' ' + T[k].km; }
    return n + ' ' + T[k].en[n === 1 ? 0 : 1];
  }
  function mod(n, m) { return ((n % m) + m) % m; }

  /* ============================================================ zodiac */
  function zodiac(b) {
    var turned = dn(b) >= dn({ y: b.y, m: 4, d: 14 });
    var cy = turned ? b.y : b.y - 1;
    var ai = mod(cy - 1984, 12), si = mod(cy - 2018, 10);
    return { ai: ai, si: si, turned: turned, cy: cy, be: b.y + 543 + (turned ? 1 : 0) };
  }

  /* ============================================================ drawing */
  function paint() {
    var b = parseISO(el.b.value), on = parseISO(el.on.value) || todayO();
    el.note.classList.remove('is-on');
    if (!b) {
      el.result.classList.add('dc-bad');
      el.big.textContent = A.t(T.empty);
      el.alt.textContent = ''; el.facts.innerHTML = ''; el.next.textContent = '';
      el.zCard.hidden = true;
      A.writeHash({});
      return;
    }
    A.writeHash({ b: iso(b), on: el.on.value && iso(on) !== iso(todayO()) ? iso(on) : '' });
    drawZodiac(b);
    if (dn(b) > dn(on)) {
      el.result.classList.add('dc-bad');
      el.big.textContent = A.t(T.future);
      el.alt.textContent = ''; el.facts.innerHTML = ''; el.next.textContent = '';
      return;
    }
    el.result.classList.remove('dc-bad');
    var a = age(b, on);
    var parts = [unit(a.y, 'y'), unit(a.m, 'm'), unit(a.d, 'd')];
    el.big.textContent = A.t(T.old).replace('{a}', A.lang() === 'km' ? parts.join(' ') : parts.join(', '));
    el.alt.textContent = A.t(T.born).replace('{d}', A.t({ en: DOW.en[dow(b)], km: DOW.km[dow(b)] })) + ' · ' + dateTxt(b);

    var days = dn(on) - dn(b);
    var months = a.y * 12 + a.m;
    el.facts.innerHTML = [
      ['<b>' + A.fmt(days) + '</b> ' + A.esc(A.t(T.tDays)), true],
      ['<b>' + A.fmt(Math.floor(days / 7)) + '</b> ' + A.esc(A.t(T.tWeeks)) + (days % 7 ? ' + ' + unit(days % 7, 'd') : '')],
      ['<b>' + A.fmt(months) + '</b> ' + A.esc(A.t(T.tMonths))],
      ['≈ <b>' + A.fmt(days * 24) + '</b> ' + A.esc(A.t(T.tHours))]
    ].map(function (f) { return '<li' + (f[1] ? ' class="is-key"' : '') + '>' + f[0] + '</li>'; }).join('');

    /* next birthday */
    var nb = bdayIn(b, on.y);
    if (dn(nb) < dn(on)) { nb = bdayIn(b, on.y + 1); }
    var gap = dn(nb) - dn(on), turning = nb.y - b.y;
    if (gap === 0) { el.next.textContent = A.t(T.bdayToday).replace('{n}', A.kh(turning)); }
    else if (gap === 1) { el.next.textContent = A.t(T.nextB1).replace('{date}', dateTxt(nb)).replace('{age}', A.kh(turning)); }
    else {
      el.next.textContent = A.t(T.nextB).replace('{date}', dateTxt(nb))
        .replace('{dow}', A.t({ en: DOW.en[dow(nb)], km: DOW.km[dow(nb)] }))
        .replace('{n}', A.fmt(gap)).replace('{age}', A.kh(turning));
    }
    if (b.m === 2 && b.d === 29) { el.noteText.textContent = A.t(T.feb29); el.note.classList.add('is-on'); }
  }

  function drawZodiac(b) {
    var z = zodiac(b);
    el.zCard.hidden = false;
    el.zEmoji.textContent = ANIMAL_EN[z.ai][1];
    el.zAnimal.textContent = A.t({ en: T.animal.en.replace('{en}', ANIMAL_EN[z.ai][0]) + ' · ឆ្នាំ' + KH_ANIMALS[z.ai],
                                   km: T.animal.km.replace('{km}', KH_ANIMALS[z.ai]) + ' · ' + ANIMAL_EN[z.ai][0] });
    el.zSak.textContent = A.t({ en: KH_SAKS[z.si] + ' · ' + SAK_EN[z.si] + ' of the ten-year cycle', km: KH_SAKS[z.si] }) +
      ' · ' + A.t(T.be) + ' ' + A.kh(z.be);

    if (b.y >= 1970 && window.KhLunar) {
      var r = window.KhLunar.of(b.y, b.m, b.d);
      el.zLunar.textContent = A.t(T.lunar) + ': ' + window.KhLunar.dayMonth(r) + ' ' + window.KhLunar.yearLabel(r);
    } else {
      el.zLunar.textContent = A.t(T.noLunar);
    }

    var notes = [];
    if (b.m === 4 && b.d >= 13 && b.d <= 16) { notes.push(A.t(T.nye)); }
    else if (!z.turned) {
      var nextAi = mod(b.y - 1984, 12);
      notes.push(A.t({
        en: T.early.en.replace('{prev}', ANIMAL_EN[z.ai][0]).replace('{py}', b.y - 1).replace('{next}', ANIMAL_EN[nextAi][0]).replace('{y}', b.y),
        km: T.early.km.replace('{prev}', KH_ANIMALS[z.ai]).replace('{py}', A.kh(b.y - 1)).replace('{next}', KH_ANIMALS[nextAi]).replace('{y}', A.kh(b.y))
      }));
    }
    el.zNote.textContent = notes.join(' ');
    el.zNote.hidden = !notes.length;

    /* the twelve, with this one lit */
    el.cycle.innerHTML = ANIMAL_EN.map(function (a, i) {
      return '<li' + (i === z.ai ? ' class="is-on" aria-current="true"' : '') + '><span class="e" aria-hidden="true">' + a[1] +
        '</span><span class="k">' + KH_ANIMALS[i] + '</span><span class="n">' + A.esc(A.lang() === 'km' ? '' : a[0]) + '</span></li>';
    }).join('');
  }

  /* ============================================================= events */
  el.b.addEventListener('input', paint);
  el.on.addEventListener('input', paint);
  el.today.addEventListener('click', function () { el.on.value = iso(todayO()); paint(); });
  el.copy.addEventListener('click', function () {
    A.copy(el.copy, el.big.textContent + ' — ' + el.zAnimal.textContent);
  });
  document.addEventListener('aa:langchange', function () {
    el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
    paint();
  });

  var q = A.readHash();
  if (parseISO(q.b)) { el.b.value = q.b; }
  el.on.value = parseISO(q.on) ? q.on : iso(todayO());
  el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
  paint();

  window.AAAge = { age: age, zodiac: zodiac };
})();
