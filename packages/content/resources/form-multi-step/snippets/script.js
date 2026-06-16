(function () {
  "use strict";

  var form = document.getElementById("wizard");
  if (!form) return;

  var track = document.getElementById("track");
  var panels = Array.prototype.slice.call(track.querySelectorAll(".panel"));
  var stepItems = Array.prototype.slice.call(document.querySelectorAll("#stepNav .step"));
  var stepFill = document.getElementById("stepFill");
  var stepCount = document.getElementById("stepCount");
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var actions = document.getElementById("actions");
  var formAlert = document.getElementById("formAlert");
  var summary = document.getElementById("summary");
  var toaster = document.getElementById("toaster");

  var TOTAL = 4; // input steps; index 4 is the success screen
  var current = 0;

  // ── Toast helper ──────────────────────────────────
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    var icon =
      kind === "ok"
        ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>'
        : kind === "warn"
        ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'
        : "";
    el.innerHTML = icon + "<span>" + msg + "</span>";
    toaster.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, 2600);
  }

  // ── Validators per step ───────────────────────────
  function setError(input, msg) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.remove("is-ok");
    field.classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
    var help = field.querySelector(".help");
    if (help) {
      if (help.dataset.base === undefined) help.dataset.base = help.textContent;
      help.textContent = msg;
    }
  }

  function clearError(input) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    var help = field.querySelector(".help");
    if (help && help.dataset.base !== undefined) {
      help.textContent = help.dataset.base;
    }
  }

  function setOk(input) {
    clearError(input);
    var field = input.closest(".field");
    if (field) field.classList.add("is-ok");
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Each validator returns an array of {input, msg} for the first failing fields.
  function validateStep(index, report) {
    var errors = [];
    var fail = function (input, msg) {
      if (report) setError(input, msg);
      errors.push({ input: input, msg: msg });
    };
    var pass = function (input) {
      if (report) setOk(input);
    };

    if (index === 0) {
      var email = form.email;
      var pw = form.password;
      var confirm = form.confirm;

      if (!email.value.trim()) fail(email, "Email is required.");
      else if (!EMAIL_RE.test(email.value.trim())) fail(email, "Enter a valid email address.");
      else pass(email);

      if (!pw.value) fail(pw, "Password is required.");
      else if (pw.value.length < 8) fail(pw, "Use at least 8 characters.");
      else if (!/\d/.test(pw.value)) fail(pw, "Include at least one number.");
      else pass(pw);

      if (!confirm.value) fail(confirm, "Please confirm your password.");
      else if (confirm.value !== pw.value) fail(confirm, "Passwords don't match.");
      else if (pw.value.length >= 8) pass(confirm);
    } else if (index === 1) {
      var fn = form.firstName;
      var ln = form.lastName;
      var co = form.company;
      if (!fn.value.trim()) fail(fn, "First name is required."); else pass(fn);
      if (!ln.value.trim()) fail(ln, "Last name is required."); else pass(ln);
      if (!co.value.trim()) fail(co, "Company is required."); else pass(co);

      var size = form.querySelector('input[name="teamSize"]:checked');
      if (!size) {
        var sizeField = document.getElementById("sizeGroup").closest(".field");
        if (report && sizeField) sizeField.classList.add("is-error");
        errors.push({ input: document.getElementById("sizeGroup"), msg: "Pick a team size." });
      } else {
        var sf = document.getElementById("sizeGroup").closest(".field");
        if (sf) sf.classList.remove("is-error");
      }
    } else if (index === 2) {
      var plan = form.querySelector('input[name="plan"]:checked');
      var planField = document.getElementById("planGroup").closest(".field");
      if (!plan) {
        if (report && planField) planField.classList.add("is-error");
        errors.push({ input: document.getElementById("planGroup"), msg: "Choose a plan." });
      } else if (planField) {
        planField.classList.remove("is-error");
      }
    } else if (index === 3) {
      var terms = form.terms;
      var termsLabel = terms.closest(".check");
      if (!terms.checked) {
        if (report && termsLabel) termsLabel.classList.add("is-error");
        errors.push({ input: terms, msg: "You must accept the terms to continue." });
      } else if (termsLabel) {
        termsLabel.classList.remove("is-error");
      }
    }

    return errors;
  }

  function isStepValid(index) {
    return validateStep(index, false).length === 0;
  }

  // ── Progress / chrome sync ────────────────────────
  function refreshNextState() {
    if (current >= TOTAL) return;
    nextBtn.disabled = !isStepValid(current);
  }

  function updateChrome() {
    var pct = ((current + 1) / TOTAL) * 100;
    stepFill.style.width = Math.min(pct, 100) + "%";

    stepItems.forEach(function (item, i) {
      item.classList.toggle("is-current", i === current);
      item.classList.toggle("is-done", i < current);
      if (i === current) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });

    if (current >= TOTAL) {
      actions.style.display = "none";
      return;
    }
    actions.style.display = "";
    backBtn.disabled = current === 0;
    stepCount.textContent = "Step " + (current + 1) + " of " + TOTAL;

    var last = current === TOTAL - 1;
    nextBtn.firstChild && (nextBtn.childNodes[0].nodeValue = last ? "Create workspace" : "Next");
    var svg = nextBtn.querySelector("svg");
    if (svg) svg.style.display = last ? "none" : "";
    refreshNextState();
  }

  function focusHeading(index) {
    var panel = panels[index];
    var h = panel && panel.querySelector(".panel__title");
    if (h) h.focus();
  }

  // ── Step transition with slide ────────────────────
  function goTo(index, dir) {
    if (index === current) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var leaving = panels[current];
    var entering = panels[index];

    formAlert.hidden = true;

    if (reduce) {
      leaving.hidden = true;
      entering.hidden = false;
      current = index;
      updateChrome();
      focusHeading(index);
      return;
    }

    leaving.classList.add(dir === "back" ? "is-leaving-back" : "is-leaving-fwd");
    leaving.addEventListener(
      "animationend",
      function handler() {
        leaving.removeEventListener("animationend", handler);
        leaving.classList.remove("is-leaving-back", "is-leaving-fwd");
        leaving.hidden = true;
        entering.hidden = false;
        entering.classList.remove("is-entering-back");
        if (dir === "back") {
          // restart the back-entry animation
          entering.classList.add("is-entering-back");
          void entering.offsetWidth;
        } else {
          // re-trigger forward slide-in
          entering.style.animation = "none";
          void entering.offsetWidth;
          entering.style.animation = "";
        }
        current = index;
        updateChrome();
        focusHeading(index);
      },
      { once: false }
    );
  }

  // ── Review summary builder ────────────────────────
  function val(name, fallback) {
    var el = form[name];
    if (!el) return fallback || "—";
    if (el.value !== undefined && el.type !== "radio") return el.value.trim() || fallback || "—";
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : fallback || "—";
  }

  function buildSummary() {
    var billing = form.annual.checked ? "Annual (−20%)" : "Monthly";
    var rows = [
      { k: "Email", v: val("email"), step: 0 },
      { k: "Name", v: (val("firstName") + " " + val("lastName")).trim() || "—", step: 1 },
      { k: "Company", v: val("company"), step: 1 },
      { k: "Team size", v: val("teamSize"), step: 1 },
      { k: "Plan", v: val("plan", "—"), step: 2 },
      { k: "Billing", v: billing, step: 2 },
    ];
    summary.innerHTML = "";
    rows.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "summary__row";
      var dt = document.createElement("dt");
      dt.className = "summary__key";
      dt.textContent = r.k;
      var dd = document.createElement("dd");
      dd.className = "summary__val";
      dd.style.margin = "0";
      dd.textContent = r.v;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "summary__edit";
      btn.textContent = "Edit";
      btn.setAttribute("aria-label", "Edit " + r.k);
      btn.addEventListener("click", function () {
        goTo(r.step, "back");
      });
      row.appendChild(dt);
      row.appendChild(dd);
      row.appendChild(btn);
      summary.appendChild(row);
    });
  }

  // ── Next / Back handlers ──────────────────────────
  function handleNext() {
    var errors = validateStep(current, true);
    if (errors.length) {
      formAlert.hidden = false;
      formAlert.textContent =
        errors.length === 1
          ? errors[0].msg
          : "Please fix " + errors.length + " fields before continuing.";
      var first = errors[0].input;
      if (first && first.focus) first.focus();
      toast("Some fields need attention.", "warn");
      return;
    }

    if (current === TOTAL - 1) {
      submit();
      return;
    }
    buildSummaryIfNeeded(current + 1);
    goTo(current + 1, "fwd");
  }

  function buildSummaryIfNeeded(nextIndex) {
    if (nextIndex === 3) buildSummary();
  }

  function handleBack() {
    if (current === 0) return;
    goTo(current - 1, "back");
  }

  // ── Submit → success ──────────────────────────────
  function submit() {
    nextBtn.classList.add("is-busy");
    nextBtn.disabled = true;
    nextBtn.childNodes[0].nodeValue = "Creating…";

    // Simulated async create (no network) so the busy state is visible.
    setTimeout(function () {
      var done = panels[4];
      var doneText = document.getElementById("doneText");
      if (doneText) {
        doneText.textContent =
          "You're all set, " +
          (val("firstName") || "there") +
          ". We've sent a confirmation to " +
          val("email") +
          ".";
      }
      panels[current].hidden = true;
      done.hidden = false;
      current = 4;
      stepItems.forEach(function (it) {
        it.classList.remove("is-current");
        it.classList.add("is-done");
        it.removeAttribute("aria-current");
      });
      stepFill.style.width = "100%";
      updateChrome();
      focusHeading(4);
      toast("Workspace created.", "ok");
      nextBtn.classList.remove("is-busy");
    }, 700);
  }

  // ── Restart ───────────────────────────────────────
  document.getElementById("restart").addEventListener("click", function () {
    form.reset();
    panels.forEach(function (p, i) {
      p.hidden = i !== 0;
    });
    form.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("is-error", "is-ok");
    });
    form.querySelectorAll(".check").forEach(function (c) {
      c.classList.remove("is-error");
    });
    formAlert.hidden = true;
    current = 0;
    updateChrome();
    focusHeading(0);
  });

  // ── Password reveal toggle ────────────────────────
  form.querySelectorAll("[data-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = document.getElementById(btn.dataset.toggle);
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  // ── Live re-validate as the user types/selects ────
  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.closest(".field") && t.closest(".field").classList.contains("is-error")) {
      // soft clear on edit; full check on blur / next
      validateStep(current, true);
    }
    refreshNextState();
  });

  form.addEventListener("change", function () {
    // radios, checkboxes, switch
    if (current === 3) validateStep(3, true);
    refreshNextState();
  });

  form.addEventListener(
    "blur",
    function (e) {
      var t = e.target;
      if (t && t.tagName === "INPUT" && t.closest(".field")) {
        validateStep(current, true);
        refreshNextState();
      }
    },
    true
  );

  nextBtn.addEventListener("click", handleNext);
  backBtn.addEventListener("click", handleBack);

  // Enter advances instead of submitting the whole form.
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleNext();
  });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
      handleNext();
    }
  });

  // ── Init ──────────────────────────────────────────
  updateChrome();
})();
