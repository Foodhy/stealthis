/* ============================================================
   Two-column CV — accent switcher, density toggle, print, toast
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  var body = document.body;
  var STORE = "okafor-cv";

  /* ---------- toast helper ---------- */
  var toastEl = null;
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast no-print";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      Object.assign(toastEl.style, {
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%) translateY(16px)",
        background: "var(--ink)",
        color: "#fff",
        font: "600 13.5px/1 var(--font)",
        padding: "11px 18px",
        borderRadius: "999px",
        boxShadow: "0 14px 34px -12px rgba(0,0,0,.5)",
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity .22s ease, transform .22s ease",
        zIndex: "9999",
        maxWidth: "90vw",
        textAlign: "center"
      });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () {
      toastEl.style.opacity = "1";
      toastEl.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(-50%) translateY(16px)";
    }, 1900);
  }

  /* ---------- persistence ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (e) { /* ignore */ }
  }
  var state = load();

  /* ---------- accent switcher ---------- */
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));
  var accentNames = {
    indigo: "Indigo", emerald: "Emerald", rose: "Rose",
    amber: "Amber", slate: "Slate"
  };

  function setAccent(name, announce) {
    if (!accentNames[name]) name = "indigo";
    body.setAttribute("data-accent", name);
    swatches.forEach(function (s) {
      var on = s.getAttribute("data-accent") === name;
      s.setAttribute("aria-checked", on ? "true" : "false");
    });
    state.accent = name;
    save(state);
    if (announce) toast(accentNames[name] + " accent applied");
  }

  swatches.forEach(function (s) {
    s.addEventListener("click", function () {
      setAccent(s.getAttribute("data-accent"), true);
    });
  });

  // Roving keyboard support inside the radiogroup
  var group = document.querySelector(".swatches");
  if (group) {
    group.addEventListener("keydown", function (e) {
      var idx = swatches.indexOf(document.activeElement);
      if (idx === -1) return;
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % swatches.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + swatches.length) % swatches.length;
      if (next !== null) {
        e.preventDefault();
        swatches[next].focus();
        setAccent(swatches[next].getAttribute("data-accent"), true);
      }
    });
  }

  /* ---------- density toggle ---------- */
  var densityBtn = document.getElementById("density-toggle");
  var densityText = document.getElementById("density-text");

  function setDensity(mode, announce) {
    var compact = mode === "compact";
    body.setAttribute("data-density", compact ? "compact" : "comfortable");
    densityBtn.setAttribute("aria-pressed", compact ? "true" : "false");
    // Button offers the OTHER mode as its action label
    densityText.textContent = compact ? "Comfortable" : "Compact";
    state.density = compact ? "compact" : "comfortable";
    save(state);
    if (announce) toast((compact ? "Compact" : "Comfortable") + " density");
  }

  densityBtn.addEventListener("click", function () {
    var now = body.getAttribute("data-density");
    setDensity(now === "compact" ? "comfortable" : "compact", true);
  });

  /* ---------- print ---------- */
  var printBtn = document.getElementById("print-btn");
  printBtn.addEventListener("click", function () {
    toast("Opening print dialog…");
    setTimeout(function () { window.print(); }, 120);
  });

  /* ---------- restore saved prefs ---------- */
  setAccent(state.accent || body.getAttribute("data-accent") || "indigo", false);
  setDensity(state.density || body.getAttribute("data-density") || "comfortable", false);

  /* ---------- friendly: copy email on click of mailto label area ---------- */
  var mailLink = document.querySelector('a[href^="mailto:"]');
  if (mailLink && navigator.clipboard) {
    mailLink.addEventListener("click", function (e) {
      var email = mailLink.getAttribute("href").replace("mailto:", "");
      // Let the mailto fire, but also copy as a convenience.
      navigator.clipboard.writeText(email).then(function () {
        toast("Email copied: " + email);
      }).catch(function () { /* ignore */ });
    });
  }
})();
