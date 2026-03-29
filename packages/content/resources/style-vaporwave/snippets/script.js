/* ============================================================
   VAPORWAVE — Interactive Script
   - Glitch effect on main heading (periodic text-shadow shift)
   - Badge hover lift with glow intensify
   - Input neon pulse on focus
   - Retro grid shimmer animation
   - Sun rotation glow cycle
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. Glitch effect on hero heading
     Periodically randomizes text-shadow offsets to simulate
     magnetic tape degradation / signal interference
  ---------------------------------------------------------- */
  const heading = document.getElementById("glitch-heading");

  if (heading) {
    const glitchColors = [
      ["#FF71CE", "#01CDFE"],
      ["#01CDFE", "#FF71CE"],
      ["#B967FF", "#05FFA1"],
      ["#FFFB96", "#FF71CE"],
      ["#05FFA1", "#B967FF"],
    ];

    let glitchActive = false;
    let glitchTimeout = null;

    function doGlitch() {
      if (glitchActive) return;
      glitchActive = true;

      const pair = glitchColors[Math.floor(Math.random() * glitchColors.length)];
      const dx = (Math.random() * 8 - 4).toFixed(1);
      const dy = (Math.random() * 4 - 2).toFixed(1);
      const dx2 = -(Math.random() * 6 - 3).toFixed(1);

      heading.style.textShadow = [
        `0 0 10px ${pair[0]}`,
        `0 0 30px ${pair[0]}`,
        `${dx}px ${dy}px 0 ${pair[1]}`,
        `${dx2}px 0 0 #FFFB96`,
      ].join(", ");

      // Multiple rapid flickers
      let ticks = 0;
      const maxTicks = 3 + Math.floor(Math.random() * 5);

      const flicker = setInterval(function () {
        ticks++;
        heading.style.opacity = ticks % 2 === 0 ? "0.85" : "1";

        if (ticks >= maxTicks) {
          clearInterval(flicker);

          // Restore normal glow
          heading.style.textShadow = [
            "0 0 10px #FF71CE",
            "0 0 30px #FF71CE",
            "0 0 60px rgba(255,113,206,0.5)",
            "4px 0 0 #01CDFE",
          ].join(", ");
          heading.style.opacity = "1";
          glitchActive = false;

          // Schedule next glitch
          scheduleGlitch();
        }
      }, 60);
    }

    function scheduleGlitch() {
      const delay = 3000 + Math.random() * 5000;
      glitchTimeout = setTimeout(doGlitch, delay);
    }

    scheduleGlitch();

    // Also trigger on click
    heading.addEventListener("click", doGlitch);
    heading.style.cursor = "pointer";
  }

  /* ----------------------------------------------------------
     2. Badge hover — intensify glow
  ---------------------------------------------------------- */
  const badges = document.querySelectorAll(".badge");
  badges.forEach(function (badge) {
    const originalShadow = getComputedStyle(badge).boxShadow;

    badge.addEventListener("mouseenter", function () {
      badge.style.transform = "translateY(-3px) scale(1.05)";
    });

    badge.addEventListener("mouseleave", function () {
      badge.style.transform = "";
      badge.style.boxShadow = "";
    });
  });

  /* ----------------------------------------------------------
     3. Input neon pulse on focus
  ---------------------------------------------------------- */
  const input = document.querySelector(".vapor-input");
  if (input) {
    input.addEventListener("focus", function () {
      // Pulse animation via style injection
      input.style.animation = "inputPulse 1.5s ease-in-out infinite";
    });

    input.addEventListener("blur", function () {
      input.style.animation = "";
    });
  }

  // Inject input pulse keyframe
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes inputPulse {
      0%, 100% {
        box-shadow:
          0 0 0 2px rgba(1,205,254,0.2),
          0 0 16px rgba(1,205,254,0.15),
          inset 0 0 20px rgba(1,205,254,0.04);
      }
      50% {
        box-shadow:
          0 0 0 3px rgba(1,205,254,0.35),
          0 0 28px rgba(1,205,254,0.3),
          inset 0 0 30px rgba(1,205,254,0.08);
      }
    }

    @keyframes sunGlow {
      0%, 100% { box-shadow: 0 0 40px rgba(255,113,206,0.6), 0 0 80px rgba(255,113,206,0.3); }
      50%       { box-shadow: 0 0 60px rgba(255,113,206,0.8), 0 0 120px rgba(255,113,206,0.5), 0 0 160px rgba(185,103,255,0.2); }
    }
  `;
  document.head.appendChild(styleEl);

  /* ----------------------------------------------------------
     4. Vaporwave sun glow cycle
  ---------------------------------------------------------- */
  const sunInner = document.querySelector(".sun-inner");
  if (sunInner) {
    sunInner.style.animation = "sunGlow 4s ease-in-out infinite";
  }

  /* ----------------------------------------------------------
     5. Button ripple press effect
  ---------------------------------------------------------- */
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = [
        "position: absolute",
        "border-radius: 50%",
        "pointer-events: none",
        "width: " + size + "px",
        "height: " + size + "px",
        "left: " + x + "px",
        "top: " + y + "px",
        "background: rgba(255,255,255,0.2)",
        "animation: rippleOut 0.5s ease-out forwards",
      ].join(";");

      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 500);
    });
  });

  const rippleStyle = document.createElement("style");
  rippleStyle.textContent = `
    @keyframes rippleOut {
      0%   { transform: scale(0); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);
})();
