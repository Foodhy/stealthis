(function () {
  "use strict";

  // Shared article body. First paragraph opens with a quote so hanging-punctuation
  // and the drop cap both have something to act on. Deliberately worded to produce
  // a short "orphan" last line unless text-wrap: pretty intervenes.
  var BODY = [
    "“The line breaks nobody notices are the ones doing the most work,” says every " +
      "typographer who has ever agonized over a single ragged edge. For decades the browser " +
      "greedily filled each line and moved on, occasionally stranding one lonely word.",
    "text-wrap: pretty asks the engine to look ahead across the whole paragraph, trading a " +
      "little speed for a smoother right edge and, crucially, no orphaned final word dangling " +
      "on a line of its own.",
    "For headings, text-wrap: balance evens out the length of every line so a two-line title " +
      "never leaves a single small word marooned below a very long one. It is quietly the most " +
      "flattering line of CSS you can add to a page."
  ];

  var proseOff = document.getElementById("prose-off");
  var proseOn = document.getElementById("prose-on");

  function render(el) {
    el.innerHTML = BODY.map(function (t) {
      return "<p>" + t + "</p>";
    }).join("");
  }
  render(proseOff);
  render(proseOn);

  // ---- Feature detection -------------------------------------------------
  function supported(prop, value) {
    try {
      return window.CSS && CSS.supports(prop, value);
    } catch (e) {
      return false;
    }
  }

  var FEATURES = {
    "tw-balance": supported("text-wrap", "balance"),
    "tw-pretty": supported("text-wrap", "pretty"),
    "hang": supported("hanging-punctuation", "first"),
    // Safari ships the prefixed form; accept either.
    "dropcap":
      supported("initial-letter", "3") || supported("-webkit-initial-letter", "3")
  };

  var els = {
    balance: document.getElementById("tw-balance"),
    pretty: document.getElementById("tw-pretty"),
    hang: document.getElementById("hang"),
    dropcap: document.getElementById("dropcap")
  };

  var status = document.getElementById("status");

  function markUnsupported(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var wrapper = input.closest(".switch");
    var flag = wrapper ? wrapper.querySelector("[data-flag]") : null;
    if (!FEATURES[inputId]) {
      input.checked = false;
      input.disabled = true;
      if (wrapper) wrapper.classList.add("is-unsupported");
      if (flag) flag.hidden = false;
    }
  }
  Object.keys(FEATURES).forEach(markUnsupported);

  // ---- Apply state -------------------------------------------------------
  var onHeadline = proseOn.parentElement.querySelector(".headline");

  function apply() {
    // Heading balance (ON column). When unsupported, class simply has no effect.
    onHeadline.style.textWrap = els.balance.checked ? "balance" : "normal";

    // Body pretty (ON column).
    proseOn.style.textWrap = els.pretty.checked ? "pretty" : "normal";

    // Hanging punctuation + drop cap apply to BOTH columns so the effect is
    // isolated from the balance/pretty comparison.
    proseOff.classList.toggle("is-hang", els.hang.checked);
    proseOn.classList.toggle("is-hang", els.hang.checked);
    proseOff.classList.toggle("is-dropcap", els.dropcap.checked);
    proseOn.classList.toggle("is-dropcap", els.dropcap.checked);

    announce();
  }

  function announce() {
    var on = [];
    if (els.balance.checked) on.push("balance");
    if (els.pretty.checked) on.push("pretty");
    if (els.hang.checked) on.push("hanging punctuation");
    if (els.dropcap.checked) on.push("drop cap");

    var msg;
    if (on.length === 0) {
      msg = "All enhancements off — both columns now use plain, greedy line wrapping.";
    } else {
      var list =
        on.length === 1
          ? on[0]
          : on.slice(0, -1).join(", ") + " and " + on[on.length - 1];
      msg =
        "Active: " +
        list +
        ". The right column shows the difference against plain wrapping on the left.";
    }
    status.textContent = msg;
  }

  ["balance", "pretty", "hang", "dropcap"].forEach(function (k) {
    els[k].addEventListener("change", apply);
  });

  // ---- Measure slider ----------------------------------------------------
  var measure = document.getElementById("measure");
  var measureOut = document.getElementById("measure-out");

  function setMeasure() {
    var ch = measure.value + "ch";
    document.documentElement.style.setProperty("--measure", ch);
    measureOut.textContent = ch;
  }
  measure.addEventListener("input", setMeasure);

  // ---- Init --------------------------------------------------------------
  setMeasure();
  apply();
})();
