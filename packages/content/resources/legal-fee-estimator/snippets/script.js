(function () {
  "use strict";

  var form = document.getElementById("fee-form");
  if (!form) return;

  var $ = function (id) {
    return document.getElementById(id);
  };

  var els = {
    service: $("service"),
    hours: $("hours"),
    rate: $("rate"),
    complexity: $("complexity"),
    scope: $("scope"),
    recovery: $("recovery"),
    pct: $("pct"),
    filing: $("filing"),
    hoursOut: $("hours-out"),
    rateOut: $("rate-out"),
    complexityOut: $("complexity-out"),
    scopeOut: $("scope-out"),
    pctOut: $("pct-out"),
    total: $("total"),
    badge: $("model-badge"),
    breakdown: $("breakdown"),
    note: $("note"),
    cta: $("cta"),
  };

  var FILING_COST = 640;
  var COMPLEXITY = [
    { label: "Standard", mult: 1 },
    { label: "Complex", mult: 1.35 },
    { label: "Highly complex", mult: 1.75 },
  ];
  var SCOPE = [
    { label: "Essentials", mult: 0.8 },
    { label: "Standard package", mult: 1 },
    { label: "Comprehensive", mult: 1.4 },
  ];

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function getModel() {
    var checked = form.querySelector('input[name="model"]:checked');
    return checked ? checked.value : "hourly";
  }

  function showBlock(model) {
    var blocks = document.querySelectorAll(".model-block");
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].hidden = blocks[i].getAttribute("data-block") !== model;
    }
  }

  function row(label, value, isCredit) {
    var li = document.createElement("li");
    if (isCredit) li.className = "is-credit";
    var a = document.createElement("span");
    a.textContent = label;
    var b = document.createElement("span");
    b.textContent = value;
    li.appendChild(a);
    li.appendChild(b);
    return li;
  }

  function flashTotal() {
    els.total.classList.remove("flash");
    /* force reflow so the class re-applies */
    void els.total.offsetWidth;
    els.total.classList.add("flash");
  }

  function calc() {
    var model = getModel();
    showBlock(model);

    var serviceLabel =
      els.service.options[els.service.selectedIndex].text.trim();
    var base = parseFloat(
      els.service.options[els.service.selectedIndex].getAttribute("data-base")
    );

    var items = [];
    var total = 0;
    var note = "";
    var badge = "";

    if (model === "hourly") {
      badge = "Hourly billing";
      var hrs = parseInt(els.hours.value, 10);
      var rate = parseInt(els.rate.value, 10);
      var cx = COMPLEXITY[parseInt(els.complexity.value, 10)];

      els.hoursOut.textContent = hrs + " hrs";
      els.rateOut.textContent = "$" + rate + "/hr";
      els.complexityOut.textContent = cx.label;

      var legal = hrs * rate;
      var adj = legal * (cx.mult - 1);
      total = legal + adj;

      items.push(row("Legal services (" + hrs + " hrs × $" + rate + ")", money(legal)));
      if (adj > 0) {
        items.push(row(cx.label + " adjustment", money(adj)));
      }
      note =
        "Based on " +
        hrs +
        " hours at $" +
        rate +
        "/hr for a " +
        cx.label.toLowerCase() +
        " " +
        serviceLabel.toLowerCase() +
        " matter.";
    } else if (model === "flat") {
      badge = "Fixed flat fee";
      var sc = SCOPE[parseInt(els.scope.value, 10)];
      els.scopeOut.textContent = sc.label;

      var flat = (base || 2400) * sc.mult;
      total = flat;
      items.push(row(serviceLabel + " — " + sc.label, money(flat)));
      note =
        "A fixed " +
        sc.label.toLowerCase() +
        " quote for your " +
        serviceLabel.toLowerCase() +
        " matter, billed once on engagement.";
    } else {
      badge = "Contingency (no win, no fee)";
      var recovery = parseFloat(els.recovery.value) || 0;
      var pct = parseInt(els.pct.value, 10);
      els.pctOut.textContent = pct + "%";

      var fee = recovery * (pct / 100);
      total = fee;
      items.push(row("Expected recovery", money(recovery)));
      items.push(row("Firm fee (" + pct + "% of recovery)", money(fee)));
      var net = recovery - fee;
      items.push(row("Estimated net to you", money(net), true));
      note =
        "You pay " +
        pct +
        "% only if we recover. On a " +
        money(recovery) +
        " outcome, your estimated fee is " +
        money(fee) +
        ".";
    }

    if (els.filing.checked) {
      total += FILING_COST;
      items.push(row("Filing & court costs", money(FILING_COST)));
    }

    /* render */
    els.breakdown.innerHTML = "";
    for (var i = 0; i < items.length; i++) {
      els.breakdown.appendChild(items[i]);
    }
    els.total.textContent = money(total);
    els.badge.textContent = badge;
    els.note.textContent = note;
    flashTotal();
  }

  form.addEventListener("input", calc);
  form.addEventListener("change", calc);

  els.cta.addEventListener("click", function () {
    var orig = els.cta.textContent;
    els.cta.textContent = "Request sent — we'll be in touch";
    els.cta.disabled = true;
    setTimeout(function () {
      els.cta.textContent = orig;
      els.cta.disabled = false;
    }, 2400);
  });

  calc();
})();
