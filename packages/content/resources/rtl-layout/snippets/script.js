(() => {
  const html = document.documentElement;
  const dirToggle = document.getElementById("dir-toggle");
  const dirLabel = document.getElementById("dir-label");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const mainArea = document.querySelector(".main-area");
  const backdrop = document.getElementById("sidebar-backdrop");

  const isMobile = () => window.innerWidth <= 768;

  /* ── Direction toggle ── */
  dirToggle.addEventListener("click", () => {
    const isRtl = html.getAttribute("dir") === "rtl";
    const newDir = isRtl ? "ltr" : "rtl";
    html.setAttribute("dir", newDir);
    html.setAttribute("lang", isRtl ? "en" : "ar");
    dirLabel.textContent = newDir.toUpperCase();
  });

  /* ── Close sidebar on mobile ── */
  function closeMobileSidebar() {
    sidebar.classList.remove("mobile-open");
    backdrop.classList.remove("active");
  }

  /* ── Sidebar toggle ── */
  sidebarToggle.addEventListener("click", () => {
    if (isMobile()) {
      const opening = !sidebar.classList.contains("mobile-open");
      sidebar.classList.toggle("mobile-open");
      backdrop.classList.toggle("active", opening);
    } else {
      sidebar.classList.toggle("collapsed");
      mainArea.classList.toggle("expanded");
    }
  });

  /* ── Close sidebar when tapping backdrop ── */
  backdrop.addEventListener("click", closeMobileSidebar);

  /* ── Close sidebar on resize to desktop ── */
  window.addEventListener("resize", () => {
    if (!isMobile()) closeMobileSidebar();
  });
})();
