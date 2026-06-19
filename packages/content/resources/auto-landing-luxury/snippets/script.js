/* ============================================================
   Vanderhall Automobiles — luxury landing interactions
   Vanilla JS only. No external libraries.
   ============================================================ */
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
    }, 3400);
  }

  /* ---------- sticky nav state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }

  /* ---------- hero scroll cue ---------- */
  var heroScroll = document.getElementById("heroScroll");
  if (heroScroll) {
    heroScroll.addEventListener("click", function () {
      var t = document.getElementById("models");
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () {
              el.classList.add("is-in");
            }, Math.min(i * 60, 240));
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- model filters ---------- */
  var filters = document.getElementById("filters");
  var models = Array.prototype.slice.call(document.querySelectorAll(".model"));
  if (filters) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      var cat = btn.getAttribute("data-filter");
      filters.querySelectorAll(".chip").forEach(function (c) {
        var active = c === btn;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
      });
      var shown = 0;
      models.forEach(function (m) {
        var match = cat === "all" || m.getAttribute("data-cat") === cat;
        m.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(
        shown +
          (shown === 1 ? " model" : " models") +
          (cat === "all" ? " in the collection" : " in this silhouette")
      );
    });
  }

  /* ---------- configure buttons ---------- */
  document.querySelectorAll(".model__cta").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Configurator reserved for the " + b.getAttribute("data-model") + " — a specialist will be in touch.");
    });
  });

  /* ---------- track button ---------- */
  var trackBtn = document.getElementById("trackBtn");
  if (trackBtn) {
    trackBtn.addEventListener("click", function () {
      toast("Live service tracking opened in the concierge app.");
    });
  }

  /* ---------- finance calculator ---------- */
  var fModel = document.getElementById("fModel");
  var fDown = document.getElementById("fDown");
  var fTerm = document.getElementById("fTerm");
  var fApr = document.getElementById("fApr");
  var fDownVal = document.getElementById("fDownVal");
  var fTermVal = document.getElementById("fTermVal");
  var fAprVal = document.getElementById("fAprVal");
  var fMonthly = document.getElementById("fMonthly");
  var fFinanced = document.getElementById("fFinanced");
  var fTotal = document.getElementById("fTotal");
  var fInterest = document.getElementById("fInterest");

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function recalc() {
    if (!fModel) return;
    var price = parseFloat(fModel.value);
    var down = Math.min(parseFloat(fDown.value), price);
    var months = parseInt(fTerm.value, 10);
    var apr = parseInt(fApr.value, 10) / 10; // slider stores tenths of a percent
    var principal = Math.max(price - down, 0);

    var r = apr / 100 / 12;
    var monthly;
    if (r === 0) {
      monthly = principal / months;
    } else {
      monthly = (principal * r) / (1 - Math.pow(1 + r, -months));
    }
    var total = monthly * months;
    var interest = total - principal;

    fDownVal.textContent = money(down);
    fTermVal.textContent = months + " mo";
    fAprVal.textContent = apr.toFixed(1) + "%";
    fFinanced.textContent = money(principal);
    fTotal.textContent = money(total + down);
    fInterest.textContent = money(interest);

    // animate the monthly figure
    animateNumber(fMonthly, Math.round(monthly));
  }

  var animFrame;
  function animateNumber(el, target) {
    cancelAnimationFrame(animFrame);
    var start = parseInt((el.textContent || "0").replace(/[^0-9]/g, ""), 10) || 0;
    var t0 = performance.now();
    var dur = 420;
    function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(start + (target - start) * eased);
      el.textContent = val.toLocaleString("en-US");
      if (p < 1) animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
  }

  [fModel, fDown, fTerm, fApr].forEach(function (input) {
    if (input) input.addEventListener("input", recalc);
  });
  recalc();

  /* ---------- test-drive form validation ---------- */
  var tdForm = document.getElementById("tdForm");
  function setErr(id, msg) {
    var field = document.getElementById(id);
    var slot = document.querySelector('[data-err="' + id + '"]');
    if (field) field.classList.toggle("invalid", !!msg);
    if (slot) slot.textContent = msg || "";
    return !msg;
  }
  if (tdForm) {
    // sensible min date = today
    var dateInput = document.getElementById("tdDate");
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    tdForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("tdName");
      var email = document.getElementById("tdEmail");
      var date = document.getElementById("tdDate");

      var ok = true;
      ok = setErr("tdName", name.value.trim().length >= 2 ? "" : "Please enter your full name.") && ok;
      ok =
        setErr(
          "tdEmail",
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Enter a valid email address."
        ) && ok;
      ok = setErr("tdDate", date.value ? "" : "Choose a preferred date.") && ok;

      if (!ok) {
        toast("Please complete the highlighted fields.");
        return;
      }
      var model = document.getElementById("tdModelSel").value;
      toast("Thank you, " + name.value.trim().split(" ")[0] + " — your " + model + " viewing is requested.");
      tdForm.reset();
      if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
    });

    // clear error on input
    ["tdName", "tdEmail", "tdDate"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function () { setErr(id, ""); });
    });
  }

  /* ---------- smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
