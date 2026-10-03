/* Alpha Academy Cambodia — Inequality Solver
   ---------------------------------------------------------------------------
   Every kind of inequality met from lower secondary to Grade 12, solved with
   the working written out the way a Cambodian maths book writes it, in
   Khmer or English. Uses tools-core.js.

     linear              3(x − 2) ≤ 5x + 4
     double              −3 < 2x + 1 ≤ 7
     system              2x − 1 > 3 ; 5 − x ≥ −2        (one per line, or ;)
     quadratic           x² − 5x + 6 > 0                 Δ and the sign rule
     polynomial          (x − 1)(x + 2)(x − 3) ≥ 0       sign table
     rational            (2x + 1)/(x − 3) < 1            condition + sign table
     absolute value      |x − 1| + |x + 2| < 5           shortcuts, else cases
     square root         √(x + 3) > x + 1                the textbook equivalences
     exponential         4^x − 3·2^x + 2 < 0             same base, or t = 2^x
     logarithmic         log_2(x − 1) < 3                domain first, then monotony
     trigonometric       2sin(x − π/3) + 1 < 0           general solution + [0, 2π]
     two variables       x + y ≤ 6 ; x ≥ 0 ; y ≥ 0       half-planes, region, vertices
     anything else       2^x > x²                        numerically, and says so

   FIVE THINGS DECIDE HOW THIS IS BUILT.

   1. THE ARITHMETIC IS EXACT. Coefficients are fractions of BigInts, roots
      come out as 3/4 or 1 + √3, and the sign table is built from the exact
      roots. Only a polynomial with no rational root and degree above two is
      solved numerically — and its roots are then labelled as decimals.

   2. ONE SIGN TABLE DOES THE WORK. Linear, quadratic, polynomial and rational
      inequalities all end in the same place: everything on one side, one
      fraction, factorised, a table of signs. The steps before that are
      written per type, because that is how the book teaches them.

   3. EVERY OTHER TYPE IS REDUCED, NOT GUESSED. |u| < v becomes −v < u < v,
      √u < v becomes u ≥ 0, v > 0, u < v², a^u < a^v becomes u < v (or u > v
      when 0 < a < 1). Each reduction is a step on the page and the pieces it
      produces are solved by the same engine, recursively.

   4. THE DOMAIN COMES FIRST. A denominator, a logarithm and a square root
      each put a condition on x before anything else is done, and the answer
      is intersected with it. A sign table marks a forbidden value with ‖.

   5. WHEN THERE IS NO METHOD, THE PAGE SAYS SO. 2^x > x² has no textbook
      method; it is solved by locating the sign changes numerically, and the
      answer is marked as numerical. The engine never pretends.

   State lives in the address bar: #q=<the inequality>&m=1|2&n=en|fr&z=<objective>
   window.AAInequality exposes the engine for testing without the page.      */
