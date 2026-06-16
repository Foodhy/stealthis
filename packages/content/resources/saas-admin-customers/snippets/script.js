(function () {
  "use strict";

  /* ---------- Fictional dataset ---------- */
  var LOGOS = ["#6366f1", "#0ea5e9", "#9333ea", "#16a34a", "#d97706", "#dc2626", "#0891b2", "#db2777", "#65a30d", "#7c3aed"];
  function logoColor(name) {
    var s = 0;
    for (var i = 0; i < name.length; i++) s = (s + name.charCodeAt(i)) % LOGOS.length;
    return LOGOS[s];
  }
  function initials(name) {
    return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  var DATA = [
    { id: "AC-1042", company: "Northwind Labs", owner: "Priya Anand", email: "priya@northwind.io", plan: "Scale", mrr: 4200, seats: 48, status: "active", health: 92, since: "Mar 2024", region: "US-East" },
    { id: "AC-1088", company: "Vellum Studio", owner: "Marco Diaz", email: "marco@vellum.design", plan: "Growth", mrr: 890, seats: 14, status: "active", health: 78, since: "Jul 2024", region: "EU-West" },
    { id: "AC-1131", company: "Tilde Analytics", owner: "Sara Okafor", email: "sara@tilde.ai", plan: "Enterprise", mrr: 9800, seats: 120, status: "active", health: 88, since: "Nov 2023", region: "US-West" },
    { id: "AC-1156", company: "Pinecrest Co", owner: "James Whitfield", email: "james@pinecrest.co", plan: "Starter", mrr: 149, seats: 5, status: "trialing", health: 64, since: "Jun 2026", region: "US-East" },
    { id: "AC-1190", company: "Quanta Freight", owner: "Lena Brandt", email: "lena@quanta.com", plan: "Growth", mrr: 1240, seats: 22, status: "past_due", health: 41, since: "Feb 2025", region: "EU-Central" },
    { id: "AC-1203", company: "Maple & Bell", owner: "Omar Haddad", email: "omar@mapleandbell.com", plan: "Free", mrr: 0, seats: 3, status: "trialing", health: 55, since: "Jun 2026", region: "APAC" },
    { id: "AC-1244", company: "Brightside Health", owner: "Nina Petrov", email: "nina@brightside.health", plan: "Scale", mrr: 3650, seats: 41, status: "active", health: 84, since: "Sep 2024", region: "US-East" },
    { id: "AC-1267", company: "Orbital Goods", owner: "Tom Becker", email: "tom@orbital.shop", plan: "Starter", mrr: 99, seats: 4, status: "active", health: 71, since: "Jan 2025", region: "EU-West" },
    { id: "AC-1289", company: "Cobalt Robotics", owner: "Ava Lindqvist", email: "ava@cobalt.io", plan: "Enterprise", mrr: 12400, seats: 165, status: "active", health: 95, since: "May 2023", region: "US-West" },
    { id: "AC-1310", company: "Fernwood Bank", owner: "Derek Cole", email: "derek@fernwood.bank", plan: "Scale", mrr: 5100, seats: 60, status: "past_due", health: 38, since: "Aug 2024", region: "US-Central" },
    { id: "AC-1334", company: "Lumen Print", owner: "Hana Suzuki", email: "hana@lumenprint.jp", plan: "Growth", mrr: 760, seats: 11, status: "active", health: 73, since: "Apr 2025", region: "APAC" },
    { id: "AC-1356", company: "Drift Surf Club", owner: "Kai Moana", email: "kai@driftsurf.nz", plan: "Free", mrr: 0, seats: 2, status: "churned", health: 18, since: "Dec 2024", region: "APAC" },
    { id: "AC-1377", company: "Atlas Survey", owner: "Greta Nilsen", email: "greta@atlassurvey.no", plan: "Growth", mrr: 1080, seats: 19, status: "active", health: 81, since: "Oct 2024", region: "EU-North" },
    { id: "AC-1402", company: "Maven Legal", owner: "Robert Asante", email: "robert@mavenlegal.com", plan: "Scale", mrr: 3990, seats: 44, status: "active", health: 67, since: "Mar 2025", region: "US-East" },
    { id: "AC-1419", company: "Saffron Eats", owner: "Devi Rao", email: "devi@saffron.eats", plan: "Starter", mrr: 199, seats: 7, status: "trialing", health: 60, since: "Jun 2026", region: "APAC" },
    { id: "AC-1433", company: "Polaris Energy", owner: "Mikael Berg", email: "mikael@polaris.energy", plan: "Enterprise", mrr: 15200, seats: 210, status: "active", health: 90, since: "Feb 2023", region: "EU-North" },
    { id: "AC-1458", company: "Glimmer Cosmetics", owner: "Chloe Tran", email: "chloe@glimmer.beauty", plan: "Growth", mrr: 940, seats: 16, status: "active", health: 76, since: "Jul 2025", region: "US-West" },
    { id: "AC-1471", company: "Hollowbrook Farms", owner: "Pete Carlson", email: "pete@hollowbrook.farm", plan: "Free", mrr: 0, seats: 2, status: "churned", health: 24, since: "Nov 2024", region: "US-Central" },
    { id: "AC-1490", company: "Kestrel Aero", owner: "Yara Mansour", email: "yara@kestrel.aero", plan: "Scale", mrr: 4480, seats: 52, status: "active", health: 86, since: "Jan 2024", region: "EU-West" },
    { id: "AC-1512", company: "Tessera Tiles", owner: "Bruno Costa", email: "bruno@tessera.com", plan: "Starter", mrr: 129, seats: 5, status: "past_due", health: 47, since: "May 2025", region: "LATAM" },
    { id: "AC-1538", company: "Wavelength FM", owner: "Indie Park", email: "indie@wavelength.fm", plan: "Growth", mrr: 1320, seats: 24, status: "active", health: 83, since: "Sep 2024", region: "APAC" },
    { id: "AC-1559", company: "Granite Tax", owner: "Holly Reed", email: "holly@granitetax.com", plan: "Enterprise", mrr: 8700, seats: 98, status: "active", health: 79, since: "Apr 2024", region: "US-East" },
    { id: "AC-1574", company: "Mosaic Schools", owner: "Felix Wagner", email: "felix@mosaic.edu", plan: "Scale", mrr: 3300, seats: 38, status: "trialing", health: 69, since: "Jun 2026", region: "EU-Central" },
    { id: "AC-1601", company: "Driftwood Hotels", owner: "Camila Rojas", email: "camila@driftwood.travel", plan: "Growth", mrr: 1010, seats: 18, status: "active", health: 74, since: "Aug 2025", region: "LATAM" },
    { id: "AC-1623", company: "Verdant Supply", owner: "Leo Chambers", email: "leo@verdant.supply", plan: "Starter", mrr: 159, seats: 6, status: "active", health: 72, since: "Feb 2025", region: "US-West" },
    { id: "AC-1645", company: "Halcyon Media", owner: "Ruth Adeyemi", email: "ruth@halcyon.media", plan: "Scale", mrr: 4720, seats: 55, status: "active", health: 88, since: "Dec 2023", region: "EU-West" }
  ];

  var PLAN_RANK = { Free: 0, Starter: 1, Growth: 2, Scale: 3, Enterprise: 4 };
  var STATUS_LABEL = { active: "Active", trialing: "Trialing", past_due: "Past due", churned: "Churned" };

  /* ---------- State ---------- */
  var state = {
    search: "", plan: "", status: "",
    sortKey: "mrr", sortDir: "desc",
    page: 1, pageSize: 8,
    selected: new Set()
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmtMoney = function (n) { return "$" + n.toLocaleString("en-US"); };
  var fmtMoneyK = function (n) { return n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k" : "$" + n; };

  /* ---------- Toast ---------- */
  function toast(msg) {
    var wrap = $("#toasts");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 220);
    }, 2400);
  }

  /* ---------- Derived list ---------- */
  function filtered() {
    var q = state.search.trim().toLowerCase();
    var list = DATA.filter(function (c) {
      if (state.plan && c.plan !== state.plan) return false;
      if (state.status && c.status !== state.status) return false;
      if (q) {
        var hay = (c.company + " " + c.owner + " " + c.email + " " + c.id).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var dir = state.sortDir === "asc" ? 1 : -1;
    var k = state.sortKey;
    list.sort(function (a, b) {
      var av, bv;
      if (k === "plan") { av = PLAN_RANK[a.plan]; bv = PLAN_RANK[b.plan]; }
      else if (k === "company" || k === "status") { av = a[k].toLowerCase(); bv = b[k].toLowerCase(); }
      else { av = a[k]; bv = b[k]; }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return a.company.localeCompare(b.company);
    });
    return list;
  }

  function healthClass(h) { return h >= 75 ? "h-good" : h >= 50 ? "h-mid" : "h-bad"; }

  /* ---------- Render rows ---------- */
  function render() {
    var list = filtered();
    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.pageSize;
    var pageItems = list.slice(start, start + state.pageSize);

    var tbody = $("#rows");
    tbody.innerHTML = "";
    pageItems.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.dataset.id = c.id;
      if (state.selected.has(c.id)) tr.classList.add("is-selected");
      var hc = healthClass(c.health);
      tr.innerHTML =
        '<td class="col-check"><input type="checkbox" class="rowcheck" aria-label="Select ' + esc(c.company) + '"' + (state.selected.has(c.id) ? " checked" : "") + "></td>" +
        '<td><div class="co"><span class="co-logo" style="background:' + logoColor(c.company) + '">' + initials(c.company) + '</span>' +
          '<span class="co-meta"><strong>' + esc(c.company) + "</strong><small>" + esc(c.owner) + " · " + c.id + "</small></span></div></td>" +
        '<td><span class="badge plan-' + c.plan + '">' + c.plan + "</span></td>" +
        '<td class="num">' + fmtMoney(c.mrr) + "</td>" +
        '<td class="num">' + c.seats + "</td>" +
        '<td><span class="status ' + c.status + '">' + STATUS_LABEL[c.status] + "</span></td>" +
        '<td><span class="health ' + hc + '"><span class="health-bar"><i style="width:' + c.health + '%"></i></span><span class="health-num">' + c.health + "</span></span></td>" +
        '<td class="col-act"><button class="row-act" aria-label="Open ' + esc(c.company) + '">›</button></td>';
      tbody.appendChild(tr);
    });

    $("#empty").hidden = total !== 0;
    $(".table-wrap .grid").style.display = total === 0 ? "none" : "";

    // pager
    var shownEnd = Math.min(start + state.pageSize, total);
    $("#pagerInfo").textContent = total === 0 ? "No results" :
      "Showing " + (start + 1) + "–" + shownEnd + " of " + total + " accounts";
    renderPages(pages);
    $("#prevPage").disabled = state.page <= 1;
    $("#nextPage").disabled = state.page >= pages;

    // check-all reflects current page
    var allChecked = pageItems.length > 0 && pageItems.every(function (c) { return state.selected.has(c.id); });
    $("#checkAll").checked = allChecked;
    $("#checkAll").indeterminate = !allChecked && pageItems.some(function (c) { return state.selected.has(c.id); });

    renderBulk();
  }

  function renderPages(pages) {
    var wrap = $("#pagerPages");
    wrap.innerHTML = "";
    for (var p = 1; p <= pages; p++) {
      var b = document.createElement("button");
      b.className = "page-num" + (p === state.page ? " is-current" : "");
      b.textContent = p;
      b.setAttribute("aria-label", "Page " + p);
      if (p === state.page) b.setAttribute("aria-current", "page");
      (function (pp) { b.addEventListener("click", function () { state.page = pp; render(); }); })(p);
      wrap.appendChild(b);
    }
  }

  function renderBulk() {
    var n = state.selected.size;
    var bar = $("#bulkbar");
    bar.hidden = n === 0;
    $("#bulkCount").textContent = n;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Stats ---------- */
  function renderStats() {
    var mrr = 0, seats = 0, risk = 0;
    DATA.forEach(function (c) {
      mrr += c.mrr; seats += c.seats;
      if (c.status === "past_due" || c.status === "churned" || c.health < 50) risk++;
    });
    $("#statAccounts").textContent = DATA.length;
    $("#statMrr").textContent = fmtMoneyK(mrr);
    $("#statSeats").textContent = seats.toLocaleString("en-US");
    $("#statRisk").textContent = risk;
  }

  /* ---------- Detail drawer ---------- */
  var lastFocus = null;
  function openDrawer(id) {
    var c = DATA.find(function (x) { return x.id === id; });
    if (!c) return;
    lastFocus = document.activeElement;
    var hc = healthClass(c.health);
    var usagePct = Math.min(100, Math.round(c.seats / Math.max(c.seats, 1) * 100));
    var apiPct = Math.min(100, 30 + (c.health % 60));
    var storPct = Math.min(100, 20 + (c.mrr % 70));
    var inner = $("#drawerInner");
    inner.innerHTML =
      '<div class="dh">' +
        '<span class="co-logo" style="background:' + logoColor(c.company) + '">' + initials(c.company) + "</span>" +
        '<div class="dh-meta"><h2>' + esc(c.company) + "</h2>" +
          '<div class="dh-sub">' + esc(c.owner) + " · " + esc(c.email) + "</div></div>" +
        '<button class="dclose" id="drawerClose" aria-label="Close detail">×</button>' +
      "</div>" +
      '<div class="dgrid">' +
        '<div class="dcell"><span>Plan</span><strong><span class="badge plan-' + c.plan + '">' + c.plan + "</span></strong></div>" +
        '<div class="dcell"><span>Status</span><strong><span class="status ' + c.status + '">' + STATUS_LABEL[c.status] + "</span></strong></div>" +
        '<div class="dcell"><span>MRR</span><strong>' + fmtMoney(c.mrr) + "</strong></div>" +
        '<div class="dcell"><span>Seats</span><strong>' + c.seats + "</strong></div>" +
        '<div class="dcell"><span>Health</span><strong class="' + hc.replace("h-", "health-num--") + '" style="color:' + (c.health >= 75 ? "var(--ok)" : c.health >= 50 ? "var(--warn)" : "var(--danger)") + '">' + c.health + " / 100</strong></div>" +
        '<div class="dcell"><span>Customer since</span><strong>' + c.since + "</strong></div>" +
      "</div>" +
      '<div class="dsection"><h3>Usage this cycle</h3>' +
        usageRow("Seats assigned", c.seats + " / " + (c.seats + 5), usagePct, usagePct > 85) +
        usageRow("API calls", apiPct + "% of quota", apiPct, apiPct > 85) +
        usageRow("Storage", storPct + "% of quota", storPct, storPct > 85) +
      "</div>" +
      '<div class="dsection"><h3>Recent activity</h3><ul class="activity">' +
        actItem("ok", "Invoice paid · " + fmtMoney(c.mrr), "2 days ago") +
        actItem("", c.owner + " invited 2 teammates", "5 days ago") +
        actItem(c.health < 50 ? "warn" : "", c.health < 50 ? "Usage dropped 40% vs prior cycle" : "Upgraded API rate limit", "1 week ago") +
        actItem("", "Logged in from " + c.region, "1 week ago") +
      "</ul></div>" +
      '<div class="dsection"><h3>Billing</h3>' +
        billRow("Jun 2026", c.mrr, c.status === "past_due" ? "due" : "paid") +
        billRow("May 2026", c.mrr, "paid") +
        billRow("Apr 2026", c.mrr, "paid") +
      "</div>" +
      '<div class="dactions">' +
        '<button class="btn btn-ghost" data-act="message">Message owner</button>' +
        '<button class="btn btn-primary" data-act="manage">Manage plan</button>' +
      "</div>";

    var scrim = $("#scrim"), drawer = $("#drawer");
    scrim.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () { scrim.classList.add("show"); drawer.classList.add("open"); });
    $("#drawerClose").addEventListener("click", closeDrawer);
    inner.querySelectorAll(".dactions .btn").forEach(function (b) {
      b.addEventListener("click", function () {
        toast(b.dataset.act === "manage" ? "Opening plan manager for " + c.company : "Composing message to " + c.owner);
      });
    });
    drawer.focus();
  }

  function usageRow(label, val, pct, warn) {
    return '<div class="usage-row"><div class="ur-top"><span>' + label + "</span><em>" + val + "</em></div>" +
      '<div class="ubar' + (warn ? " warn" : "") + '"><i style="width:' + pct + '%"></i></div></div>';
  }
  function actItem(kind, text, time) {
    return '<li><span class="act-dot ' + kind + '"></span><div class="act-body"><p>' + esc(text) + "</p><time>" + time + "</time></div></li>";
  }
  function billRow(month, amt, st) {
    return '<div class="bill-row"><span>' + month + '</span><span class="bill-amt">' + fmtMoney(amt) +
      '</span><span class="pill ' + st + '">' + (st === "due" ? "Past due" : "Paid") + "</span></div>";
  }

  function closeDrawer() {
    var scrim = $("#scrim"), drawer = $("#drawer");
    scrim.classList.remove("show");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(function () { scrim.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Export ---------- */
  function exportCsv(rows, label) {
    var head = ["Account ID", "Company", "Owner", "Email", "Plan", "MRR", "Seats", "Status", "Health"];
    var lines = [head.join(",")];
    rows.forEach(function (c) {
      lines.push([c.id, '"' + c.company + '"', '"' + c.owner + '"', c.email, c.plan, c.mrr, c.seats, c.status, c.health].join(","));
    });
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "heliox-customers.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Exported " + rows.length + " " + label);
  }

  /* ---------- Sort header UI ---------- */
  function syncSortUI() {
    document.querySelectorAll(".sort").forEach(function (btn) {
      var on = btn.dataset.key === state.sortKey;
      btn.classList.toggle("is-sorted", on);
      btn.classList.toggle("desc", on && state.sortDir === "desc");
      btn.setAttribute("aria-sort", on ? (state.sortDir === "asc" ? "ascending" : "descending") : "none");
    });
  }

  /* ---------- Events ---------- */
  function wire() {
    $("#search").addEventListener("input", function (e) { state.search = e.target.value; state.page = 1; render(); });

    $("#planFilter").addEventListener("change", function (e) { state.plan = e.target.value; state.page = 1; render(); });
    $("#statusFilter").addEventListener("change", function (e) { state.status = e.target.value; state.page = 1; render(); });

    document.querySelectorAll(".sort").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.dataset.key;
        if (state.sortKey === k) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortKey = k; state.sortDir = (k === "company" || k === "status" || k === "plan") ? "asc" : "desc"; }
        syncSortUI(); render();
      });
    });

    $("#rows").addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (!tr) return;
      if (e.target.classList.contains("rowcheck")) {
        toggleSelect(tr.dataset.id, e.target.checked);
        return;
      }
      openDrawer(tr.dataset.id);
    });

    $("#checkAll").addEventListener("change", function (e) {
      var list = filtered();
      var start = (state.page - 1) * state.pageSize;
      var pageItems = list.slice(start, start + state.pageSize);
      pageItems.forEach(function (c) {
        if (e.target.checked) state.selected.add(c.id); else state.selected.delete(c.id);
      });
      render();
    });

    $("#prevPage").addEventListener("click", function () { if (state.page > 1) { state.page--; render(); } });
    $("#nextPage").addEventListener("click", function () { state.page++; render(); });

    $("#exportBtn").addEventListener("click", function () { exportCsv(filtered(), "accounts"); });
    $("#bulkExport").addEventListener("click", function () {
      exportCsv(DATA.filter(function (c) { return state.selected.has(c.id); }), "selected accounts");
    });
    $("#bulkFlag").addEventListener("click", function () {
      toast("Flagged " + state.selected.size + " account(s) for review");
    });
    $("#bulkClear").addEventListener("click", function () { state.selected.clear(); render(); });

    $("#resetEmpty").addEventListener("click", resetFilters);

    $("#scrim").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && $("#drawer").classList.contains("open")) closeDrawer();
    });

    $("#newBtn").addEventListener("click", function () { toast("New account form would open here"); });

    var toggle = $("#themeToggle");
    toggle.addEventListener("click", function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
      toggle.setAttribute("aria-pressed", String(!dark));
      $(".ico-sun", toggle).textContent = dark ? "☀" : "☾";
    });
  }

  function toggleSelect(id, on) {
    if (on) state.selected.add(id); else state.selected.delete(id);
    var tr = document.querySelector('tr[data-id="' + id + '"]');
    if (tr) tr.classList.toggle("is-selected", on);
    renderBulk();
    // sync check-all
    var list = filtered();
    var start = (state.page - 1) * state.pageSize;
    var pageItems = list.slice(start, start + state.pageSize);
    var allChecked = pageItems.length > 0 && pageItems.every(function (c) { return state.selected.has(c.id); });
    $("#checkAll").checked = allChecked;
    $("#checkAll").indeterminate = !allChecked && pageItems.some(function (c) { return state.selected.has(c.id); });
  }

  function resetFilters() {
    state.search = ""; state.plan = ""; state.status = ""; state.page = 1;
    $("#search").value = ""; $("#planFilter").value = ""; $("#statusFilter").value = "";
    render();
  }

  /* ---------- Init ---------- */
  renderStats();
  wire();
  syncSortUI();
  render();
})();
