const cardsData = [
  {
    title: "Mountain View",
    copy: "Check out these high-altitude escapes with crisp air and cinematic horizons.",
    button: "View Trips",
    theme: "media-sky",
  },
  {
    title: "To The Beach",
    copy: "Plan your next shoreline getaway with warm sunsets and deep blue water.",
    button: "View Trips",
    theme: "media-tide",
  },
  {
    title: "Desert Destinations",
    copy: "Wind-shaped dunes and amber tones for your most surreal journey yet.",
    button: "Book Now",
    theme: "media-dune",
  },
  {
    title: "Explore The Galaxy",
    copy: "Lift off into a night-sky adventure with glowing stardust and nebula haze.",
    button: "Book Now",
    theme: "media-orbit",
  },
];

const stack = document.getElementById("card-stack");
const stage = document.getElementById("scroll-stage");

stack.innerHTML = cardsData
  .map((card, index) => {
    return `
      <article class="card" data-index="${index}" aria-hidden="true">
        <div class="media ${card.theme}"></div>
        <div class="content">
          <p class="meta">0${index + 1}</p>
          <h2 class="title">${card.title}</h2>
          <p class="copy">${card.copy}</p>
          <button class="btn" type="button">${card.button}</button>
        </div>
      </article>
    `;
  })
  .join("");

stage.style.setProperty("--card-count", cardsData.length);

const cards = Array.from(document.querySelectorAll(".card"));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const cycleMs = prefersReducedMotion.matches ? 2800 : 3800;
const transitionMs = prefersReducedMotion.matches ? 500 : 700;

function applyProgress(scaled) {
  cards.forEach((card, index) => {
    const distance = scaled - index;
    const absDistance = Math.abs(distance);
    const clamped = clamp(absDistance, 0, 1);
    const opacity = 1 - clamped;
    const slideX = distance * 110;
    const scale = 1 - clamped * 0.06;
    const blur = clamped * 12;
    const wipe = clamp(1 - clamped, 0, 1);

    card.style.opacity = opacity.toFixed(3);
    card.style.transform = `translateX(${slideX.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    card.style.filter = `blur(${blur.toFixed(2)}px)`;
    card.style.clipPath = `polygon(0 0, ${wipe * 100}% 0, ${wipe * 100}% 100%, 0 100%)`;
    card.style.zIndex = String(cards.length - Math.round(absDistance * 10));
    card.setAttribute("aria-hidden", opacity < 0.6 ? "true" : "false");

    const media = card.querySelector(".media");
    if (media) {
      const mediaShift = clamp(-distance * 24, -30, 30);
      media.style.transform = `translateX(${mediaShift.toFixed(2)}px) scale(${(1 + clamped * 0.04).toFixed(3)})`;
    }
  });
}

let rafId = 0;
let startTime = 0;

function animate(now) {
  if (!startTime) startTime = now;

  const elapsed = now - startTime;
  const segment = cycleMs + transitionMs;
  const total = segment * cards.length;
  const loopTime = elapsed % total;

  const activeIndex = Math.floor(loopTime / segment);
  const segmentTime = loopTime % segment;
  const t = clamp(segmentTime / transitionMs, 0, 1);

  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const scaled = activeIndex + eased;
  applyProgress(scaled);

  rafId = window.requestAnimationFrame(animate);
}

applyProgress(0);
rafId = window.requestAnimationFrame(animate);

prefersReducedMotion.addEventListener("change", () => {
  window.cancelAnimationFrame(rafId);
  startTime = 0;
  rafId = window.requestAnimationFrame(animate);
});
