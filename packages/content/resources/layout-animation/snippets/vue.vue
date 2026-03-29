<script setup>
import { ref, computed, nextTick, onMounted } from "vue";

const items = [
  {
    id: 1,
    label: "Figma",
    emoji: "\u{1F3A8}",
    cat: "design",
    bg: "rgba(168,85,247,0.2)",
    border: "rgba(168,85,247,0.4)",
  },
  {
    id: 2,
    label: "React",
    emoji: "\u269B\uFE0F",
    cat: "dev",
    bg: "rgba(59,130,246,0.2)",
    border: "rgba(59,130,246,0.4)",
  },
  {
    id: 3,
    label: "D3.js",
    emoji: "\u{1F4CA}",
    cat: "data",
    bg: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.4)",
  },
  {
    id: 4,
    label: "Sketch",
    emoji: "\u{1F48E}",
    cat: "design",
    bg: "rgba(236,72,153,0.2)",
    border: "rgba(236,72,153,0.4)",
  },
  {
    id: 5,
    label: "Node",
    emoji: "\u{1F7E2}",
    cat: "dev",
    bg: "rgba(34,197,94,0.2)",
    border: "rgba(34,197,94,0.4)",
  },
  {
    id: 6,
    label: "SQL",
    emoji: "\u{1F5C4}\uFE0F",
    cat: "data",
    bg: "rgba(245,158,11,0.2)",
    border: "rgba(245,158,11,0.4)",
  },
  {
    id: 7,
    label: "Color",
    emoji: "\u{1F308}",
    cat: "design",
    bg: "rgba(239,68,68,0.2)",
    border: "rgba(239,68,68,0.4)",
  },
  {
    id: 8,
    label: "TS",
    emoji: "\u{1F4D8}",
    cat: "dev",
    bg: "rgba(14,165,233,0.2)",
    border: "rgba(14,165,233,0.4)",
  },
  {
    id: 9,
    label: "Charts",
    emoji: "\u{1F4C8}",
    cat: "data",
    bg: "rgba(168,85,247,0.2)",
    border: "rgba(168,85,247,0.4)",
  },
  {
    id: 10,
    label: "Proto",
    emoji: "\u{1F5BC}\uFE0F",
    cat: "design",
    bg: "rgba(109,40,217,0.2)",
    border: "rgba(109,40,217,0.4)",
  },
  {
    id: 11,
    label: "Rust",
    emoji: "\u{1F980}",
    cat: "dev",
    bg: "rgba(239,68,68,0.2)",
    border: "rgba(239,68,68,0.4)",
  },
  {
    id: 12,
    label: "ML",
    emoji: "\u{1F916}",
    cat: "data",
    bg: "rgba(59,130,246,0.2)",
    border: "rgba(59,130,246,0.4)",
  },
];
const filters = ["all", "design", "dev", "data"];

const order = ref(items.map((_, i) => i));
const filter = ref("all");
const gridEl = ref(null);
let savedRects = {};

function captureRects() {
  if (!gridEl.value) return;
  const rects = {};
  gridEl.value.querySelectorAll("[data-id]").forEach((el) => {
    rects[Number(el.dataset.id)] = el.getBoundingClientRect();
  });
  savedRects = rects;
}

function animateAfterUpdate() {
  nextTick(() => {
    if (!gridEl.value) return;
    const els = gridEl.value.querySelectorAll("[data-id]");
    els.forEach((el) => {
      const id = Number(el.dataset.id);
      const first = savedRects[id];
      const last = el.getBoundingClientRect();
      if (first) {
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx === 0 && dy === 0) return;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = "none";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = "";
            el.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            el.addEventListener(
              "transitionend",
              () => {
                el.style.transition = "";
              },
              { once: true }
            );
          });
        });
      } else {
        el.style.opacity = "0";
        el.style.transform = "scale(0.8)";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = "opacity 0.35s, transform 0.35s cubic-bezier(0.22,1,0.36,1)";
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
            el.addEventListener(
              "transitionend",
              () => {
                el.style.transition = "";
              },
              { once: true }
            );
          });
        });
      }
    });
  });
}

function shuffle() {
  captureRects();
  const arr = [...order.value];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  order.value = arr;
  animateAfterUpdate();
}

function changeFilter(f) {
  captureRects();
  filter.value = f;
  animateAfterUpdate();
}

const visible = computed(() =>
  order.value.filter((idx) => filter.value === "all" || items[idx].cat === filter.value)
);

function btnStyle(f) {
  const active = filter.value === f;
  return {
    padding: "0.45rem 0.9rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    border: `1px solid ${active ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "0.5rem",
    cursor: "pointer",
    background: active ? "#6d28d9" : "rgba(255,255,255,0.05)",
    color: active ? "#f4f4f5" : "#a1a1aa",
    textTransform: "capitalize",
  };
}
</script>

<template>
  <div style="min-height:100vh;background:#0a0a0a;display:grid;place-items:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#e4e4e7">
    <div style="width:min(560px,100%);display:flex;flex-direction:column;gap:1.25rem">
      <div>
        <h2 style="font-size:1.25rem;font-weight:700;color:#f4f4f5">Layout Animation</h2>
        <p style="font-size:0.8rem;color:#52525b;margin-top:0.25rem">FLIP technique for smooth layout transitions</p>
      </div>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button
          v-for="f in filters"
          :key="f"
          :style="btnStyle(f)"
          @click="changeFilter(f)"
        >{{ f }}</button>
        <button
          :style="{
            padding: '0.45rem 0.9rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)',
            color: '#a1a1aa',
          }"
          @click="shuffle"
        >Shuffle</button>
      </div>

      <div ref="gridEl" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.75rem">
        <div
          v-for="idx in visible"
          :key="items[idx].id"
          :data-id="items[idx].id"
          :style="{
            aspectRatio: '1',
            borderRadius: '0.75rem',
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.04em',
            background: items[idx].bg,
            border: `1px solid ${items[idx].border}`,
            willChange: 'transform',
          }"
        >
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.35rem">
            <span style="font-size:1.5rem">{{ items[idx].emoji }}</span>
            {{ items[idx].label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
