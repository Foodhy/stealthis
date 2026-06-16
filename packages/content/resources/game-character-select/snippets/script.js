/* Ashen Vanguard — character / loadout select screen (fictional demo data) */

const ROSTER = [
  {
    id: "vyre", name: "Vyre", epithet: "The Cinder Blade", role: "Assault",
    sigil: "VY", difficulty: 2, locked: false,
    gradient: ["#7c4dff", "#ff3d71"],
    lore: "Forged in the ash fields of Old Meridia, Vyre carves through frontlines with twin plasma edges and a grudge that outlived three wars.",
    abilities: [
      { key: "Q", name: "Ember Dash", desc: "Blink forward, igniting enemies in your path." },
      { key: "E", name: "Twin Arc", desc: "Cross-slash that shreds shields at close range." },
      { key: "R", name: "Cinderstorm", desc: "ULT — Whirlwind of burning blades for 6s.", ult: true },
    ],
    stats: { Damage: 86, Mobility: 78, Survival: 54, Utility: 40 },
  },
  {
    id: "okta", name: "Okta-9", epithet: "Siege Chassis", role: "Bulwark",
    sigil: "O9", difficulty: 1, locked: false,
    gradient: ["#ffc857", "#ff3d71"],
    lore: "A decommissioned siege automaton reactivated by the Vanguard. Okta-9 holds the line — or becomes it.",
    abilities: [
      { key: "Q", name: "Aegis Wall", desc: "Deploy a 4m hardlight barrier." },
      { key: "E", name: "Magnet Pull", desc: "Drag a target into melee range." },
      { key: "R", name: "Fortress Mode", desc: "ULT — Anchor and gain 60% damage reduction.", ult: true },
    ],
    stats: { Damage: 48, Mobility: 30, Survival: 95, Utility: 62 },
  },
  {
    id: "lyss", name: "Lyssira", epithet: "Choir of Static", role: "Support",
    sigil: "LY", difficulty: 2, locked: false,
    gradient: ["#36e27a", "#00e5ff"],
    lore: "Her resonance hymns knit flesh and circuitry alike. Squads that march with Lyssira rarely march home alone.",
    abilities: [
      { key: "Q", name: "Mend Chord", desc: "Heal beam that arcs between two allies." },
      { key: "E", name: "Dissonance", desc: "Silence enemy abilities in a small zone." },
      { key: "R", name: "Crescendo", desc: "ULT — Mass overheal and cleanse for the squad.", ult: true },
    ],
    stats: { Damage: 38, Mobility: 55, Survival: 60, Utility: 94 },
  },
  {
    id: "hex", name: "Hexen", epithet: "Null Protocol", role: "Recon",
    sigil: "HX", difficulty: 3, locked: false,
    gradient: ["#00e5ff", "#7c4dff"],
    lore: "A ghost in every network. Hexen sees the battlefield three seconds before it happens — and bets lives on it.",
    abilities: [
      { key: "Q", name: "Wire Tap", desc: "Reveal enemies through walls for 4s." },
      { key: "E", name: "Phase Step", desc: "Brief intangibility; drops aggro." },
      { key: "R", name: "Blackout", desc: "ULT — Disable enemy HUDs and minimap.", ult: true },
    ],
    stats: { Damage: 64, Mobility: 90, Survival: 42, Utility: 80 },
  },
  {
    id: "brakk", name: "Brakkar", epithet: "The Last Anvil", role: "Bulwark",
    sigil: "BR", difficulty: 1, locked: false,
    gradient: ["#ffc857", "#7c4dff"],
    lore: "The final smith of the Hollow Reign forges, Brakkar wears his masterpiece into battle: a mountain of reactive plate.",
    abilities: [
      { key: "Q", name: "Shockslam", desc: "Ground pound that staggers in a cone." },
      { key: "E", name: "Reforge", desc: "Convert incoming damage into armor." },
      { key: "R", name: "Anvilfall", desc: "ULT — Leap and crater the target zone.", ult: true },
    ],
    stats: { Damage: 58, Mobility: 35, Survival: 92, Utility: 50 },
  },
  {
    id: "nyx", name: "Nyxa", epithet: "Veil Dancer", role: "Recon",
    sigil: "NX", difficulty: 3, locked: false,
    gradient: ["#ff3d71", "#7c4dff"],
    lore: "Nobody has seen Nyxa's face and lived to file the report. The Veil moves where she wills it.",
    abilities: [
      { key: "Q", name: "Smoke Veil", desc: "Cloud that blinds and cloaks allies." },
      { key: "E", name: "Shadow Hook", desc: "Grapple to any surface within 18m." },
      { key: "R", name: "Eclipse", desc: "ULT — Squad-wide invisibility for 5s.", ult: true },
    ],
    stats: { Damage: 70, Mobility: 95, Survival: 38, Utility: 66 },
  },
  {
    id: "juno", name: "Juno Vex", epithet: "Ordnance Queen", role: "Assault",
    sigil: "JV", difficulty: 2, locked: false,
    gradient: ["#ff3d71", "#ffc857"],
    lore: "Ex-corporate demolitions, now freelance chaos. Juno believes every problem is a structural-integrity problem.",
    abilities: [
      { key: "Q", name: "Cluster Toss", desc: "Lob a splitting grenade cluster." },
      { key: "E", name: "Breach Charge", desc: "Stick a charge that blows cover open." },
      { key: "R", name: "Danger Close", desc: "ULT — Call an artillery line strike.", ult: true },
    ],
    stats: { Damage: 92, Mobility: 50, Survival: 48, Utility: 58 },
  },
  {
    id: "sol", name: "Solenne", epithet: "Dawn Warden", role: "Support",
    sigil: "SL", difficulty: 1, locked: false,
    gradient: ["#36e27a", "#ffc857"],
    lore: "A warden-priest of the Sunken Cathedral who traded relics for medkits. Her light is literal and weaponized.",
    abilities: [
      { key: "Q", name: "Solar Ward", desc: "Zone that heals allies and burns foes." },
      { key: "E", name: "Lifeline", desc: "Instantly revive at range, once per life." },
      { key: "R", name: "Daybreak", desc: "ULT — Blinding flash; resets cooldowns.", ult: true },
    ],
    stats: { Damage: 42, Mobility: 46, Survival: 70, Utility: 90 },
  },
  {
    id: "rook", name: "Rooke", epithet: "Iron Stray", role: "Assault",
    sigil: "RK", difficulty: 1, locked: false,
    gradient: ["#00e5ff", "#36e27a"],
    lore: "A drifting gun-for-hire from the Neon Drift circuits. Reliable trigger, unreliable loyalties — until now.",
    abilities: [
      { key: "Q", name: "Steady Aim", desc: "Next 3 shots gain perfect accuracy." },
      { key: "E", name: "Combat Slide", desc: "Slide-reload that breaks target lock." },
      { key: "R", name: "Dead Eye", desc: "ULT — Auto-mark and pierce all targets.", ult: true },
    ],
    stats: { Damage: 80, Mobility: 68, Survival: 56, Utility: 36 },
  },
  {
    id: "mor", name: "Morvain", epithet: "Grave Tide", role: "Bulwark",
    sigil: "MV", difficulty: 3, locked: true, unlock: "Reach Account Level 20",
    gradient: ["#7c4dff", "#12131c"],
    lore: "Locked — Reach Account Level 20 to recruit Morvain.",
    abilities: [], stats: { Damage: 60, Mobility: 40, Survival: 88, Utility: 70 },
  },
  {
    id: "cyra", name: "Cyra-Null", epithet: "Echo of Nullforge", role: "Recon",
    sigil: "CN", difficulty: 3, locked: true, unlock: "Complete the Nullforge event",
    gradient: ["#00e5ff", "#12131c"],
    lore: "Locked — Complete the Nullforge event to recruit Cyra-Null.",
    abilities: [], stats: { Damage: 72, Mobility: 88, Survival: 40, Utility: 76 },
  },
  {
    id: "ashk", name: "Ashkar", epithet: "Hollow King", role: "Assault",
    sigil: "AK", difficulty: 3, locked: true, unlock: "Own the Hollow Reign expansion",
    gradient: ["#ff3d71", "#12131c"],
    lore: "Locked — Own the Hollow Reign expansion to recruit Ashkar.",
    abilities: [], stats: { Damage: 96, Mobility: 60, Survival: 50, Utility: 44 },
  },
];

