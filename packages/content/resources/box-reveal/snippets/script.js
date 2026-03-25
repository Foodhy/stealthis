// Box Reveal — two-step wipe animation triggered by IntersectionObserver
(function () {
  "use strict";

  const DEFAULTS = {
    threshold: 0.2,
    rootMargin: "0px 0px -20px 0px",
    staggerDelay: 200,
  };

  function initBoxReveal() {
    const elements = document.querySelectorAll(".box-reveal");
    if (!elements.length) return;

    // Group by parent for stagger
    const groups = new Map();

    elements.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) {
        groups.set(parent, []);
      }
      groups.get(parent).push(el);
    });

    // Apply stagger delays
    groups.forEach((children) => {
      children.forEach((el, i) => {
        const customDelay = el.dataset.delay;
        const delay = customDelay
          ? parseInt(customDelay, 10)
          : i * DEFAULTS.staggerDelay;
        if (delay > 0) {
          el.style.animationDelay = `${delay}ms`;
          el.style.setProperty("--stagger", `${delay}ms`);
          // Override the after pseudo-element animation delay
          const duration = parseFloat(
            getComputedStyle(el).getPropertyValue("--box-duration") || "0.7"
          );
          const durationMs = duration * 1000;
          el.style.setProperty(
            "--box-slide-in-delay",
            `${delay}ms`
          );
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const stagger = el.style.getPropertyValue("--stagger");
            if (stagger) {
              setTimeout(() => {
                el.classList.add("is-visible");
              }, parseInt(stagger, 10));
            } else {
              el.classList.add("is-visible");
            }
            observer.unobserve(el);
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
    document.addEventListener("DOMContentLoaded", initBoxReveal);
  } else {
    initBoxReveal();
  }
})();
