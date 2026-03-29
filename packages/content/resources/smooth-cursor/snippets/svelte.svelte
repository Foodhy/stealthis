<script>
import { onMount, onDestroy } from "svelte";

export let dotSize = 8;
export let ringSize = 36;
export let dotColor = "#818cf8";
export let ringColor = "rgba(129, 140, 248, 0.4)";
export let dotSpeed = 0.25;
export let ringSpeed = 0.12;
export let trailSize = 80;
export let trailSpeed = 0.06;

let dotEl, ringEl, trailEl;
let hovering = false;
let visible = false;
let pressing = false;

const mouse = { x: 0, y: 0 };
const dotPos = { x: 0, y: 0 };
const ringPos = { x: 0, y: 0 };
const trailPos = { x: 0, y: 0 };
let animId = 0;

function lerp(a, b, f) {
  return a + (b - a) * f;
}

function animate() {
  dotPos.x = lerp(dotPos.x, mouse.x, dotSpeed);
  dotPos.y = lerp(dotPos.y, mouse.y, dotSpeed);
  ringPos.x = lerp(ringPos.x, mouse.x, ringSpeed);
  ringPos.y = lerp(ringPos.y, mouse.y, ringSpeed);
  trailPos.x = lerp(trailPos.x, mouse.x, trailSpeed);
  trailPos.y = lerp(trailPos.y, mouse.y, trailSpeed);

  if (dotEl) {
    dotEl.style.left = `${dotPos.x}px`;
    dotEl.style.top = `${dotPos.y}px`;
  }
  if (ringEl) {
    ringEl.style.left = `${ringPos.x}px`;
    ringEl.style.top = `${ringPos.y}px`;
  }
  if (trailEl) {
    trailEl.style.left = `${trailPos.x}px`;
    trailEl.style.top = `${trailPos.y}px`;
  }

  animId = requestAnimationFrame(animate);
}

function handleMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (!visible) visible = true;
}
function handleLeave() {
  visible = false;
}
function handleEnter() {
  visible = true;
}
function handleDown() {
  pressing = true;
}
function handleUp() {
  pressing = false;
}

function handleOverCapture(e) {
  if (e.target.closest('a, button, [role="button"], .hoverable')) hovering = true;
}
function handleOutCapture(e) {
  const related = e.relatedTarget;
  if (!related || !related.closest('a, button, [role="button"], .hoverable')) hovering = false;
}

onMount(() => {
  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseleave", handleLeave);
  document.addEventListener("mouseenter", handleEnter);
  document.addEventListener("mousedown", handleDown);
  document.addEventListener("mouseup", handleUp);
  document.addEventListener("mouseover", handleOverCapture, true);
  document.addEventListener("mouseout", handleOutCapture, true);
  animId = requestAnimationFrame(animate);
});

onDestroy(() => {
  cancelAnimationFrame(animId);
  document.removeEventListener("mousemove", handleMove);
  document.removeEventListener("mouseleave", handleLeave);
  document.removeEventListener("mouseenter", handleEnter);
  document.removeEventListener("mousedown", handleDown);
  document.removeEventListener("mouseup", handleUp);
  document.removeEventListener("mouseover", handleOverCapture, true);
  document.removeEventListener("mouseout", handleOutCapture, true);
});

$: hoverDotSize = hovering ? dotSize * 1.5 : dotSize;
$: hoverRingSize = hovering ? ringSize * 1.6 : ringSize;
</script>

<div style="cursor: none;">
  <!-- Cursor dot -->
  <div
    bind:this={dotEl}
    style="
      position: fixed;
      width: {hoverDotSize}px;
      height: {hoverDotSize}px;
      background: {hovering ? '#a78bfa' : dotColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 10001;
      transform: translate(-50%, -50%) scale({pressing ? 1.4 : 1});
      transition: width 0.2s, height 0.2s, background 0.2s, transform 0.15s;
      box-shadow: 0 0 {hovering ? 20 : 10}px {hovering ? 'rgba(167,139,250,0.6)' : dotColor + '80'};
      opacity: {visible ? 1 : 0};
    "
  ></div>

  <!-- Cursor ring -->
  <div
    bind:this={ringEl}
    style="
      position: fixed;
      width: {hoverRingSize}px;
      height: {hoverRingSize}px;
      border: 1.5px solid {hovering ? 'rgba(167,139,250,0.5)' : ringColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%) scale({pressing ? 0.8 : 1});
      transition: width 0.3s, height 0.3s, border-color 0.3s, transform 0.15s;
      opacity: {visible ? 1 : 0};
    "
  ></div>

  <!-- Trail glow -->
  <div
    bind:this={trailEl}
    style="
      position: fixed;
      width: {trailSize}px;
      height: {trailSize}px;
      background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      opacity: {visible ? 1 : 0};
    "
  ></div>

  <!-- Demo content -->
  <div class="demo">
    <div style="text-align: center;">
      <h1 class="heading">Smooth Cursor</h1>
      <p class="subtitle">Move your mouse around — notice the smooth lag</p>
    </div>

    <div class="cards">
      {#each ['Hover Me', 'Hover Me Too'] as title}
        <div class="card hoverable" style="cursor: none;">
          <h3 class="card-title">{title}</h3>
          <p class="card-desc">The cursor ring grows on hover</p>
        </div>
      {/each}
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" class="link hoverable" style="cursor: none;" on:click|preventDefault>
        Interactive Link
      </a>
    </div>
  </div>
</div>

<style>
  .demo {
    width: 100vw;
    height: 100vh;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: #f1f5f9;
    cursor: none;
  }
  .heading {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  .subtitle { font-size: 1rem; color: rgba(148,163,184,0.7); }
  .cards {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }
  .card {
    padding: 1.5rem 2rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    text-align: center;
  }
  .card-title { font-size: 1rem; font-weight: 600; color: #e0e7ff; margin-bottom: 0.25rem; }
  .card-desc { font-size: 0.8rem; color: rgba(148,163,184,0.6); }
  .link {
    color: #818cf8;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }
</style>
