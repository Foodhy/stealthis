(function () {
  "use strict";

  /* ---------------- DATA ---------------- */
  var SEASONS = [
    {
      label: "Season 1",
      episodes: [
        { n: 1, title: "The Drowned Meridian", dur: "58m", air: "Mar 7, 2024",
          desc: "Mara Vey intercepts a signal from a satellite presumed dead for forty years — and the first map it sends back has no coastline." },
        { n: 2, title: "Cartographer's Dilemma", dur: "52m", air: "Mar 14, 2024",
          desc: "A colleague vanishes from every photograph in the archive. Only Mara remembers he existed." },
        { n: 3, title: "Below the Waterline", dur: "55m", air: "Mar 21, 2024",
          desc: "The atlas predicts a street that does not exist. Mara walks it anyway." },
        { n: 4, title: "Hollow North", dur: "49m", air: "Mar 28, 2024",
          desc: "An expedition to the satellite's last known position reveals it was never in orbit at all." },
        { n: 5, title: "The Second Sea", dur: "61m", air: "Apr 4, 2024",
          desc: "What lies beneath the drowned city begins to chart Mara in return." }
      ]
    },
    {
      label: "Season 2",
      episodes: [
        { n: 1, title: "Echo Survey", dur: "54m", air: "Feb 12, 2025",
          desc: "One year on, the maps have started leaking into the waking world — and so have the people erased by them." },
        { n: 2, title: "The Quiet Latitude", dur: "50m", air: "Feb 19, 2025",
          desc: "Mara recruits a disgraced surveyor who claims to have walked the second sea and returned." },
        { n: 3, title: "Reckoning Tide", dur: "57m", air: "Feb 26, 2025",
          desc: "The agency that funded the satellite resurfaces with a very different account of who launched it." },
        { n: 4, title: "Phantom Mile", dur: "53m", air: "Mar 5, 2025",
          desc: "A mile of road appears overnight where the harbor used to be. Anyone who drives it does not come back the same." },
        { n: 5, title: "Salt and Static", dur: "59m", air: "Mar 12, 2025",
          desc: "Mara decodes the satellite's true purpose hidden in the noise between transmissions." },
        { n: 6, title: "The Atlas Opens", dur: "63m", air: "Mar 19, 2025",
          desc: "Season finale. To save the people the map has taken, Mara must let it finish drawing her." }
      ]
    },
    {
      label: "Season 3",
      episodes: [
        { n: 1, title: "New Cartography", dur: "56m", air: "Jan 9, 2026",
          desc: "Premiere. The drowned city has a sky now, and Mara is the only one who knows which way is up." },
        { n: 2, title: "Tideborn", dur: "52m", air: "Jan 16, 2026",
          desc: "A child appears in the archive footage — present in every season, named by no one." },
        { n: 3, title: "The Unmapped", dur: "60m", air: "Jan 23, 2026",
          desc: "Mara confronts the surveyor who has been redrawing the world one disappearance at a time." }
      ]
    }
  ];

  var CAST = [
    { name: "Lena Okonkwo", role: "Mara Vey", c: "#6c5ce7" },
    { name: "Idris Vance", role: "Director Hale", c: "#00b894" },
    { name: "Sora Mizuki", role: "Surveyor Quill", c: "#e17055" },
    { name: "Tomas Reyes", role: "Archivist Bell", c: "#0984e3" },
    { name: "Priya Anand", role: "Dr. Calder", c: "#fd79a8" },
    { name: "Niamh Doyle", role: "The Child", c: "#fdcb6e" },
    { name: "Marcus Yune", role: "Captain Frey", c: "#a29bfe" },
    { name: "Ada Bauer", role: "Voice of the Atlas", c: "#55efc4" },
    { name: "Jonah Petr", role: "Created by", c: "#636e72" },
    { name: "Cleo Marsh", role: "Composer", c: "#ff7675" }
  ];

  var SIMILAR = [
    { title: "Tidal Ledger", meta: "2025 · Series", q: "4K", match: 96, c1: "#0c2340", c2: "#1b6ca8" },
    { title: "The Glass Meridian", meta: "2023 · Series", q: "HDR", match: 91, c1: "#2d1b46", c2: "#6c5ce7" },
    { title: "Cold Orbit", meta: "2024 · Film", q: "4K", match: 88, c1: "#11201f", c2: "#00b894" },
    { title: "Paper Coastline", meta: "2022 · Series", q: "HD", match: 84, c1: "#3a1f12", c2: "#e17055" },
    { title: "Signal Decay", meta: "2026 · Series", q: "4K", match: 93, c1: "#1a1030", c2: "#a29bfe" },
    { title: "The Last Survey", meta: "2021 · Film", q: "HDR", match: 79, c1: "#102a3a", c2: "#0984e3" },
    { title: "Undertow Atlas", meta: "2025 · Series", q: "4K", match: 95, c1: "#2b1530", c2: "#fd79a8" }
  ];

  /* ---------------- HELPERS ---------------- */
  function el(id) { return document.getElementById(id); }
  var toastTimer;
  function toast(msg) {
    var t = el("toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 2200);
  }

  /* ---------------- TOP NAV solidify on scroll ---------------- */
  var nav = el("topnav");
  function onScroll() {
    nav.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- HERO actions ---------------- */
  el("playBtn").addEventListener("click", function () {
    toast("▶ Playing “Nightfall Atlas” — S1 E1");
  });

  var listBtn = el("listBtn");
  listBtn.addEventListener("click", function () {
    var on = listBtn.getAttribute("aria-pressed") === "true";
    on = !on;
    listBtn.setAttribute("aria-pressed", String(on));
    listBtn.classList.toggle("is-active", on);
    listBtn.querySelector(".ico-plus").className = on ? "ico-check" : "ico-plus";
    var label = listBtn.querySelector(".btn__label");
    if (label) label.textContent = on ? "Added" : "My List";
    toast(on ? "Added to My List" : "Removed from My List");
  });

  var likeBtn = el("likeBtn");
  likeBtn.addEventListener("click", function () {
    var on = likeBtn.getAttribute("aria-pressed") === "true";
    on = !on;
    likeBtn.setAttribute("aria-pressed", String(on));
    likeBtn.classList.toggle("is-active", on);
    toast(on ? "Glad you like it — we'll find more like this" : "Rating removed");
  });

  el("shareBtn").addEventListener("click", function () {
    toast("Link copied to clipboard");
  });

  /* ---------------- Synopsis read more ---------------- */
  var readMore = el("readMore");
  var synopsis = el("synopsis");
  readMore.addEventListener("click", function () {
    var open = synopsis.classList.toggle("is-open");
    readMore.setAttribute("aria-expanded", String(open));
    readMore.textContent = open ? "Read less" : "Read more";
  });

  /* ---------------- SEASON TABS + EPISODES ---------------- */
  var tabsWrap = el("seasonTabs");
  var listWrap = el("episodeList");
  var current = SEASONS.length - 1; // default to latest season

  function renderTabs() {
    tabsWrap.innerHTML = "";
    SEASONS.forEach(function (s, i) {
      var b = document.createElement("button");
      b.className = "season-tab";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = s.label;
      b.setAttribute("aria-selected", String(i === current));
      b.addEventListener("click", function () {
        if (i === current) return;
        current = i;
        renderTabs();
        renderEpisodes();
      });
      tabsWrap.appendChild(b);
    });
  }

  function renderEpisodes() {
    var eps = SEASONS[current].episodes;
    listWrap.innerHTML = "";
    eps.forEach(function (ep) {
      var li = document.createElement("li");
      li.className = "episode";
      li.innerHTML =
        '<div class="episode__num">' + ep.n + '</div>' +
        '<div class="episode__thumb">' +
          '<span><span class="episode__play"><span class="ico-play"></span></span></span>' +
          '<span class="episode__dur">' + ep.dur + '</span>' +
        '</div>' +
        '<div class="episode__body">' +
          '<h3 class="episode__title">' + ep.title + '</h3>' +
          '<p class="episode__desc">' + ep.desc + '</p>' +
          '<span class="episode__air">' + ep.air + '</span>' +
        '</div>' +
        '<button class="episode__add" type="button" aria-pressed="false" ' +
          'aria-label="Add episode ' + ep.n + ' to My List">+</button>';

      li.querySelector(".episode__thumb").addEventListener("click", function () {
        toast("▶ " + SEASONS[current].label + " · E" + ep.n + " — " + ep.title);
      });
      var add = li.querySelector(".episode__add");
      add.addEventListener("click", function (e) {
        e.stopPropagation();
        var on = add.getAttribute("aria-pressed") === "true";
        on = !on;
        add.setAttribute("aria-pressed", String(on));
        add.classList.toggle("is-active", on);
        add.textContent = on ? "✓" : "+";
        toast(on ? "Episode added to My List" : "Episode removed");
      });
      listWrap.appendChild(li);
    });
  }

  renderTabs();
  renderEpisodes();

  /* ---------------- CAST ---------------- */
  var castList = el("castList");
  var castToggle = el("castToggle");
  var CAST_VISIBLE = 6;

  function renderCast() {
    castList.innerHTML = "";
    CAST.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "cast__item" + (i >= CAST_VISIBLE ? " is-hidden" : "");
      var initials = p.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
      li.innerHTML =
        '<span class="cast__avatar" style="background:' + p.c + '">' + initials + '</span>' +
        '<div><p class="cast__name">' + p.name + '</p>' +
        '<p class="cast__role">' + p.role + '</p></div>';
      castList.appendChild(li);
    });
  }
  renderCast();

  var castOpen = false;
  castToggle.addEventListener("click", function () {
    castOpen = !castOpen;
    var hidden = castList.querySelectorAll(".cast__item");
    hidden.forEach(function (item, i) {
      if (i >= CAST_VISIBLE) item.classList.toggle("is-hidden", !castOpen);
    });
    castToggle.setAttribute("aria-expanded", String(castOpen));
    castToggle.textContent = castOpen ? "Show less" : "Show all";
  });

  /* ---------------- SIMILAR ROW ---------------- */
  var track = el("similarTrack");
  SIMILAR.forEach(function (m) {
    var li = document.createElement("li");
    li.className = "poster";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", m.title + " — " + m.match + "% match");
    li.innerHTML =
      '<div class="poster__art" style="background:linear-gradient(135deg,' + m.c1 + ',' + m.c2 + ')">' +
        '<span class="badge badge--quality">' + m.q + '</span>' +
        '<span class="poster__match">' + m.match + '% Match</span>' +
      '</div>' +
      '<div class="poster__body">' +
        '<p class="poster__title">' + m.title + '</p>' +
        '<p class="poster__meta">' + m.meta + '</p>' +
      '</div>';
    function open() { toast("Opening “" + m.title + "”"); }
    li.addEventListener("click", open);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    track.appendChild(li);
  });

  var simRow = el("similarRow");
  simRow.querySelectorAll(".row__nav").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dir = parseInt(btn.getAttribute("data-dir"), 10);
      track.scrollBy({ left: dir * Math.min(track.clientWidth * 0.85, 640), behavior: "smooth" });
    });
  });
})();
