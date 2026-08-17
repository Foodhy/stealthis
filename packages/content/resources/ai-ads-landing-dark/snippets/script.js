(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-toast");
    if (t) {
      e.preventDefault();
      toast(t.getAttribute("data-msg") || "Acción de demostración.");
    }
  });

  /* ---------- Nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 12) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    },
    { passive: true }
  );

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Urgency countdown (9 days, loops for demo) ---------- */
  var urgencyEl = document.getElementById("urgencyCount");
  if (urgencyEl) {
    var end = Date.now() + 9 * 24 * 60 * 60 * 1000;
    function pad(n) {
      return String(n).padStart(2, "0");
    }
    function tick() {
      var ms = Math.max(0, end - Date.now());
      var d = Math.floor(ms / 86400000);
      var h = Math.floor((ms % 86400000) / 3600000);
      var m = Math.floor((ms % 3600000) / 60000);
      var s = Math.floor((ms % 60000) / 1000);
      urgencyEl.textContent = pad(d) + "d " + pad(h) + ":" + pad(m) + ":" + pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Count-up stats ---------- */
  function formatDecimal(value, decimals, prefix, suffix) {
    var fixed = value.toFixed(decimals);
    var withComma = decimals > 0 ? fixed.replace(".", ",") : fixed;
    return (prefix || "") + withComma + (suffix || "");
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || target === 0) {
      el.textContent = formatDecimal(target, decimals, prefix, suffix);
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatDecimal(target * eased, decimals, prefix, suffix);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatDecimal(target, decimals, prefix, suffix);
    }
    requestAnimationFrame(step);
  }

  var countEls = Array.prototype.slice.call(document.querySelectorAll(".count"));
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    countEls.forEach(animateCount);
  }

  /* ---------- Testimonial slider ---------- */
  var track = document.getElementById("proofTrack");
  if (track) {
    var prev = document.getElementById("proofPrev");
    var next = document.getElementById("proofNext");
    var pauseBtn = document.getElementById("proofPause");
    var autoTimer = null;
    var paused = false;

    function slideBy(dir) {
      var card = track.querySelector(".quote");
      var step = card ? card.getBoundingClientRect().width + 16 : 340;
      track.scrollBy({ left: step * dir, behavior: reduceMotion ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () {
      slideBy(-1);
    });
    next.addEventListener("click", function () {
      slideBy(1);
    });

    function startAuto() {
      if (autoTimer || reduceMotion) return;
      autoTimer = setInterval(function () {
        var max = track.scrollWidth - track.clientWidth - 4;
        if (track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: "auto" });
        else slideBy(1);
      }, 4200);
    }
    function stopAuto() {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    track.addEventListener("pointerenter", stopAuto);
    track.addEventListener("pointerleave", function () {
      if (!paused) startAuto();
    });
    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      pauseBtn.textContent = paused ? "▶" : "⏸";
      pauseBtn.setAttribute("aria-pressed", String(paused));
      if (paused) stopAuto();
      else startAuto();
    });
    startAuto();
  }

  /* ---------- FAQ: only one open at a time ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq__item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Sticky bar appears after hero ---------- */
  var stickybar = document.getElementById("stickybar");
  if (stickybar) {
    var hero = document.querySelector(".hero");
    var sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          stickybar.classList.toggle("is-visible", !entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
      },
      { threshold: 0 }
    );
    if (hero) sio.observe(hero);
  }
})();
