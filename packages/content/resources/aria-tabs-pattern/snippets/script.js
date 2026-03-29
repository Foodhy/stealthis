(() => {
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  function activateTab(tab) {
    // Deactivate all tabs
    tabs.forEach((t) => {
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
      t.classList.remove("tab--active");
    });

    // Hide all panels
    panels.forEach((p) => {
      p.hidden = true;
      p.classList.remove("tabpanel--active");
    });

    // Activate selected tab
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");
    tab.classList.add("tab--active");
    tab.focus();

    // Show associated panel
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    panel.hidden = false;
    panel.classList.add("tabpanel--active");
  }

  // Click handler
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  // Keyboard handler
  tablist.addEventListener("keydown", (e) => {
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let newIndex;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        activateTab(tabs[newIndex]);
        break;

      case "ArrowLeft":
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        activateTab(tabs[newIndex]);
        break;

      case "Home":
        e.preventDefault();
        activateTab(tabs[0]);
        break;

      case "End":
        e.preventDefault();
        activateTab(tabs[tabs.length - 1]);
        break;
    }
  });
})();
