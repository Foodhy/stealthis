(() => {
  const path = document.getElementById("morphPath");
  const label = document.getElementById("shapeLabel");
  const range = document.getElementById("progress");
  const rangeVal = document.getElementById("progressVal");
  const chips = [...document.querySelectorAll(".chip")];
  if (!path) return;

  const CX = 100, CY = 100, R = 70, N = 16; // shared segment count => compatible paths

  // radius(i) for each shape, sampled at the same N angles.
  const shapes = {
    circle: () => R,
    blob: (i) => R * (0.8 + 0.22 * Math.sin(i * 1.5) + 0.1 * Math.cos(i * 3)),
    star: (i) => (i % 2 === 0 ? R : R * 0.42),
    square: (i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const c = Math.abs(Math.cos(a)) || 1e-6;
      const s = Math.abs(Math.sin(a)) || 1e-6;
      return Math.min(R / c, R / s, R * 1.35);
    },
  };

  // Closed Catmull-Rom -> cubic Bezier, returned as a flat number array.
  function build(fn) {
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const r = fn(i);
      pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]);
    }
    const nums = [pts[0][0], pts[0][1]];
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i - 1 + N) % N], p1 = pts[i];
      const p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      nums.push(
        p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
        p2[0], p2[1]
      );
    }
    return nums;
  }

  const toD = (n) => {
    let d = `M ${n[0].toFixed(2)} ${n[1].toFixed(2)}`;
    for (let i = 2; i < n.length; i += 6) {
      d += " C " + n.slice(i, i + 6).map((v) => v.toFixed(2)).join(" ");
    }
    return d + " Z";
  };

  const cache = {};
  for (const key of Object.keys(shapes)) cache[key] = build(shapes[key]);

  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let from = cache.blob, to = cache.blob, t = 1, raf = null;

  function render() {
    path.setAttribute("d", toD(lerp(from, to, ease(t))));
    const pct = Math.round(t * 100);
    range.value = String(pct);
    rangeVal.textContent = pct + "%";
  }
  render();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function morphTo(name, btn) {
    chips.forEach((c) => {
      const on = c === btn;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    label.textContent = btn.textContent.trim();

    from = lerp(from, to, ease(t)); // start from what is currently on screen
    to = cache[name];
    t = 0;

    if (raf) cancelAnimationFrame(raf);
    if (reduced.matches) { t = 1; render(); return; }

    const start = performance.now();
    const dur = 700;
    const step = (now) => {
      t = Math.min(1, (now - start) / dur);
      render();
      raf = t < 1 ? requestAnimationFrame(step) : null;
    };
    raf = requestAnimationFrame(step);
  }

  chips.forEach((btn) => btn.addEventListener("click", () => morphTo(btn.dataset.shape, btn)));

  range.addEventListener("input", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    t = Number(range.value) / 100;
    render();
  });
})();
