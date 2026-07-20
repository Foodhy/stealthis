(() => {
  const svg = document.getElementById("world-svg");
  const readout = document.getElementById("zoom-readout");
  const toolbar = document.querySelector(".map__toolbar");
  if (!svg) return;

  // World extent = the coordinate space the map is drawn in.
  const WORLD = { x: 0, y: 0, w: 1000, h: 500 };
  const MIN_SCALE = 1; // never zoom out past the whole world
  const MAX_SCALE = 8;

  // view = current viewBox. scale === WORLD.w / view.w
  const view = { ...WORLD };

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function apply() {
    // keep the view inside the world extent
    view.x = clamp(view.x, WORLD.x, WORLD.x + WORLD.w - view.w);
    view.y = clamp(view.y, WORLD.y, WORLD.y + WORLD.h - view.h);
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
    if (readout) readout.textContent = `${Math.round((WORLD.w / view.w) * 100)}%`;
  }

  /** Convert a client point to world coordinates under the current viewBox. */
  function toWorld(clientX, clientY) {
    const r = svg.getBoundingClientRect();
    return {
      x: view.x + ((clientX - r.left) / r.width) * view.w,
      y: view.y + ((clientY - r.top) / r.height) * view.h,
    };
  }

  /**
   * Zoom by `factor` keeping the world point currently under (clientX, clientY)
   * anchored to that same screen position.
   */
  function zoomAt(factor, clientX, clientY) {
    const scale = WORLD.w / view.w;
    const next = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
    if (next === scale) return;

    const r = svg.getBoundingClientRect();
    const px = clientX == null ? 0.5 : (clientX - r.left) / r.width;
    const py = clientY == null ? 0.5 : (clientY - r.top) / r.height;
    const anchor = {
      x: view.x + px * view.w,
      y: view.y + py * view.h,
    };

    view.w = WORLD.w / next;
    view.h = WORLD.h / next;
    view.x = anchor.x - px * view.w;
    view.y = anchor.y - py * view.h;
    apply();
  }

  function panBy(dxWorld, dyWorld) {
    view.x += dxWorld;
    view.y += dyWorld;
    apply();
  }

  function reset() {
    Object.assign(view, WORLD);
    apply();
  }

  /* ---------- pointer: drag to pan, two-finger pinch to zoom ---------- */

  const pointers = new Map();
  let dragOrigin = null; // { world, view }
  let pinch = null; // { dist, cx, cy }

  const pointerList = () => [...pointers.values()];

  svg.addEventListener("pointerdown", (e) => {
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svg.classList.add("is-panning");

    if (pointers.size === 1) {
      dragOrigin = { world: toWorld(e.clientX, e.clientY), vx: view.x, vy: view.y };
    } else if (pointers.size === 2) {
      dragOrigin = null;
      pinch = measurePinch();
    }
  });

  function measurePinch() {
    const [a, b] = pointerList();
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
    };
  }

  svg.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2 && pinch) {
      const now = measurePinch();
      zoomAt(now.dist / pinch.dist, now.cx, now.cy);
      // pan with the pinch centroid too
      const r = svg.getBoundingClientRect();
      panBy(
        -((now.cx - pinch.cx) / r.width) * view.w,
        -((now.cy - pinch.cy) / r.height) * view.h,
      );
      pinch = now;
      return;
    }

    if (dragOrigin) {
      const r = svg.getBoundingClientRect();
      // recompute pan so the grabbed world point stays under the cursor
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      view.x = dragOrigin.world.x - px * view.w;
      view.y = dragOrigin.world.y - py * view.h;
      apply();
    }
  });

  function release(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      dragOrigin = null;
      svg.classList.remove("is-panning");
    } else if (pointers.size === 1) {
      const [p] = pointerList();
      dragOrigin = { world: toWorld(p.x, p.y) };
    }
  }

  svg.addEventListener("pointerup", release);
  svg.addEventListener("pointercancel", release);

  /* ---------- wheel zoom ---------- */

  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(factor, e.clientX, e.clientY);
    },
    { passive: false },
  );

  /* ---------- keyboard fallback ---------- */

  svg.addEventListener("keydown", (e) => {
    const step = view.w * 0.12;
    const keys = {
      ArrowLeft: () => panBy(-step, 0),
      ArrowRight: () => panBy(step, 0),
      ArrowUp: () => panBy(0, -step * (WORLD.h / WORLD.w)),
      ArrowDown: () => panBy(0, step * (WORLD.h / WORLD.w)),
      "+": () => zoomAt(1.25),
      "=": () => zoomAt(1.25),
      "-": () => zoomAt(1 / 1.25),
      _: () => zoomAt(1 / 1.25),
      0: reset,
    };
    const fn = keys[e.key];
    if (!fn) return;
    e.preventDefault();
    fn();
  });

  /* ---------- toolbar ---------- */

  toolbar?.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "in") zoomAt(1.35);
    else if (act === "out") zoomAt(1 / 1.35);
    else if (act === "reset") reset();
  });

  /* ---------- city selection ---------- */

  svg.querySelectorAll(".city").forEach((city) => {
    city.addEventListener("click", (e) => {
      e.stopPropagation();
      svg.querySelectorAll(".city.is-active").forEach((c) => c.classList.remove("is-active"));
      city.classList.add("is-active");
    });
  });

  apply();
})();
