<script>
import { onMount, onDestroy } from "svelte";

export let texts = ["Innovative", "Creative", "Powerful", "Beautiful", "Seamless"];
export let morphDuration = 2000;

let showingA = true;
let aText = texts[0] || "";
let bText = texts[1] || "";
let aOpacity = 1;
let bOpacity = 0;
let index = 0;
let interval;

onMount(() => {
  if (texts.length < 2) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  interval = setInterval(() => {
    index = (index + 1) % texts.length;
    if (showingA) {
      bText = texts[index];
      aOpacity = 0;
      bOpacity = 1;
    } else {
      aText = texts[index];
      aOpacity = 1;
      bOpacity = 0;
    }
    showingA = !showingA;
  }, morphDuration);
});

onDestroy(() => {
  if (interval) clearInterval(interval);
});

const wrapperStyle =
  "position: relative; display: inline-block; filter: url(#morph-blur-svelte) contrast(30);";

const textBaseStyle = `
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    white-space: nowrap; font-size: clamp(2.5rem, 7vw, 5.5rem); font-weight: 900;
    letter-spacing: -0.03em; line-height: 1.1; color: #e8e8e8; transition: opacity 0.6s ease;
  `;

const spacerStyle = `
    position: relative; left: auto; top: auto; transform: none; visibility: hidden;
    white-space: nowrap; font-size: clamp(2.5rem, 7vw, 5.5rem); font-weight: 900;
    letter-spacing: -0.03em; line-height: 1.1; color: #e8e8e8;
  `;
</script>

<div style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem;">
  <div>
    <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
      <defs>
        <filter id="morph-blur-svelte">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>
      </defs>
    </svg>
    <span style={wrapperStyle}>
      <span style={spacerStyle}>{showingA ? aText : bText}</span>
      <span style="{textBaseStyle} opacity: {aOpacity};">{aText}</span>
      <span style="{textBaseStyle} opacity: {bOpacity};">{bText}</span>
    </span>
    <p style="margin-top: 1.5rem; color: #666; font-size: 1rem; position: relative; z-index: 1;">
      Text morphs smoothly between words via SVG blur
    </p>
  </div>
</div>
