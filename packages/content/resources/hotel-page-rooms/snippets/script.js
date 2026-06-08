// ── Room catalogue data ───────────────────────────────────────────────────────
const ROOMS = [
  {
    id: "classic-double",
    name: "Classic Double",
    cat: "room",
    img: "img-classic",
    tag: "Smart value",
    size: 24,
    sleeps: 2,
    fromPrice: 148,
    amenities: ["Wi-Fi", "City view", "Free Cancellation"],
    desc: "Courtyard view · 24 m² · Queen bed",
  },
  {
    id: "deluxe-double",
    name: "Deluxe Double",
    cat: "room",
    img: "img-deluxe",
    tag: "Most popular",
    size: 30,
    sleeps: 2,
    fromPrice: 192,
    amenities: ["Wi-Fi", "Balcony", "Breakfast", "Free Cancellation"],
    desc: "City view · 30 m² · King bed",
  },
  {
    id: "junior-suite",
    name: "Junior Suite",
    cat: "suite",
    img: "img-junior",
    tag: "Suite",
    size: 44,
    sleeps: 2,
    fromPrice: 274,
    amenities: ["Wi-Fi", "Balcony", "Breakfast", "Spa Access", "Free Cancellation"],
    desc: "Balcony · 44 m² · King bed + lounge area",
  },
  {
    id: "signature-suite",
    name: "Signature Suite",
    cat: "suite",
    img: "img-signature",
    tag: "Top suite",
    size: 66,
    sleeps: 2,
    fromPrice: 418,
    amenities: ["Wi-Fi", "Terrace", "Breakfast", "Spa Access", "Butler", "Free Cancellation"],
    desc: "Terrace · 66 m² · Separate living room",
  },
  {
    id: "family-room",
    name: "Family Room",
    cat: "family",
    img: "img-family",
    tag: "Family",
    size: 42,
    sleeps: 4,
    fromPrice: 236,
    amenities: ["Wi-Fi", "City view", "Breakfast", "Free Cancellation"],
    desc: "City view · 42 m² · King bed + 2 singles",
  },
  {
    id: "family-suite",
    name: "Family Suite",
    cat: "family",
    img: "img-signature",
    tag: "Family Suite",
    size: 58,
    sleeps: 5,
    fromPrice: 354,
    amenities: ["Wi-Fi", "Balcony", "Breakfast", "Spa Access", "Free Cancellation"],
    desc: "Balcony · 58 m² · Two bedrooms",
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let activeCat = "all";
let isGrid = true;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const grid = document.getElementById("roomGrid");
const emptyEl = document.getElementById("emptyMsg");
const toast = document.getElementById("toast");

// ── Helpers ───────────────────────────────────────────────────────────────────
const eur = (n) => "€" + n.toLocaleString("en-GB");

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const visible = ROOMS.filter((r) => activeCat === "all" || r.cat === activeCat);
  emptyEl.hidden = visible.length > 0;

  if (!isGrid) {
    grid.classList.add("list-view");
  } else {
    grid.classList.remove("list-view");
  }

  grid.innerHTML = visible
    .map((r) => {
      const greenBadges = new Set(["Free Cancellation", "Breakfast"]);
      const badges = r.amenities
        .map((a) => `<span class="ab ${greenBadges.has(a) ? "green" : ""}">${a}</span>`)
        .join("");

      return `
      <article class="room-card" data-id="${r.id}">
        <div class="card-img ${r.img}">
          <span class="card-badge">${r.tag}</span>
          <div class="card-price-overlay">
            <div class="from">From</div>
            <div class="amount">${eur(r.fromPrice)}</div>
          </div>
        </div>
        <div class="card-body">
          <h3>${r.name}</h3>
          <p class="card-meta">
            <span>📐 ${r.size} m²</span>
            <span>👤 Sleeps ${r.sleeps}</span>
          </p>
          <p style="font-size:0.82rem;color:var(--warm-gray)">${r.desc}</p>
          <div class="amenity-badges">${badges}</div>
          <div class="card-footer">
            <div class="price-detail">
              <strong>${eur(r.fromPrice)}</strong><br/>
              per night · from
            </div>
            <div style="display:flex;gap:8px">
              <button class="book-btn secondary" data-action="view" data-name="${r.name}">View room</button>
              <button class="book-btn" data-action="book" data-name="${r.name}">Book</button>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

// ── Category filter ───────────────────────────────────────────────────────────
document.getElementById("filterPills").addEventListener("click", (e) => {
  const pill = e.target.closest(".pill");
  if (!pill) return;
  activeCat = pill.dataset.cat;
  document.querySelectorAll(".pill").forEach((p) => {
    p.classList.toggle("active", p === pill);
    p.setAttribute("aria-selected", p === pill ? "true" : "false");
  });
  render();
});

// ── View toggle ───────────────────────────────────────────────────────────────
document.getElementById("gridBtn").addEventListener("click", () => {
  isGrid = true;
  document.getElementById("gridBtn").classList.add("active");
  document.getElementById("listBtn").classList.remove("active");
  document.getElementById("gridBtn").setAttribute("aria-pressed", "true");
  document.getElementById("listBtn").setAttribute("aria-pressed", "false");
  render();
});
document.getElementById("listBtn").addEventListener("click", () => {
  isGrid = false;
  document.getElementById("listBtn").classList.add("active");
  document.getElementById("gridBtn").classList.remove("active");
  document.getElementById("listBtn").setAttribute("aria-pressed", "true");
  document.getElementById("gridBtn").setAttribute("aria-pressed", "false");
  render();
});

// ── CTA delegation ────────────────────────────────────────────────────────────
grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, name } = btn.dataset;
  if (action === "book") {
    showToast(`${name} — reservation started for 9–12 Jun 2026 ✓`);
  } else if (action === "view") {
    showToast(`Opening details for ${name}…`);
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
render();
