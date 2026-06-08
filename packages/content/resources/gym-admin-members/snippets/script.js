(function () {
  "use strict";

  // ---------- Data ----------
  var AVATAR_COLORS = ["#c6ff3a", "#ff6a2b", "#34d399", "#7dd3fc", "#fbbf24", "#f472b6", "#a78bfa"];

  var MEMBERS = [
    { id: 1, name: "Marcus Vega", email: "marcus.vega@mail.com", tier: "elite", status: "active", joined: "2022-03-14", lastVisit: "2026-06-07", ltv: 4280, plan: "Annual Elite", visits: 412, trainer: "Dana Cole", phone: "(415) 555-0142" },
    { id: 2, name: "Priya Nandakumar", email: "priya.n@mail.com", tier: "pro", status: "active", joined: "2023-11-02", lastVisit: "2026-06-06", ltv: 1860, plan: "Monthly Pro", visits: 188, trainer: "Leo Marsh", phone: "(415) 555-0119" },
    { id: 3, name: "Tobias Lind", email: "tobias.lind@mail.com", tier: "basic", status: "frozen", joined: "2024-01-20", lastVisit: "2026-04-11", ltv: 720, plan: "Monthly Basic", visits: 64, trainer: "—", phone: "(415) 555-0188" },
    { id: 4, name: "Renee Okafor", email: "renee.okafor@mail.com", tier: "elite", status: "active", joined: "2021-08-05", lastVisit: "2026-06-08", ltv: 5910, plan: "Annual Elite", visits: 603, trainer: "Dana Cole", phone: "(415) 555-0173" },
    { id: 5, name: "Hassan Karim", email: "h.karim@mail.com", tier: "pro", status: "trial", joined: "2026-05-29", lastVisit: "2026-06-05", ltv: 0, plan: "14-day Trial", visits: 5, trainer: "Leo Marsh", phone: "(415) 555-0151" },
    { id: 6, name: "Camila Soto", email: "camila.soto@mail.com", tier: "pro", status: "active", joined: "2023-02-18", lastVisit: "2026-06-07", ltv: 2340, plan: "Monthly Pro", visits: 271, trainer: "Nina Park", phone: "(415) 555-0107" },
    { id: 7, name: "Derek Onyango", email: "derek.o@mail.com", tier: "basic", status: "lapsed", joined: "2023-06-30", lastVisit: "2026-02-14", ltv: 540, plan: "Monthly Basic", visits: 41, trainer: "—", phone: "(415) 555-0166" },
    { id: 8, name: "Yuki Tanaka", email: "yuki.tanaka@mail.com", tier: "elite", status: "active", joined: "2022-10-12", lastVisit: "2026-06-08", ltv: 3780, plan: "Annual Elite", visits: 389, trainer: "Nina Park", phone: "(415) 555-0124" },
    { id: 9, name: "Bianca Ferreira", email: "bianca.f@mail.com", tier: "pro", status: "frozen", joined: "2024-04-09", lastVisit: "2026-05-01", ltv: 1120, plan: "Monthly Pro", visits: 97, trainer: "Leo Marsh", phone: "(415) 555-0193" },
    { id: 10, name: "Omar Haddad", email: "omar.haddad@mail.com", tier: "basic", status: "active", joined: "2025-01-22", lastVisit: "2026-06-04", ltv: 410, plan: "Monthly Basic", visits: 58, trainer: "—", phone: "(415) 555-0138" },
    { id: 11, name: "Sloane Whitaker", email: "sloane.w@mail.com", tier: "elite", status: "active", joined: "2021-12-01", lastVisit: "2026-06-06", ltv: 6240, plan: "Annual Elite", visits: 671, trainer: "Dana Cole", phone: "(415) 555-0102" },
    { id: 12, name: "Diego Ramos", email: "diego.ramos@mail.com", tier: "pro", status: "trial", joined: "2026-06-01", lastVisit: "2026-06-07", ltv: 0, plan: "14-day Trial", visits: 4, trainer: "Nina Park", phone: "(415) 555-0177" },
    { id: 13, name: "Ingrid Holm", email: "ingrid.holm@mail.com", tier: "basic", status: "active", joined: "2024-09-15", lastVisit: "2026-06-03", ltv: 890, plan: "Monthly Basic", visits: 112, trainer: "—", phone: "(415) 555-0145" },
    { id: 14, name: "Nadia Petrova", email: "nadia.p@mail.com", tier: "pro", status: "lapsed", joined: "2023-03-27", lastVisit: "2026-01-09", ltv: 1480, plan: "Monthly Pro", visits: 156, trainer: "Leo Marsh", phone: "(415) 555-0181" },
    { id: 15, name: "Theo Castellanos", email: "theo.c@mail.com", tier: "elite", status: "active", joined: "2022-07-19", lastVisit: "2026-06-08", ltv: 4015, plan: "Annual Elite", visits: 433, trainer: "Dana Cole", phone: "(415) 555-0128" },
    { id: 16, name: "Amara Bello", email: "amara.bello@mail.com", tier: "pro", status: "active", joined: "2024-02-11", lastVisit: "2026-06-05", ltv: 1690, plan: "Monthly Pro", visits: 143, trainer: "Nina Park", phone: "(415) 555-0159" },
    { id: 17, name: "Logan Frost", email: "logan.frost@mail.com", tier: "basic", status: "frozen", joined: "2025-03-08", lastVisit: "2026-05-20", ltv: 300, plan: "Monthly Basic", visits: 33, trainer: "—", phone: "(415) 555-0190" },
    { id: 18, name: "Mei Lin Zhao", email: "meilin.zhao@mail.com", tier: "elite", status: "active", joined: "2021-05-23", lastVisit: "2026-06-07", ltv: 6890, plan: "Annual Elite", visits: 720, trainer: "Dana Cole", phone: "(415) 555-0111" },
  ];

  var PAGE_SIZE = 8;

  // ---------- State ----------
  var state = {
    search: "",
    filter: "all",
    sortKey: "name",
    sortDir: "asc",
    page: 1,
    selected: new Set(),
  };

  // ---------- Elements ----------
  var $ = function (sel) { return document.querySelector(sel); };
  var tbody = $("#tbody");
  var emptyEl = $("#empty");
  var searchInput = $("#search");
  var selectAll = $("#selectAll");
  var bulkbar = $("#bulkbar");
  var bulkCount = $("#bulkCount");
  var pagerInfo = $("#pagerInfo");
  var pagerPages = $("#pagerPages");
  var prevBtn = $("#prevPage");
  var nextBtn = $("#nextPage");
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var drawerBody = $("#drawerBody");
  var toasts = $("#toasts");

  // ---------- Helpers ----------
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "danger" ? " danger" : "");
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .25s ease, transform .25s ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
  }

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
  }
  function colorFor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function fmtMoney(n) { return "$" + n.toLocaleString("en-US"); }

  function getFiltered() {
    var q = state.search.trim().toLowerCase();
    var list = MEMBERS.filter(function (m) {
      if (state.filter !== "all" && m.status !== state.filter) return false;
      if (q && m.name.toLowerCase().indexOf(q) === -1 && m.email.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var dir = state.sortDir === "asc" ? 1 : -1;
    var key = state.sortKey;
    list.sort(function (a, b) {
      var av = a[key], bv = b[key];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }

  // ---------- Render ----------
  function render() {
    var list = getFiltered();
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = list.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = "";
    emptyEl.hidden = list.length !== 0;

    pageItems.forEach(function (m) {
      var tr = document.createElement("tr");
      tr.dataset.id = m.id;
      if (state.selected.has(m.id)) tr.classList.add("is-selected");
      tr.innerHTML =
        '<td class="col-check"><input type="checkbox" aria-label="Select ' + m.name + '"' + (state.selected.has(m.id) ? " checked" : "") + "></td>" +
        '<td><div class="member-cell">' +
          '<span class="avatar" style="background:' + colorFor(m.id) + '">' + initials(m.name) + "</span>" +
          '<span><span class="member-name">' + m.name + "</span><br><span class=\"member-email\">" + m.email + "</span></span>" +
        "</div></td>" +
        '<td><span class="tier tier-' + m.tier + '">' + m.tier + "</span></td>" +
        '<td><span class="pill ' + m.status + '">' + m.status + "</span></td>" +
        "<td>" + fmtDate(m.joined) + "</td>" +
        "<td>" + fmtDate(m.lastVisit) + "</td>" +
        '<td class="num"><span class="ltv">' + fmtMoney(m.ltv) + "</span></td>" +
        '<td class="col-actions"><div class="row-actions">' +
          '<button class="icon-btn" data-act="freeze" title="Freeze"><svg viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>' +
          '<button class="icon-btn" data-act="message" title="Message"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>' +
          '<button class="icon-btn" data-act="view" title="View"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
        "</div></td>";
      tbody.appendChild(tr);
    });

    // pager
    pagerInfo.textContent = list.length === 0
      ? "No results"
      : "Showing " + (start + 1) + "–" + Math.min(start + PAGE_SIZE, list.length) + " of " + list.length;
    pagerPages.innerHTML = "";
    for (var p = 1; p <= totalPages; p++) {
      var b = document.createElement("button");
      b.className = "page-num" + (p === state.page ? " is-active" : "");
      b.textContent = p;
      b.dataset.page = p;
      pagerPages.appendChild(b);
    }
    prevBtn.disabled = state.page <= 1;
    nextBtn.disabled = state.page >= totalPages;

    // select-all state reflects current page
    var pageIds = pageItems.map(function (m) { return m.id; });
    var allSelected = pageIds.length > 0 && pageIds.every(function (id) { return state.selected.has(id); });
    selectAll.checked = allSelected;
    selectAll.indeterminate = !allSelected && pageIds.some(function (id) { return state.selected.has(id); });

    updateBulkbar();
  }

  function updateBulkbar() {
    var n = state.selected.size;
    bulkbar.hidden = n === 0;
    bulkCount.textContent = n;
  }

  function findMember(id) {
    for (var i = 0; i < MEMBERS.length; i++) if (MEMBERS[i].id === id) return MEMBERS[i];
    return null;
  }

  // ---------- Drawer ----------
  function openDrawer(m) {
    drawerBody.innerHTML =
      '<div class="d-head">' +
        '<span class="d-avatar" style="background:' + colorFor(m.id) + '">' + initials(m.name) + "</span>" +
        '<div><h2 class="d-name">' + m.name + '</h2><div class="d-email">' + m.email + "</div></div>" +
      "</div>" +
      '<div><span class="pill ' + m.status + '">' + m.status + '</span> &nbsp; <span class="tier tier-' + m.tier + '">' + m.tier + " tier</span></div>" +
      '<div class="d-stats">' +
        '<div class="d-stat"><div class="d-stat-v">' + m.visits + '</div><div class="d-stat-l">Visits</div></div>' +
        '<div class="d-stat"><div class="d-stat-v">' + fmtMoney(m.ltv) + '</div><div class="d-stat-l">LTV</div></div>' +
        '<div class="d-stat"><div class="d-stat-v">' + fmtDate(m.lastVisit).split(",")[0] + '</div><div class="d-stat-l">Last visit</div></div>' +
      "</div>" +
      '<div class="d-section-title">Membership</div>' +
      '<div class="d-row"><span>Plan</span><span>' + m.plan + "</span></div>" +
      '<div class="d-row"><span>Joined</span><span>' + fmtDate(m.joined) + "</span></div>" +
      '<div class="d-row"><span>Assigned trainer</span><span>' + m.trainer + "</span></div>" +
      '<div class="d-section-title">Contact</div>' +
      '<div class="d-row"><span>Email</span><span>' + m.email + "</span></div>" +
      '<div class="d-row"><span>Phone</span><span>' + m.phone + "</span></div>" +
      '<div class="d-actions">' +
        '<button class="btn btn-sm" type="button" data-d="message">Message</button>' +
        '<button class="btn btn-sm btn-neon" type="button" data-d="freeze">Freeze</button>' +
      "</div>";
    drawerBody.querySelector('[data-d="message"]').addEventListener("click", function () { toast("Message sent to " + m.name); });
    drawerBody.querySelector('[data-d="freeze"]').addEventListener("click", function () { freezeMember(m); });

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    drawer.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
  }

  function freezeMember(m) {
    m.status = m.status === "frozen" ? "active" : "frozen";
    toast(m.name + " is now " + m.status + ".");
    render();
    closeDrawer();
  }

  // ---------- Events ----------
  searchInput.addEventListener("input", function (e) {
    state.search = e.target.value;
    state.page = 1;
    render();
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      state.filter = chip.dataset.filter;
      state.page = 1;
      render();
    });
  });

  document.querySelectorAll(".sort").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      document.querySelectorAll(".sort").forEach(function (s) { s.classList.remove("asc", "desc"); });
      btn.classList.add(state.sortDir);
      render();
    });
  });

  tbody.addEventListener("click", function (e) {
    var actBtn = e.target.closest("[data-act]");
    var checkbox = e.target.closest('input[type="checkbox"]');
    var tr = e.target.closest("tr");
    if (!tr) return;
    var id = Number(tr.dataset.id);
    var m = findMember(id);

    if (checkbox) {
      if (checkbox.checked) state.selected.add(id);
      else state.selected.delete(id);
      tr.classList.toggle("is-selected", checkbox.checked);
      updateBulkbar();
      var pageIds = Array.prototype.map.call(tbody.querySelectorAll("tr"), function (r) { return Number(r.dataset.id); });
      selectAll.checked = pageIds.every(function (pid) { return state.selected.has(pid); });
      return;
    }

    if (actBtn) {
      var act = actBtn.dataset.act;
      if (act === "view") openDrawer(m);
      else if (act === "freeze") freezeMember(m);
      else if (act === "message") toast("Message sent to " + m.name + ".");
      return;
    }

    openDrawer(m);
  });

  selectAll.addEventListener("change", function () {
    var pageIds = Array.prototype.map.call(tbody.querySelectorAll("tr"), function (r) { return Number(r.dataset.id); });
    pageIds.forEach(function (id) {
      if (selectAll.checked) state.selected.add(id);
      else state.selected.delete(id);
    });
    render();
  });

  $("#bulkClear").addEventListener("click", function () {
    state.selected.clear();
    render();
  });

  document.querySelectorAll("[data-bulk]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var n = state.selected.size;
      var act = btn.dataset.bulk;
      if (act === "freeze") {
        state.selected.forEach(function (id) { var m = findMember(id); if (m) m.status = "frozen"; });
        toast("Froze " + n + " member" + (n === 1 ? "" : "s") + ".");
      } else if (act === "message") {
        toast("Messaged " + n + " member" + (n === 1 ? "" : "s") + ".");
      } else if (act === "cancel") {
        state.selected.forEach(function (id) { var m = findMember(id); if (m) m.status = "lapsed"; });
        toast("Cancelled " + n + " membership" + (n === 1 ? "" : "s") + ".", "danger");
      }
      state.selected.clear();
      render();
    });
  });

  prevBtn.addEventListener("click", function () { if (state.page > 1) { state.page--; render(); } });
  nextBtn.addEventListener("click", function () { state.page++; render(); });
  pagerPages.addEventListener("click", function (e) {
    var b = e.target.closest(".page-num");
    if (b) { state.page = Number(b.dataset.page); render(); }
  });

  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  $("#exportBtn").addEventListener("click", function () {
    toast("Exported " + getFiltered().length + " members to CSV.");
  });
  $("#addBtn").addEventListener("click", function () {
    toast("New member form opened.");
  });

  // initial sort indicator
  document.querySelector('.sort[data-sort="name"]').classList.add("asc");
  render();
})();
