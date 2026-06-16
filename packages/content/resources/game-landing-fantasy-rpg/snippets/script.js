(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.querySelector(".toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- scroll reveal with gold shimmer ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("is-in");
          if (el.classList.contains("class-card") || el.classList.contains("faction")) {
            el.classList.add("shimmer");
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- wishlist toggle (synced across all buttons) ---------- */
  var wishlistBtns = Array.prototype.slice.call(document.querySelectorAll("[data-wishlist]"));
  var wishlisted = false;

  function paintWishlist() {
    wishlistBtns.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(wishlisted));
      var label = btn.querySelector(".wl-label");
      if (label) {
        label.textContent = wishlisted ? "Wishlisted" : (btn.classList.contains("btn--sm") ? "Wishlist" : "Add to Wishlist");
      }
    });
  }

  wishlistBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      wishlisted = !wishlisted;
      paintWishlist();
      toast(
        wishlisted
          ? "Sworn to the Vanguard — added to your wishlist."
          : "Oath withdrawn — removed from your wishlist."
      );
    });
  });
  paintWishlist();

  /* ---------- lore scroll accordion (single-open behaviour) ---------- */
  var accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    var scrolls = Array.prototype.slice.call(accordion.querySelectorAll(".scroll"));
    scrolls.forEach(function (detail) {
      detail.addEventListener("toggle", function () {
        if (!detail.open) return;
        scrolls.forEach(function (other) {
          if (other !== detail && other.open) other.open = false;
        });
      });
    });
  }

  /* ---------- class card keyboard activation (focus crest glow already CSS) ---------- */
  var classCards = Array.prototype.slice.call(document.querySelectorAll(".class-card"));
  classCards.forEach(function (card) {
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var name = card.querySelector(".class-card__name");
        toast("You consider the path of the " + (name ? name.textContent : "oathkeeper") + ".");
      }
    });
  });
})();
