<script>
let activeStep = null;
let mode = "driving";

const ROUTE = {
  origin: "1 Hacker Way, Menlo Park",
  destination: "Ferry Building, San Francisco",
  totalDistance: "28.4 mi",
  totalDuration: "38 min",
  steps: [
    {
      id: 1,
      turn: "depart",
      instruction: "Head north",
      street: "Hacker Way",
      distance: "0.2 mi",
      duration: "1 min",
    },
    {
      id: 2,
      turn: "right",
      instruction: "Turn right",
      street: "Willow Rd",
      distance: "0.8 mi",
      duration: "2 min",
    },
    {
      id: 3,
      turn: "slight-left",
      instruction: "Slight left",
      street: "US-101 N",
      distance: "14.2 mi",
      duration: "16 min",
    },
    {
      id: 4,
      turn: "left",
      instruction: "Take exit 430B",
      street: "I-80 E",
      distance: "5.4 mi",
      duration: "8 min",
    },
    {
      id: 5,
      turn: "straight",
      instruction: "Continue on",
      street: "Bay Bridge",
      distance: "4.5 mi",
      duration: "6 min",
    },
    {
      id: 6,
      turn: "right",
      instruction: "Turn right",
      street: "Fremont St",
      distance: "0.9 mi",
      duration: "3 min",
    },
    {
      id: 7,
      turn: "slight-right",
      instruction: "Slight right",
      street: "The Embarcadero",
      distance: "2.1 mi",
      duration: "4 min",
    },
    {
      id: 8,
      turn: "arrive",
      instruction: "Arrive at",
      street: "Ferry Building",
      distance: "",
      duration: "",
    },
  ],
};

const modes = [
  { id: "driving", label: "Drive" },
  { id: "walking", label: "Walk" },
  { id: "cycling", label: "Bike" },
];

const durations = { driving: "38 min", walking: "6 h 20 min", cycling: "2 h 10 min" };

function toggleStep(id) {
  activeStep = activeStep === id ? null : id;
}

function iconColor(step) {
  const active = activeStep === step.id || step.turn === "arrive" || step.turn === "depart";
  return active ? "white" : "#8b949e";
}
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
  <div class="w-full max-w-[440px] space-y-3">
    <div class="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="p-4 bg-[#21262d] border-b border-[#30363d] space-y-3">
        <div class="flex gap-1 bg-[#161b22] rounded-xl p-1">
          {#each modes as m}
            <button
              on:click={() => (mode = m.id)}
              class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors {mode === m.id ? 'bg-[#58a6ff] text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'}"
            >
              {#if m.id === "driving"}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
              {:else if m.id === "walking"}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M5 22l2-8 4 2 4-2 2 8"/><path d="M8 14l-2 8M16 14l2 8"/></svg>
              {:else}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3"/></svg>
              {/if}
              {m.label}
            </button>
          {/each}
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="flex flex-col items-center gap-1 flex-shrink-0">
              <div class="w-2 h-2 rounded-full bg-green-400 border-2 border-green-400"></div>
              <div class="w-px h-4 bg-[#30363d]"></div>
              <div class="w-2 h-2 rounded-full bg-[#58a6ff]"></div>
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-[11px] text-[#8b949e] truncate">{ROUTE.origin}</p>
              <p class="text-[11px] text-[#e6edf3] font-semibold truncate">{ROUTE.destination}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 pl-4">
            <span class="text-[13px] font-bold text-[#e6edf3]">{durations[mode]}</span>
            <span class="text-[12px] text-[#8b949e]">({ROUTE.totalDistance})</span>
            <span class="ml-auto text-[10px] text-green-400 font-semibold">Fastest route</span>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="max-h-[360px] overflow-y-auto">
        {#each ROUTE.steps as step, i}
          {@const isActive = activeStep === step.id}
          {@const isLast = i === ROUTE.steps.length - 1}
          {@const showIcon = isActive || step.turn === "arrive" || step.turn === "depart"}
          <div
            class="flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#21262d] last:border-0 {isActive ? 'bg-[#58a6ff]/[0.08]' : 'hover:bg-white/[0.02]'}"
            on:click={() => toggleStep(step.id)}
          >
            <div class="flex flex-col items-center flex-shrink-0">
              <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors {step.turn === 'arrive' ? 'bg-[#58a6ff]/20 border border-[#58a6ff]/40' : step.turn === 'depart' ? 'bg-green-500/20 border border-green-500/30' : isActive ? 'bg-[#58a6ff]/20 border border-[#58a6ff]/40' : 'bg-[#21262d] border border-[#30363d]'}">
                {#if step.turn === "straight"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor(step)} stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>
                {:else if step.turn === "left"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor(step)} stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/><line x1="9" y1="12" x2="9" y2="20"/><line x1="9" y1="20" x2="16" y2="20"/></svg>
                {:else if step.turn === "right"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor(step)} stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/><line x1="15" y1="12" x2="15" y2="20"/><line x1="15" y1="20" x2="8" y2="20"/></svg>
                {:else if step.turn === "slight-left"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor(step)} stroke-width="2.5" stroke-linecap="round"><path d="M12 19V5M12 5L7 10"/></svg>
                {:else if step.turn === "slight-right"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor(step)} stroke-width="2.5" stroke-linecap="round"><path d="M12 19V5M12 5L17 10"/></svg>
                {:else if step.turn === "depart"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={iconColor(step)} stroke="none"><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="9" fill="none" stroke={iconColor(step)} stroke-width="2"/></svg>
                {:else if step.turn === "arrive"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor(step)} stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill={iconColor(step)} stroke="none"/></svg>
                {/if}
              </div>
              {#if !isLast}
                <div class="w-px mt-1 flex-1 min-h-[8px]"
                  style="background: {isActive ? '#58a6ff44' : '#21262d'}; {isActive ? 'animation: flow 1s linear infinite;' : ''}"></div>
              {/if}
            </div>
            <div class="flex-1 min-w-0 pt-1">
              <p class="text-[12px] font-semibold {isActive ? 'text-[#e6edf3]' : 'text-[#8b949e]'}">
                {step.instruction}{" "}
                <span class="font-bold {isActive ? 'text-[#58a6ff]' : 'text-[#e6edf3]'}">{step.street}</span>
              </p>
              {#if step.distance || step.duration}
                <p class="text-[10px] text-[#484f58] mt-0.5">
                  {step.distance}{step.distance && step.duration ? " \u00b7 " : ""}{step.duration}
                </p>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-4 py-3 bg-[#21262d] border-t border-[#30363d]">
        <div class="text-[12px]">
          <span class="font-bold text-[#e6edf3]">{ROUTE.totalDistance}</span>
          <span class="text-[#8b949e] ml-2">{durations[mode]}</span>
        </div>
        <button class="flex items-center gap-1.5 px-3 py-1.5 bg-[#58a6ff] rounded-lg text-[12px] font-bold text-white hover:bg-[#79b8ff] transition-colors">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Start
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes flow {
    0% { background: #21262d; }
    50% { background: #58a6ff44; }
    100% { background: #21262d; }
  }
</style>
