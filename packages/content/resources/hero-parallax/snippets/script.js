// Hero Parallax — multi-layer scroll-driven parallax
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layers = document.querySelectorAll(".layer[data-speed]");
  if (!layers.length) return;

  let ticking = false;

  function updateLayers() {
    const scrollY = window.scrollY;

    layers.forEach((layer) => {
      const speed = Number.parseFloat(layer.dataset.speed ?? "0");
      if (speed === 0) return; // content layer: no parallax

      const offset = scrollY * speed;
      layer.style.transform = `translateY(${offset}px)`;
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateLayers);
        ticking = true;
      }
    },
    { passive: true }
  );
})();
