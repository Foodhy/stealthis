(() => {
  const html = document.documentElement;
  const dirToggle = document.getElementById("dir-toggle");
  const dirLabel = document.getElementById("dir-label");
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");

  /* ── Direction toggle ── */
  dirToggle.addEventListener("click", () => {
    const isRtl = html.getAttribute("dir") === "rtl";
    const newDir = isRtl ? "ltr" : "rtl";
    html.setAttribute("dir", newDir);
    html.setAttribute("lang", isRtl ? "en" : "ar");
    dirLabel.textContent = newDir.toUpperCase();
  });

  /* ── Dropdown menus ── */
  const triggers = document.querySelectorAll(".dropdown-trigger");

  function closeAllDropdowns(except) {
    triggers.forEach((t) => {
      if (t !== except) {
        t.setAttribute("aria-expanded", "false");
        const id = t.getAttribute("data-dropdown");
        const menu = document.getElementById("dropdown-" + id);
        if (menu) menu.classList.remove("open");
      }
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = trigger.getAttribute("data-dropdown");
      const menu = document.getElementById("dropdown-" + id);
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      closeAllDropdowns(trigger);

      trigger.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("open", !isOpen);
    });
  });

  /* Close dropdowns on outside click */
  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  /* Prevent dropdown content clicks from closing */
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    menu.addEventListener("click", (e) => e.stopPropagation());
  });

  /* ── Mobile menu ── */
  function closeMobileMenu() {
    navMenu.classList.remove("open");
    mobileToggle.classList.remove("active");
    var backdrop = document.getElementById("mobile-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  }

  mobileToggle.addEventListener("click", () => {
    const opening = !navMenu.classList.contains("open");
    navMenu.classList.toggle("open", opening);
    mobileToggle.classList.toggle("active", opening);
    var backdrop = document.getElementById("mobile-backdrop");
    if (backdrop) backdrop.classList.toggle("active", opening);
  });

  /* Backdrop click closes menu */
  var backdrop = document.getElementById("mobile-backdrop");
  if (backdrop) backdrop.addEventListener("click", closeMobileMenu);

  /* Close mobile menu on resize */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });
})();
