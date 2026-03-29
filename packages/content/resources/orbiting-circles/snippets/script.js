// Orbiting Circles — pure CSS animation, no JS logic required
// Script kept minimal; animation is entirely CSS-driven.
(function () {
  "use strict";
  // Optional: pause animation on visibility change to save resources
  document.addEventListener("visibilitychange", function () {
    const container = document.querySelector(".orbit-container");
    if (!container) return;
    if (document.hidden) {
      container.style.animationPlayState = "paused";
      container.querySelectorAll(".orbiting-circle").forEach(function (el) {
        el.style.animationPlayState = "paused";
      });
    } else {
      container.style.animationPlayState = "running";
      container.querySelectorAll(".orbiting-circle").forEach(function (el) {
        el.style.animationPlayState = "running";
      });
    }
  });
})();
