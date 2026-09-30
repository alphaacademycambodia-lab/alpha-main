/* Alpha Academy Cambodia — Unit Converter
   ---------------------------------------------------------------------------
   Length, weight and temperature. No dependencies, no network, nothing
   stored — the same three rules every tool on this tab keeps.

   FOUR THINGS DECIDE HOW THIS IS BUILT.

   1. BOTH SIDES ARE INPUTS. Type in either box and the other one follows.
      A converter that only works left-to-right makes the reader swap units
      to go the other way, which is a tap wasted and a chance to get lost.
      The answer is live, as on the date calculator — there is no button.

   2. EVERY UNIT IS DEFINED BY ONE EXACT NUMBER. Length is held in metres and
      weight in kilograms, and each unit carries its size in that base as the
      legal definition, not a rounded one: an inch is exactly 0.0254 m, a
      pound exactly 0.45359237 kg. Rounding happens once, on display, so a
      round trip (m → ft → m) comes back to what was typed.

   3. TEMPERATURE IS NOT A RATIO. 0 °C is not "no temperature", so it cannot
      be a factor like the others. Each temperature unit carries a pair of
      functions to and from Celsius instead, and the page refuses to pretend
      a value below absolute zero is fine.

   4. THE CAMBODIAN GOLD WEIGHTS ARE HERE ON PURPOSE. ជី and តម្លឹង are what
      gold is weighed and priced in at every market in the country, and no
      general-purpose converter carries them. 1 តម្លឹង = 10 ជី = 37.5 g.

   The state lives in the address bar (#c=length&v=5&f=km&t=mi), so a
   conversion can be bookmarked or sent to someone without storing a byte.  */
