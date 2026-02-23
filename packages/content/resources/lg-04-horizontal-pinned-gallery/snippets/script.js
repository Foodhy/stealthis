if (!window.MotionPreference) {
  const __mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const __listeners = new Set();

  const MotionPreference = {
    prefersReducedMotion() {
      return __mql.matches;
    },
    setOverride(value) {
      const reduced = Boolean(value);
      document.documentElement.classList.toggle("reduced-motion", reduced);
      window.dispatchEvent(new CustomEvent("motion-preference", { detail: { reduced } }));
      for (const listener of __listeners) {
        try {
          listener({ reduced, override: reduced, systemReduced: __mql.matches });
        } catch {}
      }
    },
    onChange(listener) {
      __listeners.add(listener);
      try {
        listener({
          reduced: __mql.matches,
          override: null,
          systemReduced: __mql.matches,
        });
      } catch {}
      return () => __listeners.delete(listener);
    },
    getState() {
      return { reduced: __mql.matches, override: null, systemReduced: __mql.matches };
    },
  };

  window.MotionPreference = MotionPreference;
}

const reduced = window.MotionPreference.prefersReducedMotion();

if (!window.gsap || !window.ScrollTrigger || reduced) {
  document.body.classList.add("no-motion");
} else {
  window.gsap.registerPlugin(window.ScrollTrigger);
  const track = document.getElementById("track");

  window.gsap.to(track, {
    x: () => -Math.max(0, track.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: ".pin-wrap",
      pin: true,
      scrub: 1,
      start: "top top",
      end: () =>
        `+=${Math.max(1, track.scrollWidth - window.innerWidth + window.innerHeight * 0.9)}`,
      invalidateOnRefresh: true,
    },
  });

  window.addEventListener("resize", () => {
    window.ScrollTrigger.refresh();
  });
}
