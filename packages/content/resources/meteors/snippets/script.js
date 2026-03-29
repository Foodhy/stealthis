// Meteors — animated shooting stars falling diagonally
(function () {
  "use strict";

  const container = document.getElementById("meteors-container");
  if (!container) return;

  const METEOR_COUNT = 20;
  const MIN_DURATION = 2;
  const MAX_DURATION = 6;
  const MIN_LENGTH = 80;
  const MAX_LENGTH = 200;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  for (let i = 0; i < METEOR_COUNT; i++) {
    const meteor = document.createElement("div");
    meteor.className = "meteor";

    // Random position in the top-right quadrant
    const top = randomRange(-10, 80);
    const left = randomRange(10, 110);
    const duration = randomRange(MIN_DURATION, MAX_DURATION);
    const delay = randomRange(0, 10);
    const length = randomRange(MIN_LENGTH, MAX_LENGTH);

    meteor.style.top = top + "%";
    meteor.style.left = left + "%";
    meteor.style.setProperty("--meteor-duration", duration + "s");
    meteor.style.setProperty("--meteor-delay", delay + "s");
    meteor.style.setProperty("--meteor-length", length + "px");

    container.appendChild(meteor);
  }
})();
