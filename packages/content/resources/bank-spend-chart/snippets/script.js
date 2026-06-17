(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Fictional data — 4 months of categorised spend for a demo account. *
   * ------------------------------------------------------------------ */
  var PALETTE = {
    Housing:       "#3b6ef6",
    Groceries:     "#0fb5a6",
    Dining:        "#7c5cff",
    Transport:     "#d9982b",
    Shopping:      "#d4493e",
    Subscriptions: "#16264d",
    Health:        "#1f9d62",
  };

  var MONTHS = [
    {
      label: "January 2026",
      budget: 4200,
      txns: 71,
      topMerchant: "Harbor Realty",
      cats: [
        { name: "Housing",       amount: 1650.00 },
        { name: "Groceries",     amount: 612.40 },
        { name: "Dining",        amount: 388.15 },
        { name: "Transport",     amount: 244.80 },
        { name: "Shopping",      amount: 415.00 },
        { name: "Subscriptions", amount: 96.94 },
        { name: "Health",        amount: 132.50 },
      ],
    },
    {
      label: "February 2026",
      budget: 4200,
      txns: 64,
      topMerchant: "Harbor Realty",
      cats: [
        { name: "Housing",       amount: 1650.00 },
        { name: "Groceries",     amount: 548.20 },
        { name: "Dining",        amount: 502.70 },
        { name: "Transport",     amount: 198.35 },
        { name: "Shopping",      amount: 286.40 },
        { name: "Subscriptions", amount: 96.94 },
        { name: "Health",        amount: 64.00 },
      ],
    },
    {
      label: "March 2026",
      budget: 4200,
      txns: 83,
      topMerchant: "Lumen Market",
      cats: [
        { name: "Housing",       amount: 1650.00 },
        { name: "Groceries",     amount: 701.85 },
        { name: "Dining",        amount: 441.10 },
        { name: "Transport",     amount: 312.60 },
        { name: "Shopping",      amount: 689.25 },
        { name: "Subscriptions", amount: 114.93 },
        { name: "Health",        amount: 208.40 },
      ],
    },
    {
      label: "April 2026",
      budget: 4200,
      txns: 76,
      topMerchant: "Aera Coffee",
      cats: [
        { name: "Housing",       amount: 1650.00 },
        { name: "Groceries",     amount: 634.55 },
        { name: "Dining",        amount: 528.90 },
        { name: "Transport",     amount: 271.20 },
        { name: "Shopping",      amount: 372.80 },
        { name: "Subscriptions", amount: 114.93 },
        { name: "Health",        amount: 88.00 },
      ],
    },
  ];

  /* ------------------------------------------------------------------ */
  var current = MONTHS.length - 1; // start on April 2026
  var activeCat = null;

  var SVGNS = "http://www.w3.org/2000/svg";
  var R = 75;            // donut radius
  var CIRC = 2 * Math.PI * R;

  var $ = function (id) { return document.getElementById(id); };
  var donut       = $("donut");
  var segGroup    = $("segGroup");
  var legendList  = $("legendList");
  var monthLabel  = $("monthLabel");
  var centerTotal = $("centerTotal");
  var centerDelta = $("centerDelta");
  var txnCount    = $("txnCount");
  var budgetState = $("budgetState");
  var topMerchant = $("topMerchant");
  var prevBtn     = document.querySelector('[data-step="-1"]');
  var nextBtn     = document.querySelector('[data-step="1"]');

  function money(n, withSign) {
    var s = "$" + n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return withSign && n > 0 ? "+" + s : s;
  }

  function total(m) {
    return m.cats.reduce(function (sum, c) { return sum + c.amount; }, 0);
  }

  /* ----------------------------- Toast ----------------------------- */
  var toastEl = $("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* --------------------------- Highlight --------------------------- */
  function setActive(name) {
    activeCat = name;
    donut.classList.toggle("has-active", !!name);

    var segs = segGroup.querySelectorAll(".seg");
    for (var i = 0; i < segs.length; i++) {
      segs[i].classList.toggle("is-active", segs[i].dataset.cat === name);
    }
    var rows = legendList.querySelectorAll(".leg");
    for (var j = 0; j < rows.length; j++) {
      var on = rows[j].dataset.cat === name;
      rows[j].classList.toggle("is-active", on);
      rows[j].setAttribute("aria-pressed", on ? "true" : "false");
    }

    var m = MONTHS[current];
    if (name) {
      var cat = m.cats.find(function (c) { return c.name === name; });
      var pct = (cat.amount / total(m)) * 100;
      centerTotal.textContent = money(cat.amount).replace(".00", "");
      donut.setAttribute("aria-label", name + ": " + money(cat.amount) + ", " + pct.toFixed(1) + "% of spend");
    } else {
      centerTotal.textContent = money(total(m)).replace(".00", "");
      donut.setAttribute("aria-label", "Spending donut chart, total " + money(total(m)));
    }
  }

  function toggleActive(name) {
    setActive(activeCat === name ? null : name);
  }

  /* ----------------------------- Render ---------------------------- */
  function render() {
    var m = MONTHS[current];
    var t = total(m);

    monthLabel.textContent = m.label;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === MONTHS.length - 1;

    // Center total + month-over-month delta
    centerTotal.textContent = money(t).replace(".00", "");
    if (current > 0) {
      var prevT = total(MONTHS[current - 1]);
      var diff = t - prevT;
      var pctChange = (diff / prevT) * 100;
      centerDelta.textContent =
        (diff >= 0 ? "▲ " : "▼ ") + Math.abs(pctChange).toFixed(1) + "% vs last month";
      centerDelta.className = "center__delta " + (diff >= 0 ? "up" : "down");
    } else {
      centerDelta.textContent = "First month on record";
      centerDelta.className = "center__delta";
    }

    // Footer stats
    txnCount.textContent = m.txns;
    topMerchant.textContent = m.topMerchant;
    var over = t > m.budget;
    var near = !over && t > m.budget * 0.9;
    budgetState.innerHTML = over
      ? '<span class="pill pill--danger">Over by ' + money(t - m.budget).replace(".00", "") + "</span>"
      : near
      ? '<span class="pill pill--warn">Near limit</span>'
      : '<span class="pill pill--ok">On track</span>';

    // Sort categories desc so legend + donut read top-down
    var cats = m.cats.slice().sort(function (a, b) { return b.amount - a.amount; });

    // ---- Donut segments (SVG stroke-dasharray) ----
    segGroup.innerHTML = "";
    var offset = 0;
    cats.forEach(function (c, idx) {
      var frac = c.amount / t;
      var len = frac * CIRC;
      var seg = document.createElementNS(SVGNS, "circle");
      seg.setAttribute("class", "seg");
      seg.setAttribute("cx", "100");
      seg.setAttribute("cy", "100");
      seg.setAttribute("r", String(R));
      seg.setAttribute("stroke", PALETTE[c.name]);
      // gap of 1.2 keeps a hairline between slices
      seg.setAttribute("stroke-dasharray", Math.max(0, len - 1.2) + " " + (CIRC - Math.max(0, len - 1.2)));
      seg.setAttribute("stroke-dashoffset", String(-offset));
      seg.dataset.cat = c.name;
      // animate in
      seg.style.opacity = "0";
      setTimeout(function () { seg.style.opacity = ""; }, 40 + idx * 55);
      segGroup.appendChild(seg);
      offset += len;
    });

    // ---- Legend rows ----
    legendList.innerHTML = "";
    cats.forEach(function (c) {
      var pct = (c.amount / t) * 100;
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "leg";
      btn.dataset.cat = c.name;
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML =
        '<span class="leg__name"><span class="dot" style="background:' + PALETTE[c.name] + '"></span>' +
        '<span>' + c.name + "</span></span>" +
        '<span class="leg__amt">' + money(c.amount) + "</span>" +
        '<span class="leg__pct">' + pct.toFixed(1) + "%</span>";
      li.appendChild(btn);
      legendList.appendChild(li);
    });

    // Re-apply active state if that category still exists this month
    if (activeCat && !cats.some(function (c) { return c.name === activeCat; })) {
      activeCat = null;
    }
    setActive(activeCat);
  }

  /* --------------------------- Interaction ------------------------- */
  // Donut hover (preview) + click (sticky toggle)
  segGroup.addEventListener("mouseover", function (e) {
    var seg = e.target.closest(".seg");
    if (seg && !activeCat) setActive(seg.dataset.cat);
  });
  segGroup.addEventListener("mouseout", function (e) {
    var seg = e.target.closest(".seg");
    if (seg && !stickyMatches(seg.dataset.cat)) setActive(activeCat);
  });
  segGroup.addEventListener("click", function (e) {
    var seg = e.target.closest(".seg");
    if (seg) { stick(seg.dataset.cat); toggleActive(seg.dataset.cat); }
  });

  // Legend click toggles + hover preview
  legendList.addEventListener("click", function (e) {
    var row = e.target.closest(".leg");
    if (row) { stick(row.dataset.cat); toggleActive(row.dataset.cat); }
  });
  legendList.addEventListener("mouseover", function (e) {
    var row = e.target.closest(".leg");
    if (row && !sticky) setActive(row.dataset.cat);
  });
  legendList.addEventListener("mouseout", function () {
    if (!sticky) setActive(activeCat);
  });

  // "sticky" tracks whether the active state came from a click vs hover
  var sticky = null;
  function stick(name) { sticky = activeCat === name ? null : name; }
  function stickyMatches(name) { return sticky === name; }

  // Month switcher
  document.querySelector(".month-switch").addEventListener("click", function (e) {
    var btn = e.target.closest(".month-btn");
    if (!btn) return;
    var next = current + Number(btn.dataset.step);
    if (next < 0 || next >= MONTHS.length) return;
    current = next;
    sticky = activeCat; // keep selection across months when possible
    render();
    toast("Showing " + MONTHS[current].label);
  });

  // Keyboard: left/right arrows step months
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" && current > 0) {
      current--; render(); toast("Showing " + MONTHS[current].label);
    } else if (e.key === "ArrowRight" && current < MONTHS.length - 1) {
      current++; render(); toast("Showing " + MONTHS[current].label);
    } else if (e.key === "Escape" && activeCat) {
      sticky = null; setActive(null);
    }
  });

  $("exportBtn").addEventListener("click", function () {
    toast("Statement for " + MONTHS[current].label + " queued for export");
  });

  render();
})();
