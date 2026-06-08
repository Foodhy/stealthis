// ── Gallery data ──────────────────────────────────────────────────────────────
const TILES = [
  // Rooms
  {
    id: 1,
    cat: "rooms",
    title: "Signature Suite — Living Room",
    grad: "g-rooms",
    height: "h-xl",
    desc: "The 66 m² Signature Suite living area, 14th floor. Hand-stitched velvet furnishings, panoramic terrace doors, and curated local art. June 2026.",
  },
  {
    id: 2,
    cat: "rooms",
    title: "Classic Double — City View",
    grad: "g-rooms-2",
    height: "h-md",
    desc: "A 24 m² Classic Double overlooking the Gran Vía. Queen bed, bespoke Italian linens, and blackout drapes.",
  },
  {
    id: 3,
    cat: "rooms",
    title: "Junior Suite — Bedroom",
    grad: "g-rooms",
    height: "h-lg",
    desc: "The Junior Suite bedroom with a king bed, herringbone parquet, and a private balcony facing the Royal Palace.",
  },
  {
    id: 4,
    cat: "rooms",
    title: "Deluxe Double — Bathroom",
    grad: "g-rooms-2",
    height: "h-sm",
    desc: "Carrara marble bathroom in the Deluxe Double. Freestanding bath, rain shower, and Byredo toiletries.",
  },

  // Dining
  {
    id: 5,
    cat: "dining",
    title: "Restaurante Laurel — Table 9",
    grad: "g-dining",
    height: "h-lg",
    desc: "Intimate table setting for the 8-course tasting menu. Baccarat crystal, Limoges china, and a sommelier-curated pairing of Spanish natural wines.",
  },
  {
    id: 6,
    cat: "dining",
    title: "Cenit Rooftop Bar — Terrace",
    grad: "g-dining-2",
    height: "h-xl",
    desc: "The 14th-floor Cenit terrace at dusk. Craft cocktails and a panoramic skyline during the June residency, 9–12 Jun 2026.",
  },
  {
    id: 7,
    cat: "dining",
    title: "Breakfast Buffet — Garden Room",
    grad: "g-dining",
    height: "h-sm",
    desc: "Morning light in the Garden Room breakfast service. Local charcuterie, pastries from Mallorca, and house-pressed orange juice.",
  },
  {
    id: 8,
    cat: "dining",
    title: "Chef's Table Experience",
    grad: "g-dining-2",
    height: "h-md",
    desc: "An intimate 6-seat chef's table in the kitchen, led by Executive Chef Marcos Soto. Available Friday and Saturday evenings.",
  },

  // Spa
  {
    id: 9,
    cat: "spa",
    title: "Hammam & Steam Room",
    grad: "g-spa",
    height: "h-md",
    desc: "Our 1,200 m² wellness sanctuary. Hand-laid mosaic tiles, aromatic steam, and a 38°C hammam plunge pool.",
  },
  {
    id: 10,
    cat: "spa",
    title: "Treatment Suite — Serenity",
    grad: "g-spa-2",
    height: "h-lg",
    desc: "A private double-treatment suite for couples. Aurelia Signature massage with orange blossom oil, 90 minutes.",
  },
  {
    id: 11,
    cat: "spa",
    title: "Indoor Pool — Morning Lap",
    grad: "g-spa",
    height: "h-xl",
    desc: "The heated 25-metre indoor pool before the morning rush. Available from 07:00 daily for exclusive lane swimming.",
  },
  {
    id: 12,
    cat: "spa",
    title: "Fitness Studio — Strength Zone",
    grad: "g-spa-2",
    height: "h-sm",
    desc: "Technogym Artis strength equipment and free weights. Personal training available by advance booking.",
  },

  // Views
  {
    id: 13,
    cat: "views",
    title: "Madrid Skyline — Sunrise",
    grad: "g-views",
    height: "h-xl",
    desc: "Looking east from the Signature Suite terrace, 14th floor. Sunrise over the Castellana, 09 Jun 2026, 06:42.",
  },
  {
    id: 14,
    cat: "views",
    title: "Rooftop — Golden Hour",
    grad: "g-views-2",
    height: "h-lg",
    desc: "Cenit Bar terrace facing the Sierra de Guadarrama at golden hour, 10 Jun 2026, 21:15.",
  },
  {
    id: 15,
    cat: "views",
    title: "Courtyard Garden — Midday",
    grad: "g-views",
    height: "h-md",
    desc: "The private courtyard garden, planted with olive, orange, and jasmine. Open to all guests for al-fresco reading.",
  },
  {
    id: 16,
    cat: "views",
    title: "Gran Vía — Night Panorama",
    grad: "g-views-2",
    height: "h-sm",
    desc: "A panoramic long-exposure of the Gran Vía from Room 1104, 11 Jun 2026 at 23:00.",
  },

  // Events
  {
    id: 17,
    cat: "events",
    title: "Salón Real — Wedding Reception",
    grad: "g-events",
    height: "h-lg",
    desc: "The Salón Real ballroom dressed for a 120-seat wedding reception on 10 Jun 2026. Floral design by Botanica Madrid.",
  },
  {
    id: 18,
    cat: "events",
    title: "Boardroom — Executive Summit",
    grad: "g-events-2",
    height: "h-sm",
    desc: "24-seat boardroom configuration for the Iberia Leadership Forum, 9 Jun 2026. Full AV and live-translation booths.",
  },
  {
    id: 19,
    cat: "events",
    title: "Terrace Cocktail Hour",
    grad: "g-events",
    height: "h-md",
    desc: "Pre-dinner cocktails on the 8th-floor terrace for 60 guests, 12 Jun 2026. Bespoke Aurelia spritz and live jazz.",
  },
  {
    id: 20,
    cat: "events",
    title: "Gala Dinner — Table Styling",
    grad: "g-events-2",
    height: "h-xl",
    desc: "Round tables dressed in ivory and gold for a 90-person gala dinner in the Salón Dorado. Custom centrepieces by Flores Aurelia.",
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let activeCat = "all";
let lightboxIndex = 0;
let visibleTiles = [];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const galleryGrid = document.getElementById("galleryGrid");
const emptyEl = document.getElementById("emptyMsg");
const tileCountEl = document.getElementById("tileCount");
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbTitle = document.getElementById("lbTitle");
const lbDesc = document.getElementById("lbDesc");
const lbCatBadge = document.getElementById("lbCatBadge");
const lbCurrent = document.getElementById("lbCurrent");
const lbTotal = document.getElementById("lbTotal");
const toast = document.getElementById("toast");

// ── Helpers ───────────────────────────────────────────────────────────────────
const CAT_LABEL = {
  rooms: "Rooms",
  dining: "Dining",
  spa: "Spa",
  views: "Views",
  events: "Events",
};

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Render grid ───────────────────────────────────────────────────────────────
function renderGrid() {
  visibleTiles = TILES.filter((t) => activeCat === "all" || t.cat === activeCat);
  emptyEl.hidden = visibleTiles.length > 0;
  tileCountEl.textContent = visibleTiles.length;

  galleryGrid.innerHTML = visibleTiles
    .map(
      (t, i) => `
      <div class="gallery-tile" data-index="${i}" role="button" tabindex="0" aria-label="Open photo: ${t.title}">
        <div class="tile-img ${t.grad} ${t.height}"></div>
        <div class="tile-overlay">
          <p class="tile-overlay-title">${t.title}</p>
          <p class="tile-overlay-cat">${CAT_LABEL[t.cat] || t.cat}</p>
        </div>
      </div>`
    )
    .join("");
}

// ── Open lightbox ─────────────────────────────────────────────────────────────
function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("lbClose").focus();
}

function updateLightbox() {
  const t = visibleTiles[lightboxIndex];
  if (!t) return;

  // Rebuild gradient in lightbox image area
  lbImage.className = `lb-image tile-img ${t.grad}`;
  lbImage.style.height = "420px";

  lbTitle.textContent = t.title;
  lbDesc.textContent = t.desc;
  lbCatBadge.textContent = CAT_LABEL[t.cat] || t.cat;
  lbCurrent.textContent = lightboxIndex + 1;
  lbTotal.textContent = visibleTiles.length;

  // Show/hide nav when only one tile
  document.getElementById("lbPrev").style.visibility =
    visibleTiles.length > 1 ? "visible" : "hidden";
  document.getElementById("lbNext").style.visibility =
    visibleTiles.length > 1 ? "visible" : "hidden";
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

function prevPhoto() {
  lightboxIndex = (lightboxIndex - 1 + visibleTiles.length) % visibleTiles.length;
  updateLightbox();
}

function nextPhoto() {
  lightboxIndex = (lightboxIndex + 1) % visibleTiles.length;
  updateLightbox();
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
  renderGrid();
});

// ── Grid click / keyboard ─────────────────────────────────────────────────────
galleryGrid.addEventListener("click", (e) => {
  const tile = e.target.closest(".gallery-tile");
  if (!tile) return;
  openLightbox(Number(tile.dataset.index));
});
galleryGrid.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const tile = e.target.closest(".gallery-tile");
  if (!tile) return;
  e.preventDefault();
  openLightbox(Number(tile.dataset.index));
});

// ── Lightbox controls ─────────────────────────────────────────────────────────
document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbBackdrop").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", prevPhoto);
document.getElementById("lbNext").addEventListener("click", nextPhoto);

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prevPhoto();
  if (e.key === "ArrowRight") nextPhoto();
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderGrid();
