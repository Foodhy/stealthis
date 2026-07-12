"use strict";

/* ------------------------------------------------------------------ */
/* Retrieved sources — real-feeling RAG evidence for the answer above. */
/* ------------------------------------------------------------------ */
const SOURCES = [
  {
    id: 1,
    title: "Malkov & Yashunin — Efficient and robust ANN using HNSW graphs",
    snippet:
      "The multi-layer structure places a small fraction of elements in upper layers, forming long-range links that behave as express highways during greedy search.",
    highlight: "express highways",
    score: 0.94,
    url: "arxiv.org/abs/1603.09320",
  },
  {
    id: 2,
    title: "pgvector docs — Tuning HNSW recall with efSearch",
    snippet:
      "Increasing efSearch widens the dynamic candidate list, raising recall at the cost of a few additional graph hops per query.",
    highlight: "efSearch widens the dynamic candidate list",
    score: 0.88,
    url: "github.com/pgvector/pgvector#hnsw",
  },
  {
    id: 3,
    title: "Faiss wiki — Graph-based indexes and logarithmic search",
    snippet:
      "Because navigation descends through sparse upper layers first, expected query complexity scales logarithmically with the number of stored vectors.",
    highlight: "logarithmically with the number of stored vectors",
    score: 0.81,
    url: "github.com/facebookresearch/faiss/wiki",
  },
  {
    id: 4,
    title: "Weaviate blog — Why we default to HNSW",
    snippet:
      "Tunable accuracy lets operators pick a recall target per workload, from fast filtering passes to high-precision reranking stages.",
    highlight: "Tunable accuracy",
    score: 0.63,
    url: "weaviate.io/blog/why-is-vector-search-so-fast",
  },
  {
    id: 5,
    title: "ANN-Benchmarks — Latency stability at million scale",
    snippet:
      "Across corpora from 100k to 10M vectors, HNSW query latency stayed nearly flat while brute-force scan time grew linearly.",
    highlight: "query latency stayed nearly flat",
    score: 0.57,
    url: "ann-benchmarks.com",
  },
];

const state = { sort: "score", thresh: 0 };
let activeId = null;
let pulseTimer = null;

const listEl = document.getElementById("sources");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("empty");
const threshEl = document.getElementById("thresh");
const threshValEl = document.getElementById("threshVal");
const answerEl = document.getElementById("answer");
const supportsSmooth = "scrollBehavior" in document.documentElement.style;

/* ---------- helpers ---------- */
function scoreColor(s) {
  if (s >= 0.8) return "var(--ok)";
  if (s >= 0.6) return "var(--warn)";
  return "var(--danger)";
}

function markSnippet(text, phrase) {
  if (!phrase) return escapeHtml(text);
  const i = text.indexOf(phrase);
  if (i < 0) return escapeHtml(text);
  return (
    escapeHtml(text.slice(0, i)) +
    "<mark>" +
    escapeHtml(phrase) +
    "</mark>" +
    escapeHtml(text.slice(i + phrase.length))
  );
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

const linkIcon =
  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

/* ---------- render ---------- */
const io =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { root: listEl, threshold: 0.15 }
      )
    : null;

function render() {
  const visible = SOURCES.filter((s) => s.score >= state.thresh).sort((a, b) =>
    state.sort === "score" ? b.score - a.score : a.id - b.id
  );

  listEl.innerHTML = "";
  emptyEl.hidden = visible.length !== 0;

  visible.forEach((s) => {
    const li = document.createElement("li");
    li.className = "source";
    li.dataset.id = String(s.id);
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute(
      "aria-label",
      "Source " + s.id + ": " + s.title + ", relevance " + s.score.toFixed(2)
    );
    li.innerHTML =
      '<div class="source__top">' +
      '<span class="source__idx">' + s.id + "</span>" +
      '<span class="source__title">' + escapeHtml(s.title) + "</span>" +
      "</div>" +
      '<p class="source__snippet">' + markSnippet(s.snippet, s.highlight) + "</p>" +
      '<div class="source__foot">' +
      '<span class="score">' +
      '<span class="score__bar"><span class="score__fill"></span></span>' +
      '<span class="score__val">' + s.score.toFixed(2) + "</span>" +
      "</span>" +
      '<a class="source__url" href="https://' + escapeHtml(s.url) +
      '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(s.url) + '">' +
      linkIcon + "<span>" + escapeHtml(s.url) + "</span></a>" +
      "</div>";

    const fill = li.querySelector(".score__fill");
    fill.style.background = scoreColor(s.score);
    requestAnimationFrame(() => {
      fill.style.width = Math.round(s.score * 100) + "%";
    });

    if (io) io.observe(li);
    else li.classList.add("is-visible");

    listEl.appendChild(li);
  });

  countEl.textContent =
    visible.length + (visible.length === 1 ? " shown" : " shown");

  if (activeId != null && !visible.some((s) => s.id === activeId)) {
    setActive(null);
  } else if (activeId != null) {
    applyActiveClasses();
  }
}

