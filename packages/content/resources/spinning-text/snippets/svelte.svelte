<script>
export let text = "STEAL THIS COMPONENT * ";
export let radius = 125;
export let duration = 10;

$: chars = text.split("").map((char, i) => ({
  char,
  angle: (360 / text.length) * i,
}));
</script>

<div class="demo">
  <div class="spin-ring" style="width: {radius * 2}px; height: {radius * 2}px;">
    <!-- Center dot -->
    <div class="center-dot"></div>

    <!-- Spinning container -->
    <div class="spin-container" style="--spin-dur: {duration}s;">
      {#each chars as { char, angle }, i}
        <span
          class="char"
          style="transform-origin: 0 {radius}px; transform: rotate({angle}deg);"
        >
          {char}
        </span>
      {/each}
    </div>
  </div>
</div>

<style>
  @keyframes spinText {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .demo {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .spin-ring {
    position: relative;
  }
  .center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: #a78bfa;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 20px #a78bfa, 0 0 40px rgba(167,139,250,0.3);
  }
  .spin-container {
    position: absolute;
    inset: 0;
    animation: spinText var(--spin-dur) linear infinite;
  }
  .char {
    position: absolute;
    left: 50%;
    top: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #e2e8f0;
    text-shadow: 0 0 8px rgba(167,139,250,0.4);
  }
</style>
