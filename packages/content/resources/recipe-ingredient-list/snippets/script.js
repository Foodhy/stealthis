(function () {
  "use strict";

  var STORAGE_KEY = "cookbook:recipe-ingredient-list:galette-14";

  var groupsRoot = document.getElementById("groups");
  var checkboxes = Array.prototype.slice.call(
    groupsRoot.querySelectorAll('input[type="checkbox"]')
  );
  var gatheredCount = document.getElementById("gathered-count");
  var totalCount = document.getElementById("total-count");
  var fill = document.getElementById("progress-fill");
  var track = fill.parentElement;
  var liveStatus = document.getElementById("live-status");
  var checkAllBtn = document.getElementById("check-all");
  var clearAllBtn = document.getElementById("clear-all");
  var toastEl = document.getElementById("toast");

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  // Give each checkbox a stable index-based id for persistence.
  checkboxes.forEach(function (cb, i) {
    cb.dataset.idx = String(i);
  });

  function save() {
    var checked = checkboxes
      .map(function (cb, i) {
        return cb.checked ? i : -1;
      })
      .filter(function (i) {
        return i >= 0;
      });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch (e) {
      /* storage unavailable — ignore */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var checked = JSON.parse(raw);
      if (!Array.isArray(checked)) return;
      checked.forEach(function (i) {
        if (checkboxes[i]) checkboxes[i].checked = true;
      });
    } catch (e) {
      /* malformed — ignore */
    }
  }

  function updateGroups() {
    var groups = groupsRoot.querySelectorAll(".group");
    groups.forEach(function (group) {
      var boxes = group.querySelectorAll('input[type="checkbox"]');
      var done = 0;
      boxes.forEach(function (b) {
        if (b.checked) done++;
      });
      var label = group.querySelector("[data-group-count]");
      if (label) label.textContent = done + "/" + boxes.length;
    });
  }

  function updateItemStates() {
    checkboxes.forEach(function (cb) {
      var item = cb.closest(".item");
      if (item) item.classList.toggle("is-checked", cb.checked);
    });
  }

  function render() {
    var total = checkboxes.length;
    var done = checkboxes.filter(function (cb) {
      return cb.checked;
    }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    gatheredCount.textContent = String(done);
    totalCount.textContent = String(total);
    fill.style.width = pct + "%";
    track.setAttribute("aria-valuenow", String(pct));
    liveStatus.textContent = done + " of " + total + " ingredients gathered";

    updateItemStates();
    updateGroups();
  }

  groupsRoot.addEventListener("change", function (e) {
    if (e.target && e.target.matches('input[type="checkbox"]')) {
      render();
      save();
    }
  });

  checkAllBtn.addEventListener("click", function () {
    checkboxes.forEach(function (cb) {
      cb.checked = true;
    });
    render();
    save();
    toast("All ingredients gathered 🧺");
  });

  clearAllBtn.addEventListener("click", function () {
    checkboxes.forEach(function (cb) {
      cb.checked = false;
    });
    render();
    save();
    toast("List cleared");
  });

  load();
  render();
})();
