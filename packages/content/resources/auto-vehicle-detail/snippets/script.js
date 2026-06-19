(function () {
  "use strict";

  var PRICE = 42985;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  /* ---------- Gallery ---------- */
  var SHOTS = [
    { label: "Front 3/4", shade: 0, g: "linear-gradient(135deg,#1f2127,#141518)" },
    { label: "Rear 3/4", shade: 1, g: "linear-gradient(135deg,#2a2d34,#16181c)" },
    { label: "Cockpit", shade: 2, g: "linear-gradient(135deg,#3b4049,#1f2127)" },
    { label: "Dashboard", shade: 3, g: "linear-gradient(135deg,#5b6470,#2a2d34)" },
    { label: "2nd Row", shade: 4, g: "linear-gradient(135deg,#2a2d34,#1f2127)" },
    { label: "Cargo", shade: 5, g: "linear-gradient(135deg,#1f2127,#0f1013)" }
  ];

  var stage = document.getElementById("stage");
  var stageCount = document.getElementById("stageCount");
  var stageLabel = document.getElementById("stageLabel");
  var thumbsWrap = document.getElementById("thumbs");
  var current = 0;

  function paintStage(i) {
    var s = SHOTS[i];
    stage.style.background =
      "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.14), transparent 60%)," +
      s.g;
    stage.setAttribute("aria-label", "Vehicle photo, " + s.label);
    stageCount.textContent = i + 1 + " / " + SHOTS.length;
    stageLabel.textContent = s.label;
    var ts = thumbsWrap.querySelectorAll(".thumb");
    for (var k = 0; k < ts.length; k++) {
      ts[k].classList.toggle("is-active", k === i);
      ts[k].setAttribute("aria-selected", k === i ? "true" : "false");
    }
    current = i;
  }

  SHOTS.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "thumb" + (i === 0 ? " is-active" : "");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.setAttribute("aria-label", s.label);
    b.style.background = s.g;
    var lbl = document.createElement("span");
    lbl.textContent = s.label;
    b.appendChild(lbl);
    b.addEventListener("click", function () { paintStage(i); });
    thumbsWrap.appendChild(b);
  });

  function step(dir) {
    paintStage((current + dir + SHOTS.length) % SHOTS.length);
  }
  document.getElementById("prevShot").addEventListener("click", function () { step(-1); });
  document.getElementById("nextShot").addEventListener("click", function () { step(1); });
  document.addEventListener("keydown", function (e) {
    if (document.querySelector(".modal:not([hidden])")) return;
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* ---------- Spec tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".tabpane").forEach(function (p) {
        var on = p.id === "pane-" + name;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
    });
  });

  /* ---------- Like ---------- */
  var likeBtn = document.getElementById("likeBtn");
  likeBtn.addEventListener("click", function () {
    var on = likeBtn.getAttribute("aria-pressed") === "true";
    likeBtn.setAttribute("aria-pressed", on ? "false" : "true");
    toast(on ? "Removed from saved vehicles" : "Saved to your garage");
  });

  /* ---------- Finance calculator ---------- */
  var down = document.getElementById("down");
  var term = document.getElementById("term");
  var apr = document.getElementById("apr");
  var downOut = document.getElementById("downOut");
  var aprOut = document.getElementById("aprOut");
  var calcMonthly = document.getElementById("calcMonthly");
  var calcAmount = document.getElementById("calcAmount");
  var finFrom = document.getElementById("finFrom");
  var stickyPrice = document.getElementById("stickyPrice");

  function monthly(principal, ratePct, months) {
    if (principal <= 0) return 0;
    var r = ratePct / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  }

  function recalc() {
    var d = parseFloat(down.value);
    var t = parseInt(term.value, 10);
    var a = parseFloat(apr.value);
    var financed = Math.max(0, PRICE - d);
    var pay = monthly(financed, a, t);
    downOut.textContent = money(d);
    aprOut.textContent = a.toFixed(1) + "%";
    calcMonthly.textContent = money(pay) + "/mo";
    calcAmount.textContent = "Financing " + money(financed) + " over " + t + " months";
    finFrom.textContent = money(pay);
    var fromLine = document.querySelector(".finance-from");
    fromLine.innerHTML =
      "Est. <strong class=\"num\">" + money(pay) + "</strong>/mo · " + t + " mo @ " + a.toFixed(1) + "% APR";
    stickyPrice.textContent = money(PRICE) + " · est. " + money(pay) + "/mo";
  }
  [down, term, apr].forEach(function (el) {
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });
  recalc();

  /* ---------- Sticky CTA bar ---------- */
  var stickyBar = document.getElementById("stickyBar");
  var priceCard = document.querySelector(".price-card");
  var sentinel = priceCard;
  window.addEventListener(
    "scroll",
    function () {
      var rect = sentinel.getBoundingClientRect();
      var show = rect.bottom < 80 || rect.top > window.innerHeight;
      stickyBar.classList.toggle("show", show);
      stickyBar.setAttribute("aria-hidden", show ? "false" : "true");
    },
    { passive: true }
  );

  /* ---------- Generic toast buttons ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
  });

  /* ---------- Modals ---------- */
  var driveModal = document.getElementById("driveModal");
  var tradeModal = document.getElementById("tradeModal");
  var lastFocus = null;

  function openModal(m) {
    lastFocus = document.activeElement;
    m.hidden = false;
    var first = m.querySelector("input, select, button");
    if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function closeModal(m) {
    m.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById("openDrive").addEventListener("click", function () { openModal(driveModal); });
  document.getElementById("openTrade").addEventListener("click", function () { openModal(tradeModal); });
  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      openModal(b.getAttribute("data-open") === "drive" ? driveModal : tradeModal);
    });
  });
  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () { closeModal(el.closest(".modal")); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = document.querySelector(".modal:not([hidden])");
      if (open) closeModal(open);
    }
  });

  /* ---------- Test drive form ---------- */
  var driveForm = document.getElementById("driveForm");
  var driveErr = document.getElementById("driveErr");
  driveForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = driveForm.name.value.trim();
    var phone = driveForm.phone.value.trim();
    var date = driveForm.date.value;
    if (!name || !phone || !date) {
      driveErr.textContent = "Please add your name, phone and a preferred date.";
      driveErr.hidden = false;
      return;
    }
    driveErr.hidden = true;
    closeModal(driveModal);
    toast("Test drive requested for " + name + " — we'll confirm shortly");
    driveForm.reset();
  });

  /* ---------- Trade-in form ---------- */
  var tradeForm = document.getElementById("tradeForm");
  var tradeOut = document.getElementById("tradeOut");
  var tradeVal = document.getElementById("tradeVal");
  tradeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var year = parseInt(tradeForm.year.value, 10);
    var miles = parseInt(tradeForm.miles.value, 10);
    var cond = parseFloat(tradeForm.cond.value);
    if (!year || isNaN(miles) || !tradeForm.model.value.trim()) {
      toast("Fill in year, mileage and model for an estimate");
      return;
    }
    // Fictional valuation model.
    var base = 28000;
    var ageHit = Math.max(0, 2026 - year) * 1450;
    var mileHit = (miles / 1000) * 105;
    var est = Math.max(900, (base - ageHit - mileHit) * cond);
    est = Math.round(est / 50) * 50;
    tradeVal.textContent = money(est);
    tradeOut.hidden = false;
    toast("Estimated trade value: " + money(est));
  });
})();
