(function () {
  "use strict";

  var track = document.querySelector(".track");
  var endCard = track.querySelector(".end-card");
  var dotsWrap = document.querySelector(".dots");
  var leftBtn = document.querySelector(".arrow-left");
  var rightBtn = document.querySelector(".arrow-right");
  var seeAll = document.querySelector(".see-all");
  var toastEl = document.getElementById("toast");

  /* ---------- data (fictional) ---------- */
  var titles = [
    { t: "Halcyon Drift", yr: 2026, ep: "Limited Series", match: 98, q: "4K", g: "Sci-Fi Thriller", h: 220, s: 62, l: 46, prog: 0 },
    { t: "The Vanishing Coast", yr: 2025, ep: "Season 2", match: 95, q: "HD", g: "Mystery", h: 12, s: 70, l: 40, prog: 64 },
    { t: "Ironwood", yr: 2026, ep: "New Episode", match: 91, q: "4K", g: "Drama", h: 340, s: 30, l: 38, prog: 0, fresh: true },
    { t: "Saltwater Kings", yr: 2024, ep: "Season 4", match: 88, q: "HD", g: "Crime", h: 200, s: 24, l: 32, prog: 22 },
    { t: "Moonlit Bazaar", yr: 2026, ep: "Film", match: 93, q: "4K", g: "Adventure", h: 28, s: 55, l: 50, prog: 0 },
    { t: "Static Hours", yr: 2025, ep: "Season 1", match: 86, q: "HD", g: "Horror", h: 280, s: 40, l: 26, prog: 0 },
    { t: "Paper Lanterns", yr: 2026, ep: "Limited Series", match: 97, q: "4K", g: "Romance", h: 8, s: 60, l: 52, prog: 0, fresh: true },
    { t: "Cobalt Run", yr: 2024, ep: "Season 3", match: 84, q: "HD", g: "Action", h: 210, s: 50, l: 35, prog: 88 },
    { t: "The Long Frost", yr: 2026, ep: "New Series", match: 90, q: "4K", g: "Fantasy", h: 195, s: 35, l: 30, prog: 0 },
    { t: "Neon Harvest", yr: 2025, ep: "Season 2", match: 89, q: "HD", g: "Sci-Fi", h: 300, s: 58, l: 44, prog: 0 }
  ];

  /* build an SVG-data-URI poster so it loads without network */
  function posterURI(item) {
    var hue = item.h, sat = item.s, lig = item.l;
    var c1 = "hsl(" + hue + "," + sat + "%," + lig + "%)";
    var c2 = "hsl(" + ((hue + 40) % 360) + "," + (sat + 8) + "%," + Math.max(12, lig - 26) + "%)";
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="464" height="290">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
      "</linearGradient></defs>" +
      '<rect width="464" height="290" fill="url(#g)"/>' +
      '<circle cx="360" cy="70" r="120" fill="rgba(255,255,255,0.10)"/>' +
      '<circle cx="80" cy="240" r="90" fill="rgba(0,0,0,0.18)"/>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf8," + encodeURIComponent(svg);
  }

  /* ---------- render cards ---------- */
  function makeCard(item, idx) {
    var card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Play " + item.t + ", " + item.match + "% match");

    var badges =
      '<span class="badge ' + (item.q === "4K" ? "q4k" : "") + '">' + item.q + "</span>" +
      (item.fresh ? '<span class="badge new">NEW</span>' : "");

    var rank = idx < 3 ? '<div class="rank">' + (idx + 1) + "</div>" : "";

    var progress = item.prog > 0
      ? '<div class="progress"><span style="width:' + item.prog + '%"></span></div>'
      : "";

    card.innerHTML =
      '<div class="poster">' +
        '<div class="skel"></div>' +
        '<div class="art"></div>' +
        '<div class="scrim"></div>' +
        '<div class="badges">' + badges + "</div>" +
        rank +
      "</div>" +
      '<div class="meta">' +
        '<h3 class="card-title">' + item.t + "</h3>" +
        '<div class="sub">' +
          '<span class="match">' + item.match + "% match</span>" +
          '<span class="dotsep"></span><span>' + item.yr + "</span>" +
          '<span class="dotsep"></span><span>' + item.g + "</span>" +
        "</div>" +
        progress +
      "</div>";

    /* lazy-load the poster art via IntersectionObserver */
    var poster = card.querySelector(".poster");
    card.dataset.src = posterURI(item);

    card.addEventListener("click", function () {
      toast("▶ Playing “" + item.t + "” · " + item.ep);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
    return card;
  }

  titles.forEach(function (item, i) {
    track.insertBefore(makeCard(item, i), endCard);
  });

  /* ---------- lazy load with IntersectionObserver ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var card = entry.target;
      var poster = card.querySelector(".poster");
      var art = card.querySelector(".art");
      var img = new Image();
      img.onload = function () { poster.classList.add("loaded"); };
      img.src = card.dataset.src;
      art.style.backgroundImage = "url(" + card.dataset.src + ")";
      io.unobserve(card);
    });
  }, { root: track, rootMargin: "200px" });

  track.querySelectorAll(".card").forEach(function (c) { io.observe(c); });

  /* ---------- arrows ---------- */
  function pageSize() {
    return Math.max(track.clientWidth * 0.85, 240);
  }

  function scrollByDir(dir) {
    track.scrollBy({ left: dir * pageSize(), behavior: "smooth" });
  }

  [leftBtn, rightBtn].forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollByDir(parseInt(btn.dataset.dir, 10));
    });
  });

  function updateArrows() {
    var max = track.scrollWidth - track.clientWidth - 1;
    leftBtn.disabled = track.scrollLeft <= 1;
    rightBtn.disabled = track.scrollLeft >= max;
  }

  /* ---------- pagination dots ---------- */
  var pageCount = 1;
  function buildDots() {
    pageCount = Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));
    dotsWrap.innerHTML = "";
    for (var i = 0; i < pageCount; i++) {
      var d = document.createElement("button");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.type = "button";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Go to page " + (i + 1));
      (function (page) {
        d.addEventListener("click", function () {
          track.scrollTo({ left: page * track.clientWidth, behavior: "smooth" });
        });
      })(i);
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    if (!pageCount) return;
    var page = Math.round(track.scrollLeft / track.clientWidth);
    var dots = dotsWrap.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle("active", i === page);
    }
  }

  /* ---------- scroll listener (rAF throttled) ---------- */
  var ticking = false;
  track.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateArrows();
      updateDots();
      ticking = false;
    });
  });

  /* ---------- keyboard on track ---------- */
  track.addEventListener("keydown", function (e) {
    if (e.target !== track) return;
    if (e.key === "ArrowRight") { e.preventDefault(); scrollByDir(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); scrollByDir(-1); }
  });

  /* ---------- drag to scroll ---------- */
  var isDown = false, startX = 0, startScroll = 0, moved = 0;

  track.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    isDown = true;
    moved = 0;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener("pointermove", function (e) {
    if (!isDown) return;
    var dx = e.clientX - startX;
    moved = Math.abs(dx);
    if (moved > 4) track.classList.add("dragging");
    track.scrollLeft = startScroll - dx;
  });

  function endDrag(e) {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("dragging");
    try { track.releasePointerCapture(e.pointerId); } catch (err) {}
    /* snap to nearest card after a free drag */
    if (moved > 4) {
      var first = track.querySelector(".card");
      if (first) {
        var step = first.offsetWidth + 14;
        var target = Math.round(track.scrollLeft / step) * step;
        track.scrollTo({ left: target, behavior: "smooth" });
      }
    }
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  /* suppress click after a real drag */
  track.addEventListener("click", function (e) {
    if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; }
  }, true);

  /* ---------- end card + see all ---------- */
  function exploreAll() { toast("Opening the full Trending collection — 142 titles"); }
  endCard.addEventListener("click", exploreAll);
  endCard.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); exploreAll(); }
  });
  seeAll.addEventListener("click", exploreAll);

  /* ---------- toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- init + resize ---------- */
  function init() {
    buildDots();
    updateArrows();
    updateDots();
  }
  init();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 180);
  });
})();
