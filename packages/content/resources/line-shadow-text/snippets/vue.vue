<script setup>
const props = defineProps({
  shadowColor: { type: String, default: "167, 139, 250" },
});
</script>

<template>
  <div class="wrapper">
    <h1
      class="line-shadow-text"
      :style="{ '--shadow-color': props.shadowColor }"
    >
      <slot>Stealthis</slot>
    </h1>
    <p class="subtitle">Striped shadow effect</p>
  </div>
</template>

<style>
.wrapper {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.line-shadow-text {
  --shadow-color: 167, 139, 250;
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #f1f5f9;
  cursor: default;
  animation: lineShadowDrift 4s ease-in-out infinite alternate;
}

.subtitle {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: #444;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

@keyframes lineShadowDrift {
  0% {
    text-shadow:
      1px  1px  0 rgba(var(--shadow-color), 0.25),
      2px  2px  0 rgba(var(--shadow-color), 0.00),
      3px  3px  0 rgba(var(--shadow-color), 0.22),
      4px  4px  0 rgba(var(--shadow-color), 0.00),
      5px  5px  0 rgba(var(--shadow-color), 0.19),
      6px  6px  0 rgba(var(--shadow-color), 0.00),
      7px  7px  0 rgba(var(--shadow-color), 0.16),
      8px  8px  0 rgba(var(--shadow-color), 0.00),
      9px  9px  0 rgba(var(--shadow-color), 0.13),
      10px 10px 0 rgba(var(--shadow-color), 0.00),
      11px 11px 0 rgba(var(--shadow-color), 0.10),
      12px 12px 0 rgba(var(--shadow-color), 0.00),
      13px 13px 0 rgba(var(--shadow-color), 0.07),
      14px 14px 0 rgba(var(--shadow-color), 0.00),
      15px 15px 0 rgba(var(--shadow-color), 0.04);
  }
  100% {
    text-shadow:
      2px  4px  0 rgba(var(--shadow-color), 0.25),
      4px  6px  0 rgba(var(--shadow-color), 0.00),
      6px  8px  0 rgba(var(--shadow-color), 0.22),
      8px  10px 0 rgba(var(--shadow-color), 0.00),
      10px 12px 0 rgba(var(--shadow-color), 0.19),
      12px 14px 0 rgba(var(--shadow-color), 0.00),
      14px 16px 0 rgba(var(--shadow-color), 0.16),
      16px 18px 0 rgba(var(--shadow-color), 0.00),
      18px 20px 0 rgba(var(--shadow-color), 0.13),
      20px 22px 0 rgba(var(--shadow-color), 0.00),
      22px 24px 0 rgba(var(--shadow-color), 0.10),
      24px 26px 0 rgba(var(--shadow-color), 0.00),
      26px 28px 0 rgba(var(--shadow-color), 0.07),
      28px 30px 0 rgba(var(--shadow-color), 0.00),
      30px 32px 0 rgba(var(--shadow-color), 0.04);
  }
}

@media (prefers-reduced-motion: reduce) {
  .line-shadow-text {
    animation: none;
  }
}
</style>
