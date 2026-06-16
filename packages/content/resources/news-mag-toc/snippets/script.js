(function () {
  "use strict";

  var doc = document;

  /* ---------- Toast helper ---------- */
  var toastEl = doc.querySelector(".toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 220);
    }, 2200);
  }

  /* ---------- State ---------- */
  var currentFilter = "all";
  var currentQuery = "";

  var blocks = Array.prototype.slice.call(doc.querySelectorAll(".block"));
  var entries = Array.prototype.slice.call(doc.querySelectorAll(".entry"));
  var coverFeature = doc.querySelector(".cover-feature");
  var noResults = doc.querySelector(".no-results");
  var noResultsTerm = noResults ? noResults.querySelector(".no-results__term") : null;

  function entryText(entry) {
    var title = entry.querySelector(".entry__title");
    var dek = entry.querySelector(".entry__dek");
    var author = entry.querySelector(".entry__author");
    return [
      title ? title.textContent : "",
      dek ? dek.textContent : "",
      author ? author.textContent : ""
    ]
      .join(" ")
      .toLowerCase();
  }

  function applyState() {
    var q = currentQuery.trim().toLowerCase();
    var totalVisible = 0;

    blocks.forEach(function (block) {
      var section = block.getAttribute("data-section");
      var sectionMatch = currentFilter === "all" || currentFilter === section;
      var visibleInBlock = 0;

      var blockEntries = block.querySelectorAll(".entry");
      Array.prototype.forEach.call(blockEntries, function (entry) {
        var queryMatch = q === "" || entryText(entry).indexOf(q) !== -1;
        var show = sectionMatch && queryMatch;
        entry.hidden = !show;
        if (show) {
          visibleInBlock++;
          totalVisible++;
        }
      });

      block.classList.toggle("is-empty", visibleInBlock === 0);
    });

    // Cover feature only shows under "all" or "features", and respects search.
    if (coverFeature) {
      var section = coverFeature.getAttribute("data-section");
      var sectionMatch = currentFilter === "all" || currentFilter === section;
      var coverTitle = coverFeature.querySelector(".cover-feature__title");
      var coverText = (coverTitle ? coverTitle.textContent : "").toLowerCase();
      var queryMatch = q === "" || coverText.indexOf(q) !== -1;
      coverFeature.hidden = !(sectionMatch && queryMatch);
      if (sectionMatch && queryMatch) totalVisible++;
    }

    if (noResults) {
      var none = totalVisible === 0;
      noResults.hidden = !none;
      if (none && noResultsTerm) {
        noResultsTerm.textContent = q ? "“" + currentQuery.trim() + "”" : "this filter";
      }
    }
  }

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(doc.querySelectorAll(".tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      currentFilter = tab.getAttribute("data-filter") || "all";
      applyState();
      var label = tab.textContent.trim();
      toast(currentFilter === "all" ? "Showing the full issue" : "Filtered to " + label);
    });
  });

  /* ---------- Search ---------- */
  var searchInput = doc.getElementById("toc-search");
  if (searchInput) {
    var debounce = null;
    searchInput.addEventListener("input", function () {
      currentQuery = searchInput.value;
      clearTimeout(debounce);
      debounce = setTimeout(applyState, 90);
    });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        searchInput.value = "";
        currentQuery = "";
        applyState();
      }
    });
  }

  /* ---------- Hover preview ---------- */
  var preview = doc.querySelector(".preview");
  var previewThumb = preview ? preview.querySelector("[data-thumb-target]") : null;
  var previewLabel = preview ? preview.querySelector("[data-label-target]") : null;
  var lastThumbClass = "";

  function showPreview(entry, x, y) {
    if (!preview || !previewThumb) return;
    var thumbKey = entry.getAttribute("data-thumb");
    var title = entry.getAttribute("data-title") || "";

    if (lastThumbClass) previewThumb.classList.remove(lastThumbClass);
    previewThumb.classList.remove("press-photo");
    previewThumb.classList.add("press-photo");
    lastThumbClass = "thumb-" + thumbKey;
    previewThumb.classList.add(lastThumbClass);

    if (previewLabel) previewLabel.textContent = title;

    preview.hidden = false;
    positionPreview(x, y);
  }

  function positionPreview(x, y) {
    if (!preview || preview.hidden) return;
    var w = preview.offsetWidth || 180;
    var margin = 16;
    var left = x + 20;
    if (left + w + margin > window.innerWidth) {
      left = x - w - 20;
    }
    if (left < margin) left = margin;
    var top = Math.max(margin + 40, Math.min(y, window.innerHeight - margin));
    preview.style.left = left + "px";
    preview.style.top = top + "px";
  }

  function hidePreview() {
    if (preview) preview.hidden = true;
  }

  entries.forEach(function (entry) {
    entry.addEventListener("mouseenter", function (e) {
      showPreview(entry, e.clientX, e.clientY);
    });
    entry.addEventListener("mousemove", function (e) {
      positionPreview(e.clientX, e.clientY);
    });
    entry.addEventListener("mouseleave", hidePreview);

    // Keyboard: open a "page" via Enter, with preview on focus
    entry.addEventListener("focus", function () {
      var rect = entry.getBoundingClientRect();
      showPreview(entry, rect.right, rect.top + rect.height / 2);
    });
    entry.addEventListener("blur", hidePreview);
    entry.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var folio = entry.querySelector(".entry__folio");
        var title = entry.getAttribute("data-title") || "this story";
        toast("Turn to p. " + (folio ? folio.textContent : "—") + " — " + title);
      }
    });
    entry.addEventListener("click", function () {
      var folio = entry.querySelector(".entry__folio");
      var title = entry.getAttribute("data-title") || "this story";
      toast("Turn to p. " + (folio ? folio.textContent : "—") + " — " + title);
    });
  });

  // Hide preview on scroll to avoid stale floating thumb
  window.addEventListener("scroll", hidePreview, { passive: true });

  /* ---------- Init ---------- */
  applyState();
})();
