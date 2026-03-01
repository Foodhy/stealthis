const cards = Array.from(document.querySelectorAll(".card"));
const fill = document.querySelector(".meter-fill");

const intervalMs = 3800;
let active = 0;

const baseDepth = 40;

function layoutCards() {
  cards.forEach((card, index) => {
    const offset = (index - active + cards.length) % cards.length;
    const depth = Math.min(offset, 3);
    const scale = 1 - depth * 0.06;
    const y = depth * 18;
    const rotate = depth * -2.2;
    const opacity = depth > 3 ? 0 : 1;

    gsap.set(card, {
      zIndex: cards.length - depth,
      scale,
      y,
      rotate,
      opacity,
      filter: depth === 0 ? "brightness(1)" : "brightness(0.85)",
    });
  });
}

function animateToNext() {
  const current = cards[active];
  active = (active + 1) % cards.length;
  const next = cards[active];

  const tl = gsap.timeline();
  tl.to(current, {
    y: -baseDepth,
    rotate: 6,
    scale: 0.96,
    opacity: 0,
    duration: 0.65,
    ease: "power2.in",
  })
    .set(current, { y: 0, rotate: 0, opacity: 1 })
    .add(() => layoutCards())
    .fromTo(
      next,
      { scale: 1.04, y: 22 },
      { scale: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "<"
    );
}

function startMeter() {
  gsap.fromTo(
    fill,
    { width: "0%" },
    { width: "100%", duration: intervalMs / 1000, ease: "none" }
  );
}

function cycle() {
  animateToNext();
  startMeter();
}

layoutCards();
startMeter();
setInterval(cycle, intervalMs);

