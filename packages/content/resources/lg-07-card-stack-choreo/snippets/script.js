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
const cards = Array.from(document.querySelectorAll(".card"));

cards.forEach((c, i) => {
  c.style.transform = `translateY(${i * 10}px) scale(${1 - i * 0.03})`;
  c.style.zIndex = String(cards.length - i);
});

if (!reduced && window.gsap) {
  const tl = window.gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
  cards.forEach((c, i) => {
    tl.to(
      c,
      { y: -220, rotation: i % 2 ? 9 : -9, opacity: 0, duration: 0.45, ease: "power2.in" },
      i * 0.22
    ).set(c, { y: 0, rotation: 0, opacity: 1 }, i * 0.22 + 0.46);
  });
}
