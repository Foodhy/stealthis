/* DIY — Interactive Wiring Diagram
   Vanilla JS: builds the breadboard hole grid, wires up the connections
   table <-> SVG highlighting, and animates a signal-flow pulse. */

(function () {
  "use strict";

  var svg = document.getElementById("diagram");
  var stage = document.getElementById("stage");
  var holesG = document.getElementById("holes");
  var rowNumsG = document.getElementById("row-nums");
  var tbody = document.getElementById("con-body");
  var playBtn = document.getElementById("play-btn");
  var playLabel = document.getElementById("play-label");
  var labelsToggle = document.getElementById("labels-toggle");
  var pulsePath = document.getElementById("pulse");
  var toastEl = document.getElementById("toast");

  var NS = "http://www.w3.org/2000/svg";

  /* ---------------- Data ---------------- */

  var WIRES = [
    {
      id: "w1",
      color: "#d4503e",
      colorName: "RED",
      from: "MK-01 · 5V",
      to: "+ RAIL",
      purpose: "Feeds 5 V to the positive power rail.",
      ends: [[406, 110]],
      reverse: false,
      step: "W1 — 5V feeds the + rail"
    },
    {
      id: "w2",
      color: "#1c2733",
      colorName: "BLACK",
      from: "MK-01 · GND",
      to: "− RAIL",
      purpose: "Ground return back to the board.",
      ends: [[434, 136]],
      reverse: true,
      step: "W2 — return path to GND"
    },
    {
      id: "w3",
      color: "#ff6b35",
      colorName: "ORANGE",
      from: "MK-01 · D5",
      to: "ROW 4 · a",
      purpose: "Drive signal for LED1 through R1 (220 Ω).",
      ends: [[490, 188]],
      reverse: false,
      step: "W3 — D5 drives R1 → LED1"
    },
    {
      id: "w4",
      color: "#3b6ea5",
      colorName: "BLUE",
      from: "ROW 8 · a",
      to: "− RAIL",
      purpose: "LED1 cathode down to ground rail.",
      ends: [[434, 292], [490, 292]],
      reverse: true,
      step: "W4 — LED1 cathode to − rail"
    },
    {
      id: "w5",
      color: "#e8b64c",
      colorName: "YELLOW",
      from: "MK-01 · D2",
      to: "ROW 11 · a",
      purpose: "Button sense line (internal pull-up on D2).",
      ends: [[490, 370]],
      reverse: false,
      step: "W5 — D2 senses SW1"
    },
    {
      id: "w6",
      color: "#2f9e6f",
      colorName: "GREEN",
      from: "ROW 13 · a",
      to: "− RAIL",
      purpose: "Button leg pulled to ground when pressed.",
      ends: [[434, 422], [490, 422]],
      reverse: true,
      step: "W6 — SW1 leg to − rail"
    }
  ];

  /* Signal-flow narration order */
  var FLOW_ORDER = ["w1", "w3", "w4", "w2", "w5", "w6"];

  /* ---------------- Toast helper ---------------- */

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1900);
  }

  /* ---------------- Build breadboard holes ---------------- */

  var ROW_Y0 = 110;
  var ROW_STEP = 26;
  var ROWS = 15;
  var COLS_LEFT = [490, 520, 550, 580, 610]; /* a–e */
  var COLS_RIGHT = [656, 686, 716]; /* f–h (trimmed half board) */
  var RAILS = [406, 434];

  function makeHole(x, y) {
    var c = document.createElementNS(NS, "circle");
    c.setAttribute("class", "hole");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", 3.5);
    c.dataset.key = x + "," + y;
    holesG.appendChild(c);
  }

  (function buildBoard() {
    var r, x, y, i;
    for (r = 0; r < ROWS; r++) {
      y = ROW_Y0 + r * ROW_STEP;
      for (i = 0; i < RAILS.length; i++) makeHole(RAILS[i], y);
      for (i = 0; i < COLS_LEFT.length; i++) makeHole(COLS_LEFT[i], y);
      for (i = 0; i < COLS_RIGHT.length; i++) makeHole(COLS_RIGHT[i], y);
      if ((r + 1) % 2 === 1) {
        var t = document.createElementNS(NS, "text");
        t.setAttribute("class", "row-num");
        t.setAttribute("x", 472);
        t.setAttribute("y", y + 3.5);
        t.setAttribute("text-anchor", "end");
        t.textContent = String(r + 1);
        rowNumsG.appendChild(t);
      }
    }
  })();

  /* ---------------- Build connections table ---------------- */

  WIRES.forEach(function (w) {
    var tr = document.createElement("tr");
    tr.className = "con-row";
    tr.dataset.wire = w.id;
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-describedby", "desc-" + w.id);
    tr.setAttribute(
      "aria-label",
      w.colorName + " wire, " + w.from + " to " + w.to
    );

    tr.innerHTML =
      '<td><span class="wire-chip"><span class="swatch" style="background:' +
      w.color +
      '"></span>' +
      w.id.toUpperCase() +
      "·" +
      w.colorName +
      "</span></td>" +
      '<td class="cell-pin">' +
      w.from +
      "</td>" +
      '<td class="cell-pin">' +
      w.to +
      "</td>" +
      '<td class="cell-purpose">' +
      w.purpose +
      '<span class="sr-only" id="desc-' +
      w.id +
      '">' +
      w.purpose +
      " Press Enter to pulse this wire.</span></td>";

    tbody.appendChild(tr);
  });

  /* ---------------- Highlight logic ---------------- */

  function wireGroup(id) {
    return svg.querySelector('.wire[data-wire="' + id + '"]');
  }
  function wireLabel(id) {
    return svg.querySelector('.wlabel[data-wire="' + id + '"]');
  }
  function tableRow(id) {
    return tbody.querySelector('.con-row[data-wire="' + id + '"]');
  }
  function wireData(id) {
    for (var i = 0; i < WIRES.length; i++)
      if (WIRES[i].id === id) return WIRES[i];
    return null;
  }

  function setHot(w, on) {
    /* light up the breadboard holes this wire lands in */
    w.ends.forEach(function (p) {
      var hole = holesG.querySelector('[data-key="' + p[0] + "," + p[1] + '"]');
      if (hole) hole.classList.toggle("hot", on);
    });
  }

  var currentId = null;

  function highlight(id) {
    if (currentId === id) return;
    clearHighlight();
    var g = wireGroup(id);
    var d = wireData(id);
    if (!g || !d) return;
    currentId = id;
    svg.classList.add("dimmed");
    g.classList.add("active");
    var lbl = wireLabel(id);
    if (lbl) lbl.classList.add("active");
    var row = tableRow(id);
    if (row) row.classList.add("active");
    setHot(d, true);
  }

  function clearHighlight() {
    if (!currentId) return;
    var g = wireGroup(currentId);
    var lbl = wireLabel(currentId);
    var row = tableRow(currentId);
    var d = wireData(currentId);
    if (g) g.classList.remove("active");
    if (lbl) lbl.classList.remove("active");
    if (row) row.classList.remove("active");
    if (d) setHot(d, false);
    svg.classList.remove("dimmed");
    currentId = null;
  }

  /* table rows -> wires */
  tbody.addEventListener("mouseover", function (e) {
    if (playing) return;
    var row = e.target.closest(".con-row");
    if (row) highlight(row.dataset.wire);
  });
  tbody.addEventListener("mouseout", function (e) {
    if (playing) return;
    var row = e.target.closest(".con-row");
    if (row && !row.matches(":focus-visible")) clearHighlight();
  });
  tbody.addEventListener("focusin", function (e) {
    if (playing) return;
    var row = e.target.closest(".con-row");
    if (row) highlight(row.dataset.wire);
  });
  tbody.addEventListener("focusout", function () {
    if (!playing) clearHighlight();
  });
  tbody.addEventListener("keydown", function (e) {
    var row = e.target.closest(".con-row");
    if (!row) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pulseSingle(row.dataset.wire);
    }
  });

  /* wires -> table rows */
  svg.addEventListener("mouseover", function (e) {
    if (playing) return;
    var g = e.target.closest(".wire");
    if (g) highlight(g.dataset.wire);
  });
  svg.addEventListener("mouseout", function (e) {
    if (playing) return;
    var g = e.target.closest(".wire");
    if (g) clearHighlight();
  });
  svg.addEventListener("click", function (e) {
    var g = e.target.closest(".wire");
    if (!g) return;
    var row = tableRow(g.dataset.wire);
    if (row) row.focus();
    var d = wireData(g.dataset.wire);
    if (d) toast(d.id.toUpperCase() + " · " + d.from + " → " + d.to);
  });

  /* ---------------- Signal-flow pulse ---------------- */

  var playing = false;
  var raf = null;

  function animateAlong(id, duration) {
    return new Promise(function (resolve) {
      var g = wireGroup(id);
      var d = wireData(id);
      if (!g || !d) return resolve();
      var path = g.querySelector(".wire-path");
      var len = path.getTotalLength();
      var dash = 26;

      pulsePath.setAttribute("d", path.getAttribute("d"));
      pulsePath.style.strokeDasharray = dash + " " + (len + dash);

      highlight(id);
      toast(d.step);

      var start = null;
      function frame(ts) {
        if (!playing) {
          pulsePath.setAttribute("d", "");
          return resolve();
        }
        if (start === null) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var off = d.reverse
          ? -len + eased * (len + dash)
          : dash - eased * (len + dash);
        pulsePath.style.strokeDashoffset = off;
        if (t < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          pulsePath.setAttribute("d", "");
          resolve();
        }
      }
      raf = requestAnimationFrame(frame);
    });
  }

  function stopFlow() {
    playing = false;
    if (raf) cancelAnimationFrame(raf);
    pulsePath.setAttribute("d", "");
    clearHighlight();
    playBtn.setAttribute("aria-pressed", "false");
    playLabel.textContent = "Trace signal flow";
  }

  function runFlow() {
    playing = true;
    playBtn.setAttribute("aria-pressed", "true");
    playLabel.textContent = "Stop trace";

    var chain = Promise.resolve();
    FLOW_ORDER.forEach(function (id) {
      chain = chain.then(function () {
        if (!playing) return;
        return animateAlong(id, 750).then(function () {
          clearHighlight();
          return new Promise(function (res) {
            setTimeout(res, 140);
          });
        });
      });
    });
    chain.then(function () {
      if (playing) {
        stopFlow();
        toast("Trace complete — circuit OK ✓");
      }
    });
  }

  playBtn.addEventListener("click", function () {
    if (playing) {
      stopFlow();
      toast("Trace stopped");
    } else {
      runFlow();
    }
  });

  function pulseSingle(id) {
    if (playing) return;
    playing = true;
    animateAlong(id, 650).then(function () {
      playing = false;
      /* keep the row highlighted while it still has focus */
      var row = tableRow(id);
      if (!(row && document.activeElement === row)) clearHighlight();
    });
  }

  /* ---------------- Labels toggle ---------------- */

  labelsToggle.addEventListener("change", function () {
    stage.classList.toggle("labels-off", !labelsToggle.checked);
    toast(labelsToggle.checked ? "Wire labels ON" : "Wire labels OFF");
  });
})();
