(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  /* ---------- build the TOC from article headings ---------- */
  var article = document.querySelector(".prose");
  var tocNav = document.getElementById("tocNav");
  var headings = article
    ? Array.prototype.slice.call(article.querySelectorAll("section[id] h2, h3[id]"))
    : [];

  // Map each heading to its TOC link
  var linkFor = {};
  headings.forEach(function (h) {
    var id = h.id || (h.closest("section") && h.closest("section").id);
    if (!id) return;
    if (!h.id) h.id = id;

    var label =
      h.getAttribute("data-toc") ||
      (h.closest("section") && h.closest("section").getAttribute("data-toc")) ||
      h.textContent.trim();

    var a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = label;
    a.setAttribute("data-target", id);
    if (h.tagName === "H3") a.classList.add("sub");
    tocNav.appendChild(a);
    linkFor[id] = a;
  });

  /* ---------- smooth-scroll + focus on TOC click ---------- */
  function goTo(id, announce) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    // move focus for accessibility without an extra visible jump
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (announce) {
      var lbl = linkFor[id] ? linkFor[id].textContent : id;
      toast("Jumped to “" + lbl + "”");
    }
  }

  tocNav.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-target]");
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute("data-target");
    history.replaceState(null, "", "#" + id);
    goTo(id, true);
  });

  /* ---------- scrollspy via IntersectionObserver ---------- */
  var activeId = null;
  var visible = new Map();

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    Object.keys(linkFor).forEach(function (key) {
      linkFor[key].classList.toggle("active", key === id);
    });
    var link = linkFor[id];
    if (link) {
      link.setAttribute("aria-current", "true");
      // keep the active TOC entry visible within the (scrollable) TOC nav
      var top = link.offsetTop;
      var nav = tocNav;
      if (top < nav.scrollTop || top > nav.scrollTop + nav.clientHeight - 28) {
        nav.scrollTo({
          top: Math.max(0, top - nav.clientHeight / 2),
          behavior: prefersReduced ? "auto" : "smooth",
        });
      }
    }
    Object.keys(linkFor).forEach(function (key) {
      if (key !== id) linkFor[key].removeAttribute("aria-current");
    });
  }

  function pickActive() {
    if (!visible.size) return;
    // choose the visible heading nearest the top of the viewport
    var best = null;
    var bestTop = Infinity;
    visible.forEach(function (rectTop, id) {
      if (rectTop < bestTop) {
        bestTop = rectTop;
        best = id;
      }
    });
    if (best) setActive(best);
  }

  if ("IntersectionObserver" in window && headings.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id =
            entry.target.id ||
            (entry.target.closest("section") && entry.target.closest("section").id);
          if (!id) return;
          if (entry.isIntersecting) {
            visible.set(id, entry.boundingClientRect.top);
          } else {
            visible.delete(id);
          }
        });
        pickActive();
      },
      {
        // activation band: a bit below the sticky header, well above the fold
        rootMargin: "-78px 0px -65% 0px",
        threshold: 0,
      }
    );
    headings.forEach(function (h) {
      spy.observe(h);
    });
  }

  /* ---------- reading progress (top bar + TOC meter) ---------- */
  var readingFill = document.getElementById("readingFill");
  var tocFill = document.getElementById("tocFill");
  var tocTop = document.getElementById("tocTop");
  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
    if (readingFill) readingFill.style.width = pct + "%";
    if (tocFill) tocFill.style.width = pct + "%";
    if (tocTop) tocTop.classList.toggle("show", scrollTop > 600);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateProgress);
  updateProgress();

  if (tocTop) {
    tocTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      toast("Back to top");
    });
  }

  /* ---------- mobile nav drawer ---------- */
  var navToggle = document.getElementById("navToggle");
  var sidenav = document.getElementById("sidenav");
  var scrim = document.getElementById("scrim");

  function setNav(open) {
    if (!sidenav) return;
    sidenav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (scrim) scrim.hidden = !open;
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!sidenav.classList.contains("open"));
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setNav(false); });
  if (sidenav) {
    sidenav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
  }

  /* ---------- keyboard shortcuts ---------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var typing = tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;
    if (e.key === "Escape") setNav(false);
    if (typing || e.metaKey || e.ctrlKey || e.altKey) {
      if (e.key === "/" && !typing) {
        e.preventDefault();
        var s = document.querySelector(".topsearch input");
        if (s) s.focus();
      }
      return;
    }
    if (e.key === "/") {
      e.preventDefault();
      var search = document.querySelector(".topsearch input");
      if (search) search.focus();
    } else if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      toast("Back to top");
    }
  });

  /* ---------- honor an incoming hash on load ---------- */
  if (location.hash) {
    var initial = location.hash.slice(1);
    if (document.getElementById(initial)) {
      requestAnimationFrame(function () { goTo(initial, false); });
    }
  }
})();
