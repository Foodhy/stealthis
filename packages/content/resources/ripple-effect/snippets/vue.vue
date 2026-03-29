<script setup>
import { ref, onMounted } from "vue";

const color = "rgba(99, 102, 241, 0.35)";
const duration = 800;

const ripples = ref([]);
let nextId = 0;
const containerEl = ref(null);

onMounted(() => {
  const id = "ripple-effect-keyframes";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @keyframes re-expand {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }
    @keyframes re-ring {
      0% { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});

function handleClick(e) {
  const el = containerEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
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
  ripples.value.push({ id, x, y, size });
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, duration + 200);
}

function ringSize(s, i) {
  return s * (0.5 + i * 0.3);
}
</script>

<template>
  <div style="width:100vw;height:100vh;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;">
    <div
      ref="containerEl"
      @click="handleClick"
      style="position:relative;overflow:hidden;cursor:pointer;width:min(90vw,700px);height:280px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;display:grid;place-items:center;"
    >
      <div style="text-align:center;pointer-events:none;position:relative;z-index:2;">
        <h1 style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#e0e7ff 0%,#818cf8 50%,#6366f1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.5rem;">
          Ripple Effect
        </h1>
        <p style="font-size:1rem;color:rgba(148,163,184,0.7);">Click anywhere on this surface</p>
      </div>
      <span v-for="r in ripples" :key="r.id">
        <span
          :style="{
            position: 'absolute',
            left: (r.x - r.size / 2) + 'px',
            top: (r.y - r.size / 2) + 'px',
            width: r.size + 'px',
            height: r.size + 'px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            transform: 'scale(0)',
            animation: `re-expand ${duration}ms ease-out forwards`,
            pointerEvents: 'none',
            zIndex: 1,
          }"
        />
        <span
          v-for="i in [0, 1, 2]"
          :key="i"
          :style="{
            position: 'absolute',
            left: (r.x - ringSize(r.size, i) / 2) + 'px',
            top: (r.y - ringSize(r.size, i) / 2) + 'px',
            width: ringSize(r.size, i) + 'px',
            height: ringSize(r.size, i) + 'px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            background: 'transparent',
            transform: 'scale(0)',
            animation: `re-ring ${duration * 1.25}ms ease-out ${i * 120}ms forwards`,
            pointerEvents: 'none',
            zIndex: 1,
          }"
        />
      </span>
    </div>
  </div>
</template>
