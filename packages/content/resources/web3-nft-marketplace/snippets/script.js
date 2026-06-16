"use strict";

/* ════════════════════════════════════════════════════════════
   Web3 — NFT Marketplace (UI simulation)
   No wallet, RPC, or on-chain calls. All data is mock.
   ════════════════════════════════════════════════════════════ */

(function () {
  const ETH_USD = 3284; // fictional fixed quote for fiat display
  const TRAITS = ["Aurora", "Ember", "Glacier", "Void", "Solar"];
  const RARITY = ["legendary", "epic", "rare", "common"];

  // Trait → color seed for generative art
  const TRAIT_COLORS = {
    Aurora: ["#7c5cff", "#00e0c6"],
    Ember: ["#ff6a3d", "#ffb347"],
    Glacier: ["#5cc8ff", "#bfeaff"],
    Void: ["#6a48ff", "#1b1e27"],
    Solar: ["#ffd76a", "#ff8a3d"],
  };

  /* ── Mock dataset ──────────────────────────────────── */
  function rng(seed) {
    // deterministic pseudo-random from seed
    let s = seed * 9301 + 49297;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  const items = Array.from({ length: 24 }, (_, i) => {
    const r = rng(i + 7);
    const trait = TRAITS[Math.floor(r() * TRAITS.length)];
    const rarityRoll = r();
    const rarity =
      rarityRoll > 0.92 ? "legendary" : rarityRoll > 0.72 ? "epic" : rarityRoll > 0.42 ? "rare" : "common";
    const isAuction = r() > 0.62;
    const base =
      rarity === "legendary" ? 6 + r() * 8 : rarity === "epic" ? 3 + r() * 4 : rarity === "rare" ? 2 + r() * 2 : 2.1 + r() * 1.2;
    const price = Math.round(base * 100) / 100;
    const last = Math.round(price * (0.7 + r() * 0.6) * 100) / 100;
    const rank = Math.max(1, Math.floor(r() * 4096));
    return {
      id: 1000 + i,
      idx: i,
      trait,
      rarity,
      status: isAuction ? "auction" : "buy",
      price,
      last,
      rank,
      listedOrder: Math.floor(r() * 1000),
      favs: Math.floor(r() * 90),
      faved: false,
      seed: i + 7,
    };
  });

  /* ── State ─────────────────────────────────────────── */
  const state = {
    status: "all",
    trait: "all",
    min: null,
    max: null,
    sort: "recent",
  };

  /* ── DOM ───────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const gridEl = $("#grid");
  const tpl = $("#cardTpl");
  const resultsCount = $("#resultsCount");
  const emptyState = $("#emptyState");

  const fmtUsd = (eth) =>
    "$" + Math.round(eth * ETH_USD).toLocaleString("en-US");

  /* ── Generative art (CSS-drawn thumbnail) ──────────── */
  function paintArt(el, item) {
    const [c1, c2] = TRAIT_COLORS[item.trait];
    const r = rng(item.seed * 13);
    const a1 = Math.floor(r() * 360);
    const a2 = Math.floor(r() * 360);
    const px = Math.floor(20 + r() * 60);
    const py = Math.floor(20 + r() * 60);
    const ring = item.rarity === "legendary" || item.rarity === "epic";
    el.style.background = `
      radial-gradient(circle at ${px}% ${py}%, ${c1}, transparent 55%),
      conic-gradient(from ${a1}deg at 50% 50%, ${c1}, ${c2}, ${c1}),
      linear-gradient(${a2}deg, ${c2}33, #0a0b0f)`;
    el.style.position = "absolute";
    el.style.inset = "0";
    el.innerHTML =
      `<span style="position:absolute;inset:0;background:
        repeating-linear-gradient(${a1}deg, transparent 0 8px, rgba(255,255,255,.05) 8px 9px);"></span>` +
      `<span style="position:absolute;left:50%;top:50%;width:${ring ? 64 : 40}%;height:${ring ? 64 : 40}%;
        transform:translate(-50%,-50%);border-radius:50%;
        background:radial-gradient(circle at 35% 30%, #ffffffcc, ${c1}aa 40%, transparent 70%);
        box-shadow:0 0 40px ${c1}88;"></span>` +
      (ring
        ? `<span style="position:absolute;left:50%;top:50%;width:84%;height:84%;transform:translate(-50%,-50%);
            border-radius:50%;border:2px solid ${c2}cc;opacity:.7;"></span>`
        : "");
  }

  /* ── Render ────────────────────────────────────────── */
  function visible() {
    let list = items.filter((it) => {
      if (state.status !== "all" && it.status !== state.status) return false;
      if (state.trait !== "all" && it.trait !== state.trait) return false;
      if (state.min != null && it.price < state.min) return false;
      if (state.max != null && it.price > state.max) return false;
      return true;
    });
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    switch (state.sort) {
      case "low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rarity":
        list.sort(
          (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity] || a.rank - b.rank
        );
        break;
      default: // recent
        list.sort((a, b) => a.listedOrder - b.listedOrder);
    }
    return list;
  }

  function render() {
    const list = visible();
    gridEl.innerHTML = "";
    emptyState.hidden = list.length !== 0;

    const frag = document.createDocumentFragment();
    list.forEach((it) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = it.id;

      paintArt($(".art-canvas", node), it);

      const badge = $(".rar-badge", node);
      badge.textContent = it.rarity;
      badge.classList.add(it.rarity);

      const tag = $(".status-tag", node);
      tag.textContent = it.status === "auction" ? "On auction" : "Buy now";
      tag.classList.add(it.status);

      $(".card-name", node).textContent = `Drifter #${it.id}`;
      $(".card-rank", node).textContent = `#${it.rank}`;
      $(".price-eth", node).textContent = `${it.price.toFixed(2)} ETH`;
      $(".price-fiat", node).textContent = fmtUsd(it.price);
      $(".pl-val", node).textContent = `${it.last.toFixed(2)} Ξ`;

      const fav = $(".fav", node);
      const favCount = $(".fav-count", node);
      favCount.textContent = it.favs;
      fav.setAttribute("aria-pressed", String(it.faved));
      fav.setAttribute(
        "aria-label",
        it.faved ? "Remove from favorites" : "Add to favorites"
      );
      fav.addEventListener("click", (e) => {
        e.stopPropagation();
        it.faved = !it.faved;
        it.favs += it.faved ? 1 : -1;
        favCount.textContent = it.favs;
        fav.setAttribute("aria-pressed", String(it.faved));
        fav.setAttribute(
          "aria-label",
          it.faved ? "Remove from favorites" : "Add to favorites"
        );
        fav.classList.remove("pulse");
        void fav.offsetWidth;
        fav.classList.add("pulse");
      });

      const action = $(".action", node);
      const isBid = it.status === "auction";
      action.textContent = isBid ? "Place bid" : "Buy now";
      if (isBid) action.classList.add("bid");
      action.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(it);
      });

      // clicking the card art also opens the buy/bid flow
      $(".card-art", node).addEventListener("click", () => openModal(it));

      frag.appendChild(node);
    });
    gridEl.appendChild(frag);

    const n = list.length;
    resultsCount.innerHTML = `<strong>${n}</strong> item${n === 1 ? "" : "s"}`;
  }

  /* ── Filter controls ───────────────────────────────── */
  $$(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".seg-btn").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      state.status = btn.dataset.status;
      render();
    });
  });

  $$(".trait-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".trait-chip").forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      state.trait = chip.dataset.trait;
      render();
    });
  });

  const minIn = $("#priceMin");
  const maxIn = $("#priceMax");
  function applyPrice() {
    const mn = parseFloat(minIn.value);
    const mx = parseFloat(maxIn.value);
    state.min = isNaN(mn) ? null : mn;
    state.max = isNaN(mx) ? null : mx;
    render();
  }
  $("#priceApply").addEventListener("click", applyPrice);
  [minIn, maxIn].forEach((inp) =>
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyPrice();
    })
  );

  $("#sortSel").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  $("#clearFilters").addEventListener("click", () => {
    state.status = "all";
    state.trait = "all";
    state.min = null;
    state.max = null;
    state.sort = "recent";
    minIn.value = "";
    maxIn.value = "";
    $("#sortSel").value = "recent";
    $$(".seg-btn").forEach((b, i) => {
      b.classList.toggle("is-active", i === 0);
      b.setAttribute("aria-pressed", String(i === 0));
    });
    $$(".trait-chip").forEach((c, i) => {
      c.classList.toggle("is-active", i === 0);
      c.setAttribute("aria-pressed", String(i === 0));
    });
    render();
  });

  // Density toggle
  $$(".dens-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".dens-btn").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      gridEl.classList.toggle("large", btn.dataset.density === "large");
    });
  });

  $("#walletChip").addEventListener("click", () =>
    toast("Wallet 0x7a3f…c41d — balance 12.84 ETH (simulated)")
  );

  /* ── Quick-buy / bid modal ─────────────────────────── */
  const modalRoot = $("#modalRoot");
  const modal = $("#modal");
  const confirmBtn = $("#confirmBtn");
  const bidField = $("#bidField");
  const bidInput = $("#bidInput");
  let activeItem = null;
  let lastFocus = null;

  function feeBreakdown(price) {
    const market = price * 0.025;
    const royalty = price * 0.05;
    const gas = 0.0021;
    return { market, royalty, gas, total: price + market + royalty + gas };
  }

  function refreshFees(price) {
    const f = feeBreakdown(price);
    $("#feePrice").textContent = `${price.toFixed(2)} ETH`;
    $("#feeMarket").textContent = `${f.market.toFixed(4)} ETH`;
    $("#feeRoyalty").textContent = `${f.royalty.toFixed(4)} ETH`;
    $("#feeGas").textContent = `${f.gas.toFixed(4)} ETH`;
    $("#feeTotal").textContent = `${f.total.toFixed(4)} ETH`;
  }

  function openModal(it) {
    activeItem = it;
    lastFocus = document.activeElement;
    const isBid = it.status === "auction";

    $("#modalTitle").textContent = isBid ? "Place a bid" : "Complete purchase";
    $("#miName").textContent = `Drifter #${it.id}`;
    $("#miRarity").textContent = it.rarity;
    paintArt($("#miThumb"), it);

    $("#feePriceLabel").textContent = isBid ? "Your bid" : "Item price";
    bidField.hidden = !isBid;

    if (isBid) {
      const minBid = Math.round((it.price + 0.05) * 100) / 100;
      bidInput.value = minBid.toFixed(2);
      bidInput.min = it.price;
      $("#bidTop").textContent = `${it.price.toFixed(2)} ETH`;
      refreshFees(minBid);
      confirmBtn.querySelector(".cb-label").textContent = "Sign & bid";
    } else {
      refreshFees(it.price);
      confirmBtn.querySelector(".cb-label").textContent = "Sign & buy";
    }

    modalRoot.hidden = false;
    document.body.style.overflow = "hidden";
    (isBid ? bidInput : confirmBtn).focus();
  }

  function closeModal() {
    modalRoot.hidden = true;
    document.body.style.overflow = "";
    confirmBtn.dataset.loading = "false";
    activeItem = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  bidInput.addEventListener("input", () => {
    const v = parseFloat(bidInput.value);
    if (!isNaN(v)) refreshFees(v);
  });

  modalRoot.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (modalRoot.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") trapFocus(e);
  });

  function trapFocus(e) {
    const f = $$(
      'button, [href], input, select, [tabindex]:not([tabindex="-1"])',
      modal
    ).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  confirmBtn.addEventListener("click", () => {
    if (!activeItem) return;
    const isBid = activeItem.status === "auction";

    if (isBid) {
      const v = parseFloat(bidInput.value);
      if (isNaN(v) || v <= activeItem.price) {
        toast(`Bid must exceed top bid of ${activeItem.price.toFixed(2)} ETH`, "warn");
        bidInput.focus();
        return;
      }
    }

    confirmBtn.dataset.loading = "true";
    // Simulated signing — no network. Resolve to a fake tx hash.
    setTimeout(() => {
      const hash =
        "0x" +
        Array.from({ length: 8 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("") +
        "…" +
        Array.from({ length: 4 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
      const it = activeItem;
      closeModal();
      if (isBid) {
        toast(`Bid placed on Drifter #${it.id} · tx <span class="mono">${hash}</span>`);
      } else {
        toast(`Bought Drifter #${it.id} · tx <span class="mono">${hash}</span>`);
      }
    }, 1400);
  });

  /* ── Toast ─────────────────────────────────────────── */
  const toastHost = $("#toastHost");
  function toast(html, kind) {
    const el = document.createElement("div");
    el.className = "toast" + (kind === "warn" ? " warn" : "");
    el.innerHTML = `<span class="dot"></span><span>${html}</span>`;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3600);
  }

  /* ── Animated stat numbers ─────────────────────────── */
  function animateStats() {
    $$(".stat-val[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const isInt = el.dataset.int === "1";
      const suffix = el.dataset.suffix || "";
      const dur = 900;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = isInt
          ? Math.round(val).toLocaleString("en-US")
          : val.toFixed(2) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ── Init ──────────────────────────────────────────── */
  render();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animateStats();
  }
})();
