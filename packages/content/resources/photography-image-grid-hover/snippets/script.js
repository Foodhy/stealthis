(function () {
  "use strict";

  // Fictional archive. Unsplash source URLs are used as royalty-free placeholders.
  var PHOTOS = [
    { id: 1, title: "Salt Flats at Dawn", by: "Mara Okonkwo", cat: "landscape",
      img: "1500534623283-312aade485b7", loc: "Uyuni, 05:12" },
    { id: 2, title: "The Watchmaker", by: "Elias Vaughn", cat: "portrait",
      img: "1552058544-f2b08422138a", loc: "Studio 9" },
    { id: 3, title: "Rain on 6th", by: "Junko Halvorsen", cat: "street",
      img: "1519681393784-d120267933ba", loc: "Downtown" },
    { id: 4, title: "Concrete Cathedral", by: "Theo Marchetti", cat: "architecture",
      img: "1487958449943-2429e8be8625", loc: "Brutalist Quarter" },
    { id: 5, title: "Fjord Silence", by: "Mara Okonkwo", cat: "landscape",
      img: "1441974231531-c6227db76b6e", loc: "Northern Coast" },
    { id: 6, title: "Amber Hour", by: "Priya Anand", cat: "portrait",
      img: "1531123897727-8f129e1688ce", loc: "Rooftop" },
    { id: 7, title: "Neon Crossing", by: "Junko Halvorsen", cat: "street",
      img: "1493514789931-586cb221d7a7", loc: "District 12" },
    { id: 8, title: "Stairwell Spiral", by: "Theo Marchetti", cat: "architecture",
      img: "1470071459604-3b5ec3a7fe05", loc: "Municipal Tower" },
    { id: 9, title: "Low Tide Mirror", by: "Sven Alcaraz", cat: "landscape",
      img: "1470252649378-9c29740c9fa8", loc: "The Estuary" }
  ];

  var UNSPLASH = "https://images.unsplash.com/photo-";
  function imgUrl(id, w) {
    return UNSPLASH + id + "?auto=format&fit=crop&w=" + w + "&q=70";
  }
  function catLabel(c) { return c.charAt(0).toUpperCase() + c.slice(1); }

  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var shotCount = document.getElementById("shotCount");
  var toastEl = document.getElementById("toast");
  var ratioToggle = document.getElementById("ratioToggle");
  var ratioLabel = document.getElementById("ratioLabel");

  var currentFilter = "all";
  var visible = [];
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function render() {
    visible = PHOTOS.filter(function (p) {
      return currentFilter === "all" || p.cat === currentFilter;
    });
    grid.innerHTML = "";

    visible.forEach(function (p, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.className = "frame";
      btn.type = "button";
      btn.setAttribute("data-id", String(p.id));
      btn.setAttribute("aria-label",
        p.title + ", " + catLabel(p.cat) + " by " + p.by + ". Open viewer.");

      var media = document.createElement("span");
      media.className = "frame__img";
      media.style.backgroundImage = "url('" + imgUrl(p.img, 640) + "')";

      var scrim = document.createElement("span");
      scrim.className = "frame__scrim";

      var idx = document.createElement("span");
      idx.className = "frame__index";
      idx.textContent = String(i + 1).padStart(2, "0");

      var cap = document.createElement("span");
      cap.className = "frame__cap";
      cap.innerHTML =
        '<span class="cat">' + catLabel(p.cat) + "</span>" +
        "<h3>" + p.title + "</h3>" +
        '<span class="by">' + p.by + " · " + p.loc + "</span>";

      btn.appendChild(media);
      btn.appendChild(scrim);
      btn.appendChild(idx);
      btn.appendChild(cap);
      btn.addEventListener("click", function () { openLightbox(p.id); });
      li.appendChild(btn);
      grid.appendChild(li);
    });

    empty.hidden = visible.length !== 0;
    var n = visible.length;
    shotCount.textContent = n + " shot" + (n === 1 ? "" : "s");
  }

  // ---- Filter chips ----
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      currentFilter = chip.getAttribute("data-filter");
      render();
      toast(currentFilter === "all"
        ? "Showing all frames"
        : "Filtered · " + catLabel(currentFilter));
    });
  });

  // ---- Aspect ratio toggle ----
  var wide = false;
  ratioToggle.addEventListener("click", function () {
    wide = !wide;
    grid.classList.toggle("is-wide", wide);
    ratioToggle.setAttribute("aria-pressed", String(wide));
    ratioLabel.textContent = wide ? "Landscape frames" : "Portrait frames";
    toast(wide ? "Landscape crop" : "Portrait crop");
  });

  // ---- Lightbox ----
  var lb = document.getElementById("lightbox");
  var lbMedia = document.getElementById("lbMedia");
  var lbCat = document.getElementById("lbCat");
  var lbTitle = document.getElementById("lbTitle");
  var lbMeta = document.getElementById("lbMeta");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var lbIndex = 0;
  var lastFocused = null;

  function openLightbox(id) {
    lbIndex = visible.findIndex(function (p) { return p.id === id; });
    if (lbIndex < 0) lbIndex = 0;
    lastFocused = document.activeElement;
    fillLightbox();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lbNext").focus();
  }

  function fillLightbox() {
    var p = visible[lbIndex];
    if (!p) return;
    lbMedia.style.backgroundImage = "url('" + imgUrl(p.img, 1200) + "')";
    lbCat.textContent = catLabel(p.cat);
    lbTitle.textContent = p.title;
    lbMeta.textContent = p.by + " · " + p.loc + " · Frame "
      + (lbIndex + 1) + " of " + visible.length;
  }

  function step(dir) {
    if (!visible.length) return;
    lbIndex = (lbIndex + dir + visible.length) % visible.length;
    fillLightbox();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  Array.prototype.slice.call(lb.querySelectorAll("[data-close]")).forEach(function (el) {
    el.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });

  render();
})();
