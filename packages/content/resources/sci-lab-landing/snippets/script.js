(function () {
  "use strict";

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2800);
  }

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");
  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navList.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navList.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Animated stat counters (run once on view) ---- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll(".counter"));
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCounter(en.target);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-count"); });
  }

  /* ---- Research card -> filter publications hint ---- */
  var areaNames = {
    superconducting: "Superconducting Qubits",
    spin: "Solid-State Spins",
    theory: "Open-System Theory",
    qec: "Error Correction"
  };
  document.querySelectorAll(".area-card").forEach(function (card) {
    function activate() {
      var tag = card.getAttribute("data-tag");
      toast("Research area: " + (areaNames[tag] || tag));
    }
    card.addEventListener("click", activate);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });
  });

  /* ---- Publication year filter ---- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var pubs = Array.prototype.slice.call(document.querySelectorAll(".pub"));
  var pubEmpty = document.getElementById("pub-empty");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var year = btn.getAttribute("data-year");
      filterBtns.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      var visible = 0;
      pubs.forEach(function (p) {
        var show = year === "all" || p.getAttribute("data-year") === year;
        p.hidden = !show;
        if (show) visible++;
      });
      if (pubEmpty) pubEmpty.hidden = visible !== 0;
    });
  });

  /* ---- Copy DOI on PDF link click (demo, no real download) ---- */
  document.querySelectorAll(".pub-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var doi = link.getAttribute("data-doi") || "";
      if (navigator.clipboard && doi) {
        navigator.clipboard.writeText(doi).then(
          function () { toast("DOI copied: " + doi); },
          function () { toast("DOI: " + doi); }
        );
      } else {
        toast(doi ? "DOI: " + doi : "PDF unavailable in demo");
      }
    });
  });

  /* ---- Join form validation ---- */
  var form = document.getElementById("join-form");
  var note = document.getElementById("form-note");
  if (form) {
    var nameEl = document.getElementById("jf-name");
    var emailEl = document.getElementById("jf-email");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setNote(msg, kind) {
      if (!note) return;
      note.textContent = msg;
      note.className = "form-note" + (kind ? " " + kind : "");
    }

    [nameEl, emailEl].forEach(function (el) {
      el.addEventListener("input", function () { el.classList.remove("invalid"); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      var bad = false;
      if (!name) { nameEl.classList.add("invalid"); bad = true; }
      if (!emailRe.test(email)) { emailEl.classList.add("invalid"); bad = true; }
      if (bad) {
        setNote("Please enter your name and a valid email.", "err");
        return;
      }
      var role = document.getElementById("jf-role").value;
      setNote("Thanks, " + name.split(" ")[0] + " — we'll be in touch about the " + role + " track.", "ok");
      toast("Interest submitted (demo)");
      form.reset();
    });
  }

  /* ---- Back to top ---- */
  var toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Funder logos: subtle interactive acknowledgement ---- */
  document.querySelectorAll(".logo-strip li").forEach(function (li) {
    li.addEventListener("click", function () { toast("Funding partner: " + li.textContent.trim()); });
  });
})();
