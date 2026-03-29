<script>
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
function getStyle(variant) {
  const v = variants[variant] || variants.blue;
  return Object.entries(v)
    .map(([k, val]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${val}`)
    .join(";");
}
</script>

<div style="min-height:100vh;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;padding:2rem;font-family:system-ui,-apple-system,sans-serif">
  <h2 style="font-size:1.5rem;font-weight:700;color:#e2e8f0">Shimmer Buttons</h2>
  <p style="color:#525252;font-size:0.875rem">Watch the light sweep across each button</p>
  <div style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center">
    {#each [['blue','Discover More'],['purple','Upgrade Plan'],['dark','Learn More']] as [v,label]}
      <button class="shimmer-btn" style="position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;font-weight:600;letter-spacing:0.01em;cursor:pointer;border:none;outline:none;overflow:hidden;padding:0.875rem 2rem;font-size:0.9375rem;{getStyle(v)}">
        <span class="shimmer-sweep"></span>
        <span style="position:relative;z-index:1">{label}</span>
      </button>
    {/each}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center">
    <button class="shimmer-btn" style="position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;font-weight:600;cursor:pointer;border:none;overflow:hidden;padding:1.125rem 2.75rem;font-size:1.0625rem;{getStyle('emerald')}">
      <span class="shimmer-sweep"></span><span style="position:relative;z-index:1">Get Started Free</span>
    </button>
    <button class="shimmer-btn" style="position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;font-weight:600;cursor:pointer;border:none;overflow:hidden;padding:0.625rem 1.5rem;font-size:0.8125rem;{getStyle('rose')}">
      <span class="shimmer-sweep"></span><span style="position:relative;z-index:1">Buy Now</span>
    </button>
  </div>
</div>

<style>
  @keyframes shimmer-sweep { 0% { left: -100%; } 50%, 100% { left: 100%; } }
  .shimmer-sweep {
    position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(120deg, transparent 0%, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%, transparent 100%);
    animation: shimmer-sweep 3s ease-in-out infinite; pointer-events: none;
  }
  .shimmer-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
  .shimmer-btn { transition: transform 0.2s ease, filter 0.2s ease; }
</style>
