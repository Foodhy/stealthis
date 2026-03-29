<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  color: { type: String, default: "#818cf8" },
  duration: { type: Number, default: 700 },
  delay: { type: Number, default: 0 },
  threshold: { type: Number, default: 0.2 },
});

const wrapperRef = ref(null);
const phase = ref("hidden");
let observer = null;

const durationMs = computed(() => `${props.duration}ms`);
const ease = "cubic-bezier(0.77, 0, 0.175, 1)";
const contentOpacity = computed(() =>
  phase.value === "hidden" || phase.value === "covering" ? 0 : 1
);
const boxTransform = computed(() =>
  phase.value === "hidden" ? "scaleX(0)" : phase.value === "covering" ? "scaleX(1)" : "scaleX(0)"
);
const boxOrigin = computed(() =>
  phase.value === "hidden" || phase.value === "covering" ? "left center" : "right center"
);

onMounted(() => {
  const el = wrapperRef.value;
  if (!el) return;
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          phase.value = "covering";
          setTimeout(() => {
            phase.value = "revealed";
          }, props.duration);
        }, props.delay);
        observer.unobserve(el);
      }
    },
    { threshold: props.threshold, rootMargin: "0px 0px -20px 0px" }
  );
  observer.observe(el);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="demo">
    <section class="hero">
      <h1>Box Reveal</h1>
      <p>A colored box slides in and out to reveal content</p>
      <span class="scroll-hint">Scroll down to see the effect</span>
    </section>

    <section class="sections">
      <div class="group">
        <div ref="wrapperRef" class="wrapper">
          <div :style="{ opacity: contentOpacity, transition: 'opacity 0.01s' }">
            <span :style="{ fontSize: '1.25rem', fontWeight: 600, color: props.color }">Introducing</span>
          </div>
          <div
            class="box"
            aria-hidden="true"
            :style="{
              background: props.color,
              transform: boxTransform,
              transformOrigin: boxOrigin,
              transition: `transform ${durationMs} ${ease}`
            }"
          />
        </div>

        <div class="wrapper">
          <div :style="{ opacity: contentOpacity, transition: 'opacity 0.01s' }">
            <h2 class="reveal-title">Box Reveal Effect</h2>
          </div>
          <div
            class="box"
            aria-hidden="true"
            :style="{
              background: props.color,
              transform: boxTransform,
              transformOrigin: boxOrigin,
              transition: `transform ${durationMs} ${ease}`
            }"
          />
        </div>

        <div class="wrapper">
          <div :style="{ opacity: contentOpacity, transition: 'opacity 0.01s' }">
            <p class="reveal-desc">
              A dramatic two-step animation where a colored block sweeps across
              the element, revealing polished content underneath.
            </p>
          </div>
          <div
            class="box"
            aria-hidden="true"
            :style="{
              background: props.color,
              transform: boxTransform,
              transformOrigin: boxOrigin,
              transition: `transform ${durationMs} ${ease}`
            }"
          />
        </div>
      </div>

      <div class="divider" />

      <div class="group">
        <h2 class="reveal-title">Custom Colors</h2>
        <p class="reveal-desc">
          Change the reveal color with a simple prop. Match your brand,
          create emphasis, or use different colors for different sections.
        </p>
      </div>

      <div class="grid">
        <div class="card">
          <h3>Fast</h3>
          <p>Pure CSS animations with no JavaScript overhead during the transition.</p>
        </div>
        <div class="card">
          <h3>Flexible</h3>
          <p>Works with any content — text, cards, images, or entire sections.</p>
        </div>
      </div>

      <div class="divider" />

      <div class="group">
        <span style="font-size: 1.25rem; font-weight: 600; color: #a78bfa;">Staggered Reveals</span>
        <h2 class="reveal-title">Cascading Wipe</h2>
        <p class="reveal-desc">
          Elements within the same group automatically stagger their reveals,
          creating a beautiful sequential wipe effect down the page.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}
.box {
  position: absolute;
  inset: 0;
  z-index: 2;
}
.demo {
  background: #0a0a0a;
  min-height: 300vh;
  font-family: system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
}
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}
.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero p {
  color: rgba(148, 163, 184, 0.8);
  font-size: 1.125rem;
}
.scroll-hint {
  margin-top: 2rem;
  color: rgba(148, 163, 184, 0.5);
  font-size: 0.875rem;
}
.sections {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 2rem;
}
.card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}
.card p {
  color: rgba(148,163,184,0.8);
  line-height: 1.7;
  font-size: 0.95rem;
}
.reveal-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}
.reveal-desc {
  color: rgba(148, 163, 184, 0.8);
  line-height: 1.8;
  max-width: 560px;
}
</style>
