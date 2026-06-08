const ITEMS = [
  {
    glyph: "🥩",
    name: "Ribeye, plated",
    meta: "Marrow butter · chimichurri",
    cat: "plates",
    tag: "Signature",
    h: 2,
  },
  { glyph: "🔥", name: "The hearth", meta: "Olive + oak, 480°C", cat: "kitchen", tag: null, h: 6 },
  {
    glyph: "🥖",
    name: "Pan masa madre",
    meta: "Daily, smoked oil",
    cat: "plates",
    tag: null,
    h: 3,
  },
  { glyph: "🌿", name: "Garden basil", meta: "Aravaca, June", cat: "garden", tag: null, h: 4 },
  { glyph: "🍷", name: "Wine cellar", meta: "140 bottles · natural", cat: "room", tag: null, h: 1 },
  {
    glyph: "🐟",
    name: "Whole branzino",
    meta: "Fennel · preserved lemon",
    cat: "plates",
    tag: null,
    h: 7,
  },
  { glyph: "🍅", name: "Heirloom tomato", meta: "Aravaca, July", cat: "garden", tag: null, h: 5 },
  {
    glyph: "🪑",
    name: "Dining room",
    meta: "Twelve tables · oak floors",
    cat: "room",
    tag: null,
    h: 8,
  },
  {
    glyph: "🍰",
    name: "Burnt cheesecake",
    meta: "Basque · salted caramel",
    cat: "plates",
    tag: null,
    h: 1,
  },
  {
    glyph: "👨‍🍳",
    name: "Aitor, Tuesday prep",
    meta: "Pickling fennel",
    cat: "kitchen",
    tag: null,
    h: 4,
  },
  { glyph: "🍴", name: "Service starts", meta: "19:00 · Tuesday", cat: "kitchen", tag: null, h: 3 },
  {
    glyph: "🦪",
    name: "Oyster Wednesdays",
    meta: "Special · launching June",
    cat: "specials",
    tag: "Special",
    h: 5,
  },
];

const gallery = document.getElementById("gallery");
const chips = document.getElementById("chips");
const lb = document.getElementById("lb");
const lbTile = document.getElementById("lbTile");
const lbCap = document.getElementById("lbCap");

function render() {
  gallery.innerHTML = ITEMS.map(
    (item, idx) => `
    <article class="tile h-${item.h}" data-idx="${idx}" data-cat="${item.cat}">
      <div class="tile-art">
        <span class="glyph">${item.glyph}</span>
      </div>
      <div class="tile-cap">
        <div>
          <p class="tile-name">${item.name}</p>
          <p class="tile-meta">${item.meta}</p>
        </div>
        ${item.tag ? `<span class="tile-tag">${item.tag}</span>` : ""}
      </div>
    </article>`
  ).join("");
}

let activeFilter = "all";
let activeIdx = 0;

function filter(cat) {
  activeFilter = cat;
  document
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.toggle("is-active", c.dataset.filter === cat));
  document.querySelectorAll(".tile").forEach((t) => {
    t.classList.toggle("is-hidden", cat !== "all" && t.dataset.cat !== cat);
  });
}

function visibleIndexes() {
  return ITEMS.map((_, i) => i).filter((i) => {
    return activeFilter === "all" || ITEMS[i].cat === activeFilter;
  });
}

function openLb(idx) {
  activeIdx = idx;
  paint();
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLb() {
  lb.hidden = true;
  document.body.style.overflow = "";
}

function paint() {
  const item = ITEMS[activeIdx];
  if (!item) return;
  // Reuse the tile gradient by class
  lbTile.className = `lb-tile h-${item.h}`;
  // The class names .h-N are scoped to .tile in CSS; mirror inline gradient here.
  const gradients = {
    1: "linear-gradient(135deg, #c1714a, #a05a38)",
    2: "linear-gradient(135deg, #2d4a3e, #1e3329)",
    3: "linear-gradient(135deg, #c9a84c, #e6c97a)",
    4: "linear-gradient(135deg, #5e7a4a, #3d4a32)",
    5: "linear-gradient(135deg, #b3432a, #c1714a)",
    6: "linear-gradient(135deg, #4a3828, #2c1a0e)",
    7: "linear-gradient(135deg, #d99020, #c9a84c)",
    8: "linear-gradient(135deg, #7a6a58, #4a3828)",
  };
  lbTile.style.background = gradients[item.h] || gradients[1];
  lbTile.textContent = item.glyph;
  lbCap.innerHTML = `${item.name} · <em>${item.meta}</em>`;
}

function step(dir) {
  const visible = visibleIndexes();
  const here = visible.indexOf(activeIdx);
  if (here < 0) {
    activeIdx = visible[0] ?? 0;
  } else {
    const next = (here + dir + visible.length) % visible.length;
    activeIdx = visible[next];
  }
  paint();
}

chips.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  filter(btn.dataset.filter);
});

gallery.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-idx]");
  if (!tile) return;
  openLb(Number(tile.dataset.idx));
});

document.getElementById("lbClose").addEventListener("click", closeLb);
document.getElementById("lbPrev").addEventListener("click", () => step(-1));
document.getElementById("lbNext").addEventListener("click", () => step(1));

document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

lb.addEventListener("click", (e) => {
  if (e.target === lb) closeLb();
});

render();
