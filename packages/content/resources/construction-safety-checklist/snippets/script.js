(function () {
  "use strict";

  var STORE = "stealthis.construction-safety-checklist";
  var form = document.getElementById("cl-form");
  if (!form) return;

  var boxes = Array.prototype.slice.call(
    form.querySelectorAll('input[type="checkbox"]')
  );
  var fill = document.getElementById("cl-fill");
  var pct = document.getElementById("cl-pct");
  var count = document.getElementById("cl-count");
  var notes = document.getElementById("cl-notes");
  var flagTag = document.getElementById("cl-flag-tag");
  var name = document.getElementById("cl-name");
  var submit = document.getElementById("cl-submit");
  var hint = document.getElementById("cl-signoff-hint");
  var stamp = document.getElementById("cl-stamp");

  var total = boxes.length;
  var signed = false;

  function load() {
    var raw;
    try {
      raw = JSON.parse(sessionStorage.getItem(STORE) || "{}");
    } catch (e) {
      raw = {};
    }
    if (raw.checks) {
      boxes.forEach(function (b) {
        if (raw.checks[b.name]) b.checked = true;
      });
    }
    if (raw.notes) notes.value = raw.notes;
    if (raw.signature) {
      name.value = raw.signature.name || "";
      applySignature(raw.signature.name, raw.signature.time);
    }
  }

  function save() {
    var checks = {};
    boxes.forEach(function (b) {
      checks[b.name] = b.checked;
    });
    var data = { checks: checks, notes: notes.value };
    if (signed) {
      data.signature = {
        name: name.value.trim(),
        time: stamp.getAttribute("data-time") || ""
      };
    }
    try {
      sessionStorage.setItem(STORE, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable */
    }
  }

  function done() {
    return boxes.filter(function (b) {
      return b.checked;
    }).length;
  }

  function render() {
    var n = done();
    var ratio = total ? Math.round((n / total) * 100) : 0;
    fill.style.width = ratio + "%";
    pct.textContent = ratio + "%";
    count.textContent = n + " of " + total + " items reviewed";

    var complete = n === total && total > 0;
    if (!signed) {
      submit.disabled = !complete;
      name.disabled = !complete;
      hint.textContent = complete
        ? "All items reviewed — ready for supervisor sign-off."
        : "Review every item to enable sign-off.";
    }

    var hasFlag = notes.value.trim().length > 0;
    flagTag.textContent = hasFlag ? "1 issue logged" : "None logged";
    flagTag.classList.toggle("is-flagged", hasFlag);
  }

  function applySignature(who, time) {
    if (!who) return;
    signed = true;
    submit.disabled = true;
    submit.textContent = "Signed off";
    name.disabled = true;
    hint.textContent = "Walkdown signed off and locked for this session.";
    stamp.hidden = false;
    stamp.setAttribute("data-time", time);
    stamp.innerHTML =
      "Signed off by <strong>" +
      escapeHtml(who) +
      "</strong> &middot; " +
      escapeHtml(time);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  function stampNow() {
    var d = new Date();
    var date = d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    var time = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit"
    });
    return date + " at " + time;
  }

  boxes.forEach(function (b) {
    b.addEventListener("change", function () {
      render();
      save();
    });
  });

  notes.addEventListener("input", function () {
    render();
    save();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (signed) return;
    var who = name.value.trim();
    if (!who) {
      name.focus();
      return;
    }
    applySignature(who, stampNow());
    save();
  });

  load();
  render();
})();
