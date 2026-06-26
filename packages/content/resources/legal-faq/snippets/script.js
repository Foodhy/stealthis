(function () {
  "use strict";

  var list = document.getElementById("faq-list");
  if (!list) return;

  var searchInput = document.getElementById("faq-search");
  var clearBtn = document.querySelector(".faq__search-clear");
  var countEl = document.getElementById("faq-count");
  var emptyEl = document.getElementById("faq-empty");
  var groups = Array.prototype.slice.call(list.querySelectorAll("[data-group]"));
  var items = Array.prototype.slice.call(list.querySelectorAll("[data-item]"));

  var buttons = items.map(function (item) {
    return item.querySelector(".faq__q");
  });

  // Cache original text for highlight reset.
  items.forEach(function (item) {
    var q = item.querySelector(".faq__q-text");
    var a = item.querySelector(".faq__a p");
    item._qText = q ? q.textContent : "";
    item._aText = a ? a.textContent : "";
    item._qEl = q;
    item._aEl = a;
  });

  /* ---------- Accordion (single-open) ---------- */
  function setOpen(item, open) {
    var btn = item.querySelector(".faq__q");
    var panel = item.querySelector(".faq__a");
    item.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  }

  function toggle(item) {
    var isOpen = item.classList.contains("is-open");
    items.forEach(function (other) {
      if (other !== item) setOpen(other, false);
    });
    setOpen(item, !isOpen);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      toggle(btn.closest("[data-item]"));
    });
  });

  /* ---------- Keyboard navigation ---------- */
  function visibleButtons() {
    return buttons.filter(function (b) {
      return !b.closest("[data-item]").hidden;
    });
  }

  list.addEventListener("keydown", function (e) {
    var current = document.activeElement;
    if (!current || !current.classList || !current.classList.contains("faq__q")) return;

    var vis = visibleButtons();
    var idx = vis.indexOf(current);
    if (idx === -1) return;

    var next = null;
    switch (e.key) {
      case "ArrowDown":
        next = vis[idx + 1] || vis[0];
        break;
      case "ArrowUp":
        next = vis[idx - 1] || vis[vis.length - 1];
        break;
      case "Home":
        next = vis[0];
        break;
      case "End":
        next = vis[vis.length - 1];
        break;
      default:
        return;
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  });

  /* ---------- Live search ---------- */
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(el, text, query) {
    if (!el) return;
    if (!query) {
      el.textContent = text;
      return;
    }
    var re = new RegExp("(" + escapeRegExp(query) + ")", "ig");
    el.innerHTML = text.replace(re, "<mark>$1</mark>");
  }

  function filter(rawQuery) {
    var query = rawQuery.trim().toLowerCase();
    var matches = 0;

    items.forEach(function (item) {
      var hay = (item._qText + " " + item._aText).toLowerCase();
      var hit = query === "" || hay.indexOf(query) !== -1;
      item.hidden = !hit;
      if (hit) {
        matches++;
        highlight(item._qEl, item._qText, query);
        highlight(item._aEl, item._aText, query);
      } else {
        // collapse hidden items to keep state tidy
        setOpen(item, false);
      }
    });

    // Hide groups with no visible items.
    groups.forEach(function (group) {
      var anyVisible = group.querySelector("[data-item]:not([hidden])");
      group.hidden = !anyVisible;
    });

    // Empty state + count.
    if (emptyEl) emptyEl.hidden = matches !== 0;
    if (countEl) {
      if (query === "") {
        countEl.textContent = "";
      } else if (matches === 0) {
        countEl.textContent = "No matching questions.";
      } else {
        countEl.textContent =
          matches + (matches === 1 ? " question matches" : " questions match") + ' "' + rawQuery.trim() + '"';
      }
    }

    if (clearBtn) clearBtn.hidden = query === "";
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filter(searchInput.value);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      filter("");
      searchInput.focus();
    });
  }
})();
