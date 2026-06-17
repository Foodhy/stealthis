(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Nav scrolled state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-shown");
    }, 2600);
  }

  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      // Allow anchor links to still scroll
      if (el.tagName === "BUTTON") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Newsletter form ---------- */
  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsForm.querySelector("input");
      toast("You're in ✦ check your inbox for 10% off");
      newsForm.reset();
      if (input) input.blur();
    });
  }

  /* ---------- FAQ accordion ---------- */
  var accs = document.querySelectorAll(".acc");
  accs.forEach(function (acc) {
    var head = acc.querySelector(".acc__head");
    var body = acc.querySelector(".acc__body");
    if (!head || !body) return;
    head.addEventListener("click", function () {
      var open = acc.classList.contains("is-open");
      // Close all others (single-open accordion)
      accs.forEach(function (other) {
        if (other !== acc) {
          other.classList.remove("is-open");
          var ob = other.querySelector(".acc__body");
          var oh = other.querySelector(".acc__head");
          if (ob) ob.style.maxHeight = null;
          if (oh) oh.setAttribute("aria-expanded", "false");
        }
      });
      if (open) {
        acc.classList.remove("is-open");
        body.style.maxHeight = null;
        head.setAttribute("aria-expanded", "false");
      } else {
        acc.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Sticky add-to-cart bar ---------- */
  var stickyBar = document.getElementById("stickyBar");
  var hero = document.querySelector(".hero");
  var bundles = document.getElementById("bundles");
  if (stickyBar && hero && "IntersectionObserver" in window) {
    var heroVisible = true;
    var bundlesVisible = false;

    function update() {
      // Show once past the hero, hide again when the bundles section is in view
      var show = !heroVisible && !bundlesVisible;
      stickyBar.classList.toggle("is-visible", show);
      stickyBar.setAttribute("aria-hidden", String(!show));
      document.body.classList.toggle("has-sticky", show);
    }

    new IntersectionObserver(function (e) {
      heroVisible = e[0].isIntersecting;
      update();
    }, { threshold: 0.05 }).observe(hero);

    if (bundles) {
      new IntersectionObserver(function (e) {
        bundlesVisible = e[0].isIntersecting;
        update();
      }, { threshold: 0.2 }).observe(bundles);
    }
  }
})();
