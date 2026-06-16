/* ============================================================
   Atelier Verel — fine-dining landing interactions
   Vanilla JS, no dependencies.
   - scroll-reveal (IntersectionObserver + fallback)
   - hero parallax hint
   - dish lightbox (focus-trapped, esc/backdrop close)
   - reserve form validation + toast
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 320);
    }, 3200);
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  if (!revealEls.length) {
    // nothing to do
  } else if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // gentle stagger within a group
            var el = entry.target;
            var siblings = Array.prototype.slice.call(
              (el.parentNode || document).querySelectorAll("[data-reveal]")
            );
            var idx = Math.max(0, siblings.indexOf(el));
            el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- hero parallax hint ---------- */
  if (!prefersReduced) {
    var blobs = Array.prototype.slice.call(
      document.querySelectorAll("[data-parallax] .blob")
    );
    var softs = Array.prototype.slice.call(
      document.querySelectorAll("[data-parallax-soft]")
    );
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.pageYOffset || 0;
        blobs.forEach(function (b, i) {
          var rate = i % 2 === 0 ? 0.12 : -0.08;
          b.style.transform = "translate3d(0," + y * rate + "px,0)";
        });
        softs.forEach(function (s) {
          var rect = s.getBoundingClientRect();
          var center = rect.top + rect.height / 2 - window.innerHeight / 2;
          s.style.transform = "translateY(" + center * -0.04 + "px)";
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- dish lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbPhoto = document.getElementById("lb-photo");
  var lbEmoji = lbPhoto ? lbPhoto.querySelector(".lb-emoji") : null;
  var lbCourse = document.getElementById("lb-course");
  var lbTitle = document.getElementById("lb-title");
  var lbDesc = document.getElementById("lb-desc");
  var lastFocused = null;

  var EMOJI = {
    beet: "🥬",
    saffron: "🦞",
    tomato: "🍅",
    duck: "🍒",
    citrus: "🍋",
    honey: "🍯"
  };
  var GRAD = {
    beet: "linear-gradient(150deg,#2a1422,#6a1f3a 55%,#c8775a)",
    saffron: "linear-gradient(150deg,#3a2118,#7a2f1b 55%,#c9a44c)",
    tomato: "linear-gradient(150deg,#3a1813,#8a2f1b 55%,#d6452b)",
    duck: "linear-gradient(150deg,#221813,#5c3a1f 55%,#a8852f)",
    citrus: "linear-gradient(150deg,#2a2410,#7a5a1f 55%,#e3c878)",
    honey: "linear-gradient(150deg,#2a2012,#8a6a1f 55%,#c9a44c)"
  };

  function openLightbox(dish) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    var photo = dish.getAttribute("data-photo") || "saffron";
    if (lbEmoji) lbEmoji.textContent = EMOJI[photo] || "🍽️";
    if (lbPhoto)
      lbPhoto.style.background = GRAD[photo] || GRAD.saffron;
    if (lbCourse) lbCourse.textContent = dish.getAttribute("data-course") || "";
    if (lbTitle) lbTitle.innerHTML = dish.getAttribute("data-title") || "";
    if (lbDesc) lbDesc.textContent = dish.getAttribute("data-desc") || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = lightbox.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onLbKey);
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onLbKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onLbKey(e) {
    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    if (e.key === "Tab") {
      // simple focus trap inside the panel
      var focusables = lightbox.querySelectorAll(
        'button, a[href], input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.querySelectorAll(".dish .dish-photo").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dish = btn.closest(".dish");
      if (dish) openLightbox(dish);
    });
  });

  document.querySelectorAll("[data-lb-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      closeLightbox();
    });
  });

  /* ---------- reserve form ---------- */
  var form = document.getElementById("reserve-form");
  var status = document.getElementById("form-status");

  // pre-fill date min = tomorrow
  var dateInput = form ? form.querySelector('input[type="date"]') : null;
  if (dateInput) {
    var t = new Date();
    t.setDate(t.getDate() + 1);
    dateInput.min = t.toISOString().slice(0, 10);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll("input[required], select[required]");
      var firstBad = null;
      fields.forEach(function (f) {
        var bad = !f.value.trim();
        if (f.type === "email" && !bad) bad = !validEmail(f.value.trim());
        f.classList.toggle("invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });

      if (firstBad) {
        firstBad.focus();
        if (status) {
          status.textContent = "Please complete the highlighted fields.";
          status.classList.remove("ok");
        }
        toast("Please check the form.");
        return;
      }

      var name = form.querySelector('input[name="name"]').value.trim();
      var first = name.split(" ")[0] || name;
      if (status) {
        status.textContent =
          "Merci, " +
          first +
          " — your request is in. We'll confirm by email within 24 hours.";
        status.classList.add("ok");
      }
      toast("Reservation requested 🍷");
      form.reset();
      if (dateInput) dateInput.min = dateInput.min; // keep min
    });

    form.querySelectorAll("input, select").forEach(function (f) {
      f.addEventListener("input", function () {
        f.classList.remove("invalid");
      });
    });
  }

  /* ---------- year (footer is static here, no-op) ---------- */
})();
