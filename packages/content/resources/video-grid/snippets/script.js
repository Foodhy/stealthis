const VIDEOS = [
  {
    id: 1,
    title: "Building a Full-Stack App with Next.js 14",
    category: "tutorials",
    views: "142K",
    duration: "42:18",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
  },
  {
    id: 2,
    title: "The Future of AI in Software Engineering",
    category: "talks",
    views: "98K",
    duration: "28:05",
    gradient: "linear-gradient(135deg,#0f3460,#533483)",
  },
  {
    id: 3,
    title: "CSS Tips You Wish You Knew Sooner",
    category: "shorts",
    views: "215K",
    duration: "0:58",
    gradient: "linear-gradient(135deg,#2d1b69,#11998e)",
  },
  {
    id: 4,
    title: "TypeScript Generics Deep Dive",
    category: "tutorials",
    views: "76K",
    duration: "35:22",
    gradient: "linear-gradient(135deg,#1e3c72,#2a5298)",
  },
  {
    id: 5,
    title: "Designing for Accessibility First",
    category: "talks",
    views: "54K",
    duration: "22:44",
    gradient: "linear-gradient(135deg,#134e5e,#71b280)",
  },
  {
    id: 6,
    title: "One CSS Trick to Rule Them All",
    category: "shorts",
    views: "403K",
    duration: "0:45",
    gradient: "linear-gradient(135deg,#4a1942,#c74b50)",
  },
  {
    id: 7,
    title: "Docker for Frontend Developers",
    category: "tutorials",
    views: "63K",
    duration: "19:30",
    gradient: "linear-gradient(135deg,#0f2027,#2c5364)",
  },
  {
    id: 8,
    title: "The Psychology of Code Reviews",
    category: "talks",
    views: "88K",
    duration: "31:12",
    gradient: "linear-gradient(135deg,#373b44,#4286f4)",
  },
];

const grid = document.getElementById("vgGrid");
let activeFilter = "all";
let playing = false;
let progressInterval = null;
let progressPct = 0;

function renderGrid() {
  grid.innerHTML = "";
  VIDEOS.forEach((v) => {
    const show = activeFilter === "all" || v.category === activeFilter;
    const card = document.createElement("div");
    card.className = "vg-card" + (show ? "" : " hidden");
    card.innerHTML = `
      <div class="vg-thumb">
        <div class="vg-thumb-bg" style="background:${v.gradient}"></div>
        <div class="vg-play-btn">▶</div>
        <span class="vg-duration">${v.duration}</span>
      </div>
      <div class="vg-info">
        <div class="vg-badge vg-badge--${v.category}">${v.category}</div>
        <div class="vg-video-title">${v.title}</div>
        <div class="vg-meta"><span>${v.views} views</span><span class="vg-meta-dot">•</span><span>${v.category}</span></div>
      </div>
    `;
    card.addEventListener("click", () => openModal(v));
    grid.appendChild(card);
  });
}

function openModal(v) {
  const modal = document.getElementById("vpModal");
  document.getElementById("vpModalTitle").textContent = v.title;
  document.getElementById("vpModalMeta").textContent = `${v.views} views • ${v.category}`;
  document.getElementById("vpFakeVideo").style.background = v.gradient;
  modal.hidden = false;
  resetPlayer();
}

function resetPlayer() {
  stopProgress();
  progressPct = 0;
  document.getElementById("vpFill").style.width = "0%";
  document.getElementById("vpPlay").textContent = "▶";
  document.getElementById("vpIndicator").hidden = true;
  document.getElementById("vp-big-play").textContent = "▶";
  playing = false;
}

function stopProgress() {
  clearInterval(progressInterval);
  progressInterval = null;
}

document.getElementById("vpPlay").addEventListener("click", () => {
  playing = !playing;
  document.getElementById("vpPlay").textContent = playing ? "⏸" : "▶";
  document.getElementById("vpIndicator").hidden = !playing;
  document.getElementById("vp-big-play").textContent = playing ? "" : "▶";

  if (playing) {
    progressInterval = setInterval(() => {
      progressPct = Math.min(progressPct + 0.4, 100);
      document.getElementById("vpFill").style.width = progressPct + "%";
      if (progressPct >= 100) {
        stopProgress();
        playing = false;
        document.getElementById("vpPlay").textContent = "▶";
      }
    }, 100);
  } else {
    stopProgress();
  }
});

document.getElementById("vpClose").addEventListener("click", () => {
  document.getElementById("vpModal").hidden = true;
  stopProgress();
});

document.getElementById("vpBackdrop").addEventListener("click", () => {
  document.getElementById("vpModal").hidden = true;
  stopProgress();
});

document.getElementById("vgTabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".vg-tab");
  if (!tab) return;
  document.querySelectorAll(".vg-tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  activeFilter = tab.dataset.cat;
  renderGrid();
});

renderGrid();
