(function () {
  "use strict";

  // The aspect-ratio component is primarily CSS-driven.
  // This script adds interactive ratio switching for demonstration purposes.

  var containers = document.querySelectorAll(".aspect-ratio");

  // Feature detection: check if aspect-ratio is supported
  var supportsAspectRatio = CSS.supports("aspect-ratio", "1");

  if (!supportsAspectRatio) {
    // Apply padding-bottom fallback manually
    containers.forEach(function (el) {
      var w = parseFloat(getComputedStyle(el).getPropertyValue("--ar-w")) || 16;
      var h = parseFloat(getComputedStyle(el).getPropertyValue("--ar-h")) || 9;
      el.style.height = "0";
      el.style.paddingBottom = (h / w * 100) + "%";

      var child = el.firstElementChild;
      if (child) {
        child.style.position = "absolute";
        child.style.inset = "0";
      }
    });
  }

  // Log container dimensions for debugging
  containers.forEach(function (el) {
    var observer = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        var w = Math.round(entry.contentRect.width);
        var h = Math.round(entry.contentRect.height);
        el.setAttribute("title", w + " x " + h + "px");
      });
    });
    observer.observe(el);
  });
})();
