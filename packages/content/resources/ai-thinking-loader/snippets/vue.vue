<script setup>
import { ref } from "vue";

const active = ref(null);

const LOADERS = [
  "Dots Pulse",
  "Shimmer Bar",
  "Orbit Ring",
  "Wave Bars",
  "Typing Cursor",
  "Brain Pulse",
  "Token Stream",
  "Step Progress",
];

const steps = ["Reading context", "Planning response", "Generating", "Reviewing"];
const tokenText = "The answer to your question involves ";

function toggle(i) {
  active.value = active.value === i ? null : i;
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
    <div class="w-full max-w-[720px]">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(label, i) in LOADERS"
          :key="label"
          :class="[
            'bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors',
            active === i ? 'border-[#58a6ff]/40' : 'border-[#30363d] hover:border-[#8b949e]/40'
          ]"
          @click="toggle(i)"
        >
          <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">{{ label }}</p>

          <!-- Dots Pulse -->
          <div v-if="i === 0" class="flex items-center gap-1.5">
            <span
              v-for="d in [0, 1, 2]"
              :key="d"
              class="w-2 h-2 rounded-full bg-[#58a6ff] animate-bounce"
              :style="{ animationDelay: d * 150 + 'ms', animationDuration: '0.8s' }"
            ></span>
            <span class="ml-1 text-[13px] text-[#8b949e]">Thinking...</span>
          </div>

          <!-- Shimmer Bar -->
          <div v-else-if="i === 1" class="space-y-2 w-full max-w-[320px]">
            <div
              v-for="w in [100, 80, 60]"
              :key="w"
              class="h-3 rounded-full bg-gradient-to-r from-[#21262d] via-[#30363d] to-[#21262d] bg-[length:200%_100%] animate-shimmer"
              :style="{ width: w + '%' }"
            ></div>
          </div>

          <!-- Orbit Ring -->
          <div v-else-if="i === 2" class="flex items-center gap-3">
            <div class="relative w-8 h-8">
              <div class="absolute inset-0 rounded-full border-2 border-[#30363d]"></div>
              <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin"></div>
              <div class="absolute inset-1 rounded-full bg-[#58a6ff]/10 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
            </div>
            <span class="text-[13px] text-[#8b949e]">Processing...</span>
          </div>

          <!-- Wave Bars -->
          <div v-else-if="i === 3" class="flex items-center gap-3">
            <div class="flex items-end gap-0.5 h-6">
              <div
                v-for="b in [0, 1, 2, 3, 4]"
                :key="b"
                class="w-1 rounded-full bg-[#bc8cff]"
                :style="{ animation: `wave 0.9s ease-in-out ${b * 0.1}s infinite`, height: '60%' }"
              ></div>
            </div>
            <span class="text-[13px] text-[#8b949e]">Analyzing...</span>
          </div>

          <!-- Typing Cursor -->
          <div v-else-if="i === 4" class="flex items-center gap-1">
            <span class="text-[13px] text-[#8b949e]">Generating response</span>
            <span
              class="inline-block w-0.5 h-4 bg-[#58a6ff] animate-pulse rounded-sm"
              style="animation-duration: 0.7s;"
            ></span>
          </div>

          <!-- Brain Pulse -->
          <div v-else-if="i === 5" class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20 border border-[#58a6ff]/20 flex items-center justify-center animate-pulse">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="1.5">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 14.5 2z"/>
                  <path d="M5 8.5a2.5 2.5 0 1 1 4 2"/>
                  <path d="M15 8.5a2.5 2.5 0 1 0-4 2"/>
                </svg>
              </div>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-[#e6edf3]">Deep reasoning</p>
              <p class="text-[11px] text-[#484f58]">Working through the problem...</p>
            </div>
          </div>

          <!-- Token Stream -->
          <div v-else-if="i === 6" class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-[#484f58] font-mono">tokens/s</span>
              <div class="flex-1 h-1 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 rounded-full"
                  style="animation: tokenbar 2s ease-in-out infinite;"
                ></div>
              </div>
              <span class="text-[11px] text-green-400 font-mono">~48</span>
            </div>
            <div class="font-mono text-[12px] text-[#8b949e] overflow-hidden whitespace-nowrap">
              <span
                v-for="(ch, ci) in tokenText.split('')"
                :key="ci"
                class="inline-block"
                :style="{ animation: `fade-in 0.05s ${ci * 0.04}s both` }"
              >{{ ch === ' ' ? '\u00a0' : ch }}</span>
              <span class="inline-block w-0.5 h-3.5 bg-[#58a6ff] align-middle animate-pulse ml-px"></span>
            </div>
          </div>

          <!-- Step Progress -->
          <div v-else-if="i === 7" class="space-y-1.5">
            <div v-for="(step, si) in steps" :key="step" class="flex items-center gap-2">
              <div
                class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                :style="{ animation: `step-reveal 0.3s ${si * 0.8}s both`, opacity: 0 }"
              >
                <svg v-if="si < 2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ee787" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else-if="si === 2" class="w-3 h-3 rounded-full border-2 border-[#e3b341] border-t-transparent animate-spin"></div>
                <div v-else class="w-2 h-2 rounded-full bg-[#484f58]"></div>
              </div>
              <span
                :class="['text-[12px]', si < 2 ? 'text-[#7ee787] line-through' : si === 2 ? 'text-[#e3b341]' : 'text-[#484f58]']"
                :style="{ animation: `step-reveal 0.3s ${si * 0.8}s both`, opacity: 0 }"
              >
                {{ step }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.animate-shimmer {
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1.2); }
}
@keyframes tokenbar {
  0% { width: 0; }
  70% { width: 100%; }
  100% { width: 100%; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes step-reveal {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: none; }
}
</style>
