/* Noise Flow Field — particles steered by a self-contained value-noise vector field.
   Pure vanilla JS: Canvas 2D + requestAnimationFrame + devicePixelRatio scaling. */
(() => {
  "use strict";

  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d", { alpha: false });

  const countEl = document.getElementById("count");
  const scaleEl = document.getElementById("scale");
  const countVal = document.getElementById("count-val");
  const scaleVal = document.getElementById("scale-val");
  const toggleBtn = document.getElementById("toggle");
  const toggleLabel = document.getElementById("toggle-label");
  const resetBtn = document.getElementById("reset");
  const fpsEl = document.getElementById("fps");
  const pcountEl = document.getElementById("pcount");

  // ---- Self-contained 2D value noise (hashed integer lattice + smoothstep) ----
  let seed = (Math.random() * 65536) | 0;

  function hash(x, y) {
    // integer hash -> [0,1)
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  }

  const fade = (t) => t * t * (3 - 2 * t); // smoothstep
  const lerp = (a, b, t) => a + (b - a) * t;

  function valueNoise(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const n00 = hash(x0, y0);
    const n10 = hash(x0 + 1, y0);
    const n01 = hash(x0, y0 + 1);
    const n11 = hash(x0 + 1, y0 + 1);
    return lerp(lerp(n00, n10, fx), lerp(n01, n11, fx), fy);
  }

  // fractal noise for richer, layered flow
  function fbm(x, y) {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    for (let o = 0; o < 3; o++) {
      sum += valueNoise(x * freq, y * freq) * amp;
      freq *= 2;
      amp *= 0.5;
    }
    return sum; // ~[0,1)
  }

  // ---- State ----
  let W = 0,
    H = 0,
    dpr = 1;
  let particles = [];
  let running = true;
  let zStep = 0; // time evolution of the field
  const HUE_BASE = 250; // violet family

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      px: 0,
      py: 0,
      life: 40 + Math.random() * 160,
    };
  }

  function setCount(n) {
    n = Math.round(n);
    if (n < particles.length) {
      particles.length = n;
    } else {
      while (particles.length < n) particles.push(makeParticle());
    }
    pcountEl.textContent = n.toLocaleString("en-US");
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(rect.width * dpr));
    H = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = W;
    canvas.height = H;
    // paint background solid
    ctx.fillStyle = "#07080a";
    ctx.fillRect(0, 0, W, H);
    // reposition any out-of-bounds particles
    for (const p of particles) {
      if (p.x > W || p.y > H) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
      }
    }
  }

  function fieldScale() {
    // slider 1..20 -> noise cell size in pixels (bigger scale value = tighter turbulence)
    return Number(scaleEl.value) / 2200;
  }

  function reset(reseed) {
    if (reseed) {
      seed = (Math.random() * 65536) | 0;
      zStep = 0;
    }
    ctx.fillStyle = "#07080a";
    ctx.fillRect(0, 0, W, H);
    particles = [];
    setCount(Number(countEl.value));
  }

  // ---- Animation loop ----
  let last = performance.now();
  let fpsAccum = 0;
  let fpsFrames = 0;
  let fpsTimer = 0;

  function step(now) {
    const dt = Math.min(now - last, 40);
    last = now;

    // FPS meter (updated ~4x/sec)
    fpsFrames++;
    fpsAccum += dt;
    fpsTimer += dt;
    if (fpsTimer >= 250) {
      const fps = Math.round(1000 / (fpsAccum / fpsFrames));
      fpsEl.textContent = String(fps);
      fpsAccum = 0;
      fpsFrames = 0;
      fpsTimer = 0;
    }

    if (running) {
      // fade previous frame -> trails
      ctx.fillStyle = "rgba(7, 8, 10, 0.055)";
      ctx.fillRect(0, 0, W, H);

      const s = fieldScale();
      const speed = 1.4 * dpr;
      zStep += 0.0009;

      ctx.lineWidth = 1 * dpr;
      ctx.lineCap = "round";

      for (const p of particles) {
        const angle = fbm(p.x * s, p.y * s + zStep) * Math.PI * 4;
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(angle) * speed;
        p.y += Math.sin(angle) * speed;
        p.life--;

        // color drifts with the field direction
        const hue = HUE_BASE + Math.cos(angle) * 55 - 30;
        ctx.strokeStyle = `hsla(${hue}, 85%, 62%, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // respawn when off-screen or aged out
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.life <= 0) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.life = 40 + Math.random() * 160;
        }
      }
    }

    requestAnimationFrame(step);
  }

  // ---- Wiring controls ----
  function paintSlider(el) {
    const min = Number(el.min);
    const max = Number(el.max);
    const pct = ((Number(el.value) - min) / (max - min)) * 100;
    el.style.setProperty("--fill", pct + "%");
  }

  countEl.addEventListener("input", () => {
    countVal.textContent = Number(countEl.value).toLocaleString("en-US");
    paintSlider(countEl);
    setCount(Number(countEl.value));
  });

  scaleEl.addEventListener("input", () => {
    scaleVal.textContent = scaleEl.value;
    paintSlider(scaleEl);
  });

  toggleBtn.addEventListener("click", () => {
    running = !running;
    toggleBtn.setAttribute("aria-pressed", String(running));
    toggleLabel.textContent = running ? "Pause" : "Play";
  });

  resetBtn.addEventListener("click", () => reset(true));

  let resizeRAF = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(resize);
  });

  // ---- Init ----
  countVal.textContent = Number(countEl.value).toLocaleString("en-US");
  scaleVal.textContent = scaleEl.value;
  paintSlider(countEl);
  paintSlider(scaleEl);
  resize();
  setCount(Number(countEl.value));
  requestAnimationFrame((t) => {
    last = t;
    requestAnimationFrame(step);
  });
})();
