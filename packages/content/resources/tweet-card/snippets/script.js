// Tweet Card — mostly static layout, no JS required for the base component.
// This script adds optional metric interaction feedback.
(function () {
  "use strict";

  const metrics = document.querySelectorAll(".tweet-metric");

  metrics.forEach(function (metric) {
    metric.addEventListener("click", function () {
      const span = metric.querySelector("span");
      if (!span) return;

      // Simple toggle: parse number and increment/decrement
      const text = span.textContent.trim();
      const num = parseInt(text.replace(/,/g, ""), 10);
      if (isNaN(num)) return;

      if (metric.classList.contains("active")) {
        metric.classList.remove("active");
        span.textContent = (num - 1).toLocaleString();
      } else {
        metric.classList.add("active");
        span.textContent = (num + 1).toLocaleString();
      }
    });
  });
})();
