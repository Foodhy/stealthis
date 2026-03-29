<script setup>
import { ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [
      {
        label: "Finder",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18"/></svg>`,
      },
      {
        label: "Mail",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 6 10-6"/></svg>`,
      },
      {
        label: "Music",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
      },
      {
        label: "Photos",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
      },
      {
        label: "Messages",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      },
      {
        label: "Calendar",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
      },
      {
        label: "Settings",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
      },
    ],
  },
  baseSize: { type: Number, default: 48 },
  maxSize: { type: Number, default: 72 },
  magnifyRange: { type: Number, default: 200 },
});

const dockEl = ref(null);
const sizes = ref(props.items.map(() => props.baseSize));
const hoveredIndex = ref(null);

function handleMouseMove(e) {
  if (!dockEl.value) return;
  const children = Array.from(dockEl.value.children);
  sizes.value = children.map((child) => {
    const rect = child.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const distance = Math.abs(e.clientX - centerX);
    const scale = Math.max(
      props.baseSize,
      props.maxSize -
        ((props.maxSize - props.baseSize) * Math.pow(distance, 2)) / Math.pow(props.magnifyRange, 2)
    );
    return Math.round(Math.min(props.maxSize, Math.max(props.baseSize, scale)));
  });
}

function handleMouseLeave() {
  sizes.value = props.items.map(() => props.baseSize);
  hoveredIndex.value = null;
}
</script>

<template>
  <div class="dock-wrapper">
    <p class="dock-hint">Hover over the dock icons</p>

    <div
      ref="dockEl"
      class="dock-bar"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div
        v-for="(item, i) in items"
        :key="item.label"
        class="dock-item"
        @mouseenter="hoveredIndex = i"
        @mouseleave="hoveredIndex = null"
        @click="item.onClick?.()"
      >
        <div v-if="hoveredIndex === i" class="dock-tooltip">{{ item.label }}</div>
        <div
          class="dock-icon"
          :style="{ width: sizes[i] + 'px', height: sizes[i] + 'px' }"
        >
          <div class="dock-icon-inner" v-html="item.icon"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dock-wrapper {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem;
  padding-bottom: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}
.dock-hint {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 3rem;
}
.dock-bar {
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.dock-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.dock-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}
.dock-icon {
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  transition: width 0.2s ease, height 0.2s ease;
}
.dock-icon-inner {
  width: 55%;
  height: 55%;
}
</style>
