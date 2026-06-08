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
    }, 2400);
  }

  /* ---------- animated KPI counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var isMoney = el.getAttribute("data-money") === "1";
    var duration = 1100;
    var start = performance.now();

    function fmt(n) {
      if (isMoney) return prefix + Math.round(n).toLocaleString("en-US");
      return prefix + Math.round(n).toLocaleString("en-US");
    }

    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(frame);
  }

  var kpiVals = document.querySelectorAll(".kpi-value");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    kpiVals.forEach(function (el) { io.observe(el); });
  } else {
    kpiVals.forEach(animateCount);
  }

  /* ---------- listing filters ---------- */
  var chips = document.querySelectorAll(".chip");
  var listings = document.querySelectorAll("#listings .listing");
  var emptyState = document.getElementById("emptyState");

  function applyFilter(filter) {
    var shown = 0;
    listings.forEach(function (li) {
      var match = filter === "all" || li.getAttribute("data-status") === filter;
      li.style.display = match ? "" : "none";
      if (match) shown++;
    });
    if (emptyState) emptyState.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-on");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-selected", "true");
      var f = chip.getAttribute("data-filter");
      applyFilter(f);
      toast(
        f === "all"
          ? "Showing all listings"
          : "Filtered to " + f + " listings"
      );
    });
  });

  /* ---------- tasks: toggle completion ---------- */
  var taskList = document.getElementById("tasks");
  var taskCountEl = document.getElementById("taskCount");

  function syncTask(input) {
    var li = input.closest(".task");
    if (!li) return;
    var due = li.querySelector(".due");
    if (input.checked) {
      li.classList.add("is-done");
      if (due) {
        if (due.getAttribute("data-orig") === null)
          due.setAttribute("data-orig", due.textContent);
        due.textContent = "Done";
      }
    } else {
      li.classList.remove("is-done");
      if (due && due.getAttribute("data-orig"))
        due.textContent = due.getAttribute("data-orig");
    }
  }

  function updateTaskCount() {
    var inputs = taskList.querySelectorAll('input[type="checkbox"]');
    var done = 0;
    inputs.forEach(function (i) { if (i.checked) done++; });
    if (taskCountEl) taskCountEl.textContent = done + "/" + inputs.length + " done";
  }

  if (taskList) {
    // initialise data-orig + state
    taskList.querySelectorAll(".task").forEach(function (li) {
      var due = li.querySelector(".due");
      var input = li.querySelector('input[type="checkbox"]');
      if (due && due.getAttribute("data-orig") === null) {
        due.setAttribute("data-orig", input && input.checked ? "Done" : due.textContent);
      }
      if (input && input.checked) li.classList.add("is-done");
    });

    taskList.addEventListener("change", function (e) {
      var input = e.target;
      if (input && input.type === "checkbox") {
        syncTask(input);
        updateTaskCount();
        if (input.checked) {
          var label = input.closest(".task").querySelector(".task-text strong");
          toast("Completed: " + (label ? label.textContent : "task"));
        }
      }
    });
    updateTaskCount();
  }

  /* ---------- new listing button ---------- */
  var newBtn = document.getElementById("newListingBtn");
  if (newBtn) {
    newBtn.addEventListener("click", function () {
      toast("New listing draft started");
    });
  }
})();
