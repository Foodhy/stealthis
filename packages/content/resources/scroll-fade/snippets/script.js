// Scroll Fade In — Intersection Observer
(() => {
  const elements = document.querySelectorAll(".fade-in-el");

  if (!elements.length) return;

  // Skip animation if user prefers reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (const el of elements) {
      el.classList.add("is-visible");
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        // Unobserve once visible — no need to keep watching
        obs.unobserve(entry.target);
      }
    },
    {
      threshold: 0.15, // trigger when 15% of the element is visible
      rootMargin: "0px 0px -40px 0px", // slight offset from viewport bottom
    }
  );

  for (const el of elements) {
    observer.observe(el);
  }
})();
