/* Alpha Academy Cambodia — Matrix Calculator
   ---------------------------------------------------------------------------
   Four jobs, all worked in exact fractions so the steps look like a
   student's own working (1/3, not 0.3333333):
     det       — the determinant of a 2×2 or 3×3 matrix, by the formula /
                 expansion along the first row, every minor written out
     inverse   — Gauss–Jordan on [A | I], each row operation with the
                 matrix after it; a 2×2 also gets the quick formula
     multiply  — A × B for any sizes up to 3×3, each entry as row · column
     solve     — a system of 2 or 3 linear equations by row reduction of the
                 augmented matrix; also says when there is no solution or
                 infinitely many
   Uses tools-core.js. Nothing is sent or stored; the address bar keeps the
   tab and the numbers.                                                    */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('mxRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t;

  /* ------------------------------------------------------- fractions */
  function g(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a || 1; }
  function Q(n, d) {
    if (d == null) { d = 1; }
    if (d < 0) { n = -n; d = -d; }
    var k = g(n, d);
    n = n / k; d = d / k;
    if (!isFinite(n) || !isFinite(d) || Math.abs(n) > 9e15 || d > 9e15) { throw new Error('big'); }
    return { n: n === 0 ? 0 : n, d: n === 0 ? 1 : d };
  }
  var ZERO = Q(0), ONE = Q(1);
  function add(a, b) { return Q(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return Q(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { var g1 = g(a.n, b.d), g2 = g(b.n, a.d); return Q((a.n / g1) * (b.n / g2), (a.d / g2) * (b.d / g1)); }
  function div(a, b) { return mul(a, Q(b.d, b.n)); }
  function neg(a) { return Q(-a.n, a.d); }
  function isZ(a) { return a.n === 0; }
  function isOne(a) { return a.n === 1 && a.d === 1; }

  /* "3", "−2", "1.5", "3/4", "-1/2", Khmer digits, decimal comma */
  function parseQ(s) {
    s = A.unKh(String(s == null ? '' : s)).trim().replace(/[−–]/g, '-').replace(/\s/g, '');
    if (s === '') { return null; }
    var parts = s.split('/');
    if (parts.length > 2) { return NaN; }
    function one(p) {
      var m = /^([-+]?)(\d*)(?:[.,](\d+))?$/.exec(p);
      if (!m || (m[2] === '' && !m[3])) { return null; }
      var dec = m[3] || '', n = parseInt((m[2] || '0') + dec, 10), d = Math.pow(10, dec.length);
      return Q(m[1] === '-' ? -n : n, d);
    }
    try {
      var a = one(parts[0]);
      if (!a) { return NaN; }
      if (parts.length === 1) { return a; }
      var b = one(parts[1]);
      if (!b || isZ(b)) { return NaN; }
      return div(a, b);
    } catch (e) { return NaN; }
  }

  /* display */
  function qh(a, opt) {
    opt = opt || {};
    var sg = a.n < 0 ? '−' : (opt.plus ? '+' : ''), n = Math.abs(a.n);
    if (a.d === 1) { return sg + A.kh(String(n)); }
    return sg + '<span class="es-fr"><span>' + A.kh(String(n)) + '</span><span>' + A.kh(String(a.d)) + '</span></span>';
  }
  /* in a product such as 3(…) or (−2)(…) */
  function qp(a) { return (a.n < 0 || a.d !== 1) ? '(' + qh(a) + ')' : qh(a); }
  function R(i) { return 'R<sub>' + A.kh(String(i + 1)) + '</sub>'; }

  /* matrix → HTML; bar = index of the first column after the divider */
  function mh(M, opt) {
    opt = opt || {};
    var h = '<span class="mx-m' + (opt.det ? ' mx-det' : '') + '"><table><tbody>';
    M.forEach(function (row, i) {
      h += '<tr>' + row.map(function (v, j) {
        var c = [];
        if (opt.bar != null && j === opt.bar) { c.push('mx-bar'); }
        if (opt.hl && opt.hl[i] && opt.hl[i][j]) { c.push('mx-hl'); }
        return '<td' + (c.length ? ' class="' + c.join(' ') + '"' : '') + '>' + qh(v) + '</td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table></span>';
  }
  function copyM(M) { return M.map(function (r) { return r.slice(); }); }
  function idM(n) { var M = []; for (var i = 0; i < n; i++) { M.push([]); for (var j = 0; j < n; j++) { M[i].push(i === j ? ONE : ZERO); } } return M; }

  /* ------------------------------------------------------------ words */
  var T = {
    need: { en: 'Fill in every box with a number (fractions such as 3/4 are fine).', km: 'សូមបំពេញគ្រប់ប្រអប់ជាចំនួន (ប្រភាគដូចជា 3/4 ក៏បាន)។' },
    big: { en: 'These numbers grow too large to keep exact. Try smaller numbers.', km: 'ចំនួនទាំងនេះធំពេកដើម្បីរក្សាឱ្យត្រឹមត្រូវ។ សូមសាកចំនួនតូចជាងនេះ។' },
    d2: { en: 'For a 2×2 matrix, det = ad − bc.', km: 'សម្រាប់ម៉ាទ្រីស 2×2 det = ad − bc។' },
    d3: { en: 'Expand along the first row. Each entry multiplies the 2×2 determinant left when its row and column are covered; the signs go +, −, +.', km: 'ពន្លាតតាមជួរដេកទីមួយ។ ធាតុនីមួយៗគុណនឹងដេទែរមីណង់ 2×2 ដែលនៅសល់ ពេលបិទជួរដេក និងជួរឈររបស់វា។ សញ្ញាគឺ +, −, +។' },
    dWork: { en: 'Work out each 2×2 determinant:', km: 'គណនាដេទែរមីណង់ 2×2 នីមួយៗ៖' },
    dZero: { en: 'The determinant is 0, so the matrix is singular — it has no inverse.', km: 'ដេទែរមីណង់ស្មើ ០ ដូច្នេះម៉ាទ្រីសនេះមិនមានម៉ាទ្រីសច្រាសទេ។' },
    dNon: { en: 'The determinant is not 0, so the matrix has an inverse.', km: 'ដេទែរមីណង់ខុសពី ០ ដូច្នេះម៉ាទ្រីសនេះមានម៉ាទ្រីសច្រាស។' },
    iStart: { en: 'Write A beside the identity matrix I. Use row operations to turn the left side into I; the right side then becomes A⁻¹.', km: 'សរសេរ A នៅជាប់ម៉ាទ្រីសឯកតា I។ ប្រើប្រមាណវិធីលើជួរដេក ដើម្បីប្ដូរផ្នែកខាងឆ្វេងទៅជា I។ ពេលនោះផ្នែកខាងស្ដាំក្លាយជា A⁻¹។' },
    sStart: { en: 'Write the system as an augmented matrix: the coefficients, a bar, then the numbers on the right-hand side.', km: 'សរសេរប្រព័ន្ធជាម៉ាទ្រីសបំពេញ៖ មេគុណ របារ បន្ទាប់មកចំនួននៅអង្គខាងស្ដាំ។' },
    swap: { en: 'Swap the rows so the pivot is not 0:', km: 'ប្ដូរជួរដេក ដើម្បីកុំឱ្យធាតុគោលស្មើ ០៖' },
    swap1: { en: 'Swap the rows to bring a 1 to the top:', km: 'ប្ដូរជួរដេក ដើម្បីនាំលេខ ១ ឡើងលើ៖' },
    scale: { en: 'Make the pivot 1:', km: 'ធ្វើឱ្យធាតុគោលស្មើ ១៖' },
    elim: { en: 'Make the other entries in column {c} zero:', km: 'ធ្វើឱ្យធាតុផ្សេងទៀតក្នុងជួរឈរទី {c} ស្មើ ០៖' },
    iDone: { en: 'The left side is now I, so the right side is A⁻¹.', km: 'ផ្នែកខាងឆ្វេងឥឡូវជា I ដូច្នេះផ្នែកខាងស្ដាំគឺ A⁻¹។' },
    iSing: { en: 'Column {c} has no non-zero entry to use as a pivot, so A cannot be turned into I. A is singular (det A = 0) and has no inverse.', km: 'ជួរឈរទី {c} គ្មានធាតុខុសពី ០ សម្រាប់ធ្វើជាធាតុគោលទេ ដូច្នេះមិនអាចប្ដូរ A ទៅជា I បានទេ។ det A = ០ ហើយ A គ្មានម៉ាទ្រីសច្រាសទេ។' },
    iCheck: { en: 'Check: A × A⁻¹ = I.', km: 'ផ្ទៀងផ្ទាត់៖ A × A⁻¹ = I។' },
    q2: { en: 'Quick way for a 2×2: swap a and d, change the signs of b and c, then divide by det A = {d}.', km: 'វិធីខ្លីសម្រាប់ 2×2៖ ប្ដូរ a និង d ប្ដូរសញ្ញា b និង c រួចចែកនឹង det A = {d}។' },
    noInv: { en: 'No inverse', km: 'គ្មានម៉ាទ្រីសច្រាស' },
    mSize: { en: 'A is {a} and B is {b}, so A × B is {c}. Each entry is a row of A times a column of B: multiply in pairs, then add.', km: 'A មានទំហំ {a} ហើយ B មានទំហំ {b} ដូច្នេះ A × B មានទំហំ {c}។ ធាតុនីមួយៗ = ជួរដេកនៃ A គុណជួរឈរនៃ B៖ គុណជាគូៗ រួចបូក។' },
    mOrder: { en: 'Order matters: B × A is usually different from A × B.', km: 'លំដាប់សំខាន់៖ B × A ជាធម្មតាខុសពី A × B។' },
    sUnique: { en: 'Read the answer from the last column.', km: 'អានចម្លើយពីជួរឈរចុងក្រោយ។' },
    sNone: { en: 'The row {r} says 0 = {k}, which is impossible. The system has no solution — the lines (or planes) never meet at one point.', km: 'ជួរដេក {r} និយាយថា ០ = {k} ដែលមិនអាចទៅរួច។ ប្រព័ន្ធនេះគ្មានចម្លើយ — បន្ទាត់ (ឬប្លង់) មិនជួបគ្នាត្រង់ចំណុចតែមួយទេ។' },
    sMany: { en: 'A row of zeros means one equation repeats the others. There are infinitely many solutions. Let {f} be any number:', km: 'ជួរដេកដែលសុទ្ធតែ ០ មានន័យថាសមីការមួយដដែលនឹងសមីការផ្សេង។ ប្រព័ន្ធមានចម្លើយច្រើនរាប់មិនអស់។ យក {f} ជាចំនួនណាក៏បាន៖' },
    noSol: { en: 'No solution', km: 'គ្មានចម្លើយ' },
    many: { en: 'Infinitely many solutions', km: 'ចម្លើយច្រើនរាប់មិនអស់' },
    sCheck: { en: 'Check in the first equation: {l} = {r} ✓', km: 'ផ្ទៀងផ្ទាត់ក្នុងសមីការទីមួយ៖ {l} = {r} ✓' },
    eqL: { en: 'Equation {i}', km: 'សមីការទី {i}' },
    ex: { en: 'Example', km: 'ឧទាហរណ៍' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }
  var VARS = ['x', 'y', 'z'];

  /* --------------------------------------------------------- the state */
  var H = A.readHash();
  var TABS = ['det', 'inv', 'mul', 'sys'];
  var S = {
    tab: TABS.indexOf(H.tab) >= 0 ? H.tab : 'det',
    n: H.n === '2' ? 2 : 3,
    a: unpack(H.a) || [['2', '1', '3'], ['0', '-1', '4'], ['1', '2', '5']],
    mr: clamp(H.mr, 2), mk: clamp(H.mk, 3), mc: clamp(H.mc, 2),
    ma: unpack(H.ma) || [['1', '2', '3'], ['4', '0', '-1']],
    mb: unpack(H.mb) || [['2', '1'], ['-1', '3'], ['0', '4']],
    sn: H.sn === '2' ? 2 : 3,
    s: unpack(H.s) || [['2', '1', '-1', '8'], ['-3', '-1', '2', '-11'], ['-2', '1', '2', '-3']]
  };
  function clamp(v, d) { v = parseInt(v, 10); return v >= 1 && v <= 3 ? v : d; }
  function unpack(s) { if (!s) { return null; } return s.split(';').map(function (r) { return r.split(','); }); }
  function pack(M) { return M.map(function (r) { return r.map(function (v) { return String(v).replace(/[,;]/g, ''); }).join(','); }).join(';'); }
  function save() {
    A.writeHash({
      tab: S.tab === 'det' ? '' : S.tab, n: S.n, a: pack(S.a),
      mr: S.mr, mk: S.mk, mc: S.mc, ma: pack(S.ma), mb: pack(S.mb),
      sn: S.sn, s: pack(S.s)
    });
  }
  function cell(M, i, j) { return (M[i] && M[i][j] != null) ? M[i][j] : ''; }

  /* ----------------------------------------------------- input grids */
  function grid(host, key, rows, cols, opt) {
    opt = opt || {};
    var M = S[key], h = '<div class="mx-grid' + (opt.sys ? ' mx-sys' : '') + '" style="--c:' + cols + '">';
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var v = A.esc(cell(M, i, j));
        if (opt.sys) {
          h += '<span class="mx-cell"><input type="text" class="mx-in" inputmode="text" autocomplete="off" data-m="' + key + '" data-i="' + i + '" data-j="' + j + '" value="' + v + '" aria-label="' + A.esc(f(T.eqL, { i: i + 1 })) + ' · ' + (j < cols - 1 ? VARS[j] : '=') + '">' +
            '<b>' + (j < cols - 2 ? VARS[j] + ' +' : j === cols - 2 ? VARS[j] + ' =' : '') + '</b></span>';
        } else {
          h += '<input type="text" class="mx-in" inputmode="text" autocomplete="off" data-m="' + key + '" data-i="' + i + '" data-j="' + j + '" value="' + v + '" aria-label="' + (opt.name || 'A') + ' ' + (i + 1) + ',' + (j + 1) + '">';
        }
      }
    }
    $(host).innerHTML = h + '</div>';
  }
  /* read a block of inputs into fractions; null if any box is empty or bad */
  function read(key, rows, cols) {
    var M = [];
    for (var i = 0; i < rows; i++) {
      M.push([]);
      for (var j = 0; j < cols; j++) {
        var q = parseQ(cell(S[key], i, j));
        if (q == null || (typeof q === 'number' && isNaN(q))) { return null; }
        M[i].push(q);
      }
    }
    return M;
  }
  function markBad(key) {
    root.querySelectorAll('.mx-in[data-m="' + key + '"]').forEach(function (el) {
      var q = parseQ(el.value);
      el.classList.toggle('is-bad', el.value.trim() !== '' && typeof q === 'number' && isNaN(q));
    });
  }

  root.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.classList.contains('mx-in')) { return; }
    var k = el.getAttribute('data-m'), i = +el.getAttribute('data-i'), j = +el.getAttribute('data-j');
    while (S[k].length <= i) { S[k].push([]); }
    S[k][i][j] = el.value;
    markBad(k);
    paint(); save();
  });

  /* ---------------------------------------------------- step helpers */
  function stepsHTML(list) {
    return list.map(function (s) {
      return '<li><p>' + s.t + '</p>' + (s.m ? '<div class="mx-scroll">' + s.m + '</div>' : '') + '</li>';
    }).join('');
  }

  /* Gauss–Jordan on an augmented matrix M (cols = left part width).
     Returns { M, steps, pivots[], singularCol } */
  function gaussJordan(M, left, steps, bar) {
    var rows = M.length, r = 0, pivots = [];
    for (var c = 0; c < left && r < rows; c++) {
      /* find a pivot: prefer an entry equal to ±1, else the first non-zero */
      var p = -1, i;
      for (i = r; i < rows; i++) { if (!isZ(M[i][c]) && p < 0) { p = i; } }
      if (p < 0) { pivots.push(-1); continue; }
      if (!(M[p][c].d === 1 && Math.abs(M[p][c].n) === 1)) {
        for (i = r; i < rows; i++) { if (M[i][c].d === 1 && M[i][c].n === 1) { p = i; break; } }
      }
      if (p !== r) {
        var tmp = M[p]; M[p] = M[r]; M[r] = tmp;
        steps.push({ t: t(isOne(M[r][c]) && !isZ(M[p][c]) ? T.swap1 : T.swap) + ' ' + R(r) + ' ↔ ' + R(p), m: mh(M, { bar: bar }) });
      }
      var pv = M[r][c];
      if (!isOne(pv)) {
        M[r] = M[r].map(function (v) { return div(v, pv); });
        var how = pv.n === -1 && pv.d === 1 ? R(r) + ' → −' + R(r) : R(r) + ' → ' + R(r) + ' ÷ ' + qp(pv);
        steps.push({ t: t(T.scale) + ' ' + how, m: mh(M, { bar: bar }) });
      }
      var ops = [];
      for (i = 0; i < rows; i++) {
        if (i === r || isZ(M[i][c])) { continue; }
        var e = M[i][c];
        M[i] = M[i].map(function (v, j) { return sub(v, mul(e, M[r][j])); });
        var k = e.n < 0 ? neg(e) : e;
        ops.push(R(i) + ' → ' + R(i) + (e.n < 0 ? ' + ' : ' − ') + (isOne(k) ? '' : qp(k)) + R(r));
      }
      if (ops.length) {
        steps.push({ t: f(T.elim, { c: A.kh(String(c + 1)) }) + '<br>' + ops.join('<br>'), m: mh(M, { bar: bar }) });
      }
      pivots.push(r);
      r++;
    }
    return { M: M, pivots: pivots };
  }

  /* ---------------------------------------------------- determinant */
  function det2(a, b, c, d) { return sub(mul(a, d), mul(b, c)); }
  function det(M) {
    if (M.length === 2) { return det2(M[0][0], M[0][1], M[1][0], M[1][1]); }
    var s = ZERO;
    for (var j = 0; j < 3; j++) {
      var m = minor(M, 0, j), d = det2(m[0][0], m[0][1], m[1][0], m[1][1]);
      s = j === 1 ? sub(s, mul(M[0][j], d)) : add(s, mul(M[0][j], d));
    }
    return s;
  }
  function minor(M, r, c) {
    return M.filter(function (_, i) { return i !== r; }).map(function (row) { return row.filter(function (_, j) { return j !== c; }); });
  }

  function paintDet() {
    var n = S.n, M = read('a', n, n), L = [];
    if (!M) { $('mxDetR').innerHTML = '—'; $('mxDetS').innerHTML = '<li><p>' + t(T.need) + '</p></li>'; return; }
    try {
      var D;
      if (n === 2) {
        D = det(M);
        L.push({ t: t(T.d2), m: mh(M, { det: true }) });
        L.push({ t: 'det A = ' + qp(M[0][0]) + ' × ' + qp(M[1][1]) + ' − ' + qp(M[0][1]) + ' × ' + qp(M[1][0]) +
          ' = ' + qh(mul(M[0][0], M[1][1])) + ' − ' + qp(mul(M[0][1], M[1][0])) + ' = <b>' + qh(D) + '</b>' });
      } else {
        L.push({ t: t(T.d3), m: mh(M, { det: true }) });
        var terms = [], vals = [], sums = [];
        for (var j = 0; j < 3; j++) {
          var m = minor(M, 0, j), d = det2(m[0][0], m[0][1], m[1][0], m[1][1]);
          terms.push((j === 1 ? ' − ' : j ? ' + ' : '') + qp(M[0][j]) + mh(m, { det: true }));
          vals.push({ m: m, d: d });
          sums.push((j === 1 ? ' − ' : j ? ' + ' : '') + qp(M[0][j]) + '(' + qh(d) + ')');
        }
        L.push({ t: 'det A = ', m: '<span class="mx-row">' + terms.join('') + '</span>' });
        L.push({ t: t(T.dWork) + '<br>' + vals.map(function (v) {
          var m = v.m;
          return qp(m[0][0]) + ' × ' + qp(m[1][1]) + ' − ' + qp(m[0][1]) + ' × ' + qp(m[1][0]) + ' = ' + qh(v.d);
        }).join('<br>') });
        D = det(M);
        L.push({ t: 'det A = ' + sums.join('') + ' = <b>' + qh(D) + '</b>' });
      }
      L.push({ t: t(isZ(D) ? T.dZero : T.dNon) });
      $('mxDetR').innerHTML = 'det A = ' + qh(D);
      $('mxDetS').innerHTML = stepsHTML(L);
    } catch (e) { $('mxDetR').innerHTML = '—'; $('mxDetS').innerHTML = '<li><p>' + t(T.big) + '</p></li>'; }
  }

  /* -------------------------------------------------------- inverse */
  function paintInv() {
    var n = S.n, M = read('a', n, n), L = [];
    if (!M) { $('mxInvR').innerHTML = '—'; $('mxInvS').innerHTML = '<li><p>' + t(T.need) + '</p></li>'; return; }
    try {
      var I = idM(n), Aug = M.map(function (r, i) { return r.concat(I[i]); });
      L.push({ t: t(T.iStart), m: mh(Aug, { bar: n }) });
      var res = gaussJordan(Aug, n, L, n);
      var bad = res.pivots.indexOf(-1);
      if (bad >= 0 || res.pivots.length < n) {
        L.push({ t: f(T.iSing, { c: A.kh(String((bad >= 0 ? bad : res.pivots.length) + 1)) }) });
        $('mxInvR').innerHTML = t(T.noInv);
      } else {
        var Inv = res.M.map(function (r) { return r.slice(n); });
        L.push({ t: t(T.iDone), m: 'A⁻¹ = ' + mh(Inv) });
        if (n === 2) {
          var D = det(M);
          L.push({ t: f(T.q2, { d: qh(D) }), m: '<span class="mx-row">A⁻¹ = <span class="es-fr"><span>' + A.kh('1') + '</span><span>' + qh(D) + '</span></span>' +
            mh([[M[1][1], neg(M[0][1])], [neg(M[1][0]), M[0][0]]]) + '</span>' });
        }
        L.push({ t: t(T.iCheck) });
        $('mxInvR').innerHTML = '<span class="mx-res">A⁻¹ = ' + mh(Inv) + '</span>';
      }
      $('mxInvS').innerHTML = stepsHTML(L);
    } catch (e) { $('mxInvR').innerHTML = '—'; $('mxInvS').innerHTML = '<li><p>' + t(T.big) + '</p></li>'; }
  }

  /* ------------------------------------------------------- multiply */
  function paintMul() {
    var a = read('ma', S.mr, S.mk), b = read('mb', S.mk, S.mc), L = [];
    if (!a || !b) { $('mxMulR').innerHTML = '—'; $('mxMulS').innerHTML = '<li><p>' + t(T.need) + '</p></li>'; return; }
    try {
      var C = [], lines = [];
      for (var i = 0; i < S.mr; i++) {
        C.push([]);
        for (var j = 0; j < S.mc; j++) {
          var s = ZERO, prod = [];
          for (var k = 0; k < S.mk; k++) { s = add(s, mul(a[i][k], b[k][j])); prod.push(qp(a[i][k]) + '×' + qp(b[k][j])); }
          C[i].push(s);
          lines.push('c<sub>' + A.kh(String(i + 1)) + A.kh(String(j + 1)) + '</sub> = ' + prod.join(' + ') + ' = <b>' + qh(s) + '</b>');
        }
      }
      var sz = function (r, c) { return A.kh(r + '×' + c); };
      L.push({ t: f(T.mSize, { a: sz(S.mr, S.mk), b: sz(S.mk, S.mc), c: sz(S.mr, S.mc) }), m: '<span class="mx-row">' + mh(a) + ' × ' + mh(b) + '</span>' });
      L.push({ t: lines.join('<br>') });
      L.push({ t: t(T.mOrder) });
      $('mxMulR').innerHTML = '<span class="mx-res">AB = ' + mh(C) + '</span>';
      $('mxMulS').innerHTML = stepsHTML(L);
    } catch (e) { $('mxMulR').innerHTML = '—'; $('mxMulS').innerHTML = '<li><p>' + t(T.big) + '</p></li>'; }
  }

  /* --------------------------------------------------------- systems */
  function eqHTML(row, n) {
    var h = '', first = true;
    for (var j = 0; j < n; j++) {
      var c = row[j];
      if (isZ(c)) { continue; }
      var k = c.n < 0 ? neg(c) : c;
      h += (first ? (c.n < 0 ? '−' : '') : (c.n < 0 ? ' − ' : ' + ')) + (isOne(k) ? '' : qh(k)) + '<i>' + VARS[j] + '</i>';
      first = false;
    }
    return (first ? A.kh('0') : h) + ' = ' + qh(row[n]);
  }
  function paintSys() {
    var n = S.sn, M = read('s', n, n + 1), L = [];
    if (!M) { $('mxSysR').innerHTML = '—'; $('mxSysS').innerHTML = '<li><p>' + t(T.need) + '</p></li>'; return; }
    try {
      var orig = copyM(M);
      L.push({ t: t(T.sStart) + '<br>' + M.map(function (r) { return eqHTML(r, n); }).join('<br>'), m: mh(M, { bar: n }) });
      var res = gaussJordan(M, n, L, n), E = res.M;
      /* inconsistent? a row of zeros on the left with a non-zero right */
      for (var i = 0; i < n; i++) {
        var allZ = true;
        for (var j = 0; j < n; j++) { if (!isZ(E[i][j])) { allZ = false; } }
        if (allZ && !isZ(E[i][n])) {
          L.push({ t: f(T.sNone, { r: R(i), k: qh(E[i][n]) }) });
          $('mxSysR').innerHTML = t(T.noSol);
          $('mxSysS').innerHTML = stepsHTML(L);
          return;
        }
      }
      var pivCols = [];
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) { if (!isZ(E[i][j])) { pivCols.push(j); break; } }
      }
      if (pivCols.length === n) {
        var sol = E.map(function (r) { return r[n]; }), out = VARS.slice(0, n).map(function (v, k) { return '<i>' + v + '</i> = ' + qh(sol[k]); });
        L.push({ t: t(T.sUnique) + '<br>' + out.join(', &nbsp;') });
        var lhs = ZERO, parts = [];
        for (j = 0; j < n; j++) { lhs = add(lhs, mul(orig[0][j], sol[j])); parts.push(qp(orig[0][j]) + '×' + qp(sol[j])); }
        L.push({ t: f(T.sCheck, { l: parts.join(' + ') + ' = ' + qh(lhs), r: qh(orig[0][n]) }) });
        $('mxSysR').innerHTML = out.join(', &nbsp;');
      } else {
        var free = VARS.slice(0, n).filter(function (_, k) { return pivCols.indexOf(k) < 0; });
        var rows = [];
        for (i = 0; i < pivCols.length; i++) {
          var pc = pivCols[i], h = qh(E[i][n]), only = isZ(E[i][n]);
          for (j = 0; j < n; j++) {
            if (j === pc || isZ(E[i][j]) || pivCols.indexOf(j) >= 0) { continue; }
            var c = neg(E[i][j]), k = c.n < 0 ? neg(c) : c;
            h = (only ? (c.n < 0 ? '−' : '') : h + (c.n < 0 ? ' − ' : ' + ')) + (isOne(k) ? '' : qh(k)) + '<i>' + VARS[j] + '</i>';
            only = false;
          }
          rows.push('<i>' + VARS[pc] + '</i> = ' + h);
        }
        free.forEach(function (v) { rows.push('<i>' + v + '</i> = <i>' + v + '</i>'); });
        L.push({ t: f(T.sMany, { f: free.map(function (v) { return '<i>' + v + '</i>'; }).join(', ') }) + '<br>' + rows.join('<br>') });
        $('mxSysR').innerHTML = t(T.many);
      }
      $('mxSysS').innerHTML = stepsHTML(L);
    } catch (e) { $('mxSysR').innerHTML = '—'; $('mxSysS').innerHTML = '<li><p>' + t(T.big) + '</p></li>'; }
  }

  /* --------------------------------------------------------- examples */
  var EX = {
    a3: [[['2', '1', '3'], ['0', '-1', '4'], ['1', '2', '5']], [['1', '2', '3'], ['0', '1', '4'], ['5', '6', '0']], [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']]],
    a2: [[['4', '7'], ['2', '6']], [['3', '-2'], ['5', '1']], [['2', '4'], ['1', '2']]],
    s3: [[['2', '1', '-1', '8'], ['-3', '-1', '2', '-11'], ['-2', '1', '2', '-3']], [['1', '1', '1', '6'], ['0', '2', '5', '-4'], ['2', '5', '-1', '27']], [['1', '2', '-1', '3'], ['2', '4', '-2', '6'], ['1', '-1', '1', '2']]],
    s2: [[['2', '3', '13'], ['1', '-1', '-1']], [['3', '2', '12'], ['1', '4', '14']], [['1', '2', '4'], ['2', '4', '5']]]
  };
  function rand() { return String(Math.floor(Math.random() * 11) - 5); }
  function fill(key, r, c) { S[key] = []; for (var i = 0; i < r; i++) { S[key].push([]); for (var j = 0; j < c; j++) { S[key][i].push(rand()); } } }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || !root.contains(b)) { return; }
    var v;
    if ((v = b.getAttribute('data-t'))) { S.tab = v; build(); }
    else if ((v = b.getAttribute('data-n'))) { S.n = +v; S.a = copyM(EX['a' + S.n][0]); build(); }
    else if ((v = b.getAttribute('data-sn'))) { S.sn = +v; S.s = copyM(EX['s' + S.sn][0]); build(); }
    else if ((v = b.getAttribute('data-ex'))) {
      var p = v.split(':');
      if (p[0] === 'a') { S.a = copyM(EX['a' + S.n][+p[1]]); } else { S.s = copyM(EX['s' + S.sn][+p[1]]); }
      build();
    }
    else if ((v = b.getAttribute('data-rand'))) {
      if (v === 'a') { fill('a', S.n, S.n); }
      else if (v === 's') { fill('s', S.sn, S.sn + 1); }
      else { fill('ma', S.mr, S.mk); fill('mb', S.mk, S.mc); }
      build();
    }
    else if (b.hasAttribute('data-clear')) {
      v = b.getAttribute('data-clear');
      if (v === 'a') { S.a = []; } else if (v === 's') { S.s = []; } else { S.ma = []; S.mb = []; }
      build();
    }
    save();
  });
  root.addEventListener('change', function (e) {
    var el = e.target, k = el.getAttribute('data-size');
    if (!k) { return; }
    S[k] = +el.value;
    build(); save();
  });

  /* ------------------------------------------------------------ paint */
  function build() {
    root.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === S.tab)); });
    root.querySelectorAll('[data-n]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-n') === S.n)); });
    root.querySelectorAll('[data-sn]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-sn') === S.sn)); });
    ['mr', 'mk', 'mc'].forEach(function (k) { root.querySelectorAll('[data-size="' + k + '"]').forEach(function (s) { s.value = String(S[k]); }); });
    $('mxPaneA').hidden = !(S.tab === 'det' || S.tab === 'inv');
    $('mxPaneM').hidden = S.tab !== 'mul';
    $('mxPaneS').hidden = S.tab !== 'sys';
    [['det', 'Det'], ['inv', 'Inv'], ['mul', 'Mul'], ['sys', 'Sys']].forEach(function (p) {
      $('mxOut' + p[1]).hidden = S.tab !== p[0];
      $('mx' + p[1] + 'S').hidden = S.tab !== p[0];
    });
    $('mxExA').innerHTML = EX['a' + S.n].map(function (M, i) {
      return '<button type="button" data-ex="a:' + i + '">' + A.esc(t(T.ex)) + ' ' + A.kh(String(i + 1)) + '</button>';
    }).join('');
    $('mxExS').innerHTML = EX['s' + S.sn].map(function (M, i) {
      return '<button type="button" data-ex="s:' + i + '">' + A.esc(t(T.ex)) + ' ' + A.kh(String(i + 1)) + '</button>';
    }).join('');
    grid('mxGridA', 'a', S.n, S.n);
    grid('mxGridMA', 'ma', S.mr, S.mk, { name: 'A' });
    grid('mxGridMB', 'mb', S.mk, S.mc, { name: 'B' });
    grid('mxGridS', 's', S.sn, S.sn + 1, { sys: true });
    ['a', 'ma', 'mb', 's'].forEach(markBad);
    paint();
  }
  function paint() {
    if (S.tab === 'det') { paintDet(); }
    else if (S.tab === 'inv') { paintInv(); }
    else if (S.tab === 'mul') { paintMul(); }
    else { paintSys(); }
  }

  document.addEventListener('aa:langchange', build);
  build();
})();
