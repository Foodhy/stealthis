<script>
export let color = "rgba(139,92,246,0.3)";
export let size = 60;
export let glowColor = "rgba(139,92,246,0.5)";
export let speed = 8;

let wrapperEl;

$: animationCSS = speed
  ? `@keyframes retro-scroll{0%{transform:rotateX(55deg) translateY(0)}100%{transform:rotateX(55deg) translateY(${size}px)}}`
  : "";

$: gridStyle = `position: absolute; inset: 0; transform: rotateX(55deg); transform-origin: 50% 0%; background-image: repeating-linear-gradient(90deg, ${color} 0px, ${color} 1px, transparent 1px, transparent ${size}px), repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent ${size}px); background-size: ${size}px ${size}px; animation: ${speed ? `retro-scroll ${speed}s linear infinite` : "none"};`;

function handleMouseMove(e) {
  if (!wrapperEl) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  wrapperEl.style.perspectiveOrigin = `${50 + x * 10}% ${y * 8}%`;
}

function handleMouseLeave() {
  if (wrapperEl) wrapperEl.style.perspectiveOrigin = "50% 0%";
}
</script>

<svelte:head>
  {#if animationCSS}
    {@html `<style>${animationCSS}</style>`}
  {/if}
</svelte:head>

<div
  style="position: relative; width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(to bottom, #0a0a0a 0%, #0a0a0a 50%, #0d0520 100%); overflow: hidden; font-family: system-ui, -apple-system, sans-serif;"
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
>
  <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 120%; height: 300px; background: radial-gradient(ellipse 50% 80% at 50% 50%, {glowColor}, transparent); opacity: 0.4; pointer-events: none; filter: blur(40px);" />
  <div
    bind:this={wrapperEl}
    style="position: absolute; bottom: 0; left: 0; right: 0; height: 65%; overflow: hidden; perspective: 400px; perspective-origin: 50% 0%;"
  >
    <div style={gridStyle} />
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 40%; background: linear-gradient(to bottom, #0a0a0a 0%, transparent 100%); pointer-events: none; z-index: 1;" />
  </div>
  <div style="position: relative; z-index: 2;">
    <slot>
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-bottom: 10vh;">
        <h1 style="font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; letter-spacing: 0.05em; line-height: 1; color: #fafafa; font-family: system-ui, -apple-system, sans-serif; text-shadow: 0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(139,92,246,0.1);">
          RETRO<span style="color: #a78bfa;">GRID</span>
        </h1>
        <p style="font-size: 1rem; font-weight: 400; color: #71717a; letter-spacing: 0.08em; text-transform: uppercase; font-family: system-ui, -apple-system, sans-serif;">
          Perspective grid with vanishing-point effect
        </p>
        <div style="width: 80px; height: 2px; background: linear-gradient(90deg, transparent, #8b5cf6, transparent); margin-top: 0.5rem;"></div>
      </div>
    </slot>
  </div>
</div>
