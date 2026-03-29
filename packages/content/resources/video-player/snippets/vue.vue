<script setup>
import { ref, computed, onUnmounted } from "vue";

const SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const videoEl = ref(null);
const containerEl = ref(null);
const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const muted = ref(false);
const fullscreen = ref(false);
const showControls = ref(true);
let hideTimer = null;

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function showCtrl() {
  showControls.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  if (playing.value)
    hideTimer = setTimeout(() => {
      showControls.value = false;
    }, 2500);
}

function togglePlay() {
  const v = videoEl.value;
  if (!v) return;
  if (v.paused) {
    v.play();
    playing.value = true;
  } else {
    v.pause();
    playing.value = false;
    showControls.value = true;
  }
}

function seek(e) {
  const v = videoEl.value;
  if (!v) return;
  v.currentTime = Number(e.target.value);
}

function changeVolume(e) {
  const val = Number(e.target.value);
  volume.value = val;
  if (videoEl.value) videoEl.value.volume = val;
  muted.value = val === 0;
}

function toggleMute() {
  const v = videoEl.value;
  if (!v) return;
  v.muted = !v.muted;
  muted.value = v.muted;
}

function toggleFS() {
  if (!containerEl.value) return;
  if (!document.fullscreenElement) {
    containerEl.value.requestFullscreen();
    fullscreen.value = true;
  } else {
    document.exitFullscreen();
    fullscreen.value = false;
  }
}

function onTimeUpdate() {
  if (videoEl.value) currentTime.value = videoEl.value.currentTime;
}

function onLoadedMetadata() {
  if (videoEl.value) duration.value = videoEl.value.duration;
}

function onEnded() {
  playing.value = false;
  showControls.value = true;
}

const pct = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0));

onUnmounted(() => {
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div
      ref="containerEl"
      class="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden group"
      @mousemove="showCtrl"
      @click="togglePlay"
    >
      <video
        ref="videoEl"
        :src="SRC"
        class="w-full aspect-video object-cover"
        :muted="muted"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
      />

      <div v-if="!playing" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        </div>
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 px-4 py-3 transition-opacity duration-300"
        :style="{ opacity: showControls ? 1 : 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }"
        @click.stop
      >
        <input
          type="range"
          :min="0"
          :max="duration || 100"
          :step="0.1"
          :value="currentTime"
          @input="seek"
          class="w-full h-1 mb-2 accent-[#58a6ff] cursor-pointer"
        />
        <div class="flex items-center gap-3">
          <button @click="togglePlay" class="text-white hover:text-[#58a6ff] transition-colors">
            <svg v-if="playing" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button @click="toggleMute" class="text-white hover:text-[#58a6ff] transition-colors text-xs">
            {{ muted ? "🔇" : "🔊" }}
          </button>
          <input
            type="range"
            :min="0"
            :max="1"
            :step="0.05"
            :value="muted ? 0 : volume"
            @input="changeVolume"
            class="w-16 h-1 accent-[#58a6ff] cursor-pointer"
          />
          <span class="text-white text-xs tabular-nums ml-auto">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
          <button @click="toggleFS" class="text-white hover:text-[#58a6ff] text-xs transition-colors">&#x26F6;</button>
        </div>
      </div>
    </div>
  </div>
</template>
