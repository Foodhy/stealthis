const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cards = document.querySelectorAll("[data-card]");

gsap.registerPlugin(ScrollTrigger);

function initStack() {
  cards.forEach((card, i) => {
    if (i === cards.length - 1) return;
    if (reduced) return;
    gsap.to(card, {
      scale: 0.88,
      opacity: 0.45,
      filter: "brightness(0.75)",
      ease: "none",
      scrollTrigger: {
        trigger: cards[i + 1],
        start: "top 85%",
        end: "top 15%",
        scrub: true,
      },
    });
  });
}

function boot() {
  if (!reduced && typeof Lenis !== "undefined") {
    const lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  initStack();
  ScrollTrigger.refresh();
}

boot();
