(function () {
  "use strict";

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

  /* ---------- theme toggle (persists) ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  var STORE_KEY = "auroradb-docs-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
  }

  try {
    var saved = localStorage.getItem(STORE_KEY);
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    }
  } catch (e) {
    /* ignore */
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORE_KEY, next);
      } catch (e) {}
      toast(next === "dark" ? "Dark theme on" : "Light theme on");
    });
  }

  /* ---------- language tabs ---------- */
  document.querySelectorAll("[data-lang-block]").forEach(function (block) {
    var tabs = block.querySelectorAll(".code-tab");
    var panes = block.querySelectorAll(".code");

    function select(lang) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-lang") === lang;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panes.forEach(function (p) {
        p.hidden = p.getAttribute("data-lang") !== lang;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        select(tab.getAttribute("data-lang"));
      });
    });
  });

  /* ---------- copy buttons ---------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest("[data-lang-block]");
      if (!block) return;
      var active = block.querySelector(".code:not([hidden])");
      if (!active) return;
      var text = active.innerText.replace(/\n+$/, "");

      var done = function () {
        btn.classList.add("copied");
        var label = btn.querySelector(".copy-label");
        var orig = label ? label.textContent : "";
        if (label) label.textContent = "Copied!";
        toast("Copied to clipboard");
        setTimeout(function () {
          btn.classList.remove("copied");
          if (label) label.textContent = orig;
        }, 1500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {
          toast("Copy failed");
        }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- nav tree collapse ---------- */
  document.querySelectorAll(".nav-tree .nav-branch").forEach(function (branch) {
    branch.addEventListener("click", function () {
      var tree = branch.closest(".nav-tree");
      var open = tree.getAttribute("data-open") === "true";
      tree.setAttribute("data-open", String(!open));
      branch.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---------- mobile sidebar drawer ---------- */
  var sidebar = document.getElementById("sidebar");
  var navToggle = document.getElementById("navToggle");
  var scrim = document.getElementById("scrim");

  function openNav() {
    sidebar.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    if (scrim) scrim.hidden = false;
  }
  function closeNav() {
    sidebar.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    if (scrim) scrim.hidden = true;
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      sidebar.classList.contains("open") ? closeNav() : openNav();
    });
  }
  if (scrim) scrim.addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeNav();
  });
  // close drawer when a nav link is chosen on mobile
  sidebar &&
    sidebar.querySelectorAll(".nav-link").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 820px)").matches) closeNav();
      });
    });

  /* ---------- search shortcut "/" ---------- */
  var searchInput = document.querySelector(".search input");
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== searchInput) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchInput && searchInput.focus();
      }
    }
  });

  /* ---------- vote buttons ---------- */
  document.querySelectorAll(".vote").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".vote").forEach(function (b) {
        b.classList.remove("picked");
      });
      btn.classList.add("picked");
      toast(btn.getAttribute("data-vote") === "up" ? "Thanks for the feedback!" : "Sorry to hear that — we'll improve it");
    });
  });

  /* ---------- TOC scrollspy ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll("[data-toc]"));
  var sections = tocLinks
    .map(function (l) {
      return document.getElementById(l.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  function setActive(id) {
    tocLinks.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = new Set();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) visible.add(en.target.id);
          else visible.delete(en.target.id);
        });
        // pick the first section in document order that is visible
        for (var i = 0; i < sections.length; i++) {
          if (visible.has(sections[i].id)) {
            setActive(sections[i].id);
            break;
          }
        }
      },
      { rootMargin: "-72px 0px -65% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
    setActive(sections[0].id);
  }

  // smooth-update active state on direct TOC click
  tocLinks.forEach(function (l) {
    l.addEventListener("click", function () {
      setActive(l.getAttribute("href").slice(1));
    });
  });
})();
