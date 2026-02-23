// Magnetic Button — cursor proximity pull effect
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const STRENGTH = 0.35; // pull intensity (0–1)
  const RADIUS = 100; // activation radius in px

  const buttons = document.querySelectorAll("[data-magnetic]");

  buttons.forEach((btn) => {
    const inner = btn.querySelector(".magnet-btn__inner");

    document.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < RADIUS) {
        const pull = (1 - distance / RADIUS) * STRENGTH;
        const moveX = dx * pull;
        const moveY = dy * pull;

        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        if (inner) {
          inner.style.transform = `translate(${moveX * 0.4}px, ${moveY * 0.4}px)`;
        }
      } else {
        btn.style.transform = "";
        if (inner) inner.style.transform = "";
      }
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      if (inner) inner.style.transform = "";
    });
  });
})();
