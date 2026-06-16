(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- tiny toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- fireflies ---------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  var fireflyGroup = document.getElementById("fireflies");
  var flies = [];
  if (fireflyGroup) {
    var seeds = [
      [120, 150, 2.4],
      [200, 110, 1.8],
      [270, 170, 2.1],
      [90, 200, 1.6],
      [310, 130, 2.0],
      [170, 90, 1.5],
      [240, 210, 2.2],
    ];
    seeds.forEach(function (s, i) {
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("class", "firefly");
      c.setAttribute("cx", s[0]);
      c.setAttribute("cy", s[1]);
      c.setAttribute("r", s[2]);
      fireflyGroup.appendChild(c);
      flies.push({
        el: c,
        bx: s[0],
        by: s[1],
        ax: 6 + (i % 3) * 4, // wander amplitude
        ay: 5 + (i % 2) * 4,
        phase: i * 1.1,
        speed: 0.6 + (i % 3) * 0.18,
      });
    });
  }

  var start = performance.now();
  function animateFlies(now) {
    var t = (now - start) / 1000;
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i];
      var x = f.bx + Math.sin(t * f.speed + f.phase) * f.ax;
      var y = f.by + Math.cos(t * f.speed * 0.8 + f.phase) * f.ay;
      f.el.setAttribute("cx", x.toFixed(2));
      f.el.setAttribute("cy", y.toFixed(2));
      f.el.style.opacity = (
        0.45 +
        0.55 * Math.abs(Math.sin(t * 1.4 + f.phase))
      ).toFixed(2);
    }
    rafId = requestAnimationFrame(animateFlies);
  }
  var rafId;
  if (!reduceMotion && flies.length) {
    rafId = requestAnimationFrame(animateFlies);
  }

  /* ---------- parallax / float on scene ---------- */
  var scene = document.getElementById("scene");
  var layers = scene ? scene.querySelectorAll(".layer") : [];
  var targetX = 0,
    targetY = 0,
    curX = 0,
    curY = 0;

  function applyParallax() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    for (var i = 0; i < layers.length; i++) {
      var depth = parseFloat(layers[i].getAttribute("data-depth")) || 0;
      var k = depth / 40;
      layers[i].style.transform =
        "translate(" +
        (curX * k * 18).toFixed(2) +
        "px," +
        (curY * k * 14).toFixed(2) +
        "px)";
    }
    parallaxRaf = requestAnimationFrame(applyParallax);
  }
  var parallaxRaf;

  if (scene && layers.length && !reduceMotion) {
    parallaxRaf = requestAnimationFrame(applyParallax);

    scene.addEventListener("pointermove", function (e) {
      var r = scene.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width - 0.5;
      targetY = (e.clientY - r.top) / r.height - 0.5;
    });
    scene.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
    });

    // device tilt parallax (mobile)
    window.addEventListener(
      "deviceorientation",
      function (e) {
        if (e.gamma == null || e.beta == null) return;
        targetX = Math.max(-1, Math.min(1, e.gamma / 35));
        targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
      },
      true
    );
  }

  /* ---------- "Read it again" sparkle button ---------- */
  var againBtn = document.getElementById("again");
  var prose = document.getElementById("prose");

  function sparkleBurst(x, y) {
    if (reduceMotion) return;
    var n = 12;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("div");
      s.className = "sparkle";
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      var dist = 40 + Math.random() * 60;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty(
        "--dx",
        (Math.cos(ang) * dist).toFixed(1) + "px"
      );
      s.style.setProperty(
        "--dy",
        (Math.sin(ang) * dist).toFixed(1) + "px"
      );
      s.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M12 0l2.6 8.4L23 11l-8.4 2.6L12 22l-2.6-8.4L1 11l8.4-2.6z"/></svg>';
      document.body.appendChild(s);
      (function (node) {
        setTimeout(function () {
          node.remove();
        }, 950);
      })(s);
    }
  }

  if (againBtn && prose) {
    againBtn.addEventListener("click", function () {
      var r = againBtn.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2);

      // replay the page-turn pop
      prose.classList.remove("replay");
      // force reflow so the animation restarts
      void prose.offsetWidth;
      prose.classList.add("replay");

      // scroll the story page into view (mobile / stacked)
      var story = document.getElementById("story");
      if (story && typeof story.scrollIntoView === "function") {
        story.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
        });
      }

      toast("Once more, from the top ✨");
    });

    prose.addEventListener("animationend", function () {
      prose.classList.remove("replay");
    });
  }

  /* ---------- dyslexia-friendly font toggle ---------- */
  var legibleBtn = document.getElementById("legible");
  if (legibleBtn) {
    legibleBtn.addEventListener("click", function () {
      var on = document.body.classList.toggle("legible");
      legibleBtn.setAttribute("aria-pressed", on ? "true" : "false");
      toast(on ? "Easy-read font on" : "Easy-read font off");
    });
  }

  /* ---------- pause heavy loops when tab hidden ---------- */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
    } else if (!reduceMotion) {
      if (flies.length) rafId = requestAnimationFrame(animateFlies);
      if (scene && layers.length)
        parallaxRaf = requestAnimationFrame(applyParallax);
    }
  });
})();
