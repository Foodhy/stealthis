/* Hollow Reign — Patch Notes / Changelog (fictional demo data) */
(function () {
  "use strict";

  /* ===== Data ===== */
  var PATCHES = [
    {
      id: "1.4.2",
      kind: "hotfix",
      codename: "Ashen Tides Hotfix",
      date: "June 9, 2026",
      summary: "Emergency fixes for the Drowned Bastion raid and co-op desync reported after 1.4.0.",
      highlights: [
        "Drowned Bastion raid checkpoints now save correctly between sessions.",
        "Co-op desync during the Tidecaller boss phase resolved.",
        "Crash on launch for ultrawide displays fixed."
      ],
      sections: {
        added: [],
        changed: [
          { scope: "Netcode", text: "Reduced position-sync interval from 120ms to 60ms in 4-player co-op." }
        ],
        fixed: [
          { scope: "Raid", text: "Drowned Bastion checkpoint flags no longer reset after fast travel." },
          { scope: "Co-op", text: "Fixed clients desyncing when the Tidecaller submerges during phase two." },
          { scope: "Crash", text: "Fixed a crash on launch at 3440x1440 and wider resolutions." },
          { scope: "UI", text: "Patch banner no longer overlaps the minimap on the HUD scale 120% preset." }
        ],
        balance: [
          { scope: "Enemies", text: "Tidecaller adds spawn 15% slower on Apocalypse difficulty." }
        ]
      }
    },
    {
      id: "1.4.0",
      kind: "major",
      codename: "Ashen Tides",
      date: "June 2, 2026",
      summary: "The Drowned Bastion raid, the Stormcaller class, crossplay parties, and a full weapon-tuning pass.",
      highlights: [
        "New 4-player raid: the Drowned Bastion, with three bosses and a hidden vault.",
        "New playable class: Stormcaller — channel tempest sigils to chain lightning between marked foes.",
        "Crossplay parties between PC, console, and cloud are now live.",
        "Photo mode ships with 12 filters and free-cam orbit controls."
      ],
      sections: {
        added: [
          { scope: "Raid", text: "Drowned Bastion raid (Power 540+): three encounters, vault puzzle, and the Leviathan-class boss Maelketh." },
          { scope: "Classes", text: "Stormcaller class with two subclass trees: Tempest Herald and Gravewind." },
          { scope: "Weapons", text: "Six new weapons including the Riptide Crossbow and the greatblade Hullsplitter." },
          { scope: "Social", text: "Crossplay party finder with role tags (Tank / Support / Burst)." },
          { scope: "World", text: "Photo mode: free cam, depth of field, and 12 color-grade filters." },
          { scope: "Audio", text: "New dynamic raid score by the Nullforge audio team, with per-phase stems." }
        ],
        changed: [
          { scope: "UI", text: "Inventory grid rebuilt: drag-to-compare, loadout pinning, and bulk salvage." },
          { scope: "World", text: "Hollowmere hub re-lit at night; vendor stalls relocated near the fast-travel obelisk." },
          { scope: "Performance", text: "Shader pre-compilation now runs during the first loading screen, cutting hitching in Emberfall by ~40%." },
          { scope: "Quests", text: "Side-quest tracker now groups objectives by region instead of acquisition order." }
        ],
        fixed: [
          { scope: "Weapons", text: "Riptide Crossbow bolts no longer pass through Maelketh's shield during the flood phase." },
          { scope: "Quests", text: "Fixed 'Embers of the Old King' failing to advance if the brazier was lit before the dialogue ended." },
          { scope: "Co-op", text: "Revive prompts now appear reliably when a downed ally is on a slope." },
          { scope: "Audio", text: "Footstep audio no longer doubles when sprinting on metal grates." },
          { scope: "UI", text: "Fixed overlapping damage numbers when more than eight enemies are tagged." }
        ],
        balance: [
          { scope: "Weapons", text: "Riptide Crossbow: base damage 64 → 58, reload speed +10%." },
          { scope: "Classes", text: "Stormcaller 'Chain Surge' bounce count 5 → 4 in PvP only." },
          { scope: "Classes", text: "Warden 'Bulwark Oath' damage reduction 30% → 26%; cooldown 22s → 18s." },
          { scope: "Enemies", text: "Hollow Sentinels telegraph their slam 0.3s longer on all difficulties." },
          { scope: "Economy", text: "Vault clears award 25% more Ashmarks on first weekly completion." }
        ]
      }
    },
    {
      id: "1.3.5",
      kind: "update",
      codename: "Quality of Reign",
      date: "April 21, 2026",
      summary: "A quality-of-life pass: controller remapping, stash search, and dozens of community-reported fixes.",
      highlights: [
        "Full controller remapping with three savable presets.",
        "Stash search and sort-by-power arrive for all storage tabs."
      ],
      sections: {
        added: [
          { scope: "UI", text: "Stash search bar with fuzzy matching and rarity filters." },
          { scope: "Input", text: "Controller remapping with three savable presets per profile." },
          { scope: "World", text: "Training dummies in Hollowmere now display live DPS readouts." }
        ],
        changed: [
          { scope: "UI", text: "Vendor buyback tab retains items for 7 days, up from 24 hours." },
          { scope: "Performance", text: "Texture streaming pool auto-scales on 8GB GPUs, reducing pop-in at Emberfall gates." }
        ],
        fixed: [
          { scope: "Quests", text: "'The Salt Choir' no longer blocks progress if all three bells are rung out of order." },
          { scope: "Weapons", text: "Hullsplitter heavy attack correctly consumes one stamina bar instead of two." },
          { scope: "Co-op", text: "Trade window no longer cancels when either player opens the map." },
          { scope: "UI", text: "Fixed subtitle timing drift in pre-rendered cutscenes above 60 fps." }
        ],
        balance: [
          { scope: "Economy", text: "Salvage yields +1 Ember Core on Legendary items." },
          { scope: "Classes", text: "Gravewind dodge-cancel window 0.2s → 0.25s." }
        ]
      }
    },
    {
      id: "1.3.0",
      kind: "major",
      codename: "Hollow Reign: Emberfall",
      date: "March 3, 2026",
      summary: "The Emberfall region, mounted traversal, and the seasonal Ashen Vanguard event.",
      highlights: [
        "New region: Emberfall — a burning caldera city with 14 side quests.",
        "Mounts arrive: tame and ride the cinder-wolves of the ash plains.",
        "Seasonal event: Ashen Vanguard, with an exclusive armor set."
      ],
      sections: {
        added: [
          { scope: "World", text: "Emberfall region: caldera city, ash plains, and the Kiln-Warden stronghold." },
          { scope: "World", text: "Mount system with three tamable cinder-wolf variants and mounted sprint." },
          { scope: "Events", text: "Ashen Vanguard seasonal event with weekly war-effort milestones." },
          { scope: "Weapons", text: "Flame-forged weapon tier with heat buildup mechanics." }
        ],
        changed: [
          { scope: "UI", text: "World map rebuilt with region zoom levels and custom pins (up to 20)." },
          { scope: "Quests", text: "Main story quests now show recommended Power on the accept screen." }
        ],
        fixed: [
          { scope: "World", text: "Players can no longer clip through the Hollowmere aqueduct using the grapple." },
          { scope: "Audio", text: "Mount footsteps respect surface materials (ash, stone, water)." },
          { scope: "Crash", text: "Fixed a rare crash when alt-tabbing during the Emberfall arrival cutscene." }
        ],
        balance: [
          { scope: "Enemies", text: "Kiln-Warden elite health −12% in solo play; unchanged in co-op." },
          { scope: "Weapons", text: "Heat buildup decays 20% faster out of combat." },
          { scope: "Economy", text: "Mount taming reagents drop from all ash-plain bounties, not only world bosses." }
        ]
      }
    },
    {
      id: "1.2.1",
      kind: "hotfix",
      codename: "Stability Hotfix",
      date: "January 19, 2026",
      summary: "Targeted crash and progression fixes following the Hollow Depths update.",
      highlights: [
        "Fixed the most-reported crash in the Hollow Depths elevator sequence."
      ],
      sections: {
        added: [],
        changed: [
          { scope: "Performance", text: "Reduced VRAM usage in the Hollow Depths by streaming distant geometry tiers." }
        ],
        fixed: [
          { scope: "Crash", text: "Fixed a crash during the Hollow Depths elevator descent on DX12." },
          { scope: "Quests", text: "'Beneath the Reign' boss door now opens if the player dies during the key animation." },
          { scope: "UI", text: "Fixed the skill tree tooltip lingering after closing the menu with a controller." }
        ],
        balance: []
      }
    },
    {
      id: "1.2.0",
      kind: "update",
      codename: "Hollow Depths",
      date: "January 12, 2026",
      summary: "The Hollow Depths endgame dungeon, weekly mutators, and leaderboards.",
      highlights: [
        "Endgame dungeon: the Hollow Depths, with rotating weekly mutators.",
        "Region leaderboards for fastest clears, solo and co-op."
      ],
      sections: {
        added: [
          { scope: "Dungeon", text: "Hollow Depths endgame dungeon with five floors and weekly mutators." },
          { scope: "Social", text: "Clear-time leaderboards (solo / duo / full party) per region." },
          { scope: "UI", text: "Death recap screen showing the last three damage sources." }
        ],
        changed: [
          { scope: "World", text: "Fast travel between discovered obelisks is now free below Power 300." },
          { scope: "UI", text: "Damage numbers can be set to Compact, Full, or Off." }
        ],
        fixed: [
          { scope: "Weapons", text: "Charged bow shots no longer lose charge when opening doors." },
          { scope: "Co-op", text: "Party leader migration no longer drops the dungeon mutator state." }
        ],
        balance: [
          { scope: "Enemies", text: "Depths mutator 'Frenzied' attack-speed bonus 35% → 25%." },
          { scope: "Classes", text: "Tempest Herald lightning DoT can now crit; base tick damage −8%." }
        ]
      }
    }
  ];

  var SECTION_META = [
    { key: "added", label: "Added", tagClass: "tag-added" },
    { key: "changed", label: "Changed", tagClass: "tag-changed" },
    { key: "fixed", label: "Fixed", tagClass: "tag-fixed" },
    { key: "balance", label: "Balance", tagClass: "tag-balance" }
  ];

  var KIND_LABEL = { major: "Major", hotfix: "Hotfix", update: "Update" };

  /* ===== State ===== */
  var state = {
    versionId: PATCHES[0].id,
    category: "all",
    query: ""
  };

  /* ===== Element refs ===== */
  var versionList = document.getElementById("version-list");
  var notesPane = document.getElementById("notes-pane");
  var searchInput = document.getElementById("search-input");
  var searchClear = document.getElementById("search-clear");
  var chipRow = document.getElementById("chip-row");
  var resultCount = document.getElementById("result-count");
  var toastEl = document.getElementById("toast");

  /* ===== Helpers ===== */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /** Escape text and wrap query matches in <mark>. */
  function markText(text, query) {
    var safe = escapeHtml(text);
    if (!query) return safe;
    var re = new RegExp("(" + escapeRegExp(escapeHtml(query)) + ")", "gi");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function matchesQuery(entry, query) {
    if (!query) return true;
    var q = query.toLowerCase();
    return (
      entry.text.toLowerCase().indexOf(q) !== -1 ||
      entry.scope.toLowerCase().indexOf(q) !== -1
    );
  }

  function getPatch(id) {
    for (var i = 0; i < PATCHES.length; i++) {
      if (PATCHES[i].id === id) return PATCHES[i];
    }
    return PATCHES[0];
  }

  /* ===== Render: version rail ===== */
  function renderVersionList() {
    versionList.innerHTML = PATCHES.map(function (p) {
      var current = p.id === state.versionId;
      return (
        '<li>' +
        '<button class="version-btn" type="button" data-version="' + p.id + '" aria-current="' + current + '">' +
        '<span class="version-num">v' + p.id +
        ' <span class="version-kind kind-' + p.kind + '">' + KIND_LABEL[p.kind] + "</span></span>" +
        '<span class="version-date">' + escapeHtml(p.date) + "</span>" +
        "</button></li>"
      );
    }).join("");
  }

  /* ===== Render: notes pane ===== */
  function renderNotes() {
    var patch = getPatch(state.versionId);
    var query = state.query.trim();
    var totalShown = 0;
    var html = "";

    // Patch header
    html +=
      '<header class="patch-head">' +
      '<p class="patch-eyebrow">Patch ' + patch.id + " · " + KIND_LABEL[patch.kind] + "</p>" +
      '<h1 class="patch-title">' + escapeHtml(patch.codename) + "</h1>" +
      '<p class="patch-meta">Released <strong>' + escapeHtml(patch.date) + "</strong> — " +
      escapeHtml(patch.summary) + "</p>" +
      "</header>";

    // Highlights (only when not searching/filtering away)
    if (!query && state.category === "all" && patch.highlights.length) {
      html +=
        '<section class="highlights" aria-label="Patch highlights">' +
        '<div class="highlights-head">' +
        '<span class="pin-badge">Pinned</span>' +
        '<h2 class="highlights-title">Highlights</h2>' +
        "</div>" +
        '<ul class="highlights-list">' +
        patch.highlights.map(function (h) {
          return "<li>" + escapeHtml(h) + "</li>";
        }).join("") +
        "</ul></section>";
    }

    // Sections
    SECTION_META.forEach(function (meta) {
      if (state.category !== "all" && state.category !== meta.key) return;
      var entries = patch.sections[meta.key].filter(function (e) {
        return matchesQuery(e, query);
      });
      if (!entries.length) return;
      totalShown += entries.length;

      html +=
        '<section class="note-section" data-section="' + meta.key + '">' +
        '<h2 style="margin:0">' +
        '<button class="section-toggle" type="button" aria-expanded="true" aria-controls="body-' + meta.key + '">' +
        '<span class="section-tag ' + meta.tagClass + '">' + meta.label + "</span>" +
        '<span class="section-count">' + entries.length +
        (entries.length === 1 ? " entry" : " entries") + "</span>" +
        '<svg class="section-caret" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
        "</button></h2>" +
        '<div class="section-body" id="body-' + meta.key + '">' +
        '<ul class="entry-list">' +
        entries.map(function (e) {
          return (
            "<li>" +
            '<span class="entry-scope">' + escapeHtml(e.scope) + "</span>" +
            '<span class="entry-text">' + markText(e.text, query) + "</span>" +
            "</li>"
          );
        }).join("") +
        "</ul></div></section>";
    });

    // Empty state
    if (totalShown === 0) {
      html +=
        '<div class="empty-state">' +
        '<span class="empty-icon" aria-hidden="true">∅</span>' +
        "<p>No entries match " +
        (query ? "&ldquo;" + escapeHtml(query) + "&rdquo;" : "this filter") +
        " in patch " + patch.id + ". Try another keyword or category.</p>" +
        "</div>";
    }

    notesPane.innerHTML = html;

    // Result counter
    if (query || state.category !== "all") {
      resultCount.innerHTML =
        "Showing <strong>" + totalShown + "</strong> " +
        (totalShown === 1 ? "entry" : "entries") +
        (state.category !== "all" ? " in <strong>" + state.category + "</strong>" : "") +
        (query ? ' matching &ldquo;<strong>' + escapeHtml(query) + "</strong>&rdquo;" : "") +
        " — patch " + patch.id;
    } else {
      resultCount.textContent = "";
    }
  }

  function render() {
    renderVersionList();
    renderNotes();
  }

  /* ===== Events ===== */
  versionList.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".version-btn");
    if (!btn) return;
    var id = btn.getAttribute("data-version");
    if (id === state.versionId) return;
    state.versionId = id;
    render();
    var patch = getPatch(id);
    toast("Viewing patch " + patch.id + " — " + patch.codename);
  });

  chipRow.addEventListener("click", function (ev) {
    var chip = ev.target.closest(".chip");
    if (!chip) return;
    state.category = chip.getAttribute("data-cat");
    Array.prototype.forEach.call(chipRow.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderNotes();
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    searchClear.hidden = searchInput.value.length === 0;
    renderNotes();
  });

  searchInput.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && searchInput.value) {
      searchInput.value = "";
      state.query = "";
      searchClear.hidden = true;
      renderNotes();
    }
  });

  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    state.query = "";
    searchClear.hidden = true;
    renderNotes();
    searchInput.focus();
  });

  // Collapsible sections (delegated — pane re-renders often)
  notesPane.addEventListener("click", function (ev) {
    var toggle = ev.target.closest(".section-toggle");
    if (!toggle) return;
    var expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    var body = document.getElementById(toggle.getAttribute("aria-controls"));
    if (body) body.hidden = expanded;
  });

  document.getElementById("btn-play").addEventListener("click", function () {
    toast("Launching Hollow Reign… (demo only)");
  });

  document.getElementById("btn-rss").addEventListener("click", function () {
    toast("Subscribed to patch-note updates (demo only)");
  });

  /* ===== Init ===== */
  document.getElementById("live-version").textContent = PATCHES[0].id;
  render();
})();
