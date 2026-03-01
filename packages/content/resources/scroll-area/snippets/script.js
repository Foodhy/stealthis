(function () {
  "use strict";

  // ── Auto-hide scrollbar ──────────────────────────────────────────────────────

  document.querySelectorAll(".scroll-area").forEach(function (el) {
    let timer = null;

    el.addEventListener("scroll", function () {
      el.classList.add("scrolling");
      clearTimeout(timer);
      timer = setTimeout(function () {
        el.classList.remove("scrolling");
      }, 1000);
    }, { passive: true });
  });

  // ── Build both-axes grid ─────────────────────────────────────────────────────

  const grid = document.querySelector(".both-grid");
  if (grid) {
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 10; col++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.textContent = row + "·" + col;
        grid.appendChild(cell);
      }
    }
  }
})();
