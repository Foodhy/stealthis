<script>
export let rayCount = 16;
export let color = "rgba(251, 191, 36, 0.4)";
export let colorBright = "rgba(251, 191, 36, 0.15)";
export let glowColor = "rgba(251, 191, 36, 0.3)";
export let speed = 4;
export let intensity = 1;

function generateRays(count, intensity) {
  const rays = [];
  for (let i = 0; i < count; i++) {
    const baseAngle = -60 + (120 / (count - 1)) * i;
    rays.push({
      angle: baseAngle + (Math.random() - 0.5) * 8,
      width: Math.random() * 80 + 20,
      opacity: (Math.random() * 0.5 + 0.2) * intensity,
      delay: Math.random() * 4,
      blur: Math.random() * 8 + 2,
    });
  }
  return rays;
}

$: rays = generateRays(rayCount, intensity);
$: glowFaded = glowColor.replace(/[\d.]+\)$/, "0.1)");
</script>

<div
  style="width: 100vw; height: 100vh; background: #0a0a0a; display: grid; place-items: center; position: relative; font-family: system-ui, -apple-system, sans-serif; overflow: hidden;"
>
  <!-- Light Rays -->
  <div style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;">
    <div
      style="position: absolute; top: -10%; left: 50%; transform: translateX(-50%); width: 100%; height: 120%;"
    >
      <!-- Central glow -->
      <div
        style="position: absolute; top: -5%; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, {glowColor} 0%, {glowFaded} 30%, transparent 70%); filter: blur(40px); z-index: 2;"
      ></div>

      {#each rays as ray, i}
        <div
          style="position: absolute; top: 0; left: 50%; width: {ray.width}px; height: 100%; transform-origin: top center; transform: translateX(-50%) rotate({ray.angle}deg); background: linear-gradient(180deg, {color} 0%, {colorBright} 30%, transparent 80%); opacity: {ray.opacity}; animation: rayPulse {speed}s ease-in-out infinite; animation-delay: {ray.delay}s; filter: blur({ray.blur}px); --ray-opacity: {ray.opacity};"
        ></div>
      {/each}
    </div>

    <!-- Edge fade overlay -->
    <div
      style="position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 30%, transparent 20%, #0a0a0a 80%); pointer-events: none; z-index: 3;"
    ></div>
  </div>

  <!-- Content -->
  <div style="position: relative; z-index: 10; text-align: center; pointer-events: none;">
    <h1
      style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;"
    >
      Light Rays
    </h1>
    <p
      style="font-size: clamp(0.875rem, 2vw, 1.125rem); color: rgba(148, 163, 184, 0.8);"
    >
      Atmospheric volumetric lighting effect
    </p>
  </div>
</div>

<style>
  @keyframes rayPulse {
    0%, 100% { opacity: var(--ray-opacity); }
    50% { opacity: calc(var(--ray-opacity) * 0.3); }
  }
</style>
