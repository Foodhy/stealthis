/* The Meridian Courier — front page interactions (vanilla JS) */
(function () {
  "use strict";

  var doc = document;

  /* ----------------------------- toast helper ----------------------------- */
  var toastEl = doc.getElementById("toast");
  var toastTimer = null;
  function toast(msg, accent) {
    if (!toastEl) return;
    toastEl.innerHTML = accent
      ? '<span class="toast__accent">' + accent + "</span> " + msg
      : msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* --------------------------- live dateline clock ------------------------ */
  var clockEl = doc.getElementById("press-clock");
  var dayEl = doc.getElementById("dateline-day");
  var dateEl = doc.getElementById("dateline-date");
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function tick() {
    var now = new Date();
    if (clockEl) {
      clockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
      clockEl.setAttribute("datetime", now.toISOString());
    }
    if (dayEl) dayEl.textContent = DAYS[now.getDay()];
    if (dateEl) dateEl.textContent = MONTHS[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();
  }
  tick();
  window.setInterval(tick, 1000);

  /* ------------------------------ text size ------------------------------- */
  var root = doc.documentElement;
  var STORE_KEY = "courier-type-scale";
  var MIN = 0.85, MAX = 1.4, STEP = 0.075;
  var scale = 1;

  try {
    var saved = parseFloat(window.localStorage.getItem(STORE_KEY));
    if (!isNaN(saved) && saved >= MIN && saved <= MAX) scale = saved;
  } catch (e) { /* storage unavailable */ }

  function applyScale(announce) {
    scale = Math.min(MAX, Math.max(MIN, Math.round(scale * 1000) / 1000));
    root.style.setProperty("--type-scale", String(scale));
    try { window.localStorage.setItem(STORE_KEY, String(scale)); } catch (e) {}
    if (announce) {
      var pct = Math.round(scale * 100);
      toast("Body type set to " + pct + "%", "Aa");
    }
  }
  applyScale(false);

  function bind(id, fn) {
    var el = doc.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }
  bind("text-inc", function () { scale += STEP; applyScale(true); });
  bind("text-dec", function () { scale -= STEP; applyScale(true); });
  bind("text-reset", function () { scale = 1; applyScale(true); });

  /* --------------------------- section-jump nav --------------------------- */
  var jumpLinks = Array.prototype.slice.call(doc.querySelectorAll("[data-jump]"));
  var sections = [];

  jumpLinks.forEach(function (link) {
    var id = (link.getAttribute("href") || "").slice(1);
    var target = id ? doc.getElementById(id) : null;
    if (target) sections.push({ link: link, target: target });

    link.addEventListener("click", function (ev) {
      if (!target) return;
      ev.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
      // move focus for keyboard/AT users without re-scrolling
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      var label = link.textContent.trim();
      toast("Jumped to " + label, "§");
    });
  });

  /* ----------------- scroll-spy: highlight active section ----------------- */
  function setActive(id) {
    jumpLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0;
      });
      var bestId = null, best = 0;
      sections.forEach(function (s) {
        var r = visible[s.target.id] || 0;
        if (r > best) { best = r; bestId = s.target.id; }
      });
      if (bestId) setActive(bestId);
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (s) { io.observe(s.target); });
  }

  /* ------------------- "continued / more" link feedback ------------------- */
  doc.querySelectorAll(".morelist__link, .jump-cont").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      if (el.classList.contains("jump-cont")) {
        ev.preventDefault();
        toast("Story continues on an inside page", "☞");
        return;
      }
      ev.preventDefault();
      var headline = el.textContent.trim();
      toast("“" + headline + "” — inside section", "Read");
    });
  });

  /* a small welcome note once the masthead is set */
  window.setTimeout(function () {
    toast("Front page set. Use A− / A+ to resize the type.", "Extra");
  }, 600);
})();
