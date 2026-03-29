<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  videoSrc: {
    type: String,
    default: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  thumbnailSrc: { type: String, default: "" },
  title: { type: String, default: "Experience the Future" },
  subtitle: { type: String, default: "Watch our latest product showcase and see what's possible." },
  badge: { type: String, default: "New Release" },
});

const isOpen = ref(false);
const videoEl = ref(null);

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  if (videoEl.value) videoEl.value.pause();
}

watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = "hidden";
    if (videoEl.value) videoEl.value.play().catch(() => {});
  } else {
    document.body.style.overflow = "";
  }
});

function handleKey(e) {
  if (e.key === "Escape" && isOpen.value) close();
}

onMounted(() => {
  document.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKey);
  document.body.style.overflow = "";
});

function handleThumbEnter(e) {
  e.currentTarget.style.transform = "scale(1.01)";
  e.currentTarget.style.boxShadow = "0 20px 60px rgba(99,102,241,0.15)";
}

function handleThumbLeave(e) {
  e.currentTarget.style.transform = "";
  e.currentTarget.style.boxShadow = "";
}
</script>

<template>
  <div class="hero-video-dialog">
    <div class="hero-inner">
      <!-- Hero text -->
      <div class="hero-text">
        <span v-if="props.badge" class="badge">{{ props.badge }}</span>
        <h1 class="title">{{ props.title }}</h1>
        <p class="subtitle">{{ props.subtitle }}</p>
      </div>

      <!-- Thumbnail -->
      <div
        class="thumbnail"
        @click="open"
        @mouseenter="handleThumbEnter"
        @mouseleave="handleThumbLeave"
      >
        <img v-if="props.thumbnailSrc" :src="props.thumbnailSrc" alt="Video thumbnail" class="thumb-img" />
        <div v-else class="thumb-placeholder" />

        <button aria-label="Play video" class="play-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Modal overlay -->
    <div v-if="isOpen" class="modal-overlay">
      <!-- Backdrop -->
      <div class="backdrop" @click="close" />

      <!-- Content -->
      <div class="modal-content">
        <button @click="close" aria-label="Close video" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div class="video-container">
          <video ref="videoEl" controls preload="metadata" class="video-el">
            <source :src="props.videoSrc" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.hero-video-dialog {
  min-height: 100vh;
  background: #0a0a0a;
  display: grid;
  place-items: center;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f1f5f9;
}

.hero-inner {
  width: min(700px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.hero-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a78bfa;
  background: rgba(167,139,250,0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(167,139,250,0.2);
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.1;
  margin: 0;
}

.subtitle {
  font-size: 1rem;
  color: #94a3b8;
  max-width: 440px;
  line-height: 1.6;
  margin: 0;
}

.thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95);
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  z-index: 2;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  width: min(900px, 100%);
  z-index: 1;
  animation: scaleIn 0.3s cubic-bezier(0.22,1,0.36,1);
}

.close-btn {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.5rem;
  color: #f1f5f9;
  cursor: pointer;
  padding: 0.35rem;
  display: grid;
  place-items: center;
}

.video-container {
  border-radius: 0.875rem;
  overflow: hidden;
  background: #000;
  box-shadow: 0 25px 80px rgba(0,0,0,0.6);
}

.video-el {
  width: 100%;
  display: block;
  border-radius: 0.75rem;
}
</style>
