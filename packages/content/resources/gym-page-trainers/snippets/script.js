(function () {
  "use strict";

  /* ---------- Data ---------- */
  var TRAINERS = [
    {
      id: "marcus",
      name: "Marcus Vale",
      role: "Head Strength Coach",
      initials: "MV",
      color: "#c6ff3a",
      rating: 4.9,
      reviews: 214,
      specialties: ["Strength", "Mobility"],
      certs: "NSCA-CSCS · 9 yrs",
      bio: "Powerlifting background turned hybrid coach. Builds bulletproof joints before chasing big numbers.",
      full: "Marcus spent six years on the competitive powerlifting circuit before moving into full-time coaching. His sessions blend heavy compound work with deliberate mobility drills so members get strong without breaking down. Expect honest feedback, clean technique, and a plan that scales with you.",
      achievements: [
        "Coached 30+ members to their first bodyweight deadlift",
        "Regional Raw Powerlifting silver medalist, 2021",
        "Author of the Ironforge Foundations strength template"
      ],
      slots: [
        { label: "Mon 6:00 AM", taken: false },
        { label: "Mon 5:30 PM", taken: true },
        { label: "Wed 7:00 AM", taken: false },
        { label: "Thu 6:30 PM", taken: false },
        { label: "Sat 9:00 AM", taken: true }
      ]
    },
    {
      id: "elena",
      name: "Elena Brooks",
      role: "Mobility & Recovery",
      initials: "EB",
      color: "#34d399",
      rating: 5.0,
      reviews: 168,
      specialties: ["Mobility", "Yoga"],
      certs: "FRC · RYT-500 · 7 yrs",
      bio: "Movement specialist who turns stiff lifters into supple athletes with smart joint work.",
      full: "Elena combines Functional Range Conditioning with a yoga foundation to rebuild range of motion that desk jobs and heavy training take away. Her work is the quiet reason a lot of Ironforge members stay injury-free season after season.",
      achievements: [
        "FRC Mobility Specialist, top-rated cohort",
        "Led 200+ recovery workshops at Ironforge",
        "Reduced reported nagging injuries by 40% in her clients"
      ],
      slots: [
        { label: "Tue 8:00 AM", taken: false },
        { label: "Tue 12:00 PM", taken: false },
        { label: "Fri 7:30 AM", taken: true },
        { label: "Sun 10:00 AM", taken: false }
      ]
    },
    {
      id: "darnell",
      name: "Darnell Cruz",
      role: "Boxing Coach",
      initials: "DC",
      color: "#ff6a2b",
      rating: 4.8,
      reviews: 191,
      specialties: ["Boxing", "Strength"],
      certs: "USA Boxing L2 · 11 yrs",
      bio: "Ex-amateur boxer who teaches footwork first and conditioning that actually transfers.",
      full: "Darnell came up in amateur boxing and now runs Ironforge's most popular conditioning classes. Whether you want to spar or just hit pads to blow off steam, he meets you where you are and sharpens fundamentals fast.",
      achievements: [
        "37-5 amateur record across two weight classes",
        "Built the Ironforge Sweat Science boxing program",
        "Corner-coached three regional Golden Gloves finalists"
      ],
      slots: [
        { label: "Mon 7:00 PM", taken: false },
        { label: "Wed 6:00 AM", taken: true },
        { label: "Thu 7:00 PM", taken: false },
        { label: "Sat 11:00 AM", taken: false }
      ]
    },
    {
      id: "priya",
      name: "Priya Nair",
      role: "Vinyasa & Breath",
      initials: "PN",
      color: "#a78bfa",
      rating: 4.9,
      reviews: 142,
      specialties: ["Yoga", "Mobility"],
      certs: "RYT-500 · 8 yrs",
      bio: "Flow-based yoga with a strength bias — power and calm in the same hour.",
      full: "Priya's classes pair athletic vinyasa flows with breath work that down-regulates a wired nervous system. Lifters love her for the shoulder and hip openers; everyone leaves a little taller.",
      achievements: [
        "Certified breath-work facilitator (Oxygen Advantage)",
        "Hosts the monthly Ironforge Reset retreat day",
        "Designed the pre-lift activation flow used gym-wide"
      ],
      slots: [
        { label: "Tue 6:30 PM", taken: false },
        { label: "Thu 9:00 AM", taken: false },
        { label: "Fri 6:00 PM", taken: true },
        { label: "Sun 8:00 AM", taken: false }
      ]
    },
    {
      id: "sofia",
      name: "Sofia Reyes",
      role: "Performance Nutrition",
      initials: "SR",
      color: "#fbbf24",
      rating: 5.0,
      reviews: 203,
      specialties: ["Nutrition", "Strength"],
      certs: "RD · Pn1 · 10 yrs",
      bio: "Registered dietitian who builds eating plans you'll actually stick to.",
      full: "Sofia is a registered dietitian focused on body-composition and performance fueling. No fad diets — just sustainable habits, smart macro targets, and check-ins that keep you honest while still letting you have a life.",
      achievements: [
        "Registered Dietitian, sports nutrition focus",
        "Guided 120+ members through body-recomposition",
        "Runs the Ironforge Fuel Lab cooking series"
      ],
      slots: [
        { label: "Mon 11:00 AM", taken: false },
        { label: "Wed 1:00 PM", taken: true },
        { label: "Wed 5:00 PM", taken: false },
        { label: "Fri 10:00 AM", taken: false }
      ]
    },
    {
      id: "theo",
      name: "Theo Mwangi",
      role: "Hypertrophy Coach",
      initials: "TM",
      color: "#60a5fa",
      rating: 4.7,
      reviews: 158,
      specialties: ["Strength", "Nutrition"],
      certs: "NASM-CPT · 6 yrs",
      bio: "Bodybuilding-style coaching for members chasing serious muscle.",
      full: "Theo lives for the pump. His detailed split programming and tempo work help intermediate lifters break plateaus, and he pairs training with simple nutrition nudges to keep gains coming.",
      achievements: [
        "Prepped 8 members for first-time physique shows",
        "Built Ironforge's 12-week hypertrophy block",
        "Top-rated coach for progress-photo transformations"
      ],
      slots: [
        { label: "Tue 5:30 AM", taken: false },
        { label: "Thu 5:30 PM", taken: true },
        { label: "Sat 8:00 AM", taken: false },
        { label: "Sun 4:00 PM", taken: false }
      ]
    }
  ];

  /* ---------- Helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2800);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Render grid ---------- */
  var grid = $("#trainer-grid");

  function cardHTML(t) {
    var tags = t.specialties.map(function (s) { return '<span class="tag">' + esc(s) + "</span>"; }).join("");
    return (
      '<button class="card" type="button" data-id="' + t.id +
        '" data-specialties="' + esc(t.specialties.join(",")) + '" aria-label="View profile for ' + esc(t.name) + '">' +
        '<div class="card__top">' +
          '<span class="avatar" style="background:' + t.color + '" aria-hidden="true">' + esc(t.initials) + "</span>" +
          "<div>" +
            '<div class="card__name">' + esc(t.name) + "</div>" +
            '<div class="card__role">' + esc(t.role) + "</div>" +
            '<div class="rating">★ ' + t.rating.toFixed(1) + " <span>(" + t.reviews + ")</span></div>" +
          "</div>" +
        "</div>" +
        '<div class="tags">' + tags + "</div>" +
        '<p class="card__bio">' + esc(t.bio) + "</p>" +
        '<div class="card__cert">' + esc(t.certs) + "</div>" +
        '<div class="card__foot"><span class="btn btn--neon btn--sm btn--block">Book session</span></div>' +
      "</button>"
    );
  }

  grid.innerHTML = TRAINERS.map(cardHTML).join("");

  /* ---------- Filtering ---------- */
  var countEl = $("#result-count");
  var emptyEl = $("#empty-state");
  var activeFilter = "all";

  function applyFilter(filter) {
    activeFilter = filter;
    var visible = 0;
    $$(".card", grid).forEach(function (card) {
      var specs = card.getAttribute("data-specialties").split(",");
      var match = filter === "all" || specs.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    emptyEl.hidden = visible !== 0;
    countEl.textContent = visible + (visible === 1 ? " coach" : " coaches") +
      (filter === "all" ? "" : " in " + filter);
  }

  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  applyFilter("all");

  /* ---------- Modal ---------- */
  var modal = $("#modal");
  var modalBody = $("#modal-body");
  var lastFocused = null;

  function modalHTML(t) {
    var tags = t.specialties.map(function (s) { return '<span class="tag">' + esc(s) + "</span>"; }).join("");
    var ach = t.achievements.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("");
    var slots = t.slots.map(function (s) {
      return '<button class="slot' + (s.taken ? " is-taken" : "") + '" type="button"' +
        (s.taken ? " disabled aria-disabled=\"true\"" : "") +
        ' data-slot="' + esc(s.label) + '">' + esc(s.label) + "</button>";
    }).join("");

    return (
      '<div class="m-hero">' +
        '<span class="avatar" style="background:' + t.color + '" aria-hidden="true">' + esc(t.initials) + "</span>" +
        "<div>" +
          '<h3 id="modal-name">' + esc(t.name) + "</h3>" +
          '<div class="card__role">' + esc(t.role) + "</div>" +
          '<div class="rating">★ ' + t.rating.toFixed(1) + " <span>(" + t.reviews + " reviews)</span></div>" +
          '<div class="tags">' + tags + "</div>" +
        "</div>" +
      "</div>" +
      '<div class="m-section"><h4>About</h4><p>' + esc(t.full) + "</p>" +
        '<div class="card__cert">' + esc(t.certs) + "</div></div>" +
      '<div class="m-section"><h4>Achievements</h4><ul class="ach-list">' + ach + "</ul></div>" +
      '<div class="m-section"><h4>Available slots</h4><div class="slots" id="slot-group">' + slots + "</div></div>" +
      '<div class="m-foot"><button class="btn btn--neon btn--block" type="button" id="confirm-book" disabled>' +
        "Select a slot to book</button></div>"
    );
  }

  function openModal(id) {
    var t = TRAINERS.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    lastFocused = document.activeElement;
    modalBody.innerHTML = modalHTML(t);
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    var selected = null;
    var confirmBtn = $("#confirm-book");

    $$(".slot:not(.is-taken)", modalBody).forEach(function (slot) {
      slot.addEventListener("click", function () {
        $$(".slot", modalBody).forEach(function (s) { s.classList.remove("is-selected"); });
        slot.classList.add("is-selected");
        selected = slot.getAttribute("data-slot");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Book " + t.name.split(" ")[0] + " · " + selected;
      });
    });

    confirmBtn.addEventListener("click", function () {
      if (!selected) return;
      closeModal();
      toast("Session booked with " + t.name + " — " + selected + ". Check your email.");
    });

    var closeBtn = $(".modal__close", modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (card) openModal(card.getAttribute("data-id"));
  });

  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* ---------- Generic toast buttons ---------- */
  $$("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () { toast(btn.getAttribute("data-toast")); });
  });
})();
