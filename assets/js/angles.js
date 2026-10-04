/* Alpha Academy Cambodia — Angles Lab
   ---------------------------------------------------------------------------
   MEASURE — drag one arm of an angle; the size, its type (acute, right,
   obtuse, straight, reflex) and an on-screen protractor that can be shown
   or hidden. "Estimate" hides the size and asks for a guess; "Draw" asks
   for a target angle to be dragged out.
   RULES — the angle facts used in Stage 7: on a straight line, around a
   point, in a triangle, vertically opposite, and the three parallel-line
   pairs. Move the sliders and the other angles follow, with the reason.
   PRACTISE — find the missing angle and say why.
   Uses tools-core.js. Nothing is sent or stored.                          */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('anRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh;
  var D = function (v) { return kh(Math.round(v)) + '°'; };

  var T = {
    acute: { en: 'Acute — less than 90°', km: 'មុំស្រួច — តូចជាង ៩០°' },
    right: { en: 'Right angle — exactly 90°', km: 'មុំកែង — ស្មើ ៩០° ពិតប្រាកដ' },
    obtuse: { en: 'Obtuse — between 90° and 180°', km: 'មុំទាល — ចន្លោះ ៩០° និង ១៨០°' },
    straight: { en: 'Straight angle — exactly 180°', km: 'មុំរាប — ស្មើ ១៨០°' },
    reflex: { en: 'Reflex — between 180° and 360°', km: 'មុំចាំង — ចន្លោះ ១៨០° និង ៣៦០°' },
    zero: { en: 'Zero angle', km: 'មុំសូន្យ' },
    full: { en: 'Full turn — 360°', km: 'មួយជុំ — ៣៦០°' },
    est: { en: 'How big is this angle? Type your estimate.', km: 'តើមុំនេះធំប៉ុណ្ណា? វាយការប៉ាន់ស្មានរបស់អ្នក។' },
    estRes: { en: 'It is {a}. You were {d} out{w}.', km: 'វាគឺ {a}។ អ្នកខុស {d}{w}។' },
    estGood: { en: ' — excellent!', km: ' — ល្អណាស់!' },
    draw: { en: 'Drag the arm to make an angle of {a}, then press Check.', km: 'អូសដៃមុំឱ្យបាន {a} រួចចុចពិនិត្យ។' },
    drawRes: { en: 'You made {g}. The target was {a}{w}', km: 'អ្នកបង្កើតបាន {g}។ គោលដៅគឺ {a}{w}' },
    drawOk: { en: ' — spot on!', km: ' — ត្រូវល្មម!' },
    rLine: { en: 'Angles on a straight line add up to 180°.', km: 'មុំនៅលើបន្ទាត់ត្រង់ មានផលបូក ១៨០°។' },
    rPoint: { en: 'Angles around a point add up to 360°.', km: 'មុំជុំវិញចំណុចមួយ មានផលបូក ៣៦០°។' },
    rTri: { en: 'Angles in a triangle add up to 180°.', km: 'មុំក្នុងត្រីកោណ មានផលបូក ១៨០°។' },
    rVert: { en: 'Vertically opposite angles are equal.', km: 'មុំទល់កំពូលស្មើគ្នា។' },
    rCorr: { en: 'Corresponding angles are equal (F shape).', km: 'មុំត្រូវគ្នាស្មើគ្នា (រាងអក្សរ F)។' },
    rAlt: { en: 'Alternate angles are equal (Z shape).', km: 'មុំឆ្លាស់ស្មើគ្នា (រាងអក្សរ Z)។' },
    rCo: { en: 'Co-interior angles add up to 180° (C shape).', km: 'មុំក្នុងម្ខាងមានផលបូក ១៨០° (រាងអក្សរ C)។' },
    rIso: { en: 'The base angles of an isosceles triangle are equal.', km: 'មុំបាតនៃត្រីកោណសមបាតស្មើគ្នា។' },
    eq: { en: '{l} = {r}', km: '{l} = {r}' },
    q: { en: 'Find the angle marked x.', km: 'រកមុំដែលមានសញ្ញា x។' },
    right2: { en: 'Correct! x = {a}', km: 'ត្រូវហើយ! x = {a}' },
    wrong: { en: 'Not quite — x = {a}', km: 'មិនទាន់ត្រូវ — x = {a}' },
    why: { en: 'Reason: {r}', km: 'ហេតុផល៖ {r}' },
    score: { en: '{r} correct out of {n}', km: 'ត្រូវ {r} ក្នុងចំណោម {n}' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }
  function type(a) {
    a = Math.round(a);
    return a === 0 ? T.zero : a < 90 ? T.acute : a === 90 ? T.right : a < 180 ? T.obtuse : a === 180 ? T.straight : a < 360 ? T.reflex : T.full;
  }

  /* --------------------------------------------------------- drawing */
  function P(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; }
  function arc(cx, cy, r, d1, d2, cls) {
    var span = ((d2 - d1) % 360 + 360) % 360;
    if (span < 0.5) { return ''; }
    if (Math.abs(span - 90) < 0.5) {   /* right-angle box */
      var a = P(cx, cy, r * 0.55, d1), b = P(cx, cy, r * 0.55 * Math.SQRT2, d1 + 45), c = P(cx, cy, r * 0.55, d1 + 90);
      return '<path d="M' + a + 'L' + b + 'L' + c + '" class="an-box ' + (cls || '') + '"/>';
    }
    var s = P(cx, cy, r, d1), e = P(cx, cy, r, d1 + span);
    return '<path d="M' + cx + ' ' + cy + 'L' + s + 'A' + r + ' ' + r + ' 0 ' + (span > 180 ? 1 : 0) + ' 0 ' + e + 'Z" class="an-arc ' + (cls || '') + '"/>';
  }
  function lab(cx, cy, r, d1, d2, text, cls) {
    var span = ((d2 - d1) % 360 + 360) % 360, p = P(cx, cy, r, d1 + span / 2);
    return '<text x="' + p[0] + '" y="' + p[1] + '" class="an-lab ' + (cls || '') + '">' + text + '</text>';
  }
  function ray(cx, cy, r, d, cls) { var p = P(cx, cy, r, d); return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" class="an-ray ' + (cls || '') + '"/>'; }
  function svg(w, h, body, label) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="an-svg" role="img" aria-label="' + A.esc(label || '') + '">' + body + '</svg>'; }

  /* ============================================================ MEASURE */
  var M = { a: 50, prot: true, mode: 'free', target: 0, hidden: false };
  var ms = $('anM');
  function protractor(cx, cy, full) {
    var R = 150, s = '<g class="an-prot">', i;
    s += full ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="an-pbg"/>' :
      '<path d="M' + (cx - R) + ' ' + cy + 'A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy + 'Z" class="an-pbg"/>';
    var max = full ? 360 : 180;
    for (i = 0; i <= max; i++) {
      if (full && i === 360) { break; }
      var len = i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5, a = P(cx, cy, R, i), b = P(cx, cy, R - len, i);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="an-pt' + (i % 10 ? '' : ' an-pt10') + '"/>';
      if (i % (full ? 30 : 10) === 0) {
        var o = P(cx, cy, R - 26, i);
        s += '<text x="' + o[0] + '" y="' + o[1] + '" class="an-pn">' + kh(i) + '</text>';
        if (!full) { var n = P(cx, cy, R - 44, i); s += '<text x="' + n[0] + '" y="' + n[1] + '" class="an-pn an-pn2">' + kh(180 - i) + '</text>'; }
      }
    }
    return s + '</g>';
  }
  function paintM() {
    var cx = 200, cy = 200, a = M.a, s = '';
    if (M.prot) { s += protractor(cx, cy, a > 180); }
    s += arc(cx, cy, 46, 0, a, 'an-arcM');
    s += ray(cx, cy, 175, 0) + ray(cx, cy, 175, a, 'an-drag');
    var h = P(cx, cy, 175, a);
    s += '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="13" class="an-handle"/><circle cx="' + cx + '" cy="' + cy + '" r="4" class="an-o"/>';
    if (!M.hidden) { s += lab(cx, cy, 70, 0, a, D(a)); }
    ms.setAttribute('viewBox', '0 0 400 400');
    ms.innerHTML = s;
    ms.setAttribute('aria-valuenow', Math.round(a));
    $('anMval').textContent = M.hidden ? '?' : D(a);
    $('anMtype').textContent = M.hidden ? '' : t(type(a));
    $('anProt').setAttribute('aria-pressed', String(M.prot));
  }
  (function () {
    var drag = false;
    function at(e) {
      var r = ms.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 400 - 200, y = (e.clientY - r.top) / r.height * 400 - 200;
      var d = Math.atan2(-y, x) * 180 / Math.PI; d = (d + 360) % 360;
      if (M.a > 300 && d < 60) { d = 360; } else if (M.a < 60 && d > 300) { d = 0; }
      M.a = Math.round(d); paintM();
    }
    ms.addEventListener('pointerdown', function (e) { if (M.mode === 'est') { return; } drag = true; ms.setPointerCapture(e.pointerId); at(e); });
    ms.addEventListener('pointermove', function (e) { if (drag) { e.preventDefault(); at(e); } });
    ms.addEventListener('pointerup', function () { drag = false; });
    ms.addEventListener('keydown', function (e) {
      var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
      if (!d || M.mode === 'est') { return; } e.preventDefault(); M.a = Math.max(0, Math.min(360, M.a + d)); paintM();
    });
  })();
  $('anProt').addEventListener('click', function () { M.prot = !M.prot; paintM(); });
  $('anPreset').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } M.a = +b.getAttribute('data-a'); M.mode = 'free'; M.hidden = false; $('anTask').hidden = true; paintM(); });
  $('anEst').addEventListener('click', function () {
    M.mode = 'est'; M.hidden = true; M.a = 10 + Math.floor(Math.random() * 340); M.prot = false;
    $('anTask').hidden = false; $('anTaskQ').textContent = t(T.est); $('anTaskIn').hidden = false; $('anTaskIn').value = ''; $('anTaskFb').textContent = ''; paintM(); $('anTaskIn').focus();
  });
  $('anDraw').addEventListener('click', function () {
    M.mode = 'draw'; M.hidden = true; M.prot = true; M.target = 5 * (2 + Math.floor(Math.random() * 68)); M.a = 0;
    $('anTask').hidden = false; $('anTaskQ').textContent = f(T.draw, { a: D(M.target) }); $('anTaskIn').hidden = true; $('anTaskFb').textContent = ''; paintM();
  });
  $('anTaskGo').addEventListener('click', function () {
    var fb = $('anTaskFb');
    if (M.mode === 'est') {
      var g = A.parse($('anTaskIn').value); if (g == null || isNaN(g)) { return; }
      var d = Math.abs(g - M.a); M.hidden = false; M.prot = true; paintM();
      fb.textContent = f(T.estRes, { a: D(M.a), d: D(d), w: d <= 10 ? t(T.estGood) : '' }); fb.className = 'tt-fb ' + (d <= 10 ? 'ok' : 'no');
    } else if (M.mode === 'draw') {
      var e = Math.abs(M.a - M.target); M.hidden = false; paintM();
      fb.textContent = f(T.drawRes, { g: D(M.a), a: D(M.target), w: e <= 2 ? t(T.drawOk) : '.' }); fb.className = 'tt-fb ' + (e <= 2 ? 'ok' : 'no');
    }
    M.mode = 'free';
  });
  $('anTaskIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('anTaskGo').click(); } });

  /* ============================================================ RULES */
  /* each figure: (values, labels) → svg; labels are the text for each angle */
  var FIG = {
    line: function (v, L) {
      var cx = 200, cy = 170, x = v[0];
      return svg(400, 230, '<line x1="20" y1="' + cy + '" x2="380" y2="' + cy + '" class="an-ray"/>' + ray(cx, cy, 150, x) +
        arc(cx, cy, 40, 0, x, 'c0') + arc(cx, cy, 56, x, 180, 'c1') + lab(cx, cy, 76, 0, x, L[0], 'c0') + lab(cx, cy, 90, x, 180, L[1], 'c1'));
    },
    point: function (v, L) {
      var cx = 200, cy = 150, a = v[0], b = v[1];
      return svg(400, 300, ray(cx, cy, 130, 0) + ray(cx, cy, 130, a) + ray(cx, cy, 130, a + b) +
        arc(cx, cy, 36, 0, a, 'c0') + arc(cx, cy, 48, a, a + b, 'c1') + arc(cx, cy, 60, a + b, 360, 'c2') +
        lab(cx, cy, 72, 0, a, L[0], 'c0') + lab(cx, cy, 82, a, a + b, L[1], 'c1') + lab(cx, cy, 92, a + b, 360, L[2], 'c2'));
    },
    tri: function (v, L) {
      var a = v[0] * Math.PI / 180, b = v[1] * Math.PI / 180, ac = Math.sin(b) / Math.sin(a + b);
      var P0 = [[0, 0], [1, 0], [ac * Math.cos(a), ac * Math.sin(a)]];
      var xs = P0.map(function (p) { return p[0]; }), ys = P0.map(function (p) { return p[1]; });
      var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs), maxy = Math.max.apply(null, ys);
      var sc = Math.min(320 / (maxx - minx), 200 / maxy), ox = 200 - (minx + maxx) / 2 * sc, oy = 240;
      var Q = P0.map(function (p) { return [ox + p[0] * sc, oy - p[1] * sc]; });
      var Ax = Q[0][0], Ay = Q[0][1], Bx = Q[1][0], Cx = Q[2][0], Cy = Q[2][1];
      var dCA = Math.atan2(Ay - Cy, Cx - Ax) * 180 / Math.PI, dCB = Math.atan2(Ay - Cy, Cx - Bx) * 180 / Math.PI;
      var dAC = (dCA + 180) % 360, dBC = (dCB + 180 + 360) % 360;
      return svg(400, 270, '<path d="M' + Ax + ' ' + Ay + 'L' + Bx + ' ' + Ay + 'L' + Cx + ' ' + Cy + 'Z" class="an-tri"/>' +
        arc(Ax, Ay, 30, 0, dCA, 'c0') + arc(Bx, Ay, 30, dCB, 180, 'c1') + arc(Cx, Cy, 26, dAC, dBC, 'c2') +
        lab(Ax, Ay, 52, 0, dCA, L[0], 'c0') + lab(Bx, Ay, 52, dCB, 180, L[1], 'c1') + lab(Cx, Cy, 46, dAC, dBC, L[2], 'c2'));
    },
    vert: function (v, L) {
      var cx = 200, cy = 135, x = v[0];
      return svg(400, 270, ray(cx, cy, 170, 0) + ray(cx, cy, 170, 180) + ray(cx, cy, 150, x) + ray(cx, cy, 150, x + 180) +
        arc(cx, cy, 36, 0, x, 'c0') + arc(cx, cy, 36, 180, 180 + x, 'c0') + arc(cx, cy, 48, x, 180, 'c1') + arc(cx, cy, 48, 180 + x, 360, 'c1') +
        lab(cx, cy, 68, 0, x, L[0], 'c0') + lab(cx, cy, 68, 180, 180 + x, L[2], 'c0') + lab(cx, cy, 78, x, 180, L[1], 'c1') + lab(cx, cy, 78, 180 + x, 360, L[3], 'c1'));
    },
    par: function (v, L, pair) {
      /* two parallel lines y=90 and y=200, transversal through (200,145) at angle x */
      var x = v[0], y1 = 90, y2 = 200, k = 1 / Math.tan(x * Math.PI / 180);
      var p1 = [200 + (145 - y1) * k, y1], p2 = [200 - (y2 - 145) * k, y2];
      var s = '<line x1="20" y1="' + y1 + '" x2="380" y2="' + y1 + '" class="an-ray"/><line x1="20" y1="' + y2 + '" x2="380" y2="' + y2 + '" class="an-ray"/>' +
        '<path d="M' + (360) + ' ' + (y1 - 6) + 'l10 6l-10 6M' + 360 + ' ' + (y2 - 6) + 'l10 6l-10 6" class="an-par"/>';
      var e1 = P(p1[0], p1[1], 70, x), e2 = P(p2[0], p2[1], 70, x + 180);
      s += '<line x1="' + e2[0] + '" y1="' + e2[1] + '" x2="' + e1[0] + '" y2="' + e1[1] + '" class="an-ray"/>';
      /* angles at each crossing: 0:(0..x) 1:(x..180) 2:(180..180+x) 3:(180+x..360) */
      var spans = [[0, x], [x, 180], [180, 180 + x], [180 + x, 360]];
      [[p1, 0], [p2, 4]].forEach(function (pp) {
        spans.forEach(function (sp, i) {
          var idx = pp[1] + i, on = pair.indexOf(idx) >= 0;
          if (on) { s += arc(pp[0][0], pp[0][1], 26, sp[0], sp[1], idx === pair[0] ? 'c0' : 'c1'); }
          if (L[idx]) { s += lab(pp[0][0], pp[0][1], 44, sp[0], sp[1], L[idx], on ? (idx === pair[0] ? 'c0' : 'c1') : 'an-dim'); }
        });
      });
      return svg(400, 290, s);
    }
  };
  var R = { rule: 'line', v: [62, 105], pairKind: 'corr' };
  var RULES = {
    line: { s: [['anS1', 10, 170]], fig: 'line', calc: function (v) { return { L: [D(v[0]), D(180 - v[0])], eq: [D(v[0]) + ' + ' + D(180 - v[0]) + ' = ' + D(180)], r: [T.rLine] }; } },
    point: { s: [['anS1', 20, 200], ['anS2', 20, 200]], fig: 'point', calc: function (v) { var c = 360 - v[0] - v[1]; return { L: [D(v[0]), D(v[1]), D(c)], eq: [D(v[0]) + ' + ' + D(v[1]) + ' + ' + D(c) + ' = ' + D(360)], r: [T.rPoint] }; } },
    tri: { s: [['anS1', 15, 120], ['anS2', 15, 120]], fig: 'tri', calc: function (v) { var c = 180 - v[0] - v[1]; return { L: [D(v[0]), D(v[1]), D(c)], eq: [D(v[0]) + ' + ' + D(v[1]) + ' + ' + D(c) + ' = ' + D(180)], r: [T.rTri] }; } },
    vert: { s: [['anS1', 15, 165]], fig: 'vert', calc: function (v) { var a = v[0], b = 180 - a; return { L: [D(a), D(b), D(a), D(b)], eq: [D(a) + ' = ' + D(a), D(a) + ' + ' + D(b) + ' = ' + D(180)], r: [T.rVert, T.rLine] }; } },
    par: { s: [['anS1', 25, 155]], fig: 'par', calc: function (v) {
      var a = v[0], b = 180 - a, L = [D(a), D(b), D(a), D(b), D(a), D(b), D(a), D(b)];
      var k = R.pairKind, r = k === 'corr' ? T.rCorr : k === 'alt' ? T.rAlt : T.rCo;
      var eq = k === 'co' ? [D(b) + ' + ' + D(a) + ' = ' + D(180)] : [D(a) + ' = ' + D(a)];
      return { L: L, eq: eq, r: [r] };
    } }
  };
  var PAIRS = { corr: [0, 4], alt: [2, 4], co: [3, 4] };
  function paintR() {
    var rule = RULES[R.rule];
    $('anRules').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-r') === R.rule)); });
    $('anPairs').hidden = R.rule !== 'par';
    $('anPairs').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-p') === R.pairKind)); });
    ['anS1', 'anS2'].forEach(function (id, i) {
      var cfg = rule.s[i], wrap = $(id + 'w');
      wrap.hidden = !cfg; if (!cfg) { return; }
      var el = $(id); el.min = cfg[1]; el.max = cfg[2];
      if (R.v[i] < cfg[1] || R.v[i] > cfg[2]) { R.v[i] = Math.round((cfg[1] + cfg[2]) / 2); }
      if (R.rule === 'point' && i === 1) { el.max = Math.min(cfg[2], 340 - R.v[0]); }
      if (R.rule === 'tri' && i === 1) { el.max = Math.min(cfg[2], 165 - R.v[0]); }
      R.v[i] = Math.min(+el.max, R.v[i]); el.value = R.v[i];
      $(id + 'v').textContent = D(R.v[i]);
    });
    var c = rule.calc(R.v), pair = PAIRS[R.pairKind];
    var labels = c.L.slice();
    if (R.rule === 'par') { labels = labels.map(function (x, i) { return pair.indexOf(i) >= 0 ? x : ''; }); }
    $('anFig').innerHTML = FIG[rule.fig](R.v, labels, pair);
    $('anFacts').innerHTML = c.eq.map(function (e, i) { return '<li><b>' + e + '</b><span>' + A.esc(t(c.r[i] || c.r[0])) + '</span></li>'; }).join('');
  }
  var DEF = { line: [62, 0], point: [100, 120], tri: [55, 70], vert: [62, 0], par: [62, 0] };
  $('anRules').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } R.rule = b.getAttribute('data-r'); R.v = DEF[R.rule].slice(); paintR(); });
  $('anPairs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } R.pairKind = b.getAttribute('data-p'); paintR(); });
  ['anS1', 'anS2'].forEach(function (id, i) { $(id).addEventListener('input', function () { R.v[i] = +$(id).value; paintR(); }); });

  /* ========================================================= PRACTISE */
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  var Q = null, score = { r: 0, n: 0 };
  function newQ() {
    var k = rnd(0, 7), q = {};
    if (k === 0) { var a = rnd(25, 155); q = { fig: 'line', v: [a], L: [D(a), 'x'], ans: 180 - a, r: T.rLine }; }
    else if (k === 1) { var p = rnd(40, 150), r2 = rnd(40, 300 - p); q = { fig: 'point', v: [p, r2], L: [D(p), D(r2), 'x'], ans: 360 - p - r2, r: T.rPoint }; }
    else if (k === 2) { var b1 = rnd(30, 90), b2 = rnd(25, 150 - b1); q = { fig: 'tri', v: [b1, b2], L: [D(b1), D(b2), 'x'], ans: 180 - b1 - b2, r: T.rTri }; }
    else if (k === 3) { var c = rnd(35, 145), opp = Math.random() < 0.5; q = { fig: 'vert', v: [c], L: [D(c), opp ? '' : 'x', opp ? 'x' : '', ''], ans: opp ? c : 180 - c, r: opp ? T.rVert : T.rLine }; }
    else if (k === 4 || k === 5 || k === 6) {
      var x = rnd(35, 145), kind = ['corr', 'alt', 'co'][k - 4], pr = PAIRS[kind], L = ['', '', '', '', '', '', '', ''];
      var vals = [x, 180 - x, x, 180 - x, x, 180 - x, x, 180 - x];
      L[pr[0]] = D(vals[pr[0]]); L[pr[1]] = 'x';
      q = { fig: 'par', v: [x], L: L, pair: pr, ans: vals[pr[1]], r: kind === 'corr' ? T.rCorr : kind === 'alt' ? T.rAlt : T.rCo };
    } else { var apex = 2 * rnd(10, 60), base = (180 - apex) / 2; q = { fig: 'tri', v: [base, base], L: ['x', 'x', D(apex)], ans: base, r: T.rTri }; }
    Q = q; Q.done = false;
    $('anQfig').innerHTML = FIG[q.fig](q.v, q.L, q.pair || []);
    $('anQtext').textContent = t(T.q);
    $('anQin').value = ''; $('anQfb').textContent = ''; $('anQfb').className = 'tt-fb'; $('anQwhy').textContent = '';
    $('anQnext').hidden = true; $('anQgo').hidden = false;
    if (!matchMedia('(pointer:coarse)').matches) { $('anQin').focus(); }
  }
  function checkQ() {
    if (!Q || Q.done) { return; }
    var g = A.parse($('anQin').value); if (g == null || isNaN(g)) { return; }
    Q.done = true; score.n++;
    var ok = Math.abs(g - Q.ans) < 0.5; if (ok) { score.r++; }
    $('anQfb').textContent = f(ok ? T.right2 : T.wrong, { a: D(Q.ans) }); $('anQfb').className = 'tt-fb ' + (ok ? 'ok' : 'no');
    $('anQwhy').textContent = f(T.why, { r: t(Q.r) });
    $('anQscore').textContent = f(T.score, { r: kh(score.r), n: kh(score.n) });
    $('anQnext').hidden = false; $('anQgo').hidden = true; $('anQnext').focus();
  }
  $('anQgo').addEventListener('click', checkQ);
  $('anQin').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkQ(); } });
  $('anQnext').addEventListener('click', newQ);

  /* ------------------------------------------------------------ tabs */
  var tab = A.readHash().tab || 'measure';
  function paintTabs() {
    $('anTabs').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === tab)); });
    $('anPaneM').hidden = tab !== 'measure'; $('anPaneR').hidden = tab !== 'rules'; $('anPaneQ').hidden = tab !== 'quiz';
    if (tab === 'quiz' && !Q) { newQ(); }
  }
  $('anTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) { return; } tab = b.getAttribute('data-t'); A.writeHash({ tab: tab === 'measure' ? '' : tab }); paintTabs(); });

  document.addEventListener('aa:langchange', function () {
    paintM(); paintR();
    if (Q) { $('anQfig').innerHTML = FIG[Q.fig](Q.v, Q.L.map(function (l) { return l === 'x' || !l ? l : D(parseInt(A.unKh(l), 10)); }), Q.pair || []); $('anQtext').textContent = t(T.q); }
  });
  paintTabs(); paintM(); paintR();
})();
