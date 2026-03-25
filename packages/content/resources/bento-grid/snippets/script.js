// Bento Grid — mostly CSS-driven layout.
// This script adds staggered entrance animations for each bento item.
(function () {
  "use strict";

  var items = document.querySelectorAll(".bento-item");
  if (!items.length) return;

  // Staggered fade-in on load
  items.forEach(function (item, i) {
    item.style.opacity = "0";
    item.style.transform = "translateY(16px)";
    item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    item.style.transitionDelay = i * 80 + "ms";
  });

  // Trigger after a frame to allow CSS transition
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      items.forEach(function (item) {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      });
    });
  });
})();
