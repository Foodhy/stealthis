const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll("[data-reveal]").forEach((block) => {
  const frame = block.querySelector(".frame");
  const img = block.querySelector("img");
  const fromClip = block.classList.contains("reveal--right")
    ? "inset(0 0 0 100%)"
    : "inset(0 100% 0 0)";

  if (reduced) {
    gsap.set(frame, { clipPath: "inset(0 0 0 0)" });
    gsap.set(img, { scale: 1 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: block,
      start: "top 80%",
      end: "top 35%",
      scrub: 0.5,
    },
  });

  tl.fromTo(frame, { clipPath: fromClip }, { clipPath: "inset(0 0 0 0)", ease: "power2.out" }).fromTo(
    img,
    { scale: 1.12 },
    { scale: 1, ease: "power2.out" },
    0
  );
});