const LOADOUT_OPTIONS = {
  primary: ["Helix Carbine", "Maul SMG-7", "Longshot DMR", "Pyre Scattergun"],
  secondary: ["Arc Pistol", "Stinger Machine Pistol", "Riot Blade", "Flux Repeater"],
  perk: ["Adrenal Surge", "Ghost Plating", "Scavenger Core", "Overclock Module"],
};

const ROLE_CLASS = {
  Assault: "assault",
  Support: "support",
  Recon: "recon",
  Bulwark: "tank",
};

/* ---------- helpers ---------- */

const $ = (sel) => document.querySelector(sel);

let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2400);
}

/* ---------- state ---------- */

let selectedId = "vyre";
let lockedIn = false;
let countdownTimer = null;
const loadoutIndex = { primary: 0, secondary: 0, perk: 0 };

/* ---------- roster grid ---------- */

const grid = $("#rosterGrid");

function buildRoster() {
  ROSTER.forEach((c) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile" + (c.locked ? " tile--locked" : "");
    tile.dataset.id = c.id;
    tile.setAttribute("role", "option");
    tile.setAttribute("aria-selected", String(c.id === selectedId));
    tile.setAttribute(
      "aria-label",
      c.locked ? `${c.name}, ${c.role}, locked — ${c.unlock}` : `${c.name}, ${c.role}`
    );

    tile.innerHTML = `
      <span class="tile__portrait" style="background:linear-gradient(160deg, ${c.gradient[0]}, ${c.gradient[1]})">
        <span class="tile__sigil">${c.sigil}</span>
      </span>
      ${c.locked ? '<span class="tile__lock" aria-hidden="true">🔒</span>' : ""}
      <span class="tile__meta">
        <span class="tile__name">${c.name}</span>
        <span class="tile__role"><i class="role-ico role-ico--${ROLE_CLASS[c.role]}"></i>${c.role}</span>
      </span>`;

    tile.addEventListener("click", () => {
      if (lockedIn) return toast("Already locked in — deploying soon.");
      if (c.locked) return toast(`${c.name} is locked: ${c.unlock}.`);
      selectCharacter(c.id);
    });

    tile.addEventListener("mouseenter", () => {
      if (!c.locked && !lockedIn && c.id !== selectedId) renderFeatured(c, true);
    });
    tile.addEventListener("mouseleave", () => {
      if (!lockedIn) renderFeatured(getSelected(), false);
    });

    grid.appendChild(tile);
  });

  const unlocked = ROSTER.filter((c) => !c.locked).length;
  $("#rosterCount").textContent = `${unlocked} / ${ROSTER.length} unlocked`;
}