/* ---------- cross-highlighting ---------- */
function citeChips(id) {
  return answerEl.querySelectorAll('.cite[data-src="' + id + '"]');
}

function applyActiveClasses() {
  answerEl.querySelectorAll(".cite").forEach((c) => {
    c.classList.toggle("is-active", Number(c.dataset.src) === activeId);
  });
  listEl.querySelectorAll(".source").forEach((el) => {
    el.classList.toggle("is-active", Number(el.dataset.id) === activeId);
  });
}

function setActive(id) {
  activeId = id;
  applyActiveClasses();
}

function spotlightSource(id) {
  setActive(id);
  const card = listEl.querySelector('.source[data-id="' + id + '"]');
  if (!card) return;
  if (card.scrollIntoView) {
    card.scrollIntoView(
      supportsSmooth
        ? { behavior: "smooth", block: "nearest" }
        : { block: "nearest" }
    );
  }
  card.classList.remove("is-pulsing");
  // reflow so the animation restarts even on repeat clicks
  void card.offsetWidth;
  card.classList.add("is-pulsing");
  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => card.classList.remove("is-pulsing"), 750);
}

/* highlight cite chips when hovering a source card */
function highlightFromSource(id) {
  citeChips(id).forEach((c) => c.classList.add("is-active"));
  const card = listEl.querySelector('.source[data-id="' + id + '"]');
  if (card) card.classList.add("is-active");
}
function clearHoverHighlight() {
  if (activeId != null) {
    applyActiveClasses();
    return;
  }
  answerEl.querySelectorAll(".cite.is-active").forEach((c) => c.classList.remove("is-active"));
  listEl.querySelectorAll(".source.is-active").forEach((c) => c.classList.remove("is-active"));
}

/* ---------- events ---------- */
// citation chips -> spotlight source
answerEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".cite");
  if (chip) spotlightSource(Number(chip.dataset.src));
});
answerEl.addEventListener("keydown", (e) => {
  const chip = e.target.closest(".cite");
  if (chip && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    spotlightSource(Number(chip.dataset.src));
  }
});
answerEl.addEventListener("mouseover", (e) => {
  const chip = e.target.closest(".cite");
  if (chip && activeId == null) highlightFromSource(Number(chip.dataset.src));
});
answerEl.addEventListener("mouseout", (e) => {
  if (e.target.closest(".cite")) clearHoverHighlight();
});

// source cards -> spotlight + reverse highlight
listEl.addEventListener("click", (e) => {
  if (e.target.closest("a")) return; // let links through
  const card = e.target.closest(".source");
  if (card) spotlightSource(Number(card.dataset.id));
});
listEl.addEventListener("keydown", (e) => {
  const card = e.target.closest(".source");
  if (card && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    spotlightSource(Number(card.dataset.id));
  }
});
listEl.addEventListener("mouseover", (e) => {
  const card = e.target.closest(".source");
  if (card && activeId == null) highlightFromSource(Number(card.dataset.id));
});
listEl.addEventListener("mouseout", (e) => {
  if (e.target.closest(".source")) clearHoverHighlight();
});

// controls
threshEl.addEventListener("input", () => {
  state.thresh = parseFloat(threshEl.value);
  threshValEl.textContent = state.thresh.toFixed(2);
  render();
});

document.querySelectorAll(".seg").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.sort === state.sort) return;
    state.sort = btn.dataset.sort;
    document.querySelectorAll(".seg").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    render();
  });
});

// deselect on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".cite") && !e.target.closest(".source")) {
    if (activeId != null) setActive(null);
  }
});

/* ---------- init ---------- */
render();
