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
    }, 2600);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = Math.round(target * eased);
      el.textContent = prefix + val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString() + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------- Progress rings ---------- */
  function animateRing(el) {
    var target = parseFloat(el.getAttribute("data-ring")) || 0;
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.style.setProperty("--p", (target * eased).toFixed(1));
      if (p < 1) requestAnimationFrame(step);
      else el.style.setProperty("--p", target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- IntersectionObserver: reveal + trigger animations ---------- */
  var countersDone = false;
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObs.observe(el);
    });

    var statsBlock = document.getElementById("heroStats");
    if (statsBlock) {
      var statsObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !countersDone) {
              countersDone = true;
              statsBlock.querySelectorAll(".stat-num").forEach(animateCount);
            }
          });
        },
        { threshold: 0.4 }
      );
      statsObs.observe(statsBlock);
    }

    var ringObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateRing(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll(".ring").forEach(function (el) {
      ringObs.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".stat-num").forEach(animateCount);
    document.querySelectorAll(".ring").forEach(animateRing);
  }

  /* ---------- Stack filter ---------- */
  var chips = document.querySelectorAll(".stack-filter .chip");
  var techCards = document.querySelectorAll("#stackGrid .tech");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var filter = chip.getAttribute("data-filter");
      techCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-cat") === filter;
        card.classList.toggle("dim", !match);
      });
    });
  });

  /* ---------- Cohort selection ---------- */
  var cohorts = document.querySelectorAll(".cohort");
  var selectedLabel = document.getElementById("selectedCohort");
  var chosenCohort = "Cohort 24 · Jul 15";
  // pre-select the first cohort
  if (cohorts[0]) cohorts[0].classList.add("is-selected");
  cohorts.forEach(function (btn) {
    btn.addEventListener("click", function () {
      cohorts.forEach(function (c) { c.classList.remove("is-selected"); });
      btn.classList.add("is-selected");
      chosenCohort = btn.getAttribute("data-cohort");
      var seats = btn.getAttribute("data-seats");
      if (selectedLabel) selectedLabel.textContent = chosenCohort;
      toast("Reserved a spot in " + chosenCohort + " — " + seats + " seats left");
    });
  });

  /* ---------- Apply form ---------- */
  var form = document.getElementById("applyForm");
  var input = document.getElementById("applyEmail");
  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        input.classList.add("invalid");
        input.focus();
        toast("Please enter a valid email address");
        return;
      }
      input.classList.remove("invalid");
      input.value = "";
      toast("Syllabus sent! Check your inbox for " + chosenCohort);
    });
    input.addEventListener("input", function () {
      input.classList.remove("invalid");
    });
  }
})();
