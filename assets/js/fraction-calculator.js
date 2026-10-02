/* Alpha Academy Cambodia — Fraction & Percentage Calculator
   ---------------------------------------------------------------------------
   Two tools on one page, behind a switch. Uses tools-core.js.

   FRACTIONS. Add, subtract, multiply or divide two fractions or mixed
   numbers, and get the answer three ways — simplified, as a mixed number and
   as a decimal — with the working a teacher would want to see: the common
   denominator, the cancelling, the reciprocal. Leave the second box empty
   and the page simply simplifies and converts the first.

     · The arithmetic is exact (BigInt numerator and denominator), so 1/3 +
       1/6 is 1/2, never 0.49999.
     · A recurring decimal is shown with its repeating block marked —
       1/7 = 0.(142857), printed with a bar over the digits — rather than
       cut off, because the cut-off version is a different number.
     · Input is what a student writes: 3/4, 1 2/3, −5/8, 0.25, 7.

   PERCENTAGES. The four questions people actually ask, each answered live
   in its own panel: X% of Y; X is what percent of Y; the change from A to
   B; and Y increased or decreased by X% (a discount, VAT, a pay rise).

   State lives in the address bar: #t=frac&a=1 2/3&o=+&b=3/4               */
(function () {
  'use strict';

  var A = window.AATool;
  var root = document.getElementById('frRoot');
  if (!root || typeof BigInt === 'undefined') { return; }

  /* ===================================================== exact fractions */
  var ZERO = BigInt(0), ONE = BigInt(1), TEN = BigInt(10);
  function babs(a) { return a < ZERO ? -a : a; }
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function blcm(a, b) { return a / bgcd(a, b) * b; }
  function F(n, d, raw) {
    n = BigInt(n); d = d === undefined ? ONE : BigInt(d);
    if (d < ZERO) { n = -n; d = -d; }
    if (raw) { return { n: n, d: d }; }
    var g = bgcd(n, d) || ONE;
    return { n: n / g, d: d / g };
  }

  /* "1 2/3" → { whole: 1, n: 2, d: 3, neg: false } and its improper value.
     Returns null when empty, false when unreadable. */
  function parseMixed(s) {
    s = A.unKh(String(s || '')).trim().replace(/[−–]/g, '-').replace(/\s+/g, ' ');
    if (s === '') { return null; }
    var neg = false;
    if (s.charAt(0) === '-') { neg = true; s = s.slice(1).trim(); }
    else if (s.charAt(0) === '+') { s = s.slice(1).trim(); }
    var m;
    if ((m = /^(\d+) (\d+)\s?\/\s?(\d+)$/.exec(s))) {
      var w = BigInt(m[1]), n = BigInt(m[2]), d = BigInt(m[3]);
      if (d === ZERO) { return false; }
      return { neg: neg, whole: w, n: n, d: d, mixed: true, val: F((neg ? -1n : 1n) * (w * d + n), d, true) };
    }
    if ((m = /^(\d+)\s?\/\s?(\d+)$/.exec(s))) {
      var n2 = BigInt(m[1]), d2 = BigInt(m[2]);
      if (d2 === ZERO) { return false; }
      return { neg: neg, n: n2, d: d2, val: F((neg ? -n2 : n2), d2, true) };
    }
    if ((m = /^(\d*)[.,](\d+)$/.exec(s)) || (m = /^(\d+)$/.exec(s))) {
      var frac = m[2] || '';
      var v = F(BigInt((neg ? '-' : '') + (m[1] || '0') + frac), TEN ** BigInt(frac.length), true);
      return { neg: neg, dec: !!frac, val: v };
    }
    return false;
  }

  /* ============================================================ display */
  function n2s(b) { return A.kh(String(b)); }
  function frH(n, d) {
    return '<span class="es-fr"><span>' + n2s(babs(n)) + '</span><span>' + n2s(d) + '</span></span>';
  }
  function H(f) {
    var s = f.n < ZERO ? '−' : '';
    if (f.d === ONE) { return s + n2s(babs(f.n)); }
    return s + frH(f.n, f.d);
  }
  function mixedH(f) {
    var s = f.n < ZERO ? '−' : '', n = babs(f.n);
    if (f.d === ONE || n < f.d) { return H(f); }
    var w = n / f.d, r = n % f.d;
    return s + n2s(w) + (r === ZERO ? '' : '<span class="fr-gap"></span>' + frH(r, f.d));
  }
  function plain(f) { return (f.n < ZERO ? '-' : '') + babs(f.n) + (f.d === ONE ? '' : '/' + f.d); }
  function P(f) { return f.n < ZERO ? '(' + H(f) + ')' : H(f); }

  /* the decimal, with a recurring block marked */
  function decimalH(f) {
    var neg = f.n < ZERO, n = babs(f.n), d = f.d;
    var whole = n / d, r = n % d, digits = '', seen = {}, start = -1;
    while (r !== ZERO && digits.length < 60) {
      var key = String(r);
      if (seen[key] !== undefined) { start = seen[key]; break; }
      seen[key] = digits.length;
      r *= TEN;
      digits += String(r / d);
      r %= d;
    }
    var sep = A.lang() === 'km' ? ',' : '.';
    var out = (neg ? '−' : '') + n2s(whole.toLocaleString ? groupB(whole) : whole);
    if (!digits) { return { html: out, text: (neg ? '-' : '') + whole, exact: true }; }
    if (start >= 0) {
      return {
        html: out + sep + n2s(digits.slice(0, start)) + '<span class="fr-rep">' + n2s(digits.slice(start)) + '</span>',
        text: (neg ? '-' : '') + whole + '.' + digits.slice(0, start) + '(' + digits.slice(start) + ')',
        rep: true
      };
    }
    if (r !== ZERO) { return { html: out + sep + n2s(digits) + '…', text: (neg ? '-' : '') + whole + '.' + digits + '...', cut: true }; }
    return { html: out + sep + n2s(digits), text: (neg ? '-' : '') + whole + '.' + digits, exact: true };
  }
  function groupB(b) {
    var s = String(b), out = '', g = A.lang() === 'km' ? '.' : ',';
    while (s.length > 3) { out = g + s.slice(-3) + out; s = s.slice(0, -3); }
    return s + out;
  }

  /* ============================================================== words */
  var T = {
    empty: { en: 'Type a fraction such as 3/4 or 1 2/3.', km: 'វាយប្រភាគ ដូចជា 3/4 ឬ 1 2/3។' },
    bad:   { en: 'That is not a fraction this can read. Try 3/4, 1 2/3, −5/8 or 0.25.',
             km: 'មិនអាចអានប្រភាគនេះបានទេ។ សាកល្បង 3/4, 1 2/3, −5/8 ឬ 0.25។' },
    zero:  { en: 'Dividing by zero has no answer.', km: 'ការចែកនឹងសូន្យគ្មានចម្លើយទេ។' },
    dzero: { en: 'A denominator cannot be 0.', km: 'ភាគបែងមិនអាចស្មើ 0 បានទេ។' },
    simp:  { en: 'Simplest form', km: 'ទម្រង់សម្រួលបំផុត' },
    mixed: { en: 'Mixed number', km: 'ចំនួនចម្រុះ' },
    dec:   { en: 'Decimal', km: 'ទសភាគ' },
    pct:   { en: 'Percent', km: 'ភាគរយ' },
    rep:   { en: 'The digits under the bar repeat for ever.', km: 'លេខនៅក្រោមសញ្ញាបន្ទាត់ ដដែលៗរហូត។' }
  };
  function L(en, km) { return { en: en, km: km }; }

  /* ===================================================== the fraction tab */
  function $(id) { return document.getElementById(id); }
  var el = {
    tabs: $('frTabs'), paneF: $('frPaneF'), paneP: $('frPaneP'),
    a: $('frA'), b: $('frB'), ops: $('frOps'), ex: $('frEx'),
    big: $('frBig'), forms: $('frForms'), note: $('frNote'), noteText: $('frNoteText'),
    steps: $('frSteps'), stepsCard: $('frStepsCard'), result: $('frResult'), copy: $('frCopy'), reset: $('frReset')
  };
  var S = { tab: 'frac', a: '1 2/3', o: '+', b: '3/4' };
  var OPS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  var copyText = '';

  function toImproperStep(x, name, st) {
    if (x.mixed) {
      var v = x.val;
      st.push(L('Write ' + name.en + ' as an improper fraction: ' + (x.neg ? '−' : '') + n2s(x.whole) + '<span class="fr-gap"></span>' + frH(x.n, x.d) +
                ' = ' + (x.neg ? '−' : '') + frH(x.whole * x.d + x.n, x.d) + '  (' + n2s(x.whole) + ' × ' + n2s(x.d) + ' + ' + n2s(x.n) + ' = ' + n2s(x.whole * x.d + x.n) + ')',
                'សរសេរ ' + name.km + ' ជាប្រភាគមិនពិត៖ ' + (x.neg ? '−' : '') + n2s(x.whole) + '<span class="fr-gap"></span>' + frH(x.n, x.d) +
                ' = ' + (x.neg ? '−' : '') + frH(x.whole * x.d + x.n, x.d) + '  (' + n2s(x.whole) + ' × ' + n2s(x.d) + ' + ' + n2s(x.n) + ' = ' + n2s(x.whole * x.d + x.n) + ')'));
      return v;
    }
    if (x.dec) {
      st.push(L('Write ' + name.en + ' as a fraction: ' + H(x.val) + (x.val.d !== F(x.val.n, x.val.d).d ? ' = ' + H(F(x.val.n, x.val.d)) : ''),
                'សរសេរ ' + name.km + ' ជាប្រភាគ៖ ' + H(x.val) + (x.val.d !== F(x.val.n, x.val.d).d ? ' = ' + H(F(x.val.n, x.val.d)) : '')));
      return F(x.val.n, x.val.d);
    }
    return x.val;
  }

  function simplifyStep(n, d, st) {
    var f = F(n, d), g = bgcd(n, d);
    if (d < ZERO) { n = -n; d = -d; }
    if (g > ONE) {
      st.push(L('Simplify: divide the top and bottom by their greatest common divisor, ' + n2s(g) + ': ' + H(F(n, d, true)) + ' = ' + H(f),
                'សម្រួល៖ ចែកភាគយក និងភាគបែងនឹងតួចែករួមធំបំផុត ' + n2s(g) + '៖ ' + H(F(n, d, true)) + ' = ' + H(f)));
    } else if (d !== ONE) {
      st.push(L(H(f) + ' is already in its simplest form — ' + n2s(babs(f.n)) + ' and ' + n2s(f.d) + ' have no common factor.',
                H(f) + ' ស្ថិតក្នុងទម្រង់សម្រួលបំផុតហើយ — ' + n2s(babs(f.n)) + ' និង ' + n2s(f.d) + ' គ្មានកត្តារួមទេ។'));
    }
    return f;
  }

  function computeFrac() {
    var x = parseMixed(S.a), y = parseMixed(S.b), st = [];
    if (x === null) { return { err: T.empty }; }
    if (x === false || y === false) { return { err: T.bad }; }
    if (x.val.d === ZERO) { return { err: T.dzero }; }
    var res;
    if (y === null) {
      var v = toImproperStep(x, L('it', 'វា'), st);
      if (x.mixed) { res = simplifyStep(v.n, v.d, st); }
      else { res = simplifyStep(x.val.n, x.val.d, st); }
      return { res: res, steps: st, expr: x };
    }
    var a = toImproperStep(x, L('the first number', 'ចំនួនទីមួយ'), st);
    var b = toImproperStep(y, L('the second number', 'ចំនួនទីពីរ'), st);
    a = F(a.n, a.d, true); b = F(b.n, b.d, true);
    if (S.o === '+' || S.o === '-') {
      var l = blcm(a.d, b.d);
      var an = a.n * (l / a.d), bn = b.n * (l / b.d);
      if (a.d !== b.d) {
        st.push(L('Find a common denominator: the lowest common multiple of ' + n2s(a.d) + ' and ' + n2s(b.d) + ' is ' + n2s(l) + '.',
                  'រកភាគបែងរួម៖ ពហុគុណរួមតូចបំផុតនៃ ' + n2s(a.d) + ' និង ' + n2s(b.d) + ' គឺ ' + n2s(l) + '។'));
        st.push(L('Rewrite both: ' + H(a) + ' = ' + H(F(an, l, true)) + ' and ' + H(b) + ' = ' + H(F(bn, l, true)),
                  'សរសេរឡើងវិញ៖ ' + H(a) + ' = ' + H(F(an, l, true)) + ' និង ' + H(b) + ' = ' + H(F(bn, l, true))));
      } else {
        st.push(L('The denominators are already the same (' + n2s(l) + ').', 'ភាគបែងដូចគ្នារួចហើយ (' + n2s(l) + ')។'));
      }
      var rn = S.o === '+' ? an + bn : an - bn;
      var opW = S.o === '+' ? L('Add', 'បូក') : L('Subtract', 'ដក');
      st.push(L(opW.en + ' the numerators: ' + H(F(an, l, true)) + ' ' + OPS[S.o] + ' ' + P(F(bn, l, true)) + ' = ' + frSigned(rn, l),
                opW.km + 'ភាគយក៖ ' + H(F(an, l, true)) + ' ' + OPS[S.o] + ' ' + P(F(bn, l, true)) + ' = ' + frSigned(rn, l)));
      res = simplifyStep(rn, l, st);
    } else if (S.o === '*') {
      st.push(L('Multiply the numerators together and the denominators together: ' + H(a) + ' × ' + P(b) + ' = ' + frSigned(a.n * b.n, a.d * b.d),
                'គុណភាគយកនឹងភាគយក និងភាគបែងនឹងភាគបែង៖ ' + H(a) + ' × ' + P(b) + ' = ' + frSigned(a.n * b.n, a.d * b.d)));
      res = simplifyStep(a.n * b.n, a.d * b.d, st);
    } else {
      if (b.n === ZERO) { return { err: T.zero }; }
      var rb = F(b.d, b.n, true);
      st.push(L('To divide, multiply by the reciprocal (flip the second fraction): ' + H(a) + ' ÷ ' + P(b) + ' = ' + H(a) + ' × ' + P(rb),
                'ដើម្បីចែក គុណនឹងប្រភាគច្រាស (ត្រឡប់ប្រភាគទីពីរ)៖ ' + H(a) + ' ÷ ' + P(b) + ' = ' + H(a) + ' × ' + P(rb)));
      st.push(L('Multiply: ' + frSigned(a.n * rb.n, a.d * rb.d), 'គុណ៖ ' + frSigned(a.n * rb.n, a.d * rb.d)));
      res = simplifyStep(a.n * rb.n, a.d * rb.d, st);
    }
    return { res: res, steps: st };
  }
  function frSigned(n, d) { return H(F(n, d, true)); }

  function paintFrac() {
    var r = computeFrac();
    el.result.classList.toggle('es-bad', !!r.err);
    if (r.err) {
      el.big.innerHTML = A.esc(A.t(r.err));
      el.forms.innerHTML = ''; el.note.classList.remove('is-on');
      el.stepsCard.hidden = true;
      return;
    }
    var f = r.res, d = decimalH(f);
    var lhs = parseMixed(S.b) === null ? exprH(S.a) : exprH(S.a) + ' ' + OPS[S.o] + ' ' + exprH(S.b, true);
    el.big.innerHTML = lhs + ' = ' + H(f);
    var pct = F(f.n * BigInt(100), f.d), pd = decimalH(pct);
    var rows = [
      [T.simp, H(f)],
      [T.mixed, mixedH(f)],
      [T.dec, d.html],
      [T.pct, pd.html + '%']
    ];
    el.forms.innerHTML = rows.map(function (rw) {
      return '<li><span class="nm">' + A.esc(A.t(rw[0])) + '</span><span class="vl">' + rw[1] + '</span></li>';
    }).join('');
    el.noteText.textContent = d.rep ? A.t(T.rep) : '';
    el.note.classList.toggle('is-on', !!d.rep);
    el.steps.innerHTML = r.steps.map(function (s) { return '<li>' + A.t(s) + '</li>'; }).join('');
    el.stepsCard.hidden = !r.steps.length;
    copyText = plain(f) + ' = ' + d.text;
  }
  function exprH(s, paren) {
    var x = parseMixed(s);
    if (!x) { return A.esc(s); }
    var out;
    if (x.mixed) { out = (x.neg ? '−' : '') + n2s(x.whole) + '<span class="fr-gap"></span>' + frH(x.n, x.d); }
    else if (x.dec) { out = (x.neg ? '−' : '') + A.esc(A.kh(String(s).replace(/^[-−+]\s*/, '').replace('.', A.lang() === 'km' ? ',' : '.'))); }
    else { out = H(F(x.val.n, x.val.d, true)); }
    return paren && x.neg ? '(' + out + ')' : out;
  }

  /* ===================================================== the percent tab */
  var pel = {
    p1x: $('frP1x'), p1y: $('frP1y'), p1r: $('frP1r'),
    p2x: $('frP2x'), p2y: $('frP2y'), p2r: $('frP2r'),
    p3a: $('frP3a'), p3b: $('frP3b'), p3r: $('frP3r'),
    p4y: $('frP4y'), p4x: $('frP4x'), p4r: $('frP4r'), p4dir: $('frP4dir')
  };
  var P4 = { dir: '-' };
  function f(v) { return A.fmt(v, { sig: 10 }); }
  function box(elm, html, how) {
    elm.innerHTML = '<span class="fr-pa">' + html + '</span>' + (how ? '<span class="fr-ph">' + how + '</span>' : '');
  }
  function wait(elm) { elm.innerHTML = '<span class="fr-pw">' + A.esc(A.t(L('Fill in both boxes.', 'សូមបំពេញប្រអប់ទាំងពីរ។'))) + '</span>'; }

  function paintPct() {
    var x = A.parse(pel.p1x.value), y = A.parse(pel.p1y.value);
    if (x == null || y == null || isNaN(x) || isNaN(y)) { wait(pel.p1r); }
    else { box(pel.p1r, f(x * y / 100), f(x) + '% × ' + f(y) + ' = ' + f(x) + ' ÷ ' + A.kh(100) + ' × ' + f(y)); }

    x = A.parse(pel.p2x.value); y = A.parse(pel.p2y.value);
    if (x == null || y == null || isNaN(x) || isNaN(y)) { wait(pel.p2r); }
    else if (y === 0) { box(pel.p2r, '—', A.esc(A.t(T.zero))); }
    else { box(pel.p2r, f(x / y * 100) + '%', f(x) + ' ÷ ' + f(y) + ' × ' + A.kh(100)); }

    var a = A.parse(pel.p3a.value), b = A.parse(pel.p3b.value);
    if (a == null || b == null || isNaN(a) || isNaN(b)) { wait(pel.p3r); }
    else if (a === 0) { box(pel.p3r, '—', A.esc(A.t(L('A change from 0 has no percentage.', 'ការប្រែប្រួលពី 0 គ្មានភាគរយទេ។')))); }
    else {
      var ch = (b - a) / Math.abs(a) * 100;
      var word = ch > 0 ? L('increase', 'កើនឡើង') : ch < 0 ? L('decrease', 'ថយចុះ') : L('no change', 'មិនប្រែប្រួល');
      box(pel.p3r, (ch > 0 ? '+' : '') + f(ch) + '% <small>' + A.esc(A.t(word)) + '</small>',
          '(' + f(b) + ' − ' + f(a) + ') ÷ ' + f(Math.abs(a)) + ' × ' + A.kh(100) + ' · ' + A.esc(A.t(L('difference', 'ផលដក'))) + ' ' + f(b - a));
    }

    y = A.parse(pel.p4y.value); x = A.parse(pel.p4x.value);
    if (x == null || y == null || isNaN(x) || isNaN(y)) { wait(pel.p4r); }
    else {
      var sgn = P4.dir === '+' ? 1 : -1, amt = y * x / 100, res = y + sgn * amt;
      box(pel.p4r, f(res),
          f(y) + ' ' + (sgn > 0 ? '+' : '−') + ' ' + f(x) + '% = ' + f(y) + ' × ' + f(1 + sgn * x / 100) + ' · ' +
          A.esc(A.t(sgn > 0 ? L('amount added', 'ចំនួនបន្ថែម') : L('amount off', 'ចំនួនបញ្ចុះ'))) + ' ' + f(amt));
    }
    Array.prototype.forEach.call(pel.p4dir.querySelectorAll('button'), function (bt) {
      bt.setAttribute('aria-pressed', bt.getAttribute('data-d') === P4.dir ? 'true' : 'false');
    });
  }

  /* ============================================================ wiring */
  function drawTabs() {
    Array.prototype.forEach.call(el.tabs.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-t') === S.tab ? 'true' : 'false');
    });
    el.paneF.hidden = S.tab !== 'frac';
    el.paneP.hidden = S.tab !== 'pct';
    Array.prototype.forEach.call(el.ops.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-o') === S.o ? 'true' : 'false');
    });
  }
  function save() {
    if (S.tab === 'frac') { A.writeHash({ t: 'frac', a: S.a, o: S.o, b: S.b }); }
    else { A.writeHash({ t: 'pct' }); }
  }
  function all() { drawTabs(); paintFrac(); paintPct(); save(); }

  el.tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-t]');
    if (b) { S.tab = b.getAttribute('data-t'); all(); }
  });
  el.ops.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-o]');
    if (b) { S.o = b.getAttribute('data-o'); drawTabs(); paintFrac(); save(); }
  });
  el.a.addEventListener('input', function () { S.a = el.a.value; paintFrac(); save(); });
  el.b.addEventListener('input', function () { S.b = el.b.value; paintFrac(); save(); });
  el.ex.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-x]');
    if (!b) { return; }
    var p = b.getAttribute('data-x').split('|');
    S.a = p[0]; S.o = p[1]; S.b = p[2];
    el.a.value = S.a; el.b.value = S.b;
    drawTabs(); paintFrac(); save();
  });
  el.reset.addEventListener('click', function () { S.a = ''; S.b = ''; el.a.value = ''; el.b.value = ''; paintFrac(); save(); el.a.focus(); });
  el.copy.addEventListener('click', function () { if (copyText) { A.copy(el.copy, copyText); } });
  el.paneP.addEventListener('input', paintPct);
  pel.p4dir.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]');
    if (b) { P4.dir = b.getAttribute('data-d'); paintPct(); }
  });
  document.addEventListener('aa:langchange', function () {
    el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
    paintFrac(); paintPct();
  });

  var q = A.readHash();
  if (q.t === 'pct') { S.tab = 'pct'; }
  if (q.t === 'frac') {
    S.a = q.a || ''; S.b = q.b || '';
    if (OPS[q.o]) { S.o = q.o; }
  }
  el.a.value = S.a; el.b.value = S.b;
  el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
  all();
})();
