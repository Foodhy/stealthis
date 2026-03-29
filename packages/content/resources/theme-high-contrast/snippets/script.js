(function () {
  var buttons = document.querySelectorAll(".toggle-btn");
  var body = document.body;

  var modes = {
    normal: "",
    "high-contrast": "high-contrast",
    "forced-colors": "forced-colors",
  };

  function setMode(mode) {
    // Remove all mode classes
    body.classList.remove("high-contrast", "forced-colors");

    // Add selected mode class
    if (modes[mode]) {
      body.classList.add(modes[mode]);
    }

    // Update button states
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  // Attach click handlers
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.getAttribute("data-mode"));
    });
  });

  // Keyboard support for toggle group
  var toggleGroup = document.querySelector(".theme-toggle");
  toggleGroup.addEventListener("keydown", function (e) {
    var current = document.querySelector(".toggle-btn.active");
    var btns = Array.from(buttons);
    var idx = btns.indexOf(current);

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      var next = btns[(idx + 1) % btns.length];
      next.focus();
      setMode(next.getAttribute("data-mode"));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      var prev = btns[(idx - 1 + btns.length) % btns.length];
      prev.focus();
      setMode(prev.getAttribute("data-mode"));
    }
  });
})();
