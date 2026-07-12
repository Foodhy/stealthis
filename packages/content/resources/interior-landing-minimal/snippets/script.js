(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- Year stamp ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Scroll progress + sticky bar ---------- */
  var progressBar = document.getElementById("progressBar");
  var topbar = document.getElementById("topbar");
  var figcount = document.getElementById("figcount");
  var ticking = false;

  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docH =
      document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? Math.min(1, scrollTop / docH) : 0;
    if (progressBar) progressBar.style.width = (pct * 100).toFixed(2) + "%";

    if (topbar) topbar.classList.toggle("stuck", scrollTop > 40);
    if (figcount) figcount.classList.toggle("show", scrollTop > 200);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObs.observe(el);
    });
  }

  /* ---------- Figure counter ---------- */
  var figNow = document.getElementById("figNow");
  var chapters = Array.prototype.slice.call(
    document.querySelectorAll(".chapter")
  );
  if (figNow && chapters.length && "IntersectionObserver" in window) {
    var current = "01";
    var figObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var fig = entry.target.getAttribute("data-figure");
            if (fig && fig !== current) {
              current = fig;
              figNow.textContent = fig;
            }
          }
        });
      },
      { threshold: 0.55 }
    );
    chapters.forEach(function (ch) {
      figObs.observe(ch);
    });
  }

  /* ---------- Smooth in-page anchors (respect reduced motion) ---------- */
  document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      });
    });

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById("enquireForm");
  var email = document.getElementById("email");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (form && email) {
    email.addEventListener("input", function () {
      if (email.classList.contains("invalid") && emailRe.test(email.value)) {
        email.classList.remove("invalid");
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = email.value.trim();
      if (!emailRe.test(val)) {
        email.classList.add("invalid");
        email.focus();
        toast("Please enter a valid email so we can reply.");
        return;
      }
      email.classList.remove("invalid");
      form.reset();
      email.blur();
      toast("Thank you — we will be in touch within two working days.");
    });
  }
})();
