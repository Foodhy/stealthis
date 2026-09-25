const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const page = document.querySelector("[data-page]");

gsap.registerPlugin(ScrollTrigger);

function boot() {
  if (!reduced) {
    gsap.to(page, {
      y: -24,
      ease: "none",
      scrollTrigger: {
        trigger: page,
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  if (!reduced && typeof Lenis !== "undefined") {
    const lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  ScrollTrigger.refresh();
}

boot();
