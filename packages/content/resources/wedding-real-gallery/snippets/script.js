// ---- Real Weddings gallery data (fictional) ----
// Each story uses layered CSS gradients as royalty-free "cover" imagery.
const G = (a, b, c) =>
  `linear-gradient(135deg, ${a}, ${b} 55%, ${c})`;

const WEDDINGS = [
  {
    id: "elena-marcus",
    couple: "Elena & Marcus",
    setting: "garden",
    settingLabel: "Garden",
    venue: "Willowmere Estate",
    city: "Sonoma, CA",
    date: "June 14, 2025",
    photographer: "Ines Aubry",
    photos: [
      G("#e8b7b0", "#c98a86", "#a8862f"),
      G("#fbeeec", "#e8b7b0", "#c98a86"),
      G("#c9a24b", "#e8b7b0", "#fbeeec"),
      G("#c98a86", "#a8862f", "#3a2b2b"),
      G("#f4ece4", "#e8b7b0", "#c9a24b"),
    ],
  },
  {
    id: "priya-daniel",
    couple: "Priya & Daniel",
    setting: "coastal",
    settingLabel: "Coastal",
    venue: "The Saltwater Pavilion",
    city: "Amalfi Coast, IT",
    date: "September 2, 2025",
    photographer: "Luca Ferrante",
    photos: [
      G("#9ec7d4", "#c98a86", "#e8b7b0"),
      G("#e8b7b0", "#9ec7d4", "#fbeeec"),
      G("#c9a24b", "#9ec7d4", "#e8b7b0"),
      G("#3a2b2b", "#c98a86", "#9ec7d4"),
    ],
  },
  {
    id: "amara-theo",
    couple: "Amara & Theo",
    setting: "ballroom",
    settingLabel: "Ballroom",
    venue: "The Vestry Grand Hall",
    city: "London, UK",
    date: "November 22, 2025",
    photographer: "Marguerite Dawes",
    photos: [
      G("#3a2b2b", "#a8862f", "#c9a24b"),
      G("#c9a24b", "#e8b7b0", "#3a2b2b"),
      G("#a8862f", "#c98a86", "#fbeeec"),
      G("#e8b7b0", "#c9a24b", "#a8862f"),
      G("#6b5555", "#c98a86", "#c9a24b"),
      G("#fbeeec", "#c9a24b", "#a8862f"),
    ],
  },
  {
    id: "noor-sami",
    couple: "Noor & Sami",
    setting: "elopement",
    settingLabel: "Elopement",
    venue: "Cliffside at Dawn",
    city: "Big Sur, CA",
    date: "March 30, 2025",
    photographer: "Ren Okafor",
    photos: [
      G("#c98a86", "#6b5555", "#e8b7b0"),
      G("#e8b7b0", "#c98a86", "#a8862f"),
      G("#fbeeec", "#c98a86", "#6b5555"),
    ],
  },
  {
    id: "clara-julien",
    couple: "Clara & Julien",
    setting: "garden",
    settingLabel: "Garden",
    venue: "Maison des Roses",
    city: "Provence, FR",
    date: "July 19, 2025",
    photographer: "Sylvie Renard",
    photos: [
      G("#fbeeec", "#e8b7b0", "#c9a24b"),
      G("#c9a24b", "#c98a86", "#e8b7b0"),
      G("#e8b7b0", "#a8862f", "#fbeeec"),
      G("#c98a86", "#c9a24b", "#3a2b2b"),
      G("#f4ece4", "#c98a86", "#c9a24b"),
    ],
  },
  {
    id: "maya-oliver",
    couple: "Maya & Oliver",
    setting: "coastal",
    settingLabel: "Coastal",
    venue: "Dune & Driftwood",
    city: "Nantucket, MA",
    date: "August 9, 2025",
    photographer: "Beatrix Cole",
    photos: [
      G("#9ec7d4", "#e8b7b0", "#c9a24b"),
      G("#e8b7b0", "#fbeeec", "#9ec7d4"),
      G("#c9a24b", "#9ec7d4", "#c98a86"),
      G("#6b5555", "#9ec7d4", "#e8b7b0"),
    ],
  },
];

// ---- Elements ----
const gallery = document.getElementById("gallery");
const empty = document.getElementById("empty");
const chips = Array.from(document.querySelectorAll(".chip"));
const toastEl = document.getElementById("toast");

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbIndex = document.getElementById("lb-index");
const lbTotal = document.getElementById("lb-total");
const lbSetting = document.getElementById("lb-setting");
const lbCouple = document.getElementById("lb-couple");
const lbVenue = document.getElementById("lb-venue");
const lbCity = document.getElementById("lb-city");
const lbDate = document.getElementById("lb-date");
const lbPhotog = document.getElementById("lb-photog");
const lbStrip = document.getElementById("lb-strip");

