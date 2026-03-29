(function () {
  "use strict";

  var collapsibles = document.querySelectorAll("[data-collapsible]");

  collapsibles.forEach(function (item) {
    var trigger = item.querySelector(".collapsible-trigger");
    var panel = item.querySelector(".collapsible-panel");

    if (!trigger || !panel) return;

    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      if (isOpen) {
        item.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
      } else {
        item.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      }
    });
  });
})();
