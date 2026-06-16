(function () {
  "use strict";

  // ---- Toast helper ----
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 280);
    }, 2600);
  }

  var fmtMoney = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };
  var fmtNum = function (n) {
    return Math.round(n).toLocaleString("en-US");
  };

  // ---- Dataset per range ----
  // Hours the museum is open: 10..17 (last entry 17:00)
  var HOURS = [10, 11, 12, 13, 14, 15, 16, 17];

  var TICKET_TYPES = [
    { key: "adult", name: "General Admission", color: "#1c1b19", share: 0.46 },
    { key: "member", name: "Members", color: "#a98140", share: 0.21 },
    { key: "student", name: "Student / Senior", color: "#876631", share: 0.17 },
    { key: "child", name: "Youth & Child", color: "#3f7d56", share: 0.1 },
    { key: "group", name: "Groups & Tours", color: "#8c857a", share: 0.06 }
  ];

  var EXHIBITIONS = [
    { name: "Permanent Collection", sub: "Galleries 1–14" },
    { name: "Luminous Ground", sub: "Color Field, 1958–74" },
    { name: "Permanent Collection", sub: "Galleries 1–14" },
    { name: "Cast in Bronze", sub: "Rodin & After" },
    { name: "Luminous Ground", sub: "Color Field, 1958–74" },
    { name: "Permanent Collection", sub: "Galleries 1–14" }
  ];

  var RANGES = {
    today: {
      meta: "Today · Saturday, June 15, 2026 · Open 10:00–18:00",
      visitors: 3184,
      revenue: 68420,
      capacity: 71,
      members: 42,
      d: { visitors: 6.2, revenue: 4.1, members: -1.8 },
      // visitor weight per hour (relative)
      hourW: [0.55, 0.82, 1.0, 0.93, 1.12, 0.96, 0.74, 0.48],
      slots: [
        { time: "14:30", sold: 162, cap: 180 },
        { time: "15:00", sold: 174, cap: 180 },
        { time: "15:30", sold: 180, cap: 180 },
        { time: "16:00", sold: 121, cap: 180 },
        { time: "16:30", sold: 88, cap: 180 },
        { time: "17:00", sold: 54, cap: 180 }
      ],
      status: "open"
    },
    "7d": {
      meta: "Last 7 days · Jun 9 – Jun 15, 2026 · Closed Mondays",
      visitors: 18642,
      revenue: 401350,
      capacity: 64,
      members: 287,
      d: { visitors: 3.4, revenue: 5.6, members: 2.2 },
      hourW: [0.62, 0.85, 1.04, 0.9, 1.05, 0.92, 0.7, 0.5],
      slots: [
        { time: "Tue 11:00", sold: 168, cap: 180 },
        { time: "Wed 13:30", sold: 159, cap: 180 },
        { time: "Thu 15:00", sold: 177, cap: 180 },
        { time: "Fri 14:00", sold: 180, cap: 180 },
        { time: "Sat 12:30", sold: 174, cap: 180 },
        { time: "Sun 11:30", sold: 142, cap: 180 }
      ],
      status: "open"
    },
    "30d": {
      meta: "Last 30 days · May 17 – Jun 15, 2026",
      visitors: 74310,
      revenue: 1612780,
      capacity: 58,
      members: 1043,
      d: { visitors: -0.8, revenue: 2.9, members: 4.7 },
      hourW: [0.68, 0.88, 1.0, 0.86, 0.98, 0.9, 0.72, 0.55],
      slots: [
        { time: "Avg 10:30", sold: 132, cap: 180 },
        { time: "Avg 12:00", sold: 156, cap: 180 },
        { time: "Avg 13:30", sold: 161, cap: 180 },
        { time: "Avg 15:00", sold: 149, cap: 180 },
        { time: "Avg 16:30", sold: 108, cap: 180 },
        { time: "Avg 17:00", sold: 71, cap: 180 }
      ],
      status: "open"
    },
    qtr: {
      meta: "Quarter to date · Apr 1 – Jun 15, 2026",
      visitors: 214905,
      revenue: 4738200,
      capacity: 61,
      members: 3119,
      d: { visitors: 8.1, revenue: 9.4, members: 6.3 },
      hourW: [0.66, 0.86, 1.0, 0.88, 1.02, 0.9, 0.71, 0.52],
      slots: [
        { time: "Apr peak", sold: 171, cap: 180 },
        { time: "May peak", sold: 180, cap: 180 },
        { time: "Jun peak", sold: 178, cap: 180 },
        { time: "Weekday avg", sold: 138, cap: 180 },
        { time: "Weekend avg", sold: 166, cap: 180 },
        { time: "Late entry", sold: 64, cap: 180 }
      ],
      status: "open"
    }
  };

  // ---- Render: KPIs ----
  function setDelta(el, pct) {
    var up = pct >= 0;
    el.className = "kpi-delta " + (up ? "up" : "down");
    el.textContent = (up ? "▲ " : "▼ ") + Math.abs(pct).toFixed(1) + "% vs prior";
  }

  function renderKpis(r) {
    document.getElementById("kpiVisitors").textContent = fmtNum(r.visitors);
    document.getElementById("kpiRevenue").textContent = fmtMoney(r.revenue);
    document.getElementById("kpiCapacity").textContent = r.capacity + "%";
    document.getElementById("kpiCapacityBar").style.width = r.capacity + "%";
    document.getElementById("kpiMembers").textContent = fmtNum(r.members);
    setDelta(document.getElementById("kpiVisitorsDelta"), r.d.visitors);
    setDelta(document.getElementById("kpiRevenueDelta"), r.d.revenue);
    setDelta(document.getElementById("kpiMembersDelta"), r.d.members);
  }

  // ---- Render: hourly bar chart ----
  function renderHours(r) {
    var chart = document.getElementById("hoursChart");
    chart.innerHTML = "";
    var wSum = r.hourW.reduce(function (a, b) { return a + b; }, 0);
    var maxW = Math.max.apply(null, r.hourW);
    var peakIdx = r.hourW.indexOf(maxW);

    HOURS.forEach(function (h, i) {
      var w = r.hourW[i];
      var count = Math.round((w / wSum) * r.visitors);
      var pct = (w / maxW) * 100;
      var col = document.createElement("div");
      col.className = "bar-col";

      var bar = document.createElement("div");
      bar.className = "bar" + (i === peakIdx ? " is-peak" : "");
      bar.style.height = "0%";
      var label = (h < 10 ? "0" : "") + h + ":00";
      bar.setAttribute("data-tip", label + " · " + fmtNum(count) + " visitors");
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", label + ", " + fmtNum(count) + " visitors");

      var lbl = document.createElement("span");
      lbl.className = "bar-label";
      lbl.textContent = (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? "a" : "p");

      col.appendChild(bar);
      col.appendChild(lbl);
      chart.appendChild(col);

      // animate in
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.height = pct + "%";
        });
      });
    });

    var peakH = HOURS[peakIdx];
    document.getElementById("hoursPeak").textContent =
      "Peak " + (peakH < 10 ? "0" : "") + peakH + ":00";
  }

  // ---- Render: donut + legend ----
  function renderDonut(r) {
    var donut = document.getElementById("donut");
    document.getElementById("donutTotal").textContent = fmtNum(r.visitors);

    var stops = [];
    var legendEl = document.getElementById("legend");
    legendEl.innerHTML = "";
    var acc = 0;
    TICKET_TYPES.forEach(function (t) {
      var start = acc * 360;
      acc += t.share;
      var end = acc * 360;
      stops.push(t.color + " " + start.toFixed(2) + "deg " + end.toFixed(2) + "deg");

      var count = Math.round(t.share * r.visitors);
      var li = document.createElement("li");
      var sw = document.createElement("span");
      sw.className = "sw";
      sw.style.background = t.color;
      var name = document.createElement("span");
      name.className = "lname";
      name.textContent = t.name;
      var val = document.createElement("span");
      val.className = "lval";
      val.innerHTML = fmtNum(count) + '<span class="lpct">' + Math.round(t.share * 100) + "%</span>";
      li.appendChild(sw);
      li.appendChild(name);
      li.appendChild(val);
      legendEl.appendChild(li);
    });
    donut.style.background = "conic-gradient(" + stops.join(", ") + ")";
  }

  // ---- Render: slots table ----
  function fillClass(pct) {
    if (pct >= 95) return "hi";
    if (pct >= 80) return "mid";
    return "lo";
  }

  function renderSlots(r) {
    var body = document.getElementById("slotsBody");
    body.innerHTML = "";
    document.getElementById("slotsCount").textContent = r.slots.length + " slots";

    r.slots.forEach(function (s, i) {
      var exh = EXHIBITIONS[i % EXHIBITIONS.length];
      var pct = Math.round((s.sold / s.cap) * 100);
      var fc = fillClass(pct);
      var soldOut = s.sold >= s.cap;

      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><span class="slot-time">' + s.time + "</span></td>" +
        '<td class="slot-exh">' + exh.name + "<small>" + exh.sub + "</small></td>" +
        '<td class="num">' + fmtNum(s.sold) + "</td>" +
        '<td class="num">' + fmtNum(s.cap) + "</td>" +
        "<td>" +
          '<div class="fillbar ' + fc + '" role="img" aria-label="' + pct + ' percent full">' +
          '<span style="width:0%"></span></div>' +
        "</td>" +
        "<td>" +
          (soldOut
            ? '<span class="badge soldout">Sold out</span>'
            : pct >= 80
              ? '<span class="badge filling">Filling · ' + (s.cap - s.sold) + " left</span>"
              : '<span class="badge open">Open · ' + (s.cap - s.sold) + " left</span>") +
        "</td>";
      body.appendChild(tr);

      var bar = tr.querySelector(".fillbar span");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.width = pct + "%";
        });
      });
    });
  }

  // ---- Status pill ----
  function renderStatus(r) {
    var pill = document.getElementById("statusPill");
    pill.className = "pill " + (r.status === "open" ? "pill-ok" : "pill-warn");
    pill.innerHTML =
      '<span class="dot"></span> ' + (r.status === "open" ? "Galleries open" : "After hours");
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function nowStr() {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  // ---- Master render ----
  function render(key) {
    var r = RANGES[key];
    document.getElementById("rangeMeta").textContent = r.meta;
    renderStatus(r);
    renderKpis(r);
    renderHours(r);
    renderDonut(r);
    renderSlots(r);
    document.getElementById("syncTime").textContent = nowStr();
  }

  // ---- Range buttons ----
  var rangeBtns = document.querySelectorAll(".range-btn");
  var rangeLabels = { today: "Today", "7d": "the last 7 days", "30d": "the last 30 days", qtr: "this quarter" };
  rangeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-range");
      if (btn.getAttribute("aria-pressed") === "true") return;
      rangeBtns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      render(key);
      toast("Showing figures for " + rangeLabels[key] + ".");
    });
  });

  // ---- Export ----
  document.getElementById("exportBtn").addEventListener("click", function () {
    var active = document.querySelector('.range-btn[aria-pressed="true"]');
    var key = active ? active.getAttribute("data-range") : "today";
    var r = RANGES[key];
    toast(
      "Report queued — " + fmtNum(r.visitors) + " visitors, " + fmtMoney(r.revenue) + " revenue."
    );
    document.getElementById("syncTime").textContent = nowStr();
  });

  // ---- Init ----
  render("today");
})();
