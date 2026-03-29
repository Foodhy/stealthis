<script setup>
const props = withDefaults(defineProps<{
  color1?: string; color2?: string; borderWidth?: number; speed?: string; borderRadius?: string
}>(), { color1: "#22d3ee", color2: "#3b82f6", borderWidth: 2, speed: "3s", borderRadius: "1.25rem" })
</script>

<template>
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;padding:2rem">
    <div :style="{ position:'relative', borderRadius: props.borderRadius, overflow:'hidden', padding: props.borderWidth+'px' }">
      <div class="shine-bg" :style="{ position:'absolute', inset:'-100%', background:`conic-gradient(from 0deg,${props.color1},transparent 25%,transparent 50%,${props.color2},transparent 75%,${props.color1})`, animation:`shine-border-rotate ${props.speed} linear infinite` }"></div>
      <div :style="{ position:'relative', zIndex:1, borderRadius:`calc(${props.borderRadius} - ${props.borderWidth}px)`, background:'#0a0a0a', padding:'2rem', display:'flex', flexDirection:'column', gap:'1rem', width:'min(400px,calc(100vw - 4rem))' }">
        <h2 style="font-size:1.375rem;font-weight:700;letter-spacing:-0.02em;color:#f1f5f9;margin:0">Shine Border</h2>
        <p style="font-size:0.9375rem;line-height:1.65;color:#94a3b8;margin:0">A glowing animated border using a rotating gradient that sweeps light around the container edge for a premium look.</p>
        <div style="display:flex;align-items:center;margin-top:0.5rem">
          <span style="font-size:0.75rem;font-weight:600;padding:0.25rem 0.75rem;border-radius:999px;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;text-transform:uppercase;letter-spacing:0.05em">Premium</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes shine-border-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
