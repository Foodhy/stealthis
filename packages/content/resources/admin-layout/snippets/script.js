(() => {
  const sidebar = document.getElementById("sidebar");
  const mainArea = document.getElementById("mainArea");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const collapseBtn = document.getElementById("collapseBtn");
  const overlay = document.getElementById("sidebarOverlay");
  const pageTitle = document.getElementById("pageTitle");
  const navItems = document.querySelectorAll(".nav-item");

  const isMobile = () => window.innerWidth <= 768;

  // ── Desktop: collapse sidebar to icon-only ──
  collapseBtn.addEventListener("click", () => {
    if (isMobile()) return;
    sidebar.classList.toggle("collapsed");
  });

  // ── Hamburger: desktop collapse / mobile open ──
  hamburgerBtn.addEventListener("click", () => {
    if (isMobile()) {
      sidebar.classList.toggle("mobile-open");
      overlay.classList.toggle("active");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });

  // ── Close sidebar when overlay is clicked (mobile) ──
  overlay.addEventListener("click", closeMobileSidebar);

  function closeMobileSidebar() {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("active");
  }

  // ── Active nav item + content panel swap ──
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const label = item.getAttribute("data-label");
      if (label) pageTitle.textContent = label;

      // Swap content panels
      document.querySelectorAll(".page-content").forEach((p) => p.classList.remove("active"));
      const page = document.getElementById(`page-${label}`);
      if (page) page.classList.add("active");

      if (isMobile()) closeMobileSidebar();
    });
  });

  // ── Reset mobile state on resize ──
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile()) {
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("active");
      }
    }, 100);
  });
})();
