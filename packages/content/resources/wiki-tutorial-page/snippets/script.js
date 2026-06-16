(function () {
  "use strict";

  var TOTAL = 7;
  var RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52 → ~326.7

  var ringFill = document.getElementById("ringFill");
  var ringPct = document.getElementById("ringPct");
  var ringCount = document.getElementById("ringCount");
  var progressList = document.getElementById("progressList");
  var resetBtn = document.getElementById("resetBtn");

  // Track completion state per step (1-indexed).
  var done = {};

  /* ───────── Toast helper ───────── */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  /* ───────── Progress ring + sidebar sync ───────── */
  if (ringFill) {
    ringFill.style.strokeDasharray = RING_CIRCUMFERENCE.toFixed(1);
    ringFill.style.strokeDashoffset = RING_CIRCUMFERENCE.toFixed(1);
  }

  function countDone() {
    var n = 0;
    for (var k in done) {
      if (done[k]) n++;
    }
    return n;
  }

  function render() {
    var n = countDone();
    var pct = Math.round((n / TOTAL) * 100);

    if (ringFill) {
      var offset = RING_CIRCUMFERENCE * (1 - n / TOTAL);
      ringFill.style.strokeDashoffset = offset.toFixed(1);
    }
    if (ringPct) ringPct.textContent = pct + "%";
    if (ringCount) ringCount.textContent = n + " / " + TOTAL;

    // Sync sidebar dots.
    var links = progressList ? progressList.querySelectorAll("a[data-jump]") : [];
    links.forEach(function (a) {
      var id = a.getAttribute("data-jump");
      a.classList.toggle("is-complete", !!done[id]);
    });
  }

  function setStep(id, value, opts) {
    opts = opts || {};
    done[id] = value;

    var step = document.getElementById("step-" + id);
    if (step) step.classList.toggle("is-done", value);

    var cb = document.querySelector('.step-done[data-target="' + id + '"]');
    if (cb) cb.checked = value;

    render();

    if (!opts.silent) {
      if (value) {
        toast(
          countDone() === TOTAL
            ? "All steps complete — nice work!"
            : "Step " + id + " marked complete"
        );
      } else {
        toast("Step " + id + " reopened");
      }
    }
  }

  /* ───────── Per-step checkbox toggles ───────── */
  document.querySelectorAll(".step-done").forEach(function (cb) {
    cb.addEventListener("change", function () {
      setStep(cb.getAttribute("data-target"), cb.checked);
    });
  });

  /* ───────── Sidebar smooth-scroll + active highlight ───────── */
  if (progressList) {
    progressList.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-jump]");
      if (!a) return;
      e.preventDefault();
      var id = a.getAttribute("data-jump");
      var target = document.getElementById("step-" + id);
      if (!target) return;
      target.scrollIntoView({
        behavior: prefersReduced() ? "auto" : "smooth",
        block: "start",
      });
      var heading = target.querySelector("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      history.replaceState(null, "", "#step-" + id);
    });
  }

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ───────── Scrollspy: highlight current step in sidebar ───────── */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  if ("IntersectionObserver" in window && steps.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("data-step");
          var links = progressList
            ? progressList.querySelectorAll("a[data-jump]")
            : [];
          links.forEach(function (a) {
            a.classList.toggle(
              "is-active",
              a.getAttribute("data-jump") === id
            );
          });
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    steps.forEach(function (s) {
      io.observe(s);
    });
  }

  /* ───────── Code copy ───────── */
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest(".code");
      var pre = block ? block.querySelector("pre") : null;
      if (!pre) return;
      var text = pre.innerText;

      var onDone = function () {
        var original = btn.textContent;
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        toast("Copied to clipboard");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1400);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onDone, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          onDone();
        } catch (err) {
          toast("Copy failed — select and copy manually");
        }
        document.body.removeChild(ta);
      }
    });
  });

  /* ───────── Reset progress ───────── */
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      for (var i = 1; i <= TOTAL; i++) {
        setStep(String(i), false, { silent: true });
      }
      render();
      toast("Progress reset");
    });
  }

  /* ───────── Mobile nav drawer ───────── */
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");

  function openNav() {
    sidebar.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
    if (scrim) scrim.hidden = false;
  }
  function closeNav() {
    sidebar.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    if (scrim) scrim.hidden = true;
  }
  if (navToggle && sidebar) {
    navToggle.addEventListener("click", function () {
      if (sidebar.classList.contains("open")) closeNav();
      else openNav();
    });
    if (scrim) scrim.addEventListener("click", closeNav);
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest(".nav-link") && window.innerWidth <= 820) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("open")) closeNav();
    });
  }

  /* ───────── Next CTA (demo) ───────── */
  var nextCta = document.getElementById("nextCta");
  if (nextCta) {
    nextCta.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Loading next guide: Backups & recovery…");
    });
  }

  render();
})();
