<script>
export let beamColor = "#22d3ee";
export let beamSpeed = "4s";
export let borderWidth = 2;

const tags = ["CSS", "Animation", "Gradient"];
</script>

<style>
  @keyframes border-beam-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .outer {
    position: relative;
    border-radius: 1.25rem;
    overflow: hidden;
  }
  .beam {
    position: absolute;
    inset: -50%;
    border-radius: inherit;
    animation: border-beam-rotate var(--beam-speed, 4s) linear infinite;
  }
  .content {
    position: relative;
    z-index: 1;
    background: #0a0a0a;
  }
  .demo {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #0a0a0a;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .card-inner {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #f1f5f9;
  }
  .icon { font-size: 1.75rem; }
  .title {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .desc {
    font-size: 0.9375rem;
    line-height: 1.65;
    color: #94a3b8;
    margin: 0;
  }
  .tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .tag {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #cbd5e1;
  }
</style>

<div class="demo">
  <div class="outer">
    <div
      class="beam"
      style="background: conic-gradient(from 0deg, transparent 0%, transparent 70%, {beamColor} 76%, {beamColor}99 78%, transparent 82%, transparent 100%); --beam-speed: {beamSpeed};"
    ></div>
    <div
      class="content"
      style="margin: {borderWidth}px; border-radius: calc(1.25rem - {borderWidth}px);"
    >
      <div class="card-inner">
        <span class="icon">&#x2728;</span>
        <h2 class="title">Border Beam</h2>
        <p class="desc">
          An animated beam of light travels around the card border using a
          rotating conic-gradient and CSS keyframes.
        </p>
        <div class="tags">
          {#each tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
