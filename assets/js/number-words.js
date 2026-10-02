/* Alpha Academy Cambodia — Number to Khmer Words
   ---------------------------------------------------------------------------
   Type a number and get it written out in Khmer words, in Khmer numerals and
   in English words — with a riel or dollar ending for receipts, invoices and
   cheques. Uses tools-core.js; nothing is sent or stored.

   FOUR THINGS DECIDE HOW THIS IS BUILT.

   1. TWO WAYS TO SAY TEN THOUSAND, AND BOTH ARE RIGHT. Khmer has its own
      words for 10,000 (ម៉ឺន) and 100,000 (សែន), and that is how the market,
      the bank and older relatives say a price: 250,000 is ពីរសែនប្រាំម៉ឺន.
      Schools and younger speakers often count in thousands instead:
      ពីររយហាសិបពាន់. The page offers both, traditional first, rather than
      deciding for the reader. Above a million both say លាន,
      and the count of millions is said in thousands: ម្ភៃប្រាំពាន់លាន.

   2. KHMER IS WRITTEN WITHOUT SPACES between the parts of a number, so
      ១២៥ is មួយរយម្ភៃប្រាំ, one word. The page keeps it that way; an
      invoice that splits it reads as foreign.

   3. THE DECIMAL MARK IS A COMMA IN KHMER and is read ក្បៀស, with the digits
      after it read one by one: ៣,២៥ = បីក្បៀសពីរប្រាំ. Money is different —
      $12.50 is ដប់ពីរដុល្លារ ហាសិបសេន, the cents read as a number.

   4. NUMERALS USE KHMER GROUPING: ១.២៥០.០០០ with a dot between thousands,
      the same convention every other tool on this tab follows.

   Range: up to 999,999,999,999 (ប្រាំបួនរយកៅសិបប្រាំបួនពាន់…លាន) and six
   decimal places. State lives in the address bar: #n=250000&s=trad&c=riel */
