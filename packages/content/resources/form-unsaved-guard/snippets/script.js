/* Form — Unsaved-changes leave guard
 * ------------------------------------------------------------------
 * Tracks a "dirty" state once any field diverges from its saved
 * baseline. Any guarded navigation (in-page route links, the Cancel
 * button) is intercepted while dirty and routed through an accessible
 * confirm modal: Leave & discard / Stay. Saving validates, re-baselines
 * the form, and clears the guard. The native `beforeunload` event is
 * wired too so tab close / refresh / external links also warn — see the
 * note where it's registered (browsers show their own generic dialog;
 * the custom modal can't replace it for that event).
 */
(function () {
  "use strict";

  var form = document.getElementById("profile-form");
  var saveBtn = document.getElementById("save-btn");
  var cancelBtn = document.getElementById("cancel-btn");
  var status = document.getElementById("form-status");
  var badge = document.getElementById("dirty-badge");
  var badgeText = document.getElementById("dirty-badge-text");
  var toastEl = document.getElementById("toast");

  var modal = document.getElementById("guard-modal");
  var dialog = modal.querySelector(".modal__dialog");
  var modalDest = document.getElementById("modal-dest");
  var stayBtn = document.getElementById("stay-btn");
  var leaveBtn = document.getElementById("leave-btn");

  var bio = document.getElementById("bio");
  var bioNow = document.getElementById("bio-now");
  var bioCount = document.getElementById("bio-count");

  // Validation runs only on these required fields.
  var REQUIRED = ["displayName", "email"];

  var dirty = false; // does the form diverge from baseline?
  var baseline = snapshot(); // serialized saved state
  var pendingAction = null; // function to run if the user confirms "Leave"
  var lastFocused = null; // element to restore focus to on modal close

  /* ── Snapshot / dirty detection ─────────────────────────────── */

  // Serialize current form values into a comparable string.
  function snapshot() {
    var data = new FormData(form);
    var parts = [];
    var keys = ["displayName", "email", "role", "timezone", "bio"];
    keys.forEach(function (k) {
      parts.push(k + "=" + (data.get(k) || ""));
    });
    // Checkbox group → sorted list of checked values.
    var notify = data.getAll("notify").sort().join(",");
    parts.push("notify=" + notify);
    return parts.join("|");
  }

  function recomputeDirty() {
    var nowDirty = snapshot() !== baseline;
    if (nowDirty === dirty) return;
    dirty = nowDirty;
    saveBtn.disabled = !dirty;
    badge.dataset.state = dirty ? "dirty" : "clean";
    badgeText.textContent = dirty ? "Unsaved changes" : "All changes saved";
    if (!dirty) {
      status.textContent = "";
      status.className = "form__status";
    }
  }

  /* ── Field-level validation ─────────────────────────────────── */

  function setError(name, message) {
    var field = form.querySelector('[data-field="' + name + '"]');
    var input = document.getElementById(name);
    var err = document.getElementById(name + "-error");
    field.classList.add("is-error");
    field.classList.remove("is-valid");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", name + "-hint " + name + "-error");
    err.textContent = message;
    err.hidden = false;
  }

  function setValid(name) {
    var field = form.querySelector('[data-field="' + name + '"]');
    var input = document.getElementById(name);
    var err = document.getElementById(name + "-error");
    field.classList.remove("is-error");
    field.classList.add("is-valid");
    input.removeAttribute("aria-invalid");
    input.setAttribute("aria-describedby", name + "-hint");
    err.hidden = true;
    err.textContent = "";
  }

  function clearState(name) {
    var field = form.querySelector('[data-field="' + name + '"]');
    var input = document.getElementById(name);
    var err = document.getElementById(name + "-error");
    field.classList.remove("is-error", "is-valid");
    input.removeAttribute("aria-invalid");
    input.setAttribute("aria-describedby", name + "-hint");
    err.hidden = true;
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateField(name, markValid) {
    var value = (document.getElementById(name).value || "").trim();
    if (name === "displayName") {
      if (!value) return fail(name, "Enter a display name.");
      if (value.length < 2) return fail(name, "Use at least 2 characters.");
    }
    if (name === "email") {
      if (!value) return fail(name, "Enter your email address.");
      if (!EMAIL_RE.test(value)) return fail(name, "Enter a valid email, e.g. name@atlas.dev.");
    }
    if (markValid) setValid(name);
    return true;

    function fail(n, msg) {
      setError(n, msg);
      return false;
    }
  }

  function validateAll() {
    var firstInvalid = null;
    REQUIRED.forEach(function (name) {
      var ok = validateField(name, true);
      if (!ok && !firstInvalid) firstInvalid = document.getElementById(name);
    });
    return firstInvalid;
  }

  /* ── Toast helper ───────────────────────────────────────────── */

  var toastTimer = null;
  function toast(msg) {
    toastEl.hidden = false;
    toastEl.textContent = msg;
    // Force reflow so the transition replays on rapid calls.
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ── Modal (accessible, focus-trapped) ──────────────────────── */

  function focusable() {
    return Array.prototype.slice.call(
      dialog.querySelectorAll("button:not([disabled])")
    );
  }

  function openModal(destLabel, onLeave) {
    pendingAction = onLeave;
    modalDest.textContent = destLabel;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Move focus into the dialog; "Stay" is the safe default.
    stayBtn.focus();
    document.addEventListener("keydown", onKeydown, true);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown, true);
    pendingAction = null;
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal(); // Esc == Stay
      return;
    }
    if (e.key !== "Tab") return;
    // Focus trap: keep Tab / Shift+Tab inside the dialog.
    var items = focusable();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (items.indexOf(active) === -1) {
      e.preventDefault();
      first.focus();
    }
  }

  // Backdrop or any [data-close="stay"] element == Stay.
  modal.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-close") === "stay") closeModal();
  });

  leaveBtn.addEventListener("click", function () {
    var action = pendingAction;
    closeModal();
    if (typeof action === "function") action();
  });

  /* ── Guarded navigation ─────────────────────────────────────── */

  // Run `proceed` immediately when clean; otherwise confirm first.
  function guard(destLabel, proceed) {
    if (!dirty) {
      proceed();
      return;
    }
    openModal(destLabel, proceed);
  }

  // Intercept the mock in-page route links.
  var railLinks = document.querySelectorAll(".rail__link");
  railLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var dest = link.dataset.route || "this page";
      guard(dest, function () {
        // Simulated client-side route change.
        railLinks.forEach(function (l) {
          l.classList.remove("is-current");
          l.removeAttribute("aria-current");
        });
        link.classList.add("is-current");
        link.setAttribute("aria-current", "page");
        // Leaving discards edits → reset to baseline values, clear guard.
        form.reset();
        REQUIRED.forEach(clearState);
        baseline = snapshot();
        recomputeDirty();
        updateBioCount();
        toast("Switched to " + dest + " — edits discarded.");
      });
    });
  });

  // Cancel button: same guard, "leaving" the editor.
  cancelBtn.addEventListener("click", function () {
    guard("the editor", function () {
      form.reset();
      REQUIRED.forEach(clearState);
      baseline = snapshot();
      recomputeDirty();
      updateBioCount();
      status.textContent = "Changes discarded.";
      status.className = "form__status";
      toast("Changes discarded.");
    });
  });

  /* ── beforeunload (tab close / refresh / external links) ────── */
  // The browser shows its OWN generic confirmation for this event; a
  // custom modal cannot be substituted here. We only opt in while dirty
  // by calling preventDefault() and setting returnValue.
  window.addEventListener("beforeunload", function (e) {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = ""; // required for the prompt in most browsers
  });

  /* ── Live input wiring ──────────────────────────────────────── */

  form.addEventListener("input", function (e) {
    recomputeDirty();
    var name = e.target.name;
    // Re-validate a required field live once it has shown an error.
    if (REQUIRED.indexOf(name) !== -1) {
      var field = form.querySelector('[data-field="' + name + '"]');
      if (field && field.classList.contains("is-error")) validateField(name, true);
    }
    if (e.target === bio) updateBioCount();
  });

  form.addEventListener("change", recomputeDirty);

  // Blur validation for required fields.
  REQUIRED.forEach(function (name) {
    document.getElementById(name).addEventListener("blur", function () {
      if (document.getElementById(name).value.trim()) validateField(name, true);
    });
  });

  function updateBioCount() {
    var len = bio.value.length;
    bioNow.textContent = String(len);
    bioCount.classList.toggle("is-max", len >= 160);
  }

  /* ── Save ───────────────────────────────────────────────────── */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstInvalid = validateAll();
    if (firstInvalid) {
      status.textContent = "Fix the highlighted fields before saving.";
      status.className = "form__status is-error";
      firstInvalid.focus();
      return;
    }
    // Simulated save: re-baseline and clear the guard.
    saveBtn.disabled = true;
    status.textContent = "Saving…";
    status.className = "form__status";
    setTimeout(function () {
      baseline = snapshot();
      recomputeDirty(); // dirty → false, guard now inert
      status.textContent = "Profile saved.";
      status.className = "form__status is-ok";
      toast("Profile saved — the leave guard is now off.");
    }, 420);
  });

  // Initialize counters / state on load.
  updateBioCount();
  recomputeDirty();
})();
