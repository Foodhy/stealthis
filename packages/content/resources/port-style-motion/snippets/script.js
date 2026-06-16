/* ============================================================
   Maya Okafor — Motion-Heavy Portfolio
   Vanilla JS: reveal-on-scroll, magnetic cursor, parallax,
   animated counters, skill bars, contact validation, toast.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Scroll progress + sticky nav state ---------- */
  var progressBar = document.getElementById("progressBar");
  var nav = document.querySelector(".nav");
  function onScroll() {
    var h = document.documentElement;
    var scrolled = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct.toFixed(2) + "%";
    if (nav) nav.classList.toggle("scrolled", scrolled > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  // assign stagger index within each group
  ["projects", "timeline", "skill-list"].forEach(function (cls) {
    var group = document.querySelector("." + cls);
    if (!group) return;
    Array.prototype.forEach.call(group.children, function (child, i) {
      var target = child.matches("[data-reveal]") ? child : child.querySelector("[data-reveal]");
      if (target) target.style.setProperty("--i", i);
    });
  });

  var reveals = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { revObserver.observe(el); });
  }

  /* ---------- Hero word reveal ---------- */
  var words = document.querySelectorAll("[data-reveal-word]");
  if (reduceMotion) {
    words.forEach(function (w) { w.classList.add("is-in"); });
  } else {
    words.forEach(function (w, i) {
      setTimeout(function () { w.classList.add("is-in"); }, 220 + i * 90);
    });
  }

  /* ---------- Animated counters ---------- */
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var dur = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll(".count");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    counters.forEach(runCount);
  } else {
    var countObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  }

  /* ---------- Skill bars ---------- */
  var fills = document.querySelectorAll(".skill-fill");
  function fill(el) { el.style.width = (parseInt(el.getAttribute("data-skill"), 10) || 0) + "%"; }
  if (!("IntersectionObserver" in window)) {
    fills.forEach(fill);
  } else {
    var fillObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fill(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    fills.forEach(function (f) { fillObs.observe(f); });
  }

  /* ---------- Custom cursor + magnetic ---------- */
  var cursor = document.getElementById("cursor");
  if (finePointer && !reduceMotion && cursor) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var tx = cx, ty = cy;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    var magnets = document.querySelectorAll("[data-magnetic]");
    magnets.forEach(function (m) {
      m.addEventListener("mouseenter", function () { cursor.classList.add("is-active"); });
      m.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-active");
        m.style.transform = "";
      });
      m.addEventListener("mousemove", function (e) {
        var r = m.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        m.style.transform = "translate(" + mx * 0.22 + "px," + my * 0.3 + "px)";
      });
    });
  }

  /* ---------- Parallax layers ---------- */
  var layers = document.querySelectorAll(".parallax-layer");
  if (layers.length && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset;
        layers.forEach(function (l) {
          var depth = parseFloat(l.getAttribute("data-depth")) || 0.1;
          l.style.transform = "translate3d(0," + (y * depth).toFixed(2) + "px,0)";
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Toast triggers (fictional links) ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Smooth anchor + back to top ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var setErr = function (id, msg) {
      var field = document.getElementById(id).closest(".field");
      var err = form.querySelector('[data-err-for="' + id + '"]');
      if (field) field.classList.toggle("invalid", !!msg);
      if (err) err.textContent = msg || "";
      return !msg;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var msg = document.getElementById("cf-msg").value.trim();
      var ok = true;
      ok = setErr("cf-name", name ? "" : "Please tell me your name.") && ok;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      ok = setErr("cf-email", emailOk ? "" : "Enter a valid email address.") && ok;
      ok = setErr("cf-msg", msg.length >= 8 ? "" : "A line or two about your project, please.") && ok;
      if (ok) {
        form.reset();
        toast("Thanks, " + name.split(" ")[0] + "! Message sent (demo).");
      } else {
        toast("Please check the highlighted fields.");
      }
    });
    // clear error as the user types
    ["cf-name", "cf-email", "cf-msg"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.addEventListener("input", function () { setErr(id, ""); });
    });
  }
})();
