<script>
import { onMount } from "svelte";

const cards = [
  {
    id: "card1",
    overlayColor: "#1a1a2e",
    content: {
      icon: "\u{1F389}",
      title: "You Won!",
      code: "STEAL2026",
      sub: "Use this code for 40% off",
      bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)",
      subColor: "rgba(196,181,253,0.8)",
    },
  },
  {
    id: "card2",
    overlayColor: "#0a2f1f",
    content: {
      icon: "\u2B50",
      title: "Secret Message",
      code: null,
      sub: "The best UI components are the ones you steal and make your own.",
      bg: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
      subColor: "rgba(167,243,208,0.8)",
    },
  },
];

let canvasEls = [];
let states = cards.map(() => ({ revealed: false, scratching: false, pct: 0 }));
let drawingState = cards.map(() => ({ isDrawing: false, lastPos: null }));
const W = 380,
  H = 240,
  BRUSH = 40,
  THRESHOLD = 0.55;

function fillOverlay(i) {
  const c = canvasEls[i];
  if (!c) return;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  c.width = W * dpr;
  c.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = cards[i].overlayColor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = 0; x < W; x += 4)
    for (let y = 0; y < H; y += 4) if (Math.random() > 0.5) ctx.fillRect(x, y, 2, 2);
}

function getPos(e, i) {
  const c = canvasEls[i];
  if (!c) return { x: 0, y: 0 };
  const r = c.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - r.left, y: t.clientY - r.top };
}

function scratchAt(i, pos) {
  const c = canvasEls[i];
  if (!c) return;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, BRUSH / 2, 0, Math.PI * 2);
  ctx.fill();
}

function scratchLine(i, from, to) {
  const c = canvasEls[i];
  if (!c) return;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = BRUSH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function getPct(i) {
  const c = canvasEls[i];
  if (!c) return 0;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let t = 0;
  const total = d.length / 4;
  for (let j = 3; j < d.length; j += 4) if (d[j] === 0) t++;
  return t / total;
}

function reset(i) {
  states[i] = { revealed: false, scratching: false, pct: 0 };
  states = states;
  drawingState[i] = { isDrawing: false, lastPos: null };
  setTimeout(() => fillOverlay(i), 10);
}

onMount(() => {
  cards.forEach((_, i) => fillOverlay(i));
  const handlers = cards.map((_, i) => {
    const c = canvasEls[i];
    if (!c) return () => {};
    const onStart = (e) => {
      e.preventDefault();
      if (states[i].revealed) return;
      drawingState[i].isDrawing = true;
      states[i].scratching = true;
      states = states;
      const p = getPos(e, i);
      drawingState[i].lastPos = p;
      scratchAt(i, p);
    };
    const onMove = (e) => {
      e.preventDefault();
      if (!drawingState[i].isDrawing || states[i].revealed) return;
      const p = getPos(e, i);
      if (drawingState[i].lastPos) scratchLine(i, drawingState[i].lastPos, p);
      drawingState[i].lastPos = p;
    };
    const onEnd = () => {
      if (!drawingState[i].isDrawing) return;
      drawingState[i].isDrawing = false;
      drawingState[i].lastPos = null;
      const p = getPct(i);
      states[i].pct = p;
      if (p >= THRESHOLD && !states[i].revealed) states[i].revealed = true;
      states = states;
    };
    c.addEventListener("mousedown", onStart);
    c.addEventListener("mousemove", onMove);
    c.addEventListener("mouseup", onEnd);
    c.addEventListener("mouseleave", onEnd);
    c.addEventListener("touchstart", onStart, { passive: false });
    c.addEventListener("touchmove", onMove, { passive: false });
    c.addEventListener("touchend", onEnd);
    c.addEventListener("touchcancel", onEnd);
    return () => {
      c.removeEventListener("mousedown", onStart);
      c.removeEventListener("mousemove", onMove);
      c.removeEventListener("mouseup", onEnd);
      c.removeEventListener("mouseleave", onEnd);
      c.removeEventListener("touchstart", onStart);
      c.removeEventListener("touchmove", onMove);
      c.removeEventListener("touchend", onEnd);
      c.removeEventListener("touchcancel", onEnd);
    };
  });
  return () => handlers.forEach((fn) => fn());
});
</script>

<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;padding:2rem;gap:2rem;">
  <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#e0e7ff 0%,#818cf8 50%,#6366f1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;line-height:1.2;">Scratch to Reveal</h1>
  <p style="color:rgba(148,163,184,0.8);font-size:1.125rem;margin-top:-0.5rem;">Drag across the card to reveal what's hidden</p>

  <div style="display:flex;gap:2rem;flex-wrap:wrap;justify-content:center;">
    {#each cards as card, i}
      <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:center;">
        <div style="position:relative;width:{W}px;height:{H}px;border-radius:20px;overflow:hidden;cursor:crosshair;user-select:none;-webkit-user-select:none;touch-action:none;box-shadow:0 0 0 1px rgba(255,255,255,0.08),0 20px 60px -15px rgba(0,0,0,0.5);">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2rem;background:{card.content.bg};z-index:1;">
            <span style="font-size:3rem;line-height:1;">{card.content.icon}</span>
            <span style="font-size:1.5rem;font-weight:800;color:#e0e7ff;text-align:center;">{card.content.title}</span>
            {#if card.content.code}
              <span style="background:rgba(255,255,255,0.1);border:1px dashed rgba(255,255,255,0.3);border-radius:8px;padding:0.5rem 1.5rem;font-family:'SF Mono','Fira Code',monospace;font-size:1.25rem;font-weight:700;color:#fbbf24;letter-spacing:0.15em;">{card.content.code}</span>
            {/if}
            <span style="font-size:0.9rem;color:{card.content.subColor};text-align:center;max-width:260px;line-height:1.6;">{card.content.sub}</span>
          </div>
          <canvas bind:this={canvasEls[i]} style="position:absolute;inset:0;width:100%;height:100%;z-index:2;border-radius:20px;opacity:{states[i].revealed ? 0 : 1};transition:opacity 0.6s ease;pointer-events:{states[i].revealed ? 'none' : 'auto'};"></canvas>
          {#if !states[i].scratching && !states[i].revealed}
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;z-index:3;pointer-events:none;">
              <span style="font-size:2rem;color:rgba(255,255,255,0.5);">{"\u270D"}</span>
              <span style="font-size:0.85rem;color:rgba(255,255,255,0.4);font-weight:500;">Scratch here</span>
            </div>
          {/if}
        </div>
        <div style="width:{W}px;height:4px;background:rgba(255,255,255,0.04);border-radius:2px;overflow:hidden;">
          <div style="height:100%;background:#818cf8;border-radius:2px;width:{Math.round(states[i].pct * 100)}%;transition:width 0.1s ease;"></div>
        </div>
        <div style="width:{W}px;display:flex;justify-content:space-between;font-size:0.75rem;color:rgba(148,163,184,0.5);">
          <span>Scratched</span><span>{Math.round(states[i].pct * 100)}%</span>
        </div>
      </div>
    {/each}
  </div>

  <div style="display:flex;gap:1rem;">
    {#each cards as _, i}
      <button on:click={() => reset(i)} style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(148,163,184,0.8);padding:0.6rem 1.5rem;border-radius:10px;font-size:0.875rem;font-weight:500;cursor:pointer;font-family:inherit;">Reset Card {i + 1}</button>
    {/each}
  </div>
</div>
