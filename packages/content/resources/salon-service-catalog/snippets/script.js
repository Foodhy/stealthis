(function () {
  "use strict";

  var CATEGORY_LABELS = {
    hair: "Hair",
    color: "Color",
    nails: "Nails",
    spa: "Spa",
    brows: "Brows & Lashes",
  };

  var SERVICES = [
    {
      name: "Signature Cut & Style",
      category: "hair",
      desc: "A bespoke consultation, precision cut, and finish tailored to your face and hair architecture.",
      duration: 75,
      price: 95,
    },
    {
      name: "Dry Bar Blowout",
      category: "hair",
      desc: "Wash, scalp ritual, and a long-lasting smooth or tousled blow-dry finish.",
      duration: 45,
      price: 55,
    },
    {
      name: "Keratin Smoothing Ritual",
      category: "hair",
      desc: "A botanical keratin treatment that tames frizz and adds a glassy, weightless shine.",
      duration: 150,
      price: 220,
      from: true,
    },
    {
      name: "Gentlemen's Cut & Beard",
      category: "hair",
      desc: "Tailored clipper-and-scissor cut with a hot-towel beard sculpt and finish.",
      duration: 50,
      price: 60,
    },
    {
      name: "Full Balayage",
      category: "color",
      desc: "Hand-painted, sun-kissed dimension blended seamlessly through mid-lengths and ends.",
      duration: 180,
      price: 240,
      from: true,
    },
    {
      name: "Gloss & Tone Refresh",
      category: "color",
      desc: "A demi-permanent glaze to revive tone, neutralize brass, and restore mirror shine.",
      duration: 45,
      price: 65,
    },
    {
      name: "Root Touch-Up",
      category: "color",
      desc: "Seamless regrowth coverage matched precisely to your existing color story.",
      duration: 90,
      price: 85,
    },
    {
      name: "Couture Gel Manicure",
      category: "nails",
      desc: "Shape, cuticle care, and a chip-resistant gel finish in a curated seasonal palette.",
      duration: 60,
      price: 48,
    },
    {
      name: "Luxe Spa Pedicure",
      category: "nails",
      desc: "Warm soak, exfoliating scrub, mask, and extended massage with a flawless polish.",
      duration: 70,
      price: 62,
    },
    {
      name: "Aurelia Facial",
      category: "spa",
      desc: "A deep-cleanse, lymphatic massage, and brightening botanical mask for luminous skin.",
      duration: 60,
      price: 110,
    },
    {
      name: "Hot Stone Back Ritual",
      category: "spa",
      desc: "A grounding stone-and-oil massage focused on the back, neck, and shoulders.",
      duration: 50,
      price: 95,
    },
    {
      name: "Scalp Detox & Head Spa",
      category: "spa",
      desc: "A clarifying scalp treatment with steam, massage, and a restorative serum seal.",
      duration: 45,
      price: 78,
    },
    {
      name: "Brow Lamination & Tint",
      category: "brows",
      desc: "Sculpted, fuller-looking brows set in place with a custom tint and conditioning finish.",
      duration: 45,
      price: 58,
    },
    {
      name: "Volume Lash Set",
      category: "brows",
      desc: "Featherlight hand-fanned extensions for soft, wide-eyed dimension that lasts.",
      duration: 120,
      price: 145,
      from: true,
    },
  ];

  var catalog = document.getElementById("catalog");
  var searchInput = document.getElementById("search");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var resetBtn = document.getElementById("reset");
  var toastEl = document.getElementById("toast");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  var state = { filter: "all", query: "" };
  var toastTimer = null;

  function fmtPrice(n) {
    return "$" + n.toFixed(0);
  }

  function fmtDuration(min) {
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60);
    var m = min % 60;
    return m ? h + " hr " + m + " min" : h + " hr";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function cardHtml(svc, i) {
    var from = svc.from
      ? '<span class="service__from">from</span>'
      : "";
    return (
      '<li class="service" data-category="' +
      svc.category +
      '" style="animation-delay:' +
      Math.min(i * 35, 280) +
      'ms">' +
      '<div class="service__head">' +
      '<h3 class="service__name">' +
      escapeHtml(svc.name) +
      "</h3>" +
      '<span class="service__leader" aria-hidden="true"></span>' +
      '<span class="service__price">' +
      from +
      fmtPrice(svc.price) +
      "</span>" +
      "</div>" +
      '<p class="service__desc">' +
      escapeHtml(svc.desc) +
      "</p>" +
      '<div class="service__meta">' +
      '<span class="tag tag__cat">' +
      escapeHtml(CATEGORY_LABELS[svc.category]) +
      "</span>" +
      '<span class="tag"><span class="tag__dot" aria-hidden="true"></span>' +
      fmtDuration(svc.duration) +
      "</span>" +
      '<button class="btn btn--book service__book" type="button" data-book="' +
      escapeHtml(svc.name) +
      '">Book</button>' +
      "</div>" +
      "</li>"
    );
  }

  function matches(svc) {
    if (state.filter !== "all" && svc.category !== state.filter) return false;
    if (state.query) {
      var q = state.query;
      var hay = (svc.name + " " + svc.desc + " " + CATEGORY_LABELS[svc.category]).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var visible = SERVICES.filter(matches);
    catalog.innerHTML = visible.map(cardHtml).join("");
    countEl.textContent = String(visible.length);

    var hasNone = visible.length === 0;
    emptyEl.hidden = !hasNone;
    catalog.hidden = hasNone;
  }

  function updateChipCounts() {
    chips.forEach(function (chip) {
      var key = chip.getAttribute("data-filter");
      var n =
        key === "all"
          ? SERVICES.length
          : SERVICES.filter(function (s) {
              return s.category === key;
            }).length;
      var span = chip.querySelector(".chip__n");
      if (span) span.textContent = n;
    });
  }

  function setFilter(key) {
    state.filter = key;
    chips.forEach(function (chip) {
      var active = chip.getAttribute("data-filter") === key;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-selected", active ? "true" : "false");
    });
    render();
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---- events ---- */
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      setFilter(chip.getAttribute("data-filter"));
    });
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value.trim().toLowerCase();
    render();
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-book]");
    if (!btn) return;
    var name = btn.getAttribute("data-book");
    if (name === "__appointment__") {
      toast("Booking request started — we'll confirm your visit shortly.");
    } else {
      toast("Reserved · " + name + " — a stylist will confirm your time.");
    }
  });

  resetBtn.addEventListener("click", function () {
    searchInput.value = "";
    state.query = "";
    setFilter("all");
    searchInput.focus();
  });

  /* ---- init ---- */
  updateChipCounts();
  render();
})();
