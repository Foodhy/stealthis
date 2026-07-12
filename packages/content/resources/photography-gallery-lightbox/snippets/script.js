/* Aperture — Gallery Lightbox
   Vanilla JS. Thumbnail grid → full-bleed overlay with prev/next,
   keyboard arrows + Esc, focus trap, caption + counter. */
(function () {
  "use strict";

  // --- Data (fictional, Unsplash placeholder imagery) ---
  var PHOTOS = [
    { id: "p1",  label: "Coastline",  title: "Low Tide, Reykjanes",      loc: "Iceland",    credit: "Nadia Ostrup · 80mm · f/8",   wide: true,  q: "photo-1500534623283-312aade485b7" },
    { id: "p2",  label: "Desert",     title: "Dune Study No. 2",         loc: "Namibia",    credit: "Marco Vidal · 120mm · f/11",  wide: false, q: "photo-1509316785289-025f5b846b35" },
    { id: "p3",  label: "City",       title: "Rooftop Blue Hour",        loc: "Lisbon",     credit: "Ana Sørenson · 35mm · f/2.8", wide: false, q: "photo-1513622470522-26c3c8a854bc" },
    { id: "p4",  label: "Portrait",   title: "Weaver, Hoi An",           loc: "Vietnam",    credit: "Tomás Reyes · 85mm · f/1.8", wide: false, q: "photo-1544005313-94ddf0286df2" },
    { id: "p5",  label: "Coastline",  title: "Fog Bank, Big Sur",        loc: "California", credit: "Nadia Ostrup · 50mm · f/5.6", wide: true,  q: "photo-1470071459604-3b5ec3a7fe05" },
    { id: "p6",  label: "Still Life",  title: "Silver &amp; Salt",       loc: "Studio",     credit: "Ana Sørenson · 90mm · f/16",  wide: false, q: "photo-1519681393784-d120267933ba" },
    { id: "p7",  label: "Mountain",   title: "First Light, Dolomites",   loc: "Italy",      credit: "Marco Vidal · 24mm · f/9",    wide: false, q: "photo-1454496522488-7a8e488e8606" },
    { id: "p8",  label: "Street",     title: "Neon After Rain",          loc: "Tokyo",      credit: "Kenji Aoki · 35mm · f/2",     wide: false, q: "photo-1493514789931-586cb221d7a7" },
    { id: "p9",  label: "Forest",     title: "Understory Green",         loc: "Oregon",     credit: "Tomás Reyes · 50mm · f/4",    wide: true,  q: "photo-1441974231531-c6227db76b6e" },
    { id: "p10", label: "Portrait",   title: "The Diver",                loc: "Azores",     credit: "Ana Sørenson · 85mm · f/2.2", wide: false, q: "photo-1504006833117-8886a355efbf" },
    { id: "p11", label: "Desert",     title: "Salt Flat Mirror",         loc: "Bolivia",    credit: "Marco Vidal · 24mm · f/11",   wide: false, q: "photo-1469474968028-56623f02e42e" },
    { id: "p12", label: "City",       title: "Cable Car, Steep Street",  loc: "Valparaíso", credit: "Kenji Aoki · 40mm · f/5.6",   wide: false, q: "photo-1518391846015-55a9cc003b25" }
  ];

  function imgUrl(q, w) {
    return "https://images.unsplash.com/" + q + "?auto=format&fit=crop&w=" + w + "&q=80";
  }

  var TOTAL = PHOTOS.length;

  // --- Elements ---
  var grid = document.getElementById("grid");
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbTitle = document.getElementById("lbTitle");
  var lbLoc = document.getElementById("lbLoc");
  var lbCredit = document.getElementById("lbCredit");
  var lbIndex = document.getElementById("lbIndex");
  var lbCounter = document.getElementById("lbCounter");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var lbClose = document.getElementById("lbClose");
  var toastEl = document.getElementById("toast");

  var current = 0;
  var lastFocused = null;
  var toastTimer = null;

  // --- Toast helper ---
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  // --- Build thumbnail grid ---
  function buildGrid() {
    var frag = document.createDocumentFragment();
    PHOTOS.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb" + (p.wide ? " thumb--wide" : "");
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + TOTAL + ": " + stripTags(p.title));
      btn.dataset.index = String(i);

      var num = document.createElement("span");
      num.className = "thumb__num";
      num.textContent = pad(i + 1) + " / " + pad(TOTAL);

      var img = document.createElement("img");
      img.className = "thumb__img";
      img.loading = "lazy";
      img.alt = stripTags(p.title) + " — " + p.loc;
      img.src = imgUrl(p.q, p.wide ? 900 : 640);

      var meta = document.createElement("div");
      meta.className = "thumb__meta";
      meta.innerHTML =
        '<span class="thumb__label">' + p.label + "</span>" +
        '<span class="thumb__title">' + p.title + "</span>";

      btn.appendChild(num);
      btn.appendChild(img);
      btn.appendChild(meta);
      btn.addEventListener("click", function () {
        open(i, btn);
      });
      frag.appendChild(btn);
    });
    grid.appendChild(frag);
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function stripTags(s) {
    var d = document.createElement("div");
    d.innerHTML = s;
    return d.textContent || "";
  }

  // --- Render current photo into stage ---
  function render(animate) {
    var p = PHOTOS[current];
    var counter = current + 1 + " / " + TOTAL;

    function apply() {
      lbImg.src = imgUrl(p.q, 1400);
      lbImg.alt = stripTags(p.title) + " — " + p.loc;
      lbTitle.innerHTML = p.title;
      lbLoc.textContent = p.loc;
      lbCredit.textContent = p.credit;
      lbIndex.textContent = counter;
      lbCounter.textContent = counter;
    }

    if (animate) {
      lbImg.classList.add("is-swapping");
      setTimeout(function () {
        apply();
        // let the browser paint the new src before revealing
        requestAnimationFrame(function () {
          lbImg.classList.remove("is-swapping");
        });
      }, 140);
    } else {
      apply();
    }
  }

  // --- Open / close ---
  function open(index, trigger) {
    current = clamp(index);
    lastFocused = trigger || document.activeElement;
    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    render(false);
    // next frame → animate in
    requestAnimationFrame(function () {
      lb.classList.add("is-open");
    });
    lbNext.focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    document.removeEventListener("keydown", onKey);
    setTimeout(function () {
      lb.hidden = true;
    }, 320);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function clamp(i) {
    return (i % TOTAL + TOTAL) % TOTAL; // wrap both directions
  }

  function go(delta) {
    current = clamp(current + delta);
    render(true);
  }

  // --- Keyboard handling (arrows, Esc, focus trap) ---
  function onKey(e) {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        toast("Viewer closed");
        break;
      case "ArrowRight":
        e.preventDefault();
        go(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        go(-1);
        break;
      case "Home":
        e.preventDefault();
        current = 0;
        render(true);
        break;
      case "End":
        e.preventDefault();
        current = TOTAL - 1;
        render(true);
        break;
      case "Tab":
        trapFocus(e);
        break;
    }
  }

  function trapFocus(e) {
    var focusables = [lbClose, lbPrev, lbNext];
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (focusables.indexOf(document.activeElement) === -1) {
      e.preventDefault();
      first.focus();
    }
  }

  // --- Wire controls ---
  lbPrev.addEventListener("click", function () { go(-1); });
  lbNext.addEventListener("click", function () { go(1); });
  lbClose.addEventListener("click", function () {
    close();
    toast("Viewer closed");
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  // Basic swipe support on the stage
  (function enableSwipe() {
    var stage = document.getElementById("stage");
    var startX = 0;
    var active = false;
    stage.addEventListener("touchstart", function (e) {
      startX = e.changedTouches[0].clientX;
      active = true;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!active) return;
      active = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  // --- Init ---
  buildGrid();
  setTimeout(function () {
    toast("Tap a frame to open the lightbox");
  }, 700);
})();
