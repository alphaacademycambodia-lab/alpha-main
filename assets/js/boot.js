/* Runs render-blocking in <head> so the page never flashes the wrong theme or
   the wrong language before the rest of the JavaScript arrives. */
(function () {
  var d = document.documentElement;
  var theme = 'light', lang = 'en';
  try {
    theme = localStorage.getItem('aa-theme') ||
            (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    lang = localStorage.getItem('aa-lang') || 'en';
  } catch (e) { /* private mode — fall back to the defaults above */ }
  d.setAttribute('data-theme', theme);
  d.setAttribute('lang', lang);
})();

/* Frame guard. Another site must not be able to show this page inside an
   invisible frame and trick a visitor into clicking it (clickjacking). The
   usual fix is a frame-ancestors header, which GitHub Pages cannot send, so the
   page does it itself: framed by a different site, it hides everything and
   tries to open itself in the whole window instead (modern browsers may block
   that jump; the page stays hidden either way). Framing by our own pages — the
   local editor's preview — is left alone: reading top.location only throws
   when the parent is another site. */
(function () {
  if (window.top === window.self) return;
  try { void window.top.location.href; }
  catch (e) {
    document.documentElement.style.display = 'none';
    try { window.top.location = window.self.location.href; } catch (e2) {}
  }
})();
