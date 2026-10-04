/* Alpha Academy Cambodia — Probability Simulator
   ---------------------------------------------------------------------------
   Toss coins, roll dice, spin a spinner or draw counters from a bag — 1, 10,
   100 or 1,000 times at once. Each outcome's frequency and relative
   frequency sits beside its theoretical probability, on a bar chart and in
   a table, and a line chart follows one outcome's relative frequency as the
   trials pile up, so the "law of large numbers" can be watched happening.
   Uses tools-core.js. Nothing is sent or stored.                          */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('pbRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh, F = function (n, d) { return A.fmt(Math.round(n * Math.pow(10, d || 0)) / Math.pow(10, d || 0)); };
  var COL = ['#0b57d0', '#f59e0b', '#16a34a', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

  var T = {
    heads: { en: 'Heads', km: 'មុខ' }, tails: { en: 'Tails', km: 'ខ្នង' },
    red: { en: 'Red', km: 'ក្រហម' }, blue: { en: 'Blue', km: 'ខៀវ' }, green: { en: 'Green', km: 'បៃតង' },
    outcome: { en: 'Outcome', km: 'លទ្ធផល' }, freq: { en: 'Frequency', km: 'ប្រេកង់' },
    rel: { en: 'Relative frequency', km: 'ប្រេកង់ធៀប' }, th: { en: 'Probability', km: 'ប្រូបាប' },
    trials: { en: '{n} trials', km: 'ការពិសោធន៍ {n} ដង' },
    none: { en: 'Press a button to start.', km: 'ចុចប៊ូតុងដើម្បីចាប់ផ្ដើម។' },
    track: { en: 'Relative frequency of “{o}” as the trials add up', km: 'ប្រេកង់ធៀបនៃ «{o}» ពេលការពិសោធន៍កើនឡើង' },
    expL: { en: 'Experimental', km: 'ពិសោធន៍' }, thL: { en: 'Theoretical', km: 'ទ្រឹស្ដី' },
    last: { en: 'Last result: {r}', km: 'លទ្ធផលចុងក្រោយ៖ {r}' },
    sum: { en: 'Sum', km: 'ផលបូក' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }

  /* ------------------------------------------------------ experiments */
  var S = { exp: 'coin', n: 4, bag: [3, 5, 2], counts: [], total: 0, hist: [], track: 0, last: null };
  function outcomes() {
    switch (S.exp) {
      case 'coin': return [{ l: t(T.heads), p: [1, 2] }, { l: t(T.tails), p: [1, 2] }];
      case 'die': return [1, 2, 3, 4, 5, 6].map(function (i) { return { l: kh(i), p: [1, 6] }; });
      case 'dice': var o = []; for (var s = 2; s <= 12; s++) { o.push({ l: kh(s), p: [6 - Math.abs(7 - s), 36] }); } return o;
      case 'spin': var r = []; for (var i = 0; i < S.n; i++) { r.push({ l: String.fromCharCode(65 + i), p: [1, S.n] }); } return r;
      case 'bag': var tot = S.bag[0] + S.bag[1] + S.bag[2]; return [T.red, T.blue, T.green].map(function (c, j) { return { l: t(c), p: [S.bag[j], tot] }; });
    }
  }
  function trial() {
    switch (S.exp) {
      case 'coin': return Math.random() < 0.5 ? 0 : 1;
      case 'die': return Math.floor(Math.random() * 6);
      case 'dice': var a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6); S.dice = [a, b]; return a + b - 2;
      case 'spin': return Math.floor(Math.random() * S.n);
      case 'bag': var tot = S.bag[0] + S.bag[1] + S.bag[2], r = Math.random() * tot; return r < S.bag[0] ? 0 : r < S.bag[0] + S.bag[1] ? 1 : 2;
    }
  }
  function reset() { var n = outcomes().length; S.counts = new Array(n).fill(0); S.total = 0; S.hist = []; S.last = null; if (S.track >= n) { S.track = 0; } paint(); }
  function run(k) {
    for (var i = 0; i < k; i++) {
      var r = trial(); S.counts[r]++; S.total++; S.last = r;
      if (S.total <= 200 || S.total % Math.ceil(S.total / 200) === 0) { S.hist.push([S.total, S.counts[S.track] / S.total]); }
    }
    paint();
  }
  function fracStr(p) { var g = A.gcd(p[0], p[1]) || 1; return kh(p[0] / g) + '/' + kh(p[1] / g); }

  /* ------------------------------------------------------------ paint */
  function lastPic() {
    var r = S.last, s = '';
    if (r == null) { return '<p class="dc-under">' + A.esc(t(T.none)) + '</p>'; }
    if (S.exp === 'coin') { s = '<circle cx="60" cy="60" r="48" class="pb-coin"/><text x="60" y="62" class="pb-big">' + (r ? 'T' : 'H') + '</text>'; return '<svg viewBox="0 0 120 120" class="pb-pic">' + s + '</svg>'; }
    if (S.exp === 'die' || S.exp === 'dice') {
      var vals = S.exp === 'die' ? [r + 1] : S.dice, out = '';
      vals.forEach(function (v, i) { out += '<g transform="translate(' + (i * 112) + ',0)">' + face(v) + '</g>'; });
      return '<svg viewBox="0 0 ' + (vals.length * 112) + ' 112" class="pb-pic">' + out + '</svg>';
    }
    if (S.exp === 'spin') { return spinner(r); }
    var c = ['#dc2626', '#0b57d0', '#16a34a'][r];
    return '<svg viewBox="0 0 120 120" class="pb-pic"><circle cx="60" cy="60" r="40" fill="' + c + '"/><circle cx="46" cy="46" r="10" fill="#fff" opacity=".35"/></svg>';
  }
  function face(v) {
    var P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]] };
    return '<rect x="4" y="4" width="96" height="96" rx="18" class="pb-die"/>' + P[v].map(function (p) { return '<circle cx="' + (p[0] + 2) + '" cy="' + (p[1] + 2) + '" r="8" class="pb-pip"/>'; }).join('');
  }
  function spinner(hl) {
    var n = S.n, s = '', R = 54;
    for (var i = 0; i < n; i++) {
      var a0 = i / n * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / n * 2 * Math.PI - Math.PI / 2;
      var p0 = [60 + R * Math.cos(a0), 60 + R * Math.sin(a0)], p1 = [60 + R * Math.cos(a1), 60 + R * Math.sin(a1)], am = (a0 + a1) / 2;
      s += '<path d="M60 60L' + p0 + 'A' + R + ' ' + R + ' 0 0 1 ' + p1 + 'Z" fill="' + COL[i % 8] + '" opacity="' + (hl == null || hl === i ? 1 : 0.35) + '" stroke="#fff" stroke-width="2"/>';
      s += '<text x="' + (60 + 34 * Math.cos(am)) + '" y="' + (60 + 34 * Math.sin(am)) + '" class="pb-sl">' + String.fromCharCode(65 + i) + '</text>';
    }
    if (hl != null) { var ah = (hl + 0.5) / n * 2 * Math.PI - Math.PI / 2; s += '<line x1="60" y1="60" x2="' + (60 + 46 * Math.cos(ah)) + '" y2="' + (60 + 46 * Math.sin(ah)) + '" class="pb-arrow"/>'; }
    return '<svg viewBox="0 0 120 120" class="pb-pic">' + s + '<circle cx="60" cy="60" r="5" fill="#111"/></svg>';
  }
  function paint() {
    var o = outcomes(), N = S.total;
    root.querySelectorAll('#pbExp button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-e') === S.exp)); });
    $('pbSpinOpt').hidden = S.exp !== 'spin'; $('pbBagOpt').hidden = S.exp !== 'bag';
    $('pbN').textContent = f(T.trials, { n: F(N) });
    $('pbLast').innerHTML = lastPic();
    /* table */
    $('pbTab').innerHTML = '<thead><tr><th>' + A.esc(t(T.outcome)) + '</th><th>' + A.esc(t(T.freq)) + '</th><th>' + A.esc(t(T.rel)) + '</th><th>' + A.esc(t(T.th)) + '</th></tr></thead><tbody>' +
      o.map(function (x, i) {
        return '<tr' + (i === S.track ? ' class="is-on"' : '') + ' data-i="' + i + '"><td><i style="background:' + (S.exp === 'bag' ? ['#dc2626', '#0b57d0', '#16a34a'][i] : COL[i % 8]) + '"></i>' + A.esc(x.l) + '</td><td>' + F(S.counts[i]) + '</td><td>' + (N ? F(S.counts[i] / N, 3) : '—') + '</td><td>' + fracStr(x.p) + ' ≈ ' + F(x.p[0] / x.p[1], 3) + '</td></tr>';
      }).join('') + '</tbody>';
    /* bar chart */
    var W = 560, H = 220, bw = (W - 60) / o.length, mx = Math.max(0.5, Math.max.apply(null, o.map(function (x, i) { return Math.max(x.p[0] / x.p[1], N ? S.counts[i] / N : 0); })));
    mx = Math.ceil(mx * 10) / 10;
    var s = '';
    for (var g = 0; g <= mx + 1e-9; g += mx <= 0.5 ? 0.1 : 0.2) { var y = 190 - g / mx * 170; s += '<line x1="44" y1="' + y + '" x2="' + W + '" y2="' + y + '" class="sx-grid"/><text x="38" y="' + (y + 4) + '" class="sx-ax" text-anchor="end">' + F(g, 1) + '</text>'; }
    o.forEach(function (x, i) {
      var cx = 50 + i * bw, w = bw * 0.62, ph = (x.p[0] / x.p[1]) / mx * 170, eh = N ? (S.counts[i] / N) / mx * 170 : 0;
      s += '<rect x="' + cx + '" y="' + (190 - eh) + '" width="' + w + '" height="' + eh + '" class="pb-exp"/>';
      s += '<line x1="' + (cx - 3) + '" y1="' + (190 - ph) + '" x2="' + (cx + w + 3) + '" y2="' + (190 - ph) + '" class="pb-th"/>';
      s += '<text x="' + (cx + w / 2) + '" y="208" class="sx-ax" text-anchor="middle">' + A.esc(x.l.length > 6 ? x.l.slice(0, 5) + '…' : x.l) + '</text>';
    });
    $('pbBars').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="sx-svg" role="img" aria-label="' + A.esc(t(T.rel)) + '">' + s + '</svg>';
    $('pbKeyE').textContent = t(T.expL); $('pbKeyT').textContent = t(T.thL);
    /* convergence line */
    var tp = o[S.track].p[0] / o[S.track].p[1], L = '', maxN = Math.max(10, N);
    var hmax = S.hist.reduce(function (m, h) { return Math.max(m, h[1]); }, 0), ym = Math.min(1, Math.max(0.2, Math.ceil(Math.max(tp * 2, hmax) * 10) / 10));
    var X = function (n) { return 44 + Math.log10(n) / Math.log10(maxN) * (W - 54); }, Y = function (v) { return 190 - Math.min(v, ym) / ym * 170; };
    [0, ym / 4, ym / 2, ym * 3 / 4, ym].forEach(function (v) { L += '<line x1="44" y1="' + Y(v) + '" x2="' + W + '" y2="' + Y(v) + '" class="sx-grid"/><text x="38" y="' + (Y(v) + 4) + '" class="sx-ax" text-anchor="end">' + F(v, 2) + '</text>'; });
    [1, 10, 100, 1000, 10000, 100000].forEach(function (n) { if (n <= maxN) { L += '<text x="' + X(n) + '" y="208" class="sx-ax" text-anchor="middle">' + F(n) + '</text>'; } });
    L += '<line x1="44" y1="' + Y(tp) + '" x2="' + W + '" y2="' + Y(tp) + '" class="pb-th"/>';
    if (S.hist.length) { L += '<polyline points="' + S.hist.map(function (h) { return X(h[0]) + ',' + Y(h[1]); }).join(' ') + '" class="pb-line"/>'; }
    $('pbTrackH').textContent = f(T.track, { o: o[S.track].l });
    $('pbLine').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="sx-svg" role="img" aria-label="' + A.esc($('pbTrackH').textContent) + '">' + L + '</svg>';
    if (S.exp === 'spin') { $('pbSpinPic').innerHTML = spinner(null); }
    if (S.exp === 'bag') { [0, 1, 2].forEach(function (j) { if (document.activeElement !== $('pbBag' + j)) { $('pbBag' + j).value = S.bag[j]; } }); }
  }

  $('pbExp').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } S.exp = b.getAttribute('data-e'); var o = outcomes(), best = 0; o.forEach(function (x, i) { if (x.p[0] / x.p[1] > o[best].p[0] / o[best].p[1]) { best = i; } }); S.track = best; reset(); });
  $('pbRun').addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) { return; } run(+b.getAttribute('data-k')); });
  $('pbReset').addEventListener('click', reset);
  $('pbTab').addEventListener('click', function (e) {
    var r = e.target.closest('tr[data-i]'); if (!r) { return; }
    S.track = +r.getAttribute('data-i');
    /* rebuild the history for the new outcome from now on */
    S.hist = S.total ? [[S.total, S.counts[S.track] / S.total]] : []; paint();
  });
  $('pbSpinN').addEventListener('input', function () { var v = A.parse($('pbSpinN').value); if (v >= 2 && v <= 8) { S.n = Math.round(v); reset(); } });
  [0, 1, 2].forEach(function (j) { $('pbBag' + j).addEventListener('input', function () { var v = A.parse($('pbBag' + j).value); if (v != null && !isNaN(v) && v >= 0 && v <= 50) { S.bag[j] = Math.round(v); if (S.bag[0] + S.bag[1] + S.bag[2] > 0) { reset(); } } }); });
  document.addEventListener('aa:langchange', paint);
  reset();
})();
