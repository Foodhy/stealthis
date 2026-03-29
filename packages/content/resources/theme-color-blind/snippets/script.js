(function () {
  var dashboard = document.getElementById("dashboard");
  var modeLabel = document.getElementById("mode-label");
  var modeBtns = document.querySelectorAll(".mode-btn");
  var accToggle = document.getElementById("accessible-toggle");

  var modeNames = {
    normal: "Normal Vision",
    protanopia: "Protanopia (no red cones)",
    deuteranopia: "Deuteranopia (no green cones)",
    tritanopia: "Tritanopia (no blue cones)",
  };

  // ── Vision mode ──
  function setVisionMode(mode) {
    // Remove all filter classes
    dashboard.classList.remove("filter-protanopia", "filter-deuteranopia", "filter-tritanopia");

    // Apply new filter
    if (mode !== "normal") {
      dashboard.classList.add("filter-" + mode);
    }

    // Update button states
    modeBtns.forEach(function (btn) {
      var isActive = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    // Update label
    modeLabel.textContent = modeNames[mode] || "Normal Vision";
  }

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setVisionMode(btn.getAttribute("data-mode"));
    });
  });

  // ── Accessible version toggle ──
  accToggle.addEventListener("change", function () {
    if (accToggle.checked) {
      dashboard.classList.add("accessible");
    } else {
      dashboard.classList.remove("accessible");
    }
  });

  // ── Keyboard navigation for mode buttons ──
  var toggleGroup = document.querySelector(".toggle-group");
  toggleGroup.addEventListener("keydown", function (e) {
    var btns = Array.from(modeBtns);
    var current = document.querySelector(".mode-btn.active");
    var idx = btns.indexOf(current);

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      var next = btns[(idx + 1) % btns.length];
      next.focus();
      setVisionMode(next.getAttribute("data-mode"));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      var prev = btns[(idx - 1 + btns.length) % btns.length];
      prev.focus();
      setVisionMode(prev.getAttribute("data-mode"));
    }
  });
})();
