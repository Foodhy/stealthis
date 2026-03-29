<script setup>
const variants = {
  blue: { background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" },
  purple: { background: "#8b5cf6", color: "#fff", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" },
  emerald: { background: "#10b981", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" },
  rose: { background: "#f43f5e", color: "#fff", boxShadow: "0 4px 14px rgba(244,63,94,0.3)" },
  dark: {
    background: "#1e293b",
    color: "#fff",
    border: "1px solid #334155",
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  },
  outline: { background: "transparent", color: "#94a3b8", border: "1.5px solid #334155" },
};
function btnStyle(v, size = "md") {
  const sizes = {
    sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
    md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
    lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
  };
  return {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    outline: "none",
    overflow: "hidden",
    transition: "transform 0.2s ease, filter 0.2s ease",
    ...sizes[size],
    ...variants[v],
  };
}
</script>

<template>
  <div style="min-height:100vh;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;padding:2rem;font-family:system-ui,-apple-system,sans-serif">
    <h2 style="font-size:1.5rem;font-weight:700;color:#e2e8f0">Shimmer Buttons</h2>
    <p style="color:#525252;font-size:0.875rem">Watch the light sweep across each button</p>
    <div style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center">
      <button v-for="[v,label] in [['blue','Discover More'],['purple','Upgrade Plan'],['dark','Learn More']]" :key="v" :style="btnStyle(v)" @mouseenter="e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.filter='brightness(1.1)' }" @mouseleave="e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.filter='brightness(1)' }">
        <span class="shimmer-sweep"></span><span style="position:relative;z-index:1">{{ label }}</span>
      </button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center">
      <button :style="btnStyle('emerald','lg')"><span class="shimmer-sweep"></span><span style="position:relative;z-index:1">Get Started Free</span></button>
      <button :style="btnStyle('rose','sm')"><span class="shimmer-sweep"></span><span style="position:relative;z-index:1">Buy Now</span></button>
    </div>
  </div>
</template>

<style scoped>
  @keyframes shimmer-sweep { 0% { left: -100%; } 50%, 100% { left: 100%; } }
  .shimmer-sweep { position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(120deg,transparent 0%,transparent 30%,rgba(255,255,255,0.25) 45%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.25) 55%,transparent 70%,transparent 100%);animation:shimmer-sweep 3s ease-in-out infinite;pointer-events:none; }
</style>
