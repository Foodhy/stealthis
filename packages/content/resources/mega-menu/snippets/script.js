(function () {
  var triggers = document.querySelectorAll(".nav-trigger");
  var overlay = document.getElementById("menu-overlay");
  var activePanel = null;
  var activeTrigger = null;

  function openMenu(trigger) {
    var panelId = trigger.getAttribute("aria-controls");
    var panel = document.getElementById(panelId);
    if (!panel) return;

    // Close any currently open menu first
    if (activePanel && activePanel !== panel) {
      closeMenu();
    }

    trigger.setAttribute("aria-expanded", "true");
    panel.classList.add("open");
    if (overlay) overlay.classList.add("active");
    activePanel = panel;
    activeTrigger = trigger;
  }

  function closeMenu() {
    if (activeTrigger) activeTrigger.setAttribute("aria-expanded", "false");
    if (activePanel) activePanel.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    activePanel = null;
    activeTrigger = null;
  }

  // Toggle on trigger click
  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var panelId = trigger.getAttribute("aria-controls");
      var panel = document.getElementById(panelId);
      if (panel && panel.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu(trigger);
      }
    });

    // Keyboard: Enter/Space handled natively for buttons
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
        trigger.focus();
      }
    });
  });

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  // Close on Escape from anywhere
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activePanel) {
      var prev = activeTrigger;
      closeMenu();
      if (prev) prev.focus();
    }
  });

  // Close when focus leaves the open panel and its trigger
  document.addEventListener("focusin", function (e) {
    if (!activePanel) return;
    var inNavbar = document.querySelector(".navbar").contains(e.target);
    if (!inNavbar) closeMenu();
  });
})();
