(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- Accent color picker ---------- */
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));
  var ACCENT_KEY = "cv-accent";

  function applyAccent(color, announce) {
    root.style.setProperty("--accent", color);
    swatches.forEach(function (s) {
      var active = s.dataset.accent === color;
      s.setAttribute("aria-checked", active ? "true" : "false");
      s.tabIndex = active ? 0 : -1;
    });
    try { localStorage.setItem(ACCENT_KEY, color); } catch (e) {}
    if (announce) {
      var name = announce.getAttribute("aria-label") || "accent";
      toast("Accent set to " + name);
    }
  }

  swatches.forEach(function (s, i) {
    s.addEventListener("click", function () {
      applyAccent(s.dataset.accent, s);
    });
    // Roving keyboard support inside the radiogroup
    s.addEventListener("keydown", function (e) {
      var dir = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") dir = 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") dir = -1;
      else return;
      e.preventDefault();
      var next = (i + dir + swatches.length) % swatches.length;
      swatches[next].focus();
      applyAccent(swatches[next].dataset.accent, swatches[next]);
    });
  });

  // Restore a previously chosen accent
  try {
    var saved = localStorage.getItem(ACCENT_KEY);
    if (saved && swatches.some(function (s) { return s.dataset.accent === saved; })) {
      applyAccent(saved, null);
    }
  } catch (e) {}

  /* ---------- Density toggle ---------- */
  var densityBtn = document.getElementById("density-btn");
  if (densityBtn) {
    densityBtn.addEventListener("click", function () {
      var compact = body.classList.toggle("is-compact");
      densityBtn.setAttribute("aria-pressed", compact ? "true" : "false");
      densityBtn.textContent = compact ? "Comfortable" : "Compact";
      toast(compact ? "Compact spacing on" : "Comfortable spacing on");
    });
  }

  /* ---------- Print / Save PDF ---------- */
  var printBtn = document.getElementById("print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      toast("Opening print dialog — choose “Save as PDF”");
      // Let the toast paint before the (blocking) print dialog opens.
      window.setTimeout(function () { window.print(); }, 180);
    });
  }

  // Ctrl/Cmd+P keeps working and feels native.
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
      // browser handles print itself; nothing to override
    }
  });
})();
