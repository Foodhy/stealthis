(function () {
  "use strict";

  var grid = document.getElementById("statGrid");
  var nums = Array.prototype.slice.call(document.querySelectorAll(".stat__num"));
  var replayBtn = document.getElementById("replayBtn");
  var donateBtn = document.getElementById("donateBtn");
  var toastEl = document.getElementById("toast");
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  // Group digits with thousands separators while preserving decimals.
  function group(numStr) {
    var parts = numStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  function format(value, el) {
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    return prefix + group(value.toFixed(decimals)) + suffix;
  }

  // easeOutCubic
  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function countUp(el, duration) {
    var target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;

    if (el._raf) cancelAnimationFrame(el._raf);

    if (reduceMotion) {
      el.textContent = format(target, el);
      return;
    }

    el.classList.add("is-counting");
    var start = null;
    var dur = duration || 1500;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var current = target * ease(p);
      el.textContent = format(current, el);
      if (p < 1) {
        el._raf = requestAnimationFrame(step);
      } else {
        el.textContent = format(target, el);
        el.classList.remove("is-counting");
        el._raf = null;
      }
    }
    el._raf = requestAnimationFrame(step);
  }

  var hasRun = false;
  function runAll(stagger) {
    nums.forEach(function (el, i) {
      var delay = stagger ? i * 130 : 0;
      setTimeout(function () {
        countUp(el, 1500);
      }, delay);
    });
    hasRun = true;
  }

  // Reveal cards + trigger counters when the grid scrolls into view.
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".stat"));

  function revealCards() {
    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add("is-in");
      }, reduceMotion ? 0 : i * 90);
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !hasRun) {
            revealCards();
            runAll(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(grid);
  } else {
    revealCards();
    runAll(true);
  }

  // Replay button — restart everything.
  replayBtn.addEventListener("click", function () {
    replayBtn.classList.remove("is-spinning");
    // force reflow so the animation can re-trigger
    void replayBtn.offsetWidth;
    replayBtn.classList.add("is-spinning");
    nums.forEach(function (el) {
      el.textContent = "0";
    });
    runAll(true);
    toast("Replaying impact for 2024 — thank you for caring");
  });

  donateBtn.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Demo only — in production this opens the donation form ❤");
  });

  // Make stat cards keyboard-focusable for screen-reader/tab users.
  cards.forEach(function (card) {
    var label = card.querySelector(".stat__label");
    if (label) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "group");
      card.setAttribute("aria-label", label.textContent);
    }
  });
})();
