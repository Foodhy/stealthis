(function () {
  "use strict";

  // --- Trip data (fictional) ---
  var TRIP = {
    out: [
      {
        id: "SY412",
        carrier: "Skyfare Air",
        code: "SY",
        color: "#0a66c2",
        flight: "SY 412",
        dep: { code: "JFK", city: "New York (Kennedy)", time: "10:25", date: "Jul 18" },
        arr: { code: "LAX", city: "Los Angeles", time: "13:48", date: "Jul 18" },
        dur: "6h 23m",
        cabin: "Economy",
        aircraft: "Airbus A321neo",
        terminal: "T4 · Gate B22",
        arrTerminal: "T6 · Gate 60B",
        seats: "14A · 14B",
        status: { label: "On time", cls: "ontime" }
      },
      {
        id: "AZ7",
        carrier: "Azure Pacific",
        code: "AP",
        color: "#0e9488",
        flight: "AP 7",
        dep: { code: "LAX", city: "Los Angeles", time: "16:40", date: "Jul 18" },
        arr: { code: "HND", city: "Tokyo (Haneda)", time: "20:55", date: "Jul 19" },
        dur: "11h 15m",
        cabin: "Premium Economy",
        aircraft: "Boeing 787-9",
        terminal: "Tom Bradley Intl · Gate 148",
        arrTerminal: "T3 · Gate 142",
        seats: "21H · 21J",
        status: { label: "Boarding", cls: "boarding" }
      }
    ],
    ret: [
      {
        id: "AZ8",
        carrier: "Azure Pacific",
        code: "AP",
        color: "#0e9488",
        flight: "AP 8",
        dep: { code: "HND", city: "Tokyo (Haneda)", time: "11:10", date: "Jul 31" },
        arr: { code: "SFO", city: "San Francisco", time: "04:35", date: "Jul 31" },
        dur: "9h 25m",
        cabin: "Premium Economy",
        aircraft: "Boeing 787-9",
        terminal: "T3 · Gate 110",
        arrTerminal: "Intl Term G · Gate G8",
        seats: "19D · 19E",
        status: { label: "Delayed 35m", cls: "delayed" }
      },
      {
        id: "SY889",
        carrier: "Skyfare Air",
        code: "SY",
        color: "#0a66c2",
        flight: "SY 889",
        dep: { code: "SFO", city: "San Francisco", time: "07:05", date: "Jul 31" },
        arr: { code: "JFK", city: "New York (Kennedy)", time: "15:42", date: "Jul 31" },
        dur: "5h 37m",
        cabin: "Economy",
        aircraft: "Airbus A321neo",
        terminal: "Term 2 · Gate D14",
        arrTerminal: "T4 · Gate A8",
        seats: "27C · 27D",
        status: { label: "On time", cls: "ontime" }
      }
    ]
  };

  // layovers between consecutive legs (index = gap after leg i)
  var LAYOVERS = {
    out: [{ airport: "LAX · Los Angeles", time: "2h 52m", changeTerminal: true, warn: false }],
    ret: [{ airport: "SFO · San Francisco", time: "2h 30m", changeTerminal: false, warn: true, note: "Short connection — minimum is 1h 30m, but terminal change required" }]
  };

  var PAX = "G. Innovo · M. Tan";

  var timeline = document.getElementById("timeline");
  var sheet = document.getElementById("manageSheet");
  var sheetSub = document.getElementById("sheetSub");
  var currentDir = "out";
  var activeLeg = null;

  // --- icons ---
  var planeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 16l20-7-9 13-2-5z"/></svg>';
  var clockIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var chev = '<svg class="leg__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function legHtml(leg) {
    return (
      '<article class="leg" data-id="' + leg.id + '">' +
        '<button class="leg__summary" aria-expanded="false">' +
          '<span class="leg__airline">' +
            '<span class="leg__logo" style="background:' + leg.color + '">' + esc(leg.code) + '</span>' +
            '<span class="leg__flightno mono">' + esc(leg.flight) + '</span>' +
          '</span>' +
          '<span class="leg__route">' +
            '<span class="leg__end leg__end--dep">' +
              '<span class="leg__time mono">' + esc(leg.dep.time) + '</span>' +
              '<span class="leg__code mono">' + esc(leg.dep.code) + '</span>' +
              '<span class="leg__city">' + esc(leg.dep.city) + '</span>' +
            '</span>' +
            '<span class="leg__path">' +
              '<span class="leg__dur mono">' + esc(leg.dur) + '</span>' +
              '<span class="leg__line">' + planeIcon + '</span>' +
              '<span class="leg__stops">Nonstop</span>' +
            '</span>' +
            '<span class="leg__end leg__end--arr">' +
              '<span class="leg__time mono">' + esc(leg.arr.time) + '</span>' +
              '<span class="leg__code mono">' + esc(leg.arr.code) + '</span>' +
              '<span class="leg__city">' + esc(leg.arr.city) + '</span>' +
            '</span>' +
          '</span>' +
          '<span class="leg__aside">' +
            '<span class="status status--' + leg.status.cls + '">' + esc(leg.status.label) + '</span>' +
            chev +
          '</span>' +
        '</button>' +
        '<div class="leg__details">' +
          '<div class="leg__details-inner">' +
            '<div class="leg__grid">' +
              fact("Departs", leg.terminal, leg.dep.date + " · " + leg.dep.time) +
              fact("Arrives", leg.arrTerminal, leg.arr.date + " · " + leg.arr.time) +
              fact("Cabin · seats", leg.cabin, leg.seats) +
              fact("Aircraft", leg.aircraft, "Operated by " + leg.carrier) +
            '</div>' +
            '<div class="leg__bar">' +
              '<span class="leg__pax">Passengers <strong>' + esc(PAX) + '</strong></span>' +
              '<button class="btn btn--ghost btn--sm" data-act="boardingpass" data-id="' + leg.id + '">Boarding pass</button>' +
              '<button class="btn btn--accent btn--sm" data-act="manage" data-id="' + leg.id + '">Manage</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function fact(label, value, sub) {
    return (
      '<div class="fact">' +
        '<span class="fact__label">' + esc(label) + '</span>' +
        '<span class="fact__value">' + esc(value) +
          (sub ? '<small class="mono">' + esc(sub) + "</small>" : "") +
        "</span>" +
      "</div>"
    );
  }

  function layoverHtml(lo) {
    var cls = lo.warn ? "layover layover--warn" : "layover";
    var inner =
      clockIcon +
      "<span>Layover in <strong>" + esc(lo.airport) + "</strong> · <strong class=\"mono\">" + esc(lo.time) + "</strong>" +
      (lo.changeTerminal ? " · terminal change" : "") +
      (lo.note ? "<br>" + esc(lo.note) : "") +
      "</span>";
    if (lo.warn) inner += '<span class="layover__tag">Tight</span>';
    return '<div class="' + cls + '">' + inner + "</div>";
  }

  function render(dir) {
    currentDir = dir;
    var legs = TRIP[dir];
    var los = LAYOVERS[dir] || [];
    var html = "";
    for (var i = 0; i < legs.length; i++) {
      html += legHtml(legs[i]);
      if (los[i]) html += layoverHtml(los[i]);
    }
    timeline.innerHTML = html;
  }

  function findLeg(id) {
    var all = TRIP.out.concat(TRIP.ret);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  // --- Toast ---
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 250);
    }, 2600);
  }

  // --- Expand / collapse ---
  timeline.addEventListener("click", function (e) {
    var actBtn = e.target.closest("[data-act]");
    if (actBtn) {
      e.stopPropagation();
      handleAction(actBtn.getAttribute("data-act"), actBtn.getAttribute("data-id"));
      return;
    }
    var summary = e.target.closest(".leg__summary");
    if (!summary) return;
    var leg = summary.closest(".leg");
    var open = leg.classList.toggle("is-open");
    summary.setAttribute("aria-expanded", open ? "true" : "false");
  });

  function handleAction(act, id) {
    if (act === "boardingpass") {
      var leg = findLeg(id);
      toast("Boarding pass for " + (leg ? leg.flight : id) + " sent to mobile wallet", "ok");
      return;
    }
    if (act === "manage") {
      openSheet(id);
      return;
    }
  }

  // --- Direction tabs ---
  var tabs = document.querySelectorAll(".legtab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      render(tab.getAttribute("data-dir"));
    });
  });

  // --- Manage sheet ---
  function openSheet(id) {
    activeLeg = findLeg(id);
    sheetSub.textContent = activeLeg
      ? activeLeg.flight + " · " + activeLeg.dep.code + " → " + activeLeg.arr.code + " · " + activeLeg.dep.date
      : "";
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    var firstAct = sheet.querySelector(".sheet__act");
    if (firstAct) firstAct.focus();
  }

  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = "";
    activeLeg = null;
  }

  sheet.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) {
      closeSheet();
      return;
    }
    var act = e.target.closest("[data-act]");
    if (!act) return;
    var label = activeLeg ? activeLeg.flight : "segment";
    switch (act.getAttribute("data-act")) {
      case "change":
        toast("Searching alternative flights for " + label + "…");
        break;
      case "seat":
        toast("Opening seat map for " + label, "ok");
        break;
      case "bag":
        toast("Checked bag added to " + label + " · $45", "ok");
        break;
      case "cancel":
        toast("Cancellation request submitted for " + label, "danger");
        break;
    }
    closeSheet();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheet.hidden) closeSheet();
  });

  // --- Footer buttons ---
  document.getElementById("addBag").addEventListener("click", function () {
    toast("Extra baggage added to trip · 2 × 23kg", "ok");
  });
  document.getElementById("checkin").addEventListener("click", function () {
    toast("Online check-in opens 24h before departure", "ok");
  });

  // init
  render("out");
})();
