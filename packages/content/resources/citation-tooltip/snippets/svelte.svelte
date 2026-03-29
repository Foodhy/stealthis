<script>
const CITATIONS = [
  {
    id: 1,
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    domain: "arxiv.org",
    snippet:
      "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
  },
  {
    id: 2,
    title: "RLHF: Training language models to follow instructions",
    url: "https://arxiv.org/abs/2203.02155",
    domain: "arxiv.org",
    snippet:
      "We fine-tune language models to follow instructions with human feedback, showing that this substantially improves alignment across a range of tasks.",
  },
  {
    id: 3,
    title: "Constitutional AI: Harmlessness from AI Feedback",
    url: "https://arxiv.org/abs/2212.08073",
    domain: "anthropic.com",
    snippet:
      "We propose a method for training a harmless AI assistant without any human labels identifying harmful outputs, using a set of principles to guide self-critique.",
  },
  {
    id: 4,
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    url: "https://arxiv.org/abs/2005.11401",
    domain: "arxiv.org",
    snippet:
      "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory.",
  },
];

/** Each paragraph = array of segments: plain text or citation reference */
const paragraphs = [
  [
    { text: "Large language models are built on the Transformer architecture" },
    { citeId: 1 },
    {
      text: ", which uses attention mechanisms to process sequences in parallel. To align these models with human preferences, researchers employ techniques like RLHF",
    },
    { citeId: 2 },
    {
      text: " \u2014 reinforcement learning from human feedback \u2014 or newer approaches like Constitutional AI",
    },
    { citeId: 3 },
    { text: ", which uses AI-generated feedback instead of human labels." },
  ],
  [
    { text: "For knowledge-intensive tasks, retrieval-augmented generation (RAG)" },
    { citeId: 4 },
    {
      text: " combines the model\u2019s parametric knowledge with a live retrieval step, grounding responses in up-to-date sources and reducing hallucination rates significantly.",
    },
  ],
];

let visibleId = null;
let tipPos = "center";

function show(id, el) {
  if (el) {
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    if (rect.left < 200) tipPos = "left";
    else if (rect.right > vw - 200) tipPos = "right";
    else tipPos = "center";
  }
  visibleId = id;
}

function hide() {
  visibleId = null;
}

$: tx = { left: "0%", center: "-50%", right: "-100%" }[tipPos];
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
  <div class="w-full max-w-[680px] space-y-6">
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
      <!-- Model tag -->
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#e89537]"></span>
        <span class="text-[11px] font-mono font-bold text-[#8b949e]">claude-opus-4</span>
      </div>

      {#each paragraphs as segments}
        <p class="text-[14px] text-[#e6edf3] leading-relaxed">
          {#each segments as seg}
            {#if seg.text}
              {seg.text}
            {:else}
              {@const c = CITATIONS[seg.citeId - 1]}
              <span
                class="relative inline-flex"
                on:mouseenter={(e) => show(c.id, e.currentTarget)}
                on:mouseleave={hide}
                on:focus={() => show(c.id, null)}
                on:blur={hide}
              >
                <button
                  class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold align-super ml-0.5 transition-colors {visibleId === c.id ? 'bg-[#58a6ff] text-white' : 'bg-[#58a6ff]/20 text-[#58a6ff]'}"
                  tabindex="0"
                >{c.id}</button>

                {#if visibleId === c.id}
                  <div
                    class="absolute z-50 w-[280px] bg-[#21262d] border border-[#30363d] rounded-xl shadow-2xl p-3.5"
                    style="bottom: calc(100% + 8px); left: 50%; transform: translateX({tx})"
                  >
                    <div class="flex items-center gap-1.5 mb-2">
                      <div class="w-3.5 h-3.5 rounded-sm bg-[#58a6ff]/20 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                      </div>
                      <span class="text-[10px] text-[#484f58] font-mono">{c.domain}</span>
                    </div>
                    <p class="text-[12px] font-semibold text-[#e6edf3] leading-tight mb-1.5">{c.title}</p>
                    <p class="text-[11px] text-[#8b949e] leading-relaxed line-clamp-3">"{c.snippet}"</p>
                    <div class="mt-2.5 pt-2 border-t border-[#30363d]">
                      <span class="text-[10px] text-[#58a6ff] font-semibold">View source &rarr;</span>
                    </div>
                  </div>
                {/if}
              </span>
            {/if}
          {/each}
        </p>
      {/each}

      <!-- Sources list -->
      <div class="mt-4 pt-4 border-t border-[#30363d] space-y-1.5">
        <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-2">Sources</p>
        {#each CITATIONS as c (c.id)}
          <div class="flex items-start gap-2 text-[11px]">
            <span class="w-4 h-4 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] font-bold flex items-center justify-center flex-shrink-0 text-[9px]">
              {c.id}
            </span>
            <div>
              <span class="text-[#8b949e]">{c.title}</span>
              <span class="text-[#484f58] ml-2">— {c.domain}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <p class="text-[11px] text-[#484f58] text-center">Hover the citation numbers to see source tooltips</p>
  </div>
</div>
