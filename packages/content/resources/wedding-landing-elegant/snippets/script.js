"use strict";

/* ---------- Toast helper ---------- */
const toastEl = document.getElementById("toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3400);
}

/* ---------- Countdown ---------- */
const WEDDING = new Date("2026-09-12T15:30:00").getTime();
const units = document.querySelectorAll(".count__num");
function pad(n) {
  return String(n).padStart(2, "0");
}
function tick() {
  const diff = WEDDING - Date.now();
  const clamp = Math.max(diff, 0);
  const days = Math.floor(clamp / 864e5);
  const hours = Math.floor((clamp % 864e5) / 36e5);
  const minutes = Math.floor((clamp % 36e5) / 6e4);
  const seconds = Math.floor((clamp % 6e4) / 1e3);
  const map = { days, hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
  units.forEach((el) => {
    el.textContent = map[el.dataset.unit];
  });
}
tick();
setInterval(tick, 1000);

/* ---------- Gallery data + render ---------- */
const PHOTOS = [
  { cap: "The proposal, Ravello", cat: "engagement", g: "linear-gradient(135deg,#e8b7b0,#c98a86)" },
  { cap: "Golden hour", cat: "travels", g: "linear-gradient(160deg,#c9a24b,#a8862f)" },
  { cap: "Sunday mornings", cat: "everyday", g: "linear-gradient(135deg,#f4ece4,#e8b7b0)" },
  { cap: "Lemon groves", cat: "travels", g: "linear-gradient(150deg,#c9a24b,#e8b7b0)" },
  { cap: "First dance rehearsal", cat: "everyday", g: "linear-gradient(135deg,#6b5555,#c98a86)" },
  { cap: "She said yes", cat: "engagement", g: "linear-gradient(160deg,#c98a86,#a8862f)" },
  { cap: "Coastline drive", cat: "travels", g: "linear-gradient(135deg,#fbeeec,#c9a24b)" },
  { cap: "Coffee for two", cat: "everyday", g: "linear-gradient(150deg,#e8b7b0,#6b5555)" },
  { cap: "The ring", cat: "engagement", g: "linear-gradient(135deg,#a8862f,#e8b7b0)" },
];

const grid = document.getElementById("galleryGrid");
PHOTOS.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.className = "tile";
  btn.type = "button";
  btn.dataset.cat = p.cat;
  btn.dataset.index = String(i);
  btn.style.background = p.g;
  btn.setAttribute("aria-label", "View photo: " + p.cap);
  btn.innerHTML = '<span class="tile__cap">' + p.cap + "</span>";
  grid.appendChild(btn);
});

/* ---------- Filters ---------- */
const chips = document.querySelectorAll(".chip");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");
    const f = chip.dataset.filter;
    grid.querySelectorAll(".tile").forEach((t) => {
      t.classList.toggle("is-hidden", f !== "all" && t.dataset.cat !== f);
    });
  });
});

/* ---------- Lightbox ---------- */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
let current = 0;
let lastFocused = null;

function visibleTiles() {
  return Array.from(grid.querySelectorAll(".tile:not(.is-hidden)"));
}
function showPhoto(idx) {
  const tiles = visibleTiles();
  if (!tiles.length) return;
  current = (idx + tiles.length) % tiles.length;
  const tile = tiles[current];
  const p = PHOTOS[Number(tile.dataset.index)];
  lbImg.style.background = p.g;
  lbCap.textContent = p.cap;
}
function openLightbox(tile) {
  lastFocused = tile;
  const tiles = visibleTiles();
  showPhoto(tiles.indexOf(tile));
  lb.hidden = false;
  document.getElementById("lbClose").focus();
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lb.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

grid.addEventListener("click", (e) => {
  const tile = e.target.closest(".tile");
  if (tile) openLightbox(tile);
});
document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbNext").addEventListener("click", () => showPhoto(current + 1));
document.getElementById("lbPrev").addEventListener("click", () => showPhoto(current - 1));
lb.addEventListener("click", (e) => {
  if (e.target === lb) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showPhoto(current + 1);
  if (e.key === "ArrowLeft") showPhoto(current - 1);
});

/* ---------- RSVP stepper ---------- */
const guestCount = document.getElementById("guestCount");
const MIN = 1;
const MAX = 6;
let guests = 1;
document.querySelectorAll(".stepper__btn").forEach((b) => {
  b.addEventListener("click", () => {
    guests = Math.min(MAX, Math.max(MIN, guests + Number(b.dataset.step)));
    guestCount.textContent = String(guests);
    syncStepper();
  });
});
function syncStepper() {
  const [minus, plus] = document.querySelectorAll(".stepper__btn");
  minus.disabled = guests <= MIN;
  plus.disabled = guests >= MAX;
}
syncStepper();

/* ---------- RSVP attendance toggle ---------- */
const form = document.getElementById("rsvpForm");
form.querySelectorAll('input[name="attending"]').forEach((r) => {
  r.addEventListener("change", () => {
    form.classList.toggle("hide-guests", form.attending.value === "no");
  });
});

/* ---------- Validation + submit ---------- */
function setError(name, msg) {
  const field = form.querySelector('[name="' + name + '"]');
  const err = form.querySelector('.err[data-for="' + name + '"]');
  if (field) field.classList.toggle("invalid", Boolean(msg));
  if (err) err.textContent = msg || "";
}
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (name.length < 2) {
    setError("name", "Please enter your full name.");
    ok = false;
  } else {
    setError("name", "");
  }
  if (!emailRe.test(email)) {
    setError("email", "Please enter a valid email address.");
    ok = false;
  } else {
    setError("email", "");
  }

  if (!ok) {
    const firstBad = form.querySelector(".invalid");
    if (firstBad) firstBad.focus();
    toast("Please fix the highlighted fields.");
    return;
  }

  const attending = form.attending.value === "yes";
  if (attending) {
    toast("Thank you, " + name.split(" ")[0] + "! " + guests + (guests > 1 ? " seats" : " seat") + " reserved.");
  } else {
    toast("We will miss you, " + name.split(" ")[0] + ". Thank you for letting us know.");
  }
  form.reset();
  guests = 1;
  guestCount.textContent = "1";
  form.classList.remove("hide-guests");
  syncStepper();
});

form.querySelectorAll("input").forEach((inp) => {
  inp.addEventListener("input", () => setError(inp.name, ""));
});

/* ---------- Reveal on scroll ---------- */
const revealTargets = document.querySelectorAll(
  ".section .kicker, .section__title, .tl, .card, .tile, .rsvp, .rule-c, .rsvp__lead"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("in"));
}
