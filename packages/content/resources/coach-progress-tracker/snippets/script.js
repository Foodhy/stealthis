(function () {
  "use strict";

  // ---- Data model -------------------------------------------------------
  // Each session: date, bodyweight (kg), and top set (load kg x reps).
  // Strength index = Epley estimated 1RM = load * (1 + reps/30).
  var sessions = [
    { date: "2026-05-04", weight: 70.5, load: 100, reps: 5 },
    { date: "2026-05-11", weight: 70.1, load: 102, reps: 5 },
    { date: "2026-05-18", weight: 69.6, load: 105, reps: 4 },
    { date: "2026-05-25", weight: 69.4, load: 108, reps: 5 },
    { date: "2026-06-01", weight: 69.0, load: 110, reps: 4 },
    { date: "2026-06-08", weight: 68.7, load: 112, reps: 5 },
    { date: "2026-06-15", weight: 68.6, load: 116, reps: 4 },
    { date: "2026-06-22", weight: 68.5, load: 118, reps: 5 },
    { date: "2026-06-29", weight: 68.4, load: 122, reps: 4 }
  ];

  var metric = "weight"; // "weight" | "strength"
  var streak = 14;

  var W = 640, H = 260, PAD_L = 44, PAD_R = 16, PAD_T = 20, PAD_B = 30;

  // ---- Element refs ------------------------------------------------------
  var svg = document.getElementById("chart");
  var gridG = document.getElementById("gridlines");
  var linePath = document.getElementById("linePath");
  var areaPath = document.getElementById("areaPath");
  var dotsG = document.getElementById("dots");
  var tooltip = document.getElementById("tooltip");
  var legendLabel = document.getElementById("legendLabel");
  var rangeLabel = document.getElementById("rangeLabel");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  var SVGNS = "http://www.w3.org/2000/svg";

  function strengthIndex(s) { return Math.round(s.load * (1 + s.reps / 30)); }
  function metricValue(s) { return metric === "weight" ? s.weight : strengthIndex(s); }

  // ---- Toast -------------------------------------------------------------
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  // ---- Chart rendering ---------------------------------------------------
  function buildScales() {
    var vals = sessions.map(metricValue);
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var span = max - min || 1;
    // pad the domain so the line doesn't hug the edges
    min -= span * 0.18;
    max += span * 0.18;

    var n = sessions.length;
    return {
      x: function (i) { return PAD_L + (i / Math.max(n - 1, 1)) * (W - PAD_L - PAD_R); },
      y: function (v) { return PAD_T + (1 - (v - min) / (max - min)) * (H - PAD_T - PAD_B); },
      min: min, max: max
    };
  }

  function clearNode(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function renderGrid(sc) {
    clearNode(gridG);
    for (var g = 0; g <= 4; g++) {
      var y = PAD_T + (g / 4) * (H - PAD_T - PAD_B);
      var ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("x1", PAD_L); ln.setAttribute("x2", W - PAD_R);
      ln.setAttribute("y1", y); ln.setAttribute("y2", y);
      gridG.appendChild(ln);

      var val = sc.max - (g / 4) * (sc.max - sc.min);
      var t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", PAD_L - 8); t.setAttribute("y", y + 4);
      t.setAttribute("text-anchor", "end");
      t.setAttribute("fill", "#6b7078");
      t.setAttribute("font-size", "11");
      t.textContent = Math.round(val);
      gridG.appendChild(t);
    }
  }

  function renderDots(sc) {
    clearNode(dotsG);
    sessions.forEach(function (s, i) {
      var cx = sc.x(i), cy = sc.y(metricValue(s));
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("class", "dot");
      c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", 4.5);
      c.setAttribute("tabindex", "0");
      var unit = metric === "weight" ? " kg" : " pts";
      var label = metric === "weight" ? "Bodyweight" : "Strength";
      c.setAttribute("aria-label", label + " " + metricValue(s) + unit + " on " + fmtDate(s.date));
      c.addEventListener("mouseenter", function () { showTip(cx, cy, s); });
      c.addEventListener("mouseleave", hideTip);
      c.addEventListener("focus", function () { showTip(cx, cy, s); });
      c.addEventListener("blur", hideTip);
      dotsG.appendChild(c);
    });
  }

  function pathFromPoints(sc, closeArea) {
    var d = "";
    sessions.forEach(function (s, i) {
      d += (i === 0 ? "M" : "L") + sc.x(i).toFixed(1) + " " + sc.y(metricValue(s)).toFixed(1) + " ";
    });
    if (closeArea) {
      var lastX = sc.x(sessions.length - 1), firstX = sc.x(0), baseY = H - PAD_B;
      d += "L" + lastX.toFixed(1) + " " + baseY + " L" + firstX.toFixed(1) + " " + baseY + " Z";
    }
    return d.trim();
  }

  function renderChart(animate) {
    var sc = buildScales();
    renderGrid(sc);
    var line = pathFromPoints(sc, false);
    linePath.setAttribute("d", line);
    areaPath.setAttribute("d", pathFromPoints(sc, true));
    renderDots(sc);

    // re-trigger the draw animation
    var len = linePath.getTotalLength ? linePath.getTotalLength() : 1600;
    linePath.style.setProperty("--len", len);
    if (animate) {
      linePath.style.animation = "none";
      // force reflow
      void linePath.getBBox();
      linePath.style.animation = "draw 1.1s ease forwards";
    }

    var unit = metric === "weight" ? "(kg)" : "(pts)";
    legendLabel.textContent = (metric === "weight" ? "Bodyweight " : "Strength index ") + unit;
    rangeLabel.textContent = "Last " + sessions.length + " sessions";
  }

  // ---- Tooltip -----------------------------------------------------------
  function showTip(cx, cy, s) {
    var rect = svg.getBoundingClientRect();
    var px = (cx / W) * rect.width;
    var py = (cy / H) * rect.height;
    var unit = metric === "weight" ? " kg" : " pts";
    tooltip.innerHTML = fmtDate(s.date) + " · <b>" + metricValue(s) + unit + "</b>";
    tooltip.hidden = false;
    tooltip.style.left = px + "px";
    tooltip.style.top = py + "px";
  }
  function hideTip() { tooltip.hidden = true; }

  // ---- Stats -------------------------------------------------------------
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function refreshStats() {
    var first = sessions[0], last = sessions[sessions.length - 1];
    var wEl = document.getElementById("statWeight");
    var sEl = document.getElementById("statStrength");
    var sessEl = document.getElementById("statSessions");
    wEl.innerHTML = last.weight.toFixed(1) + "<em>kg</em>";
    sEl.innerHTML = strengthIndex(last) + "<em>pts</em>";
    sessEl.innerHTML = sessions.length + "<em>logged</em>";

    var wDelta = last.weight - first.weight;
    var wd = document.getElementById("statWeightDelta");
    wd.textContent = (wDelta <= 0 ? "▼ " : "▲ ") + Math.abs(wDelta).toFixed(1) + " kg";
    wd.className = "delta " + (wDelta <= 0 ? "down" : "up");

    var sDelta = strengthIndex(last) - strengthIndex(first);
    var sd = document.getElementById("statStrengthDelta");
    sd.textContent = (sDelta >= 0 ? "▲ " : "▼ ") + Math.abs(sDelta) + " pts";
    sd.className = "delta " + (sDelta >= 0 ? "up" : "down");
  }

  // ---- Metric toggle -----------------------------------------------------
  Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("active")) return;
      document.querySelectorAll(".seg-btn").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      metric = btn.getAttribute("data-metric");
      hideTip();
      renderChart(true);
    });
  });

  // ---- Log form ----------------------------------------------------------
  var form = document.getElementById("logForm");
  var hint = document.getElementById("formHint");
  var fDate = document.getElementById("fDate");
  fDate.value = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var weight = parseFloat(document.getElementById("fWeight").value);
    var load = parseInt(document.getElementById("fLoad").value, 10);
    var reps = parseInt(document.getElementById("fReps").value, 10);
    var date = fDate.value;

    if (!date || isNaN(weight) || isNaN(load) || isNaN(reps)) {
      hint.textContent = "Fill in date, bodyweight and your top set.";
      hint.classList.add("err");
      return;
    }
    hint.classList.remove("err");
    hint.textContent = "Estimated 1RM auto-computes from load × reps.";

    var prev = sessions[sessions.length - 1];
    sessions.push({ date: date, weight: weight, load: load, reps: reps });
    if (sessions.length > 12) sessions.shift();

    streak += 1;
    document.getElementById("streakNum").textContent = streak;

    refreshStats();
    renderChart(true);

    var newIndex = strengthIndex({ load: load, reps: reps });
    if (prev && newIndex > strengthIndex(prev)) {
      addPR(load, reps, newIndex);
      toast("New strength PR logged — 🔥 " + streak + "-day streak!");
    } else {
      toast("Session saved — 🔥 " + streak + "-day streak!");
    }

    form.reset();
    fDate.value = new Date().toISOString().slice(0, 10);
    document.getElementById("fWeight").focus();
  });

  // ---- PR list -----------------------------------------------------------
  function addPR(load, reps, index) {
    var list = document.getElementById("prList");
    var li = document.createElement("li");
    li.innerHTML =
      '<span class="pr-lift">Squat e1RM</span>' +
      '<span class="pr-val">' + index + ' <em>kg</em></span>' +
      '<span class="pr-tag new">PR</span>';
    list.insertBefore(li, list.firstChild);
    while (list.children.length > 5) list.removeChild(list.lastChild);
    var countEl = document.getElementById("prCount");
    countEl.textContent = Math.min(parseInt(countEl.textContent, 10) + 1, 99);
  }

  // ---- Init --------------------------------------------------------------
  refreshStats();
  renderChart(true);
  window.addEventListener("resize", function () { hideTip(); });
})();
