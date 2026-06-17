(function () {
  "use strict";

  // ---------- Data (fictional) ----------
  var accounts = [
    { id: "chk", type: "Checking", name: "Everyday Checking", num: "4821", balance: 12480.55, kind: "checking" },
    { id: "sav", type: "Savings", name: "High-Yield Savings", num: "9037", balance: 38420.18, kind: "savings" },
    { id: "crd", type: "Credit", name: "Aurora Rewards Card", num: "4242", balance: -2683.11, kind: "credit" }
  ];

  var spending = [
    { name: "Groceries", amount: 842, color: "#3b6ef6" },
    { name: "Dining", amount: 631, color: "#0fb5a6" },
    { name: "Transport", amount: 498, color: "#7c5cff" },
    { name: "Shopping", amount: 612, color: "#d9982b" },
    { name: "Bills & Utilities", amount: 557, color: "#697089" }
  ];

  var transactions = [
    { name: "Salary — Lumen Studios", merchant: "Direct deposit", amount: 4250.00, dir: "in", status: "cleared", date: "Jun 14", acct: "chk", color: "#1f9d62", ico: "↓" },
    { name: "Whole Foods Market", merchant: "Groceries", amount: -86.42, dir: "out", status: "cleared", date: "Jun 13", acct: "chk", color: "#3b6ef6", ico: "🛒" },
    { name: "Aurora Card payment", merchant: "Transfer", amount: -500.00, dir: "out", status: "pending", date: "Jun 13", acct: "crd", color: "#7c5cff", ico: "⇄" },
    { name: "Blue Bottle Coffee", merchant: "Dining", amount: -7.80, dir: "out", status: "cleared", date: "Jun 12", acct: "chk", color: "#0fb5a6", ico: "☕" },
    { name: "Northwind Transit", merchant: "Transport", amount: -42.00, dir: "out", status: "cleared", date: "Jun 12", acct: "chk", color: "#7c5cff", ico: "🚆" },
    { name: "Refund — Atlas Outfitters", merchant: "Shopping", amount: 64.99, dir: "in", status: "cleared", date: "Jun 11", acct: "crd", color: "#1f9d62", ico: "↩" },
    { name: "Stride Gym", merchant: "Health", amount: -29.00, dir: "out", status: "failed", date: "Jun 11", acct: "chk", color: "#d4493e", ico: "✕" },
    { name: "Lyra Streaming", merchant: "Bills & Utilities", amount: -15.99, dir: "out", status: "cleared", date: "Jun 10", acct: "crd", color: "#697089", ico: "▶" },
    { name: "Interest earned", merchant: "Savings", amount: 38.21, dir: "in", status: "cleared", date: "Jun 10", acct: "sav", color: "#1f9d62", ico: "%" }
  ];

  var bills = [
    { name: "Rent — Maple Court", due: "Due Jun 18", amount: 1850.00, soon: true, ico: "🏠" },
    { name: "Electric — VoltCo", due: "Due Jun 20", amount: 96.40, soon: true, ico: "⚡" },
    { name: "Internet — FiberLink", due: "Due Jun 27", amount: 59.99, soon: false, ico: "🌐" },
    { name: "Phone — Cell+", due: "Due Jul 02", amount: 44.00, soon: false, ico: "📱" }
  ];

  // ---------- State ----------
  var balancesHidden = false;
  var activeAcct = "all"; // "all" or account id
  var txFilter = "all";

  // ---------- Helpers ----------
  function fmt(n) {
    var sign = n < 0 ? "-" : "";
    return sign + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmt0(n) {
    return "$" + Math.round(Math.abs(n)).toLocaleString("en-US");
  }
  function mask(amtText) {
    return balancesHidden ? "••••••" : amtText;
  }
  function el(id) { return document.getElementById(id); }

  // ---------- Toast ----------
  function toast(msg) {
    var wrap = el("toastWrap");
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="t-ico">✓</span>' + msg;
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
    }, 2400);
  }

  // ---------- Render: total balance ----------
  function renderTotal() {
    var total = accounts.reduce(function (s, a) { return s + a.balance; }, 0);
    var node = el("totalBalance");
    node.textContent = mask(fmt(total));
    node.classList.toggle("is-hidden-amt", balancesHidden);
  }

  // ---------- Render: accounts ----------
  function renderAccounts() {
    var list = el("acctList");
    list.innerHTML = "";
    accounts.forEach(function (a) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "acct " + a.kind + (activeAcct === a.id ? " is-active" : "");
      card.setAttribute("aria-pressed", activeAcct === a.id ? "true" : "false");
      var balLabel = a.kind === "credit" ? "Balance owed" : "Available";
      var balVal = a.kind === "credit" ? Math.abs(a.balance) : a.balance;
      card.innerHTML =
        '<div class="acct-top">' +
          '<span class="acct-type">' + a.type + '</span>' +
          '<span class="acct-chip" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="acct-num mono">•••• •••• •••• ' + a.num + '</div>' +
        '<div class="acct-bot">' +
          '<div class="acct-bal-label">' + balLabel + '</div>' +
          '<div class="acct-bal mono">' + mask(fmt0(balVal)) + '</div>' +
        '</div>';
      card.addEventListener("click", function () {
        activeAcct = (activeAcct === a.id) ? "all" : a.id;
        renderAccounts();
        renderTransactions();
        toast(activeAcct === "all" ? "Showing all accounts" : "Filtered to " + a.name);
      });
      list.appendChild(card);
    });
  }

  // ---------- Render: spending donut ----------
  function renderSpending() {
    var total = spending.reduce(function (s, c) { return s + c.amount; }, 0);
    var donut = el("donut");
    var stops = [];
    var acc = 0;
    spending.forEach(function (c) {
      var start = (acc / total) * 360;
      acc += c.amount;
      var end = (acc / total) * 360;
      stops.push(c.color + " " + start.toFixed(1) + "deg " + end.toFixed(1) + "deg");
    });
    donut.style.background = "conic-gradient(" + stops.join(", ") + ")";

    el("spendTotal").textContent = mask(fmt0(total));

    var legend = el("legend");
    legend.innerHTML = "";
    spending.forEach(function (c) {
      var pct = Math.round((c.amount / total) * 100);
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="dot" style="background:' + c.color + '"></span>' +
        '<span class="lg-name">' + c.name + '</span>' +
        '<span class="lg-amt mono">' + mask(fmt0(c.amount)) + '</span>' +
        '<span class="lg-pct mono">' + pct + '%</span>';
      legend.appendChild(li);
    });
  }

  // ---------- Render: transactions ----------
  function renderTransactions() {
    var list = el("txList");
    list.innerHTML = "";
    var rows = transactions.filter(function (t) {
      if (activeAcct !== "all" && t.acct !== activeAcct) return false;
      if (txFilter === "in") return t.dir === "in";
      if (txFilter === "out") return t.dir === "out";
      return true;
    });

    if (rows.length === 0) {
      var empty = document.createElement("li");
      empty.className = "tx-empty";
      empty.textContent = "No transactions match this filter.";
      list.appendChild(empty);
      return;
    }

    rows.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "tx-row";
      var cls = t.amount >= 0 ? "credit" : "debit";
      var amtTxt = (t.amount >= 0 ? "+" : "") + fmt(t.amount);
      li.innerHTML =
        '<span class="tx-ico" style="background:' + t.color + '">' + t.ico + '</span>' +
        '<span class="tx-mid">' +
          '<div class="tx-name">' + t.name + '</div>' +
          '<div class="tx-meta">' + t.merchant + ' · ' + t.date +
            ' <span class="status ' + t.status + '">' + t.status + '</span>' +
          '</div>' +
        '</span>' +
        '<span class="tx-amt ' + cls + ' mono">' + mask(amtTxt) + '</span>';
      list.appendChild(li);
    });
  }

  // ---------- Render: bills ----------
  function renderBills() {
    var list = el("billsList");
    list.innerHTML = "";
    bills.forEach(function (b, i) {
      var li = document.createElement("li");
      li.className = "bill";
      li.innerHTML =
        '<span class="bill-ico" aria-hidden="true">' + b.ico + '</span>' +
        '<span>' +
          '<div class="bill-name">' + b.name + '</div>' +
          '<div class="bill-due' + (b.soon ? ' soon' : '') + '">' + b.due + '</div>' +
        '</span>' +
        '<span class="bill-right">' +
          '<div class="bill-amt mono">' + mask(fmt(b.amount)) + '</div>' +
          '<button class="bill-pay" type="button" data-i="' + i + '">Pay now</button>' +
        '</span>';
      list.appendChild(li);
    });
    var dueCount = bills.filter(function (b) { return b.soon; }).length;
    el("billsDue").textContent = dueCount + " due soon";
  }

  // ---------- Toggle balances ----------
  function toggleBalances() {
    balancesHidden = !balancesHidden;
    var btn = el("eyeBtn");
    btn.setAttribute("aria-pressed", balancesHidden ? "true" : "false");
    el("eyeLabel").textContent = balancesHidden ? "Show balances" : "Hide balances";
    renderAll();
    toast(balancesHidden ? "Balances hidden" : "Balances visible");
  }

  // ---------- Render all ----------
  function renderAll() {
    renderTotal();
    renderAccounts();
    renderSpending();
    renderTransactions();
    renderBills();
  }

  // ---------- Events ----------
  document.addEventListener("DOMContentLoaded", function () {
    renderAll();

    el("eyeBtn").addEventListener("click", toggleBalances);

    // Quick actions
    Array.prototype.forEach.call(document.querySelectorAll(".qa"), function (b) {
      b.addEventListener("click", function () {
        toast(b.getAttribute("data-action") + " — opening flow…");
      });
    });

    // Tx filter chips
    Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) {
      c.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (x) {
          x.classList.remove("is-active");
          x.setAttribute("aria-selected", "false");
        });
        c.classList.add("is-active");
        c.setAttribute("aria-selected", "true");
        txFilter = c.getAttribute("data-filter");
        renderTransactions();
      });
    });

    // Header / generic data-action buttons
    Array.prototype.forEach.call(document.querySelectorAll("[data-action]:not(.qa)"), function (b) {
      b.addEventListener("click", function () {
        toast(b.getAttribute("data-action") + " — coming soon");
      });
    });

    // Bill pay (event delegation)
    el("billsList").addEventListener("click", function (e) {
      var btn = e.target.closest(".bill-pay");
      if (!btn) return;
      var b = bills[+btn.getAttribute("data-i")];
      toast("Scheduled payment for " + b.name);
    });
  });
})();
