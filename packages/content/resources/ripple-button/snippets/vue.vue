<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  variant: { type: String, default: "blue" },
  size: { type: String, default: "md" },
});

const emit = defineEmits(["click"]);

const ripples = ref([]);
let rippleId = 0;

const variantStyles = {
  blue: { background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" },
  purple: { background: "#8b5cf6", color: "#fff", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" },
  emerald: { background: "#10b981", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" },
  rose: { background: "#f43f5e", color: "#fff", boxShadow: "0 4px 14px rgba(244,63,94,0.35)" },
  ghost: { background: "transparent", color: "#cbd5e1", border: "1.5px solid #334155" },
  amber: { background: "#f59e0b", color: "#0a0a0a", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" },
};

const sizeStyles = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

const rippleColor = computed(() =>
  props.variant === "ghost" ? "rgba(148,163,184,0.2)" : "rgba(255,255,255,0.35)"
);

const btnStyle = computed(() => ({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  cursor: "pointer",
  border: "none",
  outline: "none",
  overflow: "hidden",
  transition: "transform 0.15s ease, box-shadow 0.2s ease",
  ...sizeStyles[props.size],
  ...variantStyles[props.variant],
}));

function handleClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const rippleSize = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - rippleSize / 2;
  const y = e.clientY - rect.top - rippleSize / 2;

  const id = ++rippleId;
  ripples.value.push({ id, x, y, size: rippleSize });

  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, 600);

  emit("click", e);
}

function handleMouseEnter(e) {
  e.currentTarget.style.transform = "translateY(-1px)";
}

function handleMouseLeave(e) {
  e.currentTarget.style.transform = "translateY(0)";
}
</script>

<template>
  <button
    :style="btnStyle"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot />
    <span
      v-for="r in ripples"
      :key="r.id"
      class="ripple-span-vue"
      :style="{
        position: 'absolute',
        borderRadius: '50%',
        background: rippleColor,
        width: r.size + 'px',
        height: r.size + 'px',
        left: r.x + 'px',
        top: r.y + 'px',
        transform: 'scale(0)',
        animation: 'ripple-expand 0.6s ease-out forwards',
        pointerEvents: 'none',
      }"
    />
  </button>
</template>

<style scoped>
@keyframes ripple-expand {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ripple-span-vue { display: none !important; }
}
</style>
