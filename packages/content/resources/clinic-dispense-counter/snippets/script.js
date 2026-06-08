// ── In-clinic Dispense Counter ──────────────────────────────────────────────
// Vanilla JS only. Live label preview, simulated barcode scan + lot validation,
// counseling checklist gate, and a dispensed done-state with toast feedback.

(function () {
  "use strict";

  // ── Elements ──
  const form = document.getElementById("dispense-form");
  const qty = document.getElementById("qty");
  const qtyUp = document.getElementById("qty-up");
  const qtyDown = document.getElementById("qty-down");

  const scanWrap = document.querySelector(".scan");
  const scan = document.getElementById("scan");
  const scanStatus = document.getElementById("scan-status");

  const lot = document.getElementById("lot");
  const expiry = document.getElementById("expiry");
  const expiryWarn = document.getElementById("expiry-warn");

  const counselBoxes = Array.from(
    document.querySelectorAll('input[name="counsel"]')
  );
  const counselCount = document.getElementById("counsel-count");

  const dispenseBtn = document.getElementById("dispense-btn");
  const done = document.getElementById("done");
  const doneDetail = document.getElementById("done-detail");
  const nextBtn = document.getElementById("next-btn");

  // Label fields
  const lbl = {
    date: document.getElementById("label-date"),
    qty: document.getElementById("label-qty"),
    lot: document.getElementById("label-lot"),
    exp: document.getElementById("label-exp"),
  };

  // ── Known stock barcodes → lot data (simulated formulary) ──
  const STOCK = {
    "NDC-0093-4155-78": { lot: "A23F091", exp: "2027-04-30" },
    "NDC-0093-4155-79": { lot: "A23F114", exp: "2027-06-30" },
  };

  const QTY_MIN = 1;
  const QTY_MAX = 120;

  // Lot is considered "verified" only when set by a valid scan.
  let lotVerified = false;

  // ── Toast helper ──
  let toastTimer = null;
  const toastEl = document.getElementById("toast");
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  // ── Date formatting ──
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  function fmtDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return "—";
    return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
  }
  function todayISO() {
    const t = new Date();
    return [
      t.getFullYear(),
      String(t.getMonth() + 1).padStart(2, "0"),
      String(t.getDate()).padStart(2, "0"),
    ].join("-");
  }

  // ── Live label sync ──
  function renderLabel() {
    lbl.qty.textContent = qty.value || "0";
    lbl.lot.textContent = lot.value.trim() || "——";
    lbl.exp.textContent = fmtDate(expiry.value);
    lbl.date.textContent = fmtDate(todayISO());
  }

  // ── Quantity stepper ──
  function clampQty() {
    let v = parseInt(qty.value, 10);
    if (isNaN(v)) v = QTY_MIN;
    v = Math.min(QTY_MAX, Math.max(QTY_MIN, v));
    qty.value = v;
    return v;
  }
  function bumpQty(delta) {
    qty.value = clampQty() + delta;
    clampQty();
    renderLabel();
  }
  qtyUp.addEventListener("click", () => bumpQty(1));
  qtyDown.addEventListener("click", () => bumpQty(-1));
  qty.addEventListener("input", renderLabel);
  qty.addEventListener("blur", () => {
    clampQty();
    renderLabel();
  });

  // ── Expiry validation (warn if expired or near) ──
  function checkExpiry() {
    expiry.classList.remove("invalid");
    if (!expiry.value) {
      expiryWarn.hidden = true;
      return;
    }
    const exp = new Date(expiry.value + "T00:00:00");
    const now = new Date(todayISO() + "T00:00:00");
    const days = Math.round((exp - now) / 86400000);
    if (days < 0) {
      expiryWarn.hidden = false;
      expiryWarn.textContent = "Lot expired — do not dispense.";
      expiryWarn.classList.add("warn");
      expiry.classList.add("invalid");
    } else if (days <= 90) {
      expiryWarn.hidden = false;
      expiryWarn.textContent = `Short-dated: expires in ${days} day${days === 1 ? "" : "s"}.`;
      expiryWarn.classList.add("warn");
    } else {
      expiryWarn.hidden = true;
    }
    renderLabel();
  }
  expiry.addEventListener("input", checkExpiry);

  // ── Lot field (manual edits invalidate scan verification) ──
  lot.addEventListener("input", () => {
    lotVerified = false;
    setScanState("idle", "");
    renderLabel();
  });

  // ── Barcode scan simulation ──
  function setScanState(state, msg) {
    scanWrap.dataset.state = state;
    scanStatus.textContent = msg;
  }

  function processScan(raw) {
    const code = (raw || "").trim().toUpperCase();
    if (!code) {
      setScanState("idle", "");
      return;
    }
    const match = STOCK[code];
    if (match) {
      lot.value = match.lot;
      expiry.value = match.exp;
      lotVerified = true;
      setScanState("ok", "Lot verified");
      checkExpiry();
      renderLabel();
      toast(`Scan matched · lot ${match.lot}`);
    } else {
      lotVerified = false;
      setScanState("bad", "Not in stock");
      toast("Barcode not recognized — check the bottle.");
    }
  }

  // Enter simulates the scanner's terminating keystroke.
  scan.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processScan(scan.value);
    }
  });
  // Hardware scanners type fast then stop; debounce as a fallback.
  let scanTimer = null;
  scan.addEventListener("input", () => {
    setScanState("idle", "Scanning…");
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      if (scan.value.trim()) processScan(scan.value);
      else setScanState("idle", "");
    }, 550);
  });

  // Sample-code chip(s)
  document.querySelectorAll(".chip[data-fill]").forEach((chip) => {
    chip.addEventListener("click", () => {
      scan.value = chip.dataset.fill;
      processScan(scan.value);
      scan.focus();
    });
  });

  // ── Counseling checklist ──
  function counselDone() {
    return counselBoxes.filter((b) => b.checked).length;
  }
  function syncCounsel() {
    counselCount.textContent = String(counselDone());
  }
  counselBoxes.forEach((b) => b.addEventListener("change", syncCounsel));

  // ── Submit / validate ──
  function flash(el) {
    el.classList.add("invalid");
    el.focus();
    setTimeout(() => el.classList.remove("invalid"), 1600);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const q = clampQty();
    if (!q) {
      flash(qty);
      toast("Enter a quantity to dispense.");
      return;
    }
    if (!lot.value.trim()) {
      flash(lot);
      toast("Scan or enter a lot number first.");
      scan.focus();
      return;
    }
    if (!lotVerified) {
      toast("Lot not verified — scan the stock bottle to confirm.");
      flash(lot);
      scan.focus();
      return;
    }
    if (expiry.classList.contains("invalid")) {
      toast("Expiry issue — resolve before dispensing.");
      expiry.focus();
      return;
    }
    if (counselDone() < counselBoxes.length) {
      const firstUnchecked = counselBoxes.find((b) => !b.checked);
      if (firstUnchecked) firstUnchecked.focus();
      toast("Complete all counseling points before dispensing.");
      return;
    }

    // Success → lock the form, reveal done-state.
    renderLabel();
    form
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = true));
    setScanState("ok", "Lot verified");

    const rxStatus = document.getElementById("rx-status");
    if (rxStatus) {
      rxStatus.textContent = "Dispensed";
      rxStatus.classList.remove("ok");
      rxStatus.classList.add("done");
    }

    doneDetail.textContent = `Label printed · ${q} dispensed · lot ${lot.value.trim()}.`;
    done.hidden = false;
    done.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Dispensed — label sent to printer.");
  });

  // ── Reset for next prescription ──
  nextBtn.addEventListener("click", () => {
    form
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = false));
    form.reset();
    lotVerified = false;
    setScanState("idle", "");
    expiryWarn.hidden = true;
    qty.value = 30;
    expiry.value = "2027-04-30";

    const rxStatus = document.getElementById("rx-status");
    if (rxStatus) {
      rxStatus.textContent = "Ready to dispense";
      rxStatus.classList.remove("done");
      rxStatus.classList.add("ok");
    }

    done.hidden = true;
    syncCounsel();
    renderLabel();
    scan.focus();
    toast("Counter cleared — next prescription ready.");
  });

  // ── Init ──
  syncCounsel();
  checkExpiry();
  renderLabel();
})();
