(function () {
  "use strict";

  var U = "https://images.unsplash.com/";
  var Q = "?auto=format&fit=crop&w=200&q=70";

  var DENTISTS = [
    {
      name: "Dr. Elena Vargas",
      role: "General & Preventive Dentistry",
      filter: "general",
      rating: "4.9",
      years: 16,
      next: "Tomorrow",
      soon: false,
      photo: U + "photo-1559839734-2b71ea197ec2" + Q,
      creds: ["DDS, State University", "AGD Fellow", "Invisalign Certified"],
      langs: ["English", "Spanish"],
      bio: "Elena leads our preventive care team and believes the calmest visits come from clear explanations. She focuses on gentle cleanings, early cavity detection, and building lifelong habits with nervous first-timers."
    },
    {
      name: "Dr. Marcus Bell",
      role: "Orthodontics",
      filter: "ortho",
      rating: "4.8",
      years: 12,
      next: "This week",
      soon: false,
      photo: U + "photo-1612349317150-e413f6a5b16d" + Q,
      creds: ["DMD", "MS Orthodontics", "Clear-Aligner Provider"],
      langs: ["English", "French"],
      bio: "Marcus straightens smiles with modern aligners and low-profile braces. He designs treatment plans you can preview before you commit, and he is known for patient-friendly progress check-ins."
    },
    {
      name: "Dr. Priya Anand",
      role: "Pediatric Dentistry",
      filter: "pediatric",
      rating: "5.0",
      years: 9,
      next: "Tomorrow",
      soon: false,
      photo: U + "photo-1594824476967-48c8b964273f" + Q,
      creds: ["DDS", "Pediatric Residency", "Board Certified"],
      langs: ["English", "Hindi", "Gujarati"],
      bio: "Priya makes the chair feel like an adventure. She specialises in first visits, sealants, and helping anxious kids and parents leave with a smile and a sticker."
    },
    {
      name: "Dr. James Okafor",
      role: "Oral & Maxillofacial Surgery",
      filter: "surgery",
      rating: "4.9",
      years: 18,
      next: "Next week",
      soon: true,
      photo: U + "photo-1622253692010-333f2da6031d" + Q,
      creds: ["DDS, MD", "OMFS Residency", "IV Sedation Licensed"],
      langs: ["English"],
      bio: "James handles extractions, implants, and complex cases with a steady, reassuring manner. He walks every patient through sedation options so surgery day feels predictable and safe."
    },
    {
      name: "Dr. Sofia Larsen",
      role: "Cosmetic & Restorative",
      filter: "cosmetic",
      rating: "4.9",
      years: 11,
      next: "This week",
      soon: false,
      photo: U + "photo-1573496359142-b8d87734a5a2" + Q,
      creds: ["DMD", "Aesthetic Dentistry Cert.", "Veneer Specialist"],
      langs: ["English", "Swedish"],
      bio: "Sofia designs natural-looking veneers, whitening, and bonding. She uses digital previews so you can see your new smile before a single tooth is touched."
    },
    {
      name: "Dr. Amir Hassan",
      role: "General & Endodontics",
      filter: "general",
      rating: "4.7",
      years: 14,
      next: "Today",
      soon: false,
      photo: U + "photo-1537368910025-700350fe46c7" + Q,
      creds: ["DDS", "Endodontic Training", "Same-Day Crowns"],
      langs: ["English", "Arabic"],
      bio: "Amir keeps painful problems from escalating. He covers root canals, urgent toothaches, and same-day crowns, and he saves same-week slots for emergencies."
    },
    {
      name: "Dr. Nina Petrova",
      role: "Orthodontics",
      filter: "ortho",
      rating: "4.8",
      years: 8,
      next: "This week",
      soon: false,
      photo: U + "photo-1580281658626-ee379f3cce93" + Q,
      creds: ["DMD", "Orthodontic Residency", "Lingual Braces"],
      langs: ["English", "Russian"],
      bio: "Nina works with teens and adults who want discreet options. She is meticulous about the finishing details that make a bite feel right, not just look straight."
    },
    {
      name: "Dr. Theo Nakamura",
      role: "Cosmetic & Whitening",
      filter: "cosmetic",
      rating: "4.9",
      years: 10,
      next: "Tomorrow",
      soon: false,
      photo: U + "photo-1566492031773-4f4e44671857" + Q,
      creds: ["DDS", "Smile Design Cert.", "In-Office Whitening"],
      langs: ["English", "Japanese"],
      bio: "Theo blends art and precision for brighter, balanced smiles. He is a favourite for wedding-ready whitening and subtle bonding that nobody can spot."
    }
  ];

  var grid = document.getElementById("grid");
  var tpl = document.getElementById("card-tpl");
  var searchInput = document.getElementById("search");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var resultCount = document.getElementById("result-count");
  var emptyEl = document.getElementById("empty");
  var resetBtn = document.getElementById("reset");

  var state = { filter: "all", query: "" };

  /* Toast helper */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.hidden = false;
    toastEl.textContent = msg;
    // reflow to restart transition
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function buildCard(d, i) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.filter = d.filter;
    node.dataset.name = d.name.toLowerCase();
    node.dataset.role = d.role.toLowerCase();
    node.style.animationDelay = Math.min(i * 40, 280) + "ms";

    node.querySelector(".avatar").style.backgroundImage = "url('" + d.photo + "')";

    var status = node.querySelector(".status");
    status.textContent = "Next: " + d.next;
    if (d.soon) status.classList.add("soon");

    node.querySelector(".name").textContent = d.name;
    node.querySelector(".rating-val").textContent = d.rating;
    node.querySelector(".role").textContent = d.role;

    var meta = node.querySelector(".meta");
    meta.innerHTML =
      "<li><strong>" + d.years + "</strong>&nbsp;yrs experience</li>" +
      "<li>Accepting new patients</li>";

    var creds = node.querySelector(".creds");
    d.creds.forEach(function (c) {
      var li = document.createElement("li");
      li.textContent = c;
      creds.appendChild(li);
    });

    node.querySelector(".bio-text").textContent = d.bio;
    var langs = node.querySelector(".langs");
    d.langs.forEach(function (l) {
      var li = document.createElement("li");
      li.textContent = l;
      langs.appendChild(li);
    });

    var bio = node.querySelector(".bio");
    var bioBtn = node.querySelector(".btn-bio");
    bioBtn.addEventListener("click", function () {
      var open = bioBtn.getAttribute("aria-expanded") === "true";
      bioBtn.setAttribute("aria-expanded", String(!open));
      bio.hidden = open;
      bioBtn.textContent = open ? "Read bio" : "Hide bio";
    });

    node.querySelector(".btn-book").addEventListener("click", function () {
      toast("Request sent — " + d.name + " will confirm your appointment shortly.");
    });

    return node;
  }

  function render() {
    var frag = document.createDocumentFragment();
    DENTISTS.forEach(function (d, i) {
      frag.appendChild(buildCard(d, i));
    });
    grid.appendChild(frag);
  }

  function applyFilters() {
    var cards = grid.querySelectorAll(".card");
    var shown = 0;
    cards.forEach(function (card) {
      var matchFilter = state.filter === "all" || card.dataset.filter === state.filter;
      var q = state.query;
      var matchQuery = !q || card.dataset.name.indexOf(q) > -1 || card.dataset.role.indexOf(q) > -1;
      var visible = matchFilter && matchQuery;
      card.classList.toggle("is-hidden", !visible);
      if (visible) shown++;
    });
    resultCount.textContent = shown;
    emptyEl.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      state.filter = chip.dataset.filter;
      applyFilters();
    });
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  resetBtn.addEventListener("click", function () {
    state.filter = "all";
    state.query = "";
    searchInput.value = "";
    chips.forEach(function (c) {
      var isAll = c.dataset.filter === "all";
      c.classList.toggle("is-active", isAll);
      c.setAttribute("aria-selected", String(isAll));
    });
    applyFilters();
  });

  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  render();
  applyFilters();
})();
