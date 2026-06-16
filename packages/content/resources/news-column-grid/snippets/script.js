(function () {
  "use strict";

  var root = document.documentElement;
  var flow = document.getElementById("flow");
  var toastEl = document.getElementById("toast");

  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg"));
  var gapInput = document.getElementById("gap");
  var gapVal = document.getElementById("gap-val");
  var ruleInput = document.getElementById("rule");
  var justifyInput = document.getElementById("justify");
  var resetBtn = document.getElementById("reset");

  var DEFAULTS = { cols: 2, gap: 2.4, rule: true, justify: true };

  /* --- Toast helper --- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 1900);
  }

  /* --- Column count --- */
  function setCols(n, announce) {
    n = Math.max(1, Math.min(4, parseInt(n, 10) || 2));
    root.style.setProperty("--flow-cols", String(n));
    flow.setAttribute("data-cols", String(n));
    segs.forEach(function (s) {
      var active = parseInt(s.getAttribute("data-cols"), 10) === n;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-checked", active ? "true" : "false");
    });
    if (announce) {
      toast("Flowing across <strong>" + n + (n === 1 ? " column" : " columns") + "</strong>");
    }
  }

  segs.forEach(function (s) {
    s.addEventListener("click", function () {
      setCols(s.getAttribute("data-cols"), true);
    });
  });

  /* Keyboard arrow nav on the radiogroup */
  var group = document.querySelector(".segmented");
  if (group) {
    group.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var current = parseInt(flow.getAttribute("data-cols"), 10);
      var next = e.key === "ArrowRight" ? current + 1 : current - 1;
      next = Math.max(1, Math.min(4, next));
      setCols(next, true);
      var target = document.querySelector('.seg[data-cols="' + next + '"]');
      if (target) target.focus();
    });
  }

  /* --- Column gap --- */
  function setGap(v, announce) {
    var num = Math.round(parseFloat(v) * 10) / 10;
    root.style.setProperty("--flow-gap", num + "rem");
    gapVal.textContent = num.toFixed(1) + "rem";
    if (announce) toast("Gap set to <strong>" + num.toFixed(1) + "rem</strong>");
  }
  gapInput.addEventListener("input", function () {
    setGap(gapInput.value, false);
  });
  gapInput.addEventListener("change", function () {
    setGap(gapInput.value, true);
  });

  /* --- Column rule toggle --- */
  function setRule(on, announce) {
    root.style.setProperty(
      "--flow-rule",
      on ? "var(--rule)" : "transparent"
    );
    ruleInput.checked = on;
    if (announce) toast(on ? "Column rules <strong>on</strong>" : "Column rules <strong>off</strong>");
  }
  ruleInput.addEventListener("change", function () {
    setRule(ruleInput.checked, true);
  });

  /* --- Justify + hyphenate toggle --- */
  function setJustify(on, announce) {
    root.style.setProperty("--flow-align", on ? "justify" : "left");
    flow.style.hyphens = on ? "auto" : "manual";
    flow.style.webkitHyphens = on ? "auto" : "manual";
    justifyInput.checked = on;
    if (announce) {
      toast(on ? "Justified &amp; hyphenated" : "Set ragged-right (left aligned)");
    }
  }
  justifyInput.addEventListener("change", function () {
    setJustify(justifyInput.checked, true);
  });

  /* --- Reset --- */
  resetBtn.addEventListener("click", function () {
    setCols(DEFAULTS.cols, false);
    gapInput.value = DEFAULTS.gap;
    setGap(DEFAULTS.gap, false);
    setRule(DEFAULTS.rule, false);
    setJustify(DEFAULTS.justify, false);
    toast("Layout reset to <strong>house style</strong>");
  });

  /* --- Init from defaults --- */
  setCols(DEFAULTS.cols, false);
  setGap(DEFAULTS.gap, false);
  setRule(DEFAULTS.rule, false);
  setJustify(DEFAULTS.justify, false);
})();
