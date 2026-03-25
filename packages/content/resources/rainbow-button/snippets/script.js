// Rainbow Button — minimal JS (CSS handles the animation)
(function () {
  "use strict";

  const buttons = document.querySelectorAll(".rainbow-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.style.animation = "none";
      btn.offsetHeight; // trigger reflow
      btn.style.animation = "";
    });
  });
})();
