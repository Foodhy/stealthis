<script setup>
import { ref } from "vue";

const label = ref("Active users");
const value = ref("24,680");
const delta = ref("+12%");
const note = ref("vs last month");
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;padding:2rem;background:radial-gradient(circle at top, #0f172a 0%, #020617 60%);font-family:Inter, Segoe UI, system-ui, -apple-system, sans-serif">
    <article style="position:relative;width:min(360px, 90vw);padding:28px 26px;border-radius:22px;background:rgba(15,23,42,0.85);border:1px solid rgba(148,163,184,0.2);box-shadow:0 20px 40px rgba(15,23,42,0.35);overflow:hidden">
      <!-- Glow effect -->
      <div style="position:absolute;inset:-30% 10% 40% -10%;background:radial-gradient(circle, rgba(56,189,248,0.35), transparent 60%);filter:blur(24px);z-index:0"></div>
      <!-- Gradient overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(148,163,184,0.12), transparent 55%);opacity:0.6;z-index:0"></div>

      <!-- Content -->
      <div style="position:relative;z-index:1">
        <p style="margin:0 0 12px;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">{{ label }}</p>
        <p style="margin:0 0 14px;font-size:2.4rem;font-weight:700;line-height:1;color:#f8fafc">{{ value }}</p>
        <div style="display:flex;align-items:center;gap:10px;font-size:0.85rem;color:#94a3b8">
          <span style="padding:4px 10px;border-radius:999px;background:rgba(34,197,94,0.15);color:#4ade80;font-weight:600">{{ delta }}</span>
          <span>{{ note }}</span>
        </div>
      </div>
    </article>
  </div>
</template>
