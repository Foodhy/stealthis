document.querySelectorAll(".num-input:not(.num-input--disabled)").forEach(function (widget) {
  var min = widget.dataset.min !== undefined ? parseFloat(widget.dataset.min) : -Infinity;
  var max = widget.dataset.max !== undefined ? parseFloat(widget.dataset.max) : Infinity;
  var step = widget.dataset.step !== undefined ? parseFloat(widget.dataset.step) : 1;

  var field = widget.querySelector(".num-field");
  var dec = widget.querySelector(".num-btn--dec");
  var inc = widget.querySelector(".num-btn--inc");

  function parse(v) {
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function round(n) {
    // round to step precision to avoid floating-point drift
    var decimals = (step.toString().split(".")[1] || "").length;
    return parseFloat(n.toFixed(decimals));
  }

  function clamp(n) {
    return Math.min(Math.max(n, min), max);
  }

  function set(n) {
    var clamped = clamp(round(n));
    field.value = clamped;
    dec.disabled = clamped <= min;
    inc.disabled = clamped >= max;
  }

  dec.addEventListener("click", function () {
    set(parse(field.value) - step);
  });
  inc.addEventListener("click", function () {
    set(parse(field.value) + step);
  });

  field.addEventListener("change", function () {
    set(parse(field.value));
  });

  field.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      set(parse(field.value) + step);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      set(parse(field.value) - step);
    }
  });

  // initialise boundary state
  set(parse(field.value));
});