(function () {
  'use strict';

  var root = document.getElementById('ucRoot');
  if (!root) { return; }

  /* ------------------------------------------------------------- language */
  function lang() { return (window.AAi18n && window.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(o) { return (lang() === 'km' && o && o.km) ? o.km : (o ? o.en : ''); }

  var KHDIGIT = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  function kh(s) {
    s = String(s);
    if (lang() !== 'km') { return s; }
    return s.replace(/[0-9]/g, function (d) { return KHDIGIT[+d]; });
  }

  /* ---------------------------------------------------------------- units */
  function lin(f) {
    return { to: function (v) { return v * f; }, from: function (v) { return v / f; } };
  }

  var CATS = {
    length: {
      name: { en: 'Length', km: 'ប្រវែង' },
      def: ['m', 'ft'],
      units: [
        { id: 'mm', sym: 'mm', n: { en: 'Millimetre', km: 'មីលីម៉ែត្រ' }, c: lin(0.001) },
        { id: 'cm', sym: 'cm', n: { en: 'Centimetre', km: 'សង់ទីម៉ែត្រ' }, c: lin(0.01) },
        { id: 'm',  sym: 'm',  n: { en: 'Metre',      km: 'ម៉ែត្រ' },      c: lin(1) },
        { id: 'km', sym: 'km', n: { en: 'Kilometre',  km: 'គីឡូម៉ែត្រ' },  c: lin(1000) },
        { id: 'in', sym: 'in', n: { en: 'Inch',       km: 'អ៊ីញ' },        c: lin(0.0254) },
        { id: 'ft', sym: 'ft', n: { en: 'Foot',       km: 'ហ្វីត' },       c: lin(0.3048) },
        { id: 'yd', sym: 'yd', n: { en: 'Yard',       km: 'យ៉ាត' },        c: lin(0.9144) },
        { id: 'mi', sym: 'mi', n: { en: 'Mile',       km: 'ម៉ាយ' },        c: lin(1609.344) },
        { id: 'nmi', sym: 'nmi', n: { en: 'Nautical mile', km: 'ម៉ាយសមុទ្រ' }, c: lin(1852) }
      ],
      presets: [['1', 'in', 'cm'], ['1', 'm', 'ft'], ['5', 'km', 'mi'], ['170', 'cm', 'ft'], ['100', 'm', 'yd']],
    },
    weight: {
      name: { en: 'Weight', km: 'ទម្ងន់' },
      def: ['kg', 'lb'],
      units: [
        { id: 'mg', sym: 'mg', n: { en: 'Milligram', km: 'មីលីក្រាម' }, c: lin(1e-6) },
        { id: 'g',  sym: 'g',  n: { en: 'Gram',      km: 'ក្រាម' },     c: lin(0.001) },
        { id: 'kg', sym: 'kg', n: { en: 'Kilogram',  km: 'គីឡូក្រាម' }, c: lin(1) },
        { id: 't',  sym: 't',  n: { en: 'Tonne',     km: 'តោន' },       c: lin(1000) },
        { id: 'oz', sym: 'oz', n: { en: 'Ounce',     km: 'អោន' },       c: lin(0.45359237 / 16) },
        { id: 'lb', sym: 'lb', n: { en: 'Pound',     km: 'ផោន' },       c: lin(0.45359237) },
        { id: 'st', sym: 'st', n: { en: 'Stone',     km: 'ស្តូន' },     c: lin(0.45359237 * 14) },
        { id: 'chi', sym: { en: 'chi', km: 'ជី' }, n: { en: 'Chi (gold)', km: 'ជី (មាស)' }, c: lin(0.00375) },
        { id: 'dl',  sym: { en: 'damlung', km: 'តម្លឹង' }, n: { en: 'Damlung (gold)', km: 'តម្លឹង (មាស)' }, c: lin(0.0375) }
      ],
      presets: [['1', 'kg', 'lb'], ['50', 'kg', 'lb'], ['1', 'dl', 'g'], ['5', 'chi', 'g'], ['16', 'oz', 'g']],
    },
    temp: {
      name: { en: 'Temperature', km: 'សីតុណ្ហភាព' },
      def: ['c', 'f'],
      units: [
        { id: 'c', sym: '°C', n: { en: 'Celsius',    km: 'អង្សាសេ' },
          c: { to: function (v) { return v; }, from: function (v) { return v; } } },
        { id: 'f', sym: '°F', n: { en: 'Fahrenheit', km: 'ហ្វារិនហៃ' },
          c: { to: function (v) { return (v - 32) * 5 / 9; }, from: function (v) { return v * 9 / 5 + 32; } } },
        { id: 'k', sym: 'K',  n: { en: 'Kelvin',     km: 'កែលវិន' },
          c: { to: function (v) { return v - 273.15; }, from: function (v) { return v + 273.15; } } }
      ],
      presets: [['37', 'c', 'f'], ['100', 'c', 'f'], ['0', 'c', 'f'], ['98.6', 'f', 'c'], ['35', 'c', 'k']],
    }
  };

  var FORMULA = {
    'c>f': '°F = °C × 9/5 + 32', 'f>c': '°C = (°F − 32) × 5/9',
    'c>k': 'K = °C + 273.15',    'k>c': '°C = K − 273.15',
    'f>k': 'K = (°F − 32) × 5/9 + 273.15', 'k>f': '°F = (K − 273.15) × 9/5 + 32'
  };

  var T = {
    empty:  { en: 'Type a number to convert.', km: 'សូមវាយលេខដើម្បីបំប្លែង។' },
    bad:    { en: 'That is not a number.',     km: 'នោះមិនមែនជាលេខទេ។' },
    same:   { en: 'Both sides are the same unit.', km: 'ខាងទាំងពីរជាខ្នាតដូចគ្នា។' },
    cold:   { en: 'That is colder than absolute zero (−273.15 °C), which is not physically possible.',
              km: 'នោះត្រជាក់ជាងសូន្យដាច់ខាត (−២៧៣,១៥ °C) ដែលមិនអាចកើតមានតាមរូបវិទ្យាទេ។' },
    neg:    { en: 'A length or a weight cannot be negative, so the minus sign is ignored here.',
              km: 'ប្រវែង ឬទម្ងន់ មិនអាចអវិជ្ជមានបានទេ ដូច្នេះសញ្ញាដកត្រូវបានមិនអើពើ។' },
    rule:   { en: 'Rule', km: 'រូបមន្ត' },
    one:    { en: '1 {a} = {b}', km: '១ {a} = {b}' },
    copy:   { en: 'Copy', km: 'ចម្លង' },
    copied: { en: 'Copied', km: 'ចម្លងរួច' },
    pick:   { en: 'Tap a row to convert to that unit', km: 'ចុចលើជួរមួយ ដើម្បីបំប្លែងទៅខ្នាតនោះ' },
    gold:   { en: 'Gold weights used in Cambodia: 1 damlung = 10 chi = 37.5 g.',
              km: 'ខ្នាតទម្ងន់មាសប្រើនៅកម្ពុជា៖ ១ តម្លឹង = ១០ ជី = ៣៧,៥ ក្រាម។' }
  };

  /* ------------------------------------------------------------- elements */
  function $(id) { return document.getElementById(id); }
  var el = {
    cats: $('ucCats'), a: $('ucA'), b: $('ucB'), ua: $('ucUa'), ub: $('ucUb'),
    swap: $('ucSwap'), quick: $('ucQuick'), big: $('ucBig'), alt: $('ucAlt'),
    note: $('ucNote'), noteText: $('ucNoteText'), copy: $('ucCopy'), copyText: $('ucCopyText'),
    list: $('ucList'), listHint: $('ucListHint'), result: $('ucResult'), reset: $('ucReset')
  };

  var S = { cat: 'length', f: 'm', to: 'ft', v: '1', side: 'a' };

  function cat() { return CATS[S.cat]; }
  function unit(id) {
    var u = cat().units;
    for (var i = 0; i < u.length; i++) { if (u[i].id === id) { return u[i]; } }
    return u[0];
  }
  function sym(u) { return typeof u.sym === 'string' ? u.sym : t(u.sym); }

  /* --------------------------------------------------------------- numbers */
  /* Accept Khmer digits, a comma as decimal mark when there is no dot, and
     thousands separators when there is one. Returns NaN for anything else. */
  function parse(s) {
    s = String(s || '').trim()
      .replace(/[០-៩]/g, function (d) { return String(KHDIGIT.indexOf(d)); })
      .replace(/[−–]/g, '-').replace(/\s/g, '');
    if (s === '') { return null; }
    if (s.indexOf('.') === -1 && /^-?\d+,\d+$/.test(s) &&
        (lang() === 'km' || !/^-?\d{1,3}(,\d{3})+$/.test(s))) {
      s = s.replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
    if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) { return NaN; }
    return parseFloat(s);
  }

  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

  /* Ten significant figures, trailing zeros dropped. Very large and very
     small values go to scientific notation, written the way a textbook does. */
  function fmt(n, group, plain) {
    if (!isFinite(n)) { return '—'; }
    if (Math.abs(n) < 1e-12) { n = 0; }
    var a = Math.abs(n);
    var out;
    if (n !== 0 && (a >= 1e15 || a < 1e-6)) {
      var p = n.toExponential(6).split('e');
      var m = String(parseFloat(p[0]));
      var e = String(parseInt(p[1], 10)).replace(/./g, function (c) { return SUP[c]; });
      out = m + ' × 10' + e;
    } else {
      var r = parseFloat(n.toPrecision(7));
      out = group
        ? r.toLocaleString('en-US', { maximumFractionDigits: 10 })
        : String(r);
    }
    out = out.replace(/-/g, '−');
    if (lang() === 'km' && !plain) {
      /* Khmer writes the decimal mark as a comma and groups with a dot. */
      out = out.replace(/[.,]/g, function (c) { return c === '.' ? ',' : '.'; });
    }
    return kh(out);
  }
  /* The value put back into an input: no grouping, a dot for the decimal
     and a plain minus, so it parses again unchanged if the reader edits it. */
  function fmtInput(n) { return fmt(n, false, true).replace(/−/g, '-'); }

  function convert(v, fromId, toId) {
    return unit(toId).c.from(unit(fromId).c.to(v));
  }

  /* -------------------------------------------------------------- drawing */
  function fillSelect(sel, chosen) {
    sel.innerHTML = '';
    cat().units.forEach(function (u) {
      var o = document.createElement('option');
      o.value = u.id;
      o.textContent = t(u.n) + ' (' + sym(u) + ')';
      if (u.id === chosen) { o.selected = true; }
      sel.appendChild(o);
    });
  }

  function drawCats() {
    Array.prototype.forEach.call(el.cats.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-cat') === S.cat ? 'true' : 'false');
    });
  }

  function drawQuick() {
    el.quick.innerHTML = '';
    cat().presets.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-p', p.join('|'));
      b.textContent = kh(p[0]) + ' ' + sym(unit(p[1])) + ' → ' + sym(unit(p[2]));
      el.quick.appendChild(b);
    });
  }

  function setNote(text) {
    el.noteText.textContent = text || '';
    el.note.classList.toggle('is-on', !!text);
  }

  /* The source value is whichever box the reader last typed in. */
  function draw(fromInput) {
    var srcA = S.side === 'a';
    var src = srcA ? el.a : el.b;
    var dst = srcA ? el.b : el.a;
    var fromId = srcA ? S.f : S.to;
    var toId = srcA ? S.to : S.f;

    var v = parse(fromInput ? src.value : S.v);
    if (!fromInput) { src.value = (v === null || isNaN(v)) ? S.v : fmtInput(v); }

    var note = '';
    el.result.classList.remove('uc-bad');

    if (v === null || isNaN(v)) {
      dst.value = '';
      el.big.textContent = t(v === null ? T.empty : T.bad);
      el.alt.textContent = '';
      el.list.innerHTML = '';
      el.result.classList.add('uc-bad');
      setNote(S.cat === 'weight' ? t(T.gold) : '');
      writeHash('');
      return;
    }

    if (S.cat !== 'temp' && v < 0) { note = t(T.neg); v = Math.abs(v); }
    if (S.cat === 'temp' && unit(fromId).c.to(v) < -273.15 - 1e-9) { note = t(T.cold); }

    var r = convert(v, fromId, toId);
    dst.value = fmtInput(r);

    var fa = unit(S.f), tb = unit(S.to);
    var va = srcA ? v : r, vb = srcA ? r : v;
    el.big.textContent = fmt(va, true) + ' ' + sym(fa) + ' = ' + fmt(vb, true) + ' ' + sym(tb);

    if (S.cat === 'temp') {
      var k = S.f + '>' + S.to;
      el.alt.textContent = FORMULA[k] ? t(T.rule) + ': ' + FORMULA[k] : t(T.same);
    } else if (S.f === S.to) {
      el.alt.textContent = t(T.same);
    } else if (va === 1) {
      el.alt.textContent = '';   /* the headline already says "1 x = …" */
    } else {
      el.alt.textContent = t(T.one).replace('{a}', sym(fa)).replace('{b}', fmt(convert(1, S.f, S.to), true) + ' ' + sym(tb));
    }

    if (!note && S.cat === 'weight' && (S.f === 'chi' || S.f === 'dl' || S.to === 'chi' || S.to === 'dl')) {
      note = t(T.gold);
    }
    setNote(note);

    /* the same value in every unit of the category */
    el.list.innerHTML = '';
    cat().units.forEach(function (u) {
      if (u.id === S.f) { return; }
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-u', u.id);
      if (u.id === S.to) { b.className = 'is-on'; b.setAttribute('aria-current', 'true'); }
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = t(u.n);
      var vl = document.createElement('span'); vl.className = 'vl';
      vl.textContent = fmt(convert(va, S.f, u.id), true) + ' ' + sym(u);
      b.appendChild(nm); b.appendChild(vl);
      li.appendChild(b);
      el.list.appendChild(li);
    });
    el.listHint.textContent = t(T.pick);

    S.v = String(va);
    writeHash(String(va));
  }

  function full() {
    drawCats();
    fillSelect(el.ua, S.f);
    fillSelect(el.ub, S.to);
    drawQuick();
    el.copyText.textContent = t(T.copy);
    el.copy.classList.remove('is-done');
    S.side = 'a';
    draw(false);
  }

  /* ----------------------------------------------------------- the address */
  function writeHash(v) {
    var h = '#c=' + S.cat + '&v=' + encodeURIComponent(v) + '&f=' + S.f + '&t=' + S.to;
    if (location.hash !== h && history.replaceState) {
      try { history.replaceState(null, '', h); } catch (e) {}
    }
  }

  function readHash() {
    var q = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p[0]) { q[p[0]] = decodeURIComponent(p[1] || ''); }
    });
    if (q.c && CATS[q.c]) {
      S.cat = q.c;
      var ids = CATS[q.c].units.map(function (u) { return u.id; });
      S.f = ids.indexOf(q.f) > -1 ? q.f : CATS[q.c].def[0];
      S.to = ids.indexOf(q.t) > -1 ? q.t : CATS[q.c].def[1];
      var n = parse(q.v);
      S.v = (n === null || isNaN(n)) ? '1' : String(n);
    }
  }

  function setCat(c) {
    if (!CATS[c]) { return; }
    S.cat = c; S.f = CATS[c].def[0]; S.to = CATS[c].def[1];
    S.v = c === 'temp' ? '37' : '1';
    full();
  }

  /* --------------------------------------------------------------- events */
  el.cats.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-cat]');
    if (b && b.getAttribute('data-cat') !== S.cat) { setCat(b.getAttribute('data-cat')); }
  });

  el.a.addEventListener('input', function () { S.side = 'a'; draw(true); });
  el.b.addEventListener('input', function () { S.side = 'b'; draw(true); });

  el.ua.addEventListener('change', function () { S.f = el.ua.value; draw(true); });
  el.ub.addEventListener('change', function () { S.to = el.ub.value; draw(true); });

  el.swap.addEventListener('click', function () {
    var v = parse(el.a.value);
    var x = S.f; S.f = S.to; S.to = x;
    fillSelect(el.ua, S.f); fillSelect(el.ub, S.to);
    S.side = 'a';
    S.v = (v === null || isNaN(v)) ? S.v : String(v);
    draw(false);
    el.a.focus();
  });

  el.quick.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-p]');
    if (!b) { return; }
    var p = b.getAttribute('data-p').split('|');
    S.v = p[0]; S.f = p[1]; S.to = p[2];
    fillSelect(el.ua, S.f); fillSelect(el.ub, S.to);
    S.side = 'a';
    draw(false);
  });

  el.list.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-u]');
    if (!b) { return; }
    S.to = b.getAttribute('data-u');
    fillSelect(el.ub, S.to);
    S.side = 'a';
    draw(false);
  });

  el.reset.addEventListener('click', function () { setCat(S.cat); el.a.focus(); });

  el.copy.addEventListener('click', function () {
    var txt = el.big.textContent;
    function done() {
      el.copyText.textContent = t(T.copied);
      el.copy.classList.add('is-done');
      setTimeout(function () { el.copyText.textContent = t(T.copy); el.copy.classList.remove('is-done'); }, 1600);
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

  /* Unit names, numerals and the decimal mark all change with the language. */
  document.addEventListener('aa:langchange', function () {
    var v = parse(el.a.value);
    if (v !== null && !isNaN(v)) { S.v = String(v); }
    full();
  });

  window.addEventListener('hashchange', function () {
    var before = S.cat + S.f + S.to + S.v;
    readHash();
    if (S.cat + S.f + S.to + S.v !== before) { full(); }
  });

  /* ------------------------------------------------------------------- go */
  readHash();
  full();
})();
