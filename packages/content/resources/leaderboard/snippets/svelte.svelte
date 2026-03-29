<script>
import { onDestroy } from "svelte";

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

let users = INITIAL_USERS.map((u) => ({ ...u }));
let live = false;
let intervalId = null;
let barWidths = {};

$: sorted = [...users].sort((a, b) => b.score - a.score).map((u, i) => ({ ...u, rank: i + 1 }));
$: maxScore = sorted[0].score * 1.1;

function animateBars() {
  sorted.forEach((u) => {
    barWidths[u.id] = "0%";
  });
  barWidths = barWidths;
  setTimeout(() => {
    sorted.forEach((u) => {
      barWidths[u.id] = ((u.score / maxScore) * 100).toFixed(1) + "%";
    });
    barWidths = barWidths;
  }, 50);
}

function getBarWidth(u) {
  return barWidths[u.id] || ((u.score / maxScore) * 100).toFixed(1) + "%";
}

function toggleLive() {
  live = !live;
  if (live) {
    intervalId = setInterval(() => {
      users = users.map((u) => ({
        ...u,
        prevRank: sorted.find((s) => s.id === u.id)?.rank || u.prevRank,
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

function getRankDiff(u) {
  return (u.prevRank || u.rank) - u.rank;
}

onDestroy(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<div style="min-height:100vh;background:#0d1117;padding:1.5rem;display:flex;justify-content:center;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
  <div style="width:100%;max-width:560px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
      <h2 style="font-weight:700;font-size:16px;margin:0">Leaderboard</h2>
      <button
        on:click={toggleLive}
        style="padding:0.375rem 0.75rem;border-radius:0.5rem;font-size:12px;font-weight:600;cursor:pointer;border:1px solid {live ? '#34d399' : '#30363d'};background:{live ? 'rgba(52,211,153,0.2)' : 'transparent'};color:{live ? '#34d399' : '#8b949e'}"
      >{live ? '\u25A0 Stop Live' : '\u25B6 Start Live'}</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:0.5rem">
      {#each sorted as u (u.id)}
        <div style="background:#161b22;border:1px solid #30363d;border-radius:0.75rem;padding:0.75rem 1rem;display:flex;align-items:center;gap:0.75rem">
          <div style="width:1.5rem;text-align:center;font-weight:700;font-size:14px;color:{rankColor(u.rank)}">
            {rankIcon(u.rank)}
          </div>

          <div style="font-size:10px;width:2rem;text-align:center">
            {#if getRankDiff(u) > 0}
              <span style="color:#34d399">\u25B2{getRankDiff(u)}</span>
            {:else if getRankDiff(u) < 0}
              <span style="color:#f87171">\u25BC{Math.abs(getRankDiff(u))}</span>
            {:else}
              <span style="color:#484f58">\u2014</span>
            {/if}
          </div>

          <div style="width:2rem;height:2rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;background:{COLORS[u.id % COLORS.length]}">
            {initials(u.name)}
          </div>

          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{u.name}</div>
            <div style="margin-top:0.25rem;height:0.5rem;background:#21262d;border-radius:9999px;overflow:hidden">
              <div style="height:100%;border-radius:9999px;background:{COLORS[u.id % COLORS.length]};transition:width 0.5s ease-out;width:{getBarWidth(u)}"></div>
            </div>
          </div>

          <div style="font-weight:700;font-size:14px;font-variant-numeric:tabular-nums">{u.score.toLocaleString()}</div>
        </div>
      {/each}
    </div>
  </div>
</div>
