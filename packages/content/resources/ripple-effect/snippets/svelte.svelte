<script>
import { onMount } from "svelte";

const color = "rgba(99, 102, 241, 0.35)";
const duration = 800;

let ripples = [];
let nextId = 0;
let containerEl;

onMount(() => {
  const id = "ripple-effect-keyframes";
  if (document.getElementById(id)) return;
  const styleEl = document.createElement("style");
  styleEl.id = id;
  styleEl.textContent = `
      @keyframes re-expand {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
      @keyframes re-ring {
        0% { transform: scale(0); opacity: 0.6; }
        100% { transform: scale(1); opacity: 0; }
      }
    `;
  document.head.appendChild(styleEl);
});

function handleClick(e) {
  if (!containerEl) return;
  const rect = containerEl.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const maxDist = Math.max(
    Math.hypot(x, y),
    Math.hypot(rect.width - x, y),
    Math.hypot(x, rect.height - y),
    Math.hypot(rect.width - x, rect.height - y)
  );
  const size = maxDist * 2;
  const id = nextId++;
  ripples = [...ripples, { id, x, y, size }];
  setTimeout(() => {
    ripples = ripples.filter((r) => r.id !== id);
  }, duration + 200);
}
</script>

<div style="width:100vw;height:100vh;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;">
  <div
    bind:this={containerEl}
    on:click={handleClick}
    style="position:relative;overflow:hidden;cursor:pointer;width:min(90vw,700px);height:280px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;display:grid;place-items:center;"
  >
    <div style="text-align:center;pointer-events:none;position:relative;z-index:2;">
      <h1 style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#e0e7ff 0%,#818cf8 50%,#6366f1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.5rem;">
        Ripple Effect
      </h1>
      <p style="font-size:1rem;color:rgba(148,163,184,0.7);">Click anywhere on this surface</p>
    </div>
    {#each ripples as r (r.id)}
      <span>
        <span style="position:absolute;left:{r.x - r.size / 2}px;top:{r.y - r.size / 2}px;width:{r.size}px;height:{r.size}px;border-radius:50%;background:radial-gradient(circle, {color} 0%, transparent 70%);transform:scale(0);animation:re-expand {duration}ms ease-out forwards;pointer-events:none;z-index:1;" />
        {#each [0, 1, 2] as i}
          {@const ringSize = r.size * (0.5 + i * 0.3)}
          <span style="position:absolute;left:{r.x - ringSize / 2}px;top:{r.y - ringSize / 2}px;width:{ringSize}px;height:{ringSize}px;border-radius:50%;border:2px solid {color};background:transparent;transform:scale(0);animation:re-ring {duration * 1.25}ms ease-out {i * 120}ms forwards;pointer-events:none;z-index:1;" />
        {/each}
      </span>
    {/each}
  </div>
</div>
