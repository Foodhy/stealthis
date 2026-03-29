(() => {
  const images = Array.from(document.querySelectorAll("img[data-src]"));

  const loadImage = (img) => {
    const src = img.getAttribute("data-src");
    if (!src) return;

    img.src = src;
    img.addEventListener(
      "load",
      () => {
        img.classList.add("loaded");
        img.parentElement?.classList.add("loaded");
      },
      { once: true }
    );
    img.removeAttribute("data-src");
  };

  if (!("IntersectionObserver" in window)) {
    images.forEach(loadImage);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target;
        if (img instanceof HTMLImageElement) {
          loadImage(img);
          observer.unobserve(img);
        }
      }
    },
    { rootMargin: "120px" }
  );

  for (const img of images) {
    observer.observe(img);
  }
})();
