(function () {
  "use strict";

  var LABOR_RATE = 145.0;
  var SHOP_FEE = 24.5;
  var TAX_RATE = 0.0825;

  var labor = [
    { id: lid(), desc: "Diagnose cylinder 1 misfire", hours: 1.5 },
    { id: lid(), desc: "DPF differential pressure test & regen", hours: 1.0 },
    { id: lid(), desc: "Replace glow plug harness", hours: 0.8 }
  ];

  var parts = [
    { id: lid(), desc: "Glow plug harness — OEM 68211010AA", qty: 1, price: 184.6 },
    { id: lid(), desc: "Engine oil 15W-40 (gal)", qty: 3, price: 21.4 },
    { id: lid(), desc: "Fuel filter kit", qty: 1, price: 96.8 }
  ];

  var status = "inprogress";

  function lid() {
    return "x" + Math.random().toString(36).slice(2, 9);
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var laborWrap = document.getElementById("labor-lines");
  var partWrap = document.getElementById("part-lines");
  var laborEmpty = document.getElementById("labor-empty");
  var partEmpty = document.getElementById("part-empty");

  var delIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';

  function renderLabor() {
    laborWrap.innerHTML = "";
    labor.forEach(function (l) {
      var row = document.createElement("div");
      row.className = "line labor";
      row.setAttribute("role", "listitem");
      row.dataset.id = l.id;
      row.innerHTML =
        '<input class="line-desc" type="text" value="" aria-label="Labor description" />' +
        '<div class="num-field"><label>Hours</label><input class="f-hours" type="number" min="0" step="0.1" inputmode="decimal" value="' +
        l.hours +
        '" aria-label="Labor hours" /></div>' +
        '<div class="line-total">' +
        money(l.hours * LABOR_RATE) +
        "</div>" +
        '<button class="btn-del" type="button" aria-label="Remove labor line">' +
        delIcon +
        "</button>";
      row.querySelector(".line-desc").value = l.desc;
      laborWrap.appendChild(row);
    });
    laborEmpty.hidden = labor.length > 0;
  }

  function renderParts() {
    partWrap.innerHTML = "";
    parts.forEach(function (p) {
      var row = document.createElement("div");
      row.className = "line part";
      row.setAttribute("role", "listitem");
      row.dataset.id = p.id;
      row.innerHTML =
        '<input class="line-desc" type="text" value="" aria-label="Part description" />' +
        '<div class="num-field"><label>Qty</label><input class="f-qty" type="number" min="0" step="1" inputmode="numeric" value="' +
        p.qty +
        '" aria-label="Quantity" /></div>' +
        '<div class="num-field"><label>Unit $</label><input class="f-price" type="number" min="0" step="0.01" inputmode="decimal" value="' +
        p.price +
        '" aria-label="Unit price" /></div>' +
        '<div class="line-total">' +
        money(p.qty * p.price) +
        "</div>" +
        '<button class="btn-del" type="button" aria-label="Remove part line">' +
        delIcon +
        "</button>";
      row.querySelector(".line-desc").value = p.desc;
      partWrap.appendChild(row);
    });
    partEmpty.hidden = parts.length > 0;
  }

  function totals() {
    var laborHours = labor.reduce(function (s, l) {
      return s + (parseFloat(l.hours) || 0);
    }, 0);
    var laborSum = laborHours * LABOR_RATE;
    var partsSum = parts.reduce(function (s, p) {
      return s + (parseFloat(p.qty) || 0) * (parseFloat(p.price) || 0);
    }, 0);
    var fee = labor.length || parts.length ? SHOP_FEE : 0;
    var taxable = laborSum + partsSum + fee;
    var tax = taxable * TAX_RATE;
    var grand = taxable + tax;

    document.getElementById("labor-hours").textContent = laborHours.toLocaleString("en-US", {
      maximumFractionDigits: 1
    });
    document.getElementById("t-labor").textContent = money(laborSum);
    document.getElementById("t-parts").textContent = money(partsSum);
    document.getElementById("t-fee").textContent = money(fee);
    document.getElementById("t-tax").textContent = money(tax);
    document.getElementById("t-grand").textContent = money(grand);
  }

  function refreshLineTotals() {
    Array.prototype.forEach.call(laborWrap.children, function (row) {
      var l = labor.find(function (x) {
        return x.id === row.dataset.id;
      });
      if (l) row.querySelector(".line-total").textContent = money((parseFloat(l.hours) || 0) * LABOR_RATE);
    });
    Array.prototype.forEach.call(partWrap.children, function (row) {
      var p = parts.find(function (x) {
        return x.id === row.dataset.id;
      });
      if (p)
        row.querySelector(".line-total").textContent = money(
          (parseFloat(p.qty) || 0) * (parseFloat(p.price) || 0)
        );
    });
    totals();
  }

  /* Labor events */
  laborWrap.addEventListener("input", function (e) {
    var row = e.target.closest(".line");
    if (!row) return;
    var l = labor.find(function (x) {
      return x.id === row.dataset.id;
    });
    if (!l) return;
    if (e.target.classList.contains("line-desc")) l.desc = e.target.value;
    if (e.target.classList.contains("f-hours")) l.hours = e.target.value;
    refreshLineTotals();
  });
  laborWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-del");
    if (!btn) return;
    var row = btn.closest(".line");
    var id = row.dataset.id;
    labor = labor.filter(function (x) {
      return x.id !== id;
    });
    renderLabor();
    totals();
    toast("Labor line removed");
  });

  /* Part events */
  partWrap.addEventListener("input", function (e) {
    var row = e.target.closest(".line");
    if (!row) return;
    var p = parts.find(function (x) {
      return x.id === row.dataset.id;
    });
    if (!p) return;
    if (e.target.classList.contains("line-desc")) p.desc = e.target.value;
    if (e.target.classList.contains("f-qty")) p.qty = e.target.value;
    if (e.target.classList.contains("f-price")) p.price = e.target.value;
    refreshLineTotals();
  });
  partWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-del");
    if (!btn) return;
    var row = btn.closest(".line");
    var id = row.dataset.id;
    parts = parts.filter(function (x) {
      return x.id !== id;
    });
    renderParts();
    totals();
    toast("Part removed");
  });

  /* Add buttons */
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.add === "labor") {
        labor.push({ id: lid(), desc: "New labor operation", hours: 0.5 });
        renderLabor();
        focusLast(laborWrap);
        toast("Labor line added");
      } else {
        parts.push({ id: lid(), desc: "New part", qty: 1, price: 0 });
        renderParts();
        focusLast(partWrap);
        toast("Part line added");
      }
      totals();
    });
  });

  function focusLast(wrap) {
    var last = wrap.lastElementChild;
    if (last) {
      var input = last.querySelector(".line-desc");
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  /* Status */
  var pills = document.querySelectorAll(".status-pill");
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("is-active");
        p.setAttribute("aria-pressed", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-pressed", "true");
      status = pill.dataset.status;
      var labels = { waiting: "Waiting", inprogress: "In Progress", done: "Done", hold: "On Hold" };
      toast("Status → " + labels[status]);
    });
  });

  /* Save / print */
  document.getElementById("save-btn").addEventListener("click", function () {
    var stamp = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    document.getElementById("saved-line").textContent = "Saved at " + stamp + " · " + labor.length + " labor, " + parts.length + " parts";
    toast("Work order #WO-48217 saved");
  });
  document.getElementById("print-btn").addEventListener("click", function () {
    toast("Sending to shop printer…");
  });

  /* Toast */
  var toastWrap = document.getElementById("toast-wrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="t-dot"></span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("show");
    });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        el.remove();
      }, 220);
    }, 2400);
  }

  /* Init */
  renderLabor();
  renderParts();
  totals();
})();
