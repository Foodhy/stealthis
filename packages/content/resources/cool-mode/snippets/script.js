// Cool Mode — emoji particle burst on every click
(function () {
  "use strict";

  var EMOJIS = [
    "\u2728", "\u2B50", "\u2764\uFE0F", "\u{1F525}", "\u{1F389}",
    "\u{1F31F}", "\u{1F4AB}", "\u{1F308}", "\u{1F680}", "\u{1F388}",
    "\u{1F381}", "\u{1F382}", "\u{1F386}", "\u{1F387}", "\u2604\uFE0F",
  ];
  var PARTICLE_COUNT = 15;
  var GRAVITY = 0.12;
  var FRICTION = 0.98;
  var FADE_SPEED = 0.015;

  var activeParticles = [];
  var animRunning = false;

  function spawnParticles(x, y) {
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var el = document.createElement("span");
      el.className = "cool-particle";
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.fontSize = (14 + Math.random() * 16) + "px";
      document.body.appendChild(el);

      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 6;

      activeParticles.push({
        el: el,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        scale: 0.5 + Math.random() * 0.8,
      });
    }

    if (!animRunning) {
      animRunning = true;
      requestAnimationFrame(animate);
    }
  }

  function animate() {
    for (var i = activeParticles.length - 1; i >= 0; i--) {
      var p = activeParticles[i];

      p.vy += GRAVITY;
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= FADE_SPEED;
      p.rotation += p.rotationSpeed;

      if (p.opacity <= 0) {
        if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
        activeParticles.splice(i, 1);
        continue;
      }

      p.el.style.transform =
        "translate(-50%, -50%) rotate(" +
        p.rotation +
        "deg) scale(" +
        p.scale +
        ")";
      p.el.style.left = p.x + "px";
      p.el.style.top = p.y + "px";
      p.el.style.opacity = p.opacity;
    }

    if (activeParticles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      animRunning = false;
    }
  }

  document.addEventListener("click", function (e) {
    spawnParticles(e.clientX, e.clientY);
  });
})();
