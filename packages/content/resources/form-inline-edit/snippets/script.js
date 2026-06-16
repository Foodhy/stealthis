(function () {
  "use strict";

  var live = document.querySelector("[data-live]");
  var dirtyBadge = document.querySelector("[data-dirty-badge]");
  var rows = Array.prototype.slice.call(document.querySelectorAll("[data-row]"));

  /** The row currently in edit mode (only one allowed). */
  var activeRow = null;

  /* ---------------- Toast helper ---------------- */
  var toaster = document.querySelector("[data-toaster]");

  function toast(msg, type) {
    if (!toaster) return;
    var el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " toast--error" : "");
    el.setAttribute("role", type === "error" ? "alert" : "status");

    var icon = document.createElement("span");
    icon.className = "toast__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML =
      type === "error"
        ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    var text = document.createElement("span");
    text.textContent = msg;

    el.appendChild(icon);
    el.appendChild(text);
    toaster.appendChild(el);

    requestAnimationFrame(function () {
      el.classList.add("is-in");
    });

    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () {
        el.remove();
      }, 280);
    }, 2600);
  }

  function announce(msg) {
    if (live) live.textContent = msg;
  }

  /* ---------------- Validation ---------------- */
  function validate(type, value) {
    var v = value.trim();
    switch (type) {
      case "text":
        if (!v) return "Name can’t be empty.";
        if (v.length < 2) return "Use at least 2 characters.";
        return "";
      case "email":
        if (!v) return "Email can’t be empty.";
        // Pragmatic email check: something@something.tld
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
          return "Enter a valid email address.";
        return "";
      case "textarea":
        if (v.length > 160) return "Keep your bio under 160 characters.";
        return "";
      case "select":
        return "";
      default:
        return "";
    }
  }

  /* ---------------- Row controller ---------------- */
  function setupRow(row) {
    var type = row.getAttribute("data-type");
    var label = row.getAttribute("data-field");
    var view = row.querySelector("[data-view]");
    var form = row.querySelector("[data-editform]");
    var input = row.querySelector("[data-input]");
    var help = row.querySelector("[data-help]");
    var valueEl = row.querySelector("[data-value]");
    var savedEl = row.querySelector("[data-saved]");
    var editBtn = row.querySelector("[data-edit]");
    var cancelBtn = row.querySelector("[data-cancel]");
    var counter = row.querySelector("[data-count]");
    var defaultHelp = help ? help.innerHTML : "";

    var savedTimer = null;

    function currentValue() {
      return valueEl.classList.contains("is-empty")
        ? ""
        : valueEl.textContent;
    }

    function showError(msg) {
      row.classList.add("is-invalid");
      row.classList.remove("is-valid");
      input.setAttribute("aria-invalid", "true");
      if (help) {
        help.classList.add("is-error");
        help.textContent = msg;
      }
    }

    function clearError(restoreHelp) {
      row.classList.remove("is-invalid");
      input.setAttribute("aria-invalid", "false");
      if (help && help.classList.contains("is-error")) {
        help.classList.remove("is-error");
        if (restoreHelp) help.innerHTML = defaultHelp;
      }
    }

    function refreshLiveValidity() {
      var msg = validate(type, input.value);
      if (msg && row.classList.contains("is-invalid")) {
        // keep error message updated while user types after a failed save
        showError(msg);
      } else {
        clearError(true);
        if (input.value.trim() && type !== "select") {
          row.classList.add("is-valid");
        } else {
          row.classList.remove("is-valid");
        }
      }
      updateCounter();
    }

    function updateCounter() {
      if (counter) counter.textContent = String(input.value.length);
    }

    function enterEdit() {
      // enforce single active row
      if (activeRow && activeRow !== row) {
        activeRow.__cancel();
      }
      activeRow = row;
      row.__cancel = exitCancel;

      // seed input with current value
      input.value = currentValue();
      row.classList.add("is-editing");
      clearError(true);
      row.classList.remove("is-valid");
      updateCounter();

      view.hidden = true;
      form.hidden = false;

      // move focus into the field
      input.focus();
      if (input.setSelectionRange && type !== "select") {
        var len = input.value.length;
        try {
          input.setSelectionRange(len, len);
        } catch (e) {
          /* select / unsupported */
        }
      }
    }

    function leaveEdit() {
      row.classList.remove("is-editing", "is-invalid", "is-valid");
      form.hidden = true;
      view.hidden = false;
      if (activeRow === row) activeRow = null;
      row.__cancel = null;
      if (help) {
        help.classList.remove("is-error");
        help.innerHTML = defaultHelp;
      }
      updateCounter();
    }

    function exitCancel() {
      leaveEdit();
      editBtn.focus();
    }

    function commit() {
      var raw = input.value;
      var msg = validate(type, raw);
      if (msg) {
        showError(msg);
        input.focus();
        toast(msg, "error");
        announce("Error: " + msg);
        return;
      }

      var next = type === "textarea" ? raw.trim() : raw.trim();
      var changed = next !== currentValue();

      // write back to view
      if (next === "") {
        valueEl.textContent = "Not set";
        valueEl.classList.add("is-empty");
      } else {
        valueEl.textContent = next;
        valueEl.classList.remove("is-empty");
      }

      leaveEdit();
      editBtn.focus();

      // brief "Saved" check
      savedEl.classList.add("is-on");
      clearTimeout(savedTimer);
      savedTimer = setTimeout(function () {
        savedEl.classList.remove("is-on");
      }, 1800);

      if (changed) {
        if (dirtyBadge) dirtyBadge.hidden = false;
        toast(capitalize(label) + " updated.");
        announce(capitalize(label) + " saved.");
      } else {
        announce(capitalize(label) + " unchanged.");
      }
    }

    /* events */
    editBtn.addEventListener("click", enterEdit);

    cancelBtn.addEventListener("click", function () {
      exitCancel();
      announce("Edit cancelled. " + capitalize(label) + " restored.");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      commit();
    });

    input.addEventListener("input", refreshLiveValidity);

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        exitCancel();
        announce("Edit cancelled. " + capitalize(label) + " restored.");
      } else if (e.key === "Enter" && type !== "textarea") {
        // Enter submits for single-line fields & selects; textarea allows newlines
        e.preventDefault();
        commit();
      } else if (e.key === "Enter" && type === "textarea" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      }
    });

    // Cancel on blur-out of the whole edit form (click elsewhere) — but not when
    // moving focus between the field and its own Save/Cancel buttons.
    form.addEventListener("focusout", function (e) {
      var to = e.relatedTarget;
      if (to && form.contains(to)) return;
      // Defer: a click on the Save button fires focusout before the click handler.
      setTimeout(function () {
        if (row.classList.contains("is-editing") && !form.contains(document.activeElement)) {
          exitCancel();
        }
      }, 120);
    });
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  rows.forEach(setupRow);
})();
