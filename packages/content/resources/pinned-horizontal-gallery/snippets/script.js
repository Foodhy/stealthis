const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const track = document.querySelector(".track");
const slides = document.querySelectorAll(".slide");

gsap.registerPlugin(ScrollTrigger);

function setupHorizontal() {
  const totalScroll = track.scrollWidth - window.innerWidth;
  if (totalScroll <= 0) return;

  gsap.to(track, {
    x: () => -totalScroll,
    ease: "none",
    scrollTrigger: {
      trigger: ".pin-wrap",
      start: "top top",
      end: () => `+=${totalScroll}`,
      pin: ".pin-viewport",
      scrub: reduced ? false : 0.8,
      invalidateOnRefresh: true,
    },
  });
}

function bootLenis() {
  if (reduced || typeof Lenis === "undefined") {
    setupHorizontal();
    ScrollTrigger.refresh();
    return;
  }
  const lenis = new Lenis({ autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  setupHorizontal();
  ScrollTrigger.refresh();
}

bootLenis();
