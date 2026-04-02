<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    colors?: [string, string, string];
    speed?: string;
  }>(),
  {
    colors: () => ["#00ff87", "#7c3aed", "#00d4ff"],
    speed: "6s",
  }
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId = 0;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let t = 0;

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
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:2rem">
    <div>
      <h1 style="font-size:clamp(2.5rem,7vw,5.5rem);font-weight:900;letter-spacing:-0.03em;line-height:1.1">
        <span style="position:relative;display:inline-block">
          <canvas ref="canvasRef" width="600" height="200" style="position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0.3;pointer-events:none;filter:blur(40px)"></canvas>
          <span class="aurora-glow" :style="{
            position:'absolute',inset:0,zIndex:0,filter:'blur(28px) brightness(1.5)',opacity:0.6,animationDelay:'-0.5s',pointerEvents:'none',userSelect:'none',
            backgroundImage:`linear-gradient(135deg,${props.colors[0]} 0%,${props.colors[1]} 33%,${props.colors[2]} 66%,${props.colors[0]} 100%)`,
            backgroundSize:'300% 300%',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:`aurora-shift ${props.speed} ease-in-out infinite`
          }" aria-hidden="true">Aurora Borealis</span>
          <span class="aurora-text" :style="{
            position:'relative',zIndex:1,
            backgroundImage:`linear-gradient(135deg,${props.colors[0]} 0%,${props.colors[1]} 33%,${props.colors[2]} 66%,${props.colors[0]} 100%)`,
            backgroundSize:'300% 300%',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:`aurora-shift ${props.speed} ease-in-out infinite`
          }">Aurora Borealis</span>
        </span>
      </h1>
      <p style="margin-top:1.5rem;color:#666;font-size:1rem;position:relative;z-index:1">Northern lights flowing through text</p>
    </div>
  </div>
</template>

<style scoped>
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
