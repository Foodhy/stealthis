(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- mobile nav ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a, .nav-cta a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- animated counters ---------- */
  function fmt(n, decimals) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = fmt(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- savings calculator ---------- */
  var LEGACY_RATE = 0.024;   // 2.4% on cross-border
  var LEGACY_DOM = 0.009;    // 0.9% on domestic
  var LL_RATE = 0.006;       // flat 0.6%

  var vol = document.getElementById("vol");
  var cross = document.getElementById("cross");
  var volOut = document.getElementById("volOut");
  var crossOut = document.getElementById("crossOut");
  var curFee = document.getElementById("curFee");
  var newFee = document.getElementById("newFee");
  var saved = document.getElementById("saved");
  var pct = document.getElementById("pct");
  var barFill = document.getElementById("barFill");

  var usd0 = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  function recalc() {
    if (!vol) return;
    var monthly = parseInt(vol.value, 10);
    var crossShare = parseInt(cross.value, 10) / 100;
    var annual = monthly * 12;

    var crossVol = annual * crossShare;
    var domVol = annual * (1 - crossShare);

    var current = crossVol * LEGACY_RATE + domVol * LEGACY_DOM;
    var ledger = annual * LL_RATE;
    var diff = Math.max(current - ledger, 0);
    var savePct = current > 0 ? (diff / current) * 100 : 0;

    volOut.textContent = usd0(monthly);
    crossOut.textContent = cross.value + "%";
    curFee.textContent = usd0(current);
    newFee.textContent = usd0(ledger);
    saved.textContent = usd0(diff);
    pct.textContent = Math.round(savePct) + "%";
    barFill.style.width = Math.min(savePct, 100).toFixed(0) + "%";
  }

  if (vol && cross) {
    vol.addEventListener("input", recalc);
    cross.addEventListener("input", recalc);
    recalc();
  }

  var calcCta = document.getElementById("calcCta");
  if (calcCta) {
    calcCta.addEventListener("click", function () {
      toast("Estimate saved — scroll down to book your demo.");
      var demo = document.getElementById("demo");
      if (demo) demo.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        var email = document.getElementById("email");
        if (email) email.focus();
      }, 600);
    });
  }

  /* ---------- demo form ---------- */
  var demoForm = document.getElementById("demoForm");
  var emailInput = document.getElementById("email");
  var emailErr = document.getElementById("emailErr");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (demoForm && emailInput) {
    demoForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var val = emailInput.value.trim();
      if (!EMAIL_RE.test(val)) {
        emailInput.classList.add("invalid");
        emailInput.setAttribute("aria-invalid", "true");
        if (emailErr) emailErr.hidden = false;
        emailInput.focus();
        return;
      }
      emailInput.classList.remove("invalid");
      emailInput.removeAttribute("aria-invalid");
      if (emailErr) emailErr.hidden = true;
      demoForm.reset();
      toast("Thanks! A specialist will reach out within one business day.");
    });
    emailInput.addEventListener("input", function () {
      if (!emailInput.classList.contains("invalid")) return;
      if (EMAIL_RE.test(emailInput.value.trim())) {
        emailInput.classList.remove("invalid");
        emailInput.removeAttribute("aria-invalid");
        if (emailErr) emailErr.hidden = true;
      }
    });
  }
})();
