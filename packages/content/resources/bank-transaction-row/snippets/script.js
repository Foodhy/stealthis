(function () {
  "use strict";

  /* ---------- Fictional but realistic data ---------- */
  var TX = [
    { id: "TX-90412", name: "Bluebird Coffee Roasters", cat: "Food & Drink", icon: "☕", date: "Jun 16, 2026", time: "08:14", amount: -4.85, status: "pending", method: "Visa Debit •••• 4242", ref: "BLB-20260616-0814" },
    { id: "TX-90408", name: "Northvale Salary", cat: "Income", icon: "💼", date: "Jun 15, 2026", time: "00:01", amount: 3250.0, status: "cleared", method: "ACH credit", ref: "PAY-NV-2026-06" },
    { id: "TX-90405", name: "Helio Energy Utilities", cat: "Bills", icon: "💡", date: "Jun 14, 2026", time: "19:42", amount: -118.4, status: "cleared", method: "Direct debit", ref: "HEL-88231-06" },
    { id: "TX-90401", name: "Meridian Grocers", cat: "Groceries", icon: "🛒", date: "Jun 14, 2026", time: "17:09", amount: -76.23, status: "cleared", method: "Visa Debit •••• 4242", ref: "MER-44102-0917" },
    { id: "TX-90398", name: "Cascade Transit Pass", cat: "Transport", icon: "🚆", date: "Jun 13, 2026", time: "07:55", amount: -2.9, status: "pending", method: "Apple Pay", ref: "CTP-MONTHLY-06" },
    { id: "TX-90392", name: "Atlas Refund — Order #5521", cat: "Refund", icon: "↩️", date: "Jun 12, 2026", time: "13:20", amount: 42.99, status: "cleared", method: "Card refund", ref: "ATL-RF-5521" },
    { id: "TX-90387", name: "Pinecrest Gym", cat: "Health", icon: "🏋️", date: "Jun 11, 2026", time: "06:30", amount: -39.0, status: "failed", method: "Visa Debit •••• 4242", ref: "PIN-MEM-0611" },
    { id: "TX-90381", name: "Lumen Streaming", cat: "Subscription", icon: "🎬", date: "Jun 10, 2026", time: "00:05", amount: -12.99, status: "cleared", method: "Direct debit", ref: "LUM-SUB-0610" },
    { id: "TX-90376", name: "Harbor Books", cat: "Shopping", icon: "📚", date: "Jun 09, 2026", time: "15:48", amount: -27.5, status: "cleared", method: "Visa Debit •••• 4242", ref: "HRB-77120-1548" },
    { id: "TX-90370", name: "Transfer from J. Okafor", cat: "Transfer", icon: "👤", date: "Jun 08, 2026", time: "11:02", amount: 60.0, status: "cleared", method: "Instant transfer", ref: "TRF-OKAFOR-0608" }
  ];

  var STATUS_LABEL = { pending: "Pending", cleared: "Cleared", failed: "Failed" };

  var rowsEl = document.getElementById("rows");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var toastEl = document.getElementById("toast");

  var activeFilter = "all";
  var query = "";
  var toastTimer;

  function money(n) {
    var sign = n < 0 ? "-" : "+";
    var abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return sign + "$" + abs;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function matches(tx) {
    if (activeFilter === "pending" && tx.status !== "pending") return false;
    if (activeFilter === "cleared" && tx.status !== "cleared") return false;
    if (activeFilter === "credit" && tx.amount <= 0) return false;
    if (query && tx.name.toLowerCase().indexOf(query) === -1 && tx.cat.toLowerCase().indexOf(query) === -1) return false;
    return true;
  }

  function buildRow(tx) {
    var li = document.createElement("li");
    li.className = "row";
    li.dataset.id = tx.id;

    var credit = tx.amount > 0;
    var panelId = "detail-" + tx.id;

    li.innerHTML =
      '<button class="row__main" type="button" aria-expanded="false" aria-controls="' + panelId + '">' +
        '<span class="avatar" aria-hidden="true">' + tx.icon + "</span>" +
        '<span class="row__info">' +
          '<span class="row__name">' + tx.name + "</span>" +
          '<span class="row__meta">' +
            "<span>" + tx.cat + "</span>" +
            '<span class="dot" aria-hidden="true"></span>' +
            "<span>" + tx.date + "</span>" +
          "</span>" +
        "</span>" +
        '<span class="row__right">' +
          '<span class="amt' + (credit ? " is-credit" : "") + '">' + money(tx.amount) + "</span>" +
          '<span class="pill pill--' + tx.status + '">' + STATUS_LABEL[tx.status] + "</span>" +
        "</span>" +
      "</button>" +
      '<div class="row__detail">' +
        '<div class="row__detail-inner">' +
          '<div class="detail" id="' + panelId + '" role="region" aria-label="Transaction details">' +
            '<dl class="detail__grid">' +
              '<div class="detail__cell"><dt>Posted</dt><dd>' + tx.date + " · " + tx.time + "</dd></div>" +
              '<div class="detail__cell"><dt>Category</dt><dd>' + tx.cat + "</dd></div>" +
              '<div class="detail__cell"><dt>Method</dt><dd>' + tx.method + "</dd></div>" +
              '<div class="detail__cell"><dt>Reference</dt><dd class="detail__ref">' + tx.ref + "</dd></div>" +
            "</dl>" +
            (tx.status === "cleared"
              ? '<p class="verified"><span aria-hidden="true">🔒</span> Verified &amp; cleared</p>'
              : tx.status === "pending"
              ? '<p class="verified" style="color:var(--warn)"><span aria-hidden="true">⏳</span> Awaiting settlement</p>'
              : '<p class="verified" style="color:var(--danger)"><span aria-hidden="true">⚠️</span> Payment declined — retry available</p>') +
            '<div class="detail__actions">' +
              '<button class="btn btn--primary" data-act="receipt">View receipt</button>' +
              '<button class="btn" data-act="copy">Copy reference</button>' +
              (tx.status === "failed"
                ? '<button class="btn btn--primary" data-act="retry">Retry payment</button>'
                : "") +
              '<button class="btn btn--danger" data-act="dispute">Dispute</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    var trigger = li.querySelector(".row__main");
    trigger.addEventListener("click", function () {
      toggle(li, trigger);
    });

    li.querySelector(".detail__actions").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var act = btn.dataset.act;
      if (act === "copy") {
        copyText(tx.ref);
        toast("Reference " + tx.ref + " copied");
      } else if (act === "receipt") {
        toast("Receipt for " + tx.name + " opened");
      } else if (act === "retry") {
        toast("Retrying payment to " + tx.name + "…");
      } else if (act === "dispute") {
        toast("Dispute started for " + tx.id);
      }
    });

    return li;
  }

  function toggle(li, trigger) {
    var open = li.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  function render() {
    var visible = TX.filter(matches);
    rowsEl.innerHTML = "";
    visible.forEach(function (tx) {
      rowsEl.appendChild(buildRow(tx));
    });
    emptyEl.hidden = visible.length !== 0;
    countEl.textContent = visible.length + (visible.length === 1 ? " item" : " items");
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      activeFilter = chip.dataset.filter;
      render();
    });
  });

  searchEl.addEventListener("input", function () {
    query = searchEl.value.trim().toLowerCase();
    render();
  });

  render();
})();
