/* Web3 — NFT Detail (traits · history · buy)
   UI-only simulation. No wallet, RPC, or on-chain calls — all data is mocked. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  const NOVA_USD = 179.0; // mock spot price for fiat estimates
  const BUY_PRICE = 8.45;
  const MARKET_FEE = 0.025;
  const ROYALTY = 0.05;
  const GAS = 0.0021;

  /* ---------------------------------- toast ---------------------------------- */
  const toastStack = $("#toastStack");

  function toast(msg, type = "default") {
    const el = document.createElement("div");
    el.className = "toast" + (type === "success" ? " is-success" : "");
    el.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  /* ---------------------------------- traits ---------------------------------- */
  const TRAITS = [
    { type: "Background", value: "Deep Void", rarity: 11.2, floor: "6.2 NOVA", count: 995 },
    { type: "Core", value: "Violet Nebula", rarity: 6.4, floor: "7.1 NOVA", count: 569 },
    { type: "Ring System", value: "Twin Halo", rarity: 3.1, floor: "9.8 NOVA", count: 276 },
    { type: "Comet Trail", value: "Teal Streak", rarity: 4.8, floor: "8.4 NOVA", count: 427 },
    { type: "Star Field", value: "Dense Cluster", rarity: 9.7, floor: "6.6 NOVA", count: 862 },
    { type: "Horizon Grid", value: "Cyan Mesh", rarity: 7.5, floor: "6.9 NOVA", count: 667 },
    { type: "Aura", value: "Genesis Glow", rarity: 0.9, floor: "21.0 NOVA", count: 80, legendary: true },
  ];

  const traitsGrid = $("#traitsGrid");
  const tooltip = $("#traitTooltip");

  TRAITS.forEach((t) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "trait-card" + (t.legendary ? " is-legendary" : "");
    btn.setAttribute(
      "aria-label",
      `${t.type}: ${t.value}, ${t.rarity}% of tokens have this trait. Trait floor ${t.floor}.`
    );
    btn.innerHTML = `
      <span class="trait-type">${t.type}</span>
      <span class="trait-value">${t.value}</span>
      <span class="trait-rarity">
        <span class="trait-bar"><i style="width:${Math.max(t.rarity * 4, 4)}%"></i></span>
        <span class="mono">${t.rarity}%</span>
      </span>`;
    btn.dataset.tip = `${t.count} of 8,888 (${t.rarity}%) · floor ${t.floor}`;
    li.appendChild(btn);
    traitsGrid.appendChild(li);
  });

  function showTooltip(target, x, y) {
    tooltip.textContent = target.dataset.tip;
    tooltip.hidden = false;
    const pad = 14;
    const rect = tooltip.getBoundingClientRect();
    let left = x + pad;
    let top = y + pad;
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - pad;
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - pad;
    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }

  traitsGrid.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".trait-card");
    if (card) showTooltip(card, e.clientX, e.clientY);
    else tooltip.hidden = true;
  });
  traitsGrid.addEventListener("mouseleave", () => (tooltip.hidden = true));
  traitsGrid.addEventListener("focusin", (e) => {
    const card = e.target.closest(".trait-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    showTooltip(card, r.left + r.width / 2, r.bottom);
  });
  traitsGrid.addEventListener("focusout", () => (tooltip.hidden = true));

  /* ---------------------------------- countdown ---------------------------------- */
  const cdH = $("#cdH");
  const cdM = $("#cdM");
  const cdS = $("#cdS");
  const countdown = $("#countdown");
  let remaining = 2 * 3600 + 14 * 60 + 9; // 02:14:09

  const pad2 = (n) => String(n).padStart(2, "0");

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      // anti-snipe style extension keeps the demo alive
      remaining = 10 * 60;
      toast("Auction extended by 10 minutes (anti-snipe)");
    }
    cdH.textContent = pad2(Math.floor(remaining / 3600));
    cdM.textContent = pad2(Math.floor((remaining % 3600) / 60));
    cdS.textContent = pad2(remaining % 60);
    countdown.classList.toggle("is-urgent", remaining < 15 * 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------------------------- tabs ---------------------------------- */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next);
        next.focus();
      }
    });
  });

  /* ---------------------------------- price chart ---------------------------------- */
  const SALES = [3.2, 3.6, 3.4, 4.25, 4.9, 5.4, 5.1, 6.1, 6.8, 7.4, 8.45];

  function renderChart() {
    const svg = $("#priceChart");
    const W = 560;
    const H = 160;
    const padX = 14;
    const padY = 18;
    const min = Math.min(...SALES);
    const max = Math.max(...SALES);
    const x = (i) => padX + (i / (SALES.length - 1)) * (W - padX * 2);
    const y = (v) => H - padY - ((v - min) / (max - min)) * (H - padY * 2);
    const pts = SALES.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);

    const ns = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML = `
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#00e0c6"/>
      </linearGradient>
      <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(124,92,255,0.30)"/>
        <stop offset="1" stop-color="rgba(124,92,255,0)"/>
      </linearGradient>`;
    svg.appendChild(defs);

    const area = document.createElementNS(ns, "path");
    area.setAttribute(
      "d",
      `M${pts[0]} L${pts.slice(1).join(" L")} L${x(SALES.length - 1)},${H} L${x(0)},${H} Z`
    );
    area.setAttribute("fill", "url(#fillGrad)");
    svg.appendChild(area);

    const line = document.createElementNS(ns, "path");
    line.setAttribute("d", `M${pts[0]} L${pts.slice(1).join(" L")}`);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "url(#lineGrad)");
    line.setAttribute("stroke-width", "2.5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    svg.appendChild(line);

    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", x(SALES.length - 1));
    dot.setAttribute("cy", y(SALES[SALES.length - 1]));
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "#0a0b0f");
    dot.setAttribute("stroke", "#00e0c6");
    dot.setAttribute("stroke-width", "2");
    svg.appendChild(dot);

    // draw-in animation
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.getBoundingClientRect(); // force layout
    line.style.transition = "stroke-dashoffset 1.1s ease";
    line.style.strokeDashoffset = "0";
  }
  renderChart();

  /* ---------------------------------- favorites ---------------------------------- */
  const favBtn = $("#favBtn");
  const favCount = $("#favCount");
  let favs = 312;
  let faved = false;

  favBtn.addEventListener("click", () => {
    faved = !faved;
    favs += faved ? 1 : -1;
    favCount.textContent = favs.toLocaleString("en-US");
    favBtn.setAttribute("aria-pressed", String(faved));
    favBtn.setAttribute("aria-label", faved ? "Remove from favorites" : "Add to favorites");
    favBtn.classList.remove("fav-pop");
    void favBtn.offsetWidth; // restart animation
    favBtn.classList.add("fav-pop");
    if (faved) toast("Added to your favorites", "success");
  });

  /* ---------------------------------- share / refresh ---------------------------------- */
  $("#shareBtn").addEventListener("click", async () => {
    const url = "https://lumen.market/nebula-drifters/2481";
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    } catch {
      toast(`Share link: ${url}`);
    }
  });

  $("#refreshBtn").addEventListener("click", () => {
    toast("Metadata refresh queued — already frozen on-chain");
  });

  $("#walletChip").addEventListener("click", () => {
    toast("Wallet 0x7a3f…c41d connected · 14.82 NOVA (simulated)");
  });

  /* ---------------------------------- fullscreen artwork ---------------------------------- */
  const artFrame = $("#artFrame");
  const zoomBtn = $("#zoomBtn");

  function setFullscreen(on) {
    artFrame.classList.toggle("is-fullscreen", on);
    zoomBtn.setAttribute("aria-label", on ? "Exit fullscreen view" : "Toggle fullscreen view");
    document.body.style.overflow = on ? "hidden" : "";
  }

  zoomBtn.addEventListener("click", () => setFullscreen(!artFrame.classList.contains("is-fullscreen")));
  artFrame.addEventListener("click", (e) => {
    if (artFrame.classList.contains("is-fullscreen") && e.target === artFrame) setFullscreen(false);
  });

  /* ---------------------------------- confirm sheet (buy / offer) ---------------------------------- */
  const backdrop = $("#sheetBackdrop");
  const sheet = $("#confirmSheet");
  const sheetTitle = $("#sheetTitle");
  const sheetPrice = $("#sheetPrice");
  const offerField = $("#offerField");
  const offerInput = $("#offerInput");
  const rowItem = $("#rowItem");
  const rowFee = $("#rowFee");
  const rowRoyalty = $("#rowRoyalty");
  const rowTotal = $("#rowTotal");
  const cancelBtn = $("#sheetCancel");
  const confirmBtn = $("#sheetConfirm");
  const confirmLabel = confirmBtn.querySelector(".btn-label");
  const spinner = confirmBtn.querySelector(".btn-spinner");

  let mode = "buy"; // "buy" | "offer"
  let lastFocus = null;
  let signing = false;

  const fmt = (n) => `${n.toFixed(4)} NOVA`;

  function updateBreakdown() {
    const base = mode === "buy" ? BUY_PRICE : Math.max(parseFloat(offerInput.value) || 0, 0);
    const fee = base * MARKET_FEE;
    const royalty = base * ROYALTY;
    rowItem.textContent = fmt(base);
    rowFee.textContent = fmt(fee);
    rowRoyalty.textContent = fmt(royalty);
    rowTotal.textContent = fmt(base + fee + royalty + GAS);
    sheetPrice.textContent = `${base.toFixed(2)} NOVA`;
  }

  function openSheet(which) {
    mode = which;
    lastFocus = document.activeElement;
    sheetTitle.textContent = mode === "buy" ? "Confirm purchase" : "Make an offer";
    confirmLabel.textContent = mode === "buy" ? "Approve in wallet" : "Sign offer";
    offerField.hidden = mode === "buy";
    updateBreakdown();
    backdrop.hidden = false;
    sheet.hidden = false;
    (mode === "offer" ? offerInput : confirmBtn).focus();
  }

  function closeSheet() {
    if (signing) return;
    backdrop.hidden = true;
    sheet.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  $("#buyBtn").addEventListener("click", () => openSheet("buy"));
  $("#offerBtn").addEventListener("click", () => openSheet("offer"));
  cancelBtn.addEventListener("click", closeSheet);
  backdrop.addEventListener("click", closeSheet);
  offerInput.addEventListener("input", updateBreakdown);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!sheet.hidden) closeSheet();
    else if (artFrame.classList.contains("is-fullscreen")) setFullscreen(false);
  });

  // rudimentary focus trap inside the sheet
  sheet.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = sheet.querySelectorAll("button, input");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  confirmBtn.addEventListener("click", () => {
    if (signing) return;
    if (mode === "offer") {
      const v = parseFloat(offerInput.value);
      if (!v || v <= 0) {
        toast("Enter an offer above 0 NOVA");
        offerInput.focus();
        return;
      }
    }
    signing = true;
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    confirmLabel.textContent = mode === "buy" ? "Awaiting signature…" : "Signing offer…";
    spinner.hidden = false;

    // simulated wallet signature + confirmation
    setTimeout(() => {
      signing = false;
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
      spinner.hidden = true;
      confirmLabel.textContent = mode === "buy" ? "Approve in wallet" : "Sign offer";
      closeSheet();
      if (mode === "buy") {
        toast("Purchase confirmed · tx 0x8c2f…a90e (simulated)", "success");
      } else {
        toast(`Offer of ${parseFloat(offerInput.value).toFixed(2)} NOVA signed (simulated)`, "success");
      }
    }, 1800);
  });
})();
