<script>
export let size = 40;
export let color = "rgba(255,255,255,0.08)";
export let strokeWidth = 1;
$: svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><path d='M ${size} 0 L 0 0 0 ${size}' fill='none' stroke='${color}' stroke-width='${strokeWidth}'/></svg>`;
$: encoded = encodeURIComponent(svg).replace(/'/g, "%27");
</script>
<div style="position:relative;width:100%;min-height:100vh;display:grid;place-items:center;background-color:#0a0a0a;background-image:url('data:image/svg+xml,{encoded}');background-size:{size}px {size}px;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 50%,transparent 30%,#0a0a0a 100%);pointer-events:none"></div>
  <div style="position:relative;z-index:1;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem">
    <span style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;padding:0.3rem 0.85rem;border-radius:999px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#a1a1aa">Background</span>
    <h1 style="font-size:2.5rem;font-weight:800;letter-spacing:-0.03em;line-height:1.1;color:#fafafa;font-family:system-ui,-apple-system,sans-serif">Grid Pattern</h1>
    <p style="font-size:1rem;line-height:1.7;color:#71717a;max-width:380px;font-family:system-ui,-apple-system,sans-serif">A minimal SVG-based grid background with customizable size, color, and stroke width.</p>
  </div>
</div>
