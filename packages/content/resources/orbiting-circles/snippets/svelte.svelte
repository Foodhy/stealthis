<script>
import { onMount } from "svelte";

let rings = [
  {
    items: [{ content: "♦" }, { content: "♣" }],
    radius: 80,
    duration: 8,
  },
  {
    items: [{ content: "★" }, { content: "♥" }, { content: "✦" }],
    radius: 130,
    duration: 15,
    reverse: true,
  },
  {
    items: [{ content: "☼" }, { content: "✶" }, { content: "✿" }, { content: "☾" }],
    radius: 190,
    duration: 22,
  },
];

$: containerSize = Math.max(...rings.map((r) => r.radius)) * 2 + 60;

onMount(() => {
  const styleId = "orbiting-circles-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        @keyframes oc-counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        ${rings
          .map(
            (_, ri) => `
          @keyframes oc-orbit-${ri} {
            from { transform: rotate(var(--start-angle, 0deg)) translateX(var(--radius, 100px)); }
            to { transform: rotate(calc(var(--start-angle, 0deg) + 360deg)) translateX(var(--radius, 100px)); }
          }
        `
          )
          .join("")}
      `;
    document.head.appendChild(style);
  }
});

function getItemSize(radius) {
  return radius > 150 ? 42 : 36;
}

function getFontSize(radius) {
  return radius > 150 ? 16 : 14;
}
</script>

<div style="
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
">
  <!-- Orbiting component -->
  <div style="position: relative; width: {containerSize}px; height: {containerSize}px;">
    <!-- Center -->
    <div style="
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: grid; place-items: center; color: white;
      box-shadow: 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2);
      z-index: 10;
    ">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>

    <!-- Ring guides -->
    {#each rings as ring}
      <div style="
        position: absolute; top: 50%; left: 50%;
        width: {ring.radius * 2}px; height: {ring.radius * 2}px;
        transform: translate(-50%, -50%); border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.06); pointer-events: none;
      " />
    {/each}

    <!-- Orbiting items -->
    {#each rings as ring, ri}
      {#each ring.items as item, ii}
        {@const startAngle = (360 / ring.items.length) * ii}
        {@const dir = ring.reverse ? "reverse" : "normal"}
        {@const size = getItemSize(ring.radius)}
        {@const animName = `oc-orbit-${ri}`}
        <div style="
          position: absolute; top: 50%; left: 50%;
          width: {size}px; height: {size}px;
          margin-left: {-size / 2}px; margin-top: {-size / 2}px;
          border-radius: 50%; display: grid; place-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          animation: {animName} {ring.duration}s linear infinite {dir};
          --start-angle: {startAngle}deg;
          --radius: {ring.radius}px;
        ">
          <span style="
            font-size: {getFontSize(ring.radius)}px;
            color: rgba(199,210,254,0.9);
            line-height: 1;
            animation: oc-counter-spin {ring.duration}s linear infinite {dir};
          ">
            {item.content}
          </span>
        </div>
      {/each}
    {/each}
  </div>

  <!-- Title -->
  <div style="text-align: center;">
    <h1 style="
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #e0e7ff 0%, #a78bfa 50%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    ">Orbiting Circles</h1>
    <p style="font-size: 1rem; color: rgba(148,163,184,0.7);">
      Pure CSS orbital animation with multiple rings
    </p>
  </div>
</div>
