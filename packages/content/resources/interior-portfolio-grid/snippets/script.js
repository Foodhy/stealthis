(function () {
  "use strict";

  // Gradient "photographs" — warm, natural, clearly fictional.
  var gradients = {
    ashfield: "linear-gradient(135deg,#cdb79e 0%,#a8886a 55%,#6d5138 100%)",
    lumen: "linear-gradient(135deg,#e4dccb 0%,#b6a488 60%,#7b6a52 100%)",
    marigold: "linear-gradient(135deg,#e6c9a1 0%,#c69b6d 55%,#8c6a4f 100%)",
    fernbank: "linear-gradient(135deg,#c3cbaf 0%,#9caf88 55%,#5f6f4c 100%)",
    slate: "linear-gradient(135deg,#c8c2b8 0%,#948d80 55%,#524b40 100%)",
    tideline: "linear-gradient(135deg,#d5cfc4 0%,#a99f8d 50%,#6f6552 100%)",
    ember: "linear-gradient(135deg,#dcb597 0%,#b08968 55%,#7d5a3d 100%)",
    quarry: "linear-gradient(135deg,#d8d0c2 0%,#b0a692 55%,#6b5f4b 100%)"
  };

  var projects = [
    {
      id: "ashfield",
      name: "Ashfield House",
      category: "residential",
      location: "Sonoma, California",
      year: "2025",
      scope: "Full renovation",
      area: "3,400 sq ft",
      materials: "Lime plaster · white oak · travertine",
      brief:
        "A 1920s ranch reworked around a central courtyard. We opened sightlines to the olive grove, layered lime-washed walls with reclaimed oak, and kept a quiet, sun-warmed palette throughout."
    },
    {
      id: "lumen",
      name: "Lumen Offices",
      category: "commercial",
      location: "Portland, Oregon",
      year: "2024",
      scope: "Workplace design",
      area: "11,200 sq ft",
      materials: "Cork · brushed brass · wool felt",
      brief:
        "Headquarters for a design cooperative. Acoustic wool baffles and cork floors soften an open floorplate, while brass detailing and warm task lighting bring calm to long working days."
    },
    {
      id: "marigold",
      name: "Marigold Hotel",
      category: "hospitality",
      location: "Oaxaca, Mexico",
      year: "2026",
      scope: "Boutique hotel · 22 rooms",
      area: "18,000 sq ft",
      materials: "Clay render · barro tile · rattan",
      brief:
        "A courtyard hotel built from local clay and hand-thrown barro tile. Rattan screens filter the afternoon light, and every room opens to a planted loggia for slow mornings."
    },
    {
      id: "fernbank",
      name: "Fernbank Cottage",
      category: "residential",
      location: "Hudson Valley, New York",
      year: "2023",
      scope: "Interior architecture",
      area: "2,100 sq ft",
      materials: "Sage limewash · ash · linen",
      brief:
        "A weekend cottage tucked into the treeline. Sage-toned limewash and ash joinery echo the forest outside, with deep window seats framing the seasons as they turn."
    },
    {
      id: "slate",
      name: "Slate & Co. Studio",
      category: "commercial",
      location: "Chicago, Illinois",
      year: "2024",
      scope: "Retail & showroom",
      area: "4,600 sq ft",
      materials: "Honed stone · blackened steel · oak",
      brief:
        "A ceramics showroom where the objects lead. Honed stone plinths and blackened steel shelving recede into shadow, letting glazed surfaces catch a single band of north light."
    },
    {
      id: "tideline",
      name: "Tideline Residence",
      category: "residential",
      location: "Cornwall, England",
      year: "2025",
      scope: "Coastal home",
      area: "2,800 sq ft",
      materials: "Lime plaster · driftwood oak · wool",
      brief:
        "A cliffside home shaped by weather. Salt-resistant finishes and driftwood-toned oak keep interiors soft and pale, so the changing sea remains the brightest thing in the room."
    },
    {
      id: "ember",
      name: "Ember Wine Bar",
      category: "hospitality",
      location: "Austin, Texas",
      year: "2026",
      scope: "Restaurant & bar",
      area: "3,900 sq ft",
      materials: "Clay tadelakt · walnut · ember glass",
      brief:
        "An intimate wine bar lit like dusk. Tadelakt walls in clay tones wrap a walnut bar, and low amber pendants keep the whole room at a warm, unhurried glow."
    },
    {
      id: "quarry",
      name: "Quarry Loft",
      category: "residential",
      location: "Antwerp, Belgium",
      year: "2022",
      scope: "Loft conversion",
      area: "1,950 sq ft",
      materials: "Micro-cement · patinated brass · oak",
      brief:
        "A former stone warehouse turned home. Micro-cement floors and patinated brass fittings honour the raw shell, softened by a floating oak volume that holds the sleeping quarters."
    }
  ];

  var grid = document.getElementById("grid");
  var countNum = document.getElementById("count-num");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var drawer = document.getElementById("drawer");
  var panel = drawer.querySelector(".drawer__panel");
  var toastEl = document.getElementById("toast");
  var activeFilter = "all";
  var lastFocused = null;
  var toastTimer;

  function labelFor(cat) {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  function render(filter) {
    var list = projects.filter(function (p) {
      return filter === "all" || p.category === filter;
    });
    countNum.textContent = list.length;
    grid.innerHTML = "";

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "grid__empty";
      empty.textContent = "No projects in this category yet.";
      grid.appendChild(empty);
      return;
    }

    list.forEach(function (p, i) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.style.animationDelay = i * 45 + "ms";
      card.setAttribute("data-id", p.id);
      card.setAttribute(
        "aria-label",
        p.name + ", " + labelFor(p.category) + " project in " + p.location + ", " + p.year
      );
      card.innerHTML =
        '<div class="card__media">' +
        '<div class="card__img" style="background:' + gradients[p.id] + '"></div>' +
        '<span class="card__badge">' + labelFor(p.category) + "</span>" +
        '<span class="card__year">' + p.year + "</span>" +
        "</div>" +
        '<div class="card__body">' +
        '<h2 class="card__name">' + p.name + "</h2>" +
        '<p class="card__loc">' + p.location + "</p>" +
        "</div>";
      card.addEventListener("click", function () {
        openDrawer(p);
      });
      grid.appendChild(card);
    });
  }

  function openDrawer(p) {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    document.getElementById("drawer-hero").style.background = gradients[p.id];
    document.getElementById("drawer-badge").textContent = labelFor(p.category);
    document.getElementById("drawer-title").textContent = p.name;
    document.getElementById("drawer-meta").textContent = p.location + " · " + p.year;
    document.getElementById("drawer-brief").textContent = p.brief;

    var specs = document.getElementById("drawer-specs");
    specs.innerHTML =
      '<div><dt>Scope</dt><dd>' + p.scope + "</dd></div>" +
      '<div><dt>Area</dt><dd>' + p.area + "</dd></div>" +
      '<div><dt>Materials</dt><dd>' + p.materials + "</dd></div>";

    // force reflow so the transition runs
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
    panel.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      drawer.hidden = true;
    }, 350);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (chip.classList.contains("is-active")) return;
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      activeFilter = chip.getAttribute("data-filter");
      render(activeFilter);
    });
  });

  drawer.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeDrawer();
  });

  document.getElementById("inquire").addEventListener("click", function () {
    var title = document.getElementById("drawer-title").textContent;
    toast("Inquiry sent for " + title + " — the studio will be in touch.");
    closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  render(activeFilter);
})();
