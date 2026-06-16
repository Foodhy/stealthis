(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2000);
  }

  /* ---------------- Breadcrumb collapse on narrow widths ---------------- */
  var crumbs = document.getElementById("crumbs");
  var COLLAPSE_AT = 640; // px

  function syncCollapse() {
    if (!crumbs) return;
    var narrow = window.innerWidth <= COLLAPSE_AT;
    crumbs.classList.toggle("is-collapsed", narrow);
    if (!narrow) {
      // back to wide: reset the expanded state so it re-collapses next time
      crumbs.classList.remove("is-expanded");
      var btn = crumbs.querySelector("[data-expand]");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  }
  syncCollapse();
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncCollapse, 120);
  });

  /* The "…" expander reveals the hidden middle crumbs */
  var expandBtn = crumbs ? crumbs.querySelector("[data-expand]") : null;
  if (expandBtn) {
    expandBtn.addEventListener("click", function () {
      crumbs.classList.add("is-expanded");
      expandBtn.setAttribute("aria-expanded", "true");
      // move focus to the first revealed crumb link for keyboard users
      var revealed = crumbs.querySelector(".crumb-hide a");
      if (revealed) revealed.focus();
      toast("Showing full breadcrumb trail");
    });
  }

  /* ---------------- Sibling-switch dropdown ---------------- */
  var menuBtn = document.querySelector("[data-menu]");
  var menuList = document.querySelector("[data-menu-list]");

  if (menuBtn && menuList) {
    var menuItems = Array.prototype.slice.call(
      menuList.querySelectorAll('[role="menuitem"]')
    );

    function openMenu() {
      menuList.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      document.addEventListener("click", onDocClick, true);
      document.addEventListener("keydown", onMenuKey);
    }

    function closeMenu(focusBtn) {
      menuList.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onMenuKey);
      menuItems.forEach(function (i) { i.tabIndex = -1; });
      if (focusBtn) menuBtn.focus();
    }

    function isOpen() {
      return menuBtn.getAttribute("aria-expanded") === "true";
    }

    function focusItem(idx) {
      if (idx < 0) idx = menuItems.length - 1;
      if (idx >= menuItems.length) idx = 0;
      menuItems.forEach(function (i) { i.tabIndex = -1; });
      menuItems[idx].tabIndex = 0;
      menuItems[idx].focus();
    }

    function onDocClick(e) {
      if (!menuList.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu(false);
      }
    }

    function onMenuKey(e) {
      if (menuList.hidden) return;
      var current = menuItems.indexOf(document.activeElement);
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusItem(current < 0 ? 0 : current + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusItem(current < 0 ? menuItems.length - 1 : current - 1);
          break;
        case "Home":
          e.preventDefault();
          focusItem(0);
          break;
        case "End":
          e.preventDefault();
          focusItem(menuItems.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          closeMenu(true);
          break;
        case "Tab":
          closeMenu(false);
          break;
      }
    }

    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isOpen()) {
        closeMenu(false);
      } else {
        openMenu();
        focusItem(0);
      }
    });

    menuBtn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen()) openMenu();
        focusItem(0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen()) openMenu();
        focusItem(menuItems.length - 1);
      }
    });

    menuItems.forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        var label = item.textContent.trim();
        // update active marker + the visible current-crumb label
        menuItems.forEach(function (i) {
          i.classList.remove("is-active");
          i.removeAttribute("aria-current");
        });
        item.classList.add("is-active");
        item.setAttribute("aria-current", "true");
        var labelEl = menuBtn.querySelector(".crumb-current-label");
        if (labelEl) labelEl.textContent = label;
        closeMenu(true);
        toast("Switched to “" + label + "”");
      });
    });
  }

  /* ---------------- Prev / next + related: intercept demo links ---------------- */
  document.querySelectorAll(".pager-link, .related-item a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var t =
        link.querySelector(".pager-title, .related-name");
      toast("Navigating to “" + (t ? t.textContent.trim() : "page") + "”");
    });
  });

  /* ---------------- Scroll-spy for the right-rail TOC ---------------- */
  var tocLinks = Array.prototype.slice.call(
    document.querySelectorAll(".toc-list a")
  );
  var sections = tocLinks
    .map(function (l) {
      return document.getElementById(l.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            tocLinks.forEach(function (l) {
              l.classList.toggle(
                "is-active",
                l.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
