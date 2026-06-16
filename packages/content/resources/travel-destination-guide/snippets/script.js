(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Data — fictional Isla Verde points of interest
   * ------------------------------------------------------------- */
  var POIS = {
    see: [
      {
        name: "Crater Rim Trail",
        badge: "Cloud forest",
        meta: "Hike · 4h loop",
        rating: "4.9",
        price: "Free",
        tag: "Best at dawn",
        desc: "A misty switchback up to the old crater, ending at a lookout over the whole island.",
        scene: "linear-gradient(150deg,#9cc28a,#3f7e4f 70%)",
      },
      {
        name: "Porto Lima Harbour",
        badge: "Old town",
        meta: "Walk · half day",
        rating: "4.7",
        price: "Free",
        tag: "Pastel houses",
        desc: "Cobbled lanes ring a horseshoe bay lined with fishing boats and citrus-bright facades.",
        scene: "linear-gradient(160deg,#f6a17a,#e8623f 75%)",
      },
      {
        name: "Verdean Coffee Farm",
        badge: "Tour",
        meta: "1.5h · book ahead",
        rating: "4.8",
        price: "VR 90",
        tag: "Tastings",
        desc: "Terraced hillsides where you pick, roast, and cup the island's prized high-grown beans.",
        scene: "linear-gradient(150deg,#cdb893,#8a6b3f 80%)",
      },
      {
        name: "Glass Cove Snorkel",
        badge: "Beach",
        meta: "Half day",
        rating: "4.6",
        price: "VR 120",
        tag: "Reef",
        desc: "A sheltered cove with water so clear the reef looks suspended in air.",
        scene: "linear-gradient(160deg,#7fd0cf,#1f6d7a 80%)",
      },
      {
        name: "Lantern Night Market",
        badge: "Evening",
        meta: "Fri–Sun · sunset",
        rating: "4.8",
        price: "Free",
        tag: "Street food",
        desc: "Strung lanterns, grilled skewers, and live fado spill across the old customs square.",
        scene: "linear-gradient(150deg,#5a4a6e,#e8623f 95%)",
      },
    ],
    eat: [
      {
        name: "Casa do Mar",
        badge: "Seafood",
        meta: "Harbourfront · $$",
        rating: "4.9",
        price: "VR 240",
        tag: "Book ahead",
        desc: "The island's grilled catch of the day, served on a terrace inches from the tide.",
        scene: "linear-gradient(160deg,#1f8a8a,#14666a 85%)",
      },
      {
        name: "Tia Marisol's",
        badge: "Home cooking",
        meta: "Old town · $",
        rating: "4.8",
        price: "VR 110",
        tag: "Cash only",
        desc: "Eight tables, no menu — just whatever the matriarch simmered that morning.",
        scene: "linear-gradient(150deg,#e8a85c,#c84a2a 90%)",
      },
      {
        name: "Café Cumulus",
        badge: "Coffee",
        meta: "Hilltop · $",
        rating: "4.7",
        price: "VR 45",
        tag: "Views",
        desc: "Single-origin pour-overs above the clouds, with banana bread still warm from the oven.",
        scene: "linear-gradient(160deg,#cdb893,#6b5230 90%)",
      },
      {
        name: "Verde Verde Bar",
        badge: "Drinks",
        meta: "Marina · $$",
        rating: "4.6",
        price: "VR 70",
        tag: "Sunset spot",
        desc: "Tamarind sours and grilled corn while the sun melts into the bay.",
        scene: "linear-gradient(150deg,#f6a17a,#5a4a6e 95%)",
      },
    ],
    stay: [
      {
        name: "Pousada Horizonte",
        badge: "Boutique",
        meta: "Sea view · 12 rooms",
        rating: "4.9",
        price: "VR 980/nt",
        tag: "Adults only",
        desc: "Whitewashed suites tumbling down the cliff, each with a hammock facing the horizon.",
        scene: "linear-gradient(160deg,#7fd0cf,#1f8a8a 85%)",
      },
      {
        name: "Forest Canopy Lodge",
        badge: "Eco",
        meta: "Cloud forest · cabins",
        rating: "4.7",
        price: "VR 640/nt",
        tag: "Off-grid",
        desc: "Timber cabins on stilts among the ferns, woken each morning by birdsong, not alarms.",
        scene: "linear-gradient(150deg,#9cc28a,#3f7e4f 80%)",
      },
      {
        name: "Harbour House Hostel",
        badge: "Budget",
        meta: "Old town · dorms",
        rating: "4.5",
        price: "VR 120/nt",
        tag: "Sociable",
        desc: "A bright, tiled townhouse with a rooftop and a wall of trip tips left by past wanderers.",
        scene: "linear-gradient(150deg,#e8a85c,#e8623f 90%)",
      },
    ],
  };

  /* Map locations — percentage coordinates over the SVG canvas */
  var MAP_POINTS = [
    { n: 1, name: "Porto Lima", kind: "Harbour town", x: 30, y: 76 },
    { n: 2, name: "Crater Rim", kind: "Cloud forest trail", x: 50, y: 42 },
    { n: 3, name: "Glass Cove", kind: "Snorkel beach", x: 70, y: 47 },
    { n: 4, name: "Coffee Farm", kind: "Plantation tour", x: 43, y: 58 },
    { n: 5, name: "Lantern Market", kind: "Night market", x: 35, y: 67 },
  ];

  var GALLERY = [
    { cap: "Sunrise over the crater rim", scene: "linear-gradient(160deg,#ffd9a8,#e8623f)" },
    { cap: "Porto Lima at golden hour", scene: "linear-gradient(160deg,#f6a17a,#c84a2a)" },
    { cap: "The reef at Glass Cove", scene: "linear-gradient(160deg,#7fd0cf,#14666a)" },
    { cap: "Cloud forest ferns", scene: "linear-gradient(160deg,#9cc28a,#3f7e4f)" },
    { cap: "Lanterns in the old square", scene: "linear-gradient(160deg,#5a4a6e,#e8623f)" },
    { cap: "Terraced coffee hills", scene: "linear-gradient(160deg,#cdb893,#6b5230)" },
  ];

  /* ---------------------------------------------------------------
   * Tiny helpers
   * ------------------------------------------------------------- */
  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
    }
    if (html != null) node.innerHTML = html;
    return node;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------------------------------------------------------------
   * Render POI cards
   * ------------------------------------------------------------- */
  function makeCard(p) {
    var card = el("article", { class: "poi" });
    card.style.setProperty("--scene", p.scene);
    card.innerHTML =
      '<div class="poi__media" style="--scene:' +
      p.scene +
      '">' +
      '<span class="poi__badge">' +
      p.badge +
      "</span>" +
      '<span class="poi__price">' +
      p.price +
      "</span>" +
      "</div>" +
      '<div class="poi__body">' +
      '<h3 class="poi__name">' +
      p.name +
      "</h3>" +
      '<p class="poi__meta"><span class="poi__rating">★ ' +
      p.rating +
      '</span><span class="poi__dot">·</span>' +
      p.meta +
      "</p>" +
      '<p class="poi__desc">' +
      p.desc +
      "</p>" +
      '<div class="poi__foot">' +
      '<span class="poi__tag">' +
      p.tag +
      "</span>" +
      '<button class="poi__save" type="button" aria-pressed="false" aria-label="Add ' +
      p.name +
      ' to trip" title="Add to trip">+</button>' +
      "</div>" +
      "</div>";
    // give the media a real background
    card.querySelector(".poi__media").style.background = p.scene;
    return card;
  }

  Object.keys(POIS).forEach(function (key) {
    var grid = document.querySelector('[data-grid="' + key + '"]');
    if (!grid) return;
    POIS[key].forEach(function (p) {
      grid.appendChild(makeCard(p));
    });
  });

  /* Trip save toggles (event delegation) */
  var tripCount = 0;
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".poi__save");
    if (!btn) return;
    var saved = btn.classList.toggle("is-saved");
    btn.setAttribute("aria-pressed", String(saved));
    btn.textContent = saved ? "✓" : "+";
    var name = btn.getAttribute("aria-label").replace(/^Add | to trip$/g, "");
    tripCount += saved ? 1 : -1;
    if (tripCount < 0) tripCount = 0;
    toast(
      saved
        ? "Added " + name + " to your trip (" + tripCount + ")"
        : "Removed " + name + " from your trip"
    );
  });

  /* ---------------------------------------------------------------
   * Map pins + legend (kept in sync)
   * ------------------------------------------------------------- */
  var pinHost = document.getElementById("mapPins");
  var legendHost = document.getElementById("mapLegend");

  function setActivePoint(n) {
    document.querySelectorAll(".pin").forEach(function (p) {
      p.classList.toggle("is-active", p.dataset.n === String(n));
    });
    document.querySelectorAll(".legitem").forEach(function (l) {
      var on = l.dataset.n === String(n);
      l.classList.toggle("is-active", on);
      l.setAttribute("aria-pressed", String(on));
    });
  }

  MAP_POINTS.forEach(function (pt) {
    var pin = el("button", {
      class: "pin",
      type: "button",
      "data-n": pt.n,
      "aria-label": pt.name + " — " + pt.kind,
      title: pt.name,
    });
    pin.style.left = pt.x + "%";
    pin.style.top = pt.y + "%";
    pin.innerHTML = '<span class="pin__n">' + pt.n + "</span>";
    pin.addEventListener("click", function () {
      setActivePoint(pt.n);
      toast(pt.name + " · " + pt.kind);
    });
    if (pinHost) pinHost.appendChild(pin);

    var item = el("button", {
      class: "legitem",
      type: "button",
      "data-n": pt.n,
      "aria-pressed": "false",
    });
    item.innerHTML =
      '<span class="legitem__num">' +
      pt.n +
      "</span>" +
      '<span class="legitem__txt"><span class="legitem__name">' +
      pt.name +
      '</span><span class="legitem__kind">' +
      pt.kind +
      "</span></span>";
    item.addEventListener("click", function () {
      setActivePoint(pt.n);
      toast(pt.name + " · " + pt.kind);
    });
    if (legendHost) legendHost.appendChild(item);
  });

  /* ---------------------------------------------------------------
   * Gallery band
   * ------------------------------------------------------------- */
  var galleryHost = document.getElementById("galleryBand");
  if (galleryHost) {
    GALLERY.forEach(function (g) {
      var frame = el("button", {
        class: "gframe",
        type: "button",
        "aria-label": "Photo: " + g.cap,
      });
      frame.style.setProperty("--scene", g.scene);
      frame.style.background = g.scene;
      frame.innerHTML = '<span class="gframe__cap">' + g.cap + "</span>";
      frame.addEventListener("click", function () {
        toast("📷 " + g.cap);
      });
      galleryHost.appendChild(frame);
    });
  }

  /* ---------------------------------------------------------------
   * Save-guide hero button
   * ------------------------------------------------------------- */
  var saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      var saved = saveBtn.classList.toggle("is-saved");
      saveBtn.setAttribute("aria-pressed", String(saved));
      saveBtn.querySelector(".btn__label").textContent = saved
        ? "Guide saved"
        : "Save guide";
      toast(
        saved
          ? "Isla Verde saved to your guides"
          : "Removed from your saved guides"
      );
    });
  }

  /* ---------------------------------------------------------------
   * Scrollspy + smooth-scroll for the sticky nav
   * ------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".sectionnav__link")
  );
  var spyMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute("data-spy");
    var section = document.getElementById(id);
    if (section) spyMap[id] = link;
  });

  function activateLink(id) {
    navLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("data-spy") === id);
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activateLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    Object.keys(spyMap).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* Smooth scroll + move focus for keyboard users */
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("data-spy");
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      activateLink(id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // move focus without re-scrolling (focus after scroll completes)
      setTimeout(function () {
        target.focus({ preventScroll: true });
      }, 420);
      history.replaceState(null, "", "#" + id);
    });
  });
})();
