(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* Generic data-toast wiring */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------- Poster art generator (CSS gradients, deterministic) ---------- */
  function poster(seed, a, b, c) {
    return (
      "radial-gradient(120% 90% at 78% 12%, " + a + "33 0%, transparent 55%)," +
      "radial-gradient(90% 80% at 20% 90%, " + c + "44 0%, transparent 60%)," +
      "linear-gradient(135deg, " + a + " 0%, " + b + " 52%, " + c + " 100%)"
    );
  }

  /* ---------- Featured hero titles ---------- */
  var HERO = [
    {
      kicker: "Nebula Original Series",
      title: "The Glass Meridian",
      match: "97% Match", year: "2026", rated: "TV-MA", extra: "3 Seasons",
      desc: "A disgraced cartographer is recruited to map a city that rewrites itself every night — and the deeper she charts it, the more it charts her.",
      art: poster(1, "#3b0764", "#7c1d6f", "#0b0b0f")
    },
    {
      kicker: "Nebula Original Film",
      title: "Saltwater Engine",
      match: "94% Match", year: "2025", rated: "PG-13", extra: "2h 11m",
      desc: "Two estranged sisters restore their late father's fishing trawler and discover his last voyage was never finished.",
      art: poster(2, "#0c4a6e", "#0e7490", "#0b0b0f")
    },
    {
      kicker: "New Limited Series",
      title: "Hollow Crown Lane",
      match: "91% Match", year: "2026", rated: "TV-14", extra: "Limited Series",
      desc: "On a cul-de-sac where every house keeps a secret, a new neighbor's arrival sets off a quietly devastating chain reaction.",
      art: poster(3, "#7c2d12", "#b91c1c", "#0b0b0f")
    },
    {
      kicker: "Nebula Original Series",
      title: "Quantum Pastoral",
      match: "96% Match", year: "2026", rated: "TV-MA", extra: "1 Season",
      desc: "A physicist retreats to a remote farm to grieve — and finds the orchard is leaking time.",
      art: poster(4, "#14532d", "#15803d", "#0b0b0f")
    }
  ];

  var heroIdx = 0;
  var els = {
    art: document.getElementById("heroArt"),
    kicker: document.getElementById("heroKicker"),
    title: document.getElementById("heroTitle"),
    match: document.getElementById("heroMatch"),
    year: document.getElementById("heroYear"),
    rated: null,
    seasons: document.getElementById("heroSeasons"),
    desc: document.getElementById("heroDesc")
  };
  var dotsWrap = document.getElementById("heroDots");

  function renderHero(i, focusDot) {
    var h = HERO[i];
    if (els.art) {
      els.art.style.opacity = "0";
      setTimeout(function () {
        els.art.style.backgroundImage = h.art;
        els.art.style.backgroundSize = "cover";
        els.art.style.opacity = "1";
      }, 200);
    }
    els.kicker.textContent = h.kicker;
    els.title.textContent = h.title;
    els.match.textContent = h.match;
    els.year.textContent = h.year;
    els.seasons.textContent = h.extra;
    els.desc.textContent = h.desc;
    var rated = document.querySelector(".badge--rated");
    if (rated) rated.textContent = h.rated;
    Array.prototype.forEach.call(dotsWrap.children, function (d, di) {
      d.setAttribute("aria-selected", di === i ? "true" : "false");
    });
    if (focusDot && dotsWrap.children[i]) dotsWrap.children[i].focus();
  }

  HERO.forEach(function (h, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Show " + h.title);
    b.addEventListener("click", function () {
      heroIdx = i;
      renderHero(heroIdx);
      restartRotate();
    });
    dotsWrap.appendChild(b);
  });
  renderHero(0);

  var rotateTimer;
  function rotate() {
    heroIdx = (heroIdx + 1) % HERO.length;
    renderHero(heroIdx);
  }
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function restartRotate() {
    clearInterval(rotateTimer);
    if (!reduceMotion) rotateTimer = setInterval(rotate, 7000);
  }
  restartRotate();

  document.getElementById("heroPlay").addEventListener("click", function () {
    toast("Playing “" + HERO[heroIdx].title + "”");
  });
  document.getElementById("heroInfo").addEventListener("click", function () {
    toast("More info: " + HERO[heroIdx].title);
  });

  /* ---------- Row data ---------- */
  var PALETTES = [
    ["#3b0764", "#7c1d6f", "#0b0b0f"], ["#0c4a6e", "#0e7490", "#0b0b0f"],
    ["#7c2d12", "#b91c1c", "#0b0b0f"], ["#14532d", "#15803d", "#0b0b0f"],
    ["#1e1b4b", "#4338ca", "#0b0b0f"], ["#831843", "#db2777", "#0b0b0f"],
    ["#713f12", "#ca8a04", "#0b0b0f"], ["#134e4a", "#0d9488", "#0b0b0f"],
    ["#3f1d38", "#9333ea", "#0b0b0f"], ["#1c1917", "#57534e", "#0b0b0f"]
  ];
  var GENRE_POOL = ["Suspense", "Drama", "Sci-Fi", "Thriller", "Mystery", "Crime", "Romance", "Dark Comedy", "Adventure"];

  function mk(title, genres, opts) {
    opts = opts || {};
    return {
      title: title,
      genres: genres,
      progress: opts.progress,
      tag: opts.tag,
      match: opts.match || (88 + Math.floor(Math.random() * 11)) + "% Match",
      rated: opts.rated || "TV-MA",
      dur: opts.dur || "1 Season"
    };
  }

  var ROWS = [
    {
      title: "Continue Watching for Priya",
      items: [
        mk("Midnight Archive", ["Mystery", "Drama"], { progress: 72, dur: "S2:E4" }),
        mk("Ferrous", ["Sci-Fi"], { progress: 41, dur: "S1:E8" }),
        mk("The Long Quiet", ["Drama"], { progress: 18, dur: "1h 54m" }),
        mk("Paper Tigers", ["Crime", "Thriller"], { progress: 88, dur: "S3:E2" }),
        mk("Driftwood County", ["Mystery"], { progress: 55, dur: "S1:E6" }),
        mk("Echo Bay", ["Thriller"], { progress: 9, dur: "S2:E1" })
      ]
    },
    {
      title: "Trending Now",
      ranked: true,
      items: [
        mk("The Glass Meridian", ["Suspense", "Sci-Fi"], { tag: "top" }),
        mk("Saltwater Engine", ["Drama"], { tag: "top" }),
        mk("Hollow Crown Lane", ["Mystery"], { tag: "top" }),
        mk("Quantum Pastoral", ["Sci-Fi", "Drama"], { tag: "top" }),
        mk("Static Garden", ["Thriller"], { tag: "top" }),
        mk("Nine Below", ["Crime"], { tag: "top" }),
        mk("The Understudy", ["Dark Comedy"], { tag: "top" }),
        mk("Cobalt Hour", ["Sci-Fi"], { tag: "top" }),
        mk("Marrow", ["Suspense"], { tag: "top" }),
        mk("Lantern Street", ["Drama"], { tag: "top" })
      ]
    },
    {
      title: "New Releases",
      items: [
        mk("Petrichor", ["Romance", "Drama"], { tag: "new", dur: "1h 47m" }),
        mk("Foxglove", ["Thriller"], { tag: "new" }),
        mk("The Mapmaker's Daughter", ["Adventure"], { tag: "new" }),
        mk("Slow Burn Avenue", ["Crime"], { tag: "new" }),
        mk("Aurora Service", ["Sci-Fi"], { tag: "new" }),
        mk("Tidewater", ["Drama"], { tag: "new" }),
        mk("Glasshouse", ["Mystery"], { tag: "new" }),
        mk("Velvet Static", ["Dark Comedy"], { tag: "new" })
      ]
    },
    {
      title: "Sci-Fi & Beyond",
      items: [
        mk("Orbital Decay", ["Sci-Fi"]), mk("The Pale Engine", ["Sci-Fi", "Thriller"]),
        mk("Heliotrope", ["Sci-Fi"]), mk("Null Sector", ["Sci-Fi", "Adventure"]),
        mk("Carbon Lullaby", ["Sci-Fi"]), mk("Far Meridian", ["Sci-Fi"]),
        mk("The Quiet Machine", ["Sci-Fi", "Drama"]), mk("Strata", ["Sci-Fi"]),
        mk("Lightfall", ["Sci-Fi", "Adventure"])
      ]
    },
    {
      title: "Critically Acclaimed Dramas",
      items: [
        mk("The Understudy", ["Drama"]), mk("Bone & Brass", ["Drama", "Crime"]),
        mk("Marigold Down", ["Drama"]), mk("A Smaller Sky", ["Drama", "Romance"]),
        mk("The Tenant", ["Drama", "Mystery"]), mk("Salt of the Coast", ["Drama"]),
        mk("Embers", ["Drama"]), mk("Thin Ice County", ["Drama", "Thriller"])
      ]
    }
  ];

  function svgIcon(name) {
    if (name === "play") return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    if (name === "plus") return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    if (name === "like") return '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 11v8H4v-8h3zm3 8c-.4 0-.7-.2-1-.5V10l3-7c1.2 0 2 .9 2 2v3h4.5c1 0 1.8 1 1.5 2l-1.6 6c-.2.8-1 1.4-1.8 1.4H10z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  }

  var rowsWrap = document.getElementById("rows");

  function buildCard(item, ranked, rank) {
    var pal = PALETTES[(item.title.length + (rank || 0)) % PALETTES.length];
    var card = document.createElement("button");
    card.type = "button";
    card.className = "card" + (ranked ? " card--ranked" : "");
    card.setAttribute("aria-label", item.title + ", " + item.match);

    var rankMarkup = ranked ? '<span class="card__rank">' + rank + "</span>" : "";

    var topTags = "";
    if (item.tag === "new") topTags = '<span class="card__tag card__tag--new">New</span>';
    else if (item.tag === "top") topTags = '<span class="card__tag card__tag--top">Top 10</span>';
    topTags += '<span class="card__tag card__tag--hd">HD</span>';

    var progressMarkup = item.progress != null
      ? '<div class="card__progress"><span style="width:' + item.progress + '%"></span></div>'
      : "";

    card.innerHTML =
      rankMarkup +
      '<div class="card__poster" style="background-image:' + poster(0, pal[0], pal[1], pal[2]) + ';background-size:cover">' +
        '<div class="card__top">' + topTags + "</div>" +
        '<div class="card__label">' + item.title + "</div>" +
        progressMarkup +
      "</div>" +
      '<div class="card__hover">' +
        '<div class="card__actions">' +
          '<span class="card__circ card__circ--play" aria-hidden="true">' + svgIcon("play") + "</span>" +
          '<span class="card__circ" data-act="list" aria-hidden="true">' + svgIcon("plus") + "</span>" +
          '<span class="card__circ" data-act="like" aria-hidden="true">' + svgIcon("like") + "</span>" +
        "</div>" +
        '<div class="card__hmeta"><span class="match">' + item.match + '</span><span class="card__chip">' + item.rated + "</span><span>" + item.dur + "</span></div>" +
        '<div class="card__genres">' + item.genres.join(" · ") + "</div>" +
      "</div>";

    card.addEventListener("click", function (e) {
      var act = e.target.closest("[data-act]");
      if (act) {
        var a = act.getAttribute("data-act");
        toast(a === "list" ? "Added “" + item.title + "” to My List" : "You liked “" + item.title + "”");
        return;
      }
      toast("Playing “" + item.title + "”");
    });
    return card;
  }

  function buildRow(rowData) {
    var section = document.createElement("section");
    section.className = "row";
    section.setAttribute("aria-label", rowData.title);

    var head = document.createElement("div");
    head.className = "row__head";
    head.innerHTML =
      '<h2 class="row__title">' + rowData.title + "</h2>" +
      '<button class="row__explore" type="button">Explore all ' + svgIcon("chev") + "</button>";
    head.querySelector(".row__explore").addEventListener("click", function () {
      toast("Explore: " + rowData.title);
    });
    section.appendChild(head);

    var viewport = document.createElement("div");
    viewport.className = "row__viewport";

    var leftBtn = document.createElement("button");
    leftBtn.className = "arrow arrow--left";
    leftBtn.type = "button";
    leftBtn.setAttribute("aria-label", "Scroll " + rowData.title + " left");
    leftBtn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var rightBtn = document.createElement("button");
    rightBtn.className = "arrow arrow--right";
    rightBtn.type = "button";
    rightBtn.setAttribute("aria-label", "Scroll " + rowData.title + " right");
    rightBtn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var track = document.createElement("div");
    track.className = "row__track";

    rowData.items.forEach(function (item, i) {
      track.appendChild(buildCard(item, rowData.ranked, i + 1));
    });

    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth - 2;
      leftBtn.disabled = track.scrollLeft <= 2;
      rightBtn.disabled = track.scrollLeft >= max;
    }
    function page(dir) {
      track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.85), behavior: "smooth" });
    }
    leftBtn.addEventListener("click", function () { page(-1); });
    rightBtn.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    viewport.appendChild(leftBtn);
    viewport.appendChild(track);
    viewport.appendChild(rightBtn);
    section.appendChild(viewport);
    rowsWrap.appendChild(section);

    requestAnimationFrame(updateArrows);
  }

  ROWS.forEach(buildRow);

  /* ---------- Nav condense on scroll ---------- */
  var nav = document.getElementById("topnav");
  function onScroll() {
    nav.classList.toggle("is-condensed", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
