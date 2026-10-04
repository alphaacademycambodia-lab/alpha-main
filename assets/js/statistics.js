/* Alpha Academy Cambodia — Statistics Explorer
   ---------------------------------------------------------------------------
   Type or paste a list of numbers. Out come the averages with their working
   (mean, median, mode), the range, the quartiles and interquartile range, a
   frequency table with tallies (grouped into equal classes when there are
   many different values), a stem-and-leaf diagram, a frequency chart and a
   box plot. Quartiles use the "median of each half" method taught in
   school, leaving the middle value out when n is odd.
   Uses tools-core.js. Nothing is sent or stored; the address bar keeps the
   data: #d=12,15,15,18                                                    */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('sxRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh, F = function (n, d) { return A.fmt(d == null ? n : Math.round(n * Math.pow(10, d)) / Math.pow(10, d)); };

  var T = {
    n: { en: 'How many', km: 'ចំនួនទិន្នន័យ' }, mean: { en: 'Mean', km: 'មធ្យមភាគ' }, median: { en: 'Median', km: 'មេដ្យាន' },
    mode: { en: 'Mode', km: 'ម៉ូដ' }, range: { en: 'Range', km: 'វិសាលភាព' }, iqr: { en: 'Interquartile range', km: 'វិសាលភាពចន្លោះក្វាទីល' },
    sorted: { en: 'In order: {l}', km: 'តាមលំដាប់៖ {l}' },
    meanW: { en: 'Mean = sum ÷ how many = {s} ÷ {n} = {m}', km: 'មធ្យមភាគ = ផលបូក ÷ ចំនួន = {s} ÷ {n} = {m}' },
    medOdd: { en: 'Median = the middle value, in position ({n} + 1) ÷ 2 = {p}: {m}', km: 'មេដ្យាន = តម្លៃកណ្ដាល ទីតាំង ({n} + ១) ÷ ២ = {p}៖ {m}' },
    medEven: { en: 'Median = halfway between positions {a} and {b}: ({x} + {y}) ÷ 2 = {m}', km: 'មេដ្យាន = ពាក់កណ្ដាលរវាងទីតាំង {a} និង {b}៖ ({x} + {y}) ÷ ២ = {m}' },
    modeW: { en: 'Mode = the most common value{s}: {m} (appears {c} times)', km: 'ម៉ូដ = តម្លៃដែលកើតឡើងញឹកញាប់បំផុត៖ {m} (កើតឡើង {c} ដង)' },
    noMode: { en: 'Mode: every value appears once, so there is no mode.', km: 'ម៉ូដ៖ តម្លៃនីមួយៗកើតឡើងតែម្ដង ដូច្នេះគ្មានម៉ូដទេ។' },
    rangeW: { en: 'Range = largest − smallest = {a} − {b} = {r}', km: 'វិសាលភាព = ធំបំផុត − តូចបំផុត = {a} − {b} = {r}' },
    qW: { en: 'Lower quartile Q1 = {a}, upper quartile Q3 = {b}, IQR = Q3 − Q1 = {r}', km: 'ក្វាទីលទាប Q1 = {a} ក្វាទីលខ្ពស់ Q3 = {b} IQR = Q3 − Q1 = {r}' },
    value: { en: 'Value', km: 'តម្លៃ' }, cls: { en: 'Class', km: 'ថ្នាក់' }, tally: { en: 'Tally', km: 'ឆ្នូត' }, freq: { en: 'Frequency', km: 'ប្រេកង់' },
    total: { en: 'Total', km: 'សរុប' },
    key: { en: 'Key: {s} | {l} means {v}', km: 'គន្លឹះ៖ {s} | {l} មានន័យថា {v}' },
    noStem: { en: 'A stem-and-leaf diagram needs whole numbers (or one decimal place) that are not too spread out.', km: 'ដ្យាក្រាមដើម-ស្លឹក ត្រូវការចំនួនគត់ (ឬទសភាគមួយខ្ទង់) ដែលមិនខ្ចាត់ខ្ចាយពេក។' },
    need: { en: 'Type at least two numbers, separated by commas or spaces.', km: 'សូមវាយយ៉ាងហោចណាស់ចំនួនពីរ ដោយបំបែកដោយក្បៀស ឬដកឃ្លា។' },
    skipped: { en: 'Ignored (not numbers): {l}', km: 'មិនបានយក (មិនមែនជាចំនួន)៖ {l}' },
    bp: { en: 'Box plot', km: 'ប្រអប់ដ្យាក្រាម' }, chart: { en: 'Frequency chart', km: 'ក្រាបប្រេកង់' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }

  function med(a) { var n = a.length, m = Math.floor(n / 2); return n % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  function niceStep(span, want) { var raw = span / want, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
  function tally(c) { var s = ''; for (var i = 0; i < Math.floor(c / 5); i++) { s += '<span class="sx-five">||||</span> '; } return s + '|'.repeat(c % 5); }

  var ta = $('sxIn');
  var H = A.readHash();
  if (H.d) { ta.value = H.d.split(',').join(', '); }

  function paint() {
    var raw = A.unKh(ta.value).split(/[\s,;]+/).filter(Boolean), data = [], bad = [];
    raw.forEach(function (r) { var v = A.parse(r); if (v == null || isNaN(v)) { bad.push(r); } else { data.push(v); } });
    A.writeHash({ d: data.map(function (x) { return A.fmt(x, { plain: true, group: false }); }).join(',') });
    $('sxBad').textContent = bad.length ? f(T.skipped, { l: bad.slice(0, 8).join(' ') }) : '';
    var out = $('sxOut');
    if (data.length < 2) { out.hidden = true; $('sxMsg').textContent = t(T.need); return; }
    out.hidden = false; $('sxMsg').textContent = '';
    var s = data.slice().sort(function (a, b) { return a - b; }), n = s.length;
    var sum = s.reduce(function (a, b) { return a + b; }, 0), mean = sum / n, median = med(s);
    var cnt = {}; s.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    var maxC = Math.max.apply(null, Object.keys(cnt).map(function (k) { return cnt[k]; }));
    var modes = maxC > 1 ? Object.keys(cnt).filter(function (k) { return cnt[k] === maxC; }).map(Number).sort(function (a, b) { return a - b; }) : [];
    var lower = s.slice(0, Math.floor(n / 2)), upper = s.slice(Math.ceil(n / 2)), q1 = med(lower), q3 = med(upper);
    var rng = s[n - 1] - s[0];
    /* the cards */
    $('sxCards').innerHTML = [[T.n, kh(n)], [T.mean, F(mean, 3)], [T.median, F(median)], [T.mode, modes.length ? modes.map(function (x) { return F(x); }).join(', ') : '—'], [T.range, F(rng)], [T.iqr, F(q3 - q1)]]
      .map(function (c) { return '<div class="sx-stat"><span>' + A.esc(t(c[0])) + '</span><b>' + c[1] + '</b></div>'; }).join('');
    /* the working */
    var L = [f(T.sorted, { l: s.map(function (x) { return F(x); }).join(', ') }), f(T.meanW, { s: F(sum), n: kh(n), m: F(mean, 4) })];
    if (n % 2) { L.push(f(T.medOdd, { n: kh(n), p: kh((n + 1) / 2), m: F(median) })); }
    else { L.push(f(T.medEven, { a: kh(n / 2), b: kh(n / 2 + 1), x: F(s[n / 2 - 1]), y: F(s[n / 2]), m: F(median) })); }
    L.push(modes.length ? f(T.modeW, { s: modes.length > 1 ? 's' : '', m: modes.map(function (x) { return F(x); }).join(', '), c: kh(maxC) }) : t(T.noMode));
    L.push(f(T.rangeW, { a: F(s[n - 1]), b: F(s[0]), r: F(rng) }));
    L.push(f(T.qW, { a: F(q1), b: F(q3), r: F(q3 - q1) }));
    $('sxWork').innerHTML = L.map(function (x) { return '<li>' + A.esc(x) + '</li>'; }).join('');
    /* frequency table */
    var keys = Object.keys(cnt).map(Number).sort(function (a, b) { return a - b; }), rows = [], grouped = keys.length > 12;
    if (!grouped) { keys.forEach(function (k) { rows.push({ l: F(k), c: cnt[k] }); }); }
    else {
      var w = niceStep(rng || 1, 6), start = Math.floor(s[0] / w) * w;
      for (var lo = start; lo <= s[n - 1]; lo += w) {
        var hi = lo + w, c = s.filter(function (x) { return x >= lo - 1e-9 && x < hi - 1e-9; }).length;
        rows.push({ l: F(lo, 6) + ' ≤ x < ' + F(hi, 6), c: c });
      }
    }
    $('sxFt').innerHTML = '<thead><tr><th>' + A.esc(t(grouped ? T.cls : T.value)) + '</th><th>' + A.esc(t(T.tally)) + '</th><th>' + A.esc(t(T.freq)) + '</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r.l + '</td><td class="sx-tally">' + tally(r.c) + '</td><td>' + kh(r.c) + '</td></tr>'; }).join('') +
      '<tr class="sx-tot"><td>' + A.esc(t(T.total)) + '</td><td></td><td>' + kh(n) + '</td></tr></tbody>';
    /* frequency chart */
    var mx = Math.max.apply(null, rows.map(function (r) { return r.c; })), bw = Math.min(60, 560 / rows.length), W = rows.length * bw + 60, Hh = 220, ch = '';
    var yStep = mx <= 10 ? 1 : niceStep(mx, 5);
    for (var y = 0; y <= mx; y += yStep) { var yy = 190 - y / mx * 160; ch += '<line x1="40" y1="' + yy + '" x2="' + (W - 10) + '" y2="' + yy + '" class="sx-grid"/><text x="34" y="' + (yy + 4) + '" class="sx-ax" text-anchor="end">' + kh(y) + '</text>'; }
    rows.forEach(function (r, i) {
      var h = r.c / mx * 160, x = 44 + i * bw;
      ch += '<rect x="' + x + '" y="' + (190 - h) + '" width="' + (bw - (grouped ? 0 : 8)) + '" height="' + h + '" class="sx-bar"/>';
      ch += '<text x="' + (x + (bw - (grouped ? 0 : 8)) / 2) + '" y="208" class="sx-ax" text-anchor="middle">' + (grouped ? '' : r.l) + '</text>';
    });
    if (grouped) { rows.forEach(function (r, i) { ch += '<text x="' + (44 + i * bw) + '" y="208" class="sx-ax" text-anchor="middle">' + F(start + i * w, 6) + '</text>'; }); }
    $('sxChartH').textContent = t(T.chart);
    $('sxChart').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" class="sx-svg" role="img" aria-label="' + A.esc(t(T.chart)) + '">' + ch + '</svg>';
    /* stem and leaf */
    var dp = Math.max.apply(null, s.map(function (x) { var q = String(x); return q.indexOf('.') < 0 ? 0 : q.split('.')[1].length; }));
    var sl = $('sxSl');
    var scale = dp === 0 ? 1 : dp === 1 ? 10 : 0;
    if (!scale || s[0] < 0 || (s[n - 1] - s[0]) * scale / 10 > 30) { sl.innerHTML = '<p class="dc-under">' + A.esc(t(T.noStem)) + '</p>'; }
    else {
      var st = {}, a0 = Math.floor(s[0] * scale / 10), a1 = Math.floor(s[n - 1] * scale / 10);
      for (var k = a0; k <= a1; k++) { st[k] = []; }
      s.forEach(function (x) { var v = Math.round(x * scale); st[Math.floor(v / 10)].push(v % 10); });
      var ex = s[0], exS = Math.floor(Math.round(ex * scale) / 10), exL = Math.round(ex * scale) % 10;
      sl.innerHTML = '<table class="sx-sl"><tbody>' + Object.keys(st).map(Number).sort(function (a, b) { return a - b; }).map(function (k) {
        return '<tr><th>' + kh(scale === 10 ? k : k) + '</th><td>' + st[k].map(kh).join(' ') + '</td></tr>';
      }).join('') + '</tbody></table><p class="dc-under">' + A.esc(f(T.key, { s: kh(exS), l: kh(exL), v: F(ex) })) + '</p>';
    }
    /* box plot */
    var lo2 = s[0], hi2 = s[n - 1], span = (hi2 - lo2) || 1, st2 = niceStep(span, 8), a = Math.floor(lo2 / st2) * st2, b = Math.ceil(hi2 / st2) * st2;
    if (b === a) { b = a + st2; }
    var X = function (v) { return 30 + (v - a) / (b - a) * 540; }, bp = '';
    for (var g = a; g <= b + 1e-9; g += st2) { bp += '<line x1="' + X(g) + '" y1="110" x2="' + X(g) + '" y2="116" class="sx-ax-l"/><text x="' + X(g) + '" y="132" class="sx-ax" text-anchor="middle">' + F(g, 6) + '</text>'; }
    bp += '<line x1="30" y1="110" x2="570" y2="110" class="sx-ax-l"/>';
    bp += '<line x1="' + X(lo2) + '" y1="55" x2="' + X(q1) + '" y2="55" class="sx-wh"/><line x1="' + X(q3) + '" y1="55" x2="' + X(hi2) + '" y2="55" class="sx-wh"/>';
    bp += '<line x1="' + X(lo2) + '" y1="40" x2="' + X(lo2) + '" y2="70" class="sx-wh"/><line x1="' + X(hi2) + '" y1="40" x2="' + X(hi2) + '" y2="70" class="sx-wh"/>';
    bp += '<rect x="' + X(q1) + '" y="30" width="' + Math.max(1, X(q3) - X(q1)) + '" height="50" class="sx-box"/><line x1="' + X(median) + '" y1="30" x2="' + X(median) + '" y2="80" class="sx-med"/>';
    [[lo2, 'min'], [q1, 'Q1'], [median, t(T.median)], [q3, 'Q3'], [hi2, 'max']].forEach(function (p, i) { bp += '<text x="' + X(p[0]) + '" y="' + (i % 2 ? 22 : 96) + '" class="sx-bl" text-anchor="middle">' + A.esc(p[1]) + '</text>'; });
    $('sxBpH').textContent = t(T.bp);
    $('sxBp').innerHTML = '<svg viewBox="0 0 600 140" class="sx-svg" role="img" aria-label="' + A.esc(t(T.bp)) + '">' + bp + '</svg>';
  }
  ta.addEventListener('input', paint);
  $('sxEx').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } ta.value = b.getAttribute('data-x'); paint(); });
  document.addEventListener('aa:langchange', paint);
  paint();
})();
