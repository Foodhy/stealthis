// Scratch to Reveal — canvas-based scratch card effect
(function () {
  "use strict";

  const BRUSH_SIZE = 40;
  const REVEAL_THRESHOLD = 0.55; // 55% scratched triggers full reveal
  const OVERLAY_COLOR = "#1a1a2e";

  function initScratchCard(container) {
    const canvas = container.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let isDrawing = false;
    let revealed = false;

    function resize() {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      fillOverlay();
    }

    function fillOverlay() {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = OVERLAY_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern/texture
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let x = 0; x < canvas.width; x += 4) {
        for (let y = 0; y < canvas.height; y += 4) {
          if (Math.random() > 0.5) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }

    function scratch(pos) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, BRUSH_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function scratchLine(from, to) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = BRUSH_SIZE;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    function getScratchPercentage() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;
      const total = pixels.length / 4;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparent++;
      }

      return transparent / total;
    }

    function updateProgress(pct) {
      const progressFill = container.parentElement.querySelector(".progress-bar-fill");
      const progressLabel = container.parentElement.querySelector(".progress-pct");
      if (progressFill) {
        progressFill.style.width = `${Math.min(pct * 100, 100)}%`;
      }
      if (progressLabel) {
        progressLabel.textContent = `${Math.round(Math.min(pct * 100, 100))}%`;
      }
    }

    function checkReveal() {
      const pct = getScratchPercentage();
      updateProgress(pct);

      if (pct >= REVEAL_THRESHOLD && !revealed) {
        revealed = true;
        container.classList.add("revealed");
        updateProgress(1);
      }
    }

    let lastPos = null;

    function onStart(e) {
      e.preventDefault();
      if (revealed) return;
      isDrawing = true;
      container.classList.add("scratching");
      lastPos = getPos(e);
      scratch(lastPos);
    }

    function onMove(e) {
      e.preventDefault();
      if (!isDrawing || revealed) return;
      const pos = getPos(e);
      scratchLine(lastPos, pos);
      lastPos = pos;
    }

    function onEnd() {
      if (!isDrawing) return;
      isDrawing = false;
      lastPos = null;
      checkReveal();
    }

    // Mouse events
    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("mouseleave", onEnd);

    // Touch events
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);
    canvas.addEventListener("touchcancel", onEnd);

    // Reset function
    container._reset = function () {
      revealed = false;
      container.classList.remove("revealed", "scratching");
      resize();
      updateProgress(0);
    };

    resize();
    window.addEventListener("resize", () => {
      if (!revealed) resize();
    });
  }

  function init() {
    const cards = document.querySelectorAll(".scratch-card");
    cards.forEach(initScratchCard);

    // Reset buttons
    document.querySelectorAll("[data-reset-scratch]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.resetScratch;
        const card = document.getElementById(targetId);
        if (card && card._reset) card._reset();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
