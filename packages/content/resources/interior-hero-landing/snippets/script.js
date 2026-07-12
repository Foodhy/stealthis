(function () {
  "use strict";

  var heroMedia = document.getElementById("heroMedia");
  var heroLocation = document.getElementById("heroLocation");
  var heroTagline = document.getElementById("heroTagline");
  var heroCaption = document.getElementById("heroCaption");
  var strip = document.getElementById("strip");
  var topbar = document.getElementById("topbar");
  var toastEl = document.getElementById("toast");
  var cards = Array.prototype.slice.call(strip.querySelectorAll(".card"));

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2800);
  }

  /* Preload hero images so switching never flashes */
  cards.forEach(function (card) {
    var img = new Image();
    img.src = card.getAttribute("data-img");
  });

  var current = -1;

  function setHeroBackground(url) {
    heroMedia.style.backgroundImage = "url('" + url + "')";
  }

  function selectProject(index, opts) {
    opts = opts || {};
    if (index === current) return;
    var card = cards[index];
    if (!card) return;
    current = index;

    /* Update tabs */
    cards.forEach(function (c, i) {
      var active = i === index;
      c.setAttribute("aria-selected", active ? "true" : "false");
      c.tabIndex = active ? 0 : -1;
    });

    /* Crossfade the hero backdrop */
    var url = card.getAttribute("data-img");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (opts.instant || reduce) {
      setHeroBackground(url);
    } else {
      heroMedia.classList.add("is-fading");
      setTimeout(function () {
        setHeroBackground(url);
        requestAnimationFrame(function () {
          heroMedia.classList.remove("is-fading");
        });
      }, 300);
    }

    /* Swap copy */
    heroLocation.textContent = card.getAttribute("data-location");
    heroTagline.textContent = card.getAttribute("data-tagline");
    heroCaption.querySelector(".hero__caption-title").textContent =
      card.getAttribute("data-title");
    heroCaption.querySelector(".hero__caption-meta").textContent =
      card.getAttribute("data-meta");

    if (opts.focus) card.focus();
  }

  /* Click + keyboard on the project strip (roving tabindex) */
  cards.forEach(function (card, i) {
    card.addEventListener("click", function () {
      selectProject(i);
    });
  });

  strip.addEventListener("keydown", function (e) {
    var next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (current + 1) % cards.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (current - 1 + cards.length) % cards.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = cards.length - 1;
    }
    if (next !== null) {
      e.preventDefault();
      selectProject(next, { focus: true });
    }
  });

  /* Book-a-consultation CTAs */
  document.querySelectorAll("[data-book]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") e.preventDefault();
      toast("Thank you — we'll email you within one business day to schedule your consultation.");
    });
  });

  /* Sticky topbar reacts to scroll */
  function onScroll() {
    if (window.scrollY > 40) topbar.classList.add("is-stuck");
    else topbar.classList.remove("is-stuck");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Init on first project */
  selectProject(0, { instant: true });
})();
