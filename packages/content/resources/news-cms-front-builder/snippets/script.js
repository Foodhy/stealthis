(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Story data — fictional editorial copy (no lorem ipsum)
   * ------------------------------------------------------------------ */
  var STORIES = [
    {
      id: "harbor-vote",
      section: "Politics",
      img: "img-politics",
      kicker: "Harbor City",
      head: "Council Clears Waterfront Plan in a Marathon Vote",
      dek: "After eleven hours and a packed gallery, the rezoning passes 7–4 — but the financing fight is only beginning.",
      byline: { author: "Mara Velasco", role: "City Hall Bureau", read: "8 min" },
      caption: "Residents fill the council chamber as the final tally is read aloud.",
      credit: "Ledger Photo / D. Okafor",
      body: [
        "The vote came just after midnight, when a weary council clerk finally read the tally into a chamber that had not emptied since the afternoon. Seven in favor, four opposed, and with that the long-disputed waterfront district moved one step closer to a skyline it has been promised for the better part of a decade.",
        "Supporters called it a generational investment in housing and transit. Opponents, many of them lifelong dockworkers, warned that the numbers behind the deal had never been fully explained to the people who would live with them longest.",
        "What happens next depends less on the architecture than on the arithmetic. The bond package that underwrites the first phase must still clear a county review, and at least two of the yes votes were cast on the condition that affordability targets be written into the contract rather than the press release."
      ],
      pull: { quote: "We were asked to trust a drawing. Now we want to read the fine print.", cite: "— Councilmember Reyes" }
    },
    {
      id: "rate-decision",
      section: "Business",
      img: "img-business",
      kicker: "Markets",
      head: "Central Bank Holds the Line as Traders Brace for Spring",
      dek: "Rates stay put for a fourth meeting; the statement’s quiet edits did the talking.",
      byline: { author: "Theo Lindqvist", role: "Economics", read: "5 min" },
      caption: "The trading floor at Meridian Exchange minutes after the announcement.",
      credit: "Ledger Photo / R. Salt",
      body: [
        "Policymakers left the benchmark rate untouched for a fourth consecutive meeting, a decision that surprised almost no one and unsettled almost everyone. The drama, as is often the case, lived in the footnotes — a single deleted clause about “sustained” cooling that analysts spent the afternoon parsing line by line.",
        "Equities drifted, then steadied. The bond market, less forgiving, read the omission as a signal that cuts remain further off than the optimists had penciled in."
      ]
    },
    {
      id: "delta-flood",
      section: "Climate",
      img: "img-climate",
      kicker: "The Delta",
      head: "As the River Rises, an Old Town Rehearses Its Retreat",
      dek: "Engineers map a managed flood; the families upstream map a harder set of choices.",
      byline: { author: "Anika Brandt", role: "Climate Desk", read: "9 min" },
      caption: "Sandbags line the levee road at dawn near the Cedar Bend crossing.",
      credit: "Ledger Photo / J. Mwangi",
      body: [
        "The plan, on paper, is elegant: let the river take the floodplain it has always wanted, and spare the town behind it. In Cedar Bend, where the floodplain is also where people keep their gardens and bury their dead, elegance has been a harder sell.",
        "State engineers say the controlled breach could lower peak crests by nearly a meter. Residents say they have heard confident numbers before, and that the water rarely reads the memo."
      ]
    },
    {
      id: "gallery-heist",
      section: "Culture",
      img: "img-culture",
      kicker: "The Arts",
      head: "A Stolen Canvas Returns, and the Museum Won’t Say How",
      dek: "Missing for thirty years, the Verecker landscape is back on its hook — minus its frame and its story.",
      byline: { author: "Cole Marchetti", role: "Culture", read: "6 min" },
      caption: "Conservators examine the recovered Verecker under raking light.",
      credit: "Ledger Photo / P. Adeyemi",
      body: [
        "It reappeared the way it vanished: quietly, overnight, and without a witness willing to go on record. The Verecker landscape, gone since a foggy night in 1996, now hangs again in Gallery Nine, its varnish yellowed and its provenance suddenly very interesting.",
        "The museum has confirmed only that the work is authentic and that no ransom was paid. Everything else — who, how, and why now — sits behind a velvet rope of legal caution."
      ]
    },
    {
      id: "marathon-upset",
      section: "Sport",
      img: "img-sport",
      kicker: "Distance",
      head: "An Unseeded Runner Steals the Harbor Marathon",
      dek: "Twenty-six miles, one borrowed pair of shoes, and a finish nobody saw coming.",
      byline: { author: "Devon Park", role: "Sports", read: "4 min" },
      caption: "The leader breaks the tape on the Esplanade as the pack closes in.",
      credit: "Ledger Photo / S. Holt",
      body: [
        "She started in the fourth corral, anonymous behind a field of sponsored favorites. She finished alone, eleven seconds clear, having spent the last mile of the Harbor Marathon doing the one thing the form guides swore was impossible: pulling away.",
        "Her shoes, it turned out, were borrowed that morning from a teammate a half-size too big. “I’ll buy her a new pair,” the winner laughed at the line. “These ones are mine now.”"
      ]
    },
    {
      id: "transit-strike",
      section: "Politics",
      img: "img-politics",
      kicker: "Labor",
      head: "Transit Talks Collapse Hours Before the Morning Rush",
      dek: "Two unions, one expired contract, and a city wondering how it will get to work.",
      byline: { author: "Priya Nandakumar", role: "Transit", read: "7 min" },
      caption: "Empty platforms at Central Interchange as the first trains stay parked.",
      credit: "Ledger Photo / D. Okafor",
      body: [
        "Negotiations that had limped along for six weeks finally fell apart at 2 a.m., when the last offer on the table was met with a single word from across the room: no. By sunrise, the consequences belonged to commuters.",
        "Both sides claim they want to keep the trains running. Neither, for now, is willing to be the one who pays for it."
      ]
    },
    {
      id: "vineyard-tech",
      section: "Business",
      img: "img-business",
      kicker: "Enterprise",
      head: "The Vineyard That Replaced Its Forecasters With a Model",
      dek: "A century-old estate bets the harvest on an algorithm — and a stubborn old foreman.",
      byline: { author: "Theo Lindqvist", role: "Economics", read: "6 min" },
      caption: "Rows at the Bellhaven estate, sensors blinking between the vines.",
      credit: "Ledger Photo / R. Salt",
      body: [
        "Every morning the model tells the Bellhaven estate when to pick, when to wait, and when to worry. Every morning the foreman, forty harvests deep, walks the rows and decides whether to believe it.",
        "So far they have agreed more than they have argued. The year they disagreed, the foreman won — and the vintage, the family insists, was the best in a generation."
      ]
    },
    {
      id: "coral-lab",
      section: "Climate",
      img: "img-climate",
      kicker: "Science",
      head: "In a Cold Tank, Scientists Grow a Warmer Future for Coral",
      dek: "A breeding program races bleaching season with reefs born to take the heat.",
      byline: { author: "Anika Brandt", role: "Climate Desk", read: "8 min" },
      caption: "Juvenile coral colonies under grow-lights at the Marin lab.",
      credit: "Ledger Photo / J. Mwangi",
      body: [
        "In a windowless room that smells of salt and ambition, the next generation of reef is being raised one fragment at a time. The goal is not to save the coral that exists, but to breed the coral that might survive what is coming.",
        "It is slow, unglamorous work, measured in millimeters and disappointments. It is also, the researchers say, the only plan they have that does not depend on the ocean cooperating."
      ]
    }
  ];

  /* ------------------------------------------------------------------ */
  var queueEl = document.getElementById("queue");
  var paperEl = document.getElementById("paper");
  var toastEl = document.getElementById("toast");
  var queueCountEl = document.getElementById("queueCount");
  var layoutPctEl = document.getElementById("layoutPct");
  var publishBtn = document.getElementById("publishBtn");
  var resetBtn = document.getElementById("resetBtn");

  var slots = Array.prototype.slice.call(document.querySelectorAll(".slot"));
  var byId = {};
  STORIES.forEach(function (s) { byId[s.id] = s; });

  // assignment map: slotKey -> storyId
  var assignment = {};
  var draggingId = null;

  /* ---------------- toast helper ---------------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3200);
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- palette ---------------- */
  function buildQueue() {
    queueEl.innerHTML = "";
    STORIES.forEach(function (s) {
      var li = document.createElement("li");
      var placed = isPlaced(s.id);
      li.className = "card" + (placed ? " is-placed" : "");
      li.setAttribute("draggable", placed ? "false" : "true");
      li.setAttribute("data-id", s.id);
      li.setAttribute("data-section", s.section);
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", s.head + " — " + s.section + (placed ? ", placed" : ", press Enter to assign"));
      li.innerHTML =
        '<span class="card__placed">On page</span>' +
        '<span class="card__kicker">' + esc(s.section) + " · " + esc(s.kicker) + "</span>" +
        '<h3 class="card__head">' + esc(s.head) + "</h3>" +
        '<div class="card__meta"><b>' + esc(s.byline.author) + "</b><span>· " +
        esc(s.byline.read) + " read</span></div>";
      queueEl.appendChild(li);
    });
  }

  function isPlaced(id) {
    return Object.keys(assignment).some(function (k) { return assignment[k] === id; });
  }

  /* ---------------- rendering an article into a slot ---------------- */
  function renderArticle(slotKey, story) {
    if (slotKey === "briefs") return renderBriefs();
    var figure =
      '<figure class="figure">' +
      '<div class="figure__img ' + story.img + '" role="img" aria-label="' + esc(story.caption) + '"></div>' +
      '<figcaption class="figure__cap">' + esc(story.caption) +
      " <b>" + esc(story.credit) + "</b></figcaption>" +
      "</figure>";

    var byline =
      '<p class="art__byline">By <b>' + esc(story.byline.author) + "</b><span>· " +
      esc(story.byline.role) + "</span><span>· " + esc(story.byline.read) + " read</span></p>";

    var bodyParas = story.body.map(function (p) { return "<p>" + esc(p) + "</p>"; });

    // pull quote injected into the lead body where the layout allows
    if (slotKey === "lead" && story.pull && bodyParas.length > 1) {
      var pull =
        '<blockquote class="pull">' + esc(story.pull.quote) +
        "<cite>" + esc(story.pull.cite) + "</cite></blockquote>";
      bodyParas.splice(1, 0, pull);
    }

    var rail = "";
    if (slotKey === "sidebar") {
      rail = '<p class="art__rail">Analysis · The Long View</p>';
    }

    return (
      '<button class="slot__remove" type="button" aria-label="Remove story from this slot">×</button>' +
      '<article class="art">' +
      rail +
      '<span class="art__kicker">' + esc(story.section) + " · " + esc(story.kicker) + "</span>" +
      '<h2 class="art__head">' + esc(story.head) + "</h2>" +
      (slotKey === "lead" || slotKey === "sidebar"
        ? '<p class="art__dek">' + esc(story.dek) + "</p>"
        : "") +
      byline +
      figure +
      '<div class="art__body">' + bodyParas.join("") + "</div>" +
      "</article>"
    );
  }

  // The Briefs strip composes from every UNplaced story (max 5)
  function renderBriefs() {
    var used = Object.keys(assignment)
      .filter(function (k) { return k !== "briefs"; })
      .map(function (k) { return assignment[k]; });
    var pool = STORIES.filter(function (s) { return used.indexOf(s.id) === -1; }).slice(0, 5);
    if (pool.length === 0) pool = STORIES.slice(0, 5);

    var items = pool
      .map(function (s) {
        return "<li><b>" + esc(s.section) + "</b>" + esc(s.head) + "</li>";
      })
      .join("");

    return (
      '<button class="slot__remove" type="button" aria-label="Clear the briefs strip">×</button>' +
      '<h2 class="briefs__title">In Brief <small>From the Wire</small></h2>' +
      '<ul class="briefs__list" role="list">' + items + "</ul>"
    );
  }

  /* ---------------- slot state ---------------- */
  function fillSlot(slotKey, storyId) {
    var slot = slots.filter(function (s) { return s.dataset.slot === slotKey; })[0];
    if (!slot) return;

    // if this story already sits in another slot, vacate that one (swap-safe)
    if (slotKey !== "briefs") {
      Object.keys(assignment).forEach(function (k) {
        if (k !== slotKey && assignment[k] === storyId) clearSlot(k, true);
      });
    }

    assignment[slotKey] = storyId;
    var story = byId[storyId];
    slot.innerHTML = renderArticle(slotKey, story || {});
    slot.classList.add("is-filled");
    slot.setAttribute("aria-label", slot.dataset.label + " slot, " +
      (slotKey === "briefs" ? "briefs strip composed" : (story ? story.head : "")));
    wireRemove(slot, slotKey);
    refresh();
  }

  function clearSlot(slotKey, silent) {
    var slot = slots.filter(function (s) { return s.dataset.slot === slotKey; })[0];
    if (!slot) return;
    delete assignment[slotKey];
    restoreEmpty(slot);
    if (!silent) refresh();
  }

  function restoreEmpty(slot) {
    var label = slot.dataset.label;
    var drops = {
      Lead: "Drop the front-page anchor here",
      Secondary: "Above-the-fold support",
      Sidebar: "Column rail · analysis",
      Briefs: "In Brief · five-line digest strip"
    };
    slot.classList.remove("is-filled");
    slot.setAttribute("aria-label", slot.dataset.label + " slot, empty");
    slot.innerHTML =
      '<div class="slot__empty">' +
      '<span class="slot__tag">' + esc(label) + "</span>" +
      '<span class="slot__drop">' + esc(drops[label] || "Drop a story here") + "</span>" +
      "</div>";
  }

  function wireRemove(slot, slotKey) {
    var btn = slot.querySelector(".slot__remove");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      clearSlot(slotKey);
      toast("Removed from <strong>" + slot.dataset.label + "</strong>.");
    });
  }

  /* ---------------- refresh meta + briefs ---------------- */
  function refresh() {
    // briefs always reflects the current unplaced pool
    if (assignment.briefs !== undefined) {
      var bslot = slots.filter(function (s) { return s.dataset.slot === "briefs"; })[0];
      bslot.innerHTML = renderBriefs();
      wireRemove(bslot, "briefs");
    }

    buildQueue();
    wireCards();

    var placedCount = STORIES.filter(function (s) { return isPlaced(s.id); }).length;
    queueCountEl.textContent = placedCount + " placed";

    var filled = slots.filter(function (s) { return s.classList.contains("is-filled"); }).length;
    var pct = Math.round((filled / slots.length) * 100);
    layoutPctEl.textContent = pct + "%";
  }

  /* ---------------- drag & drop ---------------- */
  function wireCards() {
    queueEl.querySelectorAll(".card").forEach(function (card) {
      if (card.classList.contains("is-placed")) return;
      card.addEventListener("dragstart", function (e) {
        draggingId = card.dataset.id;
        card.classList.add("is-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", card.dataset.id);
          e.dataTransfer.effectAllowed = "move";
        }
      });
      card.addEventListener("dragend", function () {
        card.classList.remove("is-dragging");
        draggingId = null;
      });
      // keyboard: assign to first open slot
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          assignToNextOpen(card.dataset.id);
        }
      });
    });
  }

  function assignToNextOpen(storyId) {
    var order = ["lead", "sec1", "sec2", "sidebar"];
    for (var i = 0; i < order.length; i++) {
      if (assignment[order[i]] === undefined) {
        fillSlot(order[i], storyId);
        var lbl = slots.filter(function (s) { return s.dataset.slot === order[i]; })[0].dataset.label;
        toast("Placed in <strong>" + lbl + "</strong>.");
        return;
      }
    }
    toast("All story slots are full — remove one first.");
  }

  slots.forEach(function (slot) {
    var key = slot.dataset.slot;

    slot.addEventListener("dragover", function (e) {
      if (key === "briefs") return; // briefs auto-composes, no manual drop
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      slot.classList.add("is-over");
    });
    slot.addEventListener("dragleave", function () { slot.classList.remove("is-over"); });
    slot.addEventListener("drop", function (e) {
      e.preventDefault();
      slot.classList.remove("is-over");
      if (key === "briefs") return;
      var id = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || draggingId;
      if (!id || !byId[id]) return;
      fillSlot(key, id);
      toast("Placed <strong>" + esc(byId[id].byline.author) + "’s</strong> story in " +
        "<strong>" + slot.dataset.label + "</strong>.");
    });

    // keyboard activate empty slot -> nothing; filled handled by remove btn.
    // Allow Enter on the briefs slot to compose it.
    slot.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === slot) {
        e.preventDefault();
        if (key === "briefs" && assignment.briefs === undefined) {
          fillSlot("briefs", "__briefs__");
          toast("Composed the <strong>In Brief</strong> strip.");
        }
      }
    });
  });

  /* ---------------- device width toggle ---------------- */
  document.querySelectorAll(".seg__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".seg__btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      paperEl.dataset.device = btn.dataset.device;
    });
  });

  /* ---------------- publish & reset ---------------- */
  publishBtn.addEventListener("click", function () {
    var storySlots = ["lead", "sec1", "sec2", "sidebar"];
    var filled = storySlots.filter(function (k) { return assignment[k] !== undefined; }).length;
    if (assignment.lead === undefined) {
      toast("A front page needs a <strong>Lead</strong> story before publishing.");
      return;
    }
    var device = paperEl.dataset.device;
    toast("Front page published — <strong>" + filled + "</strong> stories live for the " +
      device + " edition. ✓");
  });

  resetBtn.addEventListener("click", function () {
    Object.keys(assignment).forEach(function (k) { clearSlot(k, true); });
    assignment = {};
    slots.forEach(restoreEmpty);
    refresh();
    toast("Layout cleared. Blank slate.");
  });

  /* ---------------- seed a starter layout ---------------- */
  function seed() {
    slots.forEach(restoreEmpty);
    fillSlot("lead", "harbor-vote");
    fillSlot("sec1", "delta-flood");
    fillSlot("sec2", "rate-decision");
    fillSlot("sidebar", "gallery-heist");
    fillSlot("briefs", "__briefs__");
    refresh();
  }

  buildQueue();
  wireCards();
  seed();
})();
