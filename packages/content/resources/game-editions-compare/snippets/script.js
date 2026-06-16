(() => {
  "use strict";

  /* ---------- Data ---------- */
  const PRICES_USD = {
    standard: { now: 49.99, was: null },
    deluxe: { now: 69.99, was: 84.99 },
    ultimate: { now: 99.99, was: 134.99 },
  };

  const CURRENCIES = {
    USD: { symbol: "$", rate: 1 },
    EUR: { symbol: "€", rate: 0.92 },
    GBP: { symbol: "£", rate: 0.79 },
  };

  const MONTHLY_INSTALLMENTS = 4;

  const state = { plan: "once", currency: "USD" };

  /* ---------- Toast ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  /* ---------- Price rendering ---------- */
  function fmt(amountUsd) {
    const { symbol, rate } = CURRENCIES[state.currency];
    return symbol + (amountUsd * rate).toFixed(2);
  }

  function renderPrices() {
    const monthly = state.plan === "monthly";

    Object.keys(PRICES_USD).forEach((edition) => {
      const { now, was } = PRICES_USD[edition];

      const nowEl = document.querySelector(`[data-price="${edition}"]`);
      const wasEl = document.querySelector(`[data-was="${edition}"]`);
      const saveEl = document.querySelector(`[data-save="${edition}"]`);

      if (nowEl) {
        nowEl.textContent = monthly ? fmt(now / MONTHLY_INSTALLMENTS) : fmt(now);
        nowEl.classList.add("is-flash");
        setTimeout(() => nowEl.classList.remove("is-flash"), 300);
      }
      if (wasEl && was != null) {
        wasEl.textContent = monthly ? fmt(was / MONTHLY_INSTALLMENTS) : fmt(was);
      }
      if (saveEl && was != null) {
        const saved = was - now;
        saveEl.textContent = monthly
          ? `Save ${fmt(saved / MONTHLY_INSTALLMENTS)}/mo`
          : `Save ${fmt(saved)}`;
      }
    });

    document.querySelectorAll("[data-per]").forEach((el) => {
      el.textContent = monthly ? `/mo × ${MONTHLY_INSTALLMENTS}` : "";
    });
  }

  /* ---------- Toggle groups (plan + currency) ---------- */
  function wireToggleGroup(attr, onChange) {
    const buttons = document.querySelectorAll(`[${attr}]`);
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("is-active")) return;
        buttons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-checked", b === btn ? "true" : "false");
        });
        onChange(btn.getAttribute(attr));
      });
    });
  }

  wireToggleGroup("data-plan", (plan) => {
    state.plan = plan;
    renderPrices();
    toast(plan === "monthly" ? "Showing 4-payment plan" : "Showing one-time prices");
  });

  wireToggleGroup("data-currency", (currency) => {
    state.currency = currency;
    renderPrices();
    toast(`Currency set to ${currency}`);
  });

  /* ---------- Column hover highlight ---------- */
  const cols = document.querySelectorAll("col[data-col]");

  function highlightColumn(name) {
    cols.forEach((c) => c.classList.toggle("is-hovered", c.dataset.col === name));
  }

  document.querySelectorAll("th[data-col], td[data-col]").forEach((cell) => {
    cell.addEventListener("mouseenter", () => highlightColumn(cell.dataset.col));
    cell.addEventListener("mouseleave", () => highlightColumn(null));
  });

  /* ---------- Expandable section groups ---------- */
  document.querySelectorAll(".section-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      btn.querySelector(".section-caret").textContent = expanded ? "▸" : "▾";
      document
        .querySelectorAll(`tr[data-group="${section}"]`)
        .forEach((row) => (row.hidden = expanded));
    });
  });

  /* ---------- Buy buttons ---------- */
  document.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const edition = btn.dataset.buy;
      const key = edition.toLowerCase();
      const price =
        state.plan === "monthly"
          ? `${fmt(PRICES_USD[key].now / MONTHLY_INSTALLMENTS)}/mo`
          : fmt(PRICES_USD[key].now);
      toast(`${edition} Edition added — ${price}`);
    });
  });

  /* ---------- Init ---------- */
  renderPrices();
})();
