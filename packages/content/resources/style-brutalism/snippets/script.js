/* ============================================================
   Brutalism — Interactive Effects
   Button shadow lift, badge color flip, tape glitch, cursor blink
   ============================================================ */

(function () {
  "use strict";

  // ── Button: amplified hard-shadow lift on hover ─────────────
  // CSS handles hover already, but JS adds a satisfying "thud" on click
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      // Flash white border briefly
      btn.style.outline = "3px solid #0000FF";
      btn.style.outlineOffset = "0px";
      setTimeout(() => {
        btn.style.outline = "";
        btn.style.outlineOffset = "";
      }, 250);

      // Spawn a small "✓" confirmation text
      const confirm = document.createElement("span");
      confirm.textContent = "OK";
      confirm.style.cssText = `
        position: fixed;
        left: ${e.clientX + 10}px;
        top: ${e.clientY - 20}px;
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: #000;
        background: #FFED00;
        border: 2px solid #000;
        padding: 2px 6px;
        pointer-events: none;
        z-index: 9999;
        animation: brut-pop 0.5s ease-out forwards;
      `;
      document.body.appendChild(confirm);
      confirm.addEventListener("animationend", () => confirm.remove());
    });
  });

  // Inject pop animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes brut-pop {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-20px) scale(0.8); }
    }
  `;
  document.head.appendChild(style);

  // ── Badge: click to cycle through states ───────────────────
  const badges = document.querySelectorAll(".badge");
  const badgeCycles = [null, "badge-invert", "badge-yellow", "badge-blue"];

  badges.forEach((badge) => {
    let idx = badgeCycles.findIndex((cls) => cls && badge.classList.contains(cls));
    if (idx === -1) idx = 0;

    badge.addEventListener("click", () => {
      badgeCycles.forEach((cls) => {
        if (cls) badge.classList.remove(cls);
      });
      idx = (idx + 1) % badgeCycles.length;
      if (badgeCycles[idx]) badge.classList.add(badgeCycles[idx]);
    });
  });

  // ── Header tape: pause on hover ────────────────────────────
  const tape = document.querySelector(".header-tape");
  if (tape) {
    tape.addEventListener("mouseenter", () => {
      tape.style.animationPlayState = "paused";
      tape.style.background = "#0000FF";
    });
    tape.addEventListener("mouseleave", () => {
      tape.style.animationPlayState = "running";
      tape.style.background = "#000";
    });
  }

  // ── Input: glitch effect on focus ──────────────────────────
  const input = document.getElementById("brut-input");

  if (input) {
    input.addEventListener("focus", () => {
      const wrap = input.closest(".input-wrap");
      if (!wrap) return;

      let glitchCount = 0;
      const colors = ["#FFED00", "#0000FF", "#FF0000", "#000"];
      const interval = setInterval(() => {
        wrap.style.boxShadow = `${4 + glitchCount}px ${4 + glitchCount}px 0 ${colors[glitchCount % colors.length]}`;
        glitchCount++;
        if (glitchCount >= colors.length) {
          clearInterval(interval);
          wrap.style.boxShadow = "";
        }
      }, 60);
    });
  }

  // ── Card: drag-to-wobble on mousedown ──────────────────────
  const cards = document.querySelectorAll(".brut-card");

  cards.forEach((card) => {
    card.addEventListener("mousedown", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const isLeft = e.clientX < cx;
      const deg = isLeft ? -2 : 2;

      card.style.transition = "transform 0.08s ease";
      card.style.transform = `rotate(${deg}deg) translate(-2px, -2px)`;
      card.style.boxShadow = "10px 10px 0 #000";
    });

    card.addEventListener("mouseup", () => {
      card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      card.style.transform = "";
      card.style.boxShadow = "";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });
})();
