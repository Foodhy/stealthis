"use strict";

/* ---------- Data ---------- */
const EPISODES = [
  {
    id: 248, season: 3, title: "The Sound of Almost Human",
    teaser: "Neural voice engineer Priya Nandakumar on why the last 2% of realism is the hardest — and the ethics of crossing it.",
    duration: "58:12", mins: 58, date: "Jun 26, 2026",
  },
  {
    id: 247, season: 3, title: "Rooms That Don't Exist",
    teaser: "Building convincing spatial audio for places nobody has ever stood in, with acoustics researcher Theo Marsh.",
    duration: "44:05", mins: 44, date: "Jun 19, 2026",
  },
  {
    id: 246, season: 3, title: "A Synth in Every Pocket",
    teaser: "How generative music models went from lab curiosity to shipping in mobile apps, featuring founder Lena Ortiz.",
    duration: "51:37", mins: 51, date: "Jun 12, 2026",
  },
  {
    id: 231, season: 2, title: "The Loudness Wars, Revisited",
    teaser: "Mastering engineer Kwame Bediako on why everything sounds the same — and the quiet rebellion pushing back.",
    duration: "39:48", mins: 39, date: "Feb 20, 2026",
  },
  {
    id: 230, season: 2, title: "Latency Is a Feeling",
    teaser: "Why 12 milliseconds decides whether a musician trusts the software in their hands. With DSP hacker Sun-woo Park.",
    duration: "47:19", mins: 47, date: "Feb 13, 2026",
  },
  {
    id: 212, season: 1, title: "Where Signal Meets Static",
    teaser: "The pilot. Mara and Dev on why they left their day jobs to make a show about sound, software, and the messy middle.",
    duration: "33:02", mins: 33, date: "Sep 05, 2025",
  },
];

/* ---------- Toast ---------- */
let toastTimer;
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ---------- Waveform generator ---------- */
function waveBars(seed) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let html = "";
  for (let i = 0; i < 40; i++) {
    const h = 20 + Math.round(rnd() * 80);
    html += `<i style="height:${h}%"></i>`;
  }
  return html;
}

/* ---------- Render episodes ---------- */
const listEl = document.getElementById("epList");
const emptyEl = document.getElementById("epEmpty");
let currentSeason = "all";
let order = "newest";
let playingId = null;

function visibleEpisodes() {
  let eps = EPISODES.filter((e) => currentSeason === "all" || String(e.season) === currentSeason);
  eps = eps.slice().sort((a, b) => (order === "newest" ? b.id - a.id : a.id - b.id));
  return eps;
}

