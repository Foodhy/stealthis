// Progressive Blur — minimal JS for setup (effect is primarily CSS)
(function () {
  "use strict";

  // Auto-create blur layers for each .progressive-blur element
  function initProgressiveBlur() {
    const blurElements = document.querySelectorAll(".progressive-blur");
    const LAYER_COUNT = 6;

    blurElements.forEach((el) => {
      // Skip if layers already exist
      if (el.querySelector(".progressive-blur-layer")) return;

      for (let i = 0; i < LAYER_COUNT; i++) {
        const layer = document.createElement("div");
        layer.className = "progressive-blur-layer";
        el.appendChild(layer);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProgressiveBlur);
  } else {
    initProgressiveBlur();
  }
})();
