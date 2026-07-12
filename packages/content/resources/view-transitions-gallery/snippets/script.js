// View Transitions Gallery — morph a grid thumbnail into a detail hero
// using document.startViewTransition() with a shared view-transition-name.

/** @typedef {{id:string,title:string,desc:string,camera:string,lens:string,iso:string,shutter:string,colors:string[]}} Photo */

/** @type {Photo[]} */
const PHOTOS = [
  {
    id: "APT-014",
    title: "Cobalt Terraces",
    desc: "Terraced salt flats at first light, mineral blues bleeding into a pale horizon.",
    camera: "Sony A7 IV",
    lens: "24mm f/1.4",
    iso: "100",
    shutter: "1/250s",
    colors: ["#1e3a8a", "#3b82f6", "#93c5fd", "#e0f2fe"],
  },
  {
    id: "APT-027",
    title: "Ember Dunes",
    desc: "Wind-carved ridgelines glowing amber as the desert sun drops below the crest.",
    camera: "Fuji X-T5",
    lens: "56mm f/1.2",
    iso: "160",
    shutter: "1/500s",
    colors: ["#7c2d12", "#ea580c", "#fb923c", "#fed7aa"],
  },
  {
    id: "APT-039",
    title: "Fern Cathedral",
    desc: "Old-growth canopy filtering green light through a lattice of unfurling ferns.",
    camera: "Canon R5",
    lens: "35mm f/1.8",
    iso: "400",
    shutter: "1/125s",
    colors: ["#14532d", "#16a34a", "#4ade80", "#bbf7d0"],
  },
  {
    id: "APT-052",
    title: "Neon Underpass",
    desc: "Rain-slicked concrete reflecting a corridor of magenta and cyan tube light.",
    camera: "Nikon Z8",
    lens: "50mm f/1.8",
    iso: "800",
    shutter: "1/60s",
    colors: ["#831843", "#db2777", "#22d3ee", "#a5f3fc"],
  },
  {
    id: "APT-061",
    title: "Glacier Seam",
    desc: "A crevasse splitting ancient ice, its core glowing an impossible turquoise.",
    camera: "Sony A7R V",
    lens: "16mm f/2.8",
    iso: "64",
    shutter: "1/320s",
    colors: ["#0e7490", "#06b6d4", "#67e8f9", "#ecfeff"],
  },
  {
    id: "APT-078",
    title: "Violet Static",
    desc: "Long-exposure aurora smeared across a starfield in ribbons of violet and rose.",
    camera: "Fuji GFX 100",
    lens: "23mm f/4",
    iso: "1600",
    shutter: "8s",
    colors: ["#4c1d95", "#7c3aed", "#c4b5fd", "#f5f3ff"],
  },
];

/** Build a deterministic SVG "photo" from a palette — no network needed. */
function makeArt(photo, seed) {
  const [a, b, c, d] = photo.colors;
  const gid = `g${seed}`;
  const rid = `r${seed}`;
  // pseudo-random blobs from the id
  const n = photo.id.replace(/\D/g, "") | 0;
  const cx1 = 20 + (n % 40);
  const cy1 = 25 + ((n * 3) % 40);
  const cx2 = 60 + (n % 30);
  const cy2 = 55 + ((n * 7) % 35);
  return `
    <svg class="card__img" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice"
         role="img" aria-label="${photo.title}">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="0.55" stop-color="${b}"/>
          <stop offset="1" stop-color="${c}"/>
        </linearGradient>
        <radialGradient id="${rid}" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0" stop-color="${d}" stop-opacity="0.55"/>
          <stop offset="0.5" stop-color="${c}" stop-opacity="0.15"/>
          <stop offset="1" stop-color="${a}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100" height="120" fill="url(#${gid})"/>
      <circle cx="${cx1}" cy="${cy1}" r="34" fill="${d}" opacity="0.18"/>
      <circle cx="${cx2}" cy="${cy2}" r="42" fill="${a}" opacity="0.28"/>
      <rect width="100" height="120" fill="url(#${rid})"/>
    </svg>`;
}

const gridView = document.getElementById("gridView");
const detailView = document.getElementById("detailView");
const gridList = document.getElementById("gridList");
const statusEl = document.getElementById("status");
const statusText = document.getElementById("statusText");

const supportsVT = typeof document.startViewTransition === "function";

let currentIndex = -1;

// --- Status line -----------------------------------------------------------
if (supportsVT) {
  statusEl.classList.add("is-ok");
  statusText.textContent = "View Transitions API active";
} else {
  statusEl.classList.add("is-warn");
  statusText.textContent = "API unsupported — using crossfade fallback";
}