function render() {
  const eps = visibleEpisodes();
  listEl.innerHTML = "";
  emptyEl.hidden = eps.length > 0;

  eps.forEach((ep) => {
    const li = document.createElement("li");
    li.className = "ep" + (ep.id === playingId ? " is-playing" : "");
    li.dataset.id = ep.id;
    li.innerHTML = `
      <button class="play" data-play="${ep.id}" aria-label="Play ${escapeHtml(ep.title)}" aria-pressed="${ep.id === playingId}"></button>
      <div class="ep-body">
        <span class="ep-season">S${ep.season} · Ep ${ep.id}</span>
        <h3 class="ep-title">${escapeHtml(ep.title)}</h3>
        <p class="ep-teaser">${escapeHtml(ep.teaser)}</p>
        <div class="wave" aria-hidden="true">${waveBars(ep.id)}</div>
        <div class="ep-meta">
          <span class="tag">🎧 ${ep.date}</span>
          <span class="tag">Full episode</span>
        </div>
      </div>
      <div class="ep-side">
        <span class="ep-dur">${ep.duration}</span>
        <button class="ep-save" data-save="${ep.id}" aria-label="Save ${escapeHtml(ep.title)} for later" aria-pressed="false">＋</button>
      </div>`;
    listEl.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Playback ---------- */
const nowPlaying = document.getElementById("nowPlaying");
const npTitle = document.getElementById("npTitle");
const npToggle = document.getElementById("npToggle");
let paused = false;

function playEpisode(id) {
  const ep = EPISODES.find((e) => e.id === id);
  if (!ep) return;

  if (playingId === id && !paused) {
    // toggle pause
    paused = true;
    setPausedState(true);
    toast("Paused");
  } else {
    playingId = id;
    paused = false;
    setPausedState(false);
    npTitle.textContent = ep.title;
    nowPlaying.hidden = false;
    toast(`Now playing · ${ep.title}`);
  }
  render();
  syncPlayIcons();
}

function setPausedState(isPaused) {
  paused = isPaused;
  nowPlaying.classList.toggle("is-paused", isPaused);
  npToggle.textContent = isPaused ? "▶" : "❚❚";
  npToggle.setAttribute("aria-label", isPaused ? "Play" : "Pause");
  // reflect pause on active row
  document.querySelectorAll(".ep.is-playing").forEach((el) => {
    el.classList.toggle("is-paused", isPaused);
  });
}

function syncPlayIcons() {
  document.querySelectorAll(".ep").forEach((el) => {
    const isActive = Number(el.dataset.id) === playingId && !paused;
    el.classList.toggle("is-playing", Number(el.dataset.id) === playingId);
  });
}

listEl.addEventListener("click", (e) => {
  const playBtn = e.target.closest("[data-play]");
  if (playBtn) {
    playEpisode(Number(playBtn.dataset.play));
    return;
  }
  const saveBtn = e.target.closest("[data-save]");
  if (saveBtn) {
    const on = saveBtn.classList.toggle("is-saved");
    saveBtn.textContent = on ? "✓" : "＋";
    saveBtn.setAttribute("aria-pressed", String(on));
    toast(on ? "Saved to your queue" : "Removed from queue");
  }
});

npToggle.addEventListener("click", () => {
  if (!playingId) return;
  setPausedState(!paused);
  render();
  toast(paused ? "Paused" : "Playing");
});

document.getElementById("npClose").addEventListener("click", () => {
  nowPlaying.hidden = true;
  playingId = null;
  paused = false;
  render();
  toast("Player closed");
});

/* ---------- Filters & sort ---------- */
document.querySelector(".filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;
  document.querySelectorAll(".filters .pill").forEach((p) => p.classList.remove("is-active"));
  btn.classList.add("is-active");
  currentSeason = btn.dataset.season;
  render();
});

const sortBtn = document.getElementById("sortBtn");
sortBtn.addEventListener("click", () => {
  order = order === "newest" ? "oldest" : "newest";
  sortBtn.dataset.order = order;
  sortBtn.textContent = order === "newest" ? "Newest ↓" : "Oldest ↑";
  render();
});

/* ---------- Subscribe / follow / share ---------- */
const subBtn = document.getElementById("subscribeBtn");
subBtn.addEventListener("click", () => {
  const on = subBtn.classList.toggle("is-on");
  subBtn.setAttribute("aria-pressed", String(on));
  subBtn.querySelector(".btn-label").textContent = on ? "Subscribed" : "Subscribe";
  subBtn.querySelector(".btn-ico").textContent = on ? "✓" : "＋";
  toast(on ? "Subscribed to Signal & Static" : "Unsubscribed");
});

const followBtn = document.getElementById("followBtn");
followBtn.addEventListener("click", () => {
  const on = followBtn.classList.toggle("is-on");
  followBtn.setAttribute("aria-pressed", String(on));
  followBtn.querySelector(".btn-ico").textContent = on ? "♥" : "♡";
  followBtn.querySelector(".btn-label").textContent = on ? "Following" : "Follow";
  toast(on ? "You'll get new episode alerts" : "Unfollowed");
});

document.getElementById("shareBtn").addEventListener("click", () => {
  toast("Share link copied to clipboard");
});

/* ---------- Platform chips ---------- */
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", (e) => {
    e.preventDefault();
    toast(`Opening in ${chip.dataset.platform}…`);
  });
});

/* ---------- About toggle ---------- */
const aboutBody = document.getElementById("aboutBody");
const aboutToggle = document.getElementById("aboutToggle");
aboutToggle.addEventListener("click", () => {
  const clamped = aboutBody.classList.toggle("is-clamped");
  aboutToggle.setAttribute("aria-expanded", String(!clamped));
  aboutToggle.textContent = clamped ? "Read more" : "Read less";
});

/* ---------- Animated stat counters ---------- */
function formatNum(el, val) {
  const decimals = Number(el.dataset.decimals || 0);
  const suffix = el.dataset.suffix || "";
  if (el.dataset.format === "compact") {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M" + suffix;
    if (val >= 1000) return Math.round(val / 1000) + "K" + suffix;
    return Math.round(val) + suffix;
  }
  return val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}

function animateCounters() {
  document.querySelectorAll(".stat-num").forEach((el) => {
    const target = Number(el.dataset.count);
    const dur = 1100;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(el, target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(el, target);
    }
    requestAnimationFrame(step);
  });
}

/* ---------- Init ---------- */
render();
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".stat-num").forEach((el) => (el.textContent = formatNum(el, Number(el.dataset.count))));
} else {
  animateCounters();
}
