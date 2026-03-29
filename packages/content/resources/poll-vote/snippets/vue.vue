<script setup>
import { ref, computed } from "vue";

const POLL = {
  question: "What's your favorite frontend tool?",
  options: [
    { label: "React", emoji: "⚛️", votes: 850 },
    { label: "Vue", emoji: "💚", votes: 420 },
    { label: "Svelte", emoji: "🔥", votes: 310 },
    { label: "Angular", emoji: "🔴", votes: 240 },
  ],
};

const options = ref(POLL.options.map((o) => ({ ...o })));
const selected = ref(null);
const voted = ref(false);

const total = computed(() => options.value.reduce((s, o) => s + o.votes, 0));
const sortedForResults = computed(() =>
  [...options.value].map((o, i) => ({ ...o, idx: i })).sort((a, b) => b.votes - a.votes)
);

function vote() {
  if (selected.value === null) return;
  options.value[selected.value].votes += 1;
  voted.value = true;
}

function resetVote() {
  voted.value = false;
  selected.value = null;
}

function getPct(votes) {
  return Math.round((votes / (total.value + 1)) * 100);
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-sm">
      <h2 class="text-[#e6edf3] font-bold text-base mb-1">{{ POLL.question }}</h2>
      <p class="text-[#484f58] text-xs mb-5">{{ (total + (voted ? 1 : 0)).toLocaleString() }} total votes</p>

      <template v-if="!voted">
        <div class="space-y-2 mb-5">
          <button
            v-for="(o, i) in options"
            :key="o.label"
            @click="selected = i"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200',
              selected === i
                ? 'bg-[#58a6ff]/10 border-[#58a6ff]/50 text-[#e6edf3]'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/40',
            ]"
          >
            <span class="text-lg">{{ o.emoji }}</span>
            <span class="font-medium">{{ o.label }}</span>
            <span v-if="selected === i" class="ml-auto w-4 h-4 rounded-full bg-[#58a6ff] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
          </button>
        </div>
        <button
          @click="vote"
          :disabled="selected === null"
          class="w-full py-2.5 bg-[#238636] border border-[#2ea043] text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-[#2ea043] transition-colors"
        >
          Vote
        </button>
      </template>

      <template v-else>
        <div class="space-y-3">
          <div v-for="(o, rank) in sortedForResults" :key="o.label">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span>{{ o.emoji }}</span>
                <span :class="['text-sm font-medium', rank === 0 ? 'text-[#f1e05a]' : 'text-[#8b949e]']">{{ o.label }}</span>
                <span v-if="rank === 0" class="text-xs">👑</span>
              </div>
              <span class="text-xs font-bold text-[#e6edf3] tabular-nums">{{ getPct(o.votes) }}%</span>
            </div>
            <div class="h-2 bg-[#21262d] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{ width: getPct(o.votes) + '%', background: rank === 0 ? '#f1e05a' : '#30363d' }"
              />
            </div>
            <p class="text-[10px] text-[#484f58] mt-0.5">{{ o.votes.toLocaleString() }} votes</p>
          </div>
          <button
            @click="resetVote"
            class="w-full mt-2 py-2 text-sm text-[#484f58] hover:text-[#8b949e] transition-colors"
          >
            Vote again
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>
