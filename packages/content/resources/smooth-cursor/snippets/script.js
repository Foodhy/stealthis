// Smooth Cursor — custom cursor with lerp/spring interpolation
(function () {
  "use strict";

  var dot = document.getElementById("cursor-dot");
  var ring = document.getElementById("cursor-ring");
  var trail = document.getElementById("cursor-trail");
  if (!dot || !ring || !trail) return;

  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var dotPos = { x: mouse.x, y: mouse.y };
  var ringPos = { x: mouse.x, y: mouse.y };
  var trailPos = { x: mouse.x, y: mouse.y };

  var DOT_SPEED = 0.25;
  var RING_SPEED = 0.12;
  var TRAIL_SPEED = 0.06;

  var isHovering = false;
  var visible = false;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function update() {
    // Lerp each element toward mouse position
    dotPos.x = lerp(dotPos.x, mouse.x, DOT_SPEED);
    dotPos.y = lerp(dotPos.y, mouse.y, DOT_SPEED);

    ringPos.x = lerp(ringPos.x, mouse.x, RING_SPEED);
    ringPos.y = lerp(ringPos.y, mouse.y, RING_SPEED);

    trailPos.x = lerp(trailPos.x, mouse.x, TRAIL_SPEED);
    trailPos.y = lerp(trailPos.y, mouse.y, TRAIL_SPEED);

    dot.style.left = dotPos.x + "px";
    dot.style.top = dotPos.y + "px";

    ring.style.left = ringPos.x + "px";
    ring.style.top = ringPos.y + "px";

    trail.style.left = trailPos.x + "px";
    trail.style.top = trailPos.y + "px";

    requestAnimationFrame(update);
  }

  document.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (!visible) {
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      trail.style.opacity = "1";
    }
  });

  document.addEventListener("mouseleave", function () {
    visible = false;
    dot.style.opacity = "0";
    ring.style.opacity = "0";
    trail.style.opacity = "0";
  });

  document.addEventListener("mouseenter", function () {
    visible = true;
    dot.style.opacity = "1";
    ring.style.opacity = "1";
    trail.style.opacity = "1";
  });

  // Hover detection for interactive elements
  var hoverables = document.querySelectorAll(".hoverable, a, button");
  hoverables.forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      isHovering = true;
      dot.classList.add("hovering");
      ring.classList.add("hovering");
    });
    el.addEventListener("mouseleave", function () {
      isHovering = false;
      dot.classList.remove("hovering");
      ring.classList.remove("hovering");
    });
  });

  // Click effect — scale ring briefly
  document.addEventListener("mousedown", function () {
    ring.style.transform = "translate(-50%, -50%) scale(0.8)";
    dot.style.transform = "translate(-50%, -50%) scale(1.4)";
  });
  document.addEventListener("mouseup", function () {
    ring.style.transform = "translate(-50%, -50%) scale(1)";
    dot.style.transform = "translate(-50%, -50%) scale(1)";
  });

  // Initially hide until mouse moves
  dot.style.opacity = "0";
  ring.style.opacity = "0";
  trail.style.opacity = "0";

  update();
})();
