"use strict";

/* ------------------------------------------------------------------ *
 * Model Comparison Panel — simulated multi-model streaming compare.
 * Vanilla JS, no dependencies.
 * ------------------------------------------------------------------ */

/** Roster of selectable models. cost = USD per 1K output tokens. */
const MODELS = [
  { id: "aurora-max",   name: "Aurora Max",   vendor: "Northwind",  color: "#8b5cf6", cost: 0.015, speed: 1.0, quality: 0.95 },
  { id: "aurora-lite",  name: "Aurora Lite",  vendor: "Northwind",  color: "#a78bfa", cost: 0.003, speed: 1.9, quality: 0.78 },
  { id: "meridian-4",   name: "Meridian 4",   vendor: "Solaris",    color: "#22d3ee", cost: 0.010, speed: 1.3, quality: 0.90 },
  { id: "meridian-flash", name: "Meridian Flash", vendor: "Solaris", color: "#2dd4bf", cost: 0.0009, speed: 2.6, quality: 0.70 },
  { id: "atlas-pro",    name: "Atlas Pro",    vendor: "Cartograph", color: "#34d399", cost: 0.008, speed: 1.15, quality: 0.88 },
  { id: "corvus-r1",    name: "Corvus R1",    vendor: "Blackbird",  color: "#fbbf24", cost: 0.006, speed: 0.8, quality: 0.92 },
];

/** Prompt suggestions. */
const SUGGESTIONS = [
  "Explain vector databases to a backend engineer",
  "Write a haiku about race conditions",
  "Compare REST and GraphQL in three bullets",
  "Refactor a callback into async/await",
];

/**
 * Answer templates keyed loosely by intent. The panel is a UI demo, so
 * responses are canned but written per-model to feel distinct.
 */
function buildAnswer(prompt, model) {
  const p = (prompt || "your prompt").trim();
  const short = p.length > 60 ? p.slice(0, 57) + "…" : p;
  const tone = model.quality > 0.85 ? "thorough" : "concise";

  const openers = {
    "aurora-max": `Here's a structured take on "${short}".\n\n`,
    "aurora-lite": `Quick answer on "${short}":\n\n`,
    "meridian-4": `Let me work through "${short}" step by step.\n\n`,
    "meridian-flash": `TL;DR for "${short}":\n\n`,
    "atlas-pro": `Great question — "${short}".\n\n`,
    "corvus-r1": `Reasoning about "${short}" carefully.\n\n`,
  };

  const bodies = {
    thorough:
      "1. Frame the problem precisely, noting the constraints that actually matter here.\n" +
      "2. Sketch the trade-offs: latency vs. accuracy, memory vs. throughput, simplicity vs. flexibility.\n" +
      "3. Recommend a concrete path and call out the one failure mode most teams miss.\n\n" +
      "In short: start with the simplest design that satisfies the constraints, measure, then optimize the hot path only once real numbers point at it.",
    concise:
      "Keep it simple: pick the option with the fewest moving parts, verify it against one real example, and only add complexity when a measurement forces you to.\n\n" +
      "The common mistake is optimizing before you have data — resist it.",
  };

  return (openers[model.id] || "") + (bodies[tone] || bodies.concise);
}

/* ---------------- Column state ---------------- */

const state = {
  columns: [], // { modelId, node, els, run }
  syncScroll: false,
  scores: Object.create(null), // modelId -> count
  syncGuard: false,
};

const DEFAULT_COLS = ["aurora-max", "meridian-4", "corvus-r1"];

/* ---------------- DOM refs ---------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const grid = $("#grid");
const promptInput = $("#promptInput");
const compareBtn = $("#compareBtn");
const clearBtn = $("#clearBtn");
const syncScrollEl = $("#syncScroll");
const rollupEl = $("#rollup");
const suggestRow = $("#suggestRow");
const scoreChips = $("#scoreChips");

/* ---------------- Build UI ---------------- */

