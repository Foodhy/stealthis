(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 320);
    }, 3000);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- Tracking widget ---------- */
  var trackForm = document.getElementById("trackForm");
  var trackInput = document.getElementById("trackInput");
  var trackResult = document.getElementById("trackResult");

  var SAMPLES = {
    "VP-7K42-9180": {
      ok: true, status: "Out for delivery",
      line: "Courier Mara D. is 3 stops away · Larkfield Ave",
      eta: "Arrives by 4:45 PM"
    },
    "VP-3A09-2255": {
      ok: true, status: "At sorting hub",
      line: "Departed Centro hub · next-day AM service",
      eta: "Arrives tomorrow before 10 AM"
    }
  };

  function lookup(code) {
    code = (code || "").trim().toUpperCase();
    if (!code) return null;
    if (SAMPLES[code]) return Object.assign({ id: code }, SAMPLES[code]);
    // Deterministic pseudo-result for any well-formed code
    if (/^VP[-\s]?[A-Z0-9]{2,}/.test(code)) {
      var states = [
        { status: "Picked up", line: "Collected from sender · awaiting sort", eta: "Arrives in 1–2 days" },
        { status: "In transit", line: "Moving between Eastgate and Centro hubs", eta: "Arrives tomorrow" },
        { status: "Out for delivery", line: "On the van · estimated 9 stops away", eta: "Arrives by 6:00 PM" }
      ];
      var h = 0; for (var i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
      var s = states[h % states.length];
      return { id: code, ok: true, status: s.status, line: s.line, eta: s.eta };
    }
    return { id: code, ok: false };
  }

  function renderResult(r) {
    if (!trackResult) return;
    if (!r) { trackResult.hidden = true; return; }
    trackResult.hidden = false;
    if (!r.ok) {
      trackResult.classList.add("is-fail");
      trackResult.innerHTML =
        '<div class="res-top"><span class="res-id">' + esc(r.id) + '</span>' +
        '<span class="pill pill-warn">Not found</span></div>' +
        '<p class="res-line">We couldn\'t find that number. Codes look like <strong>VP-7K42-9180</strong>.</p>';
      return;
    }
    trackResult.classList.remove("is-fail");
    trackResult.innerHTML =
      '<div class="res-top"><span class="res-id">' + esc(r.id) + '</span>' +
      '<span class="pill pill-track">' + esc(r.status) + '</span></div>' +
      '<p class="res-line">' + esc(r.line) + '</p>' +
      '<p class="res-eta">' + esc(r.eta) + '</p>';
    toast("Tracking " + r.id + " — " + r.status);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (trackForm) {
    trackForm.addEventListener("submit", function (e) {
      e.preventDefault();
      renderResult(lookup(trackInput.value));
    });
    document.querySelectorAll("[data-sample]").forEach(function (b) {
      b.addEventListener("click", function () {
        trackInput.value = b.getAttribute("data-sample");
        renderResult(lookup(trackInput.value));
        trackInput.focus();
      });
    });
  }

  /* ---------- Hero ETA countdown ---------- */
  var etaClock = document.getElementById("etaClock");
  if (etaClock) {
    var secs = 14 * 60 + 52;
    setInterval(function () {
      if (secs <= 0) { secs = 14 * 60 + 52; return; }
      secs--;
      var m = Math.floor(secs / 60), s = secs % 60;
      etaClock.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
  }

  /* ---------- Animated driver along route ---------- */
  var route = document.getElementById("route");
  var driver = document.getElementById("driver");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (route && driver && route.getTotalLength && !reduce) {
    var len = route.getTotalLength();
    var t = 0;
    setInterval(function () {
      t = (t + 0.004) % 1;
      var p = route.getPointAtLength(len * t);
      driver.setAttribute("cx", p.x);
      driver.setAttribute("cy", p.y);
    }, 40);
  }

  /* ---------- Pricing calculator ---------- */
  var qForm = document.getElementById("quoteForm");
  var qService = document.getElementById("qService");
  var qDist = document.getElementById("qDist");
  var qDistVal = document.getElementById("qDistVal");
  var quotePrice = document.getElementById("quotePrice");
  var quoteEta = document.getElementById("quoteEta");
  var segBtns = qForm ? qForm.querySelectorAll(".seg-btn") : [];
  var sizeMult = 1.6;

  var ETA_TEXT = {
    same: "Same-day · before 9pm",
    next: "Next-day · before 5pm",
    intl: "International · 3–6 days"
  };

  function recalc() {
    if (!qService || !quotePrice) return;
    var opt = qService.options[qService.selectedIndex];
    var base = parseFloat(opt.getAttribute("data-base"));
    var per = parseFloat(opt.getAttribute("data-per"));
    var dist = parseInt(qDist.value, 10);
    var price = (base + per * dist) * sizeMult;
    quotePrice.textContent = "$" + price.toFixed(2);
    quoteEta.textContent = ETA_TEXT[qService.value];
    qDistVal.textContent = dist + " km";
  }

  if (qForm) {
    segBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        segBtns.forEach(function (b) { b.classList.remove("is-on"); b.setAttribute("aria-checked", "false"); });
        btn.classList.add("is-on");
        btn.setAttribute("aria-checked", "true");
        sizeMult = parseFloat(btn.getAttribute("data-mult"));
        recalc();
      });
    });
    qService.addEventListener("change", recalc);
    qDist.addEventListener("input", recalc);
    qForm.addEventListener("submit", function (e) {
      e.preventDefault();
      toast("Booking requested — " + quotePrice.textContent + " (" + quoteEta.textContent + ")");
    });
    recalc();
  }

  /* ---------- Coverage hub tooltips ---------- */
  var covMap = document.querySelector(".cov-map");
  var covTip = document.getElementById("covTip");
  if (covMap && covTip) {
    var hubs = covMap.querySelectorAll(".hub");
    function showTip(hub) {
      var c = hub.querySelector("circle");
      var rect = covMap.getBoundingClientRect();
      var crect = c.getBoundingClientRect();
      covTip.hidden = false;
      covTip.style.left = (crect.left - rect.left + crect.width / 2) + "px";
      covTip.style.top = (crect.top - rect.top + crect.height / 2) + "px";
      covTip.innerHTML = esc(hub.getAttribute("data-name")) +
        "<small>" + esc(hub.getAttribute("data-stat")) + "</small>";
    }
    function hideTip() { covTip.hidden = true; }
    hubs.forEach(function (hub) {
      hub.addEventListener("mouseenter", function () { showTip(hub); });
      hub.addEventListener("mouseleave", hideTip);
      hub.addEventListener("focus", function () { showTip(hub); });
      hub.addEventListener("blur", hideTip);
    });
  }
})();
