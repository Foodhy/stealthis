(function () {
  "use strict";

  /* ---------- Data ---------- */
  var drivers = [
    { id: "d1", name: "Marisol Vega", vehicle: "E-bike · NG-204", status: "ok", color: "#1f9d62" },
    { id: "d2", name: "Tobias Crane", vehicle: "Scooter · NG-118", status: "warn", color: "#e89422" },
    { id: "d3", name: "Priya Naidoo", vehicle: "Car · NG-077", status: "ok", color: "#5b8def" },
    { id: "d4", name: "Owen Becker", vehicle: "E-bike · NG-251", status: "off", color: "#71757f" }
  ];

  var orders = [
    { id: "FH-4821", prio: "express", eta: "14m", pickup: "Sakura Ramen", pickupArea: "Market St · 0.4 mi", drop: "Apt 7B, Linden Court", dropArea: "Northgate · 1.2 mi", customer: "J. Whitlock", driver: null },
    { id: "FH-4822", prio: "standard", eta: "28m", pickup: "Green Bowl Co.", pickupArea: "5th & Pine · 0.9 mi", drop: "Riverside Office, Lvl 3", dropArea: "Dockside · 2.1 mi", customer: "A. Mbeki", driver: null },
    { id: "FH-4823", prio: "scheduled", eta: "6:40 PM", pickup: "Nonna's Pizzeria", pickupArea: "Old Town · 1.5 mi", drop: "14 Maple Row", dropArea: "Hillcrest · 3.0 mi", customer: "L. Romero", driver: null },
    { id: "FH-4824", prio: "express", eta: "11m", pickup: "Bao & Brew", pickupArea: "Market St · 0.3 mi", drop: "Studio 2, Harbor Lofts", dropArea: "Dockside · 1.8 mi", customer: "S. Patel", driver: null },
    { id: "FH-4825", prio: "standard", eta: "22m", pickup: "The Daily Grind", pickupArea: "Elm Ave · 0.7 mi", drop: "Unit 12, Cedar Park", dropArea: "Northgate · 1.0 mi", customer: "K. Andersen", driver: null },
    { id: "FH-4826", prio: "standard", eta: "31m", pickup: "Taco Verde", pickupArea: "9th St · 1.1 mi", drop: "Reception, Atlas Tower", dropArea: "Civic · 2.6 mi", customer: "M. Okonkwo", driver: "d2" },
    { id: "FH-4827", prio: "express", eta: "9m", pickup: "Sakura Ramen", pickupArea: "Market St · 0.4 mi", drop: "Apt 3, Birch Mews", dropArea: "Northgate · 0.8 mi", customer: "D. Fontaine", driver: "d2" },
    { id: "FH-4828", prio: "scheduled", eta: "7:15 PM", pickup: "Saffron House", pickupArea: "Old Town · 1.6 mi", drop: "88 Willow Bend", dropArea: "Hillcrest · 3.4 mi", customer: "R. Tanaka", driver: "d3" }
  ];

  var state = { prio: "all", query: "" };

  /* ---------- Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var board = $("#board");
  var driverList = $("#driverList");
  var toastWrap = $("#toastWrap");

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function driverById(id) {
    for (var i = 0; i < drivers.length; i++) if (drivers[i].id === id) return drivers[i];
    return null;
  }
  function loadFor(id) {
    return orders.filter(function (o) { return o.driver === id; }).length;
  }
  function matches(o) {
    if (state.prio !== "all" && o.prio !== state.prio) return false;
    if (state.query) {
      var hay = (o.id + " " + o.customer + " " + o.pickup + " " + o.drop + " " + o.dropArea).toLowerCase();
      if (hay.indexOf(state.query) === -1) return false;
    }
    return true;
  }

  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("hide");
      setTimeout(function () { t.remove(); }, 260);
    }, 2400);
  }

  /* ---------- Card markup ---------- */
  function cardEl(o) {
    var el = document.createElement("article");
    el.className = "card prio-" + o.prio;
    el.setAttribute("draggable", "true");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-id", o.id);
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label",
      o.id + ", " + o.prio + " priority, from " + o.pickup + " to " + o.drop +
      (o.driver ? ", assigned to " + driverById(o.driver).name : ", unassigned"));

    var assignLabel = o.driver ? "Reassign" : "Assign";
    el.innerHTML =
      '<div class="card-top">' +
        '<span class="card-id">' + o.id + '</span>' +
        '<span class="pill ' + o.prio + '">' + o.prio + '</span>' +
        '<span class="card-eta">ETA <b>' + o.eta + '</b></span>' +
      '</div>' +
      '<div class="route">' +
        '<div class="leg"><span class="marker"></span><span class="place"><strong>' + o.pickup + '</strong><span>' + o.pickupArea + '</span></span></div>' +
        '<div class="leg drop"><span class="marker"></span><span class="place"><strong>' + o.drop + '</strong><span>' + o.dropArea + '</span></span></div>' +
      '</div>' +
      '<div class="card-foot">' +
        '<span class="cust">Customer · <b>' + o.customer + '</b></span>' +
        '<div class="card-actions">' +
          '<button class="mini-btn primary" data-assign="' + o.id + '">' + assignLabel + '</button>' +
        '</div>' +
      '</div>';
    return el;
  }

  /* ---------- Render board ---------- */
  function render() {
    board.innerHTML = "";

    // Unassigned column
    board.appendChild(buildColumn(null));
    // One column per online-ish driver (include all so dispatcher can park)
    drivers.forEach(function (d) { board.appendChild(buildColumn(d)); });

    renderSidebar();
    updateStats();
    wireDnD();
  }

  function buildColumn(driver) {
    var col = document.createElement("section");
    var list = orders.filter(function (o) {
      return (driver ? o.driver === driver.id : o.driver === null);
    });
    var visible = list.filter(matches);

    col.className = "column" + (driver ? "" : " unassigned");
    col.setAttribute("data-driver", driver ? driver.id : "");
    col.setAttribute("aria-label", driver ? driver.name + " queue" : "Unassigned orders");

    var head;
    if (driver) {
      var st = driver.status === "ok" ? "ok" : driver.status === "warn" ? "warn" : "off";
      var stTxt = driver.status === "ok" ? "Available" : driver.status === "warn" ? "On run" : "Break";
      head =
        '<div class="col-head">' +
          '<span class="col-avatar" style="background:' + driver.color + '">' + initials(driver.name) + '</span>' +
          '<span class="col-title"><strong>' + driver.name + '</strong>' +
          '<span class="dstatus ' + st + '"><i></i>' + stTxt + '</span></span>' +
          '<span class="col-count">' + list.length + '</span>' +
        '</div>';
    } else {
      head =
        '<div class="col-head">' +
          '<span class="col-avatar tag-orders">⬡</span>' +
          '<span class="col-title"><strong>Unassigned</strong><small>Awaiting dispatch</small></span>' +
          '<span class="col-count">' + list.length + '</span>' +
        '</div>';
    }
    col.innerHTML = head + '<div class="col-body" role="list"></div>';

    var body = $(".col-body", col);
    if (visible.length === 0) {
      var empty = document.createElement("div");
      empty.className = "col-empty";
      empty.textContent = list.length === 0
        ? (driver ? "No active runs" : "All caught up — drop orders here")
        : "No orders match the filter";
      body.appendChild(empty);
    } else {
      visible.forEach(function (o) { body.appendChild(cardEl(o)); });
    }
    return col;
  }

  function renderSidebar() {
    driverList.innerHTML = "";
    drivers.forEach(function (d) {
      var li = document.createElement("li");
      li.className = "driver";
      var st = d.status === "ok" ? "ok" : d.status === "warn" ? "warn" : "off";
      var stTxt = d.status === "ok" ? "Available" : d.status === "warn" ? "On run" : "On break";
      li.innerHTML =
        '<span class="av" style="background:' + d.color + '">' + initials(d.name) + '</span>' +
        '<span class="meta"><strong>' + d.name + '</strong>' +
        '<span class="dstatus ' + st + '"><i></i>' + stTxt + ' · ' + d.vehicle + '</span></span>' +
        '<span class="load">' + loadFor(d.id) + '</span>';
      driverList.appendChild(li);
    });
  }

  function updateStats() {
    var unassigned = orders.filter(function (o) { return o.driver === null; }).length;
    var assigned = orders.length - unassigned;
    var online = drivers.filter(function (d) { return d.status !== "off"; }).length;
    $("#statUnassigned").textContent = unassigned;
    $("#statAssigned").textContent = assigned;
    $("#statDrivers").textContent = online;
  }

  /* ---------- Assign logic ---------- */
  function assign(orderId, driverId, silent) {
    var o = null;
    for (var i = 0; i < orders.length; i++) if (orders[i].id === orderId) o = orders[i];
    if (!o) return;
    var prev = o.driver;
    if (prev === driverId) return;
    o.driver = driverId;
    render();
    if (silent) return;

    if (driverId === null) {
      toast(o.id + " returned to unassigned", "warn");
    } else {
      var d = driverById(driverId);
      var verb = prev ? "reassigned to" : "assigned to";
      toast(o.id + " " + verb + " " + d.name, "ok");
    }
  }

  /* ---------- Assign modal ---------- */
  var modal = $("#assignModal");
  var modalOpts = $("#assignOptions");
  var modalSub = $("#assignSub");
  var lastFocus = null;

  function openAssign(orderId) {
    var o = null;
    for (var i = 0; i < orders.length; i++) if (orders[i].id === orderId) o = orders[i];
    if (!o) return;
    lastFocus = document.activeElement;
    modalSub.textContent = "Choose a driver for " + o.id + " (" + o.pickup + " → " + o.drop + ").";
    modalOpts.innerHTML = "";

    // Unassign option if already assigned
    if (o.driver) {
      modalOpts.appendChild(optionBtn(orderId, null, "Unassigned", "Return to dispatch pool", "#16181d", "↺"));
    }
    drivers.forEach(function (d) {
      var disabled = d.id === o.driver;
      var sub = (d.status === "off" ? "On break · " : "") + d.vehicle + " · " + loadFor(d.id) + " active";
      modalOpts.appendChild(optionBtn(orderId, d.id, d.name + (disabled ? " (current)" : ""), sub, d.color, initials(d.name), disabled));
    });

    modal.hidden = false;
    var first = modalOpts.querySelector(".assign-opt:not(:disabled)");
    if (first) first.focus();
    document.addEventListener("keydown", onModalKey);
  }

  function optionBtn(orderId, driverId, name, sub, color, badge, disabled) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.className = "assign-opt";
    b.disabled = !!disabled;
    b.innerHTML =
      '<span class="av" style="background:' + color + '">' + badge + '</span>' +
      '<span class="meta"><strong>' + name + '</strong><span>' + sub + '</span></span>';
    b.addEventListener("click", function () {
      closeAssign();
      assign(orderId, driverId);
    });
    li.appendChild(b);
    return li;
  }

  function closeAssign() {
    modal.hidden = true;
    document.removeEventListener("keydown", onModalKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onModalKey(e) { if (e.key === "Escape") closeAssign(); }

  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeAssign();
  });

  /* ---------- Drag & drop ---------- */
  var dragId = null;

  function wireDnD() {
    var cards = board.querySelectorAll(".card");
    cards.forEach(function (c) {
      c.addEventListener("dragstart", function (e) {
        dragId = c.getAttribute("data-id");
        c.classList.add("dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", dragId);
        }
      });
      c.addEventListener("dragend", function () {
        c.classList.remove("dragging");
        dragId = null;
        clearDragOver();
      });
    });

    var bodies = board.querySelectorAll(".col-body");
    bodies.forEach(function (body) {
      var col = body.closest(".column");
      body.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        body.classList.add("drag-over");
      });
      body.addEventListener("dragleave", function () { body.classList.remove("drag-over"); });
      body.addEventListener("drop", function (e) {
        e.preventDefault();
        body.classList.remove("drag-over");
        var id = dragId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
        if (!id) return;
        var target = col.getAttribute("data-driver") || null;
        assign(id, target);
      });
    });
  }
  function clearDragOver() {
    board.querySelectorAll(".drag-over").forEach(function (b) { b.classList.remove("drag-over"); });
  }

  /* ---------- Delegated clicks (assign buttons + keyboard) ---------- */
  board.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-assign]");
    if (btn) { openAssign(btn.getAttribute("data-assign")); return; }
  });
  board.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) {
      e.preventDefault();
      openAssign(e.target.getAttribute("data-id"));
    }
  });

  /* ---------- Filters ---------- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      state.prio = chip.getAttribute("data-prio");
      render();
    });
  });

  /* ---------- Search ---------- */
  var search = $("#search");
  var debounce;
  search.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.query = search.value.trim().toLowerCase();
      render();
    }, 120);
  });

  /* ---------- Simulated live ETA ticking ---------- */
  setInterval(function () {
    var changed = false;
    orders.forEach(function (o) {
      var m = /^(\d+)m$/.exec(o.eta);
      if (m) {
        var v = parseInt(m[1], 10) - 1;
        o.eta = (v <= 1 ? 1 : v) + "m";
        changed = true;
      }
    });
    if (changed) render();
  }, 12000);

  /* ---------- Go ---------- */
  render();
  setTimeout(function () { toast("Dispatch board live · " + orders.filter(function (o) { return !o.driver; }).length + " orders waiting", "brand"); }, 500);
})();
