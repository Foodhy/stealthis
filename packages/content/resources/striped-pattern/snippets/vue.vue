<script setup>
function labelStyle(color, bg, border) {
  return {
    display: "inline-block",
    alignSelf: "flex-start",
    fontSize: "0.6875rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color,
    background: bg,
    border: `1px solid ${border}`,
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    marginBottom: "0.75rem",
  };
}

const patterns = [
  {
    cls: "stripe-diagonal",
    labelColor: "rgba(139,92,246,0.9)",
    labelBg: "rgba(139,92,246,0.1)",
    labelBorder: "rgba(139,92,246,0.2)",
    badge: "Diagonal",
    title: "135\u00b0 Stripes",
    desc: "Classic diagonal striped pattern with subtle animation",
  },
  {
    cls: "stripe-horizontal",
    labelColor: "rgba(56,189,248,0.9)",
    labelBg: "rgba(56,189,248,0.1)",
    labelBorder: "rgba(56,189,248,0.2)",
    badge: "Horizontal",
    title: "0\u00b0 Stripes",
    desc: "Clean horizontal bands with dual-color layering",
  },
  {
    cls: "stripe-crosshatch",
    labelColor: "rgba(244,63,94,0.9)",
    labelBg: "rgba(244,63,94,0.1)",
    labelBorder: "rgba(244,63,94,0.2)",
    badge: "Crosshatch",
    title: "Layered",
    desc: "Two diagonal gradients composited into a crosshatch",
  },
  {
    cls: "stripe-fine",
    labelColor: "rgba(34,211,238,0.9)",
    labelBg: "rgba(34,211,238,0.1)",
    labelBorder: "rgba(34,211,238,0.2)",
    badge: "Fine",
    title: "Thin Stripes",
    desc: "Narrow stripes with neon accent overlay",
  },
];
</script>

<template>
  <div class="root">
    <div class="grid">
      <div v-for="p in patterns" :key="p.cls" class="pattern-card">
        <div :class="['stripe-bg', p.cls]" aria-hidden="true" />
        <div class="content content-end">
          <span :style="labelStyle(p.labelColor, p.labelBg, p.labelBorder)">{{ p.badge }}</span>
          <h2 class="title">{{ p.title }}</h2>
          <p class="desc">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.pattern-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  min-height: 280px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stripe-bg {
  position: absolute;
  inset: 0;
}

.stripe-diagonal {
  background: repeating-linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08) 0px,
    rgba(139, 92, 246, 0.08) 1px,
    transparent 1px,
    transparent 16px
  );
  background-size: 22.63px 22.63px;
  animation: stripe-drift 40s linear infinite;
}

.stripe-horizontal {
  background: repeating-linear-gradient(
    0deg,
    rgba(56, 189, 248, 0.06) 0px,
    rgba(56, 189, 248, 0.06) 1px,
    transparent 1px,
    transparent 12px
  );
  background-size: 16.97px 16.97px;
  animation: stripe-drift 40s linear infinite;
}

.stripe-crosshatch {
  background:
    repeating-linear-gradient(45deg, rgba(244, 63, 94, 0.06) 0px, rgba(244, 63, 94, 0.06) 1px, transparent 1px, transparent 20px),
    repeating-linear-gradient(-45deg, rgba(251, 146, 60, 0.06) 0px, rgba(251, 146, 60, 0.06) 1px, transparent 1px, transparent 20px);
  animation: stripe-cross 40s linear infinite;
}

.stripe-fine {
  background: repeating-linear-gradient(
    135deg,
    rgba(34, 211, 238, 0.1) 0px,
    rgba(34, 211, 238, 0.1) 1px,
    transparent 1px,
    transparent 6px
  );
  background-size: 8.49px 8.49px;
  animation: stripe-drift 20s linear infinite;
}

.content {
  position: relative;
  z-index: 1;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.content-end {
  justify-content: flex-end;
  min-height: 280px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  margin: 0 0 0.375rem;
}

.desc {
  font-size: 0.8125rem;
  color: rgba(148, 163, 184, 0.7);
  line-height: 1.5;
  margin: 0;
}

@keyframes stripe-drift {
  0% { background-position: 0 0; }
  100% { background-position: 200px 200px; }
}

@keyframes stripe-cross {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 200px 200px, -200px 200px; }
}
</style>
