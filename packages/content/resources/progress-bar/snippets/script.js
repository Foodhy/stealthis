(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".progress-fill[data-value]").forEach(function (fill) {
    var target = parseFloat(fill.dataset.value) || 0;
    if (reduced) { fill.style.width = target + "%"; return; }
    requestAnimationFrame(function () {
      setTimeout(function () { fill.style.width = target + "%"; }, 100);
    });
  });
}());
