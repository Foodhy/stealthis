<script>
const sizeMap = {
  sm: "padding: 0.625rem 1.5rem; font-size: 0.8125rem;",
  md: "padding: 0.875rem 2rem; font-size: 0.9375rem;",
  lg: "padding: 1.125rem 2.75rem; font-size: 1.0625rem;",
};

function wrapperStyle(rounded) {
  return [
    "position: relative",
    "display: inline-flex",
    "align-items: center",
    "justify-content: center",
    "padding: 2px",
    `border-radius: ${rounded ? "999px" : "12px"}`,
    "border: none",
    "outline: none",
    "cursor: pointer",
    "background: conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, #ff0000)",
    "transition: transform 0.2s ease, filter 0.2s ease",
  ].join("; ");
}

function innerStyle(filled, size, rounded) {
  return [
    "display: block",
    sizeMap[size],
    `border-radius: ${rounded ? "999px" : "10px"}`,
    `background: ${filled ? "transparent" : "#0a0a0a"}`,
    `color: ${filled ? "#fff" : "#f1f5f9"}`,
    "font-weight: 600",
    "letter-spacing: 0.01em",
    `text-shadow: ${filled ? "0 1px 2px rgba(0,0,0,0.4)" : "none"}`,
    "transition: background 0.3s ease",
  ].join("; ");
}

const rows = [
  [
    { label: "Explore Now", filled: false, size: "md", rounded: false },
    { label: "Get Premium", filled: true, size: "md", rounded: false },
  ],
  [
    { label: "Start Your Journey", filled: false, size: "lg", rounded: false },
    { label: "Try Free", filled: true, size: "sm", rounded: false },
  ],
  [
    { label: "Join Community", filled: false, size: "md", rounded: true },
  ],
];

function onMouseEnter(e) {
  e.currentTarget.style.transform = "scale(1.04)";
  e.currentTarget.style.filter = "brightness(1.2)";
}
function onMouseLeave(e) {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.filter = "";
}
</script>

<div style="min-height:100vh;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;padding:2rem;font-family:system-ui,-apple-system,sans-serif">
  <h2 style="font-size:1.5rem;font-weight:700;color:#e2e8f0">Rainbow Buttons</h2>
  <p style="color:#525252;font-size:0.875rem">Animated rainbow gradient borders</p>
  {#each rows as row}
    <div style="display:flex;flex-wrap:wrap;gap:2.5rem;justify-content:center">
      {#each row as btn}
        <button
          class="rainbow-btn"
          style={wrapperStyle(btn.rounded)}
          on:mouseenter={onMouseEnter}
          on:mouseleave={onMouseLeave}
        >
          <span style={innerStyle(btn.filled, btn.size, btn.rounded)}>{btn.label}</span>
        </button>
      {/each}
    </div>
  {/each}
</div>

<style>
  .rainbow-btn {
    animation: rainbow-spin 3s linear infinite;
  }
  @keyframes rainbow-spin {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .rainbow-btn { animation: none !important; }
  }
</style>
