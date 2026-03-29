<script>
const IMAGES = [
  { label: "Code snippet", colors: ["#0d1117", "#161b22", "#21262d"], accent: "#58a6ff" },
  { label: "UI design", colors: ["#1a0533", "#2d1b69", "#553c9a"], accent: "#bc8cff" },
  { label: "Data chart", colors: ["#021d1a", "#033028", "#065f46"], accent: "#7ee787" },
];

const LENS = 80;
const ZOOM = 2.5;
const DOT_COLORS = ["#f85149", "#f1e05a", "#7ee787"];
const LINE_WIDTHS = [90, 70, 80, 60, 85];

let mouseStates = IMAGES.map(() => null);
let containerEls = [];

function onMove(idx, e) {
  const rect = containerEls[idx]?.getBoundingClientRect();
  if (!rect) return;
  mouseStates[idx] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  mouseStates = [...mouseStates];
}

function onLeave(idx) {
  mouseStates[idx] = null;
  mouseStates = [...mouseStates];
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
</script>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
  <div class="w-full max-w-sm space-y-4">
    <h2 class="text-[#e6edf3] font-bold text-lg mb-4">Zoom / Magnifier</h2>

    {#each IMAGES as img, idx}
      <div>
        <p class="text-[#8b949e] text-xs mb-1.5">{img.label}</p>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          bind:this={containerEls[idx]}
          class="relative rounded-xl overflow-hidden border border-[#30363d] cursor-crosshair"
          style="height: 140px;"
          on:mousemove={(e) => onMove(idx, e)}
          on:mouseleave={() => onLeave(idx)}
        >
          <!-- MockImage -->
          <div class="w-full h-full flex flex-col gap-2 p-4" style="background: {img.colors[0]}">
            <div class="flex gap-1.5 mb-1">
              {#each DOT_COLORS as c}
                <div class="w-2.5 h-2.5 rounded-full" style="background: {c}" />
              {/each}
            </div>
            {#each LINE_WIDTHS as w, i}
              <div class="h-1.5 rounded-full" style="width: {w}%; background: {i % 2 === 0 ? img.accent : img.colors[2]}; opacity: 0.7;" />
            {/each}
            <div class="mt-2 grid grid-cols-3 gap-1.5">
              {#each [1, 2, 3] as _}
                <div class="h-6 rounded" style="background: {img.colors[1]}; border: 1px solid {img.accent}30;" />
              {/each}
            </div>
          </div>

          {#if mouseStates[idx]}
            <!-- Lens highlight -->
            <div
              class="absolute rounded-full border-2 border-white/50 pointer-events-none z-10"
              style="width: {LENS}px; height: {LENS}px; left: {clamp(mouseStates[idx].x - LENS / 2, 0, (containerEls[idx]?.offsetWidth ?? 300) - LENS)}px; top: {clamp(mouseStates[idx].y - LENS / 2, 0, (containerEls[idx]?.offsetHeight ?? 200) - LENS)}px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.4);"
            />
            <!-- Zoomed preview -->
            <div
              class="absolute bottom-2 right-2 rounded-lg border-2 border-white/20 overflow-hidden z-20 shadow-xl pointer-events-none"
              style="width: 100px; height: 100px;"
            >
              <div
                style="width: {(containerEls[idx]?.offsetWidth ?? 300) * ZOOM}px; height: {(containerEls[idx]?.offsetHeight ?? 140) * ZOOM}px; transform: translate(-{mouseStates[idx].x * ZOOM - 50}px, -{mouseStates[idx].y * ZOOM - 50}px);"
              >
                <div style="width: {containerEls[idx]?.offsetWidth ?? 300}px; height: {containerEls[idx]?.offsetHeight ?? 140}px; transform: scale({ZOOM}); transform-origin: top left;">
                  <div class="w-full h-full flex flex-col gap-2 p-4" style="background: {img.colors[0]}">
                    <div class="flex gap-1.5 mb-1">
                      {#each DOT_COLORS as c}
                        <div class="w-2.5 h-2.5 rounded-full" style="background: {c}" />
                      {/each}
                    </div>
                    {#each LINE_WIDTHS as w, i}
                      <div class="h-1.5 rounded-full" style="width: {w}%; background: {i % 2 === 0 ? img.accent : img.colors[2]}; opacity: 0.7;" />
                    {/each}
                    <div class="mt-2 grid grid-cols-3 gap-1.5">
                      {#each [1, 2, 3] as _}
                        <div class="h-6 rounded" style="background: {img.colors[1]}; border: 1px solid {img.accent}30;" />
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/each}

    <p class="text-[11px] text-center text-[#484f58]">Hover over an image to magnify</p>
  </div>
</div>
