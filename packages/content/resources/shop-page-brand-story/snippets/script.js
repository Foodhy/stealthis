(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- Animated stat counters ---------- */
  function formatCount(el, value) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = prefix + Math.round(value) + suffix;
  }

  function runCounter(el) {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    if (reduceMotion) {
      formatCount(el, target);
      return;
    }
    var duration = 1300;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      formatCount(el, target * eased);
      if (p < 1) requestAnimationFrame(step);
      else formatCount(el, target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Timeline progress fill ---------- */
  var tlFill = document.querySelector(".tl__progress i");
  var tlDone = false;
  function fillTimeline() {
    if (tlDone || !tlFill) return;
    tlDone = true;
    requestAnimationFrame(function () {
      tlFill.style.width = "100%";
    });
  }

  /* ---------- Scroll reveal + triggers via IntersectionObserver ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealAll();
    document.querySelectorAll(".stat__num").forEach(runCounter);
    fillTimeline();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");

        if (el.classList.contains("stat")) {
          var num = el.querySelector(".stat__num");
          if (num) runCounter(num);
        }
        if (el.closest(".timeline")) fillTimeline();

        obs.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Newsletter form ---------- */
  var form = document.getElementById("newsForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("email");
      var value = (input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        toast("Please enter a valid email address.");
        input.focus();
        return;
      }
      input.value = "";
      input.blur();
      toast("Thanks for joining — watch your inbox for our story.");
    });
  }

  /* ---------- Shop CTA button ---------- */
  var shopBtn = document.getElementById("shopBtn");
  if (shopBtn) {
    shopBtn.addEventListener("click", function () {
      toast("The collection is fictional — but thanks for the click!");
    });
  }

  /* ---------- Smooth in-page nav (respects reduced motion) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      if (target.id && history.replaceState) {
        history.replaceState(null, "", id);
      }
    });
  });
})();
