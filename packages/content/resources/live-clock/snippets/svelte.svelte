<script>
import { onMount, onDestroy } from "svelte";

let now = new Date();
let intervalId;

onMount(() => {
  intervalId = setInterval(() => {
    now = new Date();
  }, 1000);
});

onDestroy(() => {
  if (intervalId) clearInterval(intervalId);
});

$: h = now.getHours() % 12;
$: m = now.getMinutes();
$: s = now.getSeconds();
$: hourDeg = (h / 12) * 360 + (m / 60) * 30;
$: minDeg = (m / 60) * 360 + (s / 60) * 6;
$: secDeg = (s / 60) * 360;

$: timeStr = now.toLocaleTimeString(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
$: dateStr = now.toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const zones = [
  { city: "New York", offset: -5 },
  { city: "London", offset: 0 },
  { city: "Tokyo", offset: 9 },
];

$: ticks = Array.from({ length: 12 }, (_, i) => {
  const angle = ((i / 12) * 360 * Math.PI) / 180;
  return {
    x1: 100 + 80 * Math.sin(angle),
    y1: 100 - 80 * Math.cos(angle),
    x2: 100 + 88 * Math.sin(angle),
    y2: 100 - 88 * Math.cos(angle),
  };
});

function cityTime(offset) {
  return new Date(now.getTime() + (now.getTimezoneOffset() + offset * 60) * 60000);
}
</script>

<div class="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-6 p-6">
  <div class="flex flex-col items-center gap-2">
    <!-- Analog Clock -->
    <svg viewBox="0 0 200 200" class="w-48 h-48">
      <circle cx="100" cy="100" r="96" fill="#161b22" stroke="#30363d" stroke-width="2" />
      {#each ticks as tick, i}
        <line
          x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
          stroke="#484f58" stroke-width="2.5" stroke-linecap="round"
        />
      {/each}
      <!-- Hour hand -->
      <line
        x1="100" y1="100"
        x2={100 + 50 * Math.sin((hourDeg * Math.PI) / 180)}
        y2={100 - 50 * Math.cos((hourDeg * Math.PI) / 180)}
        stroke="#e6edf3" stroke-width="4" stroke-linecap="round"
      />
      <!-- Minute hand -->
      <line
        x1="100" y1="100"
        x2={100 + 70 * Math.sin((minDeg * Math.PI) / 180)}
        y2={100 - 70 * Math.cos((minDeg * Math.PI) / 180)}
        stroke="#e6edf3" stroke-width="2.5" stroke-linecap="round"
      />
      <!-- Second hand -->
      <line
        x1="100" y1="100"
        x2={100 + 75 * Math.sin((secDeg * Math.PI) / 180)}
        y2={100 - 75 * Math.cos((secDeg * Math.PI) / 180)}
        stroke="#f85149" stroke-width="1.5" stroke-linecap="round"
      />
      <circle cx="100" cy="100" r="4" fill="#f85149" />
    </svg>

    <p class="font-mono text-[36px] font-bold text-[#e6edf3] tabular-nums">{timeStr}</p>
    <p class="text-[#8b949e] text-sm">{dateStr}</p>
  </div>

  <div class="flex gap-4">
    {#each zones as zone}
      <div class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-center">
        <p class="text-[11px] text-[#484f58] uppercase tracking-wider mb-1">{zone.city}</p>
        <p class="font-mono text-[14px] font-bold text-[#e6edf3] tabular-nums">
          {cityTime(zone.offset).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    {/each}
  </div>
</div>
