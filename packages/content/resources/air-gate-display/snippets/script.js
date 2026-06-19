(function () {
  "use strict";

  // ---- Elements ----
  var clockEl = document.getElementById("clock");
  var statusPill = document.getElementById("statusPill");
  var boardTimeEl = document.getElementById("boardTime");
  var depTimeEl = document.getElementById("depTime");
  var countdownEl = document.getElementById("countdown");
  var gateEl = document.getElementById("gate");
  var nowZoneEl = document.getElementById("nowZone");
  var groupsEl = document.getElementById("groups");
  var progressBar = document.getElementById("progressBar");
  var advanceBtn = document.getElementById("advanceBtn");
  var statusBtn = document.getElementById("statusBtn");
  var resetBtn = document.getElementById("resetBtn");
  var toastEl = document.getElementById("toast");

  var groupEls = Array.prototype.slice.call(groupsEl.querySelectorAll(".group"));
  var totalGroups = groupEls.length;

  // ---- State ----
  var STATUSES = [
    { key: "boarding", label: "Boarding" },
    { key: "ontime", label: "On time" },
    { key: "delayed", label: "Delayed" },
    { key: "departed", label: "Departed" },
    { key: "cancelled", label: "Cancelled" }
  ];

  var state = {
    activeGroup: 1, // 1-based; the group currently boarding
    status: "boarding",
    // boarding closes ~45s from load in this demo to keep the countdown lively
    boardCloseAt: Date.now() + 18 * 60 * 1000
  };

  // ---- Toast helper ----
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // ---- Clock ----
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tickClock() {
    var d = new Date();
    clockEl.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  // ---- Countdown to boarding close ----
  function renderCountdown() {
    if (state.status === "departed") {
      countdownEl.textContent = "Doors closed";
      return;
    }
    if (state.status === "cancelled") {
      countdownEl.textContent = "Flight cancelled";
      return;
    }
    var diff = state.boardCloseAt - Date.now();
    if (diff <= 0) {
      countdownEl.textContent = "Final call";
      return;
    }
    var mins = Math.floor(diff / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    if (mins > 0) {
      countdownEl.textContent = "in " + mins + " min";
    } else {
      countdownEl.textContent = "in " + secs + " s";
    }
  }

  // ---- Render boarding groups ----
  function renderGroups() {
    var boardingActive = state.status === "boarding";
    groupEls.forEach(function (el) {
      var g = parseInt(el.getAttribute("data-group"), 10);
      var stateEl = el.querySelector(".g-state");
      if (!boardingActive) {
        el.removeAttribute("data-active");
        if (state.status === "departed") {
          stateEl.textContent = "Closed";
        } else if (state.status === "cancelled") {
          stateEl.textContent = "—";
        } else {
          stateEl.textContent = "Holding";
        }
        return;
      }
      if (g < state.activeGroup) {
        el.setAttribute("data-active", "done");
        stateEl.textContent = "Boarded";
      } else if (g === state.activeGroup) {
        el.setAttribute("data-active", "now");
        stateEl.textContent = "Boarding";
      } else if (g === state.activeGroup + 1) {
        el.setAttribute("data-active", "next");
        stateEl.textContent = "Next";
      } else {
        el.removeAttribute("data-active");
        stateEl.textContent = "Waiting";
      }
    });

    // Now-boarding zone label + progress
    if (boardingActive) {
      var current = groupEls.find(function (el) {
        return parseInt(el.getAttribute("data-group"), 10) === state.activeGroup;
      });
      var name = current ? current.querySelector(".g-name").textContent : "";
      nowZoneEl.textContent = "Group " + state.activeGroup + " · " + name;
      nowZoneEl.style.display = "";
    } else {
      nowZoneEl.style.display = "none";
    }

    var pct = boardingActive
      ? Math.round((state.activeGroup / totalGroups) * 100)
      : (state.status === "departed" ? 100 : 0);
    progressBar.style.width = pct + "%";
  }

  // ---- Render status pill ----
  function renderStatus() {
    var info = STATUSES.filter(function (s) { return s.key === state.status; })[0];
    statusPill.setAttribute("data-status", state.status);
    statusPill.textContent = info.label;

    if (state.status === "delayed") {
      depTimeEl.textContent = "23:25";
      depTimeEl.nextElementSibling.textContent = "Was 22:40";
      depTimeEl.nextElementSibling.style.color = "var(--warn)";
    } else {
      depTimeEl.textContent = "22:40";
      depTimeEl.nextElementSibling.textContent = "Scheduled";
      depTimeEl.nextElementSibling.style.color = "";
    }

    advanceBtn.disabled = !(state.status === "boarding");
    advanceBtn.style.opacity = advanceBtn.disabled ? "0.5" : "";
    advanceBtn.style.cursor = advanceBtn.disabled ? "not-allowed" : "";
  }

  function renderAll() {
    renderStatus();
    renderGroups();
    renderCountdown();
  }

  // ---- Actions ----
  function advanceGroup() {
    if (state.status !== "boarding") {
      toast("Boarding not in progress");
      return;
    }
    if (state.activeGroup >= totalGroups) {
      state.status = "departed";
      renderAll();
      toast("All groups boarded — doors closed");
      return;
    }
    state.activeGroup += 1;
    var current = groupEls.find(function (el) {
      return parseInt(el.getAttribute("data-group"), 10) === state.activeGroup;
    });
    var name = current ? current.querySelector(".g-name").textContent : "";
    renderAll();
    toast("Now boarding Group " + state.activeGroup + " · " + name);
  }

  function cycleStatus() {
    var idx = STATUSES.map(function (s) { return s.key; }).indexOf(state.status);
    idx = (idx + 1) % STATUSES.length;
    state.status = STATUSES[idx].key;
    if (state.status === "departed") state.activeGroup = totalGroups;
    if (state.status === "boarding" && state.activeGroup > totalGroups) state.activeGroup = 1;
    renderAll();
    toast("Status: " + STATUSES[idx].label);
  }

  function reset() {
    state.activeGroup = 1;
    state.status = "boarding";
    state.boardCloseAt = Date.now() + 18 * 60 * 1000;
    renderAll();
    toast("Display reset");
  }

  // ---- Wire up ----
  advanceBtn.addEventListener("click", advanceGroup);
  statusBtn.addEventListener("click", cycleStatus);
  resetBtn.addEventListener("click", reset);

  // Click a group to jump boarding to it (only while boarding)
  groupEls.forEach(function (el) {
    el.addEventListener("click", function () {
      if (state.status !== "boarding") return;
      state.activeGroup = parseInt(el.getAttribute("data-group"), 10);
      renderAll();
      toast("Now boarding Group " + state.activeGroup);
    });
  });

  // ---- Timers ----
  tickClock();
  setInterval(tickClock, 1000 * 15);
  setInterval(renderCountdown, 1000);

  renderAll();
})();
