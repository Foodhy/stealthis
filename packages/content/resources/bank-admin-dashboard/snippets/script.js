(function () {
  "use strict";

  /* ---------- Data ---------- */
  var DATA = {
    "24h": {
      kpis: { volume: "€4.82M", users: "38,204", fraud: "17", kyc: null },
      deltas: { volume: ["up", "▲ 6.4%"], users: ["up", "▲ 2.1%"], fraud: ["down", "▼ 12%"] },
      range: "last 24 hours",
      chart: gen(24, 18, 6),
    },
    "7d": {
      kpis: { volume: "€31.6M", users: "41,070", fraud: "104", kyc: null },
      deltas: { volume: ["up", "▲ 9.1%"], users: ["up", "▲ 3.8%"], fraud: ["down", "▼ 4%"] },
      range: "last 7 days",
      chart: gen(14, 26, 9),
    },
    "30d": {
      kpis: { volume: "€138.4M", users: "44,915", fraud: "471", kyc: null },
      deltas: { volume: ["up", "▲ 12.7%"], users: ["up", "▲ 5.2%"], fraud: ["bad", "▲ 8%"] },
      range: "last 30 days",
      chart: gen(15, 30, 11),
    },
  };

  function gen(n, base, spread) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var c = base + Math.round(Math.abs(Math.sin(i * 1.3) * spread) + Math.random() * spread);
      var d = Math.round(c * (0.45 + Math.random() * 0.35));
      out.push({ credit: c, debit: d });
    }
    return out;
  }

  var FRAUD = [
    { id: "FR-9281", sev: "high", title: "Velocity rule triggered", who: "Card •••• 4242", amt: "€2,450.00", note: "6 txns / 4 min · Lisbon" },
    { id: "FR-9277", sev: "high", title: "Impossible travel", who: "acct ••• 8841", amt: "€980.00", note: "Berlin → São Paulo · 14 min" },
    { id: "FR-9270", sev: "med", title: "New device + large transfer", who: "IBAN ••• 3390", amt: "€5,200.00", note: "unrecognized device" },
    { id: "FR-9264", sev: "med", title: "Merchant blacklist match", who: "Card •••• 7781", amt: "€149.99", note: "QuickPay Online" },
    { id: "FR-9258", sev: "low", title: "Address mismatch", who: "acct ••• 1102", amt: "€62.40", note: "AVS partial fail" },
  ];

  var AVCOLORS = ["#3b6ef6", "#0fb5a6", "#7c5cff", "#d9982b", "#d4493e", "#1f9d62"];
  var KYC = [
    { id: "KY-4410", name: "Mária Kovács", type: "Individual", risk: "low", time: "12 min ago" },
    { id: "KY-4408", name: "Helios Trading Ltd", type: "Business", risk: "high", time: "27 min ago" },
    { id: "KY-4405", name: "Daniel Okonkwo", type: "Individual", risk: "med", time: "41 min ago" },
    { id: "KY-4401", name: "Yuki Tanaka", type: "Individual", risk: "low", time: "1 h ago" },
    { id: "KY-4399", name: "Cedar & Vale GmbH", type: "Business", risk: "med", time: "2 h ago" },
    { id: "KY-4396", name: "Omar Haddad", type: "Individual", risk: "high", time: "3 h ago" },
  ];

  var DISPUTES = [
    { id: "DSP-7720", merchant: "Skyline Airlines", amt: "€489.00", status: "pending" },
    { id: "DSP-7714", merchant: "NovaStream Media", amt: "€14.99", status: "review" },
    { id: "DSP-7709", merchant: "Harbor Electronics", amt: "€1,299.00", status: "cleared" },
    { id: "DSP-7702", merchant: "QuickPay Online", amt: "€149.99", status: "failed" },
    { id: "DSP-7698", merchant: "Aurora Hotels", amt: "€320.50", status: "review" },
  ];

  /* ---------- Helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function colorFor(s) {
    var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return AVCOLORS[h % AVCOLORS.length];
  }

  /* ---------- Toast ---------- */
  var TW = $("#toast-wrap");
  function toast(msg, kind) {
    kind = kind || "info";
    var icons = { ok: "✓", bad: "✕", info: "i" };
    var t = el("div", "toast " + kind);
    t.appendChild(el("span", "t-ico", icons[kind] || "i"));
    t.appendChild(el("span", null, msg));
    TW.appendChild(t);
    setTimeout(function () {
      t.classList.add("fade");
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  /* ---------- Clock ---------- */
  var clock = $("#clock");
  function tick() {
    var d = new Date();
    clock.textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " UTC";
  }
  tick(); setInterval(tick, 1000);

  /* ---------- KPIs + chart by timeframe ---------- */
  function renderKpis(tf) {
    var d = DATA[tf];
    setText('[data-kpi="volume"]', d.kpis.volume);
    setText('[data-kpi="users"]', d.kpis.users);
    setText('[data-kpi="fraud"]', d.kpis.fraud);
    ["volume", "users", "fraud"].forEach(function (k) {
      var node = $('[data-delta="' + k + '"]');
      if (node && d.deltas[k]) {
        node.className = "delta " + d.deltas[k][0];
        node.textContent = d.deltas[k][1];
      }
    });
  }
  function setText(sel, v) { var n = $(sel); if (n) n.textContent = v; }

  function renderChart(tf) {
    var d = DATA[tf];
    var wrap = $("#chart");
    wrap.innerHTML = "";
    var max = 0, peakI = 0;
    d.chart.forEach(function (p, i) {
      var tot = p.credit + p.debit;
      if (tot > max) { max = tot; peakI = i; }
    });
    d.chart.forEach(function (p, i) {
      var col = el("div", "bar-col");
      var tot = p.credit + p.debit;
      var cH = Math.max(4, Math.round((p.credit / max) * 150));
      var dH = Math.max(3, Math.round((p.debit / max) * 150));
      var bc = el("div", "bar credit");
      bc.style.height = "0px"; bc.setAttribute("data-label", "C €" + p.credit + "k");
      var bd = el("div", "bar debit");
      bd.style.height = "0px"; bd.setAttribute("data-label", "D €" + p.debit + "k");
      col.appendChild(bc); col.appendChild(bd);
      wrap.appendChild(col);
      requestAnimationFrame(function () {
        setTimeout(function () { bc.style.height = cH + "px"; bd.style.height = dH + "px"; }, i * 22);
      });
    });
    $("#chart-range").textContent = d.range;
    $("#chart-peak").textContent = "Peak €" + (d.chart[peakI].credit + d.chart[peakI].debit) + "k";
  }

  /* ---------- Fraud feed ---------- */
  function renderFraud() {
    var feed = $("#fraud-feed");
    feed.innerHTML = "";
    if (!FRAUD.length) {
      feed.appendChild(el("div", "feed-empty", "✓ No open alerts — queue clear"));
      $("#fraud-count").textContent = "0 open";
      return;
    }
    FRAUD.forEach(function (a) {
      var li = el("li", "alert sev-" + a.sev);
      li.dataset.id = a.id;
      li.innerHTML =
        '<div class="al-body">' +
          '<div class="al-top"><span class="sev-tag">' + a.sev + '</span>' +
          '<span class="al-title">' + a.title + '</span></div>' +
          '<div class="al-meta"><b>' + a.who + '</b> · <span class="al-amt">' + a.amt + '</span> · ' + a.note + '</div>' +
        '</div>';
      var btn = el("button", "al-dismiss", "✕");
      btn.setAttribute("aria-label", "Dismiss alert " + a.id);
      btn.addEventListener("click", function () { dismissAlert(a.id, li); });
      li.appendChild(btn);
      feed.appendChild(li);
    });
    $("#fraud-count").textContent = FRAUD.length + " open";
  }
  function dismissAlert(id, li) {
    li.classList.add("dismissing");
    setTimeout(function () {
      var idx = FRAUD.findIndex(function (x) { return x.id === id; });
      if (idx > -1) FRAUD.splice(idx, 1);
      renderFraud();
    }, 280);
    toast("Alert " + id + " dismissed", "info");
  }

  /* ---------- KYC queue ---------- */
  function renderKyc() {
    var body = $("#kyc-body");
    body.innerHTML = "";
    KYC.forEach(function (k) {
      var tr = document.createElement("tr");
      tr.dataset.id = k.id;
      var c = colorFor(k.name);
      var riskLabel = { low: "Low", med: "Medium", high: "High" }[k.risk];
      tr.innerHTML =
        '<td><div class="applicant"><span class="app-av" style="background:' + c + '">' + initials(k.name) + '</span>' +
          '<span><span class="app-name">' + k.name + '</span><br><span class="app-id">' + k.id + '</span></span></div></td>' +
        '<td>' + k.type + '</td>' +
        '<td><span class="risk ' + k.risk + '">' + riskLabel + '</span></td>' +
        '<td style="color:var(--muted)">' + k.time + '</td>';
      var act = document.createElement("td");
      act.className = "ta-r";
      var box = el("div", "kyc-actions");
      var ap = el("button", "btn-s btn-approve", "Approve");
      var rj = el("button", "btn-s btn-reject", "Reject");
      ap.addEventListener("click", function () { resolveKyc(k.id, tr, true); });
      rj.addEventListener("click", function () { resolveKyc(k.id, tr, false); });
      box.appendChild(ap); box.appendChild(rj);
      act.appendChild(box);
      tr.appendChild(act);
      body.appendChild(tr);
    });
    updateKycPill();
  }
  function resolveKyc(id, tr, approved) {
    tr.classList.add("removing");
    setTimeout(function () {
      var idx = KYC.findIndex(function (x) { return x.id === id; });
      if (idx > -1) KYC.splice(idx, 1);
      renderKyc();
      if (!KYC.length) {
        $("#kyc-body").innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">✓ Queue cleared — no applicants pending</td></tr>';
      }
    }, 250);
    toast(id + (approved ? " approved — account activated" : " rejected — applicant notified"), approved ? "ok" : "bad");
  }
  function updateKycPill() {
    $("#kyc-pill").textContent = KYC.length + " pending";
    setText('[data-kpi="kyc"]', String(KYC.length));
  }

  /* ---------- Disputes ---------- */
  function renderDisputes() {
    var body = $("#dispute-body");
    body.innerHTML = "";
    var label = { pending: "Pending", review: "In review", cleared: "Cleared", failed: "Failed" };
    DISPUTES.forEach(function (d) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td style="font-weight:600">' + d.id + '</td>' +
        '<td>' + d.merchant + '</td>' +
        '<td class="ta-r"><span class="amt-debit">' + d.amt + '</span></td>' +
        '<td><span class="pill ' + d.status + '">' + label[d.status] + '</span></td>';
      body.appendChild(tr);
    });
  }

  /* ---------- Timeframe toggle ---------- */
  var tfBtns = document.querySelectorAll(".tf-btn");
  tfBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      tfBtns.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      var tf = b.dataset.tf;
      renderKpis(tf);
      renderChart(tf);
      toast("Timeframe → " + b.textContent, "info");
    });
  });

  /* ---------- Nav (cosmetic active state) ---------- */
  document.querySelectorAll(".nav-item").forEach(function (n) {
    n.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(function (x) {
        x.classList.remove("is-active"); x.removeAttribute("aria-current");
      });
      n.classList.add("is-active"); n.setAttribute("aria-current", "page");
    });
  });

  /* ---------- Boot ---------- */
  renderKpis("24h");
  renderChart("24h");
  renderFraud();
  renderKyc();
  renderDisputes();
})();
