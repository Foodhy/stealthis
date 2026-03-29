<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  text: { type: String, default: "STEAL\nTHIS" },
  videoSrc: { type: String, default: undefined },
});

const useFallback = ref(!props.videoSrc);
const videoEl = ref(null);

const lines = computed(() => props.text.split("\n"));

onMounted(() => {
  if (videoEl.value && props.videoSrc) {
    videoEl.value.play().catch(() => {
      useFallback.value = true;
    });
  }
});

function onVideoError() {
  useFallback.value = true;
}
</script>

<template>
  <div
    style="position: relative; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #0a0a0a;"
  >
    <div
      v-if="useFallback"
      class="gradient-bg"
      style="position: absolute; inset: 0; z-index: 1; background: linear-gradient(135deg, #a78bfa 0%, #ec4899 25%, #f59e0b 50%, #10b981 75%, #3b82f6 100%); background-size: 400% 400%;"
    />
    <video
      v-else
      ref="videoEl"
      :src="props.videoSrc"
      autoplay
      loop
      muted
      playsinline
      @error="onVideoError"
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;"
    />

    <div
      style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #0a0a0a; mix-blend-mode: screen;"
    >
      <h1
        style="font-size: clamp(4rem, 15vw, 12rem); font-weight: 900; letter-spacing: -0.04em; color: #fff; text-align: center; text-transform: uppercase; line-height: 0.9; font-family: system-ui, -apple-system, sans-serif;"
      >
        <span v-for="(line, i) in lines" :key="i">
          {{ line }}<br v-if="i < lines.length - 1" />
        </span>
      </h1>
    </div>

    <div
      style="position: absolute; inset: 0; z-index: 3; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);"
    />
  </div>
</template>

<style scoped>
.gradient-bg {
  animation: videoTextGradient 8s ease infinite;
}
@keyframes videoTextGradient {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
