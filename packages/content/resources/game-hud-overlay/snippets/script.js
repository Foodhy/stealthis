(function () {
  "use strict";

  // ---------- state ----------
  var state = {
    hp: 100,
    hpMax: 100,
    shield: 75,
    shieldMax: 100,
    ammo: 30,
    mag: 30,
    reserve: 120,
    score: 0,
    objective: 2,
    objectiveMax: 3,
    reloading: false,
  };

  var ABILITIES = {
    dash: { cd: 4500, name: "Phase Dash" },
    pulse: { cd: 7000, name: "Ion Pulse" },
    ult: { cd: 16000, name: "Ashfall" },
  };

  var ENEMIES = ["Hollow-9", "Cinder Wraith", "Nullforge Drone", "Rift Stalker", "Ash Reaver", "Vector-X"];
  var ALLIES = ["KESTREL", "VYSE", "NOMAD", "ECHO-4"];
  var WEAPONS = ["Hollow Reign", "Neon Drift", "Ashen Spike", "Voidline", "Pulse Rifle"];

  // ---------- elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage");
  var hpBar = $("hpBar"), shBar = $("shBar");
  var hpVal = $("hpVal"), shVal = $("shVal");
  var ammoCur = $("ammoCur"), ammoRes = $("ammoRes");
  var ammoBlock = $("ammoBlock"), ammoHint = $("ammoHint");
  var reloadBar = $("reloadBar");
  var scoreVal = $("scoreVal"), objCount = $("objCount");
  var radar = $("radar"), killFeed = $("killFeed");
  var crosshair = $("crosshair");
  var toastWrap = $("toastWrap");

  var abilityBtns = Array.prototype.slice.call(document.querySelectorAll(".ability"));

  // ---------- toast ----------
  function toast(msg, accent) {
    var t = document.createElement("div");
    t.className = "toast";
    if (accent) t.style.borderLeftColor = accent;
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 320);
    }, 2200);
  }

  // ---------- vitals render ----------
  function renderVitals() {
    var hpPct = Math.max(0, state.hp) / state.hpMax * 100;
    var shPct = Math.max(0, state.shield) / state.shieldMax * 100;
    hpBar.style.setProperty("--fill", hpPct + "%");
    shBar.style.setProperty("--fill", shPct + "%");
    hpVal.textContent = Math.max(0, Math.round(state.hp));
    shVal.textContent = Math.max(0, Math.round(state.shield));
    hpBar.setAttribute("aria-valuenow", Math.max(0, Math.round(state.hp)));
    shBar.setAttribute("aria-valuenow", Math.max(0, Math.round(state.shield)));
    hpBar.classList.toggle("low", state.hp <= 30 && state.hp > 0);
  }

  // ---------- damage / heal ----------
  function damage(amount) {
    var dmg = amount || (8 + Math.floor(Math.random() * 18));
    if (state.shield > 0) {
      var absorbed = Math.min(state.shield, dmg);
      state.shield -= absorbed;
      dmg -= absorbed;
    }
    if (dmg > 0) state.hp = Math.max(0, state.hp - dmg);
    stage.classList.remove("hit");
    void stage.offsetWidth;
    stage.classList.add("hit");
    renderVitals();
    if (state.hp <= 0) {
      toast("OPERATIVE DOWN — respawning", "#ff4d4d");
      setTimeout(respawn, 900);
    } else if (state.hp <= 30) {
      toast("CRITICAL HEALTH", "#ff4d4d");
    }
  }

  function heal(amount) {
    var h = amount || 26;
    state.hp = Math.min(state.hpMax, state.hp + h);
    if (state.shield < state.shieldMax) {
      state.shield = Math.min(state.shieldMax, state.shield + 14);
    }
    renderVitals();
    toast("REGEN +" + h + " HP", "#36e27a");
  }

  function respawn() {
    state.hp = state.hpMax;
    state.shield = state.shieldMax;
    state.ammo = state.mag;
    state.reserve = 120;
    renderVitals();
    renderAmmo();
    toast("RESPAWNED · SECTOR ND-12", "#00e5ff");
  }

  // ---------- ammo ----------
  function renderAmmo() {
    ammoCur.textContent = state.ammo;
    ammoRes.textContent = state.reserve;
    ammoCur.classList.toggle("empty", state.ammo === 0);
    if (state.reloading) {
      ammoHint.textContent = "RELOADING";
      ammoHint.className = "ammo-hint reload";
    } else if (state.ammo === 0 && state.reserve === 0) {
      ammoHint.textContent = "NO AMMO";
      ammoHint.className = "ammo-hint dry";
    } else if (state.ammo === 0) {
      ammoHint.textContent = "PRESS RELOAD";
      ammoHint.className = "ammo-hint reload";
    } else {
      ammoHint.textContent = "FIRE-READY";
      ammoHint.className = "ammo-hint";
    }
  }

  function fire() {
    if (state.reloading) return;
    if (state.ammo <= 0) {
      reload();
      return;
    }
    state.ammo--;
    renderAmmo();
    crosshair.classList.remove("fire");
    void crosshair.offsetWidth;
    crosshair.classList.add("fire");
    state.score += 5;
    scoreVal.textContent = state.score;
    if (state.ammo === 0) reload();
  }

  function reload() {
    if (state.reloading || state.reserve <= 0) {
      if (state.reserve <= 0 && state.ammo <= 0) toast("OUT OF AMMO — find resupply", "#ff4d4d");
      return;
    }
    if (state.ammo >= state.mag) return;
    state.reloading = true;
    ammoBlock.classList.add("reloading");
    reloadBar.classList.add("on");
    var fill = reloadBar.firstElementChild;
    fill.style.transition = "none";
    fill.style.width = "0%";
    renderAmmo();
    void fill.offsetWidth;
    fill.style.transition = "width 1s linear";
    fill.style.width = "100%";
    toast("RELOAD · " + WEAPONS[0], "#ffc857");
    setTimeout(function () {
      var need = state.mag - state.ammo;
      var take = Math.min(need, state.reserve);
      state.ammo += take;
      state.reserve -= take;
      state.reloading = false;
      ammoBlock.classList.remove("reloading");
      reloadBar.classList.remove("on");
      renderAmmo();
    }, 1000);
  }

  // ---------- abilities ----------
  var cooldowns = {};
  function useAbility(key) {
    var btn = abilityBtns.filter(function (b) { return b.dataset.ability === key; })[0];
    if (!btn || cooldowns[key]) return;
    var spec = ABILITIES[key];
    cooldowns[key] = true;
    btn.classList.remove("ready");
    btn.classList.add("cooling");
    toast(spec.name.toUpperCase() + " ACTIVATED", key === "ult" ? "#7c4dff" : "#00e5ff");

    if (key === "ult") {
      state.score += 60;
      scoreVal.textContent = state.score;
      killFeedPush("VANGUARD-07", ENEMIES[Math.floor(Math.random() * ENEMIES.length)], "ASHFALL");
    } else if (key === "pulse") {
      state.shield = Math.min(state.shieldMax, state.shield + 30);
      renderVitals();
    }

    var cdEl = btn.querySelector(".ab-cd");
    var start = Date.now();
    var iv = setInterval(function () {
      var t = (Date.now() - start) / spec.cd;
      if (t >= 1) {
        clearInterval(iv);
        cdEl.style.setProperty("--cd", "0deg");
        btn.classList.remove("cooling");
        btn.classList.add("ready");
        cooldowns[key] = false;
        toast(spec.name.toUpperCase() + " READY", "#36e27a");
        return;
      }
      cdEl.style.setProperty("--cd", (360 * (1 - t)) + "deg");
    }, 60);
  }

  abilityBtns.forEach(function (btn) {
    btn.classList.add("ready");
    btn.addEventListener("click", function () { useAbility(btn.dataset.ability); });
  });

  // ---------- kill feed ----------
  function killFeedPush(killer, victim, wpn) {
    var li = document.createElement("li");
    li.className = "kf-item";
    li.innerHTML =
      '<span class="kf-killer"></span>' +
      '<span class="kf-wpn"></span>' +
      '<span class="kf-victim"></span>';
    li.children[0].textContent = killer;
    li.children[1].textContent = "⟪ " + wpn + " ⟫";
    li.children[2].textContent = victim;
    killFeed.appendChild(li);
    while (killFeed.children.length > 4) killFeed.removeChild(killFeed.firstChild);
    setTimeout(function () {
      li.classList.add("fade");
      setTimeout(function () { if (li.parentNode) li.remove(); }, 500);
    }, 5000);
  }

  // ---------- minimap blips ----------
  var blips = [];
  function spawnBlips() {
    for (var i = 0; i < 5; i++) {
      var b = document.createElement("span");
      b.className = "blip" + (i < 2 ? " ally" : "");
      radar.appendChild(b);
      blips.push({ el: b, a: Math.random() * Math.PI * 2, r: 14 + Math.random() * 44, spd: (Math.random() - 0.5) * 0.05 });
    }
    moveBlips();
  }
  function moveBlips() {
    blips.forEach(function (b) {
      b.a += b.spd;
      var cx = 50 + Math.cos(b.a) * (b.r / 62 * 50);
      var cy = 50 + Math.sin(b.a) * (b.r / 62 * 50);
      b.el.style.left = cx + "%";
      b.el.style.top = cy + "%";
    });
  }
  setInterval(moveBlips, 600);

  // ---------- simulate combat loop ----------
  var simLive = false;
  var simTimer = null;
  function tick() {
    var roll = Math.random();
    if (roll < 0.35) {
      damage(6 + Math.floor(Math.random() * 14));
    } else if (roll < 0.55 && state.hp < 60) {
      heal(12);
    }
    // burst fire
    var shots = 2 + Math.floor(Math.random() * 4);
    var fireIv = setInterval(function () {
      fire();
      if (--shots <= 0) clearInterval(fireIv);
    }, 110);
    // random ability
    if (Math.random() < 0.4) {
      var keys = Object.keys(ABILITIES).filter(function (k) { return !cooldowns[k]; });
      if (keys.length) useAbility(keys[Math.floor(Math.random() * keys.length)]);
    }
    // kill feed + score
    if (Math.random() < 0.7) {
      var killer = Math.random() < 0.6 ? "VANGUARD-07" : ALLIES[Math.floor(Math.random() * ALLIES.length)];
      killFeedPush(
        killer,
        ENEMIES[Math.floor(Math.random() * ENEMIES.length)],
        WEAPONS[Math.floor(Math.random() * WEAPONS.length)]
      );
      if (killer === "VANGUARD-07") {
        state.score += 35;
        scoreVal.textContent = state.score;
      }
    }
    // objective progress
    if (Math.random() < 0.12 && state.objective < state.objectiveMax) {
      state.objective++;
      objCount.textContent = state.objective;
      toast("RELAY NODE SECURED " + state.objective + "/" + state.objectiveMax, "#00e5ff");
      if (state.objective >= state.objectiveMax) {
        toast("OBJECTIVE COMPLETE — VICTORY", "#36e27a");
      }
    }
  }
  function toggleSim() {
    var btn = $("btnSim");
    simLive = !simLive;
    btn.classList.toggle("live", simLive);
    if (simLive) {
      btn.innerHTML = "<span>■</span> Stop Simulation";
      toast("COMBAT SIMULATION ENGAGED", "#ff3d71");
      tick();
      simTimer = setInterval(tick, 1800);
    } else {
      btn.innerHTML = "<span>▶</span> Simulate Combat";
      clearInterval(simTimer);
      toast("SIMULATION PAUSED", "#9aa0bf");
    }
  }

  // ---------- buttons ----------
  $("btnSim").addEventListener("click", toggleSim);
  $("btnDamage").addEventListener("click", function () { damage(); });
  $("btnHeal").addEventListener("click", function () { heal(); });
  $("btnFire").addEventListener("click", fire);
  $("btnAbility").addEventListener("click", function () {
    var keys = Object.keys(ABILITIES).filter(function (k) { return !cooldowns[k]; });
    useAbility(keys.length ? keys[0] : "dash");
  });

  // keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.repeat) return;
    var k = e.key.toLowerCase();
    if (k === "q") useAbility("dash");
    else if (k === "e") useAbility("pulse");
    else if (k === "x") useAbility("ult");
    else if (k === "r") reload();
    else if (k === " ") { e.preventDefault(); fire(); }
  });

  // ---------- init ----------
  renderVitals();
  renderAmmo();
  spawnBlips();
  killFeedPush("KESTREL", "Hollow-9", "Neon Drift");
  killFeedPush("VANGUARD-07", "Cinder Wraith", "Hollow Reign");
})();
