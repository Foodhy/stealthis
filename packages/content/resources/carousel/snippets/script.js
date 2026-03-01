(function () {
  "use strict";

  // ── Single-item carousel ─────────────────────────────────────────────────

  initCarousel({
    id: "single",
    mode: "single",
    autoPlay: true,
    autoPlayInterval: 3500,
  });

  // ── Multi-card carousel ──────────────────────────────────────────────────

  initCarousel({
    id: "multi",
    mode: "multi",
    visibleCount: 3,
    autoPlay: false,
  });

  // ── Factory ──────────────────────────────────────────────────────────────

  function initCarousel(opts) {
    const root  = document.getElementById("carousel-" + opts.id);
    const track = document.getElementById("track-" + opts.id);
    const dotsEl = document.getElementById("dots-" + opts.id);
    const prevBtn = document.getElementById("prev-" + opts.id);
    const nextBtn = document.getElementById("next-" + opts.id);

    if (!root || !track) return;

    const slides = Array.from(track.children);
    const total  = slides.length;
    const visible = opts.visibleCount || 1;
    const maxIndex = Math.max(0, total - visible);

    let current = 0;
    let autoTimer = null;

    // Build dots
    const dots = [];
    for (let i = 0; i <= maxIndex; i++) {
      const btn = document.createElement("button");
      btn.className = "carousel-dot";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", "Go to slide " + (i + 1));
      btn.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(btn);
      dots.push(btn);
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex));
      updateTrack();
      updateDots();
      updateArrows();
    }

    function updateTrack() {
      if (opts.mode === "multi") {
        // Calculate offset: each card width + gap
        const cardW = track.firstElementChild.offsetWidth;
        const gap   = 16; // 1rem
        track.style.transform = "translateX(-" + current * (cardW + gap) + "px)";
      } else {
        track.style.transform = "translateX(-" + current * 100 + "%)";
      }
    }

    function updateDots() {
      dots.forEach((d, i) => {
        d.classList.toggle("active", i === current);
        d.setAttribute("aria-selected", i === current ? "true" : "false");
      });
    }

    function updateArrows() {
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === maxIndex;
    }

    function prev() { goTo(current - 1); }
    function next() { goTo(current + 1); }

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    // Keyboard
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    });

    // Touch swipe
    let touchStartX = 0;
    root.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    root.addEventListener("touchend", function (e) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    }, { passive: true });

    // Auto-play
    if (opts.autoPlay) {
      function startAuto() {
        autoTimer = setInterval(function () {
          goTo(current < maxIndex ? current + 1 : 0);
        }, opts.autoPlayInterval || 4000);
      }

      function stopAuto() {
        clearInterval(autoTimer);
      }

      root.addEventListener("mouseenter", stopAuto);
      root.addEventListener("mouseleave", startAuto);
      root.addEventListener("focusin",    stopAuto);
      root.addEventListener("focusout",   startAuto);
      startAuto();
    }

    // Init
    goTo(0);
  }
})();
