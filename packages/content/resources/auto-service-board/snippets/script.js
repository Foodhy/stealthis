(function () {
  "use strict";

  var TECHS = ["Unassigned", "D. Marsh", "R. Okoye", "L. Vance", "T. Bauer"];

  var STATUSES = [
    { id: "waiting", label: "Waiting" },
    { id: "in-progress", label: "In Progress" },
    { id: "done", label: "Done" },
    { id: "hold", label: "On Hold" }
  ];

  var PHOTOS = [
    "linear-gradient(135deg,#3b4654,#202732)",
    "linear-gradient(135deg,#5a3a2a,#2a1d16)",
    "linear-gradient(135deg,#2a4a4a,#15282a)",
    "linear-gradient(135deg,#46324f,#241829)",
    "linear-gradient(135deg,#1f3a5f,#11202f)",
    "linear-gradient(135deg,#4a4030,#241f16)"
  ];

  var JOBS = [
    { id: "WO-4821", vehicle: "2019 Ford F-150", customer: "M. Delgado", plate: "GTR-2291", svc: "Brake pads + rotors", code: "", tech: "D. Marsh", eta: "11:40a", progress: 65, status: "in-progress", bay: "Bay 1", labor: 240, parts: 318, photo: 0 },
    { id: "WO-4822", vehicle: "2021 Honda CR-V", customer: "S. Pham", plate: "BVX-7740", svc: "Oil + tire rotation", code: "", tech: "R. Okoye", eta: "10:15a", progress: 90, status: "in-progress", bay: "Bay 2", labor: 70, parts: 54, photo: 1 },
    { id: "WO-4823", vehicle: "2017 Subaru Outback", customer: "J. Whitaker", plate: "KQM-1083", svc: "Misfire diagnostic", code: "P0301", tech: "L. Vance", eta: "12:30p", progress: 35, status: "in-progress", bay: "Bay 4", labor: 160, parts: 92, photo: 2 },
    { id: "WO-4824", vehicle: "2020 Toyota Camry", customer: "A. Rosen", plate: "WHL-5526", svc: "AC recharge + leak check", code: "", tech: "Unassigned", eta: "1:00p", progress: 0, status: "waiting", bay: "—", labor: 130, parts: 88, photo: 3 },
    { id: "WO-4825", vehicle: "2015 Jeep Wrangler", customer: "C. Nakamura", plate: "TRX-9914", svc: "Alignment + suspension", code: "C1234", tech: "Unassigned", eta: "2:15p", progress: 0, status: "waiting", bay: "—", labor: 290, parts: 165, photo: 4 },
    { id: "WO-4826", vehicle: "2018 BMW 330i", customer: "P. Okafor", plate: "DSL-4402", svc: "Coolant flush", code: "", tech: "Unassigned", eta: "3:00p", progress: 0, status: "waiting", bay: "—", labor: 95, parts: 60, photo: 5 },
    { id: "WO-4818", vehicle: "2016 Chevy Malibu", customer: "K. Bright", plate: "FNX-2210", svc: "Battery + alternator", code: "P0562", tech: "T. Bauer", eta: "—", progress: 100, status: "done", bay: "Bay 6", labor: 180, parts: 410, photo: 1 },
    { id: "WO-4819", vehicle: "2022 Tesla Model 3", customer: "D. Forsythe", plate: "EVX-0077", svc: "Tire replacement (x4)", code: "", tech: "R. Okoye", eta: "—", progress: 100, status: "done", bay: "Bay 3", labor: 110, parts: 880, photo: 2 },
    { id: "WO-4820", vehicle: "2014 Audi A4", customer: "L. Castellano", plate: "QTR-6618", svc: "Timing belt — parts on order", code: "P0016", tech: "D. Marsh", eta: "Wed", progress: 40, status: "hold", bay: "Bay 8", labor: 520, parts: 340, photo: 3 }
  ];

  var board = document.getElementById("board");
  var toastEl = document.getElementById("toast");
  var searchEl = document.getElementById("search");
  var dragId = null;
  var techFilter = "all";
  var queryStr = "";

  function money(n) { return "$" + n.toLocaleString("en-US"); }

  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function nextBay() {
    for (var i = 1; i <= 8; i++) {
      var b = "Bay " + i;
      if (!JOBS.some(function (j) { return j.bay === b; })) return b;
    }
    return "Bay 1";
  }

  function cardHTML(j) {
    var techOptions = TECHS.map(function (t) {
      return '<option value="' + t + '"' + (t === j.tech ? " selected" : "") + ">" + t + "</option>";
    }).join("");

    var codeChip = j.code ? '<span class="code-chip" title="Diagnostic code">' + j.code + "</span>" : "";
    var idx = STATUSES.map(function (s) { return s.id; }).indexOf(j.status);

    return (
      '<article class="card" draggable="true" data-id="' + j.id + '" data-status="' + j.status + '" data-tech="' + j.tech + '">' +
        '<div class="card-photo" style="background:' + PHOTOS[j.photo] + '">' +
          '<span class="bay">' + (j.bay === "—" ? j.id : j.bay) + "</span>" +
          '<span class="plate">' + j.plate + "</span>" +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-vehicle">' + j.vehicle + "</div>" +
          '<div class="card-cust">' + j.customer + " · " + j.id + "</div>" +
          '<div class="card-svc">' + codeChip + "<span>" + j.svc + "</span></div>" +
          '<div class="meta-row">' +
            '<select class="tech-pick" aria-label="Assign technician">' + techOptions + "</select>" +
            '<span class="eta">ETA <b>' + j.eta + "</b></span>" +
          "</div>" +
          '<div class="bar" role="progressbar" aria-valuenow="' + j.progress + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + j.progress + '%"></span></div>' +
          '<div class="card-foot">' +
            '<span class="price">' + money(j.labor + j.parts) + "<small>LABOR + PARTS</small></span>" +
            '<span class="move">' +
              '<button class="mv-prev" title="Move left" aria-label="Move to previous status"' + (idx <= 0 ? " disabled" : "") + ">&#8592;</button>" +
              '<button class="mv-next" title="Move right" aria-label="Move to next status"' + (idx >= STATUSES.length - 1 ? " disabled" : "") + ">&#8594;</button>" +
            "</span>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    board.innerHTML = STATUSES.map(function (s) {
      return (
        '<section class="col" data-status="' + s.id + '" aria-label="' + s.label + '">' +
          '<div class="col-head"><span class="col-tag"></span><span class="col-title">' + s.label +
          '</span><span class="col-count" data-count="' + s.id + '">0</span></div>' +
          '<div class="col-list" data-list="' + s.id + '"></div>' +
        "</section>"
      );
    }).join("");

    STATUSES.forEach(function (s) {
      var list = board.querySelector('[data-list="' + s.id + '"]');
      var jobs = JOBS.filter(function (j) { return j.status === s.id; });
      list.innerHTML = jobs.map(cardHTML).join("") ||
        '<div class="col-empty">No jobs</div>';
    });

    wire();
    applyFilters();
    updateKPIs();
  }

  function wire() {
    board.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("dragstart", function () {
        dragId = card.dataset.id;
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", function () {
        dragId = null;
        card.classList.remove("dragging");
      });

      card.querySelector(".tech-pick").addEventListener("change", function (e) {
        var job = find(card.dataset.id);
        job.tech = e.target.value;
        card.dataset.tech = job.tech;
        if (job.tech !== "Unassigned" && job.status === "waiting") {
          job.status = "in-progress";
          if (job.bay === "—") job.bay = nextBay();
          toast("<b>" + job.id + "</b> assigned to " + job.tech + " → In Progress");
          render();
          return;
        }
        toast("<b>" + job.id + "</b> → " + job.tech);
        applyFilters();
        updateKPIs();
      });

      card.querySelector(".mv-prev").addEventListener("click", function () { move(card.dataset.id, -1); });
      card.querySelector(".mv-next").addEventListener("click", function () { move(card.dataset.id, 1); });
    });

    board.querySelectorAll(".col").forEach(function (col) {
      col.addEventListener("dragover", function (e) {
        e.preventDefault();
        col.classList.add("drag-over");
      });
      col.addEventListener("dragleave", function () { col.classList.remove("drag-over"); });
      col.addEventListener("drop", function (e) {
        e.preventDefault();
        col.classList.remove("drag-over");
        if (dragId) setStatus(dragId, col.dataset.status);
      });
    });
  }

  function find(id) { return JOBS.filter(function (j) { return j.id === id; })[0]; }

  function move(id, dir) {
    var job = find(id);
    var idx = STATUSES.map(function (s) { return s.id; }).indexOf(job.status);
    var next = idx + dir;
    if (next < 0 || next >= STATUSES.length) return;
    setStatus(id, STATUSES[next].id);
  }

  function setStatus(id, status) {
    var job = find(id);
    if (job.status === status) return;
    job.status = status;
    if (status === "in-progress") {
      if (job.progress === 0) job.progress = 10;
      if (job.bay === "—") job.bay = nextBay();
    } else if (status === "done") {
      job.progress = 100;
      job.eta = "—";
    } else if (status === "waiting") {
      job.progress = 0;
      job.bay = "—";
    }
    var label = STATUSES.filter(function (s) { return s.id === status; })[0].label;
    toast("<b>" + job.id + "</b> moved to " + label);
    render();
  }

  function applyFilters() {
    board.querySelectorAll(".card").forEach(function (card) {
      var job = find(card.dataset.id);
      var techOk = techFilter === "all" || job.tech === techFilter;
      var hay = (job.vehicle + " " + job.plate + " " + job.customer + " " + job.id + " " + job.svc + " " + job.code).toLowerCase();
      var qOk = !queryStr || hay.indexOf(queryStr) !== -1;
      card.classList.toggle("hidden", !(techOk && qOk));
    });

    STATUSES.forEach(function (s) {
      var list = board.querySelector('[data-list="' + s.id + '"]');
      var visible = list.querySelectorAll(".card:not(.hidden)").length;
      var total = JOBS.filter(function (j) { return j.status === s.id; }).length;
      board.querySelector('[data-count="' + s.id + '"]').textContent =
        (techFilter === "all" && !queryStr) ? total : visible;
    });
  }

  function updateKPIs() {
    var active = JOBS.filter(function (j) { return j.status === "in-progress"; });
    var waiting = JOBS.filter(function (j) { return j.status === "waiting"; });
    var open = JOBS.filter(function (j) { return j.status !== "done"; });
    var avg = active.length
      ? Math.round(active.reduce(function (a, j) { return a + j.progress; }, 0) / active.length)
      : 0;
    var rev = open.reduce(function (a, j) { return a + j.labor + j.parts; }, 0);

    document.getElementById("kpiActive").textContent = active.length;
    document.getElementById("kpiWaiting").textContent = waiting.length;
    document.getElementById("kpiProgress").textContent = avg + "%";
    document.getElementById("kpiRevenue").textContent = money(rev);
  }

  /* Toolbar */
  document.querySelectorAll(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".seg-btn").forEach(function (b) {
        b.classList.remove("is-on");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-on");
      btn.setAttribute("aria-pressed", "true");
      techFilter = btn.dataset.tech;
      applyFilters();
    });
  });

  searchEl.addEventListener("input", function (e) {
    queryStr = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  /* Clock */
  function tick() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    var hh = h % 12 || 12;
    document.getElementById("clock").textContent =
      hh + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }
  tick();
  setInterval(tick, 10000);

  /* Live progress drift on in-progress jobs */
  setInterval(function () {
    var changed = false;
    JOBS.forEach(function (j) {
      if (j.status === "in-progress" && j.progress < 98) {
        j.progress = Math.min(98, j.progress + Math.floor(Math.random() * 3));
        changed = true;
      }
    });
    if (changed) {
      board.querySelectorAll('.card[data-status="in-progress"]').forEach(function (card) {
        var job = find(card.dataset.id);
        var bar = card.querySelector(".bar > span");
        var role = card.querySelector(".bar");
        if (bar) bar.style.width = job.progress + "%";
        if (role) role.setAttribute("aria-valuenow", job.progress);
      });
      updateKPIs();
    }
  }, 3200);

  render();
})();
