<script setup>
import { ref, computed } from "vue";

const text = ref("");

const stats = computed(() => {
  const t = text.value;
  const words = t.trim() === "" ? 0 : t.trim().split(/\s+/).length;
  const chars = t.length;
  const charsNoSpace = t.replace(/\s/g, "").length;
  const sentences = t.trim() === "" ? 0 : t.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = t.trim() === "" ? 0 : t.split(/\n+/).filter((p) => p.trim()).length;
  const readingMin = Math.ceil(words / 200);
  return { words, chars, charsNoSpace, sentences, paragraphs, readingMin };
});

const items = computed(() => [
  { label: "Words", value: stats.value.words },
  { label: "Characters", value: stats.value.chars },
  { label: "Chars (no spaces)", value: stats.value.charsNoSpace },
  { label: "Sentences", value: stats.value.sentences },
  { label: "Paragraphs", value: stats.value.paragraphs },
  { label: "Reading time", value: `${stats.value.readingMin} min` },
]);
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="w-full max-w-xl">
      <h2 class="text-[#e6edf3] font-bold text-xl mb-4">Word Counter</h2>
      <textarea
        v-model="text"
        placeholder="Start typing or paste your text here..."
        rows="8"
        class="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] placeholder-[#484f58] text-sm resize-none focus:outline-none focus:border-[#58a6ff] mb-4"
      />
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="item in items"
          :key="item.label"
          class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3"
        >
          <p class="text-[24px] font-bold text-[#58a6ff] tabular-nums leading-none mb-1">{{ item.value }}</p>
          <p class="text-[11px] text-[#8b949e] uppercase tracking-wider">{{ item.label }}</p>
        </div>
      </div>
      <button
        v-if="text.length > 0"
        @click="text = ''"
        class="mt-4 text-sm text-[#8b949e] hover:text-[#f85149] transition-colors"
      >
        Clear text
      </button>
    </div>
  </div>
</template>
