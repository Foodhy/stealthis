// 3D Design — Mouse-tracking tilt effect
document.querySelectorAll(".tilt-container, .card-section").forEach((container) => {
  const card = container.querySelector(".card-3d");
  if (!card) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 12;
    const rotateY = (x - 0.5) * 12;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.boxShadow = `
      ${-rotateY * 2}px ${rotateX * 2}px 12px rgba(0,0,0,0.4),
      ${-rotateY * 4}px ${rotateX * 4}px 40px rgba(0,0,0,0.3)
    `;

    // Move shine
    const shine = card.querySelector(".card-3d__shine");
    if (shine) {
      shine.style.opacity = "1";
      shine.style.background = `linear-gradient(
        ${105 + (x - 0.5) * 40}deg,
        transparent 35%,
        rgba(255,255,255,0.04) 42%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0.04) 58%,
        transparent 65%
      )`;
    }
  });

  container.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.boxShadow = "";
    const shine = card.querySelector(".card-3d__shine");
    if (shine) {
      shine.style.opacity = "0";
    }
  });
});

// Stat hover 3D pop
document.querySelectorAll(".stat-3d").forEach((stat) => {
  stat.addEventListener("mouseenter", () => {
    stat.style.transform = "translateY(-4px) translateZ(16px) scale(1.03)";
  });
  stat.addEventListener("mouseleave", () => {
    stat.style.transform = "";
  });
});
