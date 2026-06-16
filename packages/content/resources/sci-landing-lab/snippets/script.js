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

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Smooth scroll for data-scroll & in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Animated count-up metrics ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var dur = 1500;
    function frame(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      var shown = decimals > 0
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString("en-US");
      el.textContent = prefix + shown + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var metricEls = document.querySelectorAll(".metric-val[data-count]");
  if ("IntersectionObserver" in window && metricEls.length) {
    var mObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          mObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    metricEls.forEach(function (el) { mObs.observe(el); });
  } else {
    metricEls.forEach(animateCount);
  }

  /* ---------- Reveal-on-scroll for bands & cards ---------- */
  var revealEls = document.querySelectorAll(".band, .spotlight, .metric");
  if ("IntersectionObserver" in window) {
    revealEls.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          rObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { rObs.observe(el); });
  }

  /* ---------- Team member detail card ---------- */
  var card = document.getElementById("memberCard");
  var mcAvatar = document.getElementById("mcAvatar");
  var mcName = document.getElementById("mcName");
  var mcRole = document.getElementById("mcRole");
  var mcArea = document.getElementById("mcArea");
  var members = document.querySelectorAll(".member");

  function showMember(li) {
    members.forEach(function (m) { m.classList.remove("active"); });
    li.classList.add("active");
    if (!card) return;
    mcAvatar.textContent = li.getAttribute("data-init");
    mcName.textContent = li.getAttribute("data-name");
    mcRole.textContent = li.getAttribute("data-role");
    mcArea.textContent = li.getAttribute("data-area");
    card.hidden = false;
  }

  members.forEach(function (li, i) {
    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", li.getAttribute("data-name") + ", " + li.getAttribute("data-role"));
    li.title = li.getAttribute("data-name") + " — " + li.getAttribute("data-role");
    li.addEventListener("click", function () { showMember(li); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showMember(li);
      } else if (e.key === "ArrowRight" && members[i + 1]) {
        members[i + 1].focus();
      } else if (e.key === "ArrowLeft" && members[i - 1]) {
        members[i - 1].focus();
      }
    });
  });
  if (members[0]) showMember(members[0]);

  /* ---------- Partner click ---------- */
  document.querySelectorAll(".partners li").forEach(function (li) {
    li.addEventListener("click", function () {
      toast("Funding partner: " + li.textContent.trim());
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("cfEmail");
      var msg = document.getElementById("cfMsg");
      var ok = true;
      [email, msg].forEach(function (f) { f.classList.remove("invalid"); });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add("invalid");
        ok = false;
      }
      if (msg.value.trim().length < 4) {
        msg.classList.add("invalid");
        ok = false;
      }
      if (!ok) {
        toast("Please complete the highlighted fields.");
        return;
      }
      form.reset();
      toast("Thanks — your inquiry was received (demo only).");
    });
  }

  /* ---------- Active nav highlighting ---------- */
  var sections = ["focus", "metrics", "spotlight", "team", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = {};
  document.querySelectorAll('.primary-nav a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window && sections.length) {
    var sObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.values(navLinks).forEach(function (l) { l.style.color = ""; });
          var link = navLinks[en.target.id];
          if (link) link.style.color = "var(--accent)";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { sObs.observe(s); });
  }
})();
