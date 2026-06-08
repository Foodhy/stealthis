(function () {
  "use strict";

  var STYLIST = "Aria";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    // force reflow so the transition runs
    void el.offsetWidth;
    el.classList.add("show");
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 2400);
  }

  /* ---------- Animated stat counters ---------- */
  function animateCount(node) {
    var target = parseInt(node.getAttribute("data-count"), 10) || 0;
    var suffix = node.getAttribute("data-suffix") || "";
    var dur = 1100;
    var start = performance.now();

    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round(target * eased);
      node.textContent = value.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = Array.prototype.slice.call(
    document.querySelectorAll(".num[data-count]")
  );

  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (c) {
      io.observe(c);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxArt = document.getElementById("lightboxArt");
  var lightboxTitle = document.getElementById("lightboxTitle");
  var lightboxMeta = document.getElementById("lightboxMeta");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocused = null;

  function openLightbox(tile) {
    lastFocused = tile;
    var styles = window.getComputedStyle(tile);
    lightboxArt.style.background = styles.backgroundImage;
    lightboxTitle.textContent = tile.getAttribute("data-title") || "Look";
    lightboxMeta.textContent = tile.getAttribute("data-meta") || "";
    lightbox.hidden = false;
    lightboxClose.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeLightbox();
  }

  var gallery = document.getElementById("gallery");
  if (gallery) {
    gallery.addEventListener("click", function (e) {
      var tile = e.target.closest(".tile");
      if (tile) openLightbox(tile);
    });
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Book CTA ---------- */
  var bookBtn = document.getElementById("bookBtn");
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      toast("Opening " + STYLIST + "'s availability…");
    });
  }

  /* ---------- Follow toggle ---------- */
  var followBtn = document.getElementById("followBtn");
  if (followBtn) {
    var followLabel = followBtn.querySelector(".btn__label");
    followBtn.addEventListener("click", function () {
      var following = followBtn.getAttribute("aria-pressed") === "true";
      following = !following;
      followBtn.setAttribute("aria-pressed", String(following));
      if (followLabel) followLabel.textContent = following ? "Following" : "Follow";
      toast(
        following
          ? "You're following " + STYLIST + ". We'll share new looks."
          : "Unfollowed " + STYLIST + "."
      );
    });
  }
})();
