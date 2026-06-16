/* Shop — Orders Manager (vanilla JS) */
(function () {
  "use strict";

  /* ---------- Data ---------- */
  const AVATAR_COLORS = ["#3457ff", "#e0245e", "#1f9d55", "#b9760a", "#7c3aed", "#0891b2", "#db2777", "#475569"];

  // payment: paid | pending | refunded
  // fulfillment: unfulfilled | fulfilled | refunded
  const ORDERS = [
    {
      id: "1042", customer: "Maya Okonkwo", email: "maya.o@example.com",
      payment: "pending", fulfillment: "unfulfilled", date: "2026-06-13T09:14:00",
      ship: "Express", shipCost: 12, country: "United States",
      addr: ["Maya Okonkwo", "418 Larkspur Ave, Apt 7", "Portland, OR 97204", "United States"],
      items: [
        { name: "Aurora Desk Lamp", variant: "Brass · Warm white", qty: 1, price: 89, ico: "💡", tint: "#fff3e0" },
        { name: "Linen Lampshade", variant: "Sand", qty: 2, price: 24, ico: "🪔", tint: "#fdebf2" }
      ]
    },
    {
      id: "1041", customer: "Theo Brandt", email: "theo.brandt@example.com",
      payment: "paid", fulfillment: "unfulfilled", date: "2026-06-13T08:02:00",
      ship: "Standard", shipCost: 0, country: "Germany",
      addr: ["Theo Brandt", "Gartenstraße 12", "10115 Berlin", "Germany"],
      items: [
        { name: "Trailhead Backpack 28L", variant: "Slate", qty: 1, price: 148, ico: "🎒", tint: "#eef2ff" }
      ]
    },
    {
      id: "1040", customer: "Priya Raman", email: "priya.raman@example.com",
      payment: "paid", fulfillment: "fulfilled", date: "2026-06-12T17:48:00",
      ship: "Express", shipCost: 12, country: "United States",
      addr: ["Priya Raman", "92 Cedar Hollow Rd", "Austin, TX 78701", "United States"],
      items: [
        { name: "Ceramic Pour-Over Set", variant: "Matte black", qty: 1, price: 64, ico: "☕", tint: "#eef7f0" },
        { name: "House Blend Beans", variant: "1kg · Whole", qty: 1, price: 28, ico: "🫘", tint: "#f3efe7" }
      ]
    },
    {
      id: "1039", customer: "Jonah Webb", email: "jonah.webb@example.com",
      payment: "pending", fulfillment: "unfulfilled", date: "2026-06-12T15:20:00",
      ship: "Standard", shipCost: 0, country: "Canada",
      addr: ["Jonah Webb", "77 Maple Cres", "Toronto, ON M5V 2T6", "Canada"],
      items: [
        { name: "Merino Crew Sweater", variant: "Oat · M", qty: 1, price: 118, ico: "🧶", tint: "#fbf3e8" }
      ]
    },
    {
      id: "1038", customer: "Aiko Tanaka", email: "aiko.t@example.com",
      payment: "paid", fulfillment: "fulfilled", date: "2026-06-12T11:05:00",
      ship: "Express", shipCost: 12, country: "Japan",
      addr: ["Aiko Tanaka", "3-14-2 Shibuya", "Tokyo 150-0002", "Japan"],
      items: [
        { name: "Studio Headphones", variant: "Graphite", qty: 1, price: 219, ico: "🎧", tint: "#eef2ff" },
        { name: "Braided USB-C Cable", variant: "2m", qty: 1, price: 18, ico: "🔌", tint: "#eef7f0" }
      ]
    },
    {
      id: "1037", customer: "Lucas Moreau", email: "lucas.m@example.com",
      payment: "refunded", fulfillment: "refunded", date: "2026-06-11T19:33:00",
      ship: "Standard", shipCost: 0, country: "France",
      addr: ["Lucas Moreau", "8 Rue des Lilas", "75011 Paris", "France"],
      items: [
        { name: "Canvas Sneakers", variant: "Ecru · 43", qty: 1, price: 95, ico: "👟", tint: "#fdebf2" }
      ]
    },
    {
      id: "1036", customer: "Hana Bauer", email: "hana.bauer@example.com",
      payment: "paid", fulfillment: "unfulfilled", date: "2026-06-11T14:11:00",
      ship: "Express", shipCost: 12, country: "Austria",
      addr: ["Hana Bauer", "Mariahilfer Str. 45", "1060 Vienna", "Austria"],
      items: [
        { name: "Weighted Throw Blanket", variant: "Fog · 7kg", qty: 1, price: 132, ico: "🛋️", tint: "#fbf3e8" },
        { name: "Lavender Candle", variant: "Set of 2", qty: 1, price: 36, ico: "🕯️", tint: "#fdebf2" }
      ]
    },
    {
      id: "1035", customer: "Devon Carter", email: "devon.c@example.com",
      payment: "paid", fulfillment: "fulfilled", date: "2026-06-10T22:47:00",
      ship: "Standard", shipCost: 0, country: "United States",
      addr: ["Devon Carter", "210 Birch St", "Seattle, WA 98101", "United States"],
      items: [
        { name: "Mechanical Keyboard", variant: "75% · Brown", qty: 1, price: 159, ico: "⌨️", tint: "#eef2ff" }
      ]
    },
    {
      id: "1034", customer: "Sofia Esposito", email: "sofia.e@example.com",
      payment: "pending", fulfillment: "unfulfilled", date: "2026-06-10T16:29:00",
      ship: "Express", shipCost: 12, country: "Italy",
      addr: ["Sofia Esposito", "Via Roma 18", "20121 Milan", "Italy"],
      items: [
        { name: "Leather Card Wallet", variant: "Cognac", qty: 1, price: 58, ico: "👛", tint: "#f3efe7" },
        { name: "Keyring Charm", variant: "Brass", qty: 1, price: 14, ico: "🔑", tint: "#fff3e0" }
      ]
    },
    {
      id: "1033", customer: "Mateo Vargas", email: "mateo.v@example.com",
      payment: "paid", fulfillment: "fulfilled", date: "2026-06-09T13:08:00",
      ship: "Express", shipCost: 12, country: "Spain",
      addr: ["Mateo Vargas", "Calle Mayor 7", "28013 Madrid", "Spain"],
      items: [
        { name: "Smart Plant Sensor", variant: "Pack of 3", qty: 1, price: 72, ico: "🌱", tint: "#eef7f0" }
      ]
    }
  ];

  const FILTER_FNS = {
    all: () => true,
    unfulfilled: (o) => o.fulfillment === "unfulfilled",
    paid: (o) => o.payment === "paid",
    refunded: (o) => o.payment === "refunded" || o.fulfillment === "refunded"
  };

  const PAY_BADGE = {
    paid: { cls: "b-paid", label: "Paid" },
    pending: { cls: "b-pending", label: "Pending" },
    refunded: { cls: "b-refunded", label: "Refunded" }
  };
  const FUL_BADGE = {
    unfulfilled: { cls: "b-unfulfilled", label: "Unfulfilled" },
    fulfilled: { cls: "b-fulfilled", label: "Fulfilled" },
    refunded: { cls: "b-ful-refunded", label: "Refunded" }
  };

  /* ---------- State ---------- */
  const state = {
    filter: "all",
    query: "",
    sortKey: "date",
    sortDir: "desc",
    selected: new Set(),
    openId: null
  };

  /* ---------- Helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const money = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function orderTotal(o) {
    const sub = o.items.reduce((s, it) => s + it.price * it.qty, 0);
    return sub + o.shipCost;
  }
  function orderSubtotal(o) {
    return o.items.reduce((s, it) => s + it.price * it.qty, 0);
  }
  function itemCount(o) {
    return o.items.reduce((s, it) => s + it.qty, 0);
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  }
  function avatarColor(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }
  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      ", " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  function fmtFullDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short", month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit"
    });
  }
  function nowTime() {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  const toastEl = $("#toast");
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.className = "toast"; }, 2600);
  }

  /* ---------- Timeline seed ---------- */
  ORDERS.forEach((o) => {
    o.timeline = [];
    o.timeline.push({ title: "Order placed", time: fmtFullDate(o.date) });
    if (o.payment === "paid" || o.payment === "refunded") {
      o.timeline.push({ title: "Payment captured · " + o.ship + " shipping", time: fmtFullDate(o.date) });
    } else {
      o.timeline.push({ title: "Awaiting payment", time: "Payment authorization pending" });
    }
    if (o.fulfillment === "fulfilled") {
      o.timeline.push({ title: "Items fulfilled & shipped", time: "Tracking emailed to customer" });
    }
    if (o.fulfillment === "refunded" || o.payment === "refunded") {
      o.timeline.push({ title: "Order refunded", time: "Funds returned to original method" });
    }
  });

  /* ---------- Derived list ---------- */
  function visibleOrders() {
    const q = state.query.trim().toLowerCase();
    let list = ORDERS.filter(FILTER_FNS[state.filter]);
    if (q) {
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    }
    const dir = state.sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let av, bv;
      switch (state.sortKey) {
        case "total": av = orderTotal(a); bv = orderTotal(b); break;
        case "customer": av = a.customer.toLowerCase(); bv = b.customer.toLowerCase(); break;
        case "id": av = parseInt(a.id, 10); bv = parseInt(b.id, 10); break;
        default: av = new Date(a.date).getTime(); bv = new Date(b.date).getTime();
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }

  /* ---------- Render table ---------- */
  const tbody = $("#ordersBody");
  const emptyState = $("#emptyState");

  function badge(map, key) {
    const b = map[key];
    return '<span class="badge ' + b.cls + '">' + b.label + "</span>";
  }

  function renderTable() {
    const list = visibleOrders();
    if (!list.length) {
      tbody.innerHTML = "";
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      tbody.innerHTML = list.map((o) => {
        const sel = state.selected.has(o.id);
        const open = state.openId === o.id;
        const n = itemCount(o);
        return (
          '<tr data-id="' + o.id + '"' +
            (sel ? ' class="is-selected' + (open ? " is-open" : "") + '"' : (open ? ' class="is-open"' : "")) +
          '>' +
            '<td class="col-check" data-noopen>' +
              '<input type="checkbox" class="row-check" ' + (sel ? "checked" : "") +
              ' aria-label="Select order ' + o.id + '" />' +
            "</td>" +
            '<td class="col-id">' +
              '<span class="cell-label">Order</span>' +
              '<span><span class="order-id">#' + o.id + "</span>" +
              ' <span class="order-items">' + n + " item" + (n > 1 ? "s" : "") + "</span></span>" +
            "</td>" +
            '<td class="col-cust">' +
              '<span class="cell-label">Customer</span>' +
              '<span class="cust-cell">' +
                '<span class="avatar" style="background:' + avatarColor(o.id) + '" aria-hidden="true">' +
                  esc(initials(o.customer)) + "</span>" +
                "<div><div class=\"cust-name\">" + esc(o.customer) + "</div>" +
                '<div class="cust-mail">' + esc(o.email) + "</div></div>" +
              "</span>" +
            "</td>" +
            '<td class="col-pay"><span class="cell-label">Payment</span>' + badge(PAY_BADGE, o.payment) + "</td>" +
            '<td class="col-ful"><span class="cell-label">Fulfillment</span>' + badge(FUL_BADGE, o.fulfillment) + "</td>" +
            '<td class="col-total num"><span class="cell-label">Total</span>' +
              '<span class="total-val">' + money(orderTotal(o)) + "</span></td>" +
            '<td class="col-date"><span class="cell-label">Date</span>' +
              '<span class="date-val">' + fmtDate(o.date) + "</span></td>" +
          "</tr>"
        );
      }).join("");
    }
    syncCheckAll(list);
  }

  /* ---------- Tabs / counts ---------- */
  function updateCounts() {
    $$(".tab-count").forEach((el) => {
      const key = el.getAttribute("data-count");
      const q = state.query.trim().toLowerCase();
      let n = ORDERS.filter(FILTER_FNS[key]).length;
      if (q) {
        n = ORDERS.filter(FILTER_FNS[key]).filter((o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)).length;
      }
      el.textContent = n;
    });
    $("#statUnfulfilled").textContent = ORDERS.filter(FILTER_FNS.unfulfilled).length;
  }

  /* ---------- Select-all + bulk bar ---------- */
  const checkAll = $("#checkAll");
  const bulkbar = $("#bulkbar");

  function syncCheckAll(list) {
    const ids = list.map((o) => o.id);
    const selectable = ids.filter((id) => find(id).fulfillment === "unfulfilled");
    const allSel = selectable.length > 0 && selectable.every((id) => state.selected.has(id));
    const someSel = selectable.some((id) => state.selected.has(id));
    checkAll.checked = allSel;
    checkAll.indeterminate = !allSel && someSel;
    checkAll.disabled = selectable.length === 0;
  }

  function updateBulkBar() {
    const ids = Array.from(state.selected);
    if (!ids.length) {
      bulkbar.hidden = true;
      return;
    }
    bulkbar.hidden = false;
    $("#bulkCount").textContent = ids.length;
    const total = ids.reduce((s, id) => s + orderTotal(find(id)), 0);
    $("#bulkTotal").textContent = money(total) + " total";
  }

  function find(id) {
    return ORDERS.find((o) => o.id === id);
  }

  /* ---------- Detail panel ---------- */
  const panel = $("#panel");
  const panelInner = $("#panelInner");
  const scrim = $("#scrim");

  function openDetail(id) {
    const o = find(id);
    if (!o) return;
    state.openId = id;
    panelInner.innerHTML = renderDetail(o);
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    renderTable();
    wireDetail(o);
    const closeBtn = $(".close-btn", panel);
    if (closeBtn) closeBtn.focus();
  }

  function closeDetail() {
    state.openId = null;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    renderTable();
  }

  function renderDetail(o) {
    const items = o.items.map((it) =>
      '<div class="line-item">' +
        '<span class="thumb" style="background:' + it.tint + '" aria-hidden="true">' + it.ico + "</span>" +
        '<div class="li-body">' +
          '<div class="li-name">' + esc(it.name) + "</div>" +
          '<div class="li-meta">' + esc(it.variant) + " · Qty " + it.qty + "</div>" +
        "</div>" +
        '<div class="li-price">' + money(it.price * it.qty) + "</div>" +
      "</div>"
    ).join("");

    const timeline = o.timeline.map((t) =>
      "<li><div class=\"tl-title\">" + esc(t.title) + "</div>" +
      '<div class="tl-time">' + esc(t.time) + "</div></li>"
    ).join("");

    const canFulfill = o.fulfillment === "unfulfilled" && o.payment !== "refunded";
    const canRefund = o.payment === "paid" && o.fulfillment !== "refunded";

    return (
      '<div class="panel-head">' +
        '<div class="panel-head-top">' +
          "<div><h2>Order #" + o.id + "</h2>" +
          '<p class="order-date">' + fmtFullDate(o.date) + "</p></div>" +
          '<button class="close-btn" data-close type="button" aria-label="Close detail">×</button>' +
        "</div>" +
        '<div class="panel-badges">' + badge(PAY_BADGE, o.payment) + badge(FUL_BADGE, o.fulfillment) + "</div>" +
      "</div>" +

      '<div class="panel-section"><h3>Items (' + itemCount(o) + ")</h3>" + items + "</div>" +

      '<div class="panel-section"><h3>Summary</h3><div class="summary">' +
        '<div class="summary-row"><span>Subtotal</span><span>' + money(orderSubtotal(o)) + "</span></div>" +
        '<div class="summary-row"><span>Shipping (' + esc(o.ship) + ")</span><span>" +
          (o.shipCost ? money(o.shipCost) : "Free") + "</span></div>" +
        '<div class="summary-row total"><span>Total</span><span>' + money(orderTotal(o)) + "</span></div>" +
      "</div></div>" +

      '<div class="panel-section"><h3>Customer</h3><div class="cust-block">' +
        '<div class="cust-top">' +
          '<span class="avatar" style="background:' + avatarColor(o.id) + '" aria-hidden="true">' +
            esc(initials(o.customer)) + "</span>" +
          "<div><strong>" + esc(o.customer) + "</strong><div>" + esc(o.email) + "</div></div>" +
        "</div>" +
        '<div class="addr"><strong>Shipping address</strong>' +
          o.addr.map(esc).join("<br>") + "</div>" +
      "</div></div>" +

      '<div class="panel-section"><h3>Timeline</h3><ul class="timeline">' + timeline + "</ul></div>" +

      '<div class="panel-actions">' +
        '<button class="btn btn-primary" data-fulfill type="button"' + (canFulfill ? "" : " disabled") + ">Fulfill order</button>" +
        '<button class="btn btn-danger" data-refund type="button"' + (canRefund ? "" : " disabled") + ">Refund</button>" +
        '<button class="btn btn-ghost" data-print type="button">Print</button>' +
      "</div>"
    );
  }

  function wireDetail(o) {
    $("[data-close]", panel).addEventListener("click", closeDetail);

    const fBtn = $("[data-fulfill]", panel);
    if (fBtn) fBtn.addEventListener("click", () => {
      fulfillOrder(o.id);
      panelInner.innerHTML = renderDetail(find(o.id));
      wireDetail(o);
    });

    const rBtn = $("[data-refund]", panel);
    if (rBtn) rBtn.addEventListener("click", () => {
      refundOrder(o.id);
      panelInner.innerHTML = renderDetail(find(o.id));
      wireDetail(o);
    });

    $("[data-print]", panel).addEventListener("click", () => {
      toast("Packing slip for #" + o.id + " sent to printer");
    });
  }

  /* ---------- Actions ---------- */
  function fulfillOrder(id) {
    const o = find(id);
    if (!o || o.fulfillment !== "unfulfilled") return false;
    o.fulfillment = "fulfilled";
    if (o.payment === "pending") o.payment = "paid";
    o.timeline.push({ title: "Items fulfilled & shipped", time: "Today at " + nowTime() });
    state.selected.delete(id);
    refreshAll();
    toast("Order #" + id + " fulfilled", "ok");
    return true;
  }

  function refundOrder(id) {
    const o = find(id);
    if (!o || o.payment !== "paid") return false;
    o.payment = "refunded";
    o.fulfillment = "refunded";
    o.timeline.push({ title: "Order refunded", time: "Today at " + nowTime() });
    state.selected.delete(id);
    refreshAll();
    toast("Order #" + id + " refunded · " + money(orderTotal(o)), "warn");
    return true;
  }

  function bulkFulfill() {
    const ids = Array.from(state.selected).filter((id) => find(id).fulfillment === "unfulfilled");
    if (!ids.length) {
      toast("No unfulfilled orders selected");
      return;
    }
    ids.forEach((id) => {
      const o = find(id);
      o.fulfillment = "fulfilled";
      if (o.payment === "pending") o.payment = "paid";
      o.timeline.push({ title: "Items fulfilled & shipped (bulk)", time: "Today at " + nowTime() });
    });
    state.selected.clear();
    if (state.openId && ids.includes(state.openId)) {
      panelInner.innerHTML = renderDetail(find(state.openId));
      wireDetail(find(state.openId));
    }
    refreshAll();
    toast(ids.length + " order" + (ids.length > 1 ? "s" : "") + " fulfilled", "ok");
  }

  function refreshAll() {
    renderTable();
    updateCounts();
    updateBulkBar();
  }

  /* ---------- Events ---------- */
  // Tabs
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.filter = tab.getAttribute("data-filter");
      renderTable();
    });
  });

  // Search
  let searchTimer;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value;
      renderTable();
      updateCounts();
    }, 120);
  });

  // Sorting
  $$(".sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-sort");
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "customer" ? "asc" : "desc";
      }
      $$(".sortable").forEach((h) => h.removeAttribute("aria-sort"));
      th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      renderTable();
    });
  });

  // Row interactions (delegated)
  tbody.addEventListener("click", (e) => {
    const checkCell = e.target.closest("[data-noopen]");
    const row = e.target.closest("tr");
    if (!row) return;
    if (checkCell) return; // checkbox handled separately
    openDetail(row.getAttribute("data-id"));
  });

  tbody.addEventListener("change", (e) => {
    if (!e.target.classList.contains("row-check")) return;
    const row = e.target.closest("tr");
    const id = row.getAttribute("data-id");
    if (e.target.checked) state.selected.add(id);
    else state.selected.delete(id);
    row.classList.toggle("is-selected", e.target.checked);
    updateBulkBar();
    syncCheckAll(visibleOrders());
  });

  // Select-all (only unfulfilled in current view)
  checkAll.addEventListener("change", () => {
    const list = visibleOrders().filter((o) => o.fulfillment === "unfulfilled");
    if (checkAll.checked) list.forEach((o) => state.selected.add(o.id));
    else list.forEach((o) => state.selected.delete(o.id));
    refreshAll();
  });

  // Bulk bar buttons
  $("#bulkFulfill").addEventListener("click", bulkFulfill);
  $("#bulkClear").addEventListener("click", () => {
    state.selected.clear();
    refreshAll();
  });

  // Export (demo)
  $("#exportBtn").addEventListener("click", () => {
    toast("Exported " + visibleOrders().length + " orders to CSV");
  });

  // Close panel
  scrim.addEventListener("click", closeDetail);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.openId) closeDetail();
  });

  /* ---------- Init ---------- */
  refreshAll();
})();
