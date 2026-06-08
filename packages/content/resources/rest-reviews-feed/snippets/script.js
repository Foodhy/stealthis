const DISTRO = [
  { s: 5, pct: 78 },
  { s: 4, pct: 14 },
  { s: 3, pct: 5 },
  { s: 2, pct: 2 },
  { s: 1, pct: 1 },
];

const REVIEWS = [
  {
    id: 1,
    name: "Maite H.",
    date: "2 days ago",
    rating: 5,
    tags: [
      { label: "Ribeye 14oz", tone: "dish" },
      { label: "Cosy vibe", tone: "vibe" },
    ],
    body: "Best ribeye I've had in Madrid. The dry-age comes through, and the bone marrow butter is dangerous. Marco the server was attentive without hovering — the kind of place you go for a quiet anniversary.",
    helpful: 18,
    photos: 2,
    reply: "Maite — thank you for the kind words, see you both again next year. ✦ Aitor",
    recent: true,
  },
  {
    id: 2,
    name: "Park S.",
    date: "1 week ago",
    rating: 5,
    tags: [
      { label: "Pulpo brasa", tone: "dish" },
      { label: "Service", tone: "vibe" },
    ],
    body: "Pulpo was perfectly charred and the salsa verde was bright — paired with Sasha's natural-wine recommendation it was the best meal of our trip.",
    helpful: 9,
    photos: 1,
    reply: null,
    recent: true,
  },
  {
    id: 3,
    name: "Davies L.",
    date: "2 weeks ago",
    rating: 4,
    tags: [{ label: "Pappardelle ragú", tone: "dish" }],
    body: "Loved everything except the wait between courses (close to 25 min before mains). Pappardelle ragú was excellent — the lamb is slow-cooked long enough to fall apart but still has texture.",
    helpful: 4,
    photos: 0,
    reply:
      "Thanks for the feedback Davies — we tightened up second-course timing this weekend after several similar notes. Hope you'll give us another try. — Iria",
    recent: false,
  },
  {
    id: 4,
    name: "Khoury R.",
    date: "3 weeks ago",
    rating: 5,
    tags: [
      { label: "Tarta de queso", tone: "dish" },
      { label: "Birthday", tone: "vibe" },
    ],
    body: "They surprised my partner with a candle in the burnt cheesecake without us asking — small thing that meant a lot. Cake itself is a top-3 burnt cheesecake in Madrid.",
    helpful: 12,
    photos: 1,
    reply: null,
    recent: false,
  },
  {
    id: 5,
    name: "Iyengar V.",
    date: "1 month ago",
    rating: 5,
    tags: [
      { label: "Risotto hongos", tone: "dish" },
      { label: "Veg", tone: "vibe" },
    ],
    body: "As a vegetarian I'm used to getting the leftover salad. Here the risotto was the dish of the night. The kitchen treats vegetables like the main event.",
    helpful: 21,
    photos: 0,
    reply: null,
    recent: false,
  },
  {
    id: 6,
    name: "Tanaka M.",
    date: "5 weeks ago",
    rating: 3,
    tags: [{ label: "Loud at peak", tone: "vibe" }],
    body: "Food is great, but the room gets loud at 21:00 — you basically have to shout. If you're going for a quiet date, try the 19:00 seating instead.",
    helpful: 6,
    photos: 0,
    reply:
      "Thanks Tanaka — we're working on acoustic panels in the centre section, expect by August. — Iria",
    recent: false,
  },
];

const distroEl = document.getElementById("distro");
const reviewsEl = document.getElementById("reviews");
const chips = document.getElementById("chips");
const moreBtn = document.getElementById("more");

distroEl.innerHTML = DISTRO.map(
  (d) => `<li class="d-row" data-s="${d.s}">
    <span class="d-star">${d.s} ★</span>
    <span class="d-bar"><span class="d-fill" style="width:${d.pct}%"></span></span>
    <span class="d-pct">${d.pct}%</span>
  </li>`
).join("");

function stars(n) {
  return Array.from({ length: 5 }, (_, i) =>
    i < n ? `<span>★</span>` : `<span class="dim">★</span>`
  ).join("");
}

function photos(n) {
  if (!n) return "";
  return `<div class="r-photos">${Array.from({ length: n }, (_, i) => `<span class="r-photo p-${(i % 4) + 1}"></span>`).join("")}</div>`;
}

function render() {
  reviewsEl.innerHTML = REVIEWS.map(
    (
      r
    ) => `<li class="review" data-id="${r.id}" data-recent="${r.recent}" data-rating="${r.rating}" data-photos="${r.photos > 0}">
      <div class="r-head">
        <span class="r-avatar">${r.name[0]}</span>
        <div>
          <p class="r-name">${r.name}</p>
          <p class="r-meta">${r.date} · verified diner</p>
        </div>
        <p class="r-stars" aria-label="${r.rating} of 5 stars">${stars(r.rating)}</p>
      </div>
      ${
        r.tags.length
          ? `<div class="r-tags">${r.tags.map((t) => `<span class="r-tag" data-tone="${t.tone}">${t.label}</span>`).join("")}</div>`
          : ""
      }
      <p class="r-body">${r.body}</p>
      ${photos(r.photos)}
      <div class="r-foot">
        <button class="helpful" type="button" data-action="helpful" data-id="${r.id}">👍 Helpful · <b>${r.helpful}</b></button>
        <button class="report" type="button">Report</button>
      </div>
      ${
        r.reply
          ? `<div class="r-reply">
              <p class="r-reply-head">Casa Olivar · owner reply</p>
              <p class="r-reply-body">${r.reply}</p>
            </div>`
          : ""
      }
    </li>`
  ).join("");
}

function filter(kind) {
  reviewsEl.querySelectorAll(".review").forEach((el) => {
    let show = true;
    if (kind === "recent") show = el.dataset.recent === "true";
    if (kind === "5") show = el.dataset.rating === "5";
    if (kind === "photos") show = el.dataset.photos === "true";
    el.classList.toggle("is-hidden", !show);
  });
}

chips.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === btn));
  filter(btn.dataset.filter);
});

reviewsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='helpful']");
  if (!btn) return;
  const r = REVIEWS.find((x) => x.id === Number(btn.dataset.id));
  if (!r) return;
  btn.classList.toggle("is-on");
  r.helpful += btn.classList.contains("is-on") ? 1 : -1;
  btn.querySelector("b").textContent = r.helpful;
});

moreBtn.addEventListener("click", () => {
  moreBtn.textContent = "All loaded · 824 reviews in total";
  moreBtn.disabled = true;
});

render();
