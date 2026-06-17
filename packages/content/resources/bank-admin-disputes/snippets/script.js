(function () {
  "use strict";

  var STATUS = {
    new: { label: "New", cls: "new" },
    review: { label: "Under review", cls: "review" },
    escalated: { label: "Escalated", cls: "escalated" },
    resolved: { label: "Resolved", cls: "resolved" },
  };

  var disputes = [
    {
      id: "DSP-4821", card: "4242", network: "Visa",
      customer: "Marisol Tan", email: "m.tan@inboxly.io", initials: "MT",
      merchant: "Nimbus Cloud Hosting", amount: 489.00,
      reasonCode: "10.4", reason: "Fraud — card not present",
      status: "new", ageH: 4, txnDate: "Jun 12, 2026", filed: "Jun 16, 09:12",
      evidence: [
        { name: "Cardholder statement", note: "Signed declaration", icon: "doc", ok: true },
        { name: "IP / device log", note: "Mismatch flagged", icon: "shield", ok: false },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 16, 09:12" },
        { t: "Auto-assigned to fraud queue", d: "Jun 16, 09:12" },
      ],
    },
    {
      id: "DSP-4818", card: "8830", network: "Mastercard",
      customer: "Devon Okafor", email: "devon.o@maily.net", initials: "DO",
      merchant: "Atlas Fitness Co.", amount: 79.99,
      reasonCode: "13.2", reason: "Cancelled recurring",
      status: "review", ageH: 31, txnDate: "Jun 09, 2026", filed: "Jun 15, 02:40",
      evidence: [
        { name: "Cancellation email", note: "Sent May 28", icon: "mail", ok: true },
        { name: "Merchant rebuttal", note: "Awaiting upload", icon: "doc", ok: false },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 15, 02:40" },
        { t: "Evidence requested from merchant", d: "Jun 15, 08:00" },
        { t: "Moved to under review", d: "Jun 15, 10:22" },
      ],
    },
    {
      id: "DSP-4805", card: "1109", network: "Visa",
      customer: "Priya Raman", email: "priya@swiftmail.co", initials: "PR",
      merchant: "Lumen Electronics", amount: 1240.00,
      reasonCode: "13.3", reason: "Not as described",
      status: "escalated", ageH: 76, txnDate: "Jun 04, 2026", filed: "Jun 13, 14:05",
      evidence: [
        { name: "Product photos", note: "3 images", icon: "img", ok: true },
        { name: "Chat transcript", note: "Verified", icon: "doc", ok: true },
        { name: "Shipping proof", note: "Delivered", icon: "shield", ok: true },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 13, 14:05" },
        { t: "Merchant rebuttal received", d: "Jun 14, 11:30" },
        { t: "Escalated to arbitration", d: "Jun 15, 16:48" },
      ],
    },
    {
      id: "DSP-4799", card: "4242", network: "Visa",
      customer: "Sefa Kowalski", email: "sefa.k@postbox.eu", initials: "SK",
      merchant: "Orbit Rideshare", amount: 28.40,
      reasonCode: "12.5", reason: "Incorrect amount",
      status: "new", ageH: 9, txnDate: "Jun 14, 2026", filed: "Jun 16, 04:31",
      evidence: [
        { name: "Trip receipt", note: "Auto-pulled", icon: "doc", ok: true },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 16, 04:31" },
        { t: "Auto-assigned to disputes queue", d: "Jun 16, 04:31" },
      ],
    },
    {
      id: "DSP-4790", card: "7715", network: "Amex",
      customer: "Joana Beck", email: "j.beck@mailhub.io", initials: "JB",
      merchant: "Harbor Books Ltd.", amount: 54.20,
      reasonCode: "11.3", reason: "Duplicate charge",
      status: "resolved", ageH: 120, txnDate: "Jun 02, 2026", filed: "Jun 11, 19:50",
      resolution: "Accepted — provisional credit issued to cardholder.",
      evidence: [
        { name: "Two matching auths", note: "Confirmed", icon: "doc", ok: true },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 11, 19:50" },
        { t: "Duplicate confirmed", d: "Jun 12, 09:14" },
        { t: "Accepted — credit issued", d: "Jun 12, 09:30" },
      ],
    },
    {
      id: "DSP-4787", card: "8830", network: "Mastercard",
      customer: "Tariq Mensah", email: "tariq.m@zmail.org", initials: "TM",
      merchant: "Peak Travel Group", amount: 932.75,
      reasonCode: "13.1", reason: "Services not provided",
      status: "review", ageH: 52, txnDate: "Jun 06, 2026", filed: "Jun 14, 07:15",
      evidence: [
        { name: "Booking confirmation", note: "Verified", icon: "doc", ok: true },
        { name: "No-show report", note: "Pending review", icon: "shield", ok: false },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 14, 07:15" },
        { t: "Moved to under review", d: "Jun 14, 12:00" },
      ],
    },
    {
      id: "DSP-4771", card: "1109", network: "Visa",
      customer: "Mei Lin", email: "mei.lin@boxmail.cc", initials: "ML",
      merchant: "Glow Skincare", amount: 64.00,
      reasonCode: "10.4", reason: "Fraud — card not present",
      status: "resolved", ageH: 168, txnDate: "May 30, 2026", filed: "Jun 09, 13:22",
      resolution: "Rejected — transaction verified with 3-D Secure.",
      evidence: [
        { name: "3-D Secure auth", note: "Passed", icon: "shield", ok: true },
      ],
      timeline: [
        { t: "Dispute filed by cardholder", d: "Jun 09, 13:22" },
        { t: "3-D Secure proof attached", d: "Jun 10, 08:00" },
        { t: "Rejected — liability shifted", d: "Jun 10, 15:40" },
      ],
    },
  ];

  var fmt = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var ageLabel = function (h) {
    if (h < 24) return h + "h";
    return Math.floor(h / 24) + "d " + (h % 24) + "h";
  };

  var ICONS = {
    doc: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    img: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  };
  var CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  var rowsEl = document.getElementById("rows");
  var emptyEl = document.getElementById("empty");
  var statsEl = document.getElementById("stats");
  var countEl = document.getElementById("result-count");
  var searchEl = document.getElementById("search");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var scrim = document.getElementById("scrim");
  var drawer = document.getElementById("drawer");
  var drawerInner = document.getElementById("drawer-inner");
  var toastWrap = document.getElementById("toast-wrap");

  var state = { status: "all", q: "", openId: null, lastFocus: null };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.innerHTML = '<span class="dot"></span>' + esc(msg);
    toastWrap.appendChild(el);
    setTimeout(function () { el.remove(); }, 2900);
  }

  function renderStats() {
    var open = disputes.filter(function (d) { return d.status !== "resolved"; });
    var atRisk = open.filter(function (d) { return d.ageH >= 48; }).length;
    var exposure = open.reduce(function (s, d) { return s + d.amount; }, 0);
    var escalated = disputes.filter(function (d) { return d.status === "escalated"; }).length;
    statsEl.innerHTML =
      stat("Open cases", open.length, "") +
      stat("At-risk &gt;48h", atRisk, "alert") +
      stat("Escalated", escalated, "") +
      moneyStat("Exposure", fmt(exposure));
  }
  function stat(k, v, cls) {
    return '<div class="stat ' + cls + '"><div class="k">' + k + '</div><div class="v">' + v + "</div></div>";
  }
  function moneyStat(k, v) {
    return '<div class="stat money"><div class="k">' + k + '</div><div class="v num">' + v + "</div></div>";
  }

  function visible() {
    var q = state.q.trim().toLowerCase();
    return disputes.filter(function (d) {
      if (state.status !== "all" && d.status !== state.status) return false;
      if (!q) return true;
      return (
        d.id.toLowerCase().indexOf(q) !== -1 ||
        d.customer.toLowerCase().indexOf(q) !== -1 ||
        d.merchant.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function renderRows() {
    var list = visible();
    countEl.textContent = list.length + (list.length === 1 ? " dispute" : " disputes");
    if (!list.length) {
      rowsEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    rowsEl.innerHTML = list.map(function (d) {
      var st = STATUS[d.status];
      var old = d.status !== "resolved" && d.ageH >= 48;
      return (
        '<tr tabindex="0" data-id="' + d.id + '">' +
          '<td><span class="case-id">' + d.id + '</span>' +
            '<span class="case-card">•••• ' + d.card + " · " + d.network + "</span></td>" +
          '<td><div class="cust"><span class="av">' + d.initials + '</span>' +
            '<span class="nm">' + esc(d.customer) + "<small>" + esc(d.email) + "</small></span></div></td>" +
          '<td><div class="reason">' + esc(d.reason) + '<span class="code">Code ' + d.reasonCode + " · " + esc(d.merchant) + "</span></div></td>" +
          '<td class="num"><span class="amt">' + fmt(d.amount) + "</span></td>" +
          '<td><span class="age' + (old ? " old" : "") + '">' + ageLabel(d.ageH) + "</span></td>" +
          '<td><span class="pill ' + st.cls + '">' + st.label + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  function drawerHTML(d) {
    var st = STATUS[d.status];
    var ev = d.evidence.map(function (e) {
      return (
        '<div class="ev"><span class="ic">' + ICONS[e.icon] + "</span>" +
        '<span class="meta"><b>' + esc(e.name) + "</b><small>" + esc(e.note) + "</small></span>" +
        (e.ok ? '<span class="ok">' + CHECK + " ok</span>" : '<span style="color:var(--muted);font-size:11.5px;font-weight:600">pending</span>') +
        "</div>"
      );
    }).join("");
    var tl = d.timeline.map(function (t) {
      return "<li><b>" + esc(t.t) + "</b><time>" + esc(t.d) + "</time></li>";
    }).join("");

    var foot;
    if (d.status === "resolved") {
      foot =
        '<div class="dr-resolved">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>' +
        "<span>" + esc(d.resolution || "Case closed.") + "</span></div>";
    } else {
      foot =
        '<div class="dr-foot">' +
        '<button class="btn btn-accept" data-act="accept">' + CHECK + " Accept</button>" +
        '<button class="btn btn-reject" data-act="reject">Reject</button>' +
        '<button class="btn btn-escalate full" data-act="escalate"' + (d.status === "escalated" ? " disabled" : "") + ">" +
          (d.status === "escalated" ? "Already escalated" : "Escalate to arbitration") + "</button>" +
        "</div>";
    }

    return (
      '<div class="dr-head"><div class="row1"><div>' +
        '<span class="dr-case">' + d.id + " · " + esc(d.network) + " •••• " + d.card + "</span>" +
        '<div class="dr-amount num">' + fmt(d.amount) + "</div>" +
        '<div class="dr-merchant">' + esc(d.merchant) + "</div></div>" +
        '<button class="dr-close" data-act="close" aria-label="Close detail">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '</div><div style="margin-top:10px"><span class="pill ' + st.cls + '">' + st.label + "</span></div></div>" +

      '<div class="dr-body">' +
        '<div class="dr-section"><h3>Case details</h3><dl class="kv">' +
          "<dt>Customer</dt><dd>" + esc(d.customer) + "</dd>" +
          "<dt>Reason</dt><dd>" + esc(d.reason) + "</dd>" +
          "<dt>Reason code</dt><dd>" + d.reasonCode + "</dd>" +
          '<dt>Card</dt><dd><span class="card-mask">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg>' +
            "•••• " + d.card + "</span></dd>" +
          "<dt>Transaction</dt><dd>" + esc(d.txnDate) + "</dd>" +
          "<dt>Filed</dt><dd>" + esc(d.filed) + "</dd>" +
          "<dt>Age</dt><dd>" + ageLabel(d.ageH) + "</dd>" +
        "</dl></div>" +

        '<div class="dr-section"><h3>Evidence</h3><div class="evidence">' + ev + "</div></div>" +
        '<div class="dr-section"><h3>Activity</h3><ul class="timeline">' + tl + "</ul></div>" +
      "</div>" + foot
    );
  }

  function openDrawer(id) {
    var d = disputes.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    state.openId = id;
    state.lastFocus = document.activeElement;
    drawerInner.innerHTML = drawerHTML(d);
    scrim.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var close = drawer.querySelector(".dr-close");
    if (close) close.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.body.style.overflow = "";
    state.openId = null;
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function transition(act) {
    var d = disputes.filter(function (x) { return x.id === state.openId; })[0];
    if (!d) return;
    var stamp = "Jun 16, " + ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2);
    if (act === "accept") {
      d.status = "resolved";
      d.resolution = "Accepted — provisional credit of " + fmt(d.amount) + " issued to cardholder.";
      d.timeline.push({ t: "Accepted by " + opName() + " — credit issued", d: stamp });
      toast(d.id + " accepted · credit issued", "");
    } else if (act === "reject") {
      d.status = "resolved";
      d.resolution = "Rejected — charge upheld and merchant evidence accepted.";
      d.timeline.push({ t: "Rejected by " + opName(), d: stamp });
      toast(d.id + " rejected · charge upheld", "danger");
    } else if (act === "escalate") {
      if (d.status === "escalated") return;
      d.status = "escalated";
      d.timeline.push({ t: "Escalated to arbitration by " + opName(), d: stamp });
      toast(d.id + " escalated to arbitration", "warn");
    }
    drawerInner.innerHTML = drawerHTML(d);
    var close = drawer.querySelector(".dr-close");
    if (close) close.focus();
    renderStats();
    renderRows();
  }
  function opName() { return "R. Velez"; }

  // ---- events ----
  rowsEl.addEventListener("click", function (e) {
    var tr = e.target.closest("tr[data-id]");
    if (tr) openDrawer(tr.getAttribute("data-id"));
  });
  rowsEl.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var tr = e.target.closest("tr[data-id]");
    if (tr) { e.preventDefault(); openDrawer(tr.getAttribute("data-id")); }
  });

  drawer.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "close") closeDrawer();
    else transition(act);
  });

  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.openId) closeDrawer();
  });

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      c.classList.add("is-active");
      c.setAttribute("aria-selected", "true");
      state.status = c.getAttribute("data-status");
      renderRows();
    });
  });

  var debounce;
  searchEl.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.q = searchEl.value;
      renderRows();
    }, 120);
  });

  renderStats();
  renderRows();
})();
