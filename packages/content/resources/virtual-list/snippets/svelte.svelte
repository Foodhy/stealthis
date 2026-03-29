<script>
import { onMount, onDestroy } from "svelte";

const TOTAL = 5000;
const ROW_HEIGHT = 44;
const OVERSCAN = 8;

const DATA = Array.from({ length: TOTAL }, (_, index) => ({
  id: index + 1,
  label: `Record #${index + 1}`,
  group: `Group ${String((index % 8) + 1).padStart(2, "0")}`,
}));

let viewportEl;
let scrollTop = 0;
let viewHeight = 460;
let jumpTo = "250";
let observer;

$: startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
$: endIdx = Math.min(TOTAL, Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN);
$: rows = DATA.slice(startIdx, endIdx);

onMount(() => {
  if (viewportEl) {
    viewHeight = viewportEl.clientHeight;
    observer = new ResizeObserver(() => {
      viewHeight = viewportEl.clientHeight;
    });
    observer.observe(viewportEl);
  }
});

onDestroy(() => {
  if (observer) observer.disconnect();
});

function onScroll(e) {
  scrollTop = e.currentTarget.scrollTop;
}

function jump() {
  const value = parseInt(jumpTo, 10);
  if (!isFinite(value)) return;
  const clamped = Math.min(TOTAL, Math.max(1, value));
  if (viewportEl) {
    viewportEl.scrollTo({ top: (clamped - 1) * ROW_HEIGHT, behavior: "smooth" });
  }
}
</script>

<section class="min-h-screen bg-[#0d1117] px-4 py-6 text-[#e6edf3]">
  <div class="mx-auto max-w-4xl space-y-4">
    <header class="rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
      <p class="text-xs font-bold uppercase tracking-wide text-[#8b949e]">Pattern</p>
      <h1 class="mt-1 text-lg font-bold">Virtual List</h1>
      <p class="mt-1 text-sm text-[#8b949e]">
        Windowed rendering keeps a 5,000-row list responsive.
      </p>
    </header>

    <div class="flex flex-wrap items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] p-3">
      <label class="text-xs font-semibold text-[#8b949e]">
        Jump to row
        <input
          bind:value={jumpTo}
          class="ml-2 w-24 rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-[#e6edf3] outline-none focus:border-[#58a6ff]"
        />
      </label>
      <button
        type="button"
        on:click={jump}
        class="rounded-md border border-[#58a6ff]/45 bg-[#58a6ff]/15 px-3 py-1.5 text-xs font-semibold text-[#c9e6ff] transition-colors hover:bg-[#58a6ff]/25"
      >
        Scroll
      </button>
      <p class="text-xs text-[#8b949e]">
        Rendering rows
        <span class="font-semibold text-[#e6edf3]">{startIdx + 1}</span>
        {" - "}
        <span class="font-semibold text-[#e6edf3]">{endIdx}</span> of
        <span class="font-semibold text-[#e6edf3]">{TOTAL}</span>
      </p>
    </div>

    <div
      bind:this={viewportEl}
      class="relative h-[62vh] min-h-[360px] overflow-auto rounded-2xl border border-[#30363d] bg-[#111827]"
      on:scroll={onScroll}
    >
      <div style="height: {TOTAL * ROW_HEIGHT}px;" />
      <div
        class="absolute left-0 top-0 w-full"
        style="transform: translateY({startIdx * ROW_HEIGHT}px);"
      >
        {#each rows as row (row.id)}
          <div
            class="grid h-11 grid-cols-[1fr_auto] items-center border-b border-white/5 px-3 text-sm odd:bg-white/[0.01]"
          >
            <div class="flex items-center gap-3">
              <span class="w-14 font-mono text-xs text-[#8b949e]">#{row.id}</span>
              <span class="text-[#dce6f2]">{row.label}</span>
            </div>
            <span class="font-mono text-xs text-sky-300">{row.group}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
