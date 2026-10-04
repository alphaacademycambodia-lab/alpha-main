/* Alpha Academy Cambodia — Trigonometry Unit Circle
   ---------------------------------------------------------------------------
   Drag the point round the circle (or type an angle, or use the arrow keys)
   and three things move together:
     the circle  — cos θ as the horizontal leg, sin θ as the vertical leg and
                   tan θ on the tangent line x = 1, with the quadrant signs
     the values  — decimals always; exact surds for the special angles
                   (multiples of 30° and 45°), with the reference angle and
                   the CAST sign rule written out
     the graphs  — y = sin x, cos x and tan x from 0° to 360°, with a marker
                   at θ; dragging along the graph moves the circle too
   Uses tools-core.js. Nothing is sent or stored; the address bar keeps the
   angle and the settings.                                                 */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('tgRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, NS = 'http://www.w3.org/2000/svg';
  var D2R = Math.PI / 180;

  var T = {
    q: { en: 'Quadrant {q}', km: 'ចតុភាគទី {q}' },
    axis: { en: 'On an axis', km: 'នៅលើអ័ក្ស' },
    allPos: { en: 'In quadrant I all three are positive.', km: 'ក្នុងចតុភាគទី I ទាំងបីវិជ្ជមាន។' },
    sinPos: { en: 'In quadrant II only sin is positive.', km: 'ក្នុងចតុភាគទី II មានតែ sin ដែលវិជ្ជមាន។' },
    tanPos: { en: 'In quadrant III only tan is positive.', km: 'ក្នុងចតុភាគទី III មានតែ tan ដែលវិជ្ជមាន។' },
    cosPos: { en: 'In quadrant IV only cos is positive.', km: 'ក្នុងចតុភាគទី IV មានតែ cos ដែលវិជ្ជមាន។' },
    ref: { en: 'Reference angle: {how} = {a}. So sin {th} = {s1} sin {a}, cos {th} = {s2} cos {a}, tan {th} = {s3} tan {a}.', km: 'មុំយោង៖ {how} = {a}។ ដូច្នេះ sin {th} = {s1} sin {a}, cos {th} = {s2} cos {a}, tan {th} = {s3} tan {a}។' },
    onAxis: { en: 'P is on an axis, so one of sin and cos is 0 and the other is ±1.', km: 'P នៅលើអ័ក្ស ដូច្នេះមួយក្នុងចំណោម sin និង cos ស្មើ ០ ហើយមួយទៀតស្មើ ±១។' },
    undef: { en: 'undefined', km: 'មិនកំណត់' },
    tanUndef: { en: 'tan {th} is undefined: cos {th} = 0, and you cannot divide by 0. The radius is parallel to the tangent line, so they never meet.', km: 'tan {th} មិនកំណត់៖ cos {th} = ០ ហើយមិនអាចចែកនឹង ០ បានទេ។ កាំស្របនឹងបន្ទាត់ប៉ះ ដូច្នេះវាមិនជួបគ្នាទេ។' },
    tanIs: { en: 'tan θ = sin θ ÷ cos θ = {s} ÷ {c} = {t}', km: 'tan θ = sin θ ÷ cos θ = {s} ÷ {c} = {t}' },
    pyth: { en: 'sin²θ + cos²θ = {a} + {b} = 1 — always, because the radius is 1.', km: 'sin²θ + cos²θ = {a} + {b} = ១ — ជានិច្ច ព្រោះកាំស្មើ ១។' },
    same: { en: '{a} is the same position on the circle as {b}.', km: '{a} ស្ថិតនៅទីតាំងដូចគ្នានឹង {b} លើរង្វង់។' },
    all: { en: 'all +', km: 'ទាំងអស់ +' },
    dragA: { en: 'Angle θ — drag the point or use the arrow keys', km: 'មុំ θ — អូសចំណុច ឬប្រើគ្រាប់ចុចព្រួញ' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k] == null ? '' : v[k]; }); }

  /* ------------------------------------------------------------ state */
  var H = A.readHash();
  var S = {
    th: isFinite(parseFloat(H.a)) ? norm(parseFloat(H.a)) : 30,
    rad: H.u === 'rad',
    snap: H.snap !== '0',
    show: { sin: H.s !== '0', cos: H.c !== '0', tan: H.t === '1' },
    typed: null
  };
  function norm(a) { a = a % 360; if (a < 0) { a += 360; } return Math.round(a * 10) / 10; }
  function save() {
    A.writeHash({ a: S.th === 30 ? '' : S.th, u: S.rad ? 'rad' : '', snap: S.snap ? '' : '0', s: S.show.sin ? '' : '0', c: S.show.cos ? '' : '0', t: S.show.tan ? '1' : '' });
  }

  /* ----------------------------------------------------- exact values */
  /* value = sign × num / den, num such as '1', '√2', '√3' */
  var BASE = {
    0: { s: ['0', ''], c: ['1', ''], t: ['0', ''] },
    30: { s: ['1', '2'], c: ['√3', '2'], t: ['√3', '3'] },
    45: { s: ['√2', '2'], c: ['√2', '2'], t: ['1', ''] },
    60: { s: ['√3', '2'], c: ['1', '2'], t: ['√3', ''] },
    90: { s: ['1', ''], c: ['0', ''], t: null }
  };
  function special(th) { return Math.abs(th % 30) < 1e-9 || Math.abs(th % 45) < 1e-9; }
  function refAngle(th) {
    if (th <= 90) { return th; } if (th <= 180) { return 180 - th; } if (th <= 270) { return th - 180; } return 360 - th;
  }
  function quad(th) {
    if (th % 90 === 0) { return 0; }
    return th < 90 ? 1 : th < 180 ? 2 : th < 270 ? 3 : 4;
  }
  function exact(th, fn) {
    var a = refAngle(th), b = BASE[a];
    if (!b) { return null; }
    var v = b[fn];
    if (!v) { return 'U'; }
    var s = fn === 's' ? Math.sin(th * D2R) : fn === 'c' ? Math.cos(th * D2R) : Math.tan(th * D2R);
    var neg = v[0] !== '0' && s < -1e-9;
    var num = A.kh(v[0]).replace(/√/, '√'), h = v[1] ? '<span class="es-fr"><span>' + num + '</span><span>' + A.kh(v[1]) + '</span></span>' : num;
    return (neg ? '−' : '') + h;
  }
  function dec(x) { return A.fmt(Math.round(x * 10000) / 10000); }

  /* radians as a multiple of π */
  function radStr(th) {
    if (th === 0) { return A.kh('0'); }
    var n = Math.round(th * 10), d = 1800, g = A.gcd(n, d);
    n /= g; d /= g;
    var top = (n === 1 ? '' : A.kh(String(n))) + 'π';
    return d === 1 ? top : '<span class="es-fr"><span>' + top + '</span><span>' + A.kh(String(d)) + '</span></span>';
  }
  function angStr(th) { return S.rad ? radStr(th) : A.fmt(th) + '°'; }

  /* -------------------------------------------------------------- SVG */
  function el(tag, at, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) { if (Object.prototype.hasOwnProperty.call(at, k)) { e.setAttribute(k, at[k]); } }
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function txt(x, y, s, cls, parent) { var e = el('text', { x: x, y: y, 'class': cls }, parent); e.textContent = s; return e; }

  /* the circle: centre (210, 210), radius 130 */
  var C = $('tgCircle'), CX = 210, CY = 210, RR = 130;
  var cv = {};
  (function buildCircle() {
    C.setAttribute('viewBox', '0 0 420 420');
    var defs = el('defs', {}, C);
    var cp = el('clipPath', { id: 'tgClip' }, defs); el('rect', { x: 4, y: 4, width: 412, height: 412 }, cp);
    cv.qbg = el('path', { 'class': 'tg-qbg' }, C);
    el('line', { x1: 14, y1: CY, x2: 406, y2: CY, 'class': 'tg-ax' }, C);
    el('line', { x1: CX, y1: 14, x2: CX, y2: 406, 'class': 'tg-ax' }, C);
    el('circle', { cx: CX, cy: CY, r: RR, 'class': 'tg-ring' }, C);
    el('line', { x1: CX + RR, y1: 8, x2: CX + RR, y2: 412, 'class': 'tg-tline' }, C);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (p) {
      txt(CX + p[0] * RR + (p[0] ? p[0] * 12 : 14), CY - p[1] * RR + (p[1] ? -p[1] * 12 : 14), A.kh(String(p[0] || p[1]).replace('-', '−')), 'tg-tick', C);
    });
    cv.qlab = [];
    [[1, 300, 40], [2, 120, 40], [3, 120, 388], [4, 300, 388]].forEach(function (q) {
      var g = el('g', { 'class': 'tg-ql' }, C);
      txt(q[1], q[2], ['I', 'II', 'III', 'IV'][q[0] - 1], 'tg-qn', g);
      cv.qsT = cv.qsT || [];
      cv.qsT.push(txt(q[1], q[2] + 18, '', 'tg-qs', g));
      cv.qlab.push(g);
    });
    var gc = el('g', { 'clip-path': 'url(#tgClip)' }, C);
    cv.ext = el('line', { 'class': 'tg-ext' }, gc);
    cv.tan = el('line', { 'class': 'tg-tan' }, gc);
    cv.arc = el('path', { 'class': 'tg-arc' }, C);
    cv.thl = txt(0, 0, 'θ', 'tg-thl', C);
    cv.rad = el('line', { x1: CX, y1: CY, 'class': 'tg-r' }, C);
    cv.cos = el('line', { y1: CY, x1: CX, 'class': 'tg-cos' }, C);
    cv.sin = el('line', { 'class': 'tg-sin' }, C);
    cv.cosL = txt(0, 0, 'cos θ', 'tg-lab tg-lcos', C);
    cv.sinL = txt(0, 0, 'sin θ', 'tg-lab tg-lsin', C);
    cv.tanL = txt(0, 0, 'tan θ', 'tg-lab tg-ltan', C);
    el('circle', { cx: CX, cy: CY, r: 3.5, 'class': 'tg-o' }, C);
    cv.pt = el('circle', { r: 11, 'class': 'tg-handle' }, C);
    cv.pdot = el('circle', { r: 4.5, 'class': 'tg-pdot' }, C);
    cv.pl = txt(0, 0, 'P', 'tg-pl', C);
  })();

  function paintCircle() {
    var th = S.th, r = th * D2R, c = Math.cos(r), s = Math.sin(r);
    if (Math.abs(c) < 1e-12) { c = 0; } if (Math.abs(s) < 1e-12) { s = 0; }
    var px = CX + RR * c, py = CY - RR * s;
    cv.rad.setAttribute('x2', px); cv.rad.setAttribute('y2', py);
    cv.cos.setAttribute('x2', px); cv.cos.setAttribute('y2', CY);
    cv.sin.setAttribute('x1', px); cv.sin.setAttribute('y1', CY); cv.sin.setAttribute('x2', px); cv.sin.setAttribute('y2', py);
    [cv.pt, cv.pdot].forEach(function (e) { e.setAttribute('cx', px); e.setAttribute('cy', py); });
    cv.pl.setAttribute('x', CX + (RR + 24) * Math.cos(r)); cv.pl.setAttribute('y', CY - (RR + 24) * Math.sin(r));
    /* angle arc */
    var ar = 34, big = th > 180 ? 1 : 0;
    if (th < 0.5) { cv.arc.setAttribute('d', ''); }
    else if (th > 359.5) { cv.arc.setAttribute('d', 'M' + (CX + ar) + ' ' + CY + 'A' + ar + ' ' + ar + ' 0 1 0 ' + (CX - ar) + ' ' + CY + 'A' + ar + ' ' + ar + ' 0 1 0 ' + (CX + ar) + ' ' + CY); }
    else { cv.arc.setAttribute('d', 'M' + CX + ' ' + CY + 'L' + (CX + ar) + ' ' + CY + 'A' + ar + ' ' + ar + ' 0 ' + big + ' 0 ' + (CX + ar * c) + ' ' + (CY - ar * s) + 'Z'); }
    var hr = r / 2;
    cv.thl.setAttribute('x', CX + 50 * Math.cos(hr)); cv.thl.setAttribute('y', CY - 50 * Math.sin(hr));
    /* labels on the legs */
    cv.cosL.setAttribute('x', CX + RR * c / 2); cv.cosL.setAttribute('y', CY + (s >= 0 ? 18 : -12));
    cv.sinL.setAttribute('x', px - 30); cv.sinL.setAttribute('y', CY - RR * s / 2);
    cv.cosL.style.display = Math.abs(c) < 0.18 ? 'none' : '';
    cv.sinL.style.display = Math.abs(s) < 0.12 ? 'none' : '';
    /* tangent: from (1, 0) to (1, tan θ); the radius line extended to meet it */
    var tanOK = Math.abs(c) > 1e-9;
    cv.tan.style.display = cv.ext.style.display = cv.tanL.style.display = tanOK ? '' : 'none';
    if (tanOK) {
      var tn = s / c, ty = CY - RR * tn;
      cv.tan.setAttribute('x1', CX + RR); cv.tan.setAttribute('y1', CY); cv.tan.setAttribute('x2', CX + RR); cv.tan.setAttribute('y2', ty);
      cv.ext.setAttribute('x1', c > 0 ? px : CX); cv.ext.setAttribute('y1', c > 0 ? py : CY); cv.ext.setAttribute('x2', CX + RR); cv.ext.setAttribute('y2', ty);
      var ly = Math.max(20, Math.min(400, CY - RR * tn / 2));
      cv.tanL.setAttribute('x', CX + RR + 36); cv.tanL.setAttribute('y', ly);
      cv.tanL.style.display = Math.abs(tn) < 0.12 ? 'none' : '';
    }
    cv.tan.style.visibility = cv.ext.style.visibility = cv.tanL.style.visibility = S.show.tan ? 'visible' : 'hidden';
    /* quadrant shading */
    var q = quad(th);
    cv.qlab.forEach(function (g, i) { g.classList.toggle('is-on', i + 1 === q); });
    if (q) {
      var a0 = (q - 1) * 90 * D2R, a1 = q * 90 * D2R;
      cv.qbg.setAttribute('d', 'M' + CX + ' ' + CY + 'L' + (CX + RR * Math.cos(a0)) + ' ' + (CY - RR * Math.sin(a0)) + 'A' + RR + ' ' + RR + ' 0 0 0 ' + (CX + RR * Math.cos(a1)) + ' ' + (CY - RR * Math.sin(a1)) + 'Z');
    } else { cv.qbg.setAttribute('d', ''); }
    cv.qsT.forEach(function (e, i) { e.textContent = i ? ['sin', 'tan', 'cos'][i - 1] + ' +' : t(T.all); });
    C.setAttribute('aria-valuenow', String(th));
    C.setAttribute('aria-valuetext', A.fmt(th) + '°');
    C.setAttribute('aria-label', t(T.dragA));
  }

  /* ------------------------------------------------------------ graph */
  var G = $('tgGraph'), GX0 = 52, GX1 = 744, GY0 = 24, GY1 = 276, YMAX = 2;
  var gv = {};
  function gx(d) { return GX0 + (GX1 - GX0) * d / 360; }
  function gy(v) { return (GY0 + GY1) / 2 - (GY1 - GY0) / 2 * v / YMAX; }
  (function buildGraph() {
    G.setAttribute('viewBox', '0 0 760 300');
    var defs = el('defs', {}, G);
    var cp = el('clipPath', { id: 'tgGClip' }, defs); el('rect', { x: GX0, y: GY0, width: GX1 - GX0, height: GY1 - GY0 }, cp);
    el('rect', { x: GX0, y: GY0, width: GX1 - GX0, height: GY1 - GY0, 'class': 'tg-gbg' }, G);
    [-2, -1, 1, 2].forEach(function (v) { el('line', { x1: GX0, x2: GX1, y1: gy(v), y2: gy(v), 'class': 'tg-gl' }, G); });
    [90, 180, 270].forEach(function (d) { el('line', { x1: gx(d), x2: gx(d), y1: GY0, y2: GY1, 'class': 'tg-gl' }, G); });
    el('line', { x1: GX0, x2: GX1, y1: gy(0), y2: gy(0), 'class': 'tg-ax' }, G);
    el('line', { x1: GX0, x2: GX0, y1: GY0, y2: GY1, 'class': 'tg-ax' }, G);
    gv.ylab = [];
    [-1, 1].forEach(function (v) { gv.ylab.push(txt(GX0 - 10, gy(v), String(v), 'tg-gy', G)); });
    gv.xlab = [];
    [0, 90, 180, 270, 360].forEach(function (d) { gv.xlab.push({ d: d, e: txt(gx(d), GY1 + 16, '', 'tg-gx', G) }); });
    var gc = el('g', { 'clip-path': 'url(#tgGClip)' }, G);
    [90, 270].forEach(function (d) { gv['as' + d] = el('line', { x1: gx(d), x2: gx(d), y1: GY0, y2: GY1, 'class': 'tg-asym' }, gc); });
    function path(fn, step) {
      var dd = '', pen = false;
      for (var d = 0; d <= 360; d += step) {
        var v = fn(d * D2R);
        if (!isFinite(v) || Math.abs(v) > 40) { pen = false; continue; }
        dd += (pen ? 'L' : 'M') + gx(d).toFixed(1) + ' ' + gy(v).toFixed(1);
        pen = true;
      }
      return dd;
    }
    gv.sin = el('path', { d: path(Math.sin, 2), 'class': 'tg-csin' }, gc);
    gv.cos = el('path', { d: path(Math.cos, 2), 'class': 'tg-ccos' }, gc);
    gv.tan = el('path', { d: path(function (x) { var c = Math.cos(x); return Math.abs(c) < 0.02 ? NaN : Math.tan(x); }, 0.5), 'class': 'tg-ctan' }, gc);
    gv.vl = el('line', { y1: GY0, y2: GY1, 'class': 'tg-vl' }, G);
    gv.dsin = el('circle', { r: 6, 'class': 'tg-dsin' }, gc);
    gv.dcos = el('circle', { r: 6, 'class': 'tg-dcos' }, gc);
    gv.dtan = el('circle', { r: 6, 'class': 'tg-dtan' }, gc);
    gv.hit = el('rect', { x: GX0, y: GY0, width: GX1 - GX0, height: GY1 - GY0, 'class': 'tg-hit' }, G);
  })();

  function paintGraph() {
    var th = S.th, r = th * D2R, x = gx(th);
    gv.vl.setAttribute('x1', x); gv.vl.setAttribute('x2', x);
    var s = Math.sin(r), c = Math.cos(r), tn = Math.abs(c) < 1e-9 ? NaN : s / c;
    [['sin', s], ['cos', c], ['tan', tn]].forEach(function (p) {
      var on = S.show[p[0]];
      gv[p[0]].style.display = on ? '' : 'none';
      var d = gv['d' + p[0]];
      d.style.display = on && isFinite(p[1]) ? '' : 'none';
      if (isFinite(p[1])) { d.setAttribute('cx', x); d.setAttribute('cy', gy(p[1])); }
    });
    gv.as90.style.display = gv.as270.style.display = S.show.tan ? '' : 'none';
    gv.xlab.forEach(function (o) {
      if (S.rad) {
        o.e.textContent = ['0', 'π/2', 'π', '3π/2', '2π'][o.d / 90];
        if (A.lang() === 'km') { o.e.textContent = A.khDigits(o.e.textContent); }
      } else { o.e.textContent = A.kh(String(o.d)) + '°'; }
    });
    gv.ylab.forEach(function (e, i) { e.textContent = A.kh(String([-1, 1][i]).replace('-', '−')); });
  }

  /* ----------------------------------------------------------- values */
  function paintValues() {
    var th = S.th, r = th * D2R, s = Math.sin(r), c = Math.cos(r);
    if (Math.abs(s) < 1e-12) { s = 0; } if (Math.abs(c) < 1e-12) { c = 0; }
    var tanU = Math.abs(c) < 1e-12, tn = tanU ? NaN : s / c;
    var sp = special(th);
    $('tgAng').innerHTML = angStr(th) + (S.rad ? ' <small>(' + A.fmt(th) + '°)</small>' : ' <small>= ' + radStr(th) + ' rad' + (sp ? '' : ' ≈ ' + dec(r)) + '</small>');
    function val(id, x, fn) {
      var ex = sp ? exact(th, fn) : null, h;
      if (fn === 't' && tanU) { h = '<b>' + A.esc(t(T.undef)) + '</b>'; }
      else if (ex && ex !== 'U') {
        var isDec = /^−?[0-9០-៩]$/.test(ex.replace(/<[^>]+>/g, ''));
        h = '<b>' + ex + '</b>' + (isDec ? '' : ' <small>≈ ' + dec(x) + '</small>');
      } else { h = '<b>' + dec(x) + '</b>'; }
      $(id).innerHTML = h;
    }
    val('tgVs', s, 's'); val('tgVc', c, 'c'); val('tgVt', tn, 't');

    var q = quad(th), L = [];
    $('tgQuad').textContent = q ? f(T.q, { q: ['I', 'II', 'III', 'IV'][q - 1] }) : t(T.axis);
    if (q) {
      L.push(t([T.allPos, T.sinPos, T.tanPos, T.cosPos][q - 1]));
      if (q > 1) {
        var a = refAngle(th), how = [null, A.kh('180') + '° − ' + A.fmt(th) + '°', A.fmt(th) + '° − ' + A.kh('180') + '°', A.kh('360') + '° − ' + A.fmt(th) + '°'][q - 1];
        var sg = function (v) { return v > 0 ? '+' : '−'; };
        L.push(f(T.ref, { how: how, a: A.fmt(a) + '°', th: A.fmt(th) + '°', s1: sg(s), s2: sg(c), s3: sg(tn) }));
      }
    } else { L.push(t(T.onAxis)); }
    if (tanU) { L.push(f(T.tanUndef, { th: A.fmt(th) + '°' })); }
    else { L.push(f(T.tanIs, { s: dec(s), c: dec(c), t: dec(tn) })); }
    L.push(f(T.pyth, { a: dec(s * s), b: dec(c * c) }));
    if (S.typed != null && S.typed !== th) { L.push(f(T.same, { a: A.fmt(S.typed) + '°', b: A.fmt(th) + '°' })); }
    $('tgWhy').innerHTML = L.map(function (x) { return '<li>' + x + '</li>'; }).join('');

    /* highlight the reference angle in the table */
    var ra = refAngle(th);
    root.querySelectorAll('#tgTable [data-a]').forEach(function (cell) { cell.classList.toggle('is-on', sp && +cell.getAttribute('data-a') === ra); });
    root.querySelectorAll('#tgTable th[data-a] span').forEach(function (e) {
      var d = +e.parentNode.getAttribute('data-a');
      e.innerHTML = S.rad ? radStr(d) : A.kh(String(d)) + '°';
    });
  }

  /* ----------------------------------------------------- interaction */
  var SPECIALS = [];
  for (var d = 0; d <= 360; d += 15) { if (d % 30 === 0 || d % 45 === 0) { SPECIALS.push(d); } }
  function setAngle(a, fromTyped) {
    a = norm(a);
    if (!fromTyped) {
      a = Math.round(a);
      if (S.snap) { SPECIALS.forEach(function (sp) { if (Math.abs(sp - a) <= 4) { a = sp; } }); }
      S.typed = null;
    }
    if (a >= 360 && !fromTyped) { a = 0; }
    S.th = a;
    if (!fromTyped) { $('tgIn').value = A.fmt(a, { plain: true, group: false }); }
    paintAll(); save();
  }
  function ptAngle(svg, e, fn) {
    var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    var q = p.matrixTransform(svg.getScreenCTM().inverse());
    return fn(q.x, q.y);
  }
  function circAngle(x, y) { var a = Math.atan2(CY - y, x - CX) / D2R; return a < 0 ? a + 360 : a; }
  function graphAngle(x) { return Math.max(0, Math.min(360, (x - GX0) / (GX1 - GX0) * 360)); }

  var dragC = false, dragG = false;
  C.addEventListener('pointerdown', function (e) { dragC = true; C.setPointerCapture(e.pointerId); setAngle(ptAngle(C, e, circAngle)); e.preventDefault(); });
  C.addEventListener('pointermove', function (e) { if (dragC) { setAngle(ptAngle(C, e, circAngle)); } });
  C.addEventListener('pointerup', function () { dragC = false; });
  C.addEventListener('pointercancel', function () { dragC = false; });
  G.addEventListener('pointerdown', function (e) { dragG = true; G.setPointerCapture(e.pointerId); setAngleG(e); e.preventDefault(); });
  G.addEventListener('pointermove', function (e) { if (dragG) { setAngleG(e); } });
  G.addEventListener('pointerup', function () { dragG = false; });
  G.addEventListener('pointercancel', function () { dragG = false; });
  function setAngleG(e) {
    var a = ptAngle(G, e, function (x) { return graphAngle(x); });
    a = Math.round(a);
    if (S.snap) { SPECIALS.forEach(function (sp) { if (Math.abs(sp - a) <= 4) { a = sp; } }); }
    S.th = a >= 360 ? 360 : a; S.typed = null;
    if (S.th === 360) { S.th = 360; }
    $('tgIn').value = String(S.th);
    paintAll(); save();
  }
  C.addEventListener('keydown', function (e) {
    var step = e.shiftKey ? 15 : 1, a = S.th;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { a += step; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { a -= step; }
    else if (e.key === 'Home') { a = 0; }
    else { return; }
    e.preventDefault();
    S.th = norm(Math.round(a)); S.typed = null;
    $('tgIn').value = String(S.th);
    paintAll(); save();
  });
  $('tgIn').addEventListener('input', function () {
    var v = A.parse(this.value);
    this.classList.toggle('is-bad', this.value.trim() !== '' && (v == null || isNaN(v)));
    if (v == null || isNaN(v)) { return; }
    S.typed = Math.round(v * 10) / 10;
    S.th = (S.typed === 360) ? 360 : norm(S.typed);
    paintAll(); save();
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) { return; }
    var v;
    if ((v = b.getAttribute('data-u'))) { S.rad = v === 'rad'; }
    else if (b.id === 'tgSnap') { S.snap = !S.snap; }
    else if ((v = b.getAttribute('data-show'))) { S.show[v] = !S.show[v]; }
    else if ((v = b.getAttribute('data-go'))) { S.th = +v; S.typed = null; $('tgIn').value = v; }
    else if ((v = b.getAttribute('data-a'))) { S.th = +v; S.typed = null; $('tgIn').value = v; }
    else { return; }
    paintAll(); save();
  });

  function paintAll() {
    root.querySelectorAll('[data-u]').forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-u') === 'rad') === S.rad)); });
    $('tgSnap').setAttribute('aria-pressed', String(S.snap));
    root.querySelectorAll('[data-show]').forEach(function (b) { b.setAttribute('aria-pressed', String(S.show[b.getAttribute('data-show')])); });
    paintCircle(); paintGraph(); paintValues();
  }

  $('tgIn').value = String(S.th);
  document.addEventListener('aa:langchange', paintAll);
  paintAll();
})();
