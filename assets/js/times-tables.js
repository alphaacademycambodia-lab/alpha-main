/* Alpha Academy Cambodia — Times Tables
   ---------------------------------------------------------------------------
   Two halves on one page:

   LEARN   — the 12 × 12 multiplication square. Pick a cell (or a table) and
             the fact is drawn as an array of dots, with its turn-around fact
             and the pattern that makes that table easy to remember.
   PRACTISE — pick the tables, then 20 questions or a one-minute sprint.
             Wrong answers are collected and offered back as a second round,
             so the session ends on the facts the child still needs.

   Uses tools-core.js. Nothing is sent or stored; the chosen table and the
   practice settings live in the address bar: #t=7&p=2-10&m=20&d=1        */
(function () {
  'use strict';
  var A = window.AATool;
  var root = document.getElementById('ttRoot');
  if (!root || !A) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var t = A.t, kh = A.kh;

  var T = {
    tableOf: { en: 'The {n} times table', km: 'តារាងមេគុណ {n}' },
    turn: { en: 'Turn it round: {b} × {a} = {p} too — same answer, so there is one fact less to learn.', km: 'ប្ដូរលំដាប់៖ {b} × {a} = {p} ដែរ — ចម្លើយដូចគ្នា ដូច្នេះមានការចាំតិចជាងមួយ។' },
    square: { en: '{a} × {a} is a square number — the dots make a square.', km: '{a} × {a} ជាចំនួនការេ — ចំណុចបង្កើតបានជាការេ។' },
    rows: { en: '{a} rows of {b} dots', km: '{a} ជួរ ជួរនីមួយៗ {b} ចំណុច' },
    q: { en: 'Question {i} of {n}', km: 'សំណួរទី {i} ក្នុងចំណោម {n}' },
    sprint: { en: '{s} s left', km: 'នៅសល់ {s} វិនាទី' },
    right: { en: 'Correct!', km: 'ត្រូវហើយ!' },
    wrong: { en: 'Not quite — {q} = {a}', km: 'មិនទាន់ត្រូវ — {q} = {a}' },
    score: { en: '{r} out of {n} correct', km: 'ត្រូវ {r} ក្នុងចំណោម {n}' },
    time: { en: 'Time: {s} s · about {a} s per question', km: 'រយៈពេល៖ {s} វិនាទី · ប្រហែល {a} វិនាទីក្នុងមួយសំណួរ' },
    allRight: { en: 'Every answer right. Try more tables, or the one-minute sprint.', km: 'ត្រូវទាំងអស់! សាកល្បងតារាងបន្ថែម ឬការប្រកួតមួយនាទី។' },
    missH: { en: 'Facts to practise', km: 'ការគុណដែលត្រូវហាត់បន្ថែម' },
    again: { en: 'Practise these again', km: 'ហាត់ទាំងនេះម្ដងទៀត' },
    pickOne: { en: 'Choose at least one table.', km: 'សូមជ្រើសរើសយ៉ាងហោចណាស់តារាងមួយ។' },
    great: [{ en: 'Brilliant!', km: 'ពូកែណាស់!' }, { en: 'Well done!', km: 'ល្អណាស់!' }, { en: 'Keep going!', km: 'បន្តទៀត!' }],
    tips: {
      1: { en: 'Any number times 1 stays the same.', km: 'ចំនួនណាគុណនឹង ១ នៅដដែល។' },
      2: { en: 'Times 2 is doubling: 2 × 8 is 8 + 8.', km: 'គុណនឹង ២ គឺទ្វេដង៖ ២ × ៨ = ៨ + ៨។' },
      3: { en: 'Count in threes: 3, 6, 9, 12… The digits of every answer add up to 3, 6 or 9.', km: 'រាប់ម្ដងបី៖ ៣, ៦, ៩, ១២… ផលបូកខ្ទង់នៃចម្លើយនីមួយៗស្មើ ៣, ៦ ឬ ៩។' },
      4: { en: 'Times 4 is double, then double again: 4 × 7 → 14 → 28.', km: 'គុណនឹង ៤ គឺទ្វេដងពីរដង៖ ៤ × ៧ → ១៤ → ២៨។' },
      5: { en: 'Times 5 always ends in 5 or 0. It is half of times 10.', km: 'គុណនឹង ៥ តែងបញ្ចប់ដោយ ៥ ឬ ០។ វាស្មើពាក់កណ្ដាលនៃការគុណនឹង ១០។' },
      6: { en: 'Times 6 is times 3, doubled: 6 × 7 = 2 × 21 = 42.', km: 'គុណនឹង ៦ គឺគុណនឹង ៣ ហើយទ្វេដង៖ ៦ × ៧ = ២ × ២១ = ៤២។' },
      7: { en: 'Times 7 is times 5 plus times 2: 7 × 8 = 40 + 16 = 56.', km: 'គុណនឹង ៧ គឺគុណនឹង ៥ បូកគុណនឹង ២៖ ៧ × ៨ = ៤០ + ១៦ = ៥៦។' },
      8: { en: 'Times 8 is double, double, double: 8 × 6 → 12 → 24 → 48.', km: 'គុណនឹង ៨ គឺទ្វេដងបីដង៖ ៨ × ៦ → ១២ → ២៤ → ៤៨។' },
      9: { en: 'Times 9 is times 10 take away one lot: 9 × 7 = 70 − 7 = 63. The digits of the answer add up to 9.', km: 'គុណនឹង ៩ គឺគុណនឹង ១០ ដកមួយដង៖ ៩ × ៧ = ៧០ − ៧ = ៦៣។ ផលបូកខ្ទង់នៃចម្លើយស្មើ ៩។' },
      10: { en: 'Times 10 moves every digit one place to the left: 10 × 7 = 70.', km: 'គុណនឹង ១០ រំកិលខ្ទង់នីមួយៗទៅឆ្វេងមួយខ្ទង់៖ ១០ × ៧ = ៧០។' },
      11: { en: 'Up to 11 × 9, write the digit twice: 11 × 4 = 44. Then 11 × 10 = 110, 11 × 11 = 121, 11 × 12 = 132.', km: 'រហូតដល់ ១១ × ៩ សរសេរខ្ទង់ពីរដង៖ ១១ × ៤ = ៤៤។ បន្ទាប់មក ១១ × ១០ = ១១០, ១១ × ១១ = ១២១, ១១ × ១២ = ១៣២។' },
      12: { en: 'Times 12 is times 10 plus times 2: 12 × 7 = 70 + 14 = 84.', km: 'គុណនឹង ១២ គឺគុណនឹង ១០ បូកគុណនឹង ២៖ ១២ × ៧ = ៧០ + ១៤ = ៨៤។' }
    }
  };
  function f(o, v) { return t(o).replace(/\{(\w+)\}/g, function (_, k) { return kh(v[k]); }); }

  /* ---------------------------------------------------------- state */
  var H = A.readHash();
  var S = {
    tab: H.tab === 'p' ? 'p' : 'l',
    a: clamp(+H.a || 7, 1, 12), b: clamp(+H.b || 8, 1, 12),
    picks: parsePicks(H.p) || [2, 3, 4, 5, 6, 7, 8, 9, 10],
    mode: H.m === 'sprint' ? 'sprint' : '20',
    div: H.d === '1'
  };
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(n))); }
  function parsePicks(s) {
    if (!s) { return null; }
    var out = [];
    s.split(',').forEach(function (p) {
      var r = p.split('-'), a = +r[0], b = +(r[1] || r[0]);
      for (var i = a; i <= b; i++) { if (i >= 1 && i <= 12 && out.indexOf(i) < 0) { out.push(i); } }
    });
    return out.length ? out.sort(function (x, y) { return x - y; }) : null;
  }
  function picksStr() { return S.picks.join(','); }
  function save() { A.writeHash({ tab: S.tab === 'p' ? 'p' : '', a: S.a, b: S.b, p: picksStr(), m: S.mode === 'sprint' ? 'sprint' : '', d: S.div ? '1' : '' }); }

  /* ------------------------------------------------------------ tabs */
  var tabs = $('ttTabs');
  function paintTabs() {
    tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === S.tab)); });
    $('ttPaneL').hidden = S.tab !== 'l';
    $('ttPaneP').hidden = S.tab !== 'p';
  }
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.tab = b.getAttribute('data-t'); paintTabs(); save();
  });

  /* ============================================================ LEARN */
  var grid = $('ttGrid'), pick = $('ttPick');
  function buildGrid() {
    var h = '<thead><tr><th class="tt-corner">×</th>';
    for (var c = 1; c <= 12; c++) { h += '<th scope="col" data-c="' + c + '">' + kh(c) + '</th>'; }
    h += '</tr></thead><tbody>';
    for (var r = 1; r <= 12; r++) {
      h += '<tr><th scope="row" data-r="' + r + '">' + kh(r) + '</th>';
      for (c = 1; c <= 12; c++) {
        h += '<td><button type="button" data-a="' + r + '" data-b="' + c + '" aria-label="' + r + ' × ' + c + ' = ' + (r * c) + '"' + (r === c ? ' class="sq"' : '') + '>' + kh(r * c) + '</button></td>';
      }
      h += '</tr>';
    }
    grid.innerHTML = h + '</tbody>';
    var p = '';
    for (var n = 1; n <= 12; n++) { p += '<button type="button" data-n="' + n + '">' + kh(n) + '</button>'; }
    pick.innerHTML = p;
  }
  function paintLearn() {
    grid.querySelectorAll('td button').forEach(function (b) {
      var a = +b.getAttribute('data-a'), c = +b.getAttribute('data-b');
      b.classList.toggle('is-on', a === S.a && c === S.b);
      b.classList.toggle('is-line', (a === S.a && c <= S.b) || (c === S.b && a <= S.a));
    });
    pick.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-n') === S.a)); });
    var a = S.a, b = S.b, p = a * b;
    $('ttFact').innerHTML = kh(a) + ' × ' + kh(b) + ' = <b>' + kh(p) + '</b>';
    $('ttRowsL').textContent = f(T.rows, { a: a, b: b });
    /* the array: a rows of b dots */
    var d = 22, pad = 8, w = b * d + pad * 2, hgt = a * d + pad * 2, s = '';
    for (var r = 0; r < a; r++) {
      for (var c = 0; c < b; c++) {
        s += '<circle cx="' + (pad + d / 2 + c * d) + '" cy="' + (pad + d / 2 + r * d) + '" r="7.5" class="' + ((c % 5 === 4) ? 'tt-dot tt-dot5' : 'tt-dot') + '"/>';
      }
    }
    $('ttArray').setAttribute('viewBox', '0 0 ' + w + ' ' + hgt);
    $('ttArray').innerHTML = s;
    var notes = [];
    if (a !== b) { notes.push(f(T.turn, { a: a, b: b, p: p })); } else { notes.push(f(T.square, { a: a })); }
    notes.push(t(T.tips[a]));
    $('ttTips').innerHTML = notes.map(function (n) { return '<li>' + A.esc(n) + '</li>'; }).join('');
    $('ttListH').textContent = f(T.tableOf, { n: a });
    var l = '';
    for (var k = 1; k <= 12; k++) {
      l += '<li' + (k === b ? ' class="is-on"' : '') + '><button type="button" data-b="' + k + '">' + kh(a) + ' × ' + kh(k) + ' = <b>' + kh(a * k) + '</b></button></li>';
    }
    $('ttList').innerHTML = l;
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-a]'); if (!b) { return; }
    S.a = +b.getAttribute('data-a'); S.b = +b.getAttribute('data-b'); paintLearn(); save();
  });
  grid.addEventListener('keydown', function (e) {
    var b = e.target.closest('button[data-a]'); if (!b) { return; }
    var a = +b.getAttribute('data-a'), c = +b.getAttribute('data-b');
    var mv = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (!mv) { return; }
    e.preventDefault();
    a = clamp(a + mv[0], 1, 12); c = clamp(c + mv[1], 1, 12);
    S.a = a; S.b = c; paintLearn(); save();
    var nb = grid.querySelector('button[data-a="' + a + '"][data-b="' + c + '"]'); if (nb) { nb.focus(); }
  });
  pick.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.a = +b.getAttribute('data-n'); paintLearn(); save();
  });
  $('ttList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.b = +b.getAttribute('data-b'); paintLearn(); save();
  });

  /* ========================================================= PRACTISE */
  var pp = $('ttPicks'), modeG = $('ttMode'), divC = $('ttDiv');
  function buildPicks() {
    var h = '';
    for (var n = 1; n <= 12; n++) { h += '<button type="button" data-n="' + n + '">' + kh(n) + '</button>'; }
    pp.innerHTML = h;
  }
  function paintSettings() {
    pp.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(S.picks.indexOf(+b.getAttribute('data-n')) >= 0)); });
    modeG.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === S.mode)); });
    divC.checked = S.div;
  }
  pp.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    var n = +b.getAttribute('data-n'), i = S.picks.indexOf(n);
    if (i >= 0) { S.picks.splice(i, 1); } else { S.picks.push(n); S.picks.sort(function (x, y) { return x - y; }); }
    paintSettings(); save();
  });
  $('ttAll').addEventListener('click', function () { S.picks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; paintSettings(); save(); });
  $('ttNone').addEventListener('click', function () { S.picks = []; paintSettings(); save(); });
  modeG.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; }
    S.mode = b.getAttribute('data-m'); paintSettings(); save();
  });
  divC.addEventListener('change', function () { S.div = divC.checked; save(); });

  var G = null, timer = null;
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function makeQ(a, b) {
    if (S.div && Math.random() < 0.4) { return { a: a * b, b: a, op: '÷', ans: b, key: a + '×' + b }; }
    return Math.random() < 0.5 ? { a: a, b: b, op: '×', ans: a * b, key: a + '×' + b } : { a: b, b: a, op: '×', ans: a * b, key: a + '×' + b };
  }
  function deck(list) {
    var all = [];
    if (list) { list.forEach(function (k) { var p = k.split('×'); all.push(makeQ(+p[0], +p[1])); }); return shuffle(all.concat(shuffle(all.slice()))); }
    S.picks.forEach(function (a) { for (var b = 1; b <= 12; b++) { all.push([a, b]); } });
    shuffle(all);
    return all.map(function (p) { return makeQ(p[0], p[1]); });
  }
  function start(list) {
    if (!S.picks.length && !list) { $('ttMsg').textContent = t(T.pickOne); return; }
    $('ttMsg').textContent = '';
    var d = deck(list), sprint = S.mode === 'sprint' && !list;
    while (!sprint && d.length < 20) { d = d.concat(deck(list)); }
    G = { qs: sprint ? d : d.slice(0, list ? Math.min(d.length, 20) : 20), i: 0, right: 0, done: 0, miss: {}, t0: Date.now(), sprint: sprint, left: 60, locked: false };
    $('ttSetup').hidden = true; $('ttEnd').hidden = true; $('ttGame').hidden = false;
    clearInterval(timer);
    if (sprint) {
      timer = setInterval(function () {
        G.left--; paintProgress();
        if (G.left <= 0) { finish(); }
      }, 1000);
    }
    ask();
  }
  function cur() { return G.qs[G.i % G.qs.length]; }
  function paintProgress() {
    var n = G.sprint ? 0 : G.qs.length;
    $('ttProg').textContent = G.sprint ? f(T.sprint, { s: Math.max(0, G.left) }) : f(T.q, { i: Math.min(G.i + 1, n), n: n });
    $('ttBar').style.width = (G.sprint ? (60 - G.left) / 60 * 100 : G.i / n * 100) + '%';
    $('ttRun').textContent = kh(G.right) + ' ✓';
  }
  function ask() {
    var q = cur();
    $('ttQ').innerHTML = kh(q.a) + ' ' + q.op + ' ' + kh(q.b) + ' = ';
    $('ttAns').value = ''; $('ttFb').textContent = ''; $('ttFb').className = 'tt-fb';
    G.locked = false; paintProgress();
    if (!matchMedia('(pointer:coarse)').matches) { $('ttAns').focus(); }
  }
  function check() {
    if (!G || G.locked) { return; }
    var v = A.parse($('ttAns').value);
    if (v == null || isNaN(v)) { return; }
    var q = cur(); G.locked = true; G.done++;
    var fb = $('ttFb');
    if (v === q.ans) {
      G.right++; fb.textContent = t(T.great[G.right % 3]) + ' ' + t(T.right); fb.className = 'tt-fb ok';
    } else {
      G.miss[q.key] = (G.miss[q.key] || 0) + 1;
      fb.textContent = f(T.wrong, { q: kh(q.a) + ' ' + q.op + ' ' + kh(q.b), a: q.ans }); fb.className = 'tt-fb no';
    }
    paintProgress();
    setTimeout(function () {
      if (!G) { return; }
      G.i++;
      if (!G.sprint && G.i >= G.qs.length) { finish(); } else { ask(); }
    }, v === q.ans ? 550 : 1500);
  }
  function finish() {
    clearInterval(timer);
    if (!G) { return; }
    var n = G.sprint ? G.done : G.qs.length;
    if (G.secs == null) { G.secs = G.sprint ? Math.min(60, Math.round((Date.now() - G.t0) / 1000)) : Math.round((Date.now() - G.t0) / 1000); }
    var secs = G.secs;
    $('ttGame').hidden = true; $('ttEnd').hidden = false;
    $('ttScore').textContent = f(T.score, { r: G.right, n: n });
    $('ttTime').textContent = f(T.time, { s: secs, a: n ? (Math.round(secs / n * 10) / 10) : 0 });
    var keys = Object.keys(G.miss);
    $('ttMissWrap').hidden = !keys.length;
    $('ttAllRight').textContent = keys.length ? '' : t(T.allRight);
    $('ttMissH').textContent = t(T.missH);
    $('ttAgain').textContent = t(T.again);
    $('ttMiss').innerHTML = keys.map(function (k) {
      var p = k.split('×');
      return '<li>' + kh(p[0]) + ' × ' + kh(p[1]) + ' = <b>' + kh(p[0] * p[1]) + '</b></li>';
    }).join('');
    G.missKeys = keys;
  }
  $('ttStart').addEventListener('click', function () { start(); });
  $('ttAgain').addEventListener('click', function () { if (G && G.missKeys) { start(G.missKeys); } });
  $('ttNew').addEventListener('click', function () { $('ttEnd').hidden = true; $('ttSetup').hidden = false; G = null; });
  $('ttStop').addEventListener('click', function () { finish(); });
  $('ttAns').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  $('ttPad').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !G || G.locked) { return; }
    var k = b.getAttribute('data-k'), inp = $('ttAns');
    if (k === 'del') { inp.value = inp.value.slice(0, -1); } else if (k === 'ok') { check(); } else if (inp.value.length < 4) { inp.value += kh(k); }
  });

  /* ----------------------------------------------------------- language */
  function paintPad() {
    $('ttPad').querySelectorAll('button[data-k]').forEach(function (b) {
      var k = b.getAttribute('data-k'); if (/^\d$/.test(k)) { b.textContent = kh(k); }
    });
  }
  document.addEventListener('aa:langchange', function () {
    buildGrid(); buildPicks(); paintLearn(); paintSettings(); paintPad();
    if (G && !$('ttGame').hidden) { $('ttQ').innerHTML = kh(cur().a) + ' ' + cur().op + ' ' + kh(cur().b) + ' = '; paintProgress(); }
    if (G && !$('ttEnd').hidden) { finish(); }
  });

  buildGrid(); buildPicks(); paintTabs(); paintLearn(); paintSettings(); paintPad();
})();
