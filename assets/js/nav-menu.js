/* Alpha Academy Cambodia — category flyouts in the header menu
   ---------------------------------------------------------------------------
   Learning and Tools open a list of categories; each category opens its own
   flyout beside the dropdown, starting at the top. On the way from a
   category to its flyout the pointer often crosses other categories. With
   plain :hover those would take over, so on desktop this script decides
   which category is open:

     - entering a category opens it at once, unless the pointer is moving
       towards the flyout that is already open (inside the triangle from the
       pointer to that flyout's near edge); then it waits a moment and only
       switches if the pointer has settled on the new category
     - leaving the whole menu closes it

   The CSS (style.css, "Category flyouts") only applies .is-open when the
   menu carries .aim, which this script adds — so without JavaScript the
   menu still works on plain :hover. Keyboard focus is unchanged.           */
(function () {
  'use strict';
  if (!window.matchMedia || !document.querySelector) { return; }
  var desk = window.matchMedia('(min-width: 901px)');

  function inTri(p, a, b, c) {
    function s(p1, p2, p3) { return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]); }
    var d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a);
    var neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  }

  document.querySelectorAll('.nav-links .sub').forEach(function (sub) {
    var items = Array.prototype.filter.call(sub.children, function (c) { return c.classList && c.classList.contains('sub-item'); });
    if (!items.length) { return; }
    var top = sub.closest('.has-sub'), nav = sub.closest('.nav-links');
    nav.classList.add('aim');
    var active = null, timer = null, trail = [];

    function open(it) {
      clearTimeout(timer); timer = null;
      if (active === it) { return; }
      if (active) { active.classList.remove('is-open'); }
      active = it;
      if (it) { it.classList.add('is-open'); }
    }
    function aiming() {
      if (!active || trail.length < 2) { return false; }
      var fl = active.querySelector('.sub2');
      if (!fl) { return false; }
      var r = fl.getBoundingClientRect(), s = sub.getBoundingClientRect();
      var leftSide = r.right <= s.left + 2, x = leftSide ? r.right : r.left;
      var p = trail[trail.length - 1], q = trail[0];
      if (leftSide ? p[0] >= q[0] : p[0] <= q[0]) { return false; }
      return inTri(p, q, [x, r.top - 40], [x, r.bottom + 40]);
    }

    top.addEventListener('mousemove', function (e) {
      var now = Date.now();
      trail.push([e.clientX, e.clientY, now]);
      /* keep only the last ~120 ms of movement: the direction right now */
      while (trail.length > 2 && now - trail[0][2] > 120) { trail.shift(); }
    });
    items.forEach(function (it) {
      it.addEventListener('mouseenter', function () {
        if (!desk.matches) { return; }
        if (!active || active === it) { open(it); return; }
        if (aiming()) {
          clearTimeout(timer);
          timer = setTimeout(function () { timer = null; if (it.matches(':hover')) { open(it); } }, 300);
        } else { open(it); }
      });
      /* settling on a row after aiming past it */
      it.addEventListener('mousemove', function () {
        if (!desk.matches || active === it || timer) { return; }
        open(it);
      });
    });
    top.addEventListener('mouseleave', function () { clearTimeout(timer); timer = null; open(null); trail = []; });
    /* keyboard: the focused category is the open one */
    sub.addEventListener('focusin', function (e) {
      var it = e.target.closest('.sub-item');
      if (it && items.indexOf(it) >= 0) { open(it); }
    });
  });
})();
