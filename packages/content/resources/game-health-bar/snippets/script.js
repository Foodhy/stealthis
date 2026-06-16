/* Game stat-bar variants — combat simulation (Nullforge HUD kit demo) */
(function () {
  "use strict";

  var $ = function (id) {
    return document.getElementById(id);
  };

  /* ---------- toast helper ---------- */
  var toastEl = $("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1800);
  }

  var clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };

  /* ---------- state ---------- */
  var state = {
    hp: 100, // shared by segmented + chip bars
    shield: 50,
    stackHp: 100,
    mana: 100,
    xp: 35,
    level: 12,
    boss: 1000,
  };
  var HP_MAX = 100;
  var SHIELD_MAX = 50;
  var MANA_MAX = 100;
  var XP_MAX = 100;
  var BOSS_MAX = 1000;
  var LOW_HP_THRESHOLD = 0.3;

  /* ---------- segmented bar ---------- */
  var segBar = $("seg-bar");
  var SEG_COUNT = 10;
  for (var i = 0; i < SEG_COUNT; i++) {
    var cell = document.createElement("div");
    cell.className = "seg-cell";
    segBar.appendChild(cell);
  }
  var segCells = segBar.children;

  function renderSegments() {
    var perCell = HP_MAX / SEG_COUNT;
    for (var i = 0; i < SEG_COUNT; i++) {
      var cellHp = state.hp - i * perCell;
      segCells[i].classList.toggle("is-empty", cellHp <= 0);
      segCells[i].classList.toggle(
        "is-partial",
        cellHp > 0 && cellHp < perCell
      );
    }
    segBar.setAttribute("aria-valuenow", String(state.hp));
    $("seg-readout").textContent = String(state.hp);
  }

  /* ---------- gradient hp + damage chip ---------- */
  var chipHp = $("chip-hp");
  var chipTrail = $("chip-trail");

  function hpColorClass(fillEl, ratio) {
    fillEl.classList.toggle("is-low", ratio <= LOW_HP_THRESHOLD);
    fillEl.classList.toggle("is-mid", ratio > LOW_HP_THRESHOLD && ratio <= 0.6);
  }

  function renderChipBar() {
    var ratio = state.hp / HP_MAX;
    chipHp.style.transform = "scaleX(" + ratio + ")";
    // trail follows after a delay (CSS transition-delay handles the chip effect)
    chipTrail.style.transform = "scaleX(" + ratio + ")";
    hpColorClass(chipHp, ratio);
    $("chip-meter").setAttribute("aria-valuenow", String(state.hp));
    $("chip-readout").textContent = String(state.hp);
  }

  /* ---------- shield over health ---------- */
  function renderStack() {
    var hpRatio = state.stackHp / HP_MAX;
    var shRatio = state.shield / SHIELD_MAX;
    $("stack-hp").style.transform = "scaleX(" + hpRatio + ")";
    $("stack-shield").style.transform = "scaleX(" + shRatio * 0.5 + ")"; // shield occupies up to half the track
    hpColorClass($("stack-hp"), hpRatio);
    $("stack-hp").setAttribute("aria-valuenow", String(state.stackHp));
    $("stack-shield").setAttribute("aria-valuenow", String(state.shield));
    $("stack-hp-readout").textContent = String(state.stackHp);
    $("stack-shield-readout").textContent = String(state.shield);
  }

  /* ---------- mana ---------- */
  function renderMana() {
    $("mana-fill").style.transform = "scaleX(" + state.mana / MANA_MAX + ")";
    $("mana-meter").setAttribute("aria-valuenow", String(state.mana));
    $("mana-readout").textContent = String(state.mana);
  }

  // passive mana regen, 4 MP per second
  setInterval(function () {
    if (state.mana < MANA_MAX) {
      state.mana = clamp(state.mana + 4, 0, MANA_MAX);
      renderMana();
    }
  }, 1000);

  /* ---------- xp + level up ---------- */
  function renderXp() {
    $("xp-fill").style.transform = "scaleX(" + state.xp / XP_MAX + ")";
    $("xp-meter").setAttribute("aria-valuenow", String(state.xp));
    $("xp-readout").textContent = String(state.xp);
    $("xp-level-num").textContent = String(state.level);
    $("xp-level-badge").textContent = "Level " + state.level;
  }

  function gainXp(amount) {
    var total = state.xp + amount;
    if (total >= XP_MAX) {
      // fill to full, flash, then carry the overflow
      state.xp = XP_MAX;
      renderXp();
      setTimeout(function () {
        state.level += 1;
        state.xp = total - XP_MAX;
        var flash = $("levelup-flash");
        var orb = $("xp-level-num");
        flash.classList.remove("is-flashing");
        orb.classList.remove("is-popping");
        void flash.offsetWidth; // restart animations
        flash.classList.add("is-flashing");
        orb.classList.add("is-popping");
        toast("Level up! Now level " + state.level);
        // snap the fill back, then animate the overflow in
        $("xp-fill").style.transition = "none";
        $("xp-fill").style.transform = "scaleX(0)";
        void $("xp-fill").offsetWidth;
        $("xp-fill").style.transition = "";
        renderXp();
      }, 520);
    } else {
      state.xp = total;
      renderXp();
      toast("+" + amount + " XP");
    }
  }

  /* ---------- boss ---------- */
  var bossFill = $("boss-fill");
  var bossTrail = $("boss-trail");

  function renderBoss() {
    var ratio = state.boss / BOSS_MAX;
    bossFill.style.transform = "scaleX(" + ratio + ")";
    bossTrail.style.transform = "scaleX(" + ratio + ")";
    $("boss-meter").setAttribute("aria-valuenow", String(state.boss));
    $("boss-readout").textContent = String(state.boss);
  }

  function shake(trackEl) {
    trackEl.classList.remove("is-shaking");
    void trackEl.offsetWidth;
    trackEl.classList.add("is-shaking");
  }

  /* ---------- low-health vignette ---------- */
  function renderVignette() {
    var low =
      state.hp / HP_MAX <= LOW_HP_THRESHOLD ||
      (state.shield === 0 && state.stackHp / HP_MAX <= LOW_HP_THRESHOLD);
    $("vignette").classList.toggle("is-active", low);
  }

  /* ---------- combat actions ---------- */
  function takeDamage(amount) {
    if (state.hp <= 0 && state.stackHp <= 0) {
      toast("You are down — heal or reset");
      return;
    }
    state.hp = clamp(state.hp - amount, 0, HP_MAX);

    // shield absorbs first on the stacked bar
    var remaining = amount;
    if (state.shield > 0) {
      var absorbed = Math.min(state.shield, remaining);
      state.shield -= absorbed;
      remaining -= absorbed;
      if (absorbed > 0 && remaining > 0) {
        toast("Shield broken! " + remaining + " DMG bled through");
      } else {
        toast("Shield absorbed " + absorbed + " DMG");
      }
    } else {
      toast("-" + amount + " HP");
    }
    state.stackHp = clamp(state.stackHp - remaining, 0, HP_MAX);

    renderAll();
    shake($("chip-meter"));
    if (state.hp === 0) toast("Vex Kestrel is down!");
  }

  function heal(amount) {
    if (state.hp === HP_MAX && state.stackHp === HP_MAX && state.shield === SHIELD_MAX) {
      toast("Already at full health");
      return;
    }
    state.hp = clamp(state.hp + amount, 0, HP_MAX);
    state.stackHp = clamp(state.stackHp + amount, 0, HP_MAX);
    if (state.stackHp === HP_MAX) {
      state.shield = clamp(state.shield + Math.ceil(amount / 2), 0, SHIELD_MAX);
    }
    toast("+" + amount + " HP restored");
    renderAll();
  }

  function castSpell(cost) {
    if (state.mana < cost) {
      toast("Not enough mana!");
      shake($("mana-meter"));
      return;
    }
    state.mana -= cost;
    renderMana();
    toast("Void Lance cast — " + cost + " MP");
    gainXp(8); // casting grants a little XP
  }

  function strikeBoss(amount) {
    if (state.boss <= 0) {
      toast("The Pale Choir has fallen");
      return;
    }
    state.boss = clamp(state.boss - amount, 0, BOSS_MAX);
    renderBoss();
    shake($("boss-meter"));
    if (state.boss === 0) {
      toast("BOSS DEFEATED — Maw of the Pale Choir");
      gainXp(60);
    } else {
      toast("-" + amount + " boss HP");
    }
  }

  function resetAll() {
    state.hp = HP_MAX;
    state.shield = SHIELD_MAX;
    state.stackHp = HP_MAX;
    state.mana = MANA_MAX;
    state.xp = 35;
    state.level = 12;
    renderAll();
    toast("Encounter reset");
  }

  function renderAll() {
    renderSegments();
    renderChipBar();
    renderStack();
    renderMana();
    renderXp();
    renderVignette();
  }

  /* ---------- wire up ---------- */
  $("btn-dmg-sm").addEventListener("click", function () { takeDamage(12); });
  $("btn-dmg-lg").addEventListener("click", function () { takeDamage(34); });
  $("btn-heal").addEventListener("click", function () { heal(20); });
  $("btn-cast").addEventListener("click", function () { castSpell(25); });
  $("btn-xp").addEventListener("click", function () { gainXp(40); });
  $("btn-reset").addEventListener("click", resetAll);
  $("btn-boss-hit").addEventListener("click", function () { strikeBoss(87); });
  $("btn-boss-reset").addEventListener("click", function () {
    state.boss = BOSS_MAX;
    renderBoss();
    toast("Boss restored to full health");
  });

  renderAll();
  renderBoss();
})();
