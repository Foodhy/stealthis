(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastHost = document.getElementById("toastHost");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastHost.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 280);
    }, 2600);
  }

  function fmtMoney(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  /* ---------- Data per timeframe ---------- */
  var DATA = {
    today: {
      sub: "Hourly intake — today",
      labels: ["7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p"],
      revenue: [620, 980, 1340, 1810, 1520, 940, 1280, 1990, 2240, 1860, 1140, 700],
      hours: [3, 5, 7, 9, 8, 5, 6, 10, 11, 9, 6, 4],
      kpi: {
        revenue: 18420, revenuePrev: 16990, revenueDelta: "8.4%", revDir: "up",
        util: 82, utilPrev: 79, utilDelta: "3.1%", utilDir: "up",
        ticket: 486, ticketDelta: "1.9%", ticketDir: "down",
        cars: 38, carsPrev: 7, carsDelta: "12", carsDir: "up"
      }
    },
    week: {
      sub: "Daily revenue — this week",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      revenue: [14200, 18420, 16800, 19940, 22100, 24800, 9200],
      hours: [78, 96, 88, 104, 118, 132, 41],
      kpi: {
        revenue: 125460, revenuePrev: 118900, revenueDelta: "5.5%", revDir: "up",
        util: 86, utilPrev: 81, utilDelta: "6.2%", utilDir: "up",
        ticket: 512, ticketDelta: "2.4%", ticketDir: "up",
        cars: 245, carsPrev: 18, carsDelta: "31", carsDir: "up"
      }
    },
    month: {
      sub: "Weekly revenue — June",
      labels: ["W1", "W2", "W3", "W4"],
      revenue: [108400, 125460, 119800, 131200],
      hours: [612, 657, 631, 689],
      kpi: {
        revenue: 484860, revenuePrev: 451200, revenueDelta: "7.5%", revDir: "up",
        util: 84, utilPrev: 80, utilDelta: "5.0%", utilDir: "up",
        ticket: 498, ticketDelta: "0.8%", ticketDir: "down",
        cars: 974, carsPrev: 22, carsDelta: "63", carsDir: "up"
      }
    }
  };

  /* ---------- Chart rendering ---------- */
  var svgNS = "http://www.w3.org/2000/svg";
  var chart = document.getElementById("revChart");
  var chartAxis = document.getElementById("chartAxis");
  var chartSub = document.getElementById("chartSub");
  var VB = { w: 720, h: 260, padL: 8, padR: 8, padT: 16, padB: 18 };

  function el(name, attrs) {
    var n = document.createElementNS(svgNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function renderChart(range) {
    var d = DATA[range];
    chartSub.textContent = d.sub;
    while (chart.firstChild) chart.removeChild(chart.firstChild);

    var n = d.revenue.length;
    var maxRev = Math.max.apply(null, d.revenue) * 1.12;
    var maxHrs = Math.max.apply(null, d.hours) * 1.18;
    var plotW = VB.w - VB.padL - VB.padR;
    var plotH = VB.h - VB.padT - VB.padB;
    var slot = plotW / n;
    var bw = Math.min(slot * 0.52, 34);

    // gridlines
    for (var g = 0; g <= 3; g++) {
      var gy = VB.padT + (plotH * g) / 3;
      chart.appendChild(el("line", { class: "hline", x1: VB.padL, y1: gy, x2: VB.w - VB.padR, y2: gy }));
    }

    // bars (revenue)
    d.revenue.forEach(function (v, i) {
      var h = (v / maxRev) * plotH;
      var x = VB.padL + slot * i + slot / 2 - bw / 2;
      var y = VB.padT + plotH - h;
      var bar = el("rect", {
        class: "bar", x: x, y: VB.padT + plotH, width: bw, height: 0,
        rx: 4, fill: "var(--orange)"
      });
      bar.style.cursor = "pointer";
      bar.addEventListener("click", function () {
        toast(d.labels[i] + " · " + fmtMoney(v) + " · " + d.hours[i] + " labor hrs", "");
      });
      chart.appendChild(bar);
      // animate
      requestAnimationFrame(function () {
        bar.setAttribute("y", y);
        bar.setAttribute("height", h);
      });
    });

    // line + area (hours)
    var pts = d.hours.map(function (v, i) {
      var x = VB.padL + slot * i + slot / 2;
      var y = VB.padT + plotH - (v / maxHrs) * plotH;
      return [x, y];
    });
    var linePath = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var areaPath = linePath + " L" + pts[pts.length - 1][0].toFixed(1) + " " + (VB.padT + plotH) +
      " L" + pts[0][0].toFixed(1) + " " + (VB.padT + plotH) + " Z";
    chart.appendChild(el("path", { class: "area", d: areaPath }));
    chart.appendChild(el("path", { class: "line", d: linePath }));
    pts.forEach(function (p) {
      chart.appendChild(el("circle", { class: "pt", cx: p[0], cy: p[1], r: 3.5 }));
    });

    // axis labels
    chartAxis.innerHTML = "";
    d.labels.forEach(function (lab) {
      var s = document.createElement("span");
      s.textContent = lab;
      chartAxis.appendChild(s);
    });
  }

  /* ---------- KPIs ---------- */
  function setText(sel, val) {
    var n = document.querySelector(sel);
    if (n) n.textContent = val;
  }
  function updateKpis(range) {
    var k = DATA[range].kpi;
    setText('[data-kpi="revenue"]', k.revenue.toLocaleString("en-US"));
    setText('[data-kpi-prev="revenue"]', fmtMoney(k.revenuePrev));
    setText('[data-kpi-delta="revenue"]', k.revenueDelta);
    setText('[data-kpi="util"]', k.util);
    setText('[data-kpi-prev="util"]', k.utilPrev + "%");
    setText('[data-kpi-delta="util"]', k.utilDelta);
    setText('[data-kpi="ticket"]', k.ticket);
    setText('[data-kpi-delta="ticket"]', k.ticketDelta);
    setText('[data-kpi="cars"]', k.cars);
    setText('[data-kpi-prev="cars"]', k.carsPrev);
    setText('[data-kpi-delta="cars"]', k.carsDelta);

    setChip('[data-kpi-delta="revenue"]', k.revDir);
    setChip('[data-kpi-delta="util"]', k.utilDir);
    setChip('[data-kpi-delta="ticket"]', k.ticketDir);
    setChip('[data-kpi-delta="cars"]', k.carsDir);
  }
  function setChip(sel, dir) {
    var span = document.querySelector(sel);
    if (!span) return;
    var chip = span.closest(".kpi-chip");
    if (!chip) return;
    chip.classList.toggle("up", dir === "up");
    chip.classList.toggle("down", dir === "down");
    chip.childNodes[0].textContent = dir === "up" ? "▲ " : "▼ ";
  }

  /* ---------- Service mix donut ---------- */
  var MIX = [
    { name: "Maintenance", count: 16, color: "#ff6a13" },
    { name: "Brakes & Suspension", count: 8, color: "#2b7fff" },
    { name: "Diagnostics", count: 6, color: "#2f9e6f" },
    { name: "Tires & Alignment", count: 5, color: "#e0962a" },
    { name: "Body & Detail", count: 3, color: "#8a929d" }
  ];
  var donut = document.getElementById("donut");
  var donutVal = document.getElementById("donutVal");
  var donutLabel = document.getElementById("donutLabel");
  var mixList = document.getElementById("mixList");
  var mixTotal = document.getElementById("mixTotal");

  function renderMix() {
    var total = MIX.reduce(function (a, b) { return a + b.count; }, 0);
    mixTotal.textContent = total + " ROs";
    var R = 50, C = 2 * Math.PI * R;
    var offset = 0;
    while (donut.firstChild) donut.removeChild(donut.firstChild);
    donut.appendChild(el("circle", { cx: 60, cy: 60, r: R, fill: "none", stroke: "var(--bg)", "stroke-width": 12 }));
    mixList.innerHTML = "";

    MIX.forEach(function (m, i) {
      var pct = m.count / total;
      var dash = pct * C;
      var seg = el("circle", {
        class: "seg", cx: 60, cy: 60, r: R, fill: "none",
        stroke: m.color, "stroke-width": 12,
        "stroke-dasharray": dash + " " + (C - dash),
        "stroke-dashoffset": -offset
      });
      donut.appendChild(seg);
      offset += dash;

      var li = document.createElement("li");
      li.className = "mix-row";
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.innerHTML =
        '<span class="mix-swatch" style="background:' + m.color + '"></span>' +
        '<span class="mix-name">' + m.name + '</span>' +
        '<span class="mix-pct">' + Math.round(pct * 100) + '%</span>' +
        '<span class="mix-cnt">' + m.count + '</span>';
      function focusSeg() {
        donutVal.textContent = Math.round(pct * 100) + "%";
        donutLabel.textContent = m.name;
        Array.prototype.forEach.call(mixList.children, function (c) { c.classList.remove("is-on"); });
        li.classList.add("is-on");
      }
      li.addEventListener("mouseenter", focusSeg);
      li.addEventListener("click", focusSeg);
      seg.addEventListener("mouseenter", focusSeg);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); focusSeg(); }
      });
      mixList.appendChild(li);
      if (i === 0) { donutVal.textContent = Math.round(pct * 100) + "%"; donutLabel.textContent = m.name; }
    });
    mixList.children[0].classList.add("is-on");
  }

  /* ---------- Bays ---------- */
  var BAYS = [
    { no: "Bay 1", util: 94, status: "inprogress", veh: "2021 Ford F-150", plate: "TRK 4821", vin: "1FTFW1E5XMF", odo: "62,140", job: "Brake job + rotors", tech: "L. Ortega", eta: "1h 10m" },
    { no: "Bay 2", util: 88, status: "inprogress", veh: "2019 Honda CR-V", plate: "GHT 119", vin: "5J6RW2H58KL", odo: "48,902", job: "60k service", tech: "P. Nair", eta: "45m" },
    { no: "Bay 3", util: 76, status: "waiting", veh: "2022 Tesla Model 3", plate: "EV 7702", vin: "5YJ3E1EA4NF", odo: "21,330", job: "Tire rotation", tech: "Unassigned", eta: "—" },
    { no: "Bay 4", util: 100, status: "inprogress", veh: "2017 RAM 2500", plate: "HVY 308", vin: "3C6UR5DL2HG", odo: "118,455", job: "Diagnostic P0301", tech: "D. Cole", eta: "2h" },
    { no: "Bay 5", util: 62, status: "done", veh: "2020 Subaru Outback", plate: "OUT 556", vin: "4S4BTACC6L3", odo: "39,710", job: "Oil + filter", tech: "S. Kim", eta: "Ready" },
    { no: "Bay 6", util: 71, status: "hold", veh: "2018 BMW 330i", plate: "BMR 990", vin: "WBA8E1C57JA", odo: "71,200", job: "Awaiting part", tech: "L. Ortega", eta: "Hold" },
    { no: "Bay 7", util: 0, status: "free", veh: "—", plate: "—", vin: "—", odo: "—", job: "Open", tech: "—", eta: "—" },
    { no: "Bay 8", util: 84, status: "inprogress", veh: "2023 Toyota RAV4", plate: "RAV 401", vin: "2T3P1RFV0PC", odo: "9,840", job: "Alignment", tech: "P. Nair", eta: "30m" }
  ];
  var bayList = document.getElementById("bayList");
  var bayDetail = document.getElementById("bayDetail");
  var bayDetailTitle = document.getElementById("bayDetailTitle");
  var bayDetailBody = document.getElementById("bayDetailBody");
  var selectedBay = null;

  function renderBays() {
    bayList.innerHTML = "";
    BAYS.forEach(function (b, i) {
      var btn = document.createElement("button");
      btn.className = "bay";
      btn.type = "button";
      btn.setAttribute("aria-label", b.no + ", " + b.util + " percent utilized");
      btn.innerHTML =
        '<div class="bay-top"><span class="bay-no">' + b.no + '</span>' +
        '<span class="bay-status ' + b.status + '" title="' + b.status + '"></span></div>' +
        '<div class="bay-meter"><span style="width:0%"></span></div>' +
        '<span class="bay-pct">' + b.util + '% · ' + statusLabel(b.status) + '</span>';
      btn.addEventListener("click", function () { selectBay(i, btn); });
      bayList.appendChild(btn);
      var fill = btn.querySelector(".bay-meter span");
      requestAnimationFrame(function () { fill.style.width = b.util + "%"; });
    });
  }
  function statusLabel(s) {
    return { inprogress: "In Progress", waiting: "Waiting", done: "Done", hold: "On Hold", free: "Open" }[s] || s;
  }
  function selectBay(i, btn) {
    var b = BAYS[i];
    Array.prototype.forEach.call(bayList.children, function (c) { c.classList.remove("is-sel"); });
    btn.classList.add("is-sel");
    selectedBay = i;
    bayDetailTitle.textContent = b.no + " — " + statusLabel(b.status);
    bayDetailBody.innerHTML =
      '<div class="bd-grid">' +
      cell("Vehicle", b.veh) +
      cell("Plate", b.plate, true) +
      cell("VIN", b.vin, true) +
      cell("Odometer", b.odo + " mi", true) +
      cell("Current Job", b.job) +
      cell("Technician", b.tech) +
      cell("ETA", b.eta) +
      cell("Utilization", b.util + "%", true) +
      '</div>';
    bayDetail.hidden = false;
    bayDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function cell(k, v, mono) {
    return '<div class="bd-cell"><div class="k">' + k + '</div><div class="v' + (mono ? " mono" : "") + '">' + v + '</div></div>';
  }
  document.getElementById("bayClose").addEventListener("click", function () {
    bayDetail.hidden = true;
    if (selectedBay != null && bayList.children[selectedBay]) bayList.children[selectedBay].classList.remove("is-sel");
    selectedBay = null;
  });

  /* ---------- Approvals ---------- */
  var APPROVALS = [
    { veh: "2016 Jeep Wrangler", plate: "JEP 220", code: "P0420", desc: "Catalytic converter + labor", amt: 1480, cust: "R. Mendez" },
    { veh: "2019 Audi Q5", plate: "AUD 731", code: "Brakes", desc: "Front pads, rotors, fluid", amt: 920, cust: "T. Wallace" },
    { veh: "2014 Chevy Silverado", plate: "SLV 045", code: "P0301", desc: "Coil pack + plugs, cyl 1 misfire", amt: 640, cust: "K. Boone" }
  ];
  var apprList = document.getElementById("apprList");
  var apprSub = document.getElementById("apprSub");
  var apprEmpty = document.getElementById("apprEmpty");

  function renderApprovals() {
    apprList.innerHTML = "";
    APPROVALS.forEach(function (a, i) {
      var li = document.createElement("li");
      li.className = "appr";
      li.innerHTML =
        '<div class="appr-thumb" aria-hidden="true"></div>' +
        '<div class="appr-main">' +
        '<div class="appr-veh">' + a.veh + '</div>' +
        '<div class="appr-meta"><span class="plate">' + a.plate + '</span>' +
        '<span class="code">' + a.code + '</span><span>' + a.desc + '</span></div>' +
        '</div>' +
        '<div class="appr-amt">' + fmtMoney(a.amt) + '</div>' +
        '<div class="appr-acts">' +
        '<button class="mini-btn decline" type="button">Decline</button>' +
        '<button class="mini-btn approve" type="button">Approve</button>' +
        '</div>';
      var approveBtn = li.querySelector(".approve");
      var declineBtn = li.querySelector(".decline");
      approveBtn.addEventListener("click", function () { resolveAppr(li, a, "approved"); });
      declineBtn.addEventListener("click", function () { resolveAppr(li, a, "declined"); });
      apprList.appendChild(li);
    });
    updateApprCount();
  }
  function resolveAppr(li, a, action) {
    li.classList.add("is-leaving");
    if (action === "approved") toast("Estimate approved · " + a.veh + " · " + fmtMoney(a.amt), "ok");
    else toast("Estimate declined · " + a.veh, "danger");
    setTimeout(function () {
      li.remove();
      updateApprCount();
    }, 320);
  }
  function updateApprCount() {
    var n = apprList.querySelectorAll(".appr:not(.is-leaving)").length;
    apprSub.textContent = n + (n === 1 ? " estimate" : " estimates") + " awaiting authorization";
    apprEmpty.hidden = n !== 0;
  }

  /* ---------- Top techs ---------- */
  var TECHS = [
    { name: "Lena Ortega", role: "Master Tech · 4 ROs", eff: 118, color: "#ff6a13" },
    { name: "Priya Nair", role: "A-Tech · 5 ROs", eff: 109, color: "#2b7fff" },
    { name: "Dwayne Cole", role: "Diagnostics · 3 ROs", eff: 102, color: "#2f9e6f" },
    { name: "Sam Kim", role: "Lube Tech · 6 ROs", eff: 96, color: "#e0962a" }
  ];
  var techList = document.getElementById("techList");
  function renderTechs() {
    var max = Math.max.apply(null, TECHS.map(function (t) { return t.eff; }));
    techList.innerHTML = "";
    TECHS.forEach(function (t, i) {
      var initials = t.name.split(" ").map(function (w) { return w[0]; }).join("");
      var li = document.createElement("li");
      li.className = "tech";
      li.innerHTML =
        '<span class="tech-rank">' + (i + 1) + '</span>' +
        '<span class="tech-av" style="background:' + t.color + '">' + initials + '</span>' +
        '<div class="tech-main"><div class="tech-name">' + t.name + '</div>' +
        '<div class="tech-sub">' + t.role + '</div>' +
        '<div class="tech-bar"><span style="width:0%"></span></div></div>' +
        '<span class="tech-eff">' + t.eff + '%</span>';
      techList.appendChild(li);
      var bar = li.querySelector(".tech-bar span");
      requestAnimationFrame(function () { bar.style.width = (t.eff / max * 100) + "%"; });
    });
  }

  /* ---------- Timeframe toggle ---------- */
  var segBtns = document.querySelectorAll(".seg-btn");
  Array.prototype.forEach.call(segBtns, function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(segBtns, function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      var range = b.getAttribute("data-range");
      renderChart(range);
      updateKpis(range);
      toast("Showing " + b.textContent.toLowerCase() + " metrics", "");
    });
  });

  /* ---------- Export + menu ---------- */
  document.getElementById("exportBtn").addEventListener("click", function () {
    toast("Shop report queued — PDF will email to you", "ok");
  });
  var rail = document.querySelector(".rail");
  document.getElementById("menuBtn").addEventListener("click", function () {
    rail.classList.toggle("is-open");
  });
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 880 && rail.classList.contains("is-open") &&
        !rail.contains(e.target) && !e.target.closest("#menuBtn")) {
      rail.classList.remove("is-open");
    }
  });

  /* ---------- Init ---------- */
  renderChart("today");
  updateKpis("today");
  renderMix();
  renderBays();
  renderApprovals();
  renderTechs();
})();
