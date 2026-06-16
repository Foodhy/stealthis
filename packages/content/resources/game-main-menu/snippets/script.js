(function () {
  "use strict";

  const menu = document.getElementById("menu");
  const items = Array.prototype.slice.call(menu.querySelectorAll(".menu__item"));
  const settings = document.getElementById("settings");
  const settingsClose = document.getElementById("settingsClose");
  const settingsApply = document.getElementById("settingsApply");
  const quitModal = document.getElementById("quitModal");
  const quitConfirm = document.getElementById("quitConfirm");
  const toastEl = document.getElementById("toast");
  const stage = document.querySelector(".stage");
  const sceneLayers = Array.prototype.slice.call(document.querySelectorAll(".layer--ridge, .layer--stars"));

  let active = 0;
  let toastTimer = null;

  /* ---------- Toast helper ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- Menu focus/selection ---------- */
  function setActive(index, focus) {
    active = (index + items.length) % items.length;
    items.forEach(function (it, i) {
      it.classList.toggle("is-active", i === active);
    });
    if (focus) items[active].focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener("mouseenter", function () { setActive(i, false); });
    item.addEventListener("focus", function () { setActive(i, false); });
    item.addEventListener("click", function () { runAction(item.dataset.action); });
  });

  function runAction(action) {
    switch (action) {
      case "continue":
        toast("Resuming — Ironwood Pass · 41%");
        break;
      case "new":
        toast("New game — choose your Vanguard");
        break;
      case "load":
        toast("Opening 5 save slots…");
        break;
      case "options":
        openSettings();
        break;
      case "credits":
        toast("Nullforge Interactive · 142 contributors");
        break;
      case "quit":
        openQuit();
        break;
    }
  }

  /* ---------- Settings panel ---------- */
  function openSettings() {
    settings.classList.add("is-open");
    settings.setAttribute("aria-hidden", "false");
    settingsClose.focus();
  }
  function closeSettings() {
    settings.classList.remove("is-open");
    settings.setAttribute("aria-hidden", "true");
    items[active].focus();
  }
  settingsClose.addEventListener("click", closeSettings);
  settingsApply.addEventListener("click", function () {
    closeSettings();
    toast("Settings saved");
  });

  // Volume sliders
  settings.querySelectorAll('input[type="range"]').forEach(function (range) {
    const key = range.dataset.vol;
    const out = settings.querySelector('[data-out="' + key + '"]');
    range.addEventListener("input", function () {
      if (out) out.textContent = range.value;
      const pct = range.value / 100;
      range.style.background =
        "linear-gradient(90deg, var(--accent) " + (pct * 100) + "%, var(--panel) " + (pct * 100) + "%)";
    });
    // init fill
    range.dispatchEvent(new Event("input"));
  });

  // Difficulty selector
  const diffHints = {
    story: "Story — A relaxed pace. Combat eases off so you can soak in the world.",
    veteran: "Veteran — Enemies hit harder and stagger less. Recommended.",
    ashen: "Ashen — Permadeath. No mercy. The Hollow Reign remembers everything."
  };
  const segBtns = Array.prototype.slice.call(settings.querySelectorAll(".seg__btn"));
  const diffHint = document.getElementById("diffHint");
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      diffHint.textContent = diffHints[btn.dataset.diff];
    });
  });

  /* ---------- Quit modal ---------- */
  function openQuit() {
    quitModal.classList.add("is-open");
    quitModal.setAttribute("aria-hidden", "false");
    quitConfirm.focus();
  }
  function closeQuit() {
    quitModal.classList.remove("is-open");
    quitModal.setAttribute("aria-hidden", "true");
    items[active].focus();
  }
  quitModal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeQuit);
  });
  quitConfirm.addEventListener("click", function () {
    closeQuit();
    toast("Farewell, Vanguard — see you in the Reign.");
  });

  /* ---------- Keyboard navigation ---------- */
  document.addEventListener("keydown", function (e) {
    // Esc backs out of any open layer first
    if (e.key === "Escape") {
      if (quitModal.classList.contains("is-open")) { closeQuit(); e.preventDefault(); return; }
      if (settings.classList.contains("is-open")) { closeSettings(); e.preventDefault(); return; }
      return;
    }

    // Don't hijack arrows inside the settings sliders
    const inPanel = settings.classList.contains("is-open") || quitModal.classList.contains("is-open");
    if (inPanel) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(active + 1, true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(active - 1, true);
    } else if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement === document.body) {
        e.preventDefault();
        runAction(items[active].dataset.action);
      }
    }
  });

  /* ---------- Mouse parallax ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    stage.addEventListener("mousemove", function (e) {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      sceneLayers.forEach(function (layer, i) {
        const depth = (i + 1) * 6;
        layer.style.transform =
          "translate3d(" + (-cx * depth) + "px," + (-cy * depth) + "px,0)";
      });
    });
  }

  // Start with the first item highlighted
  setActive(0, false);
})();
