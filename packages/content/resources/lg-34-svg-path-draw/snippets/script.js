if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".draw-path").forEach((path, i) => {
    const len = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: len,
      strokeDashoffset: len,
    });

    if (reduced) {
      gsap.set(path, { strokeDashoffset: 0 });
      return;
    }

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".draw-svg",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1.5,
      },
    });
  });
}
