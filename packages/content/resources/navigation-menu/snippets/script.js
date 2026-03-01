(function () {
  "use strict";

  const trigger    = document.getElementById("products-trigger");
  const megaMenu   = document.getElementById("mega-menu");
  const indicator  = document.getElementById("nav-indicator");
  const navItems   = document.getElementById("nav-items");
  const hamburger  = document.getElementById("hamburger");
  const mobileNav  = document.getElementById("mobile-nav");
  const navbar     = document.getElementById("navbar");

  let megaOpen = false;
  let mobileOpen = false;

  // ── Mega-menu ───────────────────────────────────────────────────────────────

  function openMega() {
    megaOpen = true;
    megaMenu.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMega() {
    megaOpen = false;
    megaMenu.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", function () {
    megaOpen ? closeMega() : openMega();
  });

  trigger.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      megaOpen ? closeMega() : openMega();
    }
    if (e.key === "Escape") closeMega();
  });

  // Close on outside click
  document.addEventListener("click", function (e) {
    if (!navbar.contains(e.target)) {
      closeMega();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMega();
      if (mobileOpen) toggleMobile();
    }
  });

  // ── Animated underline indicator ─────────────────────────────────────────────

  function moveIndicator(el) {
    if (!el || !navItems) return;
    const navRect  = navItems.getBoundingClientRect();
    const elRect   = el.getBoundingClientRect();
    indicator.style.left    = (elRect.left - navRect.left) + "px";
    indicator.style.width   = elRect.width + "px";
    indicator.style.opacity = "1";
  }

  function hideIndicator() {
    // Keep it under the active item
    const active = navItems.querySelector(".nav-link--active");
    if (active) {
      moveIndicator(active);
    } else {
      indicator.style.opacity = "0";
    }
  }

  // Hover behaviour for all nav links + trigger
  const allNavEls = Array.from(navItems.querySelectorAll(".nav-link, .nav-link--trigger"));
  allNavEls.forEach(function (el) {
    el.addEventListener("mouseenter", function () { moveIndicator(el); });
    el.addEventListener("focus",      function () { moveIndicator(el); });
  });

  navItems.addEventListener("mouseleave", hideIndicator);
  navItems.addEventListener("focusout", function (e) {
    if (!navItems.contains(e.relatedTarget)) hideIndicator();
  });

  // Init indicator under active link
  const activeLink = navItems.querySelector(".nav-link--active");
  if (activeLink) {
    // Slight delay to ensure layout is complete
    requestAnimationFrame(function () { moveIndicator(activeLink); });
  }

  // Re-position on resize
  window.addEventListener("resize", function () {
    const active = navItems.querySelector(".nav-link--active");
    if (active) moveIndicator(active);
    // Close mobile nav on widen
    if (window.innerWidth > 768 && mobileOpen) toggleMobile();
  });

  // ── Mobile hamburger ─────────────────────────────────────────────────────────

  function toggleMobile() {
    mobileOpen = !mobileOpen;
    hamburger.classList.toggle("open", mobileOpen);
    hamburger.setAttribute("aria-expanded", String(mobileOpen));
    if (mobileOpen) {
      mobileNav.removeAttribute("hidden");
    } else {
      mobileNav.setAttribute("hidden", "");
    }
  }

  hamburger.addEventListener("click", toggleMobile);

})();
