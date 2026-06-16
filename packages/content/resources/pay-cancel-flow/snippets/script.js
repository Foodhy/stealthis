(function () {
  "use strict";

  /* ---------- Data ---------- */
  // Maps a cancel reason to the retention offer it should surface.
  var REASONS = {
    price: {
      label: "Too expensive",
      offer: "discount",
      title: "How about 40% off?",
      lead: "Price is the only blocker? Keep everything you have for less.",
      accept: "We dropped your bill to $29/mo for the next 3 months.",
      savedTitle: "Discount applied",
      savedLead: "You'll pay $29/mo for the next 3 billing cycles. Cancel anytime — no lock-in.",
    },
    unused: {
      label: "Not using it enough",
      offer: "pause",
      title: "Take a break instead",
      lead: "No need to cancel — pause your plan and pick it up when you're ready.",
      accept: "Your subscription is paused.",
      savedTitle: "Subscription paused",
      savedLead: "Billing is frozen and your workspace is safe. We'll resume automatically when your pause ends.",
    },
    temporary: {
      label: "Just need a break",
      offer: "pause",
      title: "Pause, don't cancel",
      lead: "Step away for a while and come back to everything exactly where you left it.",
      accept: "Your subscription is paused.",
      savedTitle: "Subscription paused",
      savedLead: "Billing is frozen and your workspace is safe. We'll resume automatically when your pause ends.",
    },
    missing: {
      label: "Missing a feature",
      offer: "handoff",
      title: "Tell us what's missing",
      lead: "There's a good chance it's already on the roadmap — or coming sooner than you think.",
      accept: "A specialist will reach out, and your free month is on.",
      savedTitle: "We're on it",
      savedLead: "A product specialist will email you within one business day, and your next month of Pro is free.",
      handoffName: "Talk to a product specialist",
      handoffDesc: "A 15-minute call might cover the gap you're hitting — plus a free month of Pro while we work on it.",
    },
    switching: {
      label: "Switching tools",
      offer: "handoff",
      title: "Before you migrate…",
      lead: "We can match what pulled you away — and make the move back painless if it doesn't stick.",
      accept: "We'll keep your data warm and send a free month.",
      savedTitle: "We'll keep things warm",
      savedLead: "Your workspace and data stay intact for 90 days, and your next month of Pro is free if you stay.",
      handoffName: "Let's keep you covered",
      handoffDesc: "Tell us what the other tool does better. We'll keep your data exportable for 90 days and add a free month.",
    },
  };

  var PRICES = { 1: "July 13, 2026", 2: "August 13, 2026", 3: "September 13, 2026" };

  /* ---------- State ---------- */
  var state = { step: 0, reason: null, pauseMonths: 1 };
  var TOTAL = 3;

  /* ---------- Elements ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var stepsEl = $$(".step");
  var progressFill = $("#progressFill");
  var progressTrack = $(".progress-track");
  var panels = $$(".panel");
  var actions = $("#actions");

  var backBtn = $("#backBtn");
  var nextBtn = $("#nextBtn");
  var declineBtn = $("#declineBtn");
  var acceptBtn = $("#acceptBtn");
  var confirmCancelBtn = $("#confirmCancelBtn");

  var offerTitle = $("#offerTitle");
  var offerLead = $("#offerLead");
  var summaryReason = $("#summaryReason");

  var feedback = $("#feedback");
  var feedbackCount = $("#feedbackCount");

  var card = $(".card");
  var progressNav = $(".progress");
  var savedScreen = $("#savedScreen");
  var goodbyeScreen = $("#goodbyeScreen");

  /* ---------- Toast ---------- */
  var toastWrap = $("#toastWrap");
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast";
    var icon = kind === "warn"
      ? '<path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/>'
      : '<path d="m4 12 5 5L20 6"/>';
    t.innerHTML =
      '<span class="toast-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      icon + "</svg></span><span>" + msg + "</span>";
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  /* ---------- Render step ---------- */
  function renderProgress() {
    var pct = Math.round(((state.step + 1) / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    progressTrack.setAttribute("aria-valuenow", String(pct));

    stepsEl.forEach(function (s, i) {
      s.classList.toggle("is-active", i === state.step);
      s.classList.toggle("is-done", i < state.step);
      if (i === state.step) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });
  }

  function showPanel(idx) {
    panels.forEach(function (p) {
      var n = Number(p.getAttribute("data-panel"));
      p.hidden = n !== idx;
    });
  }

  function renderActions() {
    backBtn.hidden = state.step === 0;
    nextBtn.hidden = state.step !== 0;
    declineBtn.hidden = state.step !== 1;
    acceptBtn.hidden = state.step !== 1;
    confirmCancelBtn.hidden = state.step !== 2;
    nextBtn.disabled = state.step === 0 && !state.reason;
  }

  function render() {
    showPanel(state.step);
    renderProgress();
    renderActions();
    actions.hidden = false;
    progressNav.hidden = false;
    card.hidden = false;
    savedScreen.hidden = true;
    goodbyeScreen.hidden = true;
    // Move focus to the panel heading for screen-reader continuity.
    var heading = panels[state.step] && panels[state.step].querySelector(".panel-title");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: false });
    }
  }

  /* ---------- Offer rendering (step 2) ---------- */
  function renderOffer() {
    var cfg = REASONS[state.reason];
    offerTitle.textContent = cfg.title;
    offerLead.textContent = cfg.lead;

    $$(".offer").forEach(function (o) {
      o.hidden = o.getAttribute("data-offer") !== cfg.offer;
    });

    if (cfg.offer === "handoff") {
      $("#handoffName").textContent = cfg.handoffName;
      $("#handoffDesc").textContent = cfg.handoffDesc;
    }
    if (cfg.offer === "pause") {
      updatePauseDate();
    }
  }

  function updatePauseDate() {
    var el = $("#pauseDate");
    if (el) el.textContent = PRICES[state.pauseMonths];
  }

  /* ---------- Reason selection (step 1) ---------- */
  $$('input[name="reason"]').forEach(function (input) {
    input.addEventListener("change", function () {
      state.reason = input.value;
      nextBtn.disabled = false;
    });
  });

  /* ---------- Pause picker ---------- */
  var pausePicker = $(".pause-picker");
  if (pausePicker) {
    var opts = $$(".pause-opt", pausePicker);
    opts.forEach(function (opt) {
      opt.addEventListener("click", function () {
        opts.forEach(function (o) {
          o.classList.remove("is-active");
          o.setAttribute("aria-checked", "false");
        });
        opt.classList.add("is-active");
        opt.setAttribute("aria-checked", "true");
        state.pauseMonths = Number(opt.getAttribute("data-months"));
        updatePauseDate();
      });
    });
    // Arrow-key support for the radiogroup.
    pausePicker.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var i = opts.indexOf(document.activeElement);
      if (i < 0) i = opts.findIndex(function (o) { return o.classList.contains("is-active"); });
      var next = e.key === "ArrowRight" ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
      opts[next].focus();
      opts[next].click();
    });
  }

  /* ---------- Feedback counter ---------- */
  feedback.addEventListener("input", function () {
    feedbackCount.textContent = feedback.value.length + " / 400";
  });

  /* ---------- Navigation ---------- */
  function goTo(step) {
    state.step = Math.max(0, Math.min(TOTAL - 1, step));
    if (state.step === 1) renderOffer();
    if (state.step === 2) summaryReason.textContent = REASONS[state.reason].label;
    render();
  }

  nextBtn.addEventListener("click", function () {
    if (!state.reason) {
      toast("Pick a reason to continue", "warn");
      return;
    }
    goTo(1);
  });

  backBtn.addEventListener("click", function () {
    goTo(state.step - 1);
  });

  declineBtn.addEventListener("click", function () {
    goTo(2);
  });

  /* ---------- Accept offer -> saved state ---------- */
  acceptBtn.addEventListener("click", function () {
    var cfg = REASONS[state.reason];
    // Mark all steps complete on the indicator.
    stepsEl.forEach(function (s) { s.classList.add("is-done"); s.classList.remove("is-active"); s.removeAttribute("aria-current"); });
    progressFill.style.width = "100%";
    progressTrack.setAttribute("aria-valuenow", "100");

    card.hidden = true;
    goodbyeScreen.hidden = true;
    $("#savedTitle").textContent = cfg.savedTitle;
    $("#savedLead").textContent = cfg.savedLead;
    savedScreen.hidden = false;
    savedScreen.querySelector(".outcome-title").setAttribute("tabindex", "-1");
    savedScreen.querySelector(".outcome-title").focus();
    toast(cfg.accept);
  });

  /* ---------- Confirm cancel -> goodbye state ---------- */
  confirmCancelBtn.addEventListener("click", function () {
    stepsEl.forEach(function (s) { s.classList.add("is-done"); s.classList.remove("is-active"); s.removeAttribute("aria-current"); });
    progressFill.style.width = "100%";
    progressTrack.setAttribute("aria-valuenow", "100");

    var ref = "NW-CXL-" + String(Math.floor(1000 + Math.random() * 8999));
    $("#cancelRef").textContent = ref;

    card.hidden = true;
    savedScreen.hidden = true;
    goodbyeScreen.hidden = false;
    goodbyeScreen.querySelector(".outcome-title").setAttribute("tabindex", "-1");
    goodbyeScreen.querySelector(".outcome-title").focus();
    toast("Plan cancelled · ref " + ref, "warn");
  });

  /* ---------- Outcome actions (restart flow) ---------- */
  function restart() {
    state = { step: 0, reason: null, pauseMonths: 1 };
    $$('input[name="reason"]').forEach(function (i) { i.checked = false; });
    feedback.value = "";
    feedbackCount.textContent = "0 / 400";
    if (pausePicker) {
      $$(".pause-opt", pausePicker).forEach(function (o, idx) {
        o.classList.toggle("is-active", idx === 0);
        o.setAttribute("aria-checked", idx === 0 ? "true" : "false");
      });
    }
    stepsEl.forEach(function (s) { s.classList.remove("is-done"); });
    render();
  }

  $("#savedDone").addEventListener("click", function () {
    toast("Back to billing settings");
    restart();
  });
  $("#goodbyeDone").addEventListener("click", function () {
    toast("Returned to billing settings");
    restart();
  });
  $("#reactivateBtn").addEventListener("click", function () {
    toast("Welcome back — Pro reactivated");
    restart();
  });

  /* ---------- Esc returns to billing from outcome screens ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!savedScreen.hidden || !goodbyeScreen.hidden) {
      restart();
    }
  });

  /* ---------- Init ---------- */
  render();
})();
