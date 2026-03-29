<script setup>
import { ref } from "vue";

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

const visibleId = ref(null);
const positions = ref({});

function show(id, event) {
  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    if (rect.left < 200) positions.value[id] = "left";
    else if (rect.right > vw - 200) positions.value[id] = "right";
    else positions.value[id] = "center";
  }
  visibleId.value = id;
}

function hide() {
  visibleId.value = null;
}

function getTranslateX(id) {
  const pos = positions.value[id] || "center";
  const map = { left: "0%", center: "-50%", right: "-100%" };
  return map[pos];
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
    <div class="w-full max-w-[680px] space-y-6">
      <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <!-- Model tag -->
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#e89537]"></span>
          <span class="text-[11px] font-mono font-bold text-[#8b949e]">claude-opus-4</span>
        </div>

        <p class="text-[14px] text-[#e6edf3] leading-relaxed">
          Large language models are built on the Transformer architecture<!--
          --><span
            v-for="(citation, idx) in [CITATIONS[0]]"
            :key="citation.id"
            class="relative inline-flex"
            @mouseenter="show(1, $event)"
            @mouseleave="hide()"
            @focus="show(1, $event)"
            @blur="hide()"
          >
            <button
              class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold align-super ml-0.5 transition-colors"
              :class="visibleId === 1 ? 'bg-[#58a6ff] text-white' : 'bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40'"
              tabindex="0"
            >1</button>
            <div
              v-if="visibleId === 1"
              class="absolute z-50 w-[280px] bg-[#21262d] border border-[#30363d] rounded-xl shadow-2xl p-3.5"
              :style="{ bottom: 'calc(100% + 8px)', left: '50%', transform: `translateX(${getTranslateX(1)})` }"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-3.5 h-3.5 rounded-sm bg-[#58a6ff]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <span class="text-[10px] text-[#484f58] font-mono">{{ CITATIONS[0].domain }}</span>
              </div>
              <p class="text-[12px] font-semibold text-[#e6edf3] leading-tight mb-1.5">{{ CITATIONS[0].title }}</p>
              <p class="text-[11px] text-[#8b949e] leading-relaxed line-clamp-3">"{{ CITATIONS[0].snippet }}"</p>
              <div class="mt-2.5 pt-2 border-t border-[#30363d]">
                <span class="text-[10px] text-[#58a6ff] font-semibold">View source &rarr;</span>
              </div>
            </div>
          </span>, which uses
          attention mechanisms to process sequences in parallel. To align these models with human
          preferences, researchers employ techniques like RLHF<!--
          --><span
            class="relative inline-flex"
            @mouseenter="show(2, $event)"
            @mouseleave="hide()"
            @focus="show(2, $event)"
            @blur="hide()"
          >
            <button
              class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold align-super ml-0.5 transition-colors"
              :class="visibleId === 2 ? 'bg-[#58a6ff] text-white' : 'bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40'"
              tabindex="0"
            >2</button>
            <div
              v-if="visibleId === 2"
              class="absolute z-50 w-[280px] bg-[#21262d] border border-[#30363d] rounded-xl shadow-2xl p-3.5"
              :style="{ bottom: 'calc(100% + 8px)', left: '50%', transform: `translateX(${getTranslateX(2)})` }"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-3.5 h-3.5 rounded-sm bg-[#58a6ff]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <span class="text-[10px] text-[#484f58] font-mono">{{ CITATIONS[1].domain }}</span>
              </div>
              <p class="text-[12px] font-semibold text-[#e6edf3] leading-tight mb-1.5">{{ CITATIONS[1].title }}</p>
              <p class="text-[11px] text-[#8b949e] leading-relaxed line-clamp-3">"{{ CITATIONS[1].snippet }}"</p>
              <div class="mt-2.5 pt-2 border-t border-[#30363d]">
                <span class="text-[10px] text-[#58a6ff] font-semibold">View source &rarr;</span>
              </div>
            </div>
          </span> — reinforcement learning
          from human feedback — or newer approaches like Constitutional AI<!--
          --><span
            class="relative inline-flex"
            @mouseenter="show(3, $event)"
            @mouseleave="hide()"
            @focus="show(3, $event)"
            @blur="hide()"
          >
            <button
              class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold align-super ml-0.5 transition-colors"
              :class="visibleId === 3 ? 'bg-[#58a6ff] text-white' : 'bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40'"
              tabindex="0"
            >3</button>
            <div
              v-if="visibleId === 3"
              class="absolute z-50 w-[280px] bg-[#21262d] border border-[#30363d] rounded-xl shadow-2xl p-3.5"
              :style="{ bottom: 'calc(100% + 8px)', left: '50%', transform: `translateX(${getTranslateX(3)})` }"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-3.5 h-3.5 rounded-sm bg-[#58a6ff]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <span class="text-[10px] text-[#484f58] font-mono">{{ CITATIONS[2].domain }}</span>
              </div>
              <p class="text-[12px] font-semibold text-[#e6edf3] leading-tight mb-1.5">{{ CITATIONS[2].title }}</p>
              <p class="text-[11px] text-[#8b949e] leading-relaxed line-clamp-3">"{{ CITATIONS[2].snippet }}"</p>
              <div class="mt-2.5 pt-2 border-t border-[#30363d]">
                <span class="text-[10px] text-[#58a6ff] font-semibold">View source &rarr;</span>
              </div>
            </div>
          </span>, which uses
          AI-generated feedback instead of human labels.
        </p>

        <p class="text-[14px] text-[#e6edf3] leading-relaxed">
          For knowledge-intensive tasks, retrieval-augmented generation (RAG)<!--
          --><span
            class="relative inline-flex"
            @mouseenter="show(4, $event)"
            @mouseleave="hide()"
            @focus="show(4, $event)"
            @blur="hide()"
          >
            <button
              class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold align-super ml-0.5 transition-colors"
              :class="visibleId === 4 ? 'bg-[#58a6ff] text-white' : 'bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40'"
              tabindex="0"
            >4</button>
            <div
              v-if="visibleId === 4"
              class="absolute z-50 w-[280px] bg-[#21262d] border border-[#30363d] rounded-xl shadow-2xl p-3.5"
              :style="{ bottom: 'calc(100% + 8px)', left: '50%', transform: `translateX(${getTranslateX(4)})` }"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-3.5 h-3.5 rounded-sm bg-[#58a6ff]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <span class="text-[10px] text-[#484f58] font-mono">{{ CITATIONS[3].domain }}</span>
              </div>
              <p class="text-[12px] font-semibold text-[#e6edf3] leading-tight mb-1.5">{{ CITATIONS[3].title }}</p>
              <p class="text-[11px] text-[#8b949e] leading-relaxed line-clamp-3">"{{ CITATIONS[3].snippet }}"</p>
              <div class="mt-2.5 pt-2 border-t border-[#30363d]">
                <span class="text-[10px] text-[#58a6ff] font-semibold">View source &rarr;</span>
              </div>
            </div>
          </span> combines
          the model's parametric knowledge with a live retrieval step, grounding responses in
          up-to-date sources and reducing hallucination rates significantly.
        </p>

        <!-- Citations list -->
        <div class="mt-4 pt-4 border-t border-[#30363d] space-y-1.5">
          <p class="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-2">Sources</p>
          <div v-for="c in CITATIONS" :key="c.id" class="flex items-start gap-2 text-[11px]">
            <span class="w-4 h-4 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] font-bold flex items-center justify-center flex-shrink-0 text-[9px]">
              {{ c.id }}
            </span>
            <div>
              <span class="text-[#8b949e]">{{ c.title }}</span>
              <span class="text-[#484f58] ml-2">&mdash; {{ c.domain }}</span>
            </div>
          </div>
        </div>
      </div>

      <p class="text-[11px] text-[#484f58] text-center">Hover the citation numbers to see source tooltips</p>
    </div>
  </div>
</template>
