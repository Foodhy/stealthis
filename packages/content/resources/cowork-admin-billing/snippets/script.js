(function () {
  "use strict";

  // --- Plan catalog ----------------------------------------------------------
  var PLANS = {
    "Hot Desk": 180,
    "Resident": 340,
    "Studio": 620,
    "Team": 1450,
  };

  var AVATAR_COLORS = ["#e8902b", "#5f7a52", "#4a463e", "#cc7918", "#2f9e6f", "#7b766c", "#d4503e"];

  // --- Seed data -------------------------------------------------------------
  var members = [
    { id: "m1", name: "Nadia Brandt", email: "nadia@orbitstudio.co", plan: "Studio", status: "active", next: "Jul 1" },
    { id: "m2", name: "Theo Marchetti", email: "theo.m@driftlabs.io", plan: "Resident", status: "active", next: "Jul 1" },
    { id: "m3", name: "Priya Anand", email: "priya@anandtype.com", plan: "Team", status: "active", next: "Jul 1" },
    { id: "m4", name: "Oskar Lind", email: "oskar@lind.studio", plan: "Hot Desk", status: "past_due", next: "Jun 19", dunning: true },
    { id: "m5", name: "Mei-Ling Soh", email: "mei@soh.design", plan: "Resident", status: "active", next: "Jul 1" },
    { id: "m6", name: "Carla Bautista", email: "carla@bautista.work", plan: "Studio", status: "paused", next: "—" },
    { id: "m7", name: "Ivan Petrov", email: "ivan@petrov.dev", plan: "Team", status: "past_due", next: "Jun 17", dunning: true },
    { id: "m8", name: "Hana Okafor", email: "hana@okaforco.com", plan: "Hot Desk", status: "active", next: "Jul 1" },
    { id: "m9", name: "Bram de Vries", email: "bram@devries.nl", plan: "Resident", status: "canceled", next: "—" },
    { id: "m10", name: "Sofia Reyes", email: "sofia@reyesfoto.com", plan: "Hot Desk", status: "active", next: "Jul 1" },
    { id: "m11", name: "Jonas Keller", email: "jonas@kellerbuild.de", plan: "Studio", status: "active", next: "Jul 1" },
    { id: "m12", name: "Amara Diallo", email: "amara@diallo.studio", plan: "Resident", status: "active", next: "Jul 1" },
  ];

  var invoices = [
    { id: "INV-2061", member: "m3", forName: "Priya Anand", plan: "Team", amount: 1450, status: "paid", date: "Jun 1, 2026", paid: "Jun 1", method: "Visa ·· 4218" },
    { id: "INV-2060", member: "m1", forName: "Nadia Brandt", plan: "Studio", amount: 620, status: "paid", date: "Jun 1, 2026", paid: "Jun 1", method: "Amex ·· 1007" },
    { id: "INV-2059", member: "m7", forName: "Ivan Petrov", plan: "Team", amount: 1450, status: "overdue", date: "Jun 1, 2026", paid: null, method: "MC ·· 9930" },
    { id: "INV-2058", member: "m4", forName: "Oskar Lind", plan: "Hot Desk", amount: 180, status: "overdue", date: "Jun 1, 2026", paid: null, method: "Visa ·· 5521" },
    { id: "INV-2057", member: "m2", forName: "Theo Marchetti", plan: "Resident", amount: 340, status: "paid", date: "Jun 1, 2026", paid: "Jun 2", method: "Visa ·· 7744" },
    { id: "INV-2056", member: "m11", forName: "Jonas Keller", plan: "Studio", amount: 620, status: "open", date: "Jun 1, 2026", paid: null, method: "SEPA ·· DE21" },
    { id: "INV-2055", member: "m8", forName: "Hana Okafor", plan: "Hot Desk", amount: 180, status: "paid", date: "Jun 1, 2026", paid: "Jun 1", method: "Visa ·· 3360" },
    { id: "INV-2054", member: "m5", forName: "Mei-Ling Soh", plan: "Resident", amount: 340, status: "paid", date: "Jun 1, 2026", paid: "Jun 1", method: "MC ·· 8812" },
  ];

  // --- Helpers ---------------------------------------------------------------
  var $ = function (sel) { return document.querySelector(sel); };
  var fmt = function (n) { return "$" + n.toLocaleString("en-US"); };
  var statusLabel = { active: "Active", past_due: "Past due", paused: "Paused", canceled: "Canceled" };

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
  }
  function avatarColor(id) {
    var sum = 0;
    for (var i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  }

  var toastWrap = $("#toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .25s ease, transform .25s ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 250);
    }, 2400);
  }

  // --- Summary rollup --------------------------------------------------------
  function billableMembers() {
    // MRR counts active + past_due (still owe / still on a plan); paused & canceled excluded.
    return members.filter(function (m) { return m.status === "active" || m.status === "past_due"; });
  }

  function renderSummary() {
    var mrr = billableMembers().reduce(function (s, m) { return s + PLANS[m.plan]; }, 0);
    var active = members.filter(function (m) { return m.status === "active"; }).length;
    var overdueInv = invoices.filter(function (i) { return i.status === "overdue"; });
    var outstanding = overdueInv.concat(invoices.filter(function (i) { return i.status === "open"; }))
      .reduce(function (s, i) { return s + i.amount; }, 0);
    var collected = invoices.filter(function (i) { return i.status === "paid"; })
      .reduce(function (s, i) { return s + i.amount; }, 0);

    animateValue($("#mrrValue"), mrr, true);
    animateValue($("#activeValue"), active, false);
    $("#totalMembers").textContent = members.length;
    $("#outstandingValue").textContent = fmt(outstanding);
    $("#overdueCount").textContent = overdueInv.length + " overdue invoice" + (overdueInv.length === 1 ? "" : "s");
    $("#collectedValue").textContent = fmt(collected);
  }

  function animateValue(el, target, money) {
    var start = 0;
    var dur = 600;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(start + (target - start) * eased);
      el.textContent = money ? fmt(v) : v;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // --- Members table ---------------------------------------------------------
  var body = $("#membersBody");

  function filteredMembers() {
    var q = $("#memberSearch").value.trim().toLowerCase();
    var plan = $("#planFilter").value;
    var status = $("#statusFilter").value;
    return members.filter(function (m) {
      if (plan !== "all" && m.plan !== plan) return false;
      if (status !== "all" && m.status !== status) return false;
      if (q && m.name.toLowerCase().indexOf(q) < 0 && m.email.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function renderMembers() {
    var rows = filteredMembers();
    body.innerHTML = "";
    rows.forEach(function (m) {
      var tr = document.createElement("tr");
      tr.dataset.id = m.id;
      var billable = m.status === "active" || m.status === "past_due";
      tr.innerHTML =
        '<td><div class="member-cell">' +
          '<span class="avatar" style="background:' + avatarColor(m.id) + '">' + initials(m.name) + '</span>' +
          '<span><span class="member-name">' + m.name + '</span><br>' +
          '<span class="member-email">' + m.email + '</span></span>' +
        '</div></td>' +
        '<td><span class="plan-tag">' + m.plan + '</span></td>' +
        '<td><span class="status ' + m.status + '">' + statusLabel[m.status] + '</span>' +
          (m.dunning ? '<span class="dunning-flag" title="Dunning in progress">Dunning</span>' : '') + '</td>' +
        '<td class="num"><span class="mrr">' + (billable ? fmt(PLANS[m.plan]) : "—") + '</span></td>' +
        '<td><span class="next-inv">' + m.next + '</span></td>' +
        '<td><button class="row-action" data-act="plan" data-id="' + m.id + '">Change plan</button></td>';
      body.appendChild(tr);
    });

    $("#emptyRow").hidden = rows.length !== 0;
    $("#memberCount").textContent = rows.length + " member" + (rows.length === 1 ? "" : "s");
    var fmrr = rows.filter(function (m) { return m.status === "active" || m.status === "past_due"; })
      .reduce(function (s, m) { return s + PLANS[m.plan]; }, 0);
    $("#filteredMrr").textContent = fmt(fmrr);
  }

  $("#memberSearch").addEventListener("input", renderMembers);
  $("#planFilter").addEventListener("change", renderMembers);
  $("#statusFilter").addEventListener("change", renderMembers);

  body.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act='plan']");
    if (btn) openPlanModal(btn.dataset.id);
  });

  // --- Invoices --------------------------------------------------------------
  var invStatusLabel = { paid: "Paid", open: "Open", overdue: "Overdue" };
  var list = $("#invoiceList");

  function renderInvoices() {
    list.innerHTML = "";
    invoices.forEach(function (inv) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.className = "invoice-row";
      btn.dataset.id = inv.id;
      btn.innerHTML =
        '<span class="invoice-id">' + inv.id + '</span>' +
        '<span class="invoice-for">' + inv.forName + ' · ' + inv.plan + '</span>' +
        '<span class="invoice-amount">' + fmt(inv.amount) + '</span>' +
        '<span class="invoice-status ' + inv.status + '">' + invStatusLabel[inv.status] + '</span>';
      btn.addEventListener("click", function () { openDrawer(inv.id); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  // --- Invoice drawer --------------------------------------------------------
  var drawer = $("#drawer");
  var scrim = $("#drawerScrim");

  function openDrawer(invId) {
    var inv = invoices.find(function (i) { return i.id === invId; });
    if (!inv) return;
    $("#drawerTitle").textContent = inv.id;

    var badgeColors = {
      paid: "color:var(--ok);background:rgba(47,158,111,.12)",
      open: "color:var(--amber-d);background:var(--amber-50)",
      overdue: "color:var(--danger);background:rgba(212,80,62,.12)",
    };
    var base = inv.amount;
    var tax = Math.round(base * 0.08);
    var total = base + tax;

    var html =
      '<span class="dr-badge" style="' + badgeColors[inv.status] + '">' + invStatusLabel[inv.status] + '</span>' +
      '<div class="dr-amount">' + fmt(total) + '</div>' +
      '<ul class="dr-meta">' +
        '<li><span>Billed to</span><span>' + inv.forName + '</span></li>' +
        '<li><span>Issued</span><span>' + inv.date + '</span></li>' +
        '<li><span>' + (inv.paid ? "Paid on" : "Due") + '</span><span>' + (inv.paid ? inv.paid + ", 2026" : "Jun 19, 2026") + '</span></li>' +
        '<li><span>Payment method</span><span>' + inv.method + '</span></li>' +
      '</ul>' +
      '<table class="dr-lines"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>' +
        '<tr><td>' + inv.plan + ' membership — June 2026</td><td>' + fmt(base) + '</td></tr>' +
        '<tr><td>Tax (8%)</td><td>' + fmt(tax) + '</td></tr>' +
      '</tbody></table>' +
      '<div class="dr-total"><span>Total</span><span>' + fmt(total) + '</span></div>';

    var actions = '<div class="dr-actions">';
    if (inv.status !== "paid") {
      actions += '<button class="btn btn-amber" data-act="markpaid" data-id="' + inv.id + '">Mark as paid</button>';
      actions += '<button class="btn btn-ghost" data-act="remind" data-id="' + inv.id + '">Send reminder</button>';
    } else {
      actions += '<button class="btn btn-ghost" data-act="receipt" data-id="' + inv.id + '">Download receipt</button>';
    }
    actions += '</div>';

    $("#drawerBody").innerHTML = html + actions;
    scrim.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(function () { scrim.hidden = true; }, 260);
  }

  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);

  $("#drawerBody").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.dataset.act;
    var id = btn.dataset.id;
    if (act === "markpaid") {
      var inv = invoices.find(function (i) { return i.id === id; });
      if (inv) {
        inv.status = "paid";
        inv.paid = "Jun 18";
        // clear dunning on the member if no more overdue invoices
        var mem = members.find(function (m) { return m.id === inv.member; });
        if (mem) {
          var stillOverdue = invoices.some(function (i) { return i.member === mem.id && i.status !== "paid"; });
          if (!stillOverdue && mem.status === "past_due") { mem.status = "active"; mem.dunning = false; mem.next = "Jul 1"; }
        }
        renderInvoices();
        renderMembers();
        renderSummary();
        toast(id + " marked paid", "ok");
        closeDrawer();
      }
    } else if (act === "remind") {
      toast("Payment reminder emailed", "warn");
    } else if (act === "receipt") {
      toast("Receipt downloaded");
    }
  });

  // --- Change plan modal -----------------------------------------------------
  var modalScrim = $("#modalScrim");
  var activeMemberId = null;

  function openPlanModal(id) {
    var m = members.find(function (x) { return x.id === id; });
    if (!m) return;
    activeMemberId = id;
    $("#modalMember").textContent = m.name + " · currently " + m.plan;
    $("#modalPlan").value = m.plan;
    modalScrim.hidden = false;
    $("#modalPlan").focus();
  }

  function closeModal() {
    modalScrim.hidden = true;
    activeMemberId = null;
  }

  $("#modalCancel").addEventListener("click", closeModal);
  modalScrim.addEventListener("click", function (e) { if (e.target === modalScrim) closeModal(); });

  $("#modalSave").addEventListener("click", function () {
    var m = members.find(function (x) { return x.id === activeMemberId; });
    if (!m) return closeModal();
    var newPlan = $("#modalPlan").value;
    if (newPlan === m.plan) {
      toast("No change — already on " + newPlan);
      return closeModal();
    }
    var diff = PLANS[newPlan] - PLANS[m.plan];
    m.plan = newPlan;
    if (m.status === "paused" || m.status === "canceled") { m.status = "active"; m.next = "Jul 1"; }
    renderMembers();
    renderSummary();
    var verb = diff > 0 ? "Upgraded" : "Downgraded";
    toast(verb + " to " + newPlan + " (" + (diff > 0 ? "+" : "") + fmt(diff) + "/mo)", diff > 0 ? "ok" : "warn");
    closeModal();
  });

  // --- Dunning sweep ---------------------------------------------------------
  $("#runDunning").addEventListener("click", function () {
    var flagged = members.filter(function (m) { return m.status === "past_due"; }).length;
    flagged += 0;
    var overdue = invoices.filter(function (i) { return i.status === "overdue"; }).length;
    members.forEach(function (m) { if (m.status === "past_due") m.dunning = true; });
    renderMembers();
    toast("Dunning sweep sent to " + overdue + " overdue account" + (overdue === 1 ? "" : "s"), "warn");
  });

  // --- New invoice (demo) ----------------------------------------------------
  $("#newInvoiceBtn").addEventListener("click", function () {
    toast("Draft invoice created — open it from the list");
  });

  // --- Keyboard --------------------------------------------------------------
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (drawer.classList.contains("open")) closeDrawer();
      if (!modalScrim.hidden) closeModal();
    }
  });

  // --- Init ------------------------------------------------------------------
  renderMembers();
  renderInvoices();
  renderSummary();
})();
