(function () {
  "use strict";

  var form = document.getElementById("intakeForm");
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll(".panel"));
  var stepItems = Array.prototype.slice.call(document.querySelectorAll(".steps__item"));
  var progressBar = document.querySelector(".progress");
  var progressFill = document.querySelector(".progress__fill");
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var submitBtn = document.getElementById("submitBtn");
  var litigationBlock = document.getElementById("litigationBlock");
  var matterSelect = document.getElementById("matterType");
  var runConflictBtn = document.getElementById("runConflict");
  var conflictResult = document.getElementById("conflictResult");
  var reviewList = document.getElementById("reviewList");
  var doneEl = document.getElementById("done");

  var current = 0;
  var TOTAL = panels.length;

  // Persisted state across steps.
  var state = {
    fullName: "", email: "", phone: "", contactMethod: "Email",
    matterType: "", urgency: "Standard", opposingParty: "", summary: "",
    relatedParties: "", priorRep: false, attest: false
  };

  // Mock existing-client roster for the conflict screen.
  var FIRM_CLIENTS = [
    "harlow ventures", "dennis park", "northgate realty",
    "claudia messina", "orion freight co", "samuel okafor"
  ];

  var LABELS = {
    fullName: "Full legal name", email: "Email", phone: "Phone",
    contactMethod: "Preferred contact", matterType: "Matter type",
    urgency: "Urgency", opposingParty: "Opposing party", summary: "Description",
    relatedParties: "Other parties", priorRep: "Prior representation",
    attest: "Attestation"
  };

  var REVIEW_ORDER = [
    "fullName", "email", "phone", "contactMethod", "matterType",
    "urgency", "opposingParty", "summary", "relatedParties", "priorRep"
  ];

  function isLitigation() {
    return state.matterType === "Civil litigation" || state.matterType === "Personal injury";
  }

  // ---- State sync ----
  function readField(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") state[id] = el.checked;
    else state[id] = el.value.trim();
  }

  function readPanel(index) {
    var keysByPanel = [
      ["fullName", "email", "phone", "contactMethod"],
      ["matterType", "urgency", "opposingParty", "summary"],
      ["relatedParties", "priorRep", "attest"]
    ];
    var keys = keysByPanel[index];
    if (keys) keys.forEach(readField);
  }

  function restoreFields() {
    Object.keys(state).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!state[id];
      else el.value = state[id];
    });
  }

  // ---- Errors ----
  function setError(id, msg) {
    var el = document.getElementById(id);
    var slot = form.querySelector('.error[data-for="' + id + '"]');
    if (el) el.classList.toggle("is-invalid", !!msg);
    if (slot) slot.textContent = msg || "";
  }

  function clearErrors() {
    form.querySelectorAll(".error").forEach(function (e) { e.textContent = ""; });
    form.querySelectorAll(".is-invalid").forEach(function (e) { e.classList.remove("is-invalid"); });
  }

  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function phoneOk(v) { return (v.replace(/\D/g, "").length >= 10); }

  // ---- Validation per step ----
  function validate(index) {
    var ok = true;
    var firstBad = null;

    function fail(id, msg) {
      setError(id, msg);
      ok = false;
      if (!firstBad) firstBad = document.getElementById(id);
    }

    if (index === 0) {
      if (!state.fullName) fail("fullName", "Please enter your full legal name.");
      if (!state.email) fail("email", "Email is required.");
      else if (!emailOk(state.email)) fail("email", "Enter a valid email address.");
      if (!state.phone) fail("phone", "Phone number is required.");
      else if (!phoneOk(state.phone)) fail("phone", "Enter a valid phone number.");
    } else if (index === 1) {
      if (!state.matterType) fail("matterType", "Select a practice area.");
      if (isLitigation() && !state.opposingParty) {
        fail("opposingParty", "Opposing party is required for litigation matters.");
      }
      if (!state.summary) fail("summary", "A brief description is required.");
      else if (state.summary.length < 15) fail("summary", "Please add a little more detail (15+ characters).");
    } else if (index === 2) {
      if (!state.attest) fail("attest", "You must attest before continuing.");
    }

    if (firstBad && firstBad.focus) firstBad.focus();
    return ok;
  }

  // ---- Conditional fields ----
  function syncConditional() {
    if (litigationBlock) litigationBlock.hidden = !isLitigation();
  }

  if (matterSelect) {
    matterSelect.addEventListener("change", function () {
      state.matterType = matterSelect.value;
      syncConditional();
    });
  }

  // ---- Conflict screen ----
  function runConflictScreen() {
    readPanel(2);
    var names = state.relatedParties.split(",")
      .map(function (n) { return n.trim().toLowerCase(); })
      .filter(Boolean);
    if (isLitigation() && state.opposingParty) {
      names.push(state.opposingParty.toLowerCase());
    }

    var hits = names.filter(function (n) {
      return FIRM_CLIENTS.indexOf(n) !== -1;
    });

    conflictResult.className = "conflict";
    if (hits.length) {
      conflictResult.classList.add("conflict--flag");
      conflictResult.innerHTML =
        '<div class="conflict__box"><span class="badge">Conflict</span>' +
        "<span>Potential conflict found involving <strong>" +
        hits.map(titleCase).join(", ") +
        "</strong>. Our intake team will review before any engagement.</span></div>";
    } else {
      conflictResult.classList.add("conflict--clear");
      conflictResult.innerHTML =
        '<div class="conflict__box"><span class="badge">Clear</span>' +
        "<span>No conflicts detected against our current client roster.</span></div>";
    }
  }

  function titleCase(s) {
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  if (runConflictBtn) runConflictBtn.addEventListener("click", runConflictScreen);

  // ---- Review ----
  function buildReview() {
    reviewList.innerHTML = "";
    REVIEW_ORDER.forEach(function (key) {
      if (key === "opposingParty" && !isLitigation()) return;
      var row = document.createElement("div");
      row.className = "review__row";
      var dt = document.createElement("dt");
      dt.textContent = LABELS[key];
      var dd = document.createElement("dd");
      var val = state[key];
      if (key === "priorRep") val = state.priorRep ? "Yes" : "No";
      if (!val && val !== "No") {
        dd.textContent = "Not provided";
        dd.className = "empty";
      } else {
        dd.textContent = val;
      }
      row.appendChild(dt);
      row.appendChild(dd);
      reviewList.appendChild(row);
    });
  }

  // ---- Navigation / render ----
  function render() {
    panels.forEach(function (p, i) {
      var on = i === current;
      p.hidden = !on;
      p.classList.toggle("is-current", on);
    });

    stepItems.forEach(function (item, i) {
      item.classList.toggle("is-active", i === current);
      item.classList.toggle("is-done", i < current);
    });

    var pct = ((current + 1) / TOTAL) * 100;
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(current + 1));

    backBtn.hidden = current === 0;
    nextBtn.hidden = current === TOTAL - 1;
    submitBtn.hidden = current !== TOTAL - 1;

    if (current === TOTAL - 1) buildReview();

    var heading = panels[current].querySelector(".panel__title");
    if (heading) heading.setAttribute("tabindex", "-1");
    if (heading && heading.focus) heading.focus();
  }

  function goNext() {
    readPanel(current);
    clearErrors();
    if (!validate(current)) return;
    syncConditional();
    if (current < TOTAL - 1) {
      current++;
      render();
    }
  }

  function goBack() {
    readPanel(current);
    clearErrors();
    if (current > 0) {
      current--;
      render();
    }
  }

  nextBtn.addEventListener("click", goNext);
  backBtn.addEventListener("click", goBack);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    readPanel(current);
    clearErrors();
    if (!validate(2)) {
      // Make sure attestation passed (it lives on step 3).
      current = 2;
      render();
      validate(2);
      return;
    }
    form.hidden = true;
    document.querySelector(".steps").hidden = true;
    progressBar.hidden = true;
    doneEl.hidden = false;
    doneEl.focus && doneEl.focus();
  });

  // Live-clear an error as the user fixes a field.
  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.id && t.classList.contains("is-invalid")) {
      setError(t.id, "");
    }
  });

  // Init
  restoreFields();
  syncConditional();
  render();
})();
