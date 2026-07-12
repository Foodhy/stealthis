(function () {
  "use strict";

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
    }, 2400);
  }

  /* ---------- Copy email ---------- */
  function wireCopy(btn) {
    if (!btn) return;
    btn.addEventListener("click", function () {
      var email = btn.getAttribute("data-email") || "";
      var done = function () { toast("Copied " + email + " to clipboard"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { fallback(email, done); });
      } else {
        fallback(email, done);
      }
    });
  }
  function fallback(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { toast("Press Ctrl+C to copy"); }
    document.body.removeChild(ta);
  }
  wireCopy(document.getElementById("copyEmail"));
  wireCopy(document.getElementById("copyEmail2"));

  /* ---------- Gear filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".gear-card"));
  var emptyEl = document.getElementById("gearEmpty");

  function applyFilter(type) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = type === "all" || card.getAttribute("data-type") === type;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated stat counters ---------- */
  var statsSection = document.getElementById("stats");
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    var nums = Array.prototype.slice.call(document.querySelectorAll(".stat-num"));
    nums.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-to"), 10) || 0;
      var start = performance.now();
      var dur = 1400;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if (statsSection && "IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounters(); statObs.disconnect(); }
      });
    }, { threshold: 0.4 });
    statObs.observe(statsSection);
  } else {
    runCounters();
  }

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".topnav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (a) {
            a.style.color = a.getAttribute("href") === "#" + id ? "var(--paper)" : "";
          });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { navObs.observe(s); });
  }
})();
