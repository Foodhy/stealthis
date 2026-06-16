(function () {
  "use strict";

  var MAX_ROWS = 10;
  var ROLE_LABELS = {
    viewer: "Viewer",
    editor: "Editor",
    admin: "Admin",
    owner: "Owner",
  };

  var form = document.getElementById("teamForm");
  var list = document.getElementById("rowsList");
  var tmpl = document.getElementById("rowTemplate");
  var emptyState = document.getElementById("rowsEmpty");
  var addBtn = document.getElementById("addRow");
  var countEl = document.getElementById("rowCount");
  var seatEl = document.getElementById("seatTotal");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var successState = document.getElementById("successState");
  var successText = document.getElementById("successText");
  var resetBtn = document.getElementById("resetBtn");
  var toastRegion = document.getElementById("toastRegion");

  var uid = 0;
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Toast helper ─────────────────────────────
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast toast--" + (kind || "ok");
    var icon =
      kind === "warn"
        ? '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>'
        : '<path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5"/>';
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
      icon +
      "</svg><span></span>";
    el.querySelector("span").textContent = msg;
    toastRegion.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("is-visible");
    });
    setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 280);
    }, 2600);
  }

  // ── Field validation ─────────────────────────
  function setFieldState(field, state, message) {
    field.classList.remove("is-error", "is-ok");
    var input = field.querySelector("[data-input]");
    var help = field.querySelector("[data-help]");
    if (state === "error") {
      field.classList.add("is-error");
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
      if (state === "ok") field.classList.add("is-ok");
    }
    if (message != null && help) help.textContent = message;
  }

  function validateName(field) {
    var input = field.querySelector("[data-input]");
    var v = input.value.trim();
    if (!v) {
      setFieldState(field, "error", "Name is required.");
      return false;
    }
    if (v.length < 2) {
      setFieldState(field, "error", "Enter at least 2 characters.");
      return false;
    }
    setFieldState(field, "ok", "Looks good.");
    return true;
  }

  function validateEmail(field) {
    var input = field.querySelector("[data-input]");
    var v = input.value.trim();
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!v) {
      setFieldState(field, "error", "Email is required.");
      return false;
    }
    if (!re.test(v)) {
      setFieldState(field, "error", "Enter a valid email address.");
      return false;
    }
    setFieldState(field, "ok", "We send the invite here.");
    return true;
  }

  function validateRow(row, focusFirst) {
    var nameField = row.querySelector('[data-field="name"]');
    var emailField = row.querySelector('[data-field="email"]');
    var okName = validateName(nameField);
    var okEmail = validateEmail(emailField);
    if (focusFirst && (!okName || !okEmail)) {
      var bad = !okName ? nameField : emailField;
      bad.querySelector("[data-input]").focus();
    }
    return okName && okEmail;
  }

  // Duplicate-email detection across rows
  function checkDuplicateEmails() {
    var seen = {};
    var rows = list.querySelectorAll("[data-row]");
    var hasDupe = false;
    rows.forEach(function (row) {
      var field = row.querySelector('[data-field="email"]');
      var input = field.querySelector("[data-input]");
      var v = input.value.trim().toLowerCase();
      if (!v) return;
      if (seen[v]) {
        setFieldState(field, "error", "Duplicate email — already invited above.");
        hasDupe = true;
      } else {
        seen[v] = true;
      }
    });
    return !hasDupe;
  }

  // ── Row creation ─────────────────────────────
  function addRow(focus) {
    if (list.children.length >= MAX_ROWS) {
      toast("Seat limit reached (10 max).", "warn");
      return null;
    }
    var node = tmpl.content.firstElementChild.cloneNode(true);
    uid += 1;
    var id = "row" + uid;
    node.dataset.id = id;

    // unique ids + label wiring for a11y
    ["name", "email", "role"].forEach(function (key) {
      var field = node.querySelector('[data-field="' + key + '"]');
      var input = field.querySelector("[data-input]");
      var label = field.querySelector("label");
      var help = field.querySelector("[data-help]");
      var inputId = id + "_" + key;
      input.id = inputId;
      label.setAttribute("for", inputId);
      if (help) {
        var helpId = inputId + "_help";
        help.id = helpId;
        input.setAttribute("aria-describedby", helpId);
      }
      // live re-validation
      if (key === "name") {
        input.addEventListener("blur", function () {
          validateName(field);
        });
        input.addEventListener("input", function () {
          if (field.classList.contains("is-error")) validateName(field);
        });
      } else if (key === "email") {
        input.addEventListener("blur", function () {
          validateEmail(field);
        });
        input.addEventListener("input", function () {
          if (field.classList.contains("is-error")) validateEmail(field);
        });
      }
    });

    node.querySelector("[data-remove]").addEventListener("click", function () {
      removeRow(node);
    });

    list.appendChild(node);

    // smooth enter transition
    if (!prefersReduced) {
      node.classList.add("is-entering");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          node.classList.remove("is-entering");
        });
      });
    }

    renumber();
    if (focus) node.querySelector('[data-input="name"]').focus();
    return node;
  }

  function removeRow(row) {
    if (list.children.length <= 1) {
      toast("At least one member is required.", "warn");
      return;
    }

    // remember focus target: next row, else previous
    var next = row.nextElementSibling || row.previousElementSibling;

    var finalize = function () {
      if (row.parentNode) row.parentNode.removeChild(row);
      renumber();
      if (next) {
        var input = next.querySelector('[data-input="name"]');
        if (input) input.focus();
      } else {
        addBtn.focus();
      }
      toast("Member removed.", "ok");
    };

    if (prefersReduced) {
      finalize();
      return;
    }

    // animate collapse using fixed height -> 0
    row.style.height = row.offsetHeight + "px";
    row.classList.add("is-leaving");
    requestAnimationFrame(function () {
      row.style.height = "0px";
      row.style.marginTop = "0px";
      row.style.paddingTop = "0px";
      row.style.paddingBottom = "0px";
    });
    row.addEventListener("transitionend", function handler(e) {
      if (e.propertyName !== "height") return;
      row.removeEventListener("transitionend", handler);
      finalize();
    });
    // safety fallback
    setTimeout(function () {
      if (row.parentNode && row.classList.contains("is-leaving")) finalize();
    }, 400);
  }

  // ── Renumber + counts + empty state ──────────
  function renumber() {
    var rows = list.querySelectorAll("[data-row]");
    var n = rows.length;
    rows.forEach(function (row, i) {
      var idx = row.querySelector("[data-index]");
      if (idx) idx.textContent = String(i + 1);
      var remove = row.querySelector("[data-remove]");
      // disable remove when only one row remains
      remove.disabled = n <= 1;
    });

    countEl.textContent = n + (n === 1 ? " member" : " members");
    seatEl.textContent = String(n);

    addBtn.disabled = n >= MAX_ROWS;
    emptyState.hidden = n !== 0;

    // hide success once edited again
    if (!successState.hidden) {
      successState.hidden = true;
    }
  }

  // ── Submit ───────────────────────────────────
  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.classList.remove("is-error", "is-ok");
    if (kind) statusEl.classList.add("is-" + kind);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var rows = list.querySelectorAll("[data-row]");
    if (rows.length === 0) {
      setStatus("Add at least one team member before sending.", "error");
      toast("Add at least one member first.", "warn");
      return;
    }

    var allValid = true;
    var firstInvalid = null;
    rows.forEach(function (row) {
      var valid = validateRow(row, false);
      if (!valid && !firstInvalid) firstInvalid = row;
      if (!valid) allValid = false;
    });

    var noDupes = checkDuplicateEmails();
    if (!noDupes) allValid = false;

    if (!allValid) {
      var bad = rows.length;
      var count = list.querySelectorAll(".field.is-error").length;
      setStatus(
        "Please fix " +
          count +
          (count === 1 ? " field" : " fields") +
          " before sending.",
        "error"
      );
      toast("Some rows need attention.", "warn");
      if (firstInvalid) {
        var input = firstInvalid.querySelector(".field.is-error [data-input]");
        if (input) input.focus();
      } else {
        var dupe = list.querySelector(".field.is-error [data-input]");
        if (dupe) dupe.focus();
      }
      return;
    }

    // success
    submitBtn.disabled = true;
    addBtn.disabled = true;
    setStatus("", null);

    var n = rows.length;
    var roleCounts = {};
    rows.forEach(function (row) {
      var role = row.querySelector('[data-input="role"]').value;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    var roleSummary = Object.keys(roleCounts)
      .map(function (k) {
        return roleCounts[k] + " " + ROLE_LABELS[k].toLowerCase();
      })
      .join(", ");

    successText.textContent =
      "Sent " +
      n +
      (n === 1 ? " invitation" : " invitations") +
      " (" +
      roleSummary +
      "). Recipients will receive an email shortly.";
    successState.hidden = false;
    successState.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "nearest" });
    resetBtn.focus();
    toast("Invites sent successfully.", "ok");
  });

  // ── Reset / invite more ──────────────────────
  resetBtn.addEventListener("click", function () {
    successState.hidden = true;
    submitBtn.disabled = false;
    list.innerHTML = "";
    uid = 0;
    addRow(true);
    setStatus("", null);
    toast("Ready for new invites.", "ok");
  });

  addBtn.addEventListener("click", function () {
    addRow(true);
  });

  // ── Init ─────────────────────────────────────
  addRow(false);
})();
