(function () {
  "use strict";

  const container = document.getElementById("arc-timeline");
  if (!container) return;

  const events = container.querySelectorAll(".arc-event");
  const arcPath = document.getElementById("arc-path");
  const count = events.length;

  // Arc parameters
  const centerX = 300;
  const centerY = 300;
  const radius = 250;
  const startAngle = Math.PI;       // 180 deg (left)
  const endAngle = 0;               // 0 deg (right)

  // Calculate positions along the arc
  const points = [];

  events.forEach((event, i) => {
    const angle = startAngle + (endAngle - startAngle) * (i / (count - 1));
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    points.push({ x, y });

    // Position the event node (offset to center the dot)
    event.style.left = x + "px";
    event.style.top = y + "px";
    event.style.transform = "translate(-50%, -50%) scale(0.6)";
    event.style.transitionDelay = i * 0.12 + "s";
  });

  // Draw the SVG arc path
  if (arcPath && points.length > 1) {
    // Create a smooth arc using SVG arc command
    const first = points[0];
    const last = points[points.length - 1];

    // SVG arc: M start A rx ry rotation large-arc-flag sweep-flag end
    const d = `M ${first.x} ${first.y} A ${radius} ${radius} 0 0 1 ${last.x} ${last.y}`;
    arcPath.setAttribute("d", d);
  }

  // Trigger entrance animation
  function showEvents() {
    events.forEach((event) => {
      event.classList.add("visible");
      // Re-apply translate-centered transform when visible
      event.style.transform = "translate(-50%, -50%) scale(1)";
    });
  }

  // Use IntersectionObserver if available
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showEvents();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(container);
})();
