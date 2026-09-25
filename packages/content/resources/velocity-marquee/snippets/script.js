function whenGsapReady(run) {
  const wait = () => {
    if (!window.gsap) {
      requestAnimationFrame(wait);
      return;
    }
    run();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wait);
  } else {
    wait();
  }
}

whenGsapReady(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const marquee = document.querySelector("[data-marquee]");
  if (!marquee) return;

  const loopWidth = () => marquee.scrollWidth / 2;
  let offset = 0;
  let velocityBoost = 0;
  const basePxPerFrame = 1.8;

  if (reduced) return;

  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
    lenis.on("scroll", ({ velocity }) => {
      velocityBoost = velocity * 10;
    });
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  gsap.ticker.add(() => {
    const ratio = gsap.ticker.deltaRatio();
    velocityBoost *= 0.9;
    const speed = basePxPerFrame + Math.min(12, Math.abs(velocityBoost));
    offset -= speed * ratio;

    const w = loopWidth();
    if (w <= 0) return;
    if (offset <= -w) offset += w;
    gsap.set(marquee, { x: offset, force3D: true });
  });
});
