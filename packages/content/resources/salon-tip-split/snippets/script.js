(function () {
  "use strict";

  var fmt = function (n) {
    if (!isFinite(n)) n = 0;
    return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  var num = function (el) {
    var v = parseFloat(el.value);
    return isFinite(v) && v >= 0 ? v : 0;
  };
  var initials = function (name) {
    var p = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!p.length) return "•";
    return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase();
  };

  /* ───────── Toast ───────── */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ════════════ Calculator ════════════ */
  var serviceTotal = document.getElementById("serviceTotal");
  var tipValue = document.getElementById("tipValue");
  var tipSym = document.getElementById("tipSym");
  var commissionRate = document.getElementById("commissionRate");
  var rateOut = document.getElementById("rateOut");
  var presets = document.getElementById("tipPresets");

  var tipMode = "pct"; // "pct" | "amt"

  function activeTip() {
    // returns absolute tip dollars based on mode
    var service = num(serviceTotal);
    if (tipMode === "pct") {
      return service * (num(tipValue) / 100);
    }
    return num(tipValue);
  }

  function recalc() {
    var service = num(serviceTotal);
    var rate = num(commissionRate) / 100;
    var tip = activeTip();

    var commission = service * rate;
    var salon = service - commission;
    var take = commission + tip;

    document.getElementById("rowService").textContent = fmt(service);
    document.getElementById("rowComm").textContent = fmt(commission);
    document.getElementById("rowTip").textContent = fmt(tip);
    document.getElementById("rowSalon").textContent = fmt(salon);
    document.getElementById("rowTake").textContent = fmt(take);
    document.getElementById("takeHome").textContent = fmt(take);

    // stacked bar — proportion of grand total (service + tip)
    var grand = service + tip;
    var pc = grand > 0 ? (commission / grand) * 100 : 0;
    var pt = grand > 0 ? (tip / grand) * 100 : 0;
    var ps = grand > 0 ? (salon / grand) * 100 : 0;
    document.getElementById("barComm").style.width = pc + "%";
    document.getElementById("barTip").style.width = pt + "%";
    document.getElementById("barSalon").style.width = ps + "%";
  }

  function syncRate() {
    var v = num(commissionRate);
    rateOut.textContent = v + "%";
    commissionRate.style.setProperty("--fill", v + "%");
  }

  // tip mode toggle
  document.querySelectorAll("[data-tipmode]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      tipMode = btn.getAttribute("data-tipmode");
      document.querySelectorAll("[data-tipmode]").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (tipMode === "pct") {
        tipSym.textContent = "%";
        presets.style.display = "";
        if (num(tipValue) > 100) tipValue.value = "20";
      } else {
        tipSym.textContent = "$";
        presets.style.display = "none";
        // convert current % into a dollar value for convenience
        tipValue.value = activeTipFromPctSnapshot().toFixed(0);
        clearPresets();
      }
      recalc();
    });
  });

  var lastPct = 20;
  function activeTipFromPctSnapshot() {
    return num(serviceTotal) * (lastPct / 100);
  }

  function clearPresets() {
    presets.querySelectorAll(".preset").forEach(function (p) {
      p.classList.remove("is-active");
    });
  }

  // tip presets
  presets.querySelectorAll(".preset").forEach(function (p) {
    p.addEventListener("click", function () {
      clearPresets();
      p.classList.add("is-active");
      var pct = Math.round(parseFloat(p.getAttribute("data-tip")) * 100);
      lastPct = pct;
      tipMode = "pct";
      document.querySelectorAll("[data-tipmode]").forEach(function (b) {
        var on = b.getAttribute("data-tipmode") === "pct";
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      tipSym.textContent = "%";
      presets.style.display = "";
      tipValue.value = String(pct);
      recalc();
    });
  });

  serviceTotal.addEventListener("input", recalc);
  tipValue.addEventListener("input", function () {
    if (tipMode === "pct") lastPct = num(tipValue);
    clearPresets();
    recalc();
  });
  commissionRate.addEventListener("input", function () {
    syncRate();
    recalc();
  });

  document.getElementById("settleBtn").addEventListener("click", function () {
    toast("Ticket settled — " + document.getElementById("takeHome").textContent + " to Aria Vance.");
  });

  syncRate();
  recalc();

  /* ════════════ Split mode ════════════ */
  var list = document.getElementById("stylistList");
  var tpl = document.getElementById("stylistTpl");
  var poolTip = document.getElementById("poolTip");
  var splitMode = "hours"; // "hours" | "even"

  var seed = [
    { name: "Aria Vance", hours: 6 },
    { name: "Léa Moreau", hours: 4.5 },
    { name: "Noor Haddad", hours: 3 }
  ];

  function rows() {
    return Array.prototype.slice.call(list.querySelectorAll(".stylist"));
  }

  function recalcSplit() {
    var pool = num(poolTip);
    var r = rows();
    var n = r.length;
    if (!n) return;

    var totalHours = 0;
    r.forEach(function (row) {
      totalHours += num(row.querySelector(".stylist__hourval"));
    });

    r.forEach(function (row) {
      var amtEl = row.querySelector(".stylist__amt");
      var share;
      if (splitMode === "even") {
        share = pool / n;
      } else {
        var h = num(row.querySelector(".stylist__hourval"));
        share = totalHours > 0 ? pool * (h / totalHours) : 0;
      }
      amtEl.textContent = fmt(share);
    });
  }

  function makeRow(data) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    var nameI = node.querySelector(".stylist__name");
    var hourI = node.querySelector(".stylist__hourval");
    var avatar = node.querySelector(".stylist__avatar");

    nameI.value = data.name || "";
    hourI.value = data.hours != null ? String(data.hours) : "";
    avatar.textContent = initials(data.name);

    nameI.addEventListener("input", function () {
      avatar.textContent = initials(nameI.value);
    });
    hourI.addEventListener("input", recalcSplit);

    node.querySelector(".stylist__rm").addEventListener("click", function () {
      if (rows().length <= 1) {
        toast("Keep at least one stylist on the split.");
        return;
      }
      node.remove();
      recalcSplit();
    });

    node.classList.toggle("is-even", splitMode === "even");
    list.appendChild(node);
    return node;
  }

  seed.forEach(makeRow);
  recalcSplit();

  poolTip.addEventListener("input", recalcSplit);

  document.querySelectorAll("[data-splitmode]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      splitMode = btn.getAttribute("data-splitmode");
      document.querySelectorAll("[data-splitmode]").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      rows().forEach(function (row) {
        row.classList.toggle("is-even", splitMode === "even");
      });
      recalcSplit();
    });
  });

  document.getElementById("addStylist").addEventListener("click", function () {
    var n = rows().length + 1;
    var row = makeRow({ name: "", hours: 3 });
    row.querySelector(".stylist__name").placeholder = "Stylist " + n;
    row.querySelector(".stylist__name").focus();
    recalcSplit();
  });
})();
