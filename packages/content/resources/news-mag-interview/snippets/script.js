(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    toastEl.setAttribute("aria-hidden", "false");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
      toastEl.setAttribute("aria-hidden", "true");
    }, 2400);
  }

  /* ---------- Text-size control ---------- */
  var SCALES = [0.9, 1, 1.12, 1.25, 1.4];
  var LABELS = ["90%", "100%", "112%", "125%", "140%"];
  var idx = 1;
  var root = document.documentElement;
  var valueEl = document.getElementById("textsize-value");

  function applyScale() {
    root.style.setProperty("--reader-scale", String(SCALES[idx]));
    if (valueEl) valueEl.textContent = LABELS[idx];
  }

  document.querySelectorAll(".textsize__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dir = btn.getAttribute("data-size");
      if (dir === "inc" && idx < SCALES.length - 1) {
        idx++;
      } else if (dir === "dec" && idx > 0) {
        idx--;
      } else {
        toast(dir === "inc" ? "Largest text size" : "Smallest text size");
        return;
      }
      applyScale();
      toast("Text size " + LABELS[idx]);
    });
  });
  applyScale();

  /* ---------- Jump-to-question mini-nav ---------- */
  var select = document.getElementById("jump-select");
  var qaBlocks = Array.prototype.slice.call(
    document.querySelectorAll(".qa[data-question]")
  );

  qaBlocks.forEach(function (block, i) {
    var id = "q-" + (i + 1);
    block.id = id;
    if (select) {
      var opt = document.createElement("option");
      opt.value = id;
      opt.textContent = (i + 1) + ". " + block.getAttribute("data-question");
      select.appendChild(opt);
    }
  });

  function jumpTo(id) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    qaBlocks.forEach(function (b) { b.classList.remove("qa--target"); });
    // restart animation
    void target.offsetWidth;
    target.classList.add("qa--target");
  }

  if (select) {
    select.addEventListener("change", function () {
      if (!select.value) return;
      jumpTo(select.value);
      var label = select.options[select.selectedIndex].textContent;
      toast("Jumped to: " + label.replace(/^\d+\.\s*/, ""));
      select.value = "";
    });
  }

  /* ---------- Keep jump-nav synced with scroll position ---------- */
  if ("IntersectionObserver" in window && qaBlocks.length) {
    var current = null;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) current = entry.target.id;
        });
        if (current && select && document.activeElement !== select) {
          // reflect position without firing change
          select.value = "";
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    qaBlocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      var top = document.getElementById("top");
      if (top) top.focus({ preventScroll: true });
    });
  }
})();
