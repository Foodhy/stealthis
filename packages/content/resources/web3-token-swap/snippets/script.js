(() => {
  "use strict";

  /* ---------- Mock token universe (fictional) ---------- */
  const TOKENS = {
    ETH:  { sym: "ETH",  name: "Ether",          addr: "native",                usd: 2806.40, bal: 2.481,     ico: "Ξ" },
    USDC: { sym: "USDC", name: "USD Coin",        addr: "0x7a3f8e21d4b6c0f29ac5d3e1b8f47a902c41d", usd: 1.0,    bal: 1204.07, ico: "$" },
    DAI:  { sym: "DAI",  name: "Dai Stablecoin",  addr: "0x1b9c44ef02a7d8c61f350be9a4d77c0e8821aab3", usd: 0.999, bal: 318.5, ico: "◈" },
    NOVA: { sym: "NOVA", name: "Nova Protocol",   addr: "0x5e1d77a3c92f04b8e6a1d0c4f9382bb71ce04f12", usd: 4.182, bal: 940.6,  ico: "N" },
    LUM:  { sym: "LUM",  name: "Lumen",           addr: "0x9f02a7e4b13d8c50fa6e29c1d7480bb35ae71d09", usd: 0.6471, bal: 5210.0, ico: "L" },
    WBTC: { sym: "WBTC", name: "Wrapped Bitcoin", addr: "0x3c8a91f0e25d7b46ac1f93d508e2c7710bba49ef", usd: 64210.0, bal: 0.0418, ico: "₿" },
    ARC:  { sym: "ARC",  name: "Arcane Finance",  addr: "0x2d70b81e94c3a5f08de1273c6f9920ab41ce8870", usd: 0.0928, bal: 12500.0, ico: "A" },
    GLOW: { sym: "GLOW", name: "Glowstone",       addr: "0x8b14c0a72fd9e3650bc1a8f47d92301eea5c7b6f", usd: 12.74, bal: 76.2,    ico: "G" },
  };
  const ORDER = ["ETH", "USDC", "NOVA", "LUM", "WBTC", "DAI", "ARC", "GLOW"];
  const COMMON = ["ETH", "USDC", "NOVA", "LUM", "WBTC"];

  let fromSym = "ETH";
  let toSym = "USDC";
  let slippage = 0.5;
  let lastEdited = "from"; // which side the user typed in
  let pickTarget = null; // "from" | "to" while modal open

  const $ = (id) => document.getElementById(id);

  /* ---------- Formatting helpers ---------- */
  const fmt = (n, max = 6) => {
    if (!isFinite(n)) return "0";
    if (n === 0) return "0";
    const abs = Math.abs(n);
    const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : max;
    return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
  };
  const fmtUsd = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parse = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const rate = (a, b) => TOKENS[a].usd / TOKENS[b].usd; // 1 a = rate b

  /* ---------- Toast ---------- */
  function toast(msg, kind = "") {
    const stack = $("toastStack");
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.lastElementChild.innerHTML = msg;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3200);
  }

  /* ---------- Token button rendering ---------- */
  function paintTokenBtn(side) {
    const t = TOKENS[side === "from" ? fromSym : toSym];
    const btn = $(side + "Token");
    btn.querySelector(".t-ico").textContent = t.ico;
    btn.querySelector(".t-ico").dataset.sym = t.sym;
    btn.querySelector(".t-sym").textContent = t.sym;
  }

  /* ---------- Core recompute ---------- */
  function recompute() {
    const fromT = TOKENS[fromSym];
    const toT = TOKENS[toSym];
    const fromIn = $("fromAmount");
    const toIn = $("toAmount");

    // balances
    $("fromBal").textContent = fmt(fromT.bal);
    $("toBal").textContent = fmt(toT.bal);

    const r = rate(fromSym, toSym);

    let fromAmt = parse(fromIn.value);
    let toAmt = parse(toIn.value);

    if (lastEdited === "from") {
      toAmt = fromAmt * r;
      if (fromIn.value.trim() === "") toIn.value = "";
      else toIn.value = toAmt > 0 ? toAmt.toLocaleString("en-US", { maximumFractionDigits: toT.usd >= 100 ? 6 : 4, useGrouping: false }) : "";
    } else {
      fromAmt = toAmt / r;
      if (toIn.value.trim() === "") fromIn.value = "";
      else fromIn.value = fromAmt > 0 ? fromAmt.toLocaleString("en-US", { maximumFractionDigits: 6, useGrouping: false }) : "";
    }

    // fiat estimates
    $("fromFiat").textContent = fmtUsd(fromAmt * fromT.usd);
    $("toFiat").textContent = fmtUsd(toAmt * toT.usd);

    // rate line
    $("rateText").textContent = `1 ${fromSym} = ${fmt(r)} ${toSym}`;

    // price impact: mock — scale gently with trade size in USD
    const usdSize = fromAmt * fromT.usd;
    let impactPct = Math.min(usdSize / 250000 * 1.4, 9.5); // up to ~9.5%
    const impactEl = $("impact");
    if (fromAmt <= 0) {
      impactEl.textContent = "<0.01%";
      impactEl.className = "mono pos";
    } else {
      impactEl.textContent = (impactPct < 0.01 ? "<0.01" : "-" + impactPct.toFixed(2)) + "%";
      impactEl.className = "mono " + (impactPct >= 3 ? "neg" : impactPct >= 1 ? "warn" : "pos");
    }

    // min received with slippage + impact
    const effective = toAmt * (1 - slippage / 100) * (1 - impactPct / 100);
    $("minRecv").textContent = fmt(effective) + " " + toSym;
    $("slipNote").textContent = `(${slippage}% slippage)`;

    // network fee (mock, denominated in ETH-like gas)
    const gasEth = 0.0012;
    $("netFee").textContent = `~${gasEth} ${fromSym === "ETH" ? "ETH" : "LUM"} ($${(gasEth * TOKENS.ETH.usd).toFixed(2)})`;

    // route hops
    const path = $("routePath");
    path.querySelectorAll(".hop")[0].innerHTML = `<span class="hop-ico">${fromT.ico}</span>${fromSym}`;
    path.querySelectorAll(".hop")[1].innerHTML = `<span class="hop-ico">${toT.ico}</span>${toSym}`;

    // details visibility
    $("details").hidden = !(fromAmt > 0 || toAmt > 0);

    updateCta(fromAmt, toAmt, impactPct);
    return { fromAmt, toAmt, r, impactPct, effective };
  }

  function updateCta(fromAmt, toAmt, impactPct) {
    const cta = $("swapCta");
    cta.classList.remove("danger");
    if (fromSym === toSym) {
      cta.disabled = true;
      cta.textContent = "Select different tokens";
    } else if (fromAmt <= 0) {
      cta.disabled = true;
      cta.textContent = "Enter an amount";
    } else if (fromAmt > TOKENS[fromSym].bal) {
      cta.disabled = true;
      cta.textContent = `Insufficient ${fromSym} balance`;
    } else if (impactPct >= 5) {
      cta.disabled = false;
      cta.classList.add("danger");
      cta.textContent = `Swap anyway (−${impactPct.toFixed(1)}% impact)`;
    } else {
      cta.disabled = false;
      cta.textContent = "Swap";
    }
  }

  /* ---------- Amount input handlers ---------- */
  function sanitize(el) {
    el.value = el.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  }
  $("fromAmount").addEventListener("input", (e) => {
    sanitize(e.target);
    lastEdited = "from";
    recompute();
  });
  $("toAmount").addEventListener("input", (e) => {
    sanitize(e.target);
    lastEdited = "to";
    recompute();
  });

  /* ---------- MAX ---------- */
  $("maxBtn").addEventListener("click", () => {
    const bal = TOKENS[fromSym].bal;
    // leave a little for gas if native
    const usable = fromSym === "ETH" ? Math.max(bal - 0.001, 0) : bal;
    $("fromAmount").value = usable.toLocaleString("en-US", { maximumFractionDigits: 6, useGrouping: false });
    lastEdited = "from";
    recompute();
    toast(`Max <b>${fmt(usable)} ${fromSym}</b> set`);
  });

  /* ---------- Flip ---------- */
  $("flipBtn").addEventListener("click", () => {
    [fromSym, toSym] = [toSym, fromSym];
    // move the typed amount to keep "you pay" intuitive: swap the values too
    const fa = $("fromAmount").value;
    $("fromAmount").value = $("toAmount").value;
    $("toAmount").value = fa;
    lastEdited = "from";
    $("flipBtn").classList.toggle("flipped");
    paintTokenBtn("from");
    paintTokenBtn("to");
    recompute();
    toast(`Now swapping <b>${fromSym} → ${toSym}</b>`);
  });

  $("refreshBtn").addEventListener("click", (e) => {
    const b = e.currentTarget;
    b.classList.remove("spin");
    void b.offsetWidth;
    b.classList.add("spin");
    recompute();
    toast("Rates refreshed", "ok");
  });

  /* ---------- Rate line expand ---------- */
  $("rateLine").addEventListener("click", () => {
    const line = $("rateLine");
    const body = $("detailBody");
    const open = line.getAttribute("aria-expanded") === "true";
    line.setAttribute("aria-expanded", String(!open));
    body.hidden = open;
  });

  /* ---------- Slippage popover ---------- */
  const slipPop = $("slipPop");
  function openSlip() {
    slipPop.hidden = false;
    $("slipBtn").setAttribute("aria-expanded", "true");
    document.addEventListener("click", outsideSlip, true);
  }
  function closeSlip() {
    slipPop.hidden = true;
    $("slipBtn").setAttribute("aria-expanded", "false");
    document.removeEventListener("click", outsideSlip, true);
  }
  function outsideSlip(e) {
    if (!slipPop.contains(e.target) && e.target !== $("slipBtn") && !$("slipBtn").contains(e.target)) closeSlip();
  }
  $("slipBtn").addEventListener("click", () => (slipPop.hidden ? openSlip() : closeSlip()));

  function applySlip(val, fromCustom) {
    slippage = val;
    document.querySelectorAll(".slip-opt").forEach((b) => {
      b.classList.toggle("is-active", !fromCustom && parseFloat(b.dataset.slip) === val);
    });
    if (!fromCustom) $("slipCustom").value = "";
    $("slipWarn").hidden = val < 5;
    recompute();
  }
  $("slipGrid").addEventListener("click", (e) => {
    const opt = e.target.closest(".slip-opt");
    if (!opt) return;
    applySlip(parseFloat(opt.dataset.slip), false);
  });
  $("slipCustom").addEventListener("input", (e) => {
    const v = parse(e.target.value);
    if (v > 0) {
      document.querySelectorAll(".slip-opt").forEach((b) => b.classList.remove("is-active"));
      applySlip(Math.min(v, 50), true);
    }
  });

  /* ---------- Token select modal ---------- */
  const tokenScrim = $("tokenScrim");

  function renderCommon() {
    const wrap = $("commonTokens");
    wrap.innerHTML = "";
    COMMON.forEach((sym) => {
      const t = TOKENS[sym];
      const chip = document.createElement("button");
      chip.className = "common-chip";
      chip.type = "button";
      chip.innerHTML = `<span class="t-ico" data-sym="${sym}">${t.ico}</span>${sym}`;
      chip.addEventListener("click", () => choose(sym));
      wrap.appendChild(chip);
    });
  }

  function renderList(q = "") {
    const list = $("tokenList");
    const query = q.trim().toLowerCase();
    list.innerHTML = "";
    let shown = 0;
    ORDER.forEach((sym) => {
      const t = TOKENS[sym];
      const hay = (t.sym + " " + t.name + " " + t.addr).toLowerCase();
      if (query && !hay.includes(query)) return;
      shown++;
      const other = pickTarget === "from" ? toSym : fromSym;
      const isCurrent = (pickTarget === "from" ? fromSym : toSym) === sym;
      const disabled = sym === other;
      const li = document.createElement("li");
      const row = document.createElement("button");
      row.className = "token-row";
      row.type = "button";
      row.setAttribute("role", "option");
      if (disabled) row.setAttribute("aria-disabled", "true");
      const shortAddr = t.addr === "native" ? "Native asset" : t.addr.slice(0, 6) + "…" + t.addr.slice(-4);
      row.innerHTML = `
        <span class="t-ico" data-sym="${sym}">${t.ico}</span>
        <span class="tr-main">
          <span class="tr-sym">${sym}${isCurrent ? '<span class="tr-current">SELECTED</span>' : ""}</span>
          <span class="tr-name">${t.name} · <span class="tr-addr">${shortAddr}</span></span>
        </span>
        <span class="tr-right">
          <div class="tr-bal">${fmt(t.bal)}</div>
          <div class="tr-fiat">${fmtUsd(t.bal * t.usd)}</div>
        </span>`;
      if (!disabled) row.addEventListener("click", () => choose(sym));
      else row.title = "Already selected on the other side";
      li.appendChild(row);
      list.appendChild(li);
    });
    $("tokenEmpty").hidden = shown !== 0;
  }

  function openTokenModal(target) {
    pickTarget = target;
    renderCommon();
    renderList("");
    $("tokenSearch").value = "";
    tokenScrim.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("tokenSearch").focus(), 30);
  }
  function closeTokenModal() {
    tokenScrim.hidden = true;
    document.body.style.overflow = "";
    pickTarget = null;
  }
  function choose(sym) {
    if (pickTarget === "from") {
      if (sym === toSym) toSym = fromSym; // auto-swap to avoid collision
      fromSym = sym;
    } else {
      if (sym === fromSym) fromSym = toSym;
      toSym = sym;
    }
    paintTokenBtn("from");
    paintTokenBtn("to");
    closeTokenModal();
    recompute();
    toast(`Selected <b>${sym}</b>`);
  }

  $("fromToken").addEventListener("click", () => openTokenModal("from"));
  $("toToken").addEventListener("click", () => openTokenModal("to"));
  $("tokenClose").addEventListener("click", closeTokenModal);
  $("tokenSearch").addEventListener("input", (e) => renderList(e.target.value));
  tokenScrim.addEventListener("click", (e) => {
    if (e.target === tokenScrim) closeTokenModal();
  });

  /* ---------- Confirm flow ---------- */
  const confirmScrim = $("confirmScrim");
  let pending = null;

  $("swapCta").addEventListener("click", () => {
    const data = recompute();
    if ($("swapCta").disabled) return;
    pending = data;
    const fromT = TOKENS[fromSym];
    const toT = TOKENS[toSym];

    $("cFrom").textContent = `${fmt(data.fromAmt)} ${fromSym}`;
    $("cTo").textContent = `${fmt(data.toAmt)} ${toSym}`;
    $("cRate").textContent = `1 ${fromSym} = ${fmt(data.r)} ${toSym}`;
    $("cMin").textContent = `${fmt(data.effective)} ${toSym}`;
    $("cImpact").textContent = data.impactPct < 0.01 ? "<0.01%" : "-" + data.impactPct.toFixed(2) + "%";
    $("cImpact").className = "mono " + (data.impactPct >= 3 ? "neg" : data.impactPct >= 1 ? "warn" : "pos");
    $("cFee").textContent = $("netFee").textContent;
    $("riskMin").textContent = `${fmt(data.effective)} ${toSym}`;

    const risk = $("riskNote");
    const cCta = $("confirmCta");
    if (data.impactPct >= 5) {
      risk.classList.add("danger");
      $("riskText").innerHTML = `High price impact of <b>-${data.impactPct.toFixed(2)}%</b>. You may lose a significant amount. Minimum received <b class="mono">${fmt(data.effective)} ${toSym}</b>.`;
      cCta.classList.add("danger");
      cCta.textContent = "Confirm high-impact swap";
    } else {
      risk.classList.remove("danger");
      $("riskText").innerHTML = `Output is estimated. You receive at least <b class="mono">${fmt(data.effective)} ${toSym}</b> or the transaction reverts.`;
      cCta.classList.remove("danger");
      cCta.textContent = "Confirm in wallet";
    }

    // reset status view
    $("confirmReview").hidden = false;
    $("confirmStatus").hidden = true;
    confirmScrim.hidden = false;
    document.body.style.overflow = "hidden";
  });

  function closeConfirm() {
    confirmScrim.hidden = true;
    document.body.style.overflow = "";
  }
  $("confirmClose").addEventListener("click", closeConfirm);
  confirmScrim.addEventListener("click", (e) => {
    if (e.target === confirmScrim) closeConfirm();
  });

  $("confirmCta").addEventListener("click", () => {
    $("confirmReview").hidden = true;
    $("confirmStatus").hidden = false;
    $("statusSpinner").hidden = false;
    $("statusCheck").hidden = true;
    $("statusHash").hidden = true;
    $("statusDone").hidden = true;
    $("statusTitle").textContent = "Confirm in your wallet";
    $("statusSub").textContent = "Waiting for signature…";

    // mock signature delay
    setTimeout(() => {
      $("statusTitle").textContent = "Swapping…";
      $("statusSub").textContent = "Transaction submitted to Lumen Chain";
      const hash = "0x" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6);
      $("statusHash").textContent = hash + " ↗";
      $("statusHash").hidden = false;
      toast(`Tx submitted <b>${hash}</b>`, "warn");
    }, 1400);

    // mock confirmation
    setTimeout(() => {
      $("statusSpinner").hidden = true;
      $("statusCheck").hidden = false;
      $("statusTitle").textContent = "Swap complete";
      $("statusSub").textContent = `Received ${fmt(pending.toAmt)} ${toSym}`;
      $("statusDone").hidden = false;

      // update mock balances
      TOKENS[fromSym].bal = Math.max(TOKENS[fromSym].bal - pending.fromAmt, 0);
      TOKENS[toSym].bal += pending.toAmt;
      toast(`Swapped <b>${fmt(pending.fromAmt)} ${fromSym}</b> → <b>${fmt(pending.toAmt)} ${toSym}</b>`, "ok");
    }, 3300);
  });

  $("statusDone").addEventListener("click", () => {
    closeConfirm();
    $("fromAmount").value = "";
    $("toAmount").value = "";
    lastEdited = "from";
    recompute();
  });
  $("statusHash").addEventListener("click", (e) => {
    e.preventDefault();
    toast("Explorer is mocked in this demo", "warn");
  });

  /* ---------- Global keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!tokenScrim.hidden) closeTokenModal();
    else if (!confirmScrim.hidden && $("confirmStatus").hidden) closeConfirm();
    else if (!slipPop.hidden) closeSlip();
  });

  /* ---------- Init ---------- */
  paintTokenBtn("from");
  paintTokenBtn("to");
  recompute();
})();
