<script>
import { onMount, onDestroy } from "svelte";

export let icons = [
  "\u269B\uFE0F",
  "\u{1F310}",
  "\u26A1",
  "\u{1F4E6}",
  "\u{1F680}",
  "\u{1F3A8}",
  "\u{1F527}",
  "\u{1F4BB}",
  "\u2728",
  "\u{1F50D}",
  "\u{1F4CA}",
  "\u{1F512}",
  "\u2601\uFE0F",
  "\u{1F916}",
  "\u{1F9E9}",
  "\u{1F4A1}",
  "\u{1F525}",
  "\u{1F48E}",
  "\u{1F3AF}",
  "\u{1F30A}",
];
export let rotateSpeed = 0.004;
export let perspective = 500;
export let tiltSensitivity = 0.0003;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

let containerEl;
let iconEls = [];
let animId;
let rot = { y: 0, x: 0 };
let tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };

function generateSpherePoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

function rotatePoint(p, ry, rx) {
  const x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
  const z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
  const y2 = p.y * Math.cos(rx) - z * Math.sin(rx);
  const z2 = p.y * Math.sin(rx) + z * Math.cos(rx);
  return { x, y: y2, z: z2 };
}

$: points = generateSpherePoints(icons.length);

function onMove(e) {
  const rect = containerEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  tilt.targetY = (e.clientX - cx) * tiltSensitivity;
  tilt.targetX = (e.clientY - cy) * tiltSensitivity;
}

function onLeave() {
  tilt.targetX = 0;
  tilt.targetY = 0;
}

function tick() {
  if (!containerEl) return;
  const size = containerEl.clientWidth / 2;
  rot.y += rotateSpeed;

  tilt.x += (tilt.targetX - tilt.x) * 0.05;
  tilt.y += (tilt.targetY - tilt.y) * 0.05;

  const totalRY = rot.y + tilt.y;
  const totalRX = rot.x + tilt.x;

  for (let i = 0; i < points.length; i++) {
    const el = iconEls[i];
    if (!el) continue;

    const rotated = rotatePoint(points[i], totalRY, totalRX);
    const scale = perspective / (perspective + rotated.z * size);
    const px = rotated.x * size * scale;
    const py = rotated.y * size * scale;
    const opacity = Math.max(0.15, (rotated.z + 1) / 2);
    const s = 0.6 + scale * 0.5;

    el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${s})`;
    el.style.opacity = String(opacity);
    el.style.zIndex = String(Math.round(scale * 100));
  }

  animId = requestAnimationFrame(tick);
}

onMount(() => {
  tick();
});

onDestroy(() => {
  if (animId) cancelAnimationFrame(animId);
});
</script>

<div class="icon-cloud-demo">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="cloud-container"
    bind:this={containerEl}
    on:mousemove={onMove}
    on:mouseleave={onLeave}
  >
    {#each icons as icon, i}
      <div class="icon-item" bind:this={iconEls[i]}>
        {icon}
      </div>
    {/each}
  </div>

  <div class="label-area">
    <h1 class="cloud-title">Icon Cloud</h1>
    <p class="cloud-subtitle">Technology icons orbiting in 3D space</p>
  </div>
</div>

<style>
  .icon-cloud-demo {
    width: 100vw;
    height: 100vh;
    background: #0a0a0a;
    display: grid;
    place-items: center;
    position: relative;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .cloud-container {
    position: relative;
    width: 500px;
    height: 500px;
    max-width: 90vmin;
    max-height: 90vmin;
  }

  .icon-item {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 2rem;
    line-height: 1;
    pointer-events: none;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(4px);
    will-change: transform, opacity;
  }

  .label-area {
    position: absolute;
    bottom: 10%;
    left: 0;
    right: 0;
    text-align: center;
    pointer-events: none;
    z-index: 10;
  }

  .cloud-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.5rem;
  }

  .cloud-subtitle {
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    color: rgba(148, 163, 184, 0.8);
    margin: 0;
  }
</style>
