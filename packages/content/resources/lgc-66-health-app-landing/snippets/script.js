(function () {
  "use strict";

  // ── Billing toggle (monthly ↔ annual) ────────────────────────────
  const toggle       = document.getElementById("billing-toggle");
  const premiumPrice = document.getElementById("premium-price");
  const familyPrice  = document.getElementById("family-price");

  if (toggle) {
    toggle.addEventListener("change", () => {
      const annual = toggle.checked;
      if (premiumPrice) premiumPrice.innerHTML = annual ? "$5.99<span>/mo</span>" : "$9.99<span>/mo</span>";
      if (familyPrice)  familyPrice.innerHTML  = annual ? "$8.99<span>/mo</span>" : "$14.99<span>/mo</span>";
    });
  }

  // ── Stat counters (IntersectionObserver) ─────────────────────────
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    if (reduced || isNaN(target)) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur   = 1800;
    const start = performance.now();
    function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const val = target * ease(t);
      el.textContent = Math.round(val).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsSection = document.getElementById("stats");
  if (statsSection) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".stat-num[data-target]").forEach(animateCounter);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(statsSection);
  }
})();
