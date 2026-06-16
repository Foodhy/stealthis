(function () {
  "use strict";

  // ---------- SVG logo marks ----------
  function svg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' + paths + "</svg>";
  }
  var MARKS = {
    bolt: svg('<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor"/>'),
    chat: svg('<path d="M4 5h16v11H9l-5 4V5z" fill="currentColor"/>'),
    grid: svg('<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="currentColor"/>'),
    chart: svg('<path d="M4 20V4M4 20h16M8 16v-5M13 16V8M18 16v-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
    card: svg('<rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor"/><path d="M3 10h18" stroke="#fff" stroke-width="2"/>'),
    cloud: svg('<path d="M7 18a4 4 0 0 1 .5-7.97A5 5 0 0 1 17 10a3.5 3.5 0 0 1 0 8H7z" fill="currentColor"/>'),
    code: svg('<path d="M9 8 5 12l4 4M15 8l4 4-4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    ticket: svg('<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" fill="currentColor"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/><path d="M4 7l8 6 8-6" stroke="#fff" stroke-width="1.8"/>'),
    spark: svg('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor"/>'),
    map: svg('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" fill="currentColor"/>'),
    db: svg('<ellipse cx="12" cy="6" rx="7" ry="3" fill="currentColor"/><path d="M5 6v12c0 1.6 3.1 3 7 3s7-1.4 7-3V6" stroke="currentColor" stroke-width="2" fill="none"/>')
  };

  // ---------- Data ----------
  var INTEGRATIONS = [
    { id: "salescloud", name: "SaleCloud CRM", cat: "CRM", color: "#2563eb", mark: "cloud", installs: "8,420", rating: "4.8",
      blurb: "Sync contacts, deals and pipeline stages two ways in real time.",
      features: ["Two-way contact & deal sync", "Map custom fields to records", "Trigger workflows on stage change"],
      perms: [["Read contacts & accounts", "View names, emails and company records"], ["Write deal updates", "Create and update opportunities"]] },
    { id: "pipelead", name: "PipeLead", cat: "CRM", color: "#0ea5e9", mark: "grid", installs: "3,190", rating: "4.6",
      blurb: "Push qualified leads straight into your sales pipeline automatically.",
      features: ["Auto-route new leads by owner", "Dedupe against existing records", "Activity timeline sync"],
      perms: [["Read pipeline data", "View stages and deal values"], ["Create leads", "Add new lead records on your behalf"]] },
    { id: "slacknest", name: "SlackNest", cat: "Comms", color: "#7c3aed", mark: "chat", installs: "12,840", rating: "4.9",
      blurb: "Send alerts, daily digests and approval requests to any channel.",
      features: ["Route alerts to channels", "Interactive approve / reject buttons", "Daily summary digests"],
      perms: [["Post messages", "Send messages to selected channels"], ["Read channel list", "List channels for routing rules"]] },
    { id: "ringline", name: "RingLine", cat: "Comms", color: "#db2777", mark: "ticket", installs: "2,070", rating: "4.4",
      blurb: "Log calls and SMS conversations against contacts automatically.",
      features: ["Auto-log inbound & outbound calls", "Attach recordings to records", "SMS reply notifications"],
      perms: [["Read call logs", "Access call metadata and recordings"], ["Match contacts", "Link calls to existing contacts"]] },
    { id: "postmark", name: "MailBeam", cat: "Comms", color: "#ea580c", mark: "mail", installs: "6,510", rating: "4.7",
      blurb: "Reliable transactional email delivery with open and click tracking.",
      features: ["Transactional email sending", "Open & click event webhooks", "Bounce and complaint handling"],
      perms: [["Send email", "Deliver transactional emails on your behalf"], ["Read delivery events", "Access bounce and open data"]] },
    { id: "gitforge", name: "GitForge", cat: "Dev", color: "#0f172a", mark: "code", installs: "9,930", rating: "4.9",
      blurb: "Link commits and pull requests to issues and deployment status.",
      features: ["Link PRs to work items", "Deploy status in your dashboard", "Comment sync on commits"],
      perms: [["Read repositories", "View repos, commits and PR metadata"], ["Write status checks", "Post commit and deploy statuses"]] },
    { id: "shiprunner", name: "ShipRunner CI", cat: "Dev", color: "#059669", mark: "bolt", installs: "4,260", rating: "4.5",
      blurb: "Stream build and deploy events into your activity feed instantly.",
      features: ["Live build & deploy events", "Failure alerts to comms apps", "Rollback notifications"],
      perms: [["Read pipelines", "View build and deploy history"], ["Receive webhooks", "Get notified on pipeline events"]] },
    { id: "vaultkeys", name: "VaultKeys", cat: "Dev", color: "#4f46e5", mark: "db", installs: "1,540", rating: "4.6",
      blurb: "Securely store and rotate the secrets your integrations rely on.",
      features: ["Encrypted secret storage", "Automatic key rotation", "Per-environment scoping"],
      perms: [["Manage secrets", "Read and rotate stored credentials"]] },
    { id: "metricflow", name: "MetricFlow", cat: "Analytics", color: "#d97706", mark: "chart", installs: "7,380", rating: "4.8",
      blurb: "Pipe product events into dashboards and funnels with zero code.",
      features: ["Event & funnel tracking", "Cohort and retention charts", "Scheduled metric exports"],
      perms: [["Read event stream", "Access product usage events"], ["Read user properties", "View aggregated profile traits"]] },
    { id: "insightlens", name: "InsightLens", cat: "Analytics", color: "#0891b2", mark: "spark", installs: "3,640", rating: "4.5",
      blurb: "Turn raw usage data into shareable insight reports automatically.",
      features: ["Auto-generated insight reports", "Anomaly detection alerts", "Embed charts anywhere"],
      perms: [["Read analytics data", "Query aggregated metrics"]] },
    { id: "geomap", name: "GeoMap", cat: "Analytics", color: "#16a34a", mark: "map", installs: "1,210", rating: "4.3",
      blurb: "Visualize accounts and revenue on an interactive territory map.",
      features: ["Account location mapping", "Territory revenue heatmaps", "Region filtering"],
      perms: [["Read account locations", "Access billing addresses and regions"]] },
    { id: "stripepay", name: "PayBridge", cat: "Billing", color: "#635bff", mark: "card", installs: "10,720", rating: "4.9",
      blurb: "Sync subscriptions, invoices and payment status with your billing.",
      features: ["Subscription & invoice sync", "Failed payment recovery", "Revenue reporting"],
      perms: [["Read charges & subscriptions", "View payment and plan data"], ["Write invoice events", "Update billing status on records"]] },
    { id: "ledgerly", name: "Ledgerly", cat: "Billing", color: "#be123c", mark: "ticket", installs: "2,880", rating: "4.4",
      blurb: "Reconcile invoices with your accounting ledger every night.",
      features: ["Nightly invoice reconciliation", "Tax category mapping", "Export to accounting"],
      perms: [["Read invoices", "Access invoice line items and totals"]] }
  ];

  var CATS = ["CRM", "Comms", "Dev", "Analytics", "Billing"];

  // ---------- State ----------
  var state = { q: "", cat: "All", connected: {} };
  // seed a couple as connected
  state.connected["gitforge"] = true;
  state.connected["slacknest"] = true;

  // ---------- DOM refs ----------
  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid"), chipsEl = $("chips"), empty = $("empty");
  var searchInput = $("search"), searchClear = $("searchClear");
  var connPill = $("connPill"), toastHost = $("toastHost");

  // ---------- Toast ----------
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.innerHTML = '<span class="dot"></span><span>' + msg + "</span>";
    toastHost.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2400);
  }

  // ---------- Helpers ----------
  function countConnected() {
    var n = 0;
    for (var k in state.connected) if (state.connected[k]) n++;
    return n;
  }
  function updateConnPill() {
    var n = countConnected();
    connPill.textContent = n + " connected";
  }
  function catCount(cat) {
    if (cat === "All") return INTEGRATIONS.length;
    return INTEGRATIONS.filter(function (i) { return i.cat === cat; }).length;
  }
  function matches(item) {
    if (state.cat !== "All" && item.cat !== state.cat) return false;
    if (state.q) {
      var hay = (item.name + " " + item.cat + " " + item.blurb).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  // ---------- Chips ----------
  function renderChips() {
    chipsEl.innerHTML = "";
    var all = ["All"].concat(CATS);
    all.forEach(function (cat) {
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.setAttribute("aria-pressed", state.cat === cat ? "true" : "false");
      b.innerHTML = cat + ' <span class="chip-count">' + catCount(cat) + "</span>";
      b.addEventListener("click", function () {
        state.cat = cat;
        renderChips();
        renderGrid();
      });
      chipsEl.appendChild(b);
    });
  }

  // ---------- Grid ----------
  function renderGrid() {
    var list = INTEGRATIONS.filter(matches);
    grid.innerHTML = "";
    if (!list.length) {
      grid.hidden = true;
      empty.hidden = false;
      return;
    }
    grid.hidden = false;
    empty.hidden = true;

    list.forEach(function (item, i) {
      var on = !!state.connected[item.id];
      var card = document.createElement("article");
      card.className = "card";
      card.style.animationDelay = Math.min(i * 28, 280) + "ms";
      card.innerHTML =
        '<div class="card-top">' +
          '<span class="logo" style="background:linear-gradient(135deg,' + item.color + ',' + shade(item.color) + ')">' + MARKS[item.mark] + "</span>" +
          (on ? '<span class="connected-tag">Connected</span>' : "") +
        "</div>" +
        '<div class="card-name">' + item.name + "</div>" +
        '<span class="card-cat">' + item.cat + "</span>" +
        '<p class="card-blurb">' + item.blurb + "</p>" +
        '<div class="card-actions">' +
          '<button class="btn btn-ghost" data-act="details">Details</button>' +
          '<button class="btn btn-connect" data-act="connect" data-on="' + on + '">' + (on ? "Disconnect" : "Connect") + "</button>" +
        "</div>";

      card.querySelector('[data-act="details"]').addEventListener("click", function () { openDrawer(item.id); });
      card.querySelector('[data-act="connect"]').addEventListener("click", function () { toggleConnect(item.id); });
      grid.appendChild(card);
    });
  }

  function shade(hex) {
    // darken a hex color ~18%
    var c = hex.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    var f = 0.78;
    function h(v) { return ("0" + Math.round(v * f).toString(16)).slice(-2); }
    return "#" + h(r) + h(g) + h(b);
  }

  // ---------- Connect toggle ----------
  function toggleConnect(id) {
    var item = INTEGRATIONS.filter(function (x) { return x.id === id; })[0];
    var nowOn = !state.connected[id];
    state.connected[id] = nowOn;
    if (nowOn) toast(item.name + " connected");
    else toast(item.name + " disconnected", "warn");
    updateConnPill();
    renderGrid();
    if (!$("drawer").hidden && drawerId === id) syncDrawerButton(id);
  }

  // ---------- Drawer ----------
  var drawerId = null, lastFocus = null;
  function openDrawer(id) {
    var item = INTEGRATIONS.filter(function (x) { return x.id === id; })[0];
    if (!item) return;
    drawerId = id;
    lastFocus = document.activeElement;

    $("drawerLogo").style.background = "linear-gradient(135deg," + item.color + "," + shade(item.color) + ")";
    $("drawerLogo").innerHTML = MARKS[item.mark];
    $("drawerName").textContent = item.name;
    $("drawerCat").textContent = item.cat + " integration";
    $("drawerBlurb").textContent = item.blurb;
    $("drawerInstalls").textContent = item.installs;
    $("drawerRating").textContent = item.rating + " ★";

    var feat = $("drawerFeatures");
    feat.innerHTML = "";
    item.features.forEach(function (f) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="tick"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>' + f + "</span>";
      feat.appendChild(li);
    });

    var perms = $("drawerPerms");
    perms.innerHTML = "";
    item.perms.forEach(function (p) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="lock"><svg viewBox="0 0 24 24" width="14" height="14"><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg></span><span><span class="txt">' + p[0] + "</span><small>" + p[1] + "</small></span>";
      perms.appendChild(li);
    });

    syncDrawerButton(id);

    $("scrim").hidden = false;
    var d = $("drawer");
    d.hidden = false;
    d.focus();
    document.addEventListener("keydown", onKey);
  }

  function syncDrawerButton(id) {
    var on = !!state.connected[id];
    var btn = $("drawerConnect");
    btn.textContent = on ? "Disconnect integration" : "Connect integration";
    btn.setAttribute("data-on", on);
  }

  function closeDrawer() {
    $("drawer").hidden = true;
    $("scrim").hidden = true;
    drawerId = null;
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") closeDrawer();
  }

  $("drawerClose").addEventListener("click", closeDrawer);
  $("scrim").addEventListener("click", closeDrawer);
  $("drawerConnect").addEventListener("click", function () {
    if (drawerId) toggleConnect(drawerId);
  });

  // ---------- Search ----------
  searchInput.addEventListener("input", function () {
    state.q = searchInput.value.trim().toLowerCase();
    searchClear.hidden = !searchInput.value;
    renderGrid();
  });
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    state.q = "";
    searchClear.hidden = true;
    searchInput.focus();
    renderGrid();
  });
  $("emptyReset").addEventListener("click", function () {
    searchInput.value = "";
    state.q = "";
    state.cat = "All";
    searchClear.hidden = true;
    renderChips();
    renderGrid();
  });

  // ---------- Theme ----------
  var themeBtn = $("themeToggle");
  themeBtn.addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
    themeBtn.setAttribute("aria-pressed", String(!dark));
    themeBtn.querySelector(".theme-ico").textContent = dark ? "☾" : "☀";
  });

  // ---------- Init ----------
  renderChips();
  renderGrid();
  updateConnPill();
})();
