<script>
let ripples = [];
let rippleId = 0;

const buttons = [
  { label: "Click Me", variant: "blue", size: "md" },
  { label: "Submit Form", variant: "purple", size: "md" },
  { label: "Confirm Action", variant: "emerald", size: "md" },
  { label: "Ghost Ripple", variant: "ghost", size: "md" },
  { label: "Large Button", variant: "rose", size: "lg" },
  { label: "Small", variant: "amber", size: "sm" },
];

const variantStyles = {
  blue: "background:#3b82f6;color:#fff;box-shadow:0 4px 14px rgba(59,130,246,0.35);",
  purple: "background:#8b5cf6;color:#fff;box-shadow:0 4px 14px rgba(139,92,246,0.35);",
  emerald: "background:#10b981;color:#fff;box-shadow:0 4px 14px rgba(16,185,129,0.35);",
  rose: "background:#f43f5e;color:#fff;box-shadow:0 4px 14px rgba(244,63,94,0.35);",
  ghost: "background:transparent;color:#cbd5e1;border:1.5px solid #334155;",
  amber: "background:#f59e0b;color:#0a0a0a;box-shadow:0 4px 14px rgba(245,158,11,0.35);",
};

const sizeStyles = {
  sm: "padding:0.625rem 1.5rem;font-size:0.8125rem;",
  md: "padding:0.875rem 2rem;font-size:0.9375rem;",
  lg: "padding:1.125rem 2.75rem;font-size:1.0625rem;",
};

function btnStyle(variant, size) {
  return [
    "position:relative;display:inline-flex;align-items:center;justify-content:center;",
    "border-radius:10px;font-weight:600;letter-spacing:0.01em;cursor:pointer;",
    "border:none;outline:none;overflow:hidden;transition:transform 0.15s ease,box-shadow 0.2s ease;",
    sizeStyles[size],
    variantStyles[variant],
  ].join("");
}

function rippleColor(variant) {
  return variant === "ghost" ? "rgba(148,163,184,0.2)" : "rgba(255,255,255,0.35)";
}

function handleClick(e, variant) {
  const rect = e.currentTarget.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const id = ++rippleId;
  ripples = [...ripples, { id, x, y, size, variant }];
  setTimeout(() => {
    ripples = ripples.filter((r) => r.id !== id);
  }, 600);
}

function lift(e) {
  e.currentTarget.style.transform = "translateY(-1px)";
}
function drop(e) {
  e.currentTarget.style.transform = "translateY(0)";
}
</script>

<style>
  @keyframes ripple-expand {
    0%   { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    background: #0a0a0a;
    color: #f1f5f9;
    min-height: 100vh;
  }
  .demo {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
  }
  .demo-title { font-size: 1.5rem; font-weight: 700; color: #e2e8f0; }
  .hint { color: #525252; font-size: 0.875rem; }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }
  .ripple-span {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-expand 0.6s ease-out forwards;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .ripple-span { display: none !important; }
  }
</style>

<div class="demo">
  <h2 class="demo-title">Ripple Buttons</h2>
  <p class="hint">Click the buttons to see the ripple effect</p>

  <div class="row">
    {#each buttons.slice(0, 3) as btn}
      <button
        style={btnStyle(btn.variant, btn.size)}
        on:click={(e) => handleClick(e, btn.variant)}
        on:mouseenter={lift}
        on:mouseleave={drop}
      >
        {btn.label}
        {#each ripples.filter(r => r.variant === btn.variant && ripples.indexOf(r) === ripples.findIndex(x => x.id === r.id)) as r (r.id)}
          <span
            class="ripple-span"
            style="background:{rippleColor(btn.variant)};width:{r.size}px;height:{r.size}px;left:{r.x}px;top:{r.y}px;"
          />
        {/each}
      </button>
    {/each}
  </div>

  <div class="row">
    {#each buttons.slice(3) as btn}
      <button
        style={btnStyle(btn.variant, btn.size)}
        on:click={(e) => handleClick(e, btn.variant)}
        on:mouseenter={lift}
        on:mouseleave={drop}
      >
        {btn.label}
        {#each ripples.filter(r => r.variant === btn.variant && ripples.indexOf(r) === ripples.findIndex(x => x.id === r.id)) as r (r.id)}
          <span
            class="ripple-span"
            style="background:{rippleColor(btn.variant)};width:{r.size}px;height:{r.size}px;left:{r.x}px;top:{r.y}px;"
          />
        {/each}
      </button>
    {/each}
  </div>
</div>
