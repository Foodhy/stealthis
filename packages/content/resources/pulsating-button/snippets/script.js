// Pulsating Button — minimal JS (CSS handles the animation)
(function () {
  "use strict";

  const buttons = document.querySelectorAll(".pulse-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Brief pause and restart of animation on click for feedback
      btn.style.animation = "none";
      btn.offsetHeight; // trigger reflow
      btn.style.animation = "";
    });
  });
})();
