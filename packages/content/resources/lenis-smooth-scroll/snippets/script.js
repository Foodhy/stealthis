const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);

function initPanels() {
  document.querySelectorAll("[data-panel] .panel-inner").forEach((el) => {
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el.closest("[data-panel]"),
          start: "top 75%",
          end: "top 40%",
          scrub: 0.6,
        },
      }
    );
  });
}

if (reduced || typeof Lenis === "undefined") {
  initPanels();
  ScrollTrigger.refresh();
} else {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true, autoRaf: false });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  initPanels();
  ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  ScrollTrigger.refresh();
}
