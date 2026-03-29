// Animate result counters when they enter the viewport
const resultNums = document.querySelectorAll(".result-num");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const isDecimal = !Number.isInteger(target);
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  },
  { threshold: 0.3 }
);

resultNums.forEach((el) => observer.observe(el));
