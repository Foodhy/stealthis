(function () {
  "use strict";

  /* ---------- Data ---------- */
  var chartData = {
    visits: [
      { day: "Mon", value: 14, today: true },
      { day: "Tue", value: 22 },
      { day: "Wed", value: 19 },
      { day: "Thu", value: 27 },
      { day: "Fri", value: 31 },
      { day: "Sat", value: 38 },
      { day: "Sun", value: 9 }
    ],
    revenue: [
      { day: "Mon", value: 2150, today: true },
      { day: "Tue", value: 3380 },
      { day: "Wed", value: 2910 },
      { day: "Thu", value: 4220 },
      { day: "Fri", value: 4980 },
      { day: "Sat", value: 6420 },
      { day: "Sun", value: 1480 }
    ]
  };

  var breakdown = [
    { name: "Wellness & vaccines", value: 64, color: "#179c8e" },
    { name: "Sick / urgent visit", value: 41, color: "#ff8a5c" },
    { name: "Dental", value: 28, color: "#3b82c4" },
    { name: "Surgery", value: 19, color: "#e0922f" },
    { name: "Grooming", value: 34, color: "#1f9d6b" }
  ];

  var utilization = [
    { name: "Exam Room 1", pct: 92 },
    { name: "Exam Room 2", pct: 74 },
    { name: "Surgery Suite", pct: 48 },
    { name: "Dr. Mara Vance", pct: 88 },
    { name: "Dr. Theo Quill", pct: 66 }
  ];

  var patients = [
    { emoji: "🐕", name: "Biscuit", species: "Labrador · 4y", owner: "Hannah Reyes", reason: "Annual wellness", vet: "Dr. Vance", status: "ready", statusLabel: "Ready" },
    { emoji: "🐈", name: "Mochi", species: "Tabby cat · 2y", owner: "Daniel Okafor", reason: "Vaccine booster", vet: "Dr. Quill", status: "discharged", statusLabel: "Discharged" },
    { emoji: "🐕", name: "Rufus", species: "Beagle · 7y", owner: "Priya Nair", reason: "Limping / X-ray", vet: "Dr. Vance", status: "exam", statusLabel: "In exam" },
    { emoji: "🐇", name: "Clover", species: "Lop rabbit · 1y", owner: "Marcus Webb", reason: "Dental check", vet: "Dr. Quill", status: "checkedin", statusLabel: "Checked in" },
    { emoji: "🐈", name: "Pixel", species: "Siamese · 5y", owner: "Sofia Bianchi", reason: "Skin irritation", vet: "Dr. Vance", status: "exam", statusLabel: "In exam" },
    { emoji: "🐕", name: "Tofu", species: "Corgi · 3y", owner: "Liam Carter", reason: "Spay surgery", vet: "Dr. Quill", status: "ready", statusLabel: "Ready" },
    { emoji: "🦜", name: "Kiwi", species: "Cockatiel · 6y", owner: "Elena Vargas", reason: "Wing trim", vet: "Dr. Vance", status: "discharged", statusLabel: "Discharged" },
    { emoji: "🐕", name: "Nova", species: "Husky · 2y", owner: "Jamal Pierce", reason: "Ear infection", vet: "Dr. Quill", status: "checkedin", statusLabel: "Checked in" }
  ];

  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* ---------- Animated counters ---------- */
  function animateCounters() {
    var els = document.querySelectorAll(".kpi__value[data-count]");
    els.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var prefix = el.getAttribute("data-prefix") || "";
      var start = null;
      var dur = 1100;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = prefix + val.toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Bar chart ---------- */
  var currentMetric = "visits";
  function renderBars(metric) {
    var rows = chartData[metric];
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
    var wrap = $("#bars");
    wrap.innerHTML = "";
    rows.forEach(function (r, i) {
      var bar = document.createElement("div");
      bar.className = "bar" + (r.today ? " bar--today" : "");
      var col = document.createElement("div");
      col.className = "bar__col";
      var tip = metric === "revenue" ? "$" + r.value.toLocaleString("en-US") : r.value + " visits";
      col.setAttribute("data-tip", tip);
      var day = document.createElement("span");
      day.className = "bar__day";
      day.textContent = r.day;
      bar.appendChild(col);
      bar.appendChild(day);
      wrap.appendChild(bar);
      var h = Math.round((r.value / max) * 100);
      (function (c, height, delay) {
        setTimeout(function () { c.style.height = height + "%"; }, delay);
      })(col, h, 60 + i * 55);
    });
    $("#chart-sub").textContent = metric === "revenue" ? "Revenue by day" : "Appointments by day";
  }

  /* ---------- Breakdown ---------- */
  function renderBreakdown() {
    var total = breakdown.reduce(function (a, b) { return a + b.value; }, 0);
    var ul = $("#breakdown");
    ul.innerHTML = "";
    breakdown.forEach(function (b, i) {
      var li = document.createElement("li");
      li.className = "breakdown__row";
      var pct = Math.round((b.value / total) * 100);
      li.innerHTML =
        '<span class="breakdown__name"><span class="swatch" style="background:' + b.color + '"></span>' + b.name + "</span>" +
        '<span class="breakdown__val">' + b.value + " · " + pct + "%</span>" +
        '<span class="breakdown__track"><span class="breakdown__fill" style="background:' + b.color + '"></span></span>';
      ul.appendChild(li);
      (function (fill, p, delay) {
        setTimeout(function () { fill.style.width = p + "%"; }, delay);
      })(li.querySelector(".breakdown__fill"), pct, 120 + i * 70);
    });
  }

  /* ---------- Utilization ---------- */
  function renderUtil() {
    var ul = $("#util");
    ul.innerHTML = "";
    utilization.forEach(function (u, i) {
      var cls = u.pct >= 85 ? "util__fill--full" : u.pct >= 65 ? "util__fill--busy" : "util__fill--ok";
      var li = document.createElement("li");
      li.className = "util__row";
      li.innerHTML =
        '<div class="util__top"><span class="util__name">' + u.name + "</span>" +
        '<span class="util__pct">' + u.pct + "%</span></div>" +
        '<div class="util__track"><span class="util__fill ' + cls + '"></span></div>';
      ul.appendChild(li);
      (function (fill, p, delay) {
        setTimeout(function () { fill.style.width = p + "%"; }, delay);
      })(li.querySelector(".util__fill"), u.pct, 150 + i * 70);
    });
  }

  /* ---------- Patients table ---------- */
  function renderTable(filter) {
    var q = (filter || "").trim().toLowerCase();
    var body = $("#ptable-body");
    body.innerHTML = "";
    var shown = 0;
    patients.forEach(function (p) {
      if (q && (p.name + " " + p.owner + " " + p.species + " " + p.reason).toLowerCase().indexOf(q) === -1) return;
      shown++;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td data-label="Patient"><span class="pet"><span class="pet__ava" aria-hidden="true">' + p.emoji + "</span>" +
        '<span><span class="pet__name">' + p.name + '</span><br><span class="pet__species">' + p.species + "</span></span></span></td>" +
        '<td data-label="Owner">' + p.owner + "</td>" +
        '<td data-label="Reason">' + p.reason + "</td>" +
        '<td data-label="Vet">' + p.vet + "</td>" +
        '<td data-label="Status"><span class="status status--' + p.status + '">' + p.statusLabel + "</span></td>";
      body.appendChild(tr);
    });
    $("#row-count").textContent = shown;
    $("#empty").hidden = shown !== 0;
  }

  /* ---------- Wire up ---------- */
  document.querySelectorAll(".seg__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".seg__btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      currentMetric = btn.getAttribute("data-metric");
      renderBars(currentMetric);
    });
  });

  var search = $("#patient-search");
  if (search) search.addEventListener("input", function () { renderTable(search.value); });

  /* ---------- Init ---------- */
  animateCounters();
  renderBars(currentMetric);
  renderBreakdown();
  renderUtil();
  renderTable("");
})();
