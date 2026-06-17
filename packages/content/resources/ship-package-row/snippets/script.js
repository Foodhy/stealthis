(function () {
  "use strict";

  // ---- Fictional shipment data ----
  var SHIPMENTS = [
    {
      id: "VF-7741-0Q",
      carrier: "QX", carrierColor: "#5b8def",
      from: "Lyon, FR", to: "Geneva, CH",
      status: "transit", progress: 58,
      etaLabel: "Arrives", eta: "Thu, 9:40 AM",
      history: [
        { t: "Label created", p: "Lyon hub", time: "Jun 14 · 08:12", s: "done" },
        { t: "Departed origin facility", p: "Lyon hub", time: "Jun 14 · 19:40", s: "done" },
        { t: "In transit to destination", p: "A40 corridor", time: "Jun 15 · 06:25", s: "now" },
        { t: "Out for delivery", p: "Geneva", time: "Pending", s: "pending" }
      ]
    },
    {
      id: "VF-3329-LM",
      carrier: "QX", carrierColor: "#ff5a2c",
      from: "Milan, IT", to: "Zürich, CH",
      status: "outfordelivery", progress: 88,
      etaLabel: "By", eta: "Today, 2:15 PM",
      history: [
        { t: "Departed origin facility", p: "Milan hub", time: "Jun 15 · 21:05", s: "done" },
        { t: "Arrived at delivery depot", p: "Zürich-West", time: "Jun 16 · 05:48", s: "done" },
        { t: "Out for delivery", p: "Driver: M. Keller", time: "Jun 16 · 08:30", s: "now" },
        { t: "Delivered", p: "Zürich", time: "Pending", s: "pending" }
      ]
    },
    {
      id: "VF-9012-PT",
      carrier: "BT", carrierColor: "#1f9d62",
      from: "Berlin, DE", to: "Vienna, AT",
      status: "delivered", progress: 100,
      etaLabel: "Delivered", eta: "Mon, 11:02 AM",
      history: [
        { t: "Departed origin facility", p: "Berlin hub", time: "Jun 12 · 18:20", s: "done" },
        { t: "Customs cleared", p: "Passau border", time: "Jun 13 · 04:10", s: "done" },
        { t: "Out for delivery", p: "Vienna", time: "Jun 14 · 09:15", s: "done" },
        { t: "Delivered — signed by R. Huber", p: "Vienna 1010", time: "Jun 14 · 11:02", s: "done" }
      ]
    },
    {
      id: "VF-5567-AX",
      carrier: "BT", carrierColor: "#d4493e",
      from: "Hamburg, DE", to: "Oslo, NO",
      status: "failed", progress: 72,
      etaLabel: "Exception", eta: "Address issue",
      history: [
        { t: "Departed origin facility", p: "Hamburg hub", time: "Jun 13 · 22:40", s: "done" },
        { t: "Arrived at delivery depot", p: "Oslo-Sør", time: "Jun 15 · 07:11", s: "done" },
        { t: "Delivery attempt failed", p: "Recipient unavailable", time: "Jun 16 · 13:50", s: "fail" },
        { t: "Awaiting new instructions", p: "Held at depot", time: "Pending", s: "pending" }
      ]
    },
    {
      id: "VF-1184-CK",
      carrier: "QX", carrierColor: "#5b8def",
      from: "Madrid, ES", to: "Lisbon, PT",
      status: "transit", progress: 34,
      etaLabel: "Arrives", eta: "Fri, 1:00 PM",
      history: [
        { t: "Label created", p: "Madrid hub", time: "Jun 16 · 07:00", s: "done" },
        { t: "Departed origin facility", p: "Madrid hub", time: "Jun 16 · 14:30", s: "now" },
        { t: "In transit to destination", p: "A-5 motorway", time: "Pending", s: "pending" },
        { t: "Out for delivery", p: "Lisbon", time: "Pending", s: "pending" }
      ]
    },
    {
      id: "VF-6620-WD",
      carrier: "BT", carrierColor: "#e89422",
      from: "Rotterdam, NL", to: "Antwerp, BE",
      status: "outfordelivery", progress: 91,
      etaLabel: "By", eta: "Today, 5:40 PM",
      history: [
        { t: "Arrived at delivery depot", p: "Antwerp-Noord", time: "Jun 16 · 06:00", s: "done" },
        { t: "Loaded on delivery van", p: "Route 12", time: "Jun 16 · 09:20", s: "done" },
        { t: "Out for delivery", p: "Driver: L. Peeters", time: "Jun 16 · 10:05", s: "now" },
        { t: "Delivered", p: "Antwerp", time: "Pending", s: "pending" }
      ]
    },
    {
      id: "VF-4408-RN",
      carrier: "QX", carrierColor: "#1f9d62",
      from: "Copenhagen, DK", to: "Malmö, SE",
      status: "delivered", progress: 100,
      etaLabel: "Delivered", eta: "Tue, 3:48 PM",
      history: [
        { t: "Departed origin facility", p: "Copenhagen hub", time: "Jun 13 · 11:00", s: "done" },
        { t: "Crossed Øresund bridge", p: "DK→SE", time: "Jun 13 · 13:25", s: "done" },
        { t: "Out for delivery", p: "Malmö", time: "Jun 13 · 14:40", s: "done" },
        { t: "Delivered — left at reception", p: "Malmö 211", time: "Jun 13 · 15:48", s: "done" }
      ]
    },
    {
      id: "VF-7793-JE",
      carrier: "BT", carrierColor: "#5b8def",
      from: "Warsaw, PL", to: "Prague, CZ",
      status: "transit", progress: 47,
      etaLabel: "Arrives", eta: "Sat, 10:20 AM",
      history: [
        { t: "Departed origin facility", p: "Warsaw hub", time: "Jun 15 · 20:10", s: "done" },
        { t: "Sorting at regional center", p: "Katowice", time: "Jun 16 · 03:30", s: "done" },
        { t: "In transit to destination", p: "D1 motorway", time: "Jun 16 · 09:00", s: "now" },
        { t: "Out for delivery", p: "Prague", time: "Pending", s: "pending" }
      ]
    }
  ];

  var STATUS_LABEL = {
    transit: "In transit",
    outfordelivery: "Out for delivery",
    delivered: "Delivered",
    failed: "Exception"
  };
  // mapping for filter buckets
  var FILTER_BUCKET = {
    transit: "transit",
    outfordelivery: "transit",
    delivered: "delivered",
    failed: "failed"
  };

  var ARROW_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
  var CHEV_SVG = '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

  var list = document.getElementById("shipList");
  var emptyState = document.getElementById("emptyState");
  var toastHost = document.getElementById("toastHost");

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function buildRow(d, i) {
    var li = document.createElement("li");
    li.className = "ship";
    li.dataset.status = d.status;
    li.dataset.bucket = FILTER_BUCKET[d.status];

    var etaClass = d.status === "delivered" ? "delivered" : d.status === "failed" ? "failed" : "";
    var panelId = "hist-" + i;

    var historyHtml = d.history.map(function (h) {
      var cls = h.s === "done" ? "done" : h.s === "now" ? "now" : h.s === "fail" ? "fail" : "";
      return (
        '<li class="tl-item ' + cls + '">' +
          '<span class="tl-text">' + esc(h.t) + '</span>' +
          '<span class="tl-place">' + esc(h.p) + '</span>' +
          '<span class="tl-time">' + esc(h.time) + '</span>' +
        "</li>"
      );
    }).join("");

    li.innerHTML =
      '<button class="ship-head" type="button" aria-expanded="false" aria-controls="' + panelId + '">' +
        '<span class="carrier" style="background:' + d.carrierColor + '" aria-hidden="true">' + esc(d.carrier) + '</span>' +
        '<span class="mid">' +
          '<span class="row-top">' +
            '<span class="track-no">' + esc(d.id) + '</span>' +
            '<span class="pill ' + d.status + '">' + STATUS_LABEL[d.status] + '</span>' +
          "</span>" +
          '<span class="route"><span class="city">' + esc(d.from) + '</span>' + ARROW_SVG + '<span class="city">' + esc(d.to) + '</span></span>' +
        "</span>" +
        '<span class="right">' +
          '<span class="eta"><span class="eta-label">' + esc(d.etaLabel) + '</span><span class="eta-val ' + etaClass + '">' + esc(d.eta) + '</span></span>' +
          CHEV_SVG +
        "</span>" +
      "</button>" +
      '<div class="bar-wrap"><div class="bar"><span data-progress="' + d.progress + '"></span></div></div>' +
      '<div class="history" id="' + panelId + '"><div class="inner">' +
        '<ul class="timeline">' + historyHtml + "</ul>" +
      "</div></div>";

    return li;
  }

  function render() {
    var frag = document.createDocumentFragment();
    SHIPMENTS.forEach(function (d, i) { frag.appendChild(buildRow(d, i)); });
    list.appendChild(frag);

    // animate progress bars in
    requestAnimationFrame(function () {
      list.querySelectorAll(".bar > span").forEach(function (el) {
        el.style.width = el.getAttribute("data-progress") + "%";
      });
    });
  }

  // ---- Expand / collapse ----
  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".ship-head");
    if (!btn) return;
    var ship = btn.closest(".ship");
    var open = ship.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
    if (open) {
      var id = ship.querySelector(".track-no").textContent;
      toast("Tracking history for " + id);
    }
  });

  // keyboard: Enter/Space handled natively by <button>

  // ---- Filters ----
  var chips = document.querySelectorAll(".chip");
  function setCounts() {
    var counts = { all: SHIPMENTS.length, transit: 0, delivered: 0, failed: 0 };
    SHIPMENTS.forEach(function (d) { counts[FILTER_BUCKET[d.status]]++; });
    document.querySelectorAll(".cnt").forEach(function (el) {
      el.textContent = counts[el.getAttribute("data-cnt")];
    });
  }

  function applyFilter(filter) {
    var visible = 0;
    list.querySelectorAll(".ship").forEach(function (ship) {
      var show = filter === "all" || ship.dataset.bucket === filter;
      ship.hidden = !show;
      if (show) visible++;
    });
    emptyState.hidden = visible !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  // ---- Toast helper ----
  var toastTimer;
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="dot"></span><span></span>';
    t.lastChild.textContent = msg;
    toastHost.appendChild(t);
    clearTimeout(toastTimer);
    setTimeout(function () {
      t.classList.add("out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2400);
  }

  // ---- Init ----
  render();
  setCounts();
})();
