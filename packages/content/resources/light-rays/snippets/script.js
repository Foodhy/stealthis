// Light Rays — generates atmospheric volumetric rays
(function () {
  "use strict";

  const container = document.getElementById("rays-container");
  if (!container) return;

  const RAY_COUNT = 16;

  const rays = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = document.createElement("div");
    ray.className = "ray";

    // Spread rays from -60 to 60 degrees with some randomness
    const baseAngle = -60 + (120 / (RAY_COUNT - 1)) * i;
    const angle = baseAngle + (Math.random() - 0.5) * 8;

    // Varied widths for organic feel
    const width = Math.random() * 80 + 20;
    const opacity = Math.random() * 0.5 + 0.2;
    const delay = Math.random() * 4;
    const blur = Math.random() * 8 + 2;

    ray.style.setProperty("--ray-angle", angle + "deg");
    ray.style.setProperty("--ray-width", width + "px");
    ray.style.setProperty("--ray-opacity", opacity);
    ray.style.setProperty("--ray-delay", delay + "s");
    ray.style.setProperty("--ray-blur", blur + "px");

    container.appendChild(ray);
    rays.push(ray);
  }
})();
