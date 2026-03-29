<script setup>
import { ref, computed, watch, nextTick } from "vue";

const MODELS = ["claude-opus-4", "claude-sonnet-4", "gpt-4o", "gemini-2.0"];
const MAX_TOKENS = 4096;
const CHARS_PER_TOKEN = 4;
const DEMO_FILES = [
  { name: "context.pdf", size: "128 KB" },
  { name: "data.csv", size: "42 KB" },
  { name: "screenshot.png", size: "1.1 MB" },
  { name: "schema.json", size: "8 KB" },
];

const text = ref("");
const model = ref(MODELS[0]);
const showModelMenu = ref(false);
const attachments = ref([]);
const submitted = ref(null);
const taRef = ref(null);
let demoIdx = 0;
let fileId = 0;

function estimateTokens(t) {
  return Math.ceil(t.length / CHARS_PER_TOKEN);
}

const tokens = computed(() => estimateTokens(text.value));
const pct = computed(() => Math.min((tokens.value / MAX_TOKENS) * 100, 100));
const atLimit = computed(() => tokens.value >= MAX_TOKENS);
const barColor = computed(() =>
  pct.value > 90 ? "bg-red-500" : pct.value > 70 ? "bg-yellow-400" : "bg-[#58a6ff]"
);

watch(text, () => {
  nextTick(() => {
    const ta = taRef.value;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 240) + "px";
  });
});

function handleKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    submit();
  }
}

function submit() {
  if (!text.value.trim() || atLimit.value) return;
  submitted.value = text.value.trim();
  text.value = "";
  attachments.value = [];
  setTimeout(() => (submitted.value = null), 3000);
}

function addFile() {
  const demo = DEMO_FILES[demoIdx % DEMO_FILES.length];
  demoIdx++;
  fileId++;
  attachments.value = [...attachments.value, { id: fileId, ...demo }];
}

function removeFile(id) {
  attachments.value = attachments.value.filter((x) => x.id !== id);
}

function selectModel(m) {
  model.value = m;
  showModelMenu.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-6 flex justify-center items-center">
    <div class="w-full max-w-[680px] space-y-4">
      <div
        v-if="submitted"
        class="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-[12px] text-green-400"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Prompt submitted: "{{ submitted.slice(0, 60) }}{{ submitted.length > 60 ? '...' : '' }}"
      </div>

      <div class="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden focus-within:border-[#58a6ff] transition-colors">
        <!-- Attachments -->
        <div v-if="attachments.length > 0" class="flex flex-wrap gap-2 px-4 pt-3">
          <div
            v-for="f in attachments"
            :key="f.id"
            class="flex items-center gap-1.5 px-2.5 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] text-[#8b949e]"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>{{ f.name }}</span>
            <span class="text-[#484f58]">{{ f.size }}</span>
            <button @click="removeFile(f.id)" class="text-[#484f58] hover:text-[#e6edf3] ml-0.5 transition-colors">
              x
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <textarea
          ref="taRef"
          v-model="text"
          @keydown="handleKey"
          placeholder="Ask anything... (Cmd+Enter to send)"
          class="w-full bg-transparent px-4 pt-3 pb-2 text-[14px] text-[#e6edf3] placeholder-[#484f58] resize-none outline-none leading-relaxed min-h-[80px]"
          style="height: 80px"
        />

        <!-- Token bar -->
        <div class="h-0.5 mx-4 mb-0 bg-[#21262d] rounded-full overflow-hidden">
          <div
            :class="['h-full transition-all duration-200 rounded-full', barColor]"
            :style="{ width: pct + '%' }"
          />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-4 py-2.5">
          <div class="flex items-center gap-2">
            <!-- Attach -->
            <button
              @click="addFile"
              title="Attach file"
              class="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/[0.04] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            <!-- Model selector -->
            <div class="relative">
              <button
                @click="showModelMenu = !showModelMenu"
                class="flex items-center gap-1.5 px-2.5 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-semibold text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                {{ model }}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div v-if="showModelMenu" class="absolute bottom-full mb-1 left-0 bg-[#21262d] border border-[#30363d] rounded-xl py-1 z-10 min-w-[170px] shadow-xl">
                <button
                  v-for="m in MODELS"
                  :key="m"
                  @click="selectModel(m)"
                  :class="['w-full text-left px-3 py-1.5 text-[12px] transition-colors flex items-center gap-2', m === model ? 'text-[#58a6ff]' : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/[0.04]']"
                >
                  <svg v-if="m === model" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else class="w-2.5" />
                  {{ m }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Token count -->
            <span :class="['text-[11px] font-mono', atLimit ? 'text-red-400' : 'text-[#484f58]']">
              {{ tokens.toLocaleString() }} / {{ MAX_TOKENS.toLocaleString() }}
            </span>

            <!-- Submit -->
            <button
              @click="submit"
              :disabled="!text.trim() || atLimit"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-[#58a6ff] rounded-lg text-[12px] font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#79b8ff] transition-colors"
            >
              Send
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
