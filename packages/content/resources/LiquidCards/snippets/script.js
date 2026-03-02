const cards = Array.from(document.querySelectorAll(".card"));
const fill = document.querySelector(".meter .fill");
const intervalMs = 4000;
let active = 0;

const blobs = [];

function createBlobs(card) {
  const mask = document.createElement("div");
  mask.className = "liquid-mask";
  card.appendChild(mask);

  for (let i = 0; i < 4; i += 1) {
    const blob = document.createElement("div");
    blob.className = "blob";
    mask.appendChild(blob);
    blobs.push(blob);
  }
}

function setupBlobs() {
  cards.forEach((card) => {
    if (!card.querySelector(".liquid-mask")) createBlobs(card);
  });
}

function animateLiquid(card) {
  const mask = card.querySelector(".liquid-mask");
  const items = Array.from(mask.querySelectorAll(".blob"));

  items.forEach((blob) => {
    const size = gsap.utils.random(140, 220);
    gsap.set(blob, {
      width: size,
      height: size,
      x: gsap.utils.random(-60, 240),
      y: gsap.utils.random(-80, 200),
      borderRadius: "50%",
      background: "rgba(255,255,255,0.18)",
      filter: "blur(6px)",
      position: "absolute",
    });
  });

  return gsap
    .timeline()
    .fromTo(
      items,
      { scale: 0.6, opacity: 0 },
      { scale: 1.15, opacity: 1, duration: 0.8, stagger: 0.08, ease: "sine.out" }
    )
    .to(items, {
      x: () => gsap.utils.random(-40, 200),
      y: () => gsap.utils.random(-60, 140),
      duration: 1.4,
      ease: "sine.inOut",
      stagger: 0.08,
    });
}

function setActive(index) {
  cards.forEach((card, i) => {
    card.classList.toggle("is-active", i === index);
    card.style.zIndex = `${cards.length - i}`;
  });
}

function transition() {
  const current = cards[active];
  active = (active + 1) % cards.length;
  const next = cards[active];

  setActive(active);

  const tl = gsap.timeline();
  tl.fromTo(
    current,
    { filter: "blur(0px)", opacity: 1 },
    { filter: "blur(8px)", opacity: 0, duration: 0.6, ease: "power2.in" }
  ).fromTo(
    next,
    { scale: 1.08, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" },
    "<"
  );

  animateLiquid(next);
}

function animateMeter() {
  gsap.fromTo(
    fill,
    { width: "0%" },
    { width: "100%", duration: intervalMs / 1000, ease: "none" }
  );
}

setupBlobs();
setActive(active);
animateLiquid(cards[active]);
animateMeter();
setInterval(() => {
  transition();
  animateMeter();
}, intervalMs);
