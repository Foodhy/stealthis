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
    }, 2600);
  }

  /* ---------- Transparent -> solid nav via IntersectionObserver ---------- */
  var nav = document.getElementById("nav");
  var hero = document.getElementById("top");

  if (nav && hero && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          // When the hero has scrolled mostly out of view, solidify the nav.
          nav.setAttribute("data-solid", entry.isIntersecting ? "false" : "true");
        });
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    io.observe(hero);
  } else if (nav) {
    // Fallback: plain scroll listener.
    window.addEventListener(
      "scroll",
      function () {
        nav.setAttribute("data-solid", window.scrollY > 120 ? "true" : "false");
      },
      { passive: true }
    );
  }

  /* ---------- Mobile menu toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.setAttribute("data-open", "false");
    menu.hidden = true;
  }
  function openMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    menu.setAttribute("data-open", "true");
    menu.hidden = false;
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
      else openMenu();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- CTA / booking / contact actions ---------- */
  var bookBtn = document.getElementById("bookBtn");
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      toast("Booking calendar is fictional — but the vibe is real.");
    });
  }

  var contactBtn = document.getElementById("contactBtn");
  if (contactBtn) {
    contactBtn.addEventListener("click", function () {
      toast("Print enquiry noted. We'd reply within two days.");
    });
  }

  /* ---------- Shot cards: acknowledge selection ---------- */
  var strip = document.getElementById("strip");
  if (strip) {
    strip.addEventListener("click", function (e) {
      var card = e.target.closest(".shot");
      if (!card) return;
      e.preventDefault();
      var name = card.getAttribute("data-shot") || "this frame";
      toast("Opening “" + name + "” — full gallery coming soon.");
    });
  }

  /* ---------- Reveal work section on first view ---------- */
  var work = document.getElementById("work");
  if (work && "IntersectionObserver" in window) {
    var shots = work.querySelectorAll(".shot");
    shots.forEach(function (s, i) {
      s.style.opacity = "0";
      s.style.transform = "translateY(24px)";
      s.style.transition =
        "opacity .6s ease " + i * 90 + "ms, transform .6s cubic-bezier(.2,.7,.2,1) " + i * 90 + "ms";
    });
    var revealer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            shots.forEach(function (s) {
              s.style.opacity = "";
              s.style.transform = "";
            });
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    revealer.observe(work);
  }
})();