function getSelected() {
  return ROSTER.find((c) => c.id === selectedId);
}

function selectCharacter(id) {
  selectedId = id;
  grid.querySelectorAll(".tile").forEach((t) => {
    const isSel = t.dataset.id === id;
    t.classList.toggle("is-selected", isSel);
    t.setAttribute("aria-selected", String(isSel));
  });
  const c = getSelected();
  renderFeatured(c, false);
  $("#readySummary").textContent = `${c.name} — ${c.role}`;
  toast(`${c.name} selected.`);
}

/* ---------- featured panel ---------- */

function renderFeatured(c, isPreview) {
  const portrait = $("#featuredPortrait");
  portrait.style.background = `linear-gradient(150deg, ${c.gradient[0]}, ${c.gradient[1]})`;
  $("#featuredSigil").textContent = c.sigil;

  const nameEl = $("#featuredName");
  nameEl.textContent = c.name;
  nameEl.classList.remove("is-swapping");
  void nameEl.offsetWidth; /* restart animation */
  nameEl.classList.add("is-swapping");

  $("#featuredRole").textContent = c.role + (isPreview ? " — preview" : "");
  $("#featuredEpithet").textContent = c.epithet;
  $("#featuredLore").textContent = c.lore;

  // difficulty pips
  const pips = $("#diffPips");
  pips.setAttribute("aria-label", `Difficulty ${c.difficulty} of 3`);
  pips.querySelectorAll(".diff-pip").forEach((p, i) => {
    p.classList.toggle("is-on", i < c.difficulty);
  });

  // abilities
  const list = $("#abilityList");
  list.innerHTML = "";
  if (c.abilities.length === 0) {
    const li = document.createElement("li");
    li.className = "ability";
    li.innerHTML = `<span class="ability__key">?</span>
      <span class="ability__body">
        <span class="ability__name">Classified</span>
        <span class="ability__desc">Unlock this Vanguard to view their kit.</span>
      </span>`;
    list.appendChild(li);
  } else {
    c.abilities.forEach((a) => {
      const li = document.createElement("li");
      li.className = "ability" + (a.ult ? " ability--ult" : "");
      li.innerHTML = `<span class="ability__key">${a.key}</span>
        <span class="ability__body">
          <span class="ability__name">${a.name}</span>
          <span class="ability__desc">${a.desc}</span>
        </span>`;
      list.appendChild(li);
    });
  }

  renderStats(c.stats);
}

