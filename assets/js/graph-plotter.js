/* Alpha Academy Cambodia — Graph Plotter
   ---------------------------------------------------------------------------
   Plot up to four functions of x, pan and zoom, trace a value, and have the
   roots, turning points, the y-intercept and the intersections found and
   listed for you. Uses tools-core.js; no other dependency, no network,
   nothing stored.

   FIVE THINGS DECIDE HOW THIS IS BUILT.

   1. THERE IS NO eval(). The formula is tokenised and parsed by a small
      recursive-descent parser into a tree of closures, the same approach as
      the scientific calculator. A pasted link can therefore never run code,
      and a typing mistake can be named ("missing bracket") instead of
      blanking the graph.

   2. IT READS WHAT A STUDENT WRITES. 2x, 3(x+1), (x−1)(x+2), x², sin x,
      √x, |x−2|, ln x, e^x, π and "y =" or "f(x) =" in front are all
      understood. Implicit multiplication binds the way the textbook does:
      2x² is 2·x², −x² is −(x²), and sin 2x is sin(2x). Trigonometry is in
      radians, because that is what a graph of sin x is drawn in.

   3. THE SCALE IS EQUAL ON BOTH AXES. A circle should look round and a
      slope of 1 should look like 45°. Zoom keeps the point under the finger
      or the mouse where it is.

   4. ASYMPTOTES ARE NOT JOINED. 1/x and tan x are sampled per pixel, and a
      jump of more than a screen between neighbouring samples breaks the
      line rather than drawing a vertical stroke through the gap. The same
      check stops a sign change across an asymptote being reported as a root:
      a candidate root is only listed if the function is actually near zero
      there.

   5. THE POINTS ARE FOUND IN WHAT YOU CAN SEE. Roots, extrema and
      intersections are searched across the visible window and refined by
      bisection / golden-section search, then rounded for display. Pan or
      zoom and the list follows. That keeps the search honest — a periodic
      function has infinitely many roots, and listing "all" of them is not
      a thing a page can do.

   State lives in the address bar: #f=x^2-4|sin(x)&v=0,0,40               */
