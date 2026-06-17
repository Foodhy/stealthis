(function () {
  "use strict";

  // --- Fictional featured catalog ---
  // Backdrops are generated as inline SVG gradients so the demo is fully self-contained.
  function backdrop(c1, c2, c3) {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'>` +
      `<defs><radialGradient id='g' cx='30%' cy='35%' r='90%'>` +
      `<stop offset='0%' stop-color='${c1}'/><stop offset='55%' stop-color='${c2}'/>` +
      `<stop offset='100%' stop-color='${c3}'/></radialGradient></defs>` +
      `<rect width='1280' height='720' fill='url(#g)'/>` +
      `<circle cx='980' cy='180' r='220' fill='${c1}' opacity='0.35'/>` +
      `<circle cx='1120' cy='520' r='160' fill='${c2}' opacity='0.4'/>` +
      `</svg>`;
    return "url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")";
  }

  const SLIDES = [
    {
      rank: "#1 in Series Today",
      title: "Halcyon Drift",
      match: 98,
      year: 2026,
      seasons: "2 Seasons",
      age: "16+",
      tags: ["Sci-Fi", "Thriller"],
      synopsis:
        "A salvage pilot stranded on the edge of a dying star system discovers a signal that should not exist — and the crew willing to die to keep it buried.",
      colors: ["#3a1f6b", "#1a1140", "#070512"],
    },
    {
      rank: "New Limited Series",
      title: "Iron Tide",
      match: 95,
      year: 2026,
      seasons: "1 Season",
      age: "18+",
      tags: ["Crime", "Drama"],
      synopsis:
        "When a harbor city's last honest detective is framed for a murder she was meant to solve, she goes underground to expose the dynasty that owns the docks.",
      colors: ["#0d3b4a", "#08222b", "#040b0f"],
    },
    {
      rank: "Top Pick For You",
      title: "Ember & Ash",
      match: 91,
      year: 2025,
      seasons: "3 Seasons",
      age: "13+",
      tags: ["Fantasy", "Adventure"],
      synopsis:
        "Two estranged sisters inherit a hidden forge that can reshape the world — if they survive the rival houses that have hunted their bloodline for centuries.",
      colors: ["#6b2a14", "#3d1408", "#120603"],
    },
    {
      rank: "Trending Now",
      title: "Static Bloom",
      match: 89,
      year: 2026,
      seasons: "Film",
      age: "16+",
      tags: ["Mystery", "Romance"],
      synopsis:
        "A radio engineer keeps receiving calls from a woman who claims to be broadcasting from one week in the future. Every warning she gives comes true but one.",
      colors: ["#1f5a4a", "#0e2f27", "#05100d"],
    },
  ];

  const ROTATE_MS = 7000;
  let index = 0;
  let timer = null;
  let muted = true;

  const stage = document.getElementById("stage");
  const dotsWrap = document.getElementById("dots");
  const thumbRow = document.getElementById("thumbRow");
  const elRank = document.getElementById("rank");
  const elTitle = document.getElementById("title");
  const elMeta = document.getElementById("meta");
  const elSyn = document.getElementById("synopsis");
  const elAge = document.getElementById("ageRating");
  const content = document.getElementById("content");
  const toastEl = document.getElementById("toast");

  document.documentElement.style.setProperty("--rotate", ROTATE_MS + "ms");

  // Build slides, dots, thumbnails
  SLIDES.forEach((s, i) => {
    const bg = backdrop(s.colors[0], s.colors[1], s.colors[2]);

    const slide = document.createElement("div");
    slide.className = "slide";
    slide.style.backgroundImage = bg;
    stage.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "dot-btn";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", s.title);
    dot.innerHTML = '<span class="fill"></span>';
    dot.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(dot);

    const thumb = document.createElement("button");
    thumb.className = "thumb";
    thumb.style.backgroundImage = bg;
    thumb.setAttribute("aria-label", "Feature " + s.title);
    thumb.innerHTML =
      '<span class="thumb__hd">HD</span>' +
      '<span class="thumb__label">' + s.title + "</span>";
    thumb.addEventListener("click", () => goTo(i, true));
    thumbRow.appendChild(thumb);
  });

  const slides = Array.from(stage.children);
  const dots = Array.from(dotsWrap.children);
  const thumbs = Array.from(thumbRow.children);

  function render(i) {
    const s = SLIDES[i];
    elRank.textContent = s.rank;
    elTitle.textContent = s.title;
    elSyn.textContent = s.synopsis;
    elAge.textContent = s.age;

    elMeta.innerHTML =
      '<span class="match">' + s.match + "% Match</span>" +
      '<span>' + s.year + "</span><span class=\"dot\"></span>" +
      '<span>' + s.seasons + "</span>" +
      '<span class="tag">' + s.age + "</span>" +
      s.tags.map((t) => '<span class="tag">' + t + "</span>").join("");

    slides.forEach((el, n) => el.classList.toggle("is-active", n === i));
    dots.forEach((el, n) => el.classList.toggle("is-active", n === i));
    thumbs.forEach((el, n) => el.classList.toggle("is-active", n === i));

    // restart synopsis fade
    content.style.animation = "none";
    void content.offsetWidth;
    content.style.animation = "fadeUp 0.6s ease";
  }

  function goTo(i, manual) {
    index = (i + SLIDES.length) % SLIDES.length;
    render(index);
    if (manual) restart();
  }

  function next() { goTo(index + 1, false); }

  function start() {
    stop();
    timer = setInterval(next, ROTATE_MS);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  // --- Controls ---
  const muteBtn = document.getElementById("muteBtn");
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.setAttribute("aria-pressed", String(muted));
    toast(muted ? "Audio muted" : "Audio on");
  });

  document.getElementById("replayBtn").addEventListener("click", () => {
    render(index);
    restart();
    toast("Replaying " + SLIDES[index].title);
  });

  document.getElementById("playBtn").addEventListener("click", () => {
    toast("Now playing — " + SLIDES[index].title);
  });
  document.getElementById("infoBtn").addEventListener("click", () => {
    toast("Opening details for " + SLIDES[index].title);
  });

  // Pause rotation while pointer is over the billboard
  const billboard = document.querySelector(".billboard");
  billboard.addEventListener("mouseenter", stop);
  billboard.addEventListener("mouseleave", start);

  // Keyboard nav
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(index + 1, true);
    else if (e.key === "ArrowLeft") goTo(index - 1, true);
  });

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  // Top nav shadow on scroll
  const topnav = document.getElementById("topnav");
  window.addEventListener("scroll", () => {
    topnav.classList.toggle("scrolled", window.scrollY > 24);
  }, { passive: true });

  // --- Toast helper ---
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  // Inject keyframes for the content fade
  const style = document.createElement("style");
  style.textContent =
    "@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}";
  document.head.appendChild(style);

  // Boot
  render(0);
  start();
})();
