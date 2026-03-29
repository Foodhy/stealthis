(function () {
  var navLinks = document.querySelectorAll(".anchor-nav__link");
  var sections = document.querySelectorAll(".section");
  var progressFill = document.getElementById("progress-fill");
  var content = document.getElementById("content");

  if (!navLinks.length || !sections.length) return;

  // ── Scroll progress bar ──
  function updateProgress() {
    var scrollEl = document.documentElement;
    var scrolled = scrollEl.scrollTop || document.body.scrollTop;
    var total = scrollEl.scrollHeight - scrollEl.clientHeight;
    var pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
    if (progressFill) progressFill.style.width = pct + "%";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ── Active section tracking ──
  var visibleSections = new Set();

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("anchor-nav__link--active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function pickTopmost() {
    var topmost = null;
    var topY = Infinity;
    visibleSections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        var y = el.getBoundingClientRect().top;
        if (y < topY) {
          topY = y;
          topmost = id;
        }
      }
    });
    return topmost;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (entry.isIntersecting) {
          visibleSections.add(id);
        } else {
          visibleSections.delete(id);
        }
      });

      var active = pickTopmost();
      if (active) setActiveLink(active);
    },
    {
      rootMargin: "-10% 0px -60% 0px",
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    if (section.id) observer.observe(section);
  });

  // ── Smooth scroll on click ──
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update immediately for snappy UX
        setActiveLink(id);
      }
    });
  });
})();
