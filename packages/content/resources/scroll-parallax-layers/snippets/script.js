// Parallax Layers — scroll progress drives per-layer translate + scale.
(function () {
  const scroller = document.getElementById("scroller");
  const stage = document.getElementById("stage");
  const bar = document.getElementById("progress");
  const pct = document.getElementById("pct");
  if (!scroller || !stage) return;

  const layers = Array.from(stage.querySelectorAll(".layer")).map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth) || 0,
    scale: parseFloat(el.dataset.scale) || 0,
  }));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;
  let progress = 0;

  function measure() {
    const max = scroller.scrollHeight - scroller.clientHeight;
    progress = max > 0 ? scroller.scrollTop / max : 0;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
  }

  function render() {
    ticking = false;
    const travel = stage.clientHeight * 0.55; // px of movement at depth 1
    const amount = reduced.matches ? 0 : progress;

    for (const l of layers) {
      const y = -amount * travel * l.depth;
      const s = 1 + amount * l.scale;
      l.el.style.transform =
        "translate3d(0," + y.toFixed(2) + "px,0) scale(" + s.toFixed(4) + ")";
    }

    const p = Math.round(progress * 100);
    if (bar) bar.value = p;
    if (pct) pct.textContent = p + "%";
    stage.style.setProperty("--progress", progress.toFixed(4));
  }

  function onScroll() {
    measure();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  scroller.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  if (reduced.addEventListener) reduced.addEventListener("change", onScroll);

  // Keyboard fallback: the scroller is focusable, drive it explicitly so the
  // behavior is identical without a wheel or touch surface.
  scroller.addEventListener("keydown", (e) => {
    const page = scroller.clientHeight * 0.9;
    const step = 80;
    const map = {
      ArrowDown: step,
      ArrowUp: -step,
      PageDown: page,
      PageUp: -page,
    };
    if (e.key in map) {
      scroller.scrollTop += map[e.key];
    } else if (e.key === "Home") {
      scroller.scrollTop = 0;
    } else if (e.key === "End") {
      scroller.scrollTop = scroller.scrollHeight;
    } else {
      return;
    }
    e.preventDefault();
  });

  onScroll();
})();
