(function () {
  "use strict";

  var DAY = 86400000;
  var today = new Date(2026, 5, 22); // 2026-06-22, matches resource date

  // Seed data: status is derived from nextDue, but we store last/next as offsets in days.
  var vaccines = [
    { id: "rabies", name: "Rabies", core: true, last: -380, next: -22 },
    { id: "dhpp", name: "DHPP (Distemper / Parvo)", core: true, last: -120, next: 245 },
    { id: "adeno", name: "Canine Adenovirus", core: true, last: -120, next: 245 },
    { id: "lepto", name: "Leptospirosis", core: false, last: -340, next: 18 },
    { id: "borde", name: "Bordetella (Kennel Cough)", core: false, last: -200, next: -6 },
    { id: "lyme", name: "Lyme Disease", core: false, last: -90, next: 275 },
    { id: "influ", name: "Canine Influenza", core: false, last: -150, next: 41 },
  ];

  var SOON_WINDOW = 30; // days

  var liveRegion = document.getElementById("liveRegion");
  var coreList = document.getElementById("coreList");
  var nonList = document.getElementById("nonList");
  var ringValue = document.querySelector(".ring__value");
  var coveragePct = document.getElementById("coveragePct");
  var CIRC = 2 * Math.PI * 52;

  function addDays(offset) {
    return new Date(today.getTime() + offset * DAY);
  }

  function fmt(date) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function statusOf(v) {
    if (v.next < 0) return "over";
    if (v.next <= SOON_WINDOW) return "soon";
    return "ok";
  }

  var LABELS = { ok: "Up to date", soon: "Due soon", over: "Overdue" };

  function announce(msg) {
    liveRegion.textContent = msg;
  }

  function buildRow(v) {
    var status = statusOf(v);
    var li = document.createElement("li");
    li.className = "row" + (status === "over" ? " row--over" : "");
    li.setAttribute("tabindex", "0");
    li.dataset.id = v.id;

    var name = document.createElement("p");
    name.className = "row__name";
    name.textContent = v.name;

    var badge = document.createElement("span");
    badge.className = "badge badge--" + status;
    badge.textContent = LABELS[status];

    var dates = document.createElement("p");
    dates.className = "row__dates";
    dates.innerHTML =
      "Last given: <b>" +
      fmt(addDays(v.last)) +
      "</b><span>Next due: <b>" +
      fmt(addDays(v.next)) +
      "</b></span>";

    li.appendChild(name);
    li.appendChild(badge);
    li.appendChild(dates);

    if (status !== "ok") {
      var slot = document.createElement("div");
      slot.className = "row__action";
      var btn = document.createElement("button");
      btn.className = "btn";
      btn.type = "button";
      btn.textContent = "Schedule";
      attachSchedule(btn, v, li);
      slot.appendChild(btn);
      li.appendChild(slot);
    }

    return li;
  }

  function attachSchedule(btn, v, li) {
    var confirming = false;
    btn.addEventListener("click", function () {
      if (!confirming) {
        confirming = true;
        btn.classList.add("btn--confirm");
        btn.textContent = "Confirm visit?";
        announce("Confirm scheduling " + v.name + " for Biscuit?");
        setTimeout(function () {
          if (confirming) {
            confirming = false;
            btn.classList.remove("btn--confirm");
            btn.textContent = "Schedule";
          }
        }, 3500);
        return;
      }
      // Confirmed: mark up to date, advance next due by ~1 year.
      v.last = 0;
      v.next = 365;
      li.classList.add("row--done");
      announce(v.name + " scheduled — marked up to date, next due " + fmt(addDays(365)) + ".");
      setTimeout(render, 120);
    });
  }

  function setRing(pct) {
    var offset = CIRC * (1 - pct / 100);
    ringValue.style.strokeDashoffset = String(offset);
    ringValue.style.stroke = pct >= 75 ? "var(--teal)" : pct >= 50 ? "#d98b2b" : "var(--coral)";
    coveragePct.textContent = Math.round(pct) + "%";
  }

  function render() {
    coreList.innerHTML = "";
    nonList.innerHTML = "";

    var counts = { ok: 0, soon: 0, over: 0 };
    vaccines.forEach(function (v) {
      counts[statusOf(v)]++;
      (v.core ? coreList : nonList).appendChild(buildRow(v));
    });

    document.querySelector('[data-summary="ok"]').textContent = counts.ok;
    document.querySelector('[data-summary="soon"]').textContent = counts.soon;
    document.querySelector('[data-summary="over"]').textContent = counts.over;

    var pct = (counts.ok / vaccines.length) * 100;
    setRing(pct);
  }

  render();
})();
