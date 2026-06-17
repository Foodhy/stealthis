(function () {
  "use strict";

  // ---------- fictional data ----------
  var WEEK = [
    { day: "Mon", base: 84.5, tips: 31.0, bonus: 8.0 },
    { day: "Tue", base: 72.25, tips: 24.5, bonus: 0 },
    { day: "Wed", base: 96.0, tips: 41.75, bonus: 12.0 },
    { day: "Thu", base: 61.5, tips: 18.0, bonus: 0 },
    { day: "Fri", base: 118.75, tips: 58.25, bonus: 20.0 },
    { day: "Sat", base: 134.0, tips: 72.5, bonus: 25.0 },
    { day: "Sun", base: 88.4, tips: 36.6, bonus: 6.0 } // today
  ];
  var TODAY_INDEX = 6;

  var TODAY = {
    trips: 14,
    hours: 6.5,
    base: WEEK[TODAY_INDEX].base,
    tips: WEEK[TODAY_INDEX].tips,
    bonus: WEEK[TODAY_INDEX].bonus
  };

  var TRIPS = [
    { route: "Ria's Kitchen → Maple Ct", time: "8:42 PM", status: "pending", pay: 11.4 },
    { route: "Pho Saigon → 14 Birch Ln", time: "8:09 PM", status: "done", pay: 9.75 },
    { route: "Green Bowl → Harbor Apts", time: "7:31 PM", status: "done", pay: 14.2 },
    { route: "Nonna's → 88 Cedar St", time: "6:58 PM", status: "failed", pay: 0 },
    { route: "Sushi Hana → Lakeview 3B", time: "6:22 PM", status: "done", pay: 8.6 },
    { route: "Taco Local → 5 Pine Rd", time: "5:47 PM", status: "done", pay: 12.05 }
  ];

  // ---------- helpers ----------
  function $(sel) { return document.querySelector(sel); }
  function money(n) {
    return "$" + n.toFixed(2);
  }
  function moneyShort(n) {
    return "$" + (Math.round(n) === n ? n.toFixed(0) : n.toFixed(2));
  }
  function dayTotal(d) { return d.base + d.tips + d.bonus; }

  var toastWrap = $("#toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast " + (kind || "info");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, 2600);
  }

  // ---------- render hero ----------
  function renderHero(period, picked) {
    var base, tips, bonus, trips, hours, sub;
    if (period === "day") {
      var src = picked || TODAY;
      base = src.base; tips = src.tips; bonus = src.bonus;
      trips = picked ? Math.round(8 + Math.random() * 0) : TODAY.trips;
      // for a picked weekday use a derived trip count
      if (picked) trips = Math.max(6, Math.round((base + tips) / 7));
      hours = picked ? Math.round(((base + tips) / 18) * 10) / 10 : TODAY.hours;
      sub = picked ? picked.day + " · estimated shift" : "Today · " + TODAY.trips + " trips";
    } else {
      base = WEEK.reduce(function (s, d) { return s + d.base; }, 0);
      tips = WEEK.reduce(function (s, d) { return s + d.tips; }, 0);
      bonus = WEEK.reduce(function (s, d) { return s + d.bonus; }, 0);
      trips = 86;
      hours = 38.5;
      sub = "Mon – Sun · 7-day total";
    }
    var total = base + tips + bonus;

    $("#heroTotal").textContent = money(total);
    $("#heroSub").textContent = sub;
    $("#bdBase").textContent = money(base);
    $("#bdTips").textContent = money(tips);
    $("#bdBonus").textContent = money(bonus);
    $("#statTrips").textContent = String(trips);
    $("#statHours").textContent = hours + "h";
    $("#statRate").textContent = money(hours ? total / hours : 0).replace(".00", "");

    return total;
  }

  // ---------- render chart ----------
  var chart = $("#chart");
  var max = Math.max.apply(null, WEEK.map(dayTotal));
  function buildChart() {
    chart.innerHTML = "";
    WEEK.forEach(function (d, i) {
      var col = document.createElement("button");
      col.type = "button";
      col.className = "bar-col" + (i === TODAY_INDEX ? " is-today" : "");
      col.setAttribute("data-i", i);
      col.setAttribute("aria-label", d.day + " " + money(dayTotal(d)));

      var track = document.createElement("span");
      track.className = "bar-track";
      var bar = document.createElement("span");
      bar.className = "bar";
      bar.style.height = "0%";
      track.appendChild(bar);

      var label = document.createElement("span");
      label.className = "bar-day";
      label.textContent = d.day;

      col.appendChild(track);
      col.appendChild(label);
      chart.appendChild(col);

      requestAnimationFrame(function () {
        bar.style.height = Math.max(6, (dayTotal(d) / max) * 100) + "%";
      });

      col.addEventListener("click", function () { selectBar(i); });
    });
  }

  function selectBar(i) {
    var cols = chart.querySelectorAll(".bar-col");
    cols.forEach(function (c, idx) { c.classList.toggle("is-active", idx === i); });
    var d = WEEK[i];
    $("#chartHint").textContent =
      d.day + ": " + money(dayTotal(d)) + " — base " + moneyShort(d.base) +
      ", tips " + moneyShort(d.tips) + ", bonus " + moneyShort(d.bonus);

    // switch hero into day mode for the picked day
    setPeriod("day", d);
  }

  // ---------- render trips ----------
  var ICONS = {
    done: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M9.55 17.6 4.4 12.45l1.42-1.42 3.73 3.73 8.23-8.24L19.2 7.94z"/></svg>',
    pending: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6 3.5 2-.9 1.7-4.6-2.7V6h2z"/></svg>',
    failed: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="m13.4 12 4.3-4.3-1.4-1.4L12 10.6 7.7 6.3 6.3 7.7 10.6 12l-4.3 4.3 1.4 1.4 4.3-4.3 4.3 4.3 1.4-1.4z"/></svg>'
  };
  var STATUS_LABEL = { done: "Delivered", pending: "In progress", failed: "Failed" };

  function renderTrips() {
    var list = $("#trips");
    list.innerHTML = "";
    TRIPS.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "trip";
      li.innerHTML =
        '<span class="trip-ic s-' + t.status + '">' + ICONS[t.status] + "</span>" +
        '<div class="trip-main">' +
          '<p class="trip-route">' + t.route + "</p>" +
          '<p class="trip-meta"><span class="tag tag-' + t.status + '">' +
            STATUS_LABEL[t.status] + "</span>" + t.time + "</p>" +
        "</div>" +
        '<div class="trip-pay' + (t.pay === 0 ? " zero" : "") + '">' +
          (t.pay === 0 ? "$0.00<small>no pay</small>" : money(t.pay) + "<small>earned</small>") +
        "</div>";
      list.appendChild(li);
    });
    $("#tripCount").textContent = TRIPS.length + " trips";
  }

  // ---------- cashout ----------
  var available = dayTotal(WEEK[TODAY_INDEX]);
  var cashedOut = false;
  function renderCashout() {
    $("#cashoutAmt").textContent = money(available);
    var btn = $("#cashoutBtn");
    if (cashedOut) {
      btn.disabled = true;
      btn.innerHTML = "Cashed out";
    }
  }

  $("#cashoutBtn").addEventListener("click", function () {
    if (cashedOut) return;
    cashedOut = true;
    toast("Sent " + money(available) + " to your debit card · arrives ~30 min", "ok");
    available = 0;
    renderCashout();
  });

  $("#settingsBtn").addEventListener("click", function () {
    toast("Earnings settings — demo only", "info");
  });

  // ---------- period toggle ----------
  var toggleBtns = document.querySelectorAll(".toggle-btn");
  function setPeriod(period, picked) {
    toggleBtns.forEach(function (b) {
      var on = b.getAttribute("data-period") === period && !picked;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    var total = renderHero(period, picked);
    $("#weekTotalPill").textContent =
      moneyShort(WEEK.reduce(function (s, d) { return s + dayTotal(d); }, 0));
    return total;
  }

  toggleBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var p = b.getAttribute("data-period");
      // clear bar selection when using the toggle
      chart.querySelectorAll(".bar-col").forEach(function (c) { c.classList.remove("is-active"); });
      $("#chartHint").textContent = "Tap a bar to see that day.";
      setPeriod(p);
    });
  });

  // ---------- init ----------
  buildChart();
  renderTrips();
  setPeriod("day");
  renderCashout();
})();
