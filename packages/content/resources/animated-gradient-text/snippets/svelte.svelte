<script>
export let colors = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#ff6b6b"];
export let speed = "3s";

$: gradientColors = colors.join(", ");
</script>

<div
  style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem;"
>
  <div>
    <h1
      class="animated-gradient-text"
      style="--gradient-colors: {gradientColors}; --animation-speed: {speed}; font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; padding-bottom: 0.1em;"
    >
      Animated Gradient Text
    </h1>
    <p style="margin-top: 1.25rem; color: #666; font-size: 1rem;">
      Pure CSS animated gradient flowing through text
    </p>
  </div>
</div>

<style>
  .animated-gradient-text {
    background-image: linear-gradient(90deg, var(--gradient-colors));
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-flow var(--animation-speed) linear infinite;
  }

  @keyframes gradient-flow {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .animated-gradient-text { animation: none !important; }
  }
</style>
