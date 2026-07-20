/* CSS Scroll-timeline Reveal
 *
 * Feature-detects native scroll-driven animations. When available the CSS owns
 * everything (html.native). Otherwise this file computes the same 0..1 progress
 * per card from scroll geometry and writes it to the `--p` custom property, so
 * the visual result and the authoring surface stay identical on both paths.
 */
(function () {
  "use strict";

  var scroller = document.getElementById("scroller");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var bar = document.getElementById("bar");
  var progress = document.getElementById("progress");
  var badge = document.getElementById("engine");
  if (!scroller || !cards.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var native =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("animation-timeline", "view()") &&
    CSS.supports("animation-range", "entry 0% cover 45%");

  if (badge) badge.textContent = reduced
    ? "reduced motion"
    : native
      ? "native animation-timeline"
      : "JS fallback";

  // ---- shared progress reporting -------------------------------------------
  function setScrollProgress() {
    var max = scroller.scrollHeight - scroller.clientHeight;
    var pct = max > 0 ? Math.round((scroller.scrollTop / max) * 100) : 100;
    if (bar) bar.style.width = pct + "%";
    if (progress) progress.setAttribute("aria-valuenow", String(pct));
  }

  if (native && !reduced) {
    document.documentElement.classList.add("native");
    scroller.addEventListener("scroll", onScroll, { passive: true });
    setScrollProgress();
    return;
  }

  if (reduced) {
    cards.forEach(function (el) { el.style.setProperty("--p", "1"); });
    scroller.addEventListener("scroll", onScroll, { passive: true });
    setScrollProgress();
    return;
  }

  // ---- JS fallback ----------------------------------------------------------
  // Mirrors `animation-range: entry 0% cover 45%`:
  //   entry 0%   -> card top hits the bottom edge of the scrollport
  //   cover 45%  -> card has travelled 45% of (scrollport height + card height)
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  function update() {
    var port = scroller.getBoundingClientRect();
    var portH = port.height;

    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      var r = el.getBoundingClientRect();

      // Distance travelled since the card's top crossed the bottom edge.
      var travelled = portH - (r.top - port.top);
      var range = (portH + r.height) * 0.45;
      var p = range > 0 ? travelled / range : 1;
      p = p < 0 ? 0 : p > 1 ? 1 : p;

      var eased = easeOut(p).toFixed(4);
      if (el.dataset.p !== eased) {
        el.dataset.p = eased;
        el.style.setProperty("--p", eased);
      }
    }
    setScrollProgress();
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  scroller.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  if (typeof ResizeObserver === "function") {
    var ro = new ResizeObserver(onScroll);
    ro.observe(scroller);
    cards.forEach(function (el) { ro.observe(el); });
  }

  update();
})();
