<script>
export let spacing = 24;
export let radius = 1;
export let color = "rgba(255,255,255,0.15)";
export let bg = "#0a0a0a";

let glowX = 0;
let glowY = 0;
let glowVisible = false;

function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  glowX = e.clientX - rect.left;
  glowY = e.clientY - rect.top;
  glowVisible = true;
}

function handleMouseLeave() {
  glowVisible = false;
}
</script>

<div
  class="dot-container"
  style="
    background-color: {bg};
    background-image: radial-gradient(circle, {color} {radius}px, transparent {radius}px);
    background-size: {spacing}px {spacing}px;
  "
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
>
  <div class="dot-fade" style="background: radial-gradient(ellipse 70% 50% at 50% 50%, transparent 20%, {bg} 100%);"></div>
  <div
    class="dot-glow"
    style="
      opacity: {glowVisible ? 1 : 0};
      left: {glowX}px;
      top: {glowY}px;
    "
  ></div>
  <div class="dot-content">
    <slot>
      <div class="demo-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8">
          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          <circle cx="5" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="5" r="1"/>
          <circle cx="19" cy="5" r="1"/><circle cx="5" cy="19" r="1"/><circle cx="19" cy="19" r="1"/>
        </svg>
        <h1 class="demo-title">Dot Pattern</h1>
        <p class="demo-desc">Repeating dot background using radial-gradient, fully customizable with CSS custom properties.</p>
        <div class="demo-tags">
          {#each ['CSS', 'radial-gradient', 'pattern'] as tag}
            <span class="demo-tag">{tag}</span>
          {/each}
        </div>
      </div>
    </slot>
  </div>
</div>

<style>
  .dot-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .dot-fade {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .dot-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    z-index: 0;
  }
  .dot-content {
    position: relative;
    z-index: 1;
  }
  .demo-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }
  .demo-title {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #fafafa;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .demo-desc {
    font-size: 1rem;
    line-height: 1.7;
    color: #71717a;
    max-width: 380px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .demo-tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .demo-tag {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.2);
    color: #a5b4fc;
  }
</style>
