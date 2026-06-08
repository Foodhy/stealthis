(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Adherence ring ---------- */
  (function ring() {
    var fill = document.getElementById("ringFill");
    var pct = 87;
    var C = 2 * Math.PI * 52; // ~326.7
    requestAnimationFrame(function () {
      fill.style.strokeDashoffset = String(C * (1 - pct / 100));
    });
    document.getElementById("ringPct").textContent = pct + "%";
  })();

  /* ---------- Chart data (12 weekly points) ---------- */
  var SERIES = {
    weight: {
      title: "Body weight",
      unit: "kg",
      color: "#c6ff3a",
      data: [86.8, 86.1, 85.4, 85.0, 84.3, 83.9, 83.4, 83.0, 82.7, 82.5, 82.3, 82.1],
      foot: function (d) {
        return [
          ["Start", d[0] + " kg"],
          ["Now", d[d.length - 1] + " kg"],
          ["Change", (d[d.length - 1] - d[0]).toFixed(1) + " kg"]
        ];
      }
    },
    bench: {
      title: "Bench press 1RM",
      unit: "kg",
      color: "#ff6a2b",
      data: [93, 94, 95, 95, 96, 98, 99, 99, 100, 101, 101, 102],
      foot: function (d) {
        return [
          ["Start", d[0] + " kg"],
          ["Now", d[d.length - 1] + " kg"],
          ["Gain", "+" + (d[d.length - 1] - d[0]) + " kg"]
        ];
      }
    },
    squat: {
      title: "Back squat 1RM",
      unit: "kg",
      color: "#34d399",
      data: [125, 127, 128, 130, 132, 133, 135, 138, 140, 141, 143, 145],
      foot: function (d) {
        return [
          ["Start", d[0] + " kg"],
          ["Now", d[d.length - 1] + " kg"],
          ["Gain", "+" + (d[d.length - 1] - d[0]) + " kg"]
        ];
      }
    }
  };

  var W = 640, H = 260, PAD_L = 44, PAD_R = 14, PAD_T = 16, PAD_B = 28;
  var svg = document.getElementById("chart");
  var titleEl = document.getElementById("chartTitle");
  var footEl = document.getElementById("chartFoot");
  var SVGNS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function renderChart(key) {
    var s = SERIES[key];
    var d = s.data;
    var min = Math.min.apply(null, d);
    var max = Math.max.apply(null, d);
    var span = max - min || 1;
    // pad domain a touch
    var lo = min - span * 0.15;
    var hi = max + span * 0.15;
    var range = hi - lo;

    var innerW = W - PAD_L - PAD_R;
    var innerH = H - PAD_T - PAD_B;

    function x(i) { return PAD_L + (i / (d.length - 1)) * innerW; }
    function y(v) { return PAD_T + (1 - (v - lo) / range) * innerH; }

    svg.textContent = "";

    // horizontal gridlines + y labels
    var rows = 4;
    for (var r = 0; r <= rows; r++) {
      var gv = lo + (range * r) / rows;
      var gy = y(gv);
      svg.appendChild(el("line", { class: "chart-grid", x1: PAD_L, y1: gy, x2: W - PAD_R, y2: gy }));
      var lbl = el("text", { class: "chart-lbl", x: PAD_L - 8, y: gy + 4, "text-anchor": "end" });
      lbl.textContent = Math.round(gv);
      svg.appendChild(lbl);
    }

    // x labels (weeks)
    for (var i = 0; i < d.length; i++) {
      if (i % 2 !== 0 && i !== d.length - 1) continue;
      var t = el("text", { class: "chart-lbl", x: x(i), y: H - 8, "text-anchor": "middle" });
      t.textContent = "W" + (i + 1);
      svg.appendChild(t);
    }

    // build path
    var line = "";
    for (var j = 0; j < d.length; j++) {
      line += (j === 0 ? "M" : "L") + x(j).toFixed(1) + " " + y(d[j]).toFixed(1) + " ";
    }
    var area = line + "L" + x(d.length - 1).toFixed(1) + " " + (H - PAD_B) + " L" + PAD_L + " " + (H - PAD_B) + " Z";

    // gradient fill
    var defs = el("defs", {});
    var grad = el("linearGradient", { id: "g_" + key, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": s.color, "stop-opacity": "0.28" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": s.color, "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    svg.appendChild(el("path", { class: "chart-area", d: area, fill: "url(#g_" + key + ")" }));
    svg.appendChild(el("path", { class: "chart-line", d: line, stroke: s.color }));

    // dots
    for (var p = 0; p < d.length; p++) {
      var dot = el("circle", { class: "chart-dot", cx: x(p), cy: y(d[p]), r: 3.5, fill: s.color });
      var tt = el("title", {});
      tt.textContent = "Week " + (p + 1) + ": " + d[p] + " " + s.unit;
      dot.appendChild(tt);
      svg.appendChild(dot);
    }

    titleEl.textContent = s.title;
    svg.setAttribute("aria-label", s.title + " over 12 weeks");

    // footer stats
    footEl.textContent = "";
    s.foot(d).forEach(function (pair) {
      var span2 = document.createElement("span");
      span2.innerHTML = pair[0] + " <b>" + pair[1] + "</b>";
      footEl.appendChild(span2);
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderChart(tab.dataset.metric);
    });
  });
  renderChart("weight");

  /* ---------- Attendance heat strip (12 weeks × 3 sessions) ---------- */
  (function heat() {
    var grid = document.getElementById("heat");
    // value 0-3 sessions attended that week
    var weeks = [3, 3, 2, 3, 3, 3, 1, 3, 3, 2, 3, 3];
    var labels = ["No sessions", "1 of 3 sessions", "2 of 3 sessions", "Full week — 3/3"];
    weeks.forEach(function (v, idx) {
      var c = document.createElement("div");
      c.className = "cell l" + v;
      c.setAttribute("role", "img");
      c.setAttribute("title", "Week " + (idx + 1) + ": " + labels[v]);
      c.setAttribute("aria-label", "Week " + (idx + 1) + ", " + labels[v]);
      grid.appendChild(c);
    });
  })();

  /* ---------- Notes timeline ---------- */
  var timeline = document.getElementById("timeline");
  var seed = [
    { tag: "training", time: "2 days ago", body: "Bumped bench to 3×6 @ 92.5 kg — bar speed strong, added a back-off set." },
    { tag: "nutrition", time: "5 days ago", body: "Protein dialed to 180g/day. Reports better gym energy on training days." },
    { tag: "recovery", time: "1 week ago", body: "Right shoulder a little cranky — swapped flat for slight incline, cued scap retraction." },
    { tag: "flag", time: "2 weeks ago", body: "Missed Wed session (travel). Adjusted week to 2 sessions, kept volume." }
  ];

  function tagLabel(t) {
    return { training: "Training", nutrition: "Nutrition", recovery: "Recovery", flag: "Flag" }[t] || t;
  }

  function makeNote(n, isNew) {
    var li = document.createElement("li");
    li.className = "note" + (isNew ? " is-new" : "");
    var top = document.createElement("div");
    top.className = "note__top";
    var tag = document.createElement("span");
    tag.className = "note__tag t-" + n.tag;
    tag.textContent = tagLabel(n.tag);
    var time = document.createElement("span");
    time.className = "note__time";
    time.textContent = n.time;
    top.appendChild(tag);
    top.appendChild(time);
    var body = document.createElement("p");
    body.className = "note__body";
    body.textContent = n.body;
    li.appendChild(top);
    li.appendChild(body);
    return li;
  }

  seed.forEach(function (n) { timeline.appendChild(makeNote(n, false)); });

  /* ---------- Composer ---------- */
  var composer = document.getElementById("composer");
  var noteInput = document.getElementById("noteInput");
  var noteTag = document.getElementById("noteTag");

  function showComposer() {
    composer.hidden = false;
    noteInput.focus();
  }
  function hideComposer() {
    composer.hidden = true;
    noteInput.value = "";
    noteTag.value = "training";
  }

  document.getElementById("openNote").addEventListener("click", showComposer);
  document.getElementById("openNote2").addEventListener("click", showComposer);
  document.getElementById("cancelNote").addEventListener("click", hideComposer);

  composer.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = noteInput.value.trim();
    if (!text) {
      noteInput.focus();
      toast("Write something first");
      return;
    }
    var li = makeNote({ tag: noteTag.value, time: "Just now", body: text }, true);
    timeline.insertBefore(li, timeline.firstChild);
    hideComposer();
    toast("Note added to timeline");
  });

  /* ---------- Send program ---------- */
  document.getElementById("sendProgram").addEventListener("click", function () {
    var btn = this;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";
    setTimeout(function () {
      btn.textContent = "Sent ✓";
      toast("Week 13 program sent to Marcus");
      setTimeout(function () {
        btn.textContent = orig;
        btn.disabled = false;
      }, 1600);
    }, 700);
  });
})();
