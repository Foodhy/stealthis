(function () {
  "use strict";

  /* ---------- Seed data (fictional) ---------- */
  var GRADS = [
    "linear-gradient(135deg,#1f7a6d,#34a08f)",
    "linear-gradient(135deg,#e8743b,#f4a06f)",
    "linear-gradient(135deg,#155e54,#2f9e6f)",
    "linear-gradient(135deg,#cc5d28,#e8743b)",
    "linear-gradient(135deg,#3a6f8f,#5fa0bf)",
    "linear-gradient(135deg,#8a5a9e,#b489c7)"
  ];

  var campaigns = [
    {
      id: id(), name: "Clean Water Now: 12 Wells for Loma Verde",
      story: "Drilling twelve solar-pumped wells to bring safe drinking water to 3,200 villagers.",
      goal: 60000, raised: 47820, status: "active",
      start: "2026-04-01", end: "2026-07-15", cap: "Loma Verde, dry season 2026", g: 0,
      tiers: [{ amt: 25, label: "A week of clean water" }, { amt: 120, label: "A family's year" }, { amt: 500, label: "Sponsor a well plaque" }]
    },
    {
      id: id(), name: "Warm Meals Winter Drive",
      story: "Serving hot dinners and groceries to 900 families through the cold months.",
      goal: 35000, raised: 35920, status: "active",
      start: "2026-05-10", end: "2026-08-30", cap: "Community kitchen, Riverside", g: 1,
      tiers: [{ amt: 15, label: "Five warm meals" }, { amt: 75, label: "A family box" }, { amt: 250, label: "Stock the pantry" }]
    },
    {
      id: id(), name: "Bright Scholars Fund 2026",
      story: "Full-year scholarships covering tuition, books, and transport for 40 first-generation students.",
      goal: 90000, raised: 31200, status: "active",
      start: "2026-03-15", end: "2026-09-01", cap: "Mentorship cohort, spring", g: 2,
      tiers: [{ amt: 50, label: "Books for a term" }, { amt: 300, label: "A month of tuition" }, { amt: 2000, label: "Name a scholarship" }]
    },
    {
      id: id(), name: "Mobile Health Clinic Expansion",
      story: "Outfitting a second mobile clinic van to reach four remote highland districts.",
      goal: 120000, raised: 18450, status: "paused",
      start: "2026-06-01", end: "2026-12-15", cap: "Highland outreach route", g: 4,
      tiers: [{ amt: 40, label: "A checkup" }, { amt: 200, label: "Vaccine kit" }, { amt: 1500, label: "A clinic day" }]
    },
    {
      id: id(), name: "Reforest the Ridge",
      story: "Planting 25,000 native saplings with local youth crews to restore eroded hillsides.",
      goal: 28000, raised: 0, status: "draft",
      start: "2026-08-01", end: "2026-11-30", cap: "Ridge restoration, autumn", g: 2,
      tiers: [{ amt: 10, label: "Ten saplings" }, { amt: 60, label: "A grove" }]
    },
    {
      id: id(), name: "Spring Gala: Lights of Hope",
      story: "Our flagship dinner that funded shelters, tutoring, and emergency relief last spring.",
      goal: 75000, raised: 81340, status: "ended",
      start: "2026-01-20", end: "2026-04-12", cap: "Annual benefit gala", g: 5,
      tiers: [{ amt: 150, label: "A seat" }, { amt: 1500, label: "A table of ten" }]
    }
  ];

  var state = { filter: "all", view: "cards", query: "", editingId: null };

  /* ---------- Helpers ---------- */
  function id() { return "c" + Math.random().toString(36).slice(2, 9); }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function pct(c) { return c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0; }
  function fmtDate(s) {
    if (!s) return "";
    var d = new Date(s + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function fmtRange(c) { return fmtDate(c.start) + " – " + fmtDate(c.end); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }

  /* ---------- Toast ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  /* ---------- Rendering ---------- */
  var cardGrid = document.getElementById("cardGrid");
  var tableBody = document.getElementById("tableBody");
  var tableWrap = document.getElementById("tableWrap");
  var emptyState = document.getElementById("emptyState");

  function filtered() {
    var q = state.query.trim().toLowerCase();
    return campaigns.filter(function (c) {
      if (state.filter !== "all" && c.status !== state.filter) return false;
      if (q && c.name.toLowerCase().indexOf(q) === -1 && c.story.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function statusLabel(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function cardHTML(c) {
    var p = pct(c);
    var over = c.raised >= c.goal && c.goal > 0;
    return '<article class="ccard' + (over ? " over" : "") + '" data-id="' + c.id + '">' +
      '<div class="ccard-photo" style="background:' + GRADS[c.g % GRADS.length] + '">' +
        '<span class="cap">' + esc(c.cap) + '</span>' +
      '</div>' +
      '<div class="ccard-body">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">' +
          '<h3>' + esc(c.name) + '</h3>' +
          '<span class="status ' + c.status + '">' + statusLabel(c.status) + '</span>' +
        '</div>' +
        '<p class="story">' + esc(c.story) + '</p>' +
        '<div class="prog">' +
          '<div class="prog-bar"><div class="prog-fill" style="width:' + Math.min(p, 100) + '%"></div></div>' +
          '<div class="prog-meta">' +
            '<span><span class="raised">' + money(c.raised) + '</span> <span class="goal">/ ' + money(c.goal) + '</span></span>' +
            '<span class="prog-pct">' + p + '%' + (over ? " 🎉" : "") + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ccard-foot">' +
          '<span class="dates">📅 ' + fmtRange(c) + '</span>' +
          '<div class="card-actions">' +
            '<button class="mini toggle" data-act="toggle">' + (c.status === "active" ? "Pause" : "Activate") + '</button>' +
            '<button class="mini" data-act="edit">Edit</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function rowHTML(c) {
    var p = pct(c);
    return '<tr data-id="' + c.id + '">' +
      '<td class="t-name">' + esc(c.name) + '</td>' +
      '<td><span class="status ' + c.status + '">' + statusLabel(c.status) + '</span></td>' +
      '<td class="t-prog"><div class="prog-bar"><div class="prog-fill" style="width:' + Math.min(p, 100) + '%"></div></div><small>' + p + '% funded</small></td>' +
      '<td class="num">' + money(c.goal) + '</td>' +
      '<td class="num"><strong>' + money(c.raised) + '</strong></td>' +
      '<td>' + fmtRange(c) + '</td>' +
      '<td class="t-actions">' +
        '<button class="mini toggle" data-act="toggle">' + (c.status === "active" ? "Pause" : "Activate") + '</button> ' +
        '<button class="mini" data-act="edit">Edit</button>' +
      '</td>' +
    '</tr>';
  }

  function render() {
    var list = filtered();
    // counts (ignore search, only status buckets)
    var byStatus = { all: campaigns.length, active: 0, draft: 0, paused: 0, ended: 0 };
    campaigns.forEach(function (c) { byStatus[c.status]++; });
    Object.keys(byStatus).forEach(function (k) {
      var el = document.querySelector('[data-count="' + k + '"]');
      if (el) el.textContent = byStatus[k];
    });

    if (state.view === "cards") {
      cardGrid.hidden = false; tableWrap.hidden = true;
      cardGrid.innerHTML = list.map(cardHTML).join("");
    } else {
      cardGrid.hidden = true; tableWrap.hidden = false;
      tableBody.innerHTML = list.map(rowHTML).join("");
    }
    emptyState.hidden = list.length > 0;

    // animate progress fills from 0
    requestAnimationFrame(function () {
      document.querySelectorAll(".prog-fill").forEach(function (f) {
        var w = f.style.width; f.style.width = "0"; void f.offsetWidth; f.style.width = w;
      });
    });

    updatePurse();
  }

  function updatePurse() {
    var total = campaigns.reduce(function (s, c) {
      return s + (c.status === "active" || c.status === "ended" ? c.raised : 0);
    }, 0);
    var el = document.getElementById("purseTotal");
    countUp(el, total);
  }

  function countUp(el, target) {
    var start = parseInt((el.textContent || "0").replace(/[^0-9]/g, ""), 10) || 0;
    var t0 = performance.now(), dur = 600;
    function step(now) {
      var k = Math.min((now - t0) / dur, 1);
      var v = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      el.textContent = money(v);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Filters / search / view ---------- */
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("active"); chip.setAttribute("aria-selected", "true");
      state.filter = chip.dataset.filter;
      render();
    });
  });

  document.getElementById("searchInput").addEventListener("input", function (e) {
    state.query = e.target.value; render();
  });

  document.querySelectorAll(".vt").forEach(function (vt) {
    vt.addEventListener("click", function () {
      document.querySelectorAll(".vt").forEach(function (v) { v.classList.remove("active"); v.setAttribute("aria-pressed", "false"); });
      vt.classList.add("active"); vt.setAttribute("aria-pressed", "true");
      state.view = vt.dataset.view; render();
    });
  });

  /* ---------- Card / row actions (delegated) ---------- */
  function onAction(e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var host = btn.closest("[data-id]");
    if (!host) return;
    var c = campaigns.find(function (x) { return x.id === host.dataset.id; });
    if (!c) return;
    if (btn.dataset.act === "toggle") toggleStatus(c);
    else if (btn.dataset.act === "edit") openDrawer(c);
  }
  cardGrid.addEventListener("click", onAction);
  tableBody.addEventListener("click", onAction);

  function toggleStatus(c) {
    if (c.status === "active") { c.status = "paused"; toast(c.name.split(":")[0].trim() + " paused", "warn"); }
    else { c.status = "active"; toast(c.name.split(":")[0].trim() + " is now active"); }
    render();
  }

  /* ---------- Drawer ---------- */
  var scrim = document.getElementById("scrim");
  var drawer = document.getElementById("drawer");
  var form = document.getElementById("campaignForm");
  var tierList = document.getElementById("tierList");
  var lastFocus = null;

  function tierRow(amt, label) {
    var row = document.createElement("div");
    row.className = "tier-row";
    row.innerHTML =
      '<input type="number" min="1" step="1" placeholder="$" value="' + (amt != null ? amt : "") + '" aria-label="Tier amount" />' +
      '<input type="text" placeholder="What it funds" value="' + esc(label || "") + '" aria-label="Tier label" />' +
      '<button type="button" class="tier-del" aria-label="Remove tier">✕</button>';
    row.querySelector(".tier-del").addEventListener("click", function () { row.remove(); });
    return row;
  }

  document.getElementById("addTier").addEventListener("click", function () {
    tierList.appendChild(tierRow("", ""));
  });

  function openDrawer(c) {
    lastFocus = document.activeElement;
    state.editingId = c ? c.id : null;
    document.getElementById("drawerTitle").textContent = c ? "Edit campaign" : "New campaign";
    form.name.value = c ? c.name : "";
    form.story.value = c ? c.story : "";
    form.goal.value = c ? c.goal : "";
    form.raised.value = c ? c.raised : "";
    form.start.value = c ? c.start : "";
    form.end.value = c ? c.end : "";
    form.status.value = c ? c.status : "draft";
    tierList.innerHTML = "";
    var tiers = c && c.tiers ? c.tiers : [{ amt: 25, label: "" }, { amt: 100, label: "" }];
    tiers.forEach(function (t) { tierList.appendChild(tierRow(t.amt, t.label)); });

    scrim.hidden = false; drawer.hidden = false;
    setTimeout(function () { form.name.focus(); }, 60);
    document.addEventListener("keydown", onEsc);
  }

  function closeDrawer() {
    scrim.hidden = true; drawer.hidden = true;
    document.removeEventListener("keydown", onEsc);
    if (lastFocus) lastFocus.focus();
  }
  function onEsc(e) { if (e.key === "Escape") closeDrawer(); }

  document.getElementById("newBtn").addEventListener("click", function () { openDrawer(null); });
  document.getElementById("closeDrawer").addEventListener("click", closeDrawer);
  document.getElementById("cancelBtn").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var tiers = [];
    tierList.querySelectorAll(".tier-row").forEach(function (r) {
      var ins = r.querySelectorAll("input");
      var amt = parseFloat(ins[0].value);
      if (!isNaN(amt) && amt > 0) tiers.push({ amt: amt, label: ins[1].value.trim() });
    });
    var data = {
      name: form.name.value.trim(),
      story: form.story.value.trim() || "A new campaign for our community.",
      goal: Math.max(parseFloat(form.goal.value) || 0, 0),
      raised: Math.max(parseFloat(form.raised.value) || 0, 0),
      start: form.start.value, end: form.end.value,
      status: form.status.value, tiers: tiers
    };

    if (state.editingId) {
      var c = campaigns.find(function (x) { return x.id === state.editingId; });
      Object.assign(c, data);
      toast("Campaign updated");
    } else {
      data.id = id();
      data.cap = "New campaign · " + new Date().getFullYear();
      data.g = campaigns.length;
      campaigns.unshift(data);
      toast("Campaign created");
    }
    closeDrawer();
    render();
  });

  /* ---------- Go ---------- */
  render();
})();
