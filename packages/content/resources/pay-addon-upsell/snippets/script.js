(() => {
  "use strict";

  // ---- Pricing model (fictional Northwind Cloud) -------------------------
  const BASE_PRICE = 99; // Pro plan / mo
  const TAX_RATE = 0.085; // 8.5%
  const SEAT_MIN = 1;
  const SEAT_MAX = 25;

  const ADDONS = {
    seats: { label: "Extra seats", unit: 12, perSeat: true },
    support: { label: "Priority support", unit: 29 },
    storage: { label: "Extra storage · 500 GB", unit: 8 },
    analytics: { label: "Advanced analytics", unit: 19 },
  };

  let seatCount = 2; // additional seats when the seats add-on is active

  // ---- Element refs -------------------------------------------------------
  const list = document.getElementById("addonList");
  const items = Array.from(list.querySelectorAll(".addon"));
  const summaryLines = document.getElementById("summaryLines");
  const summaryEmpty = document.getElementById("summaryEmpty");
  const seatCountEl = document.getElementById("seatCount");

  const subtotalEl = document.querySelector("[data-subtotal]");
  const taxEl = document.querySelector("[data-tax]");
  const totalEl = document.querySelector("[data-total]");
  const ctaTotalEl = document.querySelector("[data-cta-total]");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // ---- Helpers ------------------------------------------------------------
  const money = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function bump(el) {
    if (reduceMotion || !el) return;
    el.classList.remove("is-bumped");
    // force reflow so the animation can replay
    void el.offsetWidth;
    el.classList.add("is-bumped");
  }

  // Smoothly count an element's number from its current value to `target`.
  function animateNumber(el, target, prefix = "$") {
    if (!el) return;
    const from = parseFloat((el.textContent || "0").replace(/[^0-9.]/g, "")) || 0;
    if (reduceMotion || Math.abs(target - from) < 0.005) {
      el.textContent = prefix + target.toFixed(2);
      return;
    }
    const start = performance.now();
    const dur = 360;
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = prefix + (from + (target - from) * eased).toFixed(2);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- Toast --------------------------------------------------------------
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("is-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-show");
      setTimeout(() => (toastEl.hidden = true), 240);
    }, 2400);
  }

  // ---- Per-add-on amount --------------------------------------------------
  function addonAmount(key) {
    const def = ADDONS[key];
    if (def.perSeat) return def.unit * seatCount;
    return def.unit;
  }

  function isOn(key) {
    const cb = document.getElementById("addon-" + key);
    return cb && cb.checked;
  }

  // ---- Render the summary line list --------------------------------------
  function renderLines() {
    // Remove previously injected add-on lines (keep the base line).
    summaryLines.querySelectorAll(".line--addon").forEach((n) => n.remove());

    let anyAddon = false;
    Object.keys(ADDONS).forEach((key) => {
      if (!isOn(key)) return;
      anyAddon = true;
      const def = ADDONS[key];
      const li = document.createElement("li");
      li.className = "line line--addon";
      li.dataset.lineAddon = key;

      const label = document.createElement("span");
      label.className = "line__label";
      label.textContent = def.label;
      if (def.perSeat) {
        const qty = document.createElement("span");
        qty.className = "line__qty";
        qty.textContent = ` × ${seatCount}`;
        label.appendChild(qty);
      }

      const val = document.createElement("span");
      val.className = "line__val";
      val.textContent = money(addonAmount(key));

      li.append(label, val);
      summaryLines.appendChild(li);
    });

    summaryEmpty.hidden = anyAddon;
  }

  // ---- Recompute totals ---------------------------------------------------
  function recompute(announce) {
    let subtotal = BASE_PRICE;
    Object.keys(ADDONS).forEach((key) => {
      if (isOn(key)) subtotal += addonAmount(key);
    });
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    renderLines();
    animateNumber(subtotalEl, subtotal);
    animateNumber(taxEl, tax);
    animateNumber(totalEl, total, "");
    ctaTotalEl.textContent = money(total);

    if (announce) {
      bump(totalEl);
      bump(ctaTotalEl);
    }
  }

  // ---- Wire add-on toggles ------------------------------------------------
  items.forEach((item) => {
    const key = item.dataset.addon;
    const cb = document.getElementById("addon-" + key);
    const stepper = item.querySelector("[data-stepper]");

    function syncItem(fromUser) {
      const on = cb.checked;
      item.classList.toggle("is-on", on);
      if (stepper) stepper.hidden = !on;
      recompute(fromUser);
      if (fromUser) {
        const def = ADDONS[key];
        toast(on ? `Added ${def.label} to your order` : `Removed ${def.label}`);
      }
    }

    cb.addEventListener("change", () => syncItem(true));
    // initial state (support starts checked in markup)
    syncItem(false);
  });

  // ---- Seat stepper -------------------------------------------------------
  const seatItem = list.querySelector('[data-addon="seats"]');
  const stepBtns = seatItem.querySelectorAll("[data-step]");

  function updateSeatButtons() {
    stepBtns.forEach((b) => {
      const dir = Number(b.dataset.step);
      b.disabled = (dir < 0 && seatCount <= SEAT_MIN) || (dir > 0 && seatCount >= SEAT_MAX);
    });
  }

  stepBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = seatCount + Number(btn.dataset.step);
      if (next < SEAT_MIN || next > SEAT_MAX) return;
      seatCount = next;
      seatCountEl.textContent = String(seatCount);
      bump(seatCountEl);
      updateSeatButtons();
      // Make sure the add-on is on so the change is reflected, then recompute.
      const cb = document.getElementById("addon-seats");
      if (!cb.checked) {
        cb.checked = true;
        seatItem.classList.add("is-on");
        seatItem.querySelector("[data-stepper]").hidden = false;
      }
      recompute(true);
    });
  });
  updateSeatButtons();

  // ---- Checkout -----------------------------------------------------------
  checkoutBtn.addEventListener("click", () => {
    if (checkoutBtn.classList.contains("is-busy")) return;
    const label = totalEl.textContent;
    const count = Object.keys(ADDONS).filter(isOn).length;
    checkoutBtn.classList.add("is-busy");
    toast(
      count
        ? `Processing payment of $${label} — ${count} add-on${count > 1 ? "s" : ""} included`
        : `Processing payment of $${label} for the Pro plan`,
    );
    setTimeout(() => {
      checkoutBtn.classList.remove("is-busy");
      toast("Payment confirmed — welcome to Northwind Pro!");
    }, 1600);
  });

  // ---- Initial paint ------------------------------------------------------
  recompute(false);
})();
