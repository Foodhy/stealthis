<script>
import { onMount, onDestroy } from "svelte";

export let text =
  "Design is not just what it looks like and feels like. Design is how it works. Every detail matters when crafting remarkable experiences.";
export let delayPerWord = 120;
export let highlightColor = "rgba(167, 139, 250, 0.15)";

let highlightedCount = 0;
let key = 0;
let timeouts = [];

$: words = text.split(/\s+/);

$: {
  // React to key or delayPerWord changes
  key;
  delayPerWord;
  cleanup();
  highlightedCount = 0;
  timeouts = [];
  words.forEach((_, i) => {
    const tid = setTimeout(() => {
      highlightedCount = i + 1;
    }, delayPerWord * i);
    timeouts.push(tid);
  });
}

function cleanup() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}

function replay() {
  key += 1;
}

onDestroy(() => {
  cleanup();
});
</script>

<div class="wrapper">
  <div class="inner">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <p class="text" on:click={replay}>
      {#each words as word, i}
        {#if i > 0}{' '}{/if}<span
          class="word"
          style="color: {i < highlightedCount ? '#f1f5f9' : 'rgba(241,245,249,0.3)'};"
        >
          <span
            class="highlight-bg"
            style="background: {highlightColor}; transform: {i < highlightedCount ? 'scaleX(1)' : 'scaleX(0)'};"
          ></span>
          {word}
        </span>
      {/each}
    </p>

    <p class="hint">Click to replay</p>
  </div>
</div>

<style>
  .wrapper {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .inner {
    max-width: 640px;
  }
  .text {
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    font-weight: 600;
    line-height: 1.6;
    color: rgba(241, 245, 249, 0.3);
    cursor: pointer;
    user-select: none;
  }
  .word {
    position: relative;
    display: inline-block;
    padding: 0 0.1em;
    transition: color 0.3s ease;
  }
  .highlight-bg {
    position: absolute;
    inset: 0;
    border-radius: 4px;
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    z-index: -1;
  }
  .hint {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.75rem;
    color: #333;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
</style>
