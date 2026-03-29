<script>
import { onMount, onDestroy, afterUpdate, tick } from "svelte";

const LEVEL_COLORS = {
  info: "color: #58a6ff;",
  warn: "color: #e3b341;",
  error: "color: #f85149;",
  debug: "color: #8b949e;",
};

const LEVEL_BG = {
  info: "background: rgba(88,166,255,0.1);",
  warn: "background: rgba(227,179,65,0.1);",
  error: "background: rgba(248,81,73,0.1);",
  debug: "",
};

const LEVEL_BADGE_ACTIVE = {
  info: "border-color: rgba(88,166,255,0.4); color: #58a6ff;",
  warn: "border-color: rgba(227,179,65,0.4); color: #e3b341;",
  error: "border-color: rgba(248,81,73,0.4); color: #f85149;",
  debug: "border-color: #484f58; color: #8b949e;",
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

let logs = DEMO_MESSAGES.slice(0, 8).map((m) => makeEntry(m.level, m.message));
let activeFilters = new Set(LEVELS);
let search = "";
let autoScroll = true;
let streaming = true;
let bodyEl;
let msgIdx = 8;
let intervalId = null;

$: filtered = logs.filter(
  (l) =>
    activeFilters.has(l.level) &&
    (!search ||
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.level.includes(search.toLowerCase()))
);

function toggleFilter(level) {
  if (activeFilters.has(level)) {
    activeFilters.delete(level);
  } else {
    activeFilters.add(level);
  }
  activeFilters = new Set(activeFilters);
}

function highlight(text) {
  if (!search) return text;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    `<mark style="background: rgba(250,204,21,0.3); color: #fde68a; border-radius: 2px;">${text.slice(idx, idx + search.length)}</mark>` +
    text.slice(idx + search.length)
  );
}

function startStreaming() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const next = DEMO_MESSAGES[msgIdx % DEMO_MESSAGES.length];
    msgIdx++;
    logs = [...logs.slice(-199), makeEntry(next.level, next.message)];
  }, 1200);
}

function stopStreaming() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

$: if (streaming) {
  startStreaming();
} else {
  stopStreaming();
}

afterUpdate(() => {
  if (autoScroll && bodyEl) {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
});

onDestroy(() => {
  stopStreaming();
});
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
  <div class="w-full max-w-[860px] space-y-3">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Level filters -->
      <div class="flex gap-1">
        {#each LEVELS as lvl}
          <button
            on:click={() => toggleFilter(lvl)}
            class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border transition-all"
            style={activeFilters.has(lvl) ? LEVEL_BADGE_ACTIVE[lvl] : "border-color: transparent; color: #484f58;"}
          >
            {lvl}
          </button>
        {/each}
      </div>

      <!-- Search -->
      <input
        type="text"
        placeholder="Filter logs..."
        bind:value={search}
        class="flex-1 min-w-[160px] bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-1.5 text-[12px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
      />

      <!-- Auto-scroll -->
      <button
        on:click={() => (autoScroll = !autoScroll)}
        class="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
        style={autoScroll
          ? "background: rgba(88,166,255,0.1); border-color: rgba(88,166,255,0.4); color: #58a6ff;"
          : "border-color: #30363d; color: #8b949e;"}
      >
        Auto-scroll
      </button>

      <!-- Stream toggle -->
      <button
        on:click={() => (streaming = !streaming)}
        class="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
        style={streaming
          ? "background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: #4ade80;"
          : "border-color: #30363d; color: #8b949e;"}
      >
        {streaming ? "\u25CF Live" : "Paused"}
      </button>

      <!-- Clear -->
      <button
        on:click={() => (logs = [])}
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
        <span class="text-[11px] text-[#484f58]">{filtered.length} lines</span>
      </div>

      <!-- Lines -->
      <div
        bind:this={bodyEl}
        class="h-[420px] overflow-y-auto font-mono text-[12px] leading-[1.7] p-2 space-y-0.5"
      >
        {#if filtered.length === 0}
          <div class="flex items-center justify-center h-full text-[#484f58]">
            No matching logs
          </div>
        {:else}
          {#each filtered as entry (entry.id)}
            <div
              class="flex items-start gap-2 px-2 py-0.5 rounded"
              style={LEVEL_BG[entry.level]}
            >
              <span class="text-[#484f58] flex-shrink-0 select-none">{entry.time}</span>
              <span
                class="font-bold uppercase text-[10px] leading-[1.9] flex-shrink-0 w-10"
                style={LEVEL_COLORS[entry.level]}
              >
                {entry.level}
              </span>
              <span class="text-[#e6edf3] break-all">
                {@html highlight(entry.message)}
              </span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
