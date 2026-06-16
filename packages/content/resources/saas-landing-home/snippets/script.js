/* ============ Cadence — SaaS Landing ============ */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- theme toggle (persisted) ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  var stored;
  try { stored = localStorage.getItem("cadence-theme"); } catch (e) {}
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
  function syncThemeBtn() {
    var dark = root.getAttribute("data-theme") === "dark";
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(dark));
  }
  syncThemeBtn();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("cadence-theme", next); } catch (e) {}
      syncThemeBtn();
      toast(next === "dark" ? "Dark mode on" : "Light mode on");
    });
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.querySelector(".primary-nav");
  function closeNav() {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.classList.remove("open");
    nav.classList.remove("open");
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.classList.toggle("open", !open);
      nav.classList.toggle("open", !open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- product preview tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".ptab"));
  function panelFor(tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  }
  function activateTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = panelFor(t);
      if (panel) {
        if (on) { panel.removeAttribute("hidden"); panel.classList.add("is-active"); }
        else { panel.setAttribute("hidden", ""); panel.classList.remove("is-active"); }
      }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      activateTab(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up metrics ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function fmt(val, decimals) {
    if (decimals > 0) return val.toFixed(decimals);
    return Math.round(val).toLocaleString("en-US");
  }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var start = null, dur = 1500;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- CTA / plan buttons feedback ---------- */
  document.querySelectorAll(".plan .btn, .final-cta .btn, .hero-cta .btn").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#") return; // let in-page anchors scroll
      e.preventDefault();
      var label = a.textContent.trim();
      toast(/sales/i.test(label) ? "Opening sales chat…" : "Spinning up your free workspace…");
    });
  });
})();
