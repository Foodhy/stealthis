(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
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

  /* ---------- Scroll spy: highlight active TOC link + reading progress ---------- */
  var tocLinks = Array.prototype.slice.call(
    document.querySelectorAll("#tocList a")
  );
  var sections = tocLinks
    .map(function (a) {
      return document.getElementById(a.getAttribute("data-target"));
    })
    .filter(Boolean);
  var progressFill = document.getElementById("progressFill");

  function onScroll() {
    var scrollPos = window.scrollY + 120;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollPos) current = sections[i];
    }
    tocLinks.forEach(function (a) {
      a.classList.toggle(
        "active",
        current && a.getAttribute("data-target") === current.id
      );
    });

    if (progressFill) {
      var docH =
        document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      progressFill.style.width = Math.min(100, Math.max(0, pct)) + "%";
    }
  }
  var rafPending = false;
  window.addEventListener(
    "scroll",
    function () {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        onScroll();
        rafPending = false;
      });
    },
    { passive: true }
  );
  onScroll();

  /* ---------- Taxonomy figure -> section linking ---------- */
  var famToSection = {
    spectral: "spectral",
    graph: "graph",
    attn: "transformer",
  };
  var taxCols = Array.prototype.slice.call(
    document.querySelectorAll(".tax-col")
  );

  function clearLit() {
    taxCols.forEach(function (c) {
      c.classList.remove("lit");
    });
    document.querySelectorAll(".section.lit-target").forEach(function (s) {
      s.classList.remove("lit-target");
    });
  }

  taxCols.forEach(function (col) {
    col.setAttribute("tabindex", "0");
    col.setAttribute("role", "button");
    var fam = col.getAttribute("data-fam");
    var label = col.querySelector(".tax-head").textContent;
    col.setAttribute("aria-label", "Jump to " + label + " section");

    function activate() {
      clearLit();
      col.classList.add("lit");
      var sec = document.getElementById(famToSection[fam]);
      if (sec) {
        sec.classList.add("lit-target");
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("Jumped to " + label + " operators");
      }
    }
    col.addEventListener("click", activate);
    col.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  var resetTax = document.getElementById("resetTax");
  if (resetTax) {
    resetTax.addEventListener("click", function () {
      clearLit();
      toast("Figure highlight cleared");
    });
  }

  /* ---------- Sortable overview table ---------- */
  var table = document.getElementById("overviewTable");
  if (table) {
    var tbody = table.tBodies[0];
    var headers = Array.prototype.slice.call(
      table.querySelectorAll("th.sortable")
    );
    var sortState = {};

    headers.forEach(function (th) {
      th.setAttribute("tabindex", "0");
      th.setAttribute("role", "button");
      function doSort() {
        var key = th.getAttribute("data-key");
        var asc = sortState[key] !== "asc";
        sortState = {};
        sortState[key] = asc ? "asc" : "desc";

        headers.forEach(function (h) {
          h.classList.remove("sorted-asc", "sorted-desc");
        });
        th.classList.add(asc ? "sorted-asc" : "sorted-desc");

        var rows = Array.prototype.slice.call(tbody.rows);
        rows.sort(function (a, b) {
          var av = a.getAttribute("data-" + key);
          var bv = b.getAttribute("data-" + key);
          var an = parseFloat(av);
          var bn = parseFloat(bv);
          var cmp;
          if (!isNaN(an) && !isNaN(bn)) cmp = an - bn;
          else cmp = String(av).localeCompare(String(bv));
          return asc ? cmp : -cmp;
        });
        rows.forEach(function (r) {
          tbody.appendChild(r);
        });
        toast(
          "Sorted by " +
            th.textContent.replace(/\s+/g, " ").trim() +
            (asc ? " (asc)" : " (desc)")
        );
      }
      th.addEventListener("click", doSort);
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          doSort();
        }
      });
    });
  }

  /* ---------- Collapsible references ---------- */
  var toggleRefs = document.getElementById("toggleRefs");
  var refList = document.getElementById("refList");
  if (toggleRefs && refList) {
    toggleRefs.addEventListener("click", function () {
      var open = refList.hasAttribute("hidden");
      if (open) {
        refList.removeAttribute("hidden");
        toggleRefs.setAttribute("aria-expanded", "true");
        toggleRefs.firstChild.textContent = "Hide references ";
      } else {
        refList.setAttribute("hidden", "");
        toggleRefs.setAttribute("aria-expanded", "false");
        toggleRefs.firstChild.textContent = "Show references ";
      }
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
