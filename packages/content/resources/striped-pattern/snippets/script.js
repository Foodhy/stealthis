// Striped Pattern — optional interactivity: hover pauses animation, click cycles speed
(function () {
  "use strict";

  const cards = document.querySelectorAll(".stripe-card");
  if (!cards.length) return;

  const speeds = ["40s", "20s", "10s", "60s"];

  cards.forEach((card) => {
    let speedIndex = 0;
    const bg = card.querySelector(".stripe-bg");
    if (!bg) return;

    // Pause animation on hover for inspection
    card.addEventListener("mouseenter", () => {
      bg.style.animationPlayState = "paused";
    });

    card.addEventListener("mouseleave", () => {
      bg.style.animationPlayState = "running";
    });

    // Click to cycle through animation speeds
    card.addEventListener("click", () => {
      speedIndex = (speedIndex + 1) % speeds.length;
      bg.style.setProperty("--stripe-speed", speeds[speedIndex]);
      bg.style.animationDuration = speeds[speedIndex];
    });
  });

  // Subtle parallax: shift stripe position based on mouse position
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    cards.forEach((card) => {
      const bg = card.querySelector(".stripe-bg");
      if (bg) {
        bg.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  });
})();
