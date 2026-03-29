<script setup>
import { ref, computed } from "vue";

const selected = ref("claude-sonnet-4");
const open = ref(false);
const search = ref("");

const MODELS = [
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    color: "#e89537",
    context: "200K",
    caps: ["vision", "code", "reasoning"],
    badge: "Most capable",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    color: "#e89537",
    context: "200K",
    caps: ["vision", "code", "fast"],
  },
  {
    id: "claude-haiku-4",
    name: "Claude Haiku 4",
    provider: "Anthropic",
    color: "#e89537",
    context: "200K",
    caps: ["fast", "cheap"],
    badge: "Fastest",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    color: "#10a37f",
    context: "128K",
    caps: ["vision", "code", "audio"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    color: "#10a37f",
    context: "128K",
    caps: ["fast", "cheap"],
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    color: "#4285f4",
    context: "1M",
    caps: ["vision", "code", "fast"],
    badge: "Largest context",
  },
  {
    id: "gemini-2.0-pro",
    name: "Gemini 2.0 Pro",
    provider: "Google",
    color: "#4285f4",
    context: "1M",
    caps: ["vision", "code", "reasoning"],
  },
];

const CAP_COLORS = {
  vision: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  code: "bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/20",
  reasoning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  audio: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  fast: "bg-green-500/10 text-green-400 border-green-500/20",
  cheap: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const current = computed(() => MODELS.find((m) => m.id === selected.value));
const providers = computed(() => [...new Set(MODELS.map((m) => m.provider))]);
const q = computed(() => search.value.toLowerCase());
const filtered = computed(() =>
  MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(q.value) ||
      m.provider.toLowerCase().includes(q.value) ||
      m.caps.some((c) => c.includes(q.value))
  )
);

function groupByProvider(prov) {
  return filtered.value.filter((m) => m.provider === prov);
}

function selectModel(id) {
  selected.value = id;
  open.value = false;
  search.value = "";
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-6 flex justify-center items-start">
    <div class="w-full max-w-[480px] space-y-4">
      <p class="text-[13px] text-[#8b949e]">Select model</p>

      <!-- Trigger -->
      <div class="relative">
        <button
          @click="open = !open"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 bg-[#161b22] border rounded-xl transition-colors text-left',
            open ? 'border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'
          ]"
        >
          <template v-if="current">
            <span
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[11px]"
              :style="{ background: current.color + '22', color: current.color }"
            >
              {{ current.provider[0] }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-semibold text-[#e6edf3]">{{ current.name }}</p>
              <p class="text-[11px] text-[#8b949e]">{{ current.provider }} · {{ current.context }} context</p>
            </div>
            <div class="flex flex-wrap gap-1 justify-end max-w-[140px]">
              <span
                v-for="c in current.caps.slice(0, 2)"
                :key="c"
                :class="'text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase tracking-wide ' + CAP_COLORS[c]"
              >
                {{ c }}
              </span>
            </div>
          </template>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" :class="['text-[#8b949e] flex-shrink-0 transition-transform', open ? 'rotate-180' : '']"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <!-- Dropdown -->
        <div v-if="open" class="absolute top-full mt-1 left-0 right-0 bg-[#21262d] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl z-20">
          <!-- Search -->
          <div class="p-2 border-b border-[#30363d]">
            <input
              type="text"
              placeholder="Search models…"
              v-model="search"
              autofocus
              class="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-[12px] text-[#e6edf3] placeholder-[#484f58] outline-none focus:border-[#58a6ff] transition-colors"
            />
          </div>

          <!-- List -->
          <div class="max-h-[360px] overflow-y-auto">
            <template v-for="prov in providers" :key="prov">
              <div v-if="groupByProvider(prov).length > 0">
                <div class="px-3 py-1.5 text-[10px] font-bold text-[#484f58] uppercase tracking-wider">
                  {{ prov }}
                </div>
                <button
                  v-for="m in groupByProvider(prov)"
                  :key="m.id"
                  @click="selectModel(m.id)"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left hover:bg-white/[0.04]',
                    m.id === selected ? 'bg-[#58a6ff]/[0.08]' : ''
                  ]"
                >
                  <span
                    class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[10px]"
                    :style="{ background: m.color + '22', color: m.color }"
                  >
                    {{ m.provider[0] }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span :class="['text-[12px] font-semibold', m.id === selected ? 'text-[#58a6ff]' : 'text-[#e6edf3]']">
                        {{ m.name }}
                      </span>
                      <span v-if="m.badge" class="text-[9px] px-1.5 py-0.5 bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 rounded-full font-semibold">
                        {{ m.badge }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] text-[#484f58]">{{ m.context }} ctx</span>
                      <span
                        v-for="c in m.caps"
                        :key="c"
                        :class="'text-[9px] px-1 py-px rounded border font-semibold ' + CAP_COLORS[c]"
                      >
                        {{ c }}
                      </span>
                    </div>
                  </div>
                  <svg v-if="m.id === selected" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>
            </template>
            <div v-if="filtered.length === 0" class="px-3 py-6 text-center text-[12px] text-[#484f58]">No models found</div>
          </div>
        </div>
      </div>

      <!-- Selected info -->
      <div v-if="!open && current" class="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2">
        <p class="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">Selected model details</p>
        <div class="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <p class="text-[#484f58]">Provider</p>
            <p class="text-[#e6edf3] font-semibold">{{ current.provider }}</p>
          </div>
          <div>
            <p class="text-[#484f58]">Context window</p>
            <p class="text-[#e6edf3] font-semibold">{{ current.context }} tokens</p>
          </div>
        </div>
        <div>
          <p class="text-[11px] text-[#484f58] mb-1.5">Capabilities</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="c in current.caps"
              :key="c"
              :class="'text-[10px] px-2 py-0.5 rounded-full border font-semibold ' + CAP_COLORS[c]"
            >
              {{ c }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
