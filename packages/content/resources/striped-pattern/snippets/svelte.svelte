<script>
function labelStyle(color, bg, border) {
  return `display:inline-block;align-self:flex-start;font-size:0.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${color};background:${bg};border:1px solid ${border};padding:0.2rem 0.6rem;border-radius:999px;margin-bottom:0.75rem;`;
}
</script>

<div class="root">
  <div class="grid">
    <!-- Diagonal Stripes -->
    <div class="pattern-card">
      <div class="stripe-bg stripe-diagonal" aria-hidden="true" />
      <div class="content content-end">
        <span style={labelStyle("rgba(139,92,246,0.9)", "rgba(139,92,246,0.1)", "rgba(139,92,246,0.2)")}>Diagonal</span>
        <h2 class="title">135&deg; Stripes</h2>
        <p class="desc">Classic diagonal striped pattern with subtle animation</p>
      </div>
    </div>

    <!-- Horizontal Stripes -->
    <div class="pattern-card">
      <div class="stripe-bg stripe-horizontal" aria-hidden="true" />
      <div class="content content-end">
        <span style={labelStyle("rgba(56,189,248,0.9)", "rgba(56,189,248,0.1)", "rgba(56,189,248,0.2)")}>Horizontal</span>
        <h2 class="title">0&deg; Stripes</h2>
        <p class="desc">Clean horizontal bands with dual-color layering</p>
      </div>
    </div>

    <!-- Crosshatch Stripes -->
    <div class="pattern-card">
      <div class="stripe-bg stripe-crosshatch" aria-hidden="true" />
      <div class="content content-end">
        <span style={labelStyle("rgba(244,63,94,0.9)", "rgba(244,63,94,0.1)", "rgba(244,63,94,0.2)")}>Crosshatch</span>
        <h2 class="title">Layered</h2>
        <p class="desc">Two diagonal gradients composited into a crosshatch</p>
      </div>
    </div>

    <!-- Fine Stripes -->
    <div class="pattern-card">
      <div class="stripe-bg stripe-fine" aria-hidden="true" />
      <div class="content content-end">
        <span style={labelStyle("rgba(34,211,238,0.9)", "rgba(34,211,238,0.1)", "rgba(34,211,238,0.2)")}>Fine</span>
        <h2 class="title">Thin Stripes</h2>
        <p class="desc">Narrow stripes with neon accent overlay</p>
      </div>
    </div>
  </div>
</div>

<style>
  .root {
    min-height: 100vh;
    background: #0a0a0a;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .pattern-card {
    position: relative;
    overflow: hidden;
    border-radius: 1.25rem;
    min-height: 280px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stripe-bg {
    position: absolute;
    inset: 0;
  }

  .stripe-diagonal {
    background: repeating-linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.08) 0px,
      rgba(139, 92, 246, 0.08) 1px,
      transparent 1px,
      transparent 16px
    );
    background-size: 22.63px 22.63px;
    animation: stripe-drift 40s linear infinite;
  }

  .stripe-horizontal {
    background: repeating-linear-gradient(
      0deg,
      rgba(56, 189, 248, 0.06) 0px,
      rgba(56, 189, 248, 0.06) 1px,
      transparent 1px,
      transparent 12px
    );
    background-size: 16.97px 16.97px;
    animation: stripe-drift 40s linear infinite;
  }

  .stripe-crosshatch {
    background:
      repeating-linear-gradient(45deg, rgba(244, 63, 94, 0.06) 0px, rgba(244, 63, 94, 0.06) 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(-45deg, rgba(251, 146, 60, 0.06) 0px, rgba(251, 146, 60, 0.06) 1px, transparent 1px, transparent 20px);
    animation: stripe-cross 40s linear infinite;
  }

  .stripe-fine {
    background: repeating-linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.1) 0px,
      rgba(34, 211, 238, 0.1) 1px,
      transparent 1px,
      transparent 6px
    );
    background-size: 8.49px 8.49px;
    animation: stripe-drift 20s linear infinite;
  }

  .content {
    position: relative;
    z-index: 1;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
  }

  .content-end {
    justify-content: flex-end;
    min-height: 280px;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.02em;
    margin: 0 0 0.375rem;
  }

  .desc {
    font-size: 0.8125rem;
    color: rgba(148, 163, 184, 0.7);
    line-height: 1.5;
    margin: 0;
  }

  @keyframes stripe-drift {
    0% { background-position: 0 0; }
    100% { background-position: 200px 200px; }
  }

  @keyframes stripe-cross {
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 200px 200px, -200px 200px; }
  }
</style>
