(function () {
  "use strict";

  /* --- Mobile nav toggle --- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Scroll reveal --- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* --- FAQ accordion --- */
  var faq = document.getElementById("faqList");
  if (faq) {
    faq.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__q");
      if (!btn) return;
      var panel = btn.nextElementSibling;
      var isOpen = btn.getAttribute("aria-expanded") === "true";

      // close all
      faq.querySelectorAll(".faq__q").forEach(function (q) {
        q.setAttribute("aria-expanded", "false");
        if (q.nextElementSibling) q.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  /* --- Consultation form validation --- */
  var form = document.getElementById("consultForm");
  if (form) {
    var ok = document.getElementById("consultOk");

    function setErr(name, msg) {
      var input = form.elements[name];
      var slot = form.querySelector('.field__err[data-for="' + name + '"]');
      if (input) input.closest(".field").classList.toggle("field--invalid", !!msg);
      if (slot) slot.textContent = msg || "";
      return !msg;
    }

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();

      var a = setErr("name", name ? "" : "Please tell us your name.");
      var b = setErr("email", !email ? "Please add an email." : validEmail(email) ? "" : "That email looks off.");

      if (a && b) {
        form.querySelectorAll("input, select, textarea, button").forEach(function (el) { el.disabled = true; });
        if (ok) ok.hidden = false;
      }
    });

    ["name", "email"].forEach(function (n) {
      var el = form.elements[n];
      if (el) el.addEventListener("input", function () { setErr(n, ""); });
    });
  }
})();