(function (global) {
  'use strict';

  var A = global.AATool;
  if (!A || typeof BigInt === 'undefined') { return; }

  /* ===================================================== exact fractions */
  var ZERO = BigInt(0), ONE = BigInt(1), TWO = BigInt(2);
  function babs(a) { return a < ZERO ? -a : a; }
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { var r = a % b; a = b; b = r; } return a; }

  function F(n, d) {
    n = BigInt(n); d = d === undefined ? ONE : BigInt(d);
    if (d === ZERO) { throw new Error('zero denominator'); }
    if (d < ZERO) { n = -n; d = -d; }
    var g = bgcd(n, d) || ONE;
    return { n: n / g, d: d / g };
  }
  var F0 = F(0), F1 = F(1);
  function add(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function div(a, b) { if (b.n === ZERO) { throw new Error('divide by zero'); } return F(a.n * b.d, a.d * b.n); }
  function neg(a) { return { n: -a.n, d: a.d }; }
  function fabs(a) { return { n: babs(a.n), d: a.d }; }
  function isZ(a) { return a.n === ZERO; }
  function sgn(a) { return a.n < ZERO ? -1 : a.n > ZERO ? 1 : 0; }
  function eq(a, b) { return a.n === b.n && a.d === b.d; }
  function cmp(a, b) { return sgn(sub(a, b)); }
  function num(a) { return Number(a.n) / Number(a.d); }
  function isInt(a) { return a.d === ONE; }
  function fpow(a, k) {
    if (k < 0) { return fpow(div(F1, a), -k); }
    var r = F1;
    for (var i = 0; i < k; i++) { r = mul(r, a); }
    return r;
  }
  function blcm(a, b) { return a / bgcd(a, b) * b; }
  function isqrtB(m) {
    if (m < ZERO) { return null; }
    if (m < TWO) { return m; }
    var x = BigInt(Math.floor(Math.sqrt(Number(m))));
    while (x * x > m) { x--; }
    while ((x + ONE) * (x + ONE) <= m) { x++; }
    return x * x === m ? x : null;
  }
  /* exact n-th root of a BigInt ≥ 0, or null */
  function iroot(m, k) {
    if (m < ZERO) { return null; }
    if (m < TWO || k === 1) { return m; }
    var x = BigInt(Math.round(Math.pow(Number(m), 1 / k)));
    for (var d = -2; d <= 2; d++) {
      var y = x + BigInt(d);
      if (y >= ZERO) { var p = ONE; for (var i = 0; i < k; i++) { p *= y; } if (p === m) { return y; } }
    }
    return null;
  }
  /* √m = k√r for m ≥ 0 */
  function surdB(m) {
    if (m === ZERO) { return { k: ZERO, r: ZERO }; }
    var k = ONE, r = m;
    for (var p = TWO; p * p <= r && p < BigInt(100000); p++) {
      var pp = p * p;
      while (r % pp === ZERO) { r /= pp; k *= p; }
    }
    return { k: k, r: r };
  }

  /* ========================================================= polynomials
     Arrays of fractions, index = power (p[0] is the constant). */
  function pTrim(p) {
    var q = p.slice();
    while (q.length > 1 && isZ(q[q.length - 1])) { q.pop(); }
    return q.length ? q : [F0];
  }
  function pDeg(p) { p = pTrim(p); return (p.length === 1 && isZ(p[0])) ? -1 : p.length - 1; }
  function pIsZero(p) { return pDeg(p) === -1; }
  function pAdd(p, q) {
    var n = Math.max(p.length, q.length), r = [];
    for (var i = 0; i < n; i++) { r.push(add(p[i] || F0, q[i] || F0)); }
    return pTrim(r);
  }
  function pScale(p, c) { return pTrim(p.map(function (a) { return mul(a, c); })); }
  function pNeg(p) { return p.map(neg); }
  function pSub(p, q) { return pAdd(p, pNeg(q)); }
  function pMul(p, q) {
    var r = [];
    for (var i = 0; i < p.length + q.length - 1; i++) { r.push(F0); }
    for (var a = 0; a < p.length; a++) {
      if (isZ(p[a])) { continue; }
      for (var b = 0; b < q.length; b++) { r[a + b] = add(r[a + b], mul(p[a], q[b])); }
    }
    return pTrim(r);
  }
  function pPow(p, k) { var r = [F1]; for (var i = 0; i < k; i++) { r = pMul(r, p); } return r; }
  function pLead(p) { p = pTrim(p); return p[p.length - 1]; }
  function pEval(p, x) { var r = F0; for (var i = p.length - 1; i >= 0; i--) { r = add(mul(r, x), p[i]); } return r; }
  function pEvalN(p, x) {
    var r = 0;
    for (var i = p.length - 1; i >= 0; i--) { r = r * x + (typeof p[i] === 'number' ? p[i] : num(p[i])); }
    return r;
  }
  function pDeriv(p) {
    var r = [];
    for (var i = 1; i < p.length; i++) { r.push(mul(p[i], F(i))); }
    return r.length ? pTrim(r) : [F0];
  }
  function pDivmod(p, q) {
    p = pTrim(p); q = pTrim(q);
    var dq = pDeg(q);
    if (dq < 0) { throw new Error('poly divide by zero'); }
    var r = p.slice(), out = [];
    var dp = pDeg(r);
    for (var i = 0; i <= Math.max(0, dp - dq); i++) { out.push(F0); }
    while (pDeg(r) >= dq && !pIsZero(r)) {
      var k = pDeg(r) - dq, c = div(pLead(r), pLead(q));
      out[k] = c;
      var sh = [];
      for (var j = 0; j < k; j++) { sh.push(F0); }
      r = pSub(r, pScale(sh.concat(q), c));
    }
    return { q: pTrim(out), r: pTrim(r) };
  }
  function pMonic(p) { p = pTrim(p); return pIsZero(p) ? p : pScale(p, div(F1, pLead(p))); }
  function pGcd(p, q) {
    p = pTrim(p); q = pTrim(q);
    while (!pIsZero(q)) { var r = pDivmod(p, q).r; p = q; q = r; }
    return pIsZero(p) ? [F1] : pMonic(p);
  }
  function pEqual(p, q) {
    p = pTrim(p); q = pTrim(q);
    if (p.length !== q.length) { return false; }
    for (var i = 0; i < p.length; i++) { if (!eq(p[i], q[i])) { return false; } }
    return true;
  }
  /* p = c · prim, prim with whole coprime coefficients and a positive lead */
  function pPrim(p) {
    p = pTrim(p);
    if (pIsZero(p)) { return { c: F0, p: [F0] }; }
    var L = p.reduce(function (m, a) { return blcm(m, a.d); }, ONE);
    var ints = p.map(function (a) { return a.n * (L / a.d); });
    var g = ints.reduce(function (m, v) { return bgcd(m, v); }, ZERO) || ONE;
    if (ints[ints.length - 1] < ZERO) { g = -g; }
    return { c: F(g, L), p: ints.map(function (v) { return F(v / g); }) };
  }
  var PX = [F0, F1];

  /* ================================================== points on the line
     A point carries its value for ordering and its label for printing:
       v   the Number         h  HTML label      p  plain label (copying)
       ex  true when the label is exact (3/4, 1 + √3, π/6), false for 1.2346 */
  function n2s(b) { return A.kh(String(b).replace('-', '−')); }
  function H(a) {
    var s = a.n < ZERO ? '−' : '';
    var n = babs(a.n);
    if (a.d === ONE) { return s + n2s(n); }
    return s + '<span class="es-fr"><span>' + n2s(n) + '</span><span>' + n2s(a.d) + '</span></span>';
  }
  function plain(a) { return (a.n < ZERO ? '-' : '') + String(babs(a.n)) + (a.d === ONE ? '' : '/' + a.d); }
  function plainK(a) { return A.kh(plain(a).replace('-', '−')); }
  function P(a) { return sgn(a) < 0 ? '(' + H(a) + ')' : H(a); }
  function dec(x) { return A.fmt(x, { sig: 6 }); }
  function decP(x) { return A.fmt(x, { sig: 6, group: false }); }

  function ptF(f) { return { v: num(f), h: H(f), p: plainK(f), ex: true, f: f }; }
  function ptNum(v) {
    var s = snap(v);
    if (s) { return s; }
    return { v: v, h: dec(v), p: decP(v), ex: false };
  }
  /* p + q√r (r squarefree > 1) */
  function ptSurd(p, q, r) {
    var v = num(p) + num(q) * Math.sqrt(Number(r));
    return { v: v, h: surdH(p, q, r), p: surdP(p, q, r), ex: true };
  }
  function surdH(p, q, r) {
    var qa = fabs(q), rad = '√' + n2s(r);
    var body = qa.d === ONE ? (qa.n === ONE ? '' : n2s(qa.n)) + rad
                            : '<span class="es-fr"><span>' + (qa.n === ONE ? '' : n2s(qa.n)) + rad + '</span><span>' + n2s(qa.d) + '</span></span>';
    if (isZ(p)) { return (sgn(q) < 0 ? '−' : '') + body; }
    return H(p) + ' ' + (sgn(q) < 0 ? '−' : '+') + ' ' + body;
  }
  function surdP(p, q, r) {
    var qa = fabs(q), rad = '√' + A.kh(String(r));
    var body = (qa.n === ONE ? '' : A.kh(String(qa.n))) + rad + (qa.d === ONE ? '' : '/' + A.kh(String(qa.d)));
    if (isZ(p)) { return (sgn(q) < 0 ? '−' : '') + body; }
    return plainK(p) + (sgn(q) < 0 ? ' − ' : ' + ') + body;
  }
  function ptLab(v, h, p, ex) { return { v: v, h: h, p: p || h.replace(/<[^>]+>/g, ''), ex: ex !== false }; }

  /* Recognise a decimal that is really 7/4, √2/2, (1 + √5)/2 or 5π/6 — used
     only for numbers that came out of a numerical method. */
  var SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30];
  function near(a, b) { return Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(b)); }
  function snap(v) {
    if (!isFinite(v)) { return null; }
    var q, p;
    for (q = 1; q <= 60; q++) {
      p = Math.round(v * q);
      if (Math.abs(p) < 1e9 && near(v, p / q)) { return ptF(F(p, q)); }
    }
    for (q = 1; q <= 24; q++) {       /* 5π/6 */
      p = Math.round(v / Math.PI * q);
      if (p !== 0 && Math.abs(p) <= 24 * q && near(v, p * Math.PI / q)) { var fq = F(p, q); return ptLab(v, piH(fq), piP(fq), true); }
    }
    for (q = 1; q <= 12; q++) {
      for (var i = 0; i < SQF.length; i++) {
        var r = SQF[i], sr = Math.sqrt(r);
        for (var s = 1; s <= 12; s++) {
          for (var sg = -1; sg <= 1; sg += 2) {
            p = Math.round(v * q - sg * s * sr);
            if (Math.abs(p) <= 200 && near(v, (p + sg * s * sr) / q)) {
              return ptSurd(F(p, q), F(sg * s, q), BigInt(r));
            }
          }
        }
      }
    }
    return null;
  }

  function ptEq(a, b) { return Math.abs(a.v - b.v) <= 1e-9 * Math.max(1, Math.abs(a.v)); }
  function better(a, b) { return (b.ex && !a.ex) ? b : a; }
  /* sorted, merged, exact labels preferred */
  function uniqPts(list) {
    var s = list.slice().sort(function (a, b) { return a.v - b.v; }), out = [];
    s.forEach(function (p) {
      if (out.length && ptEq(out[out.length - 1], p)) { out[out.length - 1] = better(out[out.length - 1], p); }
      else { out.push(p); }
    });
    return out;
  }

  /* ================================================================ sets
     A set of reals is a sorted list of segments {a, ac, b, bc}: a/b are
     points or null (∓∞), ac/bc whether the end is included. A single point
     is a segment with a = b, both closed. */
  var ALL = [{ a: null, ac: false, b: null, bc: false }];
  function setPts(S) {
    var out = [];
    S.forEach(function (s) { if (s.a) { out.push(s.a); } if (s.b) { out.push(s.b); } });
    return out;
  }
  function inMid(S, x) {
    for (var i = 0; i < S.length; i++) {
      var s = S[i];
      if ((s.a === null || x > s.a.v) && (s.b === null || x < s.b.v)) { return true; }
    }
    return false;
  }
  function inPt(S, p) {
    for (var i = 0; i < S.length; i++) {
      var s = S[i];
      var okA = s.a === null || (ptEq(s.a, p) ? s.ac : p.v > s.a.v);
      var okB = s.b === null || (ptEq(s.b, p) ? s.bc : p.v < s.b.v);
      if (okA && okB) { return true; }
    }
    return false;
  }
  /* Pieces of the line cut at pts: interval 0, point 0, interval 1, … */
  function testVals(pts) {
    var n = pts.length, out = [];
    for (var i = 0; i <= n; i++) {
      if (n === 0) { out.push(0); }
      else if (i === 0) { out.push(pts[0].v - Math.max(1, Math.abs(pts[0].v))); }
      else if (i === n) { out.push(pts[n - 1].v + Math.max(1, Math.abs(pts[n - 1].v))); }
      else { out.push((pts[i - 1].v + pts[i].v) / 2); }
    }
    return out;
  }
  function fromFlags(pts, iv, pv) {
    var segs = [], cur = null, n = pts.length;
    for (var k = 0; k <= 2 * n; k++) {
      var even = k % 2 === 0, i = k >> 1, inc = even ? iv[i] : pv[i];
      if (inc) {
        if (!cur) {
          cur = even ? { a: i === 0 ? null : pts[i - 1], ac: false } : { a: pts[i], ac: true };
        }
        if (even) { cur.b = i === n ? null : pts[i]; cur.bc = false; }
        else { cur.b = pts[i]; cur.bc = true; }
      } else if (cur) { segs.push(cur); cur = null; }
    }
    if (cur) { segs.push(cur); }
    return segs;
  }
  function combine(sets, fn) {
    var pts = uniqPts([].concat.apply([], sets.map(setPts)));
    var tv = testVals(pts);
    var iv = tv.map(function (x) { return fn(sets.map(function (S) { return inMid(S, x); })); });
    var pv = pts.map(function (p) { return fn(sets.map(function (S) { return inPt(S, p); })); });
    return fromFlags(pts, iv, pv);
  }
  function inter() { var a = [].slice.call(arguments); return combine(a, function (f) { return f.every(Boolean); }); }
  function union() { var a = [].slice.call(arguments); return combine(a, function (f) { return f.some(Boolean); }); }
  function compl(S) { return combine([S], function (f) { return !f[0]; }); }
  function isAll(S) { return S.length === 1 && S[0].a === null && S[0].b === null; }
  function ray(p, op) {   /* x op p */
    if (op === '<') { return [{ a: null, ac: false, b: p, bc: false }]; }
    if (op === '≤') { return [{ a: null, ac: false, b: p, bc: true }]; }
    if (op === '>') { return [{ a: p, ac: false, b: null, bc: false }]; }
    if (op === '≥') { return [{ a: p, ac: true, b: null, bc: false }]; }
    return compl([{ a: p, ac: true, b: p, bc: true }]);
  }
  function seg(a, ac, b, bc) { return [{ a: a, ac: ac, b: b, bc: bc }]; }

  var FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤', '≠': '≠' };
  function wants(op, s) {   /* does sign s (−1, 0, 1) satisfy "… op 0"? */
    return op === '<' ? s < 0 : op === '>' ? s > 0 : op === '≤' ? s <= 0 : op === '≥' ? s >= 0 : s !== 0;
  }

  /* ====================================================== factorisation
     factorPoly(P) → { c, fs: [ {kind, poly, m, roots} ] } with
       P = c · Π poly^m, every poly a primitive whole-number polynomial:
       kind 'lin'  b·x − a        root a/b, exact
            'q'    a quadratic with no rational root: roots p ± q√r, or none
            'n'    degree ≥ 3 with no rational root: roots found numerically
     Multiplicities come from a square-free (Yun) decomposition first, so a
     repeated irrational root is still counted twice. */
  function divisorsB(n) {
    n = babs(n);
    var out = [];
    if (n === ZERO || n > BigInt(1e10)) { return null; }
    for (var i = ONE; i * i <= n; i++) {
      if (n % i === ZERO) { out.push(i); if (i * i !== n) { out.push(n / i); } }
      if (out.length > 600) { return null; }
    }
    return out.sort(function (x, y) { return x < y ? -1 : 1; });
  }
  function yun(p) {
    var out = [], dp = pDeriv(p);
    var a = pGcd(p, dp);
    var b = pDivmod(p, a).q, c = pDivmod(dp, a).q, d = pSub(c, pDeriv(b));
    var i = 1;
    while (pDeg(b) > 0 && i < 60) {
      a = pGcd(b, d);
      if (pDeg(a) > 0) { out.push({ p: a, m: i }); }
      b = pDivmod(b, a).q;
      c = pDivmod(d, a).q;
      d = pSub(c, pDeriv(b));
      i++;
    }
    return out;
  }
  function ratRoot(s) {   /* s primitive, whole; one rational root or null */
    var a0 = s[0].n, an = pLead(s).n;
    if (a0 === ZERO) { return F0; }
    var ps = divisorsB(a0), qs = divisorsB(an);
    if (!ps || !qs) { return null; }
    for (var i = 0; i < ps.length; i++) {
      for (var j = 0; j < qs.length; j++) {
        for (var sg = 1; sg >= -1; sg -= 2) {
          var c = F(BigInt(sg) * ps[i], qs[j]);
          if (isZ(pEval(s, c))) { return c; }
        }
      }
    }
    return null;
  }
  function linFactor(r) { return [F(-r.n), F(r.d)]; }       /* d·x − n */
  function quadRoots(s) {    /* primitive deg 2 → roots (sorted) or [] */
    var c = s[0].n, b = s[1].n, a = s[2].n;
    var D = b * b - BigInt(4) * a * c;
    if (D < ZERO) { return []; }
    var sd = surdB(D);
    if (sd.r === ONE || D === ZERO) {
      var r1 = F(-b - sd.k, TWO * a), r2 = F(-b + sd.k, TWO * a);
      return [ptF(r1), ptF(r2)].sort(function (x, y) { return x.v - y.v; });
    }
    var p = F(-b, TWO * a), q = F(sd.k, TWO * a);
    return [ptSurd(p, neg(q), sd.r), ptSurd(p, q, sd.r)].sort(function (x, y) { return x.v - y.v; });
  }
  function factorPoly(P) {
    var pr = pPrim(P);
    var out = { c: pr.c, fs: [] };
    if (pDeg(pr.p) <= 0) { return out; }
    var parts = yun(pr.p), leadProd = F1;
    parts.forEach(function (part) {
      var s = pPrim(part.p).p;
      leadProd = mul(leadProd, fpow(pLead(s), part.m));
      var guard = 0;
      while (pDeg(s) >= 1 && guard++ < 40) {
        var r = pDeg(s) === 1 ? div(neg(s[0]), s[1]) : ratRoot(s);
        if (!r) { break; }
        var lf = linFactor(r);
        out.fs.push({ kind: 'lin', poly: lf, m: part.m, roots: [ptF(r)] });
        s = pDivmod(s, lf).q;
      }
      var d = pDeg(s);
      if (d <= 0) { return; }
      if (d === 2) {
        out.fs.push({ kind: 'q', poly: s, m: part.m, roots: quadRoots(s) });
        return;
      }
      if (d === 4 && isZ(s[1]) && isZ(s[3])) {     /* biquadratic */
        var a = s[4].n, b = s[2].n, c = s[0].n;
        var Dt = b * b - BigInt(4) * a * c;
        var rt = isqrtB(Dt < ZERO ? ZERO : Dt);
        if (Dt >= ZERO && rt !== null) {
          var t1 = F(-b - rt, TWO * a), t2 = F(-b + rt, TWO * a);
          var k = pPrim([neg(t1), F0, F1]), k2 = pPrim([neg(t2), F0, F1]);
          out.fs.push({ kind: 'q', poly: k.p, m: part.m, roots: quadRoots(k.p) });
          out.fs.push({ kind: 'q', poly: k2.p, m: part.m, roots: quadRoots(k2.p) });
          /* the two quadratics multiply to s / a, and their leads are what
             pPrim left them; fold the difference into leadProd */
          leadProd = mul(leadProd, fpow(div(mul(pLead(k.p), pLead(k2.p)), pLead(s)), part.m));
          return;
        }
      }
      out.fs.push({ kind: 'n', poly: s, m: part.m, roots: realRoots(s).map(ptNum) });
    });
    out.c = mul(pr.c, div(pLead(pr.p), leadProd));
    return out;
  }

  /* real roots of a square-free polynomial, numerically: between two
     neighbouring roots of the derivative there is at most one root */
  function realRootsF(c) {
    var d = c.length - 1;
    while (d > 0 && c[d] === 0) { d--; }
    c = c.slice(0, d + 1);
    if (d < 1) { return []; }
    if (d === 1) { return [-c[0] / c[1]]; }
    var dc = [];
    for (var i = 1; i <= d; i++) { dc.push(c[i] * i); }
    var crit = realRootsF(dc), B = 1;
    for (i = 0; i < d; i++) { B = Math.max(B, 1 + Math.abs(c[i] / c[d])); }
    var f = function (x) { var r = 0; for (var j = d; j >= 0; j--) { r = r * x + c[j]; } return r; };
    var xs = [-B].concat(crit.filter(function (x) { return x > -B && x < B; }), [B]), roots = [];
    for (i = 0; i < xs.length - 1; i++) {
      var l = xs[i], r = xs[i + 1], fl = f(l), fr = f(r);
      if (fl === 0) { roots.push(l); continue; }
      if (fl * fr < 0) {
        for (var it = 0; it < 300; it++) {
          var m = (l + r) / 2;
          if (m === l || m === r) { break; }
          var fm = f(m);
          if (fm === 0) { l = r = m; break; }
          if (fl * fm < 0) { r = m; } else { l = m; fl = fm; }
        }
        roots.push((l + r) / 2);
      }
    }
    if (f(B) === 0) { roots.push(B); }
    var out = [];
    roots.sort(function (a, b) { return a - b; }).forEach(function (x) {
      if (!out.length || Math.abs(out[out.length - 1] - x) > 1e-12 * Math.max(1, Math.abs(x))) { out.push(x); }
    });
    return out;
  }
  function realRoots(p) {
    var c = p.map(num), lead = c[c.length - 1];
    return realRootsF(c.map(function (x) { return x / lead; }));
  }
  /* all real roots of any polynomial, labelled */
  function rootsOf(p) {
    if (pDeg(p) <= 0) { return []; }
    var fp = factorPoly(p), out = [];
    fp.fs.forEach(function (f) { out = out.concat(f.roots); });
    return uniqPts(out);
  }

  /* ============================================================ display */
  var SUPD = function (k) { return '<sup>' + A.kh(k) + '</sup>'; };
  function coefH(a, first) {
    var s = sgn(a) < 0 ? '−' : (first ? '' : '+');
    var m = fabs(a);
    return { sign: s, body: eq(m, F1) ? '' : H(m) };
  }
  /* a polynomial, highest power first, in the variable v */
  function polyH(p, v) {
    p = pTrim(p);
    var out = '', first = true;
    for (var i = p.length - 1; i >= 0; i--) {
      var c = p[i];
      if (isZ(c)) { continue; }
      var ch = coefH(c, first);
      var body = i === 0 ? H(fabs(c)) : ch.body + v + (i > 1 ? SUPD(i) : '');
      out += (first ? ch.sign : ' ' + ch.sign + ' ') + body;
      first = false;
    }
    return out || A.kh('0');
  }
  function polyP(p, v) {
    return polyH(p, v).replace(/<sup>([^<]*)<\/sup>/g, '^$1')
      .replace(/<span class="es-fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$1/$2');
  }
  function termCount(p) { return pTrim(p).filter(function (c) { return !isZ(c); }).length; }
  function factorH(f, v) {
    var body = polyH(f.poly, v);
    var single = termCount(f.poly) === 1;
    if (f.m > 1) { return (single ? body : '(' + body + ')') + SUPD(f.m); }
    return body;
  }
  /* c · (…)(…)² — factors in brackets when there is more than one */
  function prodH(c, fs, v, bare) {
    if (!fs.length) { return H(c); }
    var many = fs.length > 1 || !eq(c, F1);
    var body = fs.map(function (f) {
      var b = factorH(f, v);
      return (many && f.m === 1 && termCount(f.poly) > 1) ? '(' + b + ')' : b;
    }).join('');
    if (eq(c, F1)) { return body; }
    if (eq(c, F(-1))) { return '−' + body; }
    return (bare ? H(c) : P(c)) + body;
  }
  function fracH(top, bot) { return '<span class="es-fr"><span>' + top + '</span><span>' + bot + '</span></span>'; }
  function ratH(n, d, v) {
    if (pDeg(d) <= 0) { return polyH(pScale(n, div(F1, d[0])), v); }
    return fracH(polyH(n, v), polyH(d, v));
  }

  /* ========================================================= sign tables
     rows: [{ h, sign(x), roots, den }] ; crit: sorted points ;
     excl: points where the expression is undefined. */
  function signAt(f, x) {
    var s = Math.sign(pEvalN(f.poly, x));
    return (f.m % 2 === 0) ? (s === 0 ? 0 : 1) : s;
  }
  function rowsOf(c, FN, FD, v) {
    var rows = [];
    if (sgn(c) < 0) { rows.push({ h: H(c), sign: function () { return -1; }, roots: [], den: false }); }
    FN.fs.forEach(function (f) { rows.push({ h: factorH(f, v), sign: function (x) { return signAt(f, x); }, roots: f.roots, den: false }); });
    FD.fs.forEach(function (f) { rows.push({ h: factorH(f, v), sign: function (x) { return signAt(f, x); }, roots: f.roots, den: true }); });
    return rows;
  }
  function signTable(rows, crit, excl, fname, v, final) {
    var tv = testVals(crit);
    var hasRoot = function (r, p) { return r.roots.some(function (q) { return ptEq(q, p); }); };
    var iv = tv.map(function (x, i) {
      if (final) { return final.iv[i]; }
      return rows.reduce(function (s, r) { return s * r.sign(x); }, 1);
    });
    var pv = crit.map(function (p, i) {
      if (final) { return final.pv[i]; }
      if (excl.some(function (q) { return ptEq(q, p); })) { return 'U'; }
      if (rows.some(function (r) { return !r.den && hasRoot(r, p); })) { return 0; }
      return rows.reduce(function (s, r) { return s * r.sign(p.v); }, 1);
    });
    var sg = function (s) { return s > 0 ? '<b class="pl">+</b>' : s < 0 ? '<b class="mi">−</b>' : (s === 0 ? '0' : ''); };
    var head = '<tr class="xr"><th>' + v + '</th><td class="inf">−∞</td>' + crit.map(function (p) {
      return '<td></td><td class="pt">' + p.h + '</td>';
    }).join('') + '<td></td><td class="inf">+∞</td></tr>';
    var body = rows.map(function (r) {
      var cells = '<td></td>';
      tv.forEach(function (x, i) {
        cells += '<td class="sg">' + sg(r.sign(x)) + '</td>';
        if (i < crit.length) { cells += '<td class="pt">' + (hasRoot(r, crit[i]) ? '0' : '<i class="bar"></i>') + '</td>'; }
      });
      return '<tr><th>' + r.h + '</th>' + cells + '<td></td></tr>';
    }).join('');
    var fcells = '<td></td>';
    iv.forEach(function (s, i) {
      fcells += '<td class="sg">' + sg(s) + '</td>';
      if (i < crit.length) { fcells += '<td class="pt">' + (pv[i] === 'U' ? '<b class="nd">‖</b>' : pv[i] === 0 ? '0' : '<i class="bar"></i>') + '</td>'; }
    });
    var html = '<div class="iq-tabwrap"><table class="iq-tab">' + head + body +
      '<tr class="fr"><th>' + fname + '</th>' + fcells + '<td></td></tr></table></div>';
    return { html: html, iv: iv, pv: pv };
  }

  /* The heart of it: n/d op 0, with extra polynomials whose zeros are not
     allowed (denominators that cancelled, or came from elsewhere). */
  function ratSolve(n, d, exPolys, op, v, fname) {
    v = v || 'x';
    var excl = [];
    (exPolys || []).concat([d]).forEach(function (q) { if (pDeg(q) > 0) { excl = excl.concat(rootsOf(q)); } });
    excl = uniqPts(excl);
    if (pIsZero(n)) {
      var okZ = wants(op, 0);
      var setZ = okZ ? compl(excl.length ? excl.map(function (p) { return { a: p, ac: true, b: p, bc: true }; }) : []) : [];
      return { set: okZ ? (excl.length ? setZ : ALL) : [], zero: true, crit: excl, excl: excl, rows: [], FN: { c: F0, fs: [] }, FD: { c: F1, fs: [] } };
    }
    var g = pGcd(n, d);
    if (pDeg(g) > 0) { n = pDivmod(n, g).q; d = pDivmod(d, g).q; }
    var FN = factorPoly(n), FD = factorPoly(d);
    var c = div(FN.c, FD.c);
    var rows = rowsOf(c, FN, FD, v);
    var zeros = [];
    FN.fs.forEach(function (f) { zeros = zeros.concat(f.roots); });
    var crit = uniqPts(zeros.concat(excl));
    var tb = signTable(rows, crit, excl, fname || ('f(' + v + ')'), v);
    var iv = tb.iv.map(function (s) { return wants(op, s); });
    var pv = tb.pv.map(function (s) { return s !== 'U' && wants(op, s); });
    return {
      set: fromFlags(crit, iv, pv), table: tb.html, crit: crit, excl: excl, zeros: uniqPts(zeros),
      FN: FN, FD: FD, c: c, n: n, d: d, rows: rows
    };
  }

  /* ============================================================== parser
     What students type: 2x, 3(x+1), (x−1)(x+2), x², x^3, |2x − 1|, √(x+3),
     √x, sqrt(x), 2^(x+1), e^x, exp(x), log_2(x), log_(1/2)(x), log2(x),
     log x (base 10), ln x, ln²x, sin 2x, cos(x − π/3), tan x, π, pi.
     Relations: < > ≤ ≥ <= >= ≠ and chains (−3 < 2x + 1 ≤ 7). Several
     inequalities: one per line, or separated by ";".

     AST nodes:  {t:'n', v}  {t:'x'}  {t:'y'}  {t:'c', k:'e'|'pi'}
                 {t:'+'|'-'|'*'|'/'|'^', a, b}  {t:'neg', a}
                 {t:'f', f:'sqrt'|'abs'|'ln'|'log'|'exp'|'sin'|'cos'|'tan'|'cbrt', a, base} */
  var FUNS = ['sqrt', 'cbrt', 'abs', 'ln', 'lg', 'log', 'exp', 'sin', 'cos', 'tan', 'cot'];
  var RELS = { '<': '<', '>': '>', '<=': '≤', '>=': '≥', '=<': '≤', '=>': '≥', '≤': '≤', '≥': '≥', '≠': '≠', '!=': '≠', '<>': '≠', '⩽': '≤', '⩾': '≥' };

  function ParseError(en, km) { this.en = en; this.km = km; }

  function normalise(s) {
    return A.unKh(String(s))
      .replace(/[−–—]/g, '-').replace(/[×·∙⋅]/g, '*').replace(/÷/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4')
      .replace(/√/g, ' sqrt ').replace(/∛/g, ' cbrt ').replace(/π/g, ' pi ')
      .replace(/\s+/g, ' ');
  }

  function tokenize(s, vars) {
    var toks = [], i = 0;
    while (i < s.length) {
      var ch = s[i];
      if (ch === ' ') { i++; continue; }
      var two = s.substr(i, 2);
      if (RELS[two]) { toks.push({ k: 'rel', v: RELS[two] }); i += 2; continue; }
      if (RELS[ch]) { toks.push({ k: 'rel', v: RELS[ch] }); i++; continue; }
      if (ch === '=') { throw new ParseError('This is an equation (=). Use the Equation Solver for equations, or one of < > ≤ ≥ here.', 'នេះជាសមីការ (=)។ សូមប្រើកម្មវិធីដោះស្រាយសមីការ ឬប្រើ < > ≤ ≥ នៅទីនេះ។'); }
      if (/[0-9.]/.test(ch)) {
        var m = /^(\d+(?:[.,]\d+)?|\.\d+)/.exec(s.slice(i));
        if (!m) { throw new ParseError('A number is not written correctly.', 'លេខមួយសរសេរមិនត្រឹមត្រូវ។'); }
        var txt = m[1].replace(',', '.');
        var parts = txt.split('.');
        var frac = parts[1] || '';
        toks.push({ k: 'num', v: F(BigInt((parts[0] || '0') + frac), BigInt('1' + '0'.repeat(frac.length))) });
        i += m[1].length; continue;
      }
      if (/[a-z]/i.test(ch)) {
        var rest = s.slice(i).toLowerCase(), hit = null;
        for (var f = 0; f < FUNS.length; f++) { if (rest.indexOf(FUNS[f]) === 0) { hit = FUNS[f]; break; } }
        if (hit) { toks.push({ k: 'fn', v: hit === 'lg' ? 'log' : hit }); i += hit.length; continue; }
        if (rest.indexOf('pi') === 0) { toks.push({ k: 'c', v: 'pi' }); i += 2; continue; }
        var c = rest[0];
        if (c === 'e') { toks.push({ k: 'c', v: 'e' }); i++; continue; }
        if (vars.indexOf(c) !== -1) { toks.push({ k: 'var', v: c }); i++; continue; }
        throw new ParseError('Unknown letter "' + s[i] + '". Use x' + (vars.length > 1 ? ' and y' : '') + ' as the unknown.',
                             'អក្សរ "' + s[i] + '" មិនស្គាល់។ សូមប្រើ x' + (vars.length > 1 ? ' និង y' : '') + ' ជាអញ្ញាត។');
      }
      if ('+-*/^()|_{}[],'.indexOf(ch) !== -1) { toks.push({ k: ch }); i++; continue; }
      throw new ParseError('The symbol "' + ch + '" is not understood.', 'និមិត្តសញ្ញា "' + ch + '" មិនស្គាល់។');
    }
    return toks;
  }

  function Parser(toks) { this.t = toks; this.i = 0; this.abs = 0; }
  Parser.prototype.peek = function () { return this.t[this.i]; };
  Parser.prototype.next = function () { return this.t[this.i++]; };
  Parser.prototype.is = function (k) { var p = this.t[this.i]; return p && p.k === k; };
  Parser.prototype.expect = function (k) {
    if (!this.is(k)) { throw new ParseError('Missing "' + (k === ')' ? ')' : k) + '".', 'ខ្វះ "' + k + '"។'); }
    return this.next();
  };
  Parser.prototype.startsPrimary = function () {
    var p = this.peek();
    if (!p) { return false; }
    return p.k === 'num' || p.k === 'var' || p.k === 'c' || p.k === 'fn' || p.k === '(' || (p.k === '|' && this.abs === 0);
  };
  Parser.prototype.expr = function () {
    var a = this.term();
    while (this.is('+') || this.is('-')) {
      var op = this.next().k;
      a = { t: op, a: a, b: this.term() };
    }
    return a;
  };
  Parser.prototype.term = function () {
    var a = this.unary();
    for (;;) {
      if (this.is('*') || this.is('/')) {
        var op = this.next().k;
        a = { t: op, a: a, b: this.unary() };
      } else if (this.startsPrimary()) {
        a = { t: '*', a: a, b: this.power() };
      } else { break; }
    }
    return a;
  };
  Parser.prototype.unary = function () {
    if (this.is('-')) { this.next(); return { t: 'neg', a: this.unary() }; }
    if (this.is('+')) { this.next(); return this.unary(); }
    return this.power();
  };
  Parser.prototype.power = function () {
    var b = this.primary();
    if (this.is('^')) {
      this.next();
      var e = this.is('-') ? (this.next(), { t: 'neg', a: this.power() }) : this.power();
      return { t: '^', a: b, b: e };
    }
    return b;
  };
  /* the argument of a function written without brackets: sin 2x, ln x, √x */
  Parser.prototype.bareArg = function () {
    if (this.is('(')) { return this.primary(); }
    var a = this.power();
    while (this.peek() && (this.peek().k === 'var' || this.peek().k === 'c')) {
      a = { t: '*', a: a, b: this.power() };
    }
    return a;
  };
  Parser.prototype.primary = function () {
    var p = this.next();
    if (!p) { throw new ParseError('The inequality stops too early.', 'វិសមីការបញ្ចប់មុនពេល។'); }
    if (p.k === 'num') { return { t: 'n', v: p.v }; }
    if (p.k === 'var') { return { t: p.v }; }
    if (p.k === 'c') { return { t: 'c', k: p.v }; }
    if (p.k === '(' || p.k === '[' || p.k === '{') {
      var close = p.k === '(' ? ')' : p.k === '[' ? ']' : '}';
      var save = this.abs; this.abs = 0;
      var e = this.expr();
      this.abs = save;
      this.expect(close);
      return e;
    }
    if (p.k === '|') {
      this.abs++;
      var inner = this.expr();
      this.abs--;
      this.expect('|');
      return { t: 'f', f: 'abs', a: inner };
    }
    if (p.k === 'fn') {
      var node = { t: 'f', f: p.v }, pw = null;
      if (p.v === 'log') {
        if (this.is('_')) {
          this.next();
          if (this.is('(') || this.is('{') || this.is('[')) {
            var o = this.next().k, c2 = o === '(' ? ')' : o === '{' ? '}' : ']';
            node.base = this.expr(); this.expect(c2);
          } else { node.base = this.primary(); }
        } else if (this.is('num') && this.t[this.i + 1] && this.t[this.i + 1].k === '(') {
          node.base = { t: 'n', v: this.next().v };
        } else { node.base = { t: 'n', v: F(10) }; }
      }
      if (this.is('^') && this.t[this.i + 1] && this.t[this.i + 1].k === 'num') {   /* ln²x, sin^2 x */
        this.next(); pw = this.next().v;
      }
      node.a = this.bareArg();
      if (p.v === 'cot') { node = { t: '/', a: { t: 'n', v: F1 }, b: { t: 'f', f: 'tan', a: node.a } }; }
      return pw ? { t: '^', a: node, b: { t: 'n', v: pw } } : node;
    }
    throw new ParseError('Something is missing near "' + (p.k === 'rel' ? p.v : p.k) + '".', 'មានអ្វីមួយខ្វះនៅជិត "' + (p.k === 'rel' ? p.v : p.k) + '"។');
  };

  /* "a < b ≤ c ; d > e" → [ {terms:[a,b,c], ops:['<','≤']}, … ] */
  function parseAll(text, vars) {
    var lines = String(text).split(/[;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) { throw new ParseError('Type an inequality, for example 2x − 5 > 3.', 'សូមវាយវិសមីការ ឧទាហរណ៍ 2x − 5 > 3។'); }
    return lines.map(function (line) {
      var toks = tokenize(normalise(line), vars);
      var groups = [[]], ops = [];
      toks.forEach(function (t) { if (t.k === 'rel') { ops.push(t.v); groups.push([]); } else { groups[groups.length - 1].push(t); } });
      if (!ops.length) { throw new ParseError('There is no inequality sign. Use < > ≤ or ≥.', 'គ្មានសញ្ញាវិសមភាពទេ។ សូមប្រើ < > ≤ ឬ ≥។'); }
      var terms = groups.map(function (g) {
        if (!g.length) { throw new ParseError('One side of the inequality is empty.', 'អង្គម្ខាងនៃវិសមីការទទេ។'); }
        var p = new Parser(g), e = p.expr();
        if (p.i < g.length) { throw new ParseError('Something extra near the end: check the brackets.', 'មានអ្វីលើសនៅខាងចុង៖ សូមពិនិត្យវង់ក្រចក។'); }
        return e;
      });
      return { terms: terms, ops: ops, src: line };
    });
  }

  /* ========================================================= AST helpers */
  function N(v) { return { t: 'n', v: v }; }
  function has(e, pred) {
    if (!e || typeof e !== 'object') { return false; }
    if (pred(e)) { return true; }
    return has(e.a, pred) || has(e.b, pred) || has(e.base, pred);
  }
  function hasX(e) { return has(e, function (n) { return n.t === 'x'; }); }
  function hasVar(e) { return has(e, function (n) { return n.t === 'x' || n.t === 'y'; }); }
  function collect(e, pred, out) {
    out = out || [];
    if (!e || typeof e !== 'object') { return out; }
    if (pred(e)) { out.push(e); }
    collect(e.a, pred, out); collect(e.b, pred, out); collect(e.base, pred, out);
    return out;
  }
  function key(e) { return astP(e, true); }
  function replace(e, pred, fn) {
    if (!e || typeof e !== 'object') { return e; }
    if (pred(e)) { return fn(e); }
    var o = {};
    for (var k in e) { o[k] = e[k]; }
    if (e.a) { o.a = replace(e.a, pred, fn); }
    if (e.b) { o.b = replace(e.b, pred, fn); }
    if (e.base) { o.base = replace(e.base, pred, fn); }
    return o;
  }

  /* an exact rational constant, or null */
  function constVal(e) {
    if (!e || hasVar(e)) { return null; }
    switch (e.t) {
      case 'n': return e.v;
      case 'neg': var a = constVal(e.a); return a ? neg(a) : null;
      case '+': case '-': case '*': case '/':
        var x = constVal(e.a), y = constVal(e.b);
        if (!x || !y) { return null; }
        if (e.t === '/') { return isZ(y) ? null : div(x, y); }
        return e.t === '+' ? add(x, y) : e.t === '-' ? sub(x, y) : mul(x, y);
      case '^':
        var b = constVal(e.a), k = constVal(e.b);
        if (!b || !k) { return null; }
        if (isInt(k) && babs(k.n) <= BigInt(64)) { return (isZ(b) && sgn(k) < 0) ? null : fpow(b, Number(k.n)); }
        if (sgn(b) > 0 && k.d <= BigInt(6)) {      /* 8^(1/3) = 2, 4^(3/2) = 8 */
          var rn = iroot(b.n, Number(k.d)), rd = iroot(b.d, Number(k.d));
          if (rn !== null && rd !== null) { return fpow(F(rn, rd), Number(k.n)); }
        }
        return null;
      case 'f':
        var v = constVal(e.a);
        if (!v) { return null; }
        if (e.f === 'abs') { return fabs(v); }
        if (e.f === 'sqrt' && sgn(v) >= 0) { var sn = isqrtB(v.n), sd = isqrtB(v.d); return (sn !== null && sd !== null) ? F(sn, sd) : null; }
        if (e.f === 'cbrt') { var cn = iroot(babs(v.n), 3), cd = iroot(v.d, 3); return (cn !== null && cd !== null) ? F(sgn(v) < 0 ? -cn : cn, cd) : null; }
        if ((e.f === 'log' || e.f === 'ln') && eq(v, F1)) { return F0; }
        if ((e.f === 'sin' || e.f === 'tan') && isZ(v)) { return F0; }
        if (e.f === 'cos' && isZ(v)) { return F1; }
        if (e.f === 'log' && e.base) {
          var bv = constVal(e.base);
          if (bv && sgn(bv) > 0 && !eq(bv, F1) && sgn(v) > 0) { var lg = logExact(v, bv); if (lg) { return lg; } }
        }
        return null;
    }
    return null;
  }
  /* log_b(v) when it is rational: log_2 8 = 3, log_4 2 = 1/2, log_(1/3) 9 = −2 */
  function logExact(v, b) {
    var B = canonBase(b), V = canonBase(v);
    if (!B || !V) { return null; }
    if (eq(V.r, F1)) { return F0; }
    if (!eq(B.r, V.r)) { return null; }
    return F(V.k, B.k);
  }
  /* b = r^k with r > 1 as small as possible (and k ≠ 0): 8 → 2³, 1/4 → 2⁻², 9/4 → (3/2)² */
  function canonBase(b) {
    if (sgn(b) <= 0) { return null; }
    if (eq(b, F1)) { return { r: F1, k: 1 }; }
    var inv = cmp(b, F1) < 0, x = inv ? div(F1, b) : b;
    for (var k = 64; k >= 1; k--) {
      var rn = iroot(x.n, k), rd = iroot(x.d, k);
      if (rn !== null && rd !== null) { return { r: F(rn, rd), k: inv ? -k : k }; }
    }
    return { r: x, k: inv ? -1 : 1 };
  }

  /* numeric value at x (and y); NaN where undefined */
  function ev(e, x, y) {
    switch (e.t) {
      case 'n': return e.nv !== undefined ? e.nv : (e.nv = num(e.v));
      case 'x': return x;
      case 'y': return y;
      case 'c': return e.k === 'e' ? Math.E : Math.PI;
      case 'neg': return -ev(e.a, x, y);
      case '+': return ev(e.a, x, y) + ev(e.b, x, y);
      case '-': return ev(e.a, x, y) - ev(e.b, x, y);
      case '*': return ev(e.a, x, y) * ev(e.b, x, y);
      case '/': var d = ev(e.b, x, y); return d === 0 ? NaN : ev(e.a, x, y) / d;
      case '^':
        var b = ev(e.a, x, y), k = ev(e.b, x, y);
        if (b < 0) {
          if (Number.isInteger(k)) { return Math.pow(b, k); }
          var kc = constVal(e.b);
          if (kc && kc.d % TWO === ONE) { var r = Math.pow(-b, k); return (kc.n % TWO === ZERO) ? r : -r; }
          return NaN;
        }
        if (b === 0 && k < 0) { return NaN; }
        return Math.pow(b, k);
      case 'f':
        var a = ev(e.a, x, y);
        switch (e.f) {
          case 'sqrt': return a < 0 ? NaN : Math.sqrt(a);
          case 'cbrt': return Math.cbrt(a);
          case 'abs': return Math.abs(a);
          case 'ln': return a <= 0 ? NaN : Math.log(a);
          case 'log':
            var bb = ev(e.base, x, y);
            return (a <= 0 || bb <= 0 || bb === 1) ? NaN : Math.log(a) / Math.log(bb);
          case 'exp': return Math.exp(a);
          case 'sin': return Math.sin(a);
          case 'cos': return Math.cos(a);
          case 'tan': var c = Math.cos(a); return Math.abs(c) < 1e-15 ? NaN : Math.tan(a);
        }
    }
    return NaN;
  }

  /* ---------------------------------------------------- printing an AST */
  var PREC = { '+': 1, '-': 1, '*': 2, '/': 2, 'neg': 2, '^': 4, n: 5, x: 5, y: 5, c: 5, f: 5 };
  function prec(e) { return (e.t === 'n' && sgn(e.v) < 0) ? 2 : PREC[e.t]; }
  function startsDigit(e) {
    while (e.t === '*' || e.t === '^') { e = e.a; }
    return e.t === 'n' || (e.t === '/' && startsDigit(e.a));
  }
  function astH(e) {
    switch (e.t) {
      case 'n': return H(e.v);
      case 'x': return 'x';
      case 'y': return 'y';
      case 'c': return e.k === 'e' ? 'e' : 'π';
      case 'neg': return '−' + (prec(e.a) <= 2 ? '(' + astH(e.a) + ')' : astH(e.a));
      case '+':
        if (e.b.t === 'neg') { return astH(e.a) + ' − ' + wrap(e.b.a, 2); }
        if (e.b.t === 'n' && sgn(e.b.v) < 0) { return astH(e.a) + ' − ' + H(fabs(e.b.v)); }
        return astH(e.a) + ' + ' + astH(e.b);
      case '-': return astH(e.a) + ' − ' + wrap(e.b, 2);
      case '*':
        var l = wrap(e.a, 2), r = wrap(e.b, 2);
        if (e.a.t === 'n' && eq(e.a.v, F(-1))) { return '−' + r; }
        return l + ((startsDigit(e.b) || (e.a.t === '/' && e.b.t === '/')) ? ' · ' : '') + r;
      case '/': return fracH(astH(e.a), astH(e.b));
      case '^':
        var base = (e.a.t === 'f' && e.a.f !== 'abs' && e.a.f !== 'sqrt') ? '(' + astH(e.a) + ')' : wrap(e.a, 5);
        if (e.a.t === 'c' && e.a.k === 'e') { base = 'e'; }
        if (e.a.t === 'f' && (e.a.f === 'ln' || e.a.f === 'log' || e.a.f === 'sin' || e.a.f === 'cos' || e.a.f === 'tan')) {
          return fnName(e.a) + '<sup>' + astH(e.b) + '</sup>' + fnArg(e.a);
        }
        return base + '<sup>' + astH(e.b) + '</sup>';
      case 'f':
        if (e.f === 'abs') { return '|' + astH(e.a) + '|'; }
        if (e.f === 'sqrt') { return '√<span class="iq-rad">' + astH(e.a) + '</span>'; }
        if (e.f === 'cbrt') { return '∛<span class="iq-rad">' + astH(e.a) + '</span>'; }
        if (e.f === 'exp') { return 'e<sup>' + astH(e.a) + '</sup>'; }
        return fnName(e) + fnArg(e);
    }
    return '?';
  }
  function fnName(e) {
    if (e.f === 'log') {
      var bv = constVal(e.base);
      if (bv && eq(bv, F(10))) { return 'log'; }
      return 'log<sub>' + astH(e.base) + '</sub>';
    }
    return e.f;
  }
  function fnArg(e) {
    var a = e.a;
    var simple = a.t === 'x' || (a.t === 'n' && sgn(a.v) >= 0 && isInt(a.v)) || (a.t === '*' && a.a.t === 'n' && a.b.t === 'x');
    return simple ? ' ' + astH(a) : '(' + astH(a) + ')';
  }
  function wrap(e, p) { return prec(e) < p ? '(' + astH(e) + ')' : astH(e); }

  /* plain text — for copying, and (strict) as a structural key */
  function astP(e, strict) {
    var w = function (x, p) { return prec(x) < p ? '(' + astP(x, strict) + ')' : astP(x, strict); };
    switch (e.t) {
      case 'n': return strict ? plain(e.v) : plainK(e.v);
      case 'x': case 'y': return e.t;
      case 'c': return e.k === 'e' ? 'e' : 'π';
      case 'neg': return '-' + w(e.a, 3);
      case '+': return astP(e.a, strict) + ' + ' + astP(e.b, strict);
      case '-': return astP(e.a, strict) + ' - ' + w(e.b, 2);
      case '*': return w(e.a, 2) + '*' + w(e.b, 2);
      case '/': return w(e.a, 3) + '/' + w(e.b, 3);
      case '^': return w(e.a, 5) + '^' + w(e.b, 5);
      case 'f':
        if (e.f === 'abs') { return '|' + astP(e.a, strict) + '|'; }
        if (e.f === 'log') { return 'log_' + w(e.base, 5) + '(' + astP(e.a, strict) + ')'; }
        return e.f + '(' + astP(e.a, strict) + ')';
    }
    return '?';
  }
  function relH(terms, ops) {
    var out = astH(terms[0]);
    for (var i = 0; i < ops.length; i++) { out += ' ' + ops[i] + ' ' + astH(terms[i + 1]); }
    return out;
  }

  /* ================================================ to a rational function
     {n, d, ex}: n/d with polynomial n, d in the variable; ex = polynomials
     whose zeros are excluded (every denominator met on the way). `hook`
     lets a caller treat a node as the variable (t = 2^x, t = ln x …). */
  function toRat(e, hook) {
    if (hook) { var h = hook(e); if (h !== undefined) { return h; } }
    switch (e.t) {
      case 'n': return { n: [e.v], d: [F1], ex: [] };
      case 'x': return hook ? null : { n: PX.slice(), d: [F1], ex: [] };
      case 'y': case 'c': return null;
      case 'neg': var a = toRat(e.a, hook); return a ? { n: pNeg(a.n), d: a.d, ex: a.ex } : null;
      case '+': case '-': case '*': case '/':
        var L = toRat(e.a, hook), R = toRat(e.b, hook);
        if (!L || !R) { return null; }
        var ex = L.ex.concat(R.ex), n, d;
        if (e.t === '+' || e.t === '-') {
          var g = pGcd(L.d, R.d), dl = pDivmod(L.d, g).q, dr = pDivmod(R.d, g).q;
          n = (e.t === '+' ? pAdd : pSub)(pMul(L.n, dr), pMul(R.n, dl));
          d = pMul(pMul(dl, dr), g);
        } else if (e.t === '*') { n = pMul(L.n, R.n); d = pMul(L.d, R.d); }
        else {
          if (pIsZero(R.n)) { return null; }
          n = pMul(L.n, R.d); d = pMul(L.d, R.n);
          if (pDeg(R.n) > 0) { ex.push(R.n); }
        }
        return reduceR(n, d, ex);
      case '^':
        var k = constVal(e.b);
        if (!k || !isInt(k) || babs(k.n) > BigInt(40)) {
          if (!hasX(e.b) && !hook) { var cv = constVal(e); if (cv) { return { n: [cv], d: [F1], ex: [] }; } }
          return null;
        }
        var B = toRat(e.a, hook);
        if (!B) { return null; }
        var kk = Number(k.n);
        if (kk >= 0) { return reduceR(pPow(B.n, kk), pPow(B.d, kk), B.ex); }
        if (pIsZero(B.n)) { return null; }
        return reduceR(pPow(B.d, -kk), pPow(B.n, -kk), B.ex.concat(pDeg(B.n) > 0 ? [B.n] : []));
      case 'f':
        var c = hasVar(e) ? null : constVal(e);
        return c ? { n: [c], d: [F1], ex: [] } : null;
    }
    return null;
  }
  function reduceR(n, d, ex) {
    var g = pGcd(n, d);
    if (pDeg(g) > 0) { n = pDivmod(n, g).q; d = pDivmod(d, g).q; }
    var l = pLead(d);
    return { n: pScale(n, div(F1, l)), d: pScale(d, div(F1, l)), ex: ex };
  }

  /* ====================================================== words & format */
  function tr(en, km) { return A.lang() === 'km' ? km : en; }
  var CFG = { notation: null };   /* 'en' (a, b)  or  'fr' ]a ; b[ — null follows the language */
  function style() { return CFG.notation || (A.lang() === 'km' ? 'fr' : 'en'); }

  var KIND = {
    lin:   ['Linear inequality', 'វិសមីការដឺក្រេទី១'],
    dbl:   ['Double inequality', 'វិសមីការពីរជាន់'],
    sys:   ['System of inequalities', 'ប្រព័ន្ធវិសមីការ'],
    quad:  ['Quadratic inequality', 'វិសមីការដឺក្រេទី២'],
    poly:  ['Polynomial inequality', 'វិសមីការពហុធា'],
    rat:   ['Rational inequality', 'វិសមីការសនិទាន (មានភាគបែង)'],
    abs:   ['Absolute value inequality', 'វិសមីការមានតម្លៃដាច់ខាត'],
    rad:   ['Square root inequality', 'វិសមីការមានឫសការេ'],
    exp:   ['Exponential inequality', 'វិសមីការអិចស្ប៉ូណង់ស្យែល'],
    log:   ['Logarithmic inequality', 'វិសមីការលោការីត'],
    trig:  ['Trigonometric inequality', 'វិសមីការត្រីកោណមាត្រ'],
    num:   ['Solved numerically', 'ដោះស្រាយដោយវិធីលេខប្រហែល'],
    cst:   ['No unknown', 'គ្មានអញ្ញាត'],
    two:   ['Two variables — a region of the plane', 'អញ្ញាតពីរ — តំបន់នៃប្លង់']
  };
  function kindName(k) { var p = KIND[k] || KIND.num; return tr(p[0], p[1]); }

  function ptH(p) { return p.h; }
  function bracketsOf(s) { return style() === 'fr' ? { lo: [']', '['], hi: ['[', ']'], sep: ' ; ' } : { lo: ['(', '['], hi: [')', ']'], sep: ', ' }; }
  /* S as interval notation (h: HTML, p: plain) */
  function fmtSet(S, v) {
    v = v || 'x';
    if (!S.length) { return { h: '∅', p: '∅' }; }
    if (isAll(S)) { return { h: 'ℝ', p: 'ℝ' }; }
    var C = compl(S);
    if (C.length && C.every(function (s) { return s.a && s.b && ptEq(s.a, s.b); })) {
      var bs = bracketsOf();
      return { h: 'ℝ \\ {' + C.map(function (s) { return s.a.h; }).join(bs.sep) + '}',
               p: 'ℝ \\ {' + C.map(function (s) { return s.a.p; }).join(bs.sep) + '}' };
    }
    var b = bracketsOf();
    var parts = S.map(function (s) {
      if (s.a && s.b && ptEq(s.a, s.b)) { return { h: '{' + s.a.h + '}', p: '{' + s.a.p + '}' }; }
      var lo = s.a ? (s.ac ? b.lo[1] : b.lo[0]) : b.lo[0], hi = s.b ? (s.bc ? b.hi[1] : b.hi[0]) : b.hi[0];
      var ah = s.a ? s.a.h : '−∞', ap = s.a ? s.a.p : '−∞', bh = s.b ? s.b.h : '+∞', bp = s.b ? s.b.p : '+∞';
      return { h: lo + ah + b.sep + bh + hi, p: lo + ap + b.sep + bp + hi };
    });
    return { h: parts.map(function (x) { return x.h; }).join(' ∪ '), p: parts.map(function (x) { return x.p; }).join(' ∪ ') };
  }
  /* S as inequalities on x: "x < −2 or x > 3" */
  function fmtIneq(S, v) {
    v = v || 'x';
    if (!S.length) { return { h: tr('no value of ' + v, 'គ្មានតម្លៃ ' + v + ' ណាមួយ'), p: '-' }; }
    if (isAll(S)) { return { h: tr('every real ' + v, 'គ្រប់ចំនួនពិត ' + v), p: v + ' ∈ ℝ' }; }
    var C = compl(S);
    if (C.length && C.every(function (s) { return s.a && s.b && ptEq(s.a, s.b); })) {
      return { h: C.map(function (s) { return v + ' ≠ ' + s.a.h; }).join(', '), p: C.map(function (s) { return v + ' ≠ ' + s.a.p; }).join(', ') };
    }
    var orW = tr(' or ', ' ឬ ');
    var parts = S.map(function (s) {
      if (s.a && s.b && ptEq(s.a, s.b)) { return [v + ' = ' + s.a.h, v + ' = ' + s.a.p]; }
      if (!s.a) { return [v + (s.bc ? ' ≤ ' : ' < ') + s.b.h, v + (s.bc ? ' ≤ ' : ' < ') + s.b.p]; }
      if (!s.b) { return [v + (s.ac ? ' ≥ ' : ' > ') + s.a.h, v + (s.ac ? ' ≥ ' : ' > ') + s.a.p]; }
      return [s.a.h + (s.ac ? ' ≤ ' : ' < ') + v + (s.bc ? ' ≤ ' : ' < ') + s.b.h, s.a.p + (s.ac ? ' ≤ ' : ' < ') + v + (s.bc ? ' ≤ ' : ' < ') + s.b.p];
    });
    return { h: parts.map(function (x) { return x[0]; }).join(orW), p: parts.map(function (x) { return x[1]; }).join(orW) };
  }
  function ptsList(list) { return list.map(ptH).join(tr(', ', ', ')); }
  function setB(S) { return '<b class="iq-ans">' + fmtSet(S).h + '</b>'; }
  function detail(title, r) {
    var steps = r.steps || [];
    return '<details class="iq-sub"><summary>' + title + ' <span class="iq-arrow">⟹</span> ' + setB(r.set) + '</summary>' +
      (steps.length ? '<ol class="es-steps">' + steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' : '') + '</details>';
  }

  /* ===================================================== AST builders */
  function isNum(e) { return e && e.t === 'n'; }
  function cv0(e) { var c = constVal(e); return c && isZ(c); }
  function addE(a, b) {
    var ca = constVal(a), cb = constVal(b);
    if (ca && cb) { return N(add(ca, cb)); }
    if (ca && isZ(ca)) { return b; }
    if (cb && isZ(cb)) { return a; }
    if (cb && sgn(cb) < 0) { return { t: '-', a: a, b: N(neg(cb)) }; }
    return { t: '+', a: a, b: b };
  }
  function subE(a, b) {
    var ca = constVal(a), cb = constVal(b);
    if (ca && cb) { return N(sub(ca, cb)); }
    if (cb && isZ(cb)) { return a; }
    if (ca && isZ(ca)) { return negE(b); }
    return { t: '-', a: a, b: b };
  }
  function negE(a) {
    var c = constVal(a);
    if (c) { return N(neg(c)); }
    if (a.t === 'neg') { return a.a; }
    return { t: 'neg', a: a };
  }
  function mulC(c, a) {
    if (isZ(c)) { return N(F0); }
    if (eq(c, F1)) { return a; }
    var ca = constVal(a);
    if (ca) { return N(mul(c, ca)); }
    if (eq(c, F(-1))) { return negE(a); }
    return { t: '*', a: N(c), b: a };
  }
  function mulE(a, b) {
    var ca = constVal(a), cb = constVal(b);
    if (ca) { return mulC(ca, b); }
    if (cb) { return mulC(cb, a); }
    return { t: '*', a: a, b: b };
  }
  function powE(a, k) { return k === 1 ? a : { t: '^', a: a, b: N(F(k)) }; }
  /* a polynomial back into an AST, highest power first */
  function polyAst(p, v) {
    p = pTrim(p);
    var out = null;
    for (var i = p.length - 1; i >= 0; i--) {
      var c = p[i];
      if (isZ(c)) { continue; }
      var mono = i === 0 ? null : (i === 1 ? { t: v } : { t: '^', a: { t: v }, b: N(F(i)) });
      if (!out) { out = mono ? mulC(c, mono) : N(c); continue; }
      var body = mono ? mulC(fabs(c), mono) : N(fabs(c));
      out = sgn(c) < 0 ? { t: '-', a: out, b: body } : { t: '+', a: out, b: body };
    }
    return out || N(F0);
  }
  /* tidy an expression when it is rational: (x + 3) − 5 → x − 2 */
  function simp(e) {
    if (!hasX(e)) { var c = constVal(e); return c ? N(c) : e; }
    var R = toRat(e);
    if (!R) { return e; }
    if (pDeg(R.d) <= 0) { return polyAst(pScale(R.n, div(F1, R.d[0])), 'x'); }
    var pn = pPrim(R.n), pd = pPrim(R.d), k = div(pn.c, pd.c);
    return mulC(k, { t: '/', a: polyAst(pn.p, 'x'), b: polyAst(pd.p, 'x') });
  }
  /* e = k·(the node with key K) + rest, k constant; null if K appears any other way */
  function lin(e, K) {
    if (key(e) === K) { return { k: F1, rest: N(F0) }; }
    if (!has(e, function (n) { return key(n) === K; })) { return { k: F0, rest: e }; }
    var a, b, c;
    switch (e.t) {
      case '+': case '-':
        a = lin(e.a, K); b = lin(e.b, K);
        if (!a || !b) { return null; }
        return e.t === '+' ? { k: add(a.k, b.k), rest: addE(a.rest, b.rest) } : { k: sub(a.k, b.k), rest: subE(a.rest, b.rest) };
      case 'neg':
        a = lin(e.a, K);
        return a ? { k: neg(a.k), rest: negE(a.rest) } : null;
      case '*':
        c = constVal(e.a);
        if (c) { b = lin(e.b, K); return b ? { k: mul(c, b.k), rest: mulC(c, b.rest) } : null; }
        c = constVal(e.b);
        if (c) { a = lin(e.a, K); return a ? { k: mul(c, a.k), rest: mulC(c, a.rest) } : null; }
        return null;
      case '/':
        c = constVal(e.b);
        if (c && !isZ(c)) { a = lin(e.a, K); return a ? { k: div(a.k, c), rest: mulC(div(F1, c), a.rest) } : null; }
        return null;
    }
    return null;
  }
  function uniqKeys(nodes) {
    var seen = {}, out = [];
    nodes.forEach(function (n) { var k = key(n); if (!seen[k]) { seen[k] = 1; out.push(n); } });
    return out;
  }
  function domainOf(e) {
    var R = toRat(e);
    if (!R) { return ALL; }
    var ex = [];
    R.ex.forEach(function (q) { ex = ex.concat(rootsOf(q)); });
    ex = uniqPts(ex);
    return ex.length ? compl(ex.map(function (p) { return { a: p, ac: true, b: p, bc: true }; })) : ALL;
  }

  function I(L, op, R) { return astH(L) + ' ' + op + ' ' + astH(R); }
  function res(set, steps, kind, extra) {
    var r = { set: set, steps: steps, kind: kind };
    if (extra) { for (var k in extra) { r[k] = extra[k]; } }
    return r;
  }

  /* =================================================== the dispatcher */
  function solveOne(Lf, op, Rf, depth) {
    depth = depth || 0;
    if (depth > 8) { return null; }
    if (!hasX(Lf) && !hasX(Rf)) {
      var lv = ev(Lf), rv = ev(Rf), d = lv - rv;
      var s = Math.abs(d) < 1e-12 * Math.max(1, Math.abs(lv)) ? 0 : Math.sign(d);
      var ok = isFinite(d) && wants(op, s);
      return res(ok ? ALL : [], [tr('There is no x in it: ' + I(Lf, op, Rf) + ' is ' + (ok ? 'true, so every x works.' : 'false, so no x works.'),
                                   'គ្មាន x ទេ៖ ' + I(Lf, op, Rf) + (ok ? ' ពិត ដូច្នេះគ្រប់ x ផ្ទៀងផ្ទាត់។' : ' មិនពិត ដូច្នេះគ្មាន x ណាផ្ទៀងផ្ទាត់ទេ។'))], 'cst');
    }
    var one = function (n) { return n.t === '^' && !hasX(n.a) && hasX(n.b) && constVal(n.a) && eq(constVal(n.a), F1); };
    if (has(Lf, one) || has(Rf, one)) {   /* 1 to any power is 1 */
      return solveOne(replace(Lf, one, function () { return N(F1); }), op, replace(Rf, one, function () { return N(F1); }), depth + 1);
    }
    var RL = toRat(Lf), RR = toRat(Rf);
    if (RL && RR) { return ratClass(RL, RR, op, 'x', I(Lf, op, Rf), Lf, Rf); }
    var f = { t: '-', a: Lf, b: Rf };
    var tries = [absStrategy, radStrategy, logStrategy, expStrategy, trigStrategy];
    for (var i = 0; i < tries.length; i++) {
      var r = tries[i](Lf, op, Rf, f, depth);
      if (r) { return r; }
    }
    return numStrategy(Lf, op, Rf);
  }
  function solveSub(L, op, R, depth) {
    var r = solveOne(L, op, R, (depth || 0) + 1);
    return r || numStrategy(L, op, R);
  }

  /* ======================================= linear · quadratic · rational */
  function lcmDen(ps) {
    var m = ONE;
    ps.forEach(function (p) { p.forEach(function (c) { m = blcm(m, c.d); }); });
    return F(m);
  }
  function ratClass(RL, RR, op, v, shown, Lf, Rf) {
    var ex = RL.ex.concat(RR.ex);
    var xden = ex.some(function (q) { return pDeg(q) > 0; }) || pDeg(RL.d) > 0 || pDeg(RR.d) > 0;
    var n = pSub(pMul(RL.n, RR.d), pMul(RR.n, RL.d)), d = pMul(RL.d, RR.d);
    var degN = pDeg(n);
    if (!xden && degN <= 1) { return linSteps(RL, RR, op, v, Lf, Rf); }
    if (!xden && degN === 2) { return quadSteps(RL, RR, op, v, Lf, Rf); }
    return polySteps(n, d, ex.concat([RL.d, RR.d]), op, v, xden, RL, RR, Lf, Rf);
  }
  function hasBrackets(e) { return e && /[()]/.test(astP(e)); }

  function linSteps(RL, RR, op, v, Lf, Rf) {
    var st = [];
    var pl = pScale(RL.n, div(F1, RL.d[0])), pr = pScale(RR.n, div(F1, RR.d[0]));
    var m = lcmDen([pl, pr]);
    if (!eq(m, F1)) {
      pl = pScale(pl, m); pr = pScale(pr, m);
      st.push(tr('Multiply both sides by ' + H(m) + ' to clear the fractions (' + H(m) + ' > 0, so the sign stays): ' + polyH(pl, v) + ' ' + op + ' ' + polyH(pr, v),
                 'គុណអង្គទាំងពីរនឹង ' + H(m) + ' ដើម្បីលុបប្រភាគ (' + H(m) + ' > 0 សញ្ញានៅដដែល)៖ ' + polyH(pl, v) + ' ' + op + ' ' + polyH(pr, v)));
    } else if (hasBrackets(Lf) || hasBrackets(Rf)) {
      st.push(tr('Expand the brackets: ' + polyH(pl, v) + ' ' + op + ' ' + polyH(pr, v),
                 'ពន្លាតវង់ក្រចក៖ ' + polyH(pl, v) + ' ' + op + ' ' + polyH(pr, v)));
    }
    var a = sub(pl[1] || F0, pr[1] || F0), c = sub(pr[0] || F0, pl[0] || F0);
    var lhs = polyH([F0, a], v);
    if (!isZ(pr[1] || F0) || !isZ(pl[0] || F0)) {
      st.push(tr('Bring the ' + v + ' terms to the left and the numbers to the right: ' + lhs + ' ' + op + ' ' + H(c),
                 'ផ្ទេរតួមាន ' + v + ' ទៅខាងឆ្វេង និងចំនួនទៅខាងស្ដាំ៖ ' + lhs + ' ' + op + ' ' + H(c)));
    }
    if (isZ(a)) {
      var s = sgn(neg(c)), ok = wants(op, s);
      st.push(tr('This is 0 ' + op + ' ' + H(c) + ', which is ' + (ok ? 'true for every ' + v + '.' : 'never true.'),
                 'នេះគឺ 0 ' + op + ' ' + H(c) + ' ដែល' + (ok ? 'ពិតចំពោះគ្រប់ ' + v + '។' : 'មិនពិតដាច់ខាត។')));
      return res(ok ? ALL : [], st, 'lin');
    }
    var r = div(c, a), op2 = sgn(a) < 0 ? FLIP[op] : op;
    if (sgn(a) < 0) {
      st.push(tr('Divide both sides by ' + H(a) + '. <b class="iq-flip">It is negative, so the inequality sign is reversed</b>: ' + v + ' ' + op2 + ' ' + H(c) + ' ÷ ' + P(a) + ' = ' + H(r),
                 'ចែកអង្គទាំងពីរនឹង ' + H(a) + '។ <b class="iq-flip">វាអវិជ្ជមាន ដូច្នេះត្រូវប្ដូរទិសសញ្ញាវិសមភាព</b>៖ ' + v + ' ' + op2 + ' ' + H(c) + ' ÷ ' + P(a) + ' = ' + H(r)));
    } else if (!eq(a, F1)) {
      st.push(tr('Divide both sides by ' + H(a) + ' (positive, so the sign stays): ' + v + ' ' + op2 + ' ' + H(r),
                 'ចែកអង្គទាំងពីរនឹង ' + H(a) + ' (វិជ្ជមាន សញ្ញានៅដដែល)៖ ' + v + ' ' + op2 + ' ' + H(r)));
    }
    return res(ray(ptF(r), op2), st, 'lin');
  }

  function quadSteps(RL, RR, op, v, Lf, Rf) {
    var st = [];
    var q = pSub(pScale(RL.n, div(F1, RL.d[0])), pScale(RR.n, div(F1, RR.d[0])));
    var m = lcmDen([q]);
    if (!eq(m, F1)) { q = pScale(q, m); }
    var moved = !pIsZero(RR.n) || hasBrackets(Lf) || !eq(m, F1);
    if (moved) {
      st.push(tr('Bring everything to the left' + (!eq(m, F1) ? ' and multiply by ' + H(m) + ' (positive)' : '') + ': ' + polyH(q, v) + ' ' + op + ' 0',
                 'ផ្ទេរគ្រប់តួទៅខាងឆ្វេង' + (!eq(m, F1) ? ' ហើយគុណនឹង ' + H(m) + ' (វិជ្ជមាន)' : '') + '៖ ' + polyH(q, v) + ' ' + op + ' 0'));
    }
    var a = q[2], b = q[1] || F0, c = q[0] || F0;
    var D = sub(mul(b, b), mul(F(4), mul(a, c)));
    st.push(tr('a = ' + H(a) + ', b = ' + H(b) + ', c = ' + H(c) + '. Discriminant: Δ = b² − 4ac = ' + P(b) + '² − 4 × ' + P(a) + ' × ' + P(c) + ' = ' + H(D),
               'a = ' + H(a) + ', b = ' + H(b) + ', c = ' + H(c) + '។ ឌីស្ក្រីមីណង់៖ Δ = b² − 4ac = ' + P(b) + '² − 4 × ' + P(a) + ' × ' + P(c) + ' = ' + H(D)));
    var rs = ratSolve(q, [F1], [], op, v);
    var aSign = sgn(a) > 0 ? tr('positive', 'វិជ្ជមាន') : tr('negative', 'អវិជ្ជមាន');
    if (sgn(D) > 0) {
      var roots = rs.zeros;
      st.push(tr('Δ > 0: two roots, ' + v + '₁ = ' + roots[0].h + ' and ' + v + '₂ = ' + roots[1].h + '. The trinomial has the sign of a (' + aSign + ') outside the roots and the opposite sign between them.',
                 'Δ > 0៖ មានឫសពីរ ' + v + '₁ = ' + roots[0].h + ' និង ' + v + '₂ = ' + roots[1].h + '។ ត្រីធាមានសញ្ញាដូច a (' + aSign + ') នៅក្រៅឫស និងសញ្ញាផ្ទុយនៅចន្លោះឫស។'));
    } else if (isZ(D)) {
      st.push(tr('Δ = 0: one double root ' + v + '₀ = −b ÷ 2a = ' + rs.zeros[0].h + '. The trinomial has the sign of a (' + aSign + ') everywhere, and is 0 at ' + v + '₀.',
                 'Δ = 0៖ ឫសឌុប ' + v + '₀ = −b ÷ 2a = ' + rs.zeros[0].h + '។ ត្រីធាមានសញ្ញាដូច a (' + aSign + ') គ្រប់កន្លែង ហើយស្មើ 0 ត្រង់ ' + v + '₀។'));
    } else {
      st.push(tr('Δ < 0: no real root. The trinomial has the sign of a (' + aSign + ') for every ' + v + '.',
                 'Δ < 0៖ គ្មានឫសពិតទេ។ ត្រីធាមានសញ្ញាដូច a (' + aSign + ') ចំពោះគ្រប់ ' + v + '។'));
    }
    st.push(tr('Table of signs:', 'តារាងសញ្ញា៖') + rs.table);
    st.push(readOff(op, rs.set, v));
    return res(rs.set, st, 'quad', { table: true });
  }
  function readOff(op, S, v) {
    var want = op === '>' ? tr('positive', 'វិជ្ជមាន') : op === '≥' ? tr('positive or zero', 'វិជ្ជមាន ឬស្មើសូន្យ') :
               op === '<' ? tr('negative', 'អវិជ្ជមាន') : op === '≤' ? tr('negative or zero', 'អវិជ្ជមាន ឬស្មើសូន្យ') : tr('not zero', 'ខុសពីសូន្យ');
    return tr('We need the expression to be ' + want + ': ' + setB(S),
              'យើងត្រូវការកន្សោម' + want + '៖ ' + setB(S));
  }

  function polySteps(n, d, ex, op, v, xden, RL, RR, Lf, Rf) {
    var st = [];
    var rs = ratSolve(n, d, ex, op, v);
    if (xden && rs.excl.length) {
      st.push(tr('Condition — a denominator cannot be 0: ' + rs.excl.map(function (p) { return v + ' ≠ ' + p.h; }).join(', '),
                 'លក្ខខណ្ឌ — ភាគបែងមិនអាចស្មើ 0៖ ' + rs.excl.map(function (p) { return v + ' ≠ ' + p.h; }).join(', ')));
    }
    if (rs.zero) {
      st.push(tr('Everything cancels: the left side minus the right side is 0 wherever it is defined.',
                 'គ្រប់តួលុបគ្នាអស់៖ អង្គឆ្វេងដកអង្គស្ដាំស្មើ 0 គ្រប់កន្លែងដែលវាកំណត់។'));
      st.push(readOff(op, rs.set, v));
      return res(rs.set, st, xden ? 'rat' : 'poly');
    }
    var oneSide = pIsZero(RR.n);
    var whole = xden ? fracH(polyH(rs.n, v), polyH(rs.d, v)) : polyH(pScale(rs.n, div(F1, rs.d[0])), v);
    if (!oneSide || xden) {
      st.push(tr(xden ? 'Bring everything to one side and write it as one fraction: ' + whole + ' ' + op + ' 0'
                      : 'Bring everything to one side: ' + whole + ' ' + op + ' 0',
                 xden ? 'ផ្ទេរគ្រប់តួទៅម្ខាង ហើយសរសេរជាប្រភាគតែមួយ៖ ' + whole + ' ' + op + ' 0'
                      : 'ផ្ទេរគ្រប់តួទៅម្ខាង៖ ' + whole + ' ' + op + ' 0'));
    }
    var c = rs.c, top = prodH(c, rs.FN.fs, v, true), bot = rs.FD.fs.length ? prodH(F1, rs.FD.fs, v) : null;
    var fact = bot ? fracH(top, bot) : top;
    var already = fact.replace(/<[^>]+>/g, '') === whole.replace(/<[^>]+>/g, '');
    if (!already) {
      st.push(tr('Factorise: ' + fact + ' ' + op + ' 0', 'ដាក់ជាផលគុណកត្តា៖ ' + fact + ' ' + op + ' 0'));
    }
    var numeric = rs.FN.fs.concat(rs.FD.fs).filter(function (f) { return f.kind === 'n'; });
    numeric.forEach(function (f) {
      st.push(tr(polyH(f.poly, v) + ' has no rational root. Its real roots are found numerically: ' + (f.roots.length ? ptsList(f.roots) : 'none') + '.',
                 polyH(f.poly, v) + ' គ្មានឫសសនិទានទេ។ ឫសពិតរបស់វារកបានជាលេខប្រហែល៖ ' + (f.roots.length ? ptsList(f.roots) : 'គ្មាន') + '។'));
    });
    rs.FN.fs.concat(rs.FD.fs).filter(function (f) { return f.kind === 'q' && !f.roots.length; }).forEach(function (f) {
      st.push(tr(polyH(f.poly, v) + ' has Δ < 0, so it never changes sign: it is always positive.',
                 polyH(f.poly, v) + ' មាន Δ < 0 ដូច្នេះវាមិនប្ដូរសញ្ញាទេ៖ វិជ្ជមានជានិច្ច។'));
    });
    var zs = rs.zeros, ps = uniqPts(rs.FD.fs.reduce(function (a, f) { return a.concat(f.roots); }, []));
    if (zs.length || ps.length) {
      st.push(tr((zs.length ? 'The numerator is 0 at ' + ptsList(zs) : 'The numerator is never 0') + (xden ? (ps.length ? '; the denominator is 0 at ' + ptsList(ps) + ' (‖ in the table)' : '') : '') + '.',
                 (zs.length ? 'ភាគយកស្មើ 0 ត្រង់ ' + ptsList(zs) : 'ភាគយកមិនដែលស្មើ 0') + (xden ? (ps.length ? '; ភាគបែងស្មើ 0 ត្រង់ ' + ptsList(ps) + ' (‖ ក្នុងតារាង)' : '') : '') + '។'));
    }
    if (rs.crit.length || rs.rows.length) { st.push(tr('Table of signs:', 'តារាងសញ្ញា៖') + rs.table); }
    st.push(readOff(op, rs.set, v));
    return res(rs.set, st, xden ? 'rat' : 'poly', { table: true });
  }

  /* ========================================================= |u| */
  function absStrategy(Lf, op, Rf, f, depth) {
    var nodes = uniqKeys(collect(f, function (n) { return n.t === 'f' && n.f === 'abs' && hasX(n); }));
    if (!nodes.length || op === '≠') { return null; }
    var st = [];
    if (nodes.length === 1) {
      var K = key(nodes[0]), li = lin(f, K);
      if (li && !isZ(li.k)) {
        var u = nodes[0].a, op2 = sgn(li.k) < 0 ? FLIP[op] : op;
        var v = simp(mulC(div(F(-1), li.k), li.rest));
        var absH = '|' + astH(u) + '|';
        if (key(Lf) !== K || !eq(li.k, F1)) {
          st.push(tr('Isolate the absolute value: ' + absH + ' ' + op2 + ' ' + astH(v), 'ទុកតម្លៃដាច់ខាតតែឯង៖ ' + absH + ' ' + op2 + ' ' + astH(v)));
        }
        var cv = constVal(v), nv = negE(v), A1, A2, S;
        if (cv && sgn(cv) < 0 && (op2 === '<' || op2 === '≤')) {
          st.push(tr('An absolute value is never negative, so it cannot be ' + op2 + ' ' + H(cv) + '.', 'តម្លៃដាច់ខាតមិនដែលអវិជ្ជមានទេ ដូច្នេះវាមិនអាច ' + op2 + ' ' + H(cv) + ' បានទេ។'));
          return res([], st, 'abs');
        }
        if (cv && (sgn(cv) < 0 || (sgn(cv) === 0 && op2 === '≥')) && (op2 === '>' || op2 === '≥')) {
          var dom = domainOf(u);
          st.push(tr('An absolute value is never negative, so it is always ' + op2 + ' ' + H(cv) + ': true for every x' + (isAll(dom) ? '.' : ' where it is defined.'),
                     'តម្លៃដាច់ខាតមិនដែលអវិជ្ជមានទេ ដូច្នេះវាតែង ' + op2 + ' ' + H(cv) + '៖ ពិតចំពោះគ្រប់ x' + (isAll(dom) ? '។' : ' ដែលវាកំណត់។')));
          return res(dom, st, 'abs');
        }
        if (op2 === '<' || op2 === '≤') {
          var lo = op2 === '<' ? '>' : '≥';
          st.push(tr(absH + ' ' + op2 + ' ' + astH(v) + ' ⟺ ' + astH(nv) + ' ' + op2 + ' ' + astH(u) + ' ' + op2 + ' ' + astH(v) + ', that is both of:',
                     absH + ' ' + op2 + ' ' + astH(v) + ' ⟺ ' + astH(nv) + ' ' + op2 + ' ' + astH(u) + ' ' + op2 + ' ' + astH(v) + ' គឺទាំងពីរ៖'));
          A1 = solveSub(u, op2, v, depth); A2 = solveSub(u, lo, nv, depth);
          st.push(detail(I(u, op2, v), A1)); st.push(detail(I(u, lo, nv), A2));
          S = inter(A1.set, A2.set);
          st.push(tr('Both must hold, so take the intersection: ' + setB(S), 'ត្រូវពិតទាំងពីរ ដូច្នេះយកប្រសព្វ៖ ' + setB(S)));
        } else {
          var lo2 = op2 === '>' ? '<' : '≤';
          st.push(tr(absH + ' ' + op2 + ' ' + astH(v) + ' ⟺ ' + astH(u) + ' ' + op2 + ' ' + astH(v) + ' or ' + astH(u) + ' ' + lo2 + ' ' + astH(nv) + ':',
                     absH + ' ' + op2 + ' ' + astH(v) + ' ⟺ ' + astH(u) + ' ' + op2 + ' ' + astH(v) + ' ឬ ' + astH(u) + ' ' + lo2 + ' ' + astH(nv) + '៖'));
          A1 = solveSub(u, op2, v, depth); A2 = solveSub(u, lo2, nv, depth);
          st.push(detail(I(u, op2, v), A1)); st.push(detail(I(u, lo2, nv), A2));
          S = union(A1.set, A2.set);
          st.push(tr('Either one is enough, so take the union: ' + setB(S), 'មួយណាក៏បាន ដូច្នេះយកប្រជុំ៖ ' + setB(S)));
        }
        return res(S, st, 'abs', { approx: A1.approx || A2.approx });
      }
    }
    if (nodes.length === 2) {
      var K1 = key(nodes[0]), K2 = key(nodes[1]);
      var l1 = lin(f, K1), l2 = l1 && lin(l1.rest, K2);
      if (l1 && l2 && cv0(l2.rest) && sgn(l1.k) * sgn(l2.k) < 0) {
        var k1 = l1.k, k2 = neg(l2.k), opq = op;
        if (sgn(k1) < 0) { k1 = neg(k1); k2 = neg(k2); opq = FLIP[op]; }
        var U = simp(mulC(k1, nodes[0].a)), W = simp(mulC(k2, nodes[1].a));
        st.push(tr('Both sides are absolute values, never negative, so squaring keeps the sign: |' + astH(U) + '| ' + opq + ' |' + astH(W) + '| ⟺ (' + astH(U) + ')² ' + opq + ' (' + astH(W) + ')² ⟺ (' + astH(simp(subE(U, W))) + ')(' + astH(simp(addE(U, W))) + ') ' + opq + ' 0',
                   'អង្គទាំងពីរជាតម្លៃដាច់ខាត មិនអវិជ្ជមាន ដូច្នេះលើកការេបាន៖ |' + astH(U) + '| ' + opq + ' |' + astH(W) + '| ⟺ (' + astH(U) + ')² ' + opq + ' (' + astH(W) + ')² ⟺ (' + astH(simp(subE(U, W))) + ')(' + astH(simp(addE(U, W))) + ') ' + opq + ' 0'));
        var prod = { t: '*', a: subE(U, W), b: addE(U, W) };
        var Q = solveSub(prod, opq, N(F0), depth);
        st.push(detail(astH(prod) + ' ' + opq + ' 0', Q));
        return res(Q.set, st, 'abs', { approx: Q.approx });
      }
    }
    /* the general method: split the line where each |u| changes sign */
    var inner = collect(f, function (n) { return n.t === 'f' && n.f === 'abs' && hasX(n.a) && !has(n.a, function (m) { return m.t === 'f' && m.f === 'abs'; }); });
    inner = uniqKeys(inner);
    var crit = [], rats = [];
    for (var i = 0; i < inner.length; i++) {
      var R = toRat(inner[i].a);
      if (!R) { return null; }
      rats.push(R);
      crit = crit.concat(rootsOf(R.n), rootsOf(R.d));
      R.ex.forEach(function (q) { crit = crit.concat(rootsOf(q)); });
    }
    crit = uniqPts(crit);
    st.push(tr('Use cases. The expressions inside |…| change sign at ' + (crit.length ? ptsList(crit) : 'no point at all') + ', which cut the line into ' + (crit.length + 1) + ' part' + (crit.length ? 's' : '') + '.',
               'ប្រើករណី។ កន្សោមក្នុង |…| ប្ដូរសញ្ញាត្រង់ ' + (crit.length ? ptsList(crit) : 'គ្មានចំណុចណាទេ') + ' ដែលចែកបន្ទាត់ជា ' + A.kh(crit.length + 1) + ' ផ្នែក។'));
    var total = [], approx = false;
    var tv = testVals(crit);
    for (var k = 0; k <= crit.length; k++) {
      var region = crit.length === 0 ? ALL : k === 0 ? seg(null, false, crit[0], false) : k === crit.length ? seg(crit[k - 1], true, null, false) : seg(crit[k - 1], true, crit[k], false);
      var x0 = tv[k], Lk = Lf, Rk = Rf, how = [];
      inner.forEach(function (node) {
        var s = ev(node.a, x0) >= 0 ? 1 : -1, K0 = key(node);
        var rep = s > 0 ? node.a : { t: 'neg', a: node.a };
        Lk = replace(Lk, function (n) { return key(n) === K0; }, function () { return rep; });
        Rk = replace(Rk, function (n) { return key(n) === K0; }, function () { return rep; });
        how.push('|' + astH(node.a) + '| = ' + (s > 0 ? astH(node.a) : '−(' + astH(node.a) + ')'));
      });
      var Lk2 = hasX(Lk) && toRat(Lk) ? simp(Lk) : Lk, Rk2 = hasX(Rk) && toRat(Rk) ? simp(Rk) : Rk;
      var Sk = solveSub(Lk2, op, Rk2, depth);
      approx = approx || Sk.approx;
      var got = inter(Sk.set, region);
      total = union(total, got);
      st.push(tr('<b>Case ' + (k + 1) + ':</b> x ∈ ' + fmtSet(region).h + '. Here ' + how.join(', ') + '.',
                 '<b>ករណីទី ' + A.kh(k + 1) + '៖</b> x ∈ ' + fmtSet(region).h + '។ នៅទីនេះ ' + how.join(', ') + '។') +
              detail(I(Lk2, op, Rk2), Sk) +
              tr('Keep only the part inside this case: ' + setB(got), 'យកតែផ្នែកក្នុងករណីនេះ៖ ' + setB(got)));
    }
    st.push(tr('Put the cases together (union): ' + setB(total), 'ផ្គុំករណីទាំងអស់ (ប្រជុំ)៖ ' + setB(total)));
    return res(total, st, 'abs', { approx: approx });
  }

  /* ======================================================== √u */
  function radStrategy(Lf, op, Rf, f, depth) {
    var nodes = uniqKeys(collect(f, function (n) { return n.t === 'f' && n.f === 'sqrt' && hasX(n); }));
    if (!nodes.length || op === '≠') { return null; }
    var st = [], A1, A2, A3, S;
    if (nodes.length === 1) {
      var K = key(nodes[0]), li = lin(f, K);
      if (!li || isZ(li.k) || has(li.rest, function (n) { return n.t === 'f' && n.f === 'sqrt' && hasX(n); })) { return null; }
      var u = nodes[0].a, op2 = sgn(li.k) < 0 ? FLIP[op] : op;
      var v = simp(mulC(div(F(-1), li.k), li.rest));
      var rH = '√<span class="iq-rad">' + astH(u) + '</span>';
      if (key(Lf) !== K || !eq(li.k, F1)) {
        st.push(tr('Isolate the square root: ' + rH + ' ' + op2 + ' ' + astH(v), 'ទុកឫសការេតែឯង៖ ' + rH + ' ' + op2 + ' ' + astH(v)));
      }
      var v2 = simp(powE(v, 2)), cv = constVal(v);
      var Z = N(F0);
      if (cv) {
        if ((op2 === '<' && sgn(cv) <= 0) || (op2 === '≤' && sgn(cv) < 0)) {
          st.push(tr('A square root is never negative, so it cannot be ' + op2 + ' ' + H(cv) + '.', 'ឫសការេមិនដែលអវិជ្ជមានទេ ដូច្នេះវាមិនអាច ' + op2 + ' ' + H(cv) + ' បានទេ។'));
          return res([], st, 'rad');
        }
        if ((op2 === '>' || op2 === '≥') && (sgn(cv) < 0 || (sgn(cv) === 0 && op2 === '≥'))) {
          st.push(tr('A square root is never negative, so the inequality holds wherever the root exists: ' + astH(u) + ' ≥ 0.',
                     'ឫសការេមិនដែលអវិជ្ជមានទេ ដូច្នេះវិសមីការពិតគ្រប់កន្លែងដែលឫសមាន៖ ' + astH(u) + ' ≥ 0។'));
          A1 = solveSub(u, '≥', Z, depth);
          st.push(detail(I(u, '≥', Z), A1));
          return res(A1.set, st, 'rad', { approx: A1.approx });
        }
        if (op2 === '<' || op2 === '≤') {
          st.push(tr('Both sides are ≥ 0, so square them, keeping the condition that the root exists: ' + rH + ' ' + op2 + ' ' + H(cv) + ' ⟺ 0 ≤ ' + astH(u) + ' ' + op2 + ' ' + H(mul(cv, cv)),
                     'អង្គទាំងពីរ ≥ 0 ដូច្នេះលើកការេ ដោយរក្សាលក្ខខណ្ឌឫសមាន៖ ' + rH + ' ' + op2 + ' ' + H(cv) + ' ⟺ 0 ≤ ' + astH(u) + ' ' + op2 + ' ' + H(mul(cv, cv))));
          A1 = solveSub(u, '≥', Z, depth); A2 = solveSub(u, op2, N(mul(cv, cv)), depth);
          st.push(detail(I(u, '≥', Z), A1)); st.push(detail(I(u, op2, N(mul(cv, cv))), A2));
          S = inter(A1.set, A2.set);
          st.push(tr('Intersection: ' + setB(S), 'ប្រសព្វ៖ ' + setB(S)));
          return res(S, st, 'rad', { approx: A1.approx || A2.approx });
        }
        st.push(tr('Both sides are ≥ 0, so square them (the root then exists automatically): ' + rH + ' ' + op2 + ' ' + H(cv) + ' ⟺ ' + astH(u) + ' ' + op2 + ' ' + H(mul(cv, cv)),
                   'អង្គទាំងពីរ ≥ 0 ដូច្នេះលើកការេ (ឫសមានដោយស្វ័យប្រវត្តិ)៖ ' + rH + ' ' + op2 + ' ' + H(cv) + ' ⟺ ' + astH(u) + ' ' + op2 + ' ' + H(mul(cv, cv))));
        A1 = solveSub(u, op2, N(mul(cv, cv)), depth);
        st.push(detail(I(u, op2, N(mul(cv, cv))), A1));
        return res(A1.set, st, 'rad', { approx: A1.approx });
      }
      if (op2 === '<' || op2 === '≤') {
        var vop = op2 === '<' ? '>' : '≥';
        st.push(tr(rH + ' ' + op2 + ' ' + astH(v) + ' ⟺ all three: ' + astH(u) + ' ≥ 0 (the root exists), ' + astH(v) + ' ' + vop + ' 0 (the right side must be ' + (vop === '>' ? 'positive' : 'not negative') + '), and ' + astH(u) + ' ' + op2 + ' (' + astH(v) + ')²',
                   rH + ' ' + op2 + ' ' + astH(v) + ' ⟺ ទាំងបី៖ ' + astH(u) + ' ≥ 0 (ឫសមាន), ' + astH(v) + ' ' + vop + ' 0 (អង្គស្ដាំត្រូវ' + (vop === '>' ? 'វិជ្ជមាន' : 'មិនអវិជ្ជមាន') + '), និង ' + astH(u) + ' ' + op2 + ' (' + astH(v) + ')²'));
        A1 = solveSub(u, '≥', Z, depth); A2 = solveSub(v, vop, Z, depth); A3 = solveSub(u, op2, v2, depth);
        st.push(detail(I(u, '≥', Z), A1)); st.push(detail(I(v, vop, Z), A2)); st.push(detail(I(u, op2, v2), A3));
        S = inter(A1.set, A2.set, A3.set);
        st.push(tr('All three must hold: ' + setB(S), 'ត្រូវពិតទាំងបី៖ ' + setB(S)));
        return res(S, st, 'rad', { approx: A1.approx || A2.approx || A3.approx });
      }
      st.push(tr(rH + ' ' + op2 + ' ' + astH(v) + ' ⟺ (I) ' + astH(v) + ' < 0 and ' + astH(u) + ' ≥ 0, or (II) ' + astH(v) + ' ≥ 0 and ' + astH(u) + ' ' + op2 + ' (' + astH(v) + ')²',
                 rH + ' ' + op2 + ' ' + astH(v) + ' ⟺ (I) ' + astH(v) + ' < 0 និង ' + astH(u) + ' ≥ 0 ឬ (II) ' + astH(v) + ' ≥ 0 និង ' + astH(u) + ' ' + op2 + ' (' + astH(v) + ')²'));
      var B1 = solveSub(v, '<', Z, depth), B2 = solveSub(u, '≥', Z, depth);
      var C1 = solveSub(v, '≥', Z, depth), C2 = solveSub(u, op2, v2, depth);
      st.push(tr('(I): ', '(I)៖ ') + detail(I(v, '<', Z), B1) + detail(I(u, '≥', Z), B2));
      var SI = inter(B1.set, B2.set);
      st.push(tr('(I) gives ' + setB(SI), '(I) ផ្ដល់ ' + setB(SI)));
      st.push(tr('(II): ', '(II)៖ ') + detail(I(v, '≥', Z), C1) + detail(I(u, op2, v2), C2));
      var SII = inter(C1.set, C2.set);
      st.push(tr('(II) gives ' + setB(SII), '(II) ផ្ដល់ ' + setB(SII)));
      S = union(SI, SII);
      st.push(tr('Union of (I) and (II): ' + setB(S), 'ប្រជុំនៃ (I) និង (II)៖ ' + setB(S)));
      return res(S, st, 'rad', { approx: B1.approx || B2.approx || C1.approx || C2.approx });
    }
    if (nodes.length === 2) {
      var K1 = key(nodes[0]), K2 = key(nodes[1]);
      var l1 = lin(f, K1), l2 = l1 && lin(l1.rest, K2);
      if (l1 && l2 && cv0(l2.rest) && sgn(l1.k) * sgn(l2.k) < 0) {
        var k1 = l1.k, k2 = neg(l2.k), opq = op;
        if (sgn(k1) < 0) { k1 = neg(k1); k2 = neg(k2); opq = FLIP[op]; }
        var u1 = nodes[0].a, u2 = nodes[1].a, Zr = N(F0);
        var U = simp(mulC(mul(k1, k1), u1)), W = simp(mulC(mul(k2, k2), u2));
        st.push(tr('Both roots must exist (' + astH(u1) + ' ≥ 0 and ' + astH(u2) + ' ≥ 0); then both sides are ≥ 0 and squaring keeps the sign: ' + astH(U) + ' ' + opq + ' ' + astH(W),
                   'ឫសទាំងពីរត្រូវមាន (' + astH(u1) + ' ≥ 0 និង ' + astH(u2) + ' ≥ 0)។ ពេលនោះអង្គទាំងពីរ ≥ 0 ហើយលើកការេបាន៖ ' + astH(U) + ' ' + opq + ' ' + astH(W)));
        A1 = solveSub(u1, '≥', Zr, depth); A2 = solveSub(u2, '≥', Zr, depth); A3 = solveSub(U, opq, W, depth);
        st.push(detail(I(u1, '≥', Zr), A1)); st.push(detail(I(u2, '≥', Zr), A2)); st.push(detail(I(U, opq, W), A3));
        S = inter(A1.set, A2.set, A3.set);
        st.push(tr('All three must hold: ' + setB(S), 'ត្រូវពិតទាំងបី៖ ' + setB(S)));
        return res(S, st, 'rad', { approx: A1.approx || A2.approx || A3.approx });
      }
    }
    return null;
  }

  /* ========================================== shared: bases and mapping */
  function baseH(B) { return B === 'e' ? 'e' : (isInt(B) && sgn(B) > 0 ? H(B) : '(' + H(B) + ')'); }
  function baseV(B) { return B === 'e' ? Math.E : num(B); }
  /* unify bases: same base everywhere is kept as typed (so 1/2 stays 1/2);
     otherwise everything is rewritten over the smallest common base > 1 */
  function unifyBases(list) {   /* list of F | 'e' → {B, m: [F]} or null */
    var e0 = list[0] === 'e';
    if (list.every(function (b) { return (b === 'e') === e0 && (e0 || eq(b, list[0])); })) {
      return { B: list[0], m: list.map(function () { return F1; }) };
    }
    if (list.some(function (b) { return b === 'e'; })) { return null; }
    var cs = list.map(canonBase);
    if (!cs.every(function (c) { return eq(c.r, cs[0].r); })) { return null; }
    return { B: cs[0].r, m: cs.map(function (c) { return F(c.k); }) };
  }
  function mapSet(S, fpt, leftNull, rightNull, decreasing) {
    var out = [];
    S.forEach(function (s) {
      var a = s.a ? fpt(s.a) : leftNull, b = s.b ? fpt(s.b) : rightNull;
      var ac = s.ac, bc = s.bc;
      if (decreasing) { var t = a; a = b; b = t; var tc = ac; ac = bc; bc = tc; }
      if (a && b && a.v > b.v) { return; }
      out.push({ a: a, ac: a ? ac : false, b: b, bc: b ? bc : false });
    });
    return out.length ? union(out, []) : [];
  }
  function gcdF(a, b) { return F(bgcd(a.n * b.d, b.n * a.d), a.d * b.d); }

  /* E op K for a number K that is not rational (ln 3, e², log₂5) */
  function solveLevel(E, op, K) {
    var R = toRat(E), st = [];
    if (R && pDeg(R.d) <= 0 && pDeg(R.n) === 1) {
      var p = pScale(R.n, div(F1, R.d[0])), a = p[1], b = p[0] || F0;
      var op2 = sgn(a) < 0 ? FLIP[op] : op;
      var v = (K.v - num(b)) / num(a), h, pl;
      if (eq(a, F1) && isZ(b)) { h = K.h; pl = K.p; }
      else {
        var aa = fabs(a);
        var top = sgn(a) > 0 ? (isZ(b) ? K.h : K.h + (sgn(b) > 0 ? ' − ' + H(b) : ' + ' + H(fabs(b))))
                             : (isZ(b) ? '−' + K.h : H(b) + ' − ' + K.h);
        var topP = sgn(a) > 0 ? (isZ(b) ? K.p : K.p + (sgn(b) > 0 ? ' − ' + plainK(b) : ' + ' + plainK(fabs(b))))
                              : (isZ(b) ? '−' + K.p : plainK(b) + ' − ' + K.p);
        h = eq(aa, F1) ? top : fracH(top, H(aa));
        pl = eq(aa, F1) ? topP : '(' + topP + ')/' + plainK(aa);
      }
      var pt = ptLab(v, h, pl, true);
      st.push(tr('Solve for x' + (sgn(a) < 0 ? ' (dividing by a negative number reverses the sign)' : '') + ': x ' + op2 + ' ' + h + ' ≈ ' + dec(v),
                 'ដោះស្រាយរក x' + (sgn(a) < 0 ? ' (ចែកនឹងចំនួនអវិជ្ជមាន ត្រូវប្ដូរទិសសញ្ញា)' : '') + '៖ x ' + op2 + ' ' + h + ' ≈ ' + dec(v)));
      return res(ray(pt, op2), st, 'lin');
    }
    var ns = numericSolve(function (x) { return ev(E, x) - K.v; }, op, null);
    st.push(tr('Solve ' + astH(E) + ' ' + op + ' ' + K.h + ' (≈ ' + dec(K.v) + ') numerically: ' + setB(ns.set),
               'ដោះស្រាយ ' + astH(E) + ' ' + op + ' ' + K.h + ' (≈ ' + dec(K.v) + ') ជាលេខប្រហែល៖ ' + setB(ns.set)));
    return res(ns.set, st, 'num', { approx: true });
  }

  /* ===================================================== exponentials */
  function isExpNode(n) { return (n.t === '^' && hasX(n.b)) || (n.t === 'f' && n.f === 'exp' && hasX(n.a)); }
  function expStrategy(Lf, op, Rf, f, depth) {
    var nodes = uniqKeys(collect(f, isExpNode));
    if (!nodes.length || op === '≠') { return null; }
    if (nodes.some(function (n) { return n.t === '^' && hasX(n.a); })) { return null; }
    if (has(f, function (n) { return n.t === 'f' && n.f !== 'exp' && hasX(n); })) { return null; }
    var info = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.t === 'f') { info.push({ B: 'e', E: n.a }); continue; }
      if (n.a.t === 'c' && n.a.k === 'e') { info.push({ B: 'e', E: n.b }); continue; }
      var b = constVal(n.a);
      if (!b || sgn(b) <= 0 || eq(b, F1)) { return null; }
      info.push({ B: b, E: n.b });
    }
    var U = unifyBases(info.map(function (x) { return x.B; }));
    if (!U) { return twoBases(nodes, info, op, f); }
    var B = U.B, Bv = baseV(B), BH = baseH(B), expOf = {};
    nodes.forEach(function (n, i) { expOf[key(n)] = simp(mulC(U.m[i], info[i].E)); });
    var st = [];
    if (!info.every(function (x) { return x.B === B || (x.B !== 'e' && B !== 'e' && eq(x.B, B)); })) {
      st.push(tr('Write every power with the same base ' + BH + ': ' + nodes.map(function (n, i) { return astH(n) + ' = ' + BH + '<sup>' + astH(expOf[key(n)]) + '</sup>'; }).join(', '),
                 'សរសេរគ្រប់ស្វ័យគុណជាគោលដូចគ្នា ' + BH + '៖ ' + nodes.map(function (n, i) { return astH(n) + ' = ' + BH + '<sup>' + astH(expOf[key(n)]) + '</sup>'; }).join(', ')));
    }
    var addX = function (a, b) { return a === null ? b : b === null ? a : simp(addE(a, b)); };
    var negX = function (a) { return a === null ? null : simp(negE(a)); };
    function terms(e) {
      if (!hasX(e)) { var c = constVal(e); return c ? [{ k: c, e: null }] : null; }
      var kk = key(e);
      if (expOf[kk] !== undefined) { return [{ k: F1, e: expOf[kk] }]; }
      var a, b, out;
      switch (e.t) {
        case '+': case '-':
          a = terms(e.a); b = terms(e.b);
          if (!a || !b) { return null; }
          return a.concat(e.t === '+' ? b : b.map(function (t) { return { k: neg(t.k), e: t.e }; }));
        case 'neg': a = terms(e.a); return a ? a.map(function (t) { return { k: neg(t.k), e: t.e }; }) : null;
        case '*':
          a = terms(e.a); b = terms(e.b);
          if (!a || !b) { return null; }
          out = [];
          a.forEach(function (x) { b.forEach(function (y) { out.push({ k: mul(x.k, y.k), e: addX(x.e, y.e) }); }); });
          return out;
        case '/':
          a = terms(e.a); b = terms(e.b);
          if (!a || !b || b.length !== 1 || isZ(b[0].k)) { return null; }
          return a.map(function (x) { return { k: div(x.k, b[0].k), e: addX(x.e, negX(b[0].e)) }; });
        case '^':
          var p = constVal(e.b);
          if (!p || !isInt(p) || sgn(p) < 0 || p.n > BigInt(6)) { return null; }
          a = terms(e.a);
          if (!a) { return null; }
          out = [{ k: F1, e: null }];
          for (var r = 0; r < Number(p.n); r++) {
            var nx = [];
            out.forEach(function (x) { a.forEach(function (y) { nx.push({ k: mul(x.k, y.k), e: addX(x.e, y.e) }); }); });
            out = nx;
          }
          return out;
      }
      return null;
    }
    var ts = terms(f);
    if (!ts) { return null; }
    var merged = {}, order = [];
    ts.forEach(function (t) {
      var kk = t.e === null ? '∅' : key(t.e);
      if (!merged[kk]) { merged[kk] = { k: F0, e: t.e }; order.push(kk); }
      merged[kk].k = add(merged[kk].k, t.k);
    });
    var cons = F0, ex = [];
    order.forEach(function (kk) {
      var t = merged[kk];
      if (isZ(t.k)) { return; }
      if (t.e === null) { cons = add(cons, t.k); } else if (!hasX(t.e)) {
        var cvl = constVal({ t: '^', a: B === 'e' ? { t: 'c', k: 'e' } : N(B), b: t.e });
        if (!cvl) { ex.push(t); } else { cons = add(cons, mul(t.k, cvl)); }
      } else { ex.push(t); }
    });
    var incr = Bv > 1;
    var mono = incr ? tr('the base ' + BH + ' > 1, so the function is increasing and the sign stays', 'គោល ' + BH + ' > 1 អនុគមន៍កើន ដូច្នេះសញ្ញានៅដដែល')
                    : tr('the base ' + BH + ' is between 0 and 1, so the function is decreasing and <b class="iq-flip">the sign is reversed</b>', 'គោល ' + BH + ' នៅចន្លោះ 0 និង 1 អនុគមន៍ចុះ ដូច្នេះ<b class="iq-flip">ត្រូវប្ដូរទិសសញ្ញា</b>');
    var pw = function (E) { return BH + '<sup>' + astH(E) + '</sup>'; };
    var logLab = function (K) {
      var v = Math.log(num(K)) / Math.log(Bv);
      return ptLab(v, B === 'e' ? 'ln ' + H(K) : 'log<sub>' + H(B) + '</sub>' + (isInt(K) ? ' ' + H(K) : '(' + H(K) + ')'),
                   (B === 'e' ? 'ln ' : 'log_' + plainK(B) + ' ') + plainK(K));
    };
    var logOf = function (K) { return B === 'e' ? (eq(K, F1) ? F0 : null) : logExact(K, B); };
    var r, S;
    if (ex.length === 1) {
      var t = ex[0], K = div(neg(cons), t.k), op2 = sgn(t.k) < 0 ? FLIP[op] : op, E = t.e;
      if (!(isExpNode(Lf) && !hasX(Rf) && eq(t.k, F1))) {
        st.push(tr('Isolate the power: ' + pw(E) + ' ' + op2 + ' ' + H(K), 'ទុកស្វ័យគុណតែឯង៖ ' + pw(E) + ' ' + op2 + ' ' + H(K)));
      }
      if (sgn(K) <= 0) {
        var okAll = op2 === '>' || (op2 === '≥');
        st.push(tr('A power of a positive base is always > 0, so this is ' + (okAll ? 'true for every x.' : 'never true.'),
                   'ស្វ័យគុណនៃគោលវិជ្ជមាន តែង > 0 ដូច្នេះនេះ' + (okAll ? 'ពិតចំពោះគ្រប់ x។' : 'មិនពិតដាច់ខាត។')));
        return res(okAll ? domainOf(E) : [], st, 'exp');
      }
      var op3 = incr ? op2 : FLIP[op2], lg = logOf(K);
      if (lg) {
        st.push(tr('Write ' + H(K) + ' = ' + BH + '<sup>' + H(lg) + '</sup>. Compare the exponents — ' + mono + ': ' + astH(E) + ' ' + op3 + ' ' + H(lg),
                   'សរសេរ ' + H(K) + ' = ' + BH + '<sup>' + H(lg) + '</sup>។ ប្រៀបធៀបនិទស្សន្ត — ' + mono + '៖ ' + astH(E) + ' ' + op3 + ' ' + H(lg)));
        r = solveSub(E, op3, N(lg), depth);
        st.push(detail(astH(E) + ' ' + op3 + ' ' + H(lg), r));
        return res(r.set, st, 'exp', { approx: r.approx });
      }
      var KL = logLab(K);
      st.push(tr('Take log base ' + BH + ' of both sides — ' + mono + ': ' + astH(E) + ' ' + op3 + ' ' + KL.h,
                 'យកលោការីតគោល ' + BH + ' អង្គទាំងពីរ — ' + mono + '៖ ' + astH(E) + ' ' + op3 + ' ' + KL.h));
      r = solveLevel(E, op3, KL);
      st = st.concat(r.steps);
      return res(r.set, st, 'exp', { approx: r.approx });
    }
    if (ex.length === 2 && isZ(cons)) {
      var t1 = ex[0], t2 = ex[1];
      if (sgn(t1.k) === sgn(t2.k)) {
        var ok = wants(op, sgn(t1.k));
        st.push(tr('Both terms have the same sign and powers are always positive, so the left side is always ' + (sgn(t1.k) > 0 ? 'positive' : 'negative') + ': ' + (ok ? 'true for every x.' : 'never true.'),
                   'តួទាំងពីរមានសញ្ញាដូចគ្នា ហើយស្វ័យគុណតែងវិជ្ជមាន ដូច្នេះអង្គឆ្វេងតែង' + (sgn(t1.k) > 0 ? 'វិជ្ជមាន' : 'អវិជ្ជមាន') + '៖ ' + (ok ? 'ពិតចំពោះគ្រប់ x។' : 'មិនពិតដាច់ខាត។')));
        return res(ok ? inter(domainOf(t1.e), domainOf(t2.e)) : [], st, 'exp');
      }
      var K2 = div(neg(t2.k), t1.k), o2 = sgn(t1.k) < 0 ? FLIP[op] : op;
      var rhs = (eq(K2, F1) ? '' : H(K2) + ' · ') + pw(t2.e);
      st.push(tr('Bring one power to each side: ' + pw(t1.e) + ' ' + o2 + ' ' + rhs, 'ដាក់ស្វ័យគុណម្ខាងមួយ៖ ' + pw(t1.e) + ' ' + o2 + ' ' + rhs));
      var o3 = incr ? o2 : FLIP[o2], lg2 = logOf(K2);
      if (lg2) {
        var R2 = simp(addE(t2.e, N(lg2)));
        st.push(tr((isZ(lg2) ? '' : 'Write ' + H(K2) + ' = ' + BH + '<sup>' + H(lg2) + '</sup>, so the right side is ' + pw(R2) + '. ') + 'Compare the exponents — ' + mono + ': ' + astH(t1.e) + ' ' + o3 + ' ' + astH(R2),
                   (isZ(lg2) ? '' : 'សរសេរ ' + H(K2) + ' = ' + BH + '<sup>' + H(lg2) + '</sup> ដូច្នេះអង្គស្ដាំគឺ ' + pw(R2) + '។ ') + 'ប្រៀបធៀបនិទស្សន្ត — ' + mono + '៖ ' + astH(t1.e) + ' ' + o3 + ' ' + astH(R2)));
        r = solveSub(t1.e, o3, R2, depth);
        st.push(detail(I(t1.e, o3, R2), r));
        return res(r.set, st, 'exp', { approx: r.approx });
      }
      var Ed = simp(subE(t1.e, t2.e)), KL2 = logLab(K2);
      st.push(tr('Divide by ' + pw(t2.e) + ' (positive): ' + pw(Ed) + ' ' + o2 + ' ' + H(K2) + ', then take log base ' + BH + ' — ' + mono + ': ' + astH(Ed) + ' ' + o3 + ' ' + KL2.h,
                 'ចែកនឹង ' + pw(t2.e) + ' (វិជ្ជមាន)៖ ' + pw(Ed) + ' ' + o2 + ' ' + H(K2) + ' រួចយកលោការីតគោល ' + BH + ' — ' + mono + '៖ ' + astH(Ed) + ' ' + o3 + ' ' + KL2.h));
      r = solveLevel(Ed, o3, KL2);
      return res(r.set, st.concat(r.steps), 'exp', { approx: r.approx });
    }
    /* substitution t = B^(g·x) */
    var lins = [];
    for (i = 0; i < ex.length; i++) {
      var Rr = toRat(ex[i].e);
      if (!Rr || pDeg(Rr.d) > 0 || pDeg(Rr.n) !== 1) { return null; }
      var pp = pScale(Rr.n, div(F1, Rr.d[0]));
      lins.push({ a: pp[1], b: pp[0] || F0, k: ex[i].k });
    }
    var g = lins.reduce(function (m, l) { return m ? gcdF(m, l.a) : fabs(l.a); }, null);
    var tmap = {}, minP = 0;
    for (i = 0; i < lins.length; i++) {
      var l = lins[i], m = div(l.a, g);
      if (!isInt(m)) { return null; }
      var Bb = B === 'e' ? (isZ(l.b) ? F1 : null) : (isInt(l.b) ? fpow(B, Number(l.b.n)) : constVal({ t: '^', a: N(B), b: N(l.b) }));
      if (!Bb) { return null; }
      var mi = Number(m.n);
      tmap[mi] = add(tmap[mi] || F0, mul(l.k, Bb));
      minP = Math.min(minP, mi);
    }
    tmap[0] = add(tmap[0] || F0, cons);
    var maxP = Math.max.apply(null, Object.keys(tmap).map(Number));
    var tn = [];
    for (i = minP; i <= maxP; i++) { tn.push(tmap[i] || F0); }
    var td = [];
    for (i = 0; i < -minP; i++) { td.push(F0); }
    td.push(F1);
    var tvar = BH + '<sup>' + (eq(g, F1) ? 'x' : H(g) + 'x') + '</sup>';
    st.push(tr('Substitute t = ' + tvar + ' (t > 0). The inequality becomes: ' + (minP < 0 ? fracH(polyH(tn, 't'), polyH(td, 't')) : polyH(tn, 't')) + ' ' + op + ' 0',
               'តាង t = ' + tvar + ' (t > 0)។ វិសមីការក្លាយជា៖ ' + (minP < 0 ? fracH(polyH(tn, 't'), polyH(td, 't')) : polyH(tn, 't')) + ' ' + op + ' 0'));
    r = ratClass({ n: tn, d: td, ex: pDeg(td) > 0 ? [td] : [] }, { n: [F0], d: [F1], ex: [] }, op, 't', '', null, null);
    st.push(detail(tr('Solve for t', 'ដោះស្រាយរក t'), r));
    var pos = seg(ptF(F0), false, null, false), T = inter(r.set, pos);
    st.push(tr('Keep t > 0: t ∈ ' + setB(T), 'រក្សា t > 0៖ t ∈ ' + setB(T)));
    var back = function (p) {
      if (p.v <= 0) { return null; }
      var lgx = (p.f && sgn(p.f) > 0) ? logOf(p.f) : null;
      if (lgx) { return ptF(div(lgx, g)); }
      var v = Math.log(p.v) / Math.log(Bv) / num(g);
      var inner = B === 'e' ? 'ln(' + p.h + ')' : 'log<sub>' + H(B) + '</sub>(' + p.h + ')';
      var innerP = (B === 'e' ? 'ln(' : 'log_' + plainK(B) + '(') + p.p + ')';
      return ptLab(v, eq(g, F1) ? inner : fracH(inner, H(g)), eq(g, F1) ? innerP : innerP + '/' + plainK(g), true);
    };
    S = mapSet(T, back, null, null, !incr);
    st.push(tr('Back to x: ' + tvar + ' ∈ ' + fmtSet(T).h + ' ⟺ ' + (incr ? '' : '(' + mono + ') ') + 'x ∈ ' + setB(S),
               'ត្រឡប់ទៅ x៖ ' + tvar + ' ∈ ' + fmtSet(T).h + ' ⟺ ' + (incr ? '' : '(' + mono + ') ') + 'x ∈ ' + setB(S)));
    return res(S, st, 'exp', { approx: r.approx });
  }


  /* c₁·a^(…) op c₂·b^(…) with bases that are not powers of one base (2 and 3):
     take ln of both sides; with linear exponents x·ln P op ln Q, P and Q rational */
  function twoBases(nodes, info, op, f) {
    if (nodes.length !== 2 || info.some(function (x) { return x.B === 'e'; })) { return null; }
    var l1 = lin(f, key(nodes[0])), l2 = l1 && lin(l1.rest, key(nodes[1]));
    if (!l1 || !l2 || !cv0(l2.rest) || sgn(l1.k) * sgn(l2.k) >= 0) { return null; }
    var k1 = l1.k, k2 = neg(l2.k), o = op;
    if (sgn(k1) < 0) { k1 = neg(k1); k2 = neg(k2); o = FLIP[op]; }
    var lp = info.map(function (x) { return linearOf(x.E) || (constVal(x.E) ? [constVal(x.E), F0] : null); });
    if (!lp[0] || !lp[1]) { return null; }
    var a1 = lp[0][1] || F0, b1 = lp[0][0] || F0, a2 = lp[1][1] || F0, b2 = lp[1][0] || F0;
    if (![a1, b1, a2, b2].every(isInt)) { return null; }
    var B1 = info[0].B, B2 = info[1].B, iN = function (q) { return Number(q.n); };
    var Pq = div(fpow(B1, iN(a1)), fpow(B2, iN(a2)));
    var Qq = div(mul(k2, fpow(B2, iN(b2))), mul(k1, fpow(B1, iN(b1))));
    var st = [];
    var side = function (k, B, E) { return (eq(k, F1) ? '' : H(k) + ' · ') + baseH(B) + '<sup>' + astH(E) + '</sup>'; };
    st.push(tr('The bases ' + H(B1) + ' and ' + H(B2) + ' are not powers of one number. Both sides are positive, so take ln (it is increasing, the sign stays): ' +
               side(k1, B1, info[0].E) + ' ' + o + ' ' + side(k2, B2, info[1].E) + ' ⟺ x · ln ' + P(Pq) + ' ' + o + ' ln ' + P(Qq),
               'គោល ' + H(B1) + ' និង ' + H(B2) + ' មិនមែនជាស្វ័យគុណនៃចំនួនតែមួយទេ។ អង្គទាំងពីរវិជ្ជមាន ដូច្នេះយក ln (អនុគមន៍កើន សញ្ញានៅដដែល)៖ ' +
               side(k1, B1, info[0].E) + ' ' + o + ' ' + side(k2, B2, info[1].E) + ' ⟺ x · ln ' + P(Pq) + ' ' + o + ' ln ' + P(Qq)));
    var cP = cmp(Pq, F1);
    if (cP === 0) {
      var okc = wants(o === '<' ? '>' : o === '>' ? '<' : o === '≤' ? '≥' : '≤', Math.sign(Math.log(num(Qq))));
      st.push(tr('ln 1 = 0, so this reads 0 ' + o + ' ln ' + P(Qq) + ': ' + (okc ? 'true for every x.' : 'never true.'), 'ln 1 = 0 ដូច្នេះ 0 ' + o + ' ln ' + P(Qq) + '៖ ' + (okc ? 'ពិតចំពោះគ្រប់ x។' : 'មិនពិតដាច់ខាត។')));
      return res(okc ? ALL : [], st, 'exp');
    }
    var o2 = cP > 0 ? o : FLIP[o];
    var lg = logExact(Qq, Pq);
    var Pd = cP > 0 ? Pq : div(F1, Pq), Qd = cP > 0 ? Qq : div(F1, Qq);   /* log_(2/3)(1/5) = log_(3/2) 5 */
    var pt = lg ? ptF(lg) : ptLab(Math.log(num(Qq)) / Math.log(num(Pq)), 'log<sub>' + H(Pd) + '</sub>' + (isInt(Qd) ? ' ' + H(Qd) : '(' + H(Qd) + ')'), 'log_' + plainK(Pd) + '(' + plainK(Qd) + ')', true);
    st.push(tr('ln ' + P(Pq) + (cP > 0 ? ' > 0, so divide and keep the sign' : ' < 0, so dividing by it <b class="iq-flip">reverses the sign</b>') + ': x ' + o2 + ' ' + pt.h + (lg ? '' : ' ≈ ' + dec(pt.v)),
               'ln ' + P(Pq) + (cP > 0 ? ' > 0 ដូច្នេះចែក ហើយសញ្ញានៅដដែល' : ' < 0 ដូច្នេះចែកនឹងវា <b class="iq-flip">ត្រូវប្ដូរទិសសញ្ញា</b>') + '៖ x ' + o2 + ' ' + pt.h + (lg ? '' : ' ≈ ' + dec(pt.v))));
    return res(ray(pt, o2), st, 'exp');
  }

  /* ====================================================== logarithms */
  function isLogNode(n) { return n.t === 'f' && (n.f === 'ln' || n.f === 'log') && hasX(n.a); }
  function logStrategy(Lf, op, Rf, f, depth) {
    var nodes = uniqKeys(collect(f, isLogNode));
    if (!nodes.length || op === '≠') { return null; }
    var info = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.f === 'ln') { info.push('e'); continue; }
      if (hasX(n.base)) { return null; }
      var b = constVal(n.base);
      if (!b || sgn(b) <= 0 || eq(b, F1)) { return null; }
      info.push(b);
    }
    var U = unifyBases(info);
    if (!U) { return null; }
    var B = U.B, Bv = baseV(B), BH = baseH(B), mult = {};
    nodes.forEach(function (nd, i) { mult[key(nd)] = div(F1, U.m[i]); });
    var lgH = function (u) { return (B === 'e' ? 'ln' : (eq(B, F(10)) ? 'log' : 'log<sub>' + H(B) + '</sub>')) + '(' + astH(u) + ')'; };
    var st = [];
    if (!U.m.every(function (m) { return eq(m, F1); })) {
      st.push(tr('Change to the same base ' + BH + ': ' + nodes.map(function (nd) { var m = mult[key(nd)]; return astH(nd) + ' = ' + (eq(m, F1) ? '' : H(m) + ' ') + lgH(nd.a); }).join(', '),
                 'ប្ដូរទៅគោលដូចគ្នា ' + BH + '៖ ' + nodes.map(function (nd) { var m = mult[key(nd)]; return astH(nd) + ' = ' + (eq(m, F1) ? '' : H(m) + ' ') + lgH(nd.a); }).join(', ')));
    }
    /* the domain */
    var args = uniqKeys(nodes.map(function (nd) { return nd.a; })), Dom = ALL, Z = N(F0), domSteps = [];
    args.forEach(function (u) {
      var r = solveSub(u, '>', Z, depth);
      Dom = inter(Dom, r.set);
      domSteps.push(detail(I(u, '>', Z), r));
    });
    st.push(tr('Condition — the number inside a logarithm must be positive:', 'លក្ខខណ្ឌ — ចំនួនក្នុងលោការីតត្រូវតែវិជ្ជមាន៖') + domSteps.join('') +
            tr('Domain: D = ' + setB(Dom), 'ដែនកំណត់៖ D = ' + setB(Dom)));
    if (!Dom.length) {
      st.push(tr('The domain is empty, so there is no solution.', 'ដែនកំណត់ទទេ ដូច្នេះគ្មានចម្លើយទេ។'));
      return res([], st, 'log');
    }
    var incr = Bv > 1;
    var mono = incr ? tr('log base ' + BH + ' is increasing (' + BH + ' > 1), so the sign stays', 'លោការីតគោល ' + BH + ' ជាអនុគមន៍កើន (' + BH + ' > 1) ដូច្នេះសញ្ញានៅដដែល')
                    : tr('log base ' + BH + ' is decreasing (0 < ' + BH + ' < 1), so <b class="iq-flip">the sign is reversed</b>', 'លោការីតគោល ' + BH + ' ជាអនុគមន៍ចុះ (0 < ' + BH + ' < 1) ដូច្នេះ<b class="iq-flip">ត្រូវប្ដូរទិសសញ្ញា</b>');
    function lterms(e) {
      if (!hasX(e)) { var c = constVal(e); return c ? [{ k: c, u: null }] : null; }
      var kk = key(e);
      if (mult[kk] !== undefined) { return [{ k: mult[kk], u: e.a }]; }
      var a, b, c2;
      switch (e.t) {
        case '+': case '-':
          a = lterms(e.a); b = lterms(e.b);
          if (!a || !b) { return null; }
          return a.concat(e.t === '+' ? b : b.map(function (t) { return { k: neg(t.k), u: t.u }; }));
        case 'neg': a = lterms(e.a); return a ? a.map(function (t) { return { k: neg(t.k), u: t.u }; }) : null;
        case '*':
          c2 = constVal(e.a);
          if (c2) { b = lterms(e.b); return b ? b.map(function (t) { return { k: mul(c2, t.k), u: t.u }; }) : null; }
          c2 = constVal(e.b);
          if (c2) { a = lterms(e.a); return a ? a.map(function (t) { return { k: mul(c2, t.k), u: t.u }; }) : null; }
          return null;
        case '/':
          c2 = constVal(e.b);
          if (c2 && !isZ(c2)) { a = lterms(e.a); return a ? a.map(function (t) { return { k: div(t.k, c2), u: t.u }; }) : null; }
          return null;
      }
      return null;
    }
    var BA = B === 'e' ? { t: 'c', k: 'e' } : N(B);
    var powV = function (K) { return B === 'e' ? (isZ(K) ? F1 : null) : constVal({ t: '^', a: N(B), b: N(K) }); };
    var r, S;
    var ts = lterms(f);
    if (ts) {
      var merged = {}, order = [], c = F0;
      ts.forEach(function (t) {
        if (t.u === null) { c = add(c, t.k); return; }
        var kk = key(t.u);
        if (!merged[kk]) { merged[kk] = { k: F0, u: t.u }; order.push(kk); }
        merged[kk].k = add(merged[kk].k, t.k);
      });
      var ls = order.map(function (kk) { return merged[kk]; }).filter(function (t) { return !isZ(t.k); });
      if (!ls.length) {
        var ok0 = wants(op, sgn(c));
        st.push(tr('The logarithms cancel, leaving ' + H(c) + ' ' + op + ' 0, which is ' + (ok0 ? 'true on the whole domain.' : 'false.'),
                   'លោការីតលុបគ្នាអស់ នៅសល់ ' + H(c) + ' ' + op + ' 0 ដែល' + (ok0 ? 'ពិតលើដែនកំណត់ទាំងមូល។' : 'មិនពិត។')));
        return res(ok0 ? Dom : [], st, 'log');
      }
      if (ls.length === 1) {
        var t = ls[0], K = div(neg(c), t.k), op2 = sgn(t.k) < 0 ? FLIP[op] : op, op3 = incr ? op2 : FLIP[op2];
        if (!(isLogNode(Lf) && !hasX(Rf) && eq(t.k, F1))) {
          st.push(tr('Isolate the logarithm: ' + lgH(t.u) + ' ' + op2 + ' ' + H(K), 'ទុកលោការីតតែឯង៖ ' + lgH(t.u) + ' ' + op2 + ' ' + H(K)));
        }
        var val = powV(K), sub1;
        if (val) {
          st.push(tr('Rewrite ' + H(K) + ' = ' + lgH(N(val)) + ' and compare — ' + mono + ': ' + astH(t.u) + ' ' + op3 + ' ' + H(val),
                     'សរសេរ ' + H(K) + ' = ' + lgH(N(val)) + ' រួចប្រៀបធៀប — ' + mono + '៖ ' + astH(t.u) + ' ' + op3 + ' ' + H(val)));
          sub1 = solveSub(t.u, op3, N(val), depth);
          st.push(detail(I(t.u, op3, N(val)), sub1));
        } else {
          var lab = ptLab(Math.pow(Bv, num(K)), (B === 'e' ? 'e' : BH) + (eq(K, F1) ? '' : '<sup>' + H(K) + '</sup>'), (B === 'e' ? 'e' : plainK(B)) + (eq(K, F1) ? '' : '^' + plainK(K)), true);
          st.push(tr('Compare — ' + mono + ': ' + astH(t.u) + ' ' + op3 + ' ' + lab.h, 'ប្រៀបធៀប — ' + mono + '៖ ' + astH(t.u) + ' ' + op3 + ' ' + lab.h));
          sub1 = solveLevel(t.u, op3, lab);
          st = st.concat(sub1.steps);
        }
        S = inter(sub1.set, Dom);
        st.push(tr('Intersect with the domain D: ' + setB(S), 'ប្រសព្វជាមួយដែនកំណត់ D៖ ' + setB(S)));
        return res(S, st, 'log', { approx: sub1.approx });
      }
      var m = ls.reduce(function (acc, t) { return blcm(acc, t.k.d); }, ONE);
      var Cc = mul(neg(c), F(m));
      var BC = powV(Cc);
      if (BC) {
        var Pp = null, Qq = null;
        ls.forEach(function (t) {
          var kk = mul(t.k, F(m)), pw2 = Number(fabs(kk).n), term = powE(t.u, pw2);
          if (sgn(kk) > 0) { Pp = Pp ? mulE(Pp, term) : term; } else { Qq = Qq ? mulE(Qq, term) : term; }
        });
        Pp = Pp || N(F1); Qq = Qq || N(F1);
        var Qc = eq(BC, F1) ? Qq : mulE(N(BC), Qq);
        var op4 = incr ? op : FLIP[op];
        st.push(tr('On D the logarithms combine (log a + log b = log ab, k·log a = log a<sup>k</sup>): ' + lgH(Pp) + ' ' + op + ' ' + lgH(simp(Qc)) +
                   '. Compare — ' + mono + ': ' + astH(Pp) + ' ' + op4 + ' ' + astH(simp(Qc)),
                   'លើ D លោការីតផ្គុំគ្នាបាន (log a + log b = log ab, k·log a = log a<sup>k</sup>)៖ ' + lgH(Pp) + ' ' + op + ' ' + lgH(simp(Qc)) +
                   '។ ប្រៀបធៀប — ' + mono + '៖ ' + astH(Pp) + ' ' + op4 + ' ' + astH(simp(Qc))));
        r = solveSub(Pp, op4, simp(Qc), depth);
        st.push(detail(I(Pp, op4, simp(Qc)), r));
        S = inter(r.set, Dom);
        st.push(tr('Intersect with the domain D: ' + setB(S), 'ប្រសព្វជាមួយដែនកំណត់ D៖ ' + setB(S)));
        return res(S, st, 'log', { approx: r.approx });
      }
    }
    /* substitution t = log_B x */
    if (nodes.every(function (nd) { return nd.a.t === 'x'; })) {
      var hook = function (e) {
        var kk = key(e);
        if (mult[kk] !== undefined) { return { n: [F0, mult[kk]], d: [F1], ex: [] }; }
        return undefined;
      };
      var RL = toRat(Lf, hook), RR = toRat(Rf, hook);
      if (RL && RR) {
        st.push(tr('Substitute t = ' + lgH({ t: 'x' }) + ' (t can be any real number).', 'តាង t = ' + lgH({ t: 'x' }) + ' (t ជាចំនួនពិតណាក៏បាន)។'));
        r = ratClass(RL, RR, op, 't', '', null, null);
        st.push(detail(tr('Solve for t', 'ដោះស្រាយរក t'), r));
        var back = function (p) {
          if (p.f) {
            var pv = powV(p.f);
            if (pv) { return ptF(pv); }
          }
          if (B === 'e' && p.f && eq(p.f, F1)) { return ptLab(Math.E, 'e', 'e', true); }
          return ptLab(Math.pow(Bv, p.v), (B === 'e' ? 'e' : BH) + '<sup>' + p.h + '</sup>', (B === 'e' ? 'e' : plainK(B)) + '^(' + p.p + ')', !!p.ex);
        };
        S = inter(mapSet(r.set, back, ptF(F0), null, !incr), Dom);
        st.push(tr('Back to x = ' + BH + '<sup>t</sup>' + (incr ? '' : ' (' + mono + ')') + ', inside the domain: ' + setB(S),
                   'ត្រឡប់ទៅ x = ' + BH + '<sup>t</sup>' + (incr ? '' : ' (' + mono + ')') + ' ក្នុងដែនកំណត់៖ ' + setB(S)));
        return res(S, st, 'log', { approx: r.approx });
      }
    }
    return null;
  }

  /* ================================================== trigonometry */
  function angF(q) { return { q: q, v: num(q) * Math.PI }; }
  function angN(v) { return { q: null, v: v }; }
  function angAdd(a, b) { return (a.q && b.q) ? angF(add(a.q, b.q)) : angN(a.v + b.v); }
  function angSub(a, b) { return (a.q && b.q) ? angF(sub(a.q, b.q)) : angN(a.v - b.v); }
  function angDiv(a, k) { return a.q ? angF(div(a.q, k)) : angN(a.v / num(k)); }
  function piH(q, kpart) {
    if (isZ(q)) { return '0'; }
    var s = sgn(q) < 0 ? '−' : '', n = babs(q.n);
    var top = (n === ONE ? '' : n2s(n)) + (kpart || '') + 'π';
    return s + (q.d === ONE ? top : fracH(top, n2s(q.d)));
  }
  function piP(q, kpart) {
    if (isZ(q)) { return '0'; }
    var s = sgn(q) < 0 ? '−' : '', n = babs(q.n);
    return s + (n === ONE ? '' : A.kh(String(n))) + (kpart || '') + 'π' + (q.d === ONE ? '' : '/' + A.kh(String(q.d)));
  }
  function angH(a) { return a.q ? piH(a.q) : dec(a.v); }
  function angP(a) { return a.q ? piP(a.q) : decP(a.v); }
  function angPt(a) { return a.q ? ptLab(a.v, piH(a.q), piP(a.q), true) : ptNum(a.v); }
  var R2 = Math.SQRT2 / 2, R3 = Math.sqrt(3) / 2, T3 = Math.sqrt(3) / 3;
  var ASIN = [[0, 0, 1], [0.5, 1, 6], [R2, 1, 4], [R3, 1, 3], [1, 1, 2]];
  var ACOS = [[1, 0, 1], [R3, 1, 6], [R2, 1, 4], [0.5, 1, 3], [0, 1, 2], [-0.5, 2, 3], [-R2, 3, 4], [-R3, 5, 6], [-1, 1, 1]];
  var ATAN = [[0, 0, 1], [T3, 1, 6], [1, 1, 4], [Math.sqrt(3), 1, 3]];
  function look(tab, c, odd) {
    for (var i = 0; i < tab.length; i++) {
      if (near(c, tab[i][0])) { return angF(F(tab[i][1], tab[i][2])); }
      if (odd && near(c, -tab[i][0])) { return angF(F(-tab[i][1], tab[i][2])); }
    }
    return null;
  }
  function linPi(e) {   /* a·x + q·π → {a, q} */
    switch (e.t) {
      case 'x': return { a: F1, q: F0 };
      case 'c': return e.k === 'pi' ? { a: F0, q: F1 } : null;
      case 'n': return isZ(e.v) ? { a: F0, q: F0 } : null;
      case 'neg': var r = linPi(e.a); return r ? { a: neg(r.a), q: neg(r.q) } : null;
      case '+': case '-':
        var x = linPi(e.a), y = linPi(e.b);
        if (!x || !y) { return null; }
        return e.t === '+' ? { a: add(x.a, y.a), q: add(x.q, y.q) } : { a: sub(x.a, y.a), q: sub(x.q, y.q) };
      case '*':
        var c = constVal(e.a), o = e.b;
        if (!c) { c = constVal(e.b); o = e.a; }
        if (!c) { return null; }
        var z = linPi(o);
        return z ? { a: mul(c, z.a), q: mul(c, z.q) } : null;
      case '/':
        var dv = constVal(e.b);
        if (!dv || isZ(dv)) { return null; }
        var w = linPi(e.a);
        return w ? { a: div(w.a, dv), q: div(w.q, dv) } : null;
    }
    return null;
  }
  function trigStrategy(Lf, op, Rf, f, depth) {
    var nodes = uniqKeys(collect(f, function (n) { return n.t === 'f' && (n.f === 'sin' || n.f === 'cos' || n.f === 'tan') && hasX(n); }));
    if (nodes.length !== 1 || op === '≠') { return null; }
    var node = nodes[0], li = lin(f, key(node));
    if (!li || isZ(li.k) || hasX(li.rest)) { return null; }
    var arg = linPi(node.a);
    if (!arg || isZ(arg.a)) { return null; }
    var cE = simp(mulC(div(F(-1), li.k), li.rest)), c = ev(cE), op2 = sgn(li.k) < 0 ? FLIP[op] : op;
    if (!isFinite(c)) { return null; }
    var fn = node.f, st = [], th = 'θ';
    st.push(tr('Let θ = ' + astH(node.a) + '. The inequality is ' + fn + ' θ ' + op2 + ' ' + astH(cE) + (constVal(cE) ? '' : ' ≈ ' + dec(c)) + '.',
               'តាង θ = ' + astH(node.a) + '។ វិសមីការគឺ ' + fn + ' θ ' + op2 + ' ' + astH(cE) + (constVal(cE) ? '' : ' ≈ ' + dec(c)) + '។'));
    var P = fn === 'tan' ? F1 : F(2), out = null, why = '';
    var lt = function (a, b) { return a < b && !near(a, b); };
    var isEq = function (a, b) { return near(a, b); };
    if (fn === 'sin') {
      var al = look(ASIN, c, true) || angN(Math.asin(Math.max(-1, Math.min(1, c))));
      var piA = function (a) { return angSub(angF(F1), a); };
      if (op2 === '>' || op2 === '≥') {
        if (lt(1, c) || (isEq(c, 1) && op2 === '>')) { out = 'none'; }
        else if (isEq(c, 1)) { out = { pts: angF(F(1, 2)) }; }
        else if (lt(c, -1) || (isEq(c, -1) && op2 === '≥')) { out = 'all'; }
        else if (isEq(c, -1)) { out = { except: angF(F(-1, 2)) }; }
        else { out = { lo: al, hi: piA(al), cl: op2 === '≥' }; }
      } else {
        if (lt(1, c) || (isEq(c, 1) && op2 === '≤')) { out = 'all'; }
        else if (isEq(c, 1)) { out = { except: angF(F(1, 2)) }; }
        else if (lt(c, -1) || (isEq(c, -1) && op2 === '<')) { out = 'none'; }
        else if (isEq(c, -1)) { out = { pts: angF(F(-1, 2)) }; }
        else { out = { lo: piA(al), hi: angAdd(angF(F(2)), al), cl: op2 === '≤' }; }
      }
      why = tr('On the unit circle, sin θ is the height of the point.', 'លើរង្វង់ត្រីកោណមាត្រ sin θ ជាកម្ពស់នៃចំណុច។');
    } else if (fn === 'cos') {
      var be = look(ACOS, c, false) || angN(Math.acos(Math.max(-1, Math.min(1, c))));
      if (op2 === '>' || op2 === '≥') {
        if (lt(1, c) || (isEq(c, 1) && op2 === '>')) { out = 'none'; }
        else if (isEq(c, 1)) { out = { pts: angF(F0) }; }
        else if (lt(c, -1) || (isEq(c, -1) && op2 === '≥')) { out = 'all'; }
        else if (isEq(c, -1)) { out = { except: angF(F1) }; }
        else { out = { lo: angSub(angF(F0), be), hi: be, cl: op2 === '≥' }; }
      } else {
        if (lt(1, c) || (isEq(c, 1) && op2 === '≤')) { out = 'all'; }
        else if (isEq(c, 1)) { out = { except: angF(F0) }; }
        else if (lt(c, -1) || (isEq(c, -1) && op2 === '<')) { out = 'none'; }
        else if (isEq(c, -1)) { out = { pts: angF(F1) }; }
        else { out = { lo: be, hi: angSub(angF(F(2)), be), cl: op2 === '≤' }; }
      }
      why = tr('On the unit circle, cos θ is the horizontal position of the point.', 'លើរង្វង់ត្រីកោណមាត្រ cos θ ជាទីតាំងផ្ដេកនៃចំណុច។');
    } else {
      var ga = look(ATAN, c, true) || angN(Math.atan(c));
      if (op2 === '>' || op2 === '≥') { out = { lo: ga, hi: angF(F(1, 2)), lc: op2 === '≥', hc: false }; }
      else { out = { lo: angF(F(-1, 2)), hi: ga, lc: false, hc: op2 === '≤' }; }
      why = tr('tan θ increases on each interval (−π/2, π/2) and repeats every π; it is not defined at π/2 + kπ.', 'tan θ កើននៅលើចន្លោះ (−π/2, π/2) នីមួយៗ ហើយខួបរៀងរាល់ π; វាមិនកំណត់ត្រង់ π/2 + kπ។');
    }
    if (out && out.lo && out.lc === undefined) { out.lc = out.cl; out.hc = out.cl; }
    /* shift by whole periods so the interval starts in [−P/2, P/2): sin θ < −1/2
       reads −5π/6 < θ < −π/6 rather than 7π/6 < θ < 11π/6 */
    var nk = function (t) { var per = num(P) * Math.PI; return Math.floor((t.v + per / 2) / per + 1e-9); };
    var shiftA = function (t, k) { return k ? angAdd(t, t.q ? angF(mul(F(-k), P)) : angN(-k * num(P) * Math.PI)) : t; };
    if (out && out.lo) { var k0 = nk(out.lo); out.lo = shiftA(out.lo, k0); out.hi = shiftA(out.hi, k0); }
    if (out && (out.pts || out.except)) { var key0 = out.pts ? 'pts' : 'except'; out[key0] = shiftA(out[key0], nk(out[key0])); }
    /* θ back to x: x = (θ − qπ) / a */
    var beta = angF(arg.q), a = arg.a, Px = div(P, fabs(a));
    var toX = function (t) { return angDiv(angSub(t, beta), a); };
    var kH = piH(Px, 'k'), kP = piP(Px, 'k');
    var plus = function (t) { return (t.q && isZ(t.q)) ? kH : angH(t) + ' + ' + kH; };
    var plusP = function (t) { return (t.q && isZ(t.q)) ? kP : angP(t) + ' + ' + kP; };
    var gen, genP, W0 = ptF(F0), W1 = angPt(angF(F(2))), Wset = seg(W0, true, W1, true), S = [];
    var kZ = tr(', k ∈ ℤ', ', k ∈ ℤ');
    if (out === 'all') {
      gen = tr('every real x', 'គ្រប់ចំនួនពិត x'); genP = 'x ∈ ℝ';
      S = Wset;
      if (fn === 'tan') { out = null; }
    } else if (out === 'none') {
      gen = tr('no solution', 'គ្មានចម្លើយ'); genP = '∅'; S = [];
    } else if (out.pts || out.except) {
      var t0 = toX(out.pts || out.except);

      gen = 'x ' + (out.pts ? '=' : '≠') + ' ' + plus(t0) + kZ; genP = 'x ' + (out.pts ? '=' : '≠') + ' ' + plusP(t0) + ', k ∈ ℤ';
      var ptsW = [];
      for (var k = -60; k <= 60; k++) {
        var xv = t0.v + k * num(Px) * Math.PI;
        if (xv > -1e-12 && xv < 2 * Math.PI + 1e-12) { ptsW.push(angPt(t0.q ? angF(add(t0.q, mul(F(k), Px))) : angN(xv))); }
      }
      var PS = ptsW.map(function (p) { return { a: p, ac: true, b: p, bc: true }; });
      S = out.pts ? union(PS, []) : inter(Wset, compl(union(PS, [])));
    } else {
      var x1 = toX(out.lo), x2 = toX(out.hi), c1 = out.lc, c2 = out.hc;
      if (sgn(a) < 0) { var tt = x1; x1 = x2; x2 = tt; var tc = c1; c1 = c2; c2 = tc; }

      gen = plus(x1) + (c1 ? ' ≤ ' : ' < ') + 'x' + (c2 ? ' ≤ ' : ' < ') + plus(x2) + kZ;
      genP = plusP(x1) + (c1 ? ' ≤ ' : ' < ') + 'x' + (c2 ? ' ≤ ' : ' < ') + plusP(x2) + ', k ∈ ℤ';
      var pieces = [];
      for (var k2 = -80; k2 <= 80; k2++) {
        var shift = mul(F(k2), Px);
        var lo = x1.q ? angF(add(x1.q, shift)) : angN(x1.v + num(shift) * Math.PI);
        var hi = x2.q ? angF(add(x2.q, shift)) : angN(x2.v + num(shift) * Math.PI);
        if (hi.v < -1e-12 || lo.v > 2 * Math.PI + 1e-12) { continue; }
        pieces.push({ a: angPt(lo), ac: c1, b: angPt(hi), bc: c2 });
      }
      S = inter(union(pieces, []), Wset);
    }
    if (out && out.lo) {
      st.push(why + ' ' + tr('Over one period: ', 'ក្នុងមួយខួប៖ ') + angH(out.lo) + (out.lc ? ' ≤ ' : ' < ') + th + (out.hc ? ' ≤ ' : ' < ') + angH(out.hi) +
              tr(', and this repeats every ' + piH(P) + '.', ' ហើយវាខួបរៀងរាល់ ' + piH(P) + '។'));
      st.push(tr('So ' + plus(out.lo).replace(kH, piH(P, 'k')) + (out.lc ? ' ≤ ' : ' < ') + astH(node.a) + (out.hc ? ' ≤ ' : ' < ') + plus(out.hi).replace(kH, piH(P, 'k')),
                 'ដូច្នេះ ' + plus(out.lo).replace(kH, piH(P, 'k')) + (out.lc ? ' ≤ ' : ' < ') + astH(node.a) + (out.hc ? ' ≤ ' : ' < ') + plus(out.hi).replace(kH, piH(P, 'k'))));
      if (!(eq(a, F1) && isZ(arg.q))) {
        var how = [], howK = [];
        if (!isZ(arg.q)) {
          how.push(sgn(arg.q) > 0 ? 'subtract ' + piH(arg.q) + ' from every part' : 'add ' + piH(neg(arg.q)) + ' to every part');
          howK.push(sgn(arg.q) > 0 ? 'ដក ' + piH(arg.q) + ' ពីគ្រប់ផ្នែក' : 'បូក ' + piH(neg(arg.q)) + ' ទៅគ្រប់ផ្នែក');
        }
        if (!eq(a, F1)) {
          how.push('divide every part by ' + H(a) + (sgn(a) < 0 ? ' (negative: <b class="iq-flip">the signs reverse</b>)' : ''));
          howK.push('ចែកគ្រប់ផ្នែកនឹង ' + H(a) + (sgn(a) < 0 ? ' (អវិជ្ជមាន៖ <b class="iq-flip">ប្ដូរទិសសញ្ញា</b>)' : ''));
        }
        var hw = how.join(', then '), hk = howK.join(' រួច ');
        st.push(tr(hw.charAt(0).toUpperCase() + hw.slice(1) + '.', hk + '។'));
      }
    } else {
      st.push(why);
    }
    st.push(tr('General solution: <b class="iq-ans">' + gen + '</b>', 'ចម្លើយទូទៅ៖ <b class="iq-ans">' + gen + '</b>'));
    st.push(tr('The solutions in [0, 2π]: ' + setB(S), 'ចម្លើយក្នុង [0, 2π]៖ ' + setB(S)));
    return res(S, st, 'trig', { general: gen, generalP: genP, window: [W0, W1] });
  }

  /* ================================================ the numerical way */
  function numericSolve(fn, op, win) {
    var xs = [], i, N0;
    if (win) { N0 = 6000; for (i = 0; i <= N0; i++) { xs.push(win[0].v + (win[1].v - win[0].v) * i / N0); } }
    else { N0 = 40000; var U = 14.6; for (i = 0; i <= N0; i++) { xs.push(Math.sinh(-U + 2 * U * i / N0)); } xs[N0 / 2] = 0; }
    var cls = function (v) { return (v !== v) ? 'U' : v > 0 ? 1 : v < 0 ? -1 : 0; };
    var vals = xs.map(fn), cs = vals.map(cls), crit = [];
    for (i = 0; i < xs.length; i++) { if (cs[i] === 0) { crit.push(xs[i]); } }
    for (i = 0; i < xs.length - 1; i++) {
      var a = cs[i], b = cs[i + 1];
      if (a !== b && a !== 0 && b !== 0) {
        var l = xs[i], r = xs[i + 1];
        for (var it = 0; it < 80; it++) {
          var m = (l + r) / 2;
          if (m === l || m === r) { break; }
          if (cls(fn(m)) === a) { l = m; } else { r = m; }
        }
        crit.push((l + r) / 2);
      }
    }
    var golden = 0;
    for (i = 1; i < xs.length - 1 && golden < 200; i++) {
      if (cs[i] !== 'U' && cs[i] !== 0 && cs[i - 1] === cs[i] && cs[i + 1] === cs[i] &&
          Math.abs(vals[i]) < Math.abs(vals[i - 1]) && Math.abs(vals[i]) < Math.abs(vals[i + 1])) {
        golden++;
        var lo = xs[i - 1], hi = xs[i + 1], g = (Math.sqrt(5) - 1) / 2;
        for (var j = 0; j < 120; j++) {
          var m1 = hi - g * (hi - lo), m2 = lo + g * (hi - lo);
          if (Math.abs(fn(m1)) < Math.abs(fn(m2))) { hi = m2; } else { lo = m1; }
        }
        var xm = (lo + hi) / 2;
        if (Math.abs(fn(xm)) < 1e-11) { crit.push(xm); }
      }
    }
    var pts = uniqPts(crit.map(ptNum));
    if (win) { pts = uniqPts(pts.filter(function (p) { return p.v > win[0].v && p.v < win[1].v; }).concat([win[0], win[1]])); }
    var tv = testVals(pts);
    var zcls = function (v) { var c = cls(v); return (c !== 'U' && Math.abs(v) < 1e-9) ? 0 : c; };
    var iv = tv.map(function (x, k) {
      if (win && (k === 0 || k === pts.length)) { return false; }
      var c = cls(fn(x)); return c !== 'U' && wants(op, c);
    });
    var pv = pts.map(function (p) { var c = zcls(fn(p.v)); return c !== 'U' && wants(op, c); });
    var final = { iv: tv.map(function (x) { return cls(fn(x)); }), pv: pts.map(function (p) { var c = zcls(fn(p.v)); return c === 'U' ? 'U' : c; }) };
    return { set: fromFlags(pts, iv, pv), pts: pts, final: final };
  }
  function trigOnly(e) {
    var stripped = replace(e, function (n) { return n.t === 'f' && (n.f === 'sin' || n.f === 'cos' || n.f === 'tan'); }, function () { return N(F0); });
    return !hasX(stripped) && has(e, function (n) { return n.t === 'f' && (n.f === 'sin' || n.f === 'cos' || n.f === 'tan'); });
  }
  function numStrategy(Lf, op, Rf) {
    var f = { t: '-', a: Lf, b: Rf };
    var win = trigOnly(f) ? [ptF(F0), angPt(angF(F(2)))] : null;
    var ns = numericSolve(function (x) { return ev(Lf, x) - ev(Rf, x); }, op, win);
    var st = [];
    st.push(tr('No textbook method applies to this one, so it is solved numerically: the sign of f(x) = (' + astH(Lf) + ') − (' + astH(Rf) + ') is followed ' +
               (win ? 'across [0, 2π]' : 'along the whole number line') + ', and every point where it changes is located to about 12 digits.',
               'វិសមីការនេះគ្មានវិធីតាមសៀវភៅទេ ដូច្នេះដោះស្រាយជាលេខប្រហែល៖ តាមដានសញ្ញានៃ f(x) = (' + astH(Lf) + ') − (' + astH(Rf) + ') ' +
               (win ? 'លើ [0, 2π]' : 'តាមបន្ទាត់ចំនួនទាំងមូល') + ' ហើយរកចំណុចដែលវាប្ដូរសញ្ញាឲ្យជិតបំផុត (ប្រហែល ១២ ខ្ទង់)។'));
    var inner = ns.pts.filter(function (p) { return !win || (p.v > win[0].v && p.v < win[1].v); });
    if (inner.length) {
      st.push(tr('f(x) is 0 or changes sign at: ' + ptsList(inner), 'f(x) ស្មើ 0 ឬប្ដូរសញ្ញាត្រង់៖ ' + ptsList(inner)));
    }
    if (ns.pts.length <= 14) {
      var tb = signTable([], ns.pts, [], 'f(x)', 'x', ns.final);
      st.push(tr('Table of signs:', 'តារាងសញ្ញា៖') + tb.html);
    }
    st.push(readOff(op, ns.set, 'x'));
    return res(ns.set, st, 'num', { approx: true, window: win });
  }

  /* ============================================ one line · chains · systems */
  function linearOf(e) {
    var R = toRat(e);
    if (!R || pDeg(R.d) > 0) { return null; }
    var p = pScale(R.n, div(F1, R.d[0]));
    return pDeg(p) === 1 ? p : null;
  }
  function chainSteps(st0) {
    var lo = constVal(st0.terms[0]), hi = constVal(st0.terms[2]), p = linearOf(st0.terms[1]);
    var o1 = st0.ops[0], o2 = st0.ops[1];
    var up = function (o) { return o === '<' || o === '≤'; };
    if (!lo || !hi || !p || up(o1) !== up(o2) || o1 === '≠' || o2 === '≠') { return null; }
    var st = [], m = lcmDen([p, [lo], [hi]]);
    if (!eq(m, F1)) {
      p = pScale(p, m); lo = mul(lo, m); hi = mul(hi, m);
      st.push(tr('Multiply all three parts by ' + H(m) + ' (positive): ' + H(lo) + ' ' + o1 + ' ' + polyH(p, 'x') + ' ' + o2 + ' ' + H(hi),
                 'គុណផ្នែកទាំងបីនឹង ' + H(m) + ' (វិជ្ជមាន)៖ ' + H(lo) + ' ' + o1 + ' ' + polyH(p, 'x') + ' ' + o2 + ' ' + H(hi)));
    }
    var a = p[1], b = p[0] || F0;
    if (!isZ(b)) {
      lo = sub(lo, b); hi = sub(hi, b);
      st.push(tr((sgn(b) > 0 ? 'Subtract ' + H(b) + ' from' : 'Add ' + H(fabs(b)) + ' to') + ' all three parts: ' + H(lo) + ' ' + o1 + ' ' + polyH([F0, a], 'x') + ' ' + o2 + ' ' + H(hi),
                 (sgn(b) > 0 ? 'ដក ' + H(b) + ' ពី' : 'បូក ' + H(fabs(b)) + ' ទៅ') + 'ផ្នែកទាំងបី៖ ' + H(lo) + ' ' + o1 + ' ' + polyH([F0, a], 'x') + ' ' + o2 + ' ' + H(hi)));
    }
    var x1 = div(lo, a), x2 = div(hi, a), p1 = o1, p2 = o2;
    if (sgn(a) < 0) {
      var t = x1; x1 = x2; x2 = t; p1 = o2; p2 = o1;
      st.push(tr('Divide all three parts by ' + H(a) + '. <b class="iq-flip">It is negative, so both signs reverse</b>; written the right way round: ' + H(x1) + ' ' + p1 + ' x ' + p2 + ' ' + H(x2),
                 'ចែកផ្នែកទាំងបីនឹង ' + H(a) + '។ <b class="iq-flip">វាអវិជ្ជមាន ដូច្នេះសញ្ញាទាំងពីរប្ដូរទិស</b>; សរសេរតាមលំដាប់៖ ' + H(x1) + ' ' + p1 + ' x ' + p2 + ' ' + H(x2)));
    } else if (!eq(a, F1)) {
      st.push(tr('Divide all three parts by ' + H(a) + ' (positive): ' + H(x1) + ' ' + p1 + ' x ' + p2 + ' ' + H(x2),
                 'ចែកផ្នែកទាំងបីនឹង ' + H(a) + ' (វិជ្ជមាន)៖ ' + H(x1) + ' ' + p1 + ' x ' + p2 + ' ' + H(x2)));
    }
    var s1 = up(p1) ? ray(ptF(x1), FLIP[p1]) : ray(ptF(x1), FLIP[p1]);
    var s2 = ray(ptF(x2), p2);
    var S = up(p1) ? inter(s1, s2) : inter(ray(ptF(x1), FLIP[p1]), ray(ptF(x2), p2));
    return res(S, st, 'dbl');
  }
  function solveStatement(s) {
    var pairs = [];
    for (var i = 0; i < s.ops.length; i++) { pairs.push([s.terms[i], s.ops[i], s.terms[i + 1]]); }
    if (pairs.length === 1) {
      var r = solveOne(pairs[0][0], pairs[0][1], pairs[0][2], 0) || numStrategy(pairs[0][0], pairs[0][1], pairs[0][2]);
      r.h = relH(s.terms, s.ops); r.p = s.src;
      return r;
    }
    if (pairs.length === 2) {
      var c = chainSteps(s);
      if (c) { c.h = relH(s.terms, s.ops); c.p = s.src; return c; }
    }
    var st = [tr('This means all of these at once:', 'នេះមានន័យថា ទាំងអស់នេះក្នុងពេលតែមួយ៖')], S = ALL, approx = false, kinds = {};
    pairs.forEach(function (pr) {
      var rr = solveOne(pr[0], pr[1], pr[2], 0) || numStrategy(pr[0], pr[1], pr[2]);
      approx = approx || rr.approx; kinds[rr.kind] = 1;
      st.push(detail(I(pr[0], pr[1], pr[2]), rr));
      S = inter(S, rr.set);
    });
    st.push(tr('Intersection: ' + setB(S), 'ប្រសព្វ៖ ' + setB(S)));
    var k = Object.keys(kinds);
    return res(S, st, k.length === 1 && k[0] === 'lin' ? 'dbl' : 'dbl', { approx: approx, h: relH(s.terms, s.ops), p: s.src });
  }
  function solveText(text) {
    var sts = parseAll(text, ['x']);
    var results = sts.map(solveStatement);
    if (results.length === 1) {
      var r = results[0];
      r.rows = [{ h: r.h, set: r.set }];
      return r;
    }
    var st = [], S = ALL, approx = false, win = null, gen = [];
    results.forEach(function (r, i) {
      approx = approx || r.approx;
      if (r.window) { win = r.window; }
      st.push(tr('<b>(' + (i + 1) + ')</b> ', '<b>(' + A.kh(i + 1) + ')</b> ') + detail(r.h, r));
      S = inter(S, r.set);
    });
    if (win) { S = inter(S, seg(win[0], true, win[1], true)); }
    st.push(tr('Every inequality must hold, so take the intersection of all ' + results.length + ' solution sets' + (win ? ' (within [0, 2π])' : '') + ': ' + setB(S),
               'វិសមីការទាំងអស់ត្រូវពិត ដូច្នេះយកប្រសព្វនៃសំណុំចម្លើយទាំង ' + A.kh(results.length) + (win ? ' (ក្នុង [0, 2π])' : '') + '៖ ' + setB(S)));
    return res(S, st, 'sys', {
      approx: approx, window: win,
      rows: results.map(function (r, i) { return { h: '(' + A.kh(i + 1) + ') ' + r.h, set: r.set, tag: '(' + A.kh(i + 1) + ')' }; })
    });
  }

  /* ===================================================== two variables
     Linear inequalities in x and y: each one is a half-plane, the system is
     their intersection. The region is found by clipping a huge square with
     every half-plane (in floating point — only to draw it and to tell bounded
     from unbounded); its corners are found exactly, by intersecting the
     boundary lines two at a time with fractions and keeping the points that
     satisfy every inequality. */
  function lin2(e) {
    if (!hasVar(e)) { var c = constVal(e); return c ? { a: F0, b: F0, c: c } : null; }
    var p, q, k;
    switch (e.t) {
      case 'x': return { a: F1, b: F0, c: F0 };
      case 'y': return { a: F0, b: F1, c: F0 };
      case 'neg': p = lin2(e.a); return p ? { a: neg(p.a), b: neg(p.b), c: neg(p.c) } : null;
      case '+': case '-':
        p = lin2(e.a); q = lin2(e.b);
        if (!p || !q) { return null; }
        return e.t === '+' ? { a: add(p.a, q.a), b: add(p.b, q.b), c: add(p.c, q.c) } : { a: sub(p.a, q.a), b: sub(p.b, q.b), c: sub(p.c, q.c) };
      case '*':
        k = constVal(e.a); p = k ? lin2(e.b) : null;
        if (!k) { k = constVal(e.b); p = k ? lin2(e.a) : null; }
        return (k && p) ? { a: mul(k, p.a), b: mul(k, p.b), c: mul(k, p.c) } : null;
      case '/':
        k = constVal(e.b);
        if (!k || isZ(k)) { return null; }
        p = lin2(e.a);
        return p ? { a: div(p.a, k), b: div(p.b, k), c: div(p.c, k) } : null;
      case '^':
        k = constVal(e.b);
        return (k && eq(k, F1)) ? lin2(e.a) : null;
    }
    return null;
  }
  function xyH(a, b, rhs) { /* a x + b y = rhs, as HTML */
    var out = '', first = true;
    [[a, 'x'], [b, 'y']].forEach(function (t) {
      if (isZ(t[0])) { return; }
      var ch = coefH(t[0], first);
      out += (first ? ch.sign : ' ' + ch.sign + ' ') + ch.body + t[1];
      first = false;
    });
    return (out || '0');
  }
  function pairH(x, y) { var sep = style() === 'fr' ? ' ; ' : ', '; return '(' + H(x) + sep + H(y) + ')'; }
  function pairP(x, y) { var sep = style() === 'fr' ? ' ; ' : ', '; return '(' + plainK(x) + sep + plainK(y) + ')'; }

  function clipPoly(poly, a, b, c, s) {   /* keep s·(a x + b y + c) ≥ 0 */
    var out = [], g = function (p) { return s * (a * p[0] + b * p[1] + c); };
    for (var i = 0; i < poly.length; i++) {
      var P1 = poly[i], P2 = poly[(i + 1) % poly.length], g1 = g(P1), g2 = g(P2);
      var tol = 1e-9 * (Math.abs(a) + Math.abs(b) + Math.abs(c) + 1);
      if (g1 >= -tol) { out.push(P1); }
      if ((g1 > tol && g2 < -tol) || (g1 < -tol && g2 > tol)) {
        var t = g1 / (g1 - g2);
        out.push([P1[0] + t * (P2[0] - P1[0]), P1[1] + t * (P2[1] - P1[1])]);
      }
    }
    return out;
  }
  function area(poly) {
    var s = 0;
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; }
    return Math.abs(s) / 2;
  }

  function solveTwo(text, objText) {
    var sts = parseAll(text, ['x', 'y']), cons = [], st = [];
    sts.forEach(function (s) {
      for (var i = 0; i < s.ops.length; i++) {
        var L = lin2(s.terms[i]), R = lin2(s.terms[i + 1]);
        if (!L || !R) {
          throw new ParseError('With two unknowns each inequality must be linear, like 2x + 3y ≤ 12.', 'ពេលមានអញ្ញាតពីរ វិសមីការនីមួយៗត្រូវជាដឺក្រេទី១ ដូចជា 2x + 3y ≤ 12។');
        }
        if (s.ops[i] === '≠') { throw new ParseError('≠ is not used with two unknowns.', 'មិនប្រើ ≠ ជាមួយអញ្ញាតពីរទេ។'); }
        cons.push({ a: sub(L.a, R.a), b: sub(L.b, R.b), c: sub(L.c, R.c), op: s.ops[i], h: I(s.terms[i], s.ops[i], s.terms[i + 1]) });
      }
    });
    var M = 1e6, poly = [[-M, -M], [M, -M], [M, M], [-M, M]], empty = false;
    cons.forEach(function (k, idx) {
      var tag = '<b>(' + A.kh(idx + 1) + ')</b> ';
      if (isZ(k.a) && isZ(k.b)) {
        var ok = wants(k.op, sgn(k.c));
        st.push(tag + k.h + tr(' has no x or y: it is ' + (ok ? 'always true and changes nothing.' : 'never true, so there is no solution.'),
                                ' គ្មាន x ឬ y ទេ៖ វា' + (ok ? 'ពិតជានិច្ច មិនប្ដូរអ្វីទេ។' : 'មិនពិតដាច់ខាត ដូច្នេះគ្មានចម្លើយ។')));
        if (!ok) { empty = true; }
        k.skip = true;
        return;
      }
      if (sgn(k.a) < 0 || (isZ(k.a) && sgn(k.b) < 0)) { k = { a: neg(k.a), b: neg(k.b), c: neg(k.c), op: FLIP[k.op], h: k.h, flipped: true }; cons[idx] = k; }
      var rhs = neg(k.c), pts = [];
      if (!isZ(rhs)) {
        if (!isZ(k.a)) { pts.push(pairH(div(rhs, k.a), F0)); }
        if (!isZ(k.b)) { pts.push(pairH(F0, div(rhs, k.b))); }
        if (isZ(k.a)) { pts.push(pairH(F1, div(rhs, k.b))); }
        if (isZ(k.b)) { pts.push(pairH(div(rhs, k.a), F1)); }
      } else {
        pts.push(pairH(F0, F0));
        pts.push(isZ(k.b) ? pairH(F0, F1) : pairH(F1, div(neg(k.a), k.b)));
      }
      var tx = isZ(rhs) ? (isZ(k.a) ? F0 : F1) : F0, ty = isZ(rhs) ? (isZ(k.a) ? F1 : F0) : F0;
      var gv = add(add(mul(k.a, tx), mul(k.b, ty)), k.c), holds = wants(k.op, sgn(gv));
      var tp = pairH(tx, ty), strict = k.op === '<' || k.op === '>';
      st.push(tag + k.h + tr(': boundary line ' + xyH(k.a, k.b) + ' = ' + H(rhs) + ' through ' + pts.join(' and ') + ', drawn ' + (strict ? '<b>dashed</b> (not included)' : '<b>solid</b> (included)') +
                             '. Test the point ' + tp + ': ' + (holds ? 'true' : 'false') + ', so keep the side ' + (holds ? 'that contains' : 'that does not contain') + ' it.',
                             '៖ បន្ទាត់ព្រំដែន ' + xyH(k.a, k.b) + ' = ' + H(rhs) + ' កាត់តាម ' + pts.join(' និង ') + ' គូរ' + (strict ? '<b>ជាដាច់ៗ</b> (មិនរាប់បញ្ចូល)' : '<b>ជាបន្ទាត់ជាប់</b> (រាប់បញ្ចូល)') +
                             '។ សាកចំណុច ' + tp + '៖ ' + (holds ? 'ពិត' : 'មិនពិត') + ' ដូច្នេះយកផ្នែក' + (holds ? 'ដែលមាន' : 'ដែលគ្មាន') + 'ចំណុចនោះ។'));
      var s = (k.op === '>' || k.op === '≥') ? 1 : -1;
      poly = clipPoly(poly, num(k.a), num(k.b), num(k.c), s);
    });
    var live = cons.filter(function (k) { return !k.skip; });
    var ar = poly.length >= 3 ? area(poly) : 0;
    if (!poly.length) { empty = true; }
    /* exact corners */
    var verts = [];
    for (var i = 0; i < live.length; i++) {
      for (var j = i + 1; j < live.length; j++) {
        var p = live[i], q = live[j], D = sub(mul(p.a, q.b), mul(p.b, q.a));
        if (isZ(D)) { continue; }
        var x = div(sub(mul(neg(p.c), q.b), mul(p.b, neg(q.c))), D);
        var y = div(sub(mul(p.a, neg(q.c)), mul(neg(p.c), q.a)), D);
        var okAll = true, inc = true;
        live.forEach(function (k) {
          var gv = add(add(mul(k.a, x), mul(k.b, y)), k.c), sg = sgn(gv);
          var sOK = (k.op === '>' || k.op === '≥') ? sg >= 0 : sg <= 0;
          if (!sOK) { okAll = false; }
          if (sg === 0 && (k.op === '<' || k.op === '>')) { inc = false; }
        });
        if (okAll && !verts.some(function (v) { return eq(v.x, x) && eq(v.y, y); })) { verts.push({ x: x, y: y, inc: inc }); }
      }
    }
    if (empty || (!verts.length && ar < 1e-9)) { empty = true; }
    var bounded = !empty && poly.every(function (pt) { return Math.abs(pt[0]) < M / 2 && Math.abs(pt[1]) < M / 2; });
    if (verts.length) {
      var cx = verts.reduce(function (s, v) { return s + num(v.x); }, 0) / verts.length, cy = verts.reduce(function (s, v) { return s + num(v.y); }, 0) / verts.length;
      verts.sort(function (u, v) { return Math.atan2(num(u.y) - cy, num(u.x) - cx) - Math.atan2(num(v.y) - cy, num(v.x) - cx); });
    }
    var strictAll = live.length && live.every(function (k) { return k.op === '<' || k.op === '>'; });
    if (empty) {
      st.push(tr('The half-planes have no point in common: <b class="iq-ans">no solution (∅)</b>.', 'កន្លះប្លង់ទាំងនេះគ្មានចំណុចរួមទេ៖ <b class="iq-ans">គ្មានចម្លើយ (∅)</b>។'));
    } else {
      st.push(tr('The solution is the region where all the half-planes overlap — shaded on the graph. It is ' + (bounded ? '<b>bounded</b> (a polygon)' : '<b>unbounded</b> (it goes on for ever in some direction)') + '.',
                 'ចម្លើយគឺជាតំបន់ដែលកន្លះប្លង់ទាំងអស់ត្រួតគ្នា — តំបន់ដែលដាក់ពណ៌លើក្រាប។ វា' + (bounded ? '<b>មានព្រំដែនកំណត់</b> (ពហុកោណ)' : '<b>គ្មានព្រំដែន</b> (លាតសន្ធឹងរហូត)') + '។'));
      if (verts.length) {
        st.push(tr('Corner points (each where two boundary lines meet, found exactly): ', 'កំពូល (ចំណុចប្រសព្វនៃបន្ទាត់ព្រំដែនពីរ គណនាពិតប្រាកដ)៖ ') +
                verts.map(function (v) { return pairH(v.x, v.y) + (v.inc ? '' : tr(' (not included)', ' (មិនរាប់បញ្ចូល)')); }).join(', '));
      }
    }
    /* objective */
    var obj = null;
    if (objText && String(objText).trim() && !empty) {
      var ot = normalise(String(objText)).replace(/^\s*[zZfFpP]\s*\(?[^=]*?=\s*/, '').replace(/^\s*[zZ]\s*=/, '');
      var ox;
      try { var pp = new Parser(tokenize(ot, ['x', 'y'])); ox = pp.expr(); if (pp.i < pp.t.length) { ox = null; } } catch (e) { ox = null; }
      var oz = ox && lin2(ox);
      if (!oz) {
        obj = { err: tr('The objective must be linear, like 3x + 2y.', 'អនុគមន៍គោលដៅត្រូវជាដឺក្រេទី១ ដូចជា 3x + 2y។') };
      } else {
        var zv = function (v) { return add(add(mul(oz.a, v.x), mul(oz.b, v.y)), oz.c); };
        var vals = verts.map(function (v) { return { v: v, z: zv(v) }; });
        var zf = function (pt) { return num(oz.a) * pt[0] + num(oz.b) * pt[1] + num(oz.c); };
        var maxF = Math.max.apply(null, poly.map(zf)), minF = Math.min.apply(null, poly.map(zf));
        var best = function (dir) {
          if (!vals.length) { return null; }
          var b = vals.reduce(function (m, t) { return (dir > 0 ? cmp(t.z, m.z) > 0 : cmp(t.z, m.z) < 0) ? t : m; });
          var lim = dir > 0 ? maxF : minF;
          if (!bounded && Math.abs(lim - num(b.z)) > 1e-6 * (1 + Math.abs(lim))) { return null; }
          return b;
        };
        var mx = best(1), mn = best(-1);
        var zH = 'z = ' + polyFree(oz);
        var rows = vals.map(function (t) { return '<tr><td>' + pairH(t.v.x, t.v.y) + '</td><td>' + H(t.z) + '</td></tr>'; }).join('');
        st.push(tr('Objective ' + zH + '. Its largest and smallest values on the region are at corners (if they exist). Value at each corner:',
                   'អនុគមន៍គោលដៅ ' + zH + '។ តម្លៃធំបំផុត និងតូចបំផុតលើតំបន់ ស្ថិតនៅត្រង់កំពូល (បើមាន)។ តម្លៃនៅកំពូលនីមួយៗ៖') +
                '<div class="iq-tabwrap"><table class="iq-ztab"><tr><th>' + tr('corner', 'កំពូល') + '</th><th>z</th></tr>' + rows + '</table></div>');
        var mxH = mx ? tr('maximum z = ' + H(mx.z) + ' at ' + pairH(mx.v.x, mx.v.y), 'តម្លៃអតិបរមា z = ' + H(mx.z) + ' ត្រង់ ' + pairH(mx.v.x, mx.v.y)) + (mx.v.inc ? '' : tr(' (approached, not reached — that corner is not included)', ' (ខិតជិត មិនដល់ — កំពូលនោះមិនរាប់បញ្ចូល)'))
                     : tr('no maximum (z grows without limit on this region)', 'គ្មានតម្លៃអតិបរមា (z កើនរហូតលើតំបន់នេះ)');
        var mnH = mn ? tr('minimum z = ' + H(mn.z) + ' at ' + pairH(mn.v.x, mn.v.y), 'តម្លៃអប្បបរមា z = ' + H(mn.z) + ' ត្រង់ ' + pairH(mn.v.x, mn.v.y)) + (mn.v.inc ? '' : tr(' (approached, not reached — that corner is not included)', ' (ខិតជិត មិនដល់ — កំពូលនោះមិនរាប់បញ្ចូល)'))
                     : tr('no minimum (z decreases without limit on this region)', 'គ្មានតម្លៃអប្បបរមា (z ថយរហូតលើតំបន់នេះ)');
        st.push('<b class="iq-ans">' + mxH + '</b>; <b class="iq-ans">' + mnH + '</b>.');
        obj = { mx: mxH, mn: mnH, zH: zH };
      }
    }
    return { kind: 'two', steps: st, cons: cons, live: live, verts: verts, poly: poly, empty: empty, bounded: bounded, obj: obj, strictAll: strictAll };
  }
  function polyFree(o) {
    var out = xyH(o.a, o.b);
    if (!isZ(o.c)) { out = (out === '0' ? '' : out + (sgn(o.c) > 0 ? ' + ' : ' − ')) + H(out === '0' ? o.c : fabs(o.c)); }
    return out;
  }

  /* --------------------------------------------------------- the graph */
  function niceStep(span) {
    var raw = span / 8, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function graphTwo(R) {
    var xsV = [0], ysV = [0];
    R.verts.forEach(function (v) { xsV.push(num(v.x)); ysV.push(num(v.y)); });
    R.live.forEach(function (k) {
      var rhs = -num(k.c), a = num(k.a), b = num(k.b);
      if (a) { xsV.push(rhs / a); }
      if (b) { ysV.push(rhs / b); }
    });
    var x0 = Math.min.apply(null, xsV), x1 = Math.max.apply(null, xsV), y0 = Math.min.apply(null, ysV), y1 = Math.max.apply(null, ysV);
    var padX = Math.max(1.5, (x1 - x0) * (R.bounded ? 0.18 : 0.4)), padY = Math.max(1.5, (y1 - y0) * (R.bounded ? 0.18 : 0.4));
    x0 -= padX; x1 += padX; y0 -= padY; y1 += padY;
    var W = 560, Hh = 440, ar = W / Hh;
    var sx = x1 - x0, sy = y1 - y0;
    if (sx / sy > ar) { var cy = (y0 + y1) / 2; sy = sx / ar; y0 = cy - sy / 2; y1 = cy + sy / 2; }
    else { var cx = (x0 + x1) / 2; sx = sy * ar; x0 = cx - sx / 2; x1 = cx + sx / 2; }
    var X = function (x) { return (x - x0) / sx * W; }, Y = function (y) { return Hh - (y - y0) / sy * Hh; };
    var f2 = function (n) { return Math.round(n * 10) / 10; };
    var out = '<svg class="iq-graph" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="' + tr('Graph of the region', 'ក្រាបនៃតំបន់') + '">';
    var step = niceStep(Math.max(sx, sy)), g;
    for (g = Math.ceil(x0 / step) * step; g <= x1; g += step) {
      out += '<line class="iq-g-grid" x1="' + f2(X(g)) + '" y1="0" x2="' + f2(X(g)) + '" y2="' + Hh + '"/>';
      if (Math.abs(g) > step / 2) { out += '<text class="iq-g-tick" x="' + f2(X(g)) + '" y="' + f2(Math.min(Hh - 4, Math.max(14, Y(0) + 15))) + '" text-anchor="middle">' + A.kh(String(+g.toPrecision(6)).replace('-', '−')) + '</text>'; }
    }
    for (g = Math.ceil(y0 / step) * step; g <= y1; g += step) {
      out += '<line class="iq-g-grid" x1="0" y1="' + f2(Y(g)) + '" x2="' + W + '" y2="' + f2(Y(g)) + '"/>';
      if (Math.abs(g) > step / 2) { out += '<text class="iq-g-tick" x="' + f2(Math.min(W - 6, Math.max(6, X(0) - 6))) + '" y="' + f2(Y(g) + 4) + '" text-anchor="end">' + A.kh(String(+g.toPrecision(6)).replace('-', '−')) + '</text>'; }
    }
    out += '<line class="iq-g-axis" x1="0" y1="' + f2(Y(0)) + '" x2="' + W + '" y2="' + f2(Y(0)) + '"/>';
    out += '<line class="iq-g-axis" x1="' + f2(X(0)) + '" y1="0" x2="' + f2(X(0)) + '" y2="' + Hh + '"/>';
    out += '<text class="iq-g-lab" x="' + (W - 8) + '" y="' + f2(Y(0) - 7) + '" text-anchor="end">x</text>';
    out += '<text class="iq-g-lab" x="' + f2(X(0) + 8) + '" y="16">y</text>';
    if (!R.empty) {
      var view = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      R.live.forEach(function (k) { view = clipPoly(view, num(k.a), num(k.b), num(k.c), (k.op === '>' || k.op === '≥') ? 1 : -1); });
      if (view.length >= 3) {
        out += '<polygon class="iq-g-region" points="' + view.map(function (p) { return f2(X(p[0])) + ',' + f2(Y(p[1])); }).join(' ') + '"/>';
      }
    }
    R.live.forEach(function (k, i) {
      var a = num(k.a), b = num(k.b), c = num(k.c), P2 = [];
      [[x0, null], [x1, null], [null, y0], [null, y1]].forEach(function (e) {
        if (e[0] !== null && b) { var yy = -(a * e[0] + c) / b; if (yy >= y0 - 1e-9 && yy <= y1 + 1e-9) { P2.push([e[0], yy]); } }
        if (e[1] !== null && a) { var xx = -(b * e[1] + c) / a; if (xx >= x0 - 1e-9 && xx <= x1 + 1e-9) { P2.push([xx, e[1]]); } }
      });
      if (P2.length < 2) { return; }
      var A1 = P2[0], B1 = P2.reduce(function (m, p) { return Math.hypot(p[0] - A1[0], p[1] - A1[1]) > Math.hypot(m[0] - A1[0], m[1] - A1[1]) ? p : m; }, P2[0]);
      var strict = k.op === '<' || k.op === '>';
      out += '<line class="iq-g-line' + (strict ? ' is-strict' : '') + ' c' + (i % 6) + '" x1="' + f2(X(A1[0])) + '" y1="' + f2(Y(A1[1])) + '" x2="' + f2(X(B1[0])) + '" y2="' + f2(Y(B1[1])) + '"/>';
      var tx = X(A1[0] + (B1[0] - A1[0]) * 0.12), ty = Y(A1[1] + (B1[1] - A1[1]) * 0.12);
      out += '<text class="iq-g-num c' + (i % 6) + '" x="' + f2(Math.min(W - 14, Math.max(14, tx))) + '" y="' + f2(Math.min(Hh - 6, Math.max(14, ty - 6))) + '" text-anchor="middle">(' + A.kh(i + 1) + ')</text>';
    });
    R.verts.forEach(function (v) {
      var px = X(num(v.x)), py = Y(num(v.y));
      if (px < -5 || px > W + 5 || py < -5 || py > Hh + 5) { return; }
      out += '<circle class="iq-g-vtx' + (v.inc ? '' : ' is-open') + '" cx="' + f2(px) + '" cy="' + f2(py) + '" r="5"/>';
      var right = px > W - 110;
      out += '<text class="iq-g-vl" x="' + f2(right ? px - 8 : px + 8) + '" y="' + f2(Math.max(12, py - 8)) + '"' + (right ? ' text-anchor="end"' : '') + '>' + pairP(v.x, v.y) + '</text>';
    });
    return out + '</svg>';
  }

  /* ================================================================ page */
  /* Engine HTML puts the relation signs in as plain characters; on the way
     to the page they are escaped and, in Khmer, every digit becomes a Khmer
     digit — tags are left alone. */
  function safe(html) {
    return String(html).replace(/(<\/?[a-zA-Z][^<>]*>)|([^<]+|<)/g, function (m, tag, text) {
      if (tag) { return tag; }
      return A.kh(text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    });
  }

  /* --------------------------------------------------------- number line
     Points evenly spaced (not to scale), as in the book. One row per
     inequality of a system, the answer in the last row. */
  function numberLine(rows, win, width) {
    var pts = [];
    rows.forEach(function (r) { pts = pts.concat(setPts(r.set)); });
    if (win) { pts = pts.concat(win); }
    pts = uniqPts(pts);
    var n0 = pts.length, W = Math.max(300, Math.min(640, width || 640, 260 + n0 * 80)), mL = rows.length > 1 ? 52 : 14, mR = 18, rowH = 46, top = 16;
    var n = pts.length, x0 = mL + (win ? 18 : Math.min(80, W / 7)), x1 = W - mR - (win ? 18 : Math.min(80, W / 7));
    var pos = function (p) {
      for (var i = 0; i < n; i++) { if (ptEq(pts[i], p)) { return n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1); } }
      return (x0 + x1) / 2;
    };
    
    var Ht = top + rows.length * rowH + 26;
    var out = '<svg class="iq-nl" viewBox="0 0 ' + W + ' ' + Ht + '" role="img" aria-label="' + tr('Number line', 'បន្ទាត់ចំនួន') + '">';
    pts.forEach(function (p) {
      var x = pos(p);
      out += '<line class="iq-nl-guide" x1="' + x + '" y1="' + (top - 6) + '" x2="' + x + '" y2="' + (top + rows.length * rowH - 8) + '"/>';
    });
    rows.forEach(function (r, i) {
      var y = top + i * rowH + 18, last = i === rows.length - 1 && rows.length > 1;
      var L0 = win ? pos(win[0]) : mL, L1 = win ? pos(win[1]) : W - mR;
      out += '<line class="iq-nl-axis" x1="' + mL + '" y1="' + y + '" x2="' + (W - mR) + '" y2="' + y + '"/>';
      out += '<path class="iq-nl-arrow" d="M' + (W - mR) + ' ' + y + 'l-8 -4.5v9z"/>';
      if (r.tag) { out += '<text class="iq-nl-tag' + (last ? ' is-final' : '') + '" x="4" y="' + (y + 4) + '">' + r.tag + '</text>'; }
      r.set.forEach(function (s) {
        var a = s.a ? pos(s.a) : L0 + (win ? 0 : 2), b = s.b ? pos(s.b) : L1 - (win ? 0 : 10);
        if (s.a && s.b && ptEq(s.a, s.b)) { out += '<circle class="iq-nl-dot' + (last ? ' is-final' : '') + '" cx="' + a + '" cy="' + y + '" r="5.5"/>'; return; }
        out += '<line class="iq-nl-seg' + (last ? ' is-final' : '') + '" x1="' + a + '" y1="' + y + '" x2="' + b + '" y2="' + y + '"/>';
        if (s.a) { out += '<circle class="' + (s.ac ? 'iq-nl-dot' : 'iq-nl-open') + (last ? ' is-final' : '') + '" cx="' + a + '" cy="' + y + '" r="5.5"/>'; }
        if (s.b) { out += '<circle class="' + (s.bc ? 'iq-nl-dot' : 'iq-nl-open') + (last ? ' is-final' : '') + '" cx="' + b + '" cy="' + y + '" r="5.5"/>'; }
      });
    });
    var ly = top + rows.length * rowH + 10;
    pts.forEach(function (p) {
      out += '<text class="iq-nl-lab" x="' + pos(p) + '" y="' + ly + '" text-anchor="middle">' + A.esc(p.p) + '</text>';
    });
    return out + '</svg>';
  }

  var KEYS1 = [
    ['≤', ' ≤ '], ['≥', ' ≥ '], ['<', ' < '], ['>', ' > '], ['x', 'x'], ['x²', '^2'], ['xⁿ', '^'],
    ['( )', '()', 1], ['/', '/'], ['| |', '||', 1], ['√', '√()', 1], ['eˣ', 'e^'], ['log', 'log_2()', 1],
    ['ln', 'ln()', 1], ['sin', 'sin()', 1], ['cos', 'cos()', 1], ['tan', 'tan()', 1], ['π', 'π'], ['↵', '\n']
  ];
  var KEYS2 = [['≤', ' ≤ '], ['≥', ' ≥ '], ['<', ' < '], ['>', ' > '], ['x', 'x'], ['y', 'y'], ['( )', '()', 1], ['/', '/'], ['↵', '\n']];

  var EX1 = [
    ['lin',  ['Linear', 'ដឺក្រេទី១'], ['2x − 5 > 3', '3(x − 2) ≤ 5x + 4', '(2x − 1)/3 ≤ (x + 1)/2', '−4x + 1 ≥ 9', '2(x + 1) > 2x − 3']],
    ['dbl',  ['Double', 'ពីរជាន់'], ['−3 < 2x + 1 ≤ 7', '1 ≤ (3 − x)/2 < 4', 'x − 1 < 2x + 3 < x + 7']],
    ['sys',  ['System', 'ប្រព័ន្ធ'], ['2x − 1 > 3\n5 − x ≥ −2', 'x² − 4 < 0\n2x + 1 > 0', '(x − 1)/(x + 2) ≥ 0\n|x| < 5']],
    ['quad', ['Quadratic', 'ដឺក្រេទី២'], ['x² − 5x + 6 > 0', '−x² + 4x − 3 ≥ 0', 'x² + 2x + 5 < 0', '4x² − 12x + 9 ≤ 0', 'x² ≥ 7', '2x² + x < 3']],
    ['poly', ['Polynomial', 'ពហុធា'], ['(x − 1)(x + 2)(x − 3) ≥ 0', 'x³ − 4x < 0', 'x⁴ − 5x² + 4 ≤ 0', '(x − 2)²(x + 1) > 0', 'x³ − 3x + 1 > 0']],
    ['rat',  ['Fractions', 'ប្រភាគ'], ['(x − 1)/(x + 2) ≥ 0', '(2x + 1)/(x − 3) < 1', '1/x > x', '(x² − 4)/(x² − 1) ≤ 0', '3/(x − 1) ≥ 2/(x + 1)']],
    ['abs',  ['Absolute value', 'តម្លៃដាច់ខាត'], ['|2x − 1| < 5', '|x + 3| ≥ 2', '|x − 1| + |x + 2| < 5', '|x − 2| ≤ |2x + 1|', '|x² − 4| > 3x', '||x| − 2| < 1']],
    ['rad',  ['Square root', 'ឫសការេ'], ['√(x + 3) > x + 1', '√(2x − 1) < 3', '√(x + 5) ≥ √(3 − x)', '√(x² − 4) ≤ x − 1', '2√x > x']],
    ['exp',  ['Exponential', 'អិចស្ប៉ូណង់ស្យែល'], ['2^(x + 1) > 8', '(1/3)^(2x − 1) ≤ 9', '4^x − 3·2^x + 2 < 0', 'e^(2x) > e^(x + 1)', '3^x ≥ 5', '2^x + 2^(−x) > 5/2']],
    ['log',  ['Logarithm', 'លោការីត'], ['log_2(x − 1) < 3', 'ln(2x − 1) > ln(x + 2)', 'log_(1/2)(x + 1) ≥ −2', 'log(x) + log(x − 3) ≤ 1', 'ln²x − 3ln x + 2 > 0', 'log_2 x + log_4 x > 3']],
    ['trig', ['Trigonometric', 'ត្រីកោណមាត្រ'], ['sin x > 1/2', 'cos 2x ≤ √3/2', 'tan x ≥ 1', '2sin(x − π/3) + 1 < 0', 'cos x < −1/3']],
    ['num',  ['Other', 'ផ្សេងៗ'], ['2^x > x²', 'e^x > x + 2', 'x·ln x < 1']]
  ];
  var EX2 = [
    ['x + y ≤ 6\nx − y ≥ −2\nx ≥ 0\ny ≥ 0', 'z = 3x + 2y'],
    ['2x + y ≤ 8\nx + 3y ≤ 9\nx ≥ 0\ny ≥ 0', 'z = 5x + 4y'],
    ['x + y ≥ 4\nx ≥ 0\ny ≥ 0', 'z = 2x + 3y'],
    ['y ≥ 2x − 3\ny ≤ −x + 6\ny ≥ 0', ''],
    ['2x + 3y < 12\nx > 1', ''],
    ['x + y ≤ 1\nx + y ≥ 3', '']
  ];

  function initUI() {
    var $ = function (id) { return document.getElementById(id); };
    var el = {
      modes: $('iqModes'), inp: $('iqIn'), keys: $('iqKeys'), prev: $('iqPrev'), objF: $('iqObjF'), obj: $('iqObj'),
      cats: $('iqCats'), ex: $('iqEx'), clear: $('iqClear'), note: $('iqNote'),
      result: $('iqResult'), kind: $('iqKind'), big: $('iqBig'), alt: $('iqAlt'), line: $('iqLine'), copy: $('iqCopy'),
      steps: $('iqSteps'), stepsCard: $('iqStepsCard')
    };
    var S = { m: '1', cat: 'lin', copy: '' };
    var timer = null;

    function drawModes() {
      [].forEach.call(el.modes.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === S.m ? 'true' : 'false'); });
      el.objF.hidden = S.m !== '2';
      el.cats.hidden = S.m === '2';
      el.inp.setAttribute('placeholder', S.m === '2' ? 'x + y ≤ 6\nx ≥ 0' : '2x − 5 > 3');
    }
    function drawNote() {
      [].forEach.call(el.note.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-n') === style() ? 'true' : 'false'); });
    }
    function drawKeys() {
      el.keys.innerHTML = (S.m === '2' ? KEYS2 : KEYS1).map(function (k, i) {
        return '<button type="button" data-i="' + i + '" aria-label="' + A.esc(k[1].trim() || k[0]) + '">' + A.esc(k[0]) + '</button>';
      }).join('');
    }
    function drawEx() {
      if (S.m === '2') {
        el.ex.innerHTML = EX2.map(function (e, i) {
          return '<button type="button" data-x2="' + i + '">' + A.esc(e[0].replace(/\n/g, ' ; ')) + (e[1] ? ' <small>' + A.esc(e[1]) + '</small>' : '') + '</button>';
        }).join('');
        return;
      }
      el.cats.innerHTML = EX1.map(function (c) {
        return '<button type="button" role="tab" data-c="' + c[0] + '" aria-selected="' + (c[0] === S.cat ? 'true' : 'false') + '">' + A.esc(tr(c[1][0], c[1][1])) + '</button>';
      }).join('');
      var cat = EX1.filter(function (c) { return c[0] === S.cat; })[0] || EX1[0];
      el.ex.innerHTML = cat[2].map(function (t) {
        return '<button type="button" data-e="' + A.esc(t) + '">' + A.esc(t.replace(/\n/g, ' ; ')) + '</button>';
      }).join('');
    }

    function preview() {
      var txt = el.inp.value;
      if (!txt.trim()) { el.prev.innerHTML = ''; return; }
      try {
        var sts = parseAll(txt, S.m === '2' ? ['x', 'y'] : ['x']);
        el.prev.innerHTML = '<span class="iq-prevL">' + A.esc(tr('Reads as', 'អានថា')) + '</span> ' + sts.map(function (s) { return '<span class="iq-prevI">' + safe(relH(s.terms, s.ops)) + '</span>'; }).join('<span class="iq-prevS">;</span>');
      } catch (e) { el.prev.innerHTML = ''; }
    }

    function showError(msg) {
      el.result.classList.add('es-bad');
      el.kind.textContent = tr('Solution', 'ចម្លើយ');
      el.big.innerHTML = A.esc(msg);
      el.alt.innerHTML = ''; el.line.innerHTML = '';
      el.steps.innerHTML = ''; el.stepsCard.hidden = true;
      S.copy = '';
    }

    function run() {
      var txt = el.inp.value;
      A.writeHash({ q: txt, m: S.m === '2' ? '2' : '', n: CFG.notation || '', z: S.m === '2' ? el.obj.value : '' });
      preview();
      if (!txt.trim()) { showError(tr('Type an inequality, or pick an example.', 'សូមវាយវិសមីការ ឬជ្រើសឧទាហរណ៍មួយ។')); return; }
      var r;
      try {
        r = S.m === '2' ? solveTwo(txt, el.obj.value) : solveText(txt);
      } catch (e) {
        if (e instanceof ParseError) { showError(tr(e.en, e.km)); return; }
        if (window.console) { console.error(e); }
        showError(tr('This one could not be solved. Check how it is written.', 'មិនអាចដោះស្រាយវិសមីការនេះបានទេ។ សូមពិនិត្យការសរសេរ។'));
        return;
      }
      el.result.classList.remove('es-bad');
      el.stepsCard.hidden = false;
      el.steps.innerHTML = r.steps.map(function (s) { return '<li>' + safe(s) + '</li>'; }).join('');
      if (r.kind === 'two') {
        el.kind.textContent = kindName('two');
        if (r.empty) { el.big.innerHTML = safe(tr('No solution — ∅', 'គ្មានចម្លើយ — ∅')); }
        else {
          el.big.innerHTML = safe(tr('The shaded region', 'តំបន់ដែលដាក់ពណ៌'));
        }
        var bits = [];
        if (!r.empty) {
          bits.push(r.bounded ? tr('Bounded region', 'តំបន់មានព្រំដែន') : tr('Unbounded region', 'តំបន់គ្មានព្រំដែន'));
          if (r.verts.length) { bits.push(tr('corners ', 'កំពូល ') + r.verts.map(function (v) { return pairH(v.x, v.y); }).join(', ')); }
        }
        if (r.obj && !r.obj.err) { bits.push(r.obj.mx); bits.push(r.obj.mn); }
        if (r.obj && r.obj.err) { bits.push(r.obj.err); }
        el.alt.innerHTML = safe(bits.join('<br>'));
        el.line.innerHTML = graphTwo(r);
        S.copy = r.verts.map(function (v) { return pairP(v.x, v.y); }).join(', ');
        return;
      }
      el.kind.textContent = kindName(r.kind) + (r.approx ? ' · ' + tr('numerical', 'លេខប្រហែល') : '');
      var fs = fmtSet(r.set), fi = fmtIneq(r.set);
      if (r.kind === 'trig') {
        el.big.innerHTML = safe(r.general);
        el.alt.innerHTML = safe(tr('In [0, 2π]: S = ', 'ក្នុង [0, 2π]៖ S = ') + fs.h);
        S.copy = r.generalP + '   |   [0, 2π]: ' + fs.p;
      } else {
        el.big.innerHTML = safe('S = ' + fs.h);
        var alt = fi.h;
        if (r.window && r.kind !== 'trig') { alt = tr('In [0, 2π]: ', 'ក្នុង [0, 2π]៖ ') + alt; }
        if (r.approx) { alt += '<span class="iq-approx">' + tr('Decimals are rounded to 6 significant figures.', 'លេខទសភាគត្រូវបានបង្គត់ត្រឹម ៦ ខ្ទង់។') + '</span>'; }
        el.alt.innerHTML = safe(alt);
        S.copy = 'S = ' + fs.p;
      }
      var rows = r.rows && r.rows.length > 1 ? r.rows.concat([{ tag: 'S', set: r.set }]) : [{ set: r.set }];
      el.line.innerHTML = numberLine(rows, r.window || null, el.line.clientWidth || el.result.clientWidth - 40);
    }
    function soon() { clearTimeout(timer); timer = setTimeout(run, 140); }

    function insert(txt, back) {
      var i = el.inp, a = i.selectionStart == null ? i.value.length : i.selectionStart, b = i.selectionEnd == null ? a : i.selectionEnd;
      i.value = i.value.slice(0, a) + txt + i.value.slice(b);
      var c = a + txt.length - (back || 0);
      i.focus();
      try { i.setSelectionRange(c, c); } catch (e) {}
      run();
    }

    el.modes.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-m]');
      if (!b || b.getAttribute('data-m') === S.m) { return; }
      S.m = b.getAttribute('data-m');
      el.inp.value = S.m === '2' ? EX2[0][0] : '2x − 5 > 3';
      el.obj.value = S.m === '2' ? EX2[0][1] : '';
      drawModes(); drawKeys(); drawEx(); run();
    });
    el.keys.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) { return; }
      var k = (S.m === '2' ? KEYS2 : KEYS1)[+b.getAttribute('data-i')];
      insert(k[1], k[2] || 0);
    });
    el.cats.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) { return; }
      S.cat = b.getAttribute('data-c');
      drawEx();
      var first = el.ex.querySelector('button');
      if (first) { el.inp.value = first.getAttribute('data-e'); run(); }
    });
    el.ex.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-e], button[data-x2]');
      if (!b) { return; }
      if (b.hasAttribute('data-x2')) { var x = EX2[+b.getAttribute('data-x2')]; el.inp.value = x[0]; el.obj.value = x[1]; }
      else { el.inp.value = b.getAttribute('data-e'); }
      run();
    });
    el.inp.addEventListener('input', soon);
    var lastW = 0;
    window.addEventListener('resize', function () {
      var w = el.line.clientWidth;
      if (Math.abs(w - lastW) > 40) { lastW = w; soon(); }
    });
    el.obj.addEventListener('input', soon);
    el.clear.addEventListener('click', function () { el.inp.value = ''; el.obj.value = ''; run(); el.inp.focus(); });
    el.note.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-n]');
      if (!b) { return; }
      CFG.notation = b.getAttribute('data-n');
      drawNote(); run();
    });
    el.copy.addEventListener('click', function () { if (S.copy) { A.copy(el.copy, S.copy); } });
    document.addEventListener('aa:langchange', function () {
      el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
      drawNote(); drawEx(); run();
    });

    var q = A.readHash();
    if (q.m === '2') { S.m = '2'; }
    if (q.n === 'en' || q.n === 'fr') { CFG.notation = q.n; }
    el.inp.value = q.q != null ? q.q : (S.m === '2' ? EX2[0][0] : 'x² − 5x + 6 > 0');
    el.obj.value = q.z != null ? q.z : (S.m === '2' && q.q == null ? EX2[0][1] : '');
    for (var c = 0; c < EX1.length; c++) { if (EX1[c][2].indexOf(el.inp.value) !== -1) { S.cat = EX1[c][0]; } }
    if (q.q == null && S.m === '1') { S.cat = 'quad'; }
    drawModes(); drawNote(); drawKeys(); drawEx(); run();
    if (S.m === '1' && q.q != null) {     /* open the examples on the type that was linked */
      try { var k0 = solveText(el.inp.value).kind; if (EX1.some(function (c) { return c[0] === k0; })) { S.cat = k0; drawEx(); } } catch (e) {}
    }
    el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
  }

  global.AAInequality = {
    solveText: solveText, solveTwo: solveTwo, graphTwo: graphTwo, fmtSet: fmtSet, fmtIneq: fmtIneq,
    parseAll: parseAll, CFG: CFG, kindName: kindName, F: F, factorPoly: factorPoly, ev: ev,
    inPt: inPt, inMid: inMid, ptNum: ptNum
  };
  if (typeof document !== 'undefined' && document.getElementById && document.getElementById('iqRoot')) { initUI(); }
})(window);
