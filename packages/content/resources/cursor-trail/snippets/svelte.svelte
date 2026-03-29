<script>
import { onMount, onDestroy } from "svelte";

const colorSchemes = {
  purple: { base: [167, 139, 250], label: "Purple", hex: "#a78bfa" },
  cyan: { base: [34, 211, 238], label: "Cyan", hex: "#22d3ee" },
  rose: { base: [251, 113, 133], label: "Rose", hex: "#fb7185" },
  green: { base: [74, 222, 128], label: "Green", hex: "#4ade80" },
};

let config = { count: 20, size: 12, speed: 15, color: "purple" };
let canvasEl;
let dots = [];
let points = [];
let mouse = { x: 0, y: 0 };
let raf;

const sliders = [
  { key: "count", label: "Count", min: 5, max: 40 },
  { key: "size", label: "Size", min: 4, max: 24 },
  { key: "speed", label: "Speed", min: 5, max: 40 },
];

function createDots() {
  if (!canvasEl) return;
  dots.forEach((d) => d.remove());
  dots = [];
  points = [];
  const { count, size, color } = config;
  const [r, g, b] = colorSchemes[color].base;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const dotSize = size * (1 - t * 0.7);
    const opacity = 1 - t * 0.85;
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.borderRadius = "50%";
    el.style.pointerEvents = "none";
    el.style.willChange = "transform";
    el.style.zIndex = "5";
    el.style.width = dotSize + "px";
    el.style.height = dotSize + "px";
    el.style.background = `rgba(${r},${g},${b},${opacity})`;
    el.style.boxShadow = `0 0 ${dotSize * 1.5}px rgba(${r},${g},${b},${opacity * 0.5})`;
    canvasEl.appendChild(el);
    dots.push(el);
    points.push({ x: mouse.x, y: mouse.y });
  }
}

function animate() {
  const { speed, size } = config;
  const ease = speed / 100;
  if (points.length > 0) {
    points[0].x += (mouse.x - points[0].x) * ease;
    points[0].y += (mouse.y - points[0].y) * ease;
  }
  for (let i = 1; i < points.length; i++) {
    points[i].x += (points[i - 1].x - points[i].x) * (ease * 0.85);
    points[i].y += (points[i - 1].y - points[i].y) * (ease * 0.85);
  }
  for (let i = 0; i < dots.length; i++) {
    const t = i / dots.length;
    const dotSize = size * (1 - t * 0.7);
    dots[i].style.transform =
      `translate(${points[i].x - dotSize / 2}px, ${points[i].y - dotSize / 2}px)`;
  }
  raf = requestAnimationFrame(animate);
}

function onMouseMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}

function updateSlider(key, value) {
  config = { ...config, [key]: Number(value) };
  createDots();
}

function setColor(key) {
  config = { ...config, color: key };
  createDots();
}

onMount(() => {
  createDots();
  raf = requestAnimationFrame(animate);
  window.addEventListener("mousemove", onMouseMove);
});

onDestroy(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("mousemove", onMouseMove);
  dots.forEach((d) => d.remove());
});
</script>

<div class="cursor-trail-root" on:mousemove={onMouseMove}>
  <div class="bg-grid"></div>
  <div class="info">
    <h2>Cursor Trail</h2>
    <p>Move your mouse around — dots follow with lerp interpolation</p>
  </div>
  <div class="controls">
    {#each sliders as { key, label, min, max }}
      <div class="slider-group">
        <span class="slider-label">{label}</span>
        <input type="range" {min} {max} value={config[key]}
          on:input={(e) => updateSlider(key, e.target.value)} />
      </div>
    {/each}
    <div class="slider-group">
      <span class="slider-label">Color</span>
      {#each Object.entries(colorSchemes) as [key, { hex }]}
        <button class="color-btn"
          style="background: {hex}; border: 2px solid {config.color === key ? '#fff' : 'transparent'};"
          on:click={() => setColor(key)}></button>
      {/each}
    </div>
  </div>
  <div bind:this={canvasEl}></div>
</div>

<style>
  .cursor-trail-root { min-height: 100vh; background: #0a0a0a; overflow: hidden; cursor: none; }
  .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
  .info { position: fixed; top: 2rem; left: 50%; transform: translateX(-50%); text-align: center; z-index: 10; pointer-events: none; }
  .info h2 { font-size: 1.25rem; font-weight: 700; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
  .info p { font-size: 0.8rem; color: #52525b; margin-top: 0.25rem; font-family: system-ui, -apple-system, sans-serif; }
  .controls { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; z-index: 10; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 0.75rem 1.25rem; cursor: default; font-family: system-ui, -apple-system, sans-serif; }
  .slider-group { display: flex; align-items: center; gap: 0.5rem; }
  .slider-label { font-size: 0.65rem; font-weight: 600; color: #52525b; text-transform: uppercase; letter-spacing: 0.06em; }
  input[type="range"] { width: 80px; -webkit-appearance: none; appearance: none; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none; }
  .color-btn { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; transition: border-color 0.15s, transform 0.15s; padding: 0; }
</style>
