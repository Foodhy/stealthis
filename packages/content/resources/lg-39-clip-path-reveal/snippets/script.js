(function () {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    gsap.set(".reveal-block, .reveal-half", { clipPath: "inset(0 0% 0 0)" });
    return;
  }

  // ── Wipe from right → left ──
  const leftEl = document.querySelector(".reveal--left");
  if (leftEl) {
    gsap.fromTo(leftEl,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        ease: "power2.inOut",
        scrollTrigger: { trigger: leftEl, start: "top 80%", end: "top 30%", scrub: 1 },
      }
    );
  }

  // ── Wipe from bottom → up ──
  const bottomEl = document.querySelector(".reveal--bottom");
  if (bottomEl) {
    gsap.fromTo(bottomEl,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        ease: "power2.inOut",
        scrollTrigger: { trigger: bottomEl, start: "top 80%", end: "top 20%", scrub: 1.2 },
      }
    );
  }

  // ── Split reveal — both halves from center out ──
  const leftHalf  = document.querySelector(".reveal-half--left");
  const rightHalf = document.querySelector(".reveal-half--right");
  if (leftHalf && rightHalf) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: leftHalf.closest(".reveal-split"), start: "top 75%", end: "top 25%", scrub: 1 },
    });
    tl.fromTo(leftHalf,  { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "power2.inOut" }, 0)
      .fromTo(rightHalf, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", ease: "power2.inOut" }, 0);
  }

  // ── Diagonal — polygon from corner ──
  const diagEl = document.querySelector(".reveal--diagonal");
  if (diagEl) {
    gsap.fromTo(diagEl,
      { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        ease: "power3.inOut",
        scrollTrigger: { trigger: diagEl, start: "top 78%", end: "top 20%", scrub: 1.5 },
      }
    );
  }
}());
