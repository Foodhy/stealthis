(function () {
  "use strict";

  const page = document.getElementById("page");
  const switchEl = document.getElementById("layoutSwitch");
  const buttons = Array.from(switchEl.querySelectorAll(".layout-btn"));
  const gutter = document.getElementById("gutter");
  const gutterVal = document.getElementById("gutterVal");
  const toastEl = document.getElementById("toast");

  const LAYOUT_NAMES = {
    grid: "2 × 2 Grid",
    splash: "Splash + Strip",
    diagonal: "Diagonal Panels",
    inset: "Inset Panel",
  };

  /* ---- toast helper ---- */
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  /* ---- layout switcher ---- */
  function setLayout(layout) {
    if (!LAYOUT_NAMES[layout] || page.dataset.layout === layout) return;
    page.dataset.layout = layout;

    buttons.forEach(function (btn) {
      const active = btn.dataset.layout === layout;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    toast("Layout → " + LAYOUT_NAMES[layout]);
  }

  switchEl.addEventListener("click", function (e) {
    const btn = e.target.closest(".layout-btn");
    if (btn) setLayout(btn.dataset.layout);
  });

  /* arrow-key navigation across the layout buttons */
  switchEl.addEventListener("keydown", function (e) {
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) return;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % buttons.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + buttons.length) % buttons.length;
    if (next === -1) return;
    e.preventDefault();
    buttons[next].focus();
    setLayout(buttons[next].dataset.layout);
  });

  /* ---- gutter slider -> CSS variable ---- */
  function applyGutter(px) {
    page.style.setProperty("--gutter", px + "px");
    gutterVal.textContent = px + "px";
  }

  gutter.addEventListener("input", function () {
    applyGutter(parseInt(gutter.value, 10));
  });

  let releaseTimer = null;
  gutter.addEventListener("change", function () {
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(function () {
      toast("Gutter set to " + gutter.value + "px");
    }, 120);
  });

  /* ---- init ---- */
  applyGutter(parseInt(gutter.value, 10));
})();