(function () {
  'use strict';

  var A = window.AATool;

  /* ========================================================= the Khmer */
  var ONES = ['សូន្យ', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
  var TENS = ['', 'ដប់', 'ម្ភៃ', 'សាមសិប', 'សែសិប', 'ហាសិប', 'ហុកសិប', 'ចិតសិប', 'ប៉ែតសិប', 'កៅសិប'];

  /* 0–999, empty for 0 */
  function km999(n) {
    var h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10, s = '';
    if (h) { s += ONES[h] + 'រយ'; }
    if (t) { s += TENS[t]; }
    if (o) { s += ONES[o]; }
    return s;
  }
  /* 0–999,999, empty for 0 */
  function kmBelowMillion(n, trad) {
    if (!trad) {
      var th = Math.floor(n / 1000), r = n % 1000;
      return (th ? km999(th) + 'ពាន់' : '') + km999(r);
    }
    var saen = Math.floor(n / 100000), mern = Math.floor((n % 100000) / 10000),
        poan = Math.floor((n % 10000) / 1000), rest = n % 1000, s = '';
    if (saen) { s += ONES[saen] + 'សែន'; }
    if (mern) { s += ONES[mern] + 'ម៉ឺន'; }
    if (poan) { s += ONES[poan] + 'ពាន់'; }
    return s + km999(rest);
  }
  /* any whole number below 10¹² */
  function kmInt(n, trad) {
    if (n === 0) { return ONES[0]; }
    var lan = Math.floor(n / 1e6), r = n % 1e6, s = '';
    /* the count of millions is said in hundreds and thousands either way:
       25,000,000,000 is ម្ភៃប្រាំពាន់លាន, not ពីរម៉ឺនប្រាំពាន់លាន */
    if (lan) { s += kmBelowMillion(lan, false) + 'លាន'; }
    return s + kmBelowMillion(r, trad);
  }

  /* ======================================================= the English */
  var EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
             'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function en999(n) {
    var h = Math.floor(n / 100), r = n % 100, s = [];
    if (h) { s.push(EN1[h] + ' hundred'); }
    if (r) {
      var w = r < 20 ? EN1[r] : EN10[Math.floor(r / 10)] + (r % 10 ? '-' + EN1[r % 10] : '');
      s.push(h ? 'and ' + w : w);
    }
    return s.join(' ');
  }
  function enInt(n) {
    if (n === 0) { return 'zero'; }
    var parts = [], names = ['', ' thousand', ' million', ' billion'], i = 0;
    while (n > 0) {
      var c = n % 1000;
      if (c) { parts.unshift(en999(c) + names[i]); }
      n = Math.floor(n / 1000); i++;
    }
    /* "one thousand and five" — the British "and" before a last chunk under 100 */
    if (parts.length > 1 && !/hundred/.test(parts[parts.length - 1]) && !/^and /.test(parts[parts.length - 1])) {
      parts[parts.length - 1] = 'and ' + parts[parts.length - 1];
    }
    return parts.join(' ').replace(/ and and /g, ' and ');
  }

  /* ============================================================= reading */
  /* "1,250,000.75" → { neg, int: 1250000, frac: '75' } — as strings so that
     the decimals keep their leading zeros (0.05 is not 0.5). */
  function read(s) {
    s = A.unKh(String(s || '')).trim().replace(/[−–]/g, '-').replace(/[\s_']/g, '');
    if (s === '') { return null; }
    var neg = false;
    if (s.charAt(0) === '-') { neg = true; s = s.slice(1); }
    var intPart, frac = '';
    /* one comma followed by not-exactly-three digits is a decimal comma */
    if (s.indexOf('.') === -1 && /^\d+,\d+$/.test(s) && !/^\d{1,3}(,\d{3})+$/.test(s)) { s = s.replace(',', '.'); }
    /* Khmer grouping: 1.250.000 or 1.250.000,75 */
    else if (/^\d{1,3}(\.\d{3}){2,}(,\d+)?$/.test(s) || /^\d{1,3}(\.\d{3})+,\d+$/.test(s)) {
      s = s.replace(/\./g, '').replace(',', '.');
    }
    s = s.replace(/,/g, '');
    var m = /^(\d*)(?:\.(\d*))?$/.exec(s);
    if (!m || (m[1] === '' && !m[2])) { return false; }
    intPart = (m[1] || '0').replace(/^0+(?=\d)/, '');
    frac = (m[2] || '').replace(/0+$/, '');
    if (intPart.length > 12) { return 'big'; }
    if (frac.length > 6) { frac = frac.slice(0, 6); }
    return { neg: neg, int: parseInt(intPart, 10), intStr: intPart, frac: frac };
  }

  function khmerWords(v, trad, cur) {
    var neg = v.neg && (v.int || v.frac) ? 'ដក' : '';
    if (cur === 'riel') {
      return neg + kmInt(v.int, trad) + 'រៀល';
    }
    if (cur === 'usd') {
      var cents = v.frac ? parseInt((v.frac + '00').slice(0, 2), 10) : 0;
      var out = neg + (v.int || !cents ? kmInt(v.int, trad) + 'ដុល្លារ' : '');
      if (cents) { out += (out ? ' ' : neg) + kmInt(cents, trad) + 'សេន'; }
      return out;
    }
    var s = neg + kmInt(v.int, trad);
    if (v.frac) {
      s += 'ក្បៀស' + v.frac.split('').map(function (d) { return ONES[+d]; }).join('');
    }
    return s;
  }
  function englishWords(v, cur) {
    var neg = v.neg && (v.int || v.frac) ? 'minus ' : '';
    if (cur === 'riel') { return neg + enInt(v.int) + (v.int === 1 ? ' riel' : ' riels'); }
    if (cur === 'usd') {
      var cents = v.frac ? parseInt((v.frac + '00').slice(0, 2), 10) : 0;
      var s = neg;
      if (v.int || !cents) { s += enInt(v.int) + (v.int === 1 ? ' dollar' : ' dollars'); }
      if (cents) { s += (v.int ? ' and ' : '') + enInt(cents) + (cents === 1 ? ' cent' : ' cents'); }
      return s;
    }
    var out = neg + enInt(v.int);
    if (v.frac) { out += ' point ' + v.frac.split('').map(function (d) { return EN1[+d]; }).join(' '); }
    return out;
  }
  function numerals(v, cur) {
    var g = v.intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    var frac = v.frac;
    if (cur === 'usd') { frac = (v.frac + '00').slice(0, 2); if (frac === '00') { frac = ''; } }
    if (cur === 'riel') { frac = ''; }
    var s = (v.neg && (v.int || v.frac) ? '−' : '') + g + (frac ? ',' + frac : '');
    return A.khDigits(s) + (cur === 'riel' ? ' ៛' : cur === 'usd' ? ' $' : '');
  }
  function western(v, cur) {
    var g = v.intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var frac = cur === 'riel' ? '' : cur === 'usd' ? (v.frac + '00').slice(0, 2) : v.frac;
    if (cur === 'usd' && frac === '00') { frac = '00'; }
    var s = (v.neg && (v.int || v.frac) ? '−' : '') + (cur === 'usd' ? '$' : '') + g + (frac ? '.' + frac : '') + (cur === 'riel' ? ' ៛' : '');
    return s;
  }

  window.AANumWords = { kmInt: kmInt, khmerWords: khmerWords, englishWords: englishWords, read: read, enInt: enInt };

  var root = document.getElementById('nwRoot');
  if (!root) { return; }

  /* ================================================================ page */
  var T = {
    empty: { en: 'Type a number.', km: 'សូមវាយលេខ។' },
    bad:   { en: 'That is not a number. Digits, one decimal point and thousands commas are fine.',
             km: 'នោះមិនមែនជាលេខទេ។ ប្រើលេខ ចំណុចទសភាគមួយ និងក្បៀសខ្ទង់ពាន់បាន។' },
    big:   { en: 'That is more than 999,999,999,999 — beyond what this writes out.', km: 'លើសពី ៩៩៩.៩៩៩.៩៩៩.៩៩៩ — ហួសពីអ្វីដែលឧបករណ៍នេះសរសេរបាន។' },
    rielDec: { en: 'Riel has no coins below one riel, so the decimals are left off.', km: 'ប្រាក់រៀលគ្មានខ្ទង់ក្រោមមួយរៀលទេ ដូច្នេះខ្ទង់ទសភាគត្រូវបានលុបចោល។' },
    usdDec:  { en: 'Dollars are written to the cent, so only two decimal places are used.', km: 'ប្រាក់ដុល្លារសរសេរត្រឹមសេន ដូច្នេះប្រើតែខ្ទង់ទសភាគពីរប៉ុណ្ណោះ។' },
    khW: { en: 'Khmer words', km: 'ជាអក្សរខ្មែរ' },
    khN: { en: 'Khmer numerals', km: 'ជាលេខខ្មែរ' },
    enW: { en: 'English words', km: 'ជាពាក្យអង់គ្លេស' },
    wN:  { en: 'Western numerals', km: 'ជាលេខអារ៉ាប់' },
    other: { en: 'Said the other way', km: 'និយាយបែបមួយទៀត' }
  };

  function $(id) { return document.getElementById(id); }
  var el = {
    inp: $('nwIn'), style: $('nwStyle'), cur: $('nwCur'), quick: $('nwQuick'),
    big: $('nwBig'), alt: $('nwAlt'), rows: $('nwRows'), note: $('nwNote'), noteText: $('nwNoteText'),
    result: $('nwResult'), copy: $('nwCopy'), table: $('nwTable')
  };
  var S = { n: '250000', s: 'trad', c: 'none' };

  function seg(group, attr, val) {
    Array.prototype.forEach.call(group.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute(attr) === val ? 'true' : 'false');
    });
  }

  function paint() {
    seg(el.style, 'data-s', S.s);
    seg(el.cur, 'data-c', S.c);
    el.note.classList.remove('is-on');
    var v = read(S.n);
    if (v === null || v === false || v === 'big') {
      el.result.classList.add('dc-bad');
      el.big.textContent = A.t(v === null ? T.empty : v === 'big' ? T.big : T.bad);
      el.alt.textContent = ''; el.rows.innerHTML = '';
      A.writeHash({ s: S.s, c: S.c === 'none' ? '' : S.c });
      return;
    }
    el.result.classList.remove('dc-bad');
    var trad = S.s === 'trad';
    var kw = khmerWords(v, trad, S.c);
    el.big.textContent = kw;
    var other = khmerWords(v, !trad, S.c);
    el.alt.textContent = other !== kw ? A.t(T.other) + ': ' + other : '';
    var rows = [
      [T.khN, numerals(v, S.c)],
      [T.wN, western(v, S.c)],
      [T.enW, englishWords(v, S.c)]
    ];
    el.rows.innerHTML = rows.map(function (r) {
      return '<li><span class="nm">' + A.esc(A.t(r[0])) + '</span><span class="vl">' + A.esc(r[1]) + '</span></li>';
    }).join('');
    if (S.c === 'riel' && v.frac) { el.noteText.textContent = A.t(T.rielDec); el.note.classList.add('is-on'); }
    if (S.c === 'usd' && v.frac.length > 2) { el.noteText.textContent = A.t(T.usdDec); el.note.classList.add('is-on'); }
    A.writeHash({ n: S.n, s: S.s, c: S.c === 'none' ? '' : S.c });
  }

  /* the reference table of place names */
  function drawTable() {
    var R = [[10, 'ដប់', 'ten'], [100, 'មួយរយ', 'one hundred'], [1000, 'មួយពាន់', 'one thousand'],
             [10000, 'មួយម៉ឺន', 'ten thousand'], [100000, 'មួយសែន', 'one hundred thousand'],
             [1000000, 'មួយលាន', 'one million'], [1000000000, 'មួយពាន់លាន', 'one billion']];
    el.table.innerHTML = R.map(function (r) {
      return '<tr><td class="n">' + A.khDigits(String(r[0]).replace(/\B(?=(\d{3})+(?!\d))/g, '.')) + '</td><td class="k">' + r[1] +
        '</td><td class="e">' + r[2] + '</td></tr>';
    }).join('');
  }

  el.inp.addEventListener('input', function () { S.n = el.inp.value; paint(); });
  el.style.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-s]'); if (b) { S.s = b.getAttribute('data-s'); paint(); }
  });
  el.cur.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-c]'); if (b) { S.c = b.getAttribute('data-c'); paint(); }
  });
  el.quick.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-n]');
    if (!b) { return; }
    S.n = b.getAttribute('data-n');
    if (b.getAttribute('data-c')) { S.c = b.getAttribute('data-c'); }
    el.inp.value = S.n; paint();
  });
  el.copy.addEventListener('click', function () {
    if (!el.result.classList.contains('dc-bad')) { A.copy(el.copy, el.big.textContent); }
  });
  document.addEventListener('aa:langchange', function () {
    el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
    paint();
  });

  var q = A.readHash();
  if (q.n != null) { S.n = q.n; }
  if (q.s === 'mod' || q.s === 'trad') { S.s = q.s; }
  if (q.c === 'riel' || q.c === 'usd') { S.c = q.c; }
  el.inp.value = S.n;
  el.copy.querySelector('[data-copy-label]').textContent = A.t(A.COPY);
  drawTable();
  paint();
})();