(function () {
  'use strict';

  var A = window.AATool;

  /* ====================================================== the expression */
  var FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    cot: function (v) { return 1 / Math.tan(v); },
    sec: function (v) { return 1 / Math.cos(v); },
    csc: function (v) { return 1 / Math.sin(v); },
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
    ln: Math.log, log: Math.log10, exp: Math.exp,
    floor: Math.floor, ceil: Math.ceil, sign: Math.sign
  };
  var FNAMES = Object.keys(FUNCS).sort(function (a, b) { return b.length - a.length; });

  function ParseError(en, km) { this.msg = { en: en, km: km }; }

  function tokenize(src) {
    var s = A.unKh(src).toLowerCase()
      .replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/')
      .replace(/π/g, 'pi').replace(/\s+/g, ' ').trim();
    s = s.replace(/^(y|f\s*\(\s*x\s*\))\s*=/, '').trim();
    var out = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if (c === ' ') { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)))) {
        out.push({ k: 'num', v: parseFloat(m[1]) }); i += m[1].length; continue;
      }
      if (c === '²' || c === '³') { out.push({ k: 'op', v: '^' }, { k: 'num', v: c === '²' ? 2 : 3 }); i++; continue; }
      if (c === '√') { out.push({ k: 'fn', v: 'sqrt' }); i++; continue; }
      if ('+-*/^(),'.indexOf(c) > -1) { out.push({ k: c === '(' || c === ')' ? c : 'op', v: c }); i++; continue; }
      if (c === '[' || c === '{') { out.push({ k: '(', v: '(' }); i++; continue; }
      if (c === ']' || c === '}') { out.push({ k: ')', v: ')' }); i++; continue; }
      if (c === '|') { out.push({ k: '|', v: '|' }); i++; continue; }
      var rest = s.slice(i), hit = null;
      for (var f = 0; f < FNAMES.length; f++) {
        if (rest.indexOf(FNAMES[f]) === 0) { hit = FNAMES[f]; break; }
      }
      if (hit) { out.push({ k: 'fn', v: hit }); i += hit.length; continue; }
      if (rest.indexOf('pi') === 0) { out.push({ k: 'num', v: Math.PI }); i += 2; continue; }
      if (c === 'e') { out.push({ k: 'num', v: Math.E }); i++; continue; }
      if (c === 'x') { out.push({ k: 'x' }); i++; continue; }
      throw new ParseError('“' + c + '” is not something this can read.', 'មិនស្គាល់ “' + c + '” ទេ។');
    }
    return out;
  }

  /* Grammar, loosest first:
       sum     := term (('+'|'-') term)*
       term    := unary (('*'|'/') unary | <implicit> unary)*
       unary   := ('-'|'+') unary | power
       power   := atom ('^' unary)?           right-associative, so 2^3^2 = 2^9
       atom    := number | x | '(' sum ')' | '|' sum '|' | fn arg
     A function written without brackets takes the next implicit product of
     atoms, so "sin 2x" is sin(2x) and "sin x + 1" is sin(x) + 1. */
  function compile(src) {
    var tk = tokenize(src), p = 0, absDepth = 0;
    if (!tk.length) { throw new ParseError('Type a formula in x.', 'សូមវាយរូបមន្តជាមួយ x។'); }
    function peek() { return tk[p]; }
    function startsAtom(t) {
      return t && (t.k === 'num' || t.k === 'x' || t.k === '(' || t.k === 'fn' || (t.k === '|' && absDepth === 0));
    }
    function sum() {
      var a = term();
      while (peek() && peek().k === 'op' && (peek().v === '+' || peek().v === '-')) {
        var o = tk[p++].v;
        a = o === '+' ? add(a, term()) : sub(a, term());
      }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        var t = peek();
        if (t && t.k === 'op' && (t.v === '*' || t.v === '/')) {
          p++;
          var b = unary(), l = a;
          a = t.v === '*' ? mul(l, b) : (function (l, b) { return function (x) { return l(x) / b(x); }; })(l, b);
        } else if (startsAtom(t)) {
          a = mul(a, power());
        } else { break; }
      }
      return a;
    }
    /* Each operator gets its own function scope, so a closure built in a
       loop keeps its own operands instead of sharing the loop's variables. */
    function mul(l, b) { return function (x) { return l(x) * b(x); }; }
    function add(l, b) { return function (x) { return l(x) + b(x); }; }
    function sub(l, b) { return function (x) { return l(x) - b(x); }; }
    function unary() {
      var t = peek();
      if (t && t.k === 'op' && (t.v === '-' || t.v === '+')) {
        p++;
        var u = unary();
        return t.v === '-' ? function (x) { return -u(x); } : u;
      }
      return power();
    }
    function power() {
      var b = atom();
      if (peek() && peek().k === 'op' && peek().v === '^') {
        p++;
        var e = unary();
        return function (x) { return pow(b(x), e(x)); };
      }
      return b;
    }
    function atom() {
      var t = tk[p++];
      if (!t) { throw new ParseError('The formula stops too early.', 'រូបមន្តខ្វះផ្នែកខាងចុង។'); }
      if (t.k === 'num') { var v = t.v; return function () { return v; }; }
      if (t.k === 'x') { return function (x) { return x; }; }
      if (t.k === '(') {
        var inner = sum();
        if (!peek() || peek().k !== ')') { throw new ParseError('A bracket is not closed.', 'វង់ក្រចកមិនទាន់បិទ។'); }
        p++;
        return inner;
      }
      if (t.k === '|') {
        absDepth++;
        var a = sum();
        absDepth--;
        if (!peek() || peek().k !== '|') { throw new ParseError('An absolute-value bar | is not closed.', 'សញ្ញាតម្លៃដាច់ខាត | មិនទាន់បិទ។'); }
        p++;
        return function (x) { return Math.abs(a(x)); };
      }
      if (t.k === 'fn') {
        var f = FUNCS[t.v], arg;
        if (peek() && peek().k === '(') {
          /* only the bracket, so sin(x)^2 is (sin x)², as printed */
          arg = atom();
        } else {
          if (!startsAtom(peek())) { throw new ParseError(t.v + ' needs something to act on.', t.v + ' ត្រូវការតម្លៃមួយ។'); }
          arg = atomPow();
          while (startsAtom(peek()) && peek().k !== 'fn') { arg = mul(arg, atomPow()); }
        }
        return function (x) { return f(arg(x)); };
      }
      throw new ParseError('Something is missing near “' + (t.v || t.k) + '”.', 'ខ្វះអ្វីមួយនៅជិត “' + (t.v || t.k) + '”។');
    }
    function atomPow() { return power(); }

    var fn = sum();
    if (p < tk.length) {
      var bad = tk[p];
      if (bad.k === ')') { throw new ParseError('There is an extra closing bracket.', 'មានវង់ក្រចកបិទលើស។'); }
      throw new ParseError('Something is wrong near “' + (bad.v || bad.k) + '”.', 'មានកំហុសនៅជិត “' + (bad.v || bad.k) + '”។');
    }
    return fn;
  }

  /* A negative base with a fractional exponent: Math.pow gives NaN, but a
     student expects x^(1/3) to be defined for negative x. Odd-denominator
     fractions are handled as real roots. */
  function pow(b, e) {
    if (b < 0 && Math.round(e) !== e) {
      for (var q = 3; q <= 15; q += 2) {
        var pn = Math.round(e * q);
        if (Math.abs(e * q - pn) < 1e-9) {
          var r = Math.pow(-b, Math.abs(pn) / q);
          r = (pn % 2 !== 0) ? -r : r;
          return pn < 0 ? 1 / r : r;
        }
      }
    }
    return Math.pow(b, e);
  }

  window.AAGraph = { compile: compile };

  var root = document.getElementById('gpRoot');
  if (!root) { return; }

  /* ================================================================ text */
  var T = {
    add:      { en: '+ Add a function', km: '+ បន្ថែមអនុគមន៍' },
    hide:     { en: 'Hide this graph', km: 'លាក់ក្រាបនេះ' },
    show:     { en: 'Show this graph', km: 'បង្ហាញក្រាបនេះ' },
    remove:   { en: 'Remove', km: 'លុប' },
    ph:       { en: 'e.g. x^2 - 4', km: 'ឧ. x^2 - 4' },
    root:     { en: 'Root', km: 'ឫស' },
    min:      { en: 'Minimum', km: 'អប្បបរមា' },
    max:      { en: 'Maximum', km: 'អតិបរមា' },
    yint:     { en: 'y-intercept', km: 'ចំណុចប្រសព្វអ័ក្ស y' },
    inter:    { en: 'Intersection', km: 'ចំណុចប្រសព្វ' },
    none:     { en: 'No roots, turning points or intersections in this window. Pan or zoom out to look further.',
                km: 'គ្មានឫស ចំណុចបត់ ឬចំណុចប្រសព្វ ក្នុងផ្ទាំងនេះទេ។ អូស ឬពង្រីកចេញ ដើម្បីមើលបន្ថែម។' },
    empty:    { en: 'Type a function to see its graph.', km: 'វាយអនុគមន៍ ដើម្បីមើលក្រាបរបស់វា។' },
    trace:    { en: 'Move over the graph — or touch and drag — to read values.',
                km: 'ដាក់កណ្ដុរលើក្រាប — ឬប៉ះហើយអូស — ដើម្បីអានតម្លៃ។' },
    undef:    { en: 'undefined', km: 'មិនកំណត់' },
    many:     { en: 'Showing the first {n}. Zoom in to see the rest.', km: 'បង្ហាញ {n} ដំបូង។ ពង្រីកចូល ដើម្បីមើលផ្សេងទៀត។' },
    tapPt:    { en: 'Tap a point to centre the graph on it.', km: 'ចុចលើចំណុចមួយ ដើម្បីដាក់វានៅកណ្ដាលក្រាប។' },
    and:      { en: ' and ', km: ' និង ' }
  };

  var COLORS = {
    light: ['#1273e6', '#e0442f', '#16a34a', '#9333ea'],
    dark:  ['#5aa7ff', '#ff7b68', '#4ade80', '#c49bff']
  };
  var MAXF = 4;

  /* ============================================================== state */
  var S = {
    fs: [{ src: 'x^2 - 4', on: true }, { src: 'sin(x)', on: true }],
    cx: 0, cy: 0, scale: 40      /* scale = pixels per unit */
  };

  function $(id) { return document.getElementById(id); }
  var el = {
    list: $('gpList'), add: $('gpAdd'), canvas: $('gpCanvas'), wrap: $('gpCanvasWrap'),
    zin: $('gpZin'), zout: $('gpZout'), home: $('gpHome'), readout: $('gpReadout'),
    pts: $('gpPts'), ptsHint: $('gpPtsHint'), ex: $('gpEx')
  };
  var ctx = el.canvas.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  var compiled = [];      /* per row: function or null */
  var errors = [];        /* per row: message or null */
  var trace = null;       /* { px } while tracing */
  var points = [];

  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function colour(i) { return COLORS[theme()][i % 4]; }
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  /* ========================================================= the inputs */
  function drawList() {
    el.list.innerHTML = '';
    S.fs.forEach(function (f, i) {
      var row = document.createElement('div');
      row.className = 'gp-row' + (f.on ? '' : ' is-off');
      row.setAttribute('data-i', i);
      row.innerHTML =
        '<button type="button" class="gp-sw" data-act="toggle" aria-pressed="' + f.on + '" style="--c:' + colour(i) + '"' +
        ' aria-label="' + A.esc(A.t(f.on ? T.hide : T.show)) + '" title="' + A.esc(A.t(f.on ? T.hide : T.show)) + '">' +
        '<span>f<sub>' + A.kh(i + 1) + '</sub></span></button>' +
        '<div class="gp-in"><span class="gp-y" aria-hidden="true">y =</span>' +
        '<input type="text" spellcheck="false" autocapitalize="off" autocomplete="off" inputmode="text"' +
        ' aria-label="f' + (i + 1) + '(x)" placeholder="' + A.esc(A.t(T.ph)) + '" value="' + A.esc(f.src) + '"></div>' +
        (S.fs.length > 1 ? '<button type="button" class="gp-x" data-act="remove" aria-label="' + A.esc(A.t(T.remove)) + '" title="' + A.esc(A.t(T.remove)) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' : '') +
        '<p class="gp-err" role="alert"></p>';
      el.list.appendChild(row);
    });
    el.add.textContent = A.t(T.add);
    el.add.hidden = S.fs.length >= MAXF;
    showErrors();
  }

  function recompile() {
    compiled = []; errors = [];
    S.fs.forEach(function (f) {
      if (!f.src.trim()) { compiled.push(null); errors.push(null); return; }
      try { compiled.push(compile(f.src)); errors.push(null); }
      catch (e) { compiled.push(null); errors.push(e.msg || { en: 'Cannot read this formula.', km: 'មិនអាចអានរូបមន្តនេះបានទេ។' }); }
    });
  }

  function showErrors() {
    Array.prototype.forEach.call(el.list.querySelectorAll('.gp-row'), function (row) {
      var i = +row.getAttribute('data-i');
      var p = row.querySelector('.gp-err');
      p.textContent = errors[i] ? A.t(errors[i]) : '';
      row.classList.toggle('has-err', !!errors[i]);
    });
  }

  /* ============================================================ drawing */
  function resize() {
    var r = el.wrap.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 3);
    W = Math.max(200, Math.round(r.width));
    H = Math.max(240, Math.round(r.height));
    el.canvas.width = W * DPR; el.canvas.height = H * DPR;
    el.canvas.style.width = W + 'px'; el.canvas.style.height = H + 'px';
    draw();
  }

  function toPx(x) { return W / 2 + (x - S.cx) * S.scale; }
  function toPy(y) { return H / 2 - (y - S.cy) * S.scale; }
  function fromPx(px) { return S.cx + (px - W / 2) / S.scale; }
  function fromPy(py) { return S.cy - (py - H / 2) / S.scale; }

  function niceStep(target) {
    var p = Math.pow(10, Math.floor(Math.log10(target)));
    var m = target / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }

  function label(v, step) {
    var d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    var s = Math.abs(v) < step / 1e6 ? '0' : v.toFixed(Math.min(d, 10));
    if (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-4 && v !== 0)) { s = v.toExponential(1); }
    s = s.replace('-', '−');
    if (A.lang() === 'km') { s = A.khDigits(s.replace('.', ',')); }
    return s;
  }

  function draw() {
    if (!W) { return; }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var bg = cssVar('--surface') || '#fff';
    var grid = cssVar('--ink-100') || '#eef2f7';
    var axis = cssVar('--ink-500') || '#5b6b85';
    var text = cssVar('--ink-500') || '#5b6b85';
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    var step = niceStep(80 / S.scale);
    var x0 = fromPx(0), x1 = fromPx(W), y0 = fromPy(H), y1 = fromPy(0);

    /* minor grid */
    ctx.lineWidth = 1;
    ctx.strokeStyle = grid;
    ctx.globalAlpha = .55;
    var minor = step / 5;
    if (minor * S.scale >= 8) {
      ctx.beginPath();
      for (var gx = Math.ceil(x0 / minor) * minor; gx <= x1; gx += minor) { var px = Math.round(toPx(gx)) + .5; ctx.moveTo(px, 0); ctx.lineTo(px, H); }
      for (var gy = Math.ceil(y0 / minor) * minor; gy <= y1; gy += minor) { var py = Math.round(toPy(gy)) + .5; ctx.moveTo(0, py); ctx.lineTo(W, py); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    /* major grid */
    ctx.beginPath();
    for (gx = Math.ceil(x0 / step) * step; gx <= x1; gx += step) { px = Math.round(toPx(gx)) + .5; ctx.moveTo(px, 0); ctx.lineTo(px, H); }
    for (gy = Math.ceil(y0 / step) * step; gy <= y1; gy += step) { py = Math.round(toPy(gy)) + .5; ctx.moveTo(0, py); ctx.lineTo(W, py); }
    ctx.strokeStyle = grid; ctx.stroke();

    /* axes */
    var ax = Math.round(toPx(0)) + .5, ay = Math.round(toPy(0)) + .5;
    ctx.beginPath();
    ctx.strokeStyle = axis; ctx.lineWidth = 1.5;
    if (ay > 0 && ay < H) { ctx.moveTo(0, ay); ctx.lineTo(W, ay); }
    if (ax > 0 && ax < W) { ctx.moveTo(ax, 0); ctx.lineTo(ax, H); }
    ctx.stroke();

    /* labels — pinned to the edge when the axis is off screen */
    ctx.fillStyle = text;
    ctx.font = '600 11px Inter, "Kantumruy Pro", sans-serif';
    var ly = Math.min(Math.max(ay + 4, 4), H - 16);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (gx = Math.ceil(x0 / step) * step; gx <= x1; gx += step) {
      if (Math.abs(gx) < step / 2) { continue; }
      ctx.fillText(label(gx, step), toPx(gx), ly);
    }
    var lx = Math.min(Math.max(ax - 6, 30), W - 4);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (gy = Math.ceil(y0 / step) * step; gy <= y1; gy += step) {
      if (Math.abs(gy) < step / 2) { continue; }
      ctx.fillText(label(gy, step), lx, toPy(gy));
    }
    if (ax > 0 && ax < W && ay > 0 && ay < H) { ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText(A.kh('0'), ax - 5, ay + 4); }

    /* curves */
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    compiled.forEach(function (f, i) {
      if (!f || !S.fs[i].on) { return; }
      plot(f, colour(i));
    });

    /* found points */
    points.forEach(function (pt) {
      if (pt.x < x0 || pt.x > x1 || pt.y < y0 || pt.y > y1) { return; }
      ctx.beginPath();
      ctx.arc(toPx(pt.x), toPy(pt.y), pt.hot ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = bg; ctx.fill();
      ctx.lineWidth = 2.2; ctx.strokeStyle = pt.c; ctx.stroke();
    });

    /* trace */
    if (trace) {
      var tx = fromPx(trace.px);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = axis; ctx.lineWidth = 1;
      ctx.moveTo(Math.round(trace.px) + .5, 0); ctx.lineTo(Math.round(trace.px) + .5, H);
      ctx.stroke();
      ctx.setLineDash([]);
      compiled.forEach(function (f, i) {
        if (!f || !S.fs[i].on) { return; }
        var y = f(tx);
        if (!isFinite(y)) { return; }
        var py = toPy(y);
        if (py < -10 || py > H + 10) { return; }
        ctx.beginPath(); ctx.arc(trace.px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = colour(i); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = bg; ctx.stroke();
      });
    }
  }

  function plot(f, c) {
    ctx.beginPath();
    ctx.strokeStyle = c; ctx.lineWidth = 2.6;
    var pen = false, lastPy = 0, n = W * 2;
    for (var k = 0; k <= n; k++) {
      var px = k / 2, y = f(fromPx(px));
      if (!isFinite(y)) { pen = false; continue; }
      var py = toPy(y);
      if (pen && Math.abs(py - lastPy) > H * 1.5) {
        /* a jump across the whole screen is an asymptote, not a line */
        pen = false;
      }
      var cy = Math.max(-H, Math.min(2 * H, py));
      if (!pen) { ctx.moveTo(px, cy); pen = true; } else { ctx.lineTo(px, cy); }
      lastPy = py;
    }
    ctx.stroke();
  }

  /* ===================================================== finding points */
  function bisect(f, a, b, fa) {
    for (var i = 0; i < 80; i++) {
      var m = (a + b) / 2, fm = f(m);
      if (!isFinite(fm)) { return null; }
      if (fm === 0) { return m; }
      if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else { b = m; }
      if (b - a < 1e-13 * Math.max(1, Math.abs(m))) { break; }
    }
    return (a + b) / 2;
  }
  function golden(f, a, b, sign) {
    var g = (Math.sqrt(5) - 1) / 2;
    var c = b - g * (b - a), d = a + g * (b - a);
    for (var i = 0; i < 80; i++) {
      if (sign * f(c) > sign * f(d)) { b = d; } else { a = c; }
      c = b - g * (b - a); d = a + g * (b - a);
      if (Math.abs(b - a) < 1e-11) { break; }
    }
    return (a + b) / 2;
  }
  function snap(v, tol) {
    var r = Math.round(v);
    if (Math.abs(v - r) < tol) { return r; }
    var r2 = Math.round(v * 1e6) / 1e6;
    return Math.abs(v - r2) < tol ? r2 : v;
  }

  function findPoints() {
    points = [];
    var x0 = fromPx(0), x1 = fromPx(W), y0 = fromPy(H), y1 = fromPy(0);
    var N = Math.max(400, Math.round(W * 1.5)), dx = (x1 - x0) / N;
    var tolY = 1e-6 * Math.max(1, 1 / S.scale) + 1e-9;
    var snapTol = 1e-7;

    function addPt(kind, x, y, c, label) {
      x = snap(x, snapTol); y = snap(y, snapTol);
      for (var i = 0; i < points.length; i++) {
        var q = points[i];
        if (q.kind === kind && q.label === label && Math.abs(q.x - x) < dx * 1.5) { return; }
      }
      points.push({ kind: kind, x: x, y: y, c: c, label: label });
    }

    var live = [];
    compiled.forEach(function (f, i) { if (f && S.fs[i].on) { live.push({ f: f, i: i }); } });

    live.forEach(function (o) {
      var f = o.f, c = colour(o.i), nm = 'f' + (o.i + 1);
      var xs = [], ys = [];
      for (var k = 0; k <= N; k++) { var x = x0 + k * dx; xs.push(x); ys.push(f(x)); }

      /* y-intercept */
      var fy = f(0);
      if (isFinite(fy) && x0 <= 0 && x1 >= 0) { addPt('yint', 0, fy, c, nm); }

      for (k = 0; k < N; k++) {
        var a = ys[k], b = ys[k + 1];
        if (!isFinite(a) || !isFinite(b)) { continue; }
        /* roots: a sign change that is really a zero, not an asymptote */
        if (a === 0) { addPt('root', xs[k], 0, c, nm); }
        else if ((a < 0) !== (b < 0) && b !== 0) {
          var r = bisect(f, xs[k], xs[k + 1], a);
          if (r !== null && Math.abs(f(r)) < Math.max(tolY, 1e-7 * (Math.abs(a) + Math.abs(b)))) { addPt('root', r, 0, c, nm); }
        }
        /* extrema: the slope changes sign over three samples */
        if (k > 0 && isFinite(ys[k - 1])) {
          var l = ys[k - 1], mdl = a, rgt = b;
          var isMax = mdl > l && mdl >= rgt, isMin = mdl < l && mdl <= rgt;
          if ((isMax || isMin) && !(mdl === l && mdl === rgt)) {
            var xe = golden(f, xs[k - 1], xs[k + 1], isMax ? 1 : -1), ye = f(xe);
            /* a turning point whose value runs off to infinity is an asymptote spike */
            if (isFinite(ye) && Math.abs(ye) < 1e12 && Math.abs(ye - mdl) < Math.abs(rgt - l) + 1e-9 + Math.abs(mdl) * 1e-6) {
              /* touching root (x² at 0) — the sign-change test cannot see it */
              if (Math.abs(ye) < tolY) { addPt('root', xe, 0, c, nm); }
              addPt(isMax ? 'max' : 'min', xe, ye, c, nm);
            }
          }
        }
      }
    });

    /* intersections, every pair */
    for (var p1 = 0; p1 < live.length; p1++) {
      for (var p2 = p1 + 1; p2 < live.length; p2++) {
        (function (F, G) {
          var h = function (x) { return F.f(x) - G.f(x); };
          var nm = 'f' + (F.i + 1) + ' ∩ f' + (G.i + 1);
          var prev = h(x0), px = x0;
          for (var k = 1; k <= N; k++) {
            var x = x0 + k * dx, v = h(x);
            if (isFinite(prev) && isFinite(v)) {
              if (prev === 0) { addPt('inter', px, F.f(px), cssVar('--ink-800') || '#16233a', nm); }
              else if ((prev < 0) !== (v < 0) && v !== 0) {
                var r = bisect(h, px, x, prev);
                if (r !== null && Math.abs(h(r)) < Math.max(tolY, 1e-7 * (Math.abs(prev) + Math.abs(v)))) {
                  var yy = F.f(r);
                  if (isFinite(yy)) { addPt('inter', r, yy, cssVar('--ink-800') || '#16233a', nm); }
                }
              }
            }
            prev = v; px = x;
          }
        })(live[p1], live[p2]);
      }
    }
    points = points.filter(function (pt) { return pt.y >= y0 - 1e-9 && pt.y <= y1 + 1e-9; });
    var order = { yint: 0, root: 1, min: 2, max: 3, inter: 4 };
    points.sort(function (a, b) { return a.label < b.label ? -1 : a.label > b.label ? 1 : (order[a.kind] - order[b.kind]) || (a.x - b.x); });
  }

  var LIMIT = 24;
  function drawPoints() {
    el.pts.innerHTML = '';
    var any = compiled.some(function (f, i) { return f && S.fs[i].on; });
    if (!any) { el.ptsHint.textContent = A.t(T.empty); return; }
    if (!points.length) { el.ptsHint.textContent = A.t(T.none); return; }
    el.ptsHint.textContent = points.length > LIMIT ? A.t(T.many).replace('{n}', A.kh(LIMIT)) : A.t(T.tapPt);
    points.slice(0, LIMIT).forEach(function (pt, idx) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-k', idx);
      b.style.setProperty('--c', pt.c);
      var name = { root: T.root, min: T.min, max: T.max, yint: T.yint, inter: T.inter }[pt.kind];
      b.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="nm">' + A.esc(A.t(name)) +
        ' <small>' + A.esc(A.kh(pt.label).replace(/f(\S)/g, 'f$1')) + '</small></span>' +
        '<span class="vl">(' + A.fmt(pt.x, { sig: 6 }) + ' ; ' + A.fmt(pt.y, { sig: 6 }) + ')</span>';
      li.appendChild(b);
      el.pts.appendChild(li);
    });
  }

  function drawReadout() {
    if (!trace) { el.readout.innerHTML = '<span class="gp-hint">' + A.esc(A.t(T.trace)) + '</span>'; return; }
    var x = fromPx(trace.px);
    var html = '<span class="gp-rx">x = <b>' + A.fmt(x, { sig: 5 }) + '</b></span>';
    compiled.forEach(function (f, i) {
      if (!f || !S.fs[i].on) { return; }
      var y = f(x);
      html += '<span class="gp-ry" style="--c:' + colour(i) + '">f<sub>' + A.kh(i + 1) + '</sub> = <b>' +
        (isFinite(y) ? A.fmt(y, { sig: 5 }) : A.esc(A.t(T.undef))) + '</b></span>';
    });
    el.readout.innerHTML = html;
  }

  var pending = false;
  function refresh(full) {
    if (full) { findPoints(); drawPoints(); }
    draw();
    drawReadout();
  }
  /* Searching for points is the expensive part, so during a drag it waits
     until the movement stops. */
  var settle = null;
  function refreshSoon() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(function () { pending = false; draw(); drawReadout(); });
    }
    clearTimeout(settle);
    settle = setTimeout(function () { findPoints(); drawPoints(); draw(); saveHash(); }, 160);
  }

  /* ============================================================ the view */
  function zoomAt(factor, px, py) {
    var x = fromPx(px), y = fromPy(py);
    S.scale = Math.max(0.002, Math.min(1e6, S.scale * factor));
    S.cx = x - (px - W / 2) / S.scale;
    S.cy = y + (py - H / 2) / S.scale;
    refreshSoon();
  }

  var ptrs = {}, drag = null, pinch = null;
  el.canvas.addEventListener('pointerdown', function (e) {
    el.canvas.setPointerCapture(e.pointerId);
    ptrs[e.pointerId] = { x: e.offsetX, y: e.offsetY };
    var ids = Object.keys(ptrs);
    if (ids.length === 1) {
      drag = { x: e.offsetX, y: e.offsetY, cx: S.cx, cy: S.cy, moved: false, touch: e.pointerType !== 'mouse' };
      if (drag.touch) { trace = { px: e.offsetX }; refresh(false); }
    } else if (ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), scale: S.scale };
      drag = null; trace = null;
    }
  });
  el.canvas.addEventListener('pointermove', function (e) {
    if (ptrs[e.pointerId]) { ptrs[e.pointerId] = { x: e.offsetX, y: e.offsetY }; }
    var ids = Object.keys(ptrs);
    if (pinch && ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0) { zoomAt((pinch.scale * d / pinch.d) / S.scale, (a.x + b.x) / 2, (a.y + b.y) / 2); }
      return;
    }
    if (drag && !drag.touch) {
      var dx = e.offsetX - drag.x, dy = e.offsetY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) { drag.moved = true; }
      if (drag.moved) {
        S.cx = drag.cx - dx / S.scale; S.cy = drag.cy + dy / S.scale;
        trace = null; el.canvas.classList.add('is-drag');
        refreshSoon(); return;
      }
    }
    if (drag && drag.touch) {
      /* one finger traces; two fingers pan and zoom */
      trace = { px: e.offsetX }; refresh(false); return;
    }
    if (e.pointerType === 'mouse') { trace = { px: e.offsetX }; refresh(false); }
  });
  function endPtr(e) {
    delete ptrs[e.pointerId];
    if (Object.keys(ptrs).length < 2) { pinch = null; }
    if (!Object.keys(ptrs).length) { drag = null; el.canvas.classList.remove('is-drag'); }
  }
  el.canvas.addEventListener('pointerup', endPtr);
  el.canvas.addEventListener('pointercancel', endPtr);
  el.canvas.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse' && !drag) { trace = null; refresh(false); }
  });
  el.canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoomAt(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018)), e.offsetX, e.offsetY);
  }, { passive: false });

  /* keyboard: arrows pan, + and − zoom */
  el.canvas.addEventListener('keydown', function (e) {
    var step = 40 / S.scale, used = true;
    if (e.key === 'ArrowLeft') { S.cx -= step; }
    else if (e.key === 'ArrowRight') { S.cx += step; }
    else if (e.key === 'ArrowUp') { S.cy += step; }
    else if (e.key === 'ArrowDown') { S.cy -= step; }
    else if (e.key === '+' || e.key === '=') { zoomAt(1.25, W / 2, H / 2); return e.preventDefault(); }
    else if (e.key === '-' || e.key === '_') { zoomAt(0.8, W / 2, H / 2); return e.preventDefault(); }
    else { used = false; }
    if (used) { e.preventDefault(); refreshSoon(); }
  });

  el.zin.addEventListener('click', function () { zoomAt(1.5, W / 2, H / 2); });
  el.zout.addEventListener('click', function () { zoomAt(1 / 1.5, W / 2, H / 2); });
  el.home.addEventListener('click', function () { S.cx = 0; S.cy = 0; S.scale = defaultScale(); refreshSoon(); });

  function defaultScale() { return Math.max(18, Math.min(60, Math.round(Math.min(W || 600, H || 420) / 20))); }

  /* ========================================================= the inputs */
  el.list.addEventListener('input', function (e) {
    if (e.target.tagName !== 'INPUT') { return; }
    var i = +e.target.closest('.gp-row').getAttribute('data-i');
    S.fs[i].src = e.target.value;
    recompile(); showErrors(); refresh(true); saveHash();
  });
  el.list.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) { return; }
    var i = +b.closest('.gp-row').getAttribute('data-i');
    if (b.getAttribute('data-act') === 'toggle') { S.fs[i].on = !S.fs[i].on; }
    else { S.fs.splice(i, 1); }
    recompile(); drawList(); refresh(true); saveHash();
  });
  el.add.addEventListener('click', function () {
    if (S.fs.length >= MAXF) { return; }
    S.fs.push({ src: '', on: true });
    recompile(); drawList(); refresh(true);
    var ins = el.list.querySelectorAll('input');
    ins[ins.length - 1].focus();
  });
  el.ex.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-f]');
    if (!b) { return; }
    var src = b.getAttribute('data-f');
    /* fill the first empty row, otherwise replace the last one */
    var i = -1;
    for (var k = 0; k < S.fs.length; k++) { if (!S.fs[k].src.trim()) { i = k; break; } }
    if (i < 0) {
      if (S.fs.length < MAXF) { S.fs.push({ src: src, on: true }); }
      else { S.fs[MAXF - 1] = { src: src, on: true }; }
    } else { S.fs[i] = { src: src, on: true }; }
    recompile(); drawList(); refresh(true); saveHash();
  });
  el.pts.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]');
    if (!b) { return; }
    var pt = points[+b.getAttribute('data-k')];
    points.forEach(function (q) { q.hot = false; });
    pt.hot = true;
    S.cx = pt.x; S.cy = pt.y;
    draw(); saveHash();
    clearTimeout(settle);
    settle = setTimeout(function () { var keep = { x: pt.x, y: pt.y }; findPoints(); points.forEach(function (q) { q.hot = Math.abs(q.x - keep.x) < 1e-9 && Math.abs(q.y - keep.y) < 1e-9; }); drawPoints(); draw(); }, 50);
  });

  /* ========================================================= the address */
  function r6(v) { return String(Math.round(v * 1e6) / 1e6); }
  function saveHash() {
    A.writeHash({
      f: S.fs.map(function (f) { return (f.on ? '' : '!') + f.src; }).join('|'),
      v: [r6(S.cx), r6(S.cy), r6(S.scale)].join(',')
    });
  }
  function loadHash() {
    var q = A.readHash();
    if (q.f != null) {
      var fs = q.f.split('|').slice(0, MAXF).map(function (s) {
        return s.charAt(0) === '!' ? { src: s.slice(1), on: false } : { src: s, on: true };
      });
      if (fs.length) { S.fs = fs; }
    }
    if (q.v) {
      var v = q.v.split(',').map(parseFloat);
      if (v.length === 3 && v.every(isFinite) && v[2] > 0) { S.cx = v[0]; S.cy = v[1]; S.scale = v[2]; return true; }
    }
    return false;
  }

  /* ================================================================ go */
  var hadView = loadHash();
  recompile();
  drawList();
  if (window.ResizeObserver) {
    new ResizeObserver(function () { resize(); findPoints(); drawPoints(); draw(); }).observe(el.wrap);
  } else {
    window.addEventListener('resize', function () { resize(); findPoints(); drawPoints(); draw(); });
  }
  resize();
  if (!hadView) { S.scale = defaultScale(); }
  refresh(true);

  document.addEventListener('aa:langchange', function () { drawList(); refresh(true); });
  document.addEventListener('aa:themechange', function () { drawList(); refresh(true); });
  new MutationObserver(function () { drawList(); refresh(true); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
