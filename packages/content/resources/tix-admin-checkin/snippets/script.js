(function () {
  "use strict";

  // ---- Fictional ticket holders ----------------------------------------
  var TIERS = {
    GA: { label: "General Admission", color: "var(--tier-ga)" },
    VIP: { label: "VIP Pit", color: "var(--tier-vip)" },
    BACK: { label: "Backstage", color: "var(--tier-back)" },
    PRESS: { label: "Press", color: "var(--tier-press)" },
  };

  var GUESTS = [
    { code: "NP-7K2Q", name: "Mara Velez", tier: "VIP", seat: "Pit A · Row 2" },
    { code: "NP-3H8R", name: "Desmond Okafor", tier: "GA", seat: "Floor · GA" },
    { code: "NP-9F4T", name: "Yuki Tanabe", tier: "BACK", seat: "Backstage · West" },
    { code: "NP-2C6L", name: "Priya Nadkarni", tier: "GA", seat: "Floor · GA" },
    { code: "NP-5M1W", name: "Leo Marchetti", tier: "PRESS", seat: "Press Box · 4" },
    { code: "NP-8B0X", name: "Aisha Rahman", tier: "VIP", seat: "Pit B · Row 1" },
    { code: "NP-4D7N", name: "Connor Walsh", tier: "GA", seat: "Floor · GA" },
    { code: "NP-6J3K", name: "Sofia Reyes", tier: "BACK", seat: "Backstage · East" },
    { code: "NP-1G5P", name: "Theo Lindqvist", tier: "GA", seat: "Floor · GA" },
    { code: "NP-0R9V", name: "Nadia Haddad", tier: "VIP", seat: "Pit A · Row 5" },
  ];
  // track who has already been admitted
  var admitted = {};

  // ---- DOM refs --------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  var viewport = $("viewport");
  var viewportHint = $("viewportHint");
  var resultEl = $("result");
  var resultEmpty = $("resultEmpty");
  var resultBody = $("resultBody");
  var refs = {
    badge: $("resultBadge"),
    initials: $("resultInitials"),
    name: $("resultName"),
    tier: $("resultTier"),
    tierDot: $("resultTierDot"),
    code: $("resultCode"),
    seat: $("resultSeat"),
    status: $("resultStatus"),
    note: $("resultNote"),
    override: $("overrideBtn"),
  };
  var simBtn = $("simScan");
  var recentList = $("recentList");
  var lookupForm = $("lookupForm");
  var lookupInput = $("lookupInput");
  var lookupResults = $("lookupResults");

  var statCountIn = $("countIn");
  var statBar = $("bar");
  var statPct = $("pct");
  var statRate = $("rate");
  var statRejected = $("rejected");
  var statElapsed = $("elapsed");
  var clockEl = $("clock");

  var CAP = 2400;
  var checkedIn = 1486; // doors already open a while
  var rejected = 7;
  var scanTimes = []; // timestamps of valid scans, for rate
  var doorsOpened = Date.now() - 71 * 60 * 1000; // ~71 min ago
  var scanning = false;
  var pendingOverride = null;

  // seed the rate so it isn't 0 at load
  (function seedRate() {
    var now = Date.now();
    for (var i = 0; i < 24; i++) scanTimes.push(now - Math.random() * 60000);
  })();

  // ---- Helpers ---------------------------------------------------------
  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function fmtTime(d) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function toast(msg, kind) {
    var wrap = $("toastWrap");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
  }

  // ---- Stats render ----------------------------------------------------
  function renderStats() {
    statCountIn.textContent = checkedIn.toLocaleString();
    var pct = Math.min(100, Math.round((checkedIn / CAP) * 100));
    statBar.style.width = pct + "%";
    statPct.textContent = pct + "% of capacity";
    statRejected.textContent = rejected;

    // scan rate = valid scans in last 60s
    var cut = Date.now() - 60000;
    scanTimes = scanTimes.filter(function (t) { return t >= cut; });
    statRate.textContent = scanTimes.length;

    var mins = Math.floor((Date.now() - doorsOpened) / 60000);
    statElapsed.textContent = mins >= 60 ? Math.floor(mins / 60) + "h " + (mins % 60) + "m" : mins + "m";
  }

  // ---- Result card -----------------------------------------------------
  function showResult(guest, state, note) {
    resultEmpty.hidden = true;
    resultBody.hidden = false;
    resultEl.setAttribute("data-state", state);

    var t = TIERS[guest.tier];
    refs.badge.textContent = state === "valid" ? "VALID" : state === "used" ? "ALREADY USED" : "INVALID";
    refs.initials.textContent = initials(guest.name);
    refs.name.textContent = guest.name;
    refs.tier.textContent = t.label;
    refs.tierDot.style.background = t.color;
    refs.code.textContent = guest.code;
    refs.seat.textContent = guest.seat;
    refs.status.textContent = state === "valid" ? "Admitted" : state === "used" ? "Re-scan" : "Denied";
    refs.note.textContent = note || "";
    refs.note.hidden = !note;

    // override only for "used" tickets
    refs.override.hidden = state !== "used";
    pendingOverride = state === "used" ? guest : null;
  }

  function pushRecent(guest, state) {
    var empty = recentList.querySelector(".recent__empty");
    if (empty) empty.remove();

    var li = document.createElement("li");
    li.className = "recent__item";
    var glyph = state === "valid" ? "✓" : state === "used" ? "⟳" : "✕";
    li.innerHTML =
      '<span class="recent__icon recent__icon--' + state + '">' + glyph + "</span>" +
      '<div><div class="recent__name">' + guest.name + "</div>" +
      '<div class="recent__sub">' + guest.code + " · " + TIERS[guest.tier].label + "</div></div>" +
      '<span class="recent__time">' + fmtTime(new Date()) + "</span>";
    recentList.insertBefore(li, recentList.firstChild);

    while (recentList.children.length > 7) recentList.removeChild(recentList.lastChild);
  }

  // ---- Process a scan --------------------------------------------------
  function processGuest(guest, forced) {
    var state, note;
    if (forced === "invalid") {
      // synthesize a junk ticket
      guest = { code: "??-" + Math.random().toString(36).slice(2, 6).toUpperCase(), name: "Unknown pass", tier: "GA", seat: "—" };
      state = "invalid";
      note = "No matching ticket for this code. Direct guest to the box office.";
    } else if (forced === "used" || admitted[guest.code]) {
      state = "used";
      note = "This ticket was already scanned at " + (admitted[guest.code] || fmtTime(new Date())) + ". Verify ID before re-admitting.";
    } else {
      state = "valid";
      note = TIERS[guest.tier].label + " access granted. Enjoy the show!";
    }

    if (state === "valid") {
      admitted[guest.code] = fmtTime(new Date());
      checkedIn = Math.min(CAP, checkedIn + 1);
      scanTimes.push(Date.now());
      toast(guest.name + " checked in", "ok");
    } else if (state === "used") {
      toast("Duplicate scan — " + guest.code, "warn");
    } else {
      rejected += 1;
      toast("Invalid ticket rejected", "bad");
    }

    showResult(guest, state, note);
    pushRecent(guest, state);
    renderStats();

    viewport.setAttribute("data-state", state);
    viewportHint.textContent = state === "valid" ? "Admitted" : state === "used" ? "Already used" : "Rejected";
    setTimeout(function () {
      if (!scanning) {
        viewport.setAttribute("data-state", "idle");
        viewportHint.textContent = "Camera ready";
      }
    }, 1400);
  }

  function runScan(forced) {
    if (scanning) return;
    scanning = true;
    simBtn.disabled = true;
    viewport.setAttribute("data-state", "scanning");
    viewportHint.textContent = "Scanning…";

    setTimeout(function () {
      scanning = false;
      simBtn.disabled = false;
      var guest;
      if (forced === "invalid") {
        guest = null;
      } else if (forced === "used") {
        // pick someone already admitted, else mark a fresh one as used
        var usedCodes = Object.keys(admitted);
        if (usedCodes.length) {
          guest = GUESTS.filter(function (g) { return admitted[g.code]; })[0] || GUESTS[0];
        } else {
          guest = GUESTS[Math.floor(Math.random() * GUESTS.length)];
          admitted[guest.code] = fmtTime(new Date(Date.now() - 120000));
        }
      } else {
        guest = GUESTS[Math.floor(Math.random() * GUESTS.length)];
      }
      processGuest(guest || {}, forced);
    }, 850);
  }

  // ---- Events ----------------------------------------------------------
  simBtn.addEventListener("click", function () { runScan(null); });

  document.querySelectorAll("[data-force]").forEach(function (btn) {
    btn.addEventListener("click", function () { runScan(btn.getAttribute("data-force")); });
  });

  refs.override.addEventListener("click", function () {
    if (!pendingOverride) return;
    checkedIn = Math.min(CAP, checkedIn + 1);
    scanTimes.push(Date.now());
    showResult(pendingOverride, "valid", "Manually overridden by door staff. Admitted.");
    pushRecent(pendingOverride, "valid");
    toast("Override — " + pendingOverride.name + " admitted", "ok");
    renderStats();
  });

  // Manual lookup
  function renderLookup(q) {
    lookupResults.innerHTML = "";
    q = q.trim().toLowerCase();
    if (!q) return;

    var matches = GUESTS.filter(function (g) {
      return g.name.toLowerCase().indexOf(q) !== -1 || g.code.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 5);

    if (!matches.length) {
      var none = document.createElement("p");
      none.className = "lookup__none";
      none.textContent = 'No guests match "' + q + '".';
      lookupResults.appendChild(none);
      return;
    }

    matches.forEach(function (g) {
      var li = document.createElement("li");
      var inside = !!admitted[g.code];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lookup__row";
      btn.innerHTML =
        '<span class="tier-dot" style="background:' + TIERS[g.tier].color + '"></span>' +
        "<span><b>" + g.name + "</b><small>" + g.code + " · " + g.seat + "</small></span>" +
        '<span class="mini-badge ' + (inside ? "mini-badge--in" : "mini-badge--out") + '">' +
        (inside ? "Inside" : "Not in") + "</span>";
      btn.addEventListener("click", function () { directScan(g); });
      li.appendChild(btn);
      lookupResults.appendChild(li);
    });
  }

  // lookup picks a specific guest (bypass random)
  function directScan(guest) {
    if (scanning) return;
    scanning = true;
    simBtn.disabled = true;
    viewport.setAttribute("data-state", "scanning");
    viewportHint.textContent = "Looking up…";
    setTimeout(function () {
      scanning = false;
      simBtn.disabled = false;
      processGuest(guest, null);
    }, 700);
  }

  lookupInput.addEventListener("input", function () { renderLookup(lookupInput.value); });
  lookupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = lookupResults.querySelector(".lookup__row");
    if (first) first.click();
  });

  $("clearRecent").addEventListener("click", function () {
    recentList.innerHTML = '<li class="recent__empty">No scans yet.</li>';
    toast("Recent scans cleared");
  });

  // Clock
  function tick() {
    clockEl.textContent = fmtTime(new Date());
    renderStats();
  }
  tick();
  setInterval(tick, 1000);

  renderStats();
})();
