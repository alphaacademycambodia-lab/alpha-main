/* Alpha Academy Cambodia — Percentages & Ratio
   ---------------------------------------------------------------------------
   Five small solvers, each with its working written out:
     change   — percentage increase/decrease from A to B, and "increase A by
                p%" with the multiplier (1 + p/100)
     reverse  — the original amount before a p% rise or fall
     share    — split an amount in a ratio a : b (: c)
     simplify — a ratio in lowest terms and in the form 1 : n
     best     — best buy: price per unit for up to three packs
   Uses tools-core.js. Nothing is sent or stored; the address bar keeps the
   tab and the numbers.                                                    */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('prRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, F = function (n, d) { return A.fmt(d == null ? n : Math.round(n * Math.pow(10, d)) / Math.pow(10, d)); };

  var T = {
    up: { en: 'increase', km: 'កំណើន' }, down: { en: 'decrease', km: 'ការថយចុះ' },
    chg1: { en: 'Change = new − original = {b} − {a} = {d}', km: 'បម្រែបម្រួល = ថ្មី − ដើម = {b} − {a} = {d}' },
    chg2: { en: 'Percentage change = change ÷ original × 100 = {d} ÷ {a} × 100 = {p}%', km: 'ភាគរយបម្រែបម្រួល = បម្រែបម្រួល ÷ ដើម × ១០០ = {d} ÷ {a} × ១០០ = {p}%' },
    chgR: { en: 'A {p}% {w}', km: '{w} {p}%' },
    mul1: { en: 'Multiplier = 1 {s} {p} ÷ 100 = {m}', km: 'មេគុណ = ១ {s} {p} ÷ ១០០ = {m}' },
    mul2: { en: 'New amount = {a} × {m} = {r}', km: 'ចំនួនថ្មី = {a} × {m} = {r}' },
    rev1: { en: 'After a {p}% {w}, the amount is {m} of the original (multiplier {k}).', km: 'ក្រោយ{w} {p}% ចំនួននោះស្មើ {m} នៃចំនួនដើម (មេគុណ {k})។' },
    rev2: { en: 'So original × {k} = {v}', km: 'ដូច្នេះ ដើម × {k} = {v}' },
    rev3: { en: 'Original = {v} ÷ {k} = {r}', km: 'ដើម = {v} ÷ {k} = {r}' },
    revWarn: { en: 'Do not take {p}% off {v} — that gives {x}, not the original.', km: 'កុំដក {p}% ពី {v} — វាផ្ដល់ {x} មិនមែនចំនួនដើមទេ។' },
    sh1: { en: 'Total parts = {l} = {n}', km: 'ចំនួនចំណែកសរុប = {l} = {n}' },
    sh2: { en: 'One part = {v} ÷ {n} = {o}', km: 'មួយចំណែក = {v} ÷ {n} = {o}' },
    sh3: { en: '{k} parts = {k} × {o} = {r}', km: '{k} ចំណែក = {k} × {o} = {r}' },
    sh4: { en: 'Check: {l} = {v}', km: 'ផ្ទៀងផ្ទាត់៖ {l} = {v}' },
    si1: { en: 'The HCF of {l} is {h}.', km: 'HCF នៃ {l} គឺ {h}។' },
    si2: { en: 'Divide every part by {h}: {r}', km: 'ចែកគ្រប់ផ្នែកនឹង {h}៖ {r}' },
    si0: { en: 'Multiply by {m} to clear the decimals: {r}', km: 'គុណនឹង {m} ដើម្បីលុបទសភាគ៖ {r}' },
    siSame: { en: '{r} is already in its simplest form.', km: '{r} ស្ថិតក្នុងទម្រង់សាមញ្ញបំផុតរួចហើយ។' },
    si1n: { en: 'In the form 1 : n, divide by the first part ({a}): {r}', km: 'ក្នុងទម្រង់ ១ : n ចែកនឹងផ្នែកទីមួយ ({a})៖ {r}' },
    bb: { en: '{n}: {p} ÷ {q} = {u} per unit', km: '{n}៖ {p} ÷ {q} = {u} ក្នុងមួយឯកតា' },
    bbBest: { en: '{n} is the best buy — the lowest price for each unit.', km: '{n} ជាការទិញល្អបំផុត — តម្លៃទាបបំផុតក្នុងមួយឯកតា។' },
    bbTie: { en: 'They are the same value for money.', km: 'តម្លៃស្មើគ្នា។' },
    bbSave: { en: 'Per 100 units: {l}.', km: 'ក្នុង ១០០ ឯកតា៖ {l}។' },
    need: { en: 'Fill in the numbers above.', km: 'សូមបំពេញចំនួនខាងលើ។' },
    zero: { en: 'The original amount cannot be 0.', km: 'ចំនួនដើមមិនអាចស្មើ ០ ទេ។' },
    p100: { en: 'A decrease of 100% or more leaves nothing to work back from.', km: 'ការថយចុះ ១០០% ឬច្រើនជាងនេះ មិនអាចគណនាត្រឡប់ក្រោយបានទេ។' },
    pack: { en: 'Pack {i}', km: 'កញ្ចប់ទី {i}' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }
  function num(id) { var v = A.parse($(id).value); return (v == null || isNaN(v)) ? null : v; }
  function steps(id, list) { $(id).innerHTML = list.map(function (s) { return '<li>' + A.esc(s) + '</li>'; }).join(''); }
  function setRes(id, s) { $(id).textContent = s; }

  /* ------------------------------------------------------------ tabs */
  var H = A.readHash(), TABS = ['change', 'reverse', 'share', 'simplify', 'best'];
  var tab = TABS.indexOf(H.tab) >= 0 ? H.tab : 'change';
  root.querySelectorAll('input[data-k]').forEach(function (el) { if (H[el.getAttribute('data-k')] != null) { el.value = H[el.getAttribute('data-k')]; } });
  function save() {
    var o = { tab: tab === 'change' ? '' : tab, dir: dirUp ? '' : 'down', rdir: revUp ? 'up' : '' };
    root.querySelectorAll('input[data-k]').forEach(function (el) { o[el.getAttribute('data-k')] = el.value.trim(); });
    A.writeHash(o);
  }
  function paintTabs() {
    $('prTabs').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === tab)); });
    TABS.forEach(function (k) { $('prP_' + k).hidden = k !== tab; });
  }
  $('prTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } tab = b.getAttribute('data-t'); paintTabs(); save(); });

  /* ----------------------------------------------------- 1. % change */
  var dirUp = H.dir !== 'down';
  function paintChange() {
    var a = num('prCa'), b = num('prCb'), L = [];
    if (a == null || b == null) { setRes('prCr', '—'); L.push(t(T.need)); }
    else if (a === 0) { setRes('prCr', '—'); L.push(t(T.zero)); }
    else {
      var d = b - a, p = d / a * 100;
      L.push(f(T.chg1, { a: F(a), b: F(b), d: F(d) }));
      L.push(f(T.chg2, { a: F(a), d: F(Math.abs(d)), p: F(Math.abs(p), 2) }));
      setRes('prCr', f(T.chgR, { p: F(Math.abs(p), 2), w: t(d >= 0 ? T.up : T.down) }));
    }
    steps('prCs', L);
    /* multiplier */
    var m0 = num('prMa'), mp = num('prMp'), M = [];
    $('prMdir').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String((x.getAttribute('data-d') === 'up') === dirUp)); });
    if (m0 == null || mp == null) { setRes('prMr', '—'); M.push(t(T.need)); }
    else {
      var k = dirUp ? 1 + mp / 100 : 1 - mp / 100, r = m0 * k;
      M.push(f(T.mul1, { s: dirUp ? '+' : '−', p: F(mp), m: F(k, 6) }));
      M.push(f(T.mul2, { a: F(m0), m: F(k, 6), r: F(r, 4) }));
      setRes('prMr', F(r, 4));
    }
    steps('prMs', M);
  }
  $('prMdir').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } dirUp = b.getAttribute('data-d') === 'up'; paintChange(); save(); });

  /* ---------------------------------------------------- 2. reverse % */
  var revUp = H.rdir === 'up';
  function paintReverse() {
    $('prRdir').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String((x.getAttribute('data-d') === 'up') === revUp)); });
    var v = num('prRv'), p = num('prRp'), L = [];
    if (v == null || p == null) { setRes('prRr', '—'); L.push(t(T.need)); }
    else if (!revUp && p >= 100) { setRes('prRr', '—'); L.push(t(T.p100)); }
    else {
      var k = revUp ? 1 + p / 100 : 1 - p / 100, r = v / k;
      L.push(f(T.rev1, { p: F(p), w: t(revUp ? T.up : T.down), m: F(k * 100, 4) + '%', k: F(k, 6) }));
      L.push(f(T.rev2, { k: F(k, 6), v: F(v) }));
      L.push(f(T.rev3, { v: F(v), k: F(k, 6), r: F(r, 4) }));
      L.push(f(T.revWarn, { p: F(p), v: F(v), x: F(revUp ? v * (1 - p / 100) : v * (1 + p / 100), 4) }));
      setRes('prRr', F(r, 4));
    }
    steps('prRs', L);
  }
  $('prRdir').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } revUp = b.getAttribute('data-d') === 'up'; paintReverse(); save(); });

  /* ------------------------------------------------------- 3. share */
  function ratioParts(s) {
    var parts = A.unKh(String(s || '')).split(/[:：∶,]/).map(function (x) { return A.parse(x); });
    if (parts.length < 2 || parts.some(function (x) { return x == null || isNaN(x) || x < 0; })) { return null; }
    return parts.slice(0, 5);
  }
  function rstr(p, d) { return p.map(function (x) { return F(x, d); }).join(' : '); }
  function paintShare() {
    var v = num('prSv'), r = ratioParts($('prSr').value), L = [], out = $('prSout');
    if (v == null || !r) { setRes('prSres', '—'); out.innerHTML = ''; steps('prSs', [t(T.need)]); return; }
    var n = r.reduce(function (a, b) { return a + b; });
    if (!n) { setRes('prSres', '—'); out.innerHTML = ''; steps('prSs', [t(T.need)]); return; }
    var one = v / n, sh = r.map(function (x) { return x * one; });
    L.push(f(T.sh1, { l: r.map(function (x) { return F(x); }).join(' + '), n: F(n) }));
    L.push(f(T.sh2, { v: F(v), n: F(n), o: F(one, 4) }));
    r.forEach(function (x, i) { L.push(f(T.sh3, { k: F(x), o: F(one, 4), r: F(sh[i], 4) })); });
    L.push(f(T.sh4, { l: sh.map(function (x) { return F(x, 4); }).join(' + '), v: F(v) }));
    steps('prSs', L);
    setRes('prSres', sh.map(function (x) { return F(x, 2); }).join(' : '));
    var cols = ['#0b57d0', '#f59e0b', '#16a34a', '#7c3aed', '#dc2626'];
    out.innerHTML = '<div class="pr-bar">' + r.map(function (x, i) {
      var cells = ''; for (var k = 0; k < Math.min(x, 40); k++) { cells += '<i></i>'; }
      return '<span style="flex:' + x + ';--c:' + cols[i] + '"><b>' + F(sh[i], 2) + '</b>' + (x === Math.round(x) && x <= 40 ? '<em>' + cells + '</em>' : '') + '</span>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------- 4. simplify */
  function paintSimplify() {
    var r = ratioParts($('prQr').value), L = [];
    if (!r) { setRes('prQres', '—'); steps('prQs', [t(T.need)]); return; }
    var dec = Math.max.apply(null, r.map(function (x) { var s = String(x); return s.indexOf('.') < 0 ? 0 : s.split('.')[1].length; }));
    var w = r;
    if (dec) { var m = Math.pow(10, Math.min(dec, 6)); w = r.map(function (x) { return Math.round(x * m); }); L.push(f(T.si0, { m: F(m), r: rstr(w) })); }
    var h = w.reduce(function (a, b) { return A.gcd(a, b); });
    var s = h ? w.map(function (x) { return x / h; }) : w;
    if (h > 1) { L.push(f(T.si1, { l: rstr(w), h: F(h) })); L.push(f(T.si2, { h: F(h), r: rstr(s) })); }
    else { L.push(f(T.siSame, { r: rstr(s) })); }
    if (s[0]) { L.push(f(T.si1n, { a: F(s[0]), r: rstr(s.map(function (x) { return x / s[0]; }), 3) })); }
    setRes('prQres', rstr(s));
    steps('prQs', L);
  }

  /* --------------------------------------------------- 5. best buy */
  function paintBest() {
    var items = [], L = [];
    for (var i = 1; i <= 3; i++) {
      var p = num('prB' + i + 'p'), q = num('prB' + i + 'q');
      if (p != null && q) { items.push({ i: i, p: p, q: q, u: p / q }); }
    }
    root.querySelectorAll('.pr-pack').forEach(function (el) { el.classList.remove('is-best'); });
    if (items.length < 2) { setRes('prBres', '—'); steps('prBs', [t(T.need)]); return; }
    items.forEach(function (it) { L.push(f(T.bb, { n: f(T.pack, { i: A.kh(it.i) }), p: F(it.p), q: F(it.q), u: F(it.u, 4) })); });
    var min = Math.min.apply(null, items.map(function (x) { return x.u; }));
    var best = items.filter(function (x) { return Math.abs(x.u - min) < 1e-12; });
    L.push(f(T.bbSave, { l: items.map(function (x) { return f(T.pack, { i: A.kh(x.i) }) + ' ' + F(x.u * 100, 2); }).join(', ') }));
    if (best.length === items.length) { L.push(t(T.bbTie)); setRes('prBres', '='); }
    else {
      L.push(f(T.bbBest, { n: f(T.pack, { i: A.kh(best[0].i) }) }));
      setRes('prBres', f(T.pack, { i: A.kh(best[0].i) }));
      best.forEach(function (b) { $('prB' + b.i).classList.add('is-best'); });
    }
    steps('prBs', L);
  }

  function all() { paintChange(); paintReverse(); paintShare(); paintSimplify(); paintBest(); }
  root.addEventListener('input', function () { all(); save(); });
  root.querySelectorAll('.pr-ex').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) { return; }
      b.getAttribute('data-x').split(';').forEach(function (kv) { var p = kv.split('='); var el = root.querySelector('input[data-k="' + p[0] + '"]'); if (el) { el.value = p[1]; } });
      if (b.hasAttribute('data-dir')) { revUp = b.getAttribute('data-dir') === 'up'; }
      all(); save();
    });
  });
  document.addEventListener('aa:langchange', all);
  paintTabs(); all();
})();