// --- Build the grid --------------------------------------------------------
PHOTOS.forEach((photo, i) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card";
  btn.dataset.index = String(i);
  btn.setAttribute("aria-label", `Open ${photo.title}, photo ${photo.id}`);
  btn.innerHTML =
    makeArt(photo, i) +
    `<span class="card__label">${photo.title}<span class="card__id">${photo.id}</span></span>`;
  btn.addEventListener("click", () => openDetail(i));
  li.appendChild(btn);
  gridList.appendChild(li);
});

// --- Transition helper -----------------------------------------------------
/**
 * Run a DOM-mutating callback inside a view transition when available,
 * otherwise apply a lightweight CSS crossfade as a graceful fallback.
 */
function transition(mutate, incomingEl) {
  if (supportsVT && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(mutate);
    return;
  }
  mutate();
  if (incomingEl) {
    incomingEl.classList.remove("view-swap");
    // force reflow so the animation re-triggers
    void incomingEl.offsetWidth;
    incomingEl.classList.add("view-swap");
  }
}

// --- Open detail (grid → detail) ------------------------------------------
function openDetail(index) {
  const photo = PHOTOS[index];
  const card = gridList.querySelector(`.card[data-index="${index}"]`);

  // Tag the clicked thumbnail as the shared element BEFORE the snapshot.
  if (card) card.style.viewTransitionName = "hero-media";

  transition(() => {
    currentIndex = index;
    renderDetail(photo, index);
    gridView.hidden = true;
    detailView.hidden = false;
  }, detailView);

  // Clean up the name after the old snapshot is captured.
  requestAnimationFrame(() => {
    if (card) card.style.viewTransitionName = "";
  });
}

// --- Close detail (detail → grid) -----------------------------------------
function closeDetail() {
  const returningCard = gridList.querySelector(
    `.card[data-index="${currentIndex}"]`
  );
  if (returningCard) returningCard.style.viewTransitionName = "hero-media";

  transition(() => {
    detailView.hidden = true;
    gridView.hidden = false;
  }, gridView);

  requestAnimationFrame(() => {
    if (returningCard) {
      returningCard.style.viewTransitionName = "";
      returningCard.focus();
    }
  });
  currentIndex = -1;
}

// --- Navigate between photos in detail view --------------------------------
function step(delta) {
  const next = (currentIndex + delta + PHOTOS.length) % PHOTOS.length;
  transition(() => {
    currentIndex = next;
    renderDetail(PHOTOS[next], next);
  }, document.getElementById("heroFig"));
}

// --- Render the detail panel ----------------------------------------------
function renderDetail(photo, index) {
  const media = document.getElementById("heroMedia");
  media.innerHTML = makeArt(photo, index);
  media.style.viewTransitionName = "hero-media";

  document.getElementById("heroTitle").textContent = photo.title;
  document.getElementById("heroId").textContent = photo.id;
  document.getElementById("heroDesc").textContent = photo.desc;
  document.getElementById("detailCount").textContent =
    `${index + 1} / ${PHOTOS.length}`;

  document.getElementById("heroSpecs").innerHTML = `
    <dt>Camera</dt><dd>${photo.camera}</dd>
    <dt>Lens</dt><dd>${photo.lens}</dd>
    <dt>ISO</dt><dd>${photo.iso}</dd>
    <dt>Shutter</dt><dd>${photo.shutter}</dd>`;

  document.getElementById("heroPalette").innerHTML = photo.colors
    .map(
      (c) =>
        `<div class="palette__sw" style="background:${c}"><span>${c}</span></div>`
    )
    .join("");
}

// --- Wiring ----------------------------------------------------------------
document.getElementById("backBtn").addEventListener("click", closeDetail);
document.getElementById("prevBtn").addEventListener("click", () => step(-1));
document.getElementById("nextBtn").addEventListener("click", () => step(1));

// Keyboard: roving arrow-key focus on the grid, Esc/arrows in detail.
gridList.addEventListener("keydown", (e) => {
  const cards = [...gridList.querySelectorAll(".card")];
  const active = document.activeElement;
  let idx = cards.indexOf(active);
  if (idx === -1) return;
  const cols = getComputedStyle(gridList).gridTemplateColumns.split(" ").length;
  let target = null;
  if (e.key === "ArrowRight") target = cards[Math.min(idx + 1, cards.length - 1)];
  else if (e.key === "ArrowLeft") target = cards[Math.max(idx - 1, 0)];
  else if (e.key === "ArrowDown") target = cards[Math.min(idx + cols, cards.length - 1)];
  else if (e.key === "ArrowUp") target = cards[Math.max(idx - cols, 0)];
  if (target) {
    e.preventDefault();
    target.focus();
  }
});

document.addEventListener("keydown", (e) => {
  if (detailView.hidden) return;
  if (e.key === "Escape") closeDetail();
  else if (e.key === "ArrowRight") step(1);
  else if (e.key === "ArrowLeft") step(-1);
});

// Reveal the grid once wired up.
gridView.hidden = false;
