<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  threshold: { type: Number, default: 0.15 },
  delay: { type: Number, default: 0 },
});

const el = ref(null);
const visible = ref(false);
let observer = null;

onMounted(() => {
  if (!el.value) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true;
        observer.unobserve(el.value);
      }
    },
    { threshold: props.threshold, rootMargin: "0px 0px -40px 0px" }
  );

  observer.observe(el.value);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div
    ref="el"
    :style="{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease-out ${props.delay}ms, transform 0.6s ease-out ${props.delay}ms`,
    }"
  >
    <slot />
  </div>
</template>
