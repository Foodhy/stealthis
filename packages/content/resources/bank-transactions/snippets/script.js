(function () {
  "use strict";

  // ---- Fictional data ---------------------------------------------------
  const CATEGORIES = {
    groceries: { label: "Groceries", icon: "🛒" },
    dining: { label: "Dining", icon: "🍽️" },
    transport: { label: "Transport", icon: "🚇" },
    income: { label: "Income", icon: "💼" },
    transfer: { label: "Transfers", icon: "🔁" },
    bills: { label: "Bills & Utilities", icon: "💡" },
    shopping: { label: "Shopping", icon: "🛍️" },
    health: { label: "Health", icon: "➕" },
    entertainment: { label: "Entertainment", icon: "🎬" },
  };

  // Newest first. Amounts: positive = credit, negative = debit.
  const RAW = [
    { id: "TX-9041", merchant: "Bluewater Grocers", note: "Card purchase", cat: "groceries", amount: -72.4, day: 0, status: "pending", method: "Visa Debit •••• 4242", ref: "AUTH 8841" },
    { id: "TX-9038", merchant: "Acme Studio Ltd", note: "Salary — June", cat: "income", amount: 4250.0, day: 0, status: "cleared", method: "SEPA Credit", ref: "PAYROLL-06" },
    { id: "TX-9035", merchant: "Metro Transit", note: "Monthly pass", cat: "transport", amount: -56.0, day: 0, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8810" },
    { id: "TX-9030", merchant: "Lumen Energy", note: "Electricity bill", cat: "bills", amount: -94.18, day: 1, status: "cleared", method: "Direct Debit", ref: "DD-LUMEN" },
    { id: "TX-9026", merchant: "Trattoria Sole", note: "Dinner", cat: "dining", amount: -48.9, day: 1, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8770" },
    { id: "TX-9021", merchant: "J. Okafor", note: "Split — rent", cat: "transfer", amount: 320.0, day: 1, status: "cleared", method: "Instant transfer", ref: "P2P-5521" },
    { id: "TX-9015", merchant: "Halcyon Pharmacy", note: "Prescription", cat: "health", amount: -23.5, day: 3, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8612" },
    { id: "TX-9012", merchant: "Streamline+", note: "Subscription", cat: "entertainment", amount: -13.99, day: 3, status: "failed", method: "Visa Debit •••• 4242", ref: "DECLINED" },
    { id: "TX-9008", merchant: "Northfield Market", note: "Weekly shop", cat: "groceries", amount: -88.62, day: 4, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8540" },
    { id: "TX-9001", merchant: "Drift Outfitters", note: "Running shoes", cat: "shopping", amount: -119.0, day: 6, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8488" },
    { id: "TX-8994", merchant: "Vale Coffee Co.", note: "Cafe", cat: "dining", amount: -6.2, day: 9, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8421" },
    { id: "TX-8987", merchant: "Brightline Rail", note: "Refund — delay", cat: "transport", amount: 18.0, day: 12, status: "cleared", method: "Visa Debit •••• 4242", ref: "REF-2210" },
    { id: "TX-8980", merchant: "Aurora Mobile", note: "Phone plan", cat: "bills", amount: -29.0, day: 18, status: "cleared", method: "Direct Debit", ref: "DD-AURORA" },
    { id: "TX-8972", merchant: "Tideline Freelance", note: "Invoice #112", cat: "income", amount: 640.0, day: 24, status: "cleared", method: "SEPA Credit", ref: "INV-112" },
    { id: "TX-8965", merchant: "Cedar Books", note: "Order", cat: "shopping", amount: -34.75, day: 41, status: "cleared", method: "Visa Debit •••• 4242", ref: "AUTH 8190" },
  ];

  const STARTING_BALANCE = 6840.55; // current available balance (today)

  // Build derived transaction objects with date + running balance.
  const now = new Date();
  let running = STARTING_BALANCE;
  const TX = RAW.map((t) => {
    const date = new Date(now);
    date.setHours(11, 5, 0, 0);
    date.setDate(now.getDate() - t.day);
    const balanceAfter = running;
    // The balance BEFORE this txn = balanceAfter - amount (we walk backwards in time).
    running = balanceAfter - t.amount;
    return Object.assign({}, t, { date, balanceAfter });
  });

  // ---- Helpers ----------------------------------------------------------
  const fmtMoney = (n) =>
    (n < 0 ? "-" : "") +
    "$" +
    Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const signedMoney = (n) =>
    (n >= 0 ? "+" : "-") +
    "$" +
    Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  function dayLabel(date) {
    const t = startOfDay(now).getTime();
    const d = startOfDay(date).getTime();
    const diff = Math.round((t - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }

  const STATUS_LABEL = { cleared: "Cleared", pending: "Pending", failed: "Failed" };

  // ---- DOM refs ---------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const listEl = $("txList");
  const emptyEl = $("emptyState");
  const searchEl = $("searchInput");
  const typeEl = $("typeFilter");
  const catEl = $("categoryFilter");
  const rangeEl = $("rangeFilter");
  const countEl = $("resultCount");
  const clearBtn = $("clearBtn");
  const toastWrap = $("toastWrap");
  let openId = null;

  // Populate category filter.
  Object.keys(CATEGORIES).forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = CATEGORIES[key].label;
    catEl.appendChild(opt);
  });

  // ---- Summary ----------------------------------------------------------
  function renderSummary() {
    let inSum = 0,
      outSum = 0,
      pending = 0;
    TX.forEach((t) => {
      if (t.amount >= 0) inSum += t.amount;
      else outSum += t.amount;
      if (t.status === "pending") pending += 1;
    });
    $("availBalance").textContent = fmtMoney(STARTING_BALANCE);
    $("statIn").textContent = "+" + fmtMoney(inSum);
    $("statOut").textContent = fmtMoney(outSum);
    $("statPending").textContent = String(pending);
  }

  // ---- Filtering --------------------------------------------------------
  function getFiltered() {
    const q = searchEl.value.trim().toLowerCase();
    const type = typeEl.value;
    const cat = catEl.value;
    const range = rangeEl.value;
    const cutoff =
      range === "all" ? null : startOfDay(now).getTime() - (Number(range) - 1) * 86400000;

    return TX.filter((t) => {
      if (type === "credit" && t.amount < 0) return false;
      if (type === "debit" && t.amount >= 0) return false;
      if (cat !== "all" && t.cat !== cat) return false;
      if (cutoff !== null && startOfDay(t.date).getTime() < cutoff) return false;
      if (q) {
        const hay = (
          t.merchant +
          " " +
          t.note +
          " " +
          CATEGORIES[t.cat].label +
          " " +
          Math.abs(t.amount).toFixed(2)
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function filtersActive() {
    return (
      searchEl.value.trim() !== "" ||
      typeEl.value !== "all" ||
      catEl.value !== "all" ||
      rangeEl.value !== "all"
    );
  }

  // ---- Render list ------------------------------------------------------
  function render() {
    const rows = getFiltered();
    listEl.innerHTML = "";

    const active = filtersActive();
    clearBtn.hidden = !active;
    countEl.textContent =
      rows.length + " transaction" + (rows.length === 1 ? "" : "s") + (active ? " · filtered" : "");

    if (rows.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    // Group by day.
    const groups = [];
    let current = null;
    rows.forEach((t) => {
      const key = startOfDay(t.date).getTime();
      if (!current || current.key !== key) {
        current = { key, label: dayLabel(t.date), items: [], net: 0 };
        groups.push(current);
      }
      current.items.push(t);
      current.net += t.amount;
    });

    const frag = document.createDocumentFragment();
    groups.forEach((g) => {
      const groupEl = document.createElement("div");
      groupEl.className = "day-group";

      const head = document.createElement("div");
      head.className = "day-head";
      head.innerHTML =
        '<span class="day-label">' +
        g.label +
        '</span><span class="day-total">' +
        signedMoney(g.net) +
        "</span>";
      groupEl.appendChild(head);

      g.items.forEach((t) => groupEl.appendChild(buildRow(t)));
      frag.appendChild(groupEl);
    });
    listEl.appendChild(frag);
  }

  function buildRow(t) {
    const wrap = document.createElement("div");
    wrap.className = "tx" + (t.id === openId ? " open" : "");
    wrap.dataset.id = t.id;

    const cat = CATEGORIES[t.cat];
    const isCredit = t.amount >= 0;
    const timeStr = t.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tx-row";
    btn.setAttribute("aria-expanded", t.id === openId ? "true" : "false");
    btn.innerHTML =
      '<span class="tx-icon" aria-hidden="true">' +
      cat.icon +
      "</span>" +
      '<span class="tx-main">' +
      '<span class="tx-merchant">' +
      escapeHtml(t.merchant) +
      "</span>" +
      '<span class="tx-sub">' +
      '<span class="cat">' +
      cat.label +
      "</span><span>·</span>" +
      '<span class="pill ' +
      t.status +
      '">' +
      STATUS_LABEL[t.status] +
      "</span>" +
      "</span>" +
      "</span>" +
      '<span class="tx-amounts">' +
      '<span class="tx-amount ' +
      (isCredit ? "credit" : "debit") +
      '">' +
      signedMoney(t.amount) +
      "</span>" +
      '<span class="tx-balance">Bal ' +
      fmtMoney(t.balanceAfter) +
      "</span>" +
      "</span>";

    btn.addEventListener("click", () => toggle(t.id));

    const detail = document.createElement("div");
    detail.className = "tx-detail";
    detail.innerHTML =
      '<div class="tx-detail-inner"><div class="detail-card"><dl class="detail-grid">' +
      detailItem("Reference", t.ref) +
      detailItem("Method", t.method) +
      detailItem("Date & time", t.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + timeStr) +
      detailItem("Note", t.note) +
      detailItem("Category", cat.label) +
      detailItem("Balance after", fmtMoney(t.balanceAfter)) +
      "</dl>" +
      '<div class="detail-actions">' +
      '<button type="button" class="ghost-btn" data-act="receipt">View receipt</button>' +
      '<button type="button" class="ghost-btn" data-act="dispute">Report a problem</button>' +
      "</div></div></div>";

    detail.querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const act = b.dataset.act;
        toast(act === "receipt" ? "Receipt for " + t.merchant + " sent to your inbox" : "Dispute opened for " + t.id);
      });
    });

    wrap.appendChild(btn);
    wrap.appendChild(detail);
    return wrap;
  }

  function detailItem(label, value) {
    return "<div><dt>" + label + "</dt><dd>" + escapeHtml(String(value)) + "</dd></div>";
  }

  function toggle(id) {
    openId = openId === id ? null : id;
    // Update only affected rows for a smooth expand/collapse.
    listEl.querySelectorAll(".tx").forEach((el) => {
      const isOpen = el.dataset.id === openId;
      el.classList.toggle("open", isOpen);
      const b = el.querySelector(".tx-row");
      if (b) b.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // ---- Toast ------------------------------------------------------------
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M3 8.5 6.4 12 13 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' +
      escapeHtml(msg) +
      "</span>";
    toastWrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 240);
    }, 2600);
  }

  // ---- Export -----------------------------------------------------------
  $("exportBtn").addEventListener("click", () => {
    const rows = getFiltered();
    toast("Exported " + rows.length + " transaction" + (rows.length === 1 ? "" : "s") + " to CSV");
  });

  // ---- Clear filters ----------------------------------------------------
  function clearFilters() {
    searchEl.value = "";
    typeEl.value = "all";
    catEl.value = "all";
    rangeEl.value = "all";
    render();
  }
  clearBtn.addEventListener("click", clearFilters);
  $("emptyClear").addEventListener("click", clearFilters);

  // ---- Wire filter inputs ----------------------------------------------
  let searchTimer;
  searchEl.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 120);
  });
  [typeEl, catEl, rangeEl].forEach((el) => el.addEventListener("change", render));

  // ---- Init -------------------------------------------------------------
  renderSummary();
  render();
})();
