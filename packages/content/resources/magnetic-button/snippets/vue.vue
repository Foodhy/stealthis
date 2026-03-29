<script setup>
import { ref } from "vue";

const props = defineProps({
  strength: { type: Number, default: 0.35 },
  radius: { type: Number, default: 100 },
});

const primaryBtn = ref(null);
const primaryInner = ref(null);
const ghostBtn = ref(null);
const ghostInner = ref(null);

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function handleMouseMove(btnEl, innerEl, e) {
  if (reducedMotion || !btnEl) return;
  const rect = btnEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const distance = Math.hypot(dx, dy);

  if (distance < props.radius) {
    const pull = (1 - distance / props.radius) * props.strength;
    btnEl.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
    if (innerEl) {
      innerEl.style.transform = `translate(${dx * pull * 0.4}px, ${dy * pull * 0.4}px)`;
    }
  }
}

function handleMouseLeave(btnEl, innerEl) {
  if (btnEl) btnEl.style.transform = "";
  if (innerEl) innerEl.style.transform = "";
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8">
    <p class="text-slate-500 text-sm">Move your cursor near the buttons</p>

    <!-- Primary -->
    <button
      ref="primaryBtn"
      @mousemove="handleMouseMove($refs.primaryBtn, $refs.primaryInner, $event)"
      @mouseleave="handleMouseLeave($refs.primaryBtn, $refs.primaryInner)"
      class="relative inline-flex items-center justify-center px-10 py-4 rounded-full text-base font-semibold cursor-pointer outline-none border-none bg-sky-500 text-white shadow-[0_4px_24px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_32px_rgba(14,165,233,0.45)]"
      style="transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease; will-change: transform;"
    >
      <span
        ref="primaryInner"
        style="transition: transform 0.4s cubic-bezier(0.23,1,0.32,1); pointer-events: none;"
      >
        Browse Library
      </span>
    </button>

    <!-- Ghost -->
    <button
      ref="ghostBtn"
      @mousemove="handleMouseMove($refs.ghostBtn, $refs.ghostInner, $event)"
      @mouseleave="handleMouseLeave($refs.ghostBtn, $refs.ghostInner)"
      class="relative inline-flex items-center justify-center px-10 py-4 rounded-full text-base font-semibold cursor-pointer outline-none bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-slate-100"
      style="transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease; will-change: transform;"
    >
      <span
        ref="ghostInner"
        style="transition: transform 0.4s cubic-bezier(0.23,1,0.32,1); pointer-events: none;"
      >
        View Docs
      </span>
    </button>
  </div>
</template>
