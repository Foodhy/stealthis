<script>
import { afterUpdate } from "svelte";

const MODELS = ["claude-opus-4", "claude-sonnet-4", "gpt-4o", "gemini-2.0"];
const MAX_TOKENS = 4096;
const CHARS_PER_TOKEN = 4;
const DEMO_FILES = [
  { name: "context.pdf", size: "128 KB" },
  { name: "data.csv", size: "42 KB" },
  { name: "screenshot.png", size: "1.1 MB" },
  { name: "schema.json", size: "8 KB" },
];

let text = "";
let model = MODELS[0];
let showModelMenu = false;
let attachments = [];
let submitted = null;
let taEl;
let demoIdx = 0;
let fileId = 0;

function estimateTokens(t) {
  return Math.ceil(t.length / CHARS_PER_TOKEN);
}

$: tokens = estimateTokens(text);
$: pct = Math.min((tokens / MAX_TOKENS) * 100, 100);
$: atLimit = tokens >= MAX_TOKENS;
$: barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-[#58a6ff]";

afterUpdate(() => {
  if (taEl) {
    taEl.style.height = "auto";
    taEl.style.height = Math.min(taEl.scrollHeight, 240) + "px";
  }
});

function handleKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    submit();
  }
}

function submit() {
  if (!text.trim() || atLimit) return;
  submitted = text.trim();
  text = "";
  attachments = [];
  setTimeout(() => (submitted = null), 3000);
}

function addFile() {
  const demo = DEMO_FILES[demoIdx % DEMO_FILES.length];
  demoIdx++;
  fileId++;
  attachments = [...attachments, { id: fileId, ...demo }];
}

function removeFile(id) {
  attachments = attachments.filter((x) => x.id !== id);
}

function selectModel(m) {
  model = m;
  showModelMenu = false;
}
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center items-center">
  <div class="w-full max-w-[680px] space-y-4">
    {#if submitted}
      <div class="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-[12px] text-green-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Prompt submitted: "{submitted.slice(0, 60)}{submitted.length > 60 ? '...' : ''}"
      </div>
    {/if}

    <div class="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden focus-within:border-[#58a6ff] transition-colors">
      <!-- Attachments -->
      {#if attachments.length > 0}
        <div class="flex flex-wrap gap-2 px-4 pt-3">
          {#each attachments as f (f.id)}
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] text-[#8b949e]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>{f.name}</span>
              <span class="text-[#484f58]">{f.size}</span>
              <button on:click={() => removeFile(f.id)} class="text-[#484f58] hover:text-[#e6edf3] ml-0.5 transition-colors">
                x
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Textarea -->
      <textarea
        bind:this={taEl}
        bind:value={text}
        on:keydown={handleKey}
        placeholder="Ask anything... (Cmd+Enter to send)"
        class="w-full bg-transparent px-4 pt-3 pb-2 text-[14px] text-[#e6edf3] placeholder-[#484f58] resize-none outline-none leading-relaxed min-h-[80px]"
        style="height: 80px;"
      />

      <!-- Token bar -->
      <div class="h-0.5 mx-4 mb-0 bg-[#21262d] rounded-full overflow-hidden">
        <div
          class="h-full {barColor} transition-all duration-200 rounded-full"
          style="width: {pct}%;"
        />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-4 py-2.5">
        <div class="flex items-center gap-2">
          <!-- Attach -->
          <button
            on:click={addFile}
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
              on:click={() => (showModelMenu = !showModelMenu)}
              class="flex items-center gap-1.5 px-2.5 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-semibold text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
              {model}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {#if showModelMenu}
              <div class="absolute bottom-full mb-1 left-0 bg-[#21262d] border border-[#30363d] rounded-xl py-1 z-10 min-w-[170px] shadow-xl">
                {#each MODELS as m}
                  <button
                    on:click={() => selectModel(m)}
                    class="w-full text-left px-3 py-1.5 text-[12px] transition-colors flex items-center gap-2 {m === model ? 'text-[#58a6ff]' : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/[0.04]'}"
                  >
                    {#if m === model}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {:else}
                      <span class="w-2.5" />
                    {/if}
                    {m}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Token count -->
          <span class="text-[11px] font-mono {atLimit ? 'text-red-400' : 'text-[#484f58]'}">
            {tokens.toLocaleString()} / {MAX_TOKENS.toLocaleString()}
          </span>

          <!-- Submit -->
          <button
            on:click={submit}
            disabled={!text.trim() || atLimit}
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