const favorites = new Set();
let activeStory = null;
let photoIndex = 0;
let lastFocused = null;

// ---- Toast helper ----
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
}

// ---- Render grid ----
function render(filter = "all") {
  const list = WEDDINGS.filter((w) => filter === "all" || w.setting === filter);
  gallery.innerHTML = "";
  empty.hidden = list.length !== 0;

  list.forEach((w, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.style.animationDelay = `${i * 60}ms`;
    card.setAttribute("aria-label", `Open ${w.couple} — ${w.venue}, ${w.city}`);

    const isFav = favorites.has(w.id);
    card.innerHTML = `
      <div class="card__cover" style="background-image:${w.photos[0]}">
        <span class="card__frame"></span>
        <span class="card__badge">&#9634; ${w.photos.length} photos</span>
        <span class="card__setting">${w.settingLabel}</span>
        <button class="heart ${isFav ? "is-fav" : ""}" type="button"
          aria-pressed="${isFav}" aria-label="Save ${w.couple} to favorites">
          ${isFav ? "&#10084;" : "&#9825;"}
        </button>
      </div>
      <div class="card__body">
        <h2 class="card__names">${w.couple}</h2>
        <p class="card__meta">
          <span class="card__venue">${w.venue}</span> &middot; ${w.city}<br />${w.date}
        </p>
      </div>
    `;

    card.addEventListener("click", () => openStory(w.id, card));

    const heart = card.querySelector(".heart");
    heart.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(w, heart);
    });

    gallery.appendChild(card);
  });
}

function toggleFav(w, heart) {
  if (favorites.has(w.id)) {
    favorites.delete(w.id);
    heart.classList.remove("is-fav");
    heart.innerHTML = "&#9825;";
    heart.setAttribute("aria-pressed", "false");
    toast(`Removed ${w.couple} from favorites`);
  } else {
    favorites.add(w.id);
    heart.classList.add("is-fav");
    heart.innerHTML = "&#10084;";
    heart.setAttribute("aria-pressed", "true");
    toast(`Saved ${w.couple} — ${favorites.size} favorite${favorites.size > 1 ? "s" : ""}`);
  }
}

// ---- Filters ----
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");
    render(chip.dataset.filter);
  });
});

// ---- Lightbox story ----
function openStory(id, trigger) {
  activeStory = WEDDINGS.find((w) => w.id === id);
  if (!activeStory) return;
  lastFocused = trigger || document.activeElement;
  photoIndex = 0;

  lbSetting.textContent = activeStory.settingLabel;
  lbCouple.textContent = activeStory.couple;
  lbVenue.textContent = activeStory.venue;
  lbCity.textContent = activeStory.city;
  lbDate.textContent = activeStory.date;
  lbPhotog.textContent = activeStory.photographer;
  lbTotal.textContent = activeStory.photos.length;

  buildStrip();
  showPhoto(0);

  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("lb-close").focus();
}

function buildStrip() {
  lbStrip.innerHTML = "";
  activeStory.photos.forEach((bg, i) => {
    const t = document.createElement("button");
    t.className = "thumb";
    t.type = "button";
    t.style.backgroundImage = bg;
    t.setAttribute("aria-label", `View photo ${i + 1}`);
    t.addEventListener("click", () => showPhoto(i));
    lbStrip.appendChild(t);
  });
}

function showPhoto(i) {
  const total = activeStory.photos.length;
  photoIndex = (i + total) % total;
  lbImg.style.opacity = "0";
  requestAnimationFrame(() => {
    lbImg.style.backgroundImage = activeStory.photos[photoIndex];
    lbImg.style.opacity = "1";
  });
  lbIndex.textContent = photoIndex + 1;
  Array.from(lbStrip.children).forEach((t, idx) =>
    t.classList.toggle("is-active", idx === photoIndex)
  );
}

function closeStory() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  activeStory = null;
  if (lastFocused) lastFocused.focus();
}

document.getElementById("lb-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
document.getElementById("lb-next").addEventListener("click", () => showPhoto(photoIndex + 1));
document.getElementById("lb-close").addEventListener("click", closeStory);
lightbox.querySelector("[data-close]").addEventListener("click", closeStory);

// ---- Keyboard ----
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeStory();
  else if (e.key === "ArrowLeft") showPhoto(photoIndex - 1);
  else if (e.key === "ArrowRight") showPhoto(photoIndex + 1);
});

// ---- Init ----
render("all");
