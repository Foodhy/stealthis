<script>
import { onMount, onDestroy } from "svelte";

let stiffnessVal = 180;
let dampingVal = 12;
let massVal = 1;

let areaEl;
let ballEl;
let lineEl;
let velBarEl;

let state = {
  posX: 0,
  posY: 0,
  velX: 0,
  velY: 0,
  isDragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
};

let rafId = null;
let lastTime = 0;

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.032);
  lastTime = now;
  const s = state;

  if (!s.isDragging) {
    const fx = -stiffnessVal * s.posX - dampingVal * s.velX;
    const fy = -stiffnessVal * s.posY - dampingVal * s.velY;
    s.velX += (fx / massVal) * dt;
    s.velY += (fy / massVal) * dt;
    s.posX += s.velX * dt;
    s.posY += s.velY * dt;

    if (
      Math.abs(s.posX) < 0.01 &&
      Math.abs(s.posY) < 0.01 &&
      Math.abs(s.velX) < 0.01 &&
      Math.abs(s.velY) < 0.01
    ) {
      s.posX = 0;
      s.posY = 0;
      s.velX = 0;
      s.velY = 0;
    }
  }

  if (ballEl) {
    ballEl.style.transform = `translate(calc(-50% + ${s.posX}px), calc(-50% + ${s.posY}px))`;
  }

  if (lineEl) {
    const dist = Math.sqrt(s.posX * s.posX + s.posY * s.posY);
    const angle = Math.atan2(s.posY, s.posX) * (180 / Math.PI);
    lineEl.style.width = `${dist}px`;
    lineEl.style.transform = `rotate(${angle}deg)`;
  }

  if (velBarEl) {
    const speed = Math.sqrt(s.velX * s.velX + s.velY * s.velY);
    velBarEl.style.width = `${Math.min(speed / 8, 100)}%`;
  }

  rafId = requestAnimationFrame(loop);
}

function onPointerDown(e) {
  state.isDragging = true;
  state.velX = 0;
  state.velY = 0;
  e.target.setPointerCapture(e.pointerId);

  if (areaEl) {
    const rect = areaEl.getBoundingClientRect();
    state.dragOffsetX = e.clientX - rect.left - rect.width / 2 - state.posX;
    state.dragOffsetY = e.clientY - rect.top - rect.height / 2 - state.posY;
  }
}

function onPointerMove(e) {
  if (!state.isDragging || !areaEl) return;
  const rect = areaEl.getBoundingClientRect();
  state.posX = e.clientX - rect.left - rect.width / 2 - state.dragOffsetX;
  state.posY = e.clientY - rect.top - rect.height / 2 - state.dragOffsetY;
}

function onPointerUp() {
  state.isDragging = false;
}

onMount(() => {
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
});

onDestroy(() => {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
});
</script>

<div style="min-height:100vh;background:#0a0a0a;display:grid;place-items:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#e4e4e7;overflow:hidden">
  <div style="width:min(520px,100%);display:flex;flex-direction:column;gap:1.5rem;align-items:center">
    <div style="text-align:center">
      <h2 style="font-size:1.25rem;font-weight:700;color:#f4f4f5">Spring Physics</h2>
      <p style="font-size:0.8rem;color:#52525b;margin-top:0.25rem">Drag the ball and release -- it springs back with real physics</p>
    </div>

    <div
      bind:this={areaEl}
      style="width:100%;height:340px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:1rem;position:relative;overflow:hidden"
    >
      <!-- Origin dot -->
      <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(109,40,217,0.3);border:2px solid rgba(109,40,217,0.5);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none"></div>
      <!-- Spring line -->
      <div
        bind:this={lineEl}
        style="position:absolute;top:50%;left:50%;transform-origin:0 0;height:2px;background:linear-gradient(90deg,rgba(109,40,217,0.4),rgba(109,40,217,0.1));pointer-events:none;border-radius:1px;width:0"
      ></div>
      <!-- Ball -->
      <div
        bind:this={ballEl}
        on:pointerdown={onPointerDown}
        style="position:absolute;width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#a78bfa,#6d28d9);box-shadow:0 0 30px rgba(109,40,217,0.4),0 0 60px rgba(109,40,217,0.15);top:50%;left:50%;transform:translate(-50%,-50%);cursor:grab;user-select:none;touch-action:none;display:grid;place-items:center;font-size:0.65rem;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.05em"
      >DRAG</div>
    </div>

    <!-- Velocity bar -->
    <div style="width:100%;height:4px;background:rgba(255,255,255,0.04);border-radius:2px;overflow:hidden">
      <div
        bind:this={velBarEl}
        style="height:100%;background:linear-gradient(90deg,#6d28d9,#a78bfa);border-radius:2px;width:0%;transition:width 0.05s"
      ></div>
    </div>

    <!-- Controls -->
    <div style="width:100%;display:flex;flex-direction:column;gap:0.75rem">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <span style="font-size:0.75rem;font-weight:600;color:#71717a;min-width:80px;text-transform:uppercase;letter-spacing:0.06em">Stiffness</span>
        <input type="range" min="20" max="500" bind:value={stiffnessVal} style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;outline:none;-webkit-appearance:none;appearance:none" />
        <span style="font-size:0.75rem;font-weight:600;color:#a78bfa;min-width:40px;text-align:right;font-variant-numeric:tabular-nums">{stiffnessVal}</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem">
        <span style="font-size:0.75rem;font-weight:600;color:#71717a;min-width:80px;text-transform:uppercase;letter-spacing:0.06em">Damping</span>
        <input type="range" min="1" max="40" bind:value={dampingVal} style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;outline:none;-webkit-appearance:none;appearance:none" />
        <span style="font-size:0.75rem;font-weight:600;color:#a78bfa;min-width:40px;text-align:right;font-variant-numeric:tabular-nums">{dampingVal}</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem">
        <span style="font-size:0.75rem;font-weight:600;color:#71717a;min-width:80px;text-transform:uppercase;letter-spacing:0.06em">Mass</span>
        <input type="range" min="1" max="10" bind:value={massVal} style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;outline:none;-webkit-appearance:none;appearance:none" />
        <span style="font-size:0.75rem;font-weight:600;color:#a78bfa;min-width:40px;text-align:right;font-variant-numeric:tabular-nums">{massVal}</span>
      </div>
    </div>
  </div>
</div>
