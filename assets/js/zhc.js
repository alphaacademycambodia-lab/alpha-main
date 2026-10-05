/* Alpha Academy Cambodia — Chinese–English Daily Conversation
   ---------------------------------------------------------------------------
   A self-study speaking course in Mandarin: 100 everyday situations, each
   with an illustrated scene, the conversation in characters + pinyin +
   English (+ Khmer when the site is switched to Khmer), key phrases and four
   ways to practise. Built on the same pattern as Khmer Conversational
   Mastery (kcm.js) and reuses its stylesheet and scene artist.

   Views, chosen by the URL hash so every lesson can be linked to:
     (none) / #lessons     all lessons, grouped by chapter, with progress
     #pinyin               how to read pinyin and the four tones
     #s-12                 situation 12 — tabs: Learn, Flashcards, Quiz, Role-play

   Data:   window.ZHC        (assets/js/zhc-bank.js)
   Art:    window.KCMScene   (assets/js/kcm-scenes.js) — each lesson passes its
           own `art` spec, so the two courses share one illustrator.
   Saved:  localStorage 'aa-zhc-v1' — best quiz score per lesson, the last
           lesson opened, and the display toggles. Only in this browser.

   Audio:  the browser's own Chinese (zh) speech voice. Always speak the
           characters (`hz`), never the pinyin — a Chinese voice reads
           pinyin as Latin letters.                                         */
