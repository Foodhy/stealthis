<script setup>
import { computed } from "vue";

const props = defineProps({
  rayCount: { type: Number, default: 16 },
  color: { type: String, default: "rgba(251, 191, 36, 0.4)" },
  colorBright: { type: String, default: "rgba(251, 191, 36, 0.15)" },
  glowColor: { type: String, default: "rgba(251, 191, 36, 0.3)" },
  speed: { type: Number, default: 4 },
  intensity: { type: Number, default: 1 },
});

function generateRays(count, intensity) {
  const rays = [];
  for (let i = 0; i < count; i++) {
    const baseAngle = -60 + (120 / (count - 1)) * i;
    rays.push({
      angle: baseAngle + (Math.random() - 0.5) * 8,
      width: Math.random() * 80 + 20,
      opacity: (Math.random() * 0.5 + 0.2) * intensity,
      delay: Math.random() * 4,
      blur: Math.random() * 8 + 2,
    });
  }
  return rays;
}

const rays = computed(() => generateRays(props.rayCount, props.intensity));
const glowFaded = computed(() => props.glowColor.replace(/[\d.]+\)$/, "0.1)"));
</script>

<template>
  <div class="light-rays-demo">
    <!-- Light Rays -->
    <div class="rays-container">
      <div class="rays-inner">
        <!-- Central glow -->
        <div
          class="central-glow"
          :style="{
            background: `radial-gradient(circle, ${props.glowColor} 0%, ${glowFaded} 30%, transparent 70%)`,
          }"
        ></div>

        <div
          v-for="(ray, i) in rays"
          :key="i"
          class="ray"
          :style="{
            width: ray.width + 'px',
            transform: `translateX(-50%) rotate(${ray.angle}deg)`,
            background: `linear-gradient(180deg, ${props.color} 0%, ${props.colorBright} 30%, transparent 80%)`,
            opacity: ray.opacity,
            animation: `rayPulse ${props.speed}s ease-in-out infinite`,
            animationDelay: ray.delay + 's',
            filter: `blur(${ray.blur}px)`,
            '--ray-opacity': ray.opacity,
          }"
        ></div>
      </div>

      <!-- Edge fade overlay -->
      <div class="edge-fade"></div>
    </div>

    <!-- Content -->
    <div class="content">
      <h1 class="title">Light Rays</h1>
      <p class="subtitle">Atmospheric volumetric lighting effect</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes rayPulse {
  0%, 100% { opacity: var(--ray-opacity); }
  50% { opacity: calc(var(--ray-opacity) * 0.3); }
}

.light-rays-demo {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: grid;
  place-items: center;
  position: relative;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}
.rays-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.rays-inner {
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 120%;
}
.central-glow {
  position: absolute;
  top: -5%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(40px);
  z-index: 2;
}
.ray {
  position: absolute;
  top: 0;
  left: 50%;
  height: 100%;
  transform-origin: top center;
}
.edge-fade {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 30%, transparent 20%, #0a0a0a 80%);
  pointer-events: none;
  z-index: 3;
}
.content {
  position: relative;
  z-index: 10;
  text-align: center;
  pointer-events: none;
}
.title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  color: rgba(148, 163, 184, 0.8);
}
</style>
