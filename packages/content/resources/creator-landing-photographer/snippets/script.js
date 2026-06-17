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
    }, 2800);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------- Smooth scroll (with reduced-motion respect) ---------- */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Gallery filter ---------- */
  var filters = document.querySelectorAll(".filter");
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (f) {
        f.classList.remove("is-active");
        f.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var cat = btn.getAttribute("data-filter");
      shots.forEach(function (shot) {
        var show = cat === "all" || shot.getAttribute("data-cat") === cat;
        shot.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCaption = document.getElementById("lbCaption");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var current = 0;
  var lastFocused = null;

  function shotData(shot) {
    var img = shot.querySelector(".shot__img");
    var cap = shot.querySelector("figcaption");
    return {
      bg: img ? getComputedStyle(img).backgroundImage : "",
      title: cap ? cap.querySelector("span").textContent : "",
      cat: cap ? cap.querySelector("em").textContent : ""
    };
  }

  function visibleShots() {
    return shots.filter(function (s) { return !s.classList.contains("is-hidden"); });
  }

  function renderLightbox(index) {
    var list = visibleShots();
    if (!list.length) return;
    current = (index + list.length) % list.length;
    var d = shotData(list[current]);
    lbImg.style.backgroundImage = d.bg;
    lbCaption.textContent = d.title + " — " + d.cat;
  }

  function openLightbox(shot) {
    var list = visibleShots();
    var idx = list.indexOf(shot);
    if (idx < 0) idx = 0;
    lastFocused = document.activeElement;
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    document.body.style.overflow = "hidden";
    renderLightbox(idx);
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; }, 280);
    if (lastFocused) lastFocused.focus();
  }

  shots.forEach(function (shot) {
    shot.addEventListener("click", function () { openLightbox(shot); });
    shot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(shot);
      }
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { renderLightbox(current - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { renderLightbox(current + 1); });
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") renderLightbox(current - 1);
    if (e.key === "ArrowRight") renderLightbox(current + 1);
  });

  /* ---------- Booking form ---------- */
  var form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#bk-name");
      var email = form.querySelector("#bk-email");
      var ok = true;
      [name, email].forEach(function (input) {
        var valid = input.value.trim() !== "" && (input.type !== "email" || /.+@.+\..+/.test(input.value));
        input.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        toast("Please add your name and a valid email.");
        return;
      }
      var who = name.value.trim().split(" ")[0];
      form.reset();
      toast("Thanks, " + who + " — I'll reply within two days.");
    });
  }

  /* ---------- Year (footer is static, but keep CTA links friendly) ---------- */
  document.querySelectorAll('.footer__social a, .contact__direct a').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Demo link — fictional creator.");
    });
  });
})();
