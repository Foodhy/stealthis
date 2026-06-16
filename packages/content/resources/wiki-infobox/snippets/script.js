(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- collapsible infobox sections ---------- */
  var sections = document.querySelectorAll("[data-section]");
  sections.forEach(function (section) {
    var head = section.querySelector(".ib-section-head");
    var rows = section.querySelector(".ib-rows");
    if (!head || !rows) return;

    // establish a measurable max-height for smooth transitions
    function setOpenHeight() {
      if (!section.classList.contains("collapsed")) {
        rows.style.maxHeight = rows.scrollHeight + "px";
      }
    }
    setOpenHeight();

    head.addEventListener("click", function () {
      var collapsed = section.classList.toggle("collapsed");
      head.setAttribute("aria-expanded", String(!collapsed));
      if (collapsed) {
        rows.style.maxHeight = rows.scrollHeight + "px";
        // force reflow then collapse
        void rows.offsetHeight;
        rows.style.maxHeight = "0px";
      } else {
        rows.style.maxHeight = rows.scrollHeight + "px";
      }
    });

    // after content/height changes (e.g. show-more), recalc open height
    section._recalc = setOpenHeight;
  });

  /* ---------- show more / fewer fields ---------- */
  var moreBtn = document.getElementById("moreBtn");
  if (moreBtn) {
    var extras = Array.prototype.slice.call(document.querySelectorAll(".ib-extra"));
    var hiddenCount = extras.length;
    moreBtn.addEventListener("click", function () {
      var expanded = moreBtn.getAttribute("aria-expanded") === "true";
      extras.forEach(function (row) {
        row.hidden = expanded; // if currently expanded -> hide again
      });
      moreBtn.setAttribute("aria-expanded", String(!expanded));
      moreBtn.textContent = expanded
        ? "Show " + hiddenCount + " more fields"
        : "Show fewer fields";

      // recalc the height of the parent section so the transition stays correct
      var parent = moreBtn.closest("[data-section]");
      if (parent && parent._recalc) parent._recalc();
    });
  }

  /* ---------- copy permalink on title ---------- */
  var permalinkBtn = document.getElementById("permalinkBtn");
  if (permalinkBtn) {
    permalinkBtn.addEventListener("click", function () {
      var base = location.href.split("#")[0];
      var url = base + "#title-heading";
      var done = function () {
        permalinkBtn.classList.add("copied");
        toast("Permalink copied to clipboard");
        setTimeout(function () {
          permalinkBtn.classList.remove("copied");
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          fallbackCopy(url, done);
        });
      } else {
        fallbackCopy(url, done);
      }
    });
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      if (cb) cb();
    } catch (e) {
      toast("Could not copy permalink");
    }
    document.body.removeChild(ta);
  }

  /* ---------- mobile sidebar drawer ---------- */
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");

  function closeNav() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    if (scrim) scrim.hidden = true;
  }
  function openNav() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    if (scrim) scrim.hidden = false;
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (sidebar.classList.contains("open")) closeNav();
      else openNav();
    });
  }
  if (scrim) scrim.addEventListener("click", closeNav);
  if (sidebar) {
    sidebar.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.matchMedia("(max-width: 820px)").matches) {
        closeNav();
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- "/" focuses search ---------- */
  var searchInput = document.querySelector(".topbar-search input");
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== searchInput) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    }
  });
})();
