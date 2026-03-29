// Grid Pattern — optional: dynamically update the SVG grid when CSS vars change.
(function () {
  "use strict";

  const container = document.querySelector(".grid-pattern");
  if (!container) return;

  /**
   * Rebuild the background-image SVG from current CSS custom properties.
   * Call this after programmatically changing --grid-size, --grid-color, or --grid-stroke.
   */
  function updateGrid() {
    const style = getComputedStyle(container);
    const size = parseInt(style.getPropertyValue("--grid-size"), 10) || 40;
    const color = style.getPropertyValue("--grid-color").trim() || "rgba(255,255,255,0.08)";
    const stroke = style.getPropertyValue("--grid-stroke").trim() || "1";

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><path d='M ${size} 0 L 0 0 0 ${size}' fill='none' stroke='${color}' stroke-width='${stroke}'/></svg>`;
    const encoded = encodeURIComponent(svg).replace(/'/g, "%27");

    container.style.backgroundImage = `url("data:image/svg+xml,${encoded}")`;
    container.style.backgroundSize = `${size}px ${size}px`;
  }

  // Initial sync
  updateGrid();

  // Expose for external use
  window.updateGridPattern = updateGrid;
})();
