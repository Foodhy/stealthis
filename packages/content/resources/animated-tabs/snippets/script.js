(function () {
  "use strict";

  const tabBar    = document.getElementById("tabs");
  const tabs      = tabBar.querySelectorAll(".tab");
  const indicator = tabBar.querySelector(".tab-indicator");

  function moveIndicator(tab) {
    indicator.style.left  = tab.offsetLeft + "px";
    indicator.style.width = tab.offsetWidth + "px";
  }

  function activate(tab) {
    // Update tab states
    tabs.forEach((t) => {
      const isActive = t === tab;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive);
    });

    // Show / hide panels
    tabs.forEach((t) => {
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = t !== tab;
    });

    moveIndicator(tab);
  }

  // Click handler
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab));
  });

  // Keyboard: arrow keys for tab navigation
  tabBar.addEventListener("keydown", (e) => {
    const list = Array.from(tabs);
    const idx  = list.indexOf(document.activeElement);
    if (idx === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = list[(idx + 1) % list.length];
      next.focus();
      activate(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = list[(idx - 1 + list.length) % list.length];
      prev.focus();
      activate(prev);
    }
  });

  // Set indicator on load (no transition on first paint)
  const activeTab = tabBar.querySelector(".tab.active") || tabs[0];
  indicator.style.transition = "none";
  moveIndicator(activeTab);
  // Re-enable transition after first frame
  requestAnimationFrame(() => {
    indicator.style.transition = "";
  });
})();
