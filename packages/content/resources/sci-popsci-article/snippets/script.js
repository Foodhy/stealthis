(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------- Estimated read time ---------- */
  (function readTime() {
    var prose = document.getElementById("prose");
    var out = document.getElementById("readTime");
    if (!prose || !out) return;
    var words = (prose.innerText.trim().match(/\S+/g) || []).length;
    var mins = Math.max(1, Math.round(words / 220));
    out.textContent = mins + " min read";
  })();

  /* ---------- Reading progress bar ---------- */
  (function progress() {
    var bar = document.getElementById("progressBar");
    var track = bar ? bar.parentElement : null;
    if (!bar) return;
    var raf = false;
    function update() {
      raf = false;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      pct = Math.min(100, Math.max(0, pct));
      bar.style.width = pct.toFixed(1) + "%";
      if (track) track.setAttribute("aria-valuenow", Math.round(pct));
    }
    window.addEventListener("scroll", function () {
      if (!raf) { raf = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------- Theme (sepia) toggle ---------- */
  (function theme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var label = btn.querySelector(".theme-toggle__label");
    btn.addEventListener("click", function () {
      var on = document.documentElement.getAttribute("data-theme") === "sepia";
      if (on) {
        document.documentElement.removeAttribute("data-theme");
        btn.setAttribute("aria-pressed", "false");
        if (label) label.textContent = "Sepia";
        toast("Daylight reading mode");
      } else {
        document.documentElement.setAttribute("data-theme", "sepia");
        btn.setAttribute("aria-pressed", "true");
        if (label) label.textContent = "Daylight";
        toast("Sepia reading mode");
      }
    });
  })();

  /* ---------- Save / Share chips ---------- */
  (function actions() {
    var save = document.getElementById("btnSave");
    if (save) {
      save.addEventListener("click", function () {
        var on = save.getAttribute("aria-pressed") === "true";
        save.setAttribute("aria-pressed", on ? "false" : "true");
        save.innerHTML = on
          ? '<span aria-hidden="true">☆</span> Save'
          : '<span aria-hidden="true">★</span> Saved';
        toast(on ? "Removed from your reading list" : "Saved to your reading list");
      });
    }
    var share = document.getElementById("btnShare");
    if (share) {
      share.addEventListener("click", function () {
        var data = { title: document.title, text: "The Quiet Engines That Stir the Deep Sea", url: location.href };
        if (navigator.share) {
          navigator.share(data).then(function () { toast("Shared"); }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(location.href).then(function () { toast("Link copied to clipboard"); }).catch(function () { toast("Could not copy link"); });
        } else {
          toast("Sharing not supported here");
        }
      });
    }
  })();

  /* ---------- "How it works" stepper ---------- */
  (function stepper() {
    var root = document.getElementById("stepper");
    if (!root) return;
    var steps = Array.prototype.slice.call(root.querySelectorAll(".step"));
    var prev = document.getElementById("stepPrev");
    var next = document.getElementById("stepNext");
    var count = document.getElementById("stepCount");
    var idx = 0;

    function render() {
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
      if (count) count.textContent = "Step " + (idx + 1) + " of " + steps.length;
      if (prev) prev.disabled = idx === 0;
      if (next) next.textContent = idx === steps.length - 1 ? "Start over" : "Next step ›";
    }
    function go(i) {
      idx = (i + steps.length) % steps.length;
      render();
    }

    steps.forEach(function (s, i) {
      s.setAttribute("tabindex", "0");
      s.setAttribute("role", "button");
      s.addEventListener("click", function () { go(i); });
      s.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(i); }
      });
    });
    if (prev) prev.addEventListener("click", function () { go(idx - 1); });
    if (next) next.addEventListener("click", function () { go(idx + 1); });
    render();
  })();

  /* ---------- Glossary accordion ---------- */
  (function glossary() {
    var list = document.getElementById("glossary");
    if (!list) return;
    var btns = Array.prototype.slice.call(list.querySelectorAll(".term__btn"));
    btns.forEach(function (btn) {
      var def = btn.parentElement.parentElement.querySelector(".term__def");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        if (def) def.classList.toggle("is-open", !open);
      });
    });
  })();
})();