function renderStats(stats) {
  const wrap = $("#statRows");
  wrap.innerHTML = "";
  Object.entries(stats).forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "stat";
    row.innerHTML = `
      <span class="stat__top">
        <span class="stat__label">${label}</span>
        <span class="stat__value">${value}</span>
      </span>
      <span class="stat__track"><span class="stat__fill"></span></span>`;
    wrap.appendChild(row);
    // animate fill on next frame
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        row.querySelector(".stat__fill").style.width = value + "%";
      })
    );
  });
}

/* ---------- loadout cycling ---------- */

document.querySelectorAll(".slot").forEach((slot) => {
  slot.addEventListener("click", () => {
    if (lockedIn) return toast("Loadout locked.");
    const kind = slot.dataset.slot;
    const opts = LOADOUT_OPTIONS[kind];
    loadoutIndex[kind] = (loadoutIndex[kind] + 1) % opts.length;
    const next = opts[loadoutIndex[kind]];
    slot.querySelector("[data-slot-name]").textContent = next;
    slot.classList.remove("is-cycling");
    void slot.offsetWidth;
    slot.classList.add("is-cycling");
    toast(`${kind.charAt(0).toUpperCase() + kind.slice(1)} equipped: ${next}.`);
  });
});

/* ---------- lock-in with countdown ---------- */

const readyBtn = $("#readyBtn");
const readyText = readyBtn.querySelector(".ready-btn__text");

function lockIn() {
  if (lockedIn) return;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  lockedIn = true;
  readyBtn.classList.remove("is-counting");
  readyBtn.classList.add("is-locked");
  readyBtn.setAttribute("aria-disabled", "true");
  readyText.textContent = "Locked ✓";
  document.querySelectorAll(".slot").forEach((s) => (s.disabled = true));
  const c = getSelected();
  toast(`${c.name} locked in. Deploying to Cinder Bastion…`);
}

readyBtn.addEventListener("click", () => {
  if (lockedIn) return;

  // cancel a running countdown
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    readyBtn.classList.remove("is-counting");
    readyText.textContent = "Lock In";
    toast("Lock-in cancelled.");
    return;
  }

  let count = 3;
  readyBtn.classList.add("is-counting");
  readyText.textContent = `Locking ${count}…`;
  toast("Locking in — click again to cancel.");

  countdownTimer = setInterval(() => {
    count -= 1;
    if (count > 0) {
      readyText.textContent = `Locking ${count}…`;
      return;
    }
    lockIn();
  }, 1000);
});

/* ---------- phase timer ---------- */

let phase = 45;
const phaseEl = $("#phaseTimer");
const phaseTick = setInterval(() => {
  if (lockedIn) return clearInterval(phaseTick);
  phase -= 1;
  if (phase < 0) {
    clearInterval(phaseTick);
    lockIn(); // auto lock-in when timer expires (even mid-countdown)
    return;
  }
  phaseEl.textContent = phase;
  if (phase <= 10) phaseEl.parentElement.classList.add("is-urgent");
}, 1000);

/* ---------- init ---------- */

buildRoster();
selectCharacter(selectedId);
