(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.querySelector("[data-toast]");
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

  /* ---------- Gentle scroll-reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Smooth-scroll for in-page nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      if (typeof target.focus === "function") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Diet-preference toggle ---------- */
  // Each diet relabels the featured recipe tag + writes a calm status line.
  var dietCopy = {
    balanced: {
      tag: "Featured · Balanced",
      note: "Showing balanced highlights — fibre, protein and fats in harmony.",
    },
    vegan: {
      tag: "Featured · Vegan",
      note: "Reframed for fully plant-based eating — no animal products.",
    },
    protein: {
      tag: "Featured · High protein",
      note: "Leaning into protein-rich plates to keep you full and steady.",
    },
    lowcarb: {
      tag: "Featured · Lower carb",
      note: "Lighter on grains, leaning into greens and good fats.",
    },
  };

  var dietBtns = Array.prototype.slice.call(
    document.querySelectorAll(".diet-btn")
  );
  var dietTags = Array.prototype.slice.call(
    document.querySelectorAll("[data-recipe-tag]")
  );
  var statusEl = document.querySelector("[data-diet-status]");

  function setDiet(diet) {
    var copy = dietCopy[diet] || dietCopy.balanced;
    dietTags.forEach(function (tag) {
      tag.textContent = copy.tag;
    });
    if (statusEl) statusEl.textContent = copy.note;
    dietBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-diet") === diet;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  dietBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setDiet(btn.getAttribute("data-diet"));
    });
  });

  /* ---------- Forms (illustrative) ---------- */
  function handleSignup(form, success) {
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var value = input ? input.value.trim() : "";
      if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        if (input) input.focus();
        toast("Please enter a valid email.");
        return;
      }
      form.reset();
      toast(success);
    });
  }

  handleSignup(
    document.querySelector("[data-plan-form]"),
    "Welcome — your sample week is on its way (demo)."
  );
  handleSignup(
    document.querySelector("[data-foot-form]"),
    "You're in. One gentle email each Sunday (demo)."
  );

  /* ---------- Generic demo links ---------- */
  document
    .querySelectorAll("[data-toast]:not(.toast)")
    .forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        toast(el.getAttribute("data-toast"));
      });
    });
})();
