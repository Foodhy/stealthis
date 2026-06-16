/* Lumen Collective — DAO Governance (UI simulation, no real chain calls) */
(() => {
  "use strict";

  // ---------- State ----------
  const QUORUM = 40_000_000; // vNOVA
  const MY_POWER = 184_250;

  const now = Date.now();
  const h = 3600 * 1000;
  const d = 24 * h;

  const proposals = [
    {
      id: "LIP-47",
      title: "Deploy 4.2M lmUSD from treasury into the Lumen Chain LST liquidity program",
      status: "active",
      proposer: { name: "auroranode.lum", addr: "0x9d21…44fe", hue: 262 },
      endsAt: now + 2 * d + 7 * h + 23 * 60 * 1000,
      for: 21_400_000,
      against: 6_850_000,
      abstain: 1_920_000,
      myVote: null,
      description:
        "Allocates 4,200,000 lmUSD from the community treasury to seed three concentrated liquidity pools (NOVA/lmUSD, wLUM/lmUSD, stNOVA/NOVA) for 26 weeks. Liquidity is managed by the on-chain LiquidityVault module with a 15% max drawdown circuit breaker; unused funds return to the treasury automatically at epoch 412.",
      actions: "Treasury transfer · 4,200,000 lmUSD → 0x5be0…91aa (LiquidityVault)",
    },
    {
      id: "LIP-46",
      title: "Reduce governance quorum from 40M to 32M vNOVA for parameter-change proposals",
      status: "active",
      proposer: { name: "0x3fc8…b1d2", addr: "0x3fc8…b1d2", hue: 174 },
      endsAt: now + 18 * h + 41 * 60 * 1000,
      for: 14_100_000,
      against: 15_900_000,
      abstain: 4_300_000,
      myVote: "against",
      description:
        "Lowers the quorum requirement for parameter-change proposals only (fee switches, emission curves, oracle configs) from 40M to 32M vNOVA. Treasury transfers and protocol upgrades keep the 40M threshold. Includes a 6-month sunset clause: the change reverts unless re-ratified in epoch 460.",
      actions: "Parameter change · Governor.setQuorum(class=PARAM, 32_000_000e18)",
    },
    {
      id: "LIP-45",
      title: "Fund the Nebula Grants round 7 with 850,000 NOVA over two quarters",
      status: "active",
      proposer: { name: "nebula-guild.lum", addr: "0x61aa…07c3", hue: 32 },
      endsAt: now + 4 * d + 11 * h,
      for: 9_750_000,
      against: 2_100_000,
      abstain: 860_000,
      myVote: null,
      description:
        "Funds the seventh Nebula grants cohort: 850,000 NOVA streamed over 180 days via the PaymentStream module to the Grants Council multisig (4-of-7). Focus areas are zk tooling, mobile light clients, and lmUSD payment rails. Council publishes monthly transparency reports on-chain.",
      actions: "Treasury stream · 850,000 NOVA → 0xab44…2e09 (Grants 4/7 multisig)",
    },
    {
      id: "LIP-44",
      title: "Activate the protocol fee switch at 12% of sequencer revenue, routed to stakers",
      status: "passed",
      proposer: { name: "veloria.lum", addr: "0x82e4…9f1b", hue: 318 },
      endedLabel: "Ended 3d ago · executed",
      for: 47_300_000,
      against: 8_900_000,
      abstain: 2_400_000,
      myVote: "for",
      description:
        "Turns on the long-debated fee switch: 12% of Lumen Chain sequencer revenue is redirected from the treasury to stNOVA stakers, distributed per epoch. Executed at block 18,442,067 — first distribution lands in epoch 408.",
      actions: "Executed · FeeRouter.setStakerShare(1200) at block 18,442,067",
    },
    {
      id: "LIP-43",
      title: "Adopt the dual-oracle design (Starfall + Meridian feeds) for lmUSD collateral",
      status: "passed",
      proposer: { name: "auroranode.lum", addr: "0x9d21…44fe", hue: 262 },
      endedLabel: "Ended 9d ago · executed",
      for: 51_800_000,
      against: 1_750_000,
      abstain: 5_100_000,
      myVote: null,
      description:
        "Replaces the single Starfall oracle with a dual-feed design: lmUSD collateral pricing now takes the median of Starfall and Meridian, with a 1.5% deviation guard that pauses mints when feeds disagree. Audited by Glasshouse Security (report GH-2026-031).",
      actions: "Executed · OracleHub.setFeeds([starfall, meridian]) at block 18,301,554",
    },
    {
      id: "LIP-42",
      title: "Acquire 2% of the Driftway DEX token supply via treasury swap",
      status: "failed",
      proposer: { name: "0xkepler.lum", addr: "0xce17…3d88", hue: 0 },
      endedLabel: "Ended 16d ago · quorum not met",
      for: 11_200_000,
      against: 19_400_000,
      abstain: 6_300_000,
      myVote: "against",
      description:
        "Proposed swapping 1.1M NOVA for 2% of DRIFT supply to deepen the partnership with Driftway DEX. Failed on both margin and turnout: Against led by 8.2M and total participation (36.9M) stayed below the 40M quorum.",
      actions: "Not executed · proposal defeated",
    },
    {
      id: "LIP-48",
      title: "Migrate the staking module to vNOVA v2 with time-weighted boosts",
      status: "pending",
      proposer: { name: "lumen-labs.lum", addr: "0x44b7…aa05", hue: 205 },
      startsLabel: "Voting opens in 1d 9h",
      for: 0,
      against: 0,
      abstain: 0,
      myVote: null,
      description:
        "Upgrades staking to vNOVA v2: voting power scales with lock duration (1x at 1 month up to 2.5x at 24 months), and delegation becomes revocable per-proposal. Currently in the 2-day review window — voting opens at epoch 409.",
      actions: "Protocol upgrade · StakingModule v2 (audit pending, Glasshouse)",
    },
  ];

  let activeFilter = "all";
  let selectedId = null;
  let myPower = MY_POWER;

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);

  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  const fmtCompact = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Math.round(n));
  };

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const randHash = () =>
    "0x" +
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0")).join("") .slice(0, 6) +
    "…" +
    Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");

  function toast(msg, kind = "") {
    const stack = $("#toastStack");
    const el = document.createElement("div");
    el.className = "toast" + (kind ? ` toast-${kind}` : "");
    el.innerHTML = msg;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add("toast-out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3400);
  }

  function avatarSvg(hue, size = 18) {
    return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 18 18" aria-hidden="true">
      <rect width="18" height="18" rx="9" fill="hsl(${hue} 70% 22%)"/>
      <circle cx="6.5" cy="7" r="3" fill="hsl(${hue} 85% 62%)"/>
      <circle cx="12" cy="11.5" r="4" fill="hsl(${(hue + 60) % 360} 80% 55%)" opacity="0.85"/>
    </svg>`;
  }

  function countdownText(endsAt) {
    let ms = Math.max(0, endsAt - Date.now());
    const days = Math.floor(ms / d);
    ms -= days * d;
    const hours = Math.floor(ms / h);
    ms -= hours * h;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  }

  function animateNumber(el, from, to, ms = 700) {
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const totalVotes = (p) => p.for + p.against + p.abstain;

  function pct(p) {
    const t = totalVotes(p);
    if (t === 0) return { for: 0, against: 0, abstain: 0 };
    return {
      for: (p.for / t) * 100,
      against: (p.against / t) * 100,
      abstain: (p.abstain / t) * 100,
    };
  }

  // ---------- Render: proposal list ----------
  function voteBarHtml(p) {
    const s = pct(p);
    const t = totalVotes(p);
    const quorumPct = Math.min(100, (t / QUORUM) * 100);
    const quorumMet = t >= QUORUM;
    return `
      <div class="vote-bar" role="img"
        aria-label="For ${s.for.toFixed(1)} percent, Against ${s.against.toFixed(1)} percent, Abstain ${s.abstain.toFixed(1)} percent">
        <span class="seg seg-for" style="width:${s.for}%"></span>
        <span class="seg seg-against" style="width:${s.against}%"></span>
        <span class="seg seg-abstain" style="width:${s.abstain}%"></span>
      </div>
      <div class="vote-legend">
        <span class="legend-for"><span class="dot dot-for"></span>For <span class="mono">${s.for.toFixed(1)}%</span></span>
        <span class="legend-against"><span class="dot dot-against"></span>Against <span class="mono">${s.against.toFixed(1)}%</span></span>
        <span><span class="dot dot-abstain"></span>Abstain <span class="mono">${s.abstain.toFixed(1)}%</span></span>
      </div>
      <div class="quorum">
        <div class="quorum-row">
          <span>Quorum ${quorumMet ? '<span class="quorum-met">· reached ✓</span>' : ""}</span>
          <span class="mono">${fmtCompact(t)} / ${fmtCompact(QUORUM)} vNOVA</span>
        </div>
        <div class="quorum-track"><span class="quorum-fill" style="width:${quorumPct}%"></span></div>
      </div>`;
  }

  function statusMeta(p) {
    if (p.status === "active") {
      const ending = p.endsAt - Date.now() < d;
      return `<span class="countdown mono${ending ? " ending" : ""}" data-ends="${p.endsAt}">⏳ ${countdownText(p.endsAt)} left</span>`;
    }
    if (p.status === "pending") return `<span class="ended-at">${esc(p.startsLabel)}</span>`;
    return `<span class="ended-at">${esc(p.endedLabel)}</span>`;
  }

  function cardHtml(p) {
    return `
      <button type="button" class="proposal-card${p.id === selectedId ? " is-selected" : ""}"
        data-id="${p.id}" aria-pressed="${p.id === selectedId}">
        <div class="card-top">
          <span class="status-pill status-${p.status}">${p.status}</span>
          <span class="pid mono">${p.id}</span>
          ${statusMeta(p)}
        </div>
        <h2 class="card-title">${esc(p.title)}</h2>
        <div class="proposer-row">
          <span>by</span>
          <span class="proposer-chip">${avatarSvg(p.proposer.hue)}<span class="mono">${esc(p.proposer.name)}</span></span>
          ${p.myVote ? `<span class="voted-badge">✓ you voted ${p.myVote}</span>` : ""}
        </div>
        ${p.status === "pending" ? '<p class="cast-note" style="margin:0">No votes yet — voting has not opened.</p>' : voteBarHtml(p)}
      </button>`;
  }

  function renderList() {
    const list = $("#proposalList");
    const visible = proposals.filter((p) => activeFilter === "all" || p.status === activeFilter);
    list.innerHTML = visible.length
      ? visible.map(cardHtml).join("")
      : '<div class="empty-state">No proposals match this filter.</div>';

    list.querySelectorAll(".proposal-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedId = card.dataset.id;
        renderList();
        renderDetail();
        if (window.matchMedia("(max-width: 1020px)").matches) {
          $("#detailPanel").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function renderCounts() {
    const counts = { all: proposals.length, active: 0, passed: 0, failed: 0, pending: 0 };
    proposals.forEach((p) => counts[p.status]++);
    document.querySelectorAll("[data-count]").forEach((el) => {
      el.textContent = counts[el.dataset.count];
    });
    $("#activeCount").textContent = counts.active;
    $("#votedCount").textContent = proposals.filter((p) => p.myVote).length;
  }

  // ---------- Render: detail panel ----------
  function resultRow(label, cls, value, total, color) {
    const w = total === 0 ? 0 : (value / total) * 100;
    return `
      <div class="result-row">
        <span class="label label-${cls}">${label}</span>
        <div class="result-track"><span class="result-fill" style="width:${w}%;background:${color}"></span></div>
        <span class="amt mono">${fmtCompact(value)}</span>
      </div>`;
  }

  function castSection(p) {
    if (p.status === "pending") {
      return `<div class="cast"><div class="closed-note">Voting has not opened yet — ${esc(p.startsLabel.toLowerCase())}.</div></div>`;
    }
    if (p.status !== "active") {
      return `<div class="cast"><div class="closed-note">Voting closed. ${esc(p.endedLabel)}.${
        p.myVote ? ` You voted <strong style="color:var(--text)">${p.myVote}</strong>.` : ""
      }</div></div>`;
    }
    if (p.myVote) {
      return `
        <div class="cast">
          <h3>Your vote</h3>
          <div class="vote-receipt">
            <span>✓ Voted ${p.myVote} with ${fmt(myPower)} vNOVA</span>
            <span class="mono">tx ${p.txHash || "0x84c1…0b2e"}</span>
          </div>
        </div>`;
    }
    return `
      <div class="cast">
        <h3>Cast your vote</h3>
        <p class="cast-note">You are signing an off-chain ballot worth <strong class="mono" style="color:var(--text)">${fmt(myPower)} vNOVA</strong>. Votes are final and cannot be changed for this proposal.</p>
        <div class="vote-actions">
          <button type="button" class="vote-btn vote-for" data-vote="for">For</button>
          <button type="button" class="vote-btn vote-against" data-vote="against">Against</button>
          <button type="button" class="vote-btn vote-abstain" data-vote="abstain">Abstain</button>
        </div>
      </div>`;
  }

  function renderDetail() {
    const panel = $("#detailPanel");
    const p = proposals.find((x) => x.id === selectedId);
    if (!p) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    const t = totalVotes(p);
    panel.innerHTML = `
      <div class="detail-head">
        <div class="detail-id-row">
          <span class="status-pill status-${p.status}">${p.status}</span>
          <span class="pid mono">${p.id}</span>
        </div>
        <button type="button" class="icon-btn" id="detailClose" aria-label="Close detail panel">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="detail-body">
        <h2 class="detail-title">${esc(p.title)}</h2>
        <p class="detail-desc">${esc(p.description)}</p>
        <div class="detail-meta">
          <div class="meta-cell"><span class="k">Proposer</span><span class="v mono">${esc(p.proposer.addr)}</span></div>
          <div class="meta-cell"><span class="k">${p.status === "active" ? "Time left" : "Status"}</span>
            <span class="v mono" ${p.status === "active" ? `data-ends-detail="${p.endsAt}"` : ""}>${
              p.status === "active" ? countdownText(p.endsAt) : p.status === "pending" ? "review window" : p.endedLabel.split("·")[1]?.trim() || p.status
            }</span></div>
          <div class="meta-cell"><span class="k">Turnout</span><span class="v mono">${fmtCompact(t)} vNOVA</span></div>
          <div class="meta-cell"><span class="k">Quorum</span><span class="v mono ${t >= QUORUM ? "quorum-met" : ""}">${Math.min(100, (t / QUORUM) * 100).toFixed(0)}% ${t >= QUORUM ? "✓" : ""}</span></div>
        </div>
        <div class="meta-cell" style="margin-bottom:16px"><span class="k">On-chain action</span><span class="v mono" style="font-size:12px;font-weight:500">${esc(p.actions)}</span></div>
        <div class="results">
          <h3>Current results</h3>
          ${resultRow("For", "for", p.for, t, "linear-gradient(90deg,#1fae67,var(--pos))")}
          ${resultRow("Against", "against", p.against, t, "linear-gradient(90deg,var(--neg),#d63a58)")}
          ${resultRow("Abstain", "abstain", p.abstain, t, "rgba(138,144,162,0.55)")}
        </div>
        ${castSection(p)}
      </div>`;

    $("#detailClose", panel).addEventListener("click", () => {
      selectedId = null;
      panel.hidden = true;
      renderList();
    });

    panel.querySelectorAll(".vote-btn").forEach((btn) => {
      btn.addEventListener("click", () => castVote(p, btn.dataset.vote));
    });
  }

  // ---------- Vote ----------
  function castVote(p, choice) {
    if (p.status !== "active" || p.myVote) return;
    p.myVote = choice;
    p[choice] += myPower;
    p.txHash = randHash();

    const kind = choice === "for" ? "pos" : choice === "against" ? "neg" : "accent";
    toast(
      `Ballot signed — <strong>${choice.toUpperCase()}</strong> on <span class="mono">${p.id}</span> with <span class="mono">${fmt(myPower)}</span> vNOVA`,
      kind
    );

    // pulse the voting power stat to show it was applied
    const powerEl = $("#votingPower");
    animateNumber(powerEl, 0, myPower, 800);

    renderCounts();
    renderList();
    renderDetail();
  }

  // ---------- Filters ----------
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;
      document.querySelectorAll(".filter-tab").forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      renderList();
    });
  });

  // ---------- Countdowns ----------
  setInterval(() => {
    document.querySelectorAll("[data-ends]").forEach((el) => {
      const ends = Number(el.dataset.ends);
      el.innerHTML = `⏳ ${countdownText(ends)} left`;
      el.classList.toggle("ending", ends - Date.now() < d);
    });
    document.querySelectorAll("[data-ends-detail]").forEach((el) => {
      el.textContent = countdownText(Number(el.dataset.endsDetail));
    });
  }, 1000);

  // ---------- Create proposal modal (stub) ----------
  const modal = $("#proposalModal");
  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    $("#propTitle").focus();
  }

  function closeModal() {
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  $("#newProposalBtn").addEventListener("click", openModal);
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalCancel").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  $("#modalSubmit").addEventListener("click", () => {
    const title = $("#propTitle").value.trim();
    if (!title) {
      toast("Add a title before submitting your proposal.", "neg");
      $("#propTitle").focus();
      return;
    }
    closeModal();
    toast(
      `Proposal draft signed — <span class="mono">${randHash()}</span> · 10,000 NOVA bond locked (simulated)`,
      "accent"
    );
    $("#propTitle").value = "";
    $("#propSummary").value = "";
  });

  // ---------- Misc topbar actions ----------
  $("#delegateBtn").addEventListener("click", () => {
    toast("Delegation manager coming soon — your power stays self-delegated.", "accent");
  });

  $("#walletChip").addEventListener("click", () => {
    toast('Connected as <span class="mono">0x7a3f…c41d</span> on Lumen Chain (simulated)');
  });

  // ---------- Init ----------
  renderCounts();
  renderList();
  renderDetail();
  animateNumber($("#votingPower"), 0, myPower, 900);
})();
