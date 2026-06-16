(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.querySelector("[data-toast]");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 3400);
  }

  /* ---------- shared subscriber count (keeps both widgets in sync) ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-ns-count]"));
  var subscribers = 18402;

  function renderCount() {
    var label = subscribers.toLocaleString("en-US");
    counters.forEach(function (el) {
      // compact widget shows only the number, no "readers" suffix here
      el.textContent = label;
    });
  }
  renderCount();

  function bumpCount() {
    subscribers += 1;
    renderCount();
    // small tick animation
    counters.forEach(function (el) {
      el.style.transition = "color .2s ease";
      el.style.color = "var(--ok)";
      window.setTimeout(function () {
        el.style.color = "";
      }, 600);
    });
  }

  /* ---------- wire up each newsletter widget ---------- */
  var widgets = document.querySelectorAll("[data-newsletter]");

  widgets.forEach(function (widget) {
    var form = widget.querySelector("[data-ns-form]");
    if (!form) return;

    var input = form.querySelector('input[type="email"]');
    var error = form.querySelector('.ns__error, .nsc__error');
    var submitBtn = form.querySelector('button[type="submit"]');
    var chips = Array.prototype.slice.call(form.querySelectorAll(".ns__chip"));
    var freqValue = form.querySelector("[data-freq-value]");

    /* frequency chips behave as a radio group */
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-checked", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-checked", "true");
        if (freqValue) freqValue.value = chip.getAttribute("data-freq");
      });
      /* keyboard: arrow keys move between chips */
      chip.addEventListener("keydown", function (e) {
        var idx = chips.indexOf(chip);
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = chips[(idx + 1) % chips.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = chips[(idx - 1 + chips.length) % chips.length];
        if (next) {
          e.preventDefault();
          next.focus();
          next.click();
        }
      });
    });

    function clearError() {
      if (!error) return;
      error.hidden = true;
      error.textContent = "";
      if (input) input.classList.remove("is-invalid");
    }

    function showError(msg) {
      if (error) {
        error.hidden = false;
        error.textContent = msg;
      }
      if (input) {
        input.classList.add("is-invalid");
        input.focus();
      }
    }

    if (input) input.addEventListener("input", clearError);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = input ? input.value.trim() : "";

      if (!value) {
        showError("Please enter your email address.");
        return;
      }
      if (!EMAIL_RE.test(value)) {
        showError("That doesn’t look like a valid email — check for typos.");
        return;
      }

      clearError();

      var freq = freqValue ? freqValue.value : "daily";
      var freqLabel = freq === "weekly" ? "weekly" : "daily";

      /* simulate request */
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Subscribing…";
      }

      window.setTimeout(function () {
        widget.classList.add("is-done");

        /* inject a success line in place of the form */
        var isCompact = widget.classList.contains("nsc");
        var done = document.createElement("p");
        done.className = isCompact ? "nsc__done" : "ns__done";
        done.setAttribute("role", "status");
        done.textContent = "✓ You’re in — the " + freqLabel + " brief is on its way.";

        var anchor = form;
        anchor.parentNode.insertBefore(done, anchor);

        bumpCount();
        toast("Subscribed to The Morning Brief (" + freqLabel + "). Check your inbox to confirm.");
      }, 650);
    });
  });
})();
