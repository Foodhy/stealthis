<script setup>
import { ref, computed } from "vue";

const EMOJIS = [
  "\u{1F680}",
  "\u{1F3A8}",
  "\u{1F3AE}",
  "\u{1F4A1}",
  "\u{1F3B5}",
  "\u26A1",
  "\u{1F525}",
  "\u{1F308}",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCards() {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

const cards = ref(makeCards());
const flippedIds = ref([]);
const moves = ref(0);
const locked = ref(false);
const won = ref(false);

const matched = computed(() => cards.value.filter((c) => c.matched).length / 2);

function flip(id) {
  if (locked.value) return;
  const card = cards.value.find((c) => c.id === id);
  if (!card || card.flipped || card.matched) return;
  if (flippedIds.value.length === 2) return;

  card.flipped = true;
  const newFlipped = [...flippedIds.value, id];
  flippedIds.value = newFlipped;

  if (newFlipped.length === 2) {
    moves.value++;
    const [a, b] = newFlipped.map((fid) => cards.value.find((c) => c.id === fid));
    if (a.emoji === b.emoji) {
      setTimeout(() => {
        a.matched = true;
        b.matched = true;
        flippedIds.value = [];
        if (cards.value.every((c) => c.matched)) won.value = true;
      }, 400);
    } else {
      locked.value = true;
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        flippedIds.value = [];
        locked.value = false;
      }, 900);
    }
  }
}

function restart() {
  cards.value = makeCards();
  flippedIds.value = [];
  moves.value = 0;
  locked.value = false;
  won.value = false;
}
</script>

<template>
  <div style="min-height:100vh;background:#0d1117;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
    <div style="width:100%;max-width:24rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;font-size:0.875rem">
          <span style="color:#8b949e">Moves: <strong style="color:#e6edf3">{{ moves }}</strong></span>
          <span style="color:#8b949e">Matches: <strong style="color:#7ee787">{{ matched }}/{{ EMOJIS.length }}</strong></span>
        </div>
        <button @click="restart" style="font-size:0.75rem;color:#58a6ff;background:none;border:none;cursor:pointer;font-family:inherit">New game</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem">
        <button
          v-for="card in cards"
          :key="card.id"
          @click="flip(card.id)"
          :disabled="card.matched"
          :style="{
            aspectRatio: '1',
            borderRadius: '0.75rem',
            fontSize: '1.5rem',
            border: `1px solid ${card.matched ? '#238636' : card.flipped ? '#58a6ff' : '#30363d'}`,
            background: card.flipped || card.matched ? '#21262d' : '#161b22',
            transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
            transition: 'all 0.3s',
            cursor: card.matched ? 'default' : 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }"
        >{{ (card.flipped || card.matched) ? card.emoji : '' }}</button>
      </div>

      <div v-if="won" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10">
        <div style="background:#161b22;border:1px solid #30363d;border-radius:1rem;padding:2rem;text-align:center;margin:1.5rem">
          <p style="font-size:2.5rem;margin-bottom:0.75rem">\u{1F389}</p>
          <h2 style="font-weight:700;font-size:1.25rem;margin-bottom:0.25rem">You won!</h2>
          <p style="color:#8b949e;font-size:0.875rem;margin-bottom:1.5rem">Completed in {{ moves }} moves</p>
          <button
            @click="restart"
            style="padding:0.625rem 1.5rem;background:#238636;border:1px solid #2ea043;color:#fff;border-radius:0.75rem;font-weight:600;font-size:0.875rem;cursor:pointer;font-family:inherit"
          >Play Again</button>
        </div>
      </div>
    </div>
  </div>
</template>
