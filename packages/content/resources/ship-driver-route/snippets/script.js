(function () {
  "use strict";

  // ── Fictional route data ──────────────────────────────────────────────
  var stops = [
    { name: "Marisol Ferrer",  addr: "418 Larkspur Ave, Apt 3B",  note: "Leave at door · Buzzer #3 · 2 bags", eta: 6,  pay: 8.25,  pos: { left: "41%", top: "50%" } },
    { name: "Devin Okafor",    addr: "77 Chestnut Row",            note: "Hand to customer · ID check",        eta: 11, pay: 9.10,  pos: { left: "62%", top: "34%" } },
    { name: "Hana Whitfield",  addr: "1290 Beacon Hill, Unit 12",  note: "Gate code 4471 · Cold bag",          eta: 17, pay: 7.40,  pos: { left: "80%", top: "20%" } },
    { name: "Theo Marchetti",  addr: "5 Cedar Court",              note: "Ring once · No contact",             eta: 24, pay: 10.55, pos: { left: "88%", top: "11%" } },
    { name: "Aisha Bello",     addr: "33 Riverside Walk",          note: "Lobby desk · Tip prepaid",           eta: 31, pay: 11.20, pos: { left: "94%", top: "6%" } }
  ];

  var current = 0;            // index of next stop
  var earnings = 148.50;
  var avgMile = 1.4;          // mi between stops, fictional

  // ── Element refs ──────────────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  var nextCard = $("nextCard"), nextSeq = $("nextSeq"), nextEta = $("nextEta");
  var nextName = $("nextName"), nextAddr = $("nextAddr"), nextNote = $("nextNote");
  var stopList = $("stopList"), earnAmount = $("earnAmount");
  var stopsLeftChip = $("stopsLeftChip"), milesChip = $("milesChip");
  var driverMarker = $("driverMarker");
  var toastWrap = $("toastWrap");

  // ── Toast helper ──────────────────────────────────────────────────────
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2400);
  }

  function money(n) { return "$" + n.toFixed(2); }

  // ── Render next-stop card ─────────────────────────────────────────────
  function renderNext() {
    if (current >= stops.length) {
      nextSeq.textContent = "Route complete";
      nextEta.textContent = "Done";
      nextName.textContent = "All stops delivered";
      nextAddr.textContent = "Great shift — head back to base.";
      nextNote.textContent = "";
      var ca = nextCard.querySelector(".next-actions");
      if (ca) ca.style.display = "none";
      return;
    }
    var s = stops[current];
    nextSeq.textContent = "Stop " + (current + 1) + " of " + stops.length;
    nextEta.textContent = "ETA " + s.eta + " min";
    nextName.textContent = s.name;
    nextAddr.textContent = s.addr;
    nextNote.textContent = s.note;
    nextCard.classList.remove("advancing");
    void nextCard.offsetWidth;            // reflow to restart animation
    nextCard.classList.add("advancing");

    // move driver marker toward the active stop
    if (s.pos) {
      driverMarker.style.left = s.pos.left;
      driverMarker.style.top = s.pos.top;
    }
  }

  // ── Render remaining-stops list ───────────────────────────────────────
  function renderList() {
    stopList.innerHTML = "";
    stops.forEach(function (s, i) {
      var li = document.createElement("li");
      li.className = "stop-row";
      if (i < current) li.classList.add("is-done");
      else if (i === current) li.classList.add("is-next");

      var status = i < current
        ? '<span class="pill delivered">Delivered</span>'
        : '<span class="pill pending">Pending</span>';

      li.innerHTML =
        '<span class="seq-num">' + (i < current ? "✓" : (i + 1)) + '</span>' +
        '<div class="stop-main">' +
          '<div class="stop-name">' + s.name + '</div>' +
          '<div class="stop-addr">' + s.addr + '</div>' +
        '</div>' +
        '<div class="stop-side">' +
          '<div class="stop-eta">' + (i < current ? "—" : s.eta + " min") + '</div>' +
          status +
        '</div>';
      stopList.appendChild(li);
    });

    var left = stops.length - current;
    stopsLeftChip.textContent = left;
    milesChip.textContent = (left * avgMile).toFixed(1);
  }

  function renderEarnings() { earnAmount.textContent = money(earnings); }

  function renderAll() { renderNext(); renderList(); renderEarnings(); }

  // ── Complete current stop ─────────────────────────────────────────────
  $("completeBtn").addEventListener("click", function () {
    if (current >= stops.length) return;
    var s = stops[current];
    earnings += s.pay;
    current += 1;
    toast("Delivered to " + s.name.split(" ")[0] + " · +" + money(s.pay), "ok");
    renderAll();
    if (current >= stops.length) {
      setTimeout(function () { toast("Route complete — nice work!", "ok"); }, 600);
    }
  });

  $("navBtn").addEventListener("click", function () {
    if (current >= stops.length) return;
    toast("Navigating to " + stops[current].addr);
  });

  $("callBtn").addEventListener("click", function () {
    if (current >= stops.length) return;
    toast("Calling " + stops[current].name + "…");
  });

  $("recenterBtn").addEventListener("click", function () {
    toast("Map recentered on your location");
  });

  $("menuBtn").addEventListener("click", function () {
    toast("Menu — earnings, support, settings");
  });

  // ── Collapse / expand stop list ───────────────────────────────────────
  var collapseBtn = $("collapseBtn");
  collapseBtn.addEventListener("click", function () {
    var expanded = collapseBtn.getAttribute("aria-expanded") === "true";
    if (expanded) {
      stopList.style.maxHeight = stopList.scrollHeight + "px";
      void stopList.offsetWidth;
      stopList.classList.add("collapsed");
      collapseBtn.firstChild.textContent = "Expand ";
    } else {
      stopList.classList.remove("collapsed");
      stopList.style.maxHeight = stopList.scrollHeight + "px";
      collapseBtn.firstChild.textContent = "Collapse ";
      setTimeout(function () { stopList.style.maxHeight = ""; }, 320);
    }
    collapseBtn.setAttribute("aria-expanded", String(!expanded));
  });

  // ── New-order sheet ───────────────────────────────────────────────────
  var orderSheet = $("orderSheet"), orderBackdrop = $("orderBackdrop");
  var orderCount = $("orderCount"), ringFg = $("ringFg");
  var orderTimer = null, orderSecs = 12;
  var newOrder = { name: "Sunrise Tacos", drop: "91 Cedar Lane, Unit 7", eta: 14, pay: 11.75, pos: { left: "70%", top: "44%" } };

  function openOrder() {
    orderSecs = 12;
    orderCount.textContent = orderSecs;
    ringFg.style.strokeDashoffset = "0";
    ringFg.style.stroke = "var(--brand)";
    orderBackdrop.hidden = false;
    orderSheet.hidden = false;
    $("acceptBtn").focus();

    orderTimer = setInterval(function () {
      orderSecs -= 1;
      orderCount.textContent = Math.max(orderSecs, 0);
      ringFg.style.strokeDashoffset = String(((12 - orderSecs) / 12) * 100);
      if (orderSecs <= 4) ringFg.style.stroke = "var(--danger)";
      if (orderSecs <= 0) { declineOrder(true); }
    }, 1000);
  }

  function closeOrder() {
    if (orderTimer) { clearInterval(orderTimer); orderTimer = null; }
    orderBackdrop.hidden = true;
    orderSheet.hidden = true;
  }

  function declineOrder(expired) {
    closeOrder();
    toast(expired ? "Offer expired" : "Order declined", "warn");
  }

  $("acceptBtn").addEventListener("click", function () {
    closeOrder();
    stops.push({
      name: newOrder.name + " → " + newOrder.drop.split(",")[0],
      addr: newOrder.drop,
      note: "Pickup at " + newOrder.name + " · earn " + money(newOrder.pay),
      eta: stops.length ? stops[stops.length - 1].eta + newOrder.eta : newOrder.eta,
      pay: newOrder.pay,
      pos: newOrder.pos
    });
    renderAll();
    toast("Order accepted · +" + money(newOrder.pay) + " queued", "ok");
  });

  $("declineBtn").addEventListener("click", function () { declineOrder(false); });
  orderBackdrop.addEventListener("click", function () { declineOrder(false); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !orderSheet.hidden) declineOrder(false);
  });

  // ── Boot ──────────────────────────────────────────────────────────────
  renderAll();
  // surface a new-order offer shortly after load
  setTimeout(openOrder, 4000);
})();
