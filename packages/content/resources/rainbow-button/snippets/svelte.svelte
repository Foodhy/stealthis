<script lang="ts">
export let filled = false;
export let size: "sm" | "md" | "lg" = "md";
export let rounded = false;
export let speed = "3s";
let className = "";
export { className as class };

const sizeMap = {
  sm: "padding: 0.625rem 1.5rem; font-size: 0.8125rem;",
  md: "padding: 0.875rem 2rem; font-size: 0.9375rem;",
  lg: "padding: 1.125rem 2.75rem; font-size: 1.0625rem;",
};

$: radius = rounded ? "999px" : "12px";
$: innerRadius = rounded ? "999px" : "10px";

$: outerStyle = [
  "position: relative",
  "display: inline-flex",
  "align-items: center",
  "justify-content: center",
  "padding: 2px",
  `border-radius: ${radius}`,
  "border: none",
  "outline: none",
  "cursor: pointer",
  "background: conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, #ff0000)",
  `animation: rainbow-spin ${speed} linear infinite`,
  "transition: transform 0.2s ease, filter 0.2s ease",
  "font-family: system-ui, -apple-system, sans-serif",
].join("; ");

$: labelStyle = [
  "display: block",
  sizeMap[size],
  `border-radius: ${innerRadius}`,
  `background: ${filled ? "transparent" : "#0a0a0a"}`,
  `color: ${filled ? "#fff" : "#f1f5f9"}`,
  "font-weight: 600",
  "letter-spacing: 0.01em",
  `text-shadow: ${filled ? "0 1px 2px rgba(0,0,0,0.4)" : "none"}`,
  "transition: background 0.3s ease",
].join("; ");

function onMouseEnter(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement;
  target.style.transform = "scale(1.04)";
  target.style.filter = "brightness(1.2) hue-rotate(0deg)";
}

function onMouseLeave(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement;
  target.style.transform = "scale(1)";
  target.style.filter = "";
}

function onClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement;
  target.style.animation = "none";
  target.offsetHeight;
  target.style.animation = "";
}
</script>

<button
  class="rainbow-btn-svelte {className}"
  style={outerStyle}
  on:click={onClick}
  on:click
  on:mouseenter={onMouseEnter}
  on:mouseleave={onMouseLeave}
>
  <span style={labelStyle}>
    <slot>Rainbow Button</slot>
  </span>
</button>

<style>
  :global(@keyframes rainbow-spin) {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.rainbow-btn-svelte) { animation: none !important; }
  }
</style>
