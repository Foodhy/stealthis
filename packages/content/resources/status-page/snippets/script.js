(function () {
  var tooltip = document.getElementById("uptimeTooltip");
  var subscribeOverlay = document.getElementById("subscribeOverlay");
  var subscribeClose = document.getElementById("subscribeClose");
  var subscribeOpen = document.getElementById("subscribeOpen");
  var subscribeForm = document.getElementById("subscribeForm");
  var subscribeEmail = document.getElementById("subscribeEmail");
  var lastCheckedEl = document.getElementById("lastChecked");
  var toast = document.getElementById("toast");

  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
  }

  // ── Generate 90-day uptime bars ──────────────
  // Use a seeded pseudo-random so the bars look consistent per service
  function seededRandom(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  var serviceSeeds = {
    website: 42,
    api: 137,
    dashboard: 256,
    database: 789,
    cdn: 55,
    email: 321,
    auth: 999
  };

  // Known incident days (days ago) that should be degraded/outage
  var knownIncidents = {
    database: { 1: "degraded", 2: "degraded" },
    api: { 8: "outage" }
  };

  var uptimeBars = document.querySelectorAll(".uptime-bar");

  uptimeBars.forEach(function (bar) {
    var service = bar.dataset.service;
    var seed = serviceSeeds[service] || 100;
    var incidents = knownIncidents[service] || {};

    for (var i = 89; i >= 0; i--) {
      var dayEl = document.createElement("div");
      dayEl.className = "day-segment";

      var date = new Date();
      date.setDate(date.getDate() - i);
      var dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      var status;
      if (incidents[i]) {
        status = incidents[i];
      } else {
        var rand = seededRandom(seed + i);
        if (rand < 0.02) {
          status = "outage";
        } else if (rand < 0.06) {
          status = "degraded";
        } else {
          status = "operational";
        }
      }

      dayEl.classList.add("day-" + status);
      dayEl.dataset.date = dateStr;

      var statusLabel = status === "operational" ? "No issues" :
                        status === "degraded" ? "Degraded performance" :
                        "Major outage";
      dayEl.dataset.status = statusLabel;

      bar.appendChild(dayEl);
    }
  });

  // ── Tooltip on hover ─────────────────────────
  document.addEventListener("mouseover", function (e) {
    var seg = e.target.closest(".day-segment");
    if (!seg) return;

    tooltip.textContent = seg.dataset.date + " \u2014 " + seg.dataset.status;
    tooltip.classList.add("visible");
  });

  document.addEventListener("mousemove", function (e) {
    if (tooltip.classList.contains("visible")) {
      tooltip.style.left = e.clientX + 12 + "px";
      tooltip.style.top = e.clientY - 36 + "px";
    }
  });

  document.addEventListener("mouseout", function (e) {
    var seg = e.target.closest(".day-segment");
    if (seg) {
      tooltip.classList.remove("visible");
    }
  });

  // ── Incident expand/collapse ─────────────────
  var incidents = document.querySelectorAll(".incident");

  incidents.forEach(function (incident) {
    var header = incident.querySelector(".incident-header");
    var body = incident.querySelector(".incident-body");

    header.addEventListener("click", function () {
      var expanded = incident.dataset.expanded === "true";
      incident.dataset.expanded = expanded ? "false" : "true";
      body.style.display = expanded ? "none" : "block";
    });

    header.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.click();
      }
    });
  });

  // ── Subscribe modal ──────────────────────────
  subscribeOpen.addEventListener("click", function () {
    subscribeOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    subscribeEmail.focus();
  });

  function closeSubscribe() {
    subscribeOverlay.classList.remove("open");
    document.body.style.overflow = "";
    subscribeEmail.value = "";
    subscribeEmail.classList.remove("error");
  }

  subscribeClose.addEventListener("click", closeSubscribe);

  subscribeOverlay.addEventListener("click", function (e) {
    if (e.target === subscribeOverlay) closeSubscribe();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSubscribe();
  });

  subscribeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = subscribeEmail.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      subscribeEmail.classList.add("error");
      return;
    }

    subscribeEmail.classList.remove("error");
    closeSubscribe();
    showToast("Subscribed! You'll receive status updates at " + email);
  });

  subscribeEmail.addEventListener("input", function () {
    subscribeEmail.classList.remove("error");
  });

  // ── Auto-refresh indicator ───────────────────
  var refreshCounter = 0;

  function updateLastChecked() {
    refreshCounter += 30;
    if (refreshCounter < 60) {
      lastCheckedEl.textContent = refreshCounter + "s ago";
    } else {
      var mins = Math.floor(refreshCounter / 60);
      lastCheckedEl.textContent = mins + "m ago";
    }
  }

  setInterval(updateLastChecked, 30000);
})();
