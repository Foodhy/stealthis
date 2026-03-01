// Metric counters on traction slide
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = prefix + target.toLocaleString() + suffix; return; }
    const obj = { val: 0 };
    const start = performance.now();
    const dur = 1800;
    function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      obj.val = target * ease(t);
      el.textContent = prefix + Math.round(obj.val).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".metric-val").forEach(animateCounter);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  const traction = document.getElementById("slide-traction");
  if (traction) observer.observe(traction);
})();
