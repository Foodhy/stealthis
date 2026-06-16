(() => {
  "use strict";

  /* ---------------- Mock data (fictional) ---------------- */
  // change24 = 24h % change. spark = relative trend points (drawn directly).
  const TOKENS = [
    {
      sym: "ETH",
      name: "Ethereum",
      balance: 2.4187,
      price: 3284.12,
      change24: 1.84,
      g: ["#7c5cff", "#00e0c6"],
      spark: [5, 4, 6, 5, 7, 6, 8, 7, 9, 10],
    },
    {
      sym: "USDC",
      name: "USD Coin",
      balance: 4120.5,
      price: 1.0,
      change24: 0.01,
      g: ["#2775ca", "#5aa9ff"],
      spark: [6, 6, 5, 6, 6, 5, 6, 6, 6, 6],
    },
    {
      sym: "NOVA",
      name: "Nova Protocol",
      balance: 18450.0,
      price: 0.4127,
      change24: 12.63,
      g: ["#ff7eb3", "#7c5cff"],
      spark: [3, 4, 3, 5, 5, 6, 7, 8, 9, 11],
    },
    {
      sym: "ARB",
      name: "Arbiter",
      balance: 1320.77,
      price: 1.182,
      change24: -3.41,
      g: ["#28a0f0", "#1b3a57"],
      spark: [9, 8, 9, 7, 8, 6, 7, 5, 6, 5],
    },
    {
      sym: "LUMEN",
      name: "Lumen Chain",
      balance: 905.2,
      price: 2.738,
      change24: -8.07,
      g: ["#ffb347", "#ff4d6d"],
      spark: [10, 9, 8, 9, 7, 6, 7, 5, 4, 3],
    },
    {
      sym: "DRIP",
      name: "Driplet",
      balance: 64.0,
      price: 0.0091,
      change24: 0.42,
      g: ["#00e0c6", "#26d07c"],
      spark: [5, 6, 5, 6, 5, 6, 6, 5, 6, 6],
    },
  ];

  const SMALL_THRESHOLD = 5; // hide rows under $5 fiat value
  const $ = (s, r = document) => r.querySelector(s);

  const rowsEl = $("#rows");
  const portTotalEl = $("#portTotal");
  const portDeltaEl = $("#portDelta");
  let sortMode = "value";
  let hideSmall = false;

  /* ---------------- Helpers ---------------- */
  const fiat = (n) =>
    "$" +
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const price = (n) =>
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: n < 1 ? 4 : 2,
      maximumFractionDigits: n < 1 ? 4 : 2,
    });

  const amount = (n) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: n < 1 ? 4 : 2,
    });

  const pct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

  TOKENS.forEach((t) => (t.value = t.balance * t.price));

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-on"), 2200);
  }

  /* ---------------- Sparkline (SVG path from points) ---------------- */
  function sparkSVG(points, positive) {
    const W = 56,
      H = 18,
      P = 1.5;
    const min = Math.min(...points),
      max = Math.max(...points);
    const span = max - min || 1;
    const step = (W - P * 2) / (points.length - 1);
    const xy = points.map((v, i) => {
      const x = P + i * step;
      const y = P + (H - P * 2) * (1 - (v - min) / span);
      return [x, y];
    });
    const line = xy.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
    const area = line + ` L${(W - P).toFixed(1)} ${H} L${P} ${H} Z`;
    const color = positive ? "var(--pos)" : "var(--neg)";
    return `
      <svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <path class="fill" d="${area}" style="fill:${color}"/>
        <path d="${line}" style="stroke:${color}"/>
      </svg>`;
  }

  /* ---------------- Render ---------------- */
  function render() {
    const sorted = [...TOKENS].sort((a, b) =>
      sortMode === "value" ? b.value - a.value : b.change24 - a.change24
    );

    rowsEl.innerHTML = "";
    let visibleCount = 0;

    sorted.forEach((t, i) => {
      const positive = t.change24 >= 0;
      const small = t.value < SMALL_THRESHOLD;
      const hidden = hideSmall && small;
      if (!hidden) visibleCount++;

      const li = document.createElement("li");
      li.className = "row" + (hidden ? " is-hidden" : "");
      li.style.animationDelay = i * 45 + "ms";
      li.innerHTML = `
        <span class="logo" style="background:linear-gradient(135deg, ${t.g[0]}, ${t.g[1]})">
          ${t.sym.slice(0, 3)}
        </span>
        <div class="meta">
          <p class="meta__name">${t.name}</p>
          <p class="meta__sub">
            <span class="meta__bal mono">${amount(t.balance)}</span>
            <span class="meta__sym">${t.sym}</span>
            <span class="change__price mono">@ ${price(t.price)}</span>
          </p>
        </div>
        <div class="fig">
          <span class="fig__val mono" data-val="${t.value}">$0.00</span>
          <div class="fig__row">
            ${sparkSVG(t.spark, positive)}
            <span class="change ${positive ? "is-pos" : "is-neg"}">
              <span class="arr" aria-hidden="true"></span>${pct(t.change24)}
            </span>
          </div>
        </div>`;
      rowsEl.appendChild(li);
    });

    countUp();
    renderTotal();

    if (hideSmall) {
      const hiddenN = TOKENS.filter((t) => t.value < SMALL_THRESHOLD).length;
      if (hiddenN) toast(`Hiding ${hiddenN} small balance${hiddenN > 1 ? "s" : ""}`);
    }
    return visibleCount;
  }

  /* ---------------- Portfolio total + weighted 24h ---------------- */
  function renderTotal() {
    const shown = hideSmall
      ? TOKENS.filter((t) => t.value >= SMALL_THRESHOLD)
      : TOKENS;
    const total = shown.reduce((s, t) => s + t.value, 0);
    const prev = shown.reduce((s, t) => s + t.value / (1 + t.change24 / 100), 0);
    const deltaPct = prev ? ((total - prev) / prev) * 100 : 0;
    const deltaAbs = total - prev;

    animateNumber(portTotalEl, total, (v) => fiat(v));

    const positive = deltaPct >= 0;
    portDeltaEl.className = "port__delta " + (positive ? "is-pos" : "is-neg");
    portDeltaEl.querySelector(".port__deltaVal").textContent =
      pct(deltaPct) + "  " + (positive ? "+" : "") + fiat(deltaAbs).replace("$", "$");
  }

  /* ---------------- Animated count-up ---------------- */
  function animateNumber(el, target, fmt, dur = 900) {
    const start = performance.now();
    const from = parseFloat(el.dataset.cur || "0");
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      el.textContent = fmt(v);
      if (p < 1) requestAnimationFrame(tick);
      else el.dataset.cur = target;
    }
    requestAnimationFrame(tick);
  }

  function countUp() {
    rowsEl.querySelectorAll(".fig__val").forEach((el) => {
      el.dataset.cur = "0";
      animateNumber(el, parseFloat(el.dataset.val), (v) => fiat(v), 850);
    });
  }

  /* ---------------- Events ---------------- */
  document.querySelectorAll(".sort__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.sort;
      if (mode === sortMode) return;
      sortMode = mode;
      document.querySelectorAll(".sort__btn").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      render();
      toast(mode === "value" ? "Sorted by portfolio value" : "Sorted by 24h change");
    });
  });

  $("#hideSmall").addEventListener("change", (e) => {
    hideSmall = e.target.checked;
    render();
    if (!hideSmall) toast("Showing all balances");
  });

  /* ---------------- Init ---------------- */
  portTotalEl.dataset.cur = "0";
  render();
})();
