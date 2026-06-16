(function () {
  "use strict";

  var widget = document.getElementById("widget");
  var taskList = document.getElementById("taskList");
  var tasks = Array.prototype.slice.call(taskList.querySelectorAll(".task"));
  var metaLine = document.getElementById("metaLine");
  var progressSlot = document.getElementById("progressSlot");
  var doneBanner = document.getElementById("doneBanner");
  var toggleBtn = document.getElementById("toggleBtn");
  var dismissBtn = document.getElementById("dismissBtn");
  var restoreBtn = document.getElementById("restoreBtn");
  var pill = document.getElementById("pill");
  var pillMeta = document.getElementById("pillMeta");
  var pillRing = document.getElementById("pillRing");
  var toastEl = document.getElementById("toast");

  var TOTAL = tasks.length;
  var RING_R = 22;
  var RING_C = 2 * Math.PI * RING_R;

  var state = {
    progress: "ring", // ring | bar
    layout: "card", // card | pill
    collapsed: false,
    dismissed: false
  };

  // --- Toast helper -------------------------------------------------------
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  // --- Progress math ------------------------------------------------------
  function doneCount() {
    return tasks.filter(function (t) {
      return t.classList.contains("is-done");
    }).length;
  }

  function pct(done) {
    return Math.round((done / TOTAL) * 100);
  }

  // --- Render progress indicator (ring or bar) ----------------------------
  function renderProgress() {
    var done = doneCount();
    var percent = pct(done);
    var complete = done === TOTAL;

    if (state.progress === "ring") {
      var offset = RING_C * (1 - done / TOTAL);
      progressSlot.innerHTML =
        '<div class="ring' + (complete ? " is-complete" : "") + '">' +
        '<svg viewBox="0 0 52 52" width="52" height="52" role="img" aria-label="' + percent + ' percent complete">' +
        '<circle class="ring__track" cx="26" cy="26" r="' + RING_R + '" fill="none" stroke-width="5"></circle>' +
        '<circle class="ring__fill" cx="26" cy="26" r="' + RING_R + '" fill="none" stroke-width="5" ' +
        'stroke-dasharray="' + RING_C.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '"></circle>' +
        "</svg>" +
        '<span class="ring__pct">' + percent + "%</span>" +
        "</div>";
    } else {
      progressSlot.innerHTML =
        '<div class="bar' + (complete ? " is-complete" : "") + '" role="img" aria-label="' + percent + ' percent complete">' +
        '<div class="bar__count">' + percent + "%</div>" +
        '<div class="bar__track"><div class="bar__fill" style="width:' + percent + '%"></div></div>' +
        "</div>";
    }

    metaLine.textContent =
      done + " of " + TOTAL + " tasks done · " + percent + "% complete";

    doneBanner.hidden = !complete;
  }

  // --- Pill mini-ring -----------------------------------------------------
  function renderPill() {
    var done = doneCount();
    var percent = pct(done);
    pillRing.setAttribute("data-pct", percent + "%");
    pillRing.style.background =
      "conic-gradient(" +
      (done === TOTAL ? "var(--ok)" : "var(--brand)") +
      " " + percent + "%, var(--brand-50) " + percent + "%)";
    // mask center to make it a ring
    pillRing.style.webkitMask =
      "radial-gradient(circle 12px at center, transparent 98%, #000 100%)";
    pillRing.style.mask =
      "radial-gradient(circle 12px at center, transparent 98%, #000 100%)";
    pillMeta.textContent = done + " of " + TOTAL + " done";
  }

  function refresh() {
    renderProgress();
    renderPill();
  }

  // --- Task toggling ------------------------------------------------------
  function toggleTask(task) {
    var nowDone = !task.classList.contains("is-done");
    task.classList.toggle("is-done", nowDone);
    var check = task.querySelector(".task__check");
    check.setAttribute("aria-checked", nowDone ? "true" : "false");

    refresh();

    if (doneCount() === TOTAL) {
      toast("All set — onboarding complete!");
    } else if (nowDone) {
      toast("Nice — " + (TOTAL - doneCount()) + " to go");
    }
  }

  tasks.forEach(function (task) {
    var check = task.querySelector(".task__check");
    check.addEventListener("click", function () {
      toggleTask(task);
    });
    check.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleTask(task);
      }
    });

    var action = task.querySelector(".task__action");
    action.addEventListener("click", function () {
      toast(action.getAttribute("data-action") || "Opened");
      // simulate completing the step shortly after the action
      if (!task.classList.contains("is-done")) {
        setTimeout(function () {
          toggleTask(task);
        }, 600);
      }
    });
  });

  // --- Expand / collapse --------------------------------------------------
  function setCollapsed(collapsed) {
    state.collapsed = collapsed;
    widget.classList.toggle("is-collapsed", collapsed);
    toggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggleBtn.title = collapsed ? "Expand" : "Collapse";
  }

  toggleBtn.addEventListener("click", function () {
    setCollapsed(!state.collapsed);
  });

  // --- Dismiss / restore --------------------------------------------------
  function applyDismiss(dismissed) {
    state.dismissed = dismissed;
    syncLayout();
    restoreBtn.hidden = !dismissed;
  }

  dismissBtn.addEventListener("click", function () {
    applyDismiss(true);
    toast("Checklist hidden");
  });

  restoreBtn.addEventListener("click", function () {
    applyDismiss(false);
    toast("Checklist restored");
  });

  // --- Layout variant (card vs pill) -------------------------------------
  function syncLayout() {
    if (state.dismissed) {
      widget.hidden = true;
      pill.hidden = true;
      return;
    }
    if (state.layout === "pill") {
      widget.hidden = true;
      pill.hidden = false;
    } else {
      widget.hidden = false;
      pill.hidden = true;
    }
  }

  pill.addEventListener("click", function () {
    setActive(layoutBtns, "card");
    state.layout = "card";
    widget.dataset.layout = "card";
    setCollapsed(false);
    syncLayout();
  });

  // --- Segmented controls -------------------------------------------------
  var progressBtns = Array.prototype.slice.call(
    document.querySelectorAll("[data-progress]")
  );
  var layoutBtns = Array.prototype.slice.call(
    document.querySelectorAll("[data-layout]")
  );

  function setActive(group, value) {
    group.forEach(function (btn) {
      var v = btn.dataset.progress || btn.dataset.layout;
      var on = v === value;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  progressBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.progress = btn.dataset.progress;
      widget.dataset.progress = state.progress;
      setActive(progressBtns, state.progress);
      renderProgress();
    });
  });

  layoutBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.layout = btn.dataset.layout;
      widget.dataset.layout = state.layout;
      setActive(layoutBtns, state.layout);
      if (state.dismissed) applyDismiss(false);
      syncLayout();
    });
  });

  // --- Esc collapses the open card ---------------------------------------
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.layout === "card" && !state.dismissed && !state.collapsed) {
      setCollapsed(true);
    }
  });

  // --- Init: first task pre-completed for a realistic 20% start -----------
  tasks[0].classList.add("is-done");
  tasks[0].querySelector(".task__check").setAttribute("aria-checked", "true");

  refresh();
  syncLayout();
})();
