(function () {
  "use strict";

  var list = document.getElementById("list");
  var items = Array.prototype.slice.call(list.querySelectorAll(".item"));
  var input = document.getElementById("q");
  var clearBtn = document.getElementById("clear");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var countEl = document.getElementById("count");
  var toggleAllBtn = document.getElementById("toggleAll");
  var emptyEl = document.getElementById("empty");
  var resetBtn = document.getElementById("reset");
  var toastEl = document.getElementById("toast");

  var activeCat = "all";
  var toastTimer = null;

  /* ---- toast helper ---- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1900);
  }

  /* ---- accordion open/close (height measured for smooth motion) ---- */
  function setOpen(item, open) {
    var btn = item.querySelector(".acc");
    var panel = item.querySelector(".panel");
    var inner = item.querySelector(".panel__in");

    if (open) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      panel.style.height = inner.offsetHeight + "px";
      // release to auto after the transition so reflow/resize stays fluid
      var onEnd = function (e) {
        if (e.propertyName !== "height") return;
        if (item.classList.contains("is-open")) panel.style.height = "auto";
        panel.removeEventListener("transitionend", onEnd);
      };
      panel.addEventListener("transitionend", onEnd);
    } else {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      // from auto -> fixed -> 0 so the collapse animates
      panel.style.height = panel.scrollHeight + "px";
      // force reflow
      void panel.offsetHeight;
      panel.style.height = "0px";
    }
  }

  function isOpen(item) {
    return item.classList.contains("is-open");
  }

  items.forEach(function (item) {
    var btn = item.querySelector(".acc");
    btn.addEventListener("click", function () {
      setOpen(item, !isOpen(item));
      syncToggleAll();
    });
  });

  /* ---- expand / collapse all (visible items only) ---- */
  function visibleItems() {
    return items.filter(function (it) {
      return !it.classList.contains("is-hidden");
    });
  }

  function syncToggleAll() {
    var vis = visibleItems();
    var openCount = vis.filter(isOpen).length;
    var allOpen = vis.length > 0 && openCount === vis.length;
    toggleAllBtn.textContent = allOpen ? "Collapse all" : "Expand all";
    toggleAllBtn.setAttribute("aria-expanded", allOpen ? "true" : "false");
  }

  toggleAllBtn.addEventListener("click", function () {
    var vis = visibleItems();
    var shouldOpen = vis.some(function (it) { return !isOpen(it); });
    vis.forEach(function (it) { setOpen(it, shouldOpen); });
    syncToggleAll();
    toast(shouldOpen ? "Expanded all answers" : "Collapsed all answers");
  });

  /* ---- highlight matched query text ---- */
  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(item, query) {
    var span = item.querySelector(".qtext");
    if (!span.dataset.raw) span.dataset.raw = span.textContent;
    var raw = span.dataset.raw;
    if (!query) {
      span.textContent = raw;
      return;
    }
    var re = new RegExp("(" + escapeRe(query) + ")", "ig");
    span.innerHTML = raw.replace(re, "<mark>$1</mark>");
  }

  /* ---- filtering ---- */
  function textOf(item) {
    return (
      item.querySelector(".qtext").textContent + " " +
      item.querySelector(".panel__in").textContent
    ).toLowerCase();
  }

  function applyFilter() {
    var query = input.value.trim().toLowerCase();
    clearBtn.hidden = query.length === 0;

    var shown = 0;
    items.forEach(function (item) {
      var catOk = activeCat === "all" || item.dataset.cat === activeCat;
      var textOk = query === "" || textOf(item).indexOf(query) !== -1;
      var visible = catOk && textOk;

      item.classList.toggle("is-hidden", !visible);
      if (visible) {
        shown++;
        highlight(item, query);
      } else if (isOpen(item)) {
        setOpen(item, false); // tidy up hidden-but-open panels
      }
    });

    emptyEl.hidden = shown !== 0;
    list.hidden = shown === 0;
    updateCount(shown, query);
    syncToggleAll();
  }

  function updateCount(shown, query) {
    var total = items.length;
    if (query === "" && activeCat === "all") {
      countEl.innerHTML = "Showing all <strong>" + total + "</strong> questions";
      return;
    }
    var noun = shown === 1 ? "question" : "questions";
    countEl.innerHTML = "Showing <strong>" + shown + "</strong> of " + total + " " + noun;
  }

  /* ---- events ---- */
  var debounce = null;
  input.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(applyFilter, 90);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) {
      e.preventDefault();
      input.value = "";
      applyFilter();
    }
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    applyFilter();
    input.focus();
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (chip.dataset.cat === activeCat) return;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-selected", on ? "true" : "false");
      });
      activeCat = chip.dataset.cat;
      applyFilter();
    });
  });

  resetBtn.addEventListener("click", function () {
    input.value = "";
    activeCat = "all";
    chips.forEach(function (c) {
      var on = c.dataset.cat === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilter();
    toast("Filters reset");
  });

  /* ---- init ---- */
  applyFilter();
})();
