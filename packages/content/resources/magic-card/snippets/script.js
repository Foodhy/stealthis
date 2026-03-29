// Magic Card — radial gradient spotlight follows the mouse cursor.
(function () {
  "use strict";

  const cards = document.querySelectorAll("[data-magic-card]");

  cards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", x + "px");
      card.style.setProperty("--mouse-y", y + "px");
    });

    card.addEventListener("mouseleave", function () {
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    });
  });
})();
