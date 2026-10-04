/* Alpha Academy Cambodia — the Tools hub
   ---------------------------------------------------------------------------
   The hub groups the tools into categories (one .tl-sec each, with an id the
   header menu links to). This file adds the search box above them: it
   matches the card's visible text in whichever language is showing, plus
   the extra keywords in data-k (English and Khmer), so "multiplication",
   "គុណ" and "times" all find the times tables. Categories with nothing left
   are hidden, the counts on the category chips follow the search, and the
   query is kept in the address bar (#q=clock) so a link can share it.     */
(function () {
  'use strict';
  var q = document.getElementById('tlQ');
  if (!q) { return; }
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tl-card'));
  var secs = Array.prototype.slice.call(document.querySelectorAll('.tl-sec'));
  var none = document.getElementById('tlNone');
  var KH = '០១២៣៤៥៦៧៨៩';

  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[០-៩]/g, function (d) { return String(KH.indexOf(d)); })
      .replace(/[×x]/g, 'x').replace(/\s+/g, ' ').trim();
  }
  function run() {
    var words = norm(q.value).split(' ').filter(Boolean), shown = 0;
    cards.forEach(function (c) {
      var hay = norm(c.textContent + ' ' + (c.getAttribute('data-k') || '') + ' ' + c.getAttribute('href'));
      var ok = words.every(function (w) { return hay.indexOf(w) >= 0; });
      c.hidden = !ok; if (ok) { shown++; }
    });
    secs.forEach(function (s) {
      var n = s.querySelectorAll('.tl-card:not([hidden])').length;
      s.hidden = n === 0;
      var chip = document.querySelector('.tl-cats a[href="#' + s.id + '"]');
      if (chip) {
        var b = chip.querySelector('b');
        var lang = window.AAi18n && window.AAi18n.get() === 'km';
        b.textContent = lang ? String(n).replace(/\d/g, function (d) { return KH[+d]; }) : n;
        chip.classList.toggle('is-empty', n === 0);
      }
    });
    none.hidden = shown !== 0;
    if (history.replaceState) {
      try { history.replaceState(null, '', q.value.trim() ? '#q=' + encodeURIComponent(q.value.trim()) : location.pathname + location.search + (secs.some(function (s) { return '#' + s.id === location.hash; }) ? location.hash : '')); } catch (e) {}
    }
  }
  q.addEventListener('input', run);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { q.value = ''; run(); }
    if (e.key === 'Enter') {
      var first = cards.filter(function (c) { return !c.hidden; })[0];
      if (first && q.value.trim()) { location.href = first.getAttribute('href'); }
    }
  });
  /* a chip clicked while a search hides that category clears the search */
  document.getElementById('tlCats').addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) { return; }
    var sec = document.querySelector(a.getAttribute('href'));
    if (sec && sec.hidden) { q.value = ''; run(); }
  });
  document.addEventListener('aa:langchange', run);

  var m = /^#q=(.*)$/.exec(location.hash);
  if (m) { try { q.value = decodeURIComponent(m[1]); } catch (e) {} }
  run();
})();
