(function () {
  "use strict";

  var TAX_RATE = 0.06875;
  var usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  var timeBody = document.getElementById("timeBody");
  var expBody = document.getElementById("expBody");
  var feeSubEl = document.getElementById("feeSub");
  var expSubEl = document.getElementById("expSub");
  var taxEl = document.getElementById("taxAmt");
  var totalEl = document.getElementById("totalDue");
  var badge = document.getElementById("statusBadge");
  var paidRow = document.getElementById("paidRow");
  var paidAmtEl = document.getElementById("paidAmt");
  var payBtn = document.getElementById("payBtn");
  var printBtn = document.getElementById("printBtn");

  var paid = 0; // amount paid so far

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  // Fill per-row amounts and return the section subtotal.
  function fillTimeRows() {
    var subtotal = 0;
    var rows = timeBody ? timeBody.querySelectorAll("tr") : [];
    rows.forEach(function (row) {
      var hours = parseFloat(row.getAttribute("data-hours")) || 0;
      var rate = parseFloat(row.getAttribute("data-rate")) || 0;
      var amount = round(hours * rate);
      subtotal += amount;
      var cell = row.querySelector(".amt");
      if (cell) cell.textContent = usd.format(amount);
    });
    return round(subtotal);
  }

  function fillExpenseRows() {
    var subtotal = 0;
    var rows = expBody ? expBody.querySelectorAll("tr") : [];
    rows.forEach(function (row) {
      var amount = parseFloat(row.getAttribute("data-amount")) || 0;
      subtotal += amount;
      var cell = row.querySelector(".amt");
      if (cell) cell.textContent = usd.format(amount);
    });
    return round(subtotal);
  }

  function setStatus(state, balance, grand) {
    badge.classList.remove(
      "status__badge--unpaid",
      "status__badge--partial",
      "status__badge--paid"
    );
    if (state === "paid") {
      badge.classList.add("status__badge--paid");
      badge.textContent = "Paid";
    } else if (state === "partial") {
      badge.classList.add("status__badge--partial");
      badge.textContent = "Partially paid";
    } else {
      badge.classList.add("status__badge--unpaid");
      badge.textContent = "Unpaid";
    }
  }

  function recalc() {
    var fees = fillTimeRows();
    var expenses = fillExpenseRows();
    var tax = round((fees + expenses) * TAX_RATE);
    var grand = round(fees + expenses + tax);
    var balance = round(grand - paid);

    feeSubEl.textContent = usd.format(fees);
    expSubEl.textContent = usd.format(expenses);
    taxEl.textContent = usd.format(tax);
    totalEl.textContent = usd.format(balance > 0 ? balance : 0);

    if (paid > 0) {
      paidRow.hidden = false;
      paidAmtEl.textContent = "−" + usd.format(paid);
    } else {
      paidRow.hidden = true;
    }

    if (balance <= 0.005) {
      setStatus("paid", balance, grand);
      payBtn.disabled = true;
      payBtn.textContent = "Paid in full";
    } else if (paid > 0) {
      setStatus("partial", balance, grand);
    } else {
      setStatus("unpaid", balance, grand);
    }

    return grand;
  }

  // Simulate a payment: settle the full outstanding balance.
  function handlePay() {
    var grand = recalc();
    payBtn.disabled = true;
    payBtn.textContent = "Processing…";
    setTimeout(function () {
      paid = grand;
      recalc();
    }, 700);
  }

  if (payBtn) payBtn.addEventListener("click", handlePay);
  if (printBtn)
    printBtn.addEventListener("click", function () {
      window.print();
    });

  recalc();
})();
