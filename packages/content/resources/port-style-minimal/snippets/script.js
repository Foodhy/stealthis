/* =========================================================
   Maya Okafor — Minimal / Swiss portfolio · vanilla JS
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- data (fictional) ---------- */
  var PROJECTS = [
    {
      id: "aperture",
      title: "Aperture Design System",
      cat: "systems",
      year: 2025,
      sub: "Tokens, 60 components and docs for the Northwind platform.",
      tags: ["Design system", "Tokens", "Docs"],
      desc: "A from-scratch design system unifying nine product surfaces under one set of tokens, components and writing rules. Built theming, density modes and a contribution model that let 14 engineers ship UI without a designer in the room.",
      meta: { Role: "Lead designer", Team: "6 people", Timeline: "10 months", Impact: "−38% UI bugs" },
      grad: "linear-gradient(135deg,#1a3aff 0%,#0a1f99 100%)"
    },
    {
      id: "vitals",
      title: "Clinician Vitals Dashboard",
      cat: "product",
      year: 2024,
      sub: "Real-time monitoring redesign for Atlas Health.",
      tags: ["Product", "Data viz", "Health"],
      desc: "Reworked a dense vitals dashboard used in 12 clinics. Re-prioritised the information hierarchy around alert severity and cut the time to spot a deteriorating patient by nearly half in usability testing.",
      meta: { Role: "Senior designer", Team: "4 people", Timeline: "5 months", Impact: "−41% time-to-alert" },
      grad: "linear-gradient(135deg,#0d9488 0%,#064e44 100%)"
    },
    {
      id: "ledger",
      title: "Volt Ledger",
      cat: "product",
      year: 2023,
      sub: "Reconciliation flow for a payments back-office.",
      tags: ["Product", "Fintech", "Tables"],
      desc: "Designed a reconciliation workspace that turns thousands of transactions into a calm, scannable ledger. Inline editing, keyboard-first navigation and a forgiving undo model made finance teams trust the tool on day one.",
      meta: { Role: "Product designer", Team: "5 people", Timeline: "7 months", Impact: "+2.3× throughput" },
      grad: "linear-gradient(135deg,#7c3aed 0%,#3b1480 100%)"
    },
    {
      id: "forma",
      title: "Forma Identity",
      cat: "brand",
      year: 2022,
      sub: "Wordmark, grid system and motion for a studio.",
      tags: ["Brand", "Type", "Motion"],
      desc: "A monospace-meets-grotesque identity built on a strict 8px grid. Defined a flexible logo system, a two-weight type pairing and a small set of motion principles that scale from a favicon to a conference stage.",
      meta: { Role: "Designer", Team: "Solo", Timeline: "3 months", Impact: "Full rebrand" },
      grad: "linear-gradient(135deg,#111111 0%,#3a3a3a 100%)"
    },
    {
      id: "atlasweb",
      title: "Atlas Marketing Site",
      cat: "brand",
      year: 2021,
      sub: "Editorial marketing site with a typographic grid.",
      tags: ["Web", "Editorial", "Brand"],
      desc: "An editorial, type-led marketing site rebuilt on a baseline grid. Replaced stock imagery with structured layout and confident typography, lifting demo requests through a clearer narrative and faster pages.",
      meta: { Role: "Lead designer", Team: "3 people", Timeline: "4 months", Impact: "+27% demo signups" },
      grad: "linear-gradient(135deg,#2563eb 0%,#0c2d6b 100%)"
    },
    {
      id: "kestrel",
      title: "Kestrel Mobile Onboarding",
      cat: "product",
      year: 2020,
      sub: "First-run experience for a logistics app.",
      tags: ["Product", "Mobile", "Onboarding"],
      desc: "Rebuilt a five-step onboarding into a progressive, low-friction flow with smart defaults and inline validation. Activation in the first session climbed sharply and support tickets about setup dropped.",
      meta: { Role: "Product designer", Team: "4 people", Timeline: "3 months", Impact: "+34% activation" },
      grad: "linear-gradient(135deg,#ea580c 0%,#7c2d12 100%)"
    }
  ];

  /* ---------- DOM helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 280);
    }, 2200);
  }

  /* ---------- render projects ---------- */
  var listEl = $("#projectList");
  var resultLine = $("#resultLine");
  var currentFilter = "all";

  function visibleProjects() {
    return PROJECTS.filter(function (p) {
      return currentFilter === "all" || p.cat === currentFilter;
    });
  }

  function rowMarkup(p, index) {
    var num = String(index + 1).padStart(2, "0");
    var tags = p.tags
      .map(function (t) { return '<span class="pr-tag">' + t + "</span>"; })
      .join("");
    return (
      '<li>' +
      '<button class="project-row" type="button" data-id="' + p.id + '" aria-haspopup="dialog">' +
        '<span class="pr-num">' + num + "</span>" +
        '<span class="pr-main">' +
          '<span class="pr-title">' + p.title +
            '<span class="pr-year">' + p.year + "</span>" +
          "</span>" +
          '<span class="pr-sub">' + p.sub + "</span>" +
        "</span>" +
        '<span class="pr-tags pr-tags-cell">' + tags + "</span>" +
        '<span class="pr-arrow" aria-hidden="true">→</span>' +
      "</button>" +
      "</li>"
    );
  }

  function renderList(animateEnter) {
    var items = visibleProjects();

    if (!items.length) {
      listEl.innerHTML =
        '<div class="empty-state">' +
        "<p>No projects in this discipline yet.</p>" +
        '<button class="btn btn-ghost" type="button" id="resetFilter">Show all work</button>' +
        "</div>";
      var rb = $("#resetFilter");
      if (rb) rb.addEventListener("click", function () { setFilter("all"); });
    } else {
      listEl.innerHTML = items
        .map(function (p, i) { return rowMarkup(p, i); })
        .join("");

      if (animateEnter && !prefersReduced) {
        $all(".project-row", listEl).forEach(function (row, i) {
          row.classList.add("is-entering");
          row.style.animationDelay = i * 45 + "ms";
          row.addEventListener("animationend", function () {
            row.classList.remove("is-entering");
            row.style.animationDelay = "";
          }, { once: true });
        });
      }
    }

    resultLine.textContent =
      items.length === PROJECTS.length
        ? "Showing all " + PROJECTS.length + " projects"
        : "Showing " + items.length + " of " + PROJECTS.length + " projects";
  }

  /* ---------- filters ---------- */
  var chips = $all(".chip");

  function updateCounts() {
    $all(".chip-count").forEach(function (el) {
      var f = el.getAttribute("data-count");
      var n =
        f === "all"
          ? PROJECTS.length
          : PROJECTS.filter(function (p) { return p.cat === f; }).length;
      el.textContent = "(" + n + ")";
    });
  }

  function setFilter(f) {
    currentFilter = f;
    chips.forEach(function (c) {
      var on = c.getAttribute("data-filter") === f;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderList(true);
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      setFilter(c.getAttribute("data-filter"));
    });
  });

  /* ---------- modal / quick-look ---------- */
  var modal = $("#modal");
  var modalKicker = $("#modalKicker");
  var modalTitle = $("#modalTitle");
  var modalThumb = $("#modalThumb");
  var modalDesc = $("#modalDesc");
  var modalMeta = $("#modalMeta");
  var lastFocused = null;

  function openModal(id) {
    var p = PROJECTS.find(function (x) { return x.id === id; });
    if (!p) return;
    lastFocused = document.activeElement;

    modalKicker.textContent =
      p.cat.charAt(0).toUpperCase() + p.cat.slice(1) + " · " + p.year;
    modalTitle.textContent = p.title;
    modalThumb.style.background = p.grad;
    modalDesc.textContent = p.desc;
    modalMeta.innerHTML = Object.keys(p.meta)
      .map(function (k) {
        return "<div><dt>" + k + "</dt><dd>" + p.meta[k] + "</dd></div>";
      })
      .join("");

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = $(".modal-close", modal);
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var f = $all(
        'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
        modal
      ).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  listEl.addEventListener("click", function (e) {
    var row = e.target.closest(".project-row");
    if (row) openModal(row.getAttribute("data-id"));
  });

  $all("[data-close]", modal).forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  /* ---------- theme toggle ---------- */
  var themeToggle = $("#themeToggle");
  var themeLabel = $("[data-theme-label]");

  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    if (themeLabel) themeLabel.textContent = dark ? "Light" : "Dark";
  }

  var startDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(startDark);

  themeToggle.addEventListener("click", function () {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(!isDark);
    toast(!isDark ? "Dark mode on" : "Light mode on");
  });

  /* ---------- copy email ---------- */
  $all(".copy-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var text = link.getAttribute("data-copy");
      var done = function () { toast("Email copied to clipboard"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text); done();
        });
      } else {
        fallbackCopy(text); done();
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(ta);
  }

  /* ---------- contact form validation ---------- */
  var form = $("#contactForm");

  function setError(field, msg) {
    var wrap = field.closest(".field");
    var err = $('[data-error-for="' + field.id + '"]');
    if (wrap) wrap.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
    field.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validateField(field) {
    var v = field.value.trim();
    if (!v) { setError(field, "This field is required."); return false; }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(field, "Enter a valid email address.");
      return false;
    }
    setError(field, "");
    return true;
  }

  $all("#contactForm input, #contactForm textarea").forEach(function (f) {
    f.addEventListener("blur", function () { validateField(f); });
    f.addEventListener("input", function () {
      if (f.closest(".field").classList.contains("has-error")) validateField(f);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = $all("#contactForm input, #contactForm textarea");
    var ok = true;
    fields.forEach(function (f) { if (!validateField(f)) ok = false; });
    if (!ok) {
      var firstBad = form.querySelector(".has-error input, .has-error textarea");
      if (firstBad) firstBad.focus();
      toast("Please fix the highlighted fields");
      return;
    }
    var name = $("#cName").value.trim().split(" ")[0];
    form.reset();
    fields.forEach(function (f) { setError(f, ""); });
    toast("Thanks " + name + " — message sent (demo)");
  });

  /* ---------- count-up stats ---------- */
  function runCountUp(el) {
    var target = parseInt(el.getAttribute("data-countup"), 10) || 0;
    if (prefersReduced) { el.textContent = target; return; }
    var start = null;
    var dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.round(eased * target);
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  var countEls = $all("[data-countup]");
  if (countEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCountUp(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach(function (el) { io.observe(el); });
  } else {
    countEls.forEach(runCountUp);
  }

  /* ---------- init ---------- */
  updateCounts();
  renderList(false);
})();
