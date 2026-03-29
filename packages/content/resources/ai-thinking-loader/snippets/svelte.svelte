<script>
let active = null;
function toggle(i) {
  active = active === i ? null : i;
}
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
  <div class="w-full max-w-[720px]">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Dots Pulse -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 0 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(0)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Dots Pulse</p>
        <div class="flex items-center gap-1.5">
          {#each [0, 1, 2] as i}
            <span class="w-2 h-2 rounded-full bg-[#58a6ff] animate-bounce" style="animation-delay:{i * 150}ms;animation-duration:0.8s"></span>
          {/each}
          <span class="ml-1 text-[13px] text-[#8b949e]">Thinking…</span>
        </div>
      </div>
      <!-- Shimmer Bar -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 1 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(1)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Shimmer Bar</p>
        <div class="space-y-2 w-full max-w-[320px]">
          {#each [100, 80, 60] as w}
            <div class="h-3 rounded-full bg-gradient-to-r from-[#21262d] via-[#30363d] to-[#21262d] bg-[length:200%_100%] animate-shimmer" style="width:{w}%"></div>
          {/each}
        </div>
      </div>
      <!-- Orbit Ring -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 2 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(2)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Orbit Ring</p>
        <div class="flex items-center gap-3">
          <div class="relative w-8 h-8">
            <div class="absolute inset-0 rounded-full border-2 border-[#30363d]"></div>
            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin"></div>
            <div class="absolute inset-1 rounded-full bg-[#58a6ff]/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v4l3 3"/></svg>
            </div>
          </div>
          <span class="text-[13px] text-[#8b949e]">Processing…</span>
        </div>
      </div>
      <!-- Wave Bars -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 3 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(3)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Wave Bars</p>
        <div class="flex items-center gap-3">
          <div class="flex items-end gap-0.5 h-6">
            {#each [0, 1, 2, 3, 4] as i}
              <div class="w-1 rounded-full bg-[#bc8cff]" style="animation:wave 0.9s ease-in-out {i * 0.1}s infinite;height:60%"></div>
            {/each}
          </div>
          <span class="text-[13px] text-[#8b949e]">Analyzing…</span>
        </div>
      </div>
      <!-- Typing Cursor -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 4 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(4)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Typing Cursor</p>
        <div class="flex items-center gap-1">
          <span class="text-[13px] text-[#8b949e]">Generating response</span>
          <span class="inline-block w-0.5 h-4 bg-[#58a6ff] animate-pulse rounded-sm" style="animation-duration:0.7s"></span>
        </div>
      </div>
      <!-- Brain Pulse -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 5 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(5)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Brain Pulse</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20 border border-[#58a6ff]/20 flex items-center justify-center animate-pulse">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 14.5 2z"/><path d="M5 8.5a2.5 2.5 0 1 1 4 2"/><path d="M15 8.5a2.5 2.5 0 1 0-4 2"/></svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-[#e6edf3]">Deep reasoning</p>
            <p class="text-[11px] text-[#484f58]">Working through the problem…</p>
          </div>
        </div>
      </div>
      <!-- Token Stream -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 6 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(6)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Token Stream</p>
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-[#484f58] font-mono">tokens/s</span>
            <div class="flex-1 h-1 bg-[#21262d] rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full animate-tokenbar"></div></div>
            <span class="text-[11px] text-green-400 font-mono">~48</span>
          </div>
          <div class="font-mono text-[12px] text-[#8b949e] overflow-hidden whitespace-nowrap">
            {#each "The answer to your question involves ".split("") as ch, i}
              <span class="inline-block" style="animation:fade-in 0.05s {i * 0.04}s both">{ch}</span>
            {/each}
            <span class="inline-block w-0.5 h-3.5 bg-[#58a6ff] align-middle animate-pulse ml-px"></span>
          </div>
        </div>
      </div>
      <!-- Step Progress -->
      <div class="bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors {active === 7 ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'}" on:click={() => toggle(7)}>
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">Step Progress</p>
        <div class="space-y-1.5">
          {#each ["Reading context", "Planning response", "Generating", "Reviewing"] as step, i}
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style="animation:step-reveal 0.3s {i * 0.8}s both;opacity:0">
                {#if i < 2}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ee787" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else if i === 2}
                  <div class="w-3 h-3 rounded-full border-2 border-[#e3b341] border-t-transparent animate-spin"></div>
                {:else}
                  <div class="w-2 h-2 rounded-full bg-[#484f58]"></div>
                {/if}
              </div>
              <span class="text-[12px] {i < 2 ? 'text-[#7ee787] line-through' : i === 2 ? 'text-[#e3b341]' : 'text-[#484f58]'}" style="animation:step-reveal 0.3s {i * 0.8}s both;opacity:0">{step}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
  .animate-shimmer { animation: shimmer 1.4s ease-in-out infinite; }
  @keyframes wave { 0%, 100% { transform: scaleY(0.4) } 50% { transform: scaleY(1.2) } }
  @keyframes tokenbar { 0% { width: 0 } 70% { width: 100% } 100% { width: 100% } }
  .animate-tokenbar { animation: tokenbar 2s ease-in-out infinite; }
  @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes step-reveal { from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: none } }
</style>
