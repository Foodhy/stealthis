(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
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

  /* ---------- Reveal on scroll + animated counters ---------- */
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = formatNum(target) + suffix;
      return;
    }
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function formatNum(n) {
    return n.toLocaleString("en-US");
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          var num = entry.target.querySelector("[data-count]");
          if (num && !num.dataset.done) {
            num.dataset.done = "1";
            animateCount(num);
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
    document.querySelectorAll("[data-count]").forEach(animateCount);
  }

  /* ---------- Parallax tilt on hero photo ---------- */
  var tilt = document.querySelector("[data-tilt]");
  if (tilt && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    tilt.addEventListener("mousemove", function (e) {
      var r = tilt.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform =
        "perspective(900px) rotateY(" +
        px * 8 +
        "deg) rotateX(" +
        -py * 8 +
        "deg)";
    });
    tilt.addEventListener("mouseleave", function () {
      tilt.style.transform = "";
    });
  }

  /* ---------- Magnetic CTA ---------- */
  var mag = document.querySelector(".magnetic");
  if (mag && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    mag.addEventListener("mousemove", function (e) {
      var r = mag.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      mag.style.transform =
        "translate(" + x * 0.18 + "px," + y * 0.22 + "px)";
    });
    mag.addEventListener("mouseleave", function () {
      mag.style.transform = "";
    });
  }

  /* ---------- Program strip toggle ---------- */
  var programs = Array.prototype.slice.call(
    document.querySelectorAll(".program")
  );
  var eyebrowText = document.querySelector("[data-eyebrow]");
  var taglineText = document.querySelector("[data-tagline]");

  function selectProgram(btn) {
    programs.forEach(function (p) {
      var active = p === btn;
      p.classList.toggle("is-active", active);
      p.setAttribute("aria-selected", active ? "true" : "false");
    });
    var eb = btn.getAttribute("data-eyebrow-text");
    var tg = btn.getAttribute("data-tagline-text");
    if (eyebrowText && eb) eyebrowText.textContent = eb;
    if (taglineText && tg) taglineText.textContent = tg;
    var name = btn.querySelector(".program-name");
    toast("Track selected — " + (name ? name.textContent : "program"));
  }

  programs.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      selectProgram(btn);
    });
    // Arrow-key roving for the tablist
    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = programs[(i + 1) % programs.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = programs[(i - 1 + programs.length) % programs.length];
      }
      if (next) {
        e.preventDefault();
        next.focus();
        selectProgram(next);
      }
    });
  });

  /* ---------- CTA actions ---------- */
  var messages = {
    hero: "Transformation booked — check your inbox for the intake form.",
    nav: "Your discovery call is on hold. We'll confirm within 24h.",
    watch: "Loading the method breakdown…",
  };
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      var key = el.getAttribute("data-cta");
      toast(messages[key] || "Thanks — talk soon!");
    });
  });
})();
