// Animated Beam — draws SVG paths between elements with flowing dash animation.
(function () {
  "use strict";

  const container = document.getElementById("beamContainer");
  const svg = document.getElementById("beamSvg");
  const nodeFrom = document.getElementById("nodeFrom");
  const nodeMiddle = document.getElementById("nodeMiddle");
  const nodeTo = document.getElementById("nodeTo");

  if (!container || !svg || !nodeFrom || !nodeMiddle || !nodeTo) return;

  function getCenter(el) {
    const containerRect = container.getBoundingClientRect();
    const rect = el.querySelector(".beam-node__icon").getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  }

  function createCurvePath(from, to, curvature) {
    const midX = (from.x + to.x) / 2;
    const cp1x = midX;
    const cp1y = from.y + curvature;
    const cp2x = midX;
    const cp2y = to.y + curvature;
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
  }

  function drawBeams() {
    const fromPos = getCenter(nodeFrom);
    const midPos = getCenter(nodeMiddle);
    const toPos = getCenter(nodeTo);

    const path1 = createCurvePath(fromPos, midPos, -40);
    const path2 = createCurvePath(midPos, toPos, 40);

    svg.innerHTML = `
      <defs>
        <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.1" />
          <stop offset="50%" stop-color="#22d3ee" stop-opacity="1" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id="beamGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a855f7" stop-opacity="0.1" />
          <stop offset="50%" stop-color="#a855f7" stop-opacity="1" />
          <stop offset="100%" stop-color="#34d399" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- Background paths -->
      <path class="beam-path beam-path--bg" d="${path1}" />
      <path class="beam-path beam-path--bg" d="${path2}" />

      <!-- Glow layers -->
      <path class="beam-path beam-path--animated beam-glow" d="${path1}" />
      <path class="beam-path beam-path--animated-2 beam-glow" d="${path2}" />

      <!-- Main animated beams -->
      <path class="beam-path beam-path--animated" d="${path1}" />
      <path class="beam-path beam-path--animated-2" d="${path2}" />
    `;
  }

  drawBeams();
  window.addEventListener("resize", drawBeams);
})();
