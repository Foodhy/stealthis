(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var TEAM_LABELS = {
    luxury: "Luxury",
    residential: "Residential",
    commercial: "Commercial",
    rentals: "Rentals"
  };

  // Warm, architectural "photography" simulated with gradients.
  var COVERS = [
    "linear-gradient(135deg, #2c4a3e 0%, #4a6b58 45%, #b08d57 110%)",
    "linear-gradient(135deg, #7a5a36 0%, #b08d57 50%, #e8d3a8 105%)",
    "linear-gradient(120deg, #1f3d34 0%, #2f5a4a 55%, #8fae9a 110%)",
    "linear-gradient(140deg, #5b4327 0%, #94733f 50%, #d8b483 110%)",
    "linear-gradient(130deg, #26493e 0%, #6b8f7c 60%, #c8a36a 115%)",
    "linear-gradient(135deg, #3a3a2e 0%, #6b6a4a 50%, #b08d57 110%)",
    "linear-gradient(125deg, #1c3a31 0%, #486b5c 55%, #a8c0ad 110%)",
    "linear-gradient(140deg, #6a4a2c 0%, #a3814d 50%, #ead2a8 110%)"
  ];

  var AGENTS = [
    { name: "Eleanor Whitfield", role: "Senior Broker", team: "luxury", listings: 14, volume: 48.2, status: "active", region: "Marin Heights" },
    { name: "Diego Salazar", role: "Listing Agent", team: "residential", listings: 11, volume: 22.9, status: "active", region: "Cedar Park" },
    { name: "Priya Ramanathan", role: "Team Lead", team: "commercial", listings: 9, volume: 61.4, status: "active", region: "Harbor District" },
    { name: "Marcus Bélanger", role: "Sales Associate", team: "rentals", listings: 18, volume: 7.3, status: "active", region: "Old Mill Quarter" },
    { name: "Sofia Castellano", role: "Listing Agent", team: "luxury", listings: 8, volume: 39.6, status: "active", region: "Vale Ridge" },
    { name: "Theo Nakamura", role: "Sales Associate", team: "residential", listings: 13, volume: 18.1, status: "inactive", region: "Birchwood" },
    { name: "Amara Okafor", role: "Senior Broker", team: "commercial", listings: 6, volume: 14.7, status: "active", region: "Foundry Row" },
    { name: "Lucas Hartmann", role: "Listing Agent", team: "rentals", listings: 7, volume: 2.4, status: "inactive", region: "Greenfield" }
  ];

  var BRASS_TONES = ["#b08d57", "#26493e", "#94733f", "#2f5a4a", "#6b8f7c", "#5b4327", "#1f3d34", "#a3814d"];

  /* ---------- State ---------- */
  var state = { search: "", team: "all", status: "all" };

  /* ---------- Helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function money(m) {
    return "$" + (m >= 1 ? m.toFixed(1) + "M" : (m * 1000).toFixed(0) + "K");
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 280);
    }, 2600);
  }

  /* ---------- Render ---------- */
  var roster = $("#roster");
  var emptyEl = $("#empty");

  function filtered() {
    var q = state.search.trim().toLowerCase();
    return AGENTS.filter(function (a) {
      if (state.team !== "all" && a.team !== state.team) return false;
      if (state.status !== "all" && a.status !== state.status) return false;
      if (q) {
        var hay = (a.name + " " + a.role + " " + TEAM_LABELS[a.team] + " " + a.region + " " + a.status).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function statusBadge(s) {
    var label = s === "active" ? "Active" : s === "pending" ? "Pending" : "Inactive";
    return '<span class="badge badge--status badge--' + s + '">' + label + "</span>";
  }

  function cardHTML(a, i) {
    var tone = BRASS_TONES[i % BRASS_TONES.length];
    var cover = COVERS[i % COVERS.length];
    return (
      '<article class="card" data-name="' + esc(a.name) + '">' +
        '<div class="card__cover" style="background-image:' + cover + '">' +
          '<span class="cover-label">' + esc(a.region) + "</span>" +
          '<div class="card__avatar" style="background:linear-gradient(150deg,' + tone + ',rgba(0,0,0,.35))">' + initials(a.name) + "</div>" +
        "</div>" +
        '<div class="card__body">' +
          '<h3 class="card__name">' + esc(a.name) + "</h3>" +
          '<p class="card__role">' + esc(a.role) + '<span class="dot">&bull;</span>' + TEAM_LABELS[a.team] + "</p>" +
          '<div class="card__badges">' +
            '<span class="badge badge--team">' + TEAM_LABELS[a.team] + "</span>" +
            statusBadge(a.status) +
          "</div>" +
          '<div class="metrics">' +
            '<div class="metric"><div class="metric__k">Active listings</div><div class="metric__v">' + a.listings + "</div></div>" +
            '<div class="metric"><div class="metric__k">YTD volume</div><div class="metric__v">' + money(a.volume) + "</div></div>" +
          "</div>" +
        "</div>" +
        '<div class="card__foot">' +
          '<button class="act" data-act="profile">View profile</button>' +
          '<button class="act" data-act="message">Message</button>' +
          '<button class="act act--icon" data-act="more" aria-label="More actions">&#8943;</button>' +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var list = filtered();
    if (!list.length) {
      roster.innerHTML = "";
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      roster.innerHTML = list.map(cardHTML).join("");
    }
    updateStats();
  }

  function updateStats() {
    var live = AGENTS.filter(function (a) { return a.status === "active"; });
    var listings = AGENTS.reduce(function (s, a) { return s + a.listings; }, 0);
    var vol = AGENTS.reduce(function (s, a) { return s + a.volume; }, 0);
    $("#statAgents").textContent = AGENTS.length;
    $("#statListings").textContent = listings;
    $("#statVolume").textContent = "$" + vol.toFixed(1) + "M";
    void live;
  }

  /* ---------- Filter wiring ---------- */
  $("#search").addEventListener("input", function (e) {
    state.search = e.target.value;
    render();
  });

  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      state.team = chip.dataset.team;
      render();
    });
  });

  $$(".seg").forEach(function (seg) {
    seg.addEventListener("click", function () {
      $$(".seg").forEach(function (s) {
        s.classList.remove("is-active");
        s.setAttribute("aria-pressed", "false");
      });
      seg.classList.add("is-active");
      seg.setAttribute("aria-pressed", "true");
      state.status = seg.dataset.status;
      render();
    });
  });

  $("#clearAll").addEventListener("click", function () {
    state.search = "";
    state.team = "all";
    state.status = "all";
    $("#search").value = "";
    $$(".chip").forEach(function (c) {
      var on = c.dataset.team === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    $$(".seg").forEach(function (s) {
      var on = s.dataset.status === "all";
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-pressed", String(on));
    });
    render();
  });

  /* ---------- Per-row actions (delegated) ---------- */
  roster.addEventListener("click", function (e) {
    var btn = e.target.closest(".act");
    if (!btn) return;
    var card = e.target.closest(".card");
    var name = card ? card.dataset.name : "Agent";
    var act = btn.dataset.act;
    if (act === "profile") toast("Opening profile — " + name);
    else if (act === "message") toast("Message draft started for " + name);
    else if (act === "more") toast("Reassign · Deactivate · Export — " + name);
  });

  /* ---------- Modal ---------- */
  var modal = $("#inviteModal");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { $("#fName").focus(); }, 30);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    $("#inviteForm").reset();
    $$(".invalid", modal).forEach(function (el) { el.classList.remove("invalid"); });
    if (lastFocus) lastFocus.focus();
  }

  $("#inviteOpen").addEventListener("click", openModal);
  $$("[data-close]", modal).forEach(function (el) { el.addEventListener("click", closeModal); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  $("#inviteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = $("#fName");
    var emailEl = $("#fEmail");
    var ok = true;
    [nameEl, emailEl].forEach(function (el) {
      var bad = !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { toast("Please complete the highlighted fields."); return; }

    var name = nameEl.value.trim();
    var team = $("#fTeam").value;
    AGENTS.unshift({
      name: name,
      role: $("#fRole").value,
      team: team,
      listings: 0,
      volume: 0,
      status: "pending",
      region: "Awaiting desk"
    });
    closeModal();
    state.search = ""; state.team = "all"; state.status = "all";
    $("#search").value = "";
    $$(".chip").forEach(function (c) {
      var on = c.dataset.team === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    $$(".seg").forEach(function (s) {
      var on = s.dataset.status === "all";
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-pressed", String(on));
    });
    render();
    toast("Invitation sent to " + name + " · " + TEAM_LABELS[team]);
  });

  /* ---------- Boot ---------- */
  render();
})();
