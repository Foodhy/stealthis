const section = document.getElementById("scroll-area");
const cards = Array.from(document.querySelectorAll(".card"));

section.style.setProperty("--card-count", cards.length);

let sectionTop = 0;
let sectionHeight = 0;
let viewportHeight = window.innerHeight;
let ticking = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function measure() {
  const rect = section.getBoundingClientRect();
  viewportHeight = window.innerHeight;
  sectionTop = window.scrollY + rect.top;
  sectionHeight = section.offsetHeight;
}

function updateCards() {
  const maxScroll = Math.max(sectionHeight - viewportHeight, 1);
  const scrollPosition = window.scrollY - sectionTop;
  const progress = clamp(scrollPosition / maxScroll, 0, 1);
  const spread = cards.length - 1;
  const scaled = progress * spread;

  cards.forEach((card, index) => {
    const distance = Math.abs(scaled - index);
    const clamped = clamp(distance, 0, 1);
    const opacity = 1 - clamped;
    const translateY = (scaled - index) * 40;
    const scale = 1 - clamped * 0.05;
    const blur = clamped * 8;

    card.style.opacity = opacity.toFixed(3);
    card.style.transform = `translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    card.style.filter = `blur(${blur.toFixed(2)}px)`;
    card.setAttribute("aria-hidden", opacity < 0.5 ? "true" : "false");
  });

  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateCards);
    ticking = true;
  }
}

measure();
updateCards();

window.addEventListener("resize", () => {
  measure();
  updateCards();
});

window.addEventListener("scroll", onScroll, { passive: true });
