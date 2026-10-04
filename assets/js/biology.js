/* Alpha Academy Cambodia — Biology summary pages
   ---------------------------------------------------------------------------
   The notes themselves are plain HTML in the page, in both languages
   (.b-en / .b-km, shown by the header switch), so they read and print with
   JavaScript off. This file adds the two interactive parts:

     #bioPunnett  a Punnett square for one gene: pick each parent's genotype
                  and the trait, get the grid, the genotype and phenotype
                  ratios and the chance of each outcome; plus X/Y for sex
     #bioQuiz     a short self-check; questions come from the JSON in
                  <script type="application/json" id="bioQuizData">

   Nothing is sent or stored.                                              */
(function () {
  'use strict';
  function lang() { return (window.AAi18n && window.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(o) { return o[lang()] || o.en; }
  var KH = '០១២៣៤៥៦៧៨៩';
  function kh(s) { return lang() === 'km' ? String(s).replace(/\d/g, function (d) { return KH[+d]; }) : String(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function gcd(a, b) { while (b) { var r = a % b; a = b; b = r; } return a; }

  /* ------------------------------------------------------- Punnett square */
  var P = document.getElementById('bioPunnett');
  if (P) {
    var TRAITS = {
      pea: { L: 'T', dom: { en: 'tall', km: 'ខ្ពស់' }, rec: { en: 'short', km: 'ទាប' } },
      eye: { L: 'B', dom: { en: 'brown eyes', km: 'ភ្នែកពណ៌ត្នោត' }, rec: { en: 'blue eyes', km: 'ភ្នែកពណ៌ខៀវ' } },
      flower: { L: 'R', dom: { en: 'red flowers', km: 'ផ្កាពណ៌ក្រហម' }, rec: { en: 'white flowers', km: 'ផ្កាពណ៌ស' } }
    };
    var TX = {
      gt: { en: 'Genotypes', km: 'ហ្សេណូទីប' }, ph: { en: 'Phenotypes', km: 'ផេណូទីប' },
      ratio: { en: 'Ratio', km: 'ផលធៀប' },
      chance: { en: '{p}% chance', km: 'ឱកាស {p}%' },
      girl: { en: 'girl (XX)', km: 'ស្រី (XX)' }, boy: { en: 'boy (XY)', km: 'ប្រុស (XY)' },
      sexNote: { en: 'Every child has a 50% chance of being a boy and 50% of being a girl. The father’s sperm decides: it carries either X or Y.', km: 'កូននីមួយៗមានឱកាស ៥០% ជាប្រុស និង ៥០% ជាស្រី។ មេជីវិតឈ្មោលរបស់ឪពុកជាអ្នកកំណត់៖ វាផ្ទុក X ឬ Y។' },
      carrier: { en: 'Aa looks {d} but carries the {r} allele.', km: '{a} មានរូបរាង{d} ប៉ុន្តែផ្ទុកអាឡែល{r}។' }
    };
    var S = { trait: 'pea', a: 'Aa', b: 'Aa', sex: false };
    function sym(g, L) { return g.replace(/A/g, L).replace(/a/g, L.toLowerCase()); }
    function paintP() {
      P.querySelectorAll('[data-pt]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pt') === (S.sex ? 'sex' : S.trait))); });
      P.querySelectorAll('[data-pa]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pa') === S.a)); b.hidden = S.sex; });
      P.querySelectorAll('[data-pb]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pb') === S.b)); b.hidden = S.sex; });
      P.querySelector('.bio-pp').hidden = S.sex;
      var g1, g2, cells = [], out = '';
      if (S.sex) { g1 = ['X', 'X']; g2 = ['X', 'Y']; }
      else { var L = TRAITS[S.trait].L; g1 = sym(S.a, L).split(''); g2 = sym(S.b, L).split(''); }
      var h = '<table class="bio-psq"><thead><tr><th></th>' + g2.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>';
      g1.forEach(function (r) {
        h += '<tr><th>' + r + '</th>';
        g2.forEach(function (c) {
          var pair = [r, c].sort(function (p, q) { return p === p.toUpperCase() && q !== q.toUpperCase() ? -1 : p !== p.toUpperCase() && q === q.toUpperCase() ? 1 : p < q ? -1 : 1; }).join('');
          if (S.sex) { pair = r + c; }
          cells.push(pair);
          var dom = S.sex ? pair === 'XY' : /[A-Z]/.test(pair);
          h += '<td class="' + (S.sex ? (pair === 'XY' ? 'b-boy' : 'b-girl') : dom ? 'b-dom' : 'b-rec') + '">' + pair + '</td>';
        });
        h += '</tr>';
      });
      h += '</tbody></table>';
      if (S.sex) {
        out = '<p><b>' + esc(t(TX.girl)) + '</b> 2/4 = 50% · <b>' + esc(t(TX.boy)) + '</b> 2/4 = 50%</p><p class="bio-note">' + esc(t(TX.sexNote)) + '</p>';
      } else {
        var tr = TRAITS[S.trait], cnt = {}, d = 0;
        cells.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; if (/[A-Z]/.test(c)) { d++; } });
        var keys = Object.keys(cnt).sort(function (x, y) { return (y.match(/[A-Z]/g) || []).length - (x.match(/[A-Z]/g) || []).length; });
        var g = keys.map(function (k) { return cnt[k]; }).reduce(gcd);
        out += '<p><b>' + esc(t(TX.gt)) + ':</b> ' + keys.map(function (k) { return k + ' ' + kh(cnt[k]) + '/' + kh(4); }).join(' · ') + ' &nbsp;→&nbsp; ' + esc(t(TX.ratio)) + ' ' + keys.map(function (k) { return kh(cnt[k] / g); }).join(' : ') + '</p>';
        var r = 4 - d, gg = gcd(d, r) || Math.max(d, r);
        out += '<p><b>' + esc(t(TX.ph)) + ':</b> ' + (d ? esc(t(tr.dom)) + ' ' + kh(d * 25) + '%' : '') + (d && r ? ' · ' : '') + (r ? esc(t(tr.rec)) + ' ' + kh(r * 25) + '%' : '') + (d && r ? ' &nbsp;→&nbsp; ' + kh(d / gg) + ' : ' + kh(r / gg) : '') + '</p>';
        if (cells.some(function (c) { return /[A-Z][a-z]/.test(c); })) {
          var het = tr.L + tr.L.toLowerCase();
          out += '<p class="bio-note">' + esc(t(TX.carrier)).replace('Aa', het).replace('{a}', het).replace('{d}', esc(t(tr.dom))).replace('{r}', esc(t(tr.rec))) + '</p>';
        }
      }
      P.querySelector('.bio-pgrid').innerHTML = h;
      P.querySelector('.bio-pout').innerHTML = out;
      P.querySelectorAll('[data-pa]').forEach(function (b) { b.textContent = S.sex ? '' : sym(b.getAttribute('data-pa'), TRAITS[S.trait].L); });
      P.querySelectorAll('[data-pb]').forEach(function (b) { b.textContent = S.sex ? '' : sym(b.getAttribute('data-pb'), TRAITS[S.trait].L); });
    }
    P.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) { return; }
      if (b.hasAttribute('data-pt')) { var v = b.getAttribute('data-pt'); S.sex = v === 'sex'; if (!S.sex) { S.trait = v; } }
      if (b.hasAttribute('data-pa')) { S.a = b.getAttribute('data-pa'); }
      if (b.hasAttribute('data-pb')) { S.b = b.getAttribute('data-pb'); }
      paintP();
    });
    document.addEventListener('aa:langchange', paintP);
    paintP();
  }

  /* ------------------------------------------------------------- the quiz */
  var Q = document.getElementById('bioQuiz'), data = document.getElementById('bioQuizData');
  if (Q && data) {
    var qs = JSON.parse(data.textContent), ans = {};
    var QT = {
      check: { en: 'Check my answers', km: 'ពិនិត្យចម្លើយ' }, again: { en: 'Try again', km: 'សាកម្ដងទៀត' },
      score: { en: '{r} out of {n} correct', km: 'ត្រូវ {r} ក្នុងចំណោម {n}' }
    };
    var done = false;
    function paintQ() {
      var h = qs.map(function (q, i) {
        var opts = q.o.map(function (o, j) {
          var cls = '';
          if (done) { cls = j === q.a ? ' is-ok' : (ans[i] === j ? ' is-no' : ''); }
          return '<button type="button" class="bio-opt' + cls + '" data-q="' + i + '" data-o="' + j + '" aria-pressed="' + (ans[i] === j) + '"' + (done ? ' disabled' : '') + '>' + esc(t(o)) + '</button>';
        }).join('');
        return '<li class="bio-q"><p>' + esc(t(q.q)) + '</p><div class="bio-opts">' + opts + '</div>' + (done ? '<p class="bio-why">' + esc(t(q.w)) + '</p>' : '') + '</li>';
      }).join('');
      Q.querySelector('ol').innerHTML = h;
      var right = qs.filter(function (q, i) { return ans[i] === q.a; }).length;
      Q.querySelector('.bio-qscore').textContent = done ? t(QT.score).replace('{r}', kh(right)).replace('{n}', kh(qs.length)) : '';
      Q.querySelector('.bio-qbtn').textContent = t(done ? QT.again : QT.check);
    }
    Q.addEventListener('click', function (e) {
      var o = e.target.closest('.bio-opt');
      if (o && !done) { ans[+o.getAttribute('data-q')] = +o.getAttribute('data-o'); paintQ(); return; }
      if (e.target.closest('.bio-qbtn')) {
        if (done) { done = false; ans = {}; } else { done = true; }
        paintQ();
        if (done) { Q.querySelector('.bio-qscore').scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      }
    });
    document.addEventListener('aa:langchange', paintQ);
    paintQ();
  }

  /* ------------------------------------------- which section is on screen */
  var J = document.querySelector('.bio-jump');
  if (J && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(J.querySelectorAll('a[href^="#"]'));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var seen = {};
    function mark() {
      var cur = null;
      secs.forEach(function (s, i) { if (s && seen[s.id]) { cur = cur == null ? i : cur; } });
      if (cur == null) { return; }
      links.forEach(function (a, i) { a.classList.toggle('is-on', i === cur); if (i === cur) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); } });
      /* chips row on narrow screens: keep the current chip in view */
      if (J.scrollWidth > J.clientWidth + 4) {
        var a = links[cur], left = a.offsetLeft - (J.clientWidth - a.offsetWidth) / 2;
        J.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      mark();
    }, { rootMargin: '-35% 0px -55% 0px' });
    secs.forEach(function (s) { if (s) { io.observe(s); } });
  }
})();
