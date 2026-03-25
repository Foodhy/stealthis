// Animated Grid Pattern — randomly highlights grid cells with a glow effect
(function () {
  "use strict";

  const svg = document.getElementById("grid-svg");
  if (!svg) return;

  const CELL_SIZE = 40;
  const GAP = 1;
  const HIGHLIGHT_INTERVAL = 120;
  const GLOW_DURATION = 2500;
  const MAX_SIMULTANEOUS = 8;

  let cols, rows;
  const cells = [];
  let activeCount = 0;

  function buildGrid() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    cols = Math.ceil(w / (CELL_SIZE + GAP)) + 1;
    rows = Math.ceil(h / (CELL_SIZE + GAP)) + 1;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = "";
    cells.length = 0;

    const ns = "http://www.w3.org/2000/svg";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", c * (CELL_SIZE + GAP));
        rect.setAttribute("y", r * (CELL_SIZE + GAP));
        rect.setAttribute("width", CELL_SIZE);
        rect.setAttribute("height", CELL_SIZE);
        rect.setAttribute("rx", 2);
        rect.classList.add("cell");
        svg.appendChild(rect);
        cells.push(rect);
      }
    }
  }

  function highlightRandom() {
    if (cells.length === 0 || activeCount >= MAX_SIMULTANEOUS) return;

    const idx = Math.floor(Math.random() * cells.length);
    const cell = cells[idx];

    if (cell.classList.contains("glow")) return;

    cell.classList.add("glow");
    activeCount++;

    setTimeout(() => {
      cell.classList.remove("glow");
      activeCount--;
    }, GLOW_DURATION);
  }

  buildGrid();
  setInterval(highlightRandom, HIGHLIGHT_INTERVAL);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      activeCount = 0;
      buildGrid();
    }, 200);
  });
})();
