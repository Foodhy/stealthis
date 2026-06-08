(function () {
  "use strict";

  // ---- Shade catalogue (fictional, salon-realistic) ----
  var SHADES = [
    { code: "7N", name: "Natural Blonde", hex: "#a9824f" },
    { code: "8.3", name: "Golden Light Blonde", hex: "#c69a55" },
    { code: "9.13", name: "Beige Very Light Blonde", hex: "#d8bd92" },
    { code: "6.1", name: "Ash Dark Blonde", hex: "#8a7355" },
    { code: "10.21", name: "Pearl Platinum", hex: "#e3d6c0" },
    { code: "5.4", name: "Copper Light Brown", hex: "#7a4f33" },
    { code: "Clear", name: "Clear Gloss", hex: "#efe7d6" },
    { code: "0.11", name: "Intense Ash Booster", hex: "#6f6a63" }
  ];

  var DEVELOPERS = ["10 vol", "20 vol", "30 vol", "40 vol"];
  var GRAMS_PER_PART = 15; // tube assumption for est. weight

  // ---- Seed builder rows ----
  var rowsData = [
    { shade: "8.3", parts: 1, dev: "20 vol" },
    { shade: "9.13", parts: 2, dev: "20 vol" },
    { shade: "0.11", parts: 0.5, dev: "20 vol" }
  ];

  // ---- History ----
  var history = [
    {
      date: "12 May 2026",
      tech: "Balayage",
      time: 35,
      note: "Soft beige blonde at mid-lengths, kept root shadow. Loved the tone.",
      rows: [
        { shade: "8.3", parts: 1, dev: "20 vol" },
        { shade: "9.13", parts: 2, dev: "20 vol" },
        { shade: "0.11", parts: 0.5, dev: "20 vol" }
      ]
    },
    {
      date: "18 Mar 2026",
      tech: "Global gloss",
      time: 20,
      note: "Pearl glaze to kill brass between sessions. Cool but not flat.",
      rows: [
        { shade: "Clear", parts: 2, dev: "10 vol" },
        { shade: "10.21", parts: 1, dev: "10 vol" }
      ]
    },
    {
      date: "02 Feb 2026",
      tech: "Root retouch",
      time: 40,
      note: "Regrowth blend, warm natural base. Slightly warmer than target.",
      rows: [
        { shade: "7N", parts: 1, dev: "20 vol" },
        { shade: "6.1", parts: 1, dev: "20 vol" }
      ]
    }
  ];

  // ---- Elements ----
  var $ = function (id) { return document.getElementById(id); };
  var rowsEl = $("rows");
  var historyEl = $("history");
  var toastEl = $("toast");
  var processTimeEl = $("processTime");

  function shadeByCode(code) {
    for (var i = 0; i < SHADES.length; i++) {
      if (SHADES[i].code === code) return SHADES[i];
    }
    return SHADES[0];
  }

  function fmtParts(n) {
    return (Math.round(n * 100) / 100).toString();
  }

  // ---- Render builder rows ----
  function renderRows() {
    rowsEl.innerHTML = "";
    rowsData.forEach(function (r, i) {
      var li = document.createElement("li");
      li.className = "row";

      // Shade cell
      var shadeCell = document.createElement("div");
      shadeCell.className = "row__shade";

      var sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = shadeByCode(r.shade).hex;

      var sel = document.createElement("select");
      sel.setAttribute("aria-label", "Shade for row " + (i + 1));
      SHADES.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s.code;
        opt.textContent = s.code + " · " + s.name;
        if (s.code === r.shade) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () {
        r.shade = sel.value;
        sw.style.background = shadeByCode(r.shade).hex;
        update();
      });
      shadeCell.appendChild(sw);
      shadeCell.appendChild(sel);

      // Parts cell
      var partsInput = document.createElement("input");
      partsInput.type = "number";
      partsInput.min = "0";
      partsInput.step = "0.5";
      partsInput.value = r.parts;
      partsInput.setAttribute("aria-label", "Parts for row " + (i + 1));
      partsInput.addEventListener("input", function () {
        var v = parseFloat(partsInput.value);
        r.parts = isNaN(v) || v < 0 ? 0 : v;
        update();
      });

      // Developer cell
      var devSel = document.createElement("select");
      devSel.setAttribute("aria-label", "Developer for row " + (i + 1));
      DEVELOPERS.forEach(function (d) {
        var opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        if (d === r.dev) opt.selected = true;
        devSel.appendChild(opt);
      });
      devSel.addEventListener("change", function () {
        r.dev = devSel.value;
      });

      // Remove cell
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "row__rm";
      rm.textContent = "×";
      rm.setAttribute("aria-label", "Remove row " + (i + 1));
      rm.addEventListener("click", function () {
        if (rowsData.length <= 1) {
          toast("At least one shade is required");
          return;
        }
        rowsData.splice(i, 1);
        renderRows();
        update();
      });

      li.appendChild(shadeCell);
      li.appendChild(partsInput);
      li.appendChild(devSel);
      li.appendChild(rm);
      rowsEl.appendChild(li);
    });
  }

  // ---- Update live readout ----
  function update() {
    var total = rowsData.reduce(function (sum, r) { return sum + (r.parts || 0); }, 0);

    $("rowCount").textContent = rowsData.length + (rowsData.length === 1 ? " shade" : " shades");
    $("totalParts").textContent = fmtParts(total) + (total === 1 ? " part" : " parts");
    $("totalGrams").textContent = Math.round(total * GRAMS_PER_PART) + " g";

    // Ratio readout (parts joined by colon, simplified to whole-ish numbers)
    var ratioStr;
    if (total === 0) {
      ratioStr = "—";
    } else {
      ratioStr = rowsData.map(function (r) { return fmtParts(r.parts || 0); }).join(" : ");
    }
    $("ratio").textContent = ratioStr;

    // Ratio bar
    var bar = $("ratioBar");
    bar.innerHTML = "";
    rowsData.forEach(function (r) {
      var seg = document.createElement("span");
      var pct = total > 0 ? ((r.parts || 0) / total) * 100 : 0;
      seg.style.width = pct + "%";
      seg.style.background = shadeByCode(r.shade).hex;
      bar.appendChild(seg);
    });
  }

  // ---- Render history ----
  function renderHistory() {
    historyEl.innerHTML = "";
    history.forEach(function (h, i) {
      var li = document.createElement("li");
      li.className = "hist";

      var top = document.createElement("div");
      top.className = "hist__top";
      var date = document.createElement("span");
      date.className = "hist__date";
      date.textContent = h.date;
      var tech = document.createElement("span");
      tech.className = "hist__tech";
      tech.textContent = h.tech + " · " + h.time + " min";
      top.appendChild(date);
      top.appendChild(tech);

      var sws = document.createElement("div");
      sws.className = "hist__swatches";
      h.rows.forEach(function (r) {
        var s = document.createElement("span");
        s.className = "swatch";
        s.style.background = shadeByCode(r.shade).hex;
        s.title = r.shade;
        sws.appendChild(s);
      });

      var note = document.createElement("p");
      note.className = "hist__note";
      note.textContent = h.note;

      var load = document.createElement("button");
      load.type = "button";
      load.className = "hist__load";
      load.textContent = "Load into builder";
      load.addEventListener("click", function () {
        loadFormula(i);
      });

      li.appendChild(top);
      li.appendChild(sws);
      li.appendChild(note);
      li.appendChild(load);
      historyEl.appendChild(li);
    });
    $("histCount").textContent = history.length + " saved";
  }

  // ---- Load a past formula ----
  function loadFormula(i) {
    var h = history[i];
    rowsData = h.rows.map(function (r) {
      return { shade: r.shade, parts: r.parts, dev: r.dev };
    });
    processTimeEl.textContent = h.time;
    $("resultNote").value = h.note;
    // Set technique select if it matches an option
    var techSel = $("technique");
    for (var k = 0; k < techSel.options.length; k++) {
      if (techSel.options[k].value === h.tech) { techSel.selectedIndex = k; break; }
    }
    renderRows();
    update();
    toast("Loaded formula from " + h.date);
  }

  // ---- Save current formula ----
  function saveFormula() {
    var total = rowsData.reduce(function (sum, r) { return sum + (r.parts || 0); }, 0);
    if (total <= 0) {
      toast("Add some parts before saving");
      return;
    }
    var now = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dateStr = ("0" + now.getDate()).slice(-2) + " " + months[now.getMonth()] + " " + now.getFullYear();
    var note = $("resultNote").value.trim() || "Saved formula — no note added.";

    history.unshift({
      date: dateStr,
      tech: $("technique").value,
      time: parseInt(processTimeEl.textContent, 10),
      note: note,
      rows: rowsData.map(function (r) { return { shade: r.shade, parts: r.parts, dev: r.dev }; })
    });
    renderHistory();
    toast("Formula saved to Aria's record");
  }

  // ---- Process time stepper ----
  function stepTime(delta) {
    var v = parseInt(processTimeEl.textContent, 10) || 0;
    v = Math.max(5, Math.min(90, v + delta));
    processTimeEl.textContent = v;
  }

  // ---- Toast ----
  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = '<span class="toast__mark" aria-hidden="true">✓</span>' + msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2600);
  }

  // ---- Wire up ----
  $("addRow").addEventListener("click", function () {
    rowsData.push({ shade: "Clear", parts: 1, dev: "20 vol" });
    renderRows();
    update();
  });
  $("timeUp").addEventListener("click", function () { stepTime(5); });
  $("timeDown").addEventListener("click", function () { stepTime(-5); });
  $("saveBtn").addEventListener("click", saveFormula);

  // ---- Init ----
  renderRows();
  update();
  renderHistory();
})();
