(function () {
  "use strict";

  /* ---------- Data ---------- */
  var AVATAR_COLORS = [
    "#c6ff3a", "#ff6a2b", "#38bdf8", "#34d399", "#fbbf24",
    "#f87171", "#a78bfa", "#f472b6", "#22d3ee", "#fb923c"
  ];

  var riders = [
    { name: "Dana Okafor",      seat: 7 },
    { name: "Marco Bellini",    seat: 12 },
    { name: "Priya Raman",      seat: 3 },
    { name: "Jules Lefevre",    seat: 19 },
    { name: "Sofia Marquez",    seat: 1 },
    { name: "Theo Andersson",   seat: 24 },
    { name: "Naomi Clarke",     seat: 8 },
    { name: "Wesley Brooks",    seat: 15 },
    { name: "Aisha Karim",      seat: 5 },
    { name: "Diego Ferraro",    seat: 21 },
    { name: "Lena Hoffmann",    seat: 11 },
    { name: "Kwame Mensah",     seat: 17 }
  ];

  // seed metrics
  riders.forEach(function (r, i) {
    r.id = "r" + i;
    r.color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    r.calories = 180 + Math.round(Math.random() * 240);     // kcal so far
    r.output = 220 + Math.round(Math.random() * 360);       // total output (kJ-ish)
    r.zone = 1 + Math.round(Math.random() * 4);             // current zone 1-5
    r.zoneTime = 4 + Math.round(Math.random() * 26);        // minutes in Z4+Z5
    r.effort = 55 + Math.round(Math.random() * 44);         // effort %
    r.prevPos = i;
  });

  var METRICS = {
    calories: { key: "calories", label: "Ranking by total calories", unit: "kcal", suffix: " cal" },
    output:   { key: "output",   label: "Ranking by total output",   unit: "kJ",   suffix: " out" },
    zone:     { key: "zoneTime", label: "Ranking by Z4+ zone minutes", unit: "min", suffix: " min" }
  };

  var ZONE_NAME = { 1: "Z1", 2: "Z2", 3: "Z3", 4: "Z4", 5: "Z5" };

  var state = { metric: "calories", paused: false };

  /* ---------- Helpers ---------- */
  var boardEl = document.getElementById("board");
  var podiumEl = document.getElementById("podium");
  var toastEl = document.getElementById("toast");
  var legendMetricEl = document.getElementById("legendMetric");
  var nodeMap = {}; // riderId -> row element

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function metricValue(r) {
    return r[METRICS[state.metric].key];
  }

  function sorted() {
    return riders.slice().sort(function (a, b) {
      var d = metricValue(b) - metricValue(a);
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Row creation ---------- */
  function buildRow(r) {
    var li = document.createElement("li");
    li.className = "row";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.dataset.id = r.id;

    li.innerHTML =
      '<div class="row-pos"><span class="pos-num"></span><span class="row-mover" aria-hidden="true"></span></div>' +
      '<div class="row-avatar"></div>' +
      '<div class="row-main">' +
        '<div class="row-name"><span class="nm"></span><span class="zpill"></span></div>' +
        '<div class="row-sub">' +
          '<div class="bar-track"><div class="bar-fill"></div></div>' +
          '<span class="row-effort"></span>' +
        '</div>' +
      '</div>' +
      '<div class="row-right">' +
        '<div class="row-metric"><span class="mval"></span> <small></small></div>' +
      '</div>';

    var av = li.querySelector(".row-avatar");
    av.textContent = initials(r.name);
    av.style.background = r.color;

    li.querySelector(".nm").textContent = r.name;

    function activate() { showDetail(r); }
    li.addEventListener("click", activate);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });

    nodeMap[r.id] = li;
    return li;
  }

  function updateRow(li, r, pos) {
    li.querySelector(".pos-num").textContent = pos + 1;

    // movement indicator
    var mover = li.querySelector(".row-mover");
    var delta = r.prevPos - pos;
    if (delta > 0) { mover.textContent = "▲" + delta; mover.className = "row-mover mv-up"; }
    else if (delta < 0) { mover.textContent = "▼" + (-delta); mover.className = "row-mover mv-down"; }
    else { mover.textContent = ""; mover.className = "row-mover"; }

    li.classList.toggle("is-leader", pos === 0);

    // zone pill
    var zp = li.querySelector(".zpill");
    zp.className = "zpill z" + r.zone;
    zp.textContent = ZONE_NAME[r.zone];

    // bar (relative to current leader's metric value)
    var max = metricValue(sortedCache[0]) || 1;
    var pct = Math.max(6, Math.round((metricValue(r) / max) * 100));
    li.querySelector(".bar-fill").style.width = pct + "%";

    li.querySelector(".row-effort").textContent = r.effort + "%";

    li.querySelector(".mval").textContent = metricValue(r).toLocaleString();
    li.querySelector(".row-metric small").textContent = METRICS[state.metric].unit;
  }

  /* ---------- Podium ---------- */
  var MEDAL = ["🥇", "🥈", "🥉"];
  function renderPodium(top3) {
    podiumEl.innerHTML = "";
    var order = [1, 0, 2]; // visual: 2nd, 1st, 3rd
    order.forEach(function (idx) {
      var r = top3[idx];
      if (!r) return;
      var card = document.createElement("article");
      card.className = "pod-card r" + (idx + 1);
      card.innerHTML =
        '<div class="pod-medal" aria-hidden="true">' + MEDAL[idx] + '</div>' +
        '<div class="pod-rank">#' + (idx + 1) + '</div>' +
        '<div class="pod-avatar"></div>' +
        '<p class="pod-name"></p>' +
        '<div class="pod-metric"><span class="pv"></span> <span></span></div>' +
        '<div class="pod-foot"><span class="zpill z' + r.zone + '">' + ZONE_NAME[r.zone] + '</span></div>';
      var av = card.querySelector(".pod-avatar");
      av.textContent = initials(r.name);
      av.style.background = r.color;
      card.querySelector(".pod-name").textContent = r.name;
      card.querySelector(".pv").textContent = metricValue(r).toLocaleString();
      card.querySelector(".pod-metric span:last-child").textContent = METRICS[state.metric].unit;
      podiumEl.appendChild(card);
    });
  }

  /* ---------- Render + FLIP reorder ---------- */
  var sortedCache = [];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function render(animate) {
    sortedCache = sorted();

    // FLIP: record First positions
    var firstTops = {};
    if (animate && !reduced) {
      Object.keys(nodeMap).forEach(function (id) {
        firstTops[id] = nodeMap[id].getBoundingClientRect().top;
      });
    }

    // ensure rows exist + reorder DOM
    sortedCache.forEach(function (r, pos) {
      var li = nodeMap[r.id] || buildRow(r);
      boardEl.appendChild(li); // append in sorted order
      updateRow(li, r, pos);
    });

    // FLIP: Last -> Invert -> Play
    if (animate && !reduced) {
      Object.keys(nodeMap).forEach(function (id) {
        var li = nodeMap[id];
        var lastTop = li.getBoundingClientRect().top;
        var dy = (firstTops[id] || lastTop) - lastTop;
        if (dy) {
          li.style.transform = "translateY(" + dy + "px)";
          li.style.transition = "none";
          requestAnimationFrame(function () {
            li.style.transition = "transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)";
            li.style.transform = "";
          });
        }
      });
    }

    renderPodium(sortedCache.slice(0, 3));
    legendMetricEl.textContent = METRICS[state.metric].label;
  }

  function commitPrevPositions() {
    sortedCache.forEach(function (r, pos) { r.prevPos = pos; });
  }

  /* ---------- Live tick ---------- */
  function tick() {
    if (state.paused) return;
    commitPrevPositions();

    riders.forEach(function (r) {
      // calories + output keep climbing, weighted by current effort
      var drive = r.effort / 100;
      r.calories += Math.round((1 + Math.random() * 4) * (0.5 + drive));
      r.output += Math.round((2 + Math.random() * 6) * (0.5 + drive));

      // effort drifts
      r.effort = Math.min(100, Math.max(40, r.effort + Math.round((Math.random() - 0.5) * 9)));

      // zone follows effort with some noise
      var target = r.effort >= 92 ? 5 : r.effort >= 82 ? 4 : r.effort >= 68 ? 3 : r.effort >= 55 ? 2 : 1;
      if (Math.random() < 0.55) r.zone = target;
      if (r.zone >= 4) r.zoneTime += Math.random() < 0.5 ? 1 : 0;
    });

    render(true);
  }

  /* ---------- Detail toast ---------- */
  function showDetail(r) {
    var rank = sortedCache.findIndex(function (x) { return x.id === r.id; }) + 1;
    toast(
      "#" + rank + " " + r.name + " · Seat " + r.seat + " · " +
      r.calories + " cal · " + r.output + " out · " +
      ZONE_NAME[r.zone] + " @ " + r.effort + "% effort"
    );
  }

  /* ---------- Controls ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.metric === btn.dataset.metric) return;
      state.metric = btn.dataset.metric;
      tabs.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      commitPrevPositions();
      render(true);
      toast("Ranking by " + btn.textContent.toLowerCase());
    });
  });

  var pauseBtn = document.getElementById("pauseBtn");
  var pauseLabel = document.getElementById("pauseLabel");
  pauseBtn.addEventListener("click", function () {
    state.paused = !state.paused;
    pauseBtn.setAttribute("aria-pressed", state.paused ? "true" : "false");
    pauseLabel.textContent = state.paused ? "Resume live" : "Pause live";
    toast(state.paused ? "Live updates paused" : "Live updates resumed");
  });

  /* ---------- Boot ---------- */
  render(false);
  commitPrevPositions();
  setInterval(tick, 2200);
})();
