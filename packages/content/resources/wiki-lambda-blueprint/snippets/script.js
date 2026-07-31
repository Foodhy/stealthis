// Sheet navigation: all in-page links scroll manually (fragment navigation is
// blocked inside sandboxed srcdoc iframes) and a scrollspy highlights the
// current sheet number in the fixed selector.

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const navLinks = Array.from(document.querySelectorAll("#sheetnav a"));
const sheets = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const idx = sheets.indexOf(entry.target);
      navLinks.forEach((a, i) => a.classList.toggle("current", i === idx));
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sheets.forEach((s) => spy.observe(s));
