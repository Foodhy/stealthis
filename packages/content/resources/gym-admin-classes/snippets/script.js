(function () {
  "use strict";

  /* ---------------- In-memory store ---------------- */
  var uid = 0;
  function id() {
    uid += 1;
    return "c" + uid;
  }

  var classes = [
    {
      id: id(),
      name: "Sunrise HIIT",
      type: "HIIT",
      trainer: "Mara Velez",
      day: "Monday",
      time: "06:30",
      duration: 45,
      room: "Studio A",
      capacity: 24,
      booked: 22,
      status: "active",
    },
    {
      id: id(),
      name: "Power Strength",
      type: "Strength",
      trainer: "Theo Brandt",
      day: "Monday",
      time: "18:00",
      duration: 60,
      room: "Strength Floor",
      capacity: 18,
      booked: 18,
      status: "active",
    },
    {
      id: id(),
      name: "Rhythm Ride",
      type: "Spin",
      trainer: "Devon Cole",
      day: "Tuesday",
      time: "19:15",
      duration: 50,
      room: "Spin Loft",
      capacity: 30,
      booked: 19,
      status: "active",
    },
    {
      id: id(),
      name: "Flow & Restore",
      type: "Yoga",
      trainer: "Priya Nandakumar",
      day: "Wednesday",
      time: "08:00",
      duration: 60,
      room: "Mind & Body",
      capacity: 20,
      booked: 11,
      status: "active",
    },
    {
      id: id(),
      name: "Knockout Boxing",
      type: "Boxing",
      trainer: "Imani Okafor",
      day: "Thursday",
      time: "20:00",
      duration: 45,
      room: "Studio B",
      capacity: 16,
      booked: 6,
      status: "draft",
    },
    {
      id: id(),
      name: "Core Pilates",
      type: "Pilates",
      trainer: "Luca Ferreira",
      day: "Friday",
      time: "12:00",
      duration: 40,
      room: "Mind & Body",
      capacity: 14,
      booked: 0,
      status: "cancelled",
    },
  ];

  /* ---------------- Elements ---------------- */
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var tbody = $("#tbody");
  var empty = $("#empty");
  var searchEl = $("#search");
  var filterType = $("#filterType");
  var filterTrainer = $("#filterTrainer");
  var backdrop = $("#backdrop");
  var form = $("#form");
  var modalTitle = $("#modalTitle");
  var toasts = $("#toasts");

  var fieldIds = [
    "fName",
    "fType",
    "fTrainer",
    "fDay",
    "fTime",
    "fDuration",
    "fRoom",
    "fCapacity",
  ];

  var TYPES = ["HIIT", "Strength", "Spin", "Yoga", "Boxing", "Pilates", "Mobility"];
  var DAY_ABBR = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  var currentStatus = "active";

  /* ---------------- Helpers ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function fmtTime(t) {
    if (!t) return "";
    var parts = t.split(":");
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + m + " " + ap;
  }

  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 220);
    }, 2600);
  }

  function trainers() {
    var set = {};
    classes.forEach(function (c) {
      set[c.trainer] = true;
    });
    return Object.keys(set).sort();
  }

  /* ---------------- Stats ---------------- */
  function renderStats() {
    $("#statTotal").textContent = classes.length;
    $("#statActive").textContent = classes.filter(function (c) {
      return c.status === "active";
    }).length;
    $("#statCapacity").textContent = classes
      .filter(function (c) {
        return c.status === "active";
      })
      .reduce(function (sum, c) {
        return sum + c.capacity;
      }, 0);
    $("#statTrainers").textContent = trainers().length;
  }

  /* ---------------- Filter selects ---------------- */
  function syncFilterOptions() {
    var prevTrainer = filterTrainer.value;
    // types are fixed
    if (filterType.options.length <= 1) {
      TYPES.forEach(function (t) {
        var o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        filterType.appendChild(o);
      });
    }
    filterTrainer.innerHTML = '<option value="">All trainers</option>';
    trainers().forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      filterTrainer.appendChild(o);
    });
    if (prevTrainer) filterTrainer.value = prevTrainer;
  }

  /* ---------------- Render rows ---------------- */
  function visible() {
    var q = searchEl.value.trim().toLowerCase();
    var ft = filterType.value;
    var fr = filterTrainer.value;
    return classes.filter(function (c) {
      if (ft && c.type !== ft) return false;
      if (fr && c.trainer !== fr) return false;
      if (q) {
        var hay = (c.name + " " + c.type + " " + c.trainer + " " + c.room + " " + c.day).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function capFillClass(pct) {
    if (pct >= 100) return "full";
    if (pct >= 80) return "high";
    return "";
  }

  function rowHtml(c) {
    var pct = c.capacity ? Math.round((c.booked / c.capacity) * 100) : 0;
    if (pct > 100) pct = 100;
    var initials = c.type.slice(0, 2).toUpperCase();
    return (
      '<td class="cell-class">' +
      '<div class="cell-class">' +
      '<span class="type-dot">' +
      esc(initials) +
      "</span>" +
      "<span>" +
      '<span class="cls-name">' +
      esc(c.name) +
      "</span><br>" +
      '<span class="cls-type">' +
      esc(c.type) +
      "</span>" +
      "</span>" +
      "</div>" +
      "</td>" +
      '<td class="cell-trainer">' +
      esc(c.trainer) +
      "</td>" +
      '<td class="cell-schedule"><span class="schedule">' +
      esc(DAY_ABBR[c.day] || c.day) +
      '<span class="sched-time">' +
      fmtTime(c.time) +
      " · " +
      c.duration +
      " min</span></span></td>" +
      '<td class="cell-room col-room">' +
      esc(c.room) +
      "</td>" +
      '<td class="cell-cap col-cap"><div class="cap">' +
      '<span class="cap-num">' +
      c.booked +
      " / " +
      c.capacity +
      "</span>" +
      '<span class="cap-bar"><span class="cap-fill ' +
      capFillClass(pct) +
      '" style="width:' +
      pct +
      '%"></span></span>' +
      "</div></td>" +
      '<td class="cell-status"><span class="badge badge-' +
      c.status +
      '">' +
      c.status.charAt(0).toUpperCase() +
      c.status.slice(1) +
      "</span></td>" +
      '<td class="cell-actions"><div class="row-actions" data-id="' +
      c.id +
      '">' +
      '<button class="icon-btn" data-act="edit" aria-label="Edit ' +
      esc(c.name) +
      '" title="Edit">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>' +
      "</button>" +
      '<button class="icon-btn danger" data-act="del" aria-label="Delete ' +
      esc(c.name) +
      '" title="Delete">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>' +
      "</button>" +
      "</div></td>"
    );
  }

  function render() {
    var rows = visible();
    tbody.innerHTML = "";
    rows.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.dataset.id = c.id;
      tr.innerHTML = rowHtml(c);
      tbody.appendChild(tr);
    });
    empty.hidden = rows.length !== 0;
    renderStats();
  }

  /* ---------------- Modal ---------------- */
  var lastFocused = null;

  function setStatusSeg(status) {
    currentStatus = status;
    var segs = form.querySelectorAll(".seg");
    Array.prototype.forEach.call(segs, function (s) {
      s.classList.toggle("on", s.dataset.status === status);
    });
  }

  function clearErrors() {
    fieldIds.forEach(function (fid) {
      var f = $("#" + fid);
      if (f) f.closest(".field").classList.remove("invalid");
    });
  }

  function openModal(cls) {
    lastFocused = document.activeElement;
    form.reset();
    clearErrors();
    if (cls) {
      modalTitle.textContent = "Edit class";
      $("#fId").value = cls.id;
      $("#fName").value = cls.name;
      $("#fType").value = cls.type;
      $("#fTrainer").value = cls.trainer;
      $("#fDay").value = cls.day;
      $("#fTime").value = cls.time;
      $("#fDuration").value = cls.duration;
      $("#fRoom").value = cls.room;
      $("#fCapacity").value = cls.capacity;
      setStatusSeg(cls.status);
    } else {
      modalTitle.textContent = "Add class";
      $("#fId").value = "";
      setStatusSeg("active");
    }
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      $("#fName").focus();
    }, 30);
  }

  function closeModal() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function setError(fid, msg) {
    var f = $("#" + fid);
    var field = f.closest(".field");
    field.classList.add("invalid");
    var err = field.querySelector(".err");
    if (err) err.textContent = msg;
  }

  function validate() {
    clearErrors();
    var ok = true;
    var v = {
      name: $("#fName").value.trim(),
      type: $("#fType").value,
      trainer: $("#fTrainer").value,
      day: $("#fDay").value,
      time: $("#fTime").value,
      duration: parseInt($("#fDuration").value, 10),
      room: $("#fRoom").value,
      capacity: parseInt($("#fCapacity").value, 10),
    };
    if (!v.name) {
      setError("fName", "Class name is required.");
      ok = false;
    }
    if (!v.type) {
      setError("fType", "Pick a type.");
      ok = false;
    }
    if (!v.trainer) {
      setError("fTrainer", "Pick a trainer.");
      ok = false;
    }
    if (!v.day) {
      setError("fDay", "Pick a day.");
      ok = false;
    }
    if (!v.time) {
      setError("fTime", "Set a start time.");
      ok = false;
    }
    if (!v.duration || v.duration < 15) {
      setError("fDuration", "Min 15 minutes.");
      ok = false;
    }
    if (!v.room) {
      setError("fRoom", "Pick a room.");
      ok = false;
    }
    if (!v.capacity || v.capacity < 1) {
      setError("fCapacity", "Capacity must be at least 1.");
      ok = false;
    }
    return ok ? v : null;
  }

  /* ---------------- Events ---------------- */
  $("#addBtn").addEventListener("click", function () {
    openModal(null);
  });
  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !backdrop.hidden) closeModal();
  });

  form.addEventListener("click", function (e) {
    var seg = e.target.closest(".seg");
    if (seg) {
      e.preventDefault();
      setStatusSeg(seg.dataset.status);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = validate();
    if (!v) {
      toast("Please fix the highlighted fields.", "danger");
      return;
    }
    var editId = $("#fId").value;
    if (editId) {
      var c = classes.find(function (x) {
        return x.id === editId;
      });
      if (c) {
        if (v.capacity < c.booked) c.booked = v.capacity;
        c.name = v.name;
        c.type = v.type;
        c.trainer = v.trainer;
        c.day = v.day;
        c.time = v.time;
        c.duration = v.duration;
        c.room = v.room;
        c.capacity = v.capacity;
        c.status = currentStatus;
      }
      closeModal();
      render();
      flash(editId);
      toast("Class updated.");
    } else {
      var nc = {
        id: id(),
        name: v.name,
        type: v.type,
        trainer: v.trainer,
        day: v.day,
        time: v.time,
        duration: v.duration,
        room: v.room,
        capacity: v.capacity,
        booked: 0,
        status: currentStatus,
      };
      classes.unshift(nc);
      // reset filters that would hide the new row
      if (filterType.value && filterType.value !== nc.type) filterType.value = "";
      if (filterTrainer.value && filterTrainer.value !== nc.trainer)
        filterTrainer.value = "";
      searchEl.value = "";
      syncFilterOptions();
      closeModal();
      render();
      flash(nc.id);
      toast("Class added.");
    }
  });

  function flash(rid) {
    var tr = tbody.querySelector('tr[data-id="' + rid + '"]');
    if (tr) tr.classList.add("flash");
  }

  /* row actions: edit / delete (inline confirm) */
  tbody.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var wrap = btn.closest(".row-actions");
    var rid = wrap.dataset.id;
    var cls = classes.find(function (x) {
      return x.id === rid;
    });
    if (!cls) return;

    if (btn.dataset.act === "edit") {
      openModal(cls);
      return;
    }

    if (btn.dataset.act === "del") {
      showConfirm(wrap, rid, cls.name);
    }
  });

  function showConfirm(wrap, rid, name) {
    var original = wrap.innerHTML;
    wrap.innerHTML =
      '<span class="confirm">Delete?' +
      '<button class="btn btn-danger mini" data-c="yes">Yes</button>' +
      '<button class="btn btn-ghost mini" data-c="no">No</button>' +
      "</span>";
    wrap.querySelector('[data-c="no"]').addEventListener("click", function () {
      wrap.innerHTML = original;
    });
    wrap.querySelector('[data-c="yes"]').addEventListener("click", function () {
      classes = classes.filter(function (x) {
        return x.id !== rid;
      });
      syncFilterOptions();
      render();
      toast('"' + name + '" deleted.', "danger");
    });
  }

  /* filters */
  searchEl.addEventListener("input", render);
  filterType.addEventListener("change", render);
  filterTrainer.addEventListener("change", render);

  function clearFilters() {
    searchEl.value = "";
    filterType.value = "";
    filterTrainer.value = "";
    render();
  }
  $("#clearFilters").addEventListener("click", clearFilters);
  $("#emptyClear").addEventListener("click", clearFilters);

  /* ---------------- Init ---------------- */
  syncFilterOptions();
  render();
})();
