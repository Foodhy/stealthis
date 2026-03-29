<script>
import { onMount } from "svelte";

export let colors = ["#00ff87", "#7c3aed", "#00d4ff"];
export let speed = "6s";

let canvasRef;

onMount(() => {
  const canvas = canvasRef;
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let t = 0;
  let animationFrameId;

  const defaultColors = [
    "rgba(0, 255, 135, 0.4)",
    "rgba(124, 58, 237, 0.4)",
    "rgba(0, 212, 255, 0.4)",
  ];

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    for (let i = 0; i < 3; i++) {
      const offset = i * 1.2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      for (let x = 0; x <= w; x += 4) {
        const y =
          h * 0.5 +
          Math.sin((x / w) * Math.PI * 2 + t * 0.8 + offset) * 30 +
          Math.sin((x / w) * Math.PI * 3 + t * 1.2 + offset) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      ctx.fillStyle = defaultColors[i];
      ctx.fill();
    }

    t += 0.015;
    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
});
</script>

<div style="min-height:100vh;display:grid;place-items:center;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:2rem;overflow:hidden">
  <div>
    <h1>
      <span style="position:relative;display:inline-block">
        <canvas bind:this={canvasRef} width="600" height="200" style="position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0.3;pointer-events:none;filter:blur(40px)"></canvas>
        <span class="aurora-glow" style="position:absolute;inset:0;z-index:0;filter:blur(28px) brightness(1.5);opacity:0.6;animation-delay:-0.5s;pointer-events:none;user-select:none;background-image:linear-gradient(135deg,{colors[0]} 0%,{colors[1]} 33%,{colors[2]} 66%,{colors[0]} 100%);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:aurora-shift {speed} ease-in-out infinite" aria-hidden="true">
          <span style="font-size:clamp(2.5rem,7vw,5.5rem);font-weight:900;letter-spacing:-0.03em;line-height:1.2">Aurora Borealis</span>
        </span>
        <span class="aurora-text" style="position:relative;z-index:1;background-image:linear-gradient(135deg,{colors[0]} 0%,{colors[1]} 33%,{colors[2]} 66%,{colors[0]} 100%);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:aurora-shift {speed} ease-in-out infinite">
          <span style="font-size:clamp(2.5rem,7vw,5.5rem);font-weight:900;letter-spacing:-0.03em;line-height:1.2">Aurora Borealis</span>
        </span>
      </span>
    </h1>
    <p style="margin-top:1.5rem;color:#666;font-size:1rem;position:relative;z-index:1">Northern lights flowing through text</p>
  </div>
</div>

<style>
  @keyframes aurora-shift {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 0%; }
    50% { background-position: 100% 100%; }
    75% { background-position: 0% 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .aurora-text, .aurora-glow { animation: none !important; }
  }
</style>
