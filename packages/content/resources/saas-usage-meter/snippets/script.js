(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- Icons (inline SVG markup) ---------- */
  var ICONS = {
    api: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    storage: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/>',
    seats: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    builds: '<path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a2 2 0 1 0 2.8 2.8l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.5 2.5-2-2 2.5-2.5z"/>'
  };

  /* ---------- Data model ----------
     Limits differ per billing period (yearly plans grant more headroom). */
  var RESOURCES = [
    {
      id: "api", icon: "api", title: "API calls", unit: "",
      sub: "REST + GraphQL requests",
      used: 742000,
      limit: { month: 1000000, year: 14000000 },
      growth: 1.18,
      fmt: "compact"
    },
    {
      id: "storage", icon: "storage", title: "Object storage", unit: "GB",
      sub: "Uploads & backups",
      used: 84,
      limit: { month: 100, year: 250 },
      growth: 1.07,
      fmt: "gb"
    },
    {
      id: "seats", icon: "seats", title: "Team seats", unit: "",
      sub: "Active members",
      used: 18,
      limit: { month: 20, year: 20 },
      growth: 1.04,
      fmt: "int"
    },
    {
      id: "builds", icon: "builds", title: "CI builds", unit: "",
      sub: "Pipeline minutes used",
      used: 5200,
      limit: { month: 6000, year: 80000 },
      growth: 1.22,
      fmt: "int"
    }
  ];

  var WARN_AT = 0.8;
  var DANGER_AT = 0.95;

  var state = { period: "month", dismissedUpsell: false };

  /* ---------- Formatting ---------- */
  function fmtValue(v, fmt) {
    if (fmt === "gb") return Math.round(v) + " GB";
    if (fmt === "compact") return compact(v);
    return Math.round(v).toLocaleString("en-US");
  }
  function compact(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return String(Math.round(v));
  }

  function stateFor(ratio) {
    if (ratio >= DANGER_AT) return "danger";
    if (ratio >= WARN_AT) return "warn";
    return "ok";
  }

  /* ---------- Period reset countdown ---------- */
  function nextReset() {
    var now = new Date();
    if (state.period === "year") {
      return new Date(now.getFullYear() + 1, 0, 1);
    }
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  function updateCountdown() {
    var ms = nextReset() - new Date();
    var days = Math.floor(ms / 86400000);
    var hrs = Math.floor((ms % 86400000) / 3600000);
    var label;
    if (days > 0) label = days + (days === 1 ? " day" : " days");
    else label = hrs + (hrs === 1 ? " hour" : " hours");
    document.getElementById("reset-countdown").textContent = label;
  }

  /* ---------- Render meters ---------- */
  var metersEl = document.getElementById("meters");

  function buildMeters() {
    metersEl.innerHTML = "";
    RESOURCES.forEach(function (r) {
      var el = document.createElement("article");
      el.className = "meter";
      el.dataset.id = r.id;
      el.innerHTML =
        '<div class="meter-head">' +
          '<span class="meter-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[r.icon] + '</svg></span>' +
          '<div><div class="meter-title">' + r.title + '</div><div class="meter-sub">' + r.sub + '</div></div>' +
          '<span class="meter-state" data-state="ok">OK</span>' +
        '</div>' +
        '<div class="meter-values"><span class="meter-used">0</span><span class="meter-limit"></span></div>' +
        '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="' + r.title + ' usage"><span class="bar-fill" data-state="ok"></span></div>' +
        '<div class="meter-foot"><span class="meter-pct">0%</span><span class="meter-note"></span></div>';
      metersEl.appendChild(el);
    });
  }

  function renderMeter(r) {
    var el = metersEl.querySelector('[data-id="' + r.id + '"]');
    var limit = r.limit[state.period];
    var ratio = r.used / limit;
    var pct = Math.min(ratio * 100, 100);
    var st = stateFor(ratio);

    el.classList.toggle("is-danger", st === "danger");
    el.querySelector(".meter-used").textContent = fmtValue(r.used, r.fmt);
    el.querySelector(".meter-limit").textContent = "/ " + fmtValue(limit, r.fmt) + (r.unit && r.fmt !== "gb" ? " " + r.unit : "");

    var fill = el.querySelector(".bar-fill");
    fill.style.width = pct + "%";
    fill.dataset.state = st;

    var bar = el.querySelector(".bar");
    bar.setAttribute("aria-valuenow", Math.round(pct));

    var badge = el.querySelector(".meter-state");
    badge.dataset.state = st;
    badge.textContent = st === "danger" ? (ratio >= 1 ? "OVER" : "CRITICAL") : st === "warn" ? "NEAR CAP" : "OK";

    el.querySelector(".meter-pct").textContent = Math.round(ratio * 100) + "% used";

    /* Projected overage: extrapolate to end of period using growth factor */
    var note = el.querySelector(".meter-note");
    note.className = "meter-note";
    var projected = r.used * r.growth;
    if (r.used > limit) {
      note.classList.add("is-over");
      note.textContent = "Over by " + fmtValue(r.used - limit, r.fmt);
    } else if (projected > limit) {
      note.classList.add("is-near");
      note.textContent = "Projected " + fmtValue(projected, r.fmt) + " — overage likely";
    } else {
      note.textContent = fmtValue(limit - r.used, r.fmt) + " left";
    }
    return { ratio: ratio, st: st };
  }

  /* ---------- Summary + health ---------- */
  function renderAll() {
    var totalUsed = 0, totalLimit = 0, worst = "ok", overCount = 0, nearCount = 0;
    RESOURCES.forEach(function (r) {
      var res = renderMeter(r);
      var limit = r.limit[state.period];
      totalUsed += Math.min(r.used, limit);
      totalLimit += limit;
      if (res.st === "danger") { worst = "danger"; overCount++; }
      else if (res.st === "warn") { if (worst !== "danger") worst = "warn"; nearCount++; }
    });

    var aggPct = Math.round((totalUsed / totalLimit) * 100);
    document.getElementById("summary-fill").style.width = aggPct + "%";
    document.getElementById("summary-pct").textContent = aggPct + "%";
    document.getElementById("meter-count").textContent = RESOURCES.length;

    var pill = document.getElementById("health-pill");
    var label = document.getElementById("health-label");
    pill.dataset.state = worst;
    if (worst === "danger") label.textContent = overCount + (overCount === 1 ? " resource over limit" : " resources over limit");
    else if (worst === "warn") label.textContent = nearCount + (nearCount === 1 ? " resource near cap" : " resources near cap");
    else label.textContent = "All within limits";

    updateUpsell(worst, overCount, nearCount);
    updateCountdown();
  }

  /* ---------- Upsell prompt ---------- */
  var upsell = document.getElementById("upsell");
  function updateUpsell(worst, overCount, nearCount) {
    if (state.dismissedUpsell || worst === "ok") {
      upsell.hidden = true;
      return;
    }
    upsell.hidden = false;
    var title = document.getElementById("upsell-title");
    var text = document.getElementById("upsell-text");
    if (worst === "danger") {
      title.textContent = "Limit reached on " + overCount + (overCount === 1 ? " resource" : " resources");
      text.textContent = "Overage rates apply once you exceed your plan. Upgrade now to keep usage uninterrupted.";
    } else {
      title.textContent = "You're approaching a limit";
      text.textContent = nearCount + (nearCount === 1 ? " resource is" : " resources are") + " near the cap. Upgrade to add headroom before the cycle resets.";
    }
  }

  /* ---------- Simulate usage ---------- */
  var simBtn = document.getElementById("simulate");
  var simRunning = false;
  function simulate() {
    if (simRunning) return;
    simRunning = true;
    simBtn.disabled = true;
    state.dismissedUpsell = false;
    var ticks = 0;
    var iv = setInterval(function () {
      ticks++;
      RESOURCES.forEach(function (r) {
        var limit = r.limit[state.period];
        /* bump by a small random fraction of the limit; seats grow slower */
        var step = (r.id === "seats" ? 0.02 : 0.04 + Math.random() * 0.06) * limit * Math.random();
        if (r.id === "seats") step = Math.random() < 0.4 ? 1 : 0;
        r.used = Math.min(r.used + step, limit * 1.12);
        if (r.id === "seats") r.used = Math.round(r.used);
      });
      renderAll();
      if (ticks >= 6) {
        clearInterval(iv);
        simRunning = false;
        simBtn.disabled = false;
        toast("Simulated 6 usage events");
      }
    }, 320);
  }
  simBtn.addEventListener("click", simulate);

  /* ---------- Period toggle ---------- */
  var periodBtns = document.querySelectorAll(".period-btn");
  periodBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      periodBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      state.period = btn.dataset.period;
      renderAll();
      toast(state.period === "year" ? "Showing yearly quotas" : "Showing monthly quotas");
    });
  });

  /* ---------- Upsell actions ---------- */
  document.getElementById("upsell-dismiss").addEventListener("click", function () {
    state.dismissedUpsell = true;
    upsell.hidden = true;
    toast("Reminder dismissed for this session");
  });
  document.getElementById("upsell-cta").addEventListener("click", function () {
    toast("Opening upgrade flow… (demo)");
  });

  /* ---------- Init ---------- */
  buildMeters();
  renderAll();
})();
