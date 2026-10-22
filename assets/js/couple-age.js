/* Alpha Academy Cambodia — Couple age gap (on the Age & Khmer Zodiac page)
   ---------------------------------------------------------------------------
   Two dates of birth — bride and groom, girlfriend and boyfriend, wife and
   husband — and the exact gap between them in years, months and days, who
   is older, and both Khmer animal years. Reuses the age and zodiac maths
   that age-calculator.js exposes as window.AAAge, so the two cards on the
   page always agree. Nothing is sent, stored or put in the address bar.  */
(function () {
  'use strict';
  var A = window.AATool, G = window.AAAge;
  var root = document.getElementById('cpRoot');
  if (!root || !A || !G) { return; }
  function $(id) { return document.getElementById(id); }

  var ANIMAL = [['Rat', '🐀'], ['Ox', '🐂'], ['Tiger', '🐅'], ['Rabbit', '🐇'], ['Dragon', '🐉'], ['Snake', '🐍'],
    ['Horse', '🐎'], ['Goat', '🐐'], ['Monkey', '🐒'], ['Rooster', '🐓'], ['Dog', '🐕'], ['Pig', '🐖']];
  var KH = (window.KhLunar && window.KhLunar.animals) ||
    ['ជូត', 'ឆ្លូវ', 'ខាល', 'ថោះ', 'រោង', 'ម្សាញ់', 'មមី', 'មមែ', 'វក', 'រកា', 'ច', 'កុរ'];

  var MODES = [
    [{ en: 'Bride', km: 'កូនក្រមុំ' }, { en: 'Groom', km: 'កូនកំលោះ' }],
    [{ en: 'Girlfriend', km: 'សង្សារស្រី' }, { en: 'Boyfriend', km: 'សង្សារប្រុស' }],
    [{ en: 'Wife', km: 'ប្រពន្ធ' }, { en: 'Husband', km: 'ប្ដី' }],
    [{ en: 'Person 1', km: 'អ្នកទី ១' }, { en: 'Person 2', km: 'អ្នកទី ២' }]
  ];
  var MODE_L = [
    { en: 'Bride & Groom', km: 'កូនក្រមុំ និង កូនកំលោះ' },
    { en: 'Girlfriend & Boyfriend', km: 'សង្សារ' },
    { en: 'Wife & Husband', km: 'ប្ដី ប្រពន្ធ' },
    { en: 'Any two people', km: 'មនុស្សពីរនាក់' }
  ];
  var T = {
    h2: { en: 'Couple age gap 💞', km: 'គម្លាតអាយុគូស្វាមីភរិយា 💞' },
    lede: { en: 'Enter two birthdays to see exactly how far apart the couple are in age, and both Khmer animal years.',
            km: 'បញ្ចូលថ្ងៃកំណើតពីរ ដើម្បីមើលគម្លាតអាយុពិតប្រាកដ និងឆ្នាំសត្វខ្មែររបស់អ្នកទាំងពីរ។' },
    name: { en: 'Name (optional)', km: 'ឈ្មោះ (មិនចាំបាច់)' },
    dob: { en: 'Date of birth', km: 'ថ្ងៃខែឆ្នាំកំណើត' },
    gapL: { en: 'Age gap', km: 'គម្លាតអាយុ' },
    need: { en: 'Enter a date of birth for both people.', km: 'សូមបញ្ចូលថ្ងៃកំណើតរបស់អ្នកទាំងពីរ។' },
    future: { en: 'A date of birth is after today. Check the year.', km: 'ថ្ងៃកំណើតមួយនៅក្រោយថ្ងៃនេះ។ សូមពិនិត្យឆ្នាំ។' },
    same: { en: 'Same birthday', km: 'កើតថ្ងៃតែមួយ' },
    sameP: { en: '{a} and {b} were born on the very same day.', km: '{a} និង {b} កើតថ្ងៃតែមួយ។' },
    older: { en: '{o} is older than {y}.', km: '{o} ចាស់ជាង {y}។' },
    y: { en: ['year', 'years'], km: 'ឆ្នាំ' }, m: { en: ['month', 'months'], km: 'ខែ' }, d: { en: ['day', 'days'], km: 'ថ្ងៃ' },
    dApart: { en: 'days apart', km: 'ថ្ងៃ គម្លាត' },
    wApart: { en: 'weeks', km: 'សប្ដាហ៍' },
    yDec: { en: 'years (decimal)', km: 'ឆ្នាំ (ទសភាគ)' },
    now: { en: 'Age today', km: 'អាយុថ្ងៃនេះ' },
    animal: { en: 'Year of the {en} · ឆ្នាំ{km}', km: 'ឆ្នាំ{km} · {en}' },
    sameYear: { en: 'Both born in the same Khmer animal year.', km: 'អ្នកទាំងពីរកើតឆ្នាំសត្វដូចគ្នា។' }
  };
  function tr(o, v) { return A.t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }); }

  var mode = 0;
  var el = {
    modes: $('cpModes'), roleA: $('cpRoleA'), roleB: $('cpRoleB'), nA: $('cpNameA'), nB: $('cpNameB'),
    bA: $('cpDobA'), bB: $('cpDobB'), res: $('cpResult'), big: $('cpBig'), alt: $('cpAlt'), facts: $('cpFacts'),
    zod: $('cpZod'), copy: $('cpCopy')
  };

  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) { return null; }
    var o = { y: +m[1], m: +m[2], d: +m[3] }, t = new Date(Date.UTC(o.y, o.m - 1, o.d));
    return t.getUTCMonth() === o.m - 1 ? o : null;
  }
  function dn(o) { return Math.round(Date.UTC(o.y, o.m - 1, o.d) / 86400000); }
  function todayO() { var t = new Date(); return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }; }
  function unit(n, k) { return A.lang() === 'km' ? A.kh(n) + ' ' + T[k].km : n + ' ' + T[k].en[n === 1 ? 0 : 1]; }
  function gapText(g) {
    var p = [];
    if (g.y) { p.push(unit(g.y, 'y')); }
    if (g.m) { p.push(unit(g.m, 'm')); }
    if (g.d || !p.length) { p.push(unit(g.d, 'd')); }
    return p.join(A.lang() === 'km' ? ' ' : ', ');
  }

  function labels() {
    var r = MODES[mode];
    el.roleA.textContent = A.t(r[0]); el.roleB.textContent = A.t(r[1]);
    el.nA.placeholder = A.t(r[0]); el.nB.placeholder = A.t(r[1]);
    $('cpH2').textContent = A.t(T.h2); $('cpLede').textContent = A.t(T.lede);
    ['cpNameAL', 'cpNameBL'].forEach(function (id) { $(id).textContent = A.t(T.name); });
    ['cpDobAL', 'cpDobBL'].forEach(function (id) { $(id).textContent = A.t(T.dob); });
    $('cpGapL').textContent = A.t(T.gapL);
    el.modes.innerHTML = MODE_L.map(function (l, i) {
      return '<button type="button" data-m="' + i + '" aria-pressed="' + (i === mode) + '">' + A.esc(A.t(l)) + '</button>';
    }).join('');
    el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
  }

  function nameSpan(v, fallback, cls) {
    return '<span class="' + cls + '">' + A.esc(v.trim() || A.t(fallback)) + '</span>';
  }

  function paint() {
    labels();
    var a = parseISO(el.bA.value), b = parseISO(el.bB.value), t = todayO();
    var r = MODES[mode], na = nameSpan(el.nA.value, r[0], 'cp-na'), nb = nameSpan(el.nB.value, r[1], 'cp-nb');
    function bad(msg) { el.res.classList.add('dc-bad'); el.big.textContent = msg; el.alt.innerHTML = ''; el.facts.innerHTML = ''; el.zod.innerHTML = ''; }
    if (!a || !b) { return bad(A.t(T.need)); }
    if (dn(a) > dn(t) || dn(b) > dn(t)) { return bad(A.t(T.future)); }
    el.res.classList.remove('dc-bad');

    var aFirst = dn(a) <= dn(b), o = aFirst ? a : b, yg = aFirst ? b : a;
    var days = dn(yg) - dn(o);
    if (!days) {
      el.big.textContent = A.t(T.same);
      el.alt.innerHTML = tr(T.sameP, { a: na, b: nb });
    } else {
      el.big.textContent = gapText(G.age(o, yg));
      el.alt.innerHTML = tr(T.older, { o: aFirst ? na : nb, y: aFirst ? nb : na });
    }
    var ageA = G.age(a, t).y, ageB = G.age(b, t).y;
    el.facts.innerHTML = [
      ['<b>' + A.fmt(days) + '</b> ' + A.esc(A.t(T.dApart)), true],
      ['<b>' + A.fmt(Math.floor(days / 7)) + '</b> ' + A.esc(A.t(T.wApart))],
      ['<b>' + (A.lang() === 'km' ? A.kh((days / 365.2425).toFixed(1)) : (days / 365.2425).toFixed(1)) + '</b> ' + A.esc(A.t(T.yDec))],
      [A.esc(A.t(T.now)) + ': <b>' + A.kh(ageA) + '</b> · <b>' + A.kh(ageB) + '</b>']
    ].map(function (f) { return '<li' + (f[1] ? ' class="is-key"' : '') + '>' + f[0] + '</li>'; }).join('');

    var za = G.zodiac(a).ai, zb = G.zodiac(b).ai;
    function card(z, nm, cls) {
      return '<div class="cp-z ' + cls + '"><span class="ag-emoji" aria-hidden="true">' + ANIMAL[z][1] + '</span><div><b>' + nm + '</b><small>' +
        A.esc(tr(T.animal, { en: ANIMAL[z][0], km: KH[z] })) + '</small></div></div>';
    }
    el.zod.innerHTML = card(za, na, 'is-a') + card(zb, nb, 'is-b') +
      (za === zb && days < 4000 ? '<p class="cp-same">' + A.esc(A.t(T.sameYear)) + '</p>' : '');
  }

  el.modes.addEventListener('click', function (e) {
    var btn = e.target.closest('button'); if (!btn) { return; }
    mode = +btn.getAttribute('data-m'); paint();
  });
  [el.nA, el.nB, el.bA, el.bB].forEach(function (x) { x.addEventListener('input', paint); });
  el.copy.addEventListener('click', function () { A.copy(el.copy, A.t(T.gapL) + ': ' + el.big.textContent + ' — ' + el.alt.textContent); });
  document.addEventListener('aa:langchange', paint);
  paint();
})();
