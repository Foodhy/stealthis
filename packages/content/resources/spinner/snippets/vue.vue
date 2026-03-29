<script setup>
const sizes = { sm: 16, md: 24, lg: 36 };
const variants = ["circle", "dots", "bars", "pulse"];
const sizeList = ["sm", "md", "lg"];
const colorList = ["#38bdf8", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

function getSize(size) {
  return sizes[size] || sizes.md;
}
function borderWidth(size) {
  return size === "sm" ? 2 : size === "lg" ? 3 : 2.5;
}
</script>

<template>
  <div class="demo">
    <div class="container">
      <h1 class="title">Spinner</h1>
      <p class="desc">Multiple loading animation styles and sizes.</p>

      <div v-for="variant in variants" :key="variant" class="section">
        <span class="section-label">{{ variant }}</span>
        <div class="row">
          <template v-for="sz in sizeList" :key="sz">
            <!-- Circle -->
            <div v-if="variant === 'circle'" role="status"
              :style="{
                width: getSize(sz) + 'px', height: getSize(sz) + 'px',
                border: borderWidth(sz) + 'px solid rgba(255,255,255,0.08)',
                borderTopColor: '#38bdf8', borderRadius: '50%',
                animation: 'spinner-spin 0.7s linear infinite',
              }">
              <span class="sr-only">Loading...</span>
            </div>

            <!-- Dots -->
            <div v-else-if="variant === 'dots'" role="status"
              :style="{ display: 'inline-flex', alignItems: 'center', gap: getSize(sz) * 0.25 + 'px' }">
              <span v-for="(delay, i) in ['-0.32s', '-0.16s', '0s']" :key="i"
                :style="{
                  width: getSize(sz) * 0.35 + 'px', height: getSize(sz) * 0.35 + 'px',
                  background: '#38bdf8', borderRadius: '50%',
                  animation: 'spinner-bounce 1.4s ease-in-out infinite both',
                  animationDelay: delay,
                }"></span>
              <span class="sr-only">Loading...</span>
            </div>

            <!-- Bars -->
            <div v-else-if="variant === 'bars'" role="status"
              :style="{ display: 'inline-flex', alignItems: 'center', height: getSize(sz) + 'px', gap: getSize(sz) * 0.1 + 'px' }">
              <span v-for="(delay, i) in ['-0.36s', '-0.24s', '-0.12s', '0s']" :key="i"
                :style="{
                  width: getSize(sz) * 0.15 + 'px', height: '100%',
                  background: '#38bdf8', borderRadius: '2px',
                  animation: 'spinner-bars 1.2s ease-in-out infinite',
                  animationDelay: delay,
                }"></span>
              <span class="sr-only">Loading...</span>
            </div>

            <!-- Pulse -->
            <div v-else role="status"
              :style="{ position: 'relative', width: getSize(sz) + 'px', height: getSize(sz) + 'px' }">
              <span :style="{ position: 'absolute', inset: '0', borderRadius: '50%', background: '#38bdf8', animation: 'spinner-pulse-ring 1.5s ease-out infinite' }"></span>
              <span :style="{ position: 'absolute', inset: '0', borderRadius: '50%', background: '#38bdf8', animation: 'spinner-pulse-dot 1.5s ease-out infinite' }"></span>
              <span class="sr-only">Loading...</span>
            </div>
          </template>
        </div>
      </div>

      <div class="section">
        <span class="section-label">Colors</span>
        <div class="row">
          <div v-for="c in colorList" :key="c" role="status"
            :style="{
              width: '24px', height: '24px',
              border: '2.5px solid rgba(255,255,255,0.08)',
              borderTopColor: c, borderRadius: '50%',
              animation: 'spinner-spin 0.7s linear infinite',
            }">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes spinner-spin { to { transform: rotate(360deg); } }
@keyframes spinner-bounce { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
@keyframes spinner-bars { 0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.4; } 20% { transform: scaleY(1); opacity: 1; } }
@keyframes spinner-pulse-ring { 0% { transform: scale(0.5); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
@keyframes spinner-pulse-dot { 0%, 100% { transform: scale(0.5); opacity: 1; } 50% { transform: scale(0.7); opacity: 0.8; } }

.demo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  font-family: Inter, system-ui, sans-serif;
  color: #f2f6ff;
  padding: 2rem;
}
.container { width: 100%; max-width: 520px; }
.title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.375rem; }
.desc { color: #475569; font-size: 0.875rem; margin-bottom: 2rem; }
.section { margin-bottom: 2rem; }
.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}
.row { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
