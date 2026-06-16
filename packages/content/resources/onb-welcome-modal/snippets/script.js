(function () {
  "use strict";

  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var closeX = document.getElementById("closeX");
  var skipBtn = document.getElementById("skipBtn");
  var primaryBtn = document.getElementById("primaryBtn");
  var primaryLabel = document.getElementById("primaryLabel");
  var backBtn = document.getElementById("backBtn");
  var replayBtn = document.getElementById("replayBtn");
  var openDemoBtn = document.getElementById("openDemoBtn");
  var step2 = document.getElementById("step2");
  var progress = document.getElementById("progress");
  var stepDots = progress.querySelectorAll(".step-dot");
  var toastWrap = document.getElementById("toastWrap");

  // Session state — remembers dismissal for this session only.
  var state = {
    dismissed: false, // would normally persist; kept in-memory for the demo session
    flow: "single", // single | carousel
    header: "illustration", // illustration | compact
    step: 0,
  };

  var lastFocused = null;

  /* ---------- Toast helper ---------- */
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="t-ic"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg></span>' +
      "<span></span>";
    el.lastChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 240);
    }, 2400);
  }

  /* ---------- Render flow / header variants ---------- */
  function applyHeader() {
    modal.setAttribute("data-layout", state.header);
  }

  function renderStep() {
    var carousel = state.flow === "carousel";
    progress.hidden = !carousel;

    if (!carousel) {
      // Single screen
      state.step = 0;
      step2.hidden = true;
      backBtn.hidden = true;
      primaryLabel.textContent = "Get started";
      return;
    }

    // Carousel
    if (state.step === 0) {
      step2.hidden = true;
      backBtn.hidden = true;
      primaryLabel.textContent = "Next";
    } else {
      step2.hidden = false;
      backBtn.hidden = false;
      primaryLabel.textContent = "Finish setup";
    }
    stepDots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === state.step);
    });
  }

  /* ---------- Open / close ---------- */
  function openModal(reset) {
    if (reset !== false) state.step = 0;
    applyHeader();
    renderStep();
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    // focus the primary action
    setTimeout(function () {
      primaryBtn.focus();
    }, 30);
  }

  function closeModal(reason) {
    overlay.hidden = true;
    document.body.style.overflow = "";
    state.dismissed = true;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    if (reason) toast(reason);
  }

  /* ---------- Focus trap ---------- */
  function getFocusable() {
    return Array.prototype.filter.call(
      modal.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      ),
      function (el) {
        return !el.disabled && el.offsetParent !== null;
      }
    );
  }

  function onKeydown(e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal("Welcome dismissed");
      return;
    }
    if (e.key === "Tab") {
      var items = getFocusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ---------- Primary / back ---------- */
  function onPrimary() {
    if (state.flow === "carousel" && state.step === 0) {
      state.step = 1;
      renderStep();
      var f = step2.querySelector('.choice[aria-checked="true"]') || primaryBtn;
      f.focus();
      return;
    }
    closeModal();
    toast("You're all set — welcome to Northwind");
  }

  function onBack() {
    state.step = 0;
    renderStep();
    primaryBtn.focus();
  }

  /* ---------- Step 2 choices ---------- */
  step2.addEventListener("click", function (e) {
    var btn = e.target.closest(".choice");
    if (!btn) return;
    step2.querySelectorAll(".choice").forEach(function (c) {
      c.setAttribute("aria-checked", String(c === btn));
    });
    toast("Template: " + btn.getAttribute("data-choice"));
  });

  /* ---------- Variant switcher ---------- */
  document.querySelectorAll(".seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var btn = e.target.closest(".seg-btn");
      if (!btn) return;
      seg.querySelectorAll(".seg-btn").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-checked", String(b === btn));
      });
      if (btn.dataset.flow) {
        state.flow = btn.dataset.flow;
        if (state.flow === "single") state.step = 0;
        renderStep();
      }
      if (btn.dataset.header) {
        state.header = btn.dataset.header;
        applyHeader();
      }
      // Reflect the change live if the modal is open
      if (!overlay.hidden) {
        renderStep();
        applyHeader();
      } else {
        openModal();
      }
    });
  });

  /* ---------- Wiring ---------- */
  primaryBtn.addEventListener("click", onPrimary);
  backBtn.addEventListener("click", onBack);
  closeX.addEventListener("click", function () {
    closeModal("Welcome dismissed");
  });
  skipBtn.addEventListener("click", function () {
    closeModal("Skipped — you can replay anytime");
  });

  openDemoBtn.addEventListener("click", function () {
    openModal();
  });

  replayBtn.addEventListener("click", function () {
    openModal();
    toast("Replaying the welcome");
  });

  overlay.addEventListener("mousedown", function (e) {
    if (e.target.hasAttribute("data-close")) {
      closeModal("Welcome dismissed");
    }
  });

  document.addEventListener("keydown", onKeydown);

  /* ---------- First-run auto-show ---------- */
  // Show automatically on first run of the session.
  if (!state.dismissed) {
    openModal();
  }
})();
