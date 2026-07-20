/* Infinite Feed Sentinel — IntersectionObserver-driven pagination. */

const root = document.querySelector("#feed");
const list = document.querySelector("#feed-items");
const sentinel = document.querySelector("#feed-sentinel");
const label = document.querySelector("#sentinel-label");
const countEl = document.querySelector("#count");
const pageEl = document.querySelector("#page");
const moreBtn = document.querySelector("#more");
const resetBtn = document.querySelector("#reset");

const PAGE_SIZE = 8;
const TOTAL_PAGES = 6;
const LATENCY = 450;

const NAMES = [
  "Ada Lovelace", "Grace Hopper", "Alan Turing", "Radia Perlman",
  "Ken Thompson", "Barbara Liskov", "Linus Torvalds", "Margaret Hamilton",
];
const VERBS = [
  "shipped a patch to", "opened a discussion on", "reviewed changes in",
  "benchmarked", "documented", "refactored", "deployed", "triaged issues in",
];
const SUBJECTS = [
  "the scheduler", "the render pipeline", "the auth gateway", "the cache layer",
  "the query planner", "the design tokens", "the CI matrix", "the edge worker",
];

let page = 0;
let loading = false;
let exhausted = false;

const hues = [212, 265, 155, 24, 340, 190];

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("");
}

function buildCard(index) {
  const name = NAMES[index % NAMES.length];
  const hue = hues[index % hues.length];

  const li = document.createElement("li");
  li.className = "card";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.style.background = `linear-gradient(140deg, hsl(${hue} 85% 72%), hsl(${hue + 30} 80% 58%))`;
  avatar.textContent = initials(name);
  avatar.setAttribute("aria-hidden", "true");

  const main = document.createElement("div");

  const h2 = document.createElement("h2");
  h2.textContent = name;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `post #${index + 1} · ${index * 3 + 2} min ago`;

  const body = document.createElement("p");
  body.className = "body";
  body.textContent = `${VERBS[index % VERBS.length]} ${SUBJECTS[(index * 5) % SUBJECTS.length]}.`;

  main.append(h2, meta, body);
  li.append(avatar, main);
  return li;
}

function setStatus() {
  countEl.textContent = String(list.children.length);
  pageEl.textContent = String(page);
  moreBtn.disabled = exhausted || loading;

  if (exhausted) {
    sentinel.dataset.state = "done";
    label.textContent = "End of feed — no more posts.";
  } else {
    sentinel.dataset.state = loading ? "loading" : "idle";
    label.textContent = loading ? "Loading more…" : "Scroll for more";
  }
}

function fetchPage(n) {
  // Stand-in for a network request; swap for fetch() in production.
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = n * PAGE_SIZE;
      resolve(Array.from({ length: PAGE_SIZE }, (_, i) => start + i));
    }, LATENCY);
  });
}

async function loadNext() {
  if (loading || exhausted) return;
  loading = true;
  setStatus();

  const indexes = await fetchPage(page);
  const frag = document.createDocumentFragment();
  indexes.forEach((i) => frag.append(buildCard(i)));
  list.append(frag);

  page += 1;
  loading = false;
  exhausted = page >= TOTAL_PAGES;
  setStatus();

  // If the sentinel is still visible (short list, tall viewport), keep going.
  if (!exhausted && sentinelVisible()) loadNext();
}

function sentinelVisible() {
  const r = sentinel.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  return r.top < b.bottom && r.bottom > b.top;
}

function reset() {
  list.replaceChildren();
  page = 0;
  loading = false;
  exhausted = false;
  root.scrollTop = 0;
  setStatus();
  loadNext();
}

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) loadNext();
    },
    { root, rootMargin: "160px 0px", threshold: 0 },
  );
  io.observe(sentinel);
} else {
  // Fallback: scroll-position check.
  root.addEventListener("scroll", () => {
    if (root.scrollTop + root.clientHeight >= root.scrollHeight - 160) loadNext();
  });
}

moreBtn.addEventListener("click", loadNext);
resetBtn.addEventListener("click", reset);

setStatus();
loadNext();
