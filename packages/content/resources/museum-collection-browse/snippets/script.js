/* Meridian Museum — Collection Browse (vanilla JS, client-side) */
(function () {
  "use strict";

  // Gradient palettes used as artwork "images"
  function art(a, b, angle) {
    return "linear-gradient(" + angle + "deg, " + a + ", " + b + ")";
  }

  // Seeded collection — fictional objects
  var OBJECTS = [
    { id: 1, title: "Harbour at First Light", artist: "Eulalie Verne", year: 1873, acq: 1924, era: "19th Century", medium: "Painting", gallery: "Gallery 4", department: "European Paintings", catalog: "MM.1924.041", g: art("#3a5a78", "#9fb6c4", 145), sig: "EV", desc: "Oil on canvas. A study of dawn over the northern docks, prized for its restrained palette and the cold luminosity of its sky." },
    { id: 2, title: "Bronze Figure, Reclining", artist: "Tomás Aldebrand", year: 1961, acq: 1998, era: "Modern", medium: "Sculpture", gallery: "Gallery 9", department: "Modern & Contemporary", catalog: "MM.1998.207", g: art("#6b5a3e", "#3a2f1f", 160), sig: "TA", desc: "Cast bronze with a deep umber patina. Aldebrand's reclining form distills the human body into three continuous gestures." },
    { id: 3, title: "Loom Fragment, Saffron Border", artist: "Unknown (Kesh region)", year: 1480, acq: 1907, era: "Pre-1600", medium: "Textile", gallery: "Gallery 1", department: "Textiles & Costume", catalog: "MM.1907.012", g: art("#c79a3a", "#7a4f1d", 135), sig: "✦", desc: "Silk and gold-wrapped thread. A surviving border fragment whose saffron field has held its intensity for five centuries." },
    { id: 4, title: "The Cartographer's Table", artist: "Iris Mwangi", year: 2014, acq: 2016, era: "Contemporary", medium: "Painting", gallery: "Gallery 11", department: "Modern & Contemporary", catalog: "MM.2016.318", g: art("#7a3b52", "#2a1822", 150), sig: "IM", desc: "Acrylic and graphite on panel. Mwangi layers route lines and erasures into a meditation on mapping and forgetting." },
    { id: 5, title: "Study of Hands", artist: "Eulalie Verne", year: 1869, acq: 1924, era: "19th Century", medium: "Works on Paper", gallery: "Gallery 4", department: "Prints & Drawings", catalog: "MM.1924.039", g: art("#d8cdb6", "#a89b7f", 120), sig: "EV", desc: "Red chalk on laid paper. Six positions of a sitter's hands, drawn in a single afternoon according to the artist's notes." },
    { id: 6, title: "Amphora with Dancers", artist: "Workshop of Halios", year: -430, acq: 1889, era: "Antiquity", medium: "Ceramic", gallery: "Gallery 2", department: "Ancient Art", catalog: "MM.1889.004", g: art("#b1633a", "#2a1410", 140), sig: "⚱", desc: "Terracotta with black-figure decoration. A procession of dancers circles the body of this storage vessel." },
    { id: 7, title: "Nocturne in Indigo", artist: "Søren Haugaard", year: 1908, acq: 1951, era: "20th Century", medium: "Painting", gallery: "Gallery 6", department: "European Paintings", catalog: "MM.1951.122", g: art("#1f2a4a", "#3f5a8a", 155), sig: "SH", desc: "Oil on canvas. A near-monochrome evening interior in which a single lamp anchors the composition." },
    { id: 8, title: "Pendant, Coiled Serpent", artist: "Unknown (Volterra)", year: 1290, acq: 1912, era: "Pre-1600", medium: "Decorative Arts", gallery: "Gallery 1", department: "Decorative Arts", catalog: "MM.1912.058", g: art("#c9a227", "#6e4f12", 130), sig: "❖", desc: "Gold and enamel. A devotional pendant whose coiled serpent motif suggests guild ownership rather than personal piety." },
    { id: 9, title: "Field Recordings (Triptych)", artist: "Priya Sundaram", year: 2019, acq: 2021, era: "Contemporary", medium: "Photography", gallery: "Gallery 12", department: "Photography", catalog: "MM.2021.402", g: art("#4a6b4a", "#1c2a1c", 150), sig: "PS", desc: "Archival pigment prints. Three views of the same wetland at successive dawns, printed at large scale." },
    { id: 10, title: "Marble Head of a Youth", artist: "Roman copy after Greek original", year: 120, acq: 1894, era: "Antiquity", medium: "Sculpture", gallery: "Gallery 2", department: "Ancient Art", catalog: "MM.1894.019", g: art("#d6d2c6", "#9b9588", 125), sig: "⚜", desc: "Marble. A serene youth, the surface lightly weathered, likely once part of a full standing figure." },
    { id: 11, title: "Quilt, Lantern Court", artist: "Hannah Fells", year: 1851, acq: 1977, era: "19th Century", medium: "Textile", gallery: "Gallery 3", department: "Textiles & Costume", catalog: "MM.1977.165", g: art("#b4493a", "#6b2a22", 135), sig: "HF", desc: "Pieced cotton. A pattern of interlocking lanterns assembled from dress scraps over an entire winter." },
    { id: 12, title: "Self-Portrait at the Window", artist: "Søren Haugaard", year: 1921, acq: 1951, era: "20th Century", medium: "Painting", gallery: "Gallery 6", department: "European Paintings", catalog: "MM.1951.130", g: art("#5a4a3a", "#2a2018", 145), sig: "SH", desc: "Oil on canvas. The artist regards the viewer beside a pane of leaded glass, the only one in his late work." },
    { id: 13, title: "Vessel, Folded Form", artist: "Mei-Ling Chao", year: 1987, acq: 2003, era: "Modern", medium: "Ceramic", gallery: "Gallery 9", department: "Decorative Arts", catalog: "MM.2003.261", g: art("#7a7468", "#3a3631", 160), sig: "MC", desc: "Stoneware with ash glaze. The walls appear pressed inward, a signature of Chao's mature studio period." },
    { id: 14, title: "Migration Map No. 3", artist: "Iris Mwangi", year: 2017, acq: 2018, era: "Contemporary", medium: "Works on Paper", gallery: "Gallery 11", department: "Prints & Drawings", catalog: "MM.2018.355", g: art("#3a6b78", "#163038", 150), sig: "IM", desc: "Screenprint and ink. Overlapping flight paths rendered in successive translucent layers." },
    { id: 15, title: "The Orchard Keeper", artist: "Beatrix Lund", year: 1894, acq: 1939, era: "19th Century", medium: "Painting", gallery: "Gallery 5", department: "European Paintings", catalog: "MM.1939.088", g: art("#6b7a3a", "#2f3a18", 140), sig: "BL", desc: "Oil on canvas. A figure pauses among low fruit trees, the light filtered to a dusty gold." },
    { id: 16, title: "Ceremonial Mantle", artist: "Unknown (Andean)", year: 600, acq: 1921, era: "Antiquity", medium: "Textile", gallery: "Gallery 2", department: "Ancient Art", catalog: "MM.1921.073", g: art("#a8442f", "#3a1813", 130), sig: "✦", desc: "Camelid fiber. A mantle whose stepped motifs retain remarkable saturation given its age." },
    { id: 17, title: "Untitled (Red Threshold)", artist: "Caleb Ferro", year: 1972, acq: 1990, era: "Modern", medium: "Painting", gallery: "Gallery 10", department: "Modern & Contemporary", catalog: "MM.1990.194", g: art("#b4493a", "#7a2018", 155), sig: "CF", desc: "Oil and wax on linen. A single vertical band divides a field of layered crimson." },
    { id: 18, title: "Letter Press, Type Specimen", artist: "Atelier Brun", year: 1788, acq: 1955, era: "Pre-1800", medium: "Works on Paper", gallery: "Gallery 7", department: "Prints & Drawings", catalog: "MM.1955.141", g: art("#cfc7b3", "#8c8470", 120), sig: "AB", desc: "Letterpress on rag paper. A full specimen sheet from a short-lived provincial foundry." },
    { id: 19, title: "Standing Crane, Lacquer", artist: "Workshop of Sano", year: 1690, acq: 1933, era: "Pre-1800", medium: "Decorative Arts", gallery: "Gallery 8", department: "Decorative Arts", catalog: "MM.1933.077", g: art("#1c1b19", "#4a4036", 150), sig: "❖", desc: "Lacquered wood with gold maki-e. A crane in profile, wings half-raised, on a black ground." },
    { id: 20, title: "Coastline, Fog", artist: "Priya Sundaram", year: 2020, acq: 2022, era: "Contemporary", medium: "Photography", gallery: "Gallery 12", department: "Photography", catalog: "MM.2022.418", g: art("#8c95a0", "#3a4048", 150), sig: "PS", desc: "Archival pigment print. The horizon dissolves entirely, leaving a graded field of grey." },
    { id: 21, title: "Reliquary Casket", artist: "Unknown (Limoges)", year: 1230, acq: 1901, era: "Pre-1600", medium: "Decorative Arts", gallery: "Gallery 1", department: "Decorative Arts", catalog: "MM.1901.006", g: art("#3a6b78", "#c9a227", 130), sig: "❖", desc: "Champlevé enamel on copper. Saints in procession across the lid, the blues still vivid." },
    { id: 22, title: "Two Figures, Argument", artist: "Tomás Aldebrand", year: 1958, acq: 1998, era: "Modern", medium: "Works on Paper", gallery: "Gallery 9", department: "Prints & Drawings", catalog: "MM.1998.211", g: art("#4a4640", "#1c1b19", 145), sig: "TA", desc: "Charcoal on paper. A preparatory sketch for the artist's later bronze of the same name." },
    { id: 23, title: "Garden Wall, Summer", artist: "Beatrix Lund", year: 1901, acq: 1939, era: "20th Century", medium: "Painting", gallery: "Gallery 5", department: "European Paintings", catalog: "MM.1939.094", g: art("#c2a86b", "#7a6238", 140), sig: "BL", desc: "Oil on board. A sun-warmed garden wall, the brushwork loosening toward the upper edge." },
    { id: 24, title: "Suspended (Glass)", artist: "Mei-Ling Chao", year: 2009, acq: 2012, era: "Contemporary", medium: "Sculpture", gallery: "Gallery 12", department: "Modern & Contemporary", catalog: "MM.2012.297", g: art("#9fb6c4", "#3a5a78", 160), sig: "MC", desc: "Blown and cut glass. Twelve forms hung at varied heights, refracting the gallery's daylight." }
  ];

  var FACETS = ["era", "medium", "gallery", "department"];
  // Preserve a sensible chronological order for eras
  var ERA_ORDER = ["Antiquity", "Pre-1600", "Pre-1800", "19th Century", "20th Century", "Modern", "Contemporary"];

  var state = { era: new Set(), medium: new Set(), gallery: new Set(), department: new Set(), sort: "newest" };
  var saved = new Set();

  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var resultCount = document.getElementById("resultCount");
  var activeChips = document.getElementById("activeChips");
  var sortSelect = document.getElementById("sortSelect");

  var labels = {
    era: "Era", medium: "Medium", gallery: "Gallery", department: "Department"
  };

  function uniqueValues(facet) {
    var counts = {};
    OBJECTS.forEach(function (o) {
      counts[o[facet]] = (counts[o[facet]] || 0) + 1;
    });
    var keys = Object.keys(counts);
    if (facet === "era") {
      keys.sort(function (a, b) { return ERA_ORDER.indexOf(a) - ERA_ORDER.indexOf(b); });
    } else {
      keys.sort(function (a, b) {
        // natural-ish sort so Gallery 2 < Gallery 11
        return a.localeCompare(b, undefined, { numeric: true });
      });
    }
    return keys.map(function (k) { return { value: k, count: counts[k] }; });
  }

  function buildFacets() {
    FACETS.forEach(function (facet) {
      var container = document.querySelector('[data-facet="' + facet + '"] .filter-list');
      container.innerHTML = "";
      uniqueValues(facet).forEach(function (item) {
        var id = facet + "-" + item.value.replace(/[^a-z0-9]+/gi, "-");
        var label = document.createElement("label");
        label.className = "facet";
        label.innerHTML =
          '<input type="checkbox" value="' + escapeAttr(item.value) + '" id="' + id + '">' +
          '<span class="box" aria-hidden="true"></span>' +
          '<span class="facet-name">' + escapeHtml(item.value) + "</span>" +
          '<span class="facet-count">' + item.count + "</span>";
        var input = label.querySelector("input");
        input.addEventListener("change", function () {
          if (input.checked) state[facet].add(item.value);
          else state[facet].delete(item.value);
          render();
        });
        container.appendChild(label);
      });
    });
  }

  function matches(o) {
    return FACETS.every(function (facet) {
      var sel = state[facet];
      return sel.size === 0 || sel.has(o[facet]);
    });
  }

  function sortObjects(list) {
    var s = state.sort;
    return list.slice().sort(function (a, b) {
      if (s === "newest") return b.acq - a.acq || a.title.localeCompare(b.title);
      if (s === "oldest") return a.acq - b.acq || a.title.localeCompare(b.title);
      if (s === "az") return a.title.localeCompare(b.title);
      if (s === "za") return b.title.localeCompare(a.title);
      return 0;
    });
  }

  function yearLabel(y) {
    return y < 0 ? Math.abs(y) + " BCE" : String(y);
  }

  function render() {
    var filtered = sortObjects(OBJECTS.filter(matches));

    // Result count
    var total = OBJECTS.length;
    resultCount.innerHTML =
      "<span>" + filtered.length + "</span> of " + total + " objects";

    // Active chips
    renderChips();

    // Grid
    grid.innerHTML = "";
    if (filtered.length === 0) {
      empty.hidden = false;
      grid.hidden = true;
      return;
    }
    empty.hidden = true;
    grid.hidden = false;

    filtered.forEach(function (o, i) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.style.animationDelay = Math.min(i * 22, 320) + "ms";
      card.setAttribute("aria-label", o.title + " by " + o.artist + ", quick view");
      card.innerHTML =
        '<div class="card-frame">' +
          '<span class="dept-tag">' + escapeHtml(o.department) + "</span>" +
          '<div class="card-art" style="background:' + o.g + '"><span class="sig">' + escapeHtml(o.sig) + "</span></div>" +
        "</div>" +
        '<div class="card-info">' +
          '<div class="card-title">' + escapeHtml(o.title) + "</div>" +
          '<div class="card-artist">' + escapeHtml(o.artist) + "</div>" +
          '<div class="card-meta">' +
            "<span>" + yearLabel(o.year) + "</span>" +
            '<span class="dot">·</span><span>' + escapeHtml(o.medium) + "</span>" +
            '<span class="dot">·</span><span>' + escapeHtml(o.gallery) + "</span>" +
          "</div>" +
          '<div class="card-cat">' + escapeHtml(o.catalog) + "</div>" +
        "</div>";
      card.addEventListener("click", function () { openQuickView(o); });
      grid.appendChild(card);
    });
  }

  function renderChips() {
    activeChips.innerHTML = "";
    FACETS.forEach(function (facet) {
      state[facet].forEach(function (val) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.innerHTML = escapeHtml(val) +
          '<button type="button" aria-label="Remove filter ' + escapeAttr(val) + '">×</button>';
        chip.querySelector("button").addEventListener("click", function () {
          state[facet].delete(val);
          var cb = document.querySelector('[data-facet="' + facet + '"] input[value="' + cssEscape(val) + '"]');
          if (cb) cb.checked = false;
          render();
        });
        activeChips.appendChild(chip);
      });
    });
  }

  /* ---------- Quick view ---------- */
  var overlay = document.getElementById("overlay");
  var qv = overlay.querySelector(".quickview");
  var lastFocus = null;

  function openQuickView(o) {
    lastFocus = document.activeElement;
    document.getElementById("qvArt").style.background = o.g;
    document.getElementById("qvArt").innerHTML = '<span class="sig">' + escapeHtml(o.sig) + "</span>";
    document.getElementById("qvCat").textContent = o.catalog;
    document.getElementById("qvTitle").textContent = o.title;
    document.getElementById("qvArtist").textContent = o.artist + ", " + yearLabel(o.year);
    document.getElementById("qvDesc").textContent = o.desc;

    var meta = document.getElementById("qvMeta");
    var rows = [
      ["Medium", o.medium],
      ["Department", o.department],
      ["Gallery", o.gallery],
      ["Era", o.era],
      ["Acquired", o.acq],
      ["Object no.", o.catalog]
    ];
    meta.innerHTML = rows.map(function (r) {
      return "<dt>" + escapeHtml(r[0]) + "</dt><dd>" + escapeHtml(String(r[1])) + "</dd>";
    }).join("");

    var saveBtn = document.getElementById("qvSave");
    setSaveBtn(saveBtn, o);
    saveBtn.onclick = function () {
      if (saved.has(o.id)) { saved.delete(o.id); toast("Removed from your list"); }
      else { saved.add(o.id); toast("Saved “" + o.title + "”"); }
      setSaveBtn(saveBtn, o);
    };

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    qv.focus();
  }

  function setSaveBtn(btn, o) {
    btn.textContent = saved.has(o.id) ? "✓ Saved to my list" : "Save to my list";
  }

  function closeQuickView() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  overlay.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeQuickView();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeQuickView();
  });

  /* ---------- Controls ---------- */
  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    render();
  });

  document.getElementById("clearAll").addEventListener("click", clearAll);
  document.getElementById("emptyReset").addEventListener("click", clearAll);

  function clearAll() {
    FACETS.forEach(function (f) { state[f].clear(); });
    document.querySelectorAll('.filter-list input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    render();
    toast("Filters cleared");
  }

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }
  function cssEscape(s) { return s.replace(/(["\\])/g, "\\$1"); }

  /* ---------- Init ---------- */
  buildFacets();
  render();
})();
