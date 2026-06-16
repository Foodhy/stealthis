(function () {
  "use strict";

  var root = document.documentElement;
  var STORE = "atlas.settings";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, ok) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = (ok === false ? "" : '<span class="tick">✓</span>') +
      "<span>" + msg + "</span>";
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  /* ---------- Persisted prefs ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function save(p) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) {}
  }
  var prefs = load();

  /* ---------- Theme ---------- */
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function applyTheme(mode) {
    var dark = mode === "dark" || (mode === "system" && mq.matches);
    root.setAttribute("data-theme", dark ? "dark" : "light");
  }
  function applyAccent(rgb) { root.style.setProperty("--accent", rgb); }

  var themeMode = prefs.theme || "light";
  applyTheme(themeMode);
  if (prefs.accent) applyAccent(prefs.accent);
  if (prefs.reduceMotion) root.setAttribute("data-reduce-motion", "1");
  mq.addEventListener("change", function () {
    if (themeMode === "system") applyTheme("system");
  });

  /* ---------- Section switching (tabs) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  function activate(section) {
    tabs.forEach(function (tab) {
      var on = tab.dataset.section === section;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".section").forEach(function (s) {
      var on = s.id === "sec-" + section;
      s.classList.toggle("is-active", on);
      s.hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activate(tab.dataset.section); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      activate(next.dataset.section);
    });
  });

  /* ---------- Dirty-state tracking ---------- */
  var dirty = false;
  var actionBar = document.getElementById("actionBar");
  var dirtyPill = document.getElementById("dirtyPill");
  function setDirty(v) {
    if (dirty === v) return;
    dirty = v;
    actionBar.hidden = !v;
    dirtyPill.hidden = !v;
  }

  // snapshot of all form inputs to detect real changes
  var inputs = Array.prototype.slice.call(
    document.querySelectorAll(".section input, .section textarea, .section select")
  ).filter(function (el) { return el.type !== "password"; });
  var baseline = {};
  inputs.forEach(function (el, i) { el.dataset.k = "f" + i; baseline[el.dataset.k] = el.value; });

  // toggle baseline
  var switches = Array.prototype.slice.call(document.querySelectorAll(".switch"));
  var toggleBase = {};
  switches.forEach(function (sw) {
    toggleBase[sw.dataset.toggle] = sw.getAttribute("aria-checked") === "true";
    // restore persisted toggle state
    if (prefs.toggles && prefs.toggles[sw.dataset.toggle] != null) {
      sw.setAttribute("aria-checked", prefs.toggles[sw.dataset.toggle] ? "true" : "false");
      toggleBase[sw.dataset.toggle] = prefs.toggles[sw.dataset.toggle];
    }
  });

  function recompute() {
    var changed = false;
    inputs.forEach(function (el) { if (el.value !== baseline[el.dataset.k]) changed = true; });
    switches.forEach(function (sw) {
      if ((sw.getAttribute("aria-checked") === "true") !== toggleBase[sw.dataset.toggle]) changed = true;
    });
    setDirty(changed);
  }

  inputs.forEach(function (el) { el.addEventListener("input", recompute); });

  /* ---------- Toggles ---------- */
  switches.forEach(function (sw) {
    sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", on ? "true" : "false");

      // live-effect toggles that persist immediately
      if (sw.dataset.toggle === "reduceMotion") {
        on ? root.setAttribute("data-reduce-motion", "1") : root.removeAttribute("data-reduce-motion");
      }
      recompute();
    });
    sw.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); sw.click(); }
    });
  });

  /* ---------- Theme picker ---------- */
  var themeCards = Array.prototype.slice.call(document.querySelectorAll(".theme-card"));
  function selectRadio(list, el, attr) {
    list.forEach(function (x) {
      var on = x === el;
      x.classList.toggle("is-active", on);
      x.setAttribute("aria-checked", on ? "true" : "false");
      x.tabIndex = on ? 0 : -1;
    });
  }
  themeCards.forEach(function (card) {
    if (card.dataset.theme === themeMode) selectRadio(themeCards, card);
    card.addEventListener("click", function () {
      selectRadio(themeCards, card);
      themeMode = card.dataset.theme;
      applyTheme(themeMode);
      prefs.theme = themeMode;
      save(prefs);
      toast("Theme set to " + card.dataset.theme);
    });
  });

  /* ---------- Accent picker ---------- */
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".accent-swatch"));
  swatches.forEach(function (sw) {
    if (prefs.accent && sw.dataset.accent === prefs.accent) selectRadio(swatches, sw);
    sw.addEventListener("click", function () {
      selectRadio(swatches, sw);
      applyAccent(sw.dataset.accent);
      prefs.accent = sw.dataset.accent;
      save(prefs);
      toast("Accent color updated");
    });
  });

  /* ---------- Save / Discard ---------- */
  var saveBtn = document.getElementById("saveBtn");
  var discardBtn = document.getElementById("discardBtn");

  function commit() {
    inputs.forEach(function (el) { baseline[el.dataset.k] = el.value; });
    prefs.toggles = prefs.toggles || {};
    switches.forEach(function (sw) {
      var on = sw.getAttribute("aria-checked") === "true";
      toggleBase[sw.dataset.toggle] = on;
      prefs.toggles[sw.dataset.toggle] = on;
    });
    save(prefs);
    setDirty(false);
  }
  saveBtn.addEventListener("click", function () {
    commit();
    toast("Settings saved");
  });
  discardBtn.addEventListener("click", function () {
    inputs.forEach(function (el) { el.value = baseline[el.dataset.k]; });
    switches.forEach(function (sw) {
      sw.setAttribute("aria-checked", toggleBase[sw.dataset.toggle] ? "true" : "false");
      if (sw.dataset.toggle === "reduceMotion") {
        toggleBase.reduceMotion ? root.setAttribute("data-reduce-motion", "1") : root.removeAttribute("data-reduce-motion");
      }
    });
    setDirty(false);
    toast("Changes discarded", false);
  });

  /* ---------- Unsaved-changes guard ---------- */
  window.addEventListener("beforeunload", function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------- Misc buttons ---------- */
  var photoBtn = document.getElementById("changePhoto");
  if (photoBtn) photoBtn.addEventListener("click", function () { toast("Photo upload is disabled in this demo", false); });

  document.querySelectorAll(".sess-revoke").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.closest("li");
      li.style.transition = "opacity .2s, transform .2s";
      li.style.opacity = "0";
      li.style.transform = "translateX(8px)";
      setTimeout(function () { li.remove(); }, 200);
      toast("Session revoked");
    });
  });

  /* ---------- Delete modal ---------- */
  var modal = document.getElementById("modal");
  var openDelete = document.getElementById("deleteWs");
  var cancelDelete = document.getElementById("cancelDelete");
  var confirmDelete = document.getElementById("confirmDelete");
  var confirmInput = document.getElementById("confirmInput");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    confirmInput.value = "";
    confirmDelete.disabled = true;
    confirmInput.focus();
    document.addEventListener("keydown", escClose);
  }
  function closeModal() {
    modal.hidden = true;
    document.removeEventListener("keydown", escClose);
    if (lastFocus) lastFocus.focus();
  }
  function escClose(e) { if (e.key === "Escape") closeModal(); }

  openDelete.addEventListener("click", openModal);
  cancelDelete.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  confirmInput.addEventListener("input", function () {
    confirmDelete.disabled = confirmInput.value.trim() !== "DELETE";
  });
  confirmDelete.addEventListener("click", function () {
    closeModal();
    toast("Workspace deletion scheduled (demo only)", false);
  });
})();
