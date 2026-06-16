/* Northwind — Trial countdown banner
   Vanilla JS. A live-ish countdown from a fixed fictional trial window,
   a usage progress bar, dismiss-to-collapse, and an expired (red) variant. */
(function () {
  "use strict";

  var TRIAL_DAYS = 14;
  var DAY_MS = 24 * 60 * 60 * 1000;
  var HOUR_MS = 60 * 60 * 1000;
  var MIN_MS = 60 * 1000;

  // Fixed fictional timeline: trial started 11.3 days ago, so ~2 days remain.
  // Kept relative to "now" so the countdown ticks live without a real backend.
  var now = Date.now();
  var trialStart = now - Math.round(11.3 * DAY_MS);
  var trialEnd = trialStart + TRIAL_DAYS * DAY_MS;

  var banner = document.getElementById("banner");
  var head = document.getElementById("banner-head");
  var countText = document.getElementById("count-text");
  var sub = document.getElementById("banner-sub");
  var fill = document.getElementById("progress-fill");
  var bar = document.getElementById("progress-bar");
  var progLabel = document.getElementById("progress-label");
  var addBilling = document.getElementById("add-billing");
  var dismiss = document.getElementById("dismiss");
  var planState = document.getElementById("plan-state");
  var toastEl = document.getElementById("toast");

  var timer = null;
  var toastTimer = null;
  var expired = false;

  /* ---- toast helper ---- */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs on re-show
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
      window.setTimeout(function () {
        toastEl.hidden = true;
      }, 240);
    }, 2600);
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  /* ---- format the remaining-time label ---- */
  function formatRemaining(ms) {
    if (ms <= 0) return "0 days";
    var days = Math.floor(ms / DAY_MS);
    var hours = Math.floor((ms % DAY_MS) / HOUR_MS);
    var mins = Math.floor((ms % HOUR_MS) / MIN_MS);
    if (days >= 1) {
      return plural(days, "day") + " " + plural(hours, "hr");
    }
    if (hours >= 1) {
      return plural(hours, "hr") + " " + plural(mins, "min");
    }
    var secs = Math.floor((ms % MIN_MS) / 1000);
    return plural(mins, "min") + " " + plural(secs, "sec");
  }

  /* ---- render the expired (red) state ---- */
  function renderExpired() {
    if (expired) return;
    expired = true;
    window.clearInterval(timer);
    timer = null;

    banner.classList.add("is-expired");
    head.innerHTML = "Your <strong>Pro</strong> trial has ended";
    countText.textContent = "expired";
    sub.textContent =
      "Pro features are paused. Add a billing method to restore analytics, SSO and your projects.";
    fill.style.width = "100%";
    bar.setAttribute("aria-valuenow", "100");
    progLabel.textContent = "Day " + TRIAL_DAYS + " of " + TRIAL_DAYS;
    if (planState) planState.textContent = "ended";
  }

  /* ---- render the active countdown state ---- */
  function renderActive() {
    var remaining = trialEnd - Date.now();
    if (remaining <= 0) {
      renderExpired();
      return;
    }
    var elapsed = Date.now() - trialStart;
    var pct = Math.min(100, Math.max(0, (elapsed / (trialEnd - trialStart)) * 100));
    var dayNum = Math.min(TRIAL_DAYS, Math.floor(elapsed / DAY_MS) + 1);

    countText.textContent = formatRemaining(remaining);
    fill.style.width = pct.toFixed(1) + "%";
    bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    progLabel.textContent = "Day " + dayNum + " of " + TRIAL_DAYS;
  }

  function startTicking() {
    renderActive();
    if (timer) window.clearInterval(timer);
    // tick each second; the seconds only surface in the final minute
    timer = window.setInterval(renderActive, 1000);
  }

  /* ---- dismiss collapses the banner ---- */
  function collapse() {
    var h = banner.offsetHeight;
    banner.style.height = h + "px";
    void banner.offsetWidth;
    banner.classList.add("is-dismissed");
    window.clearInterval(timer);
    timer = null;
    toast("Banner dismissed — find your trial under Billing.");
  }

  /* ---- demo jump controls ---- */
  function jump(state) {
    if (state === "default") {
      expired = false;
      banner.classList.remove("is-expired", "is-dismissed");
      banner.style.height = "";
      head.innerHTML =
        'Your <strong>Pro</strong> trial ends in <span class="banner__count" id="count-text">14 days</span>';
      countText = document.getElementById("count-text");
      sub.textContent =
        "Add a billing method now to keep advanced analytics, SSO and unlimited projects without interruption.";
      if (planState) planState.textContent = "active";
      trialStart = Date.now() - Math.round(11.3 * DAY_MS);
      trialEnd = trialStart + TRIAL_DAYS * DAY_MS;
      startTicking();
      toast("Reset — about 2 days left on the trial.");
    } else if (state === "soon") {
      expired = false;
      banner.classList.remove("is-expired", "is-dismissed");
      banner.style.height = "";
      if (planState) planState.textContent = "active";
      // 25 minutes remaining, so hours/minutes show
      trialEnd = Date.now() + 25 * MIN_MS;
      trialStart = trialEnd - TRIAL_DAYS * DAY_MS;
      startTicking();
      toast("Fast-forwarded — trial ends in 25 minutes.");
    } else if (state === "expired") {
      banner.classList.remove("is-dismissed");
      banner.style.height = "";
      trialEnd = Date.now() - 5 * MIN_MS;
      trialStart = trialEnd - TRIAL_DAYS * DAY_MS;
      expired = false;
      renderExpired();
      toast("Trial forced to expired state.");
    }
  }

  /* ---- wire events ---- */
  dismiss.addEventListener("click", collapse);

  addBilling.addEventListener("click", function () {
    toast(
      expired
        ? "Restoring Pro — opening secure billing…"
        : "Opening secure billing to keep your Pro plan…"
    );
  });

  // Esc dismisses the banner if it's open
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !banner.classList.contains("is-dismissed")) {
      collapse();
    }
  });

  document.querySelectorAll(".demo__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      jump(b.getAttribute("data-jump"));
    });
  });

  startTicking();
})();
