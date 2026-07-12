/* WebGPU Compute Particles
 * GPU physics via a WGSL compute shader with a Canvas 2D fallback.
 * Vanilla JS, no libraries. */
(() => {
  "use strict";

  const canvas = document.getElementById("scene");
  const backendBadge = document.getElementById("backendBadge");
  const backendName = document.getElementById("backendName");
  const countInput = document.getElementById("count");
  const countOut = document.getElementById("countOut");
  const forceInput = document.getElementById("force");
  const forceOut = document.getElementById("forceOut");
  const pauseBtn = document.getElementById("pauseBtn");
  const burstBtn = document.getElementById("burstBtn");
  const fpsEl = document.getElementById("fps");
  const ptsEl = document.getElementById("pts");
  const pathEl = document.getElementById("path");
  const reducedNote = document.getElementById("reducedNote");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Shared simulation state -------------------------------------------------
  const nf = new Intl.NumberFormat("en-US");
  const state = {
    count: parseInt(countInput.value, 10),
    force: parseFloat(forceInput.value),
    paused: reduceMotion,
    // Pointer in normalized device coords [-1,1], y up.
    pointer: { x: 0, y: 0, active: false },
    scatter: 0, // one-shot impulse flag
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    width: 0,
    height: 0,
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, Math.floor(rect.width * state.dpr));
    state.height = Math.max(1, Math.floor(rect.height * state.dpr));
    canvas.width = state.width;
    canvas.height = state.height;
    if (backend && backend.resize) backend.resize();
  }

  // Pointer tracking (normalized, y-up) -------------------------------------
  function setPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    state.pointer.x = Math.max(-1, Math.min(1, nx));
    state.pointer.y = Math.max(-1, Math.min(1, ny));
    state.pointer.active = true;
  }
  canvas.addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY));
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture?.(e.pointerId);
    setPointer(e.clientX, e.clientY);
  });
  canvas.addEventListener("pointerleave", () => {
    state.pointer.active = false;
  });

  // Controls ----------------------------------------------------------------
  function syncFill(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct.toFixed(1) + "%");
  }
  syncFill(countInput);
  syncFill(forceInput);

  countInput.addEventListener("input", () => {
    state.count = parseInt(countInput.value, 10);
    countOut.textContent = nf.format(state.count);
    syncFill(countInput);
    if (backend && backend.reseed) backend.reseed();
  });
  forceInput.addEventListener("input", () => {
    state.force = parseFloat(forceInput.value);
    forceOut.textContent = state.force.toFixed(2) + "×";
    syncFill(forceInput);
  });

  pauseBtn.addEventListener("click", () => {
    state.paused = !state.paused;
    pauseBtn.setAttribute("aria-pressed", String(state.paused));
    pauseBtn.textContent = state.paused ? "Play" : "Pause";
    if (!state.paused) lastTime = performance.now();
  });

  burstBtn.addEventListener("click", () => {
    state.scatter = 1;
  });

  // FPS meter ---------------------------------------------------------------
  let fpsAccum = 0;
  let fpsFrames = 0;
  let lastFpsUpdate = performance.now();
  function tickFps(dt) {
    fpsAccum += dt;
    fpsFrames++;
    const now = performance.now();
    if (now - lastFpsUpdate >= 500) {
      const fps = fpsFrames / (fpsAccum / 1000);
      fpsEl.textContent = fps.toFixed(0);
      fpsAccum = 0;
      fpsFrames = 0;
      lastFpsUpdate = now;
    }
  }

  // ==========================================================================
  //  WebGPU backend
  // ==========================================================================
  const WGSL = /* wgsl */ `
    struct Particle {
      pos : vec2<f32>,
      vel : vec2<f32>,
    };
    struct Sim {
      pointer   : vec2<f32>,
      force     : f32,
      dt        : f32,
      count     : u32,
      active    : f32,
      scatter   : f32,
      _pad      : f32,
    };
    @group(0) @binding(0) var<storage, read_write> parts : array<Particle>;
    @group(0) @binding(1) var<uniform> sim : Sim;

    // cheap hash for the scatter impulse
    fn hash21(p : vec2<f32>) -> f32 {
      var h = dot(p, vec2<f32>(127.1, 311.7));
      return fract(sin(h) * 43758.5453);
    }

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
      let i = gid.x;
      if (i >= sim.count) { return; }
      var p = parts[i];

      if (sim.scatter > 0.5) {
        let a = hash21(vec2<f32>(f32(i), p.pos.x)) * 6.2831853;
        let s = 0.9 + 0.6 * hash21(vec2<f32>(p.pos.y, f32(i)));
        p.vel += vec2<f32>(cos(a), sin(a)) * s;
      }

      // Attraction toward the pointer.
      if (sim.active > 0.5) {
        let to = sim.pointer - p.pos;
        let d2 = max(dot(to, to), 0.0008);
        let dir = to / sqrt(d2);
        let strength = sim.force * 1.6 / (d2 + 0.06);
        p.vel += dir * strength * sim.dt;
      }

      // Mild pull back to center so the field stays bounded.
      p.vel += (-p.pos) * 0.35 * sim.dt;

      // Damping + integrate.
      p.vel *= 0.965;
      p.pos += p.vel * sim.dt;

      // Soft-bounce off the edges.
      if (p.pos.x < -1.0) { p.pos.x = -1.0; p.vel.x = abs(p.vel.x) * 0.6; }
      if (p.pos.x >  1.0) { p.pos.x =  1.0; p.vel.x = -abs(p.vel.x) * 0.6; }
      if (p.pos.y < -1.0) { p.pos.y = -1.0; p.vel.y = abs(p.vel.y) * 0.6; }
      if (p.pos.y >  1.0) { p.pos.y =  1.0; p.vel.y = -abs(p.vel.y) * 0.6; }

      parts[i] = p;
    }
  `;

  const RENDER_WGSL = /* wgsl */ `
    struct Particle {
      pos : vec2<f32>,
      vel : vec2<f32>,
    };
    @group(0) @binding(0) var<storage, read> parts : array<Particle>;

    struct VOut {
      @builtin(position) clip : vec4<f32>,
      @location(0) speed : f32,
    };

    @vertex
    fn vs(@builtin(vertex_index) vi : u32) -> VOut {
      let p = parts[vi];
      var out : VOut;
      out.clip = vec4<f32>(p.pos, 0.0, 1.0);
      out.speed = clamp(length(p.vel) * 2.2, 0.0, 1.0);
      return out;
    }

    @fragment
    fn fs(in : VOut) -> @location(0) vec4<f32> {
      // Cool violet at rest, hot cyan when fast.
      let slow = vec3<f32>(0.545, 0.361, 0.965);
      let fast = vec3<f32>(0.133, 0.827, 0.933);
      let col = mix(slow, fast, in.speed);
      let a = 0.55 + 0.45 * in.speed;
      return vec4<f32>(col * a, a);
    }
  `;

  async function initWebGPU() {
    if (!("gpu" in navigator)) return null;
    let adapter;
    try {
      adapter = await navigator.gpu.requestAdapter();
    } catch (e) {
      return null;
    }
    if (!adapter) return null;

    let device;
    try {
      device = await adapter.requestDevice();
    } catch (e) {
      return null;
    }
    if (!device) return null;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) return null;
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: "premultiplied" });

    // Uniform buffer: pointer.xy, force, dt, count(u32), active, scatter, pad
    const uniformBuffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformData = new ArrayBuffer(32);
    const uf = new Float32Array(uniformData);
    const uu = new Uint32Array(uniformData);

    const computeModule = device.createShaderModule({ code: WGSL });
    const renderModule = device.createShaderModule({ code: RENDER_WGSL });

    const computePipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module: computeModule, entryPoint: "main" },
    });

    const renderPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: renderModule, entryPoint: "vs" },
      fragment: {
        module: renderModule,
        entryPoint: "fs",
        targets: [
          {
            format,
            blend: {
              color: {
                srcFactor: "one",
                dstFactor: "one",
                operation: "add",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one",
                operation: "add",
              },
            },
          },
        ],
      },
      primitive: { topology: "point-list" },
    });

    let particleBuffer = null;
    let computeBind = null;
    let renderBind = null;
    let capacity = 0;

    function allocate(n) {
      if (particleBuffer) particleBuffer.destroy();
      capacity = n;
      const data = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        const r = Math.sqrt(Math.random()) * 0.85;
        const a = Math.random() * Math.PI * 2;
        data[i * 4 + 0] = Math.cos(a) * r;
        data[i * 4 + 1] = Math.sin(a) * r;
        data[i * 4 + 2] = (Math.random() - 0.5) * 0.05;
        data[i * 4 + 3] = (Math.random() - 0.5) * 0.05;
      }
      particleBuffer = device.createBuffer({
        size: data.byteLength,
        usage:
          GPUBufferUsage.STORAGE |
          GPUBufferUsage.VERTEX |
          GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(particleBuffer, 0, data);

      computeBind = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuffer } },
          { binding: 1, resource: { buffer: uniformBuffer } },
        ],
      });
      renderBind = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: particleBuffer } }],
      });
    }

    allocate(state.count);

    return {
      kind: "WebGPU",
      pathLabel: "compute shader",
      reseed() {
        allocate(state.count);
      },
      resize() {
        // ctx already tracks canvas size; nothing extra needed.
      },
      frame(dt) {
        const n = capacity;
        uf[0] = state.pointer.x;
        uf[1] = state.pointer.y;
        uf[2] = state.force;
        uf[3] = dt;
        uu[4] = n;
        uf[5] = state.pointer.active ? 1 : 0;
        uf[6] = state.scatter;
        uf[7] = 0;
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        const encoder = device.createCommandEncoder();

        if (!state.paused) {
          const pass = encoder.beginComputePass();
          pass.setPipeline(computePipeline);
          pass.setBindGroup(0, computeBind);
          pass.dispatchWorkgroups(Math.ceil(n / 64));
          pass.end();
        }

        const view = ctx.getCurrentTexture().createView();
        const rpass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view,
              clearValue: { r: 0.047, g: 0.051, b: 0.063, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        rpass.setPipeline(renderPipeline);
        rpass.setBindGroup(0, renderBind);
        rpass.draw(n);
        rpass.end();

        device.queue.submit([encoder.finish()]);
        state.scatter = 0;
      },
    };
  }

  // ==========================================================================
  //  Canvas 2D fallback (CPU integrator, mirrors the GPU behavior)
  // ==========================================================================
  function initCanvas2D() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let n = 0;
    // Cap the CPU sim so weaker machines stay smooth.
    const CPU_CAP = 9000;

    function allocate(target) {
      n = Math.min(target, CPU_CAP);
      px = new Float32Array(n);
      py = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const r = Math.sqrt(Math.random()) * 0.85;
        const a = Math.random() * Math.PI * 2;
        px[i] = Math.cos(a) * r;
        py[i] = Math.sin(a) * r;
        vx[i] = (Math.random() - 0.5) * 0.05;
        vy[i] = (Math.random() - 0.5) * 0.05;
      }
    }
    allocate(state.count);

    function toScreen(x, y, w, h) {
      return [((x + 1) / 2) * w, ((1 - (y + 1) / 2)) * h];
    }

    return {
      kind: "Canvas 2D",
      pathLabel: "CPU fallback",
      countOverride: () => n,
      reseed() {
        allocate(state.count);
      },
      resize() {},
      frame(dt) {
        const w = state.width;
        const h = state.height;

        if (!state.paused) {
          const doScatter = state.scatter > 0.5;
          const active = state.pointer.active;
          const pxr = state.pointer.x;
          const pyr = state.pointer.y;
          const force = state.force;
          for (let i = 0; i < n; i++) {
            let ax = 0;
            let ay = 0;
            if (doScatter) {
              const a = Math.random() * Math.PI * 2;
              const s = 0.9 + Math.random() * 0.6;
              vx[i] += Math.cos(a) * s;
              vy[i] += Math.sin(a) * s;
            }
            if (active) {
              const tx = pxr - px[i];
              const ty = pyr - py[i];
              const d2 = Math.max(tx * tx + ty * ty, 0.0008);
              const inv = 1 / Math.sqrt(d2);
              const strength = (force * 1.6) / (d2 + 0.06);
              ax += tx * inv * strength;
              ay += ty * inv * strength;
            }
            ax += -px[i] * 0.35;
            ay += -py[i] * 0.35;
            vx[i] = (vx[i] + ax * dt) * 0.965;
            vy[i] = (vy[i] + ay * dt) * 0.965;
            px[i] += vx[i] * dt;
            py[i] += vy[i] * dt;
            if (px[i] < -1) { px[i] = -1; vx[i] = Math.abs(vx[i]) * 0.6; }
            else if (px[i] > 1) { px[i] = 1; vx[i] = -Math.abs(vx[i]) * 0.6; }
            if (py[i] < -1) { py[i] = -1; vy[i] = Math.abs(vy[i]) * 0.6; }
            else if (py[i] > 1) { py[i] = 1; vy[i] = -Math.abs(vy[i]) * 0.6; }
          }
        }

        // Draw with additive blending.
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(12,13,16,1)";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        const size = Math.max(1.2, 1.6 * state.dpr);
        for (let i = 0; i < n; i++) {
          const sp = Math.min(Math.hypot(vx[i], vy[i]) * 2.2, 1);
          const [sx, sy] = toScreen(px[i], py[i], w, h);
          const r = Math.round(139 + (34 - 139) * sp);
          const g = Math.round(92 + (211 - 92) * sp);
          const b = Math.round(246 + (238 - 246) * sp);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.5 + 0.4 * sp})`;
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
        }
        ctx.globalCompositeOperation = "source-over";
        state.scatter = 0;
      },
    };
  }

  // ==========================================================================
  //  Boot + main loop
  // ==========================================================================
  let backend = null;
  let lastTime = performance.now();
  let rafId = 0;

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    // Clamp dt so tab-switches don't launch particles into orbit.
    dt = Math.min(dt, 1 / 30);
    // Fixed-ish step scaled to 60fps for stable physics feel.
    const simDt = Math.min(dt * 60, 2.2);

    backend.frame(simDt);
    tickFps(dt);

    const shown = backend.countOverride
      ? backend.countOverride()
      : state.count;
    ptsEl.textContent = nf.format(shown);
  }

  async function boot() {
    resize();
    window.addEventListener("resize", resize);

    countOut.textContent = nf.format(state.count);
    forceOut.textContent = state.force.toFixed(2) + "×";

    backend = await initWebGPU();
    if (!backend) backend = initCanvas2D();

    if (!backend) {
      backendName.textContent = "unavailable";
      backendBadge.classList.add("cpu");
      pathEl.textContent = "none";
      return;
    }

    const isGpu = backend.kind === "WebGPU";
    backendName.textContent = backend.kind;
    backendBadge.classList.add(isGpu ? "gpu" : "cpu");
    pathEl.textContent = backend.pathLabel;

    if (reduceMotion) {
      state.paused = true;
      pauseBtn.setAttribute("aria-pressed", "true");
      pauseBtn.textContent = "Play";
      reducedNote.hidden = false;
      // Render one static frame so the field is visible.
      backend.frame(0);
    }

    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  boot();

  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
})();
