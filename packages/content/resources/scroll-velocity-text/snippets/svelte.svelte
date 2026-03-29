<script>
import { onMount, onDestroy } from "svelte";

export let text = [];
export let baseSpeed = 0.5;
export let speedMultiplier = 3;
export let direction = "left";
export let accentIndices = [];
export let style = "";

let trackEl;
let pos = 0;
let halfWidth = 0;
let scrollVel = 0;
let smoothVel = 0;
let lastScroll = 0;
let raf = 0;

$: texts = Array.isArray(text) ? text : [text];
$: allTexts = [...texts, ...texts];
$: dir = direction === "right" ? 1 : -1;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function isAccent(i) {
  return accentIndices.includes(i % texts.length);
}

onMount(() => {
  lastScroll = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    scrollVel = y - lastScroll;
    lastScroll = y;
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  requestAnimationFrame(() => {
    if (trackEl) halfWidth = trackEl.scrollWidth / 2;
  });

  const animate = () => {
    smoothVel = lerp(smoothVel, scrollVel, 0.05);
    scrollVel = lerp(scrollVel, 0, 0.05);

    const absVel = Math.abs(smoothVel);
    const speed = baseSpeed + absVel * speedMultiplier * 0.1;
    const scrollDir = smoothVel >= 0 ? 1 : -1;

    pos += speed * dir * scrollDir;

    if (Math.abs(pos) >= halfWidth && halfWidth > 0) {
      pos = 0;
    }

    if (trackEl) {
      trackEl.style.transform = `translateX(${pos}px)`;
    }

    raf = requestAnimationFrame(animate);
  };

  raf = requestAnimationFrame(animate);

  return () => {
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(raf);
  };
});
</script>

<div style="overflow: hidden; white-space: nowrap; padding: 1.5rem 0; user-select: none; {style}">
  <div bind:this={trackEl} style="display: inline-flex; gap: 2rem; will-change: transform;">
    {#each allTexts as t, i}
      <span
        style="font-size: clamp(3rem, 10vw, 8rem); font-weight: 900; letter-spacing: -0.03em; color: {isAccent(i) ? 'rgba(129, 140, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)'}; text-transform: uppercase; flex-shrink: 0; padding-right: 2rem;"
      >
        {t}
      </span>
    {/each}
  </div>
</div>
