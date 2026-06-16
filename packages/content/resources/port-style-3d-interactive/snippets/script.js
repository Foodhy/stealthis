(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------------- 3D tilt on hover (pointer-driven) ---------------- */
  // Every [data-tilt] gets perspective tilt from the pointer position.
  // The inner transformed element is the first child that owns --rx/--ry,
  // falling back to the [data-tilt] element itself.
  function tiltTargets(host) {
    // Prefer a known inner element; otherwise the host.
    return (
      host.querySelector(
        ".scene, .project-link, .portrait-frame, .contact-inner"
      ) || host
    );
  }

  var MAX_TILT = 12; // degrees

  function bindTilt(host) {
    var target = tiltTargets(host);

    function apply(e) {
      if (reduceMotion) return;
      var rect = host.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width; // 0..1
      var py = (e.clientY - rect.top) / rect.height; // 0..1
      px = Math.min(1, Math.max(0, px));
      py = Math.min(1, Math.max(0, py));
      var ry = (px - 0.5) * 2 * MAX_TILT; // left/right
      var rx = (0.5 - py) * 2 * MAX_TILT; // up/down
      target.style.setProperty("--rx", rx.toFixed(2) + "deg");
      target.style.setProperty("--ry", ry.toFixed(2) + "deg");
      // glare position for project cards
      target.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      target.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      // parallax inner layers
      var layers = host.querySelectorAll(".pv-layer");
      for (var i = 0; i < layers.length; i++) {
        var depth = parseFloat(layers[i].getAttribute("data-depth")) || 0;
        var tx = (px - 0.5) * depth;
        var ty = (py - 0.5) * depth;
        layers[i].style.transform =
          "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px," + depth + "px)";
      }
    }

    function reset() {
      target.style.setProperty("--rx", "0deg");
      target.style.setProperty("--ry", "0deg");
      var layers = host.querySelectorAll(".pv-layer");
      for (var i = 0; i < layers.length; i++) {
        layers[i].style.transform = "translate3d(0,0,0)";
      }
    }

    host.addEventListener("pointermove", apply);
    host.addEventListener("pointerleave", reset);
    // Keyboard users: gentle tilt while focused inside
    host.addEventListener("focusin", function () {
      if (reduceMotion) return;
      target.style.setProperty("--rx", "-4deg");
      target.style.setProperty("--ry", "5deg");
    });
    host.addEventListener("focusout", reset);
  }

  var tiltHosts = document.querySelectorAll("[data-tilt]");
  for (var t = 0; t < tiltHosts.length; t++) bindTilt(tiltHosts[t]);

  /* ---------------- Device orientation (gyro) for the hero stage ---------------- */
  // On phones, tilt the hero scene with the device gyroscope.
  var heroStage = document.querySelector(".hero-stage[data-tilt]");
  if (heroStage && !reduceMotion && window.DeviceOrientationEvent) {
    var heroTarget = heroStage.querySelector(".scene");
    var gyroActive = false;
    window.addEventListener(
      "deviceorientation",
      function (e) {
        if (e.beta == null || e.gamma == null) return;
        gyroActive = true;
        var rx = Math.max(-18, Math.min(18, (e.beta - 45) * 0.4));
        var ry = Math.max(-18, Math.min(18, e.gamma * 0.4));
        if (heroTarget) {
          heroTarget.style.setProperty("--rx", rx.toFixed(2) + "deg");
          heroTarget.style.setProperty("--ry", ry.toFixed(2) + "deg");
        }
      },
      true
    );
    // mark so we know gyro may be in play (no-op fallback to pointer otherwise)
    void gyroActive;
  }

  /* ---------------- Scroll progress bar ---------------- */
  var progressBar = document.getElementById("progressBar");
  function updateProgress() {
    if (!progressBar) return;
    var doc = document.documentElement;
    var scrolled = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrolled / height) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------------- Reveal on scroll + counters + skill bars ---------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    var start = null;
    var dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function fillSkill(el) {
    var pct = parseInt(el.getAttribute("data-skill"), 10) || 0;
    el.style.width = pct + "%";
  }

  // Tag the things that should reveal/animate.
  var revealNodes = document.querySelectorAll(
    ".section-head, .project, .about-portrait, .about-text > *, .t-item, .skill, .contact-inner, .hero-inner > *"
  );
  for (var r = 0; r < revealNodes.length; r++) {
    revealNodes[r].setAttribute("data-reveal", "");
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("in");
          var counters = el.querySelectorAll(".count");
          for (var c = 0; c < counters.length; c++) animateCount(counters[c]);
          var fills = el.querySelectorAll(".skill-fill");
          for (var f = 0; f < fills.length; f++) fillSkill(fills[f]);
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    for (var n = 0; n < revealNodes.length; n++) io.observe(revealNodes[n]);
  } else {
    // Fallback: just show everything.
    for (var m = 0; m < revealNodes.length; m++) {
      revealNodes[m].classList.add("in");
      var cc = revealNodes[m].querySelectorAll(".count");
      for (var k = 0; k < cc.length; k++) animateCount(cc[k]);
      var ff = revealNodes[m].querySelectorAll(".skill-fill");
      for (var j = 0; j < ff.length; j++) fillSkill(ff[j]);
    }
  }

  /* ---------------- Toast links (fictional) ---------------- */
  var toastLinks = document.querySelectorAll("[data-toast]");
  for (var tl = 0; tl < toastLinks.length; tl++) {
    toastLinks[tl].addEventListener("click", function (e) {
      e.preventDefault();
      toast(this.getAttribute("data-toast"));
    });
  }

  /* ---------------- Smooth in-page nav (respects reduced motion) ---------------- */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener("click", function (e) {
      var id = this.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var dest = document.querySelector(id);
      if (!dest) return;
      e.preventDefault();
      dest.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  }

  /* ---------------- Back to top ---------------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- Contact form validation ---------------- */
  var form = document.getElementById("contactForm");
  if (form) {
    function setError(field, msg) {
      var wrap = field.closest(".field");
      var err = wrap ? wrap.querySelector(".err") : null;
      if (wrap) wrap.classList.toggle("invalid", !!msg);
      if (err) err.textContent = msg || "";
      field.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function validEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#cf-name");
      var email = form.querySelector("#cf-email");
      var msg = form.querySelector("#cf-msg");
      var ok = true;

      if (!name.value.trim()) {
        setError(name, "Please enter your name.");
        ok = false;
      } else setError(name, "");

      if (!email.value.trim()) {
        setError(email, "Please enter your email.");
        ok = false;
      } else if (!validEmail(email.value.trim())) {
        setError(email, "That email doesn't look right.");
        ok = false;
      } else setError(email, "");

      if (!msg.value.trim()) {
        setError(msg, "Tell me a little about the project.");
        ok = false;
      } else setError(msg, "");

      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      toast("Thanks, " + name.value.trim() + "! This is a demo — no message sent.");
      form.reset();
    });

    // Clear inline error as the user fixes it.
    var inputs = form.querySelectorAll("input, textarea");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("input", function () {
        var wrap = this.closest(".field");
        if (wrap && wrap.classList.contains("invalid")) {
          wrap.classList.remove("invalid");
          var err = wrap.querySelector(".err");
          if (err) err.textContent = "";
          this.setAttribute("aria-invalid", "false");
        }
      });
    }
  }
})();
