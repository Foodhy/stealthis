/* ============================================================
   NES RETRO / PIXEL — Interactive Script
   - Pixel press effect on button click
   - Hover scale flash
   - Simulated HP bar damage animation
   - Scanline flicker on page load
   - Score counter easter egg
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. Pixel button press effect
  ---------------------------------------------------------- */
  const buttons = document.querySelectorAll(".btn[data-pixel-sound]");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.add("pressed");

      // Flash the button color briefly
      const originalBg = btn.style.background;
      if (btn.classList.contains("btn-primary")) {
        btn.style.background = "#FFFFFF";
        btn.style.color = "#0B0B0B";
      } else if (btn.classList.contains("btn-secondary")) {
        btn.style.background = "#FFFFFF";
        btn.style.color = "#4169E1";
      } else if (btn.classList.contains("btn-ghost")) {
        btn.style.background = "rgba(255,215,0,0.3)";
      }

      setTimeout(function () {
        btn.classList.remove("pressed");
        btn.style.background = "";
        btn.style.color = "";
      }, 120);
    });

    // Hover scale pop
    btn.addEventListener("mouseenter", function () {
      btn.style.transform = "translate(-2px, -2px)";
    });

    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  });

  /* ----------------------------------------------------------
     2. HP bar animation on load
  ---------------------------------------------------------- */
  const hpFill = document.querySelector(".hp-fill");
  if (hpFill) {
    const targetWidth = hpFill.style.width || "74%";
    hpFill.style.width = "0%";

    // Drain from full to target, simulating damage received
    let current = 100;
    const target = parseInt(targetWidth, 10);
    const decrement = (100 - target) / 20;

    const hpInterval = setInterval(function () {
      if (current <= target) {
        hpFill.style.width = target + "%";
        clearInterval(hpInterval);
        return;
      }
      current -= decrement;
      hpFill.style.width = Math.max(current, target) + "%";
    }, 40);
  }

  /* ----------------------------------------------------------
     3. Score counter easter egg — click the logo to increment
  ---------------------------------------------------------- */
  const logo = document.querySelector(".header-logo");
  const ticker = document.querySelector(".ticker-inner");
  let score = 0;

  if (logo && ticker) {
    logo.style.cursor = "pointer";
    logo.title = "Click for points!";

    logo.addEventListener("click", function () {
      score += 100;

      // Flash logo
      logo.style.color = "#FFD700";
      setTimeout(function () {
        logo.style.color = "";
      }, 200);

      // Spawn floating +100 label
      const float = document.createElement("span");
      float.textContent = "+100";
      float.style.cssText = [
        "position: fixed",
        'font-family: "Press Start 2P", monospace',
        "font-size: 10px",
        "color: #FFD700",
        "pointer-events: none",
        "z-index: 10000",
        "text-shadow: 2px 2px 0 #0B0B0B",
        "animation: floatUp 0.8s ease-out forwards",
        "left: " + (logo.getBoundingClientRect().left + 20) + "px",
        "top: " + (logo.getBoundingClientRect().top + 10) + "px",
      ].join(";");
      document.body.appendChild(float);
      setTimeout(function () {
        float.remove();
      }, 800);

      // Update ticker text
      ticker.textContent = ticker.textContent.replace(
        /HIGH SCORE: [\d,]+/,
        "HIGH SCORE: " + score.toLocaleString()
      );
    });
  }

  // Float-up keyframe injection
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes floatUp {
      0%   { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-40px); }
    }
  `;
  document.head.appendChild(styleEl);

  /* ----------------------------------------------------------
     4. Scanline flicker on page load (CRT power-on effect)
  ---------------------------------------------------------- */
  document.body.style.opacity = "0";
  let flickerCount = 0;
  const maxFlickers = 5;

  const flicker = setInterval(function () {
    flickerCount++;
    document.body.style.opacity = flickerCount % 2 === 0 ? "0" : "0.85";
    if (flickerCount >= maxFlickers) {
      clearInterval(flicker);
      document.body.style.opacity = "1";
      document.body.style.transition = "opacity 0.1s";
    }
  }, 60);

  /* ----------------------------------------------------------
     5. Pixel input: play with characters counter
  ---------------------------------------------------------- */
  const playerInput = document.getElementById("player-name");
  const hintEl = document.querySelector(".input-hint");

  if (playerInput && hintEl) {
    playerInput.addEventListener("input", function () {
      const remaining = 10 - playerInput.value.length;
      if (remaining <= 0) {
        hintEl.textContent = "MAX REACHED!";
        hintEl.style.color = "#FF4500";
      } else {
        hintEl.textContent = remaining + " CHARS REMAINING";
        hintEl.style.color = "";
      }
    });
  }

  /* ----------------------------------------------------------
     6. Stat boxes — wobble on hover
  ---------------------------------------------------------- */
  const statBoxes = document.querySelectorAll(".stat-box");
  statBoxes.forEach(function (box) {
    box.style.cursor = "pointer";
    box.addEventListener("mouseenter", function () {
      box.style.transform = "translate(-2px, -2px)";
      box.style.boxShadow = "4px 4px 0 #FFD700";
    });
    box.addEventListener("mouseleave", function () {
      box.style.transform = "";
      box.style.boxShadow = "";
    });
  });
})();
