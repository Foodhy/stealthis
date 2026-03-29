<script setup>
import { ref } from "vue";

const COLORS = ["#1e2130", "#2a3a5c", "#3b5998", "#6366f1", "#a5b4fc"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function level(v) {
  if (v === 0) return 0;
  if (v < 2) return 1;
  if (v < 5) return 2;
  if (v < 9) return 3;
  return 4;
}

const tooltip = ref(null);

// Generate weeks data
const today = new Date();
const start = new Date(today);
start.setFullYear(start.getFullYear() - 1);
start.setDate(start.getDate() - start.getDay());
const weeks = [];
const d = new Date(start);
while (d <= today) {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const val = d <= today ? Math.floor(Math.pow(Math.random(), 1.5) * 15) : -1;
    week.push({ date: new Date(d), val });
    d.setDate(d.getDate() + 1);
  }
  weeks.push(week);
}

const CELL = 12;
const GAP = 2;
const STEP = CELL + GAP;
const LEFT_PAD = 28;
const TOP_PAD = 18;
const W = weeks.length * STEP + LEFT_PAD;
const H = 7 * STEP + TOP_PAD + 8;

const monthLabels = [];
let prevMonth = -1;
weeks.forEach((week, wi) => {
  const m = week[0].date.getMonth();
  if (m !== prevMonth) {
    prevMonth = m;
    monthLabels.push({ month: m, wi });
  }
});

function showTip(day, e) {
  const fmt = day.date.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  tooltip.value = {
    text: `${fmt} — ${day.val} contribution${day.val !== 1 ? "s" : ""}`,
    x: e.clientX,
    y: e.clientY,
  };
}
function moveTip(e) {
  if (tooltip.value) tooltip.value = { ...tooltip.value, x: e.clientX, y: e.clientY };
}
function hideTip() {
  tooltip.value = null;
}
</script>

<template>
  <div class="page">
    <div class="wrap">
      <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" :style="{ minWidth: W + 'px' }">
        <template v-for="(lbl, i) in DAY_LABELS" :key="'day'+i">
          <text v-if="lbl" :x="LEFT_PAD-4" :y="TOP_PAD+i*STEP+CELL-1" text-anchor="end" fill="#484f58" font-size="9">{{ lbl }}</text>
        </template>

        <text v-for="ml in monthLabels" :key="'m'+ml.month" :x="LEFT_PAD+ml.wi*STEP" :y="TOP_PAD-5" fill="#484f58" font-size="9">{{ MONTHS[ml.month] }}</text>

        <template v-for="(week, wi) in weeks" :key="'w'+wi">
          <template v-for="(day, di) in week" :key="`${wi}-${di}`">
            <rect v-if="day.val >= 0"
              :x="LEFT_PAD+wi*STEP" :y="TOP_PAD+di*STEP"
              :width="CELL" :height="CELL" rx="2"
              :fill="COLORS[level(day.val)]"
              style="cursor:pointer"
              @mouseenter="showTip(day, $event)"
              @mousemove="moveTip"
              @mouseleave="hideTip"
            />
          </template>
        </template>
      </svg>

      <div class="legend">
        <span class="legend-text">Less</span>
        <span v-for="(c, i) in COLORS" :key="i" class="legend-cell" :style="{ background: c }" />
        <span class="legend-text">More</span>
      </div>
    </div>

    <div v-if="tooltip" class="tip" :style="{ left: tooltip.x+12+'px', top: tooltip.y-40+'px' }">
      <span class="tip-text">{{ tooltip.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; }
.wrap { width: 100%; max-width: 900px; margin: 0 auto; overflow-x: auto; }
.legend { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.75rem; justify-content: flex-end; }
.legend-text { font-size: 10px; color: #484f58; }
.legend-cell { width: 12px; height: 12px; border-radius: 2px; }
.tip {
  position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d;
  border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50;
}
.tip-text { color: #e6edf3; }
</style>
