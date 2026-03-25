// Dot Pattern — CSS-only effect; no JS required.
// This script adds an optional hover-responsive glow that follows the cursor.
(function () {
  "use strict";

  const container = document.querySelector(".dot-pattern");
  if (!container) return;

  // Create a subtle glow element that follows the mouse
  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    transform: "translate(-50%, -50%)",
    transition: "opacity 0.3s ease",
    opacity: "0",
    zIndex: "0",
  });
  container.appendChild(glow);

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glow.style.left = x + "px";
    glow.style.top = y + "px";
    glow.style.opacity = "1";
  });

  container.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
  });
})();
