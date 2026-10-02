/* Alpha Academy Cambodia — Equation Solver
   ---------------------------------------------------------------------------
   Linear, quadratic and cubic equations, and systems of two or three linear
   equations — with the working written out the way it is in a Cambodian
   maths book, in Khmer or English. Uses tools-core.js.

   FOUR THINGS DECIDE HOW THIS IS BUILT.

   1. THE ARITHMETIC IS EXACT. Coefficients are read as fractions of BigInts
      (0.5 becomes 1/2, 2/3 stays 2/3), so a root is printed as 3/4 or as
      1 ± 2√3, never as 0.7500000001. A decimal approximation is printed
      beside an irrational answer, not instead of it.

   2. THE WORKING IS THE POINT. A student does not need a machine to tell
      them x = 2; they need to see Δ = b² − 4ac with their numbers in it.
      Each answer comes with the steps, and the steps use the textbook's own
      method: Δ for a quadratic (and Δ′ when b is even, as the Khmer
      syllabus teaches), the rational-root test and synthetic division for a
      cubic, Cramer's rule with determinants for a system.

   3. NEGATIVE Δ IS NOT "NO SOLUTION". Grade 12 works in ℂ, so a quadratic
      with Δ < 0 says there is no real root and then gives the two complex
      ones, x = p ± qi.

   4. A ZERO LEADING COEFFICIENT IS HANDLED, NOT REFUSED. With a = 0 a
      quadratic is a linear equation; the page says so and solves that.

   State lives in the address bar: #m=quad&c=1|-3|2                         */