function modelById(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

function optionMarkup(selectedId) {
  return MODELS.map(
    (m) =>
      `<option value="${m.id}" ${m.id === selectedId ? "selected" : ""}>${m.name} · ${m.vendor}</option>`
  ).join("");
}

function createColumn(modelId, index) {
  const model = modelById(modelId);
  const col = document.createElement("article");
  col.className = "col";
  col.setAttribute("role", "group");
  col.setAttribute("aria-label", `${model.name} response`);
  col.innerHTML = `
    <div class="col__head">
      <span class="col__avatar" aria-hidden="true"></span>
      <div class="col__pick">
        <select class="col__select" aria-label="Choose model for column ${index + 1}">
          ${optionMarkup(modelId)}
        </select>
        <div class="col__vendor"></div>
      </div>
      <span class="status" role="status">
        <span class="status__dot"></span><span class="status__text">Ready</span>
      </span>
    </div>
    <div class="col__body">
      <div class="col__answer is-empty" aria-live="polite">Answer will stream here after you hit Compare.</div>
    </div>
    <div class="badges" hidden>
      <span class="badge badge--latency" title="Wall-clock time to complete">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        <b>latency</b><span class="badge__val" data-k="latency">—</span>
      </span>
      <span class="badge badge--tokens" title="Output tokens generated">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
        <b>tokens</b><span class="badge__val" data-k="tokens">—</span>
      </span>
      <span class="badge badge--cost" title="Estimated output cost (USD)">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M8 8a3 3 0 0 1 3-3h2a3 3 0 0 1 0 6h-2a3 3 0 0 0 0 6h2a3 3 0 0 0 3-3"/></svg>
        <b>cost</b><span class="badge__val" data-k="cost">—</span>
      </span>
    </div>
    <div class="col__foot">
      <button type="button" class="btn btn--sm btn--win">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg>
        Pick winner
      </button>
      <button type="button" class="btn btn--sm btn--ghost btn--regen" title="Regenerate this column" aria-label="Regenerate this column" disabled>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>
      </button>
    </div>
  `;

  const els = {
    avatar: $(".col__avatar", col),
    select: $(".col__select", col),
    vendor: $(".col__vendor", col),
    status: $(".status", col),
    statusText: $(".status__text", col),
    body: $(".col__body", col),
    answer: $(".col__answer", col),
    badges: $(".badges", col),
    winBtn: $(".btn--win", col),
    regenBtn: $(".btn--regen", col),
    val: {
      latency: $('[data-k="latency"]', col),
      tokens: $('[data-k="tokens"]', col),
      cost: $('[data-k="cost"]', col),
    },
  };

  const entry = { modelId, node: col, els, run: null };

  applyModel(entry);

  els.select.addEventListener("change", () => {
    entry.modelId = els.select.value;
    applyModel(entry);
    resetColumn(entry);
  });
  els.winBtn.addEventListener("click", () => pickWinner(entry));
  els.regenBtn.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    if (prompt) streamColumn(entry, prompt);
  });
  els.body.addEventListener("scroll", () => onColumnScroll(entry));

  state.columns.push(entry);
  grid.appendChild(col);
  return entry;
}

function applyModel(entry) {
  const m = modelById(entry.modelId);
  entry.els.avatar.style.background = m.color;
  entry.els.avatar.textContent = m.name.slice(0, 1);
  entry.els.vendor.textContent = `${m.vendor} · $${m.cost.toFixed(4)}/1K out`;
}

function setStatus(entry, kind, text) {
  const s = entry.els.status;
  s.classList.remove("is-live", "is-done");
  if (kind) s.classList.add(kind);
  entry.els.statusText.textContent = text;
}

function resetColumn(entry) {
  if (entry.run) { cancelAnimationFrame(entry.run.raf); entry.run = null; }
  entry.node.classList.remove("is-winner", "is-streaming");
  entry.els.winBtn.classList.remove("is-active");
  entry.els.winBtn.disabled = false;
  entry.els.regenBtn.disabled = true;
  entry.els.badges.hidden = true;
  entry.els.answer.textContent = "Answer will stream here after you hit Compare.";
  entry.els.answer.classList.add("is-empty");
  setStatus(entry, "", "Ready");
}

