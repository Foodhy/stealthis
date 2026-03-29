/* ============================================================
   Neumorphism — Interactive Effects
   Convex press, ripple on click, badge toggle
   ============================================================ */

(function () {
  "use strict";

  // ── Button press state ──────────────────────────────────────
  const primaryBtn = document.getElementById("btn-primary");
  const secondaryBtn = document.getElementById("btn-secondary");

  function addPressEffect(btn) {
    if (!btn) return;
    btn.addEventListener("mousedown", () => btn.classList.add("active"));
    btn.addEventListener("mouseup", () => btn.classList.remove("active"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("active"));
  }

  addPressEffect(primaryBtn);

  // ── Badge toggle (active/inactive) ─────────────────────────
  const badges = document.querySelectorAll(".badge");

  badges.forEach((badge) => {
    badge.addEventListener("click", () => {
      badge.classList.toggle("badge-accent");
    });
  });

  // ── Ripple effect on convex button ─────────────────────────
  if (primaryBtn) {
    primaryBtn.addEventListener("click", function (e) {
      const rect = primaryBtn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "neu-ripple";
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(108, 99, 255, 0.18);
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: neu-ripple-anim 0.55s ease-out forwards;
      `;

      primaryBtn.style.position = "relative";
      primaryBtn.style.overflow = "hidden";
      primaryBtn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  }

  // Inject keyframe for ripple
  const style = document.createElement("style");
  style.textContent = `
    @keyframes neu-ripple-anim {
      to {
        width: 160px;
        height: 160px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Input focus glow label ──────────────────────────────────
  const input = document.getElementById("neu-input");
  const label = document.querySelector(".input-label");

  if (input && label) {
    input.addEventListener("focus", () => {
      label.style.color = "#6C63FF";
      label.style.transition = "color 0.2s ease";
    });
    input.addEventListener("blur", () => {
      label.style.color = "";
    });
  }
})();
