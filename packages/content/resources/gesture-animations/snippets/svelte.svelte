<script>
import { onMount, onDestroy } from "svelte";

/* Hover Scale */
let hoverEl;
let hoverScale = 1;
let hoverTarget = 1;
let hoverRaf = 0;

function hoverTick() {
  hoverScale += (hoverTarget - hoverScale) * 0.12;
  if (Math.abs(hoverScale - hoverTarget) < 0.001) hoverScale = hoverTarget;
  if (hoverEl) hoverEl.style.transform = `scale(${hoverScale})`;
  if (hoverScale !== hoverTarget) hoverRaf = requestAnimationFrame(hoverTick);
}
function hoverStart(t) {
  hoverTarget = t;
  cancelAnimationFrame(hoverRaf);
  hoverRaf = requestAnimationFrame(hoverTick);
}

/* Tap Shrink */
let tapEl;
let tapScale = 1;
let tapTarget = 1;
let tapRaf = 0;

function tapTick() {
  tapScale += (tapTarget - tapScale) * 0.15;
  if (Math.abs(tapScale - tapTarget) < 0.001) tapScale = tapTarget;
  if (tapEl) tapEl.style.transform = `scale(${tapScale})`;
  if (tapScale !== tapTarget) tapRaf = requestAnimationFrame(tapTick);
}
function tapStart(t) {
  tapTarget = t;
  cancelAnimationFrame(tapRaf);
  tapRaf = requestAnimationFrame(tapTick);
}

/* Drag Constrained */
let areaEl;
let dragEl;
let dragState = {
  isDragging: false,
  offX: 0,
  offY: 0,
  originX: 0,
  originY: 0,
  lerpX: 0,
  lerpY: 0,
  targetX: 0,
  targetY: 0,
};
let dragRaf = 0;

function dragReturnTick() {
  dragState.lerpX += (dragState.targetX - dragState.lerpX) * 0.15;
  dragState.lerpY += (dragState.targetY - dragState.lerpY) * 0.15;
  if (
    Math.abs(dragState.lerpX - dragState.targetX) < 0.1 &&
    Math.abs(dragState.lerpY - dragState.targetY) < 0.1
  ) {
    dragState.lerpX = dragState.targetX;
    dragState.lerpY = dragState.targetY;
  }
  if (dragEl)
    dragEl.style.transform = `translate(calc(-50% + ${dragState.lerpX}px), calc(-50% + ${dragState.lerpY}px))`;
  if (dragState.lerpX !== dragState.targetX || dragState.lerpY !== dragState.targetY) {
    dragRaf = requestAnimationFrame(dragReturnTick);
  }
}

function onDragDown(e) {
  dragState.isDragging = true;
  e.target.setPointerCapture(e.pointerId);
  if (areaEl) {
    const rect = areaEl.getBoundingClientRect();
    dragState.originX = rect.left + rect.width / 2;
    dragState.originY = rect.top + rect.height / 2;
  }
  dragState.offX = e.clientX - dragState.originX - dragState.lerpX;
  dragState.offY = e.clientY - dragState.originY - dragState.lerpY;
  cancelAnimationFrame(dragRaf);
}

function onWindowMove(e) {
  if (!dragState.isDragging || !areaEl) return;
  const rect = areaEl.getBoundingClientRect();
  const halfW = rect.width / 2 - 28;
  const halfH = rect.height / 2 - 28;
  let nx = e.clientX - dragState.originX - dragState.offX;
  let ny = e.clientY - dragState.originY - dragState.offY;
  nx = Math.max(-halfW, Math.min(halfW, nx));
  ny = Math.max(-halfH, Math.min(halfH, ny));
  dragState.lerpX = nx;
  dragState.lerpY = ny;
  dragState.targetX = nx;
  dragState.targetY = ny;
  if (dragEl) dragEl.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
}

function onWindowUp() {
  if (!dragState.isDragging) return;
  dragState.isDragging = false;
  dragState.targetX = 0;
  dragState.targetY = 0;
  cancelAnimationFrame(dragRaf);
  dragRaf = requestAnimationFrame(dragReturnTick);
}

/* Focus Glow */
let glowEl;
let glowOp = 0;
let glowTarget = 0;
let glowRot = 0;
let glowRaf = 0;

function glowTick() {
  glowOp += (glowTarget - glowOp) * 0.08;
  glowRot += 1.5;
  if (Math.abs(glowOp - glowTarget) < 0.005 && glowTarget === 0) {
    glowOp = 0;
    if (glowEl) glowEl.style.opacity = "0";
    return;
  }
  if (glowEl) {
    glowEl.style.opacity = String(glowOp);
    glowEl.style.background = `conic-gradient(from ${glowRot}deg, #ec4899, #8b5cf6, #6366f1, #0ea5e9, #10b981, #ec4899)`;
  }
  glowRaf = requestAnimationFrame(glowTick);
}
function glowStart(t) {
  glowTarget = t;
  cancelAnimationFrame(glowRaf);
  glowRaf = requestAnimationFrame(glowTick);
}

