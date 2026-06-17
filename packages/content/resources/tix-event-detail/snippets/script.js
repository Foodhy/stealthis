(function () {
  "use strict";

  var MAX_TOTAL = 8;
  var FEE_RATE = 0.12;
  var COLORS = { ga: "#38bdf8", vip: "#a855f7", plat: "#f59e0b" };

  var tierList = document.getElementById("tierList");
  var tiers = Array.prototype.slice.call(tierList.querySelectorAll(".tier"));
  var summaryLines = document.getElementById("summaryLines");
  var subTotalEl = document.getElementById("subTotal");
  var feeTotalEl = document.getElementById("feeTotal");
  var grandTotalEl = document.getElementById("grandTotal");
  var stickyBar = document.getElementById("stickyBar");
  var stickyQty = document.getElementById("stickyQty");
  var stickyTotal = document.getElementById("stickyTotal");
  var lowStockPill = document.getElementById("lowStockPill");
  var toastEl = document.getElementById("toast");

  var state = {}; // tier -> qty

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function totalCount() {
    return Object.keys(state).reduce(function (a, k) { return a + state[k]; }, 0);
  }

  function meta(tier) {
    return {
      id: tier.getAttribute("data-tier"),
      price: parseFloat(tier.getAttribute("data-price")),
      stock: parseInt(tier.getAttribute("data-stock"), 10),
      color: tier.getAttribute("data-color"),
      name: tier.querySelector("h3").firstChild.textContent.trim()
    };
  }

  function setQty(tier, qty) {
    var m = meta(tier);
    qty = Math.max(0, Math.min(qty, m.stock));
    var others = totalCount() - (state[m.id] || 0);
    if (others + qty > MAX_TOTAL) {
      qty = MAX_TOTAL - others;
      toast("Max " + MAX_TOTAL + " tickets per order");
    }
    state[m.id] = qty;
    tier.querySelector(".step__val").textContent = qty;
    tier.classList.toggle("is-selected", qty > 0);
    render();
  }

  function render() {
    var sub = 0;
    var lines = [];
    tiers.forEach(function (tier) {
      var m = meta(tier);
      var qty = state[m.id] || 0;
      if (qty > 0) {
        sub += qty * m.price;
        lines.push(
          '<li class="summary__line"><span class="ln-name">' +
          '<i style="background:' + COLORS[m.color] + '"></i>' +
          m.name + ' <small>×' + qty + '</small></span>' +
          '<b>' + money(qty * m.price) + '</b></li>'
        );
      }
    });

    var fee = sub * FEE_RATE;
    var grand = sub + fee;
    var count = totalCount();

    summaryLines.innerHTML = lines.length
      ? lines.join("")
      : '<li class="summary__empty">No tickets selected yet.</li>';

    subTotalEl.textContent = money(sub);
    feeTotalEl.textContent = money(fee);
    grandTotalEl.textContent = money(grand);

    document.getElementById("checkoutSide").disabled = count === 0;

    stickyQty.textContent = count + (count === 1 ? " ticket" : " tickets");
    stickyTotal.textContent = money(grand);
    stickyBar.hidden = count === 0;
  }

  // Stepper handlers
  tiers.forEach(function (tier) {
    var minus = tier.querySelector(".step--minus");
    var plus = tier.querySelector(".step--plus");
    minus.addEventListener("click", function () { setQty(tier, (state[meta(tier).id] || 0) - 1); });
    plus.addEventListener("click", function () { setQty(tier, (state[meta(tier).id] || 0) + 1); });
  });

  // Low-stock pill (any available tier under 15)
  var anyLow = tiers.some(function (t) {
    var s = meta(t).stock;
    return s > 0 && s < 15;
  });
  if (anyLow && lowStockPill) lowStockPill.hidden = false;

  // Schedule tabs
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var day = tab.getAttribute("data-day");
      document.querySelectorAll(".sched").forEach(function (s) {
        s.hidden = s.getAttribute("data-day") !== day;
      });
    });
  });

  // Checkout actions
  function checkout() {
    var count = totalCount();
    if (count === 0) { toast("Pick at least one ticket first"); return; }
    toast("Reserved " + count + " ticket" + (count === 1 ? "" : "s") + " — held for 10:00");
  }
  document.getElementById("checkoutSide").addEventListener("click", checkout);
  document.getElementById("checkoutBar").addEventListener("click", checkout);

  // Misc buttons
  document.getElementById("shareBtn").addEventListener("click", function () {
    toast("Event link copied to clipboard");
  });
  document.getElementById("dirBtn").addEventListener("click", function () {
    toast("Opening directions to Aurora Riverside Grounds");
  });

  // Countdown to doors (Aug 22, 2026 16:00 local)
  var target = new Date(2026, 7, 22, 16, 0, 0).getTime();
  var cdEls = {
    d: document.querySelector('[data-cd="d"]'),
    h: document.querySelector('[data-cd="h"]'),
    m: document.querySelector('[data-cd="m"]'),
    s: document.querySelector('[data-cd="s"]')
  };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff / 1000);
    cdEls.d.textContent = pad(Math.floor(s / 86400));
    cdEls.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cdEls.m.textContent = pad(Math.floor((s % 3600) / 60));
    cdEls.s.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  // Smooth-scroll for in-page nav
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  render();
})();
