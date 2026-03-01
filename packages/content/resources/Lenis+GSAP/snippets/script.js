const cards = Array.from(document.querySelectorAll(".card"));

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.1,
  smoothWheel: true,
  smoothTouch: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);

gsap.set(cards, {
  y: (index) => index * 14,
  rotate: (index) => -index * 1.2,
  scale: (index) => 1 - index * 0.04,
  opacity: (index) => (index === 0 ? 1 : 0.7),
  filter: (index) => (index === 0 ? "brightness(1)" : "brightness(0.7)"),
  zIndex: (index) => cards.length - index,
});

const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-stage",
    start: "top top",
    end: () => `+=${cards.length * 520}`,
    scrub: 1,
    pin: ".pin",
    anticipatePin: 1,
  },
});

cards.forEach((card, index) => {
  const nextIndex = index + 1;
  if (nextIndex >= cards.length) return;

  timeline
    .to(card, {
      opacity: 0,
      y: -60,
      rotate: 8,
      scale: 0.95,
      duration: 1,
      ease: "none",
    })
    .to(
      cards.slice(nextIndex),
      {
        y: (i) => (i + 1) * 14,
        rotate: (i) => -(i + 1) * 1.2,
        scale: (i) => 1 - (i + 1) * 0.04,
        opacity: (i) => (i === 0 ? 1 : 0.7),
        filter: (i) => (i === 0 ? "brightness(1)" : "brightness(0.7)"),
        duration: 1,
        ease: "none",
      },
      "<"
    );
});

window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});
