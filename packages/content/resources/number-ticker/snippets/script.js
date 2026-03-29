(function () {
  "use strict";

  var tickers = document.querySelectorAll(".number-ticker");
  var resetBtn = document.getElementById("ticker-reset");

  function buildTicker(el) {
    var value = el.getAttribute("data-value") || "0";
    var separator = el.getAttribute("data-separator") || "";
    var digits = value.split("");

    // Clear existing content
    el.innerHTML = "";

    // Calculate separator positions (counting from right)
    var digitIndex = 0;

    digits.forEach(function (digit, i) {
      // Add separator before this digit if needed
      if (separator && digitIndex > 0 && (digits.length - i) % 3 === 0) {
        var sep = document.createElement("span");
        sep.className = "digit-separator";
        sep.textContent = separator;
        el.appendChild(sep);
      }

      // Create digit column
      var column = document.createElement("div");
      column.className = "digit-column";

      // Add digits 0-9
      for (var d = 0; d <= 9; d++) {
        var span = document.createElement("span");
        span.textContent = d;
        column.appendChild(span);
      }

      // Start at 0 (no transform)
      column.style.transform = "translateY(0)";
      column.setAttribute("data-target", digit);

      // Stagger delay: rightmost digits animate first
      var delay = (digits.length - 1 - i) * 0.06;
      column.style.transitionDelay = delay + "s";

      el.appendChild(column);
      digitIndex++;
    });

    return el;
  }

  function animateTickers() {
    tickers.forEach(function (el) {
      var columns = el.querySelectorAll(".digit-column");
      columns.forEach(function (col) {
        var target = parseInt(col.getAttribute("data-target"), 10);
        col.style.transform = "translateY(-" + target + "em)";
      });
    });
  }

  function resetTickers() {
    tickers.forEach(function (el) {
      var columns = el.querySelectorAll(".digit-column");
      columns.forEach(function (col) {
        col.style.transition = "none";
        col.style.transform = "translateY(0)";
      });
    });

    // Trigger reflow then re-animate
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        tickers.forEach(function (el) {
          var columns = el.querySelectorAll(".digit-column");
          columns.forEach(function (col) {
            col.style.transition = "";
            var target = parseInt(col.getAttribute("data-target"), 10);
            col.style.transform = "translateY(-" + target + "em)";
          });
        });
      });
    });
  }

  // Build all tickers
  tickers.forEach(buildTicker);

  // Animate on load with slight delay
  setTimeout(animateTickers, 200);

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener("click", resetTickers);
  }
})();
