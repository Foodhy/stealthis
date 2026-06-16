(function () {
  "use strict";

  // --- Fictional collection data -------------------------------------------
  // span = [colSpan, rowSpan] for the salon-hang grid (6 cols, 26px rows).
  var WORKS = [
    {
      cat: "AC.1903.041", title: "Harbour at First Light", artist: "Élise Vaugirard",
      date: "1903", medium: "Etching & aquatint", dims: "24 × 31 cm (plate)",
      credit: "Bequest of M. Aldworth, 1947", span: [3, 7], star: true,
      hue: 206, sat: 22, light: 64,
      note: "A late printing from the Marseille suite, prized for its silvered tonal range across the morning water."
    },
    {
      cat: "AC.1888.012", title: "Study of Folded Linen", artist: "Tomas Halvorsen",
      date: "1888", medium: "Graphite on laid paper", dims: "19 × 14 cm",
      credit: "Gift of the Halvorsen estate", span: [2, 5],
      hue: 36, sat: 14, light: 76,
      note: "A working drawing for the unrealised altarpiece at Bergen; the cross-hatching shows the artist's characteristic restraint."
    },
    {
      cat: "AC.1921.207", title: "Nocturne, Pont Neuf", artist: "Renaud Sauvage",
      date: "1921", medium: "Lithograph", dims: "28 × 39 cm",
      credit: "Purchased with the Founders' Fund", span: [3, 6],
      hue: 224, sat: 30, light: 32,
      note: "Sauvage pulled only forty impressions before the stone was effaced. The river is rendered almost entirely in reserve."
    },
    {
      cat: "AC.1875.003", title: "Pomegranate & Glass", artist: "Beatrix Lund",
      date: "1875", medium: "Watercolour & gouache", dims: "17 × 22 cm",
      credit: "Bequest of M. Aldworth, 1947", span: [2, 5],
      hue: 4, sat: 46, light: 52,
      note: "An early still life from Lund's Antwerp years, notable for the warm bloom on the fruit's skin."
    },
    {
      cat: "AC.1910.118", title: "The Reading Room", artist: "Cosima Errante",
      date: "1910", medium: "Mezzotint", dims: "26 × 20 cm",
      credit: "Gift of the Errante circle", span: [2, 6],
      hue: 30, sat: 10, light: 40,
      note: "Errante's velvety blacks were achieved through repeated rocking of the plate, a technique she taught at the Brera."
    },
    {
      cat: "AC.1896.054", title: "Cypress Road, Evening", artist: "Henri Delacourt",
      date: "1896", medium: "Coloured woodcut", dims: "21 × 30 cm",
      credit: "Purchased, 1962", span: [3, 5],
      hue: 96, sat: 24, light: 44,
      note: "Three blocks in olive, ochre and a thin grey key. A rare complete impression with the artist's red seal."
    },
    {
      cat: "AC.1932.290", title: "Self-Portrait, Turned", artist: "Iris Vanmeer",
      date: "1932", medium: "Drypoint", dims: "18 × 13 cm", star: true,
      credit: "Aldworth acquisition, 1949", span: [2, 6],
      hue: 18, sat: 18, light: 58,
      note: "The burr is unusually rich in this early state, lending the shoulder a smoky softness later impressions lose."
    },
    {
      cat: "AC.1869.009", title: "Marsh Birds at Dusk", artist: "Gustav Reinholt",
      date: "1869", medium: "Steel engraving", dims: "15 × 24 cm",
      credit: "Bequest of M. Aldworth, 1947", span: [3, 5],
      hue: 168, sat: 16, light: 50,
      note: "A topographical plate later hand-finished by the artist with touches of bodycolour in the reeds."
    },
    {
      cat: "AC.1915.142", title: "Two Pears on a Sill", artist: "Beatrix Lund",
      date: "1915", medium: "Pastel on tinted paper", dims: "20 × 26 cm",
      credit: "Gift of an anonymous donor", span: [2, 5],
      hue: 48, sat: 40, light: 60,
      note: "A late return to still life; the chalky greens recall her Antwerp watercolours four decades earlier."
    }
  ];

  var GRAD = [
    [165, 14, 88], [25, 8, 96]
  ];

  // --- SVG art placeholder -------------------------------------------------
  function hsl(h, s, l) { return "hsl(" + h + "," + s + "%," + l + "%)"; }

  function artSVG(w, i) {
    var h = w.hue, s = w.sat, l = w.light;
    var id = "g" + i;
    var motif = "";
    // a few abstract motifs so frames read differently
    if (i % 3 === 0) {
      motif =
        '<circle cx="50" cy="58" r="20" fill="' + hsl(h, s + 8, Math.max(20, l - 20)) + '" opacity="0.55"/>' +
        '<rect x="0" y="74" width="100" height="26" fill="' + hsl(h, s, Math.max(16, l - 30)) + '" opacity="0.45"/>';
    } else if (i % 3 === 1) {
      motif =
        '<path d="M0 70 L28 44 L48 60 L74 30 L100 52 L100 100 L0 100 Z" fill="' + hsl(h, s + 6, Math.max(18, l - 24)) + '" opacity="0.5"/>';
    } else {
      motif =
        '<rect x="18" y="20" width="64" height="60" fill="none" stroke="' + hsl(h, s, Math.max(20, l - 26)) + '" stroke-width="3" opacity="0.55"/>' +
        '<line x1="18" y1="50" x2="82" y2="50" stroke="' + hsl(h, s, Math.max(20, l - 26)) + '" stroke-width="2" opacity="0.4"/>';
    }
    return (
      '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Artwork plate">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + hsl(h, s, Math.min(92, l + 18)) + '"/>' +
          '<stop offset="1" stop-color="' + hsl(h, s, l) + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="100" height="100" fill="url(#' + id + ')"/>' +
        motif +
      '</svg>'
    );
  }

  // --- Render frames -------------------------------------------------------
  var wall = document.getElementById("wall");
  var railNote = document.getElementById("railNote");

  WORKS.forEach(function (w, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "frame";
    btn.dataset.index = String(i);
    btn.style.setProperty("--col", w.span[0]);
    btn.style.setProperty("--row", w.span[1]);
    btn.style.gridColumn = "span " + w.span[0];
    btn.style.gridRow = "span " + w.span[1];
    btn.setAttribute(
      "aria-label",
      w.title + " by " + w.artist + ", " + w.date + ". Open label."
    );

    var badge = w.star
      ? '<span class="frame__badge frame__badge--star">Highlight</span>'
      : '<span class="frame__badge">' + w.medium.split(" ")[0] + '</span>';

    btn.innerHTML =
      '<span class="frame__mat">' +
        '<span class="frame__plate">' + badge + artSVG(w, i) + '</span>' +
        '<span class="frame__cap">' +
          '<span class="frame__title">' + w.title + '</span>' +
          '<span class="frame__cat">' + w.cat + '</span>' +
        '</span>' +
        '<span class="frame__artist">' + w.artist + ', ' + w.date + '</span>' +
      '</span>';

    btn.addEventListener("click", function () { openLabel(i); });
    wall.appendChild(btn);
  });

  // dim siblings while hovering anywhere over the wall
  wall.addEventListener("mouseover", function (e) {
    if (e.target.closest(".frame")) wall.classList.add("is-hovering");
  });
  wall.addEventListener("mouseleave", function () {
    wall.classList.remove("is-hovering");
  });
  wall.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget || !wall.contains(e.relatedTarget)) {
      wall.classList.remove("is-hovering");
    }
  });

  // --- Layout switch -------------------------------------------------------
  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg"));
  segs.forEach(function (seg) {
    seg.addEventListener("click", function () {
      var layout = seg.dataset.layout;
      if (wall.dataset.layout === layout) return;
      wall.dataset.layout = layout;
      segs.forEach(function (s) {
        var on = s === seg;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (layout === "salon") {
        railNote.textContent =
          "Salon hang — works are massed by tonal weight, not chronology.";
        toast("Salon hang");
      } else {
        railNote.textContent =
          "Single-line works are hung to a common centre line at 145 cm.";
        toast("Eye-level line");
      }
    });
  });

  // --- Label popover -------------------------------------------------------
  var pop = document.getElementById("labelPop");
  var lpClose = document.getElementById("lpClose");
  var lastFocus = null;

  function openLabel(i) {
    var w = WORKS[i];
    lastFocus = document.activeElement;
    document.getElementById("lpCat").textContent = "Cat. no. " + w.cat;
    document.getElementById("lpTitle").textContent = w.title;
    document.getElementById("lpArtist").textContent = w.artist;
    document.getElementById("lpDate").textContent = w.date;
    document.getElementById("lpMedium").textContent = w.medium;
    document.getElementById("lpDims").textContent = w.dims;
    document.getElementById("lpCredit").textContent = w.credit;
    document.getElementById("lpNote").textContent = w.note;

    var tags = document.getElementById("lpTags");
    tags.innerHTML = "";
    [w.medium, w.star ? "Gallery highlight" : "On view", "Works on paper"].forEach(function (t) {
      var el = document.createElement("span");
      el.className = "tag";
      el.textContent = t;
      tags.appendChild(el);
    });

    pop.hidden = false;
    lpClose.focus();
  }

  function closeLabel() {
    pop.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  lpClose.addEventListener("click", closeLabel);
  pop.addEventListener("click", function (e) {
    if (e.target === pop) closeLabel();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !pop.hidden) closeLabel();
  });

  // --- Toast helper --------------------------------------------------------
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1800);
  }
})();
