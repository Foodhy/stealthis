var LABELS = [
  "No rating",
  "1 star — Poor",
  "2 stars — Fair",
  "3 stars — Good",
  "4 stars — Very good",
  "5 stars — Excellent",
];

document.querySelectorAll(".rating:not(.rating--readonly)").forEach(function (widget) {
  var buttons = widget.querySelectorAll(".star-btn");
  var labelEl = widget.querySelector(".rating-label");
  var selected = parseInt(widget.dataset.rating, 10) || 0;

  function paint(hovered) {
    var active = hovered > 0 ? hovered : selected;
    buttons.forEach(function (btn) {
      var v = parseInt(btn.dataset.value, 10);
      btn.classList.toggle("is-selected", v <= active && hovered === 0);
      btn.classList.toggle("is-hovered", v <= active && hovered > 0);
    });
  }

  function updateLabel(val) {
    if (labelEl) labelEl.textContent = LABELS[val] || LABELS[0];
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("mouseover", function () {
      paint(parseInt(btn.dataset.value, 10));
    });
    btn.addEventListener("click", function () {
      selected = parseInt(btn.dataset.value, 10);
      widget.dataset.rating = selected;
      buttons.forEach(function (b) {
        b.setAttribute("aria-checked", b === btn ? "true" : "false");
      });
      updateLabel(selected);
      paint(0);
    });
    btn.addEventListener("keydown", function (e) {
      var idx = Array.from(buttons).indexOf(btn);
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        var next = buttons[Math.min(idx + 1, buttons.length - 1)];
        next.focus();
        next.click();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        var prev = buttons[Math.max(idx - 1, 0)];
        prev.focus();
        prev.click();
      }
    });
  });

  widget.addEventListener("mouseleave", function () {
    paint(0);
  });

  // Initialise
  paint(0);
  updateLabel(selected);
});
