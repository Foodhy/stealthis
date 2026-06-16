/* =========================================================
   The Meridian Standard — front page interactions
   Vanilla JS only. No external libraries.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Live dateline clock ---------- */
  var clockEl = document.getElementById("dateline-clock");
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function renderDateline() {
    if (!clockEl) return;
    var now = new Date();
    var day = DAYS[now.getDay()];
    var month = MONTHS[now.getMonth()];
    var date = ordinal(now.getDate());
    var year = now.getFullYear();
    var hh = now.getHours();
    var mm = now.getMinutes();
    var ss = now.getSeconds();
    var ampm = hh >= 12 ? "PM" : "AM";
    var h12 = hh % 12;
    if (h12 === 0) h12 = 12;
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    var time = h12 + ":" + pad(mm) + ":" + pad(ss) + " " + ampm;
    clockEl.textContent =
      "Meridian City · " + day + ", " + month + " " + date + ", " + year + " · " + time;
  }
  renderDateline();
  setInterval(renderDateline, 1000);

  /* ---------- Text size A- / A+ ---------- */
  var SIZES = ["s", "m", "l", "xl"];
  var LABELS = { s: "Small", m: "Medium", l: "Large", xl: "Extra Large" };
  var body = document.body;

  function currentIndex() {
    var idx = SIZES.indexOf(body.getAttribute("data-text-size") || "m");
    return idx === -1 ? 1 : idx;
  }
  function setSize(idx) {
    idx = Math.max(0, Math.min(SIZES.length - 1, idx));
    var size = SIZES[idx];
    body.setAttribute("data-text-size", size);
    try { localStorage.setItem("ms-text-size", size); } catch (e) {}
    toast("Text size: " + LABELS[size]);
  }

  // restore saved preference
  try {
    var saved = localStorage.getItem("ms-text-size");
    if (saved && SIZES.indexOf(saved) !== -1) body.setAttribute("data-text-size", saved);
  } catch (e) {}

  var smaller = document.getElementById("text-smaller");
  var larger = document.getElementById("text-larger");
  if (smaller) smaller.addEventListener("click", function () { setSize(currentIndex() - 1); });
  if (larger) larger.addEventListener("click", function () { setSize(currentIndex() + 1); });

  /* ---------- Section-jump nav (smooth scroll) ---------- */
  var navLinks = document.querySelectorAll('.utility__nav a[href^="#"]');
  Array.prototype.forEach.call(navLinks, function (link) {
    link.addEventListener("click", function (ev) {
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      ev.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      toast("Jumped to " + link.textContent.trim());
    });
  });

  /* ---------- Back to top ---------- */
  var backTop = document.getElementById("back-to-top");
  if (backTop) {
    backTop.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- Headline links → toast (fictional) ---------- */
  var storyLinks = document.querySelectorAll(
    '.story__hed a, .op__hed a, .jump'
  );
  Array.prototype.forEach.call(storyLinks, function (link) {
    link.addEventListener("click", function (ev) {
      if (link.getAttribute("href") === "#" || link.classList.contains("jump")) {
        ev.preventDefault();
        toast("This is an illustrative front page — the article is fictional.");
      }
    });
  });

  /* ---------- Rotating weather flag (cosmetic) ---------- */
  var weatherEl = document.getElementById("weather-flag");
  var CONDITIONS = ["Fair · 64°F", "Breezy · 61°F", "Clear · 66°F", "Overcast · 59°F"];
  var wIdx = 0;
  if (weatherEl) {
    setInterval(function () {
      wIdx = (wIdx + 1) % CONDITIONS.length;
      weatherEl.textContent = CONDITIONS[wIdx];
    }, 8000);
  }
})();
