(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Fictional revision data for the article "Aurora DB".
   * `text` is the full article body at that revision; the diff is
   * computed live (LCS line diff) between any two selected revisions.
   * Revisions are ordered newest-first for display.
   * ------------------------------------------------------------- */

  const REVS = [
    {
      id: 2184, ts: "2026-06-07T14:08:00Z", date: "7 June 2026, 14:08",
      editor: "RowenKell", color: "#7c3aed", summary: "Added benchmark figures for the 0.9 release; tightened the lead paragraph.",
      tags: [], size: 38720, current: true,
      text:
`Aurora DB is a distributed, multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a Raft-based consensus group.
Reads default to the nearest healthy replica.
In the 0.9 release, p99 read latency dropped to 4.1 ms.
The query planner supports cost-based join reordering.
Aurora DB exposes a wire protocol compatible with the Verdant SQL dialect.`
    },
    {
      id: 2179, ts: "2026-06-05T09:42:00Z", date: "5 June 2026, 09:42",
      editor: "MaeLindqvist", color: "#0891b2", summary: "Clarified replication; noted Raft consensus.",
      tags: [], size: 38201,
      text:
`Aurora DB is a distributed, multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a Raft-based consensus group.
Reads default to the nearest healthy replica.
The query planner supports cost-based join reordering.
Aurora DB exposes a wire protocol compatible with the Verdant SQL dialect.`
    },
    {
      id: 2176, ts: "2026-06-04T22:15:00Z", date: "4 June 2026, 22:15",
      editor: "VerdantBot", color: "#475569", summary: "Reverted edits by 203.0.113.44 to last revision by MaeLindqvist.",
      tags: ["revert", "bot"], minor: true,
      text:
`Aurora DB is a distributed, multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a consensus group.
Reads default to the nearest healthy replica.
The query planner supports cost-based join reordering.
Aurora DB exposes a wire protocol compatible with the Verdant SQL dialect.`,
      size: 37980
    },
    {
      id: 2175, ts: "2026-06-04T22:09:00Z", date: "4 June 2026, 22:09",
      editor: "203.0.113.44", color: "#9ca3af", summary: "best database ever!!!", anon: true,
      tags: [],
      text:
`Aurora DB is the BEST distributed storage engine in the whole world.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a consensus group.
Reads default to the nearest healthy replica.
The query planner supports cost-based join reordering.
Aurora DB exposes a wire protocol compatible with the Verdant SQL dialect.`,
      size: 38150
    },
    {
      id: 2168, ts: "2026-05-29T11:03:00Z", date: "29 May 2026, 11:03",
      editor: "MaeLindqvist", color: "#0891b2", summary: "Documented read routing behaviour.",
      tags: [],
      text:
`Aurora DB is a distributed, multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a consensus group.
Reads default to the nearest healthy replica.
The query planner supports cost-based join reordering.`,
      size: 37640
    },
    {
      id: 2160, ts: "2026-05-21T16:48:00Z", date: "21 May 2026, 16:48",
      editor: "Tobiasen-Q", color: "#db2777", summary: "Typo fix in lead.",
      tags: ["minor"], minor: true,
      text:
`Aurora DB is a distributed, multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a consensus group.
The query planner supports cost-based join reordering.`,
      size: 37380
    },
    {
      id: 2151, ts: "2026-05-12T08:30:00Z", date: "12 May 2026, 08:30",
      editor: "RowenKell", color: "#7c3aed", summary: "Added section on the query planner.",
      tags: [],
      text:
`Aurora DB is a distributed multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a consensus group.
The query planner supports cost-based join reordering.`,
      size: 37260
    },
    {
      id: 2140, ts: "2026-05-03T19:12:00Z", date: "3 May 2026, 19:12",
      editor: "IngridSolace", color: "#16a34a", summary: "Expanded the lead and replication details.",
      tags: [],
      text:
`Aurora DB is a distributed multi-region storage engine.
It is designed for low-latency reads across geographic regions.
The engine partitions data into ranges called shards.
Each shard is replicated across at least three availability zones.
Writes are coordinated using a consensus group.`,
      size: 36810
    },
    {
      id: 2122, ts: "2026-04-18T13:55:00Z", date: "18 April 2026, 13:55",
      editor: "VerdantBot", color: "#475569", summary: "Added category and infobox links.",
      tags: ["bot", "minor"], minor: true,
      text:
`Aurora DB is a distributed storage engine.
It is designed for low-latency reads across regions.
The engine partitions data into ranges called shards.
Each shard is replicated across availability zones.`,
      size: 36120
    },
    {
      id: 2098, ts: "2026-04-02T07:24:00Z", date: "2 April 2026, 07:24",
      editor: "IngridSolace", color: "#16a34a", summary: "Initial draft of the article.",
      tags: ["new"],
      text:
`Aurora DB is a distributed storage engine.
It is designed for low-latency reads across regions.
The engine partitions data into shards.`,
      size: 35804
    }
  ];

  const byId = {};
  REVS.forEach((r) => (byId[r.id] = r));

  /* --------------------------- LCS line diff --------------------------- */
  function lineDiff(aText, bText) {
    const a = aText.split("\n");
    const b = bText.split("\n");
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push({ type: "ctx", text: a[i] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: "del", text: a[i] }); i++; }
      else { out.push({ type: "add", text: b[j] }); j++; }
    }
    while (i < n) out.push({ type: "del", text: a[i++] });
    while (j < m) out.push({ type: "add", text: b[j++] });
    return out;
  }

  /* word-level highlight for adjacent del/add pairs */
  function wordMark(oldStr, newStr) {
    const ow = oldStr.split(/(\s+)/);
    const nw = newStr.split(/(\s+)/);
    const n = ow.length, m = nw.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = ow[i] === nw[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0, oOut = "", nOut = "";
    while (i < n && j < m) {
      if (ow[i] === nw[j]) { oOut += esc(ow[i]); nOut += esc(nw[j]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { oOut += mk("del-mark", ow[i]); i++; }
      else { nOut += mk("add-mark", nw[j]); j++; }
    }
    while (i < n) oOut += mk("del-mark", ow[i++]);
    while (j < m) nOut += mk("add-mark", nw[j++]);
    return [oOut, nOut];
  }
  function mk(cls, s) { return s.trim() === "" ? esc(s) : `<mark class="${cls}">${esc(s)}</mark>`; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ----------------------------- State ----------------------------- */
  let oldId = null, newId = null, mode = "inline", compared = false;

  const $ = (s, r = document) => r.querySelector(s);
  const histList = $("#histList");
  const compareBtn = $("#compareBtn");
  const restoreBtn = $("#restoreBtn");
  const diffEmpty = $("#diffEmpty");
  const diffBody = $("#diffBody");
  const diffSummary = $("#diffSummary");
  const selOld = $("#selOld");
  const selNew = $("#selNew");

  /* --------------------------- Render list --------------------------- */
  function bytePill(delta) {
    if (delta == null) return `<span class="byte zero">—</span>`;
    if (delta > 0) return `<span class="byte pos">+${delta}</span>`;
    if (delta < 0) return `<span class="byte neg">${delta}</span>`;
    return `<span class="byte zero">0</span>`;
  }

  function tagHtml(tags) {
    if (!tags || !tags.length) return "";
    const cls = { minor: "tag-minor", revert: "tag-revert", bot: "tag-bot", new: "tag-new" };
    return tags.map((t) => `<span class="tag ${cls[t] || "tag-minor"}">${t}</span>`).join("");
  }

  function renderList() {
    const hideMinor = $("#hideMinor").checked;
    const hideBots = $("#hideBots").checked;
    histList.innerHTML = "";

    REVS.forEach((r, idx) => {
      if (hideMinor && r.minor) return;
      if (hideBots && r.tags && r.tags.includes("bot")) return;

      const prev = REVS[idx + 1];
      const delta = prev ? r.size - prev.size : null;

      const li = document.createElement("li");
      li.className = "hist-row";
      li.dataset.id = r.id;
      if (r.id === oldId) li.classList.add("is-old");
      if (r.id === newId) li.classList.add("is-new");

      const initials = r.anon
        ? "IP"
        : r.editor.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();

      li.innerHTML = `
        <div class="hist-radios">
          <label title="Select as older revision">
            <span>old</span>
            <input type="radio" name="oldid" value="${r.id}" ${r.id === oldId ? "checked" : ""} ${r.current ? "disabled" : ""}>
          </label>
          <label title="Select as newer revision">
            <span>new</span>
            <input type="radio" name="newid" value="${r.id}" ${r.id === newId ? "checked" : ""}>
          </label>
        </div>
        <div class="byte-block">${bytePill(delta)}</div>
        <div class="hist-main">
          <div class="hist-line1">
            <a href="#diff" class="hist-time">${r.date}</a>
            <span class="hist-dot">·</span>
            <span class="hist-editor"><span class="avatar" style="--c:${r.color}">${initials}</span>${r.editor}</span>
            <span class="hist-dot">·</span>
            <span class="byte-size">${r.size.toLocaleString()} bytes</span>
            ${r.current ? `<span class="tag tag-minor">cur</span>` : ""}
            ${tagHtml(r.tags)}
          </div>
          <p class="hist-summary">${r.summary ? esc(r.summary) : `<span class="ital">No edit summary</span>`}</p>
        </div>`;
      histList.appendChild(li);
    });

    histList.querySelectorAll('input[name="oldid"]').forEach((el) =>
      el.addEventListener("change", () => { oldId = Number(el.value); afterPick(); }));
    histList.querySelectorAll('input[name="newid"]').forEach((el) =>
      el.addEventListener("change", () => { newId = Number(el.value); afterPick(); }));
  }

  function afterPick() {
    // Keep oldId strictly older than newId by revision id.
    if (oldId != null && newId != null && oldId > newId) {
      const t = oldId; oldId = newId; newId = t;
    }
    updateLegend();
    syncRowClasses();
    compareBtn.disabled = !(oldId != null && newId != null && oldId !== newId);
  }

  function syncRowClasses() {
    histList.querySelectorAll(".hist-row").forEach((row) => {
      const id = Number(row.dataset.id);
      row.classList.toggle("is-old", id === oldId);
      row.classList.toggle("is-new", id === newId);
    });
    // reflect possible swap back into the radios
    histList.querySelectorAll('input[name="oldid"]').forEach((el) => (el.checked = Number(el.value) === oldId));
    histList.querySelectorAll('input[name="newid"]').forEach((el) => (el.checked = Number(el.value) === newId));
  }

  function updateLegend() {
    if (oldId != null) {
      selOld.textContent = `older — ${byId[oldId].date}`;
      selOld.classList.add("set");
    } else { selOld.textContent = "older — none"; selOld.classList.remove("set"); }
    if (newId != null) {
      selNew.textContent = `newer — ${byId[newId].date}`;
      selNew.classList.add("set");
    } else { selNew.textContent = "newer — none"; selNew.classList.remove("set"); }
  }

  /* ----------------------------- Diff render ----------------------------- */
  function renderDiff() {
    if (!compared || oldId == null || newId == null) return;
    const o = byId[oldId], nw = byId[newId];

    $("#dsOldMeta").innerHTML = `<b>${o.date}</b> · ${esc(o.editor)} · rev ${o.id}`;
    $("#dsNewMeta").innerHTML = `<b>${nw.date}</b> · ${esc(nw.editor)} · rev ${nw.id}`;
    diffSummary.hidden = false;
    diffEmpty.hidden = true;
    diffBody.hidden = false;

    const ops = lineDiff(o.text, nw.text);
    diffBody.className = "diff-body" + (mode === "split" ? " split" : "");
    diffBody.innerHTML = mode === "split" ? renderSplit(ops) : renderInline(ops);
    restoreBtn.disabled = false;
  }

  function renderInline(ops) {
    let html = "";
    for (let k = 0; k < ops.length; k++) {
      const op = ops[k];
      // pair a del immediately followed by an add for word-level marks
      if (op.type === "del" && ops[k + 1] && ops[k + 1].type === "add") {
        const [oMark, nMark] = wordMark(op.text, ops[k + 1].text);
        html += `<div class="diff-row del"><span class="diff-gutter">−</span><span class="diff-text">${oMark}</span></div>`;
        html += `<div class="diff-row add"><span class="diff-gutter">+</span><span class="diff-text">${nMark}</span></div>`;
        k++;
        continue;
      }
      const sym = op.type === "add" ? "+" : op.type === "del" ? "−" : "";
      html += `<div class="diff-row ${op.type}"><span class="diff-gutter">${sym}</span><span class="diff-text">${esc(op.text)}</span></div>`;
    }
    return html;
  }

  function renderSplit(ops) {
    const left = [], right = [];
    let ln = 0, rn = 0, k = 0;
    while (k < ops.length) {
      const op = ops[k];
      if (op.type === "ctx") {
        ln++; rn++;
        left.push(rowL(ln, op.text, "ctx"));
        right.push(rowL(rn, op.text, "ctx"));
        k++;
      } else if (op.type === "del" && ops[k + 1] && ops[k + 1].type === "add") {
        const [oMark, nMark] = wordMark(op.text, ops[k + 1].text);
        ln++; rn++;
        left.push(rowRaw(ln, oMark, "del"));
        right.push(rowRaw(rn, nMark, "add"));
        k += 2;
      } else if (op.type === "del") {
        ln++;
        left.push(rowL(ln, op.text, "del"));
        right.push(rowEmpty());
        k++;
      } else { // add
        rn++;
        left.push(rowEmpty());
        right.push(rowL(rn, op.text, "add"));
        k++;
      }
    }
    return (
      `<div class="split-side"><div class="split-head">Older · rev ${oldId}</div>${left.join("")}</div>` +
      `<div class="split-side"><div class="split-head">Newer · rev ${newId}</div>${right.join("")}</div>`
    );
  }
  function rowL(n, text, cls) { return `<div class="split-row ${cls}"><span class="diff-gutter">${n}</span><span class="diff-text">${esc(text)}</span></div>`; }
  function rowRaw(n, html, cls) { return `<div class="split-row ${cls}"><span class="diff-gutter">${n}</span><span class="diff-text">${html}</span></div>`; }
  function rowEmpty() { return `<div class="split-row empty"><span class="diff-gutter"></span><span class="diff-text"></span></div>`; }

  /* ----------------------------- Toast ----------------------------- */
  const toastWrap = $("#toastWrap");
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = `<svg class="t-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${msg}</span>`;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3200);
  }

  /* ----------------------------- Wiring ----------------------------- */
  compareBtn.addEventListener("click", () => {
    compared = true;
    renderDiff();
    $("#diff").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(`Comparing rev <b>${oldId}</b> → rev <b>${newId}</b>.`);
  });

  $("#viewMode").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    mode = btn.dataset.mode;
    $("#viewMode").querySelectorAll(".seg-btn").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    renderDiff();
  });

  restoreBtn.addEventListener("click", () => {
    if (newId == null) return;
    const r = byId[newId];
    toast(`Restored revision from <b>${r.date}</b> by ${esc(r.editor)}. A new edit was queued for review.`);
  });

  $("#hideMinor").addEventListener("change", renderList);
  $("#hideBots").addEventListener("change", () => {
    renderList();
    afterPick();
  });
  $("#hideMinor").addEventListener("change", afterPick);

  /* sidebar drawer */
  const sidebar = $("#sidebar");
  const navToggle = $("#navToggle");
  const scrim = $("#scrim");
  function setDrawer(open) {
    sidebar.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    scrim.hidden = !open;
  }
  navToggle.addEventListener("click", () => setDrawer(!sidebar.classList.contains("open")));
  scrim.addEventListener("click", () => setDrawer(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) setDrawer(false);
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      $(".topbar-search input").focus();
    }
  });
  sidebar.querySelectorAll(".side-toc a, .side-link").forEach((a) =>
    a.addEventListener("click", () => { if (window.innerWidth <= 820) setDrawer(false); }));

  /* ----------------------------- Init ----------------------------- */
  // Preselect a sensible default pair: latest vs. the one before it.
  newId = REVS[0].id;
  oldId = REVS[1].id;
  renderList();
  afterPick();
})();
