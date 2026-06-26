(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu after picking a link (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal + counters ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tag sections for reveal
  var revealTargets = document.querySelectorAll(
    ".section-head, .practice-card, .partner-inner, .manifesto-inner, .contact-inner, .result-stat"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  function formatCount(el, value) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = prefix + value + suffix;
  }

  function animateCounter(el) {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { formatCount(el, target); return; }

    var duration = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      formatCount(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else formatCount(el, target);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          var counters = entry.target.querySelectorAll(".result-num");
          counters.forEach(animateCounter);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: show everything, set final counts
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll(".result-num").forEach(function (el) {
      formatCount(el, parseInt(el.getAttribute("data-count"), 10) || 0);
    });
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function setError(field, message) {
    var wrap = field.closest(".field");
    var slot = wrap ? wrap.querySelector(".field-error") : null;
    if (wrap) wrap.classList.toggle("invalid", !!message);
    if (slot) slot.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(field) {
    var value = field.value.trim();
    if (field.hasAttribute("required") && !value) {
      setError(field, "This field is required.");
      return false;
    }
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(field, "Enter a valid email address.");
      return false;
    }
    setError(field, "");
    return true;
  }

  if (form) {
    var required = form.querySelectorAll("[required]");

    required.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        if (field.closest(".field").classList.contains("invalid")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      required.forEach(function (field) { if (!validateField(field)) ok = false; });

      if (!ok) {
        status.textContent = "Please correct the highlighted fields.";
        status.classList.remove("ok");
        return;
      }

      var name = form.querySelector("#name").value.trim().split(" ")[0] || "there";
      form.reset();
      status.textContent = "Thank you, " + name + ". A partner will respond within one business day.";
      status.classList.add("ok");
    });
  }
})();
