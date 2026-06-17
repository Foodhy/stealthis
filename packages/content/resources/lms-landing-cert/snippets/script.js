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
    }, 2800);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("hamburger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Certification path filter ---------- */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".path-card");
  var emptyMsg = document.getElementById("pathEmpty");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.dataset.filter;
      var visible = 0;
      cards.forEach(function (card) {
        var show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("hide", !show);
        if (show) visible++;
      });
      if (emptyMsg) emptyMsg.hidden = visible !== 0;
    });
  });

  /* ---------- Exam domain selector ---------- */
  var domainData = {
    "Architecture & Design": [
      "Map business requirements to reference architectures",
      "Select compute, storage, and networking topologies",
      "Design for multi-region failover and RTO/RPO targets"
    ],
    "Reliability & Resilience": [
      "Define availability targets and error budgets",
      "Architect self-healing and graceful degradation",
      "Plan disaster recovery and chaos validation"
    ],
    "Security & Compliance": [
      "Apply least-privilege identity and access models",
      "Encrypt data in transit and at rest with key rotation",
      "Map controls to ISO 27001 and SOC 2 evidence"
    ],
    "Cost Optimization": [
      "Right-size compute and exploit commitment discounts",
      "Model unit economics and chargeback reporting",
      "Detect and retire idle or orphaned resources"
    ],
    "Operations & Automation": [
      "Codify infrastructure with reviewable pipelines",
      "Instrument observability: logs, metrics, traces",
      "Automate release, rollback, and on-call runbooks"
    ],
    "Data & Migration": [
      "Plan phased, low-downtime migration waves",
      "Choose data stores against access patterns",
      "Govern lineage, retention, and residency"
    ]
  };

  var domains = document.querySelectorAll(".domain");
  var ddFill = document.getElementById("ddFill");
  var ddWeight = document.getElementById("ddWeight");
  var ddList = document.getElementById("ddList");

  domains.forEach(function (d) {
    d.addEventListener("click", function () {
      domains.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      d.classList.add("is-active");
      d.setAttribute("aria-selected", "true");

      var weight = d.dataset.weight;
      var name = d.querySelector(".d-name").textContent.trim();
      if (ddFill) ddFill.style.width = weight + "%";
      if (ddWeight) ddWeight.textContent = weight + "%";
      if (ddList) {
        var items = domainData[name] || [];
        ddList.innerHTML = items
          .map(function (t) { return "<li>" + t + "</li>"; })
          .join("");
      }
    });
  });

  /* ---------- Animated stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var dur = 1200;
    var start = performance.now();
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Scroll reveal + counter trigger ---------- */
  var counted = new WeakSet();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        var stat = e.target.querySelector ? e.target.querySelector(".stat-num") : null;
        if (e.target.classList.contains("stat-card") && stat && !counted.has(stat)) {
          counted.add(stat);
          animateCount(stat);
        }
        io.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".stat-num").forEach(animateCount);
  }

  /* ---------- Enroll form ---------- */
  var form = document.getElementById("enrollForm");
  var emailInput = document.getElementById("fEmail");
  var emailErr = document.getElementById("emailErr");
  var nameInput = document.getElementById("fName");
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      if (!nameInput.value.trim()) {
        nameInput.classList.add("invalid");
        ok = false;
      } else {
        nameInput.classList.remove("invalid");
      }
      if (!validEmail(emailInput.value.trim())) {
        emailInput.classList.add("invalid");
        if (emailErr) emailErr.hidden = false;
        ok = false;
      } else {
        emailInput.classList.remove("invalid");
        if (emailErr) emailErr.hidden = true;
      }
      if (!ok) {
        toast("Please complete the highlighted fields.");
        return;
      }
      var cert = document.getElementById("fCert").value;
      toast("Seat reserved — your " + cert + " kit is on the way.");
      form.reset();
    });
    emailInput.addEventListener("input", function () {
      if (emailErr && !emailErr.hidden && validEmail(emailInput.value.trim())) {
        emailErr.hidden = true;
        emailInput.classList.remove("invalid");
      }
    });
  }

  /* ---------- Path "Start path" buttons ---------- */
  document.querySelectorAll(".path-card .btn-dark").forEach(function (b) {
    b.addEventListener("click", function () {
      var title = b.closest(".path-card").querySelector("h3").textContent;
      toast("Added " + title + " to your enrollment.");
    });
  });
})();
