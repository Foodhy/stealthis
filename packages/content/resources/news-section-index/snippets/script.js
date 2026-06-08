(function () {
  "use strict";

  var BATCH = 4; // how many hidden teasers a "load more" click reveals

  var grid = document.getElementById("teaser-grid");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".subnav__tab"));
  var loadMoreBtn = document.getElementById("load-more");
  var remainingEl = document.getElementById("remaining-count");
  var countEl = document.getElementById("result-count");
  var leadEl = document.querySelector(".lead");
  var form = document.getElementById("news-form");
  var emailInput = document.getElementById("news-email");
  var toastEl = document.getElementById("toast");

  if (!grid) return;

  var teasers = Array.prototype.slice.call(grid.querySelectorAll(".teaser"));
  var currentFilter = "all";
  var toastTimer = null;

  /* ---------------- toast helper ---------------- */
  function toast(msg, label) {
    if (!toastEl) return;
    toastEl.innerHTML = "";
    if (label) {
      var tag = document.createElement("span");
      tag.className = "toast__accent";
      tag.textContent = label;
      toastEl.appendChild(tag);
    }
    toastEl.appendChild(document.createTextNode(msg));
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------------- matching ---------------- */
  function matchesFilter(el) {
    return currentFilter === "all" || el.getAttribute("data-region") === currentFilter;
  }

  // Teasers that match the current filter AND are not collapsed by load-more.
  function visibleMatching() {
    return teasers.filter(function (el) {
      return matchesFilter(el) && !el.classList.contains("is-hidden");
    });
  }

  // Teasers that match the filter but are still collapsed (waiting for load-more).
  function collapsedMatching() {
    return teasers.filter(function (el) {
      return matchesFilter(el) && el.classList.contains("is-hidden");
    });
  }

  function totalMatching() {
    return teasers.filter(matchesFilter);
  }

  /* ---------------- rendering ---------------- */
  function render() {
    // Show or remove each teaser based on filter; collapsed state is preserved
    // so "load more" still works inside a filtered view.
    teasers.forEach(function (el) {
      if (matchesFilter(el)) {
        el.classList.remove("is-removed");
      } else {
        el.classList.add("is-removed");
      }
    });

    var collapsed = collapsedMatching().length;
    if (collapsed > 0) {
      loadMoreBtn.removeAttribute("disabled");
      loadMoreBtn.style.display = "";
      loadMoreBtn.childNodes[0].nodeValue = "Load more stories ";
      remainingEl.textContent = "(" + collapsed + " more)";
    } else {
      loadMoreBtn.style.display = "none";
      remainingEl.textContent = "";
    }

    updateCount();
  }

  function updateCount() {
    var shown = visibleMatching().length;
    var total = totalMatching().length;
    // include the lead story in the section total when on All / its region
    var leadCounts =
      leadEl &&
      (currentFilter === "all" || leadEl.getAttribute("data-region") === currentFilter);
    var totalWithLead = total + (leadCounts ? 1 : 0);
    var shownWithLead = shown + (leadCounts ? 1 : 0);

    if (countEl) {
      var noun = totalWithLead === 1 ? "story" : "stories";
      if (shownWithLead < totalWithLead) {
        countEl.textContent = "Showing " + shownWithLead + " of " + totalWithLead + " " + noun;
      } else {
        countEl.textContent = totalWithLead + " " + noun;
      }
    }
  }

  /* ---------------- tab filtering ---------------- */
  function selectTab(tab) {
    var filter = tab.getAttribute("data-filter");
    currentFilter = filter;

    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });

    render();

    // toggle lead visibility to match the filtered view
    if (leadEl) {
      var leadVisible =
        filter === "all" || leadEl.getAttribute("data-region") === filter;
      leadEl.style.display = leadVisible ? "" : "none";
    }

    var label = tab.textContent.trim();
    var n = totalMatching().length + (leadEl && (filter === "all" || leadEl.getAttribute("data-region") === filter) ? 1 : 0);
    toast(
      n + (n === 1 ? " story" : " stories") + " in " + label,
      "Filter"
    );
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      selectTab(tab);
    });
    // keyboard arrow navigation across the tablist
    tab.addEventListener("keydown", function (e) {
      var idx = tabs.indexOf(tab);
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(idx + 1) % tabs.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        next.focus();
        selectTab(next);
      }
    });
  });

  /* ---------------- load more ---------------- */
  loadMoreBtn.addEventListener("click", function () {
    var collapsed = collapsedMatching();
    if (!collapsed.length) return;

    var slice = collapsed.slice(0, BATCH);
    slice.forEach(function (el, i) {
      el.classList.remove("is-hidden");
      // gentle entrance
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      requestAnimationFrame(function () {
        setTimeout(function () {
          el.style.transition = "opacity .3s ease, transform .3s ease";
          el.style.opacity = "1";
          el.style.transform = "none";
        }, i * 60);
      });
    });

    render();

    var left = collapsedMatching().length;
    if (left > 0) {
      toast("Loaded " + slice.length + " more · " + left + " remaining", "More");
    } else {
      toast("You're all caught up in this section.", "End");
    }
  });

  /* ---------------- newsletter form ---------------- */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (emailInput.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        emailInput.classList.add("is-error");
        emailInput.focus();
        toast("Please enter a valid email address.", "Error");
        return;
      }
      emailInput.classList.remove("is-error");
      emailInput.value = "";
      toast("Subscribed to The World Briefing.", "Done");
    });
    emailInput.addEventListener("input", function () {
      emailInput.classList.remove("is-error");
    });
  }

  /* ---------------- init ---------------- */
  render();
})();
