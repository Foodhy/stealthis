/* Ironworks Performance — Equipment Status board (vanilla JS) */
(function () {
  "use strict";

  var STATUS = { FREE: "free", INUSE: "inuse", OOS: "oos" };
  var LABEL = { free: "Free", inuse: "In use", oos: "Out of order" };

  // Equipment grouped by category. inUse holds elapsed minutes; eta holds total session minutes.
  var equipment = [
    { id: "tm-1", group: "Treadmills", name: "Treadmill 01", sub: "Woodway Curve", status: STATUS.INUSE, by: "M. Okafor", elapsed: 14, total: 30 },
    { id: "tm-2", group: "Treadmills", name: "Treadmill 02", sub: "Technogym Skillrun", status: STATUS.FREE },
    { id: "tm-3", group: "Treadmills", name: "Treadmill 03", sub: "Technogym Skillrun", status: STATUS.INUSE, by: "Priya N.", elapsed: 22, total: 25 },
    { id: "tm-4", group: "Treadmills", name: "Treadmill 04", sub: "Woodway 4Front", status: STATUS.OOS, reason: "Belt slipping" },

    { id: "sq-1", group: "Squat Racks", name: "Rack A", sub: "Power rack — platform", status: STATUS.INUSE, by: "Diego R.", elapsed: 9, total: 35 },
    { id: "sq-2", group: "Squat Racks", name: "Rack B", sub: "Power rack — platform", status: STATUS.FREE },
    { id: "sq-3", group: "Squat Racks", name: "Rack C", sub: "Half rack", status: STATUS.FREE },
    { id: "sq-4", group: "Squat Racks", name: "Rack D", sub: "Combo rack", status: STATUS.INUSE, by: "Coach Lena", elapsed: 41, total: 45 },

    { id: "bn-1", group: "Benches", name: "Flat Bench 1", sub: "Olympic flat", status: STATUS.FREE },
    { id: "bn-2", group: "Benches", name: "Incline Bench 1", sub: "Adjustable", status: STATUS.INUSE, by: "T. Alvarez", elapsed: 6, total: 20 },
    { id: "bn-3", group: "Benches", name: "Decline Bench 1", sub: "Olympic decline", status: STATUS.FREE },
    { id: "bn-4", group: "Benches", name: "Flat Bench 2", sub: "Olympic flat", status: STATUS.OOS, reason: "Loose / unsafe" },

    { id: "rw-1", group: "Rowers", name: "Rower 01", sub: "Concept2 RowErg", status: STATUS.INUSE, by: "Sam W.", elapsed: 3, total: 15 },
    { id: "rw-2", group: "Rowers", name: "Rower 02", sub: "Concept2 RowErg", status: STATUS.FREE },
    { id: "rw-3", group: "Rowers", name: "Rower 03", sub: "Concept2 RowErg", status: STATUS.INUSE, by: "Hana K.", elapsed: 18, total: 20 },

    { id: "cb-1", group: "Cable Machines", name: "Dual Cable 1", sub: "Functional trainer", status: STATUS.FREE },
    { id: "cb-2", group: "Cable Machines", name: "Lat Pulldown", sub: "Selectorized", status: STATUS.INUSE, by: "Marco V.", elapsed: 11, total: 18 },
    { id: "cb-3", group: "Cable Machines", name: "Cable Crossover", sub: "Functional trainer", status: STATUS.FREE },
    { id: "cb-4", group: "Cable Machines", name: "Seated Row", sub: "Selectorized", status: STATUS.OOS, reason: "Display not working" }
  ];

  var GROUP_ORDER = ["Treadmills", "Squat Racks", "Benches", "Rowers", "Cable Machines"];
  var FIRST_NAMES = ["Aria", "Noah", "Zoe", "Liam", "Mei", "Carlos", "Ines", "Jay", "Tara", "Omar", "Nia", "Ben"];

  var state = { filter: "all", query: "" };

  var board = document.getElementById("board");
  var emptyEl = document.getElementById("empty");
  var searchEl = document.getElementById("search");
  var toastWrap = document.getElementById("toasts");

  // ---------- helpers ----------
  function byId(id) { return equipment.filter(function (e) { return e.id === id; })[0]; }

  function randomName() {
    var f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    return f + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".";
  }

  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .25s ease, transform .25s ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 260);
    }, 3200);
  }

  function matches(item) {
    if (state.filter !== "all" && item.status !== state.filter) return false;
    if (state.query) {
      var q = state.query.toLowerCase();
      var hay = (item.name + " " + item.sub + " " + item.group + " " + (item.by || "") + " " + (item.reason || "")).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  // ---------- rendering ----------
  function updateSummary() {
    var c = { all: equipment.length, free: 0, inuse: 0, oos: 0 };
    equipment.forEach(function (e) { c[e.status]++; });
    document.getElementById("count-all").textContent = c.all;
    document.getElementById("count-free").textContent = c.free;
    document.getElementById("count-inuse").textContent = c.inuse;
    document.getElementById("count-oos").textContent = c.oos;
  }

  function cardHTML(item) {
    var meta = "";
    if (item.status === STATUS.FREE) {
      meta = '<div class="card-meta">Available now — last cleaned <strong>recently</strong></div>';
    } else if (item.status === STATUS.INUSE) {
      var remaining = Math.max(0, item.total - item.elapsed);
      var pct = Math.min(100, Math.round((item.elapsed / item.total) * 100));
      meta =
        '<div class="card-meta">In use by <strong>' + item.by + "</strong> · " + item.elapsed + " min</div>" +
        '<div class="eta">' +
          '<div class="eta-track"><div class="eta-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="eta-label"><span>Session</span><span>~' + remaining + " min left</span></div>" +
        "</div>";
    } else {
      meta = '<div class="card-meta"><span class="oos-reason">' + item.reason + "</span> · reported</div>";
    }

    var foot;
    if (item.status === STATUS.OOS) {
      foot = '<button class="btn fix" data-act="fix" data-id="' + item.id + '">Mark fixed</button>';
    } else {
      foot = '<button class="btn report" data-act="report" data-id="' + item.id + '">Report issue</button>';
    }

    return (
      '<article class="card ' + item.status + '">' +
        '<div class="card-head">' +
          "<div><div class=\"card-name\">" + item.name + "</div><div class=\"card-sub\">" + item.sub + "</div></div>" +
          '<span class="pill ' + item.status + '">' + LABEL[item.status] + "</span>" +
        "</div>" +
        meta +
        '<div class="card-foot">' + foot + "</div>" +
      "</article>"
    );
  }

  function render() {
    var visible = equipment.filter(matches);
    board.innerHTML = "";

    if (!visible.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    GROUP_ORDER.forEach(function (group) {
      var items = visible.filter(function (e) { return e.group === group; });
      if (!items.length) return;

      var section = document.createElement("section");
      var total = equipment.filter(function (e) { return e.group === group; }).length;

      var head = document.createElement("h2");
      head.className = "group-title";
      head.innerHTML = group + ' <span class="group-count">' + items.length + " / " + total + " shown</span>";
      section.appendChild(head);

      var grid = document.createElement("div");
      grid.className = "group-grid";
      grid.innerHTML = items.map(cardHTML).join("");
      section.appendChild(grid);

      board.appendChild(section);
    });
  }

  // ---------- modal (report issue) ----------
  var modal = document.getElementById("modal");
  var modalSub = document.getElementById("modal-sub");
  var reasonEl = document.getElementById("reason");
  var notesEl = document.getElementById("notes");
  var pendingId = null;
  var lastFocused = null;

  function openModal(id) {
    pendingId = id;
    var item = byId(id);
    modalSub.textContent = "Mark " + item.name + " (" + item.sub + ") out of order so members and staff are warned.";
    notesEl.value = "";
    reasonEl.selectedIndex = 0;
    lastFocused = document.activeElement;
    modal.hidden = false;
    reasonEl.focus();
    document.addEventListener("keydown", onKey);
  }

  function closeModal() {
    modal.hidden = true;
    pendingId = null;
    document.removeEventListener("keydown", onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) { if (e.key === "Escape") closeModal(); }

  document.getElementById("cancel").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

  document.getElementById("confirm").addEventListener("click", function () {
    if (!pendingId) return;
    var item = byId(pendingId);
    var reason = reasonEl.value;
    if (notesEl.value.trim()) reason += " — " + notesEl.value.trim();
    item.status = STATUS.OOS;
    item.reason = reason;
    delete item.by; delete item.elapsed; delete item.total;
    closeModal();
    updateSummary();
    render();
    toast(item.name + " marked out of order", "warn");
  });

  // ---------- board interactions ----------
  board.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var act = btn.getAttribute("data-act");
    if (act === "report") {
      openModal(id);
    } else if (act === "fix") {
      var item = byId(id);
      item.status = STATUS.FREE;
      delete item.reason;
      updateSummary();
      render();
      toast(item.name + " is back in service", "ok");
    }
  });

  // ---------- filters & search ----------
  function setFilter(f) {
    state.filter = f;
    document.querySelectorAll(".chip").forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-filter") === f);
    });
    document.querySelectorAll(".stat").forEach(function (s) {
      s.setAttribute("aria-pressed", String(s.getAttribute("data-filter") === f));
    });
    render();
  }

  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { setFilter(c.getAttribute("data-filter")); });
  });
  document.querySelectorAll(".stat").forEach(function (s) {
    s.addEventListener("click", function () { setFilter(s.getAttribute("data-filter")); });
  });

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value.trim();
    render();
  });

  // ---------- clock ----------
  function tickClock() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, "0");
    var m = String(d.getMinutes()).padStart(2, "0");
    document.getElementById("clock").textContent = h + ":" + m;
  }
  tickClock();
  setInterval(tickClock, 30000);

  // ---------- live-ish updates ----------
  // Advance in-use sessions; occasionally free up finished units or start new sessions.
  setInterval(function () {
    var changed = false;

    equipment.forEach(function (e) {
      if (e.status === STATUS.INUSE) {
        e.elapsed += 1;
        if (e.elapsed >= e.total) {
          e.status = STATUS.FREE;
          delete e.by; delete e.elapsed; delete e.total;
          changed = true;
        }
      }
    });

    // Randomly start a session on one free unit.
    if (Math.random() < 0.6) {
      var freeUnits = equipment.filter(function (e) { return e.status === STATUS.FREE; });
      if (freeUnits.length) {
        var u = freeUnits[Math.floor(Math.random() * freeUnits.length)];
        u.status = STATUS.INUSE;
        u.by = randomName();
        u.elapsed = 1;
        u.total = 15 + Math.floor(Math.random() * 30);
        changed = true;
      }
    }

    updateSummary();
    if (changed || modal.hidden) render();
  }, 5000);

  // ---------- init ----------
  updateSummary();
  render();
})();
