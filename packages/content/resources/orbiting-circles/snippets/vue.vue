<script setup lang="ts">
import { computed, onMounted } from "vue";

const props = defineProps({
  rings: {
    type: Array,
    default: () => [
      {
        items: [{ content: "♦" }, { content: "♣" }],
        radius: 80,
        duration: 8,
      },
      {
        items: [{ content: "★" }, { content: "♥" }, { content: "✦" }],
        radius: 130,
        duration: 15,
        reverse: true,
      },
      {
        items: [{ content: "☼" }, { content: "✶" }, { content: "✿" }, { content: "☾" }],
        radius: 190,
        duration: 22,
      },
    ],
  },
  class: { type: [String, Object, Array], default: "" },
});

const containerSize = computed(
  () => Math.max(...(props.rings as any[]).map((r) => r.radius)) * 2 + 60
);

function getItemSize(radius: number) {
  return radius > 150 ? 42 : 36;
}

function getFontSize(radius: number) {
  return radius > 150 ? 16 : 14;
}

function getOrbitStyle(ring: any, ri: number, ii: number) {
  const startAngle = (360 / ring.items.length) * ii;
  const dir = ring.reverse ? "reverse" : "normal";
  const size = getItemSize(ring.radius);
  const animName = `oc-orbit-${ri}`;
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: size + "px",
    height: size + "px",
    marginLeft: -size / 2 + "px",
    marginTop: -size / 2 + "px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
    animation: `${animName} ${ring.duration}s linear infinite ${dir}`,
    "--start-angle": `${startAngle}deg`,
    "--radius": `${ring.radius}px`,
  } as any;
}

function getCounterStyle(ring: any) {
  const dir = ring.reverse ? "reverse" : "normal";
  return {
    fontSize: getFontSize(ring.radius) + "px",
    color: "rgba(199,210,254,0.9)",
    lineHeight: "1",
    animation: `oc-counter-spin ${ring.duration}s linear infinite ${dir}`,
  };
}

onMounted(() => {
  const styleId = "orbiting-circles-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes oc-counter-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
      ${props.rings
        .map(
          (ring: any, ri: number) => `
        @keyframes oc-orbit-${ri} {
          from { transform: rotate(var(--start-angle, 0deg)) translateX(var(--radius, 100px)); }
          to { transform: rotate(calc(var(--start-angle, 0deg) + 360deg)) translateX(var(--radius, 100px)); }
        }
      `
        )
        .join("")}
    `;
    document.head.appendChild(style);
  }
});
</script>

<template>
  <div :class="props.class" :style="{
    position: 'relative',
    width: containerSize + 'px',
    height: containerSize + 'px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }">
    <!-- Center -->
    <div style="
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: grid; place-items: center; color: white;
      box-shadow: 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2);
      z-index: 10;
    ">
      <slot name="center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </slot>
    </div>

    <!-- Ring guides -->
    <div
      v-for="(ring, ri) in rings"
      :key="'ring-' + ri"
      :style="{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: typeof ring === 'object' && ring !== null && 'radius' in ring ? (ring.radius as number) * 2 + 'px' : '0px',
        height: typeof ring === 'object' && ring !== null && 'radius' in ring ? (ring.radius as number) * 2 + 'px' : '0px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }"
    />

    <!-- Orbiting items -->
    <template v-for="(ring, ri) in rings" :key="'orbit-' + ri">
      <div
        v-if="typeof ring === 'object' && ring !== null && 'items' in ring"
        v-for="(item, ii) in ring.items"
        :key="ri + '-' + ii"
        :style="getOrbitStyle(ring, ri, ii)"
      >
        <span :style="getCounterStyle(ring)">
          {{ typeof item === 'object' && item !== null && 'content' in item ? item.content : '' }}
        </span>
      </div>
    </template>
  </div>
</template>
