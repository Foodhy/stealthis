/* Hollow Reign — Season Rankings (demo data, vanilla JS) */
(() => {
  "use strict";

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  }

  /* ---------- Tiers ---------- */
  const TIERS = [
    { id: "master", label: "Master", min: 96000 },
    { id: "diamond", label: "Diamond", min: 88000 },
    { id: "platinum", label: "Platinum", min: 78000 },
    { id: "gold", label: "Gold", min: 66000 },
    { id: "silver", label: "Silver", min: 52000 },
    { id: "bronze", label: "Bronze", min: 0 },
  ];
  const tierFor = (score) => TIERS.find((t) => score >= t.min);

  /* ---------- Demo dataset ---------- */
  const NAMES = [
    ["VoidReaperX", "NA"], ["Karnage_07", "EU"], ["NeonDriftQueen", "APAC"],
    ["Sgt_Hollowpoint", "NA"], ["AshenVanguard", "EU"], ["Mirage.Zero", "APAC"],
    ["FrostbyteFury", "NA"], ["La_Sombra", "SA"], ["QuantumLeapr", "EU"],
    ["xX_DreadKnot_Xx", "NA"], ["SilentCircuit", "APAC"], ["WraithOfKiev", "EU"],
    ["TurboTanuki", "APAC"], ["IronVulture", "NA"], ["ZephyrBlade", "EU"],
    ["Nocturne_99", "SA"], ["PixelPyre", "NA"], ["GhostMeridian", "EU"],
    ["CrimsonHavoc", "APAC"], ["StellarKraken", "NA"], ["OmenSeeker", "EU"],
    ["RogueAntenna", "SA"], ["HyperionFall", "APAC"], ["DuneStalker", "NA"],
    ["VelvetThorn", "EU"], ["BlitzMagnet", "NA"], ["EchoSaboteur", "APAC"],
    ["FeralCompass", "SA"], ["LunarPariah", "EU"], ["StaticMantis", "NA"],
    ["ObsidianLark", "APAC"], ["RiftWalker_J", "EU"], ["CinderFoxx", "NA"],
    ["TempestGrin", "SA"], ["NullProphet", "EU"], ["AeonSparrow", "APAC"],
    ["GrimLattice", "NA"], ["SolsticeRex", "EU"], ["PhantomQuill", "SA"],
  ];
  const FRIEND_NAMES = new Set([
    "TurboTanuki", "PixelPyre", "CinderFoxx", "RogueAntenna", "EchoSaboteur",
    "StaticMantis", "BlitzMagnet", "FeralCompass", "AeonSparrow", "Nocturne_99",
  ]);

  // Deterministic pseudo-random so every load looks identical.
  function mulberry32(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildSeason(seedBase) {
    const rnd = mulberry32(seedBase);
    const players = NAMES.map(([name, region], i) => {
      const score = Math.round(123400 - i * (1500 + rnd() * 900) - rnd() * 700);
      return {
        name,
        region,
        friend: FRIEND_NAMES.has(name),
        you: false,
        score: Math.max(score, 18000),
        winrate: Math.round((38 + rnd() * 34) * 10) / 10,
        delta: Math.round((rnd() - 0.45) * 14),
        level: 40 + Math.round(rnd() * 260),
      };
    });
    players.push({
      name: "VektorPrime",
      region: "NA",
      friend: true,
      you: true,
      score: Math.round(96000 + rnd() * 4200),
      winrate: 57.4,
      delta: 6,
      level: 188,
    });
    return players;
  }

  const SEASONS = { s7: buildSeason(7077), s6: buildSeason(6066), s5: buildSeason(5055) };

  /* ---------- State ---------- */
  const PAGE = 12;
  const state = {
    season: "s7",
    scope: "global",
    region: "NA",
    query: "",
    sortKey: "score",
    sortDir: "desc",
    visible: PAGE,
  };

  /* ---------- DOM ---------- */
  const podiumEl = document.getElementById("podium");
  const bodyEl = document.getElementById("board-body");
  const countEl = document.getElementById("board-count");
  const loadMoreBtn = document.getElementById("load-more");
  const searchInput = document.getElementById("search");
  const regionWrap = document.getElementById("region-wrap");
  const regionSelect = document.getElementById("region");
  const seasonSelect = document.getElementById("season");
  const tabs = Array.from(document.querySelectorAll(".scope-tab"));
  const sortBtns = Array.from(document.querySelectorAll(".sort-btn"));

  /* ---------- Helpers ---------- */
  const fmt = (n) => n.toLocaleString("en-US");

  const AVATAR_GRADS = [
    ["#00e5ff", "#7c4dff"], ["#ff3d71", "#ffc857"], ["#36e27a", "#00e5ff"],
    ["#7c4dff", "#ff3d71"], ["#ffc857", "#36e27a"], ["#00e5ff", "#36e27a"],
  ];
  function avatarStyle(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const [a, b] = AVATAR_GRADS[h % AVATAR_GRADS.length];
    return `background:linear-gradient(135deg,${a},${b})`;
  }
  const initials = (name) =>
    name.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+|(?=[A-Z])/)
      .filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || name.slice(0, 2).toUpperCase();

  function scopedPlayers() {
    const all = SEASONS[state.season];
    if (state.scope === "friends") return all.filter((p) => p.friend || p.you);
    if (state.scope === "region") return all.filter((p) => p.region === state.region);
    return all.slice();
  }

  // Ranks are always assigned by score, independent of column sorting.
  function ranked() {
    const list = scopedPlayers().sort((a, b) => b.score - a.score);
    list.forEach((p, i) => { p._rank = i + 1; });
    return list;
  }

  function sorted(list) {
    const dir = state.sortDir === "asc" ? 1 : -1;
    return list.slice().sort((a, b) => (a[state.sortKey] - b[state.sortKey]) * dir);
  }

  /* ---------- Render: podium ---------- */
  function renderPodium(list) {
    const order = [1, 0, 2]; // 2nd, 1st, 3rd visual order
    const top3 = list.slice(0, 3);
    podiumEl.innerHTML = order
      .filter((i) => top3[i])
      .map((i) => {
        const p = top3[i];
        const t = tierFor(p.score);
        return `
          <article class="podium-card place-${i + 1}" aria-label="Rank ${i + 1}: ${p.name}">
            <div class="podium-place">#${i + 1}</div>
            <div class="podium-avatar" style="${avatarStyle(p.name)}" aria-hidden="true">${initials(p.name)}</div>
            <div class="podium-body">
              <h3 class="podium-name">${p.name}</h3>
              <div class="podium-region">${p.region} &middot; LVL ${p.level}</div>
              <div class="podium-score">${fmt(p.score)}</div>
            </div>
            <span class="tier-badge tier-${t.id} podium-tier">${t.label}</span>
          </article>`;
      })
      .join("");
  }

  /* ---------- Render: table ---------- */
  function rowHTML(p, idx) {
    const t = tierFor(p.score);
    const trend =
      p.delta > 0
        ? `<span class="trend trend-up"><span class="trend-arrow" aria-hidden="true">▲</span>${p.delta}<span class="sr-only"> ranks up</span></span>`
        : p.delta < 0
          ? `<span class="trend trend-down"><span class="trend-arrow" aria-hidden="true">▼</span>${Math.abs(p.delta)}<span class="sr-only"> ranks down</span></span>`
          : `<span class="trend trend-flat">—</span>`;
    return `
      <tr class="board-row${p._rank <= 3 ? " is-top" : ""}${p.you ? " is-you" : ""}" data-name="${p.name.toLowerCase()}" style="animation-delay:${Math.min(idx * 28, 320)}ms">
        <td><span class="rank-num">#${p._rank}</span></td>
        <td>
          <div class="player-cell">
            <span class="player-avatar" style="${avatarStyle(p.name)}" aria-hidden="true">${initials(p.name)}</span>
            <div>
              <div class="player-name">${p.name}${p.you ? '<span class="you-chip">YOU</span>' : ""}</div>
              <div class="player-meta">${p.region} &middot; LVL ${p.level}</div>
            </div>
          </div>
        </td>
        <td><span class="tier-badge tier-${t.id}">${t.label}</span></td>
        <td><span class="score-num">${fmt(p.score)}</span></td>
        <td>
          <div class="wr-cell">
            <span class="wr-num">${p.winrate.toFixed(1)}%</span>
            <span class="wr-bar"><span class="wr-fill${p.winrate < 48 ? " wr-low" : ""}" data-w="${p.winrate}"></span></span>
          </div>
        </td>
        <td>${trend}</td>
      </tr>`;
  }

  function render() {
    const byRank = ranked();
    renderPodium(byRank);

    const list = sorted(byRank);
    const shown = list.slice(0, state.visible);

    if (!shown.length) {
      bodyEl.innerHTML = `<tr class="empty-row"><td colspan="6">No players found in this scope.</td></tr>`;
    } else {
      let html = shown.map(rowHTML).join("");
      // Pin "you" below the visible page if cut off.
      const you = list.find((p) => p.you);
      if (you && !shown.includes(you)) {
        html += `<tr class="row-sep" aria-hidden="true"><td colspan="6">&middot;&middot;&middot;</td></tr>${rowHTML(you, shown.length)}`;
      }
      bodyEl.innerHTML = html;
    }

    countEl.textContent = `Showing ${Math.min(state.visible, list.length)} of ${list.length} players`;
    loadMoreBtn.disabled = state.visible >= list.length;

    // Animate win-rate bars after layout.
    requestAnimationFrame(() => {
      bodyEl.querySelectorAll(".wr-fill").forEach((el) => {
        el.style.width = `${el.dataset.w}%`;
      });
    });

    updateSortIndicators();
  }

  function updateSortIndicators() {
    sortBtns.forEach((btn) => {
      const active = btn.dataset.sort === state.sortKey;
      btn.classList.toggle("is-sorted", active);
      btn.classList.toggle("dir-asc", active && state.sortDir === "asc");
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  /* ---------- Interactions ---------- */
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.scope === state.scope) return;
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      state.scope = tab.dataset.scope;
      state.visible = PAGE;
      regionWrap.hidden = state.scope !== "region";
      const labels = { global: "Global ladder", friends: "Friends ladder", region: `Region ladder — ${regionSelect.selectedOptions[0].text}` };
      toast(labels[state.scope]);
      render();
    });
  });

  regionSelect.addEventListener("change", () => {
    state.region = regionSelect.value;
    state.visible = PAGE;
    toast(`Region: ${regionSelect.selectedOptions[0].text}`);
    render();
  });

  seasonSelect.addEventListener("change", () => {
    state.season = seasonSelect.value;
    state.visible = PAGE;
    toast(`Loaded ${seasonSelect.selectedOptions[0].text}`);
    render();
  });

  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
      } else {
        state.sortKey = key;
        state.sortDir = "desc";
      }
      render();
    });
  });

  loadMoreBtn.addEventListener("click", () => {
    state.visible += PAGE;
    render();
  });

  /* Search-to-jump: expands the table to the match, scrolls and flashes it. */
  let searchTimer = null;
  function jumpToPlayer() {
    const q = searchInput.value.trim().toLowerCase();
    state.query = q;
    if (!q) return;

    const list = sorted(ranked());
    const idx = list.findIndex((p) => p.name.toLowerCase().includes(q));
    if (idx === -1) {
      toast(`No player matching “${searchInput.value.trim()}” in this scope`);
      return;
    }
    if (idx >= state.visible) {
      state.visible = Math.ceil((idx + 1) / PAGE) * PAGE;
      render();
    }
    const row = bodyEl.querySelector(`.board-row[data-name*="${CSS.escape(q)}"]`);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.remove("is-flash");
      void row.offsetWidth; // restart animation
      row.classList.add("is-flash");
      toast(`Found ${list[idx].name} — rank #${list[idx]._rank}`);
    }
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    if (searchInput.value.trim().length >= 2) {
      searchTimer = setTimeout(jumpToPlayer, 420);
    }
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(searchTimer);
      jumpToPlayer();
    }
  });

  document.getElementById("play-btn").addEventListener("click", () => {
    toast("Launching Hollow Reign… (demo)");
  });

  /* ---------- Hero counters ---------- */
  function animateCounters() {
    document.querySelectorAll("[data-counter]").forEach((el) => {
      const target = Number(el.dataset.counter);
      const start = performance.now();
      const dur = 1100;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Screen-reader-only utility (injected) ---------- */
  const srStyle = document.createElement("style");
  srStyle.textContent = ".sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}";
  document.head.appendChild(srStyle);

  /* ---------- Init ---------- */
  render();
  animateCounters();
})();
