<script>
import { onMount, onDestroy } from "svelte";

let time = new Date();
let interval;

$: hours = time.getHours();
$: minutes = String(time.getMinutes()).padStart(2, "0");
$: seconds = String(time.getSeconds()).padStart(2, "0");
$: ampm = hours >= 12 ? "PM" : "AM";
$: h12 = String(hours % 12 || 12).padStart(2, "0");
$: dateStr = time.toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

onMount(() => {
  interval = setInterval(() => {
    time = new Date();
  }, 1000);
});

onDestroy(() => {
  clearInterval(interval);
});
</script>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
  <div class="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-10 py-8 text-center shadow-2xl">
    <div class="flex items-end justify-center gap-1 mb-2">
      <span class="text-[72px] font-mono font-bold text-[#e6edf3] leading-none tabular-nums">
        {h12}:{minutes}
      </span>
      <div class="flex flex-col items-start mb-2 gap-1">
        <span class="text-[28px] font-mono font-semibold text-[#58a6ff] leading-none tabular-nums">
          {seconds}
        </span>
        <span class="text-[14px] font-mono font-bold text-[#8b949e] leading-none">
          {ampm}
        </span>
      </div>
    </div>
    <p class="text-[14px] text-[#8b949e] tracking-wide">{dateStr}</p>
  </div>
</div>
