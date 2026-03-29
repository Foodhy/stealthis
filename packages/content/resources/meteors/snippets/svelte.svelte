<script>
export let count = 20;

function r(min, max) {
  return Math.random() * (max - min) + min;
}

const meteors = Array.from({ length: count }, (_, i) => ({
  id: i,
  top: r(-10, 80),
  left: r(10, 110),
  duration: r(2, 6),
  delay: r(0, 10),
  length: r(80, 200),
}));
</script>

<div class="meteors-wrapper">
  <div class="stars-bg"></div>
  <div class="meteors-container">
    {#each meteors as m (m.id)}
      <div
        class="meteor"
        style="
          top: {m.top}%;
          left: {m.left}%;
          width: {m.length}px;
          --dur: {m.duration}s;
          --delay: {m.delay}s;
        "
      ></div>
    {/each}
  </div>
  <div class="meteors-content">
    <h1 class="meteors-title">Meteors</h1>
    <p class="meteors-subtitle">Shooting stars streaking across the night sky</p>
  </div>
</div>

<style>
  .meteors-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: grid;
    place-items: center;
    background: linear-gradient(180deg, #0a0a0a 0%, #0f172a 50%, #0a0a0a 100%);
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .stars-bg {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.4) 0%, transparent 100%);
  }

  .meteors-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .meteor {
    position: absolute;
    transform: rotate(215deg);
    height: 1px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(148, 163, 184, 0.3) 20%,
      rgba(255, 255, 255, 0.8) 100%
    );
    opacity: 0;
    animation: meteorFall var(--dur, 3s) linear var(--delay, 0s) infinite;
  }

  .meteor::before {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #fff;
    box-shadow:
      0 0 6px 2px rgba(255, 255, 255, 0.8),
      0 0 12px 4px rgba(148, 163, 184, 0.4);
  }

  .meteor::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 60%;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(148, 163, 184, 0.08) 40%,
      rgba(255, 255, 255, 0.15) 100%
    );
    filter: blur(1px);
  }

  @keyframes meteorFall {
    0% {
      opacity: 0;
      transform: rotate(215deg) translateX(0);
    }
    5% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(215deg) translateX(-120vh);
    }
  }

  .meteors-content {
    position: relative;
    z-index: 10;
    text-align: center;
    pointer-events: none;
  }

  .meteors-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .meteors-subtitle {
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    color: rgba(148, 163, 184, 0.8);
    font-weight: 400;
  }
</style>
