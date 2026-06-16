/* Web3 — Liquidity Pool / Provide LP (UI simulation, mock data only) */
(() => {
  "use strict";

  // ---------- Mock pool data ----------
  const ETH_PRICE = 2584.3; // USDC per ETH (mock pool price)

  const TIERS = {
    "0.0005": { label: "0.05%", tvl: 3_860_000, vol24h: 4_200_000, lpSupply: 31_000 },
    "0.003": { label: "0.30%", tvl: 48_200_000, vol24h: 9_700_000, lpSupply: 377_200 },
    "0.01": { label: "1.00%", tvl: 2_760_000, vol24h: 410_000, lpSupply: 22_400 },
  };

  const wallet = { eth: 4.2618, usdc: 12_840.55 };
  const position = { eth: 1.672, usdc: 4_320.97, lp: 42.25, feesLifetime: 127.66, unclaimed: 31.92 };

  let currentFee = "0.003";
  let removePct = 25;
  let modalMode = "add"; // "add" | "remove"
  let pendingTimer = null;

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);

  const els = {
    feePill: $("head-fee-pill"),
    statTvl: $("stat-tvl"),
    statVol: $("stat-vol"),
    statFees: $("stat-fees"),
    statPrice: $("stat-price"),
    tabs: document.querySelector(".tabs"),
    tabAdd: $("tab-add"),
    tabRemove: $("tab-remove"),
    paneAdd: $("pane-add"),
    paneRemove: $("pane-remove"),
    amtEth: $("amount-eth"),
    amtUsdc: $("amount-usdc"),
    usdEth: $("usd-eth"),
    usdUsdc: $("usd-usdc"),
    balEth: $("bal-eth"),
    balUsdc: $("bal-usdc"),
    estShare: $("est-share"),
    estLp: $("est-lp"),
    estApr: $("est-apr"),
    btnAdd: $("btn-add"),
    removeSlider: $("remove-slider"),
    removePctEl: $("remove-pct"),
    rmEth: $("rm-eth"),
    rmUsdc: $("rm-usdc"),
    rmLp: $("rm-lp"),
    btnRemove: $("btn-remove"),
    posValue: $("pos-value"),
    posEth: $("pos-eth"),
    posEthUsd: $("pos-eth-usd"),
    posUsdc: $("pos-usdc"),
    posUsdcUsd: $("pos-usdc-usd"),
    posLp: $("pos-lp"),
    posShare: $("pos-share"),
    posFees: $("pos-fees"),
    posApr: $("pos-apr"),
    aprBarFill: document.querySelector(".apr-bar-fill"),
    modal: $("modal"),
    stepConfirm: $("modal-confirm"),
    stepPending: $("modal-pending"),
    stepSuccess: $("modal-success"),
    modalTitle: $("modal-title"),
    cfEth: $("cf-eth"),
    cfUsdc: $("cf-usdc"),
    cfFee: $("cf-fee"),
    cfShare: $("cf-share"),
    cfLp: $("cf-lp"),
    btnCancel: $("btn-cancel"),
    btnConfirm: $("btn-confirm"),
    btnDone: $("btn-done"),
    pendingTitle: document.querySelector("#modal-pending h3"),
    pendingHash: $("tx-hash"),
    successTitle: document.querySelector("#modal-success h3"),
    successHash: document.querySelector("#modal-success .tx-hash"),
    toastZone: $("toast-zone"),
  };

  // ---------- Helpers ----------
  const fmt = (n, dp = 4) =>
    n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

  const fmtUsd = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtCompact = (n) => {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return fmtUsd(n);
  };

  const parseAmt = (str) => {
    const n = parseFloat(String(str).replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const sanitize = (input) => {
    let v = input.value.replace(/[^0-9.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    }
    if (v !== input.value) input.value = v;
    return v;
  };

  const feeApr = (key) => {
    const t = TIERS[key];
    return ((t.vol24h * parseFloat(key) * 365) / t.tvl) * 100;
  };

  const randHash = () => {
    const hex = "0123456789abcdef";
    const part = (len) =>
      Array.from({ length: len }, () => hex[(Math.random() * 16) | 0]).join("");
    return `0x${part(4)}…${part(4)}`;
  };

  // Count-up animation for stat values
  const animateValue = (el, to, formatter, dur = 600) => {
    const from = parseFloat(el.dataset.raw ?? to) || 0;
    el.dataset.raw = String(to);
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = formatter(from + (to - from) * ease(p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  };

  // ---------- Toast ----------
  function toast(msg, type = "ok") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.role = "status";
    el.textContent = msg;
    els.toastZone.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3400);
  }

  // ---------- Renderers ----------
  function renderBalances() {
    els.balEth.textContent = fmt(wallet.eth, 4);
    els.balUsdc.textContent = fmt(wallet.usdc, 2);
  }

  function renderPoolStats(animated = true) {
    const t = TIERS[currentFee];
    const fees = t.vol24h * parseFloat(currentFee);
    if (animated) {
      animateValue(els.statTvl, t.tvl, fmtCompact);
      animateValue(els.statVol, t.vol24h, fmtCompact);
      animateValue(els.statFees, fees, fmtCompact);
    } else {
      els.statTvl.textContent = fmtCompact(t.tvl);
      els.statVol.textContent = fmtCompact(t.vol24h);
      els.statFees.textContent = fmtCompact(fees);
      els.statTvl.dataset.raw = String(t.tvl);
      els.statVol.dataset.raw = String(t.vol24h);
      els.statFees.dataset.raw = String(fees);
    }
    els.statPrice.textContent = `${fmt(ETH_PRICE, 2)} USDC`;
    els.feePill.textContent = `${TIERS[currentFee].label} fee`;

    const apr = feeApr(currentFee);
    els.estApr.textContent = apr.toFixed(1) + "%";
    els.posApr.textContent = apr.toFixed(1) + "%";
    els.aprBarFill.style.width = Math.min(100, (apr / 35) * 100).toFixed(0) + "%";
  }

  function renderPosition() {
    const ethUsd = position.eth * ETH_PRICE;
    const total = ethUsd + position.usdc;
    els.posValue.textContent = fmtUsd(total);
    els.posEth.textContent = fmt(position.eth, 4);
    els.posEthUsd.textContent = fmtUsd(ethUsd);
    els.posUsdc.textContent = fmt(position.usdc, 2);
    els.posUsdcUsd.textContent = fmtUsd(position.usdc);
    els.posLp.textContent = `${fmt(position.lp, 4)} LUM-LP`;
    els.posShare.textContent =
      ((position.lp / TIERS["0.003"].lpSupply) * 100).toFixed(4) + "%";
    els.posFees.textContent = fmtUsd(position.feesLifetime);
  }

  function renderEstimates() {
    const eth = parseAmt(els.amtEth.value);
    const usdc = parseAmt(els.amtUsdc.value);
    const t = TIERS[currentFee];

    els.usdEth.textContent = "≈ " + fmtUsd(eth * ETH_PRICE);
    els.usdUsdc.textContent = "≈ " + fmtUsd(usdc);

    const depositUsd = eth * ETH_PRICE + usdc;
    const share = depositUsd > 0 ? (depositUsd / (t.tvl + depositUsd)) * 100 : 0;
    const lpMinted = (depositUsd / t.tvl) * t.lpSupply;

    els.estShare.textContent = share.toFixed(4) + "%";
    els.estLp.textContent = `${fmt(lpMinted, 4)} LUM-LP`;

    // CTA state
    if (depositUsd <= 0) {
      els.btnAdd.disabled = true;
      els.btnAdd.textContent = "Enter an amount";
    } else if (eth > wallet.eth) {
      els.btnAdd.disabled = true;
      els.btnAdd.textContent = "Insufficient ETH balance";
    } else if (usdc > wallet.usdc) {
      els.btnAdd.disabled = true;
      els.btnAdd.textContent = "Insufficient USDC balance";
    } else {
      els.btnAdd.disabled = false;
      els.btnAdd.textContent = "Add liquidity";
    }
  }

  function renderRemove() {
    const pct = removePct;
    els.removePctEl.textContent = pct + "%";
    els.removeSlider.value = String(pct);
    els.removeSlider.style.setProperty("--p", pct + "%");

    document.querySelectorAll(".pct-presets button").forEach((b) => {
      b.classList.toggle("is-active", Number(b.dataset.pct) === pct);
    });

    els.rmEth.textContent = fmt(position.eth * (pct / 100), 4);
    els.rmUsdc.textContent = fmt(position.usdc * (pct / 100), 2);
    els.rmLp.textContent = `${fmt(position.lp * (pct / 100), 4)} LUM-LP`;

    els.btnRemove.disabled = pct === 0 || position.lp <= 0;
    els.btnRemove.textContent =
      position.lp <= 0 ? "No position to remove" : `Remove ${pct}% liquidity`;
  }

  // ---------- Tabs ----------
  function setTab(which) {
    const isAdd = which === "add";
    els.tabAdd.classList.toggle("is-active", isAdd);
    els.tabRemove.classList.toggle("is-active", !isAdd);
    els.tabAdd.setAttribute("aria-selected", String(isAdd));
    els.tabRemove.setAttribute("aria-selected", String(!isAdd));
    els.paneAdd.hidden = !isAdd;
    els.paneRemove.hidden = isAdd;
    els.tabs.classList.toggle("remove-active", !isAdd);
  }

  els.tabAdd.addEventListener("click", () => setTab("add"));
  els.tabRemove.addEventListener("click", () => setTab("remove"));

  // ---------- Ratio-linked inputs ----------
  els.amtEth.addEventListener("input", () => {
    const v = sanitize(els.amtEth);
    const eth = parseAmt(v);
    els.amtUsdc.value = eth > 0 ? (eth * ETH_PRICE).toFixed(2) : "";
    renderEstimates();
  });

  els.amtUsdc.addEventListener("input", () => {
    const v = sanitize(els.amtUsdc);
    const usdc = parseAmt(v);
    els.amtEth.value = usdc > 0 ? (usdc / ETH_PRICE).toFixed(6) : "";
    renderEstimates();
  });

  document.querySelectorAll(".max-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.max === "eth") {
        els.amtEth.value = String(wallet.eth);
        els.amtEth.dispatchEvent(new Event("input"));
      } else {
        els.amtUsdc.value = wallet.usdc.toFixed(2);
        els.amtUsdc.dispatchEvent(new Event("input"));
      }
    });
  });

  // ---------- Fee tier ----------
  document.querySelectorAll('input[name="fee"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      currentFee = radio.value;
      renderPoolStats(true);
      renderEstimates();
      toast(`Switched to the ${TIERS[currentFee].label} fee tier`, "ok");
    });
  });

  // ---------- Remove slider + presets ----------
  els.removeSlider.addEventListener("input", () => {
    removePct = Number(els.removeSlider.value);
    renderRemove();
  });

  document.querySelectorAll(".pct-presets button").forEach((btn) => {
    btn.addEventListener("click", () => {
      removePct = Number(btn.dataset.pct);
      renderRemove();
    });
  });

  // ---------- Modal flow ----------
  function showStep(step) {
    els.stepConfirm.hidden = step !== "confirm";
    els.stepPending.hidden = step !== "pending";
    els.stepSuccess.hidden = step !== "success";
  }

  function openModal(mode) {
    modalMode = mode;
    const t = TIERS[currentFee];

    if (mode === "add") {
      const eth = parseAmt(els.amtEth.value);
      const usdc = parseAmt(els.amtUsdc.value);
      const depositUsd = eth * ETH_PRICE + usdc;
      els.modalTitle.textContent = "Confirm add liquidity";
      els.cfEth.textContent = fmt(eth, 4);
      els.cfUsdc.textContent = fmt(usdc, 2);
      els.cfShare.textContent = ((depositUsd / (t.tvl + depositUsd)) * 100).toFixed(4) + "%";
      els.cfLp.textContent = `${fmt((depositUsd / t.tvl) * t.lpSupply, 4)} LUM-LP`;
      els.btnConfirm.textContent = "Sign & supply";
      els.pendingTitle.textContent = "Supplying liquidity…";
      els.successTitle.textContent = "Liquidity added";
    } else {
      els.modalTitle.textContent = "Confirm remove liquidity";
      els.cfEth.textContent = fmt(position.eth * (removePct / 100), 4);
      els.cfUsdc.textContent = fmt(position.usdc * (removePct / 100), 2);
      els.cfShare.textContent = removePct + "% of position";
      els.cfLp.textContent = `${fmt(position.lp * (removePct / 100), 4)} LUM-LP burned`;
      els.btnConfirm.textContent = "Sign & remove";
      els.pendingTitle.textContent = "Removing liquidity…";
      els.successTitle.textContent = "Liquidity removed";
    }
    els.cfFee.textContent = TIERS[currentFee].label;
    showStep("confirm");
    els.modal.hidden = false;
    els.btnConfirm.focus();
  }

  function closeModal() {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    els.modal.hidden = true;
  }

  els.btnAdd.addEventListener("click", () => openModal("add"));
  els.btnRemove.addEventListener("click", () => openModal("remove"));
  els.btnCancel.addEventListener("click", closeModal);

  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modal.hidden) closeModal();
  });

  els.btnConfirm.addEventListener("click", () => {
    const hash = randHash();
    const block = (18_442_900 + ((Math.random() * 40) | 0)).toLocaleString("en-US");
    els.pendingHash.textContent = hash;
    els.successHash.textContent = `${hash} · block ${block}`;
    showStep("pending");
    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      showStep("success");
    }, 1600);
  });

  els.btnDone.addEventListener("click", () => {
    const t = TIERS[currentFee];

    if (modalMode === "add") {
      const eth = parseAmt(els.amtEth.value);
      const usdc = parseAmt(els.amtUsdc.value);
      const depositUsd = eth * ETH_PRICE + usdc;
      wallet.eth = Math.max(0, wallet.eth - eth);
      wallet.usdc = Math.max(0, wallet.usdc - usdc);
      position.eth += eth;
      position.usdc += usdc;
      position.lp += (depositUsd / t.tvl) * t.lpSupply;
      els.amtEth.value = "";
      els.amtUsdc.value = "";
      toast(`Added ${fmt(eth, 4)} ETH + ${fmt(usdc, 2)} USDC to the pool`, "ok");
    } else {
      const f = removePct / 100;
      const ethOut = position.eth * f;
      const usdcOut = position.usdc * f;
      wallet.eth += ethOut;
      wallet.usdc += usdcOut + position.unclaimed;
      position.feesLifetime += position.unclaimed;
      position.unclaimed = 0;
      position.eth -= ethOut;
      position.usdc -= usdcOut;
      position.lp -= position.lp * f;
      toast(`Removed ${removePct}% — received ${fmt(ethOut, 4)} ETH + ${fmt(usdcOut, 2)} USDC`, "ok");
    }

    closeModal();
    renderBalances();
    renderPosition();
    renderEstimates();
    renderRemove();
  });

  // ---------- Init ----------
  renderBalances();
  renderPoolStats(false);
  renderPosition();
  renderEstimates();
  renderRemove();
})();
