// Ripple Effect — expanding concentric ripples from click point
(function () {
  "use strict";

  function createRipple(container, e) {
    var rect = container.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    // Calculate size to cover the entire container from click point
    var maxDist = Math.max(
      Math.sqrt(x * x + y * y),
      Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
      Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
      Math.sqrt(
        (rect.width - x) * (rect.width - x) +
          (rect.height - y) * (rect.height - y)
      )
    );
    var size = maxDist * 2;

    // Main ripple fill
    var ripple = document.createElement("span");
    ripple.className = "ripple-circle";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = x - size / 2 + "px";
    ripple.style.top = y - size / 2 + "px";
    container.appendChild(ripple);

    // Concentric rings
    for (var i = 0; i < 3; i++) {
      var ring = document.createElement("span");
      ring.className = "ripple-ring";
      var ringSize = size * (0.5 + i * 0.3);
      ring.style.width = ringSize + "px";
      ring.style.height = ringSize + "px";
      ring.style.left = x - ringSize / 2 + "px";
      ring.style.top = y - ringSize / 2 + "px";
      ring.style.animationDelay = i * 0.12 + "s";
      container.appendChild(ring);

      (function (el) {
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 1200);
      })(ring);
    }

    // Clean up main ripple
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 900);
  }

  // Attach to main surface
  var surface = document.getElementById("ripple-surface");
  if (surface) {
    surface.addEventListener("click", function (e) {
      createRipple(surface, e);
    });
  }

  // Attach to cards
  var cards = document.querySelectorAll(".ripple-target");
  cards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      createRipple(card, e);
    });
  });
})();
