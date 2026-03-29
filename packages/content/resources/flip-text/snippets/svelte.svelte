<script>
import { onMount, onDestroy } from "svelte";

export let words = ["amazing", "beautiful", "fast", "modern", "stunning"];
export let duration = 2500;

let index = 0;
let animKey = 0;
let interval;

onMount(() => {
  if (words.length < 2) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  interval = setInterval(() => {
    index = (index + 1) % words.length;
    animKey += 1;
  }, duration);
});

onDestroy(() => {
  if (interval) clearInterval(interval);
});
</script>

<svelte:head>
  <style>
    @keyframes flip-in {
      0% { transform: rotateX(90deg); opacity: 0; }
      15% { transform: rotateX(0deg); opacity: 1; }
      80% { transform: rotateX(0deg); opacity: 1; }
      100% { transform: rotateX(-90deg); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .flip-word-svelte { animation: none !important; transform: rotateX(0deg) !important; opacity: 1 !important; }
    }
  </style>
</svelte:head>

<div class="flip-demo">
  <div>
    <h1 class="flip-heading">
      We build
      <span class="flip-container">
        {#key animKey}
          <span class="flip-word flip-word-svelte" style="animation-duration: {duration}ms;">
            {words[index]}
          </span>
        {/key}
      </span>
      products
    </h1>
    <p class="flip-subtitle">Words flip vertically to cycle through a list</p>
  </div>
</div>

<style>
  .flip-demo {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #0a0a0a;
    font-family: system-ui, -apple-system, sans-serif;
    text-align: center;
    padding: 2rem;
  }
  .flip-heading {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: #e0e0e0;
  }
  .flip-container {
    display: inline-block;
    position: relative;
    height: 1.2em;
    overflow: hidden;
    vertical-align: bottom;
    perspective: 600px;
  }
  .flip-word {
    display: inline-block;
    background-image: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: flip-in ease forwards;
    transform-origin: center bottom;
    backface-visibility: hidden;
  }
  .flip-subtitle {
    margin-top: 1.5rem;
    color: #666;
    font-size: 1rem;
  }
</style>
