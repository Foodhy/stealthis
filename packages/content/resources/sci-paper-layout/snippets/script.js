(function () {
  "use strict";

  /* ---- Toast helper ---- */
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

  /* ---- Mini-TOC active-section highlighting ---- */
  var tocLinks = Array.prototype.slice.call(
    document.querySelectorAll(".toc-link")
  );
  var sectionMap = {};
  tocLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sectionMap[id] = link;
  });
  var sections = Object.keys(sectionMap).map(function (id) {
    return document.getElementById(id);
  });

  function setActive(id) {
    tocLinks.forEach(function (l) {
      l.classList.toggle(
        "active",
        l.getAttribute("href").slice(1) === id
      );
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting
            ? e.boundingClientRect.top
            : Infinity;
        });
        // pick the top-most currently-visible section
        var best = null;
        var bestTop = Infinity;
        sections.forEach(function (s) {
          var r = s.getBoundingClientRect();
          if (r.bottom > 80 && r.top < bestTop) {
            bestTop = r.top;
            best = s.id;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 1] }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  /* ---- Reading progress bar ---- */
  var bar = document.getElementById("toc-bar");
  function updateProgress() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, pct)).toFixed(1) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---- Smooth-scroll for in-page anchors (citations, refs, footnotes) ---- */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
    // re-trigger :target flash
    target.style.animation = "none";
    void target.offsetWidth;
    target.style.animation = "";
    if (a.classList.contains("cite")) {
      toast("Jumped to reference [" + (a.dataset.ref || "?") + "]");
    }
  });

  /* ---- DOI / keyword copy ---- */
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject();
  }

  var doi = document.querySelector(".rh-doi");
  if (doi) {
    doi.addEventListener("click", function (e) {
      e.preventDefault();
      var id = doi.dataset.doi || doi.textContent;
      copy(id).then(
        function () {
          toast("DOI copied: " + id);
        },
        function () {
          toast("DOI: " + id);
        }
      );
    });
  }

  /* ---- Cite / PDF buttons ---- */
  var citeBtn = document.getElementById("btn-cite");
  if (citeBtn) {
    citeBtn.addEventListener("click", function () {
      var bib =
        "Voss H.R., Aguirre M.F., Nandakumar P., Eklund T., Chen L.W. " +
        "(2026). Persistent Quantum Coherence in Strained Cryogenic " +
        "Tin–Selenide Lattices. J. Appl. Quantum Mater. 42(7), 1184–1203. " +
        "DOI 10.5281/zenodo.84217-fic";
      copy(bib).then(
        function () {
          toast("Citation copied to clipboard");
        },
        function () {
          toast("Citation ready (copy unavailable)");
        }
      );
    });
  }

  var pdfBtn = document.getElementById("btn-pdf");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", function () {
      toast("PDF export is illustrative only");
    });
  }

  /* ---- Keyword chips ---- */
  Array.prototype.forEach.call(
    document.querySelectorAll(".kw"),
    function (kw) {
      kw.addEventListener("click", function (e) {
        e.preventDefault();
        toast("Search: " + kw.textContent.trim());
      });
    }
  );
})();
