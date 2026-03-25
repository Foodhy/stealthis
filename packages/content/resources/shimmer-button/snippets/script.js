// Shimmer Button — minimal JS (CSS handles the animation)
(function () {
  "use strict";

  const buttons = document.querySelectorAll(".shimmer-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Restart shimmer on click for immediate feedback
      btn.style.animation = "none";
      const before = window.getComputedStyle(btn, "::before");
      btn.offsetHeight; // trigger reflow
      btn.style.animation = "";
    });
  });
})();
