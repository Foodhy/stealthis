<script>
import { onMount, onDestroy } from "svelte";

function pad(n) {
  return String(n).padStart(2, "0");
}

let targetDate = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 16);
})();
let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
let expired = false;
let intervalId;

function calc() {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    expired = true;
    return;
  }
  expired = false;
  timeLeft = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

$: targetDate,
  (() => {
    calc();
    clearInterval(intervalId);
    intervalId = setInterval(calc, 1000);
  })();

onDestroy(() => clearInterval(intervalId));

$: units = [
  { label: "Days", value: timeLeft.days },
  { label: "Hours", value: timeLeft.hours },
  { label: "Minutes", value: timeLeft.minutes },
  { label: "Seconds", value: timeLeft.seconds },
];
</script>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
  <div class="w-full max-w-lg">
    <h2 class="text-center text-[#e6edf3] font-bold text-xl mb-6">Countdown Timer</h2>
    <div class="mb-6 flex justify-center">
      <input type="datetime-local" bind:value={targetDate} class="bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#58a6ff]"/>
    </div>
    {#if expired}
      <p class="text-center text-[#f85149] font-semibold text-lg">Time's up!</p>
    {:else}
      <div class="grid grid-cols-4 gap-3">
        {#each units as { label, value }}
          <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-center">
            <p class="text-[40px] font-mono font-bold text-[#58a6ff] tabular-nums leading-none mb-1">{pad(value)}</p>
            <p class="text-[11px] text-[#8b949e] uppercase tracking-wider">{label}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
