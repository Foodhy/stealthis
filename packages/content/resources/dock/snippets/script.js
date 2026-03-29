(function () {
  "use strict";

  const dock = document.getElementById("dock");
  if (!dock) return;

  const items = dock.querySelectorAll(".dock-item");
  const BASE_SIZE = 48;
  const MAX_SIZE = 72;
  const RANGE = 200; // px — how far the magnification reaches

  function magnify(mouseX) {
    items.forEach((item) => {
      const icon = item.querySelector(".dock-icon");
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenterX);

      // Gaussian-like falloff
      const scale = Math.max(
        BASE_SIZE,
        MAX_SIZE - ((MAX_SIZE - BASE_SIZE) * Math.pow(distance, 2)) / Math.pow(RANGE, 2)
      );

      const size = Math.round(Math.min(MAX_SIZE, Math.max(BASE_SIZE, scale)));
      icon.style.width = size + "px";
      icon.style.height = size + "px";
    });
  }

  function resetSizes() {
    items.forEach((item) => {
      const icon = item.querySelector(".dock-icon");
      icon.style.width = BASE_SIZE + "px";
      icon.style.height = BASE_SIZE + "px";
    });
  }

  dock.addEventListener("mousemove", (e) => {
    magnify(e.clientX);
  });

  dock.addEventListener("mouseleave", () => {
    resetSizes();
  });

  // Initialize sizes
  resetSizes();
})();
