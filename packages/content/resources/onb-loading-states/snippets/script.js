(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
    el.querySelector("span").textContent = msg;
    toastWrap.appendChild(el);
    var ttl = setTimeout(function () {
      el.classList.add("is-out");
      el.addEventListener("animationend", function () {
        el.remove();
      });
    }, 2600);
    el.addEventListener("click", function () {
      clearTimeout(ttl);
      el.remove();
    });
  }

  /* ---------- Status line ---------- */
  var statusDot = document.getElementById("statusDot");
  var statusText = document.getElementById("statusText");
  function setStatus(state, text) {
    statusDot.dataset.state = state;
    statusText.textContent = text;
  }

  /* ---------- Timer registry (so reloads cancel cleanly) ---------- */
  var timers = [];
  function later(fn, ms) {
    var id = setTimeout(fn, prefersReduced ? Math.min(ms, 80) : ms);
    timers.push(id);
    return id;
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  /* ---------- Skeleton panels: toggle loading <-> loaded ---------- */
  var stages = Array.prototype.slice.call(
    document.querySelectorAll(".panel[data-variant='skeleton'] [data-stage]")
  );
  function skeletonShow(loading) {
    stages.forEach(function (stage) {
      var load = stage.querySelector("[data-loading]");
      var done = stage.querySelector("[data-loaded]");
      if (load) load.hidden = !loading;
      if (done) done.hidden = loading;
    });
  }

  /* ---------- Spinner button ---------- */
  var spinnerBtn = document.getElementById("spinnerBtn");
  var spinnerResult = document.getElementById("spinnerResult");
  var spinnerLabel = spinnerBtn.querySelector(".action-btn__label");
  function runSpinner(silent) {
    spinnerResult.hidden = true;
    spinnerBtn.setAttribute("aria-busy", "true");
    spinnerBtn.disabled = true;
    spinnerLabel.textContent = "Sending…";
    later(function () {
      spinnerBtn.setAttribute("aria-busy", "false");
      spinnerBtn.disabled = false;
      spinnerLabel.textContent = "Send payout";
      spinnerResult.hidden = false;
      if (!silent) toast("Payout sent");
    }, 1600);
  }
  spinnerBtn.addEventListener("click", function () {
    runSpinner(false);
  });

  /* ---------- Progress bar ---------- */
  var progressBar = document.getElementById("progressBar");
  var progressFill = document.getElementById("progressFill");
  var progressPct = document.getElementById("progressPct");
  var progressMeta = document.getElementById("progressMeta");
  var progressInterval = null;

  function resetProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    progressBar.classList.remove("is-done");
    progressMeta.classList.remove("is-done");
    progressFill.style.width = "0%";
    progressPct.textContent = "0%";
    progressBar.setAttribute("aria-valuenow", "0");
    progressMeta.textContent = "Waiting to start…";
  }

  function runProgress(silent) {
    resetProgress();
    var pct = 0;
    progressMeta.textContent = "Uploading quarterly-report.pdf…";
    progressInterval = setInterval(
      function () {
        // ease-out style increments
        var step = Math.max(1, Math.round((100 - pct) * 0.12));
        pct = Math.min(100, pct + step);
        progressFill.style.width = pct + "%";
        progressPct.textContent = pct + "%";
        progressBar.setAttribute("aria-valuenow", String(pct));
        if (pct >= 100) {
          clearInterval(progressInterval);
          progressInterval = null;
          progressBar.classList.add("is-done");
          progressMeta.classList.add("is-done");
          progressMeta.textContent = "Upload complete · 2.4 MB";
          if (!silent) toast("Upload complete");
        }
      },
      prefersReduced ? 30 : 130
    );
    timers.push({ stop: function () {} }); // marker; interval cleared in reset
  }

  /* ---------- Progressive staggered reveal ---------- */
  var revealTiles = Array.prototype.slice.call(
    document.querySelectorAll(".tile[data-reveal]")
  );
  function resetReveal() {
    revealTiles.forEach(function (t) {
      t.classList.remove("is-in");
    });
  }
  function runReveal() {
    resetReveal();
    revealTiles.forEach(function (tile, i) {
      later(function () {
        tile.classList.add("is-in");
      }, 140 + i * 130);
    });
  }

  /* ---------- Full reload sequence ---------- */
  var reloadBtn = document.getElementById("reloadBtn");
  function reloadAll() {
    clearTimers();
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    reloadBtn.classList.add("is-spinning");
    reloadBtn.disabled = true;
    setStatus("loading", "Loading all primitives…");

    // 1. show every loading state
    skeletonShow(true);
    resetProgress();
    resetReveal();
    spinnerResult.hidden = true;

    // 2. kick the live ones
    runSpinner(true);
    runProgress(true);

    // 3. resolve skeletons + reveal after a beat, then settle
    later(function () {
      skeletonShow(false);
    }, 1500);
    later(function () {
      runReveal();
    }, 1500);

    later(function () {
      reloadBtn.classList.remove("is-spinning");
      reloadBtn.disabled = false;
      setStatus("idle", "Content loaded — replay any primitive above.");
      toast("All states reloaded");
    }, 2500);
  }
  reloadBtn.addEventListener("click", reloadAll);

  /* ---------- Variant switcher (segmented control) ---------- */
  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg"));
  var grid = document.getElementById("gallery");
  var panels = Array.prototype.slice.call(grid.querySelectorAll(".panel"));

  function selectVariant(variant, replay) {
    segs.forEach(function (s) {
      s.setAttribute(
        "aria-selected",
        s.dataset.variant === variant ? "true" : "false"
      );
    });

    if (variant === "all") {
      grid.classList.remove("dim");
      panels.forEach(function (p) {
        p.classList.remove("is-active");
      });
    } else {
      grid.classList.add("dim");
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.variant === variant);
      });
    }

    if (!replay) return;

    // replay just the focused primitive
    if (variant === "skeleton") {
      skeletonShow(true);
      setStatus("loading", "Loading skeleton placeholders…");
      later(function () {
        skeletonShow(false);
        setStatus("idle", "Skeleton content loaded.");
      }, 1400);
    } else if (variant === "spinner") {
      runSpinner(true);
      setStatus("loading", "Pending action in flight…");
      later(function () {
        setStatus("idle", "Action resolved.");
      }, 1700);
    } else if (variant === "progress") {
      runProgress(true);
      setStatus("loading", "Upload in progress…");
      later(function () {
        setStatus("idle", "Upload finished.");
      }, 1500);
    } else if (variant === "reveal") {
      runReveal();
      setStatus("loading", "Revealing tiles…");
      later(function () {
        setStatus("idle", "Tiles revealed.");
      }, 900);
    }
  }

  segs.forEach(function (seg) {
    seg.addEventListener("click", function () {
      selectVariant(seg.dataset.variant, true);
    });
  });

  // Arrow-key navigation across the segmented control
  grid &&
    document
      .querySelector(".segmented")
      .addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        var idx = segs.indexOf(document.activeElement);
        if (idx === -1) return;
        e.preventDefault();
        var next =
          e.key === "ArrowRight"
            ? (idx + 1) % segs.length
            : (idx - 1 + segs.length) % segs.length;
        segs[next].focus();
        selectVariant(segs[next].dataset.variant, false);
      });

  /* ---------- Initial paint: run the load once ---------- */
  // start in loading state so first impression shows the skeletons
  skeletonShow(true);
  resetReveal();
  setStatus("loading", "Loading all primitives…");
  later(function () {
    skeletonShow(false);
    runReveal();
    setStatus("idle", "Content loaded — replay any primitive above.");
  }, 1300);
})();
