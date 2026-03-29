<script>
import { onDestroy } from "svelte";

const zoom = 2.5;
const lensSize = 160;
const lerpFactor = 0.15;
const borderColor = "rgba(139, 92, 246, 0.5)";

let areaEl;
let lensEl;
let contentEl;
let active = false;

let cloneNode = null;
let mouse = { x: 0, y: 0 };
let pos = { x: 0, y: 0 };
let isActive = false;
let animId = null;

function updateClone() {
  if (!areaEl || !lensEl || !contentEl) return;
  if (cloneNode) cloneNode.remove();
  const clone = contentEl.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.width = areaEl.clientWidth + "px";
  clone.style.height = areaEl.clientHeight + "px";
  clone.style.transform = `scale(${zoom})`;
  clone.style.transformOrigin = "0 0";
  clone.style.pointerEvents = "none";
  clone.style.top = "0";
  clone.style.left = "0";
  lensEl.appendChild(clone);
  cloneNode = clone;
}

function tickLoop() {
  if (!areaEl || !lensEl) return;
  const rect = areaEl.getBoundingClientRect();
  const relX = mouse.x - rect.left;
  const relY = mouse.y - rect.top;

  pos.x += (relX - pos.x) * lerpFactor;
  pos.y += (relY - pos.y) * lerpFactor;

  lensEl.style.left = pos.x + "px";
  lensEl.style.top = pos.y + "px";

  if (cloneNode) {
    cloneNode.style.transform = `scale(${zoom})`;
    cloneNode.style.left = -(pos.x * zoom - lensSize / 2) + "px";
    cloneNode.style.top = -(pos.y * zoom - lensSize / 2) + "px";
  }

  if (isActive) {
    animId = requestAnimationFrame(tickLoop);
  }
}

function onEnter() {
  isActive = true;
  active = true;
  updateClone();
  animId = requestAnimationFrame(tickLoop);
}

function onMove(e) {
  mouse = { x: e.clientX, y: e.clientY };
}

function onLeave() {
  isActive = false;
  active = false;
  if (animId) cancelAnimationFrame(animId);
}

const hues = [260, 280, 300, 320, 200, 220, 240, 180, 160];

onDestroy(() => {
  if (animId) cancelAnimationFrame(animId);
});
</script>

<div style="width:100vw;height:100vh;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;font-family:system-ui,-apple-system,sans-serif">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    bind:this={areaEl}
    on:mouseenter={onEnter}
    on:mousemove={onMove}
    on:mouseleave={onLeave}
    style="position:relative;overflow:hidden;cursor:none;border-radius:16px;border:1px solid rgba(255,255,255,0.08)"
  >
    <div bind:this={contentEl} style="position:relative;width:100%;height:100%">
      <div style="width:min(600px,90vw);height:min(400px,60vh);background:#111;position:relative">
        <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px);background-size:20px 20px"></div>
        <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center">
          <h2 style="font-size:1.5rem;font-weight:700;color:#e2e8f0;margin-bottom:0.75rem">Hover to Magnify</h2>
          <p style="font-size:0.875rem;color:rgba(148,163,184,0.7);max-width:400px;line-height:1.6;margin-bottom:1.5rem">
            Move your cursor over this area to see the lens effect in action.
          </p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            {#each hues as hue, i}
              <div style="width:48px;height:48px;border-radius:8px;background:hsl({hue} 60% 50% / 0.3);border:1px solid hsl({hue} 60% 60% / 0.2)"></div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div
      bind:this={lensEl}
      style="position:absolute;width:{lensSize}px;height:{lensSize}px;border-radius:50%;border:2px solid {borderColor};box-shadow:0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.05);pointer-events:none;opacity:{active ? 1 : 0};transition:opacity 0.2s ease;overflow:hidden;z-index:100;transform:translate(-50%,-50%);background:#111"
    >
      <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1) 0%, transparent 50%);pointer-events:none;z-index:10"></div>
    </div>
  </div>

  <div style="text-align:center;pointer-events:none">
    <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 50%,#7c3aed 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.5rem">
      Lens Effect
    </h1>
    <p style="font-size:clamp(0.875rem,2vw,1.125rem);color:rgba(148,163,184,0.8)">
      Magnifying glass that follows your cursor
    </p>
  </div>
</div>
