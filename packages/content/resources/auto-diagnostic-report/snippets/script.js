(function () {
  "use strict";

  /** @type {Array<object>} Scanned diagnostic trouble codes */
  var CODES = [
    {
      id: "P0301",
      severity: "critical",
      desc: "Cylinder 1 Misfire Detected",
      system: "Ignition / Fuel",
      freezeRpm: "1,940 rpm",
      coolant: "204 °F",
      load: "61%",
      status: "Confirmed",
      fix: "Replace coil-on-plug & spark plug, cyl. 1",
      fixMeta: "1.1 hr labor · OEM ignition coil + plug",
      cost: 268.4,
    },
    {
      id: "P0420",
      severity: "warning",
      desc: "Catalyst System Efficiency Below Threshold (Bank 1)",
      system: "Emissions",
      freezeRpm: "2,310 rpm",
      coolant: "198 °F",
      load: "44%",
      status: "Confirmed",
      fix: "Inspect & clean downstream O2 sensor, monitor catalyst",
      fixMeta: "0.8 hr diagnostic · clean + retest cycle",
      cost: 124.0,
    },
    {
      id: "C0561",
      severity: "critical",
      desc: "System Configuration Mismatch — ABS Module",
      system: "Brakes / Stability",
      freezeRpm: "Idle",
      coolant: "191 °F",
      load: "12%",
      status: "Active",
      fix: "Reflash ABS controller & wheel-speed calibration",
      fixMeta: "1.4 hr · module software update",
      cost: 312.75,
    },
    {
      id: "P0133",
      severity: "warning",
      desc: "O2 Sensor Slow Response (Bank 1, Sensor 1)",
      system: "Fuel / Emissions",
      freezeRpm: "1,620 rpm",
      coolant: "200 °F",
      load: "38%",
      status: "Confirmed",
      fix: "Replace upstream oxygen sensor",
      fixMeta: "0.7 hr labor · OEM wideband sensor",
      cost: 189.5,
    },
    {
      id: "P0455",
      severity: "info",
      desc: "Evaporative Emission System — Large Leak",
      system: "EVAP",
      freezeRpm: "Idle",
      coolant: "186 °F",
      load: "9%",
      status: "Pending",
      fix: "Inspect fuel cap seal & EVAP lines",
      fixMeta: "0.4 hr · smoke test if pending recurs",
      cost: 48.0,
    },
    {
      id: "B1342",
      severity: "info",
      desc: "ECU Internal Memory Fault — Stored",
      system: "Body Control",
      freezeRpm: "—",
      coolant: "—",
      load: "—",
      status: "Stored / Inactive",
      fix: "Clear code, recheck after road test",
      fixMeta: "0.2 hr · monitor for recurrence",
      cost: 0,
    },
  ];

  var approved = {}; // id -> true

  /* ---------- helpers ---------- */
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function sevLabel(s) {
    return s === "critical" ? "Critical" : s === "warning" ? "Warning" : "Info";
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, ok) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("ok", !!ok);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- render codes ---------- */
  var listEl = document.getElementById("codeList");
  var emptyEl = document.getElementById("emptyState");

  function chevronSvg() {
    return '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  }

  function buildCode(c) {
    var li = document.createElement("li");
    li.className = "code";
    li.dataset.sev = c.severity;
    li.dataset.id = c.id;

    var bodyId = "body-" + c.id;
    var costLine = c.cost > 0
      ? '<span class="fix-cost mono">' + money(c.cost) + "</span>"
      : '<span class="fix-cost mono">No charge</span>';
    var approveBtn = c.cost > 0
      ? '<button class="btn-approve" data-approve type="button">Approve fix</button>'
      : '<button class="btn-approve" data-approve type="button">Mark done</button>';

    li.innerHTML =
      '<button class="code-head" type="button" aria-expanded="false" aria-controls="' + bodyId + '">' +
        '<span class="sev-rail" aria-hidden="true"></span>' +
        '<span class="code-id mono">' + c.id + "</span>" +
        '<span class="code-main">' +
          '<span class="code-desc">' + c.desc + "</span>" +
          '<span class="code-system">' + c.system + "</span>" +
        "</span>" +
        '<span class="code-right">' +
          '<span class="sev-badge">' + sevLabel(c.severity) + "</span>" +
          chevronSvg() +
        "</span>" +
      "</button>" +
      '<div class="code-body" id="' + bodyId + '"><div class="code-body-inner"><div class="code-detail">' +
        '<dl class="detail-grid">' +
          '<div class="detail-cell"><dt>Status</dt><dd>' + c.status + "</dd></div>" +
          '<div class="detail-cell"><dt>Freeze RPM</dt><dd class="mono">' + c.freezeRpm + "</dd></div>" +
          '<div class="detail-cell"><dt>Coolant</dt><dd class="mono">' + c.coolant + "</dd></div>" +
          '<div class="detail-cell"><dt>Engine Load</dt><dd class="mono">' + c.load + "</dd></div>" +
          '<div class="detail-cell"><dt>System</dt><dd>' + c.system + "</dd></div>" +
          '<div class="detail-cell"><dt>Severity</dt><dd>' + sevLabel(c.severity) + "</dd></div>" +
        "</dl>" +
        '<div class="fix-block">' +
          '<div class="fix-text">' +
            '<div class="fix-label">Recommended fix</div>' +
            '<div class="fix-name">' + c.fix + "</div>" +
            '<div class="fix-meta">' + c.fixMeta + "</div>" +
          "</div>" +
          '<div class="fix-action">' + costLine + approveBtn + "</div>" +
        "</div>" +
      "</div></div></div>";

    // toggle expand
    var head = li.querySelector(".code-head");
    head.addEventListener("click", function () {
      var open = li.classList.toggle("is-open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // approve
    var btn = li.querySelector("[data-approve]");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (li.classList.contains("is-approved")) return;
      li.classList.add("is-approved");
      approved[c.id] = c;
      btn.textContent = c.cost > 0 ? "Approved ✓" : "Done ✓";
      renderEstimate();
      toast(c.id + " — fix approved", true);
    });

    return li;
  }

  function renderCodes() {
    listEl.innerHTML = "";
    CODES.forEach(function (c) {
      listEl.appendChild(buildCode(c));
    });
  }

  /* ---------- severity filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  function applyFilter(sev) {
    var visible = 0;
    Array.prototype.forEach.call(listEl.children, function (li) {
      var show = sev === "all" || li.dataset.sev === sev;
      li.style.display = show ? "" : "none";
      if (show) visible++;
    });
    emptyEl.hidden = visible !== 0;
  }
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filterBtns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      applyFilter(b.dataset.sev);
    });
  });

  /* ---------- estimate panel ---------- */
  var estList = document.getElementById("estList");
  var estEmpty = document.getElementById("estEmpty");
  var estTotalEl = document.getElementById("estTotal");
  var authBtn = document.getElementById("authBtn");

  function renderEstimate() {
    var items = Object.keys(approved).map(function (k) { return approved[k]; });
    estList.innerHTML = "";
    if (!items.length) {
      estList.appendChild(estEmpty);
      estEmpty.hidden = false;
    } else {
      estEmpty.hidden = true;
    }
    var total = 0;
    items.forEach(function (c) {
      total += c.cost;
      var li = document.createElement("li");
      li.className = "est-row";
      li.innerHTML =
        '<span class="est-row-text">' +
          '<span class="est-row-name">' + c.fix + "</span>" +
          '<span class="est-row-code mono">' + c.id + " · " + c.system + "</span>" +
        "</span>" +
        '<span class="est-row-cost mono">' + (c.cost > 0 ? money(c.cost) : "—") + "</span>";
      estList.appendChild(li);
    });
    estTotalEl.textContent = money(total);
    authBtn.disabled = items.length === 0;
  }

  authBtn.addEventListener("click", function () {
    var count = Object.keys(approved).length;
    if (!count) return;
    toast("Work order authorized · " + count + " repair" + (count > 1 ? "s" : "") + " sent to Bay 04", true);
  });

  /* ---------- health gauges (animated count-up) ---------- */
  function gaugeColor(v) {
    if (v >= 75) return "var(--ok)";
    if (v >= 50) return "var(--warn)";
    return "var(--danger)";
  }
  function animateGauges() {
    var gauges = Array.prototype.slice.call(document.querySelectorAll(".gauge"));
    gauges.forEach(function (g) {
      var target = parseInt(g.dataset.value, 10) || 0;
      var ring = g.querySelector(".gauge-ring");
      var num = g.querySelector(".gauge-num");
      ring.style.setProperty("--col", gaugeColor(target));
      var cur = 0;
      var start = performance.now();
      var dur = 900;
      function step(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        cur = Math.round(eased * target);
        ring.style.setProperty("--val", cur);
        num.textContent = cur;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- init ---------- */
  renderCodes();
  renderEstimate();
  applyFilter("all");
  // open the first critical code so the report opens informatively
  var firstCritical = listEl.querySelector('.code[data-sev="critical"] .code-head');
  if (firstCritical) firstCritical.click();
  requestAnimationFrame(animateGauges);
})();
