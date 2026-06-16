/* NovaYield — Staking / Yield (UI simulation, no real wallet or RPC) */
(() => {
  "use strict";

  /* ---------------- Mock data ---------------- */

  const POOLS = {
    nova: {
      symbol: "NOVA",
      title: "NOVA Staking Pool",
      sub: "Single-sided staking · Audited · Rewards stream every block",
      apr: 12.4,
      tvl: "$48.2M",
      tvlNote: "▲ 3.1% · 24h",
      stakers: "21,408",
      price: 2.84,
      contract: "0x9bd2…77e1",
      logo: "nova",
      letter: "N",
      staked: 1250,
      wallet: 3418.52,
    },
    lum: {
      symbol: "LUM",
      title: "LUM Staking Pool",
      sub: "Native gas token · Secures Lumen Chain consensus",
      apr: 8.92,
      tvl: "$112.7M",
      tvlNote: "▲ 1.2% · 24h",
      stakers: "64,902",
      price: 0.92,
      contract: "0x4fa1…2c9b",
      logo: "lum",
      letter: "L",
      staked: 0,
      wallet: 8200.4,
    },
    aur: {
      symbol: "AURUM",
      title: "AURUM Boosted Pool",
      sub: "LST yield · Aurora Vaults · Boosted emissions",
      apr: 19.75,
      tvl: "$9.4M",
      tvlNote: "▲ 6.4% · 24h",
      stakers: "3,117",
      price: 14.05,
      contract: "0xd03e…91aa",
      logo: "aur",
      letter: "A",
      staked: 42.5,
      wallet: 96.31,
    },
    zphr: {
      symbol: "ZPHR",
      title: "ZPHR Governance Pool",
      sub: "Governance staking · Zephyr DAO voting power",
      apr: 6.3,
      tvl: "$27.1M",
      tvlNote: "▼ 0.8% · 24h",
      stakers: "11,260",
      price: 1.18,
      contract: "0x71c8…e4d0",
      logo: "zphr",
      letter: "Z",
      staked: 0,
      wallet: 1500,
    },
    oblk: {
      symbol: "OBSIDIAN",
      title: "OBSIDIAN Insurance Pool",
      sub: "Perps insurance fund · High risk, high emissions",
      apr: 34.1,
      tvl: "$2.8M",
      tvlNote: "▲ 12.6% · 24h",
      stakers: "884",
      price: 0.41,
      contract: "0xab57…03fe",
      logo: "oblk",
      letter: "O",
      staked: 0,
      wallet: 12000,
    },
  };

  const LOCKS = {
    flex: { label: "Flexible", days: 0, mult: 1.0 },
    30: { label: "30 days", days: 30, mult: 1.25 },
    90: { label: "90 days", days: 90, mult: 1.6 },
    365: { label: "1 year", days: 365, mult: 2.2 },
  };

  /* ---------------- State ---------------- */

  const state = {
    poolId: "nova",
    mode: "stake", // "stake" | "unstake"
    lock: "flex",
    pending: 0.184203, // pending rewards, in pool token
    userLockMult: 1.0, // boost applied to the existing position
  };

  /* ---------------- DOM ---------------- */

  const $ = (id) => document.getElementById(id);

  const el = {
    heroTitle: $("heroTitle"),
    heroApr: $("heroApr"),
    heroAprNote: $("heroAprNote"),
    heroTvl: $("heroTvl"),
    stakedBalance: $("stakedBalance"),
    walletBalance: $("walletBalance"),
    pendingRewards: $("pendingRewards"),
    pendingUsd: $("pendingUsd"),
    claimBtn: $("claimBtn"),
    tabStake: $("tabStake"),
    tabUnstake: $("tabUnstake"),
    amountLabel: $("amountLabel"),
    availLabel: $("availLabel"),
    amountInput: $("amountInput"),
    amountUsd: $("amountUsd"),
    maxBtn: $("maxBtn"),
    lockSelect: $("lockSelect"),
    lockOpts: Array.from(document.querySelectorAll(".lock-opt")),
    projApr: $("projApr"),
    projDaily: $("projDaily"),
    projHorizonLabel: $("projHorizonLabel"),
    projTotal: $("projTotal"),
    projTotalUsd: $("projTotalUsd"),
    projUnlock: $("projUnlock"),
    lockWarning: $("lockWarning"),
    actionBtn: $("actionBtn"),
    poolRows: Array.from(document.querySelectorAll(".pool-row[data-pool]")),
    modalBackdrop: $("modalBackdrop"),
    modalConfirm: $("modalConfirm"),
    modalPending: $("modalPending"),
    modalSuccess: $("modalSuccess"),
    modalTitle: $("modalTitle"),
    mAction: $("mAction"),
    mAmount: $("mAmount"),
    mLock: $("mLock"),
    mApr: $("mApr"),
    mUnlock: $("mUnlock"),
    mRisk: $("mRisk"),
    modalCancel: $("modalCancel"),
    modalSign: $("modalSign"),
    modalDone: $("modalDone"),
    successTitle: $("successTitle"),
    successHash: $("successHash"),
    pendingHash: document.querySelector("#modalPending .modal-hash"),
    heroLogo: document.querySelector(".hero-token .token-logo"),
    inputLogo: document.querySelector(".amount-box .token-logo"),
    rewardStatValue: document.querySelector(".hero-stats .stat:nth-child(4) .stat-value"),
    rewardStatNote: document.querySelector(".hero-stats .stat:nth-child(4) .stat-note"),
    stakersStat: document.querySelector(".hero-stats .stat:nth-child(3) .stat-value"),
    tvlNote: document.querySelector(".hero-stats .stat:nth-child(2) .stat-note"),
    feeNote: document.querySelector(".fee-note"),
    toastStack: $("toastStack"),
  };

  /* ---------------- Helpers ---------------- */

  const pool = () => POOLS[state.poolId];
  const lock = () => LOCKS[state.lock];

  const fmt = (n, dp = 4) =>
    n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

  const fmtUsd = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const parseAmount = () => {
    const v = parseFloat(el.amountInput.value.replace(/,/g, ""));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const randHash = () => {
    const hex = "0123456789abcdef";
    const part = (n) =>
      Array.from({ length: n }, () => hex[(Math.random() * 16) | 0]).join("");
    return `0x${part(4)}…${part(4)}`;
  };

  function toast(msg, type = "") {
    const t = document.createElement("div");
    t.className = `toast${type ? " " + type : ""}`;
    t.textContent = msg;
    el.toastStack.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      t.addEventListener("animationend", () => t.remove(), { once: true });
    }, 3400);
  }

  /* ---------------- Rewards ticker ---------------- */

  // rewards per second for the existing staked position
  const rewardRate = () =>
    (pool().staked * (pool().apr / 100) * state.userLockMult) / (365 * 24 * 3600);

  let lastTick = performance.now();

  function tick(now) {
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    state.pending += rewardRate() * dt;
    el.pendingRewards.textContent = fmt(state.pending, 6);
    el.pendingUsd.textContent = fmtUsd(state.pending * pool().price);
    const claimable = state.pending >= 0.000001;
    if (el.claimBtn.disabled === claimable) el.claimBtn.disabled = !claimable;
    requestAnimationFrame(tick);
  }

  /* ---------------- Renderers ---------------- */

  function renderPosition() {
    const p = pool();
    el.stakedBalance.textContent = `${fmt(p.staked)} ${p.symbol}`;
    el.walletBalance.textContent = `${fmt(p.wallet)} ${p.symbol}`;
    el.claimBtn.disabled = state.pending < 0.000001;
  }

  function renderHero() {
    const p = pool();
    el.heroTitle.textContent = p.title;
    document.querySelector(".hero-sub").textContent = p.sub;
    el.heroApr.textContent = p.apr.toFixed(2) + "%";
    el.heroTvl.textContent = p.tvl;
    el.tvlNote.textContent = p.tvlNote;
    el.stakersStat.textContent = p.stakers;
    el.rewardStatValue.textContent = p.symbol;
    el.rewardStatNote.textContent = p.contract;
    el.heroLogo.className = `token-logo ${p.logo}`;
    el.heroLogo.textContent = p.letter;
    el.inputLogo.className = `token-logo ${p.logo} sm`;
    el.inputLogo.textContent = p.letter;
    el.feeNote.textContent = `Network fee ≈ 0.0012 LUM · slippage n/a · pool ${p.contract}`;
  }

  function renderHeroAprNote() {
    const l = lock();
    el.heroAprNote.textContent = `${l.label} · ${l.mult.toFixed(2)}× boost`;
  }

  function available() {
    return state.mode === "stake" ? pool().wallet : pool().staked;
  }

  function renderModeLabels() {
    const p = pool();
    const staking = state.mode === "stake";
    el.amountLabel.textContent = staking ? "Amount to stake" : "Amount to unstake";
    el.availLabel.textContent = `${fmt(available(), 2)} ${p.symbol}`;
    el.lockSelect.hidden = !staking;
    el.tabStake.classList.toggle("is-active", staking);
    el.tabStake.setAttribute("aria-selected", String(staking));
    el.tabUnstake.classList.toggle("is-active", !staking);
    el.tabUnstake.setAttribute("aria-selected", String(!staking));
  }

  function unlockDate() {
    const days = lock().days;
    if (!days) return "Anytime";
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function renderProjection() {
    const p = pool();
    const amount = parseAmount();
    const l = lock();
    const effApr = p.apr * l.mult;
    const horizonDays = l.days || 365;
    const daily = (amount * (effApr / 100)) / 365;
    const total = daily * horizonDays;

    el.amountUsd.textContent = fmtUsd(amount * p.price);
    el.projApr.textContent = effApr.toFixed(2) + "%";
    el.projDaily.textContent = `${fmt(daily)} ${p.symbol}`;
    el.projHorizonLabel.textContent =
      `Projected · ${l.days ? l.label : "1 year"}`;
    el.projTotal.firstChild.textContent = `${fmt(total)} ${p.symbol} `;
    el.projTotalUsd.textContent = `(${fmtUsd(total * p.price)})`;
    el.projUnlock.textContent = state.mode === "stake" ? unlockDate() : "Now";
    el.lockWarning.hidden = !(state.mode === "stake" && l.days > 0 && amount > 0);
  }

  function renderActionBtn() {
    const p = pool();
    const amount = parseAmount();
    const max = available();
    const verb = state.mode === "stake" ? "Stake" : "Unstake";

    if (amount <= 0) {
      el.actionBtn.disabled = true;
      el.actionBtn.textContent = "Enter an amount";
    } else if (amount > max) {
      el.actionBtn.disabled = true;
      el.actionBtn.textContent =
        state.mode === "stake" ? "Insufficient balance" : "Exceeds staked amount";
    } else {
      el.actionBtn.disabled = false;
      el.actionBtn.textContent = `${verb} ${fmt(amount, 2)} ${p.symbol}`;
    }
  }

  function renderAll() {
    renderHero();
    renderHeroAprNote();
    renderPosition();
    renderModeLabels();
    renderProjection();
    renderActionBtn();
  }

  /* ---------------- Tabs ---------------- */

  el.tabStake.addEventListener("click", () => {
    state.mode = "stake";
    el.amountInput.value = "";
    renderModeLabels();
    renderProjection();
    renderActionBtn();
  });

  el.tabUnstake.addEventListener("click", () => {
    state.mode = "unstake";
    el.amountInput.value = "";
    renderModeLabels();
    renderProjection();
    renderActionBtn();
  });

  /* ---------------- Amount input ---------------- */

  el.amountInput.addEventListener("input", () => {
    // keep digits and a single decimal point
    let v = el.amountInput.value.replace(/[^0-9.]/g, "");
    const i = v.indexOf(".");
    if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, "");
    if (v !== el.amountInput.value) el.amountInput.value = v;
    renderProjection();
    renderActionBtn();
  });

  el.maxBtn.addEventListener("click", () => {
    el.amountInput.value = String(available());
    el.amountInput.focus();
    renderProjection();
    renderActionBtn();
  });

  /* ---------------- Lock period ---------------- */

  el.lockOpts.forEach((opt) => {
    opt.addEventListener("click", () => {
      state.lock = opt.dataset.lock;
      el.lockOpts.forEach((o) => {
        const active = o === opt;
        o.classList.toggle("is-active", active);
        o.setAttribute("aria-checked", String(active));
      });
      renderHeroAprNote();
      renderProjection();
      renderActionBtn();
    });
  });

  /* ---------------- Pool selection ---------------- */

  el.poolRows.forEach((row) => {
    row.addEventListener("click", () => {
      if (row.disabled || row.dataset.pool === state.poolId) return;
      state.poolId = row.dataset.pool;
      state.pending = pool().staked > 0 ? Math.random() * 0.4 : 0;
      el.poolRows.forEach((r) => {
        const active = r === row;
        r.classList.toggle("is-active", active);
        r.setAttribute("aria-pressed", String(active));
      });
      el.amountInput.value = "";
      renderAll();
      toast(`Switched to ${pool().symbol} pool`);
    });
  });

  /* ---------------- Modal flow ---------------- */

  let modalBusy = false;

  function openModal() {
    const p = pool();
    const l = lock();
    const amount = parseAmount();
    const staking = state.mode === "stake";

    el.modalTitle.textContent = staking ? "Confirm stake" : "Confirm unstake";
    el.mAction.textContent = staking ? "Stake" : "Unstake";
    el.mAmount.textContent = `${fmt(amount, 2)} ${p.symbol}`;
    el.mLock.textContent = staking ? l.label : "—";
    el.mApr.textContent = staking ? (p.apr * l.mult).toFixed(2) + "%" : p.apr.toFixed(2) + "%";
    el.mUnlock.textContent = staking ? unlockDate() : "Immediately";
    el.mRisk.textContent = staking
      ? l.days > 0
        ? `You are signing a simulated transaction. Tokens are locked until ${unlockDate()}. Early exit forfeits all accrued rewards.`
        : "You are signing a simulated transaction. Flexible positions can be unstaked anytime; rewards accrue every block."
      : "You are signing a simulated transaction. Unstaking claims pending rewards and returns tokens to your wallet.";

    el.modalConfirm.hidden = false;
    el.modalPending.hidden = true;
    el.modalSuccess.hidden = true;
    el.modalBackdrop.hidden = false;
    modalBusy = false;
    el.modalSign.focus();
  }

  function closeModal() {
    if (modalBusy) return;
    el.modalBackdrop.hidden = true;
    el.actionBtn.focus();
  }

  el.actionBtn.addEventListener("click", openModal);
  el.modalCancel.addEventListener("click", closeModal);
  el.modalBackdrop.addEventListener("click", (e) => {
    if (e.target === el.modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.modalBackdrop.hidden) closeModal();
  });

  el.modalSign.addEventListener("click", () => {
    const p = pool();
    const amount = parseAmount();
    const staking = state.mode === "stake";
    const hash = randHash();

    modalBusy = true;
    el.modalConfirm.hidden = true;
    el.modalPending.hidden = false;
    el.pendingHash.textContent = `tx ${hash}`;

    setTimeout(() => {
      // settle the simulated transaction
      if (staking) {
        p.wallet -= amount;
        p.staked += amount;
        state.userLockMult = lock().mult;
      } else {
        p.staked -= amount;
        p.wallet += amount + state.pending; // unstake auto-claims
        if (state.pending > 0.000001) {
          toast(`Claimed ${fmt(state.pending, 4)} ${p.symbol} with unstake`);
        }
        state.pending = 0;
        if (p.staked <= 0) state.userLockMult = 1;
      }

      const block = (18204560 + ((Math.random() * 900) | 0)).toLocaleString("en-US");
      el.successTitle.textContent = staking ? "Staked successfully" : "Unstaked successfully";
      el.successHash.textContent = `tx ${hash} · block ${block}`;
      el.modalPending.hidden = true;
      el.modalSuccess.hidden = false;
      modalBusy = false;
      el.modalDone.focus();

      el.amountInput.value = "";
      renderPosition();
      renderModeLabels();
      renderProjection();
      renderActionBtn();
      toast(
        staking
          ? `Staked ${fmt(amount, 2)} ${p.symbol} · ${lock().label}`
          : `Unstaked ${fmt(amount, 2)} ${p.symbol}`
      );
    }, 1600);
  });

  el.modalDone.addEventListener("click", closeModal);

  /* ---------------- Claim ---------------- */

  el.claimBtn.addEventListener("click", () => {
    if (state.pending < 0.000001 || el.claimBtn.classList.contains("is-claiming")) {
      if (state.pending < 0.000001) toast("Nothing to claim yet", "warn");
      return;
    }
    const p = pool();
    const claimed = state.pending;
    el.claimBtn.classList.add("is-claiming");
    el.claimBtn.querySelector(".btn-claim-label").textContent = "Claiming…";

    setTimeout(() => {
      // fly-up amount animation from the rewards row
      const rect = el.pendingRewards.getBoundingClientRect();
      const fly = document.createElement("span");
      fly.className = "fly-amount";
      fly.textContent = `+${fmt(claimed, 4)} ${p.symbol}`;
      fly.style.left = `${rect.left}px`;
      fly.style.top = `${rect.top - 6}px`;
      document.body.appendChild(fly);
      fly.addEventListener("animationend", () => fly.remove(), { once: true });

      p.wallet += claimed;
      state.pending = 0;
      el.claimBtn.classList.remove("is-claiming");
      el.claimBtn.querySelector(".btn-claim-label").textContent = "Claim rewards";
      renderPosition();
      renderModeLabels();
      toast(`Claimed ${fmt(claimed, 4)} ${p.symbol} · tx ${randHash()}`);
    }, 1200);
  });

  /* ---------------- Misc ---------------- */

  el.walletBtn = $("walletBtn");
  el.walletBtn.addEventListener("click", () => {
    toast("Wallet 0x7a3f…c41d copied (simulated)");
  });

  /* ---------------- Init ---------------- */

  renderAll();
  requestAnimationFrame((t) => {
    lastTick = t;
    requestAnimationFrame(tick);
  });
})();
