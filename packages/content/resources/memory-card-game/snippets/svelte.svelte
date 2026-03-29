<script>
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

let cards = makeCards();
let flippedIds = [];
let moves = 0;
let locked = false;
let won = false;

$: matchedCount = cards.filter((c) => c.matched).length / 2;

function flip(id) {
  if (locked) return;
  const card = cards.find((c) => c.id === id);
  if (!card || card.flipped || card.matched) return;
  if (flippedIds.length === 2) return;

  card.flipped = true;
  cards = cards;
  const newFlipped = [...flippedIds, id];
  flippedIds = newFlipped;

  if (newFlipped.length === 2) {
    moves++;
    const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid));
    if (a.emoji === b.emoji) {
      setTimeout(() => {
        a.matched = true;
        b.matched = true;
        cards = cards;
        flippedIds = [];
        if (cards.every((c) => c.matched)) won = true;
      }, 400);
    } else {
      locked = true;
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        cards = cards;
        flippedIds = [];
        locked = false;
      }, 900);
    }
  }
}

function restart() {
  cards = makeCards();
  flippedIds = [];
  moves = 0;
  locked = false;
  won = false;
}
</script>

<div style="min-height:100vh;background:#0d1117;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
  <div style="width:100%;max-width:24rem">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
      <div style="display:flex;gap:1rem;font-size:0.875rem">
        <span style="color:#8b949e">Moves: <strong style="color:#e6edf3">{moves}</strong></span>
        <span style="color:#8b949e">Matches: <strong style="color:#7ee787">{matchedCount}/{EMOJIS.length}</strong></span>
      </div>
      <button on:click={restart} style="font-size:0.75rem;color:#58a6ff;background:none;border:none;cursor:pointer;font-family:inherit">New game</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem">
      {#each cards as card (card.id)}
        <button
          on:click={() => flip(card.id)}
          disabled={card.matched}
          style="aspect-ratio:1;border-radius:0.75rem;font-size:1.5rem;border:1px solid {card.matched ? '#238636' : card.flipped ? '#58a6ff' : '#30363d'};background:{card.flipped || card.matched ? '#21262d' : '#161b22'};transform:{card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)'};transition:all 0.3s;cursor:{card.matched ? 'default' : 'pointer'};user-select:none;display:flex;align-items:center;justify-content:center"
        >
          {card.flipped || card.matched ? card.emoji : ''}
        </button>
      {/each}
    </div>

    {#if won}
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10">
        <div style="background:#161b22;border:1px solid #30363d;border-radius:1rem;padding:2rem;text-align:center;margin:1.5rem">
          <p style="font-size:2.5rem;margin-bottom:0.75rem">🎉</p>
          <h2 style="font-weight:700;font-size:1.25rem;margin-bottom:0.25rem">You won!</h2>
          <p style="color:#8b949e;font-size:0.875rem;margin-bottom:1.5rem">Completed in {moves} moves</p>
          <button
            on:click={restart}
            style="padding:0.625rem 1.5rem;background:#238636;border:1px solid #2ea043;color:#fff;border-radius:0.75rem;font-weight:600;font-size:0.875rem;cursor:pointer;font-family:inherit"
          >Play Again</button>
        </div>
      </div>
    {/if}
  </div>
</div>
