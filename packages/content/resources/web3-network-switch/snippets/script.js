(function () {
  "use strict";

  /* ── Mock chain data (fictional / illustrative) ── */
  const CHAINS = [
    {
      id: "ethereum",
      name: "Ethereum",
      net: "Mainnet",
      glyph: "E",
      color: "#7c5cff",
      glow: "rgba(124,92,255,0.45)",
      accent2: "#9b85ff",
      chainId: 1,
      currency: "ETH",
      gas: "14.2 gwei",
      block: "21,948,113",
      latency: "112 ms",
      rpc: "rpc.nova-eth.xyz",
      status: "online",
      testnet: false,
    },
    {
      id: "arbitrum",
      name: "Arbitrum",
      net: "L2 · Rollup",
      glyph: "A",
      color: "#2f9bff",
      glow: "rgba(47,155,255,0.45)",
      accent2: "#22d3ee",
      chainId: 42161,
      currency: "ETH",
      gas: "0.06 gwei",
      block: "284,110,042",
      latency: "61 ms",
      rpc: "rpc.arb-nova.xyz",
      status: "online",
      testnet: false,
    },
    {
      id: "base",
      name: "Base",
      net: "L2 · OP Stack",
      glyph: "B",
      color: "#3b6bff",
      glow: "rgba(59,107,255,0.45)",
      accent2: "#4f8bff",
      chainId: 8453,
      currency: "ETH",
      gas: "0.04 gwei",
      block: "19,002,771",
      latency: "58 ms",
      rpc: "rpc.base-nova.xyz",
      status: "online",
      testnet: false,
    },
    {
      id: "optimism",
      name: "Optimism",
      net: "L2 · OP Stack",
      glyph: "O",
      color: "#ff4d6d",
      glow: "rgba(255,77,109,0.42)",
      accent2: "#ff7a99",
      chainId: 10,
      currency: "ETH",
      gas: "0.05 gwei",
      block: "127,884,330",
      latency: "67 ms",
      rpc: "rpc.op-nova.xyz",
      status: "online",
      testnet: false,
    },
    {
      id: "polygon",
      name: "Polygon",
      net: "PoS",
      glyph: "P",
      color: "#9d6bff",
      glow: "rgba(157,107,255,0.45)",
      accent2: "#b89bff",
      chainId: 137,
      currency: "POL",
      gas: "31.0 gwei",
      block: "65,440,219",
      latency: "143 ms",
      rpc: "rpc.poly-nova.xyz",
      status: "degraded",
      testnet: false,
    },
    {
      id: "lumen",
      name: "Lumen Chain",
      net: "ZK · Mainnet",
      glyph: "L",
      color: "#00e0c6",
      glow: "rgba(0,224,198,0.45)",
      accent2: "#4dffe6",
      chainId: 7777,
      currency: "LUM",
      gas: "0.01 gwei",
      block: "4,201,556",
      latency: "44 ms",
      rpc: "rpc.lumenchain.xyz",
      status: "online",
      testnet: false,
    },
    {
      id: "sepolia",
      name: "Sepolia",
      net: "Ethereum Testnet",
      glyph: "S",
      color: "#ffb347",
      glow: "rgba(255,179,71,0.42)",
      accent2: "#ffcd7a",
      chainId: 11155111,
      currency: "sETH",
      gas: "2.10 gwei",
      block: "7,310,884",
      latency: "98 ms",
      rpc: "rpc.sepolia-nova.xyz",
      status: "online",
      testnet: true,
    },
    {
      id: "lumen-test",
      name: "Lumen Testnet",
      net: "ZK · Testnet",
      glyph: "L",
      color: "#26d07c",
      glow: "rgba(38,208,124,0.42)",
      accent2: "#5fe6a3",
      chainId: 77770,
      currency: "tLUM",
      gas: "0.00 gwei",
      block: "1,118,402",
      latency: "39 ms",
      rpc: "rpc.test.lumenchain.xyz",
      status: "online",
      testnet: true,
    },
  ];

  /* ── DOM refs ── */
  const switcher = document.getElementById("switcher");
  const pill = document.getElementById("chainPill");
  const menu = document.getElementById("chainMenu");
  const list = document.getElementById("chainList");
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const testnetToggle = document.getElementById("testnetToggle");
  const menuHint = document.getElementById("menuHint");

  const pillIco = document.getElementById("pillIco");
  const pillName = document.getElementById("pillName");
  const pillNet = document.getElementById("pillNet");
  const pillStatus = document.getElementById("pillStatus");

  const heroIco = document.getElementById("heroIco");
  const heroName = document.getElementById("heroName");
  const heroChainId = document.getElementById("heroChainId");
  const heroCurrency = document.getElementById("heroCurrency");
  const statGas = document.getElementById("statGas");
  const statBlock = document.getElementById("statBlock");
  const statLatency = document.getElementById("statLatency");
  const statRpc = document.getElementById("statRpc");

  const switching = document.getElementById("switching");
  const switchingSub = document.getElementById("switchingSub");
  const walletPill = document.getElementById("walletPill");

  let activeId = "ethereum";
  let isOpen = false;
  let busy = false;

  const byId = (id) => CHAINS.find((c) => c.id === id);

  /* ── Toast helper ── */
  const toastWrap = document.getElementById("toastWrap");
  function toast(msg, color) {
    const el = document.createElement("div");
    el.className = "toast";
    if (color) el.style.borderLeftColor = color;
    const dot = document.createElement("span");
    dot.className = "toast-dot";
    if (color) dot.style.background = color;
    if (color) dot.style.boxShadow = "0 0 10px " + color;
    const txt = document.createElement("span");
    txt.innerHTML = msg;
    el.appendChild(dot);
    el.appendChild(txt);
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }

  /* ── Accent theming ── */
  function applyAccent(chain) {
    const root = document.documentElement.style;
    root.setProperty("--accent", chain.color);
    root.setProperty("--accent-2", chain.accent2);
    root.setProperty("--accent-glow", chain.glow);
  }

  /* ── Render menu list ── */
  function renderList() {
    const q = searchInput.value.trim().toLowerCase();
    const showTest = testnetToggle.checked;
    list.innerHTML = "";
    let shown = 0;

    CHAINS.forEach((c) => {
      if (c.testnet && !showTest) return;
      if (q && !(c.name.toLowerCase().includes(q) || c.net.toLowerCase().includes(q))) return;
      shown++;

      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chain-row" + (c.id === activeId ? " is-active" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", String(c.id === activeId));
      btn.dataset.id = c.id;

      const ico = document.createElement("span");
      ico.className = "row-ico";
      ico.style.background = c.color;
      ico.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.14) inset, 0 0 14px -3px " + c.glow;
      ico.textContent = c.glyph;
      ico.setAttribute("aria-hidden", "true");

      const body = document.createElement("span");
      body.className = "row-body";
      const nameRow = document.createElement("span");
      nameRow.className = "row-name";
      nameRow.appendChild(document.createTextNode(c.name));
      if (c.testnet) {
        const tag = document.createElement("span");
        tag.className = "row-tag";
        tag.textContent = "Testnet";
        nameRow.appendChild(tag);
      }
      const sub = document.createElement("span");
      sub.className = "row-sub";
      sub.textContent = c.net + " · ID " + c.chainId;
      body.appendChild(nameRow);
      body.appendChild(sub);

      const end = document.createElement("span");
      end.className = "row-end";
      const st = document.createElement("span");
      st.className = "row-status" + (c.status === "degraded" ? " is-degraded" : "");
      st.title = c.status === "degraded" ? "Degraded" : "Online";
      const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      check.setAttribute("class", "check");
      check.setAttribute("viewBox", "0 0 24 24");
      check.innerHTML =
        '<path d="M5 12l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
      end.appendChild(st);
      end.appendChild(check);

      btn.appendChild(ico);
      btn.appendChild(body);
      btn.appendChild(end);
      btn.addEventListener("click", () => onSelect(c.id));
      li.appendChild(btn);
      list.appendChild(li);
    });

    emptyState.hidden = shown !== 0;
    list.hidden = shown === 0;
    menuHint.textContent = shown + " network" + (shown === 1 ? "" : "s");
  }

  /* ── Open / close ── */
  function openMenu() {
    if (busy) return;
    isOpen = true;
    switcher.classList.add("open");
    pill.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    renderList();
    requestAnimationFrame(() => searchInput.focus());
  }
  function closeMenu() {
    isOpen = false;
    switcher.classList.remove("open");
    pill.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    searchInput.value = "";
  }

  pill.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));

  document.addEventListener("click", (e) => {
    if (isOpen && !switcher.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
      pill.focus();
    }
  });

  searchInput.addEventListener("input", renderList);
  testnetToggle.addEventListener("change", () => {
    renderList();
    toast(
      testnetToggle.checked ? "Testnets <strong>shown</strong>" : "Testnets <strong>hidden</strong>"
    );
  });

  /* Arrow-key navigation inside the list */
  menu.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = Array.from(list.querySelectorAll(".chain-row"));
    if (!rows.length) return;
    e.preventDefault();
    const cur = rows.indexOf(document.activeElement);
    let next;
    if (e.key === "ArrowDown") next = cur < 0 ? 0 : Math.min(cur + 1, rows.length - 1);
    else next = cur <= 0 ? rows.length - 1 : cur - 1;
    rows[next].focus();
  });

  /* ── Select / switch ── */
  function onSelect(id) {
    if (id === activeId) {
      closeMenu();
      toast("Already on <strong>" + byId(id).name + "</strong>", byId(id).color);
      return;
    }
    const chain = byId(id);
    closeMenu();
    busy = true;
    pill.setAttribute("disabled", "");

    switchingSub.innerHTML = 'Connecting to <span class="mono">' + chain.name + "</span>";
    switching.hidden = false;

    const delay = 900 + Math.random() * 700;
    setTimeout(() => {
      switching.hidden = true;
      busy = false;
      pill.removeAttribute("disabled");
      activeId = id;
      applyChain(chain);
      toast(
        'Switched to <strong>' + chain.name + "</strong>",
        chain.color
      );
    }, delay);
  }

  /* ── Apply active chain to UI ── */
  function applyChain(chain) {
    applyAccent(chain);

    // Pill
    pillIco.innerHTML = '<span class="ico-glyph">' + chain.glyph + "</span>";
    pillIco.style.background = chain.color;
    pillIco.style.boxShadow =
      "0 0 0 1px rgba(255,255,255,0.14) inset, 0 0 14px -2px " + chain.glow;
    pillName.textContent = chain.name;
    pillNet.textContent = chain.net;
    pillStatus.className =
      "status-dot " + (chain.status === "degraded" ? "is-degraded" : "is-online");

    // Hero
    heroIco.innerHTML = '<span class="ico-glyph">' + chain.glyph + "</span>";
    heroIco.style.background = chain.color;
    heroName.textContent = chain.name;
    heroChainId.textContent = "Chain ID " + chain.chainId;
    heroCurrency.textContent = chain.currency;

    animateBlock(statBlock, chain.block);
    statGas.textContent = chain.gas;
    statLatency.textContent = chain.latency;
    statRpc.textContent = chain.rpc;
  }

  /* ── Animated count-up for the block number ── */
  function animateBlock(el, target) {
    const clean = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (!isFinite(clean)) {
      el.textContent = target;
      return;
    }
    const dur = 700;
    const start = performance.now();
    const fmt = (n) => n.toLocaleString("en-US");
    function frame(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(clean * eased));
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }

  walletPill.addEventListener("click", () => {
    navigator.clipboard &&
      navigator.clipboard.writeText("0x7a3f9e2b08d4c6515f0a1d77b3e9c41d").catch(() => {});
    toast('Address copied · <span class="mono">0x7a3f…c41d</span>', "#00e0c6");
  });

  /* ── Init ── */
  applyChain(byId(activeId));
})();
