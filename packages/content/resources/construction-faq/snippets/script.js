(function () {
  "use strict";

  var root = document.getElementById("faq-root");
  var triggers = Array.prototype.slice.call(root.querySelectorAll(".trigger"));
  var items = Array.prototype.slice.call(root.querySelectorAll("[data-item]"));
  var groups = Array.prototype.slice.call(root.querySelectorAll("[data-group]"));
  var searchInput = document.getElementById("faq-search");
  var clearBtn = document.getElementById("faq-clear");
  var countEl = document.getElementById("faq-count");
  var emptyEl = document.getElementById("faq-empty");
  var emptyTerm = document.getElementById("empty-term");
  var emptyReset = document.getElementById("empty-reset");
  var total = items.length;

  /* ---------- Accordion toggle ---------- */
  function setOpen(trigger, open) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) {
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var open = trigger.getAttribute("aria-expanded") === "true";
      setOpen(trigger, !open);
    });
  });

  /* ---------- Keyboard navigation ---------- */
  function visibleTriggers() {
    return triggers.filter(function (t) {
      return !t.closest("[data-item]").classList.contains("is-hidden");
    });
  }

  root.addEventListener("keydown", function (e) {
    var current = e.target.closest(".trigger");
    if (!current) return;
    var list = visibleTriggers();
    var i = list.indexOf(current);
    if (i === -1) return;
    var next = null;

    switch (e.key) {
      case "ArrowDown":
        next = list[(i + 1) % list.length];
        break;
      case "ArrowUp":
        next = list[(i - 1 + list.length) % list.length];
        break;
      case "Home":
        next = list[0];
        break;
      case "End":
        next = list[list.length - 1];
        break;
      default:
        return;
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  });

  /* ---------- Search / filter ---------- */
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function clearHighlights(el) {
    var marks = el.querySelectorAll("mark");
    marks.forEach(function (m) {
      var parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  function highlight(el, term) {
    if (!term) return;
    var re = new RegExp("(" + escapeRegExp(term) + ")", "ig");
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (re.test(node.nodeValue)) nodes.push(node);
    }
    nodes.forEach(function (textNode) {
      var span = document.createElement("span");
      span.innerHTML = textNode.nodeValue.replace(re, "<mark>$1</mark>");
      textNode.parentNode.replaceChild(span, textNode);
      while (span.firstChild) span.parentNode.insertBefore(span.firstChild, span);
      span.parentNode.removeChild(span);
    });
  }

  function applySearch(raw) {
    var term = raw.trim().toLowerCase();
    var matches = 0;

    items.forEach(function (item) {
      clearHighlights(item);
      var text = item.textContent.toLowerCase();
      var hit = term === "" || text.indexOf(term) !== -1;
      item.classList.toggle("is-hidden", !hit);
      if (hit) {
        matches++;
        if (term) highlight(item, term);
      }
    });

    // Hide group headers that have no visible items
    groups.forEach(function (group) {
      var anyVisible = group.querySelector("[data-item]:not(.is-hidden)");
      group.classList.toggle("is-hidden", !anyVisible);
    });

    // Empty state + counts
    var hasTerm = term !== "";
    clearBtn.hidden = !hasTerm;

    if (matches === 0) {
      emptyTerm.textContent = raw.trim();
      emptyEl.hidden = false;
      countEl.textContent = "No questions match your search";
    } else {
      emptyEl.hidden = true;
      countEl.textContent = hasTerm
        ? matches + " of " + total + " questions match"
        : total + " questions";
    }
  }

  searchInput.addEventListener("input", function () {
    applySearch(searchInput.value);
  });

  function resetSearch() {
    searchInput.value = "";
    applySearch("");
    searchInput.focus();
  }

  clearBtn.addEventListener("click", resetSearch);
  emptyReset.addEventListener("click", resetSearch);

  // Init
  applySearch("");
})();
