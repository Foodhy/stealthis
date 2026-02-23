// Glassmorphism Card — no JS required for the base effect.
// This script adds an optional mouse-tracking shine effect.
(() => {
  const card = document.querySelector(".glass-card");
  if (!card) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--shine-x", `${x}%`);
    card.style.setProperty("--shine-y", `${y}%`);

    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
})();
