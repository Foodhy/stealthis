<script>
let view = "grid";
let align = "left";
let period = "daily";
let smallVal = "s";

const viewItems = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "board", label: "Board" },
];
const alignItems = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];
const periodItems = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];
const sizeItems = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
];

function getStyle(item, active, i, variant = "default", size = "md") {
  const isActive = active === item.value;
  let bg = "transparent";
  let color = "#94a3b8";
  let fontWeight = 500;
  if (isActive) {
    if (variant === "outline") {
      bg = "#38bdf8";
      color = "#0a0a0a";
      fontWeight = 700;
    } else {
      bg = "rgba(56,189,248,0.12)";
      color = "#38bdf8";
      fontWeight = 600;
    }
  }
  const padY = size === "sm" ? "0.375rem" : "0.5rem";
  const padX = size === "sm" ? "0.75rem" : "1rem";
  const fontSize = size === "sm" ? "0.75rem" : "0.8125rem";
  return `display:inline-flex;align-items:center;gap:0.375rem;padding:${padY} ${padX};border:none;border-left:${i > 0 ? "1px solid #2a2a2a" : "none"};background:${bg};color:${color};font-size:${fontSize};font-weight:${fontWeight};font-family:inherit;cursor:pointer;white-space:nowrap;transition:background 0.15s,color 0.15s;`;
}
</script>

<style>
  .demo {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    font-family: Inter, system-ui, sans-serif;
    color: #f2f6ff;
    padding: 2rem;
  }
  .container { width: 100%; max-width: 520px; }
  h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.375rem; }
  .subtitle { color: #475569; font-size: 0.875rem; margin-bottom: 2rem; }
  .section { margin-bottom: 1.75rem; }
  .section-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.625rem;
  }
  .group {
    display: inline-flex;
    border-radius: 0.625rem;
    overflow: hidden;
    border: 1px solid #2a2a2a;
    background: #141414;
  }
  .group.outline { background: transparent; }
  .selected-text {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: #94a3b8;
  }
  .selected-text strong { color: #38bdf8; }
</style>

<div class="demo">
  <div class="container">
    <h1>Button Group</h1>
    <p class="subtitle">Segmented control style buttons with shared borders.</p>

    <div class="section">
      <span class="section-label">View Mode</span>
      <div class="group">
        {#each viewItems as item, i}
          <button type="button" style={getStyle(item, view, i)} on:click={() => view = item.value}>
            {item.label}
          </button>
        {/each}
      </div>
      <p class="selected-text">Selected: <strong>{view}</strong></p>
    </div>

    <div class="section">
      <span class="section-label">Alignment</span>
      <div class="group">
        {#each alignItems as item, i}
          <button type="button" style={getStyle(item, align, i)} on:click={() => align = item.value}>
            {item.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="section">
      <span class="section-label">Outlined Variant</span>
      <div class="group outline">
        {#each periodItems as item, i}
          <button type="button" style={getStyle(item, period, i, 'outline')} on:click={() => period = item.value}>
            {item.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="section">
      <span class="section-label">Small Size</span>
      <div class="group">
        {#each sizeItems as item, i}
          <button type="button" style={getStyle(item, smallVal, i, 'default', 'sm')} on:click={() => smallVal = item.value}>
            {item.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
