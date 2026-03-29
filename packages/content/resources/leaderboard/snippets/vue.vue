<script setup>
import { ref, computed, onUnmounted } from "vue";

const INITIAL_USERS = [
  { id: 1, name: "Alice Smith", score: 9850, prevRank: 1 },
  { id: 2, name: "Bob Johnson", score: 8420, prevRank: 2 },
  { id: 3, name: "Carol Williams", score: 8100, prevRank: 3 },
  { id: 4, name: "David Brown", score: 7650, prevRank: 4 },
  { id: 5, name: "Eve Davis", score: 6980, prevRank: 5 },
  { id: 6, name: "Frank Miller", score: 6200, prevRank: 6 },
  { id: 7, name: "Grace Wilson", score: 5800, prevRank: 7 },
];
const COLORS = ["#818cf8", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#38bdf8", "#fb7185"];

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

const users = ref(INITIAL_USERS.map((u) => ({ ...u })));
const live = ref(false);
const barWidths = ref({});
let intervalId = null;

const sorted = computed(() =>
  [...users.value].sort((a, b) => b.score - a.score).map((u, i) => ({ ...u, rank: i + 1 }))
);
const maxScore = computed(() => sorted.value[0].score * 1.1);

function animateBars() {
  sorted.value.forEach((u) => {
    barWidths.value[u.id] = "0%";
  });
  setTimeout(() => {
    sorted.value.forEach((u) => {
      barWidths.value[u.id] = ((u.score / maxScore.value) * 100).toFixed(1) + "%";
    });
  }, 50);
}

function getBarWidth(u) {
  return barWidths.value[u.id] || ((u.score / maxScore.value) * 100).toFixed(1) + "%";
}

function toggleLive() {
  live.value = !live.value;
  if (live.value) {
    intervalId = setInterval(() => {
      users.value = users.value.map((u) => ({
        ...u,
        prevRank: sorted.value.find((s) => s.id === u.id)?.rank || u.prevRank,
        score: u.score + Math.floor(Math.random() * 500),
      }));
      animateBars();
    }, 2500);
  } else {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function rankColor(rank) {
  if (rank === 1) return "#f59e0b";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#b45309";
  return "#484f58";
}

function rankIcon(rank) {
  if (rank <= 3) return ["\u{1F947}", "\u{1F948}", "\u{1F949}"][rank - 1];
  return String(rank);
}

function rankDiff(u) {
  return (u.prevRank || u.rank) - u.rank;
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div style="min-height:100vh;background:#0d1117;padding:1.5rem;display:flex;justify-content:center;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
    <div style="width:100%;max-width:560px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
        <h2 style="font-weight:700;font-size:16px;margin:0">Leaderboard</h2>
        <button
          @click="toggleLive"
          :style="{
            padding: '0.375rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            border: live ? '1px solid #34d399' : '1px solid #30363d',
            background: live ? 'rgba(52,211,153,0.2)' : 'transparent',
            color: live ? '#34d399' : '#8b949e',
          }"
        >{{ live ? '\u25A0 Stop Live' : '\u25B6 Start Live' }}</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.5rem">
        <div
          v-for="u in sorted"
          :key="u.id"
          style="background:#161b22;border:1px solid #30363d;border-radius:0.75rem;padding:0.75rem 1rem;display:flex;align-items:center;gap:0.75rem"
        >
          <div :style="{ width: '1.5rem', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: rankColor(u.rank) }">
            {{ rankIcon(u.rank) }}
          </div>

          <div style="font-size:10px;width:2rem;text-align:center">
            <span v-if="rankDiff(u) > 0" style="color:#34d399">\u25B2{{ rankDiff(u) }}</span>
            <span v-else-if="rankDiff(u) < 0" style="color:#f87171">\u25BC{{ Math.abs(rankDiff(u)) }}</span>
            <span v-else style="color:#484f58">\u2014</span>
          </div>

          <div
            :style="{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
              color: '#fff',
              flexShrink: '0',
              background: COLORS[u.id % COLORS.length],
            }"
          >{{ initials(u.name) }}</div>

          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ u.name }}</div>
            <div style="margin-top:0.25rem;height:0.5rem;background:#21262d;border-radius:9999px;overflow:hidden">
              <div
                :style="{
                  height: '100%',
                  borderRadius: '9999px',
                  background: COLORS[u.id % COLORS.length],
                  transition: 'width 0.5s ease-out',
                  width: getBarWidth(u),
                }"
              />
            </div>
          </div>

          <div style="font-weight:700;font-size:14px;font-variant-numeric:tabular-nums">{{ u.score.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
