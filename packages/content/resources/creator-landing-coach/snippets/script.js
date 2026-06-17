/* ===== Maya Okonkwo — Coach / Speaker Landing ===== */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("primary-nav");
  function closeNav() {
    if (!toggle || !navLinks) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    navLinks.classList.remove("is-open");
  }
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      navLinks.classList.toggle("is-open", !open);
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Data-toast triggers ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Nav scrolled state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
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
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.07 + "s";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Testimonial slider ---------- */
  var track = document.getElementById("sliderTrack");
  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = document.getElementById("sliderDots");
    var prevBtn = document.getElementById("prevQuote");
    var nextBtn = document.getElementById("nextQuote");
    var index = 0;
    var autoTimer;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Testimonial " + (i + 1));
      b.addEventListener("click", function () { go(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      track.style.transform = "translateX(" + -index * 100 + "%)";
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === index);
        d.setAttribute("aria-selected", String(i === index));
      });
    }
    function go(i, user) {
      index = (i + slides.length) % slides.length;
      render();
      if (user) restartAuto();
    }
    function next() { go(index + 1); }
    function startAuto() { autoTimer = setInterval(next, 6000); }
    function restartAuto() { clearInterval(autoTimer); startAuto(); }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1, true); });

    var slider = track.closest(".slider");
    slider.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    slider.addEventListener("mouseleave", startAuto);
    slider.addEventListener("focusin", function () { clearInterval(autoTimer); });
    slider.addEventListener("focusout", startAuto);

    // keyboard
    slider.setAttribute("tabindex", "0");
    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, true); }
    });

    render();
    startAuto();
  }

  /* ---------- Email validation ---------- */
  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }
  function flag(field, bad) {
    if (field) field.classList.toggle("has-error", bad);
  }

  /* ---------- Lead magnet form ---------- */
  var leadForm = document.getElementById("leadForm");
  if (leadForm) {
    var leadName = document.getElementById("leadName");
    var leadEmail = document.getElementById("leadEmail");
    var leadNote = document.getElementById("leadNote");
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var badName = !leadName.value.trim();
      var badEmail = !isEmail(leadEmail.value);
      flag(leadName.parentElement, badName);
      flag(leadEmail.parentElement, badEmail);
      if (badName || badEmail) {
        leadNote.textContent = "Please add your name and a valid email.";
        leadNote.classList.remove("is-success");
        return;
      }
      var first = leadName.value.trim().split(" ")[0];
      leadNote.textContent = "On its way, " + first + "! Check your inbox for The 5-Minute Reset.";
      leadNote.classList.add("is-success");
      toast("The 5-Minute Reset is on its way ✉️");
      leadForm.reset();
    });
  }

  /* ---------- Booking form ---------- */
  var bookForm = document.getElementById("bookForm");
  if (bookForm) {
    var bName = document.getElementById("bName");
    var bEmail = document.getElementById("bEmail");
    var bGoal = document.getElementById("bGoal");
    var bStatus = document.getElementById("bookStatus");
    bookForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var badName = !bName.value.trim();
      var badEmail = !isEmail(bEmail.value);
      var badGoal = !bGoal.value;
      flag(bName.parentElement, badName);
      flag(bEmail.parentElement, badEmail);
      flag(bGoal.parentElement, badGoal);
      bStatus.classList.remove("is-success", "is-error");
      if (badName || badEmail || badGoal) {
        bStatus.textContent = "Just fill in your name, email and a focus and we're set.";
        bStatus.classList.add("is-error");
        return;
      }
      var first = bName.value.trim().split(" ")[0];
      bStatus.textContent = "Thanks, " + first + "! I'll email you 2–3 call times within a day.";
      bStatus.classList.add("is-success");
      toast("Discovery call request received — talk soon!");
      bookForm.reset();
    });
    // clear error on input
    bookForm.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () { flag(el.parentElement, false); });
    });
  }
})();
