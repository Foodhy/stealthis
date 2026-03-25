// Retro Grid — the grid animation runs via CSS @keyframes.
// This script adds an optional parallax tilt on mouse movement.
(function () {
  "use strict";

  const scene = document.querySelector(".retro-scene");
  const wrapper = document.querySelector(".retro-grid-wrapper");
  if (!scene || !wrapper) return;

  scene.addEventListener("mousemove", (e) => {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle shift of perspective origin based on mouse
    const originX = 50 + x * 10;
    const originY = y * 8;
    wrapper.style.perspectiveOrigin = `${originX}% ${originY}%`;
  });

  scene.addEventListener("mouseleave", () => {
    wrapper.style.perspectiveOrigin = "50% 0%";
  });
})();