(function (global) {
  'use strict';

  var D = global.ZHC, S = global.KCMScene;
  if (!D || !S) return;
  var SITS = D.sits, CH = D.chapters;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ language */
  var T = {
    all:        { en: 'All lessons', km: 'មេរៀនទាំងអស់' },
    keyNav:     { en: 'Pinyin & the four tones', km: 'ពិនអ៊ីន និងសំនៀងទាំងបួន' },
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
    tapLine:    { en: 'Tap any line to hear it and see it in the picture.', km: 'ចុចលើប្រយោគណាមួយ ដើម្បីស្តាប់ និងមើលវាក្នុងរូបភាព។' },
    dialogue:   { en: 'The conversation', km: 'ការសន្ទនា' },
    phrases:    { en: 'Key phrases', km: 'ឃ្លាសំខាន់ៗ' },
    tip:        { en: 'Tip', km: 'គន្លឹះ' },
    culture:    { en: 'Culture', km: 'វប្បធម៌' },
    nextStep:   { en: 'Ready? Practise with the flashcards', km: 'រួចរាល់ហើយ? ហាត់ជាមួយកាតពាក្យ' },
    you:        { en: 'You', km: 'អ្នក' },
    voiceOk:    { en: 'Chinese voice: ', km: 'សំឡេងចិន៖ ' },
    voiceNo:    { en: 'No Chinese voice on this device — read the pinyin, or open the page in Chrome, Edge or Safari.', km: 'ឧបករណ៍នេះគ្មានសំឡេងចិនទេ — សូមអានពិនអ៊ីន ឬបើកទំព័រនេះក្នុង Chrome, Edge ឬ Safari។' },
    listen:     { en: 'Listen', km: 'ស្តាប់' },
    // flashcards
    dirEnZh:    { en: 'English → Chinese', km: 'អត្ថន័យ → ចិន' },
    dirZhEn:    { en: 'Chinese → English', km: 'ចិន → អត្ថន័យ' },
    tapFlip:    { en: 'Tap the card to turn it over', km: 'ចុចលើកាតដើម្បីបង្វិល' },
    again:      { en: 'Still learning', km: 'កំពុងរៀន' },
    know:       { en: 'I know it', km: 'ខ្ញុំចេះហើយ' },
    shuffle:    { en: 'Shuffle', km: 'លាយ' },
    cardsDone:  { en: 'Deck finished!', km: 'ចប់កាតហើយ!' },
    cardsKnew:  { en: 'You knew {a} of {b} at the first try.', km: 'អ្នកចេះ {a} ក្នុងចំណោម {b} នៅលើកដំបូង។' },
    restart:    { en: 'Start again', km: 'ចាប់ផ្តើមម្តងទៀត' },
    toQuiz:     { en: 'Take the quiz', km: 'ធ្វើតេស្ត' },
    // quiz
    qPickZh:    { en: 'How do you say this in Chinese?', km: 'តើនិយាយជាភាសាចិនដូចម្តេច?' },
    qPickEn:    { en: 'What does this mean?', km: 'តើនេះមានន័យថាអ្វី?' },
    qReply:     { en: 'What do you say next?', km: 'តើអ្នកនិយាយអ្វីបន្ទាប់?' },
    qWant:      { en: 'You want to say:', km: 'អ្នកចង់និយាយថា៖' },
    qOf:        { en: 'Question {a} of {b}', km: 'សំណួរទី {a} នៃ {b}' },
    next:       { en: 'Next', km: 'បន្ទាប់' },
    finish:     { en: 'See my score', km: 'មើលពិន្ទុ' },
    right:      ['Great job!', 'Correct!', 'Excellent!', 'Well done!', '太棒了! Perfect!'],
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
    yourTurn:   { en: 'Your turn — say it in Chinese:', km: 'វេនអ្នក — និយាយជាភាសាចិន៖' },
    reveal:     { en: 'Show the answer', km: 'បង្ហាញចម្លើយ' },
    gotIt:      { en: 'I said it right', km: 'ខ្ញុំនិយាយត្រូវ' },
    missed:     { en: 'I need practice', km: 'ខ្ញុំត្រូវហាត់បន្ថែម' },
    cont:       { en: 'Continue', km: 'បន្ត' },
    roleDone:   { en: 'Conversation finished!', km: 'ការសន្ទនាបានបញ្ចប់!' },
    roleScore:  { en: 'You said {a} of {b} of your lines right.', km: 'អ្នកនិយាយត្រូវ {a} ក្នុងចំណោម {b} ប្រយោគរបស់អ្នក។' },
    roleSwap:   { en: 'Now swap parts', km: 'ឥឡូវប្តូរតួ' },
    roleStart:  { en: 'Start', km: 'ចាប់ផ្តើម' },
    roleHow:    { en: 'Listen to the other person’s line, then say your answer out loud before you check it.', km: 'ស្តាប់ប្រយោគរបស់ម្នាក់ទៀត បន្ទាប់មកនិយាយចម្លើយរបស់អ្នកឱ្យឮ មុនពេលពិនិត្យ។' },
    // overview
    progress:   { en: '{a} of {b} lessons complete', km: 'បានបញ្ចប់ {a} នៃ {b} មេរៀន' },
    continueL:  { en: 'Continue lesson {a}', km: 'បន្តមេរៀនទី {a}' },
    startL:     { en: 'Start lesson 1', km: 'ចាប់ផ្តើមមេរៀនទី ១' },
    search:     { en: 'Search lessons — e.g. taxi, 吃饭, doctor', km: 'ស្វែងរកមេរៀន — ឧ. តាក់ស៊ី 吃饭 គ្រូពេទ្យ' },
    noMatch:    { en: 'No lesson matches that search.', km: 'គ្មានមេរៀនត្រូវនឹងការស្វែងរកនេះទេ។' },
    howH:       { en: 'How each lesson works', km: 'របៀបរៀនមេរៀននីមួយៗ' },
    how1:       { en: 'Watch and listen to the conversation', km: 'មើល និងស្តាប់ការសន្ទនា' },
    how2:       { en: 'Learn the key phrases', km: 'រៀនឃ្លាសំខាន់ៗ' },
    how3:       { en: 'Practise with flashcards', km: 'ហាត់ជាមួយកាតពាក្យ' },
    how4:       { en: 'Pass the quiz', km: 'ប្រឡងជាប់តេស្ត' },
    how5:       { en: 'Act it out in role-play', km: 'សម្តែងតួ' },
    situations: { en: 'Situations {a}–{b}', km: 'ស្ថានភាព {a}–{b}' },
    keyH:       { en: 'Pinyin & the four tones', km: 'ពិនអ៊ីន និងសំនៀងទាំងបួន' },
    keyP:       { en: 'Every Chinese line has its pinyin under it. The mark over the vowel is the tone — the same syllable with a different tone is a different word. Tap a speaker to hear each one.', km: 'ប្រយោគចិននីមួយៗមានពិនអ៊ីននៅខាងក្រោម។ សញ្ញានៅលើស្រៈគឺសំនៀង — ព្យាង្គដូចគ្នា តែសំនៀងខុសគ្នា គឺជាពាក្យខុសគ្នា។ ចុចលើឧបករណ៍បំពងសំឡេងដើម្បីស្តាប់។' },
    tonesH:     { en: 'The four tones', km: 'សំនៀងទាំងបួន' },
    soundsH:    { en: 'Letters that do not sound like English', km: 'អក្សរដែលមិនបញ្ចេញសំឡេងដូចភាសាអង់គ្លេស' },
    keyGo:      { en: 'Start with lesson 1', km: 'ចាប់ផ្តើមជាមួយមេរៀនទី ១' },
    by:         { en: 'A free course from Alpha Academy Cambodia', km: 'វគ្គសិក្សាឥតគិតថ្លៃពី Alpha Academy Cambodia' },
    done:       { en: 'Complete', km: 'បានបញ្ចប់' }
  };
  function lang() { return (global.AAi18n && global.AAi18n.get && global.AAi18n.get() === 'km') ? 'km' : 'en'; }
  function t(k, a, b) {
    var v = T[k]; v = v ? (v[lang()] || v.en) : k;
    return String(v).replace('{a}', a).replace('{b}', b);
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function praise() { return lang() === 'km' ? pick(T.rightKm) : pick(T.right); }

  /* ------------------------------------------------------------- storage */
  var KEY = 'aa-zhc-v1';
  var store = { best: {}, last: 0, py: true, en: true, rate: 0.8 };
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
  function title(s) { return lang() === 'km' ? s.titleKm : s.title; }
  function chName(c) { return lang() === 'km' ? c.km : c.en; }
  // the meaning of a line: English, plus Khmer underneath when the site is in Khmer
  function mean(o) {
    return '<span class="en">' + o.en + '</span>' + (lang() === 'km' && o.km ? '<span class="km">' + esc(o.km) + '</span>' : '');
  }
  function meanPlain(o) { return lang() === 'km' && o.km ? o.km : plain(o.en); }
  function zh(o) { return '<span class="zh" lang="zh-CN">' + esc(o.hz) + '</span><span class="py">' + esc(o.py) + '</span>'; }
  function art(s) { return S.svg(100 + s.n, { spec: s.art, label: s.title, board: '你 好 吗' }); }

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
  var voice = null, synth = global.speechSynthesis;
  function findVoice() {
    if (!synth) return null;
    var vs = synth.getVoices() || [], i;
    // Mainland Mandarin first, then any Chinese voice that is not Cantonese.
    for (i = 0; i < vs.length; i++) if (/^zh[-_]CN/i.test(vs[i].lang)) return vs[i];
    for (i = 0; i < vs.length; i++) if (/^(zh|cmn)/i.test(vs[i].lang) && !/HK|yue/i.test(vs[i].lang)) return vs[i];
    return null;
  }
  function refreshVoice() {
    voice = findVoice();
    var el = $('#kcmVoice');
    if (el) {
      el.textContent = voice ? t('voiceOk') + voice.name : t('voiceNo');
      el.classList.toggle('is-warn', !voice);
    }
    document.documentElement.classList.toggle('zhc-novoice', !voice);
  }
  // Every call bumps `gen`, so whatever was queued before stops counting.
  // A watchdog fires onEnd too, because some browsers never send `end`.
  var gen = 0;
  function speak(text, onEnd) {
    gen++;
    var mine = gen;
    if (!voice || !synth) { if (onEnd) setTimeout(onEnd, 0); return false; }
    try { synth.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(text), done = false, dog = null;
    u.voice = voice; u.lang = voice.lang; u.rate = store.rate || 0.8;
    function fin() { if (done || mine !== gen) return; done = true; clearTimeout(dog); if (onEnd) onEnd(); }
    u.onend = fin; u.onerror = fin;
    // Chrome drops an utterance queued in the same tick as cancel().
    setTimeout(function () {
      if (mine !== gen) return;
      synth.speak(u);
      dog = setTimeout(fin, 1500 + String(text).length * 450 / (store.rate || 0.8));
    }, 60);
    return true;
  }
  function stopAudio() { gen++; if (synth) { try { synth.cancel(); } catch (e) {} } }
  function sayBtn(text, cls) {
    return '<button type="button" class="kcm-say ' + (cls || '') + '" data-say="' + esc(text) + '" aria-label="' + esc(t('listen')) + '">' + ICON.say + '</button>';
  }

  /* ============================================================== RAIL */
  var rail = $('#kcmOutline'), side = $('#kcmSide');
  function buildRail() {
    var h = '<a class="kcm-rl-top" href="#lessons" data-r="lessons">' + esc(t('all')) + '</a>' +
            '<a class="kcm-rl-top" href="#pinyin" data-r="pinyin">' + esc(t('keyNav')) + '</a>';
    CH.forEach(function (c, ci) {
      var list = SITS.filter(function (s) { return s.ch === ci; });
      var nDone = list.filter(function (s) { return isDone(s.n); }).length;
      h += '<div class="kcm-rg" data-ch="' + ci + '"><button type="button" class="kcm-rg-head" aria-expanded="false">' +
        '<span class="num">' + (ci + 1) + '</span><span class="nm"><span>' + esc(c.en) + '</span><small class="zh">' + esc(c.zh) + '</small></span>' +
        '<span class="cnt">' + nDone + '/' + list.length + '</span>' + ICON.chev + '</button><ul>';
      list.forEach(function (s) {
        h += '<li><a href="#s-' + s.n + '" data-r="s-' + s.n + '"' + (isDone(s.n) ? ' class="is-done"' : '') + '><span class="n">' + pad(s.n) +
          '</span><span class="tt">' + esc(title(s)) + '</span>' + (isDone(s.n) ? '<span class="ok">' + ICON.check + '</span>' : '') + '</a></li>';
      });
      h += '</ul></div>';
    });
    rail.innerHTML = h;
  }
  rail.addEventListener('click', function (e) {
    var head = e.target.closest('.kcm-rg-head');
    if (head) { var ex = head.getAttribute('aria-expanded') === 'true'; head.setAttribute('aria-expanded', ex ? 'false' : 'true'); return; }
    if (e.target.closest('a') && global.innerWidth < 1080) setSide(false);
  });
  function markRail(r) {
    $$('a', rail).forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-r') === r); });
    var here = $('a.is-here', rail);
    if (here) {
      var g = here.closest('.kcm-rg');
      if (g) {
        $('.kcm-rg-head', g).setAttribute('aria-expanded', 'true');
        if (global.innerWidth >= 1080) {
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
  if (global.innerWidth < 1080) setSide(false);

  /* ========================================================= TOOLBAR */
  function syncToggles() {
    var root = $('#kcmMain');
    root.classList.toggle('hide-rom', !store.py);
    root.classList.toggle('hide-en', !store.en);
    $('#kcmRom').setAttribute('aria-pressed', store.py ? 'true' : 'false');
    $('#kcmEn').setAttribute('aria-pressed', store.en ? 'true' : 'false');
    $$('#kcmSpeed button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-rate') === +store.rate)); });
  }
  $('#kcmRom').addEventListener('click', function () { store.py = !store.py; save(); syncToggles(); });
  $('#kcmEn').addEventListener('click', function () { store.en = !store.en; save(); syncToggles(); });
  $('#kcmSpeed').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    store.rate = +b.getAttribute('data-rate'); save(); syncToggles();
  });

  /* ============================================================ VIEWS */
  var view = $('#kcmView');
  var player = null;
  var lazyObs = null;

  function route() {
    stopAudio(); if (player) { player.stop(); player = null; }
    var h = (location.hash || '').replace('#', '');
    var m = /^s-(\d{1,3})(?:\/(learn|cards|quiz|role))?$/.exec(h);
    if (m && +m[1] >= 1 && +m[1] <= SITS.length) { renderLesson(+m[1], m[2] || 'learn'); markRail('s-' + m[1]); }
    else if (h === 'pinyin') { renderKey(); markRail('pinyin'); }
    else { renderOverview(); markRail('lessons'); }
  }

  function scrollTop() {
    var y = $('#kcmTop').getBoundingClientRect().top + global.pageYOffset - 90;
    if (global.pageYOffset > y) global.scrollTo({ top: y, behavior: 'auto' });
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
        '<h2>' + esc(chName(c)) + '</h2><span class="zh">' + esc(c.zh) + '</span>' +
        '<span class="kcm-chap-r">' + esc(t('situations', list[0].n, list[list.length - 1].n)) + '</span></header><div class="kcm-grid">';
      list.forEach(function (s) {
        var hay = (s.title + ' ' + s.titleKm + ' ' + s.titleZh + ' ' + plain(s.scene) + ' ' + c.en + ' ' +
          s.phrases.map(function (p) { return plain(p.en) + ' ' + p.hz + ' ' + p.py; }).join(' ')).toLowerCase();
        h += '<a class="kcm-card' + (isDone(s.n) ? ' is-done' : '') + '" href="#s-' + s.n + '" data-find="' + esc(hay) + '">' +
          '<span class="kcm-thumb" data-scene="' + s.n + '"></span>' +
          '<span class="kcm-card-b"><span class="kcm-card-n">' + esc(t('lesson')) + ' ' + s.n + '</span>' +
          '<span class="kcm-card-t">' + esc(title(s)) + '</span><span class="kcm-card-k zh">' + esc(s.titleZh) + '</span>' +
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
    function paint(el) { el.innerHTML = art(sit(+el.getAttribute('data-scene'))); el.removeAttribute('data-scene'); }
    if (!('IntersectionObserver' in global)) { els.forEach(paint); return; }
    if (lazyObs) lazyObs.disconnect();
    lazyObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { paint(en.target); lazyObs.unobserve(en.target); } });
    }, { rootMargin: '300px' });
    els.forEach(function (el) { lazyObs.observe(el); });
  }

  /* --------------------------------------------------------- pinyin key */
  function renderKey() {
    var K = D.key, h = '<div class="kcm-block"><h2 class="kcm-h2">' + esc(t('keyH')) + '</h2><p class="kcm-lede">' + esc(t('keyP')) + '</p>';
    h += '<h3 class="kcm-h3">' + esc(t('tonesH')) + '</h3><div class="zhc-tones">';
    K.tones.forEach(function (x) {
      h += '<div class="zhc-tone"><span class="mk">' + esc(x.py) + '</span><span class="zh" lang="zh-CN">' + esc(x.hz) + '</span>' +
        '<span class="nm">' + esc(lang() === 'km' ? x.nameKm : x.name) + '</span><span class="ds">' + (lang() === 'km' ? esc(x.descKm) : x.desc) + '</span>' + sayBtn(x.hz) + '</div>';
    });
    h += '</div><h3 class="kcm-h3">' + esc(t('soundsH')) + '</h3><div class="kcm-key">';
    K.sounds.forEach(function (k) {
      h += '<div class="kcm-key-row"><span class="sym">' + esc(k.sym) + '</span><span class="exp">' + k.exp +
        ' <span class="zhc-eg"><span class="zh" lang="zh-CN">' + esc(k.hz) + '</span> ' + esc(k.py) + '</span></span>' + sayBtn(k.hz, 'kcm-say--sm') + '</div>';
    });
    h += '</div>';
    K.notes.forEach(function (n) { h += '<aside class="kcm-note"><b>' + esc(t('tip')) + ' · ' + esc(n.label) + '</b><p>' + n.html + '</p></aside>'; });
    h += '<a class="btn btn--primary" href="#s-1" style="margin-top:1.2rem">' + esc(t('keyGo')) + ICON.right + '</a></div>';
    view.innerHTML = h;
  }

  /* ============================================================ LESSON */
  function renderLesson(n, tab) {
    var s = sit(n), c = CH[s.ch];
    store.last = n; save();
    var tabs = [['learn', t('learn')], ['cards', t('cards')], ['quiz', t('quiz')], ['role', t('role')]];
    var h = '<div class="kcm-lhead">' +
      '<a class="kcm-back" href="#lessons">' + ICON.left + esc(t('all')) + '</a>' +
      '<div class="kcm-lh-meta"><span class="kcm-badge">' + esc(t('lesson')) + ' ' + s.n + '</span><span>' + esc(t('chapter')) + ' ' + (s.ch + 1) + ' · ' + esc(chName(c)) + '</span></div>' +
      '<h2 class="kcm-ltitle">' + esc(s.title) + '</h2><div class="kcm-ltitle-kh"><span class="zh" lang="zh-CN">' + esc(s.titleZh) + '</span>' +
      (lang() === 'km' ? ' <span class="kh">· ' + esc(s.titleKm) + '</span>' : '') + '</div>' +
      (isDone(n) ? '<div class="kcm-lh-done">' + starRow(best(n)) + '<span class="kcm-done">' + ICON.check + esc(t('done')) + '</span></div>' : '') +
      '</div>';
    h += '<div class="kcm-tabs" role="tablist">' + tabs.map(function (x) {
      return '<a role="tab" href="#s-' + n + (x[0] === 'learn' ? '' : '/' + x[0]) + '" aria-selected="' + (x[0] === tab) + '">' + esc(x[1]) + '</a>';
    }).join('') + '</div><div class="kcm-tabbody" id="kcmTab"></div>';
    h += '<nav class="kcm-pn">' +
      (n > 1 ? '<a href="#s-' + (n - 1) + '" class="prev">' + ICON.left + '<span><small>' + esc(t('prevLesson')) + '</small>' + esc(title(sit(n - 1))) + '</span></a>' : '<span></span>') +
      (n < SITS.length ? '<a href="#s-' + (n + 1) + '" class="next"><span><small>' + esc(t('nextLesson')) + '</small>' + esc(title(sit(n + 1))) + '</span>' + ICON.right + '</a>' : '<span></span>') +
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
    return '<div class="kcm-stage" id="kcmStage">' + art(s) + '<div class="kcm-bubble" id="kcmBubble" hidden></div></div>';
  }
  function showBubble(stage, turn) {
    var b = $('.kcm-bubble', stage), svg = $('svg', stage);
    $$('.kp-you, .kp-them', svg).forEach(function (g) { g.classList.remove('is-talking'); });
    if (!turn) { b.hidden = true; return; }
    var g = $(isYou(turn) ? '.kp-you' : '.kp-them', svg);
    if (g) { g.classList.remove('is-talking'); void g.getBoundingClientRect(); g.classList.add('is-talking'); }
    b.className = 'kcm-bubble ' + (isYou(turn) ? 'is-you' : 'is-them');
    b.innerHTML = zh(turn) + mean(turn);
    b.hidden = false;
  }

  function Player(s, stage, list, btn) {
    var i = -1, on = false, timer = null;
    function mark() { $$('.kcm-line', list).forEach(function (el, k) { el.classList.toggle('is-on', k === i); }); }
    function step() {
      if (!on) return;
      i++;
      if (i >= s.dialogue.length) { stop(); return; }
      var turn = s.dialogue[i];
      showBubble(stage, turn); mark();
      var wait = Math.max(2400, turn.hz.length * 260);
      if (!speak(turn.hz, function () { if (on) timer = setTimeout(step, 700); })) timer = setTimeout(step, wait);
    }
    function play() { if (i >= s.dialogue.length - 1) i = -1; on = true; setBtn(); step(); }
    function stop() { on = false; clearTimeout(timer); stopAudio(); setBtn(); }
    function setBtn() { btn.innerHTML = (on ? ICON.pause + esc(t('pause')) : ICON.play + esc(t('play'))); btn.classList.toggle('is-on', on); }
    function jump(k) { stop(); i = k; showBubble(stage, s.dialogue[k]); mark(); speak(s.dialogue[k].hz); }
    setBtn();
    return { play: play, stop: stop, toggle: function () { on ? stop() : play(); }, jump: jump };
  }

  /* --------------------------------------------------------------- learn */
  function lineHtml(turn, k) {
    var you = isYou(turn);
    return '<li class="kcm-line ' + (you ? 'is-you' : 'is-them') + '" data-k="' + k + '" tabindex="0">' +
      '<span class="who">' + esc(you ? t('you') : turn.who) + '</span>' +
      '<span class="txt">' + zh(turn) + mean(turn) + '</span>' +
      sayBtn(turn.hz, 'kcm-say--sm') + '</li>';
  }
  function renderLearn(s, body) {
    var h = '<div class="kcm-scene-wrap">' + stageHtml(s) +
      '<div class="kcm-scene-bar"><button type="button" class="btn btn--primary kcm-playbtn" id="kcmPlay"></button><span>' + esc(t('tapLine')) + '</span></div></div>';
    var goal = esc(t('willSay')) + ' ' + s.phrases.slice(0, 4).map(function (p) { return '“' + esc(plain(p.en).replace(/\s*\([^)]*\)/g, '')) + '”'; }).join(', ') + '…';
    h += '<div class="kcm-goal"><b>' + esc(t('goal')) + '</b> ' + goal + '</div>';
    h += '<p class="kcm-story">' + s.scene + '</p>';
    h += '<section class="kcm-block"><h3 class="kcm-h3">' + esc(t('dialogue')) + '</h3><ol class="kcm-dlg" id="kcmDlg">' +
      s.dialogue.map(lineHtml).join('') + '</ol></section>';
    h += '<section class="kcm-block"><h3 class="kcm-h3">' + esc(t('phrases')) + '</h3><ul class="kcm-phr">' +
      s.phrases.map(function (p) {
        return '<li>' + mean(p) + zh(p) + sayBtn(p.hz, 'kcm-say--sm') + '</li>';
      }).join('') + '</ul></section>';
    (s.tips || []).forEach(function (tp) {
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
      if (global.innerWidth < 760) stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    list.addEventListener('click', jumpFrom);
    list.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jumpFrom(e); } });
  }

  /* ---------------------------------------------------------- flashcards */
  function renderCards(s, body) {
    var dir = 'enzh', deck, idx, knew, firstTry;
    function reset(sh) { deck = (sh ? shuffle(s.phrases) : s.phrases.slice()).map(function (p) { return { p: p, again: false }; }); idx = 0; knew = 0; firstTry = deck.length; draw(); }
    function face(p, side) {
      if ((dir === 'enzh') === (side === 'front')) return '<span class="kcm-fc-en">' + mean(p) + '</span>';
      return '<span class="zh kcm-fc-kh" lang="zh-CN">' + esc(p.hz) + '</span><span class="py kcm-fc-ro">' + esc(p.py) + '</span>';
    }
    function draw() {
      if (idx >= deck.length) {
        body.innerHTML = '<div class="kcm-result"><div class="kcm-result-ico">' + ICON.check + '</div><h3>' + esc(t('cardsDone')) + '</h3><p>' + esc(t('cardsKnew', knew, firstTry)) +
          '</p><div class="kcm-row"><button type="button" class="btn btn--ghost" id="kcmAgain">' + esc(t('restart')) + '</button>' +
          '<a class="btn btn--primary" href="#s-' + s.n + '/quiz">' + esc(t('toQuiz')) + ICON.right + '</a></div></div>';
        $('#kcmAgain').addEventListener('click', function () { reset(true); });
        return;
      }
      var p = deck[idx].p;
      body.innerHTML = '<div class="kcm-fc-top"><div class="kcm-seg" role="group">' +
        '<button type="button" data-dir="enzh" aria-pressed="' + (dir === 'enzh') + '">' + esc(t('dirEnZh')) + '</button>' +
        '<button type="button" data-dir="zhen" aria-pressed="' + (dir === 'zhen') + '">' + esc(t('dirZhEn')) + '</button></div>' +
        '<button type="button" class="kcm-chipbtn" id="kcmShuf">' + esc(t('shuffle')) + '</button>' +
        '<span class="kcm-count">' + (idx + 1) + ' / ' + deck.length + '</span></div>' +
        '<div class="kcm-mini-bar"><span style="width:' + (idx / deck.length * 100) + '%"></span></div>' +
        '<button type="button" class="kcm-fc" id="kcmCard" aria-live="polite"><span class="kcm-fc-in">' +
        '<span class="kcm-fc-side front">' + face(p, 'front') + '<small>' + esc(t('tapFlip')) + '</small></span>' +
        '<span class="kcm-fc-side back">' + face(p, 'back') + '<span class="kcm-fc-sm">' + (dir === 'enzh' ? esc(meanPlain(p)) : '') + '</span></span>' +
        '</span></button>' +
        '<div class="kcm-row kcm-fc-acts">' + sayBtn(p.hz) +
        '<button type="button" class="btn btn--ghost" id="kcmNo">' + esc(t('again')) + '</button>' +
        '<button type="button" class="btn btn--primary" id="kcmYes">' + ICON.check + esc(t('know')) + '</button></div>';
      var card = $('#kcmCard');
      card.addEventListener('click', function () { card.classList.toggle('is-flipped'); if (card.classList.contains('is-flipped') && dir === 'enzh') speak(p.hz); });
      if (dir === 'zhen') speak(p.hz);
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
    var phr = shuffle(s.phrases.filter(function (p, i, a) { return a.findIndex(function (q) { return q.hz === p.hz; }) === i; }));
    var pool = phr.slice();
    var near = SITS.filter(function (x) { return x.ch === s.ch && x.n !== s.n; });
    near.forEach(function (x) { x.phrases.forEach(function (p) { if (!pool.some(function (q) { return q.hz === p.hz || plain(q.en) === plain(p.en); })) pool.push(p); }); });
    function opts(ans, key) {
      var o = [ans], others = shuffle(pool.filter(function (p) { return p !== ans; }));
      for (var i = 0; i < others.length && o.length < 4; i++) {
        if (!o.some(function (x) { return x[key] === others[i][key] || plain(x.en) === plain(others[i].en); })) o.push(others[i]);
      }
      return shuffle(o);
    }
    phr.slice(0, 7).forEach(function (p, i) {
      if (i % 2 === 0) qs.push({ type: 'enzh', ans: p, opts: opts(p, 'hz') });
      else qs.push({ type: 'zhen', ans: p, opts: opts(p, 'en') });
    });
    var youLines = [];
    s.dialogue.forEach(function (d, i) { if (isYou(d) && i > 0 && !isYou(s.dialogue[i - 1])) youLines.push({ prev: s.dialogue[i - 1], ans: d }); });
    var allYou = [];
    SITS.forEach(function (x) { if (Math.abs(x.n - s.n) <= 6) x.dialogue.forEach(function (d) { if (isYou(d)) allYou.push(d); }); });
    shuffle(youLines).slice(0, 3).forEach(function (y) {
      var o = [y.ans], others = shuffle(allYou.filter(function (d) { return d.hz !== y.ans.hz; }));
      for (var i = 0; i < others.length && o.length < 4; i++) if (!o.some(function (x) { return x.hz === others[i].hz; })) o.push(others[i]);
      qs.push({ type: 'reply', prev: y.prev, ans: y.ans, opts: shuffle(o) });
    });
    return qs;
  }
  function renderQuiz(s, body) {
    var qs = buildQuiz(s), i = 0, score = 0;
    function optHtml(q, o, k) {
      var inner = (q.type === 'zhen') ? mean(o) : zh(o);
      return '<button type="button" class="kcm-opt" data-k="' + k + '"><span class="l">' + 'ABCD'[k] + '</span><span class="b">' + inner + '</span></button>';
    }
    function draw() {
      if (i >= qs.length) return result();
      var q = qs[i], prompt;
      if (q.type === 'enzh') prompt = '<p class="kcm-q-ask">' + esc(t('qPickZh')) + '</p><div class="kcm-q-big">' + mean(q.ans) + '</div>';
      else if (q.type === 'zhen') prompt = '<p class="kcm-q-ask">' + esc(t('qPickEn')) + '</p><div class="kcm-q-big">' + '<span class="zh" lang="zh-CN">' + esc(q.ans.hz) + '</span>' + sayBtn(q.ans.hz) + '<span class="py">' + esc(q.ans.py) + '</span></div>';
      else prompt = '<p class="kcm-q-ask">' + esc(t('qReply')) + '</p><div class="kcm-q-dlg"><span class="who">' + esc(q.prev.who) + '</span>' + zh(q.prev) + mean(q.prev) + '</div>' +
        '<p class="kcm-q-want">' + esc(t('qWant')) + ' <b>“' + esc(meanPlain(q.ans)) + '”</b></p>';
      body.innerHTML = '<div class="kcm-quiz"><div class="kcm-fc-top"><span class="kcm-count">' + esc(t('qOf', i + 1, qs.length)) + '</span><span class="kcm-scorepill">' + score + ' ' + ICON.check + '</span></div>' +
        '<div class="kcm-mini-bar"><span style="width:' + (i / qs.length * 100) + '%"></span></div>' + prompt +
        '<div class="kcm-opts">' + q.opts.map(function (o, k) { return optHtml(q, o, k); }).join('') + '</div>' +
        '<div class="kcm-feedback" id="kcmFb" aria-live="polite"></div></div>';
      $$('.kcm-opt', body).forEach(function (b) { b.addEventListener('click', function () { answer(+b.getAttribute('data-k')); }); });
      if (q.type === 'zhen') speak(q.ans.hz);
    }
    function answer(k) {
      var q = qs[i], ok = q.opts[k] === q.ans;
      $$('.kcm-opt', body).forEach(function (b, j) {
        b.disabled = true;
        if (q.opts[j] === q.ans) b.classList.add('is-right');
        else if (j === k) b.classList.add('is-wrong');
      });
      if (ok) score++;
      speak(q.ans.hz);
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
      li.innerHTML = '<span class="who">' + esc(isYou(d) ? t('you') : d.who) + '</span>' + zh(d) + mean(d);
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
        add(d, false); speak(d.hz); i++;
        act.innerHTML = '<button type="button" class="btn btn--primary" id="kcmGo">' + esc(t('cont')) + ICON.right + '</button>';
        $('#kcmGo').addEventListener('click', step); $('#kcmGo').focus({ preventScroll: true });
        return;
      }
      showBubble(stage, null);
      act.innerHTML = '<div class="kcm-turn"><span class="kcm-q-ask">' + esc(t('yourTurn')) + '</span><div class="kcm-turn-en">“' + esc(meanPlain(d)) + '”</div>' +
        '<button type="button" class="btn btn--primary" id="kcmShow">' + esc(t('reveal')) + '</button></div>';
      $('#kcmShow').addEventListener('click', function () {
        add(d, true); speak(d.hz); i++;
        act.innerHTML = '<div class="kcm-row"><button type="button" class="btn btn--ghost" id="kcmMiss">' + esc(t('missed')) + '</button>' +
          '<button type="button" class="btn btn--primary" id="kcmHit">' + ICON.check + esc(t('gotIt')) + '</button></div>';
        $('#kcmHit').addEventListener('click', function () { good++; step(); });
        $('#kcmMiss').addEventListener('click', step);
      });
    }
    act.innerHTML = '<button type="button" class="btn btn--primary" id="kcmStart">' + ICON.play + esc(t('roleStart')) + '</button>';
    $('#kcmStart').addEventListener('click', step);
  }

  /* =============================================================== boot */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.kcm-say'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    $$('.kcm-say.is-on').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    if (player) player.stop();
    speak(b.getAttribute('data-say'), function () { b.classList.remove('is-on'); });
  }, true);

  global.addEventListener('hashchange', function () { route(); scrollTop(); });
  document.addEventListener('aa:langchange', function () { buildRail(); route(); refreshVoice(); });
  if (synth && 'onvoiceschanged' in synth) synth.addEventListener('voiceschanged', refreshVoice);

  buildRail();
  syncToggles();
  refreshVoice();
  route();
})(window);
