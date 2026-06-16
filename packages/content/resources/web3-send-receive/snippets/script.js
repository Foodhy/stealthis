/* Web3 — Send / Receive · UI-only simulation (no real wallet, RPC or chain calls) */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* ---------------- mock data ---------------- */
  const TOKENS = [
    { sym: "NOVA", name: "Nova", balance: 842.4, price: 12.84 },
    { sym: "LUM", name: "Lumen", balance: 1530.18, price: 1.92 },
    { sym: "USDX", name: "USD-X", balance: 6204.77, price: 1.0 },
    { sym: "ASTR", name: "Aster", balance: 96.05, price: 4.37 },
  ];

  const NAME_BOOK = {
    "vitalik.nova": "0x9f21c0de77a4b1e8d35c6a90b2f1e4a8d7c30b55",
    "ana.nova": "0x44e1aa97c52b08d3f6e9017cbd2a85f4e6093c12",
    "treasury.nova": "0xb70d35f8a14c9e26d08b5a7e3f6c20d194e8aa01",
  };

  const NET_FEE_NOVA = 0.00042; // flat mock network fee, paid in NOVA
  const MY_ADDRESS = "0x7a3f4e9c1d8b6052aa31fe7740b2a85ef10ac41d";

  /* ---------------- helpers ---------------- */
  const fmt = (n, max = 6) =>
    Number(n).toLocaleString("en-US", { maximumFractionDigits: max });

  const fmtFiat = (n) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const truncAddr = (a) =>
    a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

  const isHexAddress = (v) => /^0x[0-9a-fA-F]{40}$/.test(v);
  const isNovaName = (v) => /^[a-z0-9-]{2,32}\.nova$/i.test(v);

  function randomHash() {
    let h = "0x";
    const chars = "0123456789abcdef";
    for (let i = 0; i < 64; i++) h += chars[(Math.random() * 16) | 0];
    return h;
  }

  /* toast */
  const toastEl = $("toast");
  let toastTimer = null;
  function toast(msg, kind = "") {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.className = `toast is-show${kind ? ` is-${kind}` : ""}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg, "ok");
    } catch {
      toast("Copy not available in this context", "err");
    }
  }

  /* animated number */
  function animateNumber(el, to, format, dur = 600) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(to * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- state ---------------- */
  const state = {
    token: TOKENS[0],
    amount: 0,
    recipientRaw: "",
    resolvedAddr: null, // valid destination address or null
    net: "Nova Chain",
    reqAmount: "",
  };

  /* ---------------- header balance ---------------- */
  const totalUsd = TOKENS.reduce((s, t) => s + t.balance * t.price, 0);
  animateNumber($("totalBal"), totalUsd, (v) => fmtFiat(v), 900);

  /* ---------------- tabs ---------------- */
  const tabs = document.querySelectorAll(".tab");
  const tabsWrap = document.querySelector(".tabs");
  const panels = {
    send: $("panel-send"),
    receive: $("panel-receive"),
  };

  function activateTab(name) {
    tabs.forEach((t) => {
      const active = t.dataset.tab === name;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    tabsWrap.dataset.active = name;
    Object.entries(panels).forEach(([k, p]) => {
      p.classList.toggle("is-active", k === name);
      p.hidden = k !== name;
    });
  }

  tabs.forEach((t) => {
    t.addEventListener("click", () => activateTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const next = t.dataset.tab === "send" ? "receive" : "send";
      activateTab(next);
      document.querySelector(`.tab[data-tab="${next}"]`).focus();
    });
  });
  activateTab("send");

  /* ---------------- token select ---------------- */
  const tokenBtn = $("tokenSel");
  const tokenMenu = $("tokenMenu");

  function renderTokenMenu() {
    tokenMenu.innerHTML = "";
    TOKENS.forEach((t) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(t.sym === state.token.sym));
      li.tabIndex = 0;
      li.innerHTML = `
        <span class="token-ic" data-token="${t.sym}">${t.sym[0]}</span>
        <span class="token-meta">
          <span class="token-sym">${t.sym}</span>
          <span class="token-bal mono">${t.name} · ${fmtFiat(t.price)}</span>
        </span>
        <span class="token-bal mono">${fmt(t.balance, 2)}</span>`;
      const pick = () => selectToken(t);
      li.addEventListener("click", pick);
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
        if (e.key === "Escape") closeMenu(true);
      });
      tokenMenu.appendChild(li);
    });
  }

  function openMenu() {
    renderTokenMenu();
    tokenMenu.hidden = false;
    tokenBtn.setAttribute("aria-expanded", "true");
  }
  function closeMenu(refocus = false) {
    tokenMenu.hidden = true;
    tokenBtn.setAttribute("aria-expanded", "false");
    if (refocus) tokenBtn.focus();
  }

  tokenBtn.addEventListener("click", () =>
    tokenMenu.hidden ? openMenu() : closeMenu()
  );
  document.addEventListener("click", (e) => {
    if (!$("tokenSelect").contains(e.target)) closeMenu();
  });

  function selectToken(t) {
    const menuWasOpen = !tokenMenu.hidden;
    state.token = t;
    tokenBtn.querySelector(".token-ic").dataset.token = t.sym;
    tokenBtn.querySelector(".token-ic").textContent = t.sym[0];
    $("selSym").textContent = t.sym;
    $("selBal").textContent = fmt(t.balance, 2);
    $("amtBalance").textContent = fmt(t.balance, 2);
    $("amtSym").textContent = t.sym;
    closeMenu(menuWasOpen);
    syncAmount();
  }

  /* ---------------- recipient: validate + mock ENS resolve ---------------- */
  const recipientIn = $("recipient");
  const recipientWrap = $("recipientWrap");
  const recipientHint = $("recipientHint");
  let resolveTimer = null;

  function setRecipientState(cls, hint, hintCls) {
    recipientWrap.classList.remove("is-valid", "is-invalid");
    if (cls) recipientWrap.classList.add(cls);
    recipientHint.textContent = hint;
    recipientHint.className = `field__hint${hintCls ? ` ${hintCls}` : ""}`;
  }

  function handleRecipientInput() {
    clearTimeout(resolveTimer);
    const v = recipientIn.value.trim();
    state.recipientRaw = v;
    state.resolvedAddr = null;

    if (!v) {
      setRecipientState(null, "Enter a Nova address or an .nova name.", "");
      updateReview();
      return;
    }
    if (isHexAddress(v)) {
      if (v.toLowerCase() === MY_ADDRESS.toLowerCase()) {
        setRecipientState("is-invalid", "That is your own address.", "is-error");
      } else {
        state.resolvedAddr = v;
        setRecipientState("is-valid", "Valid Nova Chain address.", "is-ok");
      }
      updateReview();
      return;
    }
    if (isNovaName(v)) {
      setRecipientState(null, `Resolving ${v}…`, "is-loading");
      resolveTimer = setTimeout(() => {
        const addr =
          NAME_BOOK[v.toLowerCase()] ||
          "0x" +
            Array.from(v)
              .map((c) => c.charCodeAt(0).toString(16))
              .join("")
              .padEnd(40, "5")
              .slice(0, 40);
        state.resolvedAddr = addr;
        setRecipientState(
          "is-valid",
          `${v} → ${truncAddr(addr)}`,
          "is-ok"
        );
        updateReview();
      }, 650);
      updateReview();
      return;
    }
    setRecipientState(
      "is-invalid",
      "Not a valid address or .nova name.",
      "is-error"
    );
    updateReview();
  }

  recipientIn.addEventListener("input", handleRecipientInput);

  $("pasteBtn").addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error();
      recipientIn.value = text.trim();
    } catch {
      // clipboard blocked in sandboxed demos — fall back to a sample address
      recipientIn.value = NAME_BOOK["ana.nova"];
      toast("Pasted sample address (clipboard unavailable)");
    }
    handleRecipientInput();
    recipientIn.focus();
  });

  /* ---------------- amount / fiat sync ---------------- */
  const amountIn = $("amount");

  function parseAmount(v) {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function syncAmount() {
    state.amount = parseAmount(amountIn.value);
    const usd = state.amount * state.token.price;
    $("fiatOut").textContent = `≈ ${fmtFiat(usd)} USD`;
    $("feeNet").textContent = `${NET_FEE_NOVA} NOVA`;
    $("feeTotal").textContent = `${fmt(state.amount)} ${state.token.sym}`;
    updateReview();
  }

  amountIn.addEventListener("input", () => {
    // keep only digits + one decimal point
    amountIn.value = amountIn.value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");
    syncAmount();
  });

  $("maxBtn").addEventListener("click", () => {
    let max = state.token.balance;
    if (state.token.sym === "NOVA") max = Math.max(0, max - NET_FEE_NOVA);
    amountIn.value = String(max);
    syncAmount();
    toast(`Max ${state.token.sym} applied`);
  });

  /* ---------------- review → confirm → success ---------------- */
  const reviewBtn = $("reviewBtn");

  function updateReview() {
    const overBalance = state.amount > state.token.balance;
    reviewBtn.disabled = !(
      state.resolvedAddr &&
      state.amount > 0 &&
      !overBalance
    );
    reviewBtn.textContent = overBalance
      ? "Insufficient balance"
      : "Review transfer";
  }

  reviewBtn.addEventListener("click", () => {
    const usd = state.amount * state.token.price;
    animateNumber($("cAmount"), state.amount, (v) => fmt(v), 450);
    $("cSym").textContent = state.token.sym;
    $("cFiat").textContent = `≈ ${fmtFiat(usd)}`;
    $("cTo").textContent = truncAddr(state.resolvedAddr);
    $("cTo").title = state.resolvedAddr;
    $("cFee").textContent = `${NET_FEE_NOVA} NOVA`;
    $("confirm").hidden = false;
    $("signBtn").disabled = false;
    $("signBtn").textContent = "Sign & send";
    $("cancelBtn").focus();
  });

  $("cancelBtn").addEventListener("click", () => {
    $("confirm").hidden = true;
    reviewBtn.focus();
  });

  $("signBtn").addEventListener("click", () => {
    const btn = $("signBtn");
    btn.disabled = true;
    btn.textContent = "Signing…";
    setTimeout(() => {
      btn.textContent = "Broadcasting…";
      setTimeout(() => {
        // mock balance update
        state.token.balance = Math.max(0, state.token.balance - state.amount);
        $("selBal").textContent = fmt(state.token.balance, 2);
        $("amtBalance").textContent = fmt(state.token.balance, 2);

        $("confirm").hidden = true;
        $("sAmount").textContent = `${fmt(state.amount)} ${
          state.token.sym
        } sent to ${truncAddr(state.resolvedAddr)}`;
        $("sHash").textContent = randomHash();
        $("success").hidden = false;
        $("doneBtn").focus();
        toast("Transaction confirmed", "ok");
      }, 900);
    }, 800);
  });

  $("copyHash").addEventListener("click", () =>
    copyText($("sHash").textContent, "Tx hash copied")
  );

  $("doneBtn").addEventListener("click", () => {
    $("success").hidden = true;
    amountIn.value = "";
    recipientIn.value = "";
    state.resolvedAddr = null;
    state.recipientRaw = "";
    setRecipientState(null, "Enter a Nova address or an .nova name.", "");
    syncAmount();
  });

  /* ---------------- receive: QR + copy + network + request ---------------- */
  const qrEl = $("qr");
  const SIZE = 21;

  // tiny deterministic hash → pseudo-random bit stream
  function seededBits(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return () => {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      return (h >>> 0) % 100 < 48;
    };
  }

  function inFinder(r, c) {
    const zones = [
      [0, 0],
      [0, SIZE - 7],
      [SIZE - 7, 0],
    ];
    return zones.some(([zr, zc]) => r >= zr && r < zr + 7 && c >= zc && c < zc + 7);
  }

  function finderOn(r, c) {
    const zones = [
      [0, 0],
      [0, SIZE - 7],
      [SIZE - 7, 0],
    ];
    for (const [zr, zc] of zones) {
      if (r >= zr && r < zr + 7 && c >= zc && c < zc + 7) {
        const lr = r - zr;
        const lc = c - zc;
        const ring =
          lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        return ring || core;
      }
    }
    return false;
  }

  function drawQR() {
    const seed = `${MY_ADDRESS}|${state.net}|${state.reqAmount}`;
    const next = seededBits(seed);
    qrEl.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("i");
        const on = inFinder(r, c) ? finderOn(r, c) : next();
        if (on) cell.className = "on";
        frag.appendChild(cell);
      }
    }
    qrEl.appendChild(frag);
    updateQrCaption();
  }

  function updateQrCaption() {
    const amt = parseAmount(state.reqAmount);
    $("qrCap").innerHTML = amt
      ? `Requesting <strong>${fmt(amt)} NOVA</strong> on ${state.net}`
      : `Scan to send NOVA on ${state.net}`;
  }

  $("copyAddr").addEventListener("click", () =>
    copyText(MY_ADDRESS, "Address copied")
  );

  document.querySelectorAll(".seg__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg__btn").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-checked", String(on));
      });
      state.net = btn.dataset.net;
      drawQR();
      toast(`Receiving on ${state.net}`);
    });
  });

  const reqIn = $("reqAmt");
  reqIn.addEventListener("input", () => {
    reqIn.value = reqIn.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    state.reqAmount = reqIn.value;
    drawQR();
  });

  $("shareBtn").addEventListener("click", () => {
    const amt = parseAmount(state.reqAmount);
    const link = `nova:${MY_ADDRESS}?net=${encodeURIComponent(state.net)}${
      amt ? `&amount=${amt}` : ""
    }`;
    copyText(link, "Payment link copied");
  });

  /* ---------------- init ---------------- */
  selectToken(TOKENS[0]);
  syncAmount();
  drawQR();
})();
