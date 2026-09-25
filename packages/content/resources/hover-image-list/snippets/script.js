const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const list = document.querySelector("[data-list]");
const floater = document.querySelector("[data-floater]");
const floaterImg = floater.querySelector("img");

if (window.matchMedia("(max-width: 720px)").matches) {
  floater.hidden = true;
} else if (!reduced) {
  gsap.set(floater, { xPercent: -50, yPercent: -50, scale: 0.92 });
  const xTo = gsap.quickTo(floater, "x", { duration: 0.45, ease: "power3.out" });
  const yTo = gsap.quickTo(floater, "y", { duration: 0.45, ease: "power3.out" });

  function show(src) {
    floater.hidden = false;
    floaterImg.src = src;
    gsap.to(floater, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
  }

  function hide() {
    gsap.to(floater, {
      opacity: 0,
      scale: 0.92,
      duration: 0.25,
      onComplete: () => {
        floater.hidden = true;
      },
    });
  }

  window.addEventListener("mousemove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  list.querySelectorAll("li").forEach((row) => {
    row.addEventListener("mouseenter", () => show(row.dataset.img));
    row.addEventListener("mouseleave", hide);
  });
}
