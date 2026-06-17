(function () {
  "use strict";

  // Ordered active stages (rejected is a terminal off-track state)
  var STAGES = ["applied", "screening", "interview", "offer", "hired"];
  var LABELS = {
    applied: "Applied",
    screening: "Screening",
    interview: "Interview",
    offer: "Offer",
    hired: "Hired",
    rejected: "Rejected"
  };

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- featured stepper ---------- */
  var stepper = document.getElementById("stepper");
  var steps = Array.prototype.slice.call(stepper.querySelectorAll(".step"));
  var featPill = document.getElementById("feat-pill");
  var featLabel = featPill.querySelector("[data-pill-label]");
  var btnAdvance = document.getElementById("btn-advance");
  var btnBack = document.getElementById("btn-back");
  var btnReject = document.getElementById("btn-reject");
  var btnReset = document.getElementById("btn-reset");

  var state = { stage: "interview", rejected: false };

  function renderStepper(animate) {
    var idx = STAGES.indexOf(state.stage);

    steps.forEach(function (step, i) {
      step.classList.remove("done", "current");
      if (state.rejected) {
        if (i < idx) step.classList.add("done");
        else if (i === idx) step.classList.add("current");
      } else {
        if (i < idx) step.classList.add("done");
        else if (i === idx) step.classList.add("current");
      }
    });

    stepper.classList.toggle("rejected", state.rejected);

    // pill
    var key = state.rejected ? "rejected" : state.stage;
    featPill.setAttribute("data-pill", key);
    featLabel.textContent = LABELS[key];

    // bump animation on the active node
    if (animate) {
      var active = steps[idx] && steps[idx].querySelector(".node");
      if (active) {
        active.classList.remove("bump");
        // force reflow so the animation can re-trigger
        void active.offsetWidth;
        active.classList.add("bump");
      }
    }

    // button availability
    btnAdvance.disabled = !state.rejected && state.stage === "hired";
    btnBack.disabled = state.rejected || state.stage === "applied";
  }

  btnAdvance.addEventListener("click", function () {
    if (state.rejected) {
      // re-open a rejected application back onto the track
      state.rejected = false;
      renderStepper(true);
      toast("Re-opened — back to " + LABELS[state.stage]);
      return;
    }
    var idx = STAGES.indexOf(state.stage);
    if (idx < STAGES.length - 1) {
      state.stage = STAGES[idx + 1];
      renderStepper(true);
      toast(
        state.stage === "hired"
          ? "Hired! Offer accepted 🎉"
          : "Moved to " + LABELS[state.stage]
      );
    }
  });

  btnBack.addEventListener("click", function () {
    var idx = STAGES.indexOf(state.stage);
    if (idx > 0) {
      state.stage = STAGES[idx - 1];
      renderStepper(true);
      toast("Moved back to " + LABELS[state.stage]);
    }
  });

  btnReject.addEventListener("click", function () {
    if (state.rejected) {
      toast("Already marked rejected");
      return;
    }
    state.rejected = true;
    renderStepper(true);
    toast("Application marked rejected");
  });

  btnReset.addEventListener("click", function () {
    state = { stage: "applied", rejected: false };
    renderStepper(true);
    toast("Reset to Applied");
  });

  renderStepper(false);

  /* ---------- application list ---------- */
  var APPS = [
    { role: "Product Designer", co: "Lumen Labs", logo: "LL", color: "#7c3aed", loc: "Berlin", remote: true, pay: "€72k", status: "screening", saved: false, when: "2d ago" },
    { role: "Backend Engineer (Go)", co: "Harborstack", logo: "HS", color: "#0891b2", loc: "Remote (EU)", remote: true, pay: "€95k", status: "interview", saved: true, when: "4h ago" },
    { role: "Data Analyst", co: "Brightpath", logo: "BP", color: "#16a34a", loc: "Madrid", remote: false, pay: "€48k", status: "applied", saved: false, when: "1d ago" },
    { role: "Engineering Manager", co: "Novabyte", logo: "NV", color: "#2563eb", loc: "Lisbon", remote: true, pay: "€118k", status: "offer", saved: true, when: "6h ago" },
    { role: "UX Researcher", co: "Cedarwave", logo: "CW", color: "#d97706", loc: "Amsterdam", remote: false, pay: "€61k", status: "hired", saved: false, when: "Yesterday" },
    { role: "DevOps Engineer", co: "Quartz IO", logo: "QZ", color: "#dc2626", loc: "Remote", remote: true, pay: "€88k", status: "rejected", saved: false, when: "3d ago" }
  ];

  var rows = document.getElementById("rows");
  var currentFilter = "all";

  var ACTIVE = ["applied", "screening", "interview"];

  function matchesFilter(status, filter) {
    if (filter === "all") return true;
    if (filter === "active") return ACTIVE.indexOf(status) !== -1;
    if (filter === "offer") return status === "offer" || status === "hired";
    if (filter === "rejected") return status === "rejected";
    return true;
  }

  var BOOKMARK =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M6 4.5C6 3.67 6.67 3 7.5 3h9C17.33 3 18 3.67 18 4.5V21l-6-3.6L6 21V4.5Z" ' +
    'stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" ' +
    'class="bm-fill"/></svg>';

  function buildRow(app, i) {
    var li = document.createElement("li");
    li.className = "row";
    li.dataset.status = app.status;
    li.dataset.idx = i;
    if (!matchesFilter(app.status, currentFilter)) li.hidden = true;

    var remoteChip = app.remote
      ? '<span class="r-chip remote">Remote</span>'
      : '<span class="r-chip">On-site</span>';

    li.innerHTML =
      '<span class="r-logo" style="background:' + app.color + '">' + app.logo + "</span>" +
      '<div class="r-main">' +
        '<div class="r-role">' + app.role + "</div>" +
        '<div class="r-sub">' +
          "<span>" + app.co + "</span>" +
          '<span class="r-chip">' + app.loc + "</span>" +
          remoteChip +
          '<span class="r-chip">' + app.pay + "</span>" +
          '<span class="r-pill-wrap"><span class="pill" data-pill="' + app.status + '">' +
            '<span class="dot"></span>' + LABELS[app.status] + "</span></span>" +
        "</div>" +
      "</div>" +
      '<span class="r-meta">' + app.when + "</span>" +
      '<button type="button" class="save' + (app.saved ? " is-saved" : "") +
        '" aria-pressed="' + app.saved + '" aria-label="Save ' + app.role + '">' +
        BOOKMARK + "</button>";

    var saveBtn = li.querySelector(".save");
    saveBtn.addEventListener("click", function () {
      app.saved = !app.saved;
      saveBtn.classList.toggle("is-saved", app.saved);
      saveBtn.setAttribute("aria-pressed", String(app.saved));
      saveBtn.querySelector(".bm-fill").setAttribute("fill", app.saved ? "currentColor" : "none");
      toast(app.saved ? "Saved " + app.role : "Removed from saved");
    });
    if (app.saved) li.querySelector(".bm-fill").setAttribute("fill", "currentColor");

    return li;
  }

  function renderList() {
    rows.innerHTML = "";
    APPS.forEach(function (app, i) {
      rows.appendChild(buildRow(app, i));
    });
  }

  function applyFilter(filter) {
    currentFilter = filter;
    Array.prototype.forEach.call(rows.children, function (li) {
      li.hidden = !matchesFilter(li.dataset.status, filter);
    });
  }

  // filter chips
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.dataset.filter);
    });
  });

  // total count badge
  var countAll = document.querySelector("[data-count-all]");
  if (countAll) countAll.textContent = String(APPS.length);

  renderList();
})();
