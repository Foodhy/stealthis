(() => {
  "use strict";

  const stage = document.getElementById("stage");
  const scene = document.getElementById("scene");
  const layers = Array.from(scene.querySelectorAll(".layer"));
  const rmNote = document.getElementById("rmNote");

  const depthInput = document.getElementById("depth");
  const dofInput = document.getElementById("dof");
  const tiltInput = document.getElementById("tilt");
  const depthOut = document.getElementById("depthOut");
  const dofOut = document.getElementById("dofOut");
  const tiltOut = document.getElementById("tiltOut");

  const reduceBtn = document.getElementById("reduce");
  const resetBtn = document.getElementById("reset");
  const modeBtns = Array.from(document.querySelectorAll(".mode-btn"));

  const modeVal = document.getElementById("modeVal");
  const offVal = document.getElementById("offVal");
  const fpsVal = document.getElementById("fpsVal");

  // Precompute per-layer depth + baseline filter so we never re-read DOM in the loop.
  const layerData = layers.map((el) => {
    const depth = parseFloat(el.dataset.depth) || 0;
    return { el, depth };
  });
  const maxDepth = Math.max(...layerData.map((l) => l.depth)) || 1;

  const settings = {
    depth: 1,
    dof: 1,
    tilt: 1,
    mode: "pointer", // "pointer" | "scroll"
    reduced: false,
  };

  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

  // target = where input wants layers to be; current = spring-smoothed value.
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  let rafId = null;
  let running = false;

  // ---------- input handlers ----------
  function setTargetFromPointer(clientX, clientY) {
    const r = stage.getBoundingClientRect();
    const nx = ((clientX - r.left) / r.width) * 2 - 1; // -1..1
    const ny = ((clientY - r.top) / r.height) * 2 - 1;
    target.x = clamp(nx, -1, 1);
    target.y = clamp(ny, -1, 1);
  }

  function onPointerMove(e) {
    if (settings.mode !== "pointer" || settings.reduced) return;
    setTargetFromPointer(e.clientX, e.clientY);
  }

  function onPointerLeave() {
    if (settings.mode !== "pointer") return;
    target.x = 0;
    target.y = 0;
  }

  function onTouchMove(e) {
    if (settings.mode !== "pointer" || settings.reduced) return;
    if (!e.touches || !e.touches[0]) return;
    setTargetFromPointer(e.touches[0].clientX, e.touches[0].clientY);
  }

  function onScroll() {
    if (settings.mode !== "scroll" || settings.reduced) return;
    // Map the stage's position within the viewport to a -1..1 vertical field.
    const r = stage.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const center = r.top + r.height / 2;
    const progress = center / vh; // ~1 near bottom, ~0 near top
    target.y = clamp((0.5 - progress) * 2, -1, 1);
    target.x = clamp(target.y * 0.35, -1, 1); // gentle horizontal drift
  }

  // Device orientation gives touch users real parallax without a pointer.
  function onOrient(e) {
    if (settings.mode !== "pointer" || settings.reduced) return;
    if (e.gamma == null || e.beta == null) return;
    target.x = clamp(e.gamma / 30, -1, 1);
    target.y = clamp((e.beta - 45) / 30, -1, 1);
  }

  // ---------- render ----------
  function applyLayers(x, y) {
    const dep = settings.depth;
    const dof = settings.dof;
    const tilt = settings.tilt;

    for (let i = 0; i < layerData.length; i++) {
      const { el, depth } = layerData[i];
      // Nearer layers (higher depth) translate further — that's the parallax.
      const shift = depth * 26 * dep;
      const tx = -x * shift;
      const ty = -y * shift * 0.7;
      const rot = x * depth * 1.1 * tilt; // subtle z-rotation, depth-scaled
      const scale = 1 + depth * 0.02 * dep;

      // Far layers get blur + desaturation; near layers stay crisp.
      const norm = depth / maxDepth; // 0..1
      const blur = (1 - norm) * 3.2 * dof;
      const sat = 0.72 + norm * 0.28;

      el.style.transform =
        "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0) " +
        "rotate(" + rot.toFixed(3) + "deg) " +
        "scale(" + scale.toFixed(4) + ")";
      el.style.filter = "blur(" + blur.toFixed(2) + "px) saturate(" + sat.toFixed(2) + ")";
    }
  }

  // ---------- animation loop with spring smoothing ----------
  let lastFpsT = performance.now();
  let frames = 0;

  function tick(now) {
    // critically-damped-ish easing toward target
    const k = 0.12;
    current.x += (target.x - current.x) * k;
    current.y += (target.y - current.y) * k;

    applyLayers(current.x, current.y);

    offVal.textContent = current.x.toFixed(2) + ", " + current.y.toFixed(2);

    frames++;
    if (now - lastFpsT >= 500) {
      fpsVal.textContent = Math.round((frames * 1000) / (now - lastFpsT));
      frames = 0;
      lastFpsT = now;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (running) return;
    running = true;
    lastFpsT = performance.now();
    frames = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    fpsVal.textContent = "—";
  }

  // ---------- reduced-motion resting pose ----------
  function renderResting() {
    target.x = 0;
    target.y = 0;
    current.x = 0;
    current.y = 0;
    applyLayers(0, 0);
    offVal.textContent = "0.00, 0.00";
  }

  function applyReducedState() {
    if (settings.reduced) {
      stopLoop();
      renderResting();
      rmNote.hidden = false;
      stage.style.cursor = "default";
    } else {
      rmNote.hidden = true;
      stage.style.cursor = settings.mode === "pointer" ? "crosshair" : "default";
      startLoop();
    }
  }

  // ---------- controls ----------
  function syncSlider(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const val = parseFloat(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");
  }

  function bindSlider(input, out, key) {
    const update = () => {
      settings[key] = parseFloat(input.value);
      out.textContent = settings[key].toFixed(1) + "×";
      syncSlider(input);
      if (settings.reduced) applyLayers(0, 0); // reflect DOF/blur while resting
    };
    input.addEventListener("input", update);
    update();
  }

  bindSlider(depthInput, depthOut, "depth");
  bindSlider(dofInput, dofOut, "dof");
  bindSlider(tiltInput, tiltOut, "tilt");

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode === settings.mode) return;
      settings.mode = mode;
      modeBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-checked", active ? "true" : "false");
      });
      modeVal.textContent = mode;
      // reset field so the switch reads cleanly
      target.x = 0;
      target.y = 0;
      if (mode === "scroll") onScroll();
      if (!settings.reduced) {
        stage.style.cursor = mode === "pointer" ? "crosshair" : "default";
      }
    });
  });

  reduceBtn.addEventListener("click", () => {
    settings.reduced = !settings.reduced;
    reduceBtn.setAttribute("aria-pressed", settings.reduced ? "true" : "false");
    applyReducedState();
  });

  resetBtn.addEventListener("click", () => {
    depthInput.value = "1";
    dofInput.value = "1";
    tiltInput.value = "1";
    [depthInput, dofInput, tiltInput].forEach(syncSlider);
    settings.depth = 1;
    settings.dof = 1;
    settings.tilt = 1;
    depthOut.textContent = "1.0×";
    dofOut.textContent = "1.0×";
    tiltOut.textContent = "1.0×";
    target.x = 0;
    target.y = 0;
    if (settings.reduced) applyLayers(0, 0);
  });

  // ---------- keyboard: nudge the scene when stage is focused ----------
  stage.addEventListener("keydown", (e) => {
    if (settings.reduced) return;
    const step = 0.15;
    let handled = true;
    switch (e.key) {
      case "ArrowLeft": target.x = clamp(target.x - step, -1, 1); break;
      case "ArrowRight": target.x = clamp(target.x + step, -1, 1); break;
      case "ArrowUp": target.y = clamp(target.y - step, -1, 1); break;
      case "ArrowDown": target.y = clamp(target.y + step, -1, 1); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });

  // ---------- wire input listeners ----------
  stage.addEventListener("pointermove", onPointerMove, { passive: true });
  stage.addEventListener("pointerleave", onPointerLeave, { passive: true });
  stage.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  if (window.DeviceOrientationEvent) {
    // Only auto-listen when permission isn't gated (non-iOS). iOS needs a user
    // gesture + requestPermission, which we skip to stay self-contained.
    if (typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", onOrient, { passive: true });
    }
  }

  // ---------- init ----------
  function init() {
    settings.reduced = mql.matches;
    reduceBtn.setAttribute("aria-pressed", settings.reduced ? "true" : "false");
    applyReducedState();
    if (!settings.reduced && settings.mode === "scroll") onScroll();
  }

  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", (e) => {
      settings.reduced = e.matches;
      reduceBtn.setAttribute("aria-pressed", settings.reduced ? "true" : "false");
      applyReducedState();
    });
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  init();
})();
