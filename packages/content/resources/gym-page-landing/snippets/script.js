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
    }, 2800);
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu after tapping a link
    header.querySelectorAll(".nav a, .header-cta a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = Array.prototype.slice.call(
    document.querySelectorAll(".stat-num[data-count]")
  );
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Testimonial rotator ---------- */
  var track = document.getElementById("rotatorTrack");
  var dotsWrap = document.getElementById("rotatorDots");
  if (track && dotsWrap) {
    var quotes = Array.prototype.slice.call(track.querySelectorAll(".quote"));
    var index = 0;
    var rotateTimer;
    var interval = 6000;

    quotes.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Story " + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function show(i) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, qi) {
        q.classList.toggle("is-active", qi === index);
      });
      dots.forEach(function (d, di) {
        d.setAttribute("aria-selected", di === index ? "true" : "false");
      });
    }
    function next() {
      show(index + 1);
    }
    function restart() {
      clearInterval(rotateTimer);
      rotateTimer = setInterval(next, interval);
    }
    restart();

    // Pause on hover for usability
    var rotator = track.closest(".rotator");
    if (rotator) {
      rotator.addEventListener("mouseenter", function () {
        clearInterval(rotateTimer);
      });
      rotator.addEventListener("mouseleave", restart);
    }
  }

  /* ---------- Trial CTAs ---------- */
  document.querySelectorAll("[data-trial]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Allow the anchor jump, then nudge focus to the email field
      setTimeout(function () {
        var input = document.getElementById("trialEmail");
        if (input) input.focus();
      }, 450);
    });
  });

  /* ---------- Trial form ---------- */
  var form = document.getElementById("trialForm");
  if (form) {
    var emailInput = document.getElementById("trialEmail");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (emailInput.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) {
        emailInput.classList.add("invalid");
        emailInput.focus();
        toast("Enter a valid email to claim your trial.");
        return;
      }
      emailInput.classList.remove("invalid");
      form.reset();
      toast("You're in! Check " + value + " for your free pass.");
    });
    emailInput.addEventListener("input", function () {
      emailInput.classList.remove("invalid");
    });
  }
})();
