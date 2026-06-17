(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- Fictional catalogue data ---------- */
  var GRAD = [
    "linear-gradient(150deg,#3b1d6e,#0d0b1f)",
    "linear-gradient(150deg,#7a1320,#180a0c)",
    "linear-gradient(150deg,#0d3b4f,#06121a)",
    "linear-gradient(150deg,#5a3a12,#1a1206)",
    "linear-gradient(150deg,#1f4d2e,#08130c)",
    "linear-gradient(150deg,#43215c,#120a1c)",
    "linear-gradient(150deg,#0e2a5e,#070d1d)",
    "linear-gradient(150deg,#5e1245,#1a0814)",
  ];
  function grad(i) {
    return GRAD[i % GRAD.length];
  }

  var titles = [
    { t: "Nightfall Protocol", q: "4K", match: 98, age: "16", dur: "52m", g: ["Thriller", "Sci-Fi"], kind: "series" },
    { t: "Gilded Coast", q: "HD", match: 91, age: "13", dur: "1h 48m", g: ["Drama", "Romance"], kind: "movie" },
    { t: "The Quiet Mile", q: "4K", match: 87, age: "16", dur: "2h 06m", g: ["Crime", "Mystery"], kind: "movie" },
    { t: "Static Bloom", q: "HD", match: 94, age: "13", dur: "44m", g: ["Sci-Fi", "Drama"], kind: "series" },
    { t: "Harbour Lights", q: "HD", match: 82, age: "PG", dur: "1h 39m", g: ["Family", "Comedy"], kind: "movie" },
    { t: "Cold Aperture", q: "4K", match: 96, age: "18", dur: "58m", g: ["Thriller"], kind: "series" },
    { t: "Marrow & Bone", q: "HD", match: 79, age: "18", dur: "1h 52m", g: ["Horror"], kind: "movie" },
    { t: "Paper Empires", q: "4K", match: 90, age: "13", dur: "49m", g: ["History", "Drama"], kind: "series" },
    { t: "Velvet Circuit", q: "HD", match: 88, age: "13", dur: "1h 41m", g: ["Romance", "Comedy"], kind: "movie" },
    { t: "Drift Season", q: "4K", match: 93, age: "16", dur: "47m", g: ["Action", "Drama"], kind: "series" },
    { t: "The Salt Road", q: "HD", match: 85, age: "13", dur: "2h 11m", g: ["Adventure"], kind: "movie" },
    { t: "Lantern Bureau", q: "4K", match: 97, age: "16", dur: "55m", g: ["Mystery", "Crime"], kind: "series" },
    { t: "Glass Orchards", q: "HD", match: 80, age: "PG", dur: "1h 33m", g: ["Family"], kind: "movie" },
    { t: "Undertow", q: "4K", match: 92, age: "18", dur: "51m", g: ["Thriller", "Crime"], kind: "series" },
    { t: "Northwind", q: "HD", match: 84, age: "13", dur: "1h 57m", g: ["Western", "Drama"], kind: "movie" },
    { t: "Echo Chamber", q: "4K", match: 89, age: "16", dur: "46m", g: ["Sci-Fi"], kind: "series" },
  ];

  var continueData = [
    { t: "Nightfall Protocol", q: "4K", match: 98, age: "16", dur: "S2:E4", g: ["Thriller", "Sci-Fi"], kind: "continue", progress: 68 },
    { t: "Cold Aperture", q: "4K", match: 96, age: "18", dur: "S1:E2", g: ["Thriller"], kind: "continue", progress: 31 },
    { t: "Paper Empires", q: "4K", match: 90, age: "13", dur: "S3:E9", g: ["History", "Drama"], kind: "continue", progress: 84 },
    { t: "The Quiet Mile", q: "4K", match: 87, age: "16", dur: "1h 12m left", g: ["Crime"], kind: "continue", progress: 42 },
    { t: "Lantern Bureau", q: "4K", match: 97, age: "16", dur: "S2:E1", g: ["Mystery"], kind: "continue", progress: 12 },
    { t: "Drift Season", q: "4K", match: 93, age: "16", dur: "S1:E6", g: ["Action"], kind: "continue", progress: 57 },
  ];

  var tpl = document.getElementById("card-tpl");

  /* ---------- Build one card ---------- */
  function buildCard(data, idx, opts) {
    opts = opts || {};
    var node = tpl.content.firstElementChild.cloneNode(true);

    node.setAttribute(
      "aria-label",
      data.t + ", " + (opts.rank ? "rank " + opts.rank + ", " : "") + data.match + " percent match"
    );

    var art = node.querySelector("[data-art]");
    art.style.background = grad(idx);
    art.setAttribute("data-label", data.t);

    var pArt = node.querySelector("[data-preview-art]");
    pArt.style.background = grad(idx);

    var q = node.querySelector("[data-quality]");
    q.textContent = data.q;
    q.setAttribute("data-quality", data.q);

    if (opts.rank) {
      var rk = node.querySelector("[data-rank]");
      rk.textContent = "#" + opts.rank;
      rk.hidden = false;
    }

    node.querySelector("[data-title]").textContent = data.t;
    node.querySelector("[data-match]").textContent = data.match + "% Match";
    node.querySelector("[data-age]").textContent = data.age;
    node.querySelector("[data-duration]").textContent = data.dur;

    var genres = node.querySelector("[data-genres]");
    data.g.forEach(function (g) {
      var s = document.createElement("span");
      s.textContent = g;
      genres.appendChild(s);
    });

    if (typeof data.progress === "number") {
      var prog = node.querySelector("[data-progress]");
      prog.hidden = false;
      node.querySelector("[data-progress-bar]").style.width = data.progress + "%";
    }

    /* --- interactions --- */
    var play = node.querySelector("[data-play]");
    play.addEventListener("click", function (e) {
      e.stopPropagation();
      toast("Playing — " + data.t);
    });

    var add = node.querySelector("[data-add]");
    var addOn = false;
    add.addEventListener("click", function (e) {
      e.stopPropagation();
      addOn = !addOn;
      add.classList.toggle("is-on", addOn);
      add.querySelector(".ic-add").hidden = addOn;
      add.querySelector(".ic-check").hidden = !addOn;
      add.setAttribute("aria-label", addOn ? "Remove from My List" : "Add to My List");
      add.setAttribute("aria-pressed", String(addOn));
      toast(addOn ? "Added " + data.t + " to My List" : "Removed " + data.t + " from My List");
    });

    var like = node.querySelector("[data-like]");
    var likeOn = false;
    like.addEventListener("click", function (e) {
      e.stopPropagation();
      likeOn = !likeOn;
      like.classList.toggle("is-on", likeOn);
      like.setAttribute("aria-pressed", String(likeOn));
      if (likeOn) toast("You liked " + data.t);
    });

    var mute = node.querySelector("[data-mute]");
    var muted = true;
    mute.addEventListener("click", function (e) {
      e.stopPropagation();
      muted = !muted;
      mute.querySelector(".ic-muted").hidden = !muted;
      mute.querySelector(".ic-sound").hidden = muted;
      mute.setAttribute("aria-label", muted ? "Unmute preview" : "Mute preview");
      toast(data.t + (muted ? " — muted" : " — sound on"));
    });

    /* card click opens detail; touch devices toggle the preview */
    node.addEventListener("click", function () {
      toast("Opening details — " + data.t);
    });

    /* keyboard: Enter/Space activate, Escape closes touch-open preview */
    node.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target === node) {
          e.preventDefault();
          toast("Opening details — " + data.t);
        }
      } else if (e.key === "Escape") {
        node.classList.remove("is-open");
      }
    });

    return node;
  }

  /* ---------- Populate tracks ---------- */
  var tracks = document.querySelectorAll("[data-track]");
  if (tracks[0]) {
    continueData.forEach(function (d, i) {
      tracks[0].appendChild(buildCard(d, i + 1, {}));
    });
  }
  if (tracks[1]) {
    titles.slice(0, 10).forEach(function (d, i) {
      tracks[1].appendChild(buildCard(d, i, { rank: i + 1 }));
    });
  }

  /* ---------- Populate grid ---------- */
  var grid = document.querySelector("[data-grid]");
  if (grid) {
    titles.forEach(function (d, i) {
      grid.appendChild(buildCard(d, i, {}));
    });
    var count = document.querySelector("[data-grid-count]");
    if (count) count.textContent = titles.length + " titles";
  }

  /* ---------- Row scroll buttons ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var track = btn.closest(".row").querySelector("[data-track]");
      if (track) track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  /* ---------- Sticky topbar shade ---------- */
  var topbar = document.getElementById("topbar");
  function onScroll() {
    topbar.classList.toggle("is-stuck", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Touch: tap toggles preview (no hover) ---------- */
  if (window.matchMedia("(hover: none)").matches) {
    document.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      document.querySelectorAll(".card.is-open").forEach(function (c) {
        if (c !== card) c.classList.remove("is-open");
      });
      if (card && !e.target.closest("button")) {
        card.classList.toggle("is-open");
      }
    });
  }

  /* ---------- Hero actions ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast(b.getAttribute("data-toast"));
    });
  });
})();
