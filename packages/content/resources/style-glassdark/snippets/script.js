/* Glass Dark — Interactive JS */

(function () {
  "use strict";

  // ── Mouse-tracked blob drift enhancement ──
  const blobBlue = document.getElementById("blobBlue");
  const blobPurple = document.getElementById("blobPurple");
  const blobCyan = document.getElementById("blobCyan");

  let mouseX = 0;
  let mouseY = 0;
  let blobAnimFrame = null;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;

    if (!blobAnimFrame) {
      blobAnimFrame = requestAnimationFrame(updateBlobs);
    }
  });

  function updateBlobs() {
    blobAnimFrame = null;

    // Subtle parallax push on blobs based on mouse (±30px range)
    if (blobBlue) {
      blobBlue.style.translate = `${mouseX * 30}px ${mouseY * 20}px`;
    }
    if (blobPurple) {
      blobPurple.style.translate = `${-mouseX * 25}px ${-mouseY * 30}px`;
    }
    if (blobCyan) {
      blobCyan.style.translate = `${mouseX * 20}px ${-mouseY * 20}px`;
    }
  }

  // ── Entrance animation for stats ──
  const stats = document.querySelectorAll(".stat");
  stats.forEach((stat, i) => {
    stat.style.opacity = "0";
    stat.style.transform = "translateY(12px)";
    stat.style.transition = `opacity 0.5s ease ${0.4 + i * 0.1}s, transform 0.5s ease ${0.4 + i * 0.1}s`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      stats.forEach((stat) => {
        stat.style.opacity = "1";
        stat.style.transform = "translateY(0)";
      });
    });
  });

  // ── Glass card entrance ──
  const glassCards = document.querySelectorAll(".glass-card");
  glassCards.forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = `opacity 0.6s ease ${0.2 + i * 0.15}s, transform 0.6s ease ${0.2 + i * 0.15}s`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      glassCards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    });
  });

  // ── Input: glowing border pulse on focus ──
  const input = document.getElementById("glassInput");
  if (input) {
    input.addEventListener("focus", () => {
      input.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15), 0 0 20px rgba(96,165,250,0.1)";
    });
    input.addEventListener("blur", () => {
      input.style.boxShadow = "";
    });
  }

  // ── White button: shimmer on hover ──
  const whiteBtn = document.querySelector(".btn--white");
  if (whiteBtn) {
    whiteBtn.addEventListener("mouseenter", () => {
      whiteBtn.style.background = "#f0f0f0";
    });
    whiteBtn.addEventListener("mouseleave", () => {
      whiteBtn.style.background = "white";
    });
  }

  // ── Status dot pulse animation ──
  const statusDot = document.querySelector(".status-dot");
  if (statusDot) {
    const pulseKeyframes = `
      @keyframes statusPulse {
        0%, 100% { box-shadow: 0 0 8px #22c55e, 0 0 16px rgba(34,197,94,0.4); }
        50%       { box-shadow: 0 0 14px #22c55e, 0 0 28px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.2); }
      }
    `;
    const style = document.createElement("style");
    style.textContent = pulseKeyframes;
    document.head.appendChild(style);
    statusDot.style.animation = "statusPulse 2s ease-in-out infinite";
  }
})();
