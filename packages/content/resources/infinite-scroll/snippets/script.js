(() => {
  const TOTAL = 80;
  const PAGE_SIZE = 10;
  const DATA = Array.from({ length: TOTAL }, (_, index) => ({
    id: index + 1,
    title: `Event ${index + 1}`,
    body: `This is item ${index + 1} in the feed.`,
  }));

  let cursor = 0;
  let loading = false;

  const feed = document.getElementById("feed");
  const status = document.getElementById("status");
  const sentinel = document.getElementById("sentinel");

  const setStatus = (message) => {
    status.textContent = message;
  };

  const loadNext = async () => {
    if (loading || cursor >= DATA.length) return;
    loading = true;
    setStatus("Loading more...");

    await new Promise((resolve) => setTimeout(resolve, 400));

    const next = DATA.slice(cursor, cursor + PAGE_SIZE);
    for (const item of next) {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `<h3>${item.title}</h3><p>${item.body}</p>`;
      feed.appendChild(card);
    }

    cursor += next.length;
    loading = false;

    if (cursor >= DATA.length) {
      setStatus("You reached the end.");
    } else {
      setStatus(`Loaded ${cursor} of ${DATA.length}`);
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadNext();
      }
    });
    observer.observe(sentinel);
  } else {
    window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadNext();
      }
    });
  }

  loadNext();
})();
