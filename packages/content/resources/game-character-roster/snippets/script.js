/* Hollow Reign — Hero Roster (demo data + interactions, fictional content) */
(() => {
  "use strict";

  const ROLE_META = {
    tank: { label: "Tank", glyph: "⛨" },
    dps: { label: "DPS", glyph: "⚔" },
    support: { label: "Support", glyph: "✚" },
  };

  const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2 };

  const HEROES = [
    {
      id: "kargath",
      name: "Kargath",
      epithet: "The Iron Bulwark",
      role: "tank",
      rarity: "legendary",
      difficulty: 1,
      origin: "Bastion of Vhal",
      colors: ["#5a4a1e", "#171307"],
      lore:
        "Forged in the siege-foundries of Vhal, Kargath traded his heartbeat for a reactor core. He holds the line not because he must — but because nothing behind him deserves to burn.",
      stats: { power: 58, defense: 95, mobility: 34, utility: 62 },
      abilities: [
        { key: "Q", icon: "🛡", name: "Aegis Wall", cd: "8s", desc: "Project a kinetic barrier that absorbs 420 damage for allies behind it." },
        { key: "E", icon: "⚓", name: "Gravlock", cd: "12s", desc: "Anchor in place, gaining 40% damage reduction and taunting nearby enemies." },
        { key: "⇧", icon: "💢", name: "Shockstep", cd: "10s", desc: "Lunge forward, knocking back enemies and slowing them by 30%." },
        { key: "R", icon: "🌋", name: "Coreburst", cd: "90s", ult: true, desc: "Vent the reactor: massive AoE knock-up and 6s of fortified armor." },
      ],
    },
    {
      id: "nyra",
      name: "Nyra Sol",
      epithet: "Dawn's Last Arrow",
      role: "dps",
      rarity: "epic",
      difficulty: 2,
      origin: "Sunspire Reach",
      colors: ["#7a2740", "#1a0a12"],
      lore:
        "The last ranger of a city that no longer exists, Nyra hunts the Hollow with arrows fletched from her home's ashes. Every shot is a name remembered.",
      stats: { power: 88, defense: 38, mobility: 76, utility: 44 },
      abilities: [
        { key: "Q", icon: "🏹", name: "Cinder Volley", cd: "6s", desc: "Loose three burning arrows that apply stacking ignite." },
        { key: "E", icon: "🪤", name: "Snare Line", cd: "14s", desc: "Plant a tripwire that roots the first enemy to cross it for 1.5s." },
        { key: "⇧", icon: "💨", name: "Ash Step", cd: "9s", desc: "Dash and leave a decoy of smoke that draws enemy fire." },
        { key: "R", icon: "☄", name: "Daybreak", cd: "80s", ult: true, desc: "Charge a piercing solar shot that deals more damage per enemy hit." },
      ],
    },
    {
      id: "vex9",
      name: "Vex-9",
      epithet: "Null Protocol",
      role: "dps",
      rarity: "legendary",
      difficulty: 3,
      origin: "Nullforge Black Site",
      colors: ["#1b4e5e", "#06141a"],
      lore:
        "An autonomous duelist frame that escaped decommissioning with nine personality shards — eight of them hostile. Vex-9 fights like a glitch given purpose.",
      stats: { power: 94, defense: 30, mobility: 92, utility: 36 },
      abilities: [
        { key: "Q", icon: "⚡", name: "Splitstrike", cd: "5s", desc: "Blink-slash through a target, dealing damage on entry and exit." },
        { key: "E", icon: "🌀", name: "Echo Frame", cd: "16s", desc: "Spawn a mirror copy that repeats your last ability at 50% power." },
        { key: "⇧", icon: "🩻", name: "Phase Skew", cd: "11s", desc: "Become untargetable for 0.8s; the next hit crits." },
        { key: "R", icon: "💀", name: "Nine Shards", cd: "100s", ult: true, desc: "All shards manifest at once — nine strikes across nearby enemies." },
      ],
    },
    {
      id: "maris",
      name: "Maris Thorne",
      epithet: "The Tidebinder",
      role: "support",
      rarity: "epic",
      difficulty: 2,
      origin: "Drowned Quarter",
      colors: ["#1e4d46", "#07140f"],
      lore:
        "Maris keeps her squad alive with water stolen from a sea that swallowed her family. She does not call it magic. She calls it a debt being repaid.",
      stats: { power: 42, defense: 50, mobility: 48, utility: 90 },
      abilities: [
        { key: "Q", icon: "💧", name: "Mendtide", cd: "4s", desc: "Send a wave that heals allies it passes through for 180 HP." },
        { key: "E", icon: "🫧", name: "Undertow", cd: "13s", desc: "Pull an enemy toward you and slow them by 40% for 2s." },
        { key: "⇧", icon: "🌊", name: "Slipstream", cd: "10s", desc: "Surf a current forward, cleansing slows from nearby allies." },
        { key: "R", icon: "⛲", name: "High Tide", cd: "95s", ult: true, desc: "Flood the area: allies inside heal rapidly and gain 25% move speed." },
      ],
    },
    {
      id: "dargoth",
      name: "Dargoth",
      epithet: "Hollow-Touched",
      role: "tank",
      rarity: "epic",
      difficulty: 2,
      origin: "The Sundered Crown",
      colors: ["#3c2a5e", "#0e0a1a"],
      lore:
        "Half consumed by the Hollow, Dargoth wears the corruption like armor. Where the void took his arm, it left a weapon — and a whisper he refuses to obey.",
      stats: { power: 66, defense: 86, mobility: 40, utility: 52 },
      abilities: [
        { key: "Q", icon: "🦾", name: "Void Grasp", cd: "9s", desc: "Extend the hollow arm to grab and yank an enemy to melee range." },
        { key: "E", icon: "🕳", name: "Abyssal Hide", cd: "15s", desc: "Convert 30% of damage taken into shields for 4s." },
        { key: "⇧", icon: "👣", name: "Dread March", cd: "12s", desc: "Stride forward unstoppably, fearing minions in your path." },
        { key: "R", icon: "🌑", name: "Crown of Nothing", cd: "110s", ult: true, desc: "Silence and tether all enemies in a wide ring to your position." },
      ],
    },
    {
      id: "lumen",
      name: "Lumen",
      epithet: "The Last Lighthouse",
      role: "support",
      rarity: "legendary",
      difficulty: 3,
      origin: "Aster Observatory",
      colors: ["#5e5320", "#161204"],
      lore:
        "A sentient beacon that walked off its cliff when the ships stopped coming. Lumen now guides heroes instead of hulls, burning brighter the darker it gets.",
      stats: { power: 50, defense: 44, mobility: 56, utility: 96 },
      abilities: [
        { key: "Q", icon: "🔆", name: "Guidelight", cd: "5s", desc: "Mark an ally: they gain 15% damage and heal when they hit marked foes." },
        { key: "E", icon: "🚨", name: "Warning Flare", cd: "12s", desc: "Reveal enemies in an area and blind those facing the flare." },
        { key: "⇧", icon: "✨", name: "Drift Beam", cd: "8s", desc: "Glide along a light ray; allies you pass gain a small shield." },
        { key: "R", icon: "🌟", name: "First Light", cd: "120s", ult: true, desc: "Resurrect the most recently fallen ally at 60% HP." },
      ],
    },
    {
      id: "sable",
      name: "Sable Riot",
      epithet: "Queen of the Undercity",
      role: "dps",
      rarity: "rare",
      difficulty: 1,
      origin: "Neon Drift Undercity",
      colors: ["#5e1e3a", "#16060e"],
      lore:
        "Street racer, smuggler, folk hero. Sable's twin scatterguns are named Rent and Revenge, and she's behind on neither.",
      stats: { power: 80, defense: 42, mobility: 70, utility: 30 },
      abilities: [
        { key: "Q", icon: "🔫", name: "Double Trouble", cd: "4s", desc: "Fire both scatterguns in a cone for heavy close-range damage." },
        { key: "E", icon: "🧨", name: "Rude Welcome", cd: "12s", desc: "Toss a sticky charge that detonates after 2s or on reactivation." },
        { key: "⇧", icon: "🛹", name: "Kickflip", cd: "7s", desc: "Vault backward off the nearest surface, reloading instantly." },
        { key: "R", icon: "🎆", name: "Riot Act", cd: "75s", ult: true, desc: "Unload an endless magazine for 5s with no reload and 30% lifesteal." },
      ],
    },
    {
      id: "brann",
      name: "Brann Okoro",
      epithet: "The Field Medic",
      role: "support",
      rarity: "rare",
      difficulty: 1,
      origin: "Vanguard Expedition VII",
      colors: ["#1e5e35", "#06150c"],
      lore:
        "Brann patched soldiers through three Hollow incursions with a toolkit and bad jokes. His drones do the flying; he does the caring.",
      stats: { power: 38, defense: 56, mobility: 44, utility: 84 },
      abilities: [
        { key: "Q", icon: "🚑", name: "Medidrone", cd: "6s", desc: "Deploy a drone that heals the lowest-HP ally for 220 over 4s." },
        { key: "E", icon: "💉", name: "Stim Dart", cd: "10s", desc: "Grant an ally 20% attack speed and slow immunity for 3s." },
        { key: "⇧", icon: "🧰", name: "Triage Pack", cd: "14s", desc: "Drop a med kit that allies can pick up for a burst heal." },
        { key: "R", icon: "🛰", name: "Mercy Uplink", cd: "100s", ult: true, desc: "All drones overcharge: team-wide healing beam for 6s." },
      ],
    },
    {
      id: "ironmaw",
      name: "Ironmaw",
      epithet: "The Walking Vault",
      role: "tank",
      rarity: "rare",
      difficulty: 1,
      origin: "Scrapline Foundry",
      colors: ["#444c5e", "#0d0f14"],
      lore:
        "A salvage mech rebuilt by Undercity kids from bank-vault plating and stubbornness. Ironmaw remembers being a door, and doors do not move.",
      stats: { power: 52, defense: 92, mobility: 28, utility: 48 },
      abilities: [
        { key: "Q", icon: "🚪", name: "Vault Slam", cd: "8s", desc: "Slam both arms down, stunning enemies in front for 1s." },
        { key: "E", icon: "🔩", name: "Bolted Down", cd: "16s", desc: "Become immovable and reflect 20% of damage taken." },
        { key: "⇧", icon: "🛞", name: "Scrap Roll", cd: "11s", desc: "Curl and roll forward, blocking projectiles while moving." },
        { key: "R", icon: "🏦", name: "Lockdown", cd: "105s", ult: true, desc: "Erect vault walls around an area, trapping everyone inside with you." },
      ],
    },
    {
      id: "echolin",
      name: "Echo Lin",
      epithet: "The Soundbreaker",
      role: "dps",
      rarity: "epic",
      difficulty: 3,
      origin: "Resonance Conservatory",
      colors: ["#2a3a6e", "#090c1a"],
      lore:
        "A concert violinist who weaponized resonance after the Hollow ate every frequency she loved. Her solos shatter armor — and the occasional eardrum.",
      stats: { power: 84, defense: 36, mobility: 64, utility: 58 },
      abilities: [
        { key: "Q", icon: "🎻", name: "Staccato", cd: "5s", desc: "Fire three piercing notes; the third note deals double damage." },
        { key: "E", icon: "🔇", name: "Dead Air", cd: "13s", desc: "Create a zone of silence that mutes enemy abilities for 2s." },
        { key: "⇧", icon: "🎵", name: "Glissando", cd: "9s", desc: "Slide along a sound wave, phasing through units." },
        { key: "R", icon: "📢", name: "Crescendo", cd: "85s", ult: true, desc: "Build a 3s chord, then release a screen-wide shockwave." },
      ],
    },
    {
      id: "thessaly",
      name: "Thessaly",
      epithet: "Warden of the Bloom",
      role: "tank",
      rarity: "epic",
      difficulty: 2,
      origin: "Verdant Scar",
      colors: ["#2e5e1e", "#0a1406"],
      lore:
        "Where the Hollow burned the great forest, one warden grew back wrong — bark like shield plate, roots like grappling lines, patience like winter.",
      stats: { power: 60, defense: 88, mobility: 36, utility: 66 },
      abilities: [
        { key: "Q", icon: "🌿", name: "Rootline", cd: "9s", desc: "Lash a root that roots the target and pulls you to them." },
        { key: "E", icon: "🌳", name: "Heartwood", cd: "14s", desc: "Regenerate 8% max HP over 4s; armor doubled while channeling." },
        { key: "⇧", icon: "🍃", name: "Mulch Charge", cd: "12s", desc: "Charge forward, leaving healing spores in your wake." },
        { key: "R", icon: "🌺", name: "Worldbloom", cd: "115s", ult: true, desc: "A colossal flower erupts, knocking enemies aside and sheltering allies." },
      ],
    },
  ];

  /* ---------- DOM refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const grid = $("#grid");
  const emptyEl = $("#empty");
  const resultCount = $("#result-count");
  const searchInput = $("#search");
  const sortBtn = $("#sort-rarity");
  const chipEls = Array.from(document.querySelectorAll(".chip"));
  const toastEl = $("#toast");

  const state = {
    role: "all",
    query: "",
    sortByRarity: false,
    selectedId: HEROES[0].id,
  };

  /* ---------- Toast helper ---------- */
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* ---------- Filtering / sorting ---------- */
  function visibleHeroes() {
    let list = HEROES.filter((h) => {
      const roleOk = state.role === "all" || h.role === state.role;
      const q = state.query.trim().toLowerCase();
      const queryOk =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.epithet.toLowerCase().includes(q);
      return roleOk && queryOk;
    });
    if (state.sortByRarity) {
      list = list
        .slice()
        .sort(
          (a, b) =>
            RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] ||
            a.name.localeCompare(b.name)
        );
    }
    return list;
  }

  /* ---------- Render grid ---------- */
  function renderGrid() {
    const list = visibleHeroes();
    grid.innerHTML = "";

    list.forEach((hero, i) => {
      const li = document.createElement("li");
      li.className = `card rarity-${hero.rarity} role-${hero.role}`;
      li.id = `card-${hero.id}`;
      li.setAttribute("role", "option");
      li.setAttribute("tabindex", "0");
      li.setAttribute(
        "aria-selected",
        hero.id === state.selectedId ? "true" : "false"
      );
      li.setAttribute(
        "aria-label",
        `${hero.name}, ${ROLE_META[hero.role].label}, ${hero.rarity}`
      );
      li.style.animationDelay = `${Math.min(i * 28, 280)}ms`;
      li.dataset.id = hero.id;

      li.innerHTML = `
        <span class="card-rarity">${hero.rarity}</span>
        <span class="portrait" style="--p1:${hero.colors[0]};--p2:${hero.colors[1]}" aria-hidden="true">${hero.name.charAt(0)}</span>
        <p class="card-name">${hero.name}</p>
        <span class="card-role"><span class="role-ico" aria-hidden="true">${ROLE_META[hero.role].glyph}</span>${ROLE_META[hero.role].label}</span>
      `;

      li.addEventListener("click", () => selectHero(hero.id));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectHero(hero.id);
        }
      });

      grid.appendChild(li);
    });

    emptyEl.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    resultCount.textContent = `${list.length} of ${HEROES.length} heroes shown`;
  }

  /* ---------- Featured panel ---------- */
  function selectHero(id, opts = {}) {
    const hero = HEROES.find((h) => h.id === id);
    if (!hero) return;
    state.selectedId = id;

    // grid selection rings
    grid.querySelectorAll(".card").forEach((card) => {
      card.setAttribute(
        "aria-selected",
        card.dataset.id === id ? "true" : "false"
      );
    });

    // splash
    const splash = $("#splash");
    splash.style.setProperty("--p1", hero.colors[0]);
    splash.style.setProperty("--p2", hero.colors[1]);
    $("#splash-letter").textContent = hero.name.charAt(0);
    $("#splash-glyph").textContent = ROLE_META[hero.role].glyph;

    // identity
    $("#f-role").textContent = ROLE_META[hero.role].label;
    $("#f-name").textContent = hero.name;
    $("#f-epithet").textContent = hero.epithet;
    $("#f-lore").textContent = hero.lore;
    $("#f-origin").textContent = hero.origin;

    const rarityEl = $("#f-rarity");
    rarityEl.textContent = hero.rarity;
    rarityEl.className = `rarity-badge rarity-${hero.rarity}`;

    // difficulty pips
    const diffEl = $("#f-difficulty");
    diffEl.setAttribute("aria-label", `Difficulty ${hero.difficulty} of 3`);
    diffEl.querySelectorAll(".pip").forEach((pip, i) => {
      pip.classList.toggle("on", i < hero.difficulty);
    });

    // stat bars: reset to 0 then animate to value
    document.querySelectorAll(".stat").forEach((row) => {
      const key = row.dataset.stat;
      const fill = row.querySelector(".stat-fill");
      const num = row.querySelector(".stat-num");
      const value = hero.stats[key];
      fill.style.transition = "none";
      fill.style.width = "0%";
      // force reflow so the bar re-animates on every selection
      void fill.offsetWidth;
      fill.style.transition = "";
      requestAnimationFrame(() => {
        fill.style.width = `${value}%`;
      });
      animateNumber(num, value);
    });

    renderAbilities(hero);

    if (!opts.silent) {
      toast(`${hero.name} — ${hero.epithet}`);
    }
  }

  function animateNumber(el, target) {
    const start = performance.now();
    const dur = 600;
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Abilities ---------- */
  function renderAbilities(hero) {
    const row = $("#ability-row");
    row.innerHTML = "";
    hero.abilities.forEach((ab) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `ability${ab.ult ? " is-ult" : ""}`;
      btn.setAttribute("aria-label", `${ab.name} (${ab.key}) — ${ab.desc}`);
      btn.innerHTML = `
        <span aria-hidden="true">${ab.icon}</span>
        <span class="ability-key" aria-hidden="true">${ab.key}</span>
        <span class="ability-tip" role="tooltip">
          <span class="tip-name">${ab.name}${ab.ult ? " · ULT" : ""}</span>
          <span class="tip-desc">${ab.desc}</span>
          <span class="tip-cd">Cooldown ${ab.cd}</span>
        </span>
      `;
      btn.addEventListener("click", () =>
        toast(`${ab.name} previewed — equip ${hero.name} to use it in-game.`)
      );
      row.appendChild(btn);
    });
  }

  /* ---------- Events ---------- */
  chipEls.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.role = chip.dataset.role;
      chipEls.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      renderGrid();
    });
  });

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    renderGrid();
  });

  sortBtn.addEventListener("click", () => {
    state.sortByRarity = !state.sortByRarity;
    sortBtn.setAttribute("aria-pressed", String(state.sortByRarity));
    renderGrid();
    toast(
      state.sortByRarity
        ? "Sorted by rarity — Legendary first."
        : "Rarity sort off — default order restored."
    );
  });

  $("#clear-filters").addEventListener("click", () => {
    state.role = "all";
    state.query = "";
    searchInput.value = "";
    chipEls.forEach((c) => {
      const active = c.dataset.role === "all";
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", String(active));
    });
    renderGrid();
    toast("Filters cleared.");
  });

  $("#select-hero").addEventListener("click", () => {
    const hero = HEROES.find((h) => h.id === state.selectedId);
    toast(`${hero.name} locked in. Queueing for the Sundered Crown…`);
  });

  $("#wishlist-skin").addEventListener("click", () => {
    const hero = HEROES.find((h) => h.id === state.selectedId);
    toast(`"${hero.epithet}" skin added to your wishlist.`);
  });

  $("#play-now").addEventListener("click", () => {
    toast("Launching Hollow Reign… (demo)");
  });

  /* ---------- Init ---------- */
  document.getElementById("roster-total").textContent = String(HEROES.length);
  renderGrid();
  selectHero(state.selectedId, { silent: true });
})();
