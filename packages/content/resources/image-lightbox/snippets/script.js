(function () {
  "use strict";

  const images = [
    { bg: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", caption: "Violet Dusk" },
    { bg: "linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #164e63 100%)", caption: "Ocean Deep" },
    { bg: "linear-gradient(135deg, #059669 0%, #065f46 100%)", caption: "Forest" },
    { bg: "linear-gradient(135deg, #f59e0b 0%, #dc2626 50%, #9d174d 100%)", caption: "Sunset" },
    { bg: "linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%)", caption: "Aurora" },
    { bg: "linear-gradient(135deg, #ef4444 0%, #f97316 60%, #facc15 100%)", caption: "Ember" },
  ];

  const lightbox = document.getElementById("lightbox");
  const lbImage = document.getElementById("lightbox-image");
  const lbCounter = document.getElementById("lightbox-counter");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbPrev = document.getElementById("lightbox-prev");
  const lbNext = document.getElementById("lightbox-next");
  const lbClose = document.getElementById("lightbox-close");
  const lbBackdrop = document.getElementById("lightbox-backdrop");

  let currentIndex = 0;
  let lastFocused = null;

  function open(index) {
    lastFocused = document.activeElement;
    currentIndex = index;
    render();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lbClose.focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastFocused) lastFocused.focus();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    render();
  }

  function next() {
    currentIndex = (currentIndex + 1) % images.length;
    render();
  }

  function render() {
    const img = images[currentIndex];
    lbImage.style.background = img.bg;
    lbCounter.textContent = currentIndex + 1 + " / " + images.length;
    lbCaption.textContent = img.caption;
  }

  // Open from gallery
  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () {
      open(Number(item.dataset.index));
    });
  });

  // Controls
  lbPrev.addEventListener("click", prev);
  lbNext.addEventListener("click", next);
  lbClose.addEventListener("click", close);
  lbBackdrop.addEventListener("click", close);

  // Keyboard
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  });

  // Focus trap
  lightbox.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    const focusable = Array.from(lightbox.querySelectorAll("button"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Touch / swipe support
  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    function (e) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      dx < 0 ? next() : prev();
    },
    { passive: true }
  );
})();
