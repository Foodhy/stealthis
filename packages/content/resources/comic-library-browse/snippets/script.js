(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- series data (fictional) ---------- */
  var series = [
    { title: "Neon Ronin", author: "K. Ardent", genre: "Sci-Fi", rating: 4.9, added: 6, popularity: 98, badge: "HOT", sfx: "VWOOSH", hue: 220 },
    { title: "Iron Vanguard", author: "M. Solano", genre: "Action", rating: 4.7, added: 1, popularity: 91, badge: "NEW", sfx: "KA-BOOM", hue: 350 },
    { title: "Petals & Static", author: "R. Hale", genre: "Romance", rating: 4.8, added: 12, popularity: 95, badge: "HOT", sfx: "FLUTTER", hue: 320 },
    { title: "The Hollow Hour", author: "V. Crane", genre: "Horror", rating: 4.5, added: 3, popularity: 84, badge: "NEW", sfx: "CREAK", hue: 12 },
    { title: "Saltwater Saints", author: "D. Oyelaran", genre: "Slice of Life", rating: 4.6, added: 20, popularity: 77, badge: "", sfx: "SPLASH", hue: 190 },
    { title: "Glasswing", author: "T. Marsh", genre: "Fantasy", rating: 4.4, added: 9, popularity: 72, badge: "", sfx: "SHIMMER", hue: 150 },
    { title: "Lunchbox Heroes", author: "P. Quill", genre: "Comedy", rating: 4.3, added: 2, popularity: 69, badge: "NEW", sfx: "BONK", hue: 45 },
    { title: "Dead Channel", author: "V. Crane", genre: "Horror", rating: 4.7, added: 30, popularity: 88, badge: "", sfx: "STATIC", hue: 280 },
    { title: "Cinder & Vow", author: "R. Hale", genre: "Romance", rating: 4.2, added: 18, popularity: 64, badge: "", sfx: "SWOON", hue: 335 },
    { title: "Orbital Drift", author: "K. Ardent", genre: "Sci-Fi", rating: 4.6, added: 5, popularity: 81, badge: "HOT", sfx: "WHIRR", hue: 205 },
    { title: "The Last Innkeeper", author: "T. Marsh", genre: "Fantasy", rating: 4.8, added: 25, popularity: 90, badge: "", sfx: "CLANG", hue: 30 },
    { title: "Quarter Past Mayhem", author: "M. Solano", genre: "Action", rating: 4.1, added: 4, popularity: 60, badge: "NEW", sfx: "SMASH", hue: 0 }
  ];

  /* ---------- state ---------- */
  var activeGenres = new Set(["all"]);
  var sortMode = "trending";

  var grid = document.getElementById("seriesGrid");
  var emptyState = document.getElementById("emptyState");
  var resultCount = document.getElementById("resultCount");
  var clearBtn = document.getElementById("clearBtn");
  var chipBox = document.getElementById("genreChips");
  var sortSelect = document.getElementById("sortSelect");

  function buildCard(s) {
    var li = document.createElement("li");
    li.className = "card";

    var cover = document.createElement("div");
    cover.className = "card-cover";
    cover.style.background =
      "linear-gradient(135deg, hsl(" + s.hue + " 55% 30%), hsl(" + ((s.hue + 40) % 360) + " 70% 48%))";
    cover.style.backgroundBlendMode = "multiply";

    if (s.badge) {
      var badges = document.createElement("div");
      badges.className = "card-badges";
      var b = document.createElement("span");
      b.className = "badge " + (s.badge === "NEW" ? "badge--new" : "badge--hot");
      b.textContent = s.badge;
      badges.appendChild(b);
      cover.appendChild(badges);
    }
    var sfx = document.createElement("span");
    sfx.className = "cover-sfx";
    sfx.textContent = s.sfx;
    cover.appendChild(sfx);

    var body = document.createElement("div");
    body.className = "card-body";

    var h3 = document.createElement("h3");
    h3.className = "card-title";
    h3.textContent = s.title;

    var author = document.createElement("p");
    author.className = "card-author";
    author.textContent = "by " + s.author;

    var foot = document.createElement("div");
    foot.className = "card-foot";

    var tag = document.createElement("span");
    tag.className = "tag tag--genre";
    tag.textContent = s.genre;

    var rating = document.createElement("span");
    rating.className = "rating";
    rating.setAttribute("aria-label", "Rated " + s.rating + " of 5");
    rating.innerHTML = '<span class="star">★</span> ' + s.rating.toFixed(1);

    foot.appendChild(tag);
    foot.appendChild(rating);
    body.appendChild(h3);
    body.appendChild(author);
    body.appendChild(foot);

    li.appendChild(cover);
    li.appendChild(body);

    li.addEventListener("click", function () {
      toast("Opening “" + s.title + "” …");
    });
    return li;
  }

  function getFiltered() {
    var list = series.filter(function (s) {
      return activeGenres.has("all") || activeGenres.has(s.genre);
    });
    list.sort(function (a, b) {
      if (sortMode === "new") return a.added - b.added;
      if (sortMode === "rating") return b.rating - a.rating;
      return b.popularity - a.popularity; // trending
    });
    return list;
  }

  function render() {
    var list = getFiltered();
    grid.innerHTML = "";
    list.forEach(function (s) {
      grid.appendChild(buildCard(s));
    });

    var hasResults = list.length > 0;
    emptyState.hidden = hasResults;
    grid.hidden = !hasResults;

    var label = sortMode === "new" ? "Newest" : sortMode === "rating" ? "Top rated" : "Trending";
    resultCount.innerHTML =
      "<strong>" + list.length + "</strong> series · " + label;

    clearBtn.hidden = activeGenres.has("all");
  }

  /* ---------- chip filtering (multi-select) ---------- */
  chipBox.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var genre = chip.dataset.genre;

    if (genre === "all") {
      activeGenres = new Set(["all"]);
    } else {
      activeGenres.delete("all");
      if (activeGenres.has(genre)) {
        activeGenres.delete(genre);
      } else {
        activeGenres.add(genre);
      }
      if (activeGenres.size === 0) activeGenres.add("all");
    }
    syncChips();
    render();
  });

  function syncChips() {
    var chips = chipBox.querySelectorAll(".chip");
    chips.forEach(function (c) {
      var on = activeGenres.has(c.dataset.genre);
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  clearBtn.addEventListener("click", function () {
    activeGenres = new Set(["all"]);
    syncChips();
    render();
    toast("Filters cleared");
  });

  sortSelect.addEventListener("change", function () {
    sortMode = sortSelect.value;
    render();
    toast("Sorted by " + sortSelect.options[sortSelect.selectedIndex].text);
  });

  /* ---------- read-now buttons ---------- */
  document.querySelectorAll("[data-read]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toast("Opening “" + btn.dataset.read + "” …");
    });
  });

  var signInBtn = document.getElementById("signInBtn");
  if (signInBtn) {
    signInBtn.addEventListener("click", function () {
      toast("Sign-in is illustrative only");
    });
  }

  /* ---------- carousel ---------- */
  var track = document.getElementById("carouselTrack");
  var slides = track ? track.querySelectorAll(".slide") : [];
  var dotsBox = document.getElementById("carouselDots");
  var prevBtn = document.getElementById("prevSlide");
  var nextBtn = document.getElementById("nextSlide");
  var current = 0;
  var autoTimer;
  var AUTO_MS = 5000;

  function goTo(i) {
    if (!slides.length) return;
    current = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    var dots = dotsBox.querySelectorAll(".dot");
    dots.forEach(function (d, idx) {
      d.classList.toggle("is-active", idx === current);
      d.setAttribute("aria-selected", idx === current ? "true" : "false");
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, AUTO_MS);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }
  function restartAuto() {
    startAuto();
  }

  if (slides.length) {
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        goTo(i);
        restartAuto();
      });
      dotsBox.appendChild(dot);
    });

    nextBtn.addEventListener("click", function () { next(); restartAuto(); });
    prevBtn.addEventListener("click", function () { prev(); restartAuto(); });

    var carouselEl = track.closest(".carousel");
    carouselEl.addEventListener("mouseenter", stopAuto);
    carouselEl.addEventListener("mouseleave", startAuto);
    carouselEl.addEventListener("focusin", stopAuto);
    carouselEl.addEventListener("focusout", startAuto);

    carouselEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { next(); restartAuto(); }
      else if (e.key === "ArrowLeft") { prev(); restartAuto(); }
    });

    startAuto();
  }

  /* ---------- init ---------- */
  render();
})();
