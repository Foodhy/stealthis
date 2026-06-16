(function () {
  "use strict";

  var ERAS = {
    baroque:       { label: "Baroque",       color: "#7a5b8e", from: 1600, to: 1740 },
    romantic:      { label: "Romanticism",   color: "#9c5b3f", from: 1780, to: 1860 },
    impressionist: { label: "Impressionism", color: "#4a86a8", from: 1860, to: 1905 },
    modern:        { label: "Modernism",     color: "#b8842c", from: 1905, to: 1965 },
    contemporary:  { label: "Contemporary",  color: "#3f7d56", from: 1965, to: 2025 }
  };

  var BAND_ORDER = ["baroque", "romantic", "impressionist", "modern", "contemporary"];

  var MILESTONES = [
    { year: 1621, era: "baroque", title: "Supper at Emmaus, after the Master", artist: "Workshop of Lievin de Vos",
      medium: "Oil on oak panel", dims: "94 × 121 cm", cat: "ALD.1621.04", credit: "Bequest of M. Aldworth, 1903",
      note: "An early devotional canvas pressing dramatic chiaroscuro into a domestic interior — the cornerstone of the collection's Baroque holdings.", plate: ["#2c2418", "#7a5b8e"] },
    { year: 1668, era: "baroque", title: "The Cartographer's Table", artist: "Anneke Brouwer",
      medium: "Oil on canvas", dims: "71 × 58 cm", cat: "ALD.1668.11", credit: "Purchase, the Founders' Fund",
      note: "A quiet still life of instruments and parchment, prized for its raking northern light and meticulous tonal recession.", plate: ["#3a2e1c", "#8f6a4a"] },
    { year: 1804, era: "romantic", title: "Storm over the Salt Marsh", artist: "Edmund Hale",
      medium: "Oil on canvas", dims: "112 × 168 cm", cat: "ALD.1804.02", credit: "Gift of the Hale family, 1958",
      note: "Romanticism's sublime made literal: weather as feeling. The horizon dissolves into vapour above a flooded coastal flat.", plate: ["#5a3a28", "#9c5b3f"] },
    { year: 1839, era: "romantic", title: "The Wanderer at Greylock", artist: "Edmund Hale",
      medium: "Oil on canvas", dims: "98 × 76 cm", cat: "ALD.1839.07", credit: "Purchase, 1971",
      note: "A lone figure dwarfed by ridge and cloud — the artist's most reproduced meditation on solitude and scale.", plate: ["#4a3324", "#b07a52"] },
    { year: 1874, era: "impressionist", title: "Quai des Lilas, Morning", artist: "Hélène Marchand",
      medium: "Oil on canvas", dims: "60 × 73 cm", cat: "ALD.1874.13", credit: "Bequest of C. Verlaine, 1929",
      note: "Painted en plein air over three damp mornings; broken touches of violet and pale gold dissolve the riverbank into light.", plate: ["#3a5a6e", "#9fc2d2"] },
    { year: 1888, era: "impressionist", title: "The Conservatory Window", artist: "Hélène Marchand",
      medium: "Pastel on laid paper", dims: "48 × 39 cm", cat: "ALD.1888.05", credit: "Acquired with assistance of the Friends",
      note: "Glass, fern and reflected sky rendered almost entirely in chalk — a tour de force of atmospheric pastel.", plate: ["#4a86a8", "#cfe2ea"] },
    { year: 1912, era: "modern", title: "Composition with Three Verticals", artist: "Viktor Steyn",
      medium: "Oil on linen", dims: "130 × 97 cm", cat: "ALD.1912.01", credit: "Purchase, the Modern Fund, 1962",
      note: "An early step toward abstraction: the figure is gone, the structure remains. Architecture of pure colour and edge.", plate: ["#b8842c", "#e6c879"] },
    { year: 1937, era: "modern", title: "Machine Pastoral", artist: "Inés Carrega",
      medium: "Tempera and graphite on board", dims: "82 × 110 cm", cat: "ALD.1937.09", credit: "Gift of the artist's estate",
      note: "Cogs and cornfields share one flattened plane — a wry interwar dialogue between industry and the land.", plate: ["#8a6a1c", "#d4b85a"] },
    { year: 1961, era: "modern", title: "Field No. 7 (Cadmium)", artist: "Roy Asher",
      medium: "Acrylic on unprimed canvas", dims: "203 × 178 cm", cat: "ALD.1961.18", credit: "Purchase, 1979",
      note: "Stained colour soaks the weave directly — scale and saturation become the whole subject of the work.", plate: ["#c46a2a", "#f0a85a"] },
    { year: 1978, era: "contemporary", title: "Inventory of a Borrowed Room", artist: "Dana Okafor",
      medium: "Mixed media installation (documented)", dims: "Dimensions variable", cat: "ALD.1978.22", credit: "Commissioned by the gallery",
      note: "A reconstructed domestic interior of found objects, catalogued like specimens. Memory presented as archive.", plate: ["#2f6a48", "#7fb893"] },
    { year: 1996, era: "contemporary", title: "Signal / Noise", artist: "Mara Lindqvist",
      medium: "Single-channel video, 11 min", dims: "Edition 2 of 5", cat: "ALD.1996.31", credit: "Gift of the Lindqvist Foundation",
      note: "Looped broadcast static resolving, almost, into a face. An early gallery acquisition of time-based media.", plate: ["#1c4a34", "#56a578"] },
    { year: 2019, era: "contemporary", title: "Carbon Garden", artist: "Joon-ho Bae",
      medium: "Reclaimed steel and living moss", dims: "240 × 180 × 90 cm", cat: "ALD.2019.40", credit: "Purchase, the Sustainability Fund",
      note: "A growing sculpture maintained by the conservation team — the collection's most recent and only living work.", plate: ["#3f7d56", "#a3d4b3"] }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var track = $("#track");
  var bands = $("#bands");
  var scrub = $("#scrub");
  var scrubYear = $("#scrubYear");
  var detail = $("#detail");
  var count = $("#count");
  var toastEl = $("#toast");

  var activeEra = "all";
  var openYear = null;

  /* ---- toast ---- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  function plate(colors) {
    return "linear-gradient(135deg, " + colors[0] + " 0%, " + colors[1] + " 100%)";
  }

  /* ---- build scrubber bands ---- */
  function buildBands() {
    var min = 1600, max = 2025, span = max - min;
    BAND_ORDER.forEach(function (key) {
      var e = ERAS[key];
      var el = document.createElement("div");
      el.className = "scrubber__band";
      el.dataset.era = key;
      el.style.flex = ((e.to - e.from) / span) + " 1 0";
      el.style.background = e.color;
      el.style.marginLeft = "0";
      el.textContent = e.label;
      bands.appendChild(el);
    });
  }

  /* ---- build milestones ---- */
  function buildTrack() {
    track.innerHTML = "";
    MILESTONES.forEach(function (m, i) {
      var era = ERAS[m.era];
      var li = document.createElement("li");
      li.className = "milestone";
      li.dataset.era = m.era;
      li.dataset.year = String(m.year);
      li.style.setProperty("--era", era.color);

      li.innerHTML =
        '<span class="milestone__marker"></span>' +
        '<span class="milestone__year">' + m.year + '</span>' +
        '<button class="milestone__card" type="button" aria-expanded="false">' +
          '<span class="milestone__plate" style="background:' + plate(m.plate) + '"></span>' +
          '<span class="milestone__text">' +
            '<span class="milestone__badge">' + era.label + '</span>' +
            '<span class="milestone__title">' + m.title + '</span>' +
            '<span class="milestone__artist">' + m.artist + '</span>' +
          '</span>' +
        '</button>';

      var btn = li.querySelector(".milestone__card");
      btn.addEventListener("click", function () { openDetail(m, li, btn); });
      track.appendChild(li);
    });
    updateCount();
  }

  /* ---- detail ---- */
  function openDetail(m, li, btn) {
    var era = ERAS[m.era];
    $$(".milestone").forEach(function (n) {
      n.classList.remove("is-open");
      var b = n.querySelector(".milestone__card");
      if (b) b.setAttribute("aria-expanded", "false");
    });
    li.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    openYear = m.year;

    var card = $(".detail__card");
    card.style.setProperty("--era", era.color);
    $("#detailPlate").style.background = plate(m.plate);
    $("#detailEra").textContent = era.label + " · " + era.from + "–" + era.to;
    $("#detailYear").textContent = m.year;
    $("#detailTitle").textContent = m.title;
    $("#detailArtist").textContent = m.artist;
    $("#detailNote").textContent = m.note;

    var meta = $("#detailMeta");
    meta.innerHTML = "";
    var rows = [
      ["Medium", m.medium],
      ["Dimensions", m.dims],
      ["Catalogue", m.cat],
      ["Credit", m.credit]
    ];
    rows.forEach(function (r) {
      var dt = document.createElement("dt"); dt.textContent = r[0];
      var dd = document.createElement("dd"); dd.textContent = r[1];
      meta.appendChild(dt); meta.appendChild(dd);
    });

    detail.hidden = false;
    // sync scrubber + center the card
    scrub.value = String(m.year);
    onScrub(true);
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    centerMilestone(li);
  }

  function closeDetail() {
    detail.hidden = true;
    openYear = null;
    $$(".milestone").forEach(function (n) {
      n.classList.remove("is-open");
      var b = n.querySelector(".milestone__card");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  $("#detailClose").addEventListener("click", function () {
    closeDetail();
    toast("Label closed");
  });

  /* ---- era filter ---- */
  function setEra(era) {
    activeEra = era;
    $$(".era-chip").forEach(function (c) {
      var on = c.dataset.era === era;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$(".scrubber__band").forEach(function (b) {
      b.classList.toggle("is-dim", era !== "all" && b.dataset.era !== era);
    });
    $$(".milestone").forEach(function (n) {
      n.classList.toggle("is-faded", era !== "all" && n.dataset.era !== era);
    });
    updateCount();
    if (era !== "all") {
      var first = $('.milestone[data-era="' + era + '"]');
      if (first) centerMilestone(first);
      var e = ERAS[era];
      toast(e.label + " — " + e.from + " to " + e.to);
    } else {
      toast("Showing all five eras");
    }
  }

  $$(".era-chip").forEach(function (chip) {
    chip.addEventListener("click", function () { setEra(chip.dataset.era); });
  });

  /* ---- scrubber ---- */
  function nearestMilestone(year) {
    var best = MILESTONES[0], bestD = Infinity;
    MILESTONES.forEach(function (m) {
      if (activeEra !== "all" && m.era !== activeEra) return;
      var d = Math.abs(m.year - year);
      if (d < bestD) { bestD = d; best = m; }
    });
    return best;
  }

  function eraAt(year) {
    for (var i = 0; i < BAND_ORDER.length; i++) {
      var e = ERAS[BAND_ORDER[i]];
      if (year >= e.from && year <= e.to) return BAND_ORDER[i];
    }
    return null;
  }

  function onScrub(silent) {
    var year = parseInt(scrub.value, 10);
    scrubYear.textContent = year;
    var era = eraAt(year);
    $$(".scrubber__band").forEach(function (b) {
      b.classList.toggle("is-dim", !!era && b.dataset.era !== era);
    });
    if (!silent) {
      var m = nearestMilestone(year);
      var li = $('.milestone[data-year="' + m.year + '"]');
      if (li) centerMilestone(li);
    }
  }

  scrub.addEventListener("input", function () { onScrub(false); });

  function centerMilestone(li) {
    if (!li) return;
    var isVertical = window.matchMedia("(max-width: 520px)").matches;
    li.scrollIntoView({ behavior: "smooth", block: isVertical ? "center" : "nearest", inline: "center" });
  }

  function updateCount() {
    var n = activeEra === "all"
      ? MILESTONES.length
      : MILESTONES.filter(function (m) { return m.era === activeEra; }).length;
    var label = activeEra === "all" ? "across five eras" : "in " + ERAS[activeEra].label;
    count.textContent = n + " milestones " + label;
  }

  /* ---- keyboard: arrows step through visible milestones ---- */
  function visibleMilestones() {
    return MILESTONES.filter(function (m) {
      return activeEra === "all" || m.era === activeEra;
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !detail.hidden) {
      closeDetail();
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input") return; // let the range slider handle its own arrows
    var list = visibleMilestones();
    if (!list.length) return;
    var idx = 0;
    if (openYear != null) {
      for (var i = 0; i < list.length; i++) { if (list[i].year === openYear) { idx = i; break; } }
      idx += (e.key === "ArrowRight" ? 1 : -1);
    } else {
      idx = e.key === "ArrowRight" ? 0 : list.length - 1;
    }
    idx = Math.max(0, Math.min(list.length - 1, idx));
    var m = list[idx];
    var li = $('.milestone[data-year="' + m.year + '"]');
    var btn = li && li.querySelector(".milestone__card");
    if (btn) { btn.focus(); openDetail(m, li, btn); }
    e.preventDefault();
  });

  /* ---- init ---- */
  buildBands();
  buildTrack();
  onScrub(true);
  updateCount();
})();
