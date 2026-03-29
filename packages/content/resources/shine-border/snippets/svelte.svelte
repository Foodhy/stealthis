<script>
export let color1 = "#22d3ee";
export let color2 = "#3b82f6";
export let borderWidth = 2;
export let speed = "3s";
export let borderRadius = "1.25rem";
</script>

<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;padding:2rem">
  <div style="position:relative;border-radius:{borderRadius};overflow:hidden;padding:{borderWidth}px">
    <div class="shine-bg" style="--shine-speed:{speed};position:absolute;inset:-100%;background:conic-gradient(from 0deg,{color1},transparent 25%,transparent 50%,{color2},transparent 75%,{color1})"></div>
    <div style="position:relative;z-index:1;border-radius:calc({borderRadius} - {borderWidth}px);background:#0a0a0a;padding:2rem;display:flex;flex-direction:column;gap:1rem;width:min(400px,calc(100vw - 4rem))">
      <h2 style="font-size:1.375rem;font-weight:700;letter-spacing:-0.02em;color:#f1f5f9;margin:0">Shine Border</h2>
      <p style="font-size:0.9375rem;line-height:1.65;color:#94a3b8;margin:0">A glowing animated border using a rotating gradient that sweeps light around the container edge for a premium look.</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem">
        <span style="font-size:0.75rem;font-weight:600;padding:0.25rem 0.75rem;border-radius:999px;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;text-transform:uppercase;letter-spacing:0.05em">Premium</span>
      </div>
    </div>
  </div>
</div>

<style>
  .shine-bg { animation: shine-border-rotate var(--shine-speed, 3s) linear infinite; }
  @keyframes shine-border-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
