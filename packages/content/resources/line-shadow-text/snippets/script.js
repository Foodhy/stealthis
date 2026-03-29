/**
 * Line Shadow Text
 * Minimal JS -- the effect is CSS-driven.
 * This script lets you dynamically set the shadow color via data attributes.
 */
(function () {
  const el = document.querySelector(".line-shadow-text");
  if (!el) return;

  // Allow data-shadow-color override (R, G, B)
  const color = el.dataset.shadowColor;
  if (color) {
    el.style.setProperty("--shadow-color", color);
  }
})();
