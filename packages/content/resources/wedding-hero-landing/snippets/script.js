(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, ms) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, ms || 3200);
  }

  /* ---------- Smooth scroll for [data-scroll] and header links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Date availability check ---------- */
  var form = document.getElementById("date-check");
  var input = document.getElementById("wdate");
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input.value) {
        toast("Please choose a date to check.");
        input.focus();
        return;
      }
      var picked = new Date(input.value + "T00:00:00");
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      if (picked < today) {
        toast("That date has already passed — try a future date.");
        return;
      }

      var label = MONTHS[picked.getMonth()] + " " + picked.getFullYear();
      // Peak months (May, Jun, Sep, Oct) are "limited"; others "open".
      var peak = [4, 5, 8, 9].indexOf(picked.getMonth()) !== -1;
      if (peak) {
        toast('<span class="accent">' + label + '</span> is a popular season — a few dates remain.');
      } else {
        toast('Good news — <span class="accent">' + label + '</span> looks open. Let’s talk.');
      }
    });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".stat-num"));
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var start = 0;
    var dur = 1400;
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Real-wedding strip carousel ---------- */
  var strip = document.getElementById("strip");
  var slides = strip ? Array.prototype.slice.call(strip.querySelectorAll(".wedding")) : [];
  var dotsWrap = document.getElementById("dots");
  var current = 0;
  var autoTimer;

  function setActive(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, idx) { s.classList.toggle("is-active", idx === current); });
    if (dotsWrap) {
      Array.prototype.slice.call(dotsWrap.children).forEach(function (d, idx) {
        d.classList.toggle("is-active", idx === current);
        d.setAttribute("aria-selected", idx === current ? "true" : "false");
      });
    }
  }

  if (slides.length && dotsWrap) {
    slides.forEach(function (s, idx) {
      var b = document.createElement("button");
      b.className = "dot" + (idx === 0 ? " is-active" : "");
      b.setAttribute("role", "tab");
      var name = s.querySelector("h3");
      b.setAttribute("aria-label", name ? name.textContent : "Wedding " + (idx + 1));
      b.addEventListener("click", function () { setActive(idx); restartAuto(); });
      dotsWrap.appendChild(b);
    });

    slides.forEach(function (s, idx) {
      s.addEventListener("click", function () { setActive(idx); restartAuto(); });
    });

    var prev = document.getElementById("prev");
    var next = document.getElementById("next");
    if (prev) prev.addEventListener("click", function () { setActive(current - 1); restartAuto(); });
    if (next) next.addEventListener("click", function () { setActive(current + 1); restartAuto(); });

    function startAuto() { autoTimer = setInterval(function () { setActive(current + 1); }, 4200); }
    function restartAuto() { clearInterval(autoTimer); startAuto(); }

    strip.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    strip.addEventListener("mouseleave", startAuto);

    startAuto();
  }

  /* ---------- Enquire CTA ---------- */
  var enquireBtn = document.getElementById("enquire-btn");
  if (enquireBtn) {
    enquireBtn.addEventListener("click", function () {
      toast('Thank you — we’ll be in touch within <span class="accent">two working days</span>.');
    });
  }
})();
