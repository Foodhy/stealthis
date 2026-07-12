(function () {
  "use strict";

  // --- Icons (inline SVG paths) ---
  var icons = {
    tooth:
      '<path d="M12 5.5c-2-1.8-4.6-2.2-6-1C4 6.2 4.4 9 5.2 12c.6 2.2 1.1 5.4 2.4 6.2 1.3.8 1.7-2.2 2.6-3.4.5-.7 1.1-.9 1.8-.9s1.3.2 1.8.9c.9 1.2 1.3 4.2 2.6 3.4 1.3-.8 1.8-4 2.4-6.2.8-3 1.2-5.8-.8-7.5-1.4-1.2-4-.8-6 1z"/>',
    shield:
      '<path d="M12 3l7 3v5c0 4.6-3 7.9-7 9-4-1.1-7-4.4-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    sparkle:
      '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M18 14l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z"/>',
    smile:
      '<circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0"/><path d="M9 9h.01M15 9h.01"/>',
    align:
      '<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 8v8M11 8v8M15 8v8"/>',
    scalpel:
      '<path d="M4 20 14 10l3 3-10 10z"/><path d="M14 10 20 4a2 2 0 0 0-2.8-2.8L12 6z"/>',
    implant:
      '<path d="M12 3c-2 0-3.5 1.5-3.5 3.5 0 1.3.6 2.2 1.2 3l.3 6c.1 1.4 3.9 1.4 4 0l.3-6c.6-.8 1.2-1.7 1.2-3C15.5 4.5 14 3 12 3z"/>',
    xray:
      '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v18M15 3v18M4 9h16M4 15h16"/>',
  };

  // --- Data (fictional) ---
  var services = [
    {
      id: "checkup",
      cat: "general",
      catLabel: "General",
      icon: "shield",
      title: "Check-up & Clean",
      desc: "A thorough exam, professional scale and polish to keep gums healthy and catch issues early.",
      duration: "45 min",
      price: "£55",
      about:
        "A relaxed appointment with a full oral health assessment, gum check and gentle hygienist clean.",
      points: [
        "Digital notes and clear next-step advice",
        "Personalised brushing and flossing tips",
        "Recommended every 6 months",
      ],
    },
    {
      id: "filling",
      cat: "general",
      catLabel: "General",
      icon: "tooth",
      title: "Tooth-Coloured Fillings",
      desc: "Discreet composite fillings that repair decay and blend naturally with your existing teeth.",
      duration: "30–50 min",
      price: "£95",
      about:
        "We remove decay and rebuild the tooth with a colour-matched composite that bonds directly for strength.",
      points: [
        "Mercury-free, natural finish",
        "Local anaesthetic for comfort",
        "Usually completed in one visit",
      ],
    },
    {
      id: "rootcanal",
      cat: "general",
      catLabel: "General",
      icon: "xray",
      title: "Root Canal Therapy",
      desc: "Save an infected tooth and relieve pain with careful, modern endodontic treatment.",
      duration: "60–90 min",
      price: "£320",
      about:
        "Infected pulp is gently cleaned out and the canal sealed, letting you keep your natural tooth.",
      points: [
        "Rotary instruments for precision",
        "Often more comfortable than expected",
        "Crown recommended afterwards",
      ],
    },
    {
      id: "whitening",
      cat: "cosmetic",
      catLabel: "Cosmetic",
      icon: "sparkle",
      title: "Teeth Whitening",
      desc: "Brighten your smile several shades with a supervised take-home whitening system.",
      duration: "2 weeks at home",
      price: "£249",
      about:
        "Custom-fitted trays and professional-grade gel let you whiten safely and gradually at home.",
      points: [
        "Custom trays taken from your impressions",
        "Even, natural-looking results",
        "Top-up gel available anytime",
      ],
    },
    {
      id: "veneers",
      cat: "cosmetic",
      catLabel: "Cosmetic",
      icon: "smile",
      title: "Porcelain Veneers",
      desc: "Thin, bespoke shells that transform shape, colour and alignment for a confident smile.",
      duration: "2–3 visits",
      price: "£495",
      about:
        "Hand-crafted porcelain veneers are bonded to the front of teeth to reshape your smile line.",
      points: [
        "Digital smile preview before we start",
        "Stain-resistant, long-lasting finish",
        "Minimal tooth reduction",
      ],
    },
    {
      id: "bonding",
      cat: "cosmetic",
      catLabel: "Cosmetic",
      icon: "sparkle",
      title: "Composite Bonding",
      desc: "Reshape chips, gaps and edges in a single visit with sculpted, colour-matched resin.",
      duration: "45–60 min",
      price: "£140",
      about:
        "Composite is layered and sculpted directly onto the tooth, then polished for a seamless look.",
      points: [
        "No drilling in most cases",
        "Same-day results",
        "Easily repaired or refreshed",
      ],
    },
    {
      id: "aligners",
      cat: "ortho",
      catLabel: "Orthodontics",
      icon: "align",
      title: "Clear Aligners",
      desc: "Straighten teeth discreetly with a series of removable, near-invisible aligner trays.",
      duration: "6–12 months",
      price: "£1,850",
      about:
        "A guided sequence of clear trays gently moves teeth into place — removable for eating and cleaning.",
      points: [
        "3D plan of your final smile",
        "Fewer clinic visits than braces",
        "Interest-free payment plans",
      ],
    },
    {
      id: "braces",
      cat: "ortho",
      catLabel: "Orthodontics",
      icon: "align",
      title: "Fixed Braces",
      desc: "Precise, reliable correction for more complex alignment and bite concerns.",
      duration: "12–24 months",
      price: "£2,400",
      about:
        "Tooth-coloured or metal brackets guide teeth accurately, ideal for larger movements and bite fixes.",
      points: [
        "Discreet ceramic option available",
        "Regular adjustment appointments",
        "Retainer included at the end",
      ],
    },
    {
      id: "retainer",
      cat: "ortho",
      catLabel: "Orthodontics",
      icon: "smile",
      title: "Retainers",
      desc: "Protect your investment and keep newly straightened teeth beautifully in place.",
      duration: "30 min fitting",
      price: "£120",
      about:
        "Fixed or removable retainers hold your results so your smile stays straight for years to come.",
      points: [
        "Fixed or clear removable styles",
        "Comfortable, low-profile fit",
        "Replacements available",
      ],
    },
    {
      id: "extraction",
      cat: "surgery",
      catLabel: "Surgery",
      icon: "scalpel",
      title: "Tooth Extraction",
      desc: "Gentle, well-managed removal when a tooth can no longer be saved, with aftercare support.",
      duration: "30–45 min",
      price: "£150",
      about:
        "Careful, calm extraction under local anaesthetic with clear aftercare guidance for smooth healing.",
      points: [
        "Sedation options for anxious patients",
        "Written aftercare instructions",
        "Follow-up check included",
      ],
    },
    {
      id: "implant",
      cat: "surgery",
      catLabel: "Surgery",
      icon: "implant",
      title: "Dental Implants",
      desc: "A permanent, natural-feeling replacement for missing teeth using a titanium post and crown.",
      duration: "3–6 months",
      price: "£2,200",
      about:
        "A biocompatible post is placed into the jaw and topped with a custom crown for a stable, lasting result.",
      points: [
        "3D scan and guided placement",
        "Looks and functions like a real tooth",
        "Cares for jawbone health",
      ],
    },
    {
      id: "wisdom",
      cat: "surgery",
      catLabel: "Surgery",
      icon: "xray",
      title: "Wisdom Tooth Removal",
      desc: "Surgical removal of impacted or painful wisdom teeth by our experienced clinical team.",
      duration: "45–60 min",
      price: "£280",
      about:
        "Impacted wisdom teeth are assessed by scan and removed with careful technique to minimise discomfort.",
      points: [
        "Detailed pre-surgery imaging",
        "Sedation available",
        "Clear recovery plan",
      ],
    },
  ];

  // --- Elements ---
  var grid = document.getElementById("grid");
  var filters = document.getElementById("filters");
  var searchInput = document.getElementById("search");
  var resultCount = document.getElementById("resultCount");
  var emptyMsg = document.getElementById("empty");
  var toastEl = document.getElementById("toast");
  var chips = Array.prototype.slice.call(filters.querySelectorAll(".chip"));

  var state = { cat: "all", query: "" };
  var saved = {};

  function svg(name) {
    return (
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      (icons[name] || icons.tooth) +
      "</svg>"
    );
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // --- Build a card ---
  function cardHTML(s) {
    var points = s.points
      .map(function (p) {
        return "<li>" + esc(p) + "</li>";
      })
      .join("");
    return (
      '<article class="card" data-cat="' +
      s.cat +
      '" data-id="' +
      s.id +
      '">' +
      '<div class="card-top">' +
      '<div class="card-icon" aria-hidden="true">' +
      svg(s.icon) +
      "</div>" +
      "<div>" +
      '<div class="card-cat">' +
      esc(s.catLabel) +
      "</div>" +
      "<h3>" +
      esc(s.title) +
      "</h3>" +
      "</div>" +
      "</div>" +
      '<p class="card-desc">' +
      esc(s.desc) +
      "</p>" +
      '<div class="card-meta">' +
      '<span class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
      esc(s.duration) +
      "</span>" +
      '<span class="badge price">From ' +
      esc(s.price) +
      "</span>" +
      "</div>" +
      '<div class="card-actions">' +
      '<button class="learn-more" type="button" aria-expanded="false" aria-controls="detail-' +
      s.id +
      '">Learn more <span class="chev" aria-hidden="true">›</span></button>' +
      '<button class="save-btn" type="button" aria-pressed="false" aria-label="Save ' +
      esc(s.title) +
      '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg></button>' +
      "</div>" +
      '<div class="card-detail" id="detail-' +
      s.id +
      '"><div><div class="detail-inner">' +
      "<p>" +
      esc(s.about) +
      "</p>" +
      "<ul>" +
      points +
      "</ul>" +
      '<button class="btn btn-ghost book-service" type="button" data-title="' +
      esc(s.title) +
      '">Book this treatment</button>' +
      "</div></div></div>" +
      "</article>"
    );
  }

  // --- Render ---
  function render() {
    var q = state.query.trim().toLowerCase();
    var list = services.filter(function (s) {
      var matchCat = state.cat === "all" || s.cat === state.cat;
      var matchQ =
        !q ||
        s.title.toLowerCase().indexOf(q) !== -1 ||
        s.desc.toLowerCase().indexOf(q) !== -1 ||
        s.catLabel.toLowerCase().indexOf(q) !== -1;
      return matchCat && matchQ;
    });

    grid.innerHTML = list.map(cardHTML).join("");

    // restore saved state
    list.forEach(function (s) {
      if (saved[s.id]) {
        var btn = grid.querySelector('.card[data-id="' + s.id + '"] .save-btn');
        if (btn) {
          btn.classList.add("saved");
          btn.setAttribute("aria-pressed", "true");
        }
      }
    });

    emptyMsg.hidden = list.length !== 0;
    var label =
      list.length === 0
        ? "No treatments found"
        : "Showing " +
          list.length +
          " treatment" +
          (list.length === 1 ? "" : "s") +
          (state.cat === "all" ? "" : " in " + catLabel(state.cat));
    resultCount.textContent = label;
  }

  function catLabel(cat) {
    var map = {
      general: "General",
      cosmetic: "Cosmetic",
      ortho: "Orthodontics",
      surgery: "Surgery",
    };
    return map[cat] || cat;
  }

  // --- Chip counts ---
  function updateCounts() {
    var counts = { all: services.length, general: 0, cosmetic: 0, ortho: 0, surgery: 0 };
    services.forEach(function (s) {
      counts[s.cat] = (counts[s.cat] || 0) + 1;
    });
    Object.keys(counts).forEach(function (k) {
      var el = filters.querySelector('[data-count="' + k + '"]');
      if (el) el.textContent = counts[k];
    });
  }

  // --- Toast ---
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow then show
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 300);
    }, 2600);
  }

  // --- Events: filter chips ---
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      state.cat = chip.getAttribute("data-cat");
      render();
    });
  });

  // keyboard arrow nav across chips
  filters.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var idx = chips.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    var next = e.key === "ArrowRight" ? idx + 1 : idx - 1;
    if (next < 0) next = chips.length - 1;
    if (next >= chips.length) next = 0;
    chips[next].focus();
  });

  // --- Search ---
  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    render();
  });

  // --- Delegated grid interactions ---
  grid.addEventListener("click", function (e) {
    var learn = e.target.closest(".learn-more");
    if (learn) {
      var detail = document.getElementById(learn.getAttribute("aria-controls"));
      var open = learn.getAttribute("aria-expanded") === "true";
      learn.setAttribute("aria-expanded", String(!open));
      detail.classList.toggle("open", !open);
      return;
    }

    var save = e.target.closest(".save-btn");
    if (save) {
      var card = save.closest(".card");
      var id = card.getAttribute("data-id");
      var svc = services.find(function (s) {
        return s.id === id;
      });
      saved[id] = !saved[id];
      save.classList.toggle("saved", saved[id]);
      save.setAttribute("aria-pressed", String(saved[id]));
      toast(saved[id] ? "Saved " + svc.title : "Removed " + svc.title);
      return;
    }

    var book = e.target.closest(".book-service");
    if (book) {
      toast("Booking request sent for " + book.getAttribute("data-title"));
      return;
    }
  });

  // --- Header CTAs ---
  var bookTop = document.getElementById("bookTop");
  var bookBottom = document.getElementById("bookBottom");
  if (bookTop)
    bookTop.addEventListener("click", function () {
      toast("Thanks! Our team will call to confirm your visit.");
    });
  if (bookBottom)
    bookBottom.addEventListener("click", function () {
      toast("Consultation request received — we'll be in touch soon.");
    });

  // --- Init ---
  updateCounts();
  render();
})();
