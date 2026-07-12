/* Wedding — Photo Gallery Lightbox
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  // --- Data ------------------------------------------------------------
  // Unsplash placeholder photographs. Each has a moment, caption and note.
  var PHOTOS = [
    { id: "p1",  moment: "ceremony",  label: "Ceremony",  title: "The First Look",        note: "Under the olive arch, moments before the vows.", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", ar: "4 / 5" },
    { id: "p2",  moment: "portraits", label: "Portraits", title: "Golden Hour",            note: "The two of them wandering the lavender rows.",   url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80", ar: "3 / 4" },
    { id: "p3",  moment: "details",   label: "Details",   title: "The Rings",              note: "Warm gold bands resting on ivory linen.",        url: "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=900&q=80", ar: "3 / 2" },
    { id: "p4",  moment: "ceremony",  label: "Ceremony",  title: "Exchanging Vows",        note: "Handwritten promises, read aloud at dusk.",      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80", ar: "4 / 5" },
    { id: "p5",  moment: "reception", label: "Reception", title: "The First Dance",        note: "Fairy lights strung between the plane trees.",   url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80", ar: "3 / 2" },
    { id: "p6",  moment: "details",   label: "Details",   title: "Peony Bouquet",          note: "Blush peonies tied with silk ribbon.",           url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80", ar: "4 / 5" },
    { id: "p7",  moment: "portraits", label: "Portraits", title: "Quiet Moment",           note: "A stolen glance in the château garden.",         url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80", ar: "3 / 4" },
    { id: "p8",  moment: "reception", label: "Reception", title: "The Long Table",         note: "Dinner beneath the stars for eighty guests.",    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80", ar: "3 / 2" },
    { id: "p9",  moment: "ceremony",  label: "Ceremony",  title: "The Kiss",               note: "Applause rising from the courtyard.",            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80", ar: "4 / 5" },
    { id: "p10", moment: "details",   label: "Details",   title: "Place Settings",         note: "Calligraphed cards and candlelight.",            url: "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=900&q=80", ar: "3 / 2" },
    { id: "p11", moment: "reception", label: "Reception", title: "Cheers",                 note: "A toast to the newlyweds.",                      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80", ar: "3 / 4" },
    { id: "p12", moment: "portraits", label: "Portraits", title: "Just Married",           note: "Confetti and laughter on the stone steps.",      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80", ar: "4 / 5" }
  ];

  // --- Elements --------------------------------------------------------
  var gallery = document.getElementById("gallery");
  var countNum = document.getElementById("count-num");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  var lightbox = document.getElementById("lightbox");
  var lbImage = document.getElementById("lb-image");
  var lbBadge = document.getElementById("lb-badge");
  var lbTitle = document.getElementById("lb-title");
  var lbSub = document.getElementById("lb-sub");
  var lbCounter = document.getElementById("lb-counter");
  var lbStrip = document.getElementById("lb-strip");
  var lbClose = document.getElementById("lb-close");
  var lbPrev = document.getElementById("lb-prev");
  var lbNext = document.getElementById("lb-next");
  var toastEl = document.getElementById("toast");

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // --- State -----------------------------------------------------------
  var current = PHOTOS.slice(); // visible / filtered set
  var index = 0;                // active index within `current`
  var lastFocused = null;

  // --- Grid render -----------------------------------------------------
  function renderGrid(list) {
    gallery.innerHTML = "";
    list.forEach(function (photo, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.style.setProperty("--ar", photo.ar);
      btn.style.animationDelay = (i * 45) + "ms";
      btn.setAttribute("aria-label", "Open photograph: " + photo.title);
      btn.dataset.id = photo.id;

      var img = document.createElement("img");
      img.className = "tile-img";
      img.loading = "lazy";
      img.alt = photo.title + " — " + photo.note;
      img.src = photo.url;
      img.style.setProperty("--ar", photo.ar);

      var badge = document.createElement("span");
      badge.className = "tile-badge";
      badge.textContent = photo.label;

      var veil = document.createElement("span");
      veil.className = "tile-veil";
      var cap = document.createElement("span");
      cap.className = "tile-cap";
      cap.textContent = photo.title;
      veil.appendChild(cap);

      btn.appendChild(img);
      btn.appendChild(badge);
      btn.appendChild(veil);

      btn.addEventListener("click", function () {
        open(i);
      });

      gallery.appendChild(btn);
    });
    countNum.textContent = String(list.length);
  }

  // --- Filtering -------------------------------------------------------
  function applyFilter(filter) {
    current = filter === "all"
      ? PHOTOS.slice()
      : PHOTOS.filter(function (p) { return p.moment === filter; });
    renderGrid(current);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.dataset.filter);
    });
  });

  // --- Lightbox --------------------------------------------------------
  function buildStrip() {
    lbStrip.innerHTML = "";
    current.forEach(function (photo, i) {
      var t = document.createElement("button");
      t.type = "button";
      t.className = "lb-thumb";
      t.style.backgroundImage = "url('" + photo.url + "')";
      t.setAttribute("aria-label", "View " + photo.title);
      t.dataset.i = String(i);
      t.addEventListener("click", function () { go(i); });
      lbStrip.appendChild(t);
    });
  }

  function paint() {
    var photo = current[index];
    if (!photo) return;
    lbImage.style.backgroundImage = "url('" + photo.url + "')";
    lbImage.setAttribute("aria-label", photo.title + " — " + photo.note);
    lbBadge.textContent = photo.label;
    lbTitle.textContent = photo.title;
    lbSub.textContent = photo.note;
    lbCounter.textContent = (index + 1) + " / " + current.length;

    var thumbs = lbStrip.querySelectorAll(".lb-thumb");
    thumbs.forEach(function (t, i) {
      var active = i === index;
      t.classList.toggle("is-active", active);
      if (active) {
        t.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      }
    });
  }

  function open(i) {
    lastFocused = document.activeElement;
    index = i;
    buildStrip();
    paint();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function go(i) {
    var n = current.length;
    index = (i + n) % n;
    paint();
  }

  lbPrev.addEventListener("click", function () { go(index - 1); });
  lbNext.addEventListener("click", function () { go(index + 1); });
  lbClose.addEventListener("click", close);

  lightbox.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) close();
  });

  document.getElementById("lb-copy").addEventListener("click", function () {
    var link = window.location.href.split("#")[0] + "#" + current[index].id;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () { toast("Photo link copied to clipboard"); },
        function () { toast("Share link: " + current[index].id); }
      );
    } else {
      toast("Share link: " + current[index].id);
    }
  });

  document.getElementById("share-all").addEventListener("click", function () {
    var link = window.location.href.split("#")[0];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () { toast("Gallery link copied — share the memories"); },
        function () { toast("Copy the URL to share this gallery"); }
      );
    } else {
      toast("Copy the URL to share this gallery");
    }
  });

  // --- Keyboard --------------------------------------------------------
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") { close(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
  });

  // --- Init ------------------------------------------------------------
  renderGrid(current);
})();
