// Blur Fade — IntersectionObserver-based scroll reveal with blur transition
(function () {
  "use strict";

  const DEFAULTS = {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
    staggerDelay: 120,
  };

  function initBlurFade() {
    const elements = document.querySelectorAll(".blur-fade");
    if (!elements.length) return;

    // Group elements by their parent to enable stagger
    const groups = new Map();

    elements.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) {
        groups.set(parent, []);
      }
      groups.get(parent).push(el);
    });

    // Assign stagger delays within each group
    groups.forEach((children) => {
      children.forEach((el, i) => {
        const customDelay = el.dataset.delay;
        const delay = customDelay
          ? parseInt(customDelay, 10)
          : i * DEFAULTS.staggerDelay;
        el.style.transitionDelay = `${delay}ms`;
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: DEFAULTS.threshold,
        rootMargin: DEFAULTS.rootMargin,
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlurFade);
  } else {
    initBlurFade();
  }
})();
