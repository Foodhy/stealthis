<script>
export let spotlightColor = "rgba(120, 120, 255, 0.15)";
export let spotlightRadius = 250;

let mouseX = "50%";
let mouseY = "50%";
let isHovered = false;
let cardEl;

function handleMouseMove(e) {
  if (!cardEl) return;
  const rect = cardEl.getBoundingClientRect();
  mouseX = `${e.clientX - rect.left}px`;
  mouseY = `${e.clientY - rect.top}px`;
}

function handleMouseEnter() {
  isHovered = true;
}

function handleMouseLeave() {
  isHovered = false;
  mouseX = "50%";
  mouseY = "50%";
}

$: spotlightStyle = `position: absolute; inset: 0; border-radius: inherit; opacity: ${isHovered ? 1 : 0}; transition: opacity 0.3s ease; background: radial-gradient(${spotlightRadius}px circle at ${mouseX} ${mouseY}, ${spotlightColor}, transparent 100%); pointer-events: none; z-index: 0;`;
$: cardBorder = isHovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)";

const items = [
  {
    icon: "\u2666",
    title: "Interactive",
    body: "Move your mouse over this card to see the spotlight follow your cursor.",
  },
  {
    icon: "\u2733",
    title: "Responsive",
    body: "Each card tracks the cursor independently with its own radial gradient.",
  },
  {
    icon: "\u2726",
    title: "Customizable",
    body: "Adjust colors, radius, and intensity using simple props.",
  },
];
</script>

<div
  style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; padding: 2rem;"
>
  <div
    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; width: min(740px, calc(100vw - 2rem));"
  >
    {#each items as item}
      <div
        bind:this={cardEl}
        on:mousemove={handleMouseMove}
        on:mouseenter={handleMouseEnter}
        on:mouseleave={handleMouseLeave}
        style="position: relative; border-radius: 1rem; overflow: hidden; border: 1px solid {cardBorder}; background: rgba(255, 255, 255, 0.03); cursor: default; transition: border-color 0.3s ease;"
      >
        <div style={spotlightStyle}></div>
        <div style="position: relative; z-index: 1;">
          <div
            style="padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem;"
          >
            <span style="font-size: 1.5rem; color: #818cf8; line-height: 1;">
              {item.icon}
            </span>
            <h3
              style="font-size: 1.125rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.01em; margin: 0;"
            >
              {item.title}
            </h3>
            <p
              style="font-size: 0.875rem; line-height: 1.6; color: #94a3b8; margin: 0;"
            >
              {item.body}
            </p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
