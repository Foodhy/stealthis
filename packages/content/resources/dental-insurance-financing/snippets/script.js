(function () {
  "use strict";

  /* ---------- Data ---------- */
  var INSURERS = [
    { name: "Delta Meridian", short: "DM", color: "#2563eb" },
    { name: "Cigna Rowan", short: "CR", color: "#0ea5a3" },
    { name: "Aetna Bluepeak", short: "AB", color: "#7c3aed" },
    { name: "MetLife Grove", short: "MG", color: "#16a34a" },
    { name: "Guardian Vale", short: "GV", color: "#db2777" },
    { name: "Humana Crest", short: "HC", color: "#ea580c" },
    { name: "United Harbor", short: "UH", color: "#0284c7" },
    { name: "Principal Oak", short: "PO", color: "#4f46e5" }
  ];

  var PLANS = [
    {
      term: "Short term", months: 6, featured: false,
      perks: ["0% APR for 6 months", "No prepayment penalty", "Decision in minutes"]
    },
    {
      term: "Balanced", months: 12, featured: true,
      perks: ["0% APR for 12 months", "Lower monthly payments", "Covers most treatment plans", "Autopay reminders"]
    },
    {
      term: "Extended", months: 24, featured: false,
      perks: ["0% APR for 24 months", "Smallest monthly payment", "Great for full-mouth care"]
    }
  ];

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  var checkSVG = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var toastEl = $("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Render insurers ---------- */
  var grid = $("insurerGrid");
  INSURERS.forEach(function (ins) {
    var card = document.createElement("div");
    card.className = "insurer";
    card.innerHTML =
      '<div class="logo" style="background:' + ins.color + '">' + ins.short + '</div>' +
      '<div class="name">' + ins.name + '</div>' +
      '<span class="chip">' + checkSVG + ' In-network</span>';
    grid.appendChild(card);
  });
  $("insCount").textContent = INSURERS.length + " plans in-network";

  /* ---------- Render plans ---------- */
  var planRow = $("planRow");
  PLANS.forEach(function (p) {
    var el = document.createElement("div");
    el.className = "plan" + (p.featured ? " featured" : "");
    el.setAttribute("role", "listitem");
    var lis = p.perks.map(function (t) { return "<li>" + checkSVG + "<span>" + t + "</span></li>"; }).join("");
    el.innerHTML =
      (p.featured ? '<span class="ribbon">Most chosen</span>' : "") +
      '<span class="term-name">' + p.term + '</span>' +
      '<div class="apr"><b>0%</b><span>APR</span></div>' +
      '<div class="months">Pay over ' + p.months + ' months</div>' +
      '<ul>' + lis + '</ul>' +
      '<button type="button" class="btn-plan" data-months="' + p.months + '">Use this plan</button>';
    planRow.appendChild(el);
  });

  planRow.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-plan");
    if (!btn) return;
    var m = parseInt(btn.getAttribute("data-months"), 10);
    setTerm(m);
    compute();
    $("costInput").focus({ preventScroll: true });
    document.querySelector(".calc-block").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(m + "-month plan loaded into the calculator");
  });

  /* ---------- Calculator ---------- */
  var costInput = $("costInput");
  var costRange = $("costRange");
  var downInput = $("downInput");
  var downRange = $("downRange");
  var termGroup = $("termGroup");
  var monthlyEl = $("monthly");

  var months = 12;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function setTerm(m) {
    months = m;
    Array.prototype.forEach.call(termGroup.children, function (b) {
      var on = parseInt(b.getAttribute("data-months"), 10) === m;
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  // animate the monthly number
  var animFrom = 0, animRAF;
  function animateMonthly(to) {
    cancelAnimationFrame(animRAF);
    var from = animFrom, start = null, dur = 380;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = from + (to - from) * eased;
      monthlyEl.textContent = Math.round(val).toLocaleString("en-US");
      if (t < 1) { animRAF = requestAnimationFrame(step); } else { animFrom = to; }
    }
    animRAF = requestAnimationFrame(step);
  }

  function compute() {
    var cost = clamp(parseFloat(costInput.value) || 0, 250, 25000);
    var down = clamp(parseFloat(downInput.value) || 0, 0, cost);
    var financed = Math.max(0, cost - down);
    var monthly = months > 0 ? financed / months : 0;

    animateMonthly(monthly);
    $("financed").textContent = money(financed);
    $("payments").textContent = months + " payments";
    $("downOut").textContent = money(down);
    $("total").textContent = money(cost);
  }

  // keep slider + number field in sync
  function bindPair(numEl, rangeEl, max) {
    numEl.addEventListener("input", function () {
      var v = clamp(parseFloat(numEl.value) || 0, parseFloat(numEl.min), parseFloat(numEl.max));
      if (parseFloat(rangeEl.value) !== v) rangeEl.value = Math.min(v, parseFloat(rangeEl.max));
      compute();
    });
    rangeEl.addEventListener("input", function () {
      numEl.value = rangeEl.value;
      compute();
    });
    numEl.addEventListener("blur", function () {
      var v = clamp(parseFloat(numEl.value) || parseFloat(numEl.min), parseFloat(numEl.min), parseFloat(numEl.max));
      numEl.value = v;
      compute();
    });
  }
  bindPair(costInput, costRange);
  bindPair(downInput, downRange);

  // segmented term control (mouse + keyboard)
  termGroup.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    setTerm(parseInt(b.getAttribute("data-months"), 10));
    compute();
  });
  termGroup.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    var btns = Array.prototype.slice.call(termGroup.children);
    var i = btns.findIndex(function (b) { return b.getAttribute("aria-checked") === "true"; });
    i = e.key === "ArrowRight" ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
    var next = btns[i];
    setTerm(parseInt(next.getAttribute("data-months"), 10));
    next.focus();
    compute();
  });

  $("calcForm").addEventListener("submit", function (e) { e.preventDefault(); });

  $("applyBtn").addEventListener("click", function () {
    toast("Pre-qualification started — this won't affect your credit score");
  });

  // init
  setTerm(12);
  compute();
})();
