<script>
const RESPONSES = [
  {
    model: "claude-opus-4",
    provider: "#e89537",
    response: `The key difference between **RAG** and **fine-tuning** lies in how they inject knowledge into a language model.\n\n**RAG** retrieves relevant documents at inference time and appends them to the prompt. This means your knowledge can be updated without retraining — just update the vector store.\n\n**Fine-tuning** bakes knowledge into model weights during training. It's better for teaching style, tone, or structured output formats, but updating knowledge requires expensive retraining.\n\nFor most production use cases, **RAG + a strong base model** is the better default.`,
  },
  {
    model: "gpt-4o",
    provider: "#10a37f",
    response: `Great question! Here's a concise breakdown:\n\n- **RAG** = retrieval at inference time (dynamic, updatable, grounded in sources)\n- **Fine-tuning** = training on domain data (baked-in, style/format control, expensive to update)\n\nUse RAG when your knowledge changes frequently. Use fine-tuning when you need consistent output format or specialized behavior the base model doesn't exhibit.`,
  },
];

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e6edf3] font-semibold">$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(
      /\n- /g,
      "\n<span class=\"block pl-4 before:content-['•'] before:mr-2 before:text-[#58a6ff]\">"
    )
    .replace(/\n(?!<)/g, "<br/>");
}

let cards = RESPONSES.map((r) => ({
  ...r,
  copied: false,
  vote: null,
  regenerating: false,
}));

function copy(index) {
  navigator.clipboard.writeText(cards[index].response);
  cards[index].copied = true;
  setTimeout(() => {
    cards[index].copied = false;
    cards = cards;
  }, 2000);
  cards = cards;
}

function toggleVote(index, dir) {
  cards[index].vote = cards[index].vote === dir ? null : dir;
  cards = cards;
}

function regen(index) {
  cards[index].regenerating = true;
  cards = cards;
  setTimeout(() => {
    cards[index].regenerating = false;
    cards = cards;
  }, 1500);
}
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
  <div class="w-full max-w-[680px] space-y-4">
    <p class="text-[13px] font-semibold text-[#8b949e]">
      What's the difference between RAG and fine-tuning?
    </p>

    {#each cards as card, i}
      <div class="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2.5 bg-[#21262d] border-b border-[#30363d]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:{card.provider}"></span>
            <span class="text-[12px] font-mono font-bold text-[#e6edf3]">{card.model}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-semibold">
            Generated
          </span>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 transition-opacity" class:opacity-30={card.regenerating}>
          {#if card.regenerating}
            <div class="flex items-center gap-2 py-4">
              {#each [0, 1, 2] as j}
                <span class="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce" style="animation-delay:{j * 150}ms"></span>
              {/each}
              <span class="text-[12px] text-[#8b949e] ml-1">Regenerating…</span>
            </div>
          {:else}
            <p class="text-[13px] text-[#8b949e] leading-relaxed mt-3">{@html formatMarkdown(card.response)}</p>
          {/if}
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between px-4 py-2.5 bg-[#0d1117]/50 border-t border-[#30363d]">
          <div class="flex items-center gap-1">
            <!-- Copy -->
            <button
              on:click={() => copy(i)}
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors {card.copied ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-[#8b949e] border-transparent hover:border-[#30363d] hover:text-[#e6edf3]'}"
            >
              {#if card.copied}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Copied
              {:else}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              {/if}
            </button>

            <!-- Thumbs -->
            {#each ['up', 'down'] as dir}
              <button
                on:click={() => toggleVote(i, dir)}
                class="p-1.5 rounded-md border transition-colors {card.vote === dir ? (dir === 'up' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10') : 'text-[#8b949e] border-transparent hover:border-[#30363d] hover:text-[#e6edf3]'}"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={dir === 'down' ? 'transform:scaleY(-1)' : ''}>
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
              </button>
            {/each}
          </div>

          <!-- Regenerate -->
          <button
            on:click={() => regen(i)}
            disabled={card.regenerating}
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors disabled:opacity-30"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Regenerate
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
