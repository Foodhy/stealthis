(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------- mobile sidebar drawer ---------- */
  var sidebar = document.getElementById("sidebar");
  var navToggle = document.getElementById("navToggle");
  var scrim = document.getElementById("scrim");

  function setDrawer(open) {
    sidebar.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (scrim) scrim.hidden = !open;
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setDrawer(!sidebar.classList.contains("is-open"));
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) setDrawer(false);
  });
  // close drawer when a nav link is followed on mobile
  sidebar.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#']");
    if (a && window.matchMedia("(max-width:820px)").matches) setDrawer(false);
  });

  /* ---------- sidebar search filter ---------- */
  var navSearch = document.getElementById("navSearch");
  var navItems = Array.prototype.slice.call(document.querySelectorAll("[data-nav-item]"));
  var navGroups = Array.prototype.slice.call(document.querySelectorAll("[data-nav-group]"));
  var navEmpty = document.querySelector("[data-nav-empty]");

  function filterNav() {
    var q = navSearch.value.trim().toLowerCase();
    var anyVisible = false;
    navItems.forEach(function (item) {
      var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
      item.parentElement.style.display = match ? "" : "none";
      if (match) anyVisible = true;
    });
    // hide groups whose items are all hidden
    navGroups.forEach(function (g) {
      var visible = g.querySelectorAll("[data-nav-item]");
      var shown = 0;
      visible.forEach
        ? visible.forEach(check)
        : Array.prototype.forEach.call(visible, check);
      function check(it) { if (it.parentElement.style.display !== "none") shown++; }
      g.style.display = (q && shown === 0) ? "none" : "";
    });
    if (navEmpty) navEmpty.hidden = !(q && !anyVisible);
  }
  if (navSearch) navSearch.addEventListener("input", filterNav);

  // "/" focuses search
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== navSearch &&
        !/^(input|textarea)$/i.test((document.activeElement || {}).tagName || "")) {
      e.preventDefault();
      navSearch.focus();
    }
  });

  /* ---------- infobox collapse ---------- */
  document.querySelectorAll(".infobox__header").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---------- decorative [edit] links ---------- */
  document.querySelectorAll("[data-edit]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var heading = el.closest(".h2, .h3");
      var name = heading ? heading.textContent.replace("[edit]", "").trim() : "section";
      toast('Editing “' + name + '” — read-only demo');
    });
  });

  /* ---------- smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
      if (typeof target.focus === "function") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- back to top ---------- */
  var backTop = document.getElementById("backTop");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      var title = document.getElementById("article-title");
      if (title) { title.setAttribute("tabindex", "-1"); title.focus({ preventScroll: true }); }
    });
  }

  /* ---------- TOC scrollspy ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll("[data-toc]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[href^='#']"));
  var sections = tocLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    tocLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
    });
    navLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.set(en.target.id, en.intersectionRatio);
        else visible.delete(en.target.id);
      });
      var best = null, bestRatio = -1;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; best = id; }
      });
      if (!best) {
        // fall back to the last section above the fold
        var scrollY = window.scrollY + 120;
        for (var i = sections.length - 1; i >= 0; i--) {
          if (sections[i].offsetTop <= scrollY) { best = sections[i].id; break; }
        }
      }
      if (best) setActive(best);
    }, { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (s) { io.observe(s); });
  } else {
    // fallback: scroll listener
    window.addEventListener("scroll", function () {
      var scrollY = window.scrollY + 130;
      var current = sections[0] ? sections[0].id : null;
      sections.forEach(function (s) { if (s.offsetTop <= scrollY) current = s.id; });
      if (current) setActive(current);
    }, { passive: true });
  }

  // initialize active state
  if (sections[0]) setActive(sections[0].id);
})();
