(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
      }
    });
  }

  /* ---------- featured-story switcher (tablist) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".feature-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".feature-panel"));

  function activateTab(idx, focus) {
    tabs.forEach(function (tab, i) {
      var selected = i === idx;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach(function (panel, i) {
      var show = i === idx;
      panel.classList.toggle("is-active", show);
      if (show) {
        panel.hidden = false;
      } else {
        panel.hidden = true;
      }
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      activateTab(i, false);
    });
    tab.addEventListener("keydown", function (e) {
      var key = e.key;
      var next = null;
      if (key === "ArrowRight" || key === "ArrowDown") next = (i + 1) % tabs.length;
      else if (key === "ArrowLeft" || key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      else if (key === "Home") next = 0;
      else if (key === "End") next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        activateTab(next, true);
      }
    });
  });

  /* auto-advance through featured stories, pause on interaction */
  var autoIdx = 0;
  var autoTimer = null;
  var stage = document.querySelector(".feature-stage");
  function startAuto() {
    stopAuto();
    autoTimer = window.setInterval(function () {
      autoIdx = (currentTab() + 1) % tabs.length;
      activateTab(autoIdx, false);
    }, 6000);
  }
  function stopAuto() {
    if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
  }
  function currentTab() {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].classList.contains("is-active")) return i;
    }
    return 0;
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (stage && tabs.length && !reduceMotion) {
    startAuto();
    stage.addEventListener("mouseenter", stopAuto);
    stage.addEventListener("mouseleave", startAuto);
    stage.addEventListener("focusin", stopAuto);
    stage.addEventListener("click", function (e) {
      if (e.target.closest(".feature-tab")) stopAuto();
    });
  }

  /* ---------- gentle image parallax on scroll ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function applyParallax() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      // progress: -1 (below) .. 1 (above), 0 when centered
      var center = rect.top + rect.height / 2;
      var progress = (center - vh / 2) / (vh / 2);
      var shift = -progress * speed * 100;
      var img = el.querySelector(".cover-image");
      if (img) img.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0) scale(1.06)";
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }

  if (parallaxEls.length && !reduceMotion) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    applyParallax();
  }

  /* ---------- read-more links ---------- */
  document.querySelectorAll(".read-more, .story-headline, .feature-byline a, .story-byline a").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.getAttribute("href") === "#" || !el.getAttribute("href")) {
        e.preventDefault();
        toast("Full article available in the print edition.");
      }
    });
  });

  /* ---------- subscribe form ---------- */
  var form = document.querySelector(".subscribe-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.querySelector("#sub-email");
      var plan = form.querySelector('input[name="plan"]:checked');
      var value = email && email.value.trim();
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        if (email) email.focus();
        toast("Please enter a valid email address.");
        return;
      }
      var planName = plan && plan.value === "print" ? "Print + Digital" : "Digital";
      toast("Welcome to Maison — your " + planName + " subscription is ready.");
      form.reset();
    });
  }
})();