(function () {
  'use strict';

  var A = window.AATool;
  var root = document.getElementById('esRoot');
  if (!root || typeof BigInt === 'undefined') { return; }

  /* ===================================================== exact fractions */
  var ZERO = BigInt(0), ONE = BigInt(1);
  function babs(a) { return a < ZERO ? -a : a; }
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { var r = a % b; a = b; b = r; } return a; }

  function F(n, d) {
    n = BigInt(n); d = d === undefined ? ONE : BigInt(d);
    if (d === ZERO) { throw new Error('zero denominator'); }
    if (d < ZERO) { n = -n; d = -d; }
    var g = bgcd(n, d) || ONE;
    return { n: n / g, d: d / g };
  }
  function add(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function div(a, b) { return F(a.n * b.d, a.d * b.n); }
  function neg(a) { return F(-a.n, a.d); }
  function isZ(a) { return a.n === ZERO; }
  function sgn(a) { return a.n < ZERO ? -1 : a.n > ZERO ? 1 : 0; }
  function eq(a, b) { return a.n === b.n && a.d === b.d; }
  function num(a) { return Number(a.n) / Number(a.d); }
  function isInt(a) { return a.d === ONE; }

  /* "0.25" → 1/4, "-3/4" → −3/4, "" → 0. Anything else → null. */
  function parseF(s) {
    s = A.unKh(String(s || '')).trim().replace(/[−–]/g, '-').replace(/\s/g, '').replace(/,/g, '.');
    if (s === '' || s === '+') { return F(0); }
    if (s === '-') { return null; }
    var parts = s.split('/');
    if (parts.length > 2) { return null; }
    var out = null;
    for (var i = 0; i < parts.length; i++) {
      var m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(parts[i]);
      if (!m || (m[2] === '' && !m[3])) { return null; }
      var frac = m[3] || '';
      var v = F(BigInt((m[1] === '-' ? '-' : '') + (m[2] || '0') + frac), BigInt('1' + '0'.repeat(frac.length)));
      if (i === 0) { out = v; } else { if (isZ(v)) { return null; } out = div(out, v); }
    }
    return out;
  }

  /* largest k with k² | m, for m ≥ 0 — so √m = k√r */
  function surd(m) {
    if (m === ZERO) { return { k: ZERO, r: ZERO }; }
    var k = ONE, r = m;
    for (var p = BigInt(2); p * p <= r && p < BigInt(200000); p++) {
      var pp = p * p;
      while (r % pp === ZERO) { r /= pp; k *= p; }
    }
    return { k: k, r: r };
  }
  function isqrt(m) {
    if (m < ZERO) { return null; }
    if (m < BigInt(2)) { return m; }
    var x = BigInt(Math.floor(Math.sqrt(Number(m))));
    while (x * x > m) { x--; }
    while ((x + ONE) * (x + ONE) <= m) { x++; }
    return x * x === m ? x : null;
  }

  /* ============================================================ display */
  function n2s(b) { return A.kh(String(b).replace('-', '−')); }
  /* a fraction as HTML: a stacked fraction, sign in front */
  function H(a) {
    var s = a.n < ZERO ? '−' : '';
    var n = babs(a.n);
    if (a.d === ONE) { return s + n2s(n); }
    return s + '<span class="es-fr"><span>' + n2s(n) + '</span><span>' + n2s(a.d) + '</span></span>';
  }
  /* a coefficient in front of a term: 1x → x, −1x → −x */
  function coefH(a, first) {
    var s = sgn(a) < 0 ? '−' : (first ? '' : '+');
    var m = F(babs(a.n), a.d);
    return { sign: s, body: eq(m, F(1)) ? '' : H(m) };
  }
  /* a polynomial in one variable from highest power down, zero terms skipped */
  function polyH(cs, v) {
    var out = '', first = true, deg = cs.length - 1;
    cs.forEach(function (c, i) {
      var p = deg - i;
      if (isZ(c)) { return; }
      var ch = coefH(c, first);
      var body = p === 0 ? H(F(babs(c.n), c.d)) : ch.body + v + (p > 1 ? '<sup>' + A.kh(p) + '</sup>' : '');
      out += (first ? (ch.sign ? ch.sign : '') : ' ' + ch.sign + ' ') + body;
      first = false;
    });
    return out || A.kh('0');
  }
  function lin2H(cs, vs) { /* a·x + b·y (+ c·z) */
    var out = '', first = true;
    cs.forEach(function (c, i) {
      if (isZ(c)) { return; }
      var ch = coefH(c, first);
      out += (first ? ch.sign : ' ' + ch.sign + ' ') + ch.body + vs[i];
      first = false;
    });
    return out || A.kh('0');
  }
  /* in brackets when negative, for substitution: (−3)² */
  function P(a) { return sgn(a) < 0 ? '(' + H(a) + ')' : H(a); }
  function dec(x) { return A.fmt(x, { sig: 8 }); }

  /* p + q√r, or p ± q√r, with p and q fractions */
  function surdH(p, q, r, pm, i) {
    var rad = (r === ONE ? '' : '√' + n2s(r)) + (i ? '<i>i</i>' : '');
    var qa = F(babs(q.n), q.d);
    var qpart = (eq(qa, F(1)) && rad ? '' : H(qa)) + rad;
    if (isZ(p)) { return (pm ? '±' : (sgn(q) < 0 ? '−' : '')) + qpart; }
    return H(p) + ' ' + (pm ? '±' : (sgn(q) < 0 ? '−' : '+')) + ' ' + qpart;
  }

  /* ============================================================== words */
  var T = {
    lin:  { en: 'Linear', km: 'ដឺក្រេទី១' },
    quad: { en: 'Quadratic', km: 'ដឺក្រេទី២' },
    cub:  { en: 'Cubic', km: 'ដឺក្រេទី៣' },
    s2:   { en: '2 unknowns', km: '២ អញ្ញាត' },
    s3:   { en: '3 unknowns', km: '៣ អញ្ញាត' },
    bad:  { en: 'One of the boxes is not a number. Use whole numbers, decimals or fractions like 3/4.',
            km: 'ប្រអប់មួយមិនមែនជាលេខទេ។ សូមប្រើចំនួនគត់ ទសភាគ ឬប្រភាគ ដូចជា 3/4។' },
    big:  { en: 'These numbers are too large to work with exactly.', km: 'លេខទាំងនេះធំពេក មិនអាចគណនាឲ្យពិតប្រាកដបានទេ។' },
    sol:  { en: 'Solution', km: 'ចម្លើយ' },
    noSol:{ en: 'No solution', km: 'គ្មានចម្លើយ' },
    inf:  { en: 'Infinitely many solutions', km: 'មានចម្លើយរាប់មិនអស់' },
    noReal: { en: 'No real roots — two complex roots', km: 'គ្មានឫសពិត — មានឫសកុំផ្លិចពីរ' },
    dbl:  { en: 'One double root', km: 'ឫសឌុបមួយ' },
    two:  { en: 'Two distinct real roots', km: 'ឫសពិតពីរផ្សេងគ្នា' },
    approx: { en: 'Approximately', km: 'ប្រហែល' },
    steps:{ en: 'Working', km: 'ដំណោះស្រាយ' },
    aZero:{ en: 'With a = 0 there is no x² term, so this is a linear equation. Solving it as one:',
            km: 'ពេល a = 0 គ្មានតួ x² ទេ ដូច្នេះនេះជាសមីការដឺក្រេទី១។ ដោះស្រាយដូចសមីការដឺក្រេទី១៖' },
    aZero3:{ en: 'With a = 0 there is no x³ term, so this is a quadratic. Solving it as one:',
            km: 'ពេល a = 0 គ្មានតួ x³ ទេ ដូច្នេះនេះជាសមីការដឺក្រេទី២។ ដោះស្រាយដូចសមីការដឺក្រេទី២៖' }
  };
  function L(en, km) { return { en: en, km: km }; }

  /* ========================================================= the solvers
     Each returns { head, sub, steps: [ {en,km} … ], copy } — HTML strings. */

  function solveLinear(a, b, c) {
    /* a x + b = c */
    var st = [];
    st.push(L('The equation: ' + polyH([a, b], 'x') + ' = ' + H(c),
              'សមីការ៖ ' + polyH([a, b], 'x') + ' = ' + H(c)));
    var rhs = sub(c, b);
    if (!isZ(b)) {
      st.push(L('Move ' + H(b) + ' to the right-hand side: ' + polyH([a, F(0)], 'x') + ' = ' + H(c) + ' − ' + P(b) + ' = ' + H(rhs),
                'ផ្ទេរ ' + H(b) + ' ទៅអង្គខាងស្ដាំ៖ ' + polyH([a, F(0)], 'x') + ' = ' + H(c) + ' − ' + P(b) + ' = ' + H(rhs)));
    }
    if (isZ(a)) {
      if (isZ(rhs)) {
        st.push(L('0 = 0 is true for every x.', '0 = 0 ពិតចំពោះគ្រប់ x។'));
        return { head: L(T.inf.en, T.inf.km), sub: L('Every real number x is a solution.', 'គ្រប់ចំនួនពិត x ជាចម្លើយ។'), steps: st, copy: 'x ∈ ℝ' };
      }
      st.push(L('0 = ' + H(rhs) + ' is never true.', '0 = ' + H(rhs) + ' មិនពិតដាច់ខាត។'));
      return { head: L(T.noSol.en, T.noSol.km), sub: L('No value of x makes the two sides equal.', 'គ្មានតម្លៃ x ណាធ្វើឲ្យអង្គទាំងពីរស្មើគ្នាទេ។'), steps: st, copy: '∅' };
    }
    var x = div(rhs, a);
    if (!eq(a, F(1))) {
      st.push(L('Divide both sides by ' + H(a) + ': x = ' + H(rhs) + ' ÷ ' + P(a) + ' = ' + H(x),
                'ចែកអង្គទាំងពីរនឹង ' + H(a) + '៖ x = ' + H(rhs) + ' ÷ ' + P(a) + ' = ' + H(x)));
    }
    return {
      head: L('x = ' + H(x), 'x = ' + H(x)),
      sub: isInt(x) ? null : L(T.approx.en + ' x ≈ ' + dec(num(x)), T.approx.km + ' x ≈ ' + dec(num(x))),
      steps: st, copy: 'x = ' + plain(x)
    };
  }

  function plain(a) { return (a.n < ZERO ? '-' : '') + String(babs(a.n)) + (a.d === ONE ? '' : '/' + a.d); }

  function solveQuad(a, b, c, nested) {
    var st = [];
    if (isZ(a)) {
      var r = solveLinear(b, c, F(0));
      r.steps.unshift(T.aZero);
      return r;
    }
    var eqn = polyH([a, b, c], 'x') + ' = 0';
    if (!nested) {
      st.push(L('The equation ' + eqn + ' has a = ' + H(a) + ', b = ' + H(b) + ', c = ' + H(c) + '.',
                'សមីការ ' + eqn + ' មាន a = ' + H(a) + ', b = ' + H(b) + ', c = ' + H(c) + '។'));
    }
    var D = sub(mul(b, b), mul(F(4), mul(a, c)));
    st.push(L('Discriminant: Δ = b² − 4ac = ' + P(b) + '² − 4 × ' + P(a) + ' × ' + P(c) + ' = ' + H(D),
              'ឌីស្ក្រីមីណង់៖ Δ = b² − 4ac = ' + P(b) + '² − 4 × ' + P(a) + ' × ' + P(c) + ' = ' + H(D)));

    /* Δ′ when b is an even whole number — the Khmer syllabus uses it */
    if (isInt(b) && b.n % BigInt(2) === ZERO && !isZ(b) && isInt(a) && isInt(c)) {
      var b2 = F(b.n / BigInt(2));
      var D2 = sub(mul(b2, b2), mul(a, c));
      st.push(L('b is even, so the reduced form also works: b′ = b ÷ 2 = ' + H(b2) + ', Δ′ = b′² − ac = ' + H(D2) +
                ' (and Δ = 4Δ′). Then x = (−b′ ± √Δ′) ÷ a.',
                'b ជាចំនួនគូ ដូច្នេះអាចប្រើ Δ′ បាន៖ b′ = b ÷ 2 = ' + H(b2) + ', Δ′ = b′² − ac = ' + H(D2) +
                ' (ហើយ Δ = 4Δ′)។ ពេលនោះ x = (−b′ ± √Δ′) ÷ a។'));
    }

    var p = div(neg(b), mul(F(2), a));        /* −b / 2a */
    var S = div(neg(b), a), Pr = div(c, a);

    if (isZ(D)) {
      st.push(L('Δ = 0, so there is one double root: x = −b ÷ 2a = ' + H(p),
                'Δ = 0 ដូច្នេះមានឫសឌុប៖ x = −b ÷ 2a = ' + H(p)));
      st.push(L('Factorised: ' + factH(a, [p, p]), 'ជាផលគុណកត្តា៖ ' + factH(a, [p, p])));
      return {
        head: L('x₁ = x₂ = ' + H(p), 'x₁ = x₂ = ' + H(p)),
        sub: L(T.dbl.en, T.dbl.km), steps: st, copy: 'x = ' + plain(p), roots: [p]
      };
    }

    /* √Δ for a rational Δ = n/d is √(n·d)/d */
    var absD = F(babs(D.n), D.d);
    var sd = surd(absD.n * absD.d);
    var q = div(F(sd.k, absD.d), mul(F(2), a));   /* √|Δ| / 2a, as q·√r */
    q = F(babs(q.n), q.d);
    var real = sgn(D) > 0;

    if (real) {
      st.push(L('Δ > 0, so there are two distinct real roots: x = (−b ± √Δ) ÷ 2a',
                'Δ > 0 ដូច្នេះមានឫសពិតពីរផ្សេងគ្នា៖ x = (−b ± √Δ) ÷ 2a'));
    } else {
      st.push(L('Δ < 0, so there is no real root. In ℂ, √Δ = i√' + H(absD) + ', and x = (−b ± i√|Δ|) ÷ 2a',
                'Δ < 0 ដូច្នេះគ្មានឫសពិតទេ។ ក្នុង ℂ, √Δ = i√' + H(absD) + ' ហើយ x = (−b ± i√|Δ|) ÷ 2a'));
    }

    if (sd.r === ONE) {
      /* a perfect square: the roots are rational (or p ± qi) */
      if (real) {
        var x1 = sub(p, q), x2 = add(p, q);
        if (num(x1) > num(x2)) { var tmp = x1; x1 = x2; x2 = tmp; }
        st.push(L('√Δ = ' + H(F(sd.k, absD.d)) + ', so x₁ = ' + H(x1) + ' and x₂ = ' + H(x2) + '.',
                  '√Δ = ' + H(F(sd.k, absD.d)) + ' ដូច្នេះ x₁ = ' + H(x1) + ' និង x₂ = ' + H(x2) + '។'));
        st.push(L('Factorised: ' + factH(a, [x1, x2]), 'ជាផលគុណកត្តា៖ ' + factH(a, [x1, x2])));
        vieta(st, S, Pr);
        return {
          head: L('x₁ = ' + H(x1) + ', x₂ = ' + H(x2), 'x₁ = ' + H(x1) + ', x₂ = ' + H(x2)),
          sub: (isInt(x1) && isInt(x2)) ? L(T.two.en, T.two.km) :
               L(T.approx.en + ' ' + dec(num(x1)) + ' and ' + dec(num(x2)), T.approx.km + ' ' + dec(num(x1)) + ' និង ' + dec(num(x2))),
          steps: st, copy: 'x1 = ' + plain(x1) + ', x2 = ' + plain(x2), roots: [x1, x2]
        };
      }
    }
    var form = surdH(p, q, sd.r, true, !real);
    if (sd.r !== ONE || !real) {
      st.push(L((real ? '√Δ = ' : '√|Δ| = ') + (sd.r === ONE ? H(F(sd.k, absD.d)) : surdH(F(0), F(sd.k, absD.d), sd.r, false, false)) +
                ', so x = ' + form,
                (real ? '√Δ = ' : '√|Δ| = ') + (sd.r === ONE ? H(F(sd.k, absD.d)) : surdH(F(0), F(sd.k, absD.d), sd.r, false, false)) +
                ' ដូច្នេះ x = ' + form));
    }
    vieta(st, S, Pr);
    var qv = num(q) * Math.sqrt(Number(sd.r)), pv = num(p);
    var subTxt = real
      ? L(T.approx.en + ' x₁ ≈ ' + dec(pv - qv) + ', x₂ ≈ ' + dec(pv + qv), T.approx.km + ' x₁ ≈ ' + dec(pv - qv) + ', x₂ ≈ ' + dec(pv + qv))
      : L(T.noReal.en + ' · ≈ ' + dec(pv) + ' ± ' + dec(qv) + 'i', T.noReal.km + ' · ≈ ' + dec(pv) + ' ± ' + dec(qv) + 'i');
    return {
      head: L('x = ' + form, 'x = ' + form), sub: subTxt, steps: st,
      copy: 'x = ' + stripTags(form), roots: real ? null : []
    };
  }

  function vieta(st, S, Pr) {
    st.push(L('Check (Vieta): x₁ + x₂ = −b ÷ a = ' + H(S) + ' and x₁ · x₂ = c ÷ a = ' + H(Pr) + '.',
              'ផ្ទៀងផ្ទាត់ (វៀត)៖ x₁ + x₂ = −b ÷ a = ' + H(S) + ' និង x₁ · x₂ = c ÷ a = ' + H(Pr) + '។'));
  }
  function factH(a, rs) {
    var out = eq(a, F(1)) ? '' : (eq(a, F(-1)) ? '−' : H(a));
    if (rs.length === 2 && eq(rs[0], rs[1])) {
      return out + bracket(rs[0]) + '<sup>' + A.kh(2) + '</sup>';
    }
    rs.forEach(function (r) { out += bracket(r); });
    return out;
  }
  function bracket(r) {
    if (isZ(r)) { return 'x'; }
    return '(x ' + (sgn(r) > 0 ? '−' : '+') + ' ' + H(F(babs(r.n), r.d)) + ')';
  }
  function stripTags(h) {
    return h.replace(/<span class="es-fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$1/$2')
      .replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '');
  }

  /* ----------------------------------------------------------------- cubic */
  function solveCubic(a, b, c, d) {
    if (isZ(a)) {
      var r0 = solveQuad(b, c, d);
      r0.steps.unshift(T.aZero3);
      return r0;
    }
    var st = [];
    var eqn = polyH([a, b, c, d], 'x') + ' = 0';
    st.push(L('The equation: ' + eqn, 'សមីការ៖ ' + eqn));

    /* clear denominators so the rational-root test has whole numbers */
    var L0 = [a, b, c, d].reduce(function (m, f) { return m * f.d / bgcd(m, f.d); }, ONE);
    var ints = [a, b, c, d].map(function (f) { return f.n * (L0 / f.d); });
    var g = ints.reduce(function (m, v) { return bgcd(m, v); }, ZERO) || ONE;
    ints = ints.map(function (v) { return v / g; });

    var rootF = null;
    if (ints[3] === ZERO) {
      rootF = F(0);
      st.push(L('d = 0, so x is a common factor: x(' + polyH([a, b, c], 'x') + ') = 0, giving x = 0.',
                'd = 0 ដូច្នេះ x ជាកត្តារួម៖ x(' + polyH([a, b, c], 'x') + ') = 0 ផ្តល់ x = 0។'));
    } else if (babs(ints[0]) < BigInt(1e7) && babs(ints[3]) < BigInt(1e7)) {
      var ps = divisors(babs(ints[3])), qs = divisors(babs(ints[0]));
      var tried = [];
      outer:
      for (var i = 0; i < ps.length; i++) {
        for (var j = 0; j < qs.length; j++) {
          for (var s = 1; s >= -1; s -= 2) {
            var cand = F(BigInt(s) * ps[i], qs[j]);
            if (tried.some(function (t) { return eq(t, cand); })) { continue; }
            tried.push(cand);
            if (isZ(evalP([a, b, c, d], cand))) { rootF = cand; break outer; }
          }
        }
      }
      var shown = tried.slice(0, 8).map(H).join(', ') + (tried.length > 8 ? ', …' : '');
      if (rootF) {
        st.push(L('Try the possible rational roots ±p/q (p divides ' + n2s(babs(ints[3])) + ', q divides ' + n2s(babs(ints[0])) + '): ' + shown +
                  '. P(' + H(rootF) + ') = 0, so x = ' + H(rootF) + ' is a root.',
                  'សាកល្បងឫសសនិទានដែលអាចមាន ±p/q (p ចែកដាច់ ' + n2s(babs(ints[3])) + ', q ចែកដាច់ ' + n2s(babs(ints[0])) + ')៖ ' + shown +
                  '។ P(' + H(rootF) + ') = 0 ដូច្នេះ x = ' + H(rootF) + ' ជាឫស។'));
      } else {
        st.push(L('None of the possible rational roots ±p/q works (' + shown + '), so the roots are irrational and are found numerically below.',
                  'គ្មានឫសសនិទាន ±p/q ណាមួយត្រូវទេ (' + shown + ') ដូច្នេះឫសជាចំនួនអសនិទាន ហើយត្រូវបានរកជាលេខប្រហែលខាងក្រោម។'));
      }
    }

    if (rootF) {
      /* synthetic division */
      var q2 = a, q1 = add(b, mul(q2, rootF)), q0 = add(c, mul(q1, rootF));
      if (!isZ(rootF)) {
        st.push(L('Divide by (x ' + (sgn(rootF) > 0 ? '−' : '+') + ' ' + H(F(babs(rootF.n), rootF.d)) + ') using synthetic division:' + synth([a, b, c, d], rootF),
                  'ចែកនឹង (x ' + (sgn(rootF) > 0 ? '−' : '+') + ' ' + H(F(babs(rootF.n), rootF.d)) + ') ដោយវិធីហ័រណឺ៖' + synth([a, b, c, d], rootF)));
      }
      st.push(L('So ' + eqn.replace(' = 0', '') + ' = ' + bracket(rootF) + '(' + polyH([q2, q1, q0], 'x') + '). Now solve ' + polyH([q2, q1, q0], 'x') + ' = 0:',
                'ដូច្នេះ ' + eqn.replace(' = 0', '') + ' = ' + bracket(rootF) + '(' + polyH([q2, q1, q0], 'x') + ')។ ឥឡូវដោះស្រាយ ' + polyH([q2, q1, q0], 'x') + ' = 0៖'));
      var qr = solveQuad(q2, q1, q0, true);
      st = st.concat(qr.steps);
      var head, copy;
      if (qr.roots && qr.roots.length) {
        var all = [rootF].concat(qr.roots);
        var uniq = [];
        all.forEach(function (r) { if (!uniq.some(function (u) { return eq(u, r); })) { uniq.push(r); } });
        uniq.sort(function (x, y) { return num(x) - num(y); });
        head = uniq.map(function (r, k) { return 'x' + sub_(k + 1, uniq.length) + ' = ' + H(r); }).join(', ');
        copy = uniq.map(plain).join(', ');
        return { head: L(head, head), sub: qr.roots.every(isInt) && isInt(rootF) ? null : L(T.approx.en + ' ' + uniq.map(function (r) { return dec(num(r)); }).join(', '), T.approx.km + ' ' + uniq.map(function (r) { return dec(num(r)); }).join(', ')), steps: st, copy: copy };
      }
      head = 'x = ' + H(rootF) + ' ; ' + qr.head.en;
      return { head: L(head, 'x = ' + H(rootF) + ' ; ' + qr.head.km), sub: qr.sub, steps: st, copy: 'x = ' + plain(rootF) + '; ' + qr.copy };
    }

    /* numeric: the trigonometric / Cardano method on the depressed cubic */
    var rs = cubicNumeric(num(a), num(b), num(c), num(d));
    var disc = 18 * num(a) * num(b) * num(c) * num(d) - 4 * Math.pow(num(b), 3) * num(d) + Math.pow(num(b) * num(c), 2) -
      4 * num(a) * Math.pow(num(c), 3) - 27 * Math.pow(num(a) * num(d), 2);
    st.push(L('The cubic discriminant is ' + dec(disc) + (disc > 0 ? ' > 0: three distinct real roots.' : disc < 0 ? ' < 0: one real root and two complex roots.' : ' = 0: a repeated root.'),
              'ឌីស្ក្រីមីណង់នៃសមីការដឺក្រេទី៣ គឺ ' + dec(disc) + (disc > 0 ? ' > 0៖ ឫសពិតបីផ្សេងគ្នា។' : disc < 0 ? ' < 0៖ ឫសពិតមួយ និងឫសកុំផ្លិចពីរ។' : ' = 0៖ មានឫសជាន់គ្នា។')));
    st.push(L('Using Cardano\'s method (or the trigonometric form when there are three real roots) on the depressed cubic t³ + pt + q = 0, with x = t − b ÷ 3a.',
              'ប្រើវិធីកាដាណូ (ឬទម្រង់ត្រីកោណមាត្រ ពេលមានឫសពិតបី) លើសមីការ t³ + pt + q = 0 ដោយ x = t − b ÷ 3a។'));
    var hs = rs.map(function (r, k) {
      return 'x' + sub_(k + 1, rs.length) + ' ≈ ' + (r.im ? dec(r.re) + ' ' + (r.im < 0 ? '−' : '+') + ' ' + dec(Math.abs(r.im)) + 'i' : dec(r.re));
    }).join(', ');
    return { head: L(hs, hs), sub: null, steps: st, copy: hs.replace(/<[^>]+>/g, '') };
  }

  function sub_(k, n) { return n > 1 ? ['', '₁', '₂', '₃'][k] : ''; }
  function evalP(cs, x) { return cs.reduce(function (acc, c) { return add(mul(acc, x), c); }, F(0)); }
  function divisors(n) {
    var out = [];
    for (var i = ONE; i * i <= n; i++) {
      if (n % i === ZERO) { out.push(i); if (i * i !== n) { out.push(n / i); } }
      if (out.length > 400) { break; }
    }
    return out.sort(function (x, y) { return x < y ? -1 : 1; });
  }
  function synth(cs, r) {
    var row1 = ['', ''], row2 = [], acc = F(0);
    cs.forEach(function (c, i) {
      var carry = i === 0 ? null : mul(acc, r);
      acc = i === 0 ? c : add(c, carry);
      row1.push(i === 0 ? '' : H(carry));
      row2.push(H(acc));
    });
    var top = '<tr><td class="r">' + H(r) + '</td>' + cs.map(function (c) { return '<td>' + H(c) + '</td>'; }).join('') + '</tr>';
    var mid = '<tr><td></td>' + row1.slice(2).map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>';
    var bot = '<tr class="sum"><td></td>' + row2.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>';
    return '<table class="es-syn">' + top + mid + bot + '</table>';
  }
  function cubicNumeric(a, b, c, d) {
    b /= a; c /= a; d /= a;
    var p = c - b * b / 3, q = 2 * b * b * b / 27 - b * c / 3 + d, sh = -b / 3;
    var D = q * q / 4 + p * p * p / 27, out = [];
    if (Math.abs(D) < 1e-14) { D = 0; }
    if (D > 0) {
      var u = Math.cbrt(-q / 2 + Math.sqrt(D)), v = Math.cbrt(-q / 2 - Math.sqrt(D));
      out.push({ re: u + v + sh });
      out.push({ re: -(u + v) / 2 + sh, im: -(u - v) * Math.sqrt(3) / 2 });
      out.push({ re: -(u + v) / 2 + sh, im: (u - v) * Math.sqrt(3) / 2 });
    } else if (D === 0) {
      var w = Math.cbrt(-q / 2);
      out.push({ re: 2 * w + sh }, { re: -w + sh });
    } else {
      var r = 2 * Math.sqrt(-p / 3), th = Math.acos(3 * q / (p * r)) / 3;
      for (var k = 0; k < 3; k++) { out.push({ re: r * Math.cos(th - 2 * Math.PI * k / 3) + sh }); }
      out.sort(function (x, y) { return x.re - y.re; });
    }
    return out;
  }

  /* --------------------------------------------------------------- systems */
  function det2(m) { return sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0])); }
  function det3(m) {
    return add(sub(mul(m[0][0], sub(mul(m[1][1], m[2][2]), mul(m[1][2], m[2][1]))),
                   mul(m[0][1], sub(mul(m[1][0], m[2][2]), mul(m[1][2], m[2][0])))),
               mul(m[0][2], sub(mul(m[1][0], m[2][1]), mul(m[1][1], m[2][0]))));
  }
  function detH(m) {
    return '<span class="es-det">' + m.map(function (r) {
      return '<span>' + r.map(function (v) { return '<i>' + H(v) + '</i>'; }).join('') + '</span>';
    }).join('') + '</span>';
  }
  function col(m, k, rhs) { return m.map(function (r, i) { return r.map(function (v, j) { return j === k ? rhs[i] : v; }); }); }

  function solveSystem(m, rhs) {
    var n = m.length, vs = ['x', 'y', 'z'].slice(0, n), st = [];
    var det = n === 2 ? det2 : det3;
    var sys = m.map(function (r, i) { return lin2H(r, vs) + ' = ' + H(rhs[i]); }).join('<br>');
    st.push(L('The system:<div class="es-sys">' + sys + '</div>', 'ប្រព័ន្ធសមីការ៖<div class="es-sys">' + sys + '</div>'));
    var D = det(m);
    st.push(L('Cramer\'s rule. The determinant of the coefficients: D = ' + detH(m) + ' = ' + H(D),
              'វិធានក្រាមែរ។ ដេទែរមីណង់នៃមេគុណ៖ D = ' + detH(m) + ' = ' + H(D)));
    var Ds = vs.map(function (v, k) { return det(col(m, k, rhs)); });
    vs.forEach(function (v, k) {
      st.push(L('D<sub>' + v + '</sub> = ' + detH(col(m, k, rhs)) + ' = ' + H(Ds[k]) + ' (column ' + v + ' replaced by the right-hand side)',
                'D<sub>' + v + '</sub> = ' + detH(col(m, k, rhs)) + ' = ' + H(Ds[k]) + ' (ជំនួសជួរឈរ ' + v + ' ដោយអង្គខាងស្ដាំ)'));
    });
    if (isZ(D)) {
      var allZ = Ds.every(isZ);
      if (n === 2 && allZ) {
        st.push(L('D = 0 and every D<sub>v</sub> = 0: the equations describe the same line.', 'D = 0 ហើយគ្រប់ D<sub>v</sub> = 0៖ សមីការទាំងពីរតំណាងបន្ទាត់តែមួយ។'));
        return { head: L(T.inf.en, T.inf.km), sub: null, steps: st, copy: 'infinitely many' };
      }
      if (!allZ) {
        st.push(L('D = 0 but D<sub>v</sub> ≠ 0 for some v: the equations contradict each other' + (n === 2 ? ' (parallel lines).' : '.'),
                  'D = 0 ប៉ុន្តែមាន D<sub>v</sub> ≠ 0៖ សមីការផ្ទុយគ្នា' + (n === 2 ? ' (បន្ទាត់ស្របគ្នា)។' : '។')));
        return { head: L(T.noSol.en, T.noSol.km), sub: null, steps: st, copy: 'no solution' };
      }
      st.push(L('D = 0 and every D<sub>v</sub> = 0: Cramer\'s rule cannot decide. The system has either no solution or infinitely many — eliminate a variable to see which.',
                'D = 0 ហើយគ្រប់ D<sub>v</sub> = 0៖ វិធានក្រាមែរមិនអាចសម្រេចបានទេ។ ប្រព័ន្ធនេះ គ្មានចម្លើយ ឬមានចម្លើយរាប់មិនអស់ — សូមលុបបំបាត់អញ្ញាតមួយ ដើម្បីដឹង។'));
      return { head: L('D = 0', 'D = 0'), sub: L('No unique solution.', 'គ្មានចម្លើយតែមួយទេ។'), steps: st, copy: 'D = 0' };
    }
    var xs = Ds.map(function (dv) { return div(dv, D); });
    st.push(L(vs.map(function (v, k) { return v + ' = D<sub>' + v + '</sub> ÷ D = ' + H(Ds[k]) + ' ÷ ' + P(D) + ' = ' + H(xs[k]); }).join('<br>'),
              vs.map(function (v, k) { return v + ' = D<sub>' + v + '</sub> ÷ D = ' + H(Ds[k]) + ' ÷ ' + P(D) + ' = ' + H(xs[k]); }).join('<br>')));
    var head = vs.map(function (v, k) { return v + ' = ' + H(xs[k]); }).join(', ');
    var allInt = xs.every(isInt);
    return {
      head: L(head, head),
      sub: allInt ? null : L(T.approx.en + ' ' + xs.map(function (x, k) { return vs[k] + ' ≈ ' + dec(num(x)); }).join(', '),
                             T.approx.km + ' ' + xs.map(function (x, k) { return vs[k] + ' ≈ ' + dec(num(x)); }).join(', ')),
      steps: st, copy: vs.map(function (v, k) { return v + ' = ' + plain(xs[k]); }).join(', ')
    };
  }

  /* ================================================================ modes */
  var SUP = function (p) { return '<span class="es-v">x<sup>' + p + '</sup></span>'; };
  var MODES = {
    lin:  { n: 3, def: ['2', '3', '11'],
            row: function (I) { return '<div class="es-eq">' + I(0) + '<span class="es-v">x</span><span class="es-op">+</span>' + I(1) + '<span class="es-op">=</span>' + I(2) + '</div>'; },
            solve: function (v) { return solveLinear(v[0], v[1], v[2]); } },
    quad: { n: 3, def: ['1', '-3', '2'],
            row: function (I) { return '<div class="es-eq">' + I(0) + SUP('2') + '<span class="es-op">+</span>' + I(1) + '<span class="es-v">x</span><span class="es-op">+</span>' + I(2) + '<span class="es-op">= 0</span></div>'; },
            solve: function (v) { return solveQuad(v[0], v[1], v[2]); } },
    cub:  { n: 4, def: ['1', '-6', '11', '-6'],
            row: function (I) { return '<div class="es-eq">' + I(0) + SUP('3') + '<span class="es-op">+</span>' + I(1) + SUP('2') + '<span class="es-op">+</span>' + I(2) + '<span class="es-v">x</span><span class="es-op">+</span>' + I(3) + '<span class="es-op">= 0</span></div>'; },
            solve: function (v) { return solveCubic(v[0], v[1], v[2], v[3]); } },
    s2:   { n: 6, def: ['2', '1', '5', '1', '-1', '1'],
            row: function (I) {
              return '<div class="es-eq">' + I(0) + '<span class="es-v">x</span><span class="es-op">+</span>' + I(1) + '<span class="es-v">y</span><span class="es-op">=</span>' + I(2) + '</div>' +
                     '<div class="es-eq">' + I(3) + '<span class="es-v">x</span><span class="es-op">+</span>' + I(4) + '<span class="es-v">y</span><span class="es-op">=</span>' + I(5) + '</div>';
            },
            solve: function (v) { return solveSystem([[v[0], v[1]], [v[3], v[4]]], [v[2], v[5]]); } },
    s3:   { n: 12, def: ['1', '1', '1', '6', '2', '-1', '1', '3', '1', '2', '-1', '2'],
            row: function (I) {
              var out = '';
              for (var r = 0; r < 3; r++) {
                var o = r * 4;
                out += '<div class="es-eq">' + I(o) + '<span class="es-v">x</span><span class="es-op">+</span>' + I(o + 1) + '<span class="es-v">y</span><span class="es-op">+</span>' + I(o + 2) + '<span class="es-v">z</span><span class="es-op">=</span>' + I(o + 3) + '</div>';
              }
              return out;
            },
            solve: function (v) { return solveSystem([[v[0], v[1], v[2]], [v[4], v[5], v[6]], [v[8], v[9], v[10]]], [v[3], v[7], v[11]]); } }
  };
  var EXAMPLES = {
    lin: [['3', '-7', '2'], ['1/2', '3', '0'], ['0', '4', '4']],
    quad: [['1', '-5', '6'], ['2', '4', '-3'], ['1', '2', '5'], ['4', '-12', '9'], ['1', '0', '-2']],
    cub: [['1', '-6', '11', '-6'], ['2', '-3', '-3', '2'], ['1', '0', '0', '-8'], ['1', '0', '-2', '-1'], ['1', '-3', '0', '1']],
    s2: [['3', '2', '12', '1', '-1', '-1'], ['1', '2', '3', '2', '4', '6'], ['1', '1', '2', '1', '1', '5']],
    s3: [['2', '1', '-1', '8', '-3', '-1', '2', '-11', '-2', '1', '2', '-3'], ['1', '2', '3', '14', '2', '-1', '1', '3', '3', '1', '-2', '-1']]
  };

  /* ============================================================ the page */
  function $(id) { return document.getElementById(id); }
  var el = { modes: $('esModes'), inputs: $('esInputs'), ex: $('esEx'), big: $('esBig'), alt: $('esAlt'),
             steps: $('esSteps'), stepsCard: $('esStepsCard'), copy: $('esCopy'), result: $('esResult'), reset: $('esReset') };

  var S = { m: 'quad', v: MODES.quad.def.slice() };
  var last = null;

  function drawModes() {
    Array.prototype.forEach.call(el.modes.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-m') === S.m ? 'true' : 'false');
    });
  }

  var NAMES = { lin: ['a', 'b', 'c'], quad: ['a', 'b', 'c'], cub: ['a', 'b', 'c', 'd'] };
  function drawInputs() {
    var mode = MODES[S.m];
    el.inputs.innerHTML = mode.row(function (i) {
      var nm = NAMES[S.m] ? NAMES[S.m][i] : '';
      return '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" data-k="' + i + '" value="' + A.esc(S.v[i] == null ? '' : S.v[i]) +
        '" placeholder="0" aria-label="' + (nm || ('#' + (i + 1))) + '">';
    });
    el.ex.innerHTML = '';
    EXAMPLES[S.m].forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-e', e.join('|'));
      b.innerHTML = exampleLabel(e);
      el.ex.appendChild(b);
    });
  }
  function exampleLabel(e) {
    var f = e.map(parseF);
    if (S.m === 'lin') { return polyH([f[0], f[1]], 'x') + ' = ' + H(f[2]); }
    if (S.m === 'quad') { return polyH(f, 'x') + ' = 0'; }
    if (S.m === 'cub') { return polyH(f, 'x') + ' = 0'; }
    if (S.m === 's2') { return lin2H([f[0], f[1]], ['x', 'y']) + ' = ' + H(f[2]) + ' ; ' + lin2H([f[3], f[4]], ['x', 'y']) + ' = ' + H(f[5]); }
    return lin2H([f[0], f[1], f[2]], ['x', 'y', 'z']) + ' = ' + H(f[3]) + ' ; …';
  }

  function solve() {
    var vals = [], bad = false;
    for (var i = 0; i < MODES[S.m].n; i++) {
      var f = parseF(S.v[i]);
      if (!f) { bad = true; break; }
      if (babs(f.n) > BigInt('1000000000000') || f.d > BigInt('1000000000000')) { last = { err: T.big }; return; }
      vals.push(f);
    }
    if (bad) { last = { err: T.bad }; return; }
    try { last = MODES[S.m].solve(vals); }
    catch (e) { last = { err: T.bad }; }
  }

  function paint() {
    el.result.classList.toggle('es-bad', !!last.err);
    if (last.err) {
      el.big.innerHTML = A.esc(A.t(last.err));
      el.alt.textContent = '';
      el.steps.innerHTML = '';
      el.stepsCard.hidden = true;
      return;
    }
    el.big.innerHTML = A.t(last.head);
    el.alt.innerHTML = last.sub ? A.t(last.sub) : '';
    el.steps.innerHTML = last.steps.map(function (s) { return '<li>' + A.t(s) + '</li>'; }).join('');
    el.stepsCard.hidden = false;
  }

  function run() {
    solve(); paint();
    A.writeHash({ m: S.m, c: S.v.map(function (v) { return v == null ? '' : v; }).join('|') });
  }

  el.modes.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-m]');
    if (!b || b.getAttribute('data-m') === S.m) { return; }
    S.m = b.getAttribute('data-m');
    S.v = MODES[S.m].def.slice();
    drawModes(); drawInputs(); run();
  });
  el.inputs.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-k');
    if (k == null) { return; }
    S.v[+k] = e.target.value;
    run();
  });
  el.ex.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-e]');
    if (!b) { return; }
    S.v = b.getAttribute('data-e').split('|');
    drawInputs(); run();
  });
  el.reset.addEventListener('click', function () {
    S.v = MODES[S.m].def.map(function () { return ''; });
    drawInputs(); run();
    var first = el.inputs.querySelector('input');
    if (first) { first.focus(); }
  });
  el.copy.addEventListener('click', function () { if (last && !last.err) { A.copy(el.copy, last.copy); } });

  document.addEventListener('aa:langchange', function () {
    el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
    drawInputs(); run();
  });

  var q = A.readHash();
  if (q.m && MODES[q.m]) {
    S.m = q.m;
    S.v = q.c != null ? q.c.split('|') : MODES[q.m].def.slice();
    while (S.v.length < MODES[S.m].n) { S.v.push(''); }
  }
  drawModes(); drawInputs(); run();
  el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);

  window.AAEquation = { parseF: parseF, solveQuad: solveQuad, solveCubic: solveCubic, solveSystem: solveSystem, solveLinear: solveLinear, F: F, strip: stripTags };
})();
