<script>
import { onDestroy } from "svelte";

const SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

let videoEl;
let containerEl;
let playing = false;
let currentTime = 0;
let duration = 0;
let volume = 1;
let muted = false;
let fullscreen = false;
let showControls = true;
let hideTimer = null;

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function showCtrl() {
  showControls = true;
  if (hideTimer) clearTimeout(hideTimer);
  if (playing)
    hideTimer = setTimeout(() => {
      showControls = false;
    }, 2500);
}

function togglePlay() {
  if (!videoEl) return;
  if (videoEl.paused) {
    videoEl.play();
    playing = true;
  } else {
    videoEl.pause();
    playing = false;
    showControls = true;
  }
}

function seek(e) {
  if (!videoEl) return;
  videoEl.currentTime = Number(e.target.value);
}

function changeVolume(e) {
  const val = Number(e.target.value);
  volume = val;
  if (videoEl) videoEl.volume = val;
  muted = val === 0;
}

function toggleMute() {
  if (!videoEl) return;
  videoEl.muted = !videoEl.muted;
  muted = videoEl.muted;
}

function toggleFS() {
  if (!containerEl) return;
  if (!document.fullscreenElement) {
    containerEl.requestFullscreen();
    fullscreen = true;
  } else {
    document.exitFullscreen();
    fullscreen = false;
  }
}

function onTimeUpdate() {
  if (videoEl) currentTime = videoEl.currentTime;
}

function onLoadedMetadata() {
  if (videoEl) duration = videoEl.duration;
}

function onEnded() {
  playing = false;
  showControls = true;
}

function stopProp(e) {
  e.stopPropagation();
}

$: pct = duration ? (currentTime / duration) * 100 : 0;

onDestroy(() => {
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    bind:this={containerEl}
    class="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden group"
    on:mousemove={showCtrl}
    on:click={togglePlay}
  >
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      bind:this={videoEl}
      src={SRC}
      class="w-full aspect-video object-cover"
      on:timeupdate={onTimeUpdate}
      on:loadedmetadata={onLoadedMetadata}
      on:ended={onEnded}
      {muted}
    />

    {#if !playing}
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        </div>
      </div>
    {/if}

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="absolute bottom-0 left-0 right-0 px-4 py-3 transition-opacity duration-300"
      style="opacity: {showControls ? 1 : 0}; background: linear-gradient(transparent, rgba(0,0,0,0.8))"
      on:click={stopProp}
    >
      <input
        type="range"
        min={0}
        max={duration || 100}
        step={0.1}
        value={currentTime}
        on:input={seek}
        class="w-full h-1 mb-2 accent-[#58a6ff] cursor-pointer"
      />
      <div class="flex items-center gap-3">
        <button on:click={togglePlay} class="text-white hover:text-[#58a6ff] transition-colors">
          {#if playing}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {/if}
        </button>
        <button on:click={toggleMute} class="text-white hover:text-[#58a6ff] transition-colors text-xs">
          {muted ? "🔇" : "🔊"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          on:input={changeVolume}
          class="w-16 h-1 accent-[#58a6ff] cursor-pointer"
        />
        <span class="text-white text-xs tabular-nums ml-auto">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <button on:click={toggleFS} class="text-white hover:text-[#58a6ff] text-xs transition-colors">&#x26F6;</button>
      </div>
    </div>
  </div>
</div>
