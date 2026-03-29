<script>
let text = "";

$: words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
$: chars = text.length;
$: charsNoSpace = text.replace(/\s/g, "").length;
$: sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
$: paragraphs = text.trim() === "" ? 0 : text.split(/\n+/).filter((p) => p.trim()).length;
$: readingMin = Math.ceil(words / 200);

$: items = [
  { label: "Words", value: words },
  { label: "Characters", value: chars },
  { label: "Chars (no spaces)", value: charsNoSpace },
  { label: "Sentences", value: sentences },
  { label: "Paragraphs", value: paragraphs },
  { label: "Reading time", value: `${readingMin} min` },
];
</script>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
  <div class="w-full max-w-xl">
    <h2 class="text-[#e6edf3] font-bold text-xl mb-4">Word Counter</h2>
    <textarea
      bind:value={text}
      placeholder="Start typing or paste your text here..."
      rows="8"
      class="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] placeholder-[#484f58] text-sm resize-none focus:outline-none focus:border-[#58a6ff] mb-4"
    />
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {#each items as { label, value }}
        <div class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3">
          <p class="text-[24px] font-bold text-[#58a6ff] tabular-nums leading-none mb-1">{value}</p>
          <p class="text-[11px] text-[#8b949e] uppercase tracking-wider">{label}</p>
        </div>
      {/each}
    </div>
    {#if text.length > 0}
      <button
        on:click={() => (text = "")}
        class="mt-4 text-sm text-[#8b949e] hover:text-[#f85149] transition-colors"
      >
        Clear text
      </button>
    {/if}
  </div>
</div>
