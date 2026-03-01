(function () {
  "use strict";

  const accordion = document.getElementById("accordion");
  if (!accordion) return;

  const items = accordion.querySelectorAll(".accordion-item");

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    const panel   = item.querySelector(".accordion-panel");

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all items (single-open accordion)
      items.forEach((other) => {
        if (other !== item) closeItem(other);
      });

      // Toggle clicked item
      isOpen ? closeItem(item) : openItem(item);
    });
  });

  function openItem(item) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel   = item.querySelector(".accordion-panel");
    item.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
  }

  function closeItem(item) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel   = item.querySelector(".accordion-panel");
    item.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  }
})();
