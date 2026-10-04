/* Alpha Academy Cambodia — Sequences
   ---------------------------------------------------------------------------
   FIND THE RULE — type the first few terms. Linear, quadratic and geometric
   sequences are recognised from their differences (or ratios); the nth
   term is worked out step by step, with the term-to-term rule, the next
   terms, the 10th and 100th, and a check of whether a number is in it.
   FROM THE nTH TERM — type a rule such as 4n − 1 or n² + 2 and get the terms.
   Linear sequences are drawn as a growing pattern: matchstick squares,
   triangles and hexagons for 3n + 1, 2n + 1 and 5n + 1, dots otherwise.
   Uses tools-core.js. Nothing is sent or stored.                          */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('sqRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh, F = function (n) { return A.fmt(Math.round(n * 1e9) / 1e9); };

  var T = {
    diff: { en: 'Differences: {l}', km: 'ផលសង៖ {l}' },
    diff2: { en: 'Second differences: {l}', km: 'ផលសងទីពីរ៖ {l}' },
    ratio: { en: 'Ratios: {l}', km: 'ផលធៀប៖ {l}' },
    lin1: { en: 'The difference is always {d}, so the sequence is linear and the nth term starts {d}n.', km: 'ផលសងតែងស្មើ {d} ដូច្នេះស្វ៊ីតជាស្វ៊ីតលីនេអ៊ែរ ហើយតួទូទៅចាប់ផ្ដើមដោយ {d}n។' },
    lin2: { en: 'The term before the first (the zero term) is {a} − {d} = {b}.', km: 'តួមុនតួទីមួយ (តួទីសូន្យ) គឺ {a} − {d} = {b}។' },
    lin3: { en: 'nth term = {r}', km: 'តួទូទៅ = {r}' },
    quad1: { en: 'The second difference is always {d}, so the sequence is quadratic: a = {d} ÷ 2 = {a}, so it starts {a}n².', km: 'ផលសងទីពីរតែងស្មើ {d} ដូច្នេះស្វ៊ីតជាដឺក្រេទីពីរ៖ a = {d} ÷ ២ = {a} ដូច្នេះចាប់ផ្ដើមដោយ {a}n²។' },
    quad2: { en: 'Take {a}n² away from each term: {l} — that is linear: {r}.', km: 'ដក {a}n² ពីតួនីមួយៗ៖ {l} — ជាស្វ៊ីតលីនេអ៊ែរ៖ {r}។' },
    geo1: { en: 'Each term is {r} times the one before, so the sequence is geometric.', km: 'តួនីមួយៗស្មើ {r} ដងនៃតួមុន ដូច្នេះជាស្វ៊ីតធរណីមាត្រ។' },
    geo2: { en: 'nth term = first term × ratio^(n − 1) = {e}', km: 'តួទូទៅ = តួទីមួយ × ផលធៀប^(n − ១) = {e}' },
    none: { en: 'No simple rule found — it is not linear, quadratic or geometric.', km: 'រកមិនឃើញច្បាប់សាមញ្ញទេ — មិនមែនលីនេអ៊ែរ ដឺក្រេទីពីរ ឬធរណីមាត្រ។' },
    need: { en: 'Type at least three terms, separated by commas.', km: 'សូមវាយយ៉ាងហោចណាស់បីតួ ដោយបំបែកដោយក្បៀស។' },
    ttAdd: { en: 'Add {d} each time', km: 'បូក {d} រាល់ដង' },
    ttSub: { en: 'Subtract {d} each time', km: 'ដក {d} រាល់ដង' },
    ttMul: { en: 'Multiply by {r} each time', km: 'គុណនឹង {r} រាល់ដង' },
    ttQuad: { en: 'The amount added goes up by {d} each time', km: 'ចំនួនដែលបូក កើន {d} រាល់ដង' },
    isIn: { en: '{x} is term number {n}.', km: '{x} ជាតួទី {n}។' },
    notIn: { en: '{x} is not in the sequence: {r} gives n = {n}, which is not a whole number.', km: '{x} មិននៅក្នុងស្វ៊ីតទេ៖ {r} ផ្ដល់ n = {n} ដែលមិនមែនជាចំនួនគត់។' },
    badRule: { en: 'Write the rule using n, for example 4n − 1, n² + 2 or 3 × 2^n.', km: 'សរសេរច្បាប់ដោយប្រើ n ឧទាហរណ៍ 4n − 1, n² + 2 ឬ 3 × 2^n។' },
    term: { en: 'Term {n}', km: 'តួទី {n}' },
    patH: { en: 'The pattern', km: 'លំនាំ' },
    patSq: { en: 'Matchstick squares: 3 more sticks for each new square, plus the 1 that starts it — 3n + 1.', km: 'ការេធ្វើពីឈើគូស៖ បន្ថែម ៣ ដើមសម្រាប់ការេថ្មីនីមួយៗ បូក ១ ដើមចាប់ផ្ដើម — 3n + 1។' },
    patTr: { en: 'Matchstick triangles: 2 more sticks for each new triangle, plus 1 — 2n + 1.', km: 'ត្រីកោណធ្វើពីឈើគូស៖ បន្ថែម ២ ដើមសម្រាប់ត្រីកោណថ្មីនីមួយៗ បូក ១ — 2n + 1។' },
    patHx: { en: 'Matchstick hexagons: 5 more sticks for each new hexagon, plus 1 — 5n + 1.', km: 'ឆកោណធ្វើពីឈើគូស៖ បន្ថែម ៥ ដើមសម្រាប់ឆកោណថ្មីនីមួយៗ បូក ១ — 5n + 1។' },
    patDot: { en: 'Each pattern adds a new column of {a} dots (blue) to the {b} that are always there (grey).', km: 'លំនាំនីមួយៗបន្ថែមជួរឈរថ្មីនៃ {a} ចំណុច (ខៀវ) ទៅលើ {b} ចំណុចដែលតែងមាន (ប្រផេះ)។' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }

  /* ------------------------------------------------- formatting rules */
  function lin(a, b) {                       /* "an + b" nicely */
    var s = a === 0 ? '' : (a === 1 ? '' : a === -1 ? '−' : F(a)) + 'n';
    if (b) { s += a === 0 ? F(b) : (b > 0 ? ' + ' + F(b) : ' − ' + F(-b)); }
    return s || kh(0);
  }
  function quad(a, b, c) {
    var s = (a === 1 ? '' : a === -1 ? '−' : F(a)) + 'n²';
    if (b) { s += b > 0 ? ' + ' + (b === 1 ? '' : F(b)) + 'n' : ' − ' + (b === -1 ? '' : F(-b)) + 'n'; }
    if (c) { s += c > 0 ? ' + ' + F(c) : ' − ' + F(-c); }
    return s;
  }
  function near(x, y) { return Math.abs(x - y) < 1e-9 * Math.max(1, Math.abs(x), Math.abs(y)); }
  function allEq(l) { return l.every(function (x) { return near(x, l[0]); }); }
  function diffs(l) { var d = []; for (var i = 1; i < l.length; i++) { d.push(l[i] - l[i - 1]); } return d; }

  /* ------------------------------------------------------ the analysis */
  function analyse(ts) {
    var d1 = diffs(ts), L = [f(T.diff, { l: d1.map(F).join(', ') })];
    if (allEq(d1)) {
      var d = d1[0], z = ts[0] - d;
      L.push(f(T.lin1, { d: F(d) }), f(T.lin2, { a: F(ts[0]), d: F(d), b: F(z) }), f(T.lin3, { r: lin(d, z) }));
      return { kind: 'lin', a: d, b: z, fn: function (n) { return d * n + z; }, rule: lin(d, z), tt: d >= 0 ? f(T.ttAdd, { d: F(d) }) : f(T.ttSub, { d: F(-d) }), L: L };
    }
    if (ts.length >= 4) {
      var d2 = diffs(d1);
      L.push(f(T.diff2, { l: d2.map(F).join(', ') }));
      if (allEq(d2)) {
        var qa = d2[0] / 2, rest = ts.map(function (x, i) { return x - qa * (i + 1) * (i + 1); }), rd = rest[1] - rest[0], rz = rest[0] - rd;
        L.push(f(T.quad1, { d: F(d2[0]), a: F(qa) }), f(T.quad2, { a: F(qa), l: rest.map(F).join(', '), r: lin(rd, rz) }), f(T.lin3, { r: quad(qa, rd, rz) }));
        return { kind: 'quad', fn: function (n) { return qa * n * n + rd * n + rz; }, rule: quad(qa, rd, rz), tt: f(T.ttQuad, { d: F(d2[0]) }), L: L };
      }
    }
    if (ts.every(function (x) { return x !== 0; })) {
      var rs = []; for (var i = 1; i < ts.length; i++) { rs.push(ts[i] / ts[i - 1]); }
      if (allEq(rs)) {
        var r = rs[0], a0 = ts[0];
        L.push(f(T.ratio, { l: rs.map(F).join(', ') }), f(T.geo1, { r: F(r) }), f(T.geo2, { e: (a0 === 1 ? '' : F(a0) + ' × ') + F(r) + '^(n − 1)' }));
        return { kind: 'geo', fn: function (n) { return a0 * Math.pow(r, n - 1); }, rule: (a0 === 1 ? '' : F(a0) + ' × ') + F(r) + '^(n − 1)', tt: f(T.ttMul, { r: F(r) }), L: L };
      }
    }
    L.push(t(T.none));
    return { kind: 'none', L: L };
  }

  /* ----------------------------------------- a tiny parser for rules in n */
  function compile(src) {
    var s = A.unKh(src).replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').replace(/\s+/g, '').toLowerCase();
    if (!s || /[^0-9n+\-*/^().]/.test(s)) { return null; }
    var i = 0;
    function peek() { return s[i]; }
    function expr() { var v = term(); while (peek() === '+' || peek() === '-') { var o = s[i++], r = term(); v = (function (a, b, o) { return function (n) { return o === '+' ? a(n) + b(n) : a(n) - b(n); }; })(v, r, o); } return v; }
    function term() {
      var v = power();
      while (true) {
        var c = peek();
        if (c === '*' || c === '/') { i++; var r = power(); v = (function (a, b, c) { return function (n) { return c === '*' ? a(n) * b(n) : a(n) / b(n); }; })(v, r, c); }
        else if (c === 'n' || c === '(' || (c && /[0-9.]/.test(c))) { var r2 = power(); v = (function (a, b) { return function (n) { return a(n) * b(n); }; })(v, r2); }
        else { return v; }
      }
    }
    function power() { var b = unary(); if (peek() === '^') { i++; var e = power(); return function (n) { return Math.pow(b(n), e(n)); }; } return b; }
    function unary() { if (peek() === '-') { i++; var u = unary(); return function (n) { return -u(n); }; } if (peek() === '+') { i++; return unary(); } return atom(); }
    function atom() {
      var c = peek();
      if (c === '(') { i++; var v = expr(); if (peek() !== ')') { throw 0; } i++; return v; }
      if (c === 'n') { i++; return function (n) { return n; }; }
      var m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i)); if (!m) { throw 0; }
      i += m[0].length; var k = parseFloat(m[0]); return function () { return k; };
    }
    try { var fn = expr(); if (i !== s.length) { return null; } return fn; } catch (e) { return null; }
  }

  /* ---------------------------------------------------------- pictures */
  function picture(kind, a, b, ts) {
    var out = '', k, n;
    var stick = function (x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="sq-stick"/><circle cx="' + x2 + '" cy="' + y2 + '" r="2.6" class="sq-head"/>'; };
    for (n = 1; n <= 4; n++) {
      var s = '', W = 0, Hh = 70;
      if (kind === 'sq') { for (k = 0; k < n; k++) { var x = 10 + k * 36; s += stick(x, 14, x + 36, 14) + stick(x, 50, x + 36, 50) + stick(x, 14, x, 50); } s += stick(10 + n * 36, 14, 10 + n * 36, 50); W = 20 + n * 36; }
      else if (kind === 'tr') { for (k = 0; k < n; k++) { var bx = 10 + Math.floor(k / 2) * 40, up = k % 2 === 0; if (up) { s += stick(bx, 54, bx + 40, 54) + stick(bx, 54, bx + 20, 20); } else { s += stick(bx + 20, 20, bx + 60, 20) + stick(bx + 20, 20, bx + 40, 54); } } var last = n - 1, lx = 10 + Math.floor(last / 2) * 40; s += last % 2 === 0 ? stick(lx + 20, 20, lx + 40, 54) : stick(lx + 40, 54, lx + 60, 20); W = 30 + Math.ceil(n / 2) * 40 + 20; }
      else if (kind === 'hx') { var r = 18, h = r * Math.sqrt(3) / 2; for (k = 0; k < n; k++) { var cx = 28 + k * 2 * h, cy = 36, pts = []; for (var j = 0; j < 6; j++) { var an = Math.PI / 6 + Math.PI / 3 * j; pts.push([cx + r * Math.cos(an), cy + r * Math.sin(an)]); } for (j = 0; j < 6; j++) { if (k > 0 && j === 2) { continue; } var p = pts[j], q = pts[(j + 1) % 6]; s += stick(p[0], p[1], q[0], q[1]); } } W = 28 + n * 2 * h + 10; Hh = 72; }
      else { var gb = Math.max(0, b), cols = n, rows = Math.max(a, 1); for (k = 0; k < gb; k++) { s += '<circle cx="' + (12 + (k % 4) * 12) + '" cy="' + (12 + Math.floor(k / 4) * 12) + '" r="4.5" class="sq-dotg"/>'; } var off = 12 + Math.min(gb, 4) * 12 + (gb ? 8 : 0); for (var c = 0; c < cols; c++) { for (var rr = 0; rr < a; rr++) { s += '<circle cx="' + (off + c * 12) + '" cy="' + (12 + rr * 12) + '" r="4.5" class="sq-dot"/>'; } } W = off + cols * 12 + 6; Hh = Math.max(Math.ceil(gb / 4), rows) * 12 + 14; }
      out += '<figure class="sq-fig"><svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width:' + Math.min(W * 1.1, 260) + 'px">' + s + '</svg><figcaption>' + A.esc(f(T.term, { n: kh(n) })) + ': <b>' + F(ts ? ts(n) : a * n + b) + '</b></figcaption></figure>';
    }
    return out;
  }

  /* ------------------------------------------------------------- paint */
  var H = A.readHash(), mode = H.m === 'rule' ? 'rule' : 'find';
  if (H.s) { $('sqIn').value = H.s.split(',').join(', '); }
  if (H.r) { $('sqRule').value = H.r; }
  function show(an, fn) {
    var o = $('sqOut');
    if (!an || an.kind === 'none') {
      $('sqRes').textContent = '—'; $('sqTT').textContent = ''; $('sqNext').innerHTML = ''; $('sqPat').hidden = true; $('sqIs').hidden = true;
      return;
    }
    $('sqRes').textContent = an.rule; $('sqTT').textContent = an.tt || '';
    var rows = [];
    for (var n = 1; n <= 8; n++) { rows.push('<td>' + F(fn(n)) + '</td>'); }
    $('sqNext').innerHTML = '<tbody><tr><th>n</th>' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<td>' + kh(n) + '</td>'; }).join('') + '<td>' + kh(10) + '</td><td>' + kh(100) + '</td></tr><tr><th>' + A.esc(t({ en: 'term', km: 'តួ' })) + '</th>' + rows.join('') + '<td>' + F(fn(10)) + '</td><td>' + F(fn(100)) + '</td></tr></tbody>';
    /* pattern */
    var pk = null;
    if (an.kind === 'lin') {
      if (near(an.a, 3) && near(an.b, 1)) { pk = 'sq'; } else if (near(an.a, 2) && near(an.b, 1)) { pk = 'tr'; } else if (near(an.a, 5) && near(an.b, 1)) { pk = 'hx'; }
      else if (an.a > 0 && an.a <= 8 && an.b >= 0 && an.b <= 16 && an.a === Math.round(an.a) && an.b === Math.round(an.b)) { pk = 'dot'; }
    }
    $('sqPat').hidden = !pk;
    if (pk) {
      $('sqPatH').textContent = t(T.patH);
      $('sqPics').innerHTML = picture(pk, an.a, an.b, fn);
      $('sqPatP').textContent = pk === 'sq' ? t(T.patSq) : pk === 'tr' ? t(T.patTr) : pk === 'hx' ? t(T.patHx) : f(T.patDot, { a: F(an.a), b: F(an.b) });
    }
    $('sqIs').hidden = an.kind !== 'lin'; paintIs(an);
    o.hidden = false;
  }
  var cur = null;
  function paintIs(an) {
    an = an || cur; var x = A.parse($('sqX').value), out = $('sqXr');
    if (!an || an.kind !== 'lin' || x == null || isNaN(x)) { out.textContent = ''; return; }
    var n = (x - an.b) / an.a;
    out.textContent = n >= 1 && near(n, Math.round(n)) ? f(T.isIn, { x: F(x), n: F(Math.round(n)) }) : f(T.notIn, { x: F(x), r: an.rule + ' = ' + F(x), n: F(Math.round(n * 1000) / 1000) });
    out.className = 'tt-fb ' + (n >= 1 && near(n, Math.round(n)) ? 'ok' : 'no');
  }
  function paint() {
    $('sqModes').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === mode)); });
    $('sqFind').hidden = mode !== 'find'; $('sqFrom').hidden = mode !== 'rule';
    var steps = $('sqSteps'), msg = $('sqMsg');
    if (mode === 'find') {
      var ts = A.unKh($('sqIn').value).split(/[,;\s]+/).filter(Boolean).map(function (x) { return A.parse(x); }).filter(function (x) { return x != null && !isNaN(x); });
      A.writeHash({ s: ts.map(function (x) { return A.fmt(x, { plain: true, group: false }); }).join(',') });
      if (ts.length < 3) { msg.textContent = t(T.need); steps.innerHTML = ''; cur = null; show(null); return; }
      msg.textContent = '';
      cur = analyse(ts);
      steps.innerHTML = cur.L.map(function (x) { return '<li>' + A.esc(x) + '</li>'; }).join('');
      show(cur, cur.fn);
    } else {
      var src = $('sqRule').value, fn = compile(src);
      A.writeHash({ m: 'rule', r: src });
      if (!fn || !isFinite(fn(1))) { msg.textContent = t(T.badRule); steps.innerHTML = ''; cur = null; show(null); return; }
      msg.textContent = '';
      var first = [1, 2, 3, 4, 5].map(fn);
      cur = analyse(first);
      cur.rule = src.replace(/\*/g, ' × ');
      steps.innerHTML = first.map(function (v, i) { return '<li>n = ' + kh(i + 1) + ': ' + A.esc(src.replace(/n/g, '(' + (i + 1) + ')')) + ' = <b>' + F(v) + '</b></li>'; }).join('');
      show(cur.kind === 'none' ? { kind: 'raw', rule: cur.rule, tt: '' } : cur, fn);
    }
  }
  $('sqModes').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } mode = b.getAttribute('data-m'); paint(); });
  $('sqIn').addEventListener('input', paint); $('sqRule').addEventListener('input', paint); $('sqX').addEventListener('input', function () { paintIs(); });
  root.querySelectorAll('.sq-ex').forEach(function (g) {
    g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } if (b.hasAttribute('data-s')) { $('sqIn').value = b.getAttribute('data-s'); } else { $('sqRule').value = b.getAttribute('data-r'); } paint(); });
  });
  document.addEventListener('aa:langchange', paint);
  paint();
})();
