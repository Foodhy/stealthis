(function () {
  "use strict";

  var fmt = function (n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 }); };

  /* ---- Data ---- */
  var policies = [
    {
      type: "Auto Insurance", num: "AU-7741-203", premium: 168, status: "active",
      renew: "Aug 14, 2026", days: 53,
      icon: '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M5 13h14v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="15.5" r=".5"/><circle cx="16.5" cy="15.5" r=".5"/>'
    },
    {
      type: "Home Insurance", num: "HO-5520-118", premium: 142, status: "soon",
      renew: "Jul 02, 2026", days: 10,
      icon: '<path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/><path d="M10 20v-5h4v5"/>'
    },
    {
      type: "Term Life", num: "LF-9034-077", premium: 102, status: "active",
      renew: "Mar 30, 2027", days: 281,
      icon: '<path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/>'
    }
  ];

  var coverage = [
    { name: "Auto liability", used: 4200, limit: 50000 },
    { name: "Home dwelling", used: 18000, limit: 320000 },
    { name: "Deductible used (yr)", used: 750, limit: 1000 }
  ];

  var claims = [
    {
      title: "Windshield replacement", id: "CLM-22841", date: "Filed Jun 09, 2026",
      amount: 480, step: 2,
      steps: ["Submitted", "Reviewing", "Approved", "Paid"]
    },
    {
      title: "Roof hail damage", id: "CLM-21097", date: "Filed Apr 18, 2026",
      amount: 3250, step: 4,
      steps: ["Submitted", "Reviewing", "Approved", "Paid"]
    }
  ];

  /* ---- Render policies ---- */
  var polEl = document.getElementById("policies");
  var badgeMap = {
    active: '<span class="badge badge--active">Active</span>',
    soon: '<span class="badge badge--soon">Renewing soon</span>',
    lapsed: '<span class="badge badge--lapsed">Lapsed</span>'
  };
  policies.forEach(function (p) {
    var li = document.createElement("li");
    li.className = "policy";
    li.innerHTML =
      '<span class="policy__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p.icon + '</svg></span>' +
      '<div class="policy__main">' +
        '<p class="policy__type">' + p.type + '</p>' +
        '<p class="policy__num">' + p.num + '</p>' +
        '<p class="policy__renew">Renews <strong>' + p.renew + '</strong>' + (p.status === "soon" ? " · in " + p.days + " days" : "") + '</p>' +
      '</div>' +
      '<div class="policy__right">' +
        '<p class="policy__premium">' + fmt(p.premium) + '<span>/mo</span></p>' +
        badgeMap[p.status] +
      '</div>';
    polEl.appendChild(li);
  });

  /* ---- Render coverage ---- */
  var covEl = document.getElementById("coverage");
  coverage.forEach(function (c) {
    var pct = Math.round((c.used / c.limit) * 100);
    var high = pct >= 70;
    var li = document.createElement("li");
    li.innerHTML =
      '<div class="cov__top"><span class="cov__name">' + c.name + '</span>' +
      '<span class="cov__nums">' + fmt(c.used) + ' / ' + fmt(c.limit) + '</span></div>' +
      '<div class="cov__track"><div class="cov__fill' + (high ? " cov__fill--high" : "") + '"></div></div>';
    covEl.appendChild(li);
    var fill = li.querySelector(".cov__fill");
    requestAnimationFrame(function () { fill.style.width = Math.min(pct, 100) + "%"; });
  });

  /* ---- Render claims ---- */
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var claimsEl = document.getElementById("claims");
  claims.forEach(function (cl) {
    var done = cl.step >= cl.steps.length;
    var li = document.createElement("li");
    li.className = "claim";
    var stepsHtml = cl.steps.map(function (s, i) {
      var state = (i + 1) < cl.step ? "step--done" : (i + 1) === cl.step ? "step--active" : "";
      if (i + 1 < cl.step) state = "step--done";
      var dot = (i + 1) < cl.step ? check : "";
      return '<div class="step ' + state + '"><span class="step__dot" aria-hidden="true">' + dot + '</span><span class="step__label">' + s + '</span></div>';
    }).join("");
    li.innerHTML =
      '<div class="claim__top">' +
        '<div><p class="claim__title">' + cl.title + '</p><p class="claim__sub">' + cl.id + ' · ' + cl.date + '</p></div>' +
        '<div style="text-align:right"><p class="claim__amount">' + fmt(cl.amount) + '</p>' +
        '<span class="badge ' + (done ? "badge--active" : "badge--soon") + '">' + (done ? "Paid out" : "In progress") + '</span></div>' +
      '</div>' +
      '<div class="steps">' + stepsHtml + '</div>';
    claimsEl.appendChild(li);
  });

  /* ---- Toast ---- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(function () { toast.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.hidden = true; }, 300);
    }, 2600);
  }

  /* ---- Pay flow ---- */
  var payBody = document.getElementById("pay-body");
  var payConfirm = document.getElementById("pay-confirm");
  var payPanel = document.querySelector(".pay");

  document.getElementById("pay-now").addEventListener("click", function () {
    payBody.hidden = true;
    payConfirm.hidden = false;
  });
  document.getElementById("pay-confirm-no").addEventListener("click", function () {
    payConfirm.hidden = true;
    payBody.hidden = false;
  });
  document.getElementById("pay-confirm-yes").addEventListener("click", function () {
    payPanel.classList.add("pay--done");
    document.getElementById("pay-chip").textContent = "Paid";
    document.getElementById("pay-chip").style.color = "var(--green)";
    document.getElementById("pay-chip").style.background = "var(--green-50)";
    document.getElementById("pay-amount").textContent = "$0.00";
    payConfirm.innerHTML = '<p style="color:var(--green);font-weight:600">Payment received — thank you! Next bill: Jul 28, 2026.</p>';
    showToast("Payment of $412.00 confirmed");
  });

  /* ---- Quick actions ---- */
  var actionMsg = {
    claim: "Starting a new claim…",
    pay: "Opening payment center…",
    card: "Downloading insurance ID card (PDF)…"
  };
  document.querySelectorAll(".qa__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showToast(actionMsg[btn.dataset.action] || "Opening…");
    });
  });
})();
