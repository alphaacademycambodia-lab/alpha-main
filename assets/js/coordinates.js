/* Alpha Academy Cambodia — Coordinates & Straight Lines
   ---------------------------------------------------------------------------
   LINE — y = mx + c drawn on a −10…10 grid, with the y-intercept, the
   x-intercept, a gradient triangle and a table of values.
   TWO POINTS — drag A and B: the gradient (as a fraction), the midpoint,
   the length of AB and the equation of the line through them.
   BATTLESHIPS — four ships are hidden on the −5…5 grid; fire by typing the
   coordinates, so the game is practice in reading (x, y) the right way round.
   Uses tools-core.js. Nothing is sent or stored.                          */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('coRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh, F = function (n) { return A.fmt(Math.round(n * 1e6) / 1e6); };

  var T = {
    grad: { en: 'Gradient m = {m}: for every 1 across, the line goes {d} {a}.', km: 'មេគុណប្រាប់ទិស m = {m}៖ ទៅស្ដាំ ១ បន្ទាត់{d} {a}។' },
    up: { en: 'up', km: 'ឡើង' }, down: { en: 'down', km: 'ចុះ' },
    flat: { en: 'Gradient 0: the line is horizontal.', km: 'មេគុណប្រាប់ទិស ០៖ បន្ទាត់ដេក។' },
    yint: { en: 'y-intercept c = {c}: the line crosses the y-axis at (0, {c}).', km: 'ចំណុចប្រសព្វអ័ក្ស y គឺ c = {c}៖ បន្ទាត់កាត់អ័ក្ស y ត្រង់ (០, {c})។' },
    xint: { en: 'x-intercept: put y = 0, so x = −c ÷ m = {x}. It crosses the x-axis at ({x}, 0).', km: 'ចំណុចប្រសព្វអ័ក្ស x៖ ដាក់ y = ០ ដូច្នេះ x = −c ÷ m = {x}។ វាកាត់អ័ក្ស x ត្រង់ ({x}, ០)។' },
    par: { en: 'Any line y = {m}x + … is parallel to this one — same gradient.', km: 'បន្ទាត់ y = {m}x + … ណាក៏ស្របនឹងបន្ទាត់នេះ — មេគុណប្រាប់ទិសដូចគ្នា។' },
    gW: { en: 'Gradient = (y₂ − y₁) ÷ (x₂ − x₁) = ({b} − {a}) ÷ ({d} − {c}) = {r}', km: 'មេគុណប្រាប់ទិស = (y₂ − y₁) ÷ (x₂ − x₁) = ({b} − {a}) ÷ ({d} − {c}) = {r}' },
    vert: { en: 'x₂ − x₁ = 0, so the line is vertical: x = {x}. Its gradient is undefined.', km: 'x₂ − x₁ = ០ ដូច្នេះបន្ទាត់ឈរ៖ x = {x}។ មេគុណប្រាប់ទិសមិនកំណត់។' },
    mW: { en: 'Midpoint = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2) = ({x}, {y})', km: 'ចំណុចកណ្ដាល = ((x₁ + x₂) ÷ ២, (y₁ + y₂) ÷ ២) = ({x}, {y})' },
    dW: { en: 'Length AB = √(Δx² + Δy²) = √({p} + {q}) = {r}', km: 'ប្រវែង AB = √(Δx² + Δy²) = √({p} + {q}) = {r}' },
    eW: { en: 'Equation: c = y₁ − m·x₁ = {c}, so y = {e}', km: 'សមីការ៖ c = y₁ − m·x₁ = {c} ដូច្នេះ y = {e}' },
    hit: { en: 'Hit at ({x}, {y})!', km: 'ត្រូវគោលដៅ ({x}, {y})!' },
    sunk: { en: 'Hit — and that ship is sunk!', km: 'ត្រូវ — ហើយនាវានោះលិចហើយ!' },
    miss: { en: 'Miss at ({x}, {y}).', km: 'ខុសគោលដៅ ({x}, {y})។' },
    again: { en: 'You already fired at ({x}, {y}).', km: 'អ្នកបានបាញ់ ({x}, {y}) រួចហើយ។' },
    out: { en: 'Choose x and y from −5 to 5.', km: 'សូមជ្រើស x និង y ពី −៥ ដល់ ៥។' },
    won: { en: 'All ships sunk in {n} shots!', km: 'នាវាទាំងអស់លិចក្នុងការបាញ់ {n} ដង!' },
    stat: { en: 'Shots: {s} · Hits: {h} · Ships left: {l}', km: 'ការបាញ់៖ {s} · ត្រូវ៖ {h} · នាវានៅសល់៖ {l}' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }
  function frac(p, q) {           /* p/q as a simplified fraction string */
    if (q < 0) { p = -p; q = -q; }
    var g = A.gcd(Math.round(p), Math.round(q)) || 1; p /= g; q /= g;
    return q === 1 ? F(p) : (p < 0 ? '−' : '') + kh(Math.abs(p)) + '/' + kh(q);
  }

  /* --------------------------------------------------------- the grid */
  function grid(lo, hi, px) {
    var N = hi - lo, W = N * px + 40, o = function (v) { return 20 + (v - lo) * px; }, s = '';
    for (var i = lo; i <= hi; i++) {
      var cls = i === 0 ? 'co-axis' : 'co-g';
      s += '<line x1="' + o(i) + '" y1="20" x2="' + o(i) + '" y2="' + (W - 20) + '" class="' + cls + '"/><line x1="20" y1="' + o(i) + '" x2="' + (W - 20) + '" y2="' + o(i) + '" class="' + cls + '"/>';
      if (i !== 0 && (N <= 12 || i % 2 === 0)) {
        s += '<text x="' + o(i) + '" y="' + (o(0) + 15) + '" class="co-n">' + F(i) + '</text><text x="' + (o(0) - 7) + '" y="' + (o(-i) + 4) + '" class="co-n" text-anchor="end">' + F(i) + '</text>';
      }
    }
    s += '<text x="' + (W - 14) + '" y="' + (o(0) - 6) + '" class="co-xl">x</text><text x="' + (o(0) + 8) + '" y="16" class="co-xl">y</text>';
    return { s: s, W: W, X: function (v) { return o(v); }, Y: function (v) { return o(-v); } };
  }

  /* ============================================================= LINE */
  var mIn = $('coM'), cIn = $('coC');
  function paintLine() {
    var m = A.parse(mIn.value), c = A.parse(cIn.value);
    if (m == null || isNaN(m)) { m = 0; } if (c == null || isNaN(c)) { c = 0; }
    var G = grid(-10, 10, 20), s = G.s;
    var x1 = -10, x2 = 10;
    s += '<line x1="' + G.X(x1) + '" y1="' + G.Y(m * x1 + c) + '" x2="' + G.X(x2) + '" y2="' + G.Y(m * x2 + c) + '" class="co-line"/>';
    /* gradient triangle from the y-intercept, run 1 (or the denominator if m is a simple fraction) */
    var run = 1; for (var d = 1; d <= 6; d++) { if (Math.abs(m * d - Math.round(m * d)) < 1e-9) { run = d; break; } }
    if (Math.abs(m * run) <= 9 && m !== 0) {
      s += '<path d="M' + G.X(0) + ' ' + G.Y(c) + 'H' + G.X(run) + 'V' + G.Y(c + m * run) + '" class="co-tri"/>' +
        '<text x="' + G.X(run / 2) + '" y="' + (G.Y(c) + (m > 0 ? 16 : -8)) + '" class="co-tl">' + kh(run) + '</text>' +
        '<text x="' + (G.X(run) + 6) + '" y="' + G.Y(c + m * run / 2) + '" class="co-tl" text-anchor="start">' + F(m * run) + '</text>';
    }
    if (Math.abs(c) <= 10) { s += '<circle cx="' + G.X(0) + '" cy="' + G.Y(c) + '" r="6" class="co-pt co-pa"/>'; }
    if (m !== 0 && Math.abs(-c / m) <= 10) { s += '<circle cx="' + G.X(-c / m) + '" cy="' + G.Y(0) + '" r="6" class="co-pt co-pb"/>'; }
    $('coLsvg').innerHTML = '<svg viewBox="0 0 ' + G.W + ' ' + G.W + '" class="co-svg" role="img" aria-label="Graph">' + s + '</svg>';
    var sign = c < 0 ? ' − ' + F(-c) : c > 0 ? ' + ' + F(c) : '';
    $('coLeq').textContent = 'y = ' + (m === 0 ? (c ? F(c) : kh(0)) : (m === 1 ? '' : m === -1 ? '−' : F(m)) + 'x' + sign);
    var L = [m === 0 ? t(T.flat) : f(T.grad, { m: F(m), d: t(m > 0 ? T.up : T.down), a: F(Math.abs(m)) }), f(T.yint, { c: F(c) })];
    if (m !== 0) { L.push(f(T.xint, { x: F(-c / m) })); L.push(f(T.par, { m: F(m) })); }
    $('coLsteps').innerHTML = L.map(function (x) { return '<li>' + A.esc(x) + '</li>'; }).join('');
    var xs = [-2, -1, 0, 1, 2, 3];
    $('coLtab').innerHTML = '<tbody><tr><th>x</th>' + xs.map(function (x) { return '<td>' + F(x) + '</td>'; }).join('') + '</tr><tr><th>y</th>' + xs.map(function (x) { return '<td>' + F(m * x + c) + '</td>'; }).join('') + '</tr></tbody>';
    A.writeHash({ tab: tab === 'line' ? '' : tab, m: mIn.value, c: cIn.value });
  }
  mIn.addEventListener('input', paintLine); cIn.addEventListener('input', paintLine);
  $('coLex').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } var p = b.getAttribute('data-x').split('|'); mIn.value = p[0]; cIn.value = p[1]; paintLine(); });

  /* ======================================================= TWO POINTS */
  var PT = { a: [-3, -2], b: [4, 3] }, dragging = null, pSvg = $('coPsvg');
  function paintPts() {
    var G = grid(-10, 10, 20), s = G.s, a = PT.a, b = PT.b;
    s += '<line x1="' + G.X(a[0]) + '" y1="' + G.Y(a[1]) + '" x2="' + G.X(b[0]) + '" y2="' + G.Y(b[1]) + '" class="co-line"/>';
    s += '<path d="M' + G.X(a[0]) + ' ' + G.Y(a[1]) + 'H' + G.X(b[0]) + 'V' + G.Y(b[1]) + '" class="co-tri"/>';
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    s += '<circle cx="' + G.X(mx) + '" cy="' + G.Y(my) + '" r="5" class="co-mid"/>';
    [['a', 'A'], ['b', 'B']].forEach(function (k) {
      var p = PT[k[0]];
      s += '<g data-p="' + k[0] + '" class="co-drag"><circle cx="' + G.X(p[0]) + '" cy="' + G.Y(p[1]) + '" r="14" class="co-hit"/><circle cx="' + G.X(p[0]) + '" cy="' + G.Y(p[1]) + '" r="7" class="co-pt ' + (k[0] === 'a' ? 'co-pa' : 'co-pb') + '"/>' +
        '<text x="' + (G.X(p[0]) + 10) + '" y="' + (G.Y(p[1]) - 10) + '" class="co-pl">' + k[1] + '(' + F(p[0]) + ', ' + F(p[1]) + ')</text></g>';
    });
    pSvg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.W);
    pSvg.innerHTML = s;
    var dx = b[0] - a[0], dy = b[1] - a[1], L = [];
    if (dx === 0) { L.push(f(T.vert, { x: F(a[0]) })); $('coPg').textContent = '—'; }
    else {
      var g = frac(dy, dx);
      var P2 = function (v) { return v < 0 ? '(' + F(v) + ')' : F(v); };
      L.push(f(T.gW, { a: P2(a[1]), b: F(b[1]), c: P2(a[0]), d: F(b[0]), r: g }));
      $('coPg').textContent = g;
    }
    L.push(f(T.mW, { x: F(mx), y: F(my) }));
    var d2 = dx * dx + dy * dy, r = Math.sqrt(d2), rs = Math.abs(r - Math.round(r)) < 1e-9 ? F(r) : '√' + kh(d2) + ' ≈ ' + F(Math.round(r * 100) / 100);
    L.push(f(T.dW, { p: F(dx * dx), q: F(dy * dy), r: rs }));
    if (dx !== 0) {
      /* c = y1 − (dy/dx)·x1 = (y1·dx − dy·x1)/dx */
      var cn = a[1] * dx - dy * a[0], cs = frac(cn, dx), ms = frac(dy, dx), mv = dy / dx, cv = cn / dx;
      var e = (mv === 0 ? '' : (mv === 1 ? '' : mv === -1 ? '−' : (ms.indexOf('/') >= 0 ? '(' + ms + ')' : ms)) + 'x') + (cv === 0 ? (mv === 0 ? kh(0) : '') : (mv === 0 ? cs : (cv < 0 ? ' − ' + frac(-cn, dx) : ' + ' + cs)));
      L.push(f(T.eW, { c: cs, e: e }));
    }
    $('coPm').textContent = '(' + F(mx) + ', ' + F(my) + ')';
    $('coPsteps').innerHTML = L.map(function (x) { return '<li>' + A.esc(x) + '</li>'; }).join('');
  }
  function toGrid(e) {
    var r = pSvg.getBoundingClientRect(), W = 440, x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * W;
    return [Math.max(-10, Math.min(10, Math.round((x - 20) / 20 - 10))), Math.max(-10, Math.min(10, Math.round(10 - (y - 20) / 20)))];
  }
  pSvg.addEventListener('pointerdown', function (e) {
    var g = e.target.closest('[data-p]'), p = toGrid(e);
    if (!g) { var da = Math.hypot(p[0] - PT.a[0], p[1] - PT.a[1]), db = Math.hypot(p[0] - PT.b[0], p[1] - PT.b[1]); dragging = da <= db ? 'a' : 'b'; }
    else { dragging = g.getAttribute('data-p'); }
    pSvg.setPointerCapture(e.pointerId); PT[dragging] = p; paintPts();
  });
  pSvg.addEventListener('pointermove', function (e) { if (!dragging) { return; } e.preventDefault(); var p = toGrid(e); if (p[0] !== PT[dragging][0] || p[1] !== PT[dragging][1]) { PT[dragging] = p; paintPts(); } });
  pSvg.addEventListener('pointerup', function () { dragging = null; });

  /* ======================================================= BATTLESHIPS */
  var B = null, bSvg = $('coBsvg');
  function newGame() {
    var ships = [], taken = {}, lens = [4, 3, 2, 2];
    lens.forEach(function (len) {
      for (var tries = 0; tries < 500; tries++) {
        var hz = Math.random() < 0.5, x = -5 + Math.floor(Math.random() * (11 - (hz ? len - 1 : 0))), y = -5 + Math.floor(Math.random() * (11 - (hz ? 0 : len - 1)));
        var cells = []; for (var i = 0; i < len; i++) { cells.push(hz ? [x + i, y] : [x, y + i]); }
        if (cells.every(function (c) { for (var dx = -1; dx <= 1; dx++) { for (var dy = -1; dy <= 1; dy++) { if (taken[(c[0] + dx) + ',' + (c[1] + dy)]) { return false; } } } return true; })) {
          cells.forEach(function (c) { taken[c[0] + ',' + c[1]] = ships.length + 1; }); ships.push({ cells: cells, hits: 0 }); break;
        }
      }
    });
    B = { ships: ships, at: taken, shots: {}, n: 0, hits: 0, show: false, over: false };
    $('coBmsg').textContent = ''; $('coBmsg').className = 'tt-fb'; paintB();
  }
  function paintB() {
    var G = grid(-5, 5, 38), s = G.s;
    Object.keys(B.shots).forEach(function (k) {
      var p = k.split(',').map(Number), hit = B.shots[k] === 'h';
      s += hit ? '<circle cx="' + G.X(p[0]) + '" cy="' + G.Y(p[1]) + '" r="12" class="co-hitm"/><path d="M' + (G.X(p[0]) - 7) + ' ' + (G.Y(p[1]) - 7) + 'l14 14m0 -14l-14 14" class="co-x"/>'
        : '<circle cx="' + G.X(p[0]) + '" cy="' + G.Y(p[1]) + '" r="6" class="co-missm"/>';
    });
    if (B.show || B.over) {
      B.ships.forEach(function (sh) {
        var a = sh.cells[0], b = sh.cells[sh.cells.length - 1];
        s += '<line x1="' + G.X(a[0]) + '" y1="' + G.Y(a[1]) + '" x2="' + G.X(b[0]) + '" y2="' + G.Y(b[1]) + '" class="co-ship"/>';
      });
    }
    bSvg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.W);
    bSvg.innerHTML = s;
    $('coBstat').textContent = f(T.stat, { s: kh(B.n), h: kh(B.hits), l: kh(B.ships.filter(function (x) { return x.hits < x.cells.length; }).length) });
  }
  function fire() {
    if (!B || B.over) { return; }
    var x = A.parse($('coBx').value), y = A.parse($('coBy').value), msg = $('coBmsg');
    if (x == null || y == null || isNaN(x) || isNaN(y) || Math.abs(x) > 5 || Math.abs(y) > 5 || x !== Math.round(x) || y !== Math.round(y)) { msg.textContent = t(T.out); msg.className = 'tt-fb no'; return; }
    var k = x + ',' + y;
    if (B.shots[k]) { msg.textContent = f(T.again, { x: F(x), y: F(y) }); msg.className = 'tt-fb'; return; }
    B.n++;
    var sid = B.at[k];
    if (sid) {
      B.shots[k] = 'h'; B.hits++; var sh = B.ships[sid - 1]; sh.hits++;
      msg.textContent = sh.hits === sh.cells.length ? t(T.sunk) : f(T.hit, { x: F(x), y: F(y) }); msg.className = 'tt-fb ok';
      if (B.ships.every(function (q) { return q.hits === q.cells.length; })) { B.over = true; msg.textContent = f(T.won, { n: kh(B.n) }); }
    } else { B.shots[k] = 'm'; msg.textContent = f(T.miss, { x: F(x), y: F(y) }); msg.className = 'tt-fb no'; }
    paintB(); $('coBx').select();
  }
  bSvg.addEventListener('click', function (e) {
    var r = bSvg.getBoundingClientRect(), W = 10 * 38 + 40, x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * W;
    $('coBx').value = Math.max(-5, Math.min(5, Math.round((x - 20) / 38 - 5)));
    $('coBy').value = Math.max(-5, Math.min(5, Math.round(5 - (y - 20) / 38)));
    $('coBgo').focus();
  });
  $('coBgo').addEventListener('click', fire);
  [$('coBx'), $('coBy')].forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fire(); } }); });
  $('coBnew').addEventListener('click', newGame);
  $('coBshow').addEventListener('click', function () { B.show = !B.show; paintB(); });

  /* ------------------------------------------------------------ tabs */
  var H = A.readHash(), tab = ['line', 'points', 'ships'].indexOf(H.tab) >= 0 ? H.tab : 'line';
  if (H.m != null) { mIn.value = H.m; } if (H.c != null) { cIn.value = H.c; }
  function paintTabs() {
    $('coTabs').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === tab)); });
    $('coPaneL').hidden = tab !== 'line'; $('coPaneP').hidden = tab !== 'points'; $('coPaneB').hidden = tab !== 'ships';
  }
  $('coTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } tab = b.getAttribute('data-t'); paintTabs(); paintLine(); });
  document.addEventListener('aa:langchange', function () { paintLine(); paintPts(); paintB(); });
  paintTabs(); paintLine(); paintPts(); newGame();
})();
