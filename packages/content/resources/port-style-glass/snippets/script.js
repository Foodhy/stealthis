/* ============================================================
   Maya Okafor — Glassmorphism Portfolio
   Vanilla JS: nav menu, accent tint toggle, scroll spy,
   project filtering, scroll reveal + skill bars, copy-to-clipboard,
   form validation. No external libs.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    // Close on link click (mobile)
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Accent tint toggle ---------- */
  var tints = [
    { name: "Aurora", accent: "#8a7bff", accent2: "#29d3c2" },
    { name: "Sunset", accent: "#ff7e5f", accent2: "#ffb84d" },
    { name: "Bloom", accent: "#ff5ea8", accent2: "#a855f7" },
    { name: "Tide", accent: "#22d3ee", accent2: "#4d8bff" }
  ];
  var tintIndex = 0;
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      tintIndex = (tintIndex + 1) % tints.length;
      var t = tints[tintIndex];
      var root = document.documentElement.style;
      root.setProperty("--accent", t.accent);
      root.setProperty("--accent-2", t.accent2);
      themeToggle.setAttribute("aria-pressed", String(tintIndex !== 0));
      toast("Accent: " + t.name);
    });
  }

  /* ---------- Project filtering ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".work-grid .card"));
  var emptyMsg = document.getElementById("workEmpty");
  function applyFilter(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var tags = card.getAttribute("data-tags") || "";
      var match = filter === "all" || tags.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Scroll spy (highlight nav) ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle("is-current", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal + skill bars ---------- */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll(".section, .hero__card, .hero__aside, .card")
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  var bars = Array.prototype.slice.call(document.querySelectorAll(".bar"));

  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { revealObs.observe(el); });

    var barObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-filled");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { barObs.observe(b); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
    bars.forEach(function (b) { b.classList.add("is-filled"); });
  }

  /* ---------- Copy-to-clipboard links ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var val = link.getAttribute("data-copy");
      var done = function () { toast("Copied: " + val); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done).catch(function () {
          fallbackCopy(val); done();
        });
      } else {
        fallbackCopy(val); done();
      }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) { /* no-op */ }
    document.body.removeChild(ta);
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function setError(input, msg) {
      var field = input.closest(".field");
      var err = field ? field.querySelector(".field__error") : null;
      if (field) field.classList.toggle("has-error", !!msg);
      if (err) err.textContent = msg || "";
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function validate() {
      var ok = true;
      var name = form.elements.name;
      var email = form.elements.email;
      var message = form.elements.message;

      if (!name.value.trim()) { setError(name, "Please enter your name."); ok = false; }
      else setError(name, "");

      if (!email.value.trim()) { setError(email, "Email is required."); ok = false; }
      else if (!emailRe.test(email.value.trim())) { setError(email, "Enter a valid email."); ok = false; }
      else setError(email, "");

      if (message.value.trim().length < 12) { setError(message, "Tell me a bit more (12+ chars)."); ok = false; }
      else setError(message, "");

      return ok;
    }

    // Clear error as the user fixes a field
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("has-error")) {
        field.classList.remove("has-error");
        var err = field.querySelector(".field__error");
        if (err) err.textContent = "";
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validate()) {
        var name = form.elements.name.value.trim().split(" ")[0];
        form.reset();
        toast("Thanks, " + name + " — brief received!");
      } else {
        toast("Please fix the highlighted fields.");
        var firstErr = form.querySelector(".has-error input, .has-error textarea");
        if (firstErr) firstErr.focus();
      }
    });
  }

  /* ---------- Footer year (keeps copy honest) ---------- */
  // Static fictional year retained in markup; nothing dynamic needed.
})();
