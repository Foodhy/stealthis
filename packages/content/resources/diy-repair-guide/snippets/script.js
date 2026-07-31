/* Volta X2 battery replacement — guide interactions
   - IntersectionObserver highlights the current step in the sticky rail
   - "Mark step complete" checkboxes persist to localStorage
   - Completion meter + success state when all 8 steps are done
   - toast(msg) helper for micro-feedback */

(function () {
  "use strict";

  var STORAGE_KEY = "fixshop.vx2-bat-011.progress";
  var TOTAL_STEPS = 8;

  var checkboxes = Array.prototype.slice.call(
    document.querySelectorAll(".step-done")
  );
  var railLinks = Array.prototype.slice.call(
    document.querySelectorAll(".rail-link")
  );
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));

  var meterFill = document.getElementById("meterFill");
  var meterBar = document.getElementById("meterBar");
  var meterPct = document.getElementById("meterPct");
  var finishDefault = document.getElementById("finishDefault");
  var finishSuccess = document.getElementById("finishSuccess");
  var finishCount = document.getElementById("finishCount");
  var toastEl = document.getElementById("toast");

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- persistence ---------- */
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveProgress(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* private mode — session-only progress */
    }
  }

  function completedSteps() {
    return checkboxes
      .filter(function (cb) {
        return cb.checked;
      })
      .map(function (cb) {
        return cb.getAttribute("data-step");
      });
  }

  /* ---------- render ---------- */
  var wasComplete = false;

  function render() {
    var done = completedSteps();
    var pct = Math.round((done.length / TOTAL_STEPS) * 100);

    meterFill.style.width = pct + "%";
    meterFill.classList.toggle("full", pct === 100);
    meterPct.textContent = pct + "%";
    meterBar.setAttribute("aria-valuenow", String(pct));
    finishCount.textContent = done.length + " / " + TOTAL_STEPS;

    steps.forEach(function (stepEl) {
      var n = stepEl.getAttribute("data-step");
      stepEl.classList.toggle("is-done", done.indexOf(n) !== -1);
    });

    railLinks.forEach(function (link) {
      var n = link.getAttribute("data-step");
      var isDone = done.indexOf(n) !== -1;
      link.classList.toggle("done", isDone);
      var dot = link.querySelector(".rail-dot");
      dot.textContent = isDone ? "✓" : n;
    });

    var complete = done.length === TOTAL_STEPS;
    finishDefault.hidden = complete;
    finishSuccess.hidden = !complete;

    if (complete && !wasComplete) {
      toast("All 8 steps complete — nice fix!");
      document
        .getElementById("finish")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }
    wasComplete = complete;
  }

  /* ---------- restore + wire checkboxes ---------- */
  var saved = loadProgress();
  checkboxes.forEach(function (cb) {
    cb.checked = saved.indexOf(cb.getAttribute("data-step")) !== -1;
    cb.addEventListener("change", function () {
      var done = completedSteps();
      saveProgress(done);
      render();
      if (done.length < TOTAL_STEPS) {
        toast(
          cb.checked
            ? "Step " + cb.getAttribute("data-step") + " done — " +
              (TOTAL_STEPS - done.length) + " to go"
            : "Step " + cb.getAttribute("data-step") + " unchecked"
        );
      }
    });
  });

  /* ---------- reset ---------- */
  document.getElementById("resetBtn").addEventListener("click", function () {
    checkboxes.forEach(function (cb) {
      cb.checked = false;
    });
    saveProgress([]);
    wasComplete = false;
    render();
    toast("Progress reset — back to step 1");
    document
      .getElementById("step-1")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- sticky rail: current step via IntersectionObserver ---------- */
  var activeStep = null;

  function setActive(n) {
    if (n === activeStep) return;
    activeStep = n;
    railLinks.forEach(function (link) {
      link.classList.toggle(
        "active",
        link.getAttribute("data-step") === n
      );
    });
  }

  if ("IntersectionObserver" in window) {
    var visible = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var n = entry.target.getAttribute("data-step");
          visible[n] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });
        var best = null;
        var bestRatio = 0;
        Object.keys(visible).forEach(function (n) {
          if (visible[n] > bestRatio) {
            bestRatio = visible[n];
            best = n;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-15% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    steps.forEach(function (stepEl) {
      observer.observe(stepEl);
    });
  } else {
    setActive("1");
  }

  /* rail links: smooth scroll */
  railLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(link.getAttribute("data-step"));
      }
    });
  });

  /* ---------- misc buttons ---------- */
  document.getElementById("kitBtn").addEventListener("click", function () {
    toast("Fix kit VX2-CELL-620 + tools added to cart");
  });

  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      toast("Fix report shared with the Fixshop community");
    });
  }

  var anotherBtn = document.getElementById("anotherBtn");
  if (anotherBtn) {
    anotherBtn.addEventListener("click", function () {
      toast("Loading more Volta X2 guides…");
    });
  }

  /* ---------- init ---------- */
  render();
})();
