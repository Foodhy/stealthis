// script.js — JS only mirrors the live :has() state into the readout.
// All actual UI behavior is pure CSS via :has(). No event-driven styling here.
(function () {
  "use strict";

  var supportsHas =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("selector(:has(*))");

  // ---- feature detect banner ----
  var banner = document.getElementById("support");
  if (supportsHas) {
    banner.classList.add("ok");
    banner.textContent = "Native :has() is active — every panel is CSS-driven.";
  } else {
    banner.classList.add("no");
    banner.textContent =
      "This browser lacks :has() — showing a static accessible fallback.";
    document.body.classList.add("no-has");
    // still wire the readout so the label isn't stale
    document.getElementById("selector").textContent =
      "/* :has() unsupported — fallback styling applied */";
    return;
  }

  var readout = document.querySelector(".readout");
  var selectorEl = document.getElementById("selector");
  var form = document.getElementById("signup");
  var plans = document.getElementById("plans");
  var planStatus = document.getElementById("plan-status");
  var grid = document.querySelector(".grid");
  var tabInputs = document.querySelectorAll('input[name="tabs"]');

  var idleText = ":root { /* interact to see :has() fire */ }";
  var idleTimer = null;

  function show(rule, hot) {
    selectorEl.textContent = rule;
    readout.classList.toggle("hot", !!hot);
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      selectorEl.textContent = idleText;
      readout.classList.remove("hot");
    }, 2600);
  }

  // ---- 1. form: report which rule the field wrappers match ----
  function reportForm() {
    var email = form.querySelector('input[name="email"]');
    var pw = form.querySelector('input[name="pw"]');
    var terms = form.querySelector('input[name="terms"]');

    var invalid = form.querySelector("input:user-invalid");
    if (invalid) {
      show(".field:has(input:user-invalid) { border-color: danger }", false);
      return;
    }
    var complete =
      email.validity.valid &&
      email.value &&
      pw.validity.valid &&
      pw.value &&
      terms.checked;
    if (complete) {
      show(
        "form:has(:valid):has([name=terms]:checked) .submit { unlocked }",
        true
      );
    } else {
      show(".field:has(input:valid:not(:placeholder-shown)) { ok }", true);
    }
  }
  form.addEventListener("input", reportForm);
  form.addEventListener("blur", reportForm, true);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector(".submit");
    var label = btn.textContent;
    btn.textContent = "Account created ✓";
    show("form:has(:valid):has([name=terms]:checked) — submitted", true);
    setTimeout(function () {
      btn.textContent = label;
    }, 1600);
  });

  // ---- 2. spotlight grid ----
  grid.addEventListener("pointerover", function (e) {
    if (e.target.closest(".card")) {
      show(".grid:has(.card:hover) .card:not(:hover) { dimmed }", true);
    }
  });
  grid.addEventListener("focusin", function (e) {
    if (e.target.closest(".card")) {
      show(".grid:has(.card:focus-visible) .card:not(:focus-visible) { dimmed }", true);
    }
  });

  // ---- 3. count-aware layout ----
  function reportPlans() {
    var n = plans.querySelectorAll("input:checked").length;
    var msg, rule;
    if (n === 0) {
      msg = "Nothing selected — single-column stack.";
      rule = ".plans { grid-template-columns: 1fr }";
    } else if (n === 1) {
      msg = "1 plan selected — still one column.";
      rule = ".plan:has(input:checked) { highlighted }";
    } else if (n === 2) {
      msg = "2 plans — layout splits into two columns.";
      rule = ".plans:has(input:checked ~ label input:checked) { 2 cols }";
    } else {
      msg = n + " plans — comparison mode with cyan outline.";
      rule =
        ".plans:has(:checked ~ label :checked ~ label :checked) { compare }";
    }
    planStatus.textContent = msg;
    show(rule, n > 0);
  }
  plans.addEventListener("change", reportPlans);

  // ---- 4. tabs (readout only; CSS does the switching) ----
  tabInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      var name = input.nextElementSibling.textContent.trim();
      show(".tabs:has(#" + input.id + ":checked) .tabpanel { show " + name + " }", true);
    });
  });

  // accordion readout
  document.querySelectorAll(".acc-item input").forEach(function (input) {
    input.addEventListener("change", function () {
      show(
        ".acc-item:has(input:checked) .acc-body { expand }",
        input.checked
      );
    });
  });
})();
