(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";

  // Universal numbering system 1..32.
  // 1-16 = upper (right molar -> left molar), 17-32 = lower (left molar -> right molar).
  var TOOTH_NAMES = {
    "3rd molar": [1, 16, 17, 32],
    "2nd molar": [2, 15, 18, 31],
    "1st molar": [3, 14, 19, 30],
    "2nd premolar": [4, 13, 20, 29],
    "1st premolar": [5, 12, 21, 28],
    canine: [6, 11, 22, 27],
    "lateral incisor": [7, 10, 23, 26],
    "central incisor": [8, 9, 24, 25]
  };

  var COND_LABELS = {
    healthy: "Healthy",
    filling: "Filling",
    crown: "Crown",
    missing: "Missing"
  };

  // Pre-charted findings so the chart opens with realistic data.
  var SEED = {
    2: { cond: "filling", note: "MO amalgam, sound margins." },
    3: { cond: "crown", note: "PFM crown placed 2023." },
    14: { cond: "filling", note: "Occlusal composite." },
    19: { cond: "missing", note: "Extracted; implant candidate." },
    30: { cond: "crown" },
    9: { cond: "healthy" }
  };

  var state = {}; // toothNum -> { cond, note }
  var selected = null;

  var upper = document.getElementById("upperArch");
  var lower = document.getElementById("lowerArch");
  var selChip = document.getElementById("selChip");
  var condGrid = document.getElementById("condGrid");
  var condBtns = Array.prototype.slice.call(condGrid.querySelectorAll(".cond-btn"));
  var notes = document.getElementById("notes");
  var notesFor = document.getElementById("notesFor");
  var legend = document.getElementById("legend");
  var chartedFill = document.getElementById("chartedFill");
  var chartedNum = document.getElementById("chartedNum");
  var toastEl = document.getElementById("toast");
  var resetBtn = document.getElementById("resetBtn");

  var toothEls = {}; // num -> <g>

  function nameFor(num) {
    for (var key in TOOTH_NAMES) {
      if (TOOTH_NAMES[key].indexOf(num) !== -1) return key;
    }
    return "tooth";
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // Build one tooth <g> with body, number and focus ring.
  function makeTooth(num, x) {
    var w = 44;
    var y = 24;
    var h = 96;
    var g = document.createElementNS(SVGNS, "g");
    g.setAttribute("class", "tooth");
    g.setAttribute("role", "listitem");
    g.setAttribute("tabindex", "0");
    g.dataset.num = String(num);
    updateAria(g, num);

    var body = document.createElementNS(SVGNS, "rect");
    body.setAttribute("class", "tooth-body");
    body.setAttribute("x", x);
    body.setAttribute("y", y);
    body.setAttribute("width", w);
    body.setAttribute("height", h);
    body.setAttribute("rx", "13");
    body.setAttribute("ry", "15");

    var ring = document.createElementNS(SVGNS, "rect");
    ring.setAttribute("class", "tooth-ring");
    ring.setAttribute("x", x - 3);
    ring.setAttribute("y", y - 3);
    ring.setAttribute("width", w + 6);
    ring.setAttribute("height", h + 6);
    ring.setAttribute("rx", "16");

    var label = document.createElementNS(SVGNS, "text");
    label.setAttribute("class", "tooth-num");
    label.setAttribute("x", x + w / 2);
    label.setAttribute("y", y + h / 2);
    label.textContent = String(num);

    g.appendChild(ring);
    g.appendChild(body);
    g.appendChild(label);

    g.addEventListener("click", function () {
      selectTooth(num);
    });
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTooth(num);
      }
    });

    return g;
  }

  function updateAria(g, num) {
    var s = state[num];
    var cond = s && s.cond ? COND_LABELS[s.cond] : "not charted";
    g.setAttribute("aria-label", "Tooth " + num + ", " + nameFor(num) + ", " + cond);
  }

  function buildArch(svg, nums) {
    var startX = 14;
    var step = 54;
    nums.forEach(function (num, i) {
      var g = makeTooth(num, startX + i * step);
      svg.appendChild(g);
      toothEls[num] = g;
    });
  }

  function selectTooth(num) {
    selected = num;
    for (var n in toothEls) {
      toothEls[n].classList.toggle("is-selected", Number(n) === num);
    }
    var el = toothEls[num];
    if (el) el.focus({ preventScroll: true });

    selChip.classList.remove("is-empty");
    selChip.textContent = "Tooth " + num + " · " + nameFor(num);

    var s = state[num] || {};
    condBtns.forEach(function (b) {
      b.disabled = false;
      b.classList.toggle("is-active", b.dataset.cond === s.cond);
    });

    notes.disabled = false;
    notes.value = s.note || "";
    notes.placeholder = "Add a clinical note for tooth " + num + "…";
    notesFor.textContent = "· tooth " + num;
  }

  function setCondition(cond) {
    if (selected == null) return;
    var s = state[selected] || (state[selected] = {});
    s.cond = cond;

    var el = toothEls[selected];
    el.dataset.cond = cond;
    updateAria(el, selected);

    condBtns.forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.cond === cond);
    });

    refreshSummary(cond);
    toast("Tooth " + selected + " marked " + COND_LABELS[cond].toLowerCase());
  }

  function refreshSummary(bumpCond) {
    var counts = { healthy: 0, filling: 0, crown: 0, missing: 0, unset: 0 };
    var charted = 0;
    for (var i = 1; i <= 32; i++) {
      var s = state[i];
      if (s && s.cond) {
        counts[s.cond]++;
        charted++;
      } else {
        counts.unset++;
      }
    }

    Object.keys(counts).forEach(function (k) {
      var cell = legend.querySelector('[data-count="' + k + '"]');
      if (cell) cell.textContent = counts[k];
    });

    if (bumpCond) {
      var li = legend.querySelector('li[data-cond="' + bumpCond + '"]');
      if (li) {
        li.classList.remove("bump");
        void li.offsetWidth; // reflow to restart animation
        li.classList.add("bump");
      }
    }

    chartedNum.textContent = String(charted);
    chartedFill.style.width = (charted / 32) * 100 + "%";
  }

  // Wire condition buttons
  condBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setCondition(b.dataset.cond);
    });
  });

  // Notes persistence per tooth
  notes.addEventListener("input", function () {
    if (selected == null) return;
    var s = state[selected] || (state[selected] = {});
    s.note = notes.value;
  });
  notes.addEventListener("blur", function () {
    if (selected != null && notes.value.trim()) {
      toast("Note saved for tooth " + selected);
    }
  });

  resetBtn.addEventListener("click", function () {
    state = {};
    for (var n in toothEls) {
      delete toothEls[n].dataset.cond;
      toothEls[n].classList.remove("is-selected");
      updateAria(toothEls[n], Number(n));
    }
    selected = null;
    selChip.classList.add("is-empty");
    selChip.textContent = "No tooth selected";
    condBtns.forEach(function (b) {
      b.disabled = true;
      b.classList.remove("is-active");
    });
    notes.value = "";
    notes.disabled = true;
    notes.placeholder = "Select a tooth to add a note…";
    notesFor.textContent = "";
    refreshSummary();
    toast("Chart reset — 32 teeth cleared");
  });

  // Init
  buildArch(upper, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  buildArch(lower, [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);

  // Apply seed findings
  Object.keys(SEED).forEach(function (k) {
    var num = Number(k);
    state[num] = { cond: SEED[k].cond, note: SEED[k].note || "" };
    toothEls[num].dataset.cond = SEED[k].cond;
    updateAria(toothEls[num], num);
  });
  refreshSummary();
})();