/* ---------------- Streaming ---------------- */

function fmtLatency(ms) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

/** Rough token estimate: ~4 chars per token. */
function estTokens(text) {
  return Math.max(1, Math.round(text.length / 4));
}

function streamColumn(entry, prompt) {
  if (entry.run) cancelAnimationFrame(entry.run.raf);

  const model = modelById(entry.modelId);
  const full = buildAnswer(prompt, model);
  const start = performance.now();

  // per-model pacing: faster models emit larger chunks more often
  const baseDelay = 46 / model.speed;      // ms between emissions
  const chunkSize = Math.max(2, Math.round(3 * model.speed));
  // simulated "time to first token"
  const ttft = 180 + Math.random() * 420 / model.speed;

  entry.node.classList.add("is-streaming");
  entry.node.classList.remove("is-winner");
  entry.els.winBtn.classList.remove("is-active");
  entry.els.badges.hidden = false;
  entry.els.regenBtn.disabled = true;
  entry.els.answer.classList.remove("is-empty");
  entry.els.answer.textContent = "";
  setStatus(entry, "is-live", "0ms");

  const run = { raf: 0, i: 0, lastEmit: start, started: false, done: false };
  entry.run = run;

  function frame(now) {
    if (entry.run !== run) return; // superseded
    const elapsed = now - start;

    // live latency tick
    entry.els.statusText.textContent = fmtLatency(elapsed);

    if (!run.started) {
      if (elapsed < ttft) { run.raf = requestAnimationFrame(frame); return; }
      run.started = true;
      run.lastEmit = now;
    }

    if (now - run.lastEmit >= baseDelay && run.i < full.length) {
      run.i = Math.min(full.length, run.i + chunkSize);
      renderPartial(entry, full.slice(0, run.i));
      run.lastEmit = now;
      if (state.syncScroll) syncFromLeader(entry);
    }

    if (run.i >= full.length) {
      finishColumn(entry, full, elapsed, model);
      return;
    }
    run.raf = requestAnimationFrame(frame);
  }

  run.raf = requestAnimationFrame(frame);
}

function renderPartial(entry, text) {
  entry.els.answer.textContent = text;
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  entry.els.answer.appendChild(caret);
  // autoscroll the streaming column to bottom unless user scrolled up
  const b = entry.els.body;
  if (!state.syncScroll) b.scrollTop = b.scrollHeight;
}

function finishColumn(entry, full, elapsed, model) {
  entry.run = null;
  entry.node.classList.remove("is-streaming");
  entry.els.answer.textContent = full; // drop caret
  entry.els.regenBtn.disabled = false;

  const tokens = estTokens(full);
  const cost = (tokens / 1000) * model.cost;
  entry.els.val.latency.textContent = fmtLatency(elapsed);
  entry.els.val.tokens.textContent = String(tokens);
  entry.els.val.cost.textContent = "$" + cost.toFixed(4);
  entry._metrics = { latency: elapsed, tokens, cost };

  setStatus(entry, "is-done", "Done");
  updateRollup();
}

/* ---------------- Compare / Clear ---------------- */

function runCompare() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    promptInput.focus();
    promptInput.classList.remove("shake");
    void promptInput.offsetWidth;
    return;
  }
  compareBtn.disabled = true;
  state.columns.forEach((entry) => {
    entry.node.classList.remove("is-winner");
    entry.els.winBtn.classList.remove("is-active");
    entry.els.winBtn.disabled = false;
    streamColumn(entry, prompt);
  });
  // re-enable compare shortly (columns manage their own lifecycle)
  setTimeout(() => { compareBtn.disabled = false; }, 400);
  updateRollup();
}

function clearAll() {
  promptInput.value = "";
  state.columns.forEach(resetColumn);
  rollupEl.textContent = "Idle · no run yet";
  promptInput.focus();
}

