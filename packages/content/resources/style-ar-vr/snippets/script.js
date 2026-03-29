// AR/VR Interface — HUD card glow tracking
document.querySelectorAll(".hud-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.06), rgba(0, 240, 255, 0.03) 50%, transparent 80%)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.background = "";
  });
});

// Scan line random restart delay
const scanLine = document.querySelector(".scan-line");
if (scanLine) {
  scanLine.addEventListener("animationiteration", () => {
    const delay = Math.random() * 2;
    scanLine.style.animationDelay = `${delay}s`;
  });
}

// Corner bracket pulse on card hover
document.querySelectorAll(".hud-card").forEach((card) => {
  const corners = card.querySelectorAll(".hud-corner");
  card.addEventListener("mouseenter", () => {
    corners.forEach((c) => (c.style.opacity = "1"));
  });
  card.addEventListener("mouseleave", () => {
    corners.forEach((c) => (c.style.opacity = ""));
  });
});
