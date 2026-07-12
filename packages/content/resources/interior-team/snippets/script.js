/* Marlowe & Fen — Studio Team page */
(function () {
  "use strict";

  var U = "https://images.unsplash.com/";
  var q = "?auto=format&fit=crop&w=640&q=80";

  var TEAM = [
    {
      id: "elodie-marlowe",
      name: "Elodie Marlowe",
      role: "Founding Partner",
      disc: "residential",
      discLabel: "Residential",
      city: "Lisboa",
      years: "14 years",
      email: "elodie@marlowefen.studio",
      img: "photo-1544005313-94ddf0286df2",
      bio: "Elodie founded the studio on a belief that a home should feel inevitable — as if the rooms had always been that way.",
      full: "Elodie leads the residential practice with a preference for lime plaster, aged oak and light that moves through a room across the day. She trained as a cabinetmaker before turning to interiors, and it shows in the joinery-first way she approaches every plan.",
      projects: [["Casa Alfama", "2024"], ["The Belgrave House", "2022"], ["Quinta do Lago Villa", "2021"]]
    },
    {
      id: "tomas-fen",
      name: "Tomás Fen",
      role: "Founding Partner",
      disc: "commercial",
      discLabel: "Commercial",
      city: "London",
      years: "14 years",
      email: "tomas@marlowefen.studio",
      img: "photo-1500648767791-00dcc994a43e",
      bio: "Tomás shapes the studio's hospitality and workplace work, translating warmth into spaces that hold hundreds of people a day.",
      full: "Tomás thinks in circulation and acoustics as much as finishes. His commercial interiors — restaurants, members' clubs, studios — carry the same quiet materiality as the studio's homes, only built to take a decade of daily use.",
      projects: [["Larder & Vine, Soho", "2025"], ["Foundry Members Club", "2023"], ["Praça Coworking", "2022"]]
    },
    {
      id: "naomi-okafor",
      name: "Naomi Okafor",
      role: "Senior Designer",
      disc: "residential",
      discLabel: "Residential",
      city: "London",
      years: "8 years",
      email: "naomi@marlowefen.studio",
      img: "photo-1573497019940-1c28c88b4f3e",
      bio: "Naomi is drawn to colour drawn from the landscape — clay, ochre, moss — layered until a room feels sun-warmed.",
      full: "Naomi runs the studio's most ambitious family homes, balancing heirloom pieces with commissioned craft. She keeps a running archive of pigment swatches gathered on site walks, and most of the studio's palettes begin on her desk.",
      projects: [["Hampstead Terrace", "2024"], ["Ericeira Beach House", "2023"], ["The Reader's Flat", "2021"]]
    },
    {
      id: "arch-delgado",
      name: "Arch Delgado",
      role: "Lighting Designer",
      disc: "lighting",
      discLabel: "Lighting",
      city: "Lisboa",
      years: "6 years",
      email: "arch@marlowefen.studio",
      img: "photo-1507003211169-0a1dd7228f2d",
      bio: "Arch treats light as a material — never fixtures for their own sake, only the glow they leave on plaster and stone.",
      full: "Arch designs the layered lighting schemes that give the studio's rooms their evening character. He builds every scheme around a single low, warm anchor and works outward, so no room ever reads as merely switched on.",
      projects: [["Casa Alfama", "2024"], ["Foundry Members Club", "2023"], ["Atelier Lumen", "2022"]]
    },
    {
      id: "wren-castellan",
      name: "Wren Castellan",
      role: "Stylist & Set Designer",
      disc: "styling",
      discLabel: "Styling",
      city: "London",
      years: "5 years",
      email: "wren@marlowefen.studio",
      img: "photo-1487412720507-e7ab37603c6f",
      bio: "Wren dresses the finished rooms — the books, the ceramics, the single branch — that make a space read as lived-in.",
      full: "Wren stages every project for its final photography and, more importantly, for the first evening the client moves in. She sources from small makers and flea markets, keeping a props library the whole studio borrows from.",
      projects: [["The Belgrave House", "2022"], ["Larder & Vine, Soho", "2025"], ["Hampstead Terrace", "2024"]]
    },
    {
      id: "mateo-rivas",
      name: "Mateo Rivas",
      role: "Project Designer",
      disc: "commercial",
      discLabel: "Commercial",
      city: "Lisboa",
      years: "4 years",
      email: "mateo@marlowefen.studio",
      img: "photo-1506794778202-cad84cf45f1d",
      bio: "Mateo keeps the workshops honest — the detail drawings, the site visits, the joints that never make the magazines.",
      full: "Mateo carries the studio's commercial projects from concept into built reality, coordinating fabricators and trades. His measured drawings are quietly famous in the studio for anticipating problems months before they arrive on site.",
      projects: [["Praça Coworking", "2022"], ["Atelier Lumen", "2022"], ["Foundry Members Club", "2023"]]
    }
  ];

  var roster = document.getElementById("roster");
  var emptyEl = document.getElementById("empty");
  var countNum = document.getElementById("countNum");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  var state = { filter: "all", view: "grid" };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function imgUrl(id) { return U + id + q; }

  function render() {
    var list = TEAM.filter(function (p) {
      return state.filter === "all" || p.disc === state.filter;
    });
    roster.innerHTML = "";
    list.forEach(function (p) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.className = "card";
      btn.type = "button";
      btn.dataset.id = p.id;
      btn.setAttribute("aria-label", "View profile of " + p.name + ", " + p.role);
      btn.innerHTML =
        '<span class="card__figure"><img src="' + imgUrl(p.img) + '" alt="Portrait of ' + p.name + '" loading="lazy" /></span>' +
        '<span class="card__body">' +
          '<span class="card__rule" aria-hidden="true"></span>' +
          '<span class="card__name">' + p.name + '</span>' +
          '<span class="card__role">' + p.role + '</span>' +
          '<span class="badge" data-disc="' + p.disc + '">' + p.discLabel + '</span>' +
          '<span class="card__bio">' + p.bio + '</span>' +
        '</span>';
      btn.addEventListener("click", function () { openPanel(p.id); });
      li.appendChild(btn);
      roster.appendChild(li);
    });
    countNum.textContent = list.length;
    emptyEl.hidden = list.length !== 0;
    roster.hidden = list.length === 0;
  }

  /* ---- Filters ---- */
  var pills = document.querySelectorAll(".pill");
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("is-active");
        p.setAttribute("aria-pressed", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-pressed", "true");
      state.filter = pill.dataset.filter;
      render();
    });
  });

  /* ---- View toggle ---- */
  var viewBtns = document.querySelectorAll(".viewtoggle__btn");
  viewBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      viewBtns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      state.view = b.dataset.view;
      roster.classList.toggle("is-list", state.view === "list");
    });
  });

  /* ---- Detail panel ---- */
  var panel = document.getElementById("panel");
  var sheet = panel.querySelector(".panel__sheet");
  var lastFocused = null;
  var current = null;

  function openPanel(id) {
    var p = TEAM.find(function (x) { return x.id === id; });
    if (!p) return;
    current = p;
    lastFocused = document.activeElement;

    document.getElementById("panelPortrait").style.backgroundImage =
      "url(" + imgUrl(p.img) + ")";
    document.getElementById("panelRole").textContent = p.role;
    document.getElementById("panelName").textContent = p.name;
    var badge = document.getElementById("panelBadge");
    badge.textContent = p.discLabel;
    badge.setAttribute("data-disc", p.disc);
    document.getElementById("panelBio").textContent = p.full;
    document.getElementById("panelYears").textContent = p.years;
    document.getElementById("panelCity").textContent = p.city;
    document.getElementById("emailLabel").textContent = p.email;

    var pl = document.getElementById("panelProjects");
    pl.innerHTML = "";
    p.projects.forEach(function (pr) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + pr[0] + "</span><span>" + pr[1] + "</span>";
      pl.appendChild(li);
    });

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { sheet.focus(); }, 40);
  }

  function closePanel() {
    if (!panel.classList.contains("is-open")) return;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    current = null;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  panel.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closePanel);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePanel();
  });

  /* ---- Copy email ---- */
  document.getElementById("emailBtn").addEventListener("click", function () {
    if (!current) return;
    var email = current.email;
    var done = function () { toast("Copied " + email); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done).catch(function () {
        fallbackCopy(email); done();
      });
    } else {
      fallbackCopy(email); done();
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
  }

  render();
})();
