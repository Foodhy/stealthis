(function () {
  "use strict";

  /* ---------- toast helper ---------- */
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

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll(".count");
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var start = null;
      var dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounters(); cio.disconnect(); }
        });
      },
      { threshold: 0.4 }
    );
    cio.observe(counters[0]);
  } else {
    runCounters();
  }

  /* ---------- phase timeline ---------- */
  var PHASES = [
    {
      badge: "Volume block",
      title: "Base — Build the engine",
      desc: "High volume, moderate intensity. We hammer technique and grow work capacity so the heavy weeks later actually stick.",
      focus: "Hypertrophy & technique",
      volume: "High · 18–22 sets",
      intensity: "65–78% 1RM",
      fill: 60
    },
    {
      badge: "Intensity block",
      title: "Peak — Express the strength",
      desc: "Volume drops, load climbs. Singles, doubles and triples sharpen your top-end so a new PR feels routine on meet day.",
      focus: "Maximal strength",
      volume: "Moderate · 10–14 sets",
      intensity: "82–95% 1RM",
      fill: 92
    },
    {
      badge: "Recovery block",
      title: "Deload — Absorb the work",
      desc: "Planned back-off week. Fatigue clears, joints recover, and adaptations catch up so the next block starts fresh.",
      focus: "Recovery & readiness",
      volume: "Low · 6–9 sets",
      intensity: "50–65% 1RM",
      fill: 35
    }
  ];

  var nodes = Array.prototype.slice.call(document.querySelectorAll(".phase-node"));
  var panel = document.getElementById("phase-panel");
  var els = {
    badge: document.getElementById("phase-badge"),
    title: document.getElementById("phase-title"),
    desc: document.getElementById("phase-desc"),
    focus: document.getElementById("phase-focus"),
    volume: document.getElementById("phase-volume"),
    intensity: document.getElementById("phase-intensity"),
    fill: document.getElementById("phase-fill")
  };
  var activePhase = 0;

  function setPhase(i, focusNode) {
    activePhase = i;
    var p = PHASES[i];
    els.badge.textContent = p.badge;
    els.title.textContent = p.title;
    els.desc.textContent = p.desc;
    els.focus.textContent = p.focus;
    els.volume.textContent = p.volume;
    els.intensity.textContent = p.intensity;
    els.fill.style.width = p.fill + "%";
    // re-trigger fade animation
    var body = panel.querySelector(".phase-body");
    if (body) { body.style.animation = "none"; void body.offsetWidth; body.style.animation = ""; }
    nodes.forEach(function (n, idx) {
      var on = idx === i;
      n.classList.toggle("is-active", on);
      n.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (panel) panel.setAttribute("aria-labelledby", "tab-" + i);
    if (focusNode) nodes[i].focus();
  }

  nodes.forEach(function (n) {
    n.addEventListener("click", function () {
      setPhase(parseInt(n.getAttribute("data-phase"), 10), false);
    });
    n.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setPhase((activePhase + 1) % nodes.length, true);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setPhase((activePhase - 1 + nodes.length) % nodes.length, true);
      }
    });
  });

  /* ---------- pricing toggle ---------- */
  var billSwitch = document.getElementById("billSwitch");
  var amounts = document.querySelectorAll(".amount");
  var quarterly = false;

  function updatePrices() {
    amounts.forEach(function (el) {
      var key = quarterly ? "data-quarterly" : "data-monthly";
      var val = el.getAttribute(key);
      // little count animation
      var from = parseInt(el.textContent, 10) || 0;
      var to = parseInt(val, 10);
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 350, 1);
        el.textContent = Math.round(from + (to - from) * p);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  if (billSwitch) {
    billSwitch.addEventListener("click", function () {
      quarterly = !quarterly;
      billSwitch.setAttribute("aria-checked", quarterly ? "true" : "false");
      updatePrices();
      toast(quarterly ? "Quarterly billing — 15% off applied" : "Switched to monthly billing");
    });
  }

  /* ---------- tier buttons ---------- */
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan");
      toast("Nice pick — " + plan + " selected. Finish below.");
      var join = document.getElementById("join");
      if (join) join.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- join form ---------- */
  var form = document.getElementById("joinForm");
  var email = document.getElementById("jemail");
  var err = document.getElementById("jerr");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail() {
    var ok = EMAIL_RE.test(email.value.trim());
    if (!ok) {
      email.classList.add("invalid");
      email.setAttribute("aria-invalid", "true");
      err.textContent = "Enter a valid email so Coach Reyes can reach you.";
    } else {
      email.classList.remove("invalid");
      email.removeAttribute("aria-invalid");
      err.textContent = "";
    }
    return ok;
  }

  if (email) {
    email.addEventListener("input", function () {
      if (email.classList.contains("invalid")) validateEmail();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#jname");
      if (!name.value.trim()) {
        name.focus();
        toast("Add your name first, lifter.");
        return;
      }
      if (!validateEmail()) {
        email.focus();
        return;
      }
      var goal = form.querySelector("#jgoal").value;
      form.reset();
      toast("Audit request in — welcome to IRONBASE, " + name.value.trim().split(" ")[0] + "!");
      console.log("Join submitted:", { name: name.value, goal: goal });
    });
  }
})();
