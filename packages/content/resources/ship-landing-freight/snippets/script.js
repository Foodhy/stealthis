(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.getElementById("navToggle");
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

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function formatNum(value, isFloat) {
    if (isFloat) return value.toFixed(1);
    return Math.round(value).toLocaleString("en-US");
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var isFloat = el.getAttribute("data-count").indexOf(".") !== -1;
    if (prefersReduced) { el.textContent = formatNum(target, isFloat) + suffix; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased, isFloat) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target, isFloat) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Animated truck marker along route ---------- */
  var path = document.getElementById("routePath");
  var marker = document.getElementById("truckMarker");
  if (path && marker && !prefersReduced && typeof path.getTotalLength === "function") {
    var len = path.getTotalLength();
    var t = 0;
    function moveTruck() {
      t += 0.0022;
      if (t > 1) t = 0;
      var pt = path.getPointAtLength(t * len);
      var ahead = path.getPointAtLength(Math.min(t + 0.01, 1) * len);
      var ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * (180 / Math.PI);
      marker.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ") rotate(" + ang + ")");
      requestAnimationFrame(moveTruck);
    }
    requestAnimationFrame(moveTruck);
  } else if (path && marker) {
    var mid = path.getPointAtLength(path.getTotalLength() * 0.55);
    marker.setAttribute("transform", "translate(" + mid.x + "," + mid.y + ")");
  }

  /* ---------- ETA countdown ---------- */
  var etaClock = document.getElementById("etaClock");
  var milesLeft = document.getElementById("milesLeft");
  if (etaClock) {
    var remaining = 2 * 3600 + 41 * 60 + 18; // seconds
    var miles = 182;
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function tick() {
      if (remaining > 0) remaining--;
      var h = Math.floor(remaining / 3600);
      var m = Math.floor((remaining % 3600) / 60);
      var s = remaining % 60;
      etaClock.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
      // shrink miles roughly proportional to time elapsed
      if (milesLeft) {
        var elapsedRatio = 1 - remaining / (2 * 3600 + 41 * 60 + 18);
        var mi = Math.max(0, Math.round(miles * (1 - elapsedRatio)));
        milesLeft.textContent = mi;
      }
    }
    if (!prefersReduced) setInterval(tick, 1000);
  }

  /* ---------- Service "get pricing" buttons ---------- */
  document.querySelectorAll(".svc-link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var svc = btn.getAttribute("data-svc");
      var select = document.getElementById("service");
      if (select) {
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].text.indexOf(svc) !== -1 || select.options[i].text.indexOf("(" + svc + ")") !== -1) {
            select.selectedIndex = i; break;
          }
        }
      }
      var quote = document.getElementById("quote");
      if (quote) quote.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      toast(svc + " selected — complete the form for pricing.");
    });
  });

  /* ---------- Quote form validation ---------- */
  var form = document.getElementById("quoteForm");
  if (form) {
    function setInvalid(el, bad) {
      if (bad) el.classList.add("invalid"); else el.classList.remove("invalid");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var origin = document.getElementById("origin");
      var dest = document.getElementById("dest");
      var email = document.getElementById("email");
      var zipRe = /^\d{5}$/;
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      var oBad = !zipRe.test(origin.value.trim());
      var dBad = !zipRe.test(dest.value.trim());
      var eBad = !emailRe.test(email.value.trim());

      setInvalid(origin, oBad);
      setInvalid(dest, dBad);
      setInvalid(email, eBad);

      if (oBad || dBad || eBad) {
        toast("Check the highlighted fields — ZIPs need 5 digits.");
        (oBad ? origin : dBad ? dest : email).focus();
        return;
      }
      var svc = document.getElementById("service").value;
      form.reset();
      toast("Quote request received for " + svc + ". A rep will reply within the hour.");
    });

    ["origin", "dest"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function () {
        el.value = el.value.replace(/\D/g, "").slice(0, 5);
        if (el.classList.contains("invalid") && /^\d{5}$/.test(el.value)) el.classList.remove("invalid");
      });
    });
    var emailEl = document.getElementById("email");
    if (emailEl) emailEl.addEventListener("input", function () {
      if (emailEl.classList.contains("invalid")) emailEl.classList.remove("invalid");
    });
  }

  /* ---------- Status pill cycle (demo realism) ---------- */
  var statusPill = document.getElementById("statusPill");
  if (statusPill && !prefersReduced) {
    var states = [
      { t: "IN TRANSIT", c: "pill-transit" },
      { t: "ON SCHEDULE", c: "pill-live" }
    ];
    var si = 0;
    setInterval(function () {
      si = (si + 1) % states.length;
      statusPill.textContent = states[si].t;
      statusPill.classList.remove("pill-transit", "pill-live");
      statusPill.classList.add(states[si].c);
    }, 4000);
  }
})();
