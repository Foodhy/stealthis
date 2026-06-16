(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Data — fictional destinations. Each scene is rendered as inline
   * SVG (no external images), keyed by `type`.
   * ------------------------------------------------------------- */
  var PHOTOS = [
    { id: 1,  cat: "coast",  type: "coast",  name: "Cala Verde at Slack Tide", loc: "Isola Marenco, Liguria-by-Sea", rating: 4.8, price: 2, best: "May – Jun", h: 320,
      story: "A hidden cove the tide only surrenders twice a day. Locals row out at dawn with espresso and swim before the ferries arrive." },
    { id: 2,  cat: "peaks",  type: "peaks",  name: "The Last Light on Aiguille Blanc", loc: "Col du Reverie, Hautes-Alpes", rating: 4.9, price: 3, best: "Jul – Sep", h: 400,
      story: "Sixteen switchbacks above the refuge, the granite turns the colour of apricots for about nine minutes. Then it is night." },
    { id: 3,  cat: "city",   type: "city",   name: "Neon Hours, Saigon-on-the-Strait", loc: "District Nine, Phorra City", rating: 4.6, price: 1, best: "All year", h: 300,
      story: "Rain on the tram lines doubles every sign. The noodle stall on the corner has been open since 1961 and never closes." },
    { id: 4,  cat: "desert", type: "desert", name: "The Singing Dunes of Qarib", loc: "Sea of Ghita, Eastern Sands", rating: 4.7, price: 2, best: "Oct – Mar", h: 280,
      story: "Slide a foot down the lee face and the whole dune hums a low B-flat. Sunset paints them rose; midnight makes them silver." },
    { id: 5,  cat: "forest", type: "forest", name: "Mossbridge & the Green Falls", loc: "Vale of Tirn, Old Forest", rating: 4.5, price: 1, best: "Apr – Jun", h: 360,
      story: "A footbridge so old the moss has eaten the railings. The falls behind it run loud enough to lose a whole afternoon." },
    { id: 6,  cat: "coast",  type: "lighthouse", name: "Keeper's Light, Cape Lorne", loc: "Windward Point, North Shoals", rating: 4.4, price: 2, best: "Jun – Aug", h: 340,
      story: "Automated since 1987, but the keeper's cottage now pours the best cider on the coast. Watch the beam swing at dusk." },
    { id: 7,  cat: "peaks",  type: "lake",   name: "Mirror Lake, Camp Two", loc: "Basin of Saren, High Country", rating: 4.9, price: 2, best: "Jul – Aug", h: 300,
      story: "Wake before the wind and the whole range hangs upside-down in the water. By nine, a breeze erases it for the day." },
    { id: 8,  cat: "city",   type: "rooftop", name: "Rooftops of the Old Quarter", loc: "Calle Aurora, Vela Antigua", rating: 4.3, price: 1, best: "Sep – Nov", h: 280,
      story: "Terracotta as far as the swifts can fly. Find the unmarked stair beside the bakery; the view costs one warm pastry." },
    { id: 9,  cat: "desert", type: "canyon", name: "The Amber Slot at Noon", loc: "Tarn Wash, Red Mesa", rating: 4.8, price: 3, best: "Apr – Oct", h: 380,
      story: "For ten minutes the sun stands straight overhead and the sandstone glows from within like a struck match." },
    { id: 10, cat: "forest", type: "trail",  name: "The Lantern Trail After Rain", loc: "Kumo Pass, Cedar Highlands", rating: 4.6, price: 2, best: "May – Jul", h: 320,
      story: "Stone lanterns every hundred paces, lit by a volunteer who walks the pass each evening. The cedars drip until midnight." },
    { id: 11, cat: "coast",  type: "harbor", name: "Blue Hour in the Fishing Port", loc: "Porto Lumera, Bay of Sails", rating: 4.7, price: 2, best: "Jun – Sep", h: 300,
      story: "The boats come in heavy and the whole quay smells of salt and frying anchovies. Stay for the auction; it is theatre." },
    { id: 12, cat: "peaks",  type: "northern", name: "The Green Curtain over Ridge Camp", loc: "Fjord of Iska, Far North", rating: 5.0, price: 3, best: "Nov – Feb", h: 360,
      story: "We had nearly given up at three in the morning when the whole sky turned to silk and the snow glowed back at it." }
  ];

  var CAT_LABEL = {
    coast: "Coast", peaks: "Peaks", city: "City", desert: "Desert", forest: "Forest"
  };

  /* ---------------------------------------------------------------
   * Inline SVG "photographs" — layered gradient scenes.
   * ------------------------------------------------------------- */
  function scene(type, w, h) {
    var uid = "g" + Math.random().toString(36).slice(2, 8);
    var open = '<svg class="card__scene" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
    var defs, body;

    switch (type) {
      case "coast":
        defs = grad(uid, [["#7ec8d3", 0], ["#3a9fb0", 45], ["#1f6f7a", 100]], "v");
        body =
          '<path d="M0 ' + h * 0.62 + ' Q' + w * 0.3 + ' ' + h * 0.55 + ' ' + w + ' ' + h * 0.6 + ' V' + h + ' H0 Z" fill="#1c5963"/>' +
          '<path d="M0 ' + h * 0.62 + ' Q' + w * 0.5 + ' ' + h * 0.7 + ' ' + w + ' ' + h * 0.6 + ' V' + h + ' H0 Z" fill="#e7d8c3" opacity=".9"/>' +
          '<circle cx="' + w * 0.78 + '" cy="' + h * 0.26 + '" r="' + h * 0.09 + '" fill="#fff4dd" opacity=".85"/>';
        break;
      case "lighthouse":
        defs = grad(uid, [["#f6c45e", 0], ["#e8623f", 55], ["#7a3358", 100]], "v");
        body =
          '<path d="M0 ' + h * 0.7 + ' H' + w + ' V' + h + ' H0 Z" fill="#21424a"/>' +
          '<rect x="' + w * 0.46 + '" y="' + h * 0.32 + '" width="' + w * 0.08 + '" height="' + h * 0.4 + '" fill="#fbf7f1"/>' +
          '<rect x="' + w * 0.45 + '" y="' + h * 0.32 + '" width="' + w * 0.1 + '" height="' + h * 0.05 + '" fill="#e8623f"/>' +
          '<circle cx="' + w * 0.5 + '" cy="' + h * 0.32 + '" r="' + h * 0.04 + '" fill="#ffe8a3"/>';
        break;
      case "harbor":
        defs = grad(uid, [["#3a4a78", 0], ["#e8623f", 70], ["#f6c45e", 100]], "v");
        body =
          '<path d="M0 ' + h * 0.72 + ' H' + w + ' V' + h + ' H0 Z" fill="#142a3a"/>' +
          boats(w, h) +
          '<circle cx="' + w * 0.2 + '" cy="' + h * 0.26 + '" r="' + h * 0.07 + '" fill="#ffd98a" opacity=".9"/>';
        break;
      case "peaks":
        defs = grad(uid, [["#fbd3a0", 0], ["#e89c6a", 50], ["#9c5a6e", 100]], "v");
        body =
          '<path d="M0 ' + h * 0.66 + ' L' + w * 0.28 + ' ' + h * 0.3 + ' L' + w * 0.46 + ' ' + h * 0.56 + ' L' + w * 0.66 + ' ' + h * 0.22 + ' L' + w + ' ' + h * 0.6 + ' V' + h + ' H0 Z" fill="#6e4a5a"/>' +
          '<path d="M' + w * 0.28 + ' ' + h * 0.3 + ' l' + w * 0.05 + ' ' + h * 0.09 + ' l-' + w * 0.1 + ' 0 Z" fill="#fbf7f1"/>' +
          '<path d="M' + w * 0.66 + ' ' + h * 0.22 + ' l' + w * 0.06 + ' ' + h * 0.1 + ' l-' + w * 0.12 + ' 0 Z" fill="#fbf7f1"/>';
        break;
      case "lake":
        defs = grad(uid, [["#cfe8e2", 0], ["#7bbcb8", 45], ["#2f7d80", 100]], "v");
        body =
          '<path d="M0 ' + h * 0.5 + ' L' + w * 0.35 + ' ' + h * 0.26 + ' L' + w * 0.6 + ' ' + h * 0.46 + ' L' + w + ' ' + h * 0.28 + ' V' + h * 0.55 + ' H0 Z" fill="#3d6f78"/>' +
          '<rect x="0" y="' + h * 0.55 + '" width="' + w + '" height="' + h * 0.45 + '" fill="#1f8a8a" opacity=".75"/>' +
          '<path d="M0 ' + h * 0.55 + ' L' + w * 0.35 + ' ' + h * 0.74 + ' L' + w * 0.6 + ' ' + h * 0.62 + ' L' + w + ' ' + h * 0.78 + '" fill="none" stroke="#bfe6e0" stroke-width="2" opacity=".5"/>';
        break;
      case "northern":
        defs = grad(uid, [["#0c1f3a", 0], ["#13324f", 50], ["#1f5d52", 100]], "v");
        body =
          '<path d="M' + w * 0.1 + ' ' + h * 0.1 + ' Q' + w * 0.4 + ' ' + h * 0.42 + ' ' + w * 0.9 + ' ' + h * 0.16 + '" fill="none" stroke="#6dffc2" stroke-width="' + h * 0.08 + '" opacity=".4" stroke-linecap="round"/>' +
          '<path d="M' + w * 0.05 + ' ' + h * 0.22 + ' Q' + w * 0.5 + ' ' + h * 0.02 + ' ' + w * 0.95 + ' ' + h * 0.3 + '" fill="none" stroke="#9d8bff" stroke-width="' + h * 0.05 + '" opacity=".4" stroke-linecap="round"/>' +
          '<path d="M0 ' + h * 0.74 + ' L' + w * 0.3 + ' ' + h * 0.58 + ' L' + w * 0.6 + ' ' + h * 0.72 + ' L' + w + ' ' + h * 0.6 + ' V' + h + ' H0 Z" fill="#0a1626"/>' +
          stars(w, h);
        break;
      case "city":
        defs = grad(uid, [["#2a2350", 0], ["#5a3a6e", 55], ["#e8623f", 100]], "v");
        body = skyline(w, h, "#1a1430") + windows(w, h);
        break;
      case "rooftop":
        defs = grad(uid, [["#fbd3a0", 0], ["#e8a06a", 60], ["#c66b4a", 100]], "v");
        body = rooftops(w, h);
        break;
      case "desert":
        defs = grad(uid, [["#f8d59a", 0], ["#e8623f", 65], ["#a23a52", 100]], "v");
        body =
          '<path d="M0 ' + h * 0.62 + ' Q' + w * 0.35 + ' ' + h * 0.48 + ' ' + w * 0.6 + ' ' + h * 0.6 + ' T' + w + ' ' + h * 0.56 + ' V' + h + ' H0 Z" fill="#d98a4e"/>' +
          '<path d="M0 ' + h * 0.78 + ' Q' + w * 0.45 + ' ' + h * 0.64 + ' ' + w + ' ' + h * 0.74 + ' V' + h + ' H0 Z" fill="#b9663a"/>' +
          '<circle cx="' + w * 0.7 + '" cy="' + h * 0.3 + '" r="' + h * 0.1 + '" fill="#fff0c8"/>';
        break;
      case "canyon":
        defs = grad(uid, [["#f6c45e", 0], ["#e8623f", 60], ["#6e2d3a", 100]], "v");
        body =
          '<path d="M0 0 H' + w * 0.4 + ' L' + w * 0.46 + ' ' + h * 0.6 + ' L' + w * 0.38 + ' ' + h + ' H0 Z" fill="#8a3f3a"/>' +
          '<path d="M' + w + ' 0 H' + w * 0.62 + ' L' + w * 0.56 + ' ' + h * 0.62 + ' L' + w * 0.64 + ' ' + h + ' H' + w + ' Z" fill="#a8553f"/>' +
          '<path d="M' + w * 0.46 + ' ' + h * 0.6 + ' L' + w * 0.5 + ' ' + h + ' L' + w * 0.56 + ' ' + h * 0.62 + '" fill="#ffe1a0" opacity=".55"/>';
        break;
      case "forest":
        defs = grad(uid, [["#cfe3b8", 0], ["#6fae6a", 50], ["#2f6b4a", 100]], "v");
        body =
          '<rect x="0" y="' + h * 0.55 + '" width="' + w + '" height="' + h * 0.45 + '" fill="#234a38"/>' +
          firs(w, h) +
          '<path d="M' + w * 0.42 + ' ' + h * 0.2 + ' q' + w * 0.05 + ' ' + h * 0.3 + ' 0 ' + h * 0.55 + '" fill="none" stroke="#dff3ea" stroke-width="' + w * 0.04 + '" opacity=".8"/>';
        break;
      case "trail":
        defs = grad(uid, [["#3a4a6e", 0], ["#6e5a7a", 55], ["#2f5b4a", 100]], "v");
        body =
          '<rect x="0" y="' + h * 0.5 + '" width="' + w + '" height="' + h * 0.5 + '" fill="#1f3b30"/>' +
          '<path d="M' + w * 0.5 + ' ' + h + ' Q' + w * 0.46 + ' ' + h * 0.7 + ' ' + w * 0.52 + ' ' + h * 0.52 + '" fill="none" stroke="#d8c8a8" stroke-width="' + w * 0.06 + '" opacity=".7"/>' +
          lanterns(w, h);
        break;
      default:
        defs = grad(uid, [["#7ec8d3", 0], ["#1f8a8a", 100]], "v");
        body = "";
    }

    return open + '<defs>' + defs + '</defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + uid + ')"/>' +
      body + '</svg>';
  }

  function grad(id, stops, dir) {
    var coords = dir === "v" ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
    var s = stops.map(function (st) {
      return '<stop offset="' + st[1] + '%" stop-color="' + st[0] + '"/>';
    }).join("");
    return '<linearGradient id="' + id + '" ' + coords + '>' + s + '</linearGradient>';
  }

  function stars(w, h) {
    var out = "";
    for (var i = 0; i < 26; i++) {
      var x = (Math.sin(i * 12.9898) * 43758.5453 % 1) * w;
      var y = (Math.sin(i * 78.233) * 12543.123 % 1) * h * 0.55;
      out += '<circle cx="' + Math.abs(x).toFixed(0) + '" cy="' + Math.abs(y).toFixed(0) + '" r="1.3" fill="#fff" opacity=".7"/>';
    }
    return out;
  }
  function skyline(w, h, c) {
    var out = "", x = 0;
    var heights = [0.5, 0.38, 0.58, 0.3, 0.46, 0.62, 0.4, 0.52];
    var bw = w / heights.length;
    heights.forEach(function (ht, i) {
      out += '<rect x="' + (x - 2) + '" y="' + h * (1 - ht) + '" width="' + (bw + 4) + '" height="' + h * ht + '" fill="' + c + '"/>';
      x += bw;
    });
    return out;
  }
  function windows(w, h) {
    var out = "", bw = w / 8;
    for (var b = 0; b < 8; b++) {
      for (var r = 0; r < 5; r++) {
        if ((b + r) % 2 === 0 || r % 3 === 0) {
          out += '<rect x="' + (b * bw + bw * 0.3) + '" y="' + (h * 0.55 + r * h * 0.08) + '" width="' + bw * 0.12 + '" height="' + h * 0.04 + '" fill="#ffe08a" opacity=".85"/>';
        }
      }
    }
    return out;
  }
  function rooftops(w, h) {
    var out = '<rect x="0" y="' + h * 0.55 + '" width="' + w + '" height="' + h * 0.45 + '" fill="#9c4d34"/>';
    for (var i = 0; i < 6; i++) {
      var x = i * w / 6;
      out += '<path d="M' + x + ' ' + h * 0.62 + ' l' + w / 12 + ' -' + h * 0.1 + ' l' + w / 12 + ' ' + h * 0.1 + ' Z" fill="#c0603f"/>';
    }
    return out;
  }
  function firs(w, h) {
    var out = "";
    for (var i = 0; i < 7; i++) {
      var x = (i + 0.5) * w / 7;
      var top = h * (0.32 + (i % 3) * 0.06);
      out += '<path d="M' + x + ' ' + top + ' L' + (x - w * 0.05) + ' ' + h * 0.7 + ' L' + (x + w * 0.05) + ' ' + h * 0.7 + ' Z" fill="#2f6b4a"/>';
    }
    return out;
  }
  function boats(w, h) {
    var out = "";
    [[0.3, 0.66], [0.55, 0.7], [0.74, 0.64]].forEach(function (p) {
      var x = w * p[0], y = h * p[1];
      out += '<path d="M' + (x - w * 0.04) + ' ' + y + ' h' + w * 0.08 + ' l-' + w * 0.015 + ' ' + h * 0.04 + ' h-' + w * 0.05 + ' Z" fill="#0c1c28"/>' +
        '<rect x="' + (x - 1) + '" y="' + (y - h * 0.1) + '" width="2" height="' + h * 0.1 + '" fill="#0c1c28"/>';
    });
    return out;
  }
  function lanterns(w, h) {
    var out = "";
    [[0.45, 0.62], [0.55, 0.74], [0.5, 0.55]].forEach(function (p) {
      out += '<circle cx="' + w * p[0] + '" cy="' + h * p[1] + '" r="' + h * 0.02 + '" fill="#ffcf6e"/>' +
        '<circle cx="' + w * p[0] + '" cy="' + h * p[1] + '" r="' + h * 0.045 + '" fill="#ffcf6e" opacity=".25"/>';
    });
    return out;
  }

  function stars5(rating) {
    var full = Math.round(rating);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }
  function priceTier(p) {
    return '<span class="filled">' + "$".repeat(p) + '</span><span class="dim">' + "$".repeat(3 - p) + "</span>";
  }
  function pin() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
  }

  /* ---------------------------------------------------------------
   * DOM refs
   * ------------------------------------------------------------- */
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var resultCount = document.getElementById("resultCount");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var statSaved = document.getElementById("statSaved");
  var toastEl = document.getElementById("toast");

  var lightbox = document.getElementById("lightbox");
  var lbFrame = document.getElementById("lbFrame");
  var lbLoc = document.getElementById("lbLoc");
  var lbTitle = document.getElementById("lbTitle");
  var lbStory = document.getElementById("lbStory");
  var lbBest = document.getElementById("lbBest");
  var lbPrice = document.getElementById("lbPrice");
  var lbCounter = document.getElementById("lbCounter");
  var lbSave = document.getElementById("lbSave");
  var lbSaveLabel = document.getElementById("lbSaveLabel");

  var saved = Object.create(null);
  var currentFilter = "all";
  var visibleIds = [];   // order of currently-shown photos (for prev/next)
  var lbIndex = 0;       // index into visibleIds
  var lastFocused = null;

  /* ---------------------------------------------------------------
   * Toast helper
   * ------------------------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------------------------------------------------------------
   * Render grid
   * ------------------------------------------------------------- */
  function buildCards() {
    var frag = document.createDocumentFragment();
    PHOTOS.forEach(function (p) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card";
      btn.dataset.cat = p.cat;
      btn.dataset.id = String(p.id);
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", "Open photo: " + p.name + ", " + p.loc);
      btn.innerHTML =
        '<span class="card__photo">' +
          scene(p.type, 600, p.h) +
          '<span class="card__chip">' + CAT_LABEL[p.cat] + '</span>' +
          '<span class="card__zoom"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>' +
          '<span class="card__overlay">' +
            '<span class="card__loc">' + pin() + p.loc + '</span>' +
            '<span class="card__name">' + p.name + '</span>' +
            '<span class="card__row"><span class="stars" aria-hidden="true">' + stars5(p.rating) + '</span>' +
              '<span>' + p.rating.toFixed(1) + '</span><span>·</span><span>' + p.best + '</span></span>' +
          '</span>' +
        '</span>';
      btn.addEventListener("click", function () {
        var idx = visibleIds.indexOf(p.id);
        if (idx === -1) idx = 0;
        openLightbox(idx);
      });
      frag.appendChild(btn);
    });
    grid.appendChild(frag);
  }

  /* ---------------------------------------------------------------
   * Filtering
   * ------------------------------------------------------------- */
  function applyFilter(cat) {
    currentFilter = cat;
    visibleIds = [];
    var shown = 0;
    PHOTOS.forEach(function (p) {
      var card = grid.querySelector('.card[data-id="' + p.id + '"]');
      var match = cat === "all" || p.cat === cat;
      if (match) {
        card.classList.remove("is-hidden");
        card.style.animation = "none";
        // re-trigger entrance animation
        // eslint-disable-next-line no-unused-expressions
        card.offsetWidth;
        card.style.animation = "";
        visibleIds.push(p.id);
        shown++;
      } else {
        card.classList.add("is-hidden");
      }
    });

    empty.hidden = shown !== 0;
    grid.hidden = shown === 0;
    var noun = shown === 1 ? "frame" : "frames";
    resultCount.textContent = "Showing " + shown + " " + noun;

    chips.forEach(function (c) {
      var active = c.dataset.filter === cat;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      applyFilter(c.dataset.filter);
    });
  });

  /* ---------------------------------------------------------------
   * Lightbox
   * ------------------------------------------------------------- */
  function photoById(id) {
    for (var i = 0; i < PHOTOS.length; i++) {
      if (PHOTOS[i].id === id) return PHOTOS[i];
    }
    return null;
  }

  function renderLightbox() {
    var id = visibleIds[lbIndex];
    var p = photoById(id);
    if (!p) return;
    lbFrame.innerHTML = scene(p.type, 700, 560);
    lbLoc.innerHTML = "";
    lbLoc.appendChild(document.createTextNode(p.loc));
    lbTitle.textContent = p.name;
    lbStory.textContent = p.story;
    lbBest.textContent = "Best time · " + p.best;
    lbPrice.innerHTML = "Cost " + priceTier(p.price);
    lbCounter.textContent = (lbIndex + 1) + " / " + visibleIds.length;

    var on = !!saved[id];
    lbSave.setAttribute("aria-pressed", on ? "true" : "false");
    lbSaveLabel.textContent = on ? "Saved to trip" : "Save to trip";
  }

  function openLightbox(index) {
    if (!visibleIds.length) return;
    lbIndex = Math.max(0, Math.min(index, visibleIds.length - 1));
    lastFocused = document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown, true);
    // focus the close button for predictable trap entry
    requestAnimationFrame(function () {
      lightbox.querySelector(".lightbox__btn--close").focus();
    });
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown, true);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function step(dir) {
    if (!visibleIds.length) return;
    lbIndex = (lbIndex + dir + visibleIds.length) % visibleIds.length;
    renderLightbox();
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Tab") {
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    var focusables = lightbox.querySelectorAll(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function toggleSave() {
    var id = visibleIds[lbIndex];
    var p = photoById(id);
    if (!p) return;
    if (saved[id]) {
      delete saved[id];
      toast("Removed “" + shorten(p.name) + "” from your trip");
    } else {
      saved[id] = true;
      toast("Saved “" + shorten(p.name) + "” to your trip");
    }
    statSaved.textContent = String(Object.keys(saved).length);
    var on = !!saved[id];
    lbSave.setAttribute("aria-pressed", on ? "true" : "false");
    lbSaveLabel.textContent = on ? "Saved to trip" : "Save to trip";
  }

  function shorten(s) {
    return s.length > 28 ? s.slice(0, 27) + "…" : s;
  }

  // Wire lightbox controls
  lightbox.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) closeLightbox();
    else if (e.target.closest("[data-prev]")) step(-1);
    else if (e.target.closest("[data-next]")) step(1);
  });
  lbSave.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleSave();
  });

  /* ---------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------- */
  buildCards();
  applyFilter("all");
})();
