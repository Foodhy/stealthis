<script>
let liked = false;
let count = 142;
let burst = false;

const PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  angle: (i / 6) * 360,
  color: ["#ff6b6b", "#ff8e53", "#ff6b9d", "#c56cf0", "#ff9ff3", "#ffd32a"][i],
}));

const variants = [
  { icon: "\u2665", label: "Love", color: "#ff6b6b", initialCount: 248 },
  { icon: "\uD83D\uDC4D", label: "Like", color: "#58a6ff", initialCount: 1024 },
  { icon: "\u2605", label: "Star", color: "#f1e05a", initialCount: 87 },
];

let variantStates = variants.map((v) => ({
  active: false,
  count: v.initialCount,
}));

function toggle() {
  if (!liked) {
    burst = true;
    setTimeout(() => (burst = false), 600);
  }
  liked = !liked;
  count = liked ? count + 1 : count - 1;
}

function toggleVariant(i) {
  const s = variantStates[i];
  s.active = !s.active;
  s.count = s.active ? s.count + 1 : s.count - 1;
  variantStates = variantStates;
}
</script>

<div class="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-8 p-6">
  <!-- Single like button -->
  <div class="relative flex flex-col items-center">
    <button
      on:click={toggle}
      aria-label={liked ? "Unlike" : "Like"}
      class="relative flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-200 select-none"
      style="background: {liked ? 'rgba(255,107,107,0.12)' : 'rgba(255,255,255,0.04)'}; border-color: {liked ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.1)'}; transform: {burst ? 'scale(0.93)' : 'scale(1)'};"
    >
      <svg
        width="22" height="22" viewBox="0 0 24 24"
        fill={liked ? "#ff6b6b" : "none"}
        stroke={liked ? "#ff6b6b" : "#8b949e"}
        stroke-width="2"
        style="transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); transform: {liked ? 'scale(1.2)' : 'scale(1)'};"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span
        class="font-semibold text-sm tabular-nums transition-colors"
        style="color: {liked ? '#ff6b6b' : '#8b949e'};"
      >
        {count.toLocaleString()}
      </span>
    </button>

    <!-- Burst particles -->
    {#if burst}
      {#each PARTICLES as p, i}
        <span
          class="absolute w-2 h-2 rounded-full pointer-events-none"
          style="background: {p.color}; animation: particle-burst 0.6s ease-out both; --angle: {p.angle}deg;"
        ></span>
      {/each}
    {/if}
  </div>

  <!-- Variants showcase -->
  <div class="grid grid-cols-3 gap-4">
    {#each variants as v, i}
      <button
        on:click={() => toggleVariant(i)}
        class="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border transition-all duration-200"
        style="background: {variantStates[i].active ? v.color + '18' : 'rgba(255,255,255,0.03)'}; border-color: {variantStates[i].active ? v.color + '40' : 'rgba(255,255,255,0.08)'}; transform: {variantStates[i].active ? 'scale(1.05)' : 'scale(1)'};"
      >
        <span
          class="text-2xl"
          style="filter: {variantStates[i].active ? 'none' : 'grayscale(1) opacity(0.4)'}; transition: filter 0.2s;"
        >
          {v.icon}
        </span>
        <span
          class="text-xs font-semibold tabular-nums"
          style="color: {variantStates[i].active ? v.color : '#8b949e'};"
        >
          {variantStates[i].count.toLocaleString()}
        </span>
        <span class="text-[10px] text-[#484f58]">{v.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  @keyframes particle-burst {
    0%   { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(calc(cos(var(--angle)) * 32px), calc(sin(var(--angle)) * 32px)) scale(0); opacity: 0; }
  }
</style>
