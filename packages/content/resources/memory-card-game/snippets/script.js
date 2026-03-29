const emojis = ["🚀", "🎨", "🎮", "💡", "🎵", "⚡", "🔥", "🌈"];
const cards = [...emojis, ...emojis];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let isAnimating = false;

const grid = document.getElementById("card-grid");
const moveCountEl = document.getElementById("move-count");
const matchCountEl = document.getElementById("match-count");
const winOverlay = document.getElementById("win-overlay");
const finalMovesEl = document.getElementById("final-moves");

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initGame() {
  const shuffled = shuffle(cards);
  grid.innerHTML = "";
  flippedCards = [];
  matchedCount = 0;
  moves = 0;
  moveCountEl.textContent = "0";
  matchCountEl.textContent = `0/${emojis.length}`;
  winOverlay.style.display = "none";
  isAnimating = false;

  shuffled.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.id = index;
    card.dataset.value = emoji;

    card.innerHTML = `
      <div class="card-face card-back"></div>
      <div class="card-face card-front">${emoji}</div>
    `;

    card.addEventListener("click", () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (
    isAnimating ||
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length >= 2
  )
    return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    moveCountEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  isAnimating = true;
  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.value === card2.dataset.value;

  if (isMatch) {
    matchedCount++;
    matchCountEl.textContent = `${matchedCount}/${emojis.length}`;

    // Add matched class for styling
    setTimeout(() => {
      card1.classList.add("matched");
      card2.classList.add("matched");
    }, 300);

    flippedCards = [];
    isAnimating = false;

    if (matchedCount === emojis.length) {
      showWin();
    }
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
      isAnimating = false;
    }, 1000);
  }
}

function showWin() {
  setTimeout(() => {
    winOverlay.style.display = "flex";
    if (finalMovesEl) finalMovesEl.textContent = moves;
  }, 500);
}

document.getElementById("reset-game").addEventListener("click", initGame);
document.getElementById("play-again-btn").addEventListener("click", initGame);

initGame();
