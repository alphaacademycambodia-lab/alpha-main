/* Alpha Academy Cambodia — Scientific Calculator
   ---------------------------------------------------------------------------
   The calculator a Grade 12 student is allowed in the exam room, in a page:
   trigonometry in degrees or radians, logarithms, powers and roots,
   factorials, nCr and nPr, scientific notation and the last answer. No
   dependencies, no network, nothing stored — the three rules every tool on
   this tab keeps.

   FIVE THINGS DECIDE HOW THIS IS BUILT.

   1. THERE IS NO eval(). The expression is a list of tokens (one per key
      press) and a small recursive-descent parser turns it into a number.
      That is what lets ⌫ remove "sin(" in one press, what lets the page
      name the exact reason an answer is impossible, and what keeps a pasted
      link from ever running code.

   2. IT FOLLOWS THE ORDER A CASIO FOLLOWS, because that is the one the
      student already trusts. From tightest to loosest:
        brackets and functions → x² x³ x⁻¹ ! %  → ^ and ˣ√ and ᴇ (right to
        left) → a leading minus → nCr nPr → multiplication without a sign
        (2π, 3sin30) → × ÷ → + −
      So −3² = −9, 2^3^2 = 512, and 1÷2π = 1÷(2π). The notes under the
      calculator say so, because the last one surprises people.

   3. TRIGONOMETRY IN DEGREES IS EXACT AT THE ANGLES STUDENTS USE.
      Math.sin(Math.PI) is 1.2e-16, not 0, and tan 90° comes back as
      16331239353195370. In degree mode the angle is reduced first and the
      multiples of 90° are answered exactly; tan 90° is refused rather than
      printed as a sixteen-digit number that looks like an answer.

   4. MISSING CLOSING BRACKETS ARE ADDED, extra ones are not. "sin(30" is
      what everybody types; "2)" is a mistake worth pointing out.

   5. THE ADDRESS BAR IS THE ONLY MEMORY. The last calculation and the angle
      mode go in the hash (#x=…&a=rad) so a worked answer can be sent to a
      classmate. The history panel lives only as long as the tab.           */
