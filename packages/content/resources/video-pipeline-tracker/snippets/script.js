(function () {
  "use strict";

  var STAGES = [
    { id: "brief", label: "Brief", color: "#8a8a92" },
    { id: "shoot", label: "Shoot", color: "#ff4d4d" },
    { id: "edit", label: "Edit", color: "#ffb020" },
    { id: "grade", label: "Grade", color: "#7c5cff" },
    { id: "delivery", label: "Delivery", color: "#35d07f" }
  ];

  // "Today" reference so due-date logic is deterministic in the demo.
  var TODAY = new Date("2026-07-02T00:00:00");

  var PROJECTS = [
    { id: "p1", client: "Northwind EV", title: "Launch film — 60s hero cut", format: "4K ProRes", stage: "brief", due: "2026-07-18", assignee: "Mara Ito", initials: "MI", color: "#ffb020" },
    { id: "p2", client: "Solaria Coffee", title: "Spring social reel pack", format: "9:16 H.264", stage: "brief", due: "2026-07-05", assignee: "Dev Okafor", initials: "DO", color: "#35d07f" },
    { id: "p3", client: "Atlas Fitness", title: "Founder interview series", format: "1080p", stage: "shoot", due: "2026-07-01", assignee: "Lena Cruz", initials: "LC", color: "#ff4d4d" },
    { id: "p4", client: "Harbor Bank", title: "Brand anthem — location shoot", format: "6K RAW", stage: "shoot", due: "2026-07-12", assignee: "Sam Ahmadi", initials: "SA", color: "#7c5cff" },
    { id: "p5", client: "Verde Living", title: "Product spot — assembly rough", format: "4K ProRes", stage: "edit", due: "2026-07-03", assignee: "Mara Ito", initials: "MI", color: "#ffb020" },
    { id: "p6", client: "Pulse Audio", title: "Unboxing explainer v2", format: "1080p", stage: "edit", due: "2026-06-30", assignee: "Rui Tanaka", initials: "RT", color: "#ff8a3d" },
    { id: "p7", client: "Meridian Air", title: "In-flight sizzle — color pass", format: "4K DCI", stage: "grade", due: "2026-07-08", assignee: "Lena Cruz", initials: "LC", color: "#35d07f" },
    { id: "p8", client: "Kestrel Games", title: "Trailer — HDR grade", format: "4K HDR10", stage: "grade", due: "2026-07-04", assignee: "Dev Okafor", initials: "DO", color: "#7c5cff" },
    { id: "p9", client: "Bloomwell", title: "Testimonial cutdowns x3", format: "9:16 H.264", stage: "delivery", due: "2026-07-15", assignee: "Sam Ahmadi", initials: "SA", color: "#ffb020" },
    { id: "p10", client: "Orbit Retail", title: "Holiday teaser — master deliver", format: "4K ProRes", stage: "delivery", due: "2026-07-20", assignee: "Rui Tanaka", initials: "RT", color: "#35d07f" }
  ];

  var CAPACITY = 4; // used for the per-column progress bar
  var board = document.getElementById("board");
  var toastEl = document.getElementById("toast");
  var activeFilter = "all";
  var toastTimer = null;

  function stageById(id) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i];
    return STAGES[0];
  }

  function dayDiff(dueStr) {
    var d = new Date(dueStr + "T00:00:00");
    return Math.round((d - TODAY) / 86400000);
  }

  // Delivery = always shipped/on-track; otherwise derive from due date.
  function statusOf(p) {
    if (p.stage === "delivery") return "on-track";
    var diff = dayDiff(p.due);
    if (diff < 0) return "overdue";
    if (diff <= 3) return "at-risk";
    return "on-track";
  }

  function fmtDue(dueStr) {
    var d = new Date(dueStr + "T00:00:00");
    var m = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return m[d.getMonth()] + " " + String(d.getDate()).padStart(2, "0");
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  var BADGE = {
    "on-track": { cls: "badge--ok", text: "On track" },
    "at-risk": { cls: "badge--warn", text: "At risk" },
    "overdue": { cls: "badge--bad", text: "Overdue" }
  };

  function buildCard(p) {
    var status = statusOf(p);
    var badge = BADGE[status];
    var diff = dayDiff(p.due);
    var overdue = status === "overdue";

    var el = document.createElement("article");
    el.className = "card";
    el.setAttribute("draggable", "true");
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "listitem");
    el.dataset.id = p.id;
    el.dataset.status = status;
    el.setAttribute("aria-label", p.client + " — " + p.title + ", " + badge.text + ", stage " + stageById(p.stage).label);

    var dueLabel = overdue
      ? Math.abs(diff) + "d late"
      : (p.stage === "delivery" ? "delivered" : "due " + fmtDue(p.due));

    var opts = STAGES.map(function (s) {
      return '<button data-stage="' + s.id + '"' + (s.id === p.stage ? " disabled" : "") +
        '><span class="mm-dot" style="background:' + s.color + '"></span>' + s.label + "</button>";
    }).join("");

    el.innerHTML =
      '<div class="card__top">' +
        '<span class="card__client">' + p.client + "</span>" +
        '<span class="card__handle" aria-hidden="true"><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><circle cx="7" cy="5" r="1.4"/><circle cx="13" cy="5" r="1.4"/><circle cx="7" cy="10" r="1.4"/><circle cx="13" cy="10" r="1.4"/><circle cx="7" cy="15" r="1.4"/><circle cx="13" cy="15" r="1.4"/></svg></span>' +
      "</div>" +
      '<h3 class="card__title">' + p.title + "</h3>" +
      '<div class="card__tags">' +
        '<span class="tag tag--format">' + p.format + "</span>" +
      "</div>" +
      '<div class="card__meta">' +
        '<span class="badge ' + badge.cls + '"><i></i>' + badge.text + "</span>" +
        '<span class="card__due' + (overdue ? " is-overdue" : "") + '"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' + dueLabel + "</span>" +
      "</div>" +
      '<div class="card__foot">' +
        '<span class="avatar"><span class="avatar__img" style="background:' + p.color + '">' + p.initials + '</span><span class="avatar__name">' + p.assignee + "</span></span>" +
        '<span class="move-wrap">' +
          '<button class="move-btn" aria-haspopup="true" aria-expanded="false" aria-label="Move ' + p.title + ' to another stage"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
          '<div class="move-menu" role="menu">' + opts + "</div>" +
        "</span>" +
      "</div>";

    wireCard(el, p);
    return el;
  }

  function wireCard(el, p) {
    el.addEventListener("dragstart", function (e) {
      el.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", p.id);
    });
    el.addEventListener("dragend", function () { el.classList.remove("dragging"); });

    var btn = el.querySelector(".move-btn");
    var menu = el.querySelector(".move-menu");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = menu.classList.contains("is-open");
      closeAllMenus();
      if (!open) { menu.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
    });
    menu.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        if (b.disabled) return;
        moveProject(p.id, b.dataset.stage);
        closeAllMenus();
      });
    });

    // keyboard: Enter/Space opens move menu on the card
    el.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === el) {
        e.preventDefault();
        btn.click();
        var first = menu.querySelector("button:not(:disabled)");
        if (first) first.focus();
      }
    });
  }

  function closeAllMenus() {
    document.querySelectorAll(".move-menu.is-open").forEach(function (m) {
      m.classList.remove("is-open");
      var b = m.parentNode.querySelector(".move-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("click", closeAllMenus);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAllMenus(); });

  function render() {
    board.innerHTML = "";
    STAGES.forEach(function (s) {
      var col = document.createElement("section");
      col.className = "column";
      col.dataset.stage = s.id;
      col.style.setProperty("--stage", s.color);

      var head = document.createElement("div");
      head.className = "column__head";
      head.innerHTML =
        '<div class="column__title-row">' +
          '<span class="column__title"><span class="stage-dot"></span>' + s.label + "</span>" +
          '<span class="column__count">0</span>' +
        "</div>" +
        '<div class="column__bar"><span></span></div>';

      var list = document.createElement("div");
      list.className = "column__list";
      list.setAttribute("role", "list");
      list.setAttribute("aria-label", s.label + " projects");

      PROJECTS.filter(function (p) { return p.stage === s.id; })
        .forEach(function (p) { list.appendChild(buildCard(p)); });

      wireColumn(col, list, s.id);
      col.appendChild(head);
      col.appendChild(list);
      board.appendChild(col);
    });
    updateAll();
    applyFilter();
  }

  function wireColumn(col, list, stageId) {
    col.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", function (e) {
      if (!col.contains(e.relatedTarget)) col.classList.remove("drag-over");
    });
    col.addEventListener("drop", function (e) {
      e.preventDefault();
      col.classList.remove("drag-over");
      var id = e.dataTransfer.getData("text/plain");
      moveProject(id, stageId);
    });
  }

  function moveProject(id, toStage) {
    var p = null;
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) p = PROJECTS[i];
    if (!p || p.stage === toStage) return;

    var from = stageById(p.stage).label;
    p.stage = toStage;

    var card = board.querySelector('.card[data-id="' + id + '"]');
    var targetList = board.querySelector('.column[data-stage="' + toStage + '"] .column__list');
    if (card && targetList) {
      var fresh = buildCard(p); // rebuild so badge/due recompute for new stage
      card.replaceWith(fresh);
      targetList.appendChild(fresh);
    }
    updateAll();
    applyFilter();
    toast(p.client + " moved · " + from + " → " + stageById(toStage).label);
  }

  function updateAll() {
    STAGES.forEach(function (s) {
      var col = board.querySelector('.column[data-stage="' + s.id + '"]');
      var list = col.querySelector(".column__list");
      var n = list.querySelectorAll(".card").length;
      col.querySelector(".column__count").textContent = n;
      var pct = Math.min(100, Math.round((n / CAPACITY) * 100));
      col.querySelector(".column__bar > span").style.width = pct + "%";
      list.classList.toggle("is-empty", n === 0);
    });
  }

  function applyFilter() {
    var cards = board.querySelectorAll(".card");
    cards.forEach(function (c) {
      var match = activeFilter === "all" || c.dataset.status === activeFilter;
      c.classList.toggle("is-dim", !match);
    });
  }

  // Filter chips
  document.querySelector(".filters").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach(function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");
    activeFilter = chip.dataset.filter;
    applyFilter();
  });

  render();
})();
