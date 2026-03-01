const cards = Array.from(document.querySelectorAll(".card"));
const progressBar = document.querySelector(".progress-bar");
const slicesPerCard = 6;
const intervalMs = 4200;
let activeIndex = 0;

function buildSlices() {
  cards.forEach((card) => {
    const container = card.querySelector(".slices");
    const imageUrl = container.dataset.image;
    container.innerHTML = "";

    for (let i = 0; i < slicesPerCard; i += 1) {
      const slice = document.createElement("div");
      slice.className = "slice";
      slice.style.backgroundImage = `url('${imageUrl}')`;
      slice.style.backgroundPosition = `${(i / (slicesPerCard - 1)) * 100}% 50%`;
      container.appendChild(slice);
    }
  });
}

function setInitialState() {
  cards.forEach((card, index) => {
    card.style.zIndex = `${cards.length - index}`;
    card.style.opacity = index === activeIndex ? "1" : "0";
    card.style.pointerEvents = index === activeIndex ? "auto" : "none";
  });
}

function animateTransition() {
  const current = cards[activeIndex];
  activeIndex = (activeIndex + 1) % cards.length;
  const next = cards[activeIndex];

  const currentSlices = Array.from(current.querySelectorAll(".slice"));
  const nextSlices = Array.from(next.querySelectorAll(".slice"));

  next.style.opacity = "1";
  next.style.zIndex = `${cards.length}`;

  const tl = gsap.timeline({
    defaults: { duration: 0.8, ease: "power2.inOut" },
    onComplete: () => {
      current.style.opacity = "0";
      current.style.zIndex = `${cards.length - 2}`;
      current.style.pointerEvents = "none";
      next.style.pointerEvents = "auto";
    },
  });

  tl.fromTo(
    nextSlices,
    { yPercent: 110, rotation: -6 },
    { yPercent: 0, rotation: 0, stagger: 0.06 },
    0
  ).to(
    currentSlices,
    { yPercent: -110, rotation: 6, stagger: 0.05 },
    0
  );
}

function animateProgress() {
  gsap.fromTo(
    progressBar,
    { width: "0%" },
    { width: "100%", duration: intervalMs / 1000, ease: "none" }
  );
}

function cycle() {
  animateTransition();
  animateProgress();
}

buildSlices();
setInitialState();
animateProgress();
setInterval(cycle, intervalMs);

