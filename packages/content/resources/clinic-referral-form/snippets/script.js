(function () {
  "use strict";

  const form = document.getElementById("referral-form");
  const specialty = document.getElementById("specialty");
  const reason = document.getElementById("reason");
  const history = document.getElementById("history");
  const urgency = document.getElementById("urgency");
  const draftPill = document.getElementById("draft-pill");

  // Preview targets
  const pvUrgency = document.getElementById("pv-urgency");
  const pvSpecialty = document.getElementById("pv-specialty");
  const pvReason = document.getElementById("pv-reason");
  const pvHistory = document.getElementById("pv-history");
  const pvAttach = document.getElementById("pv-attach");
  const pvDate = document.getElementById("pv-date");
  const pvRef = document.getElementById("pv-ref");

  // Confirmation
  const previewCard = document.getElementById("preview-card");
  const confirmCard = document.getElementById("confirm-card");
  const confirmRef = document.getElementById("confirm-ref");
  const cfSpec = document.getElementById("cf-spec");
  const cfUrg = document.getElementById("cf-urg");
  const cfAttach = document.getElementById("cf-attach");
  const newBtn = document.getElementById("new-btn");

  const urgencyHint = document.getElementById("urgency-hint");

  let currentUrgency = "Routine";

  /* ── Toast helper ── */
  let toastTimer;
  const toastEl = document.getElementById("toast");
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => (toastEl.hidden = true), 240);
    }, 2600);
  }

  /* ── Date helper ── */
  function today() {
    return new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* ── Character counters ── */
  function bindCounter(el, counterId, max) {
    const counter = document.getElementById(counterId);
    function update() {
      const len = el.value.length;
      counter.textContent = len + " / " + max;
      counter.classList.toggle("near", len >= max * 0.9);
    }
    el.addEventListener("input", update);
    update();
  }
  bindCounter(reason, "count-reason", 400);
  bindCounter(history, "count-history", 600);

  /* ── Urgency segmented control ── */
  const segBtns = Array.from(urgency.querySelectorAll(".seg-btn"));
  const HINTS = {
    Routine: "Routine consults are typically scheduled within 2–4 weeks.",
    Urgent: "Urgent consults are reviewed by the receiving team within 48 hours.",
    Emergent:
      "Emergent requests trigger an immediate call to the on-call specialist.",
  };
  const TONE = { Routine: "ok", Urgent: "warn", Emergent: "danger" };

  function setUrgency(btn) {
    segBtns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", String(on));
    });
    currentUrgency = btn.dataset.value;
    urgencyHint.textContent = HINTS[currentUrgency];
    updatePreview();
  }

  segBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => setUrgency(btn));
    btn.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = segBtns[(i + 1) % segBtns.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = segBtns[(i - 1 + segBtns.length) % segBtns.length];
      }
      if (next) {
        e.preventDefault();
        setUrgency(next);
        next.focus();
      }
    });
  });

  /* ── Attachments ── */
  function selectedAttachments() {
    return Array.from(
      form.querySelectorAll('input[name="attach"]:checked')
    ).map((c) => c.value);
  }

  /* ── Live preview ── */
  function setField(el, value, emptyText) {
    if (value && value.trim()) {
      el.textContent = value.trim();
      el.classList.remove("empty");
    } else {
      el.textContent = emptyText;
      el.classList.add("empty");
    }
  }

  let ready = false;

  function updatePreview() {
    // Urgency badge
    pvUrgency.textContent = currentUrgency;
    pvUrgency.className = "badge urg " + TONE[currentUrgency];

    setField(pvSpecialty, specialty.value, "Not selected");
    setField(pvReason, reason.value, "—");
    setField(pvHistory, history.value, "—");

    // Attachments as tags
    const attach = selectedAttachments();
    if (attach.length) {
      pvAttach.classList.remove("empty");
      pvAttach.innerHTML =
        '<span class="pv-tags">' +
        attach.map((a) => '<span class="pv-tag">' + a + "</span>").join("") +
        "</span>";
    } else {
      pvAttach.classList.add("empty");
      pvAttach.textContent = "None selected";
    }

    pvDate.textContent = today();

    // Draft readiness pill
    ready = !!specialty.value && reason.value.trim().length > 0;
    draftPill.classList.toggle("is-ready", ready);
    draftPill.textContent = ready ? "Ready to send" : "Draft";
  }

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);

  /* ── Validation ── */
  function clearError(fieldEl, errId) {
    fieldEl.classList.remove("invalid");
    const err = document.getElementById(errId);
    if (err) err.hidden = true;
  }
  function showError(fieldEl, errId) {
    fieldEl.classList.add("invalid");
    const err = document.getElementById(errId);
    if (err) err.hidden = false;
  }

  specialty.addEventListener("change", () =>
    clearError(specialty.closest(".field"), "err-specialty")
  );
  reason.addEventListener("input", () => {
    if (reason.value.trim()) clearError(reason.closest(".field"), "err-reason");
  });

  /* ── Reference number generator ── */
  function makeRef() {
    const year = new Date().getFullYear();
    const n = Math.floor(100 + Math.random() * 9900);
    return "REF-" + year + "-" + String(n).padStart(4, "0");
  }

  /* ── Submit ── */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstInvalid = null;

    if (!specialty.value) {
      showError(specialty.closest(".field"), "err-specialty");
      firstInvalid = firstInvalid || specialty;
    }
    if (!reason.value.trim()) {
      showError(reason.closest(".field"), "err-reason");
      firstInvalid = firstInvalid || reason;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      toast("Please complete the required fields.");
      return;
    }

    const ref = makeRef();
    const attach = selectedAttachments();

    confirmRef.textContent = ref;
    cfSpec.textContent = specialty.value;
    cfUrg.textContent = currentUrgency;
    cfAttach.textContent = attach.length ? attach.join(", ") : "None";
    pvRef.textContent = ref;

    previewCard.hidden = true;
    confirmCard.hidden = false;

    // Lock the form during confirmation
    form
      .querySelectorAll("input, select, textarea, button")
      .forEach((el) => (el.disabled = true));

    toast("Referral " + ref + " sent successfully.");
  });

  /* ── New referral / reset ── */
  function resetAll() {
    form.reset();
    form
      .querySelectorAll("input, select, textarea, button")
      .forEach((el) => (el.disabled = false));
    confirmCard.hidden = true;
    previewCard.hidden = false;
    pvRef.textContent = "REF-pending";

    // Reset urgency to default
    setUrgency(segBtns[0]);
    clearError(specialty.closest(".field"), "err-specialty");
    clearError(reason.closest(".field"), "err-reason");

    document.getElementById("count-reason").textContent = "0 / 400";
    document.getElementById("count-history").textContent = "0 / 600";
    document
      .getElementById("count-reason")
      .classList.remove("near");
    document
      .getElementById("count-history")
      .classList.remove("near");

    updatePreview();
  }

  newBtn.addEventListener("click", () => {
    resetAll();
    specialty.focus();
  });

  form.addEventListener("reset", () => {
    // Defer so native reset clears values first
    setTimeout(() => {
      setUrgency(segBtns[0]);
      updatePreview();
      toast("Form cleared.");
    }, 0);
  });

  // Initial render
  updatePreview();
})();