/* ---------------- Winner / scoreboard ---------------- */

function pickWinner(winner) {
  const anyDone = state.columns.some((c) => c._metrics);
  if (!anyDone) return;
  state.columns.forEach((c) => {
    const isWin = c === winner;
    c.node.classList.toggle("is-winner", isWin);
    c.els.winBtn.classList.toggle("is-active", isWin);
    c.els.winBtn.querySelector("svg") &&
      (c.els.winBtn.lastChild.textContent = ""); // no-op guard
  });
  winner.els.winBtn.childNodes.forEach(() => {});
  // update label text of the winning button
  state.columns.forEach((c) => {
    const label = c === winner ? "Winner" : "Pick winner";
    // keep the icon, replace trailing text node
    const btn = c.els.winBtn;
    const textNode = [...btn.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNode) textNode.textContent = " " + label;
  });

  const id = winner.modelId;
  state.scores[id] = (state.scores[id] || 0) + 1;
  renderScoreboard();
}

function renderScoreboard() {
  const ids = Object.keys(state.scores).sort((a, b) => state.scores[b] - state.scores[a]);
  if (!ids.length) {
    scoreChips.innerHTML = '<span class="score-chip" style="color:var(--muted)">no votes yet</span>';
    return;
  }
  scoreChips.innerHTML = ids
    .map((id) => {
      const m = modelById(id);
      return `<span class="score-chip"><span class="score-chip__dot" style="background:${m.color}"></span>${m.name}<span class="score-chip__n">${state.scores[id]}</span></span>`;
    })
    .join("");
}

/* ---------------- Roll-up ---------------- */

function updateRollup() {
  const done = state.columns.filter((c) => c._metrics);
  if (!done.length) {
    rollupEl.textContent = state.columns.some((c) => c.run)
      ? "Streaming…"
      : "Idle · no run yet";
    return;
  }
  const totalTokens = done.reduce((s, c) => s + c._metrics.tokens, 0);
  const totalCost = done.reduce((s, c) => s + c._metrics.cost, 0);
  const fastest = done.reduce((a, b) => (a._metrics.latency < b._metrics.latency ? a : b));
  rollupEl.textContent =
    `${done.length}/${state.columns.length} done · ${totalTokens} tok · $${totalCost.toFixed(4)} · fastest ${modelById(fastest.modelId).name}`;
}

/* ---------------- Sync scroll ---------------- */

function onColumnScroll(leader) {
  if (!state.syncScroll || state.syncGuard) return;
  syncFromLeader(leader);
}

function syncFromLeader(leader) {
  const lb = leader.els.body;
  const denom = lb.scrollHeight - lb.clientHeight;
  const ratio = denom > 0 ? lb.scrollTop / denom : 0;
  state.syncGuard = true;
  for (const c of state.columns) {
    if (c === leader) continue;
    const b = c.els.body;
    const d = b.scrollHeight - b.clientHeight;
    b.scrollTop = ratio * d;
  }
  // release guard on next frame to avoid feedback loop
  requestAnimationFrame(() => { state.syncGuard = false; });
}

/* ---------------- Suggestions ---------------- */

function renderSuggestions() {
  suggestRow.innerHTML = "";
  SUGGESTIONS.forEach((text) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "suggest";
    b.textContent = text;
    b.addEventListener("click", () => {
      promptInput.value = text;
      promptInput.focus();
      runCompare();
    });
    suggestRow.appendChild(b);
  });
}

/* ---------------- Init ---------------- */

function init() {
  DEFAULT_COLS.forEach((id, i) => createColumn(id, i));
  renderSuggestions();
  renderScoreboard();

  compareBtn.addEventListener("click", runCompare);
  clearBtn.addEventListener("click", clearAll);
  syncScrollEl.addEventListener("change", () => {
    state.syncScroll = syncScrollEl.checked;
  });

  promptInput.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runCompare();
    }
  });

  promptInput.value = SUGGESTIONS[0];
}

init();
