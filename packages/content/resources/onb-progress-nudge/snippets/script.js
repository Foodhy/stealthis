(function () {
  "use strict";

  /* ---------- Data: setup steps (realistic but fictional) ---------- */
  var STEPS = [
    { id: "verify", label: "Verify your email", cta: "Verify email", done: true },
    { id: "name", label: "Add your full name", cta: "Add name", done: true },
    { id: "role", label: "Choose your role", cta: "Set role", done: true },
    { id: "photo", label: "Add a profile photo", cta: "Add photo", done: false },
    { id: "team", label: "Invite a teammate", cta: "Invite teammate", done: false }
  ];

  var shell = document.querySelector(".app-shell");
  var nudges = Array.prototype.slice.call(document.querySelectorAll(".nudge"));
  var checklistEl = document.querySelector("[data-checklist]");

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- Derived state ---------- */
  function doneCount() {
    return STEPS.filter(function (s) {
      return s.done;
    }).length;
  }
  function nextStep() {
    return STEPS.find(function (s) {
      return !s.done;
    }) || null;
  }
  function pct() {
    return Math.round((doneCount() / STEPS.length) * 100);
  }

  /* ---------- Render the sidebar checklist ---------- */
  function tickSvg() {
    return (
      '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.2 2.2L9.5 3.4" ' +
      'stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );
  }
  function renderChecklist() {
    if (!checklistEl) return;
    var next = nextStep();
    checklistEl.innerHTML = STEPS.map(function (s) {
      var cls = "check-item";
      if (s.done) cls += " is-done";
      else if (next && s.id === next.id) cls += " is-next";
      return (
        '<li class="' +
        cls +
        '"><span class="tick">' +
        tickSvg() +
        '</span><span class="label">' +
        s.label +
        "</span></li>"
      );
    }).join("");
  }

  /* ---------- Render percentages, bars, CTAs across both variants ---------- */
  function render() {
    var p = pct();
    var done = doneCount();
    var total = STEPS.length;
    var next = nextStep();
    var complete = p >= 100;

    document.querySelectorAll("[data-pct]").forEach(function (el) {
      el.textContent = p + "%";
    });
    document.querySelectorAll("[data-fill]").forEach(function (el) {
      el.style.width = p + "%";
    });
    document.querySelectorAll("[data-progressbar]").forEach(function (el) {
      el.setAttribute("aria-valuenow", String(p));
    });
    document.querySelectorAll("[data-done-count]").forEach(function (el) {
      el.textContent = String(done);
    });
    document.querySelectorAll("[data-total-count]").forEach(function (el) {
      el.textContent = String(total);
    });

    var nextLabel = next ? next.label : "All steps complete";
    document.querySelectorAll("[data-next-label]").forEach(function (el) {
      el.textContent = nextLabel;
    });
    document.querySelectorAll("[data-cta-label]").forEach(function (el) {
      el.textContent = nextLabel;
    });
    document.querySelectorAll("[data-cta]").forEach(function (btn) {
      // Banner CTA uses the short cta text; sidebar CTA has a span (data-cta-label)
      if (!btn.querySelector("[data-cta-label]")) {
        btn.textContent = next ? next.cta : "Done";
      }
      btn.disabled = complete;
    });

    renderChecklist();

    // Swap success state per nudge
    nudges.forEach(function (nudge) {
      var success = nudge.querySelector("[data-success]");
      var content = Array.prototype.slice
        .call(nudge.children)
        .filter(function (c) {
          return !c.hasAttribute("data-success");
        });
      if (complete) {
        nudge.classList.add("is-complete");
        if (success) success.hidden = false;
        content.forEach(function (c) {
          c.style.display = "none";
        });
      } else {
        nudge.classList.remove("is-complete");
        if (success) success.hidden = true;
        content.forEach(function (c) {
          c.style.display = "";
        });
      }
    });
  }

  /* ---------- Complete the next step ---------- */
  function completeNext() {
    var next = nextStep();
    if (!next) return;
    next.done = true;
    render();
    if (pct() >= 100) {
      toast("Profile complete! All steps done.");
    } else {
      toast("Done: " + next.label);
    }
  }

  /* ---------- Dismiss a nudge ---------- */
  function dismiss(nudge) {
    if (shell.getAttribute("data-dismiss") === "no") return;
    nudge.classList.add("is-dismissed");
    toast("Reminder dismissed");
  }

  /* ---------- Wire up CTA + dismiss buttons ---------- */
  document.querySelectorAll("[data-cta]").forEach(function (btn) {
    btn.addEventListener("click", completeNext);
  });
  document.querySelectorAll("[data-dismiss-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nudge = btn.closest(".nudge");
      if (nudge) dismiss(nudge);
    });
  });

  /* ---------- Esc dismisses the visible nudge (when dismissible) ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (shell.getAttribute("data-dismiss") === "no") return;
    var layout = shell.getAttribute("data-layout");
    var sel = layout === "banner" ? ".nudge--banner" : ".nudge--sidebar";
    var nudge = document.querySelector(sel);
    if (nudge && !nudge.classList.contains("is-dismissed")) dismiss(nudge);
  });

  /* ---------- Variant switcher (segmented controls) ---------- */
  function bindSegGroup(attr, shellAttr) {
    var btns = Array.prototype.slice.call(
      document.querySelectorAll(".seg-btn[" + attr + "]")
    );
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest(".seg");
        group.querySelectorAll(".seg-btn").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-checked", "true");
        shell.setAttribute(shellAttr, btn.getAttribute(attr));
      });
    });
  }
  bindSegGroup("data-layout", "data-layout");
  bindSegGroup("data-media", "data-media");
  bindSegGroup("data-dismiss", "data-dismiss");

  /* ---------- Reset ---------- */
  document.getElementById("reset-btn").addEventListener("click", function () {
    STEPS[3].done = false;
    STEPS[4].done = false;
    STEPS[0].done = true;
    STEPS[1].done = true;
    STEPS[2].done = true;
    nudges.forEach(function (n) {
      n.classList.remove("is-dismissed");
    });
    render();
    toast("Demo reset to 60%");
  });

  /* ---------- Init ---------- */
  render();
})();
