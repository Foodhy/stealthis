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
  var nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            // gentle stagger within the same viewport batch
            setTimeout(function () {
              el.classList.add("in");
            }, Math.min(i * 70, 280));
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Quote rotator ---------- */
  var quoteEl = document.getElementById("quote");
  var dotsEl = document.getElementById("quoteDots");
  if (quoteEl && dotsEl) {
    var quotes = [];
    try {
      quotes = JSON.parse(quoteEl.getAttribute("data-quotes")) || [];
    } catch (e) {
      quotes = [];
    }

    if (quotes.length) {
      var current = 0;
      var autoTimer;
      var textEl = quoteEl.querySelector(".quote-text");
      var nameEl = quoteEl.querySelector(".quote-name");
      var roleEl = quoteEl.querySelector(".quote-role");

      // build dots
      quotes.forEach(function (_, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Testimonial " + (idx + 1));
        b.addEventListener("click", function () {
          show(idx);
          restartAuto();
        });
        dotsEl.appendChild(b);
      });
      var dots = Array.prototype.slice.call(dotsEl.children);

      function render(idx) {
        var q = quotes[idx];
        textEl.textContent = q.text;
        nameEl.textContent = q.name;
        roleEl.textContent = q.role;
        dots.forEach(function (d, i) {
          d.setAttribute("aria-selected", String(i === idx));
        });
      }

      function show(idx) {
        if (idx === current) return;
        current = idx;
        quoteEl.classList.add("fading");
        setTimeout(function () {
          render(current);
          quoteEl.classList.remove("fading");
        }, 300);
      }

      function next() {
        show((current + 1) % quotes.length);
      }

      function startAuto() {
        autoTimer = setInterval(next, 6000);
      }
      function restartAuto() {
        clearInterval(autoTimer);
        startAuto();
      }

      render(0);
      startAuto();

      // pause on hover for accessibility
      quoteEl.addEventListener("mouseenter", function () {
        clearInterval(autoTimer);
      });
      quoteEl.addEventListener("mouseleave", restartAuto);
    }
  }

  /* ---------- Pricing buttons ---------- */
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Nice choice — " + btn.getAttribute("data-plan") + " selected. First class is free!");
    });
  });

  /* ---------- Newsletter ---------- */
  var form = document.getElementById("newsletter");
  if (form) {
    var input = document.getElementById("email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        input.classList.add("invalid");
        input.focus();
        toast("Please enter a valid email address.");
        return;
      }
      input.classList.remove("invalid");
      input.value = "";
      toast("Welcome to the practice — check your inbox to confirm.");
    });
    input.addEventListener("input", function () {
      input.classList.remove("invalid");
    });
  }

  /* ---------- Smooth-scroll active focus for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
})();
