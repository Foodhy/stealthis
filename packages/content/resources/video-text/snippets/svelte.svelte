<script>
import { onMount } from "svelte";

export let text = "STEAL\nTHIS";
export let videoSrc = undefined;

let useFallback = !videoSrc;
let videoEl;

$: lines = text.split("\n");

onMount(() => {
  if (videoEl && videoSrc) {
    videoEl.play().catch(() => {
      useFallback = true;
    });
  }
});

function onVideoError() {
  useFallback = true;
}
</script>

<div
  style="position: relative; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #0a0a0a;"
>
  {#if useFallback}
    <div
      class="gradient-bg"
      style="position: absolute; inset: 0; z-index: 1; background: linear-gradient(135deg, #a78bfa 0%, #ec4899 25%, #f59e0b 50%, #10b981 75%, #3b82f6 100%); background-size: 400% 400%;"
    />
  {:else}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      bind:this={videoEl}
      src={videoSrc}
      autoplay
      loop
      muted
      playsinline
      on:error={onVideoError}
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;"
    />
  {/if}

  <div
    style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #0a0a0a; mix-blend-mode: screen;"
  >
    <h1
      style="font-size: clamp(4rem, 15vw, 12rem); font-weight: 900; letter-spacing: -0.04em; color: #fff; text-align: center; text-transform: uppercase; line-height: 0.9; font-family: system-ui, -apple-system, sans-serif;"
    >
      {#each lines as line, i}
        <span>{line}{#if i < lines.length - 1}<br />{/if}</span>
      {/each}
    </h1>
  </div>

  <div
    style="position: absolute; inset: 0; z-index: 3; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);"
  />
</div>

<style>
  .gradient-bg {
    animation: videoTextGradient 8s ease infinite;
  }
  @keyframes videoTextGradient {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
