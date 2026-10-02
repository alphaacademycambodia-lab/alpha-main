/* Alpha Academy Cambodia — Khmer Conversational Mastery
   ---------------------------------------------------------------------------
   A self-study course for foreigners (and children) learning spoken Khmer:
   100 real-life situations by Ngorn Kakteka, each with an illustrated scene,
   the conversation, key phrases and four ways to practise.

   Views, chosen by the URL hash so every lesson can be linked to:
     (none) / #lessons     all lessons, grouped by chapter, with progress
     #pronunciation        how to read the romanization
     #s-12                 situation 12 — tabs: Learn, Flashcards, Quiz, Role-play

   Data:   window.KCM        (assets/js/kcm-bank.js)
   Art:    window.KCMScene   (assets/js/kcm-scenes.js)
   Saved:  localStorage 'aa-kcm-v1' — best quiz score per lesson, the last
           lesson opened, and the display toggles. Only in this browser; the
           page works the same if storage is blocked.

   Audio is the browser's own speech synthesis with a Khmer (km) voice. Many
   desktops have none, so every speaker button hides itself when no voice is
   found and the romanization does the job instead.                        */
(function () {
  'use strict';

  var D = window.KCM, S = window.KCMScene;
  if (!D || !S) return;
  var SITS = D.sits, CH = D.chapters;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ language */
  var T = {
    all:        { en: 'All lessons', km: 'មេរៀនទាំងអស់' },
    keyNav:     { en: 'How to read the romanization', km: 'របៀបអានអក្សរឡាតាំង' },
    chapter:    { en: 'Chapter', km: 'ជំពូក' },
    lesson:     { en: 'Lesson', km: 'មេរៀន' },
    learn:      { en: 'Learn', km: 'រៀន' },
    cards:      { en: 'Flashcards', km: 'កាតពាក្យ' },
    quiz:       { en: 'Quiz', km: 'តេស្ត' },
    role:       { en: 'Role-play', km: 'សម្តែងតួ' },
    goal:       { en: 'In this lesson', km: 'ក្នុងមេរៀននេះ' },
    willSay:    { en: 'You will learn to say', km: 'អ្នកនឹងរៀននិយាយ' },
    play:       { en: 'Play the conversation', km: 'ចាក់ការសន្ទនា' },
    pause:      { en: 'Pause', km: 'ផ្អាក' },
    tapLine:    { en: 'Tap any line to see it in the picture.', km: 'ចុចលើប្រយោគណាមួយ ដើម្បីមើលវាក្នុងរូបភាព។' },
    dialogue:   { en: 'The conversation', km: 'ការសន្ទនា' },
    sayit:      { en: 'Say it right', km: 'បញ្ចេញសំឡេងឱ្យត្រូវ' },
    phrases:    { en: 'Key phrases', km: 'ឃ្លាសំខាន់ៗ' },
    tip:        { en: 'Tip', km: 'គន្លឹះ' },
    culture:    { en: 'Culture', km: 'វប្បធម៌' },
    nextStep:   { en: 'Ready? Practise with the flashcards', km: 'រួចរាល់ហើយ? ហាត់ជាមួយកាតពាក្យ' },
    you:        { en: 'You', km: 'អ្នក' },
    romOn:      { en: 'Romanization', km: 'អក្សរឡាតាំង' },
    enOn:       { en: 'English', km: 'អង់គ្លេស' },
    speed:      { en: 'Speed', km: 'ល្បឿន' },
    slow:       { en: 'Slow', km: 'យឺត' },
    normal:     { en: 'Normal', km: 'ធម្មតា' },
    show:       { en: 'Show', km: 'បង្ហាញ' },
    voiceOk:    { en: 'Khmer voice: ', km: 'សំឡេងខ្មែរ៖ ' },
    voiceNo:    { en: 'No Khmer voice on this device — read the romanization instead.', km: 'ឧបករណ៍នេះគ្មានសំឡេងខ្មែរ — សូមអានអក្សរឡាតាំងជំនួស។' },
    listen:     { en: 'Listen', km: 'ស្តាប់' },
    // flashcards
    dirEnKm:    { en: 'English → Khmer', km: 'អង់គ្លេស → ខ្មែរ' },
    dirKmEn:    { en: 'Khmer → English', km: 'ខ្មែរ → អង់គ្លេស' },
    tapFlip:    { en: 'Tap the card to turn it over', km: 'ចុចលើកាតដើម្បីបង្វិល' },
    again:      { en: 'Still learning', km: 'កំពុងរៀន' },
    know:       { en: 'I know it', km: 'ខ្ញុំចេះហើយ' },
    shuffle:    { en: 'Shuffle', km: 'លាយ' },
    cardsDone:  { en: 'Deck finished!', km: 'ចប់កាតហើយ!' },
    cardsKnew:  { en: 'You knew {a} of {b} at the first try.', km: 'អ្នកចេះ {a} ក្នុងចំណោម {b} នៅលើកដំបូង។' },
    restart:    { en: 'Start again', km: 'ចាប់ផ្តើមម្តងទៀត' },
    toQuiz:     { en: 'Take the quiz', km: 'ធ្វើតេស្ត' },
    // quiz
    qPickKm:    { en: 'How do you say this in Khmer?', km: 'តើនិយាយជាភាសាខ្មែរដូចម្តេច?' },
    qPickEn:    { en: 'What does this mean?', km: 'តើនេះមានន័យថាអ្វី?' },
    qReply:     { en: 'What do you say next?', km: 'តើអ្នកនិយាយអ្វីបន្ទាប់?' },
    qWant:      { en: 'You want to say:', km: 'អ្នកចង់និយាយថា៖' },
    qOf:        { en: 'Question {a} of {b}', km: 'សំណួរទី {a} នៃ {b}' },
    next:       { en: 'Next', km: 'បន្ទាប់' },
    finish:     { en: 'See my score', km: 'មើលពិន្ទុ' },
    right:      ['Great job!', 'Correct!', 'Excellent!', 'Well done!', 'Perfect!'],
    rightKm:    ['ល្អណាស់!', 'ត្រូវហើយ!', 'អស្ចារ្យ!', 'ពូកែណាស់!', 'ល្អឥតខ្ចោះ!'],
    wrong:      { en: 'Not quite — the answer is highlighted.', km: 'មិនទាន់ត្រូវ — ចម្លើយត្រូវបានបន្លិច។' },
    score:      { en: 'You scored {a} out of {b}', km: 'អ្នកទទួលបាន {a} លើ {b}' },
    passMsg:    { en: 'Lesson complete! It is ticked off in the lesson list.', km: 'បញ្ចប់មេរៀន! វាត្រូវបានគូសធីកក្នុងបញ្ជីមេរៀន។' },
    failMsg:    { en: 'Score 70% or more to complete the lesson. Look at the phrases again and retry.', km: 'ទទួលបាន ៧០% ឬច្រើនជាងនេះ ដើម្បីបញ្ចប់មេរៀន។ មើលឃ្លាម្តងទៀត ហើយសាកល្បងម្តងទៀត។' },
    retry:      { en: 'Try again', km: 'សាកម្តងទៀត' },
    nextLesson: { en: 'Next lesson', km: 'មេរៀនបន្ទាប់' },
    prevLesson: { en: 'Previous lesson', km: 'មេរៀនមុន' },
    // role-play
    rolePick:   { en: 'Choose your part', km: 'ជ្រើសរើសតួរបស់អ្នក' },
    yourTurn:   { en: 'Your turn — say it in Khmer:', km: 'វេនអ្នក — និយាយជាភាសាខ្មែរ៖' },
    reveal:     { en: 'Show the answer', km: 'បង្ហាញចម្លើយ' },
    gotIt:      { en: 'I said it right', km: 'ខ្ញុំនិយាយត្រូវ' },
    missed:     { en: 'I need practice', km: 'ខ្ញុំត្រូវហាត់បន្ថែម' },
    cont:       { en: 'Continue', km: 'បន្ត' },
    roleDone:   { en: 'Conversation finished!', km: 'ការសន្ទនាបានបញ្ចប់!' },
    roleScore:  { en: 'You said {a} of {b} of your lines right.', km: 'អ្នកនិយាយត្រូវ {a} ក្នុងចំណោម {b} ប្រយោគរបស់អ្នក។' },
    roleSwap:   { en: 'Now swap parts', km: 'ឥឡូវប្តូរតួ' },
    roleStart:  { en: 'Start', km: 'ចាប់ផ្តើម' },
    roleHow:    { en: 'Read the other person’s line, then say your answer out loud before you check it.', km: 'អានប្រយោគរបស់ម្នាក់ទៀត បន្ទាប់មកនិយាយចម្លើយរបស់អ្នកឱ្យឮ មុនពេលពិនិត្យ។' },
    // overview
    progress:   { en: '{a} of {b} lessons complete', km: 'បានបញ្ចប់ {a} នៃ {b} មេរៀន' },
    continueL:  { en: 'Continue lesson {a}', km: 'បន្តមេរៀនទី {a}' },
    startL:     { en: 'Start lesson 1', km: 'ចាប់ផ្តើមមេរៀនទី ១' },
    search:     { en: 'Search lessons — e.g. taxi, food, doctor', km: 'ស្វែងរកមេរៀន — ឧ. តាក់ស៊ី ម្ហូប គ្រូពេទ្យ' },
    noMatch:    { en: 'No lesson matches that search.', km: 'គ្មានមេរៀនត្រូវនឹងការស្វែងរកនេះទេ។' },
    howH:       { en: 'How each lesson works', km: 'របៀបរៀនមេរៀននីមួយៗ' },
    how1:       { en: 'Watch the picture conversation', km: 'មើលការសន្ទនាក្នុងរូបភាព' },
    how2:       { en: 'Learn the key phrases', km: 'រៀនឃ្លាសំខាន់ៗ' },
    how3:       { en: 'Practise with flashcards', km: 'ហាត់ជាមួយកាតពាក្យ' },
    how4:       { en: 'Pass the quiz', km: 'ប្រឡងជាប់តេស្ត' },
    how5:       { en: 'Act it out in role-play', km: 'សម្តែងតួ' },
    situations: { en: 'Situations {a}–{b}', km: 'ស្ថានភាព {a}–{b}' },
    keyH:       { en: 'How to read the romanization', km: 'របៀបអានអក្សរឡាតាំង' },
    keyP:       { en: 'Every Khmer line has a romanized reading under it. Letters in bold are the stressed syllable — say them a little louder and longer. These are the sounds that differ from English.', km: 'ប្រយោគខ្មែរនីមួយៗមានការអានជាអក្សរឡាតាំងនៅខាងក្រោម។ អក្សរដិតគឺព្យាង្គដែលត្រូវសង្កត់ — និយាយឱ្យខ្លាំង និងវែងបន្តិច។ ខាងក្រោមនេះជាសំឡេងដែលខុសពីភាសាអង់គ្លេស។' },
    keyGo:      { en: 'Start with lesson 1', km: 'ចាប់ផ្តើមជាមួយមេរៀនទី ១' },
    by:         { en: 'Lessons by Ngorn Kakteka', km: 'មេរៀនដោយ ងន កតិកា' },
    done:       { en: 'Complete', km: 'បានបញ្ចប់' }
  };
  function lang() { return (window.AAi18n && window.AAi18n.get && window.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(k, a, b) {
    var v = T[k]; v = v ? (v[lang()] || v.en) : k;
    return String(v).replace('{a}', a).replace('{b}', b);
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function praise() { return lang() === 'km' ? pick(T.rightKm) : pick(T.right); }

  /* ------------------------------------------------------------- storage */
  var KEY = 'aa-kcm-v1';
  var store = { best: {}, last: 0, rom: true, en: true, rate: 0.8 };
  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); for (var k in o) store[k] = o[k]; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function best(n) { return store.best[n] || 0; }
  function isDone(n) { return best(n) >= 70; }
  function stars(pct) { return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0; }

  /* --------------------------------------------------------------- utils */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function sit(n) { return SITS[n - 1]; }
  function isYou(turn) { return turn.who === 'You'; }
  function otherName(s) { for (var i = 0; i < s.dialogue.length; i++) if (!isYou(s.dialogue[i])) return s.dialogue[i].who; return '—'; }
  var ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    say: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
  };
  function starRow(pct, cls) {
    var n = stars(pct), h = '<span class="kcm-stars ' + (cls || '') + '" aria-label="' + n + ' / 3">';
    for (var i = 0; i < 3; i++) h += '<span class="' + (i < n ? 'on' : '') + '">' + ICON.star + '</span>';
    return h + '</span>';
  }

  /* --------------------------------------------------------------- audio */
  var voice = null, synth = window.speechSynthesis;
  function findVoice() {
    if (!synth) return null;
    var vs = synth.getVoices() || [];
    for (var i = 0; i < vs.length; i++) if (/^km/i.test(vs[i].lang)) return vs[i];
    return null;
  }
  function refreshVoice() {
    voice = findVoice();
    document.documentElement.classList.toggle('kcm-novoice', !voice);
    var el = $('#kcmVoice');
    if (el) {
      el.textContent = voice ? t('voiceOk') + voice.name : t('voiceNo');
      el.classList.toggle('is-warn', !voice);
    }
  }
  function speak(text, onEnd) {
    if (!voice || !synth) { if (onEnd) setTimeout(onEnd, 0); return false; }
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = store.rate || 0.8;
    if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
    synth.speak(u);
    return true;
  }
  function stopAudio() { if (synth) synth.cancel(); }
  function sayBtn(text, cls) {
    return '<button type="button" class="kcm-say ' + (cls || '') + '" data-say="' + esc(text) + '" aria-label="' + esc(t('listen')) + '">' + ICON.say + '</button>';
  }

  /* ============================================================== RAIL */
  var rail = $('#kcmOutline'), side = $('#kcmSide');
  function buildRail() {
    var h = '<a class="kcm-rl-top" href="#lessons" data-r="lessons">' + esc(t('all')) + '</a>' +
            '<a class="kcm-rl-top" href="#pronunciation" data-r="pronunciation">' + esc(t('keyNav')) + '</a>';
    CH.forEach(function (c, ci) {
      var list = SITS.filter(function (s) { return s.ch === ci; });
      var nDone = list.filter(function (s) { return isDone(s.n); }).length;
      h += '<div class="kcm-rg" data-ch="' + ci + '"><button type="button" class="kcm-rg-head" aria-expanded="false">' +
        '<span class="num">' + (ci + 1) + '</span><span class="nm"><span>' + esc(c.en) + '</span><small class="kh">' + esc(c.km) + '</small></span>' +
        '<span class="cnt">' + nDone + '/' + list.length + '</span>' + ICON.chev + '</button><ul>';
      list.forEach(function (s) {
        h += '<li><a href="#s-' + s.n + '" data-r="s-' + s.n + '"' + (isDone(s.n) ? ' class="is-done"' : '') + '><span class="n">' + pad(s.n) +
          '</span><span class="tt">' + esc(s.title) + '</span>' + (isDone(s.n) ? '<span class="ok">' + ICON.check + '</span>' : '') + '</a></li>';
      });
      h += '</ul></div>';
    });
    rail.innerHTML = h;
  }
  rail.addEventListener('click', function (e) {
    var head = e.target.closest('.kcm-rg-head');
    if (head) { var ex = head.getAttribute('aria-expanded') === 'true'; head.setAttribute('aria-expanded', ex ? 'false' : 'true'); return; }
    if (e.target.closest('a') && window.innerWidth < 1080) setSide(false);
  });
  function markRail(route) {
    $$('a', rail).forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-r') === route); });
    var here = $('a.is-here', rail);
    if (here) {
      var g = here.closest('.kcm-rg');
      if (g) {
        $('.kcm-rg-head', g).setAttribute('aria-expanded', 'true');
        if (window.innerWidth >= 1080) {
          var top = here.offsetTop - rail.offsetTop, h = rail.clientHeight;
          if (top < rail.scrollTop || top > rail.scrollTop + h - 40) rail.scrollTop = top - h / 3;
        }
      }
    }
  }
  function setSide(open) {
    side.classList.toggle('is-collapsed', !open);
    $('#kcmSideToggle').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  $('#kcmSideToggle').addEventListener('click', function () { setSide(side.classList.contains('is-collapsed')); });
  if (window.innerWidth < 1080) setSide(false);

  /* ========================================================= TOOLBAR */
  function syncToggles() {
    var root = $('#kcmMain');
    root.classList.toggle('hide-rom', !store.rom);
    root.classList.toggle('hide-en', !store.en);
    $('#kcmRom').setAttribute('aria-pressed', store.rom ? 'true' : 'false');
    $('#kcmEn').setAttribute('aria-pressed', store.en ? 'true' : 'false');
    $$('#kcmSpeed button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-rate') === +store.rate)); });
  }
  $('#kcmRom').addEventListener('click', function () { store.rom = !store.rom; save(); syncToggles(); });
  $('#kcmEn').addEventListener('click', function () { store.en = !store.en; save(); syncToggles(); });
  $('#kcmSpeed').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    store.rate = +b.getAttribute('data-rate'); save(); syncToggles();
  });

  /* ============================================================ VIEWS */
  var view = $('#kcmView');
  var player = null;          // the running conversation player, if any
  var lazyObs = null;

  function route() {
    stopAudio(); if (player) { player.stop(); player = null; }
    var h = (location.hash || '').replace('#', '');
    var m = /^s-(\d{1,3})(?:\/(learn|cards|quiz|role))?$/.exec(h);
    if (m && +m[1] >= 1 && +m[1] <= SITS.length) { renderLesson(+m[1], m[2] || 'learn'); markRail('s-' + m[1]); }
    else if (h === 'pronunciation') { renderKey(); markRail('pronunciation'); }
    else { renderOverview(); markRail('lessons'); }
  }

  function scrollTop() {
    var y = $('#kcmTop').getBoundingClientRect().top + window.pageYOffset - 90;
    if (window.pageYOffset > y) window.scrollTo({ top: y, behavior: 'auto' });
  }

  /* ----------------------------------------------------------- overview */
  function renderOverview() {
    var nDone = SITS.filter(function (s) { return isDone(s.n); }).length;
    var pct = Math.round(nDone / SITS.length * 100);
    var cont = store.last && store.last <= SITS.length ? store.last : 0;
    var h = '<div class="kcm-ov-head">' +
      '<div class="kcm-prog"><div class="kcm-prog-txt"><b>' + esc(t('progress', nDone, SITS.length)) + '</b><span>' + pct + '%</span></div>' +
      '<div class="kcm-prog-bar"><span style="width:' + pct + '%"></span></div></div>' +
      '<a class="btn btn--primary kcm-go" href="#s-' + (cont || 1) + '">' + esc(cont ? t('continueL', cont) : t('startL')) + ICON.right + '</a></div>';

    h += '<div class="kcm-how"><h2>' + esc(t('howH')) + '</h2><ol>' +
      ['how1', 'how2', 'how3', 'how4', 'how5'].map(function (k, i) { return '<li><span class="n">' + (i + 1) + '</span>' + esc(t(k)) + '</li>'; }).join('') + '</ol></div>';

    h += '<label class="kcm-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
      '<input type="search" id="kcmFind" placeholder="' + esc(t('search')) + '" aria-label="' + esc(t('search')) + '"></label>' +
      '<p class="kcm-nomatch" id="kcmNoMatch" hidden>' + esc(t('noMatch')) + '</p>';

    CH.forEach(function (c, ci) {
      var list = SITS.filter(function (s) { return s.ch === ci; });
      h += '<section class="kcm-chap" data-ch="' + ci + '"><header><span class="kcm-chap-n">' + esc(t('chapter')) + ' ' + (ci + 1) + '</span>' +
        '<h2>' + esc(c.en) + '</h2><span class="kh">' + esc(c.km) + '</span>' +
        '<span class="kcm-chap-r">' + esc(t('situations', list[0].n, list[list.length - 1].n)) + '</span></header><div class="kcm-grid">';
      list.forEach(function (s) {
        var hay = (s.title + ' ' + s.titleKm + ' ' + plain(s.scene) + ' ' + c.en + ' ' + s.phrases.map(function (p) { return plain(p.en); }).join(' ')).toLowerCase();
        h += '<a class="kcm-card' + (isDone(s.n) ? ' is-done' : '') + '" href="#s-' + s.n + '" data-find="' + esc(hay) + '">' +
          '<span class="kcm-thumb" data-scene="' + s.n + '"></span>' +
          '<span class="kcm-card-b"><span class="kcm-card-n">' + esc(t('lesson')) + ' ' + s.n + '</span>' +
          '<span class="kcm-card-t">' + esc(s.title) + '</span><span class="kcm-card-k kh">' + esc(s.titleKm) + '</span>' +
          '<span class="kcm-card-f">' + starRow(best(s.n)) + (isDone(s.n) ? '<span class="kcm-done">' + ICON.check + esc(t('done')) + '</span>' : '') + '</span></span></a>';
      });
      h += '</div></section>';
    });
    h += '<p class="kcm-credit">' + esc(t('by')) + '</p>';
    view.innerHTML = h;
    lazyScenes();

    var find = $('#kcmFind');
    find.addEventListener('input', function () {
      var q = find.value.trim().toLowerCase(), any = false;
      $$('.kcm-chap', view).forEach(function (sec) {
        var vis = 0;
        $$('.kcm-card', sec).forEach(function (a) { var ok = !q || a.getAttribute('data-find').indexOf(q) >= 0 || $('.kcm-card-n', a).textContent.toLowerCase() === (t('lesson') + ' ' + q).toLowerCase(); a.hidden = !ok; if (ok) vis++; });
        sec.hidden = !vis; if (vis) any = true;
      });
      $('#kcmNoMatch').hidden = any;
    });
  }

  function lazyScenes() {
    var els = $$('[data-scene]', view);
    function paint(el) { el.innerHTML = S.svg(+el.getAttribute('data-scene'), { label: sit(+el.getAttribute('data-scene')).title }); el.removeAttribute('data-scene'); }
    if (!('IntersectionObserver' in window)) { els.forEach(paint); return; }
    if (lazyObs) lazyObs.disconnect();
    lazyObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { paint(en.target); lazyObs.unobserve(en.target); } });
    }, { rootMargin: '300px' });
    els.forEach(function (el) { lazyObs.observe(el); });
  }

  /* --------------------------------------------------- pronunciation key */
  function renderKey() {
    var h = '<div class="kcm-block"><h2 class="kcm-h2">' + esc(t('keyH')) + '</h2><p class="kcm-lede">' + esc(t('keyP')) + '</p><div class="kcm-key">';
    D.key.forEach(function (k) { h += '<div class="kcm-key-row"><span class="sym">' + k.sym + '</span><span class="exp">' + k.exp + '</span></div>'; });
    h += '</div><p class="kcm-lede" style="margin-top:1.2rem">' + esc(lang() === 'km' ? 'ឧទាហរណ៍៖' : 'Example:') + ' <span class="kh">ជម្រាបសួរ</span> — <span class="ro">chom-<b>RIEP</b> suor</span> (Hello)</p>' +
      '<a class="btn btn--primary" href="#s-1">' + esc(t('keyGo')) + ICON.right + '</a></div>';
    view.innerHTML = h;
  }

  /* ============================================================ LESSON */
  function renderLesson(n, tab) {
    var s = sit(n), c = CH[s.ch];
    store.last = n; save();
    var tabs = [['learn', t('learn')], ['cards', t('cards')], ['quiz', t('quiz')], ['role', t('role')]];
    var h = '<div class="kcm-lhead">' +
      '<a class="kcm-back" href="#lessons">' + ICON.left + esc(t('all')) + '</a>' +
      '<div class="kcm-lh-meta"><span class="kcm-badge">' + esc(t('lesson')) + ' ' + s.n + '</span><span>' + esc(t('chapter')) + ' ' + (s.ch + 1) + ' · ' + esc(c.en) + '</span></div>' +
      '<h2 class="kcm-ltitle">' + esc(s.title) + '</h2><div class="kcm-ltitle-kh kh">' + esc(s.titleKm) + '</div>' +
      (isDone(n) ? '<div class="kcm-lh-done">' + starRow(best(n)) + '<span class="kcm-done">' + ICON.check + esc(t('done')) + '</span></div>' : '') +
      '</div>';
    h += '<div class="kcm-tabs" role="tablist">' + tabs.map(function (x) {
      return '<a role="tab" href="#s-' + n + (x[0] === 'learn' ? '' : '/' + x[0]) + '" aria-selected="' + (x[0] === tab) + '">' + esc(x[1]) + '</a>';
    }).join('') + '</div><div class="kcm-tabbody" id="kcmTab"></div>';
    h += '<nav class="kcm-pn">' +
      (n > 1 ? '<a href="#s-' + (n - 1) + '" class="prev">' + ICON.left + '<span><small>' + esc(t('prevLesson')) + '</small>' + esc(sit(n - 1).title) + '</span></a>' : '<span></span>') +
      (n < SITS.length ? '<a href="#s-' + (n + 1) + '" class="next"><span><small>' + esc(t('nextLesson')) + '</small>' + esc(sit(n + 1).title) + '</span>' + ICON.right + '</a>' : '<span></span>') +
      '</nav><p class="kcm-credit">' + esc(t('by')) + '</p>';
    view.innerHTML = h;
    var body = $('#kcmTab');
    if (tab === 'cards') renderCards(s, body);
    else if (tab === 'quiz') renderQuiz(s, body);
    else if (tab === 'role') renderRole(s, body);
    else renderLearn(s, body);
  }

  /* ------------------------------------------------------- scene player */
  function stageHtml(s) {
    return '<div class="kcm-stage" id="kcmStage">' + S.svg(s.n, { label: s.title }) +
      '<div class="kcm-bubble" id="kcmBubble" hidden></div></div>';
  }
  function showBubble(stage, turn) {
    var b = $('.kcm-bubble', stage), svg = $('svg', stage);
    $$('.kp-you, .kp-them', svg).forEach(function (g) { g.classList.remove('is-talking'); });
    if (!turn) { b.hidden = true; return; }
    var g = $(isYou(turn) ? '.kp-you' : '.kp-them', svg);
    if (g) { g.classList.remove('is-talking'); void g.getBoundingClientRect(); g.classList.add('is-talking'); }
    b.className = 'kcm-bubble ' + (isYou(turn) ? 'is-you' : 'is-them');
    b.innerHTML = '<span class="kh">' + esc(turn.kh) + '</span><span class="ro">' + turn.ro + '</span><span class="en">' + turn.en + '</span>';
    b.hidden = false;
  }

  function Player(s, stage, list, btn) {
    var i = -1, on = false, timer = null;
    function mark() {
      $$('.kcm-line', list).forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
    }
    function step() {
      if (!on) return;
      i++;
      if (i >= s.dialogue.length) { stop(); return; }
      var turn = s.dialogue[i];
      showBubble(stage, turn); mark();
      var wait = Math.max(2200, turn.kh.length * 120);
      if (!speak(turn.kh, function () { if (on) timer = setTimeout(step, 700); })) timer = setTimeout(step, wait);
    }
    function play() { if (i >= s.dialogue.length - 1) i = -1; on = true; setBtn(); step(); }
    function stop() { on = false; clearTimeout(timer); stopAudio(); setBtn(); }
    function setBtn() { btn.innerHTML = (on ? ICON.pause + esc(t('pause')) : ICON.play + esc(t('play'))); btn.classList.toggle('is-on', on); }
    function jump(k) { stop(); i = k; showBubble(stage, s.dialogue[k]); mark(); speak(s.dialogue[k].kh); }
    setBtn();
    return { play: play, stop: stop, toggle: function () { on ? stop() : play(); }, jump: jump };
  }

  /* --------------------------------------------------------------- learn */
  function lineHtml(turn, k) {
    var you = isYou(turn);
    return '<li class="kcm-line ' + (you ? 'is-you' : 'is-them') + '" data-k="' + k + '" tabindex="0">' +
      '<span class="who">' + esc(you ? t('you') : turn.who) + (turn.note ? ' <em>' + esc(turn.note) + '</em>' : '') + '</span>' +
      '<span class="txt"><span class="kh">' + esc(turn.kh) + '</span><span class="ro">' + turn.ro + '</span><span class="en">' + turn.en + '</span></span>' +
      sayBtn(turn.kh, 'kcm-say--sm') + '</li>';
  }
  function renderLearn(s, body) {
    var h = '<div class="kcm-scene-wrap">' + stageHtml(s) +
      '<div class="kcm-scene-bar"><button type="button" class="btn btn--primary kcm-playbtn" id="kcmPlay"></button><span>' + esc(t('tapLine')) + '</span></div></div>';
    // Most goals repeat the scene word for word; then list what they will say.
    var goal = plain(s.goal) !== plain(s.scene) ? s.goal
      : esc(t('willSay')) + ' ' + s.phrases.slice(0, 4).map(function (p) { return '“' + esc(plain(p.en).replace(/\s*\([^)]*\)/g, '')) + '”'; }).join(', ') + '…';
    h += '<div class="kcm-goal"><b>' + esc(t('goal')) + '</b> ' + goal + '</div>';
    h += '<p class="kcm-story">' + s.scene + '</p>';
    h += '<section class="kcm-block"><h3 class="kcm-h3">' + esc(t('dialogue')) + '</h3><ol class="kcm-dlg" id="kcmDlg">' +
      s.dialogue.map(lineHtml).join('') + '</ol></section>';
    if (s.sayit) h += '<aside class="kcm-note kcm-note--say"><b>' + esc(t('sayit')) + '</b><p>' + s.sayit + '</p></aside>';
    h += '<section class="kcm-block"><h3 class="kcm-h3">' + esc(t('phrases')) + '</h3><ul class="kcm-phr">' +
      s.phrases.map(function (p) {
        return '<li><span class="en">' + p.en + '</span><span class="kh">' + esc(p.kh) + '</span><span class="ro">' + p.ro + '</span>' + sayBtn(p.kh, 'kcm-say--sm') + '</li>';
      }).join('') + '</ul></section>';
    s.tips.forEach(function (tp) {
      h += '<aside class="kcm-note' + (tp.culture ? ' kcm-note--culture' : '') + '"><b>' + esc(tp.culture ? t('culture') : t('tip')) + ' · ' + esc(tp.label) + '</b><p>' + tp.html + '</p></aside>';
    });
    h += '<a class="btn btn--primary kcm-nextstep" href="#s-' + s.n + '/cards">' + esc(t('nextStep')) + ICON.right + '</a>';
    body.innerHTML = h;
    var stage = $('#kcmStage'), list = $('#kcmDlg');
    player = Player(s, stage, list, $('#kcmPlay'));
    $('#kcmPlay').addEventListener('click', function () { player.toggle(); });
    function jumpFrom(e) {
      if (e.target.closest('.kcm-say')) return;
      var li = e.target.closest('.kcm-line'); if (!li) return;
      player.jump(+li.getAttribute('data-k'));
      if (window.innerWidth < 760) stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    list.addEventListener('click', jumpFrom);
    list.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jumpFrom(e); } });
  }

  /* ---------------------------------------------------------- flashcards */
  function renderCards(s, body) {
    var dir = 'enkm', deck, idx, knew, firstTry;
    function reset(sh) { deck = (sh ? shuffle(s.phrases) : s.phrases.slice()).map(function (p) { return { p: p, again: false }; }); idx = 0; knew = 0; firstTry = deck.length; draw(); }
    function face(p, side) {
      if ((dir === 'enkm') === (side === 'front')) return '<span class="kcm-fc-en">' + p.en + '</span>';
      return '<span class="kh kcm-fc-kh">' + esc(p.kh) + '</span><span class="ro kcm-fc-ro">' + p.ro + '</span>';
    }
    function draw() {
      if (idx >= deck.length) {
        body.innerHTML = '<div class="kcm-result">' + '<div class="kcm-result-ico">' + ICON.check + '</div><h3>' + esc(t('cardsDone')) + '</h3><p>' + esc(t('cardsKnew', knew, firstTry)) +
          '</p><div class="kcm-row"><button type="button" class="btn btn--ghost" id="kcmAgain">' + esc(t('restart')) + '</button>' +
          '<a class="btn btn--primary" href="#s-' + s.n + '/quiz">' + esc(t('toQuiz')) + ICON.right + '</a></div></div>';
        $('#kcmAgain').addEventListener('click', function () { reset(true); });
        return;
      }
      var p = deck[idx].p;
      body.innerHTML = '<div class="kcm-fc-top"><div class="kcm-seg" role="group">' +
        '<button type="button" data-dir="enkm" aria-pressed="' + (dir === 'enkm') + '">' + esc(t('dirEnKm')) + '</button>' +
        '<button type="button" data-dir="kmen" aria-pressed="' + (dir === 'kmen') + '">' + esc(t('dirKmEn')) + '</button></div>' +
        '<button type="button" class="kcm-chipbtn" id="kcmShuf">' + esc(t('shuffle')) + '</button>' +
        '<span class="kcm-count">' + (idx + 1) + ' / ' + deck.length + '</span></div>' +
        '<div class="kcm-mini-bar"><span style="width:' + (idx / deck.length * 100) + '%"></span></div>' +
        '<button type="button" class="kcm-fc" id="kcmCard" aria-live="polite"><span class="kcm-fc-in">' +
        '<span class="kcm-fc-side front">' + face(p, 'front') + '<small>' + esc(t('tapFlip')) + '</small></span>' +
        '<span class="kcm-fc-side back">' + face(p, 'back') + '<span class="kcm-fc-sm">' + (dir === 'enkm' ? p.en : '') + '</span></span>' +
        '</span></button>' +
        '<div class="kcm-row kcm-fc-acts">' + sayBtn(p.kh) +
        '<button type="button" class="btn btn--ghost" id="kcmNo">' + esc(t('again')) + '</button>' +
        '<button type="button" class="btn btn--primary" id="kcmYes">' + ICON.check + esc(t('know')) + '</button></div>';
      var card = $('#kcmCard');
      card.addEventListener('click', function () { card.classList.toggle('is-flipped'); if (card.classList.contains('is-flipped') && dir === 'enkm') speak(p.kh); });
      $$('.kcm-seg button', body).forEach(function (b) { b.addEventListener('click', function () { dir = b.getAttribute('data-dir'); draw(); }); });
      $('#kcmShuf').addEventListener('click', function () { reset(true); });
      $('#kcmYes').addEventListener('click', function () { if (!deck[idx].again) knew++; idx++; draw(); });
      $('#kcmNo').addEventListener('click', function () { var c = deck[idx]; c.again = true; deck.push({ p: c.p, again: true }); idx++; draw(); });
    }
    reset(false);
  }

  /* ---------------------------------------------------------------- quiz */
  function buildQuiz(s) {
    var qs = [];
    var phr = shuffle(s.phrases.filter(function (p, i, a) { return a.findIndex(function (q) { return q.kh === p.kh; }) === i; }));
    var pool = phr.slice();
    // neighbours supply extra distractors when a lesson is short
    var near = SITS.filter(function (x) { return x.ch === s.ch && x.n !== s.n; });
    near.forEach(function (x) { x.phrases.forEach(function (p) { if (!pool.some(function (q) { return q.kh === p.kh || plain(q.en) === plain(p.en); })) pool.push(p); }); });
    function opts(ans, key) {
      var o = [ans], others = shuffle(pool.filter(function (p) { return p !== ans; }));
      for (var i = 0; i < others.length && o.length < 4; i++) {
        if (!o.some(function (x) { return x[key] === others[i][key] || plain(x.en) === plain(others[i].en); })) o.push(others[i]);
      }
      return shuffle(o);
    }
    phr.slice(0, 7).forEach(function (p, i) {
      if (i % 2 === 0) qs.push({ type: 'enkm', ans: p, opts: opts(p, 'kh') });
      else qs.push({ type: 'kmen', ans: p, opts: opts(p, 'en') });
    });
    // dialogue replies: what does "You" say after the other person?
    var youLines = [];
    s.dialogue.forEach(function (d, i) { if (isYou(d) && i > 0 && !isYou(s.dialogue[i - 1])) youLines.push({ prev: s.dialogue[i - 1], ans: d }); });
    var allYou = [];
    SITS.forEach(function (x) { if (Math.abs(x.n - s.n) <= 6) x.dialogue.forEach(function (d) { if (isYou(d)) allYou.push(d); }); });
    shuffle(youLines).slice(0, 3).forEach(function (y) {
      var o = [y.ans], others = shuffle(allYou.filter(function (d) { return d.kh !== y.ans.kh; }));
      for (var i = 0; i < others.length && o.length < 4; i++) if (!o.some(function (x) { return x.kh === others[i].kh; })) o.push(others[i]);
      qs.push({ type: 'reply', prev: y.prev, ans: y.ans, opts: shuffle(o) });
    });
    return qs;
  }
  function renderQuiz(s, body) {
    var qs = buildQuiz(s), i = 0, score = 0;
    function optHtml(q, o, k) {
      var inner = (q.type === 'kmen') ? '<span class="en">' + o.en + '</span>'
        : '<span class="kh">' + esc(o.kh) + '</span><span class="ro">' + o.ro + '</span>';
      return '<button type="button" class="kcm-opt" data-k="' + k + '"><span class="l">' + 'ABCD'[k] + '</span><span class="b">' + inner + '</span></button>';
    }
    function draw() {
      if (i >= qs.length) return result();
      var q = qs[i], prompt;
      if (q.type === 'enkm') prompt = '<p class="kcm-q-ask">' + esc(t('qPickKm')) + '</p><div class="kcm-q-big">' + q.ans.en + '</div>';
      else if (q.type === 'kmen') prompt = '<p class="kcm-q-ask">' + esc(t('qPickEn')) + '</p><div class="kcm-q-big"><span class="kh">' + esc(q.ans.kh) + '</span>' + sayBtn(q.ans.kh) + '<span class="ro">' + q.ans.ro + '</span></div>';
      else prompt = '<p class="kcm-q-ask">' + esc(t('qReply')) + '</p><div class="kcm-q-dlg"><span class="who">' + esc(q.prev.who) + '</span><span class="kh">' + esc(q.prev.kh) + '</span><span class="ro">' + q.prev.ro + '</span><span class="en">' + q.prev.en + '</span></div>' +
        '<p class="kcm-q-want">' + esc(t('qWant')) + ' <b>“' + plain(q.ans.en) + '”</b></p>';
      body.innerHTML = '<div class="kcm-quiz"><div class="kcm-fc-top"><span class="kcm-count">' + esc(t('qOf', i + 1, qs.length)) + '</span><span class="kcm-scorepill">' + score + ' ' + ICON.check + '</span></div>' +
        '<div class="kcm-mini-bar"><span style="width:' + (i / qs.length * 100) + '%"></span></div>' + prompt +
        '<div class="kcm-opts">' + q.opts.map(function (o, k) { return optHtml(q, o, k); }).join('') + '</div>' +
        '<div class="kcm-feedback" id="kcmFb" aria-live="polite"></div></div>';
      $$('.kcm-opt', body).forEach(function (b) { b.addEventListener('click', function () { answer(+b.getAttribute('data-k')); }); });
    }
    function answer(k) {
      var q = qs[i], ok = q.opts[k] === q.ans;
      $$('.kcm-opt', body).forEach(function (b, j) {
        b.disabled = true;
        if (q.opts[j] === q.ans) b.classList.add('is-right');
        else if (j === k) b.classList.add('is-wrong');
      });
      if (ok) score++;
      speak(q.ans.kh);
      var fb = $('#kcmFb');
      fb.className = 'kcm-feedback ' + (ok ? 'ok' : 'no');
      fb.innerHTML = '<span>' + esc(ok ? praise() : t('wrong')) + '</span><button type="button" class="btn btn--primary" id="kcmNext">' + esc(i + 1 < qs.length ? t('next') : t('finish')) + ICON.right + '</button>';
      $('#kcmNext').addEventListener('click', function () { i++; draw(); });
      $('#kcmNext').focus();
    }
    function result() {
      var pct = Math.round(score / qs.length * 100);
      if (pct > best(s.n)) { store.best[s.n] = pct; save(); buildRail(); markRail('s-' + s.n); }
      var pass = pct >= 70;
      body.innerHTML = '<div class="kcm-result ' + (pass ? 'is-pass' : '') + '">' + starRow(pct, 'kcm-stars--lg') +
        '<h3>' + esc(t('score', score, qs.length)) + '</h3><p>' + esc(pass ? t('passMsg') : t('failMsg')) + '</p>' +
        '<div class="kcm-row"><button type="button" class="btn btn--ghost" id="kcmRetry">' + esc(t('retry')) + '</button>' +
        (pass ? '<a class="btn btn--ghost" href="#s-' + s.n + '/role">' + esc(t('role')) + '</a>' : '<a class="btn btn--ghost" href="#s-' + s.n + '">' + esc(t('learn')) + '</a>') +
        (s.n < SITS.length ? '<a class="btn btn--primary" href="#s-' + (s.n + 1) + '">' + esc(t('nextLesson')) + ICON.right + '</a>' : '') + '</div></div>';
      $('#kcmRetry').addEventListener('click', function () { renderQuiz(s, body); });
    }
    draw();
  }

  /* ----------------------------------------------------------- role-play */
  function renderRole(s, body, asOther) {
    var other = otherName(s);
    var mine = function (d) { return asOther ? !isYou(d) : isYou(d); };
    var h = '<div class="kcm-role-top"><span class="kcm-q-ask">' + esc(t('rolePick')) + '</span><div class="kcm-seg" role="group">' +
      '<button type="button" data-o="0" aria-pressed="' + !asOther + '">' + esc(t('you')) + '</button>' +
      '<button type="button" data-o="1" aria-pressed="' + !!asOther + '">' + esc(other) + '</button></div></div>' +
      '<p class="kcm-lede">' + esc(t('roleHow')) + '</p>' + stageHtml(s) +
      '<ol class="kcm-chat" id="kcmChat"></ol><div class="kcm-role-act" id="kcmAct"></div>';
    body.innerHTML = h;
    $$('.kcm-role-top .kcm-seg button', body).forEach(function (b) { b.addEventListener('click', function () { stopAudio(); renderRole(s, body, b.getAttribute('data-o') === '1'); }); });
    var chat = $('#kcmChat'), act = $('#kcmAct'), stage = $('#kcmStage'), i = 0, good = 0, total = s.dialogue.filter(mine).length;
    function add(d, isMine) {
      var li = document.createElement('li');
      li.className = 'kcm-msg ' + (isMine ? 'is-me' : 'is-them');
      li.innerHTML = '<span class="who">' + esc(isYou(d) ? t('you') : d.who) + '</span><span class="kh">' + esc(d.kh) + '</span><span class="ro">' + d.ro + '</span><span class="en">' + d.en + '</span>';
      chat.appendChild(li);
      showBubble(stage, d);
    }
    function step() {
      setTimeout(function () { act.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 30);
      if (i >= s.dialogue.length) {
        act.innerHTML = '<div class="kcm-result is-pass"><h3>' + esc(t('roleDone')) + '</h3><p>' + esc(t('roleScore', good, total)) + '</p>' +
          '<div class="kcm-row"><button type="button" class="btn btn--ghost" id="kcmR1">' + esc(t('restart')) + '</button>' +
          '<button type="button" class="btn btn--primary" id="kcmR2">' + esc(t('roleSwap')) + '</button></div></div>';
        $('#kcmR1').addEventListener('click', function () { renderRole(s, body, asOther); });
        $('#kcmR2').addEventListener('click', function () { renderRole(s, body, !asOther); });
        return;
      }
      var d = s.dialogue[i];
      if (!mine(d)) {
        add(d, false); speak(d.kh); i++;
        act.innerHTML = '<button type="button" class="btn btn--primary" id="kcmGo">' + esc(t('cont')) + ICON.right + '</button>';
        $('#kcmGo').addEventListener('click', step); $('#kcmGo').focus({ preventScroll: true });
        return;
      }
      showBubble(stage, null);
      act.innerHTML = '<div class="kcm-turn"><span class="kcm-q-ask">' + esc(t('yourTurn')) + '</span><div class="kcm-turn-en">“' + plain(d.en) + '”</div>' +
        '<button type="button" class="btn btn--primary" id="kcmShow">' + esc(t('reveal')) + '</button></div>';
      $('#kcmShow').addEventListener('click', function () {
        add(d, true); speak(d.kh); i++;
        act.innerHTML = '<div class="kcm-row"><button type="button" class="btn btn--ghost" id="kcmMiss">' + esc(t('missed')) + '</button>' +
          '<button type="button" class="btn btn--primary" id="kcmHit">' + ICON.check + esc(t('gotIt')) + '</button></div>';
        $('#kcmHit').addEventListener('click', function () { good++; step(); });
        $('#kcmMiss').addEventListener('click', step);
      });
    }
    var start = '<button type="button" class="btn btn--primary" id="kcmStart">' + ICON.play + esc(t('roleStart')) + '</button>';
    act.innerHTML = start;
    $('#kcmStart').addEventListener('click', step);
  }

  /* =============================================================== boot */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.kcm-say'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    $$('.kcm-say.is-on').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    speak(b.getAttribute('data-say'), function () { b.classList.remove('is-on'); });
  }, true);

  window.addEventListener('hashchange', function () { route(); scrollTop(); });
  document.addEventListener('aa:langchange', function () { buildRail(); route(); refreshVoice(); });
  if (synth && 'onvoiceschanged' in synth) synth.addEventListener('voiceschanged', refreshVoice);

  buildRail();
  syncToggles();
  refreshVoice();
  route();
})();
