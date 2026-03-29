<script setup>
import { ref, computed } from "vue";

const QUESTIONS = [
  {
    question: "Which CSS property creates a flex container?",
    answers: ["display: grid", "display: block", "display: flex", "display: table"],
    correct: 2,
  },
  {
    question: "What does HTML stand for?",
    answers: [
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language",
      "Hyper Text Modern Language",
    ],
    correct: 0,
  },
  {
    question: "Which company originally developed JavaScript?",
    answers: ["Microsoft", "Netscape", "Google", "IBM"],
    correct: 1,
  },
  {
    question: "Which CSS unit is relative to the root element font size?",
    answers: ["em", "px", "rem", "vh"],
    correct: 2,
  },
  {
    question: "The correct way to declare a variable in modern JavaScript?",
    answers: ["var x = 5", "const x = 5", "int x = 5", "declare x = 5"],
    correct: 1,
  },
];

const idx = ref(0);
const score = ref(0);
const selected = ref(null);
const done = ref(false);

const q = computed(() => QUESTIONS[idx.value]);
const pct = computed(() => Math.round((score.value / QUESTIONS.length) * 100));
const progressWidth = computed(() => (idx.value / QUESTIONS.length) * 100);

function pick(i) {
  if (selected.value !== null) return;
  selected.value = i;
  if (i === q.value.correct) score.value += 1;
  setTimeout(() => {
    if (idx.value + 1 < QUESTIONS.length) {
      idx.value += 1;
      selected.value = null;
    } else {
      done.value = true;
    }
  }, 1200);
}

function restart() {
  idx.value = 0;
  score.value = 0;
  selected.value = null;
  done.value = false;
}

function btnStyle(i) {
  if (selected.value === null) return "background:#21262d;border-color:#30363d;color:#e6edf3;";
  if (i === q.value.correct)
    return "background:rgba(35,134,54,0.3);border-color:rgba(126,231,135,0.5);color:#7ee787;";
  if (i === selected.value)
    return "background:rgba(248,81,73,0.2);border-color:rgba(248,81,73,0.5);color:#f85149;";
  return "background:#21262d;border-color:#30363d;color:#484f58;";
}
</script>

<template>
  <div v-if="done" class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center w-full max-w-sm">
      <p class="text-5xl mb-4">{{ pct === 100 ? "🏆" : pct >= 60 ? "🎯" : "📚" }}</p>
      <h2 class="text-[#e6edf3] text-2xl font-bold mb-1">{{ score }}/{{ QUESTIONS.length }}</h2>
      <p class="text-[#8b949e] text-sm mb-6">You scored {{ pct }}%</p>
      <div class="h-2 bg-[#21262d] rounded-full mb-6">
        <div class="h-full bg-[#58a6ff] rounded-full transition-all" :style="{ width: pct + '%' }"></div>
      </div>
      <button
        @click="restart"
        class="w-full py-2.5 bg-[#238636] border border-[#2ea043] text-white rounded-xl font-semibold text-sm hover:bg-[#2ea043] transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>

  <div v-else class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-xs text-[#8b949e]">Question {{ idx + 1 }}/{{ QUESTIONS.length }}</span>
        <span class="text-xs font-semibold text-[#58a6ff]">Score: {{ score }}</span>
      </div>
      <div class="h-1 bg-[#21262d] rounded-full mb-5">
        <div class="h-full bg-[#58a6ff] rounded-full transition-all" :style="{ width: progressWidth + '%' }"></div>
      </div>
      <p class="text-[#e6edf3] font-semibold text-base mb-4 leading-snug">{{ q.question }}</p>
      <div class="space-y-2">
        <button
          v-for="(a, i) in q.answers"
          :key="i"
          @click="pick(i)"
          :disabled="selected !== null"
          class="w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-200"
          :style="btnStyle(i)"
        >
          {{ a }}
        </button>
      </div>
    </div>
  </div>
</template>
