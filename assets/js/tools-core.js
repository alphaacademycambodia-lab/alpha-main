/* Alpha Academy Cambodia — shared helpers for the Tools tab
   ---------------------------------------------------------------------------
   The first five tools each carry their own copy of these few functions.
   From the graph plotter onwards they share this file instead, so a fix to
   number parsing or the Khmer decimal mark lands everywhere at once.

   Everything here is small and has no state of its own:

     AATool.lang()          'km' or 'en', read from the header switch
     AATool.t({en, km})     the right half of a bilingual pair
     AATool.kh(s)           Latin digits → Khmer digits, only in Khmer mode
     AATool.parse(s)        a typed number → Number (null if empty, NaN if not
                            a number). Accepts Khmer digits, a decimal comma,
                            thousands separators, a typographic minus, and a
                            simple fraction such as 3/4 or −1/2
     AATool.fmt(n, opt)     a Number → display string, Khmer-aware
     AATool.readHash()      #a=1&b=2 → { a: '1', b: '2' }
     AATool.writeHash(obj)  the reverse, via replaceState (no history spam)
     AATool.copy(btn, txt)  copy to the clipboard and flash the button

   The three rules every tool on this tab keeps still apply: no network, no
   account, nothing stored. The address bar is the only memory.            */
(function (global) {
  'use strict';

  var KHDIGIT = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

  function lang() { return (global.AAi18n && global.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(o) {
    if (o == null) { return ''; }
    if (typeof o === 'string') { return o; }
    return (lang() === 'km' && o.km) ? o.km : o.en;
  }
  function khDigits(s) { return String(s).replace(/[0-9]/g, function (d) { return KHDIGIT[+d]; }); }
  function kh(s) { return lang() === 'km' ? khDigits(s) : String(s); }
  function unKh(s) {
    return String(s).replace(/[០-៩]/g, function (d) { return String(KHDIGIT.indexOf(d)); });
  }

  /* One plain number, no fraction. */
  function parsePlain(s) {
    if (s.indexOf('.') === -1 && /^-?\d+,\d+$/.test(s) &&
        (lang() === 'km' || !/^-?\d{1,3}(,\d{3})+$/.test(s))) {
      s = s.replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) { return NaN; }
    return parseFloat(s);
  }

  function parse(s) {
    s = unKh(String(s == null ? '' : s)).trim()
      .replace(/[−–]/g, '-').replace(/\s/g, '');
    if (s === '') { return null; }
    var f = s.split('/');
    if (f.length === 2) {
      var a = parsePlain(f[0]), b = parsePlain(f[1]);
      if (isNaN(a) || isNaN(b) || b === 0) { return NaN; }
      return a / b;
    }
    return parsePlain(s);
  }

  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

  /* opt.sig      significant figures (default 10)
     opt.group    thousands separators (default true)
     opt.plain    no Khmer conversion — for putting a value back into an input */
  function fmt(n, opt) {
    opt = opt || {};
    if (!isFinite(n)) { return '—'; }
    var sig = opt.sig || 10;
    if (Math.abs(n) < 1e-12) { n = 0; }
    var a = Math.abs(n), out;
    if (n !== 0 && (a >= 1e15 || a < 1e-6)) {
      var p = n.toExponential(Math.min(sig, 8) - 1).split('e');
      out = String(parseFloat(p[0])) + ' × 10' + String(parseInt(p[1], 10)).replace(/./g, function (c) { return SUP[c]; });
    } else {
      var r = parseFloat(n.toPrecision(sig));
      out = opt.group === false ? String(r) : r.toLocaleString('en-US', { maximumFractionDigits: 12 });
    }
    if (opt.plain) { return out; }
    out = out.replace(/-/g, '−');
    if (lang() === 'km') {
      out = out.replace(/[.,]/g, function (c) { return c === '.' ? ',' : '.'; });
      out = khDigits(out);
    }
    return out;
  }

  function readHash() {
    var q = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) {
        try { q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) {}
      }
    });
    return q;
  }
  function writeHash(obj) {
    var parts = [];
    Object.keys(obj).forEach(function (k) {
      if (obj[k] !== '' && obj[k] != null) { parts.push(k + '=' + encodeURIComponent(obj[k])); }
    });
    var h = parts.length ? '#' + parts.join('&') : ' ';
    if (history.replaceState) {
      try { history.replaceState(null, '', h === ' ' ? location.pathname + location.search : h); } catch (e) {}
    }
  }

  var COPY = { en: 'Copy', km: 'ចម្លង' }, COPIED = { en: 'Copied', km: 'ចម្លងរួច' };
  function copy(btn, txt) {
    var label = btn.querySelector('[data-copy-label]') || btn;
    function done() {
      label.textContent = t(COPIED);
      btn.classList.add('is-done');
      setTimeout(function () { label.textContent = t(COPY); btn.classList.remove('is-done'); }, 1600);
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
  }

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var r = a % b; a = b; b = r; }
    return a;
  }

  /* Escape for innerHTML. */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  global.AATool = {
    lang: lang, t: t, kh: kh, khDigits: khDigits, unKh: unKh,
    parse: parse, fmt: fmt, readHash: readHash, writeHash: writeHash,
    copy: copy, gcd: gcd, esc: esc, COPY: COPY
  };
})(window);