onMount(() => {
  window.addEventListener("pointermove", onWindowMove);
  window.addEventListener("pointerup", onWindowUp);
});

onDestroy(() => {
  window.removeEventListener("pointermove", onWindowMove);
  window.removeEventListener("pointerup", onWindowUp);
  cancelAnimationFrame(hoverRaf);
  cancelAnimationFrame(tapRaf);
  cancelAnimationFrame(dragRaf);
  cancelAnimationFrame(glowRaf);
});
</script>

<div class="gesture-wrapper">
  <div class="gesture-panel">
    <div>
      <h2 class="gesture-title">Gesture Animations</h2>
      <p class="gesture-desc">Four gesture types with smooth, interruptible animations</p>
    </div>

    <div class="gesture-grid">
      <!-- Hover Scale -->
      <div class="card">
        <span class="label">Hover Scale</span>
        <div
          bind:this={hoverEl}
          class="hover-box"
          on:mouseenter={() => hoverStart(1.15)}
          on:mouseleave={() => hoverStart(1)}
        >
          &#10022;
        </div>
        <span class="hint">Hover over the card</span>
      </div>

      <!-- Tap Shrink -->
      <div class="card">
        <span class="label">Tap Shrink</span>
        <div
          bind:this={tapEl}
          class="tap-box"
          on:pointerdown={() => tapStart(0.85)}
          on:pointerup={() => tapStart(1)}
          on:pointerleave={() => tapStart(1)}
        >
          &#9670;
        </div>
        <span class="hint">Press and hold</span>
      </div>

      <!-- Drag Constrained -->
      <div class="card">
        <span class="label">Drag Constrained</span>
        <div bind:this={areaEl} class="drag-area">
          <div
            bind:this={dragEl}
            class="drag-box"
            on:pointerdown={onDragDown}
          >
            &#11041;
          </div>
        </div>
        <span class="hint">Drag within the box</span>
      </div>

      <!-- Focus Glow -->
      <div class="card">
        <span class="label">Focus Glow</span>
        <div class="glow-wrap">
          <div bind:this={glowEl} class="glow-ring"></div>
          <input
            type="text"
            placeholder="Click to focus..."
            class="glow-input"
            on:focus={() => glowStart(0.6)}
            on:blur={() => glowStart(0)}
          />
        </div>
        <span class="hint">Focus the input field</span>
      </div>
    </div>
  </div>
</div>

<style>
  .gesture-wrapper {
    min-height: 100vh;
    background: #0a0a0a;
    display: grid;
    place-items: center;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: #e4e4e7;
  }
  .gesture-panel { width: min(560px, 100%); display: flex; flex-direction: column; gap: 1.5rem; }
  .gesture-title { font-size: 1.25rem; font-weight: 700; color: #f4f4f5; }
  .gesture-desc { font-size: 0.8rem; color: #52525b; margin-top: 0.25rem; }
  .gesture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #52525b; }
  .hint { font-size: 0.7rem; color: #3f3f46; text-align: center; }
  .hover-box {
    width: 100px; height: 100px; border-radius: 1rem;
    background: linear-gradient(135deg, #6d28d9, #a78bfa);
    display: grid; place-items: center; font-size: 1.75rem;
    cursor: pointer; will-change: transform;
  }
  .tap-box {
    width: 100px; height: 100px; border-radius: 1rem;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    display: grid; place-items: center; font-size: 1.75rem;
    cursor: pointer; user-select: none; will-change: transform;
  }
  .drag-area {
    width: 100%; height: 120px;
    background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 0.75rem;
    position: relative; overflow: hidden;
  }
  .drag-box {
    width: 48px; height: 48px; border-radius: 0.75rem;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    cursor: grab; will-change: transform; touch-action: none;
    display: grid; place-items: center; font-size: 1.2rem;
  }
  .glow-wrap { width: 100%; position: relative; border-radius: 0.75rem; }
  .glow-ring {
    position: absolute; inset: -2px; border-radius: 0.875rem;
    opacity: 0; pointer-events: none;
    background: conic-gradient(from 0deg, #ec4899, #8b5cf6, #6366f1, #0ea5e9, #10b981, #ec4899);
    filter: blur(8px); will-change: opacity;
  }
  .glow-input {
    width: 100%; padding: 0.75rem 1rem; font-size: 0.85rem;
    font-family: inherit;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.75rem; color: #e4e4e7; outline: none;
    position: relative; z-index: 1;
  }
</style>
