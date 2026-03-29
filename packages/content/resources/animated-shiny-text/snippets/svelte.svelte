<script>
export let shineColor = "rgba(255, 255, 255, 0.9)";
export let speed = "3s";

const badges = [
  { label: "NEW", speed: "3s" },
  { label: "PRO", speed: "3.3s" },
  { label: "PREMIUM", speed: "3.6s" },
];

function shinyStyle(s) {
  return `display: inline-block; line-height: 1.2; background-image: linear-gradient(120deg, #555 0%, #555 40%, ${shineColor} 50%, #555 60%, #555 100%); background-size: 250% 100%; background-position: 100% center; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation-duration: ${s};`;
}
</script>

<div
  style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem;"
>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem;">
    <h1>
      <span class="animated-shiny-text" style={shinyStyle(speed)}>
        <span style="font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.03em;">
          Animated Shiny Text
        </span>
      </span>
    </h1>
    <p style="color: #666; font-size: 1rem;">
      A shimmer highlight sweeps across the text
    </p>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
      {#each badges as badge}
        <span class="animated-shiny-text" style={shinyStyle(badge.speed)}>
          <span
            style="font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; display: inline-block;"
          >
            {badge.label}
          </span>
        </span>
      {/each}
    </div>
  </div>
</div>

<style>
  .animated-shiny-text {
    animation: shine-sweep ease-in-out infinite;
  }
  @keyframes shine-sweep {
    0% { background-position: 100% center; }
    40% { background-position: -100% center; }
    100% { background-position: -100% center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .animated-shiny-text { animation: none !important; background-position: 0% center !important; }
  }
</style>
