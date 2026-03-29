<script>
import { onMount, onDestroy } from "svelte";

export let text = "STEALTHIS";
export let scrambleSpeed = 50;
export let resolveDelay = 80;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

let displayChars = text.split("");
let resolvedFlags = new Array(text.length).fill(true);
let isAnimating = false;
let intervalId = null;
let timeoutIds = [];
let mountTimeout = null;

function scramble() {
  if (isAnimating) return;
  isAnimating = true;

  const resolved = new Array(text.length).fill(false);
  resolvedFlags = [...resolved];

  // Clear previous timeouts
  timeoutIds.forEach(clearTimeout);
  timeoutIds = [];

  // Stagger resolve
  text.split("").forEach((_, i) => {
    const tid = setTimeout(
      () => {
        resolved[i] = true;
        resolvedFlags = [...resolved];
      },
      resolveDelay * (i + 1)
    );
    timeoutIds.push(tid);
  });

  // Scramble loop
  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    const next = text.split("").map((ch, i) => {
      if (ch === " ") return "\u00A0";
      if (resolved[i]) return ch;
      return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    });
    displayChars = next;

    if (resolved.every(Boolean)) {
      if (intervalId) clearInterval(intervalId);
      displayChars = text.split("");
      isAnimating = false;
    }
  }, scrambleSpeed);
}

onMount(() => {
  mountTimeout = setTimeout(scramble, 400);
});

onDestroy(() => {
  if (mountTimeout) clearTimeout(mountTimeout);
  if (intervalId) clearInterval(intervalId);
  timeoutIds.forEach(clearTimeout);
});
</script>

<div class="hyper-text-wrapper">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="hyper-text" on:mouseenter={scramble}>
    {#each displayChars as ch, i}
      <span
        class="char"
        style="color: {resolvedFlags[i] ? '#f1f5f9' : '#a78bfa'}; text-shadow: {resolvedFlags[i] ? '0 0 4px rgba(241,245,249,0.2)' : '0 0 8px rgba(167,139,250,0.5)'};"
      >
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    {/each}
  </div>

  <p class="hint">Hover to scramble</p>
</div>

<style>
  .hyper-text-wrapper {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 3rem;
  }

  .hyper-text {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: clamp(2rem, 6vw, 4.5rem);
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #f1f5f9;
    cursor: default;
    display: inline-flex;
  }

  .char {
    display: inline-block;
    min-width: 0.6em;
    text-align: center;
    transition: color 0.15s ease;
  }

  .hint {
    font-size: 0.75rem;
    color: #333;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0;
  }
</style>
