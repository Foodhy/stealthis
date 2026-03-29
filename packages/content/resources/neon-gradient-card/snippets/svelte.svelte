<script>
export let neonSpeed = "4s";
export let glowSize = 30;
export let borderWidth = 2;
export let borderRadius = "1.25rem";

const gradientColors = "#ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080";

$: outerStyle = `position: relative; border-radius: ${borderRadius}; overflow: visible;`;
$: glowStyle = `position: absolute; inset: -${borderWidth}px; border-radius: ${borderRadius}; background: conic-gradient(from 0deg, ${gradientColors}); animation: neon-hue-shift ${neonSpeed} linear infinite; z-index: 0;`;
$: outerGlowStyle = `position: absolute; inset: -${glowSize}px; border-radius: calc(${borderRadius} + ${glowSize}px); background: conic-gradient(from 0deg, ${gradientColors}); filter: blur(${glowSize}px); opacity: 0.4; animation: neon-hue-shift ${neonSpeed} linear infinite; z-index: -1;`;
$: contentStyle = `position: relative; z-index: 1; margin: ${borderWidth}px; border-radius: calc(${borderRadius} - ${borderWidth}px); background: #0a0a0a;`;
</script>

<style>
  @keyframes neon-hue-shift {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
</style>

<div style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif;">
  <div style={outerStyle}>
    <div style={glowStyle}>
      <div style={outerGlowStyle}></div>
    </div>
    <div style={contentStyle}>
      <div style="padding: 2.5rem; display: flex; flex-direction: column; gap: 1rem; color: #f1f5f9; width: min(400px, calc(100vw - 2rem));">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 1.5rem;">&#x26A1;</span>
          <span style="font-size: 0.6875rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(255,0,128,0.15); border: 1px solid rgba(255,0,128,0.4); color: #ff0080; text-transform: uppercase; letter-spacing: 0.08em;">
            NEW
          </span>
        </div>
        <h2 style="font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; margin: 0;">
          Neon Gradient Card
        </h2>
        <p style="font-size: 0.9375rem; line-height: 1.65; color: #94a3b8; margin: 0;">
          An animated neon glow border that shifts through vivid colors, perfect for eye-catching UI elements.
        </p>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; padding: 0; margin: 0;">
          {#each ["Animated color shifting", "Soft outer glow", "Pure CSS animation"] as feature}
            <li style="font-size: 0.875rem; color: #cbd5e1;">
              <span style="color: #40e0d0; font-weight: 700; margin-right: 0.5rem;">&#x2713;</span>
              {feature}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>
