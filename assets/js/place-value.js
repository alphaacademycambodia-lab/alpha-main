/* Alpha Academy Cambodia — Place Value & Number Line
   ---------------------------------------------------------------------------
   PLACE VALUE — a whole number from 0 to 9,999 drawn as base-ten blocks
   (thousand cubes, hundred flats, ten rods, ones). Each column has its own
   + and − so a child can feel 9 ones + 1 become a ten. Under the blocks:
   the place-value chart, the expanded form, the number in English and Khmer
   words (from number-words.js) and the number rounded to 10, 100 and 1000.

   NUMBER LINE — a + b or a − b drawn as jumps: the hundreds in one jump,
   then the tens, then the ones, the way it is taught for mental addition.
   Works with negative numbers too, so it carries on into Stage 7 integers.

   Uses tools-core.js and number-words.js. Nothing is sent or stored; the
   address bar keeps the numbers: #tab=line&n=3456&a=47&o=+&b=36          */
(function () {
  'use strict';
  var A = window.AATool, W = window.AANumWords;
  var root = document.getElementById('pvRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh;
  var NS = 'http://www.w3.org/2000/svg';

  var T = {
    cols: [{ en: 'Thousands', km: 'ពាន់' }, { en: 'Hundreds', km: 'រយ' }, { en: 'Tens', km: 'ដប់' }, { en: 'Ones', km: 'រាយ' }],
    colsOne: [{ en: 'thousand', km: 'ពាន់' }, { en: 'hundred', km: 'រយ' }, { en: 'ten', km: 'ដប់' }, { en: 'one', km: 'រាយ' }],
    digit: { en: 'Digit', km: 'ខ្ទង់' },
    value: { en: 'Value', km: 'តម្លៃ' },
    exp: { en: 'Expanded form', km: 'ទម្រង់ពន្លាត' },
    wordsEn: { en: 'In English words', km: 'ជាពាក្យអង់គ្លេស' },
    wordsKm: { en: 'In Khmer words', km: 'ជាពាក្យខ្មែរ' },
    round: { en: 'Rounded', km: 'ប្រហាក់ប្រហែល' },
    toN: { en: 'to the nearest {n}', km: 'ទៅខ្ទង់ {n} ជិតបំផុត' },
    carry: { en: '10 {a} make 1 {b} — the {b} column goes up by one.', km: '{a} ១០ ស្មើ {b} ១ — ខ្ទង់{b}កើនមួយ។' },
    borrow: { en: '1 {b} is broken into 10 {a}.', km: '{b} ១ ត្រូវបំបែកជា {a} ១០។' },
    range: { en: 'Choose a whole number from 0 to 9,999.', km: 'សូមជ្រើសរើសចំនួនគត់ពី ០ ដល់ ៩.៩៩៩។' },
    plus: { en: 'Add', km: 'បូក' }, minus: { en: 'Take away', km: 'ដក' },
    jumpH: { en: 'Jump in parts', km: 'លោតជាផ្នែកៗ' },
    start: { en: 'Start at {a}.', km: 'ចាប់ផ្ដើមពី {a}។' },
    jump: { en: '{op} {d}: {x} {op2} {d} = {y}', km: '{op} {d}៖ {x} {op2} {d} = {y}' },
    jumpW: { en: 'Jump', km: 'លោត' },
    land: { en: 'Land on {y}, so {a} {op} {b} = {y}.', km: 'ចុះនៅ {y} ដូច្នេះ {a} {op} {b} = {y}។' },
    zero: { en: 'Adding or taking away 0 stays at {a}.', km: 'បូក ឬដក ០ នៅដដែលគឺ {a}។' },
    big: { en: 'Use numbers between −10,000 and 10,000.', km: 'សូមប្រើចំនួនចន្លោះ −១០.០០០ និង ១០.០០០។' },
    neg: { en: 'Crossing 0 into the negative numbers: below zero the numbers count the other way.', km: 'ឆ្លងកាត់ ០ ចូលចំនួនអវិជ្ជមាន៖ ក្រោមសូន្យ ចំនួនរាប់បញ្ច្រាសទិស។' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }); }
  function n2(n) { return A.fmt(n); }

  var H = A.readHash();
  var S = {
    tab: H.tab === 'line' ? 'line' : 'pv',
    n: clampN(A.parse(H.n || '3456')),
    a: num(H.a, 47), o: H.o === '-' ? '-' : '+', b: num(H.b, 36)
  };
  function num(s, d) { var v = A.parse(s || ''); return (v == null || isNaN(v)) ? d : Math.round(v); }
  function clampN(v) { return (v == null || isNaN(v)) ? 3456 : Math.max(0, Math.min(9999, Math.round(v))); }
  function save() { A.writeHash({ tab: S.tab === 'line' ? 'line' : '', n: S.n, a: S.a, o: S.o === '-' ? '-' : '', b: S.b }); }

  var tabs = $('pvTabs');
  function paintTabs() {
    tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === S.tab)); });
    $('pvPaneB').hidden = S.tab !== 'pv';
    $('pvPaneL').hidden = S.tab !== 'line';
    if (S.tab === 'line') { paintLine(); }
  }
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.tab = b.getAttribute('data-t'); paintTabs(); save();
  });

  /* ======================================================== the blocks */
  function el(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) { e.setAttribute(k, attrs[k]); } return e; }
  function cube(g, x, y, s) {           /* a thousand: a little isometric cube */
    var d = s * 0.35;
    g.appendChild(el('path', { d: 'M' + x + ' ' + (y + d) + 'h' + s + 'v' + s + 'h-' + s + 'z', class: 'pv-k pv-k1' }));
    g.appendChild(el('path', { d: 'M' + x + ' ' + (y + d) + 'l' + d + ' -' + d + 'h' + s + 'l-' + d + ' ' + d + 'z', class: 'pv-k pv-k2' }));
    g.appendChild(el('path', { d: 'M' + (x + s) + ' ' + (y + d) + 'l' + d + ' -' + d + 'v' + s + 'l-' + d + ' ' + d + 'z', class: 'pv-k pv-k3' }));
    var st = s / 10, p = '';
    for (var i = 1; i < 10; i++) { p += 'M' + (x + i * st) + ' ' + (y + d) + 'v' + s + 'M' + x + ' ' + (y + d + i * st) + 'h' + s; }
    g.appendChild(el('path', { d: p, class: 'pv-line' }));
  }
  function flat(g, x, y, s) {           /* a hundred: 10 × 10 */
    g.appendChild(el('rect', { x: x, y: y, width: s, height: s, class: 'pv-k pv-h' }));
    var st = s / 10, p = '';
    for (var i = 1; i < 10; i++) { p += 'M' + (x + i * st) + ' ' + y + 'v' + s + 'M' + x + ' ' + (y + i * st) + 'h' + s; }
    g.appendChild(el('path', { d: p, class: 'pv-line' }));
  }
  function rod(g, x, y, w, h) {         /* a ten: 1 × 10 */
    g.appendChild(el('rect', { x: x, y: y, width: w, height: h, class: 'pv-k pv-t' }));
    var st = h / 10, p = '';
    for (var i = 1; i < 10; i++) { p += 'M' + x + ' ' + (y + i * st) + 'h' + w; }
    g.appendChild(el('path', { d: p, class: 'pv-line' }));
  }
  function drawCol(i, d) {
    var svg = $('pvB' + i); svg.innerHTML = '';
    var g = el('g', {}), W0 = 120, H0 = 150;
    if (i === 0) { for (var k = 0; k < d; k++) { cube(g, 6 + (k % 3) * 37, 4 + Math.floor(k / 3) * 46, 26); } }
    if (i === 1) { for (k = 0; k < d; k++) { flat(g, 4 + (k % 3) * 39, 6 + Math.floor(k / 3) * 46, 34); } }
    if (i === 2) { for (k = 0; k < d; k++) { rod(g, 4 + k * 12.6, 6, 10, 130); } }
    if (i === 3) { for (k = 0; k < d; k++) { g.appendChild(el('rect', { x: 18 + (k % 3) * 30, y: 24 + Math.floor(k / 3) * 34, width: 22, height: 22, rx: 3, class: 'pv-k pv-o' })); } }
    svg.setAttribute('viewBox', '0 0 ' + W0 + ' ' + H0);
    svg.appendChild(g);
    svg.setAttribute('aria-label', kh(d) + ' ' + t(T.cols[i]).toLowerCase());
  }
  function digits(n) { return [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]; }

  var msg = '';
  function paintPV() {
    var n = S.n, d = digits(n), P = [1000, 100, 10, 1];
    if (document.activeElement !== $('pvN')) { $('pvN').value = A.fmt(n, { plain: true }); }
    for (var i = 0; i < 4; i++) {
      $('pvH' + i).textContent = t(T.cols[i]);
      $('pvD' + i).textContent = kh(d[i]);
      drawCol(i, d[i]);
      $('pvM' + i).disabled = n - P[i] < 0;
      $('pvP' + i).disabled = n + P[i] > 9999;
    }
    $('pvMsg').textContent = msg;
    /* chart */
    var rows = '<thead><tr><th></th>' + T.cols.map(function (c) { return '<th>' + t(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      '<tr><th>' + t(T.digit) + '</th>' + d.map(function (x) { return '<td>' + kh(x) + '</td>'; }).join('') + '</tr>' +
      '<tr><th>' + t(T.value) + '</th>' + d.map(function (x, j) { return '<td>' + n2(x * P[j]) + '</td>'; }).join('') + '</tr></tbody>';
    $('pvChart').innerHTML = rows;
    var parts = d.map(function (x, j) { return x * P[j]; }).filter(function (x) { return x; });
    $('pvExpL').textContent = t(T.exp);
    $('pvExp').textContent = n2(n) + ' = ' + (parts.length ? parts.map(n2).join(' + ') : n2(0));
    $('pvEnL').textContent = t(T.wordsEn);
    $('pvKmL').textContent = t(T.wordsKm);
    $('pvEn').textContent = W ? W.enInt(n) : '';
    $('pvKm').textContent = W ? W.kmInt(n, false) : '';
    $('pvRndL').textContent = t(T.round);
    $('pvRnd').innerHTML = [10, 100, 1000].map(function (p) {
      return '<li><span>' + A.esc(f(T.toN, { n: n2(p) })) + '</span><b>' + n2(Math.round(n / p) * p) + '</b></li>';
    }).join('');
    $('pvBig').textContent = n2(n);
  }
  function step(i, s) {
    var P = [1000, 100, 10, 1], before = digits(S.n), v = S.n + s * P[i];
    if (v < 0 || v > 9999) { return; }
    S.n = v; msg = '';
    var after = digits(v);
    if (s > 0 && i > 0 && after[i - 1] !== before[i - 1] && before[i] === 9) { msg = f(T.carry, { a: t(T.cols[i]).toLowerCase(), b: t(T.colsOne[i - 1]) }); }
    if (s < 0 && i > 0 && before[i] === 0) { msg = f(T.borrow, { a: t(T.cols[i]).toLowerCase(), b: t(T.colsOne[i - 1]) }); }
    paintPV(); save();
  }
  root.querySelectorAll('.pv-step').forEach(function (b) {
    b.addEventListener('click', function () { step(+b.getAttribute('data-i'), +b.getAttribute('data-s')); });
  });
  $('pvN').addEventListener('input', function () {
    var v = A.parse($('pvN').value); msg = '';
    if (v == null) { return; }
    if (isNaN(v) || v < 0 || v > 9999 || v !== Math.floor(v)) { $('pvMsg').textContent = t(T.range); return; }
    S.n = v; paintPV(); save();
  });
  $('pvN').addEventListener('blur', paintPV);
  $('pvEx').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.n = +b.getAttribute('data-n'); msg = ''; $('pvN').value = S.n; paintPV(); save();
  });
  $('pvRand').addEventListener('click', function () { S.n = Math.floor(Math.random() * 10000); msg = ''; $('pvN').value = S.n; paintPV(); save(); });

  /* ====================================================== number line */
  function niceStep(span) {
    var raw = span / 10, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  function paintLine() {
    var a = S.a, b = S.b, o = S.o, sgn = o === '-' ? -1 : 1;
    if (document.activeElement !== $('pvA')) { $('pvA').value = A.fmt(a, { plain: true, group: false }); }
    if (document.activeElement !== $('pvBb')) { $('pvBb').value = A.fmt(b, { plain: true, group: false }); }
    $('pvOps').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-o') === o)); });
    var svg = $('pvLine'), steps = $('pvSteps');
    if (Math.abs(a) > 10000 || Math.abs(b) > 10000) { svg.innerHTML = ''; steps.innerHTML = '<li>' + A.esc(t(T.big)) + '</li>'; $('pvRes').textContent = '—'; return; }
    /* split b into hundreds+, tens, ones — each one jump */
    var mag = Math.abs(b), dir = sgn * (b < 0 ? -1 : 1), parts = [];
    var big = Math.floor(mag / 100) * 100, tens = Math.floor((mag % 100) / 10) * 10, ones = mag % 10;
    [big, tens, ones].forEach(function (p) { if (p) { parts.push(p * dir); } });
    var res = a + sgn * b;
    $('pvRes').textContent = n2(a) + ' ' + (o === '-' ? '−' : '+') + ' ' + n2(b) + ' = ' + n2(res);
    /* the working */
    var h = '<li>' + A.esc(f(T.start, { a: n2(a) })) + '</li>', x = a, crossed = false;
    if (!parts.length) { h += '<li>' + A.esc(f(T.zero, { a: n2(a) })) + '</li>'; }
    parts.forEach(function (p) {
      var y = x + p;
      if ((x >= 0 && y < 0) || (x <= 0 && y > 0 && x !== 0)) { crossed = true; }
      h += '<li>' + A.esc(t(T.jumpW) + ' ' + (p > 0 ? '+' : '−') + n2(Math.abs(p)) + ': ' + n2(x) + ' ' + (p > 0 ? '+' : '−') + ' ' + n2(Math.abs(p)) + ' = ' + n2(y)) + '</li>';
      x = y;
    });
    if (parts.length) { h += '<li>' + A.esc(f(T.land, { y: n2(res), a: n2(a), op: o === '-' ? '−' : '+', b: n2(b) })) + '</li>'; }
    if (crossed) { h += '<li>' + A.esc(t(T.neg)) + '</li>'; }
    steps.innerHTML = h;
    $('pvJumpH').textContent = t(T.jumpH);
    /* the picture */
    var lo = Math.min(a, res), hi = Math.max(a, res), span = Math.max(hi - lo, 10);
    var st = niceStep(span * 1.15);
    var from = Math.floor((lo - span * 0.08) / st) * st, to = Math.ceil((hi + span * 0.08) / st) * st;
    if (to - from < st * 4) { to = from + st * 4; }
    var Wd = 760, Hd = 190, L = 30, R = Wd - 30, Y = 140;
    var X = function (v) { return L + (v - from) / (to - from) * (R - L); };
    var s = '<line x1="' + (L - 14) + '" y1="' + Y + '" x2="' + (R + 14) + '" y2="' + Y + '" class="pv-axis"/>' +
      '<path d="M' + (R + 14) + ' ' + Y + 'l-8 -5v10z" class="pv-arrowhead"/><path d="M' + (L - 14) + ' ' + Y + 'l8 -5v10z" class="pv-arrowhead"/>';
    var nT = Math.round((to - from) / st);
    for (var i = 0; i <= nT; i++) {
      var v = from + i * st;
      s += '<line x1="' + X(v) + '" y1="' + (Y - 7) + '" x2="' + X(v) + '" y2="' + (Y + 7) + '" class="pv-tick' + (v === 0 ? ' pv-zero' : '') + '"/>' +
        '<text x="' + X(v) + '" y="' + (Y + 26) + '" class="pv-tl">' + n2(v) + '</text>';
    }
    x = a;
    var maxH = 0;
    parts.forEach(function (p) {
      var x1 = X(x), x2 = X(x + p), w = Math.abs(x2 - x1), hgt = Math.min(85, 22 + w * 0.35);
      maxH = Math.max(maxH, hgt);
      s += '<path d="M' + x1 + ' ' + (Y - 4) + 'Q' + ((x1 + x2) / 2) + ' ' + (Y - 4 - hgt * 2) + ' ' + x2 + ' ' + (Y - 4) + '" class="pv-jump"/>' +
        '<path d="M' + x2 + ' ' + (Y - 4) + 'l' + (p > 0 ? '-9 -6' : '9 -6') + '" class="pv-jump"/>' +
        '<text x="' + ((x1 + x2) / 2) + '" y="' + (Y - 10 - hgt) + '" class="pv-jl">' + (p > 0 ? '+' : '−') + n2(Math.abs(p)) + '</text>';
      x += p;
    });
    s += '<circle cx="' + X(a) + '" cy="' + Y + '" r="7" class="pv-start"/><circle cx="' + X(res) + '" cy="' + Y + '" r="7" class="pv-end"/>' +
      '<text x="' + X(res) + '" y="' + (Y + 48) + '" class="pv-tl pv-endl">' + n2(res) + '</text>' +
      '<text x="' + X(a) + '" y="' + (Y + 48) + '" class="pv-tl pv-startl">' + (a === res ? '' : n2(a)) + '</text>';
    svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + (Hd + 10));
    svg.innerHTML = s;
  }
  function readLine() {
    var a = A.parse($('pvA').value), b = A.parse($('pvBb').value);
    if (a != null && !isNaN(a)) { S.a = Math.round(a); }
    if (b != null && !isNaN(b)) { S.b = Math.round(b); }
    paintLine(); save();
  }
  $('pvA').addEventListener('input', readLine);
  $('pvBb').addEventListener('input', readLine);
  $('pvA').addEventListener('blur', paintLine);
  $('pvBb').addEventListener('blur', paintLine);
  $('pvOps').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.o = b.getAttribute('data-o'); paintLine(); save();
  });
  $('pvLEx').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    var p = b.getAttribute('data-x').split('|');
    S.a = +p[0]; S.o = p[1]; S.b = +p[2]; $('pvA').value = S.a; $('pvBb').value = S.b; paintLine(); save();
  });

  document.addEventListener('aa:langchange', function () { paintPV(); if (S.tab === 'line') { paintLine(); } });
  paintTabs(); paintPV(); paintLine();
})();
