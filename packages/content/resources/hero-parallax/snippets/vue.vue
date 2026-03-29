<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const starsRef = ref(null);
const orbsRef = ref(null);

let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    if (starsRef.value) starsRef.value.style.transform = `translateY(${y * 0.2}px)`;
    if (orbsRef.value) orbsRef.value.style.transform = `translateY(${y * 0.5}px)`;
    ticking = false;
  });
}

onMounted(() => {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", onScroll, { passive: true });
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div style="background:#030712;color:#f1f5f9;font-family:system-ui,-apple-system,sans-serif">
    <!-- Hero -->
    <section style="position:relative;height:100vh;overflow:hidden;display:grid;place-items:center">
      <!-- Stars layer -->
      <div ref="starsRef" style="position:absolute;inset:-20%;will-change:transform">
        <div style="width:100%;height:100%;opacity:0.6;background-image:radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 100%),radial-gradient(1px 1px at 60% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),radial-gradient(2px 2px at 40% 75%, rgba(255,255,255,0.5) 0%, transparent 100%),radial-gradient(1px 1px at 90% 25%, rgba(255,255,255,0.7) 0%, transparent 100%);background-size:500px 400px"></div>
      </div>

      <!-- Orbs layer -->
      <div ref="orbsRef" style="position:absolute;inset:-20%;will-change:transform">
        <div style="position:absolute;width:500px;height:400px;top:10%;left:5%;border-radius:50%;background:rgba(56,189,248,0.2);filter:blur(80px)"></div>
        <div style="position:absolute;width:450px;height:380px;bottom:15%;right:5%;border-radius:50%;background:rgba(168,85,247,0.2);filter:blur(80px)"></div>
      </div>

      <!-- Content -->
      <div style="position:relative;z-index:10;text-align:center;padding:0 2rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem;max-width:48rem">
        <p style="font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#38bdf8">Open Source</p>
        <h1 style="font-size:clamp(2.5rem,7vw,4.5rem);font-weight:800;line-height:1.1;letter-spacing:-0.02em;margin:0;background:linear-gradient(to bottom,white,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
          Build beautiful<br/>web experiences
        </h1>
        <p style="color:#64748b;font-size:1.125rem;line-height:1.6;max-width:28rem;margin:0">
          Reusable web resources &#8212; animations, pages, components, and patterns. All open source.
        </p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-top:0.5rem">
          <a href="#" style="padding:0.75rem 1.75rem;border-radius:1rem;background:#0ea5e9;color:white;font-weight:600;font-size:1rem;text-decoration:none;box-shadow:0 0 24px rgba(14,165,233,0.4)">Browse Library</a>
          <a href="#" style="padding:0.75rem 1.75rem;border-radius:1rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;font-weight:600;font-size:1rem;text-decoration:none">View Docs</a>
        </div>
      </div>
    </section>

    <div style="min-height:60vh;display:grid;place-items:center;color:#475569;font-size:1.125rem">
      Scroll up to see the parallax effect &uarr;
    </div>
  </div>
</template>
