// Reading progress bar
const progressBar = document.getElementById("progressBar");
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });

// Active TOC link via IntersectionObserver
const headings = document.querySelectorAll(".article-body h2[id]");
const tocLinks = document.querySelectorAll(".toc-link");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tocLinks.forEach((link) => link.classList.remove("active"));
        const active = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  },
  { rootMargin: "-20% 0px -70% 0px" }
);

headings.forEach((h) => observer.observe(h));

// Copy link
document.getElementById("copyLink").addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById("copyLink");
    btn.style.borderColor = "#22c55e";
    setTimeout(() => (btn.style.borderColor = ""), 1500);
  });
});
