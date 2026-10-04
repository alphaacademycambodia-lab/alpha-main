/* Alpha Academy Cambodia — Factors, Primes, HCF & LCM
   ---------------------------------------------------------------------------
   Type two or three whole numbers. For each one: the factor tree (split off
   the smallest prime each time, primes circled), the prime factorisation in
   index form, and every factor listed in pairs. Then the HCF and LCM two
   ways — by listing, and from the prime factors — with a Venn diagram of
   the primes when there are two numbers.

   Uses tools-core.js. Nothing is sent or stored; the address bar keeps the
   numbers: #n=36,48                                                       */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('fpRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh, F = function (n) { return A.fmt(n); };
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

  var T = {
    treeOf: { en: 'Factor tree of {n}', km: 'មែកធាងកត្តានៃ {n}' },
    isPrime: { en: '{n} is a prime number — its only factors are 1 and {n}.', km: '{n} ជាចំនួនបឋម — កត្តារបស់វាមានតែ ១ និង {n}។' },
    one: { en: '1 is neither prime nor composite.', km: '១ មិនមែនជាចំនួនបឋម ហើយក៏មិនមែនជាចំនួនសមាសដែរ។' },
    pf: { en: 'Prime factorisation', km: 'ការបំបែកជាកត្តាបឋម' },
    factors: { en: 'Factors ({c})', km: 'កត្តា ({c})' },
    pairs: { en: 'in pairs', km: 'ជាគូ' },
    hcf: { en: 'HCF', km: 'តួចែករួមធំបំផុត (HCF)' },
    lcm: { en: 'LCM', km: 'ពហុគុណរួមតូចបំផុត (LCM)' },
    list: { en: 'By listing', km: 'ដោយរាយ' },
    byPf: { en: 'From the prime factors', km: 'ពីកត្តាបឋម' },
    common: { en: 'Common factors: {l}. The highest is {h}.', km: 'កត្តារួម៖ {l}។ ធំបំផុតគឺ {h}។' },
    mult: { en: 'Multiples of {n}: {l}…', km: 'ពហុគុណនៃ {n}៖ {l}…' },
    firstCommon: { en: 'The first multiple they share is {m}.', km: 'ពហុគុណរួមដំបូងគឺ {m}។' },
    hcfPf: { en: 'HCF: take each prime they all share, with the smallest power: {e} = {v}', km: 'HCF៖ យកកត្តាបឋមរួមនីមួយៗ ដែលមានស្វ័យគុណតូចបំផុត៖ {e} = {v}' },
    lcmPf: { en: 'LCM: take every prime that appears, with the largest power: {e} = {v}', km: 'LCM៖ យកកត្តាបឋមទាំងអស់ ដែលមានស្វ័យគុណធំបំផុត៖ {e} = {v}' },
    noCommon: { en: 'No prime is shared, so the HCF is 1 (the numbers are co-prime).', km: 'គ្មានកត្តាបឋមរួម ដូច្នេះ HCF = ១ (ចំនួនបឋមរវាងគ្នា)។' },
    check: { en: 'Check: HCF × LCM = {h} × {l} = {p} = {a} × {b}', km: 'ផ្ទៀងផ្ទាត់៖ HCF × LCM = {h} × {l} = {p} = {a} × {b}' },
    venn: { en: 'Venn diagram of the prime factors', km: 'ដ្យាក្រាមវ៉ែននៃកត្តាបឋម' },
    vennNote: { en: 'The middle is the HCF; everything in the circles multiplied together is the LCM.', km: 'ផ្នែកកណ្ដាលគឺ HCF ហើយផលគុណនៃអ្វីៗទាំងអស់ក្នុងរង្វង់គឺ LCM។' },
    range: { en: 'Use whole numbers from 1 to 1,000,000.', km: 'សូមប្រើចំនួនគត់ពី ១ ដល់ ១.០០០.០០០។' },
    need: { en: 'Type at least one number.', km: 'សូមវាយយ៉ាងហោចណាស់ចំនួនមួយ។' }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }); }

  /* ------------------------------------------------------------ maths */
  function pf(n) { var out = {}, p = 2; while (n > 1 && p * p <= n) { while (n % p === 0) { out[p] = (out[p] || 0) + 1; n /= p; } p += p === 2 ? 1 : 2; } if (n > 1) { out[n] = (out[n] || 0) + 1; } return out; }
  function idx(m) {
    var ks = Object.keys(m).map(Number).sort(function (a, b) { return a - b; });
    if (!ks.length) { return kh(1); }
    return ks.map(function (p) { return kh(p) + (m[p] > 1 ? String(m[p]).replace(/\d/g, function (d) { return SUP[d]; }) : ''); }).join(' × ');
  }
  function val(m) { var v = 1; Object.keys(m).forEach(function (p) { v *= Math.pow(+p, m[p]); }); return v; }
  function factors(n) { var lo = [], hi = []; for (var i = 1; i * i <= n; i++) { if (n % i === 0) { lo.push(i); if (i * i !== n) { hi.unshift(n / i); } } } return { list: lo.concat(hi), pairs: lo.map(function (a) { return [a, n / a]; }) }; }
  function gcd(a, b) { return A.gcd(a, b); }

  /* ----------------------------------------------------- factor tree */
  function tree(n) {
    var dx = 46, dy = 58, R = 21, x = 60, y = 30, cur = n, i = 0, s = '';
    function leaf(cx, cy, v) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="fp-prime"/><text x="' + cx + '" y="' + cy + '" class="fp-t fp-tp">' + kh(v) + '</text>'; }
    while (true) {
      var cx = x + i * dx, cy = y + i * dy, ks = Object.keys(pf(cur)).map(Number);
      if (ks.length === 1 && pf(cur)[ks[0]] === 1) { s += leaf(cx, cy, cur); break; }
      var p = Math.min.apply(null, ks);
      s += '<line x1="' + (cx - 8) + '" y1="' + (cy + 13) + '" x2="' + (cx - dx * 0.7) + '" y2="' + (cy + dy - R) + '" class="fp-br"/>' +
           '<line x1="' + (cx + 8) + '" y1="' + (cy + 13) + '" x2="' + (cx + dx - 6) + '" y2="' + (cy + dy - R) + '" class="fp-br"/>' +
           '<text x="' + cx + '" y="' + cy + '" class="fp-t">' + kh(cur) + '</text>' + leaf(cx - dx * 0.75, cy + dy, p);
      cur = cur / p; i++;
    }
    var W = x + i * dx + 70, Hh = y + i * dy + 34;
    return '<svg class="fp-tree" viewBox="0 0 ' + W + ' ' + Hh + '" style="max-width:' + Math.min(W * 1.15, 520) + 'px" role="img" aria-label="' + A.esc(f(T.treeOf, { n: n })) + '">' + s + '</svg>';
  }

  /* ----------------------------------------------------------- Venn */
  function venn(a, b, ma, mb) {
    var common = [], onlyA = [], onlyB = [];
    var ps = {}; Object.keys(ma).concat(Object.keys(mb)).forEach(function (p) { ps[p] = 1; });
    Object.keys(ps).map(Number).sort(function (x, y) { return x - y; }).forEach(function (p) {
      var ea = ma[p] || 0, eb = mb[p] || 0, c = Math.min(ea, eb), i;
      for (i = 0; i < c; i++) { common.push(p); }
      for (i = 0; i < ea - c; i++) { onlyA.push(p); }
      for (i = 0; i < eb - c; i++) { onlyB.push(p); }
    });
    function stack(list, cx) {
      if (!list.length) { return ''; }
      var rows = [], per = 3, s = '';
      for (var i = 0; i < list.length; i += per) { rows.push(list.slice(i, i + per)); }
      var y0 = 120 - (rows.length - 1) * 15;
      rows.forEach(function (r, j) { s += '<text x="' + cx + '" y="' + (y0 + j * 30) + '" class="fp-vn">' + r.map(kh).join('  ') + '</text>'; });
      return s;
    }
    return '<svg class="fp-venn" viewBox="0 0 400 240" role="img" aria-label="' + A.esc(t(T.venn)) + '">' +
      '<circle cx="150" cy="120" r="95" class="fp-ca"/><circle cx="250" cy="120" r="95" class="fp-cb"/>' +
      '<text x="95" y="20" class="fp-vl">' + F(a) + '</text><text x="305" y="20" class="fp-vl">' + F(b) + '</text>' +
      stack(onlyA, 105) + stack(common, 200) + stack(onlyB, 295) + '</svg>';
  }

  /* ---------------------------------------------------------- paint */
  var H0 = A.readHash();
  var S = { nums: (H0.n || '36,48').split(',').slice(0, 3) };
  var ins = [$('fpA'), $('fpB'), $('fpC')];
  ins.forEach(function (el, i) { el.value = S.nums[i] || ''; });

  function paint() {
    var raw = ins.map(function (el) { return el.value; }), nums = [], bad = false;
    raw.forEach(function (r) {
      var v = A.parse(r); if (v == null) { return; }
      if (isNaN(v) || v < 1 || v > 1e6 || v !== Math.floor(v)) { bad = true; return; }
      nums.push(v);
    });
    A.writeHash({ n: raw.filter(function (r) { return r.trim(); }).map(function (r) { return A.unKh(r).replace(/[^\d]/g, ''); }).join(',') });
    var msg = $('fpMsg'); msg.textContent = bad ? t(T.range) : (!nums.length ? t(T.need) : '');
    var each = $('fpEach'), res = $('fpRes');
    each.innerHTML = nums.map(function (n) {
      var m = pf(n), fs = factors(n), h = '<div class="dc-card fp-card"><h3 class="fp-h">' + F(n) + '</h3>';
      if (n === 1) { h += '<p class="fp-note">' + A.esc(t(T.one)) + '</p>'; }
      else {
        h += tree(n);
        h += '<p class="fp-pf"><span>' + A.esc(t(T.pf)) + '</span><b>' + F(n) + ' = ' + idx(m) + '</b></p>';
        if (fs.list.length === 2) { h += '<p class="fp-note">' + A.esc(f(T.isPrime, { n: F(n) })) + '</p>'; }
      }
      h += '<h4 class="pv-h4">' + A.esc(f(T.factors, { c: kh(fs.list.length) })) + '</h4><p class="fp-fl">' + fs.list.map(F).join(', ') + '</p>';
      if (fs.pairs.length > 1) { h += '<p class="fp-pairs">' + fs.pairs.map(function (p) { return F(p[0]) + ' × ' + F(p[1]); }).join(' &nbsp;·&nbsp; ') + '</p>'; }
      return h + '</div>';
    }).join('');
    if (nums.length < 2) { res.hidden = true; return; }
    res.hidden = false;
    var ms = nums.map(pf), hcf = nums.reduce(gcd), lcm = nums.reduce(function (a, b) { return a / gcd(a, b) * b; });
    $('fpHcf').textContent = F(hcf); $('fpLcm').textContent = F(lcm);
    $('fpHcfL').textContent = t(T.hcf); $('fpLcmL').textContent = t(T.lcm);
    /* listing method */
    var fl = nums.map(function (n) { return factors(n).list; });
    var com = fl[0].filter(function (x) { return fl.every(function (l) { return l.indexOf(x) >= 0; }); });
    var L = [f(T.common, { l: com.map(F).join(', '), h: F(hcf) })];
    if (lcm <= 2000) {
      nums.forEach(function (n) { var k = [], c = n; while (k.length < 8 && c <= lcm) { k.push(F(c)); c += n; } L.push(f(T.mult, { n: F(n), l: k.join(', ') })); });
      L.push(f(T.firstCommon, { m: F(lcm) }));
    }
    $('fpListH').textContent = t(T.list);
    $('fpList').innerHTML = L.map(function (x) { return '<li>' + A.esc(x) + '</li>'; }).join('');
    /* prime-factor method */
    var allP = {}; ms.forEach(function (m) { Object.keys(m).forEach(function (p) { allP[p] = 1; }); });
    var hm = {}, lm = {};
    Object.keys(allP).forEach(function (p) {
      var es = ms.map(function (m) { return m[p] || 0; });
      var mn = Math.min.apply(null, es), mx = Math.max.apply(null, es);
      if (mn) { hm[p] = mn; } lm[p] = mx;
    });
    var P = ms.map(function (m, i) { return F(nums[i]) + ' = ' + idx(m); });
    P.push(Object.keys(hm).length ? f(T.hcfPf, { e: idx(hm), v: F(hcf) }) : t(T.noCommon));
    P.push(f(T.lcmPf, { e: idx(lm), v: F(lcm) }));
    if (nums.length === 2) { P.push(f(T.check, { h: F(hcf), l: F(lcm), p: F(hcf * lcm), a: F(nums[0]), b: F(nums[1]) })); }
    $('fpPfH').textContent = t(T.byPf);
    $('fpPf').innerHTML = P.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    var vc = $('fpVennCard');
    vc.hidden = nums.length !== 2;
    if (nums.length === 2) {
      $('fpVennH').textContent = t(T.venn);
      $('fpVenn').innerHTML = venn(nums[0], nums[1], ms[0], ms[1]);
      $('fpVennP').textContent = t(T.vennNote);
    }
  }
  ins.forEach(function (el) { el.addEventListener('input', paint); });
  $('fpEx').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    var v = b.getAttribute('data-x').split(',');
    ins.forEach(function (el, i) { el.value = v[i] || ''; }); paint();
  });
  document.addEventListener('aa:langchange', paint);
  paint();
})();
