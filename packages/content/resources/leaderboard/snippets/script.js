let USERS = [
  { id: 1, name: "Alice Smith", score: 9850, prevRank: 1 },
  { id: 2, name: "Bob Johnson", score: 8420, prevRank: 2 },
  { id: 3, name: "Carol Williams", score: 8100, prevRank: 3 },
  { id: 4, name: "David Brown", score: 7650, prevRank: 4 },
  { id: 5, name: "Eve Davis", score: 6980, prevRank: 5 },
  { id: 6, name: "Frank Miller", score: 6200, prevRank: 6 },
  { id: 7, name: "Grace Wilson", score: 5800, prevRank: 7 },
];

const COLORS = ["#818cf8", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#38bdf8", "#fb7185"];

const board = document.getElementById("leaderboard");
let liveInterval = null;

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
}

function render(animateBars = false) {
  // Sort by score
  USERS.sort((a, b) => b.score - a.score);

  // Update ranks
  USERS.forEach((u, i) => {
    u.rank = i + 1;
  });

  const maxScore = USERS[0].score * 1.1;

  board.innerHTML = "";

  USERS.forEach((u, i) => {
    const el = document.createElement("div");
    el.className = "lb-entry";
    // Position absolute for sorting animation if needed. We'll use order for flexbox or simple list replacement
    // Simple list replacement works smoothly enough for score bars

    let rankCls = "";
    if (u.rank === 1) rankCls = "gold";
    else if (u.rank === 2) rankCls = "silver";
    else if (u.rank === 3) rankCls = "bronze";

    const rankDiff = u.prevRank - u.rank;
    let rankArrow = `<span class="lb-delta same">—</span>`;
    if (rankDiff > 0) rankArrow = `<span class="lb-delta up">▲ ${rankDiff}</span>`;
    else if (rankDiff < 0) rankArrow = `<span class="lb-delta down">▼ ${Math.abs(rankDiff)}</span>`;

    const color = COLORS[u.id % COLORS.length];
    const targetW = (u.score / maxScore) * 100 + "%";
    const initW = animateBars ? "0%" : targetW;

    el.innerHTML = `
      <div class="lb-rank ${rankCls}">${u.rank}</div>
      ${rankArrow}
      <div class="lb-av" style="background:${color}">${getInitials(u.name)}</div>
      <div class="lb-info">
        <div class="lb-name">${u.name}</div>
        <div class="lb-score-bar-wrap">
          <div class="lb-score-bar" style="background:${color}; width:${initW};" data-w="${targetW}"></div>
        </div>
      </div>
      <div class="lb-score">${u.score.toLocaleString()}</div>
    `;

    board.appendChild(el);

    if (animateBars) {
      setTimeout(() => {
        el.querySelector(".lb-score-bar").style.width = targetW;
      }, 50);
    }
  });
}

render(true);

document.getElementById("liveBtn").addEventListener("click", (e) => {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
    e.target.textContent = "▶ Start Live";
    e.target.classList.remove("active");
  } else {
    e.target.textContent = "■ Stop Live";
    e.target.classList.add("active");
    liveInterval = setInterval(() => {
      // Simulate live score changes
      USERS.forEach((u) => {
        u.prevRank = u.rank;
        u.score += Math.floor(Math.random() * 500); // add 0-500 points
      });
      render(true);
    }, 2500);
  }
});
