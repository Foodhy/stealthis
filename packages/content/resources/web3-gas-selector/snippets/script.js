(() => {
  "use strict";

  // ---- Fictional market constants ----
  const GAS_LIMIT = 21000;          // standard transfer
  const LUM_PRICE_USD = 3.42;       // 1 LUM ≈ $3.42 (fictional)
  const GWEI_TO_LUM = 1e-9;         // 1 gwei = 1e-9 LUM

  // Priority tips added on top of the live base fee, per preset.
  const PRESETS = {
    slow:   { tip: 0.4, time: "~3 min", label: "Slow" },
    normal: { tip: 1.5, time: "~45 s",  label: "Normal" },
    fast:   { tip: 3.2, time: "~15 s",  label: "Fast" },
  };

  let baseFee = 21.4;               // live base fee in gwei (drifts)
  let mode = "presets";             // "presets" | "custom"
  let selectedPreset = "normal";

  // ---- Elements ----
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const baseFeeEl = $("#baseFee");
  const baseTrendEl = $("#baseTrend");
  const tickerEl = $(".ticker");
  const baseHintEl = $("#baseHint");

  const modesEl = $(".modes");
  const modeBtns = $$(".mode");
  const panelPresets = $("#panel-presets");
  const panelCustom = $("#panel-custom");

  const presetBtns = $$(".preset");

  const maxBaseEl = $("#maxBase");
  const priorityEl = $("#priority");
  const syncBaseBtn = $("#syncBase");
  const chips = $$(".chip");
  const customWarn = $("#customWarn");
  const customWarnText = $("#customWarnText");

  const sumGwei = $("#sumGwei");
  const sumTime = $("#sumTime");
  const sumEth = $("#sumEth");
  const sumFiat = $("#sumFiat");
  const confirmFee = $("#confirmFee");
  const confirmBtn = $("#confirmBtn");
  const confirmLabel = $(".confirm__label");

  // ---- Helpers ----
  const fmtUsd = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const toast = (() => {
    const el = $("#toast");
    let timer;
    return (msg) => {
      el.textContent = msg;
      el.classList.add("is-show");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("is-show"), 2400);
    };
  })();

  // Animate a number element from its current value to `to`.
  function animateNum(el, to, decimals, suffix = "") {
    const from = parseFloat((el.dataset.raw ?? "0")) || 0;
    el.dataset.raw = String(to);
    if (Math.abs(to - from) < Math.pow(10, -decimals)) {
      el.textContent = to.toFixed(decimals) + suffix;
      return;
    }
    const start = performance.now();
    const dur = 360;
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      el.textContent = v.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Effective gwei for a given total fee-per-gas (base + tip), capped logic aside.
  function feeForGwei(gwei) {
    const lum = gwei * GAS_LIMIT * GWEI_TO_LUM;
    return { lum, usd: lum * LUM_PRICE_USD };
  }

  // ---- Render preset cards (gwei + fiat) ----
  function renderPresets() {
    presetBtns.forEach((btn) => {
      const key = btn.dataset.preset;
      const p = PRESETS[key];
      const gwei = baseFee + p.tip;
      const { usd } = feeForGwei(gwei);
      const gweiEl = $('[data-field="gwei"]', btn);
      const fiatEl = $('[data-field="fiat"]', btn);
      animateNum(gweiEl, gwei, 1);
      fiatEl.textContent = fmtUsd(usd);
    });
  }

  // ---- Compute current selection (depends on mode) ----
  function currentSelection() {
    if (mode === "custom") {
      const maxBase = Math.max(0, parseFloat(maxBaseEl.value) || 0);
      const prio = Math.max(0, parseFloat(priorityEl.value) || 0);
      const gwei = maxBase + prio;
      let time = "variable";
      if (maxBase >= baseFee + 2.5) time = "~15 s";
      else if (maxBase >= baseFee + 0.8) time = "~45 s";
      else if (maxBase >= baseFee) time = "~2 min";
      else time = "may stall";
      return { gwei, time };
    }
    const p = PRESETS[selectedPreset];
    return { gwei: baseFee + p.tip, time: p.time };
  }

  // ---- Render summary + confirm ----
  function renderSummary() {
    const { gwei, time } = currentSelection();
    const { lum, usd } = feeForGwei(gwei);
    animateNum(sumGwei, gwei, 1);
    sumTime.textContent = time;
    animateNum(sumEth, lum, 4);
    sumFiat.textContent = "≈ " + fmtUsd(usd);
    confirmFee.textContent = fmtUsd(usd);

    // Custom underpriced warning
    if (mode === "custom") {
      const maxBase = parseFloat(maxBaseEl.value) || 0;
      if (maxBase < baseFee) {
        customWarn.hidden = false;
        customWarnText.textContent =
          `Max base fee ${maxBase.toFixed(1)} gwei is below the live base fee (${baseFee.toFixed(1)} gwei) — this transaction may stay pending.`;
      } else {
        customWarn.hidden = true;
      }
    }
  }

  function renderAll() {
    renderPresets();
    renderSummary();
  }

  // ---- Mode switching ----
  function setMode(next) {
    mode = next;
    modesEl.dataset.active = next;
    modeBtns.forEach((b) => {
      const on = b.dataset.mode === next;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    panelPresets.classList.toggle("is-hidden", next !== "presets");
    panelPresets.hidden = next !== "presets";
    panelCustom.classList.toggle("is-hidden", next !== "custom");
    panelCustom.hidden = next !== "custom";
    renderSummary();
  }

  modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // ---- Preset selection (radiogroup, keyboard) ----
  function selectPreset(key, focus) {
    selectedPreset = key;
    presetBtns.forEach((btn) => {
      const on = btn.dataset.preset === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();
    });
    renderSummary();
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectPreset(btn.dataset.preset, false));
    btn.addEventListener("keydown", (e) => {
      const order = ["slow", "normal", "fast"];
      const i = order.indexOf(selectedPreset);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        selectPreset(order[(i + 1) % order.length], true);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        selectPreset(order[(i - 1 + order.length) % order.length], true);
      }
    });
  });

  // ---- Custom inputs ----
  function syncChips() {
    const v = parseFloat(priorityEl.value);
    chips.forEach((c) => c.classList.toggle("is-active", parseFloat(c.dataset.prio) === v));
  }

  [maxBaseEl, priorityEl].forEach((el) =>
    el.addEventListener("input", () => {
      renderSummary();
      syncChips();
    })
  );

  chips.forEach((c) =>
    c.addEventListener("click", () => {
      priorityEl.value = c.dataset.prio;
      renderSummary();
      syncChips();
    })
  );

  syncBaseBtn.addEventListener("click", () => {
    // Sync max base fee to live base fee + a 15% headroom buffer.
    const next = +(baseFee * 1.15).toFixed(1);
    maxBaseEl.value = next;
    renderSummary();
    toast(`Max base fee synced to ${next.toFixed(1)} gwei`);
  });

  // ---- Confirm / sign (simulated) ----
  confirmBtn.addEventListener("click", () => {
    if (confirmBtn.classList.contains("is-signing")) return;
    const { gwei } = currentSelection();
    const { usd } = feeForGwei(gwei);

    if (mode === "custom" && (parseFloat(maxBaseEl.value) || 0) < baseFee) {
      toast("Underpriced — raise max base fee above the live base fee.");
      return;
    }

    confirmBtn.classList.add("is-signing");
    const original = confirmLabel.textContent;
    confirmLabel.textContent = "Signing…";
    toast("Awaiting wallet signature…");

    setTimeout(() => {
      confirmLabel.textContent = original;
      confirmBtn.classList.remove("is-signing");
      const hash = "0x" + Math.random().toString(16).slice(2, 6) + "…" +
        Math.random().toString(16).slice(2, 6);
      toast(`Submitted ${hash} · max fee ${fmtUsd(usd)}`);
    }, 1500);
  });

  // ---- Live base-fee drift ----
  function driftBaseFee() {
    const prev = baseFee;
    // Random walk, gently mean-reverting toward ~21 gwei, bounded.
    const drift = (Math.random() - 0.5) * 3.2;
    const pull = (21 - baseFee) * 0.08;
    baseFee = Math.min(58, Math.max(8, +(baseFee + drift + pull).toFixed(1)));

    animateNum(baseFeeEl, baseFee, 1);
    if (baseHintEl) baseHintEl.textContent = baseFee.toFixed(1);

    tickerEl.classList.remove("is-up", "is-down");
    if (baseFee > prev) tickerEl.classList.add("is-up");
    else if (baseFee < prev) tickerEl.classList.add("is-down");

    renderAll();
  }

  // ---- Init ----
  baseFeeEl.dataset.raw = String(baseFee);
  setMode("presets");
  selectPreset("normal", false);
  syncChips();
  renderAll();

  setInterval(driftBaseFee, 2400);
})();
