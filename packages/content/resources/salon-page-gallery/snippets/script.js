(function () {
  "use strict";

  // ---- Data: realistic but fictional portfolio looks ----
  var CAT_LABEL = {
    cuts: "Cuts",
    color: "Color",
    updos: "Updos",
    nails: "Nails",
  };

  var LOOKS = [
    { cat: "color", service: "Seamless Balayage", stylist: "Aria Vance", c1: "#caa27a", c2: "#7d5a3c" },
    { cat: "cuts", service: "Soft Curtain Bangs", stylist: "Noé Lambert", c1: "#e6cdb8", c2: "#b08d57" },
    { cat: "updos", service: "Low Chignon, Pearled", stylist: "Mireille Roux", c1: "#d9c3ae", c2: "#8a6d52" },
    { cat: "color", service: "Smoky Rosé Gloss", stylist: "Aria Vance", c1: "#e2b6a6", c2: "#a05f54" },
    { cat: "nails", service: "Almond French, Cream", stylist: "Juno Park", c1: "#f3e6dc", c2: "#c9a78f" },
    { cat: "cuts", service: "Textured Italian Bob", stylist: "Noé Lambert", c1: "#cbb59a", c2: "#6f5436" },
    { cat: "color", service: "Honey Money-Piece", stylist: "Selene Cho", c1: "#e9cf9a", c2: "#b0863f" },
    { cat: "updos", service: "Braided Crown Twist", stylist: "Mireille Roux", c1: "#d2bda7", c2: "#7a5f47" },
    { cat: "nails", service: "Chrome Mocha Ombré", stylist: "Juno Park", c1: "#cdb6a6", c2: "#8a6b56" },
    { cat: "cuts", service: "Sliced Shag Layers", stylist: "Selene Cho", c1: "#dcc6ac", c2: "#86663f" },
    { cat: "color", service: "Cool Ash Melt", stylist: "Aria Vance", c1: "#c9c0b4", c2: "#6c655c" },
    { cat: "updos", service: "Sculpted Side Sweep", stylist: "Mireille Roux", c1: "#e3d0bb", c2: "#9c7a55" },
    { cat: "nails", service: "Micro-Pearl Tips", stylist: "Juno Park", c1: "#f1e3d6", c2: "#caa27a" },
    { cat: "cuts", service: "Blunt Collarbone Cut", stylist: "Noé Lambert", c1: "#d7c1a8", c2: "#7e6040" },
    { cat: "color", service: "Copper Glaze Babylights", stylist: "Selene Cho", c1: "#e0a878", c2: "#9a532e" },
  ];

  // Varied tile heights for the masonry feel.
  var HEIGHTS = [320, 240, 280, 360, 260, 300, 340, 250, 290, 330, 270, 310, 245, 300, 350];

  var gallery = document.getElementById("gallery");
  var emptyEl = document.getElementById("empty");
  var resultLine = document.getElementById("resultLine");
  var chipsWrap = document.getElementById("chips");
  var toastEl = document.getElementById("toast");

  var lightbox = document.getElementById("lightbox");
  var lbStage = document.getElementById("lbStage");
  var lbCat = document.getElementById("lbCat");
  var lbService = document.getElementById("lbService");
  var lbStylist = document.getElementById("lbStylist");
  var lbIndex = document.getElementById("lbIndex");
  var lbBook = document.getElementById("lbBook");

  var activeCat = "all";
  var visible = []; // currently visible looks (filtered subset)
  var current = 0; // index into `visible` shown in lightbox
  var lastFocus = null;
  var toastTimer = null;

  // ---- Toast helper ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs each time
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 320);
    }, 2600);
  }

  function gradient(look) {
    return "linear-gradient(150deg, " + look.c1 + ", " + look.c2 + ")";
  }

  // ---- Counts per category ----
  function computeCounts() {
    var counts = { all: LOOKS.length, cuts: 0, color: 0, updos: 0, nails: 0 };
    LOOKS.forEach(function (l) {
      counts[l.cat] += 1;
    });
    Object.keys(counts).forEach(function (key) {
      var el = chipsWrap.querySelector('[data-count="' + key + '"]');
      if (el) el.textContent = counts[key];
    });
  }

  // ---- Render the grid for the active category ----
  function render() {
    visible = LOOKS.filter(function (l) {
      return activeCat === "all" || l.cat === activeCat;
    });

    gallery.innerHTML = "";

    visible.forEach(function (look, i) {
      var globalIndex = LOOKS.indexOf(look);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.style.animationDelay = Math.min(i * 0.04, 0.4) + "s";
      btn.setAttribute(
        "aria-label",
        look.service + " by " + look.stylist + ", " + CAT_LABEL[look.cat]
      );
      btn.dataset.index = String(i);

      var art = document.createElement("span");
      art.className = "tile-art";
      art.style.height = HEIGHTS[globalIndex % HEIGHTS.length] + "px";
      art.style.background = gradient(look);

      var badge = document.createElement("span");
      badge.className = "tile-badge";
      badge.textContent = CAT_LABEL[look.cat];

      var cap = document.createElement("span");
      cap.className = "tile-cap";
      cap.innerHTML =
        '<span class="tile-service">' +
        look.service +
        '</span><span class="tile-stylist">' +
        look.stylist +
        "</span>";

      btn.appendChild(art);
      btn.appendChild(badge);
      btn.appendChild(cap);

      btn.addEventListener("click", function () {
        openLightbox(i);
      });

      gallery.appendChild(btn);
    });

    // empty state + result line
    var n = visible.length;
    emptyEl.hidden = n !== 0;
    gallery.hidden = n === 0;

    if (activeCat === "all") {
      resultLine.textContent = "Showing all " + n + " looks";
    } else {
      resultLine.textContent =
        "Showing " + n + " " + CAT_LABEL[activeCat].toLowerCase() + " look" + (n === 1 ? "" : "s");
    }
  }

  // ---- Chip filtering ----
  chipsWrap.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    setCategory(chip.dataset.cat);
  });

  function setCategory(cat) {
    activeCat = cat;
    Array.prototype.forEach.call(chipsWrap.querySelectorAll(".chip"), function (c) {
      var on = c.dataset.cat === cat;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    render();
  }

  document.getElementById("resetBtn").addEventListener("click", function () {
    setCategory("all");
  });

  // ---- Lightbox ----
  function paintLightbox() {
    var look = visible[current];
    if (!look) return;
    lbStage.style.background = gradient(look);
    lbCat.textContent = CAT_LABEL[look.cat];
    lbService.textContent = look.service;
    lbStylist.textContent = look.stylist;
    lbIndex.textContent = current + 1 + " / " + visible.length;
  }

  function openLightbox(i) {
    current = i;
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    paintLightbox();
    document.getElementById("lbClose").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function step(dir) {
    if (!visible.length) return;
    current = (current + dir + visible.length) % visible.length;
    paintLightbox();
  }

  document.getElementById("lbPrev").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("lbNext").addEventListener("click", function () {
    step(1);
  });
  document.getElementById("lbClose").addEventListener("click", closeLightbox);

  Array.prototype.forEach.call(lightbox.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", closeLightbox);
  });

  lbBook.addEventListener("click", function () {
    var look = visible[current];
    if (look) {
      toast("Requested " + look.service + " with " + look.stylist + " — we'll confirm shortly.");
    }
  });

  // ---- Keyboard ----
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  // ---- Brand "Book a visit" ----
  document.getElementById("brandBook").addEventListener("click", function () {
    toast("Booking desk open — tell us the look you love.");
  });

  // ---- Init ----
  computeCounts();
  render();
})();
