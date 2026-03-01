if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    gsap.set(".card", { opacity: 1 });
  } else {
    ScrollTrigger.batch(".card", {
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
        }),
      onEnterBack: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4 }),
      onLeave: (batch) =>
        gsap.to(batch, { opacity: 0, y: -20, stagger: 0.05, duration: 0.3 }),
      onLeaveBack: (batch) =>
        gsap.to(batch, { opacity: 0, y: 30, stagger: 0.05, duration: 0.3 }),
      start: "top 88%",
    });

    // Set initial state
    gsap.set(".card", { y: 40 });
  }
}
