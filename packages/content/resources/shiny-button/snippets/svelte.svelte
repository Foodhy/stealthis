<script>
let hovered = {};

const variantStyles = {
  blue: { background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" },
  purple: { background: "#8b5cf6", color: "#fff", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" },
  emerald: { background: "#10b981", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" },
  rose: { background: "#f43f5e", color: "#fff", boxShadow: "0 4px 14px rgba(244,63,94,0.3)" },
  dark: {
    background: "#1e293b",
    color: "#fff",
    border: "1px solid #334155",
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  },
  amber: { background: "#f59e0b", color: "#0a0a0a", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" },
  gradient: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
  },
};

const sizeStyles = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

const buttons = [
  { variant: "blue", size: "md", label: "Get Started", row: 1 },
  { variant: "purple", size: "md", label: "Upgrade Now", row: 1 },
  { variant: "dark", size: "md", label: "View Details", row: 1 },
  { variant: "emerald", size: "lg", label: "Download App", row: 2 },
  { variant: "rose", size: "sm", label: "Subscribe", row: 2 },
  { variant: "gradient", size: "md", label: "Premium Access", row: 3 },
  { variant: "amber", size: "md", label: "Go Pro", row: 3 },
];

function toStyle(obj) {
  return Object.entries(obj)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${prop}: ${v}`;
    })
    .join("; ");
}

function btnStyle(variant, size, isHovered) {
  const base = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontWeight: "600",
    letterSpacing: "0.01em",
    cursor: "pointer",
    border: "none",
    outline: "none",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
  return toStyle(base);
}

function shineStyle(isHovered) {
  return toStyle({
    position: "absolute",
    top: "0",
    left: isHovered ? "125%" : "-75%",
    width: "50%",
    height: "100%",
    background:
      "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, rgba(255,255,255,0.05) 80%, transparent 100%)",
    transition: "left 0.5s ease",
    pointerEvents: "none",
  });
}
</script>

<div style="min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
  <h2 style="font-size: 1.5rem; font-weight: 700; color: #e2e8f0;">Shiny Buttons</h2>
  <p style="color: #525252; font-size: 0.875rem;">Hover over the buttons to see the shine effect</p>

  {#each [1, 2, 3] as row}
    <div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
      {#each buttons.filter(b => b.row === row) as btn (btn.label)}
        <button
          style={btnStyle(btn.variant, btn.size, hovered[btn.label])}
          on:mouseenter={() => hovered = { ...hovered, [btn.label]: true }}
          on:mouseleave={() => hovered = { ...hovered, [btn.label]: false }}
        >
          <span style={shineStyle(hovered[btn.label])}></span>
          <span style="position: relative; z-index: 1;">{btn.label}</span>
        </button>
      {/each}
    </div>
  {/each}
</div>
