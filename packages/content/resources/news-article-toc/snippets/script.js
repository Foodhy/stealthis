(function () {
  "use strict";

  var doc = document;
  var sections = Array.prototype.slice.call(doc.querySelectorAll(".sec"));
  var tocLinks = Array.prototype.slice.call(doc.querySelectorAll("[data-toc]"));
  var progressBar = doc.getElementById("progressBar");
  var tocMeter = doc.getElementById("tocMeter");
  var readNote = doc.getElementById("readNote");
  var toTop = doc.getElementById("toTop");
  var toastEl = doc.getElementById("toast");
  var article = doc.querySelector(".article");

  /* ---- map section id -> toc link ---- */
  var linkById = {};
  tocLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    linkById[id] = a;
    a.addEventListener("click", function (e) {
      var target = doc.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // move focus for accessibility without scroll-jumping
      window.setTimeout(function () {
        target.focus({ preventScroll: true });
      }, 420);
      history.replaceState(null, "", "#" + id);
    });
  });

  /* ---- toast helper ---- */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---- active-section tracking via IntersectionObserver ---- */
  var visible = {};
  var titles = {};
  sections.forEach(function (s) {
    var link = linkById[s.id];
    titles[s.id] = link ? link.textContent.trim() : "";
  });

  function setActive(id) {
    tocLinks.forEach(function (a) {
      a.classList.toggle(
        "is-active",
        a.getAttribute("href") === "#" + id
      );
      if (a.getAttribute("href") === "#" + id) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  function pickActive() {
    // choose the topmost section currently intersecting; fall back to last passed
    var current = null;
    var best = Infinity;
    sections.forEach(function (s) {
      if (!visible[s.id]) return;
      var top = s.getBoundingClientRect().top;
      if (top < best) {
        best = top;
        current = s.id;
      }
    });
    if (!current) {
      // none intersecting: pick last section above the fold
      for (var i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top < 120) {
          current = sections[i].id;
          break;
        }
      }
    }
    if (current) setActive(current);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          visible[en.target.id] = en.isIntersecting;
        });
        pickActive();
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  /* ---- reading progress + meter + back-to-top ---- */
  var ticking = false;
  function update() {
    ticking = false;
    var docEl = doc.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop;
    var max = (docEl.scrollHeight || doc.body.scrollHeight) - window.innerHeight;
    var pct = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

    if (progressBar) progressBar.style.width = (pct * 100).toFixed(2) + "%";

    // article-scoped meter: how far through the article body
    if (tocMeter && article) {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.4;
      var passed = -rect.top + window.innerHeight * 0.4;
      var aPct = total > 0 ? Math.min(1, Math.max(0, passed / total)) : 0;
      tocMeter.style.width = (aPct * 100).toFixed(2) + "%";

      if (readNote) {
        if (aPct <= 0.01) readNote.textContent = "Start of article · 14 min read";
        else if (aPct >= 0.99) readNote.textContent = "Article complete";
        else
          readNote.textContent =
            Math.round(aPct * 100) + "% read · ~" +
            Math.max(1, Math.round((1 - aPct) * 14)) +
            " min left";
      }
    }

    if (toTop) {
      if (scrollTop > 600) toTop.hidden = false;
      else toTop.hidden = true;
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ---- back to top ---- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      var first = doc.getElementById("top");
      if (first) {
        window.setTimeout(function () {
          toast("Back to the top of the page");
        }, 200);
      }
    });
  }

  /* ---- deep-link on load ---- */
  if (location.hash && linkById[location.hash.slice(1)]) {
    var t = doc.getElementById(location.hash.slice(1));
    if (t) {
      window.setTimeout(function () {
        t.scrollIntoView({ behavior: "auto", block: "start" });
      }, 0);
    }
  }

  update();
})();
