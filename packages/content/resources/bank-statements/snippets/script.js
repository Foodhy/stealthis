(function () {
  "use strict";

  var GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

  var statements = [
    { id: "st-2026-05", year: 2026, period: "May 2026", range: "1 May – 31 May 2026", balance: 8421.55, status: "ready", opening: 7290.12, credits: 4310.00, debits: 3178.57 },
    { id: "st-2026-04", year: 2026, period: "Apr 2026", range: "1 Apr – 30 Apr 2026", balance: 7290.12, status: "ready", opening: 6655.88, credits: 3980.50, debits: 3346.26 },
    { id: "st-2026-03", year: 2026, period: "Mar 2026", range: "1 Mar – 31 Mar 2026", balance: 6655.88, status: "ready", opening: 7102.40, credits: 3540.00, debits: 3986.52 },
    { id: "st-2026-06", year: 2026, period: "Jun 2026", range: "1 Jun – 16 Jun 2026", balance: 9012.34, status: "pending", opening: 8421.55, credits: 2100.00, debits: 1509.21 },
    { id: "st-2025-12", year: 2025, period: "Dec 2025", range: "1 Dec – 31 Dec 2025", balance: 7102.40, status: "ready", opening: 5980.10, credits: 5120.00, debits: 3997.70 },
    { id: "st-2025-11", year: 2025, period: "Nov 2025", range: "1 Nov – 30 Nov 2025", balance: 5980.10, status: "ready", opening: 6240.33, credits: 3410.00, debits: 3670.23 },
    { id: "st-2025-10", year: 2025, period: "Oct 2025", range: "1 Oct – 31 Oct 2025", balance: 6240.33, status: "ready", opening: 5710.00, credits: 3890.00, debits: 3359.67 },
    { id: "st-2025-09", year: 2025, period: "Sep 2025", range: "1 Sep – 30 Sep 2025", balance: 5710.00, status: "ready", opening: 5455.20, credits: 3600.00, debits: 3345.20 },
    { id: "st-2024-12", year: 2024, period: "Dec 2024", range: "1 Dec – 31 Dec 2024", balance: 5455.20, status: "ready", opening: 4980.00, credits: 4720.00, debits: 4244.80 },
    { id: "st-2024-11", year: 2024, period: "Nov 2024", range: "1 Nov – 30 Nov 2024", balance: 4980.00, status: "ready", opening: 5012.45, credits: 3210.00, debits: 3242.45 },
    { id: "st-2024-10", year: 2024, period: "Oct 2024", range: "1 Oct – 31 Oct 2024", balance: 5012.45, status: "ready", opening: 4630.10, credits: 3700.00, debits: 3317.65 },
    { id: "st-2024-09", year: 2024, period: "Sep 2024", range: "1 Sep – 30 Sep 2024", balance: 4630.10, status: "ready", opening: 4401.00, credits: 3120.00, debits: 2890.90 }
  ];

  var taxDocs = [
    { id: "tx-2026-int", year: 2026, kind: "interest", title: "Interest summary 2025/26", note: "Gross interest earned on savings", file: "interest-summary-2026.pdf" },
    { id: "tx-2025-cert", year: 2025, kind: "tax", title: "Tax certificate 2024/25", note: "HMRC self-assessment ready", file: "tax-certificate-2025.pdf" },
    { id: "tx-2025-int", year: 2025, kind: "interest", title: "Interest summary 2024/25", note: "Gross interest earned on savings", file: "interest-summary-2025.pdf" },
    { id: "tx-2024-cert", year: 2024, kind: "tax", title: "Tax certificate 2023/24", note: "HMRC self-assessment ready", file: "tax-certificate-2024.pdf" }
  ];

  var DOC_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM8 13h8v2H8v-2Zm0 4h8v2H8v-2Zm0-8h4v2H8V9Z"/></svg>';
  var DL_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 3v10.6l3.3-3.3 1.4 1.4-5.7 5.7-5.7-5.7 1.4-1.4 3.3 3.3V3h2ZM5 19h14v2H5v-2Z"/></svg>';

  var state = { year: "all", query: "" };

  var stmtList = document.getElementById("stmtList");
  var stmtEmpty = document.getElementById("stmtEmpty");
  var stmtCount = document.getElementById("stmtCount");
  var taxGrid = document.getElementById("taxGrid");
  var taxEmpty = document.getElementById("taxEmpty");
  var taxCount = document.getElementById("taxCount");

  // ---------- Toast ----------
  var toastHost = document.getElementById("toastHost");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="tk"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/></svg></span>' +
      '<span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2600);
  }

  // ---------- Filtering ----------
  function matches(d, hay) {
    if (state.year !== "all" && d.year !== Number(state.year)) return false;
    if (state.query && hay.toLowerCase().indexOf(state.query) === -1) return false;
    return true;
  }

  function renderStatements() {
    var rows = statements.filter(function (s) { return matches(s, s.period + " " + s.range); });
    rows.sort(function (a, b) { return a.id < b.id ? 1 : -1; });
    stmtList.innerHTML = "";
    rows.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "row";
      row.setAttribute("role", "row");
      var pillCls = s.status === "ready" ? "ready" : "pending";
      var pillTxt = s.status === "ready" ? "Available" : "Processing";
      row.innerHTML =
        '<div class="period">' +
          '<span class="doc-ico">' + DOC_ICON + '</span>' +
          '<span class="period-text"><strong>' + s.period + '</strong><span>' + s.range + '</span></span>' +
        '</div>' +
        '<div class="balance tnum">' + GBP.format(s.balance) + '</div>' +
        '<div><span class="pill ' + pillCls + '">' + pillTxt + '</span></div>' +
        '<div class="row-actions">' +
          '<button class="btn btn-ghost js-preview">Preview</button>' +
          '<button class="btn btn-primary js-dl">Download</button>' +
        '</div>';
      row.querySelector(".js-preview").addEventListener("click", function () { openModal(s); });
      row.querySelector(".js-dl").addEventListener("click", function (e) { download(e.currentTarget, "Statement " + s.period); });
      stmtList.appendChild(row);
    });
    stmtCount.textContent = rows.length + (rows.length === 1 ? " document" : " documents");
    stmtEmpty.hidden = rows.length !== 0;
  }

  function renderTax() {
    var rows = taxDocs.filter(function (d) { return matches(d, d.title + " " + d.note); });
    taxGrid.innerHTML = "";
    rows.forEach(function (d) {
      var card = document.createElement("div");
      card.className = "tax-card";
      var badge = d.kind === "tax" ? "tax" : "interest";
      var badgeTxt = d.kind === "tax" ? "TAX FORM" : "INTEREST";
      card.innerHTML =
        '<div class="tax-top">' +
          '<span class="tax-badge ' + badge + '">' + badgeTxt + '</span>' +
          '<span class="tax-year tnum">' + d.year + '</span>' +
        '</div>' +
        '<h4>' + d.title + '</h4>' +
        '<p>' + d.note + '</p>' +
        '<div class="tax-foot">' +
          '<button class="btn btn-ghost js-preview">Preview</button>' +
          '<button class="btn btn-primary js-dl">' + DL_ICON + 'Download</button>' +
        '</div>';
      card.querySelector(".js-preview").addEventListener("click", function () { openTaxModal(d); });
      card.querySelector(".js-dl").addEventListener("click", function (e) { download(e.currentTarget, d.title); });
      taxGrid.appendChild(card);
    });
    taxCount.textContent = rows.length + (rows.length === 1 ? " document" : " documents");
    taxEmpty.hidden = rows.length !== 0;
  }

  function renderAll() { renderStatements(); renderTax(); }

  // ---------- Download (simulated) ----------
  function download(btn, label) {
    if (btn.dataset.busy) return;
    btn.dataset.busy = "1";
    var original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Preparing…";
    setTimeout(function () {
      btn.disabled = false;
      btn.innerHTML = original;
      delete btn.dataset.busy;
      toast(label + " downloaded (PDF)");
    }, 850);
  }

  // ---------- Modal ----------
  var overlay = document.getElementById("overlay");
  var modalTitle = document.getElementById("modalTitle");
  var modalMeta = document.getElementById("modalMeta");
  var docPaper = document.getElementById("docPaper");
  var modalDownload = document.getElementById("modalDownload");
  var modalClose = document.getElementById("modalClose");
  var activeLabel = "";

  function openModal(s) {
    activeLabel = "Statement " + s.period;
    modalTitle.textContent = "Statement preview";
    modalMeta.textContent = "Everyday Current · " + s.range;
    var net = s.credits - s.debits;
    docPaper.innerHTML =
      '<div class="dp-head">' +
        '<div class="dp-bank">Northbank<span>Everyday Current · •••• 4242</span></div>' +
        '<div class="dp-meta">Statement period<br><strong>' + s.range + '</strong><br>IBAN GB29 NWBK 0000 0011</div>' +
      '</div>' +
      '<div class="dp-row"><span>Opening balance</span><span class="debit tnum">' + GBP.format(s.opening) + '</span></div>' +
      '<div class="dp-row"><span>Total credits</span><span class="credit tnum">+' + GBP.format(s.credits) + '</span></div>' +
      '<div class="dp-row"><span>Total debits</span><span class="debit tnum">−' + GBP.format(s.debits) + '</span></div>' +
      '<div class="dp-row"><span>Net movement</span><span class="' + (net >= 0 ? "credit" : "debit") + ' tnum">' + (net >= 0 ? "+" : "−") + GBP.format(Math.abs(net)) + '</span></div>' +
      '<div class="dp-total"><span>Closing balance</span><span class="tnum">' + GBP.format(s.balance) + '</span></div>';
    showOverlay();
  }

  function openTaxModal(d) {
    activeLabel = d.title;
    modalTitle.textContent = "Document preview";
    modalMeta.textContent = (d.kind === "tax" ? "Tax certificate" : "Interest summary") + " · " + d.year;
    docPaper.innerHTML =
      '<div class="dp-head">' +
        '<div class="dp-bank">Northbank<span>' + (d.kind === "tax" ? "Annual tax certificate" : "Gross interest summary") + '</span></div>' +
        '<div class="dp-meta">Tax year<br><strong>' + d.title.replace(/^[^0-9]+/, "") + '</strong><br>Ref ' + d.id.toUpperCase() + '</div>' +
      '</div>' +
      '<div class="dp-row"><span>Account holder</span><span>A. Mercer</span></div>' +
      '<div class="dp-row"><span>Gross interest paid</span><span class="credit tnum">' + GBP.format(d.kind === "tax" ? 312.48 : 184.20) + '</span></div>' +
      '<div class="dp-row"><span>Tax deducted at source</span><span class="debit tnum">' + GBP.format(0.00) + '</span></div>' +
      '<div class="dp-total"><span>Net interest</span><span class="tnum">' + GBP.format(d.kind === "tax" ? 312.48 : 184.20) + '</span></div>';
    showOverlay();
  }

  function showOverlay() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }
  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeModal(); });
  modalDownload.addEventListener("click", function () { download(modalDownload, activeLabel); });

  // ---------- Filters wiring ----------
  var yearTabs = document.getElementById("yearTabs");
  yearTabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".year-tab");
    if (!btn) return;
    state.year = btn.dataset.year;
    Array.prototype.forEach.call(yearTabs.children, function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderAll();
  });

  var search = document.getElementById("search");
  search.addEventListener("input", function () {
    state.query = search.value.trim().toLowerCase();
    renderAll();
  });

  renderAll();
})();
