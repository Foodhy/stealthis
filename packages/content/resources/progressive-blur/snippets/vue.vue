<script setup>
import { computed } from "vue";

const items = [
  {
    title: "Design System v4.2",
    desc: "Updated component tokens and added new color primitives for dark mode theming.",
    tag: "Design",
  },
  {
    title: "API Rate Limiting",
    desc: "Implemented sliding window rate limiter with Redis backing store.",
    tag: "Backend",
  },
  {
    title: "Motion Library",
    desc: "Spring-based animation primitives with configurable stiffness and damping.",
    tag: "Animation",
  },
  {
    title: "Edge Caching",
    desc: "Cloudflare Workers KV integration for sub-50ms response times globally.",
    tag: "Infra",
  },
  {
    title: "Accessibility Audit",
    desc: "Full WCAG 2.1 AA compliance pass with automated testing pipeline.",
    tag: "A11y",
  },
  {
    title: "Real-time Sync",
    desc: "WebSocket-based collaborative editing with conflict resolution via CRDTs.",
    tag: "Feature",
  },
];

function makeOverlay(direction, blurHeight = 200, layers = 6, maxBlur = 20) {
  const isVertical = direction === "top" || direction === "bottom";
  const blurValues = Array.from({ length: layers }, (_, i) => {
    const t = i / (layers - 1);
    return Math.round(maxBlur * Math.pow(t, 2));
  });
  const style = {
    position: "absolute",
    zIndex: 10,
    pointerEvents: "none",
    display: "flex",
  };
  if (isVertical) {
    style.left = "0";
    style.right = "0";
    style.height = blurHeight + "px";
    style.flexDirection = direction === "bottom" ? "column" : "column-reverse";
    if (direction === "bottom") style.bottom = "0";
    else style.top = "0";
  } else {
    style.top = "0";
    style.bottom = "0";
    style.width = blurHeight + "px";
    style.flexDirection = direction === "right" ? "row" : "row-reverse";
    if (direction === "right") style.right = "0";
    else style.left = "0";
  }
  return { style, blurValues };
}

const bottomOverlay = computed(() => makeOverlay("bottom", 200));
const imageOverlay = computed(() => makeOverlay("bottom", 150));
const topOverlay = computed(() => makeOverlay("top", 200));
</script>

<template>
  <div class="page">
    <h1 class="title">Progressive Blur</h1>
    <p class="subtitle">Content fades into a smooth blur at the edges</p>

    <div class="grid">
      <!-- Bottom Blur -->
      <div class="demo-col">
        <span class="label">Bottom Blur</span>
        <div class="card-wrap">
          <div style="position: relative; overflow: hidden;">
            <div class="scroll-area">
              <div v-for="item in items" :key="item.title" class="card">
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc">{{ item.desc }}</p>
                <span class="tag">{{ item.tag }}</span>
              </div>
            </div>
            <div :style="bottomOverlay.style" aria-hidden="true">
              <div
                v-for="(blur, i) in bottomOverlay.blurValues"
                :key="i"
                :style="{ flex: '1', backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Image Edge Blur -->
      <div class="demo-col">
        <span class="label">Image Blur Edge</span>
        <div class="card-wrap">
          <div style="position: relative; overflow: hidden;">
            <div class="gradient-box">
              <div class="orb" />
              <p class="orb-label">Visual content fades smoothly</p>
            </div>
            <div :style="imageOverlay.style" aria-hidden="true">
              <div
                v-for="(blur, i) in imageOverlay.blurValues"
                :key="i"
                :style="{ flex: '1', backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Top Blur -->
      <div class="demo-col">
        <span class="label">Top Blur</span>
        <div class="card-wrap">
          <div style="position: relative; overflow: hidden;">
            <div class="scroll-area">
              <div v-for="item in items.slice(0, 4)" :key="item.title" class="card">
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc">{{ item.desc }}</p>
                <span class="tag">{{ item.tag }}</span>
              </div>
            </div>
            <div :style="topOverlay.style" aria-hidden="true">
              <div
                v-for="(blur, i) in topOverlay.blurValues"
                :key="i"
                :style="{ flex: '1', backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  background: #0a0a0a;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 4rem;
}

.title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  padding-top: 3rem;
}

.subtitle {
  text-align: center;
  color: rgba(148, 163, 184, 0.8);
  font-size: 1.125rem;
  margin-top: -2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 900px;
}

.demo-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.label {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(148, 163, 184, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.card-wrap {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

.scroll-area {
  height: 400px;
  overflow-y: auto;
  padding: 2rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.card-desc {
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.9rem;
  line-height: 1.6;
}

.tag {
  display: inline-block;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  margin-top: 0.75rem;
}

.gradient-box {
  height: 300px;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%);
  display: grid;
  place-items: center;
}

.orb {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #a78bfa, #4338ca);
  box-shadow: 0 0 60px rgba(129, 140, 248, 0.4);
  margin-bottom: 1rem;
}

.orb-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}
</style>
