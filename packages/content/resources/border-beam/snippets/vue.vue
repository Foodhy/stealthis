<script setup>
import { ref } from "vue";

const props = defineProps({
  beamColor: { type: String, default: "#22d3ee" },
  beamSpeed: { type: String, default: "4s" },
  borderWidth: { type: Number, default: 2 },
});

const tags = ["CSS", "Animation", "Gradient"];
</script>

<template>
  <div class="demo">
    <div class="outer">
      <div
        class="beam"
        :style="{
          background: `conic-gradient(from 0deg, transparent 0%, transparent 70%, ${props.beamColor} 76%, ${props.beamColor}99 78%, transparent 82%, transparent 100%)`,
          animation: `border-beam-rotate ${props.beamSpeed} linear infinite`
        }"
      />
      <div
        class="content"
        :style="{
          margin: props.borderWidth + 'px',
          borderRadius: `calc(1.25rem - ${props.borderWidth}px)`
        }"
      >
        <div class="card-inner">
          <span class="icon">&#x2728;</span>
          <h2 class="title">Border Beam</h2>
          <p class="desc">
            An animated beam of light travels around the card border using a
            rotating conic-gradient and CSS keyframes.
          </p>
          <div class="tags">
            <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes border-beam-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.outer {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
}
.beam {
  position: absolute;
  inset: -50%;
  border-radius: inherit;
}
.content {
  position: relative;
  z-index: 1;
  background: #0a0a0a;
}
.demo {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0a0a0a;
  font-family: system-ui, -apple-system, sans-serif;
}
.card-inner {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #f1f5f9;
}
.icon { font-size: 1.75rem; }
.title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}
.desc {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #94a3b8;
  margin: 0;
}
.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #cbd5e1;
}
</style>
