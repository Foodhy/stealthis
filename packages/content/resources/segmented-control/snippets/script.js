(function () {
  "use strict";

  // Output elements for the demo
  const outputBilling = document.getElementById("output-billing");
  const outputSize    = document.getElementById("output-size");

  const outputs = [outputBilling, outputSize];

  document.querySelectorAll("[data-sc]").forEach(function (sc, scIndex) {
    const indicator = sc.querySelector(".sc-indicator");
    const items     = Array.from(sc.querySelectorAll(".sc-item"));

    function updateIndicator(activeItem) {
      const scRect   = sc.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const offset   = itemRect.left - scRect.left - 3; // 3px = padding offset
      indicator.style.setProperty("--offset", offset + "px");
      indicator.style.setProperty("--width",  itemRect.width + "px");
    }

    function selectItem(item) {
      items.forEach(function (i) {
        i.classList.remove("sc-item--active");
        i.setAttribute("aria-selected", "false");
        i.tabIndex = -1;
      });
      item.classList.add("sc-item--active");
      item.setAttribute("aria-selected", "true");
      item.tabIndex = 0;
      updateIndicator(item);

      // Update demo output text (strip badge text if any)
      const output = outputs[scIndex];
      if (output) {
        const badge = item.querySelector(".sc-badge");
        output.textContent = badge
          ? item.textContent.replace(badge.textContent, "").trim()
          : item.textContent.trim();
      }
    }

    // Click
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        selectItem(item);
        item.focus();
      });
    });

    // Keyboard navigation
    sc.addEventListener("keydown", function (e) {
      const currentIndex = items.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") { e.preventDefault(); nextIndex = (currentIndex + 1) % items.length; }
      if (e.key === "ArrowLeft")  { e.preventDefault(); nextIndex = (currentIndex - 1 + items.length) % items.length; }
      if (e.key === "Home")       { e.preventDefault(); nextIndex = 0; }
      if (e.key === "End")        { e.preventDefault(); nextIndex = items.length - 1; }

      if (nextIndex !== currentIndex) {
        selectItem(items[nextIndex]);
        items[nextIndex].focus();
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectItem(items[currentIndex]);
      }
    });

    // Initialize indicator position (after layout)
    requestAnimationFrame(function () {
      const active = sc.querySelector(".sc-item--active") || items[0];
      if (active) updateIndicator(active);
    });
  });

  // Re-sync on resize
  window.addEventListener("resize", function () {
    document.querySelectorAll("[data-sc]").forEach(function (sc) {
      const active = sc.querySelector(".sc-item--active");
      const indicator = sc.querySelector(".sc-indicator");
      if (!active || !indicator) return;
      const scRect   = sc.getBoundingClientRect();
      const itemRect = active.getBoundingClientRect();
      indicator.style.setProperty("--offset", (itemRect.left - scRect.left - 3) + "px");
      indicator.style.setProperty("--width",  itemRect.width + "px");
    });
  });
})();