(function () {
  'use strict';

  var root = document.getElementById('scRoot');
  if (!root) { return; }

  /* ------------------------------------------------------------- language */
  function lang() { return (window.AAi18n && window.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(o) { return (lang() === 'km' && o && o.km) ? o.km : (o ? o.en : ''); }

  var KHDIGIT = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function kh(s) {
    s = String(s);
    if (lang() !== 'km') { return s; }
    return s.replace(/[0-9]/g, function (d) { return KHDIGIT[+d]; });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var T = {
    deg:     { en: 'DEG', km: 'ដឺក្រេ' },
    rad:     { en: 'RAD', km: 'រ៉ាដ្យង់' },
    degLong: { en: 'Angles in degrees', km: 'មុំគិតជាដឺក្រេ' },
    radLong: { en: 'Angles in radians', km: 'មុំគិតជារ៉ាដ្យង់' },
    second:  { en: '2nd', km: '2nd' },
    ready:   { en: 'Type a calculation', km: 'វាយការគណនា' },
    copy:    { en: 'Copy', km: 'ចម្លង' },
    copied:  { en: 'Copied', km: 'បានចម្លង' },
    empty:   { en: 'Your answers will appear here. They are kept only while this tab is open.',
               km: 'ចម្លើយរបស់អ្នកនឹងបង្ហាញនៅទីនេះ។ វាត្រូវបានរក្សាទុកតែពេលផ្ទាំងនេះនៅបើកប៉ុណ្ណោះ។' },
    reuse:   { en: 'Use this answer', km: 'ប្រើចម្លើយនេះ' },
    /* the reasons an answer can be refused — one sentence each, saying what
       to change rather than just that something is wrong */
    eSyntax: { en: 'Syntax error — check the brackets and the signs between the numbers.',
               km: 'កំហុសការសរសេរ — សូមពិនិត្យវង់ក្រចក និងសញ្ញារវាងលេខ។' },
    eParen:  { en: 'Syntax error — there is a closing bracket with no opening one.',
               km: 'កំហុសការសរសេរ — មានវង់ក្រចកបិទ ដែលគ្មានវង់ក្រចកបើក។' },
    eDiv0:   { en: 'Math error — you cannot divide by zero.',
               km: 'កំហុសគណិតវិទ្យា — មិនអាចចែកនឹងសូន្យបានទេ។' },
    eSqrt:   { en: 'Math error — a negative number has no real square root.',
               km: 'កំហុសគណិតវិទ្យា — ចំនួនអវិជ្ជមានគ្មានឫសការេពិតទេ។' },
    eLog:    { en: 'Math error — ln and log need a number greater than 0.',
               km: 'កំហុសគណិតវិទ្យា — ln និង log ត្រូវការចំនួនធំជាង ០។' },
    eAsin:   { en: 'Math error — sin⁻¹ and cos⁻¹ need a number from −1 to 1.',
               km: 'កំហុសគណិតវិទ្យា — sin⁻¹ និង cos⁻¹ ត្រូវការចំនួនពី −១ ដល់ ១។' },
    eTan:    { en: 'Math error — tan is not defined here (the angle is 90° plus a multiple of 180°).',
               km: 'កំហុសគណិតវិទ្យា — tan មិនកំណត់នៅទីនេះទេ (មុំស្មើ ៩០° បូកពហុគុណនៃ ១៨០°)។' },
    eFact:   { en: 'Math error — n! needs a whole number from 0 to 170.',
               km: 'កំហុសគណិតវិទ្យា — n! ត្រូវការចំនួនគត់ពី ០ ដល់ ១៧០។' },
    eComb:   { en: 'Math error — nCr and nPr need whole numbers with n ≥ r ≥ 0.',
               km: 'កំហុសគណិតវិទ្យា — nCr និង nPr ត្រូវការចំនួនគត់ ដែល n ≥ r ≥ ០។' },
    ePow:    { en: 'Math error — a negative number to this power has no real answer.',
               km: 'កំហុសគណិតវិទ្យា — ចំនួនអវិជ្ជមានលើកស្វ័យគុណនេះ គ្មានចម្លើយពិតទេ។' },
    eRoot:   { en: 'Math error — this root of a negative number has no real answer.',
               km: 'កំហុសគណិតវិទ្យា — ឫសនេះនៃចំនួនអវិជ្ជមាន គ្មានចម្លើយពិតទេ។' },
    eBig:    { en: 'Math error — the answer is too large for the calculator.',
               km: 'កំហុសគណិតវិទ្យា — ចម្លើយធំពេកសម្រាប់ម៉ាស៊ីនគិតលេខ។' },
    eMath:   { en: 'Math error — this has no real answer.',
               km: 'កំហុសគណិតវិទ្យា — ការគណនានេះគ្មានចម្លើយពិតទេ។' }
  };

  /* ---------------------------------------------------------------- tokens
     One entry per thing a key can put into the expression. `s` is what the
     display shows; `k` is what the parser sees. Functions carry their own
     opening bracket, as on a Casio, so ⌫ removes "sin(" in one press.     */
  var TOK = {
    '.':    { k: 'num', s: '.' },
    'pi':   { k: 'const', s: 'π' },
    'e':    { k: 'const', s: 'e' },
    'ans':  { k: 'const', s: 'Ans' },
    '+':    { k: 'add', s: '+' },
    '-':    { k: 'add', s: '−' },
    '*':    { k: 'mul', s: '×' },
    '/':    { k: 'mul', s: '÷' },
    '^':    { k: 'pow', s: '^' },
    'root': { k: 'pow', s: 'ˣ√' },
    'E':    { k: 'pow', s: 'ᴇ' },
    'C':    { k: 'comb', s: 'C' },
    'P':    { k: 'comb', s: 'P' },
    '(':    { k: 'open', s: '(' },
    ')':    { k: 'close', s: ')' },
    '!':    { k: 'post', s: '!' },
    '%':    { k: 'post', s: '%' },
    'sq':   { k: 'post', s: '²' },
    'cube': { k: 'post', s: '³' },
    'inv':  { k: 'post', s: '⁻¹' },
    'sin':  { k: 'fn', s: 'sin(' },
    'cos':  { k: 'fn', s: 'cos(' },
    'tan':  { k: 'fn', s: 'tan(' },
    'asin': { k: 'fn', s: 'sin⁻¹(' },
    'acos': { k: 'fn', s: 'cos⁻¹(' },
    'atan': { k: 'fn', s: 'tan⁻¹(' },
    'ln':   { k: 'fn', s: 'ln(' },
    'log':  { k: 'fn', s: 'log(' },
    'sqrt': { k: 'fn', s: '√(' },
    'cbrt': { k: 'fn', s: '∛(' },
    'abs':  { k: 'fn', s: 'Abs(' },
    'exp':  { k: 'fn', s: 'e^(' },
    'ten':  { k: 'fn', s: '10^(' }
  };
  for (var d = 0; d <= 9; d++) { TOK[String(d)] = { k: 'num', s: String(d) }; }

  function kind(id) { return TOK[id] ? TOK[id].k : ''; }
  /* can this token begin an operand? (what decides implicit ×) */
  function starts(id) {
    var k = kind(id);
    return k === 'num' || k === 'const' || k === 'open' || k === 'fn';
  }

  /* ------------------------------------------------------------------ maths */
  function Fail(code) { this.code = code; }

  var S = {
    toks: [],        // the expression, one token id per entry
    ans: 0,          // the last answer, what Ans means
    mode: 'deg',     // 'deg' | 'rad'
    second: false,   // is 2nd lit?
    done: false,     // is the display showing a finished answer?
    err: null,       // the T key of the last error, or null
    val: null,       // the last answer as a number
    hist: []         // [{toks, val}] newest first, this tab only
  };

  var DEG = Math.PI / 180;
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function mod(a, m) { return ((a % m) + m) % m; }

  function trig(name, x) {
    if (S.mode === 'deg') {
      /* reduce first, then answer the right angles exactly */
      var r = mod(x, 360);
      if (name === 'sin') {
        if (near(r, 0) || near(r, 180) || near(r, 360)) { return 0; }
        if (near(r, 90)) { return 1; }
        if (near(r, 270)) { return -1; }
        if (near(r, 30) || near(r, 150)) { return 0.5; }
        if (near(r, 210) || near(r, 330)) { return -0.5; }
        return Math.sin(r * DEG);
      }
      if (name === 'cos') {
        if (near(r, 90) || near(r, 270)) { return 0; }
        if (near(r, 0) || near(r, 360)) { return 1; }
        if (near(r, 180)) { return -1; }
        if (near(r, 60) || near(r, 300)) { return 0.5; }
        if (near(r, 120) || near(r, 240)) { return -0.5; }
        return Math.cos(r * DEG);
      }
      var h = mod(x, 180);
      if (near(h, 90)) { throw new Fail('eTan'); }
      if (near(h, 0) || near(h, 180)) { return 0; }
      if (near(h, 45)) { return 1; }
      if (near(h, 135)) { return -1; }
      return Math.tan(h * DEG);
    }
    var v = name === 'sin' ? Math.sin(x) : name === 'cos' ? Math.cos(x) : Math.tan(x);
    if (name === 'tan' && Math.abs(Math.cos(x)) < 1e-15) { throw new Fail('eTan'); }
    return Math.abs(v) < 1e-15 ? 0 : v;
  }

  function isInt(x) { return isFinite(x) && Math.abs(x - Math.round(x)) < 1e-9; }

  function fact(n) {
    if (!isInt(n) || n < 0 || n > 170) { throw new Fail('eFact'); }
    n = Math.round(n);
    var r = 1;
    for (var i = 2; i <= n; i++) { r *= i; }
    return r;
  }

  function comb(n, r, perm) {
    if (!isInt(n) || !isInt(r) || r < 0 || n < r) { throw new Fail('eComb'); }
    n = Math.round(n); r = Math.round(r);
    var out = 1, i;
    if (perm) {
      for (i = 0; i < r; i++) { out *= (n - i); }
      return out;
    }
    r = Math.min(r, n - r);
    for (i = 1; i <= r; i++) { out = out * (n - r + i) / i; }
    return Math.round(out) === out || out > 1e15 ? out : Math.round(out);
  }

  function power(a, b) {
    if (a === 0 && b < 0) { throw new Fail('eDiv0'); }
    if (a < 0 && !isInt(b)) {
      /* (−8)^(1/3): a real answer exists when the exponent is 1/odd */
      var n = 1 / b;
      if (isInt(n) && Math.round(n) % 2 !== 0) { return -Math.pow(-a, b); }
      throw new Fail('ePow');
    }
    return Math.pow(a, b);
  }

  function nroot(n, x) {
    if (n === 0) { throw new Fail('eMath'); }
    if (x < 0) {
      if (isInt(n) && Math.round(n) % 2 !== 0) { return -Math.pow(-x, 1 / n); }
      throw new Fail('eRoot');
    }
    return Math.pow(x, 1 / n);
  }

  function apply(fn, x) {
    switch (fn) {
      case 'sin': case 'cos': case 'tan': return trig(fn, x);
      case 'asin': case 'acos':
        if (x < -1 - 1e-12 || x > 1 + 1e-12) { throw new Fail('eAsin'); }
        x = Math.max(-1, Math.min(1, x));
        var a = fn === 'asin' ? Math.asin(x) : Math.acos(x);
        return S.mode === 'deg' ? a / DEG : a;
      case 'atan':
        return S.mode === 'deg' ? Math.atan(x) / DEG : Math.atan(x);
      case 'ln':
        if (x <= 0) { throw new Fail('eLog'); }
        return Math.log(x);
      case 'log':
        if (x <= 0) { throw new Fail('eLog'); }
        /* Math.log10(1000) is exact; log(x)/log(10) is not */
        return Math.log10(x);
      case 'sqrt':
        if (x < 0) { throw new Fail('eSqrt'); }
        return Math.sqrt(x);
      case 'cbrt': return Math.cbrt(x);
      case 'abs':  return Math.abs(x);
      case 'exp':  return Math.exp(x);
      case 'ten':  return Math.pow(10, x);
    }
    throw new Fail('eSyntax');
  }

  /* ------------------------------------------------------------- the parser
     Precedence, loosest first: + −, × ÷, implicit ×, nCr nPr, leading sign,
     ^ ˣ√ ᴇ (right-assoc), postfix, primary. See note 2 at the top.       */
  function evaluate(toks) {
    var p = 0;
    function peek() { return toks[p]; }
    function next() { return toks[p++]; }

    function addsub() {
      var v = muldiv();
      while (p < toks.length && kind(peek()) === 'add') {
        var op = next();
        var r = muldiv();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function muldiv() {
      var v = implicit();
      while (p < toks.length && kind(peek()) === 'mul') {
        var op = next();
        var r = implicit();
        if (op === '/') {
          if (r === 0) { throw new Fail('eDiv0'); }
          v = v / r;
        } else { v = v * r; }
      }
      return v;
    }
    function implicit() {
      var v = combo();
      while (p < toks.length && starts(peek())) { v = v * combo(); }
      return v;
    }
    function combo() {
      var v = unary();
      while (p < toks.length && kind(peek()) === 'comb') {
        var op = next();
        v = comb(v, unary(), op === 'P');
      }
      return v;
    }
    function unary() {
      if (p < toks.length && kind(peek()) === 'add') {
        var op = next();
        var v = unary();
        return op === '-' ? -v : v;
      }
      return pow();
    }
    function pow() {
      var v = postfix();
      if (p < toks.length && kind(peek()) === 'pow') {
        var op = next();
        var r = unary();      // right-assoc, and allows 2^−1 and 5ᴇ−3
        if (op === '^') { return power(v, r); }
        if (op === 'root') { return nroot(v, r); }
        return v * Math.pow(10, r);
      }
      return v;
    }
    function postfix() {
      var v = primary();
      while (p < toks.length && kind(peek()) === 'post') {
        var op = next();
        if (op === '!') { v = fact(v); }
        else if (op === '%') { v = v / 100; }
        else if (op === 'sq') { v = v * v; }
        else if (op === 'cube') { v = v * v * v; }
        else {
          if (v === 0) { throw new Fail('eDiv0'); }
          v = 1 / v;
        }
      }
      return v;
    }
    /* the body of a bracket or a function: a missing ")" at the very end
       is forgiven, anything else is not */
    function inner() {
      var v = addsub();
      if (p < toks.length) {
        if (peek() !== ')') { throw new Fail('eSyntax'); }
        p++;
      }
      return v;
    }
    function primary() {
      if (p >= toks.length) { throw new Fail('eSyntax'); }
      var id = next();
      var k = kind(id);
      if (k === 'num') {
        var s = id;
        while (p < toks.length && kind(peek()) === 'num') { s += next(); }
        if ((s.match(/\./g) || []).length > 1 || s === '.') { throw new Fail('eSyntax'); }
        return parseFloat(s.charAt(0) === '.' ? '0' + s : s);
      }
      if (k === 'const') {
        return id === 'pi' ? Math.PI : id === 'e' ? Math.E : S.ans;
      }
      if (k === 'open') { return inner(); }
      if (k === 'fn') { return apply(id, inner()); }
      if (k === 'close') { throw new Fail('eParen'); }
      throw new Fail('eSyntax');
    }

    if (!toks.length) { throw new Fail('eSyntax'); }
    var v = addsub();
    if (p < toks.length) { throw new Fail(peek() === ')' ? 'eParen' : 'eSyntax'); }
    if (isNaN(v)) { throw new Fail('eMath'); }
    if (!isFinite(v)) { throw new Fail('eBig'); }
    /* 0.1 + 0.2 is 0.30000000000000004 in binary; a calculator keeps
       fifteen digits and so should this */
    return v === 0 ? 0 : parseFloat(v.toPrecision(15));
  }

  function tryEval(toks) {
    try { return { v: evaluate(toks) }; }
    catch (e) {
      if (e instanceof Fail) { return { err: e.code }; }
      throw e;
    }
  }

  /* ------------------------------------------------------------- formatting
     Ten significant figures on screen, like the exam calculators. Between
     10⁻⁹ and 10¹² a plain number with thousands grouped; outside it,
     a × 10ⁿ. Khmer writes the decimal mark as a comma and groups with a dot,
     the same swap the unit converter makes.                               */
  function swapMarks(s) {
    if (lang() !== 'km') { return s; }
    return s.replace(/[.,]/g, function (c) { return c === '.' ? ',' : '.'; });
  }
  function sup(s) {
    return String(s).split('').map(function (c) { return SUP[c] || c; }).join('');
  }

  /* as HTML, for the big answer */
  function fmtHTML(x) {
    if (x === 0) { return kh('0'); }
    var a = Math.abs(x);
    if (a >= 1e12 || a < 1e-9) {
      var parts = x.toExponential(9).split('e');
      var m = parts[0].replace(/\.?0+$/, '');
      var ex = String(parseInt(parts[1], 10));
      return kh(swapMarks(m.replace(/-/g, '−'))) + '<span class="sc-x10">×10<sup>' +
        kh(ex.replace(/-/g, '−')) + '</sup></span>';
    }
    var s = Number(x.toPrecision(10)).toLocaleString('en-US', { maximumFractionDigits: 10 });
    return kh(swapMarks(s.replace(/-/g, '−')));
  }
  /* as plain text: what Copy puts on the clipboard, and what the history
     line shows. No grouping, a dot, and e-notation that pastes anywhere.  */
  function fmtPlain(x) {
    if (x === 0) { return '0'; }
    var a = Math.abs(x);
    if (a >= 1e12 || a < 1e-9) {
      var parts = x.toExponential(9).split('e');
      return parts[0].replace(/\.?0+$/, '') + 'e' + parseInt(parts[1], 10);
    }
    return String(Number(x.toPrecision(10)));
  }
  function fmtText(x) {
    var p = fmtPlain(x);
    if (p.indexOf('e') !== -1) {
      var parts = p.split('e');
      return kh(swapMarks(parts[0].replace(/-/g, '−'))) + '×10' + sup(parts[1]);
    }
    return kh(swapMarks(p.replace(/-/g, '−')));
  }

  function exprText(toks) {
    return toks.map(function (id) {
      var s = TOK[id].s;
      if (id === '.') { return lang() === 'km' ? ',' : '.'; }
      return kh(s);
    }).join('');
  }
  function exprHTML(toks) {
    return toks.map(function (id) {
      var s = id === '.' ? (lang() === 'km' ? ',' : '.') : kh(TOK[id].s);
      var k = kind(id);
      var cls = k === 'add' || k === 'mul' || k === 'comb' ? 'op'
              : k === 'fn' ? 'fn' : k === 'const' ? 'cn' : '';
      return cls ? '<span class="sc-t-' + cls + '">' + esc(s) + '</span>' : esc(s);
    }).join('');
  }

  /* a number back into tokens — for "use this answer" */
  function numToks(x) {
    var p = fmtPlain(x);
    var out = [];
    var neg = p.charAt(0) === '-';
    if (neg) { p = p.slice(1); }
    var parts = p.split('e');
    parts[0].split('').forEach(function (c) { out.push(c); });
    if (parts[1] !== undefined) {
      out.push('E');
      parts[1].split('').forEach(function (c) { out.push(c === '-' ? '-' : c); });
    }
    return neg ? ['(', '-'].concat(out, [')']) : out;
  }

  /* ---------------------------------------------------------------- the DOM */
  var el = {
    screen: document.getElementById('scScreen'),
    expr:   document.getElementById('scExpr'),
    out:    document.getElementById('scOut'),
    live:   document.getElementById('scLive'),
    mode:   document.getElementById('scModeFlag'),
    sec:    document.getElementById('scSecFlag'),
    keys:   document.getElementById('scKeys'),
    copy:   document.getElementById('scCopy'),
    copyTx: document.getElementById('scCopyText'),
    hist:   document.getElementById('scHist'),
    histEm: document.getElementById('scHistEmpty'),
    clear:  document.getElementById('scHistClear')
  };

  /* ---------------------------------------------------------------- drawing */
  function drawFlags() {
    el.mode.textContent = t(S.mode === 'deg' ? T.deg : T.rad);
    el.mode.title = t(S.mode === 'deg' ? T.degLong : T.radLong);
    el.sec.hidden = !S.second;
    root.classList.toggle('sc-2nd', S.second);
    var mk = el.keys.querySelector('[data-k="mode"]');
    if (mk) {
      mk.querySelector('.sc-main').textContent = S.mode === 'deg' ? 'DEG' : 'RAD';
      mk.setAttribute('aria-pressed', String(S.mode === 'rad'));
    }
    var sk = el.keys.querySelector('[data-k="2nd"]');
    if (sk) { sk.setAttribute('aria-pressed', String(S.second)); }
  }

  function draw() {
    drawFlags();
    el.expr.innerHTML = S.toks.length
      ? exprHTML(S.toks) + (S.done ? '<span class="sc-t-op">=</span>' : '') + '<span class="sc-caret" aria-hidden="true"></span>'
      : '<span class="sc-ph">' + esc(t(T.ready)) + '</span><span class="sc-caret" aria-hidden="true"></span>';
    el.expr.scrollLeft = el.expr.scrollWidth;

    el.screen.classList.remove('is-err', 'is-done');
    el.copy.hidden = true;

    if (S.err) {
      el.screen.classList.add('is-err');
      el.out.textContent = t(T[S.err]);
      return;
    }
    if (S.done && S.val !== null) {
      el.screen.classList.add('is-done');
      el.out.innerHTML = fmtHTML(S.val);
      el.copy.hidden = false;
      return;
    }
    /* the preview: what = would give, shown faintly as you type */
    if (S.toks.length) {
      var r = tryEval(S.toks);
      el.out.innerHTML = r.err ? '' : fmtHTML(r.v);
    } else {
      el.out.innerHTML = kh('0');
    }
  }

  function drawHist() {
    el.hist.innerHTML = '';
    el.histEm.hidden = S.hist.length > 0;
    el.clear.hidden = S.hist.length === 0;
    S.hist.forEach(function (h, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-h', String(i));
      b.setAttribute('aria-label', exprText(h.toks) + ' = ' + fmtText(h.val) + ' — ' + t(T.reuse));
      b.innerHTML = '<span class="ex">' + exprHTML(h.toks) + ' =</span><span class="vl">' + fmtHTML(h.val) + '</span>';
      li.appendChild(b);
      el.hist.appendChild(li);
    });
  }

  function announce(s) { el.live.textContent = s; }

  function writeHash() {
    var h = 'x=' + encodeURIComponent(S.toks.join(','));
    if (S.mode === 'rad') { h += '&a=rad'; }
    try { history.replaceState(null, '', '#' + h); } catch (e) { location.hash = h; }
  }

  function readHash() {
    var q = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) { q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); }
    });
    S.mode = q.a === 'rad' ? 'rad' : 'deg';
    if (q.x) {
      var ids = q.x.split(',').filter(function (id) { return TOK.hasOwnProperty(id) && id !== 'ans'; });
      if (ids.length && ids.length <= 200) {
        S.toks = ids;
        equals(true);
        return;
      }
    }
  }

  /* ---------------------------------------------------------------- actions */
  var MAX = 200;

  function push(id) {
    if (!TOK[id]) { return; }
    var k = kind(id);
    if (S.done || S.err) {
      /* after an answer: an operator carries on from it, anything else
         starts a fresh calculation */
      var carry = S.done && (k === 'add' || k === 'mul' || k === 'pow' || k === 'comb' || k === 'post');
      S.toks = carry ? ['ans'] : (S.err ? S.toks : []);
      S.done = false; S.err = null;
    } else if (!S.toks.length && (k === 'mul' || k === 'pow' || k === 'comb' || k === 'post') && S.hist.length) {
      S.toks = ['ans'];
    }
    if (S.toks.length >= MAX) { return; }
    S.toks.push(id);
    draw();
  }

  function back() {
    S.err = null;
    S.done = false;
    S.toks.pop();
    draw();
  }

  function clearAll() {
    S.toks = []; S.done = false; S.err = null; S.val = null;
    draw();
  }

  function equals(quiet) {
    if (!S.toks.length) { return; }
    if (S.done) { return; }
    var r = tryEval(S.toks);
    if (r.err) {
      S.err = r.err; S.done = false;
      draw();
      if (!quiet) { announce(t(T[r.err])); }
      return;
    }
    S.val = r.v; S.ans = r.v; S.done = true; S.err = null;
    S.hist.unshift({ toks: S.toks.slice(), val: r.v });
    if (S.hist.length > 30) { S.hist.length = 30; }
    draw(); drawHist(); writeHash();
    if (!quiet) { announce(exprText(S.toks) + ' = ' + fmtText(r.v)); }
  }

  /* the 2nd layer: each key names what it becomes */
  var SECOND = {
    sin: 'asin', cos: 'acos', tan: 'atan', ln: 'exp', log: 'ten',
    sqrt: 'cbrt', sq: 'cube', '^': 'root', inv: 'abs', C: 'P'
  };

  function press(k) {
    if (k === '2nd') { S.second = !S.second; drawFlags(); return; }
    if (k === 'mode') {
      S.mode = S.mode === 'deg' ? 'rad' : 'deg';
      S.second = false;
      if (S.done) { S.done = false; equalsAgain(); } else { draw(); }
      if (S.toks.length && !S.err) { writeHash(); }
      announce(t(S.mode === 'deg' ? T.degLong : T.radLong));
      return;
    }
    if (k === 'ac') { S.second = false; clearAll(); return; }
    if (k === 'del') { back(); return; }
    if (k === '=') { S.second = false; equals(false); return; }
    var id = (S.second && SECOND[k]) ? SECOND[k] : k;
    S.second = false;
    push(id);
  }

  /* switching DEG ⇄ RAD after an answer recomputes it in the new mode,
     without adding a second history line for the same sum */
  function equalsAgain() {
    var r = tryEval(S.toks);
    if (r.err) { S.err = r.err; S.done = false; draw(); return; }
    S.val = r.v; S.ans = r.v; S.done = true;
    draw();
  }

  /* ---------------------------------------------------------------- wiring */
  el.keys.addEventListener('mousedown', function (e) {
    /* keep the focus where it was, so the physical keyboard keeps working
       after a mouse click and Enter means = rather than "press that key again" */
    if (e.target.closest('button')) { e.preventDefault(); }
  });
  el.keys.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]');
    if (!b) { return; }
    press(b.getAttribute('data-k'));
  });

  el.hist.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-h]');
    if (!b) { return; }
    var h = S.hist[+b.getAttribute('data-h')];
    if (!h) { return; }
    if (S.done || S.err) { S.toks = []; S.done = false; S.err = null; }
    var add = numToks(h.val);
    if (S.toks.length + add.length > MAX) { return; }
    S.toks = S.toks.concat(add);
    draw();
  });

  el.clear.addEventListener('click', function () { S.hist = []; drawHist(); });

  el.copy.addEventListener('click', function () {
    if (S.val === null) { return; }
    var txt = fmtPlain(S.val);
    function done() {
      el.copyTx.textContent = t(T.copied);
      el.copy.classList.add('is-done');
      setTimeout(function () { el.copyTx.textContent = t(T.copy); el.copy.classList.remove('is-done'); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () {});
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (err) {}
    ta.remove();
  });

  /* The physical keyboard. Letters reach the functions a keyboard has no
     key for; the shortcut list on the page matches this table. */
  var KEYMAP = {
    '+': '+', '-': '-', '*': '*', 'x': '*', 'X': '*', '/': '/', ':': '/',
    '^': '^', '(': '(', ')': ')', '!': '!', '%': '%', '.': '.', ',': '.',
    'p': 'pi', 'e': 'e', 'a': 'ans',
    's': 'sin', 'c': 'cos', 't': 'tan', 'l': 'ln', 'g': 'log', 'r': 'sqrt',
    'E': 'E'
  };
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    var tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable)) { return; }
    /* a key on the pad that has keyboard focus is activated by Enter */
    if ((e.key === 'Enter' || e.key === ' ') && tg && tg.closest && tg.closest('button, a')) { return; }
    var k = e.key;
    var act = null;
    if (/^[0-9]$/.test(k)) { act = k; }
    else if (k === '٫') { act = '.'; }
    else if (KHDIGIT.indexOf(k) !== -1) { act = String(KHDIGIT.indexOf(k)); }
    else if (k === 'Enter' || k === '=') { act = '='; }
    else if (k === 'Backspace') { act = 'del'; }
    else if (k === 'Escape' || k === 'Delete') { act = 'ac'; }
    else if (KEYMAP.hasOwnProperty(k)) { act = KEYMAP[k]; }
    if (act === null) { return; }
    e.preventDefault();
    if (act === '=' || act === 'del' || act === 'ac') { press(act); }
    else { S.second = false; push(act); }
    flash(act);
  });

  /* show which on-screen key the keyboard just pressed */
  function flash(act) {
    var b = el.keys.querySelector('[data-k="' + (act === 'ans' ? 'ans' : act) + '"]');
    if (!b) { return; }
    b.classList.add('is-hit');
    setTimeout(function () { b.classList.remove('is-hit'); }, 140);
  }

  document.addEventListener('aa:langchange', function () {
    el.copyTx.textContent = t(T.copy);
    el.histEm.textContent = t(T.empty);
    draw(); drawHist();
  });

  /* ------------------------------------------------------------------- go */
  el.copyTx.textContent = t(T.copy);
  el.histEm.textContent = t(T.empty);
  readHash();
  draw(); drawHist();

  /* for the test harness: the parser without the page */
  window.AASciCalc = {
    evaluate: function (toks, mode) {
      var m = S.mode; S.mode = mode || 'deg';
      try { return tryEval(toks); } finally { S.mode = m; }
    }
  };
})();
