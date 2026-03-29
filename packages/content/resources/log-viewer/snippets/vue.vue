<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const LEVEL_COLORS = {
  info: { color: "#58a6ff" },
  warn: { color: "#e3b341" },
  error: { color: "#f85149" },
  debug: { color: "#8b949e" },
};

const LEVEL_BG = {
  info: { background: "rgba(88,166,255,0.1)" },
  warn: { background: "rgba(227,179,65,0.1)" },
  error: { background: "rgba(248,81,73,0.1)" },
  debug: {},
};

const LEVEL_BADGE_ACTIVE = {
  info: "border-[#58a6ff]/40 text-[#58a6ff]",
  warn: "border-[#e3b341]/40 text-[#e3b341]",
  error: "border-[#f85149]/40 text-[#f85149]",
  debug: "border-[#484f58] text-[#8b949e]",
};

const DEMO_MESSAGES = [
  { level: "info", message: "Server started on port 3000" },
  { level: "debug", message: "DB connection pool initialized (max: 10)" },
  { level: "info", message: "GET /api/users 200 12ms" },
  { level: "debug", message: "Cache hit: user:42" },
  { level: "warn", message: "Rate limit approaching: 85/100 req/min" },
  { level: "info", message: "POST /api/auth/login 200 48ms" },
  { level: "error", message: "Failed to connect to Redis: ECONNREFUSED" },
  { level: "warn", message: "Retrying Redis in 5s (attempt 1/3)" },
  { level: "info", message: "GET /api/products 200 23ms" },
  { level: "debug", message: "Query executed in 4ms: SELECT * FROM users" },
  { level: "error", message: "Unhandled rejection: Cannot read property 'id' of null" },
  { level: "info", message: "Redis reconnected successfully" },
  { level: "warn", message: "Slow query detected: 1.2s \u2014 SELECT * FROM logs" },
  { level: "info", message: "DELETE /api/sessions/77 204 8ms" },
  { level: "debug", message: "Middleware: auth token validated (exp: 3600s)" },
];

const LEVELS = ["info", "warn", "error", "debug"];

let counter = 0;
function makeEntry(level, message) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  return { id: ++counter, level, time, message };
}

const logs = ref(DEMO_MESSAGES.slice(0, 8).map((m) => makeEntry(m.level, m.message)));
const activeFilters = ref(new Set(LEVELS));
const search = ref("");
const autoScroll = ref(true);
const streaming = ref(true);
const bodyRef = ref(null);
let msgIdx = 8;
let intervalId = null;

const filtered = computed(() =>
  logs.value.filter(
    (l) =>
      activeFilters.value.has(l.level) &&
      (!search.value ||
        l.message.toLowerCase().includes(search.value.toLowerCase()) ||
        l.level.includes(search.value.toLowerCase()))
  )
);

function toggleFilter(level) {
  const next = new Set(activeFilters.value);
  if (next.has(level)) next.delete(level);
  else next.add(level);
  activeFilters.value = next;
}

function highlight(text) {
  if (!search.value) return text;
  const idx = text.toLowerCase().indexOf(search.value.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    `<mark style="background: rgba(250,204,21,0.3); color: #fde68a; border-radius: 2px;">${text.slice(idx, idx + search.value.length)}</mark>` +
    text.slice(idx + search.value.length)
  );
}

function scrollToBottom() {
  nextTick(() => {
    if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
  });
}

watch(filtered, () => {
  if (autoScroll.value) scrollToBottom();
});

watch(
  streaming,
  (val) => {
    if (val) {
      intervalId = setInterval(() => {
        const next = DEMO_MESSAGES[msgIdx % DEMO_MESSAGES.length];
        msgIdx++;
        logs.value = [...logs.value.slice(-199), makeEntry(next.level, next.message)];
      }, 1200);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
    <div class="w-full max-w-[860px] space-y-3">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Level filters -->
        <div class="flex gap-1">
          <button
            v-for="lvl in LEVELS"
            :key="lvl"
            @click="toggleFilter(lvl)"
            class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border transition-all"
            :class="activeFilters.has(lvl) ? LEVEL_BADGE_ACTIVE[lvl] : 'border-transparent text-[#484f58]'"
          >
            {{ lvl }}
          </button>
        </div>

        <!-- Search -->
        <input
          type="text"
          placeholder="Filter logs..."
          v-model="search"
          class="flex-1 min-w-[160px] bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-1.5 text-[12px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
        />

        <!-- Auto-scroll -->
        <button
          @click="autoScroll = !autoScroll"
          class="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
          :class="autoScroll
            ? 'bg-[#58a6ff]/10 border-[#58a6ff]/40 text-[#58a6ff]'
            : 'border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'"
        >
          Auto-scroll
        </button>

        <!-- Stream toggle -->
        <button
          @click="streaming = !streaming"
          class="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
          :class="streaming
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'"
        >
          {{ streaming ? '\u25CF Live' : 'Paused' }}
        </button>

        <!-- Clear -->
        <button
          @click="logs = []"
          class="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#f85149] hover:border-[#f85149]/40 transition-colors"
        >
          Clear
        </button>
      </div>

      <!-- Log body -->
      <div class="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          <span class="text-[11px] font-mono font-bold text-[#8b949e] uppercase tracking-wider">
            application.log
          </span>
          <span class="text-[11px] text-[#484f58]">{{ filtered.length }} lines</span>
        </div>

        <!-- Lines -->
        <div
          ref="bodyRef"
          class="h-[420px] overflow-y-auto font-mono text-[12px] leading-[1.7] p-2 space-y-0.5"
        >
          <div v-if="filtered.length === 0" class="flex items-center justify-center h-full text-[#484f58]">
            No matching logs
          </div>
          <div
            v-else
            v-for="entry in filtered"
            :key="entry.id"
            class="flex items-start gap-2 px-2 py-0.5 rounded"
            :style="LEVEL_BG[entry.level]"
          >
            <span class="text-[#484f58] flex-shrink-0 select-none">{{ entry.time }}</span>
            <span
              class="font-bold uppercase text-[10px] leading-[1.9] flex-shrink-0 w-10"
              :style="LEVEL_COLORS[entry.level]"
            >
              {{ entry.level }}
            </span>
            <span class="text-[#e6edf3] break-all" v-html="highlight(entry.message)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
