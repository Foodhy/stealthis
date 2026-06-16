(function () {
  "use strict";

  var page = document.getElementById("page");
  var readBtn = document.getElementById("readBtn");
  var pageMeta = document.getElementById("pageMeta");
  var layoutBtns = Array.prototype.slice.call(document.querySelectorAll(".seg__btn"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var toastEl = document.getElementById("toast");

  var LAYOUT_LABELS = {
    classic: "Classic grid",
    splash: "Splash hero",
    strip: "Vertical strip",
    mosaic: "Mosaic",
  };

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function updateMeta() {
    var layout = page.getAttribute("data-layout") || "classic";
    pageMeta.textContent = panels.length + " panels · " + LAYOUT_LABELS[layout];
  }

  /* ---------- Layout switcher ---------- */
  function setLayout(layout) {
    if (reading) stopReading(true);
    page.setAttribute("data-layout", layout);
    layoutBtns.forEach(function (b) {
      var on = b.getAttribute("data-layout") === layout;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    updateMeta();
    toast("Layout: " + LAYOUT_LABELS[layout]);
  }

  layoutBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLayout(btn.getAttribute("data-layout"));
    });
    // Arrow-key navigation across the radiogroup
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var i = layoutBtns.indexOf(btn);
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = layoutBtns[(i + dir + layoutBtns.length) % layoutBtns.length];
      next.focus();
      setLayout(next.getAttribute("data-layout"));
    });
  });

  /* ---------- Reading order (guided 1 -> N) ---------- */
  var reading = false;
  var stepTimer = null;
  var stepIndex = 0;
  // panels follow DOM source order, which equals reading order 1..N
  var ordered = panels.slice().sort(function (a, b) {
    return Number(a.dataset.panel) - Number(b.dataset.panel);
  });

  function clearActive() {
    ordered.forEach(function (p) {
      p.classList.remove("is-active");
    });
  }

  function highlight(i) {
    clearActive();
    var p = ordered[i];
    if (!p) return;
    p.classList.add("is-active");
    p.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  }

  function advance() {
    highlight(stepIndex);
    var n = stepIndex + 1;
    toast("Reading panel " + n + " of " + ordered.length);
    stepIndex += 1;
    if (stepIndex >= ordered.length) {
      // finished the page
      window.clearTimeout(stepTimer);
      stepTimer = window.setTimeout(function () {
        stopReading(false);
        toast("End of page — " + ordered.length + " panels read");
      }, 1600);
      return;
    }
    stepTimer = window.setTimeout(advance, 1500);
  }

  function startReading() {
    reading = true;
    stepIndex = 0;
    page.classList.add("is-reading");
    readBtn.setAttribute("aria-pressed", "true");
    advance();
  }

  function stopReading(silent) {
    reading = false;
    window.clearTimeout(stepTimer);
    page.classList.remove("is-reading");
    clearActive();
    readBtn.setAttribute("aria-pressed", "false");
    if (!silent) toast("Reading guide off");
  }

  readBtn.addEventListener("click", function () {
    if (reading) stopReading(false);
    else startReading();
  });

  /* ---------- Manual panel focus: jump the guide to a panel ---------- */
  function activatePanel(p) {
    var i = ordered.indexOf(p);
    if (i < 0) return;
    window.clearTimeout(stepTimer);
    if (!reading) {
      reading = true;
      page.classList.add("is-reading");
      readBtn.setAttribute("aria-pressed", "true");
    }
    stepIndex = i;
    highlight(i);
    toast("Panel " + (i + 1) + " of " + ordered.length);
    // resume the auto-walk from here
    stepIndex += 1;
    if (stepIndex < ordered.length) {
      stepTimer = window.setTimeout(advance, 1700);
    }
  }

  panels.forEach(function (p) {
    p.addEventListener("click", function () {
      activatePanel(p);
    });
    p.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activatePanel(p);
      }
    });
  });

  /* ---------- Keyboard: Escape stops the guide ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && reading) stopReading(false);
  });

  updateMeta();
})();
