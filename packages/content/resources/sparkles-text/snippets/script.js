// Sparkles Text — spawns sparkle particles around the text
(function () {
  "use strict";

  const wrapper = document.querySelector(".sparkles-wrapper");
  if (!wrapper) return;

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const SPARKLE_COLORS = ["#ffd700", "#ffffff", "#00d4ff", "#ff9ff3", "#a78bfa"];
  const SPARKLE_COUNT = 3; // how many to spawn each interval
  const SPAWN_INTERVAL = 400; // ms between spawns
  const SPARKLE_LIFETIME = 800; // ms per sparkle

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createSparkle() {
    const sparkle = document.createElement("span");
    sparkle.classList.add("sparkle");

    const size = randomBetween(10, 24);
    const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];

    // Position randomly around the wrapper
    const rect = wrapper.getBoundingClientRect();
    const x = randomBetween(-20, rect.width + 20);
    const y = randomBetween(-20, rect.height + 20);

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;

    // SVG star shape
    sparkle.innerHTML = `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
        <path d="M12 0l3.09 7.26L23 8.27l-5.46 5.04L18.82 21 12 17.27 5.18 21l1.28-7.69L1 8.27l7.91-1.01z" />
      </svg>
    `;

    wrapper.appendChild(sparkle);

    // Remove after animation
    setTimeout(() => {
      sparkle.remove();
    }, SPARKLE_LIFETIME);
  }

  setInterval(() => {
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      createSparkle();
    }
  }, SPAWN_INTERVAL);

  // Spawn initial batch
  for (let i = 0; i < SPARKLE_COUNT * 2; i++) {
    setTimeout(() => createSparkle(), i * 100);
  }
})();
