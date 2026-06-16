(function () {
  "use strict";

  /* ---------- SVG icon set (per rarity) ---------- */
  var ICONS = {
    trophy: '<svg viewBox="0 0 24 24"><path d="M6 3h12v2h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-3.1A6 6 0 0 1 7 12a4 4 0 0 1-4-4V5h3V3zm0 4H5v1a2 2 0 0 0 1 1.7V7zm12 0v2.7A2 2 0 0 0 19 8V7h-1z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3L22 9.3l-5 4.7L18.2 21 12 17.5 5.8 21 7 14 2 9.3l7.1-1z"/></svg>',
    medal: '<svg viewBox="0 0 24 24"><path d="M8 2h8l-2.2 6.4a5 5 0 1 1-3.6 0L8 2zm4 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>',
    skull: '<svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-5 14.3V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3.7A8 8 0 0 0 12 2zM9 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-4 6h2v2h-2z"/></svg>',
    crown: '<svg viewBox="0 0 24 24"><path d="M3 7l4 4 5-7 5 7 4-4 -2 12H5L3 7zm2 14h14v2H5z"/></svg>'
  };

  /* ---------- rarity definitions ---------- */
  var RARITY = {
    common:    { label: "Common",    points: 15,  icon: "medal",  cssVar: "--t-common",    kicker: "ACHIEVEMENT UNLOCKED" },
    rare:      { label: "Rare",      points: 40,  icon: "star",   cssVar: "--t-rare",      kicker: "ACHIEVEMENT UNLOCKED" },
    epic:      { label: "Epic",      points: 90,  icon: "trophy", cssVar: "--t-epic",      kicker: "EPIC UNLOCK" },
    legendary: { label: "Legendary", points: 150, icon: "skull",  cssVar: "--t-legendary", kicker: "LEGENDARY UNLOCK" },
    platinum:  { label: "Platinum",  points: 300, icon: "crown",  cssVar: "--t-platinum",  kicker: "PLATINUM TROPHY" }
  };
  var ORDER = ["common", "rare", "epic", "legendary", "platinum"];

  /* ---------- catalog of achievements ---------- */
  var CATALOG = [
    { id: "first-blood",    rarity: "common",    name: "First Light",        desc: "Survive the prologue at Dawnhold.",               progress: 100 },
    { id: "drift-king",     rarity: "rare",      name: "Neon Drift",         desc: "Win a race without braking through Sector 7.",    progress: 64 },
    { id: "no-shield",      rarity: "rare",      name: "Bare Steel",         desc: "Defeat 25 raiders with no shield equipped.",      progress: 40 },
    { id: "hollow-reign",   rarity: "epic",      name: "Hollow Reign",       desc: "Clear the Sunless Citadel on Veteran.",           progress: 30 },
    { id: "ghost-run",      rarity: "epic",      name: "Ghost Protocol",     desc: "Finish a heist fully undetected.",                progress: 12 },
    { id: "vanguard",       rarity: "legendary", name: "Ashen Vanguard",     desc: "Reach Prestige X in Conquest.",                   progress: 8 },
    { id: "platinum",       rarity: "platinum",  name: "The Completionist", desc: "Unlock every achievement in Ashen Vanguard.",      progress: 0 }
  ];

  /* ---------- elements ---------- */
  var listEl = document.getElementById("achList");
  var stackEl = document.getElementById("toastStack");
  var scoreEl = document.getElementById("totalScore");
  var unlockedCountEl = document.getElementById("unlockedCount");
  var totalCountEl = document.getElementById("totalCount");
  var muteToggle = document.getElementById("muteToggle");
  var rollBtn = document.getElementById("rollBtn");

  var unlocked = {};      // id -> true
  var queue = [];
  var playing = false;
  var displayedScore = 0;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- render list ---------- */
  function tierVar(rarity) { return RARITY[rarity].cssVar; }

  function renderList() {
    listEl.innerHTML = "";
    CATALOG.forEach(function (a) {
      var r = RARITY[a.rarity];
      var li = document.createElement("li");
      li.className = "ach-row" + (unlocked[a.id] ? " is-unlocked" : "");
      li.style.setProperty("--tier", "var(" + r.cssVar + ")");
      li.dataset.id = a.id;

      li.innerHTML =
        '<span class="ach-badge">' + ICONS[r.icon] + '</span>' +
        '<div class="ach-main">' +
          '<p class="ach-name">' + a.name +
            '<span class="ach-tier-chip">' + r.label + '</span>' +
          '</p>' +
          '<p class="ach-desc">' + a.desc + '</p>' +
          '<div class="ach-progress"><span class="ach-progress__fill"></span></div>' +
        '</div>' +
        '<div class="ach-meta">' +
          '<span class="ach-points">' + r.points + 'G</span>' +
          '<span class="ach-state">' + (unlocked[a.id] ? "Unlocked" : "Locked") + '</span>' +
        '</div>';

      listEl.appendChild(li);

      // animate progress fill for locked rows
      if (!unlocked[a.id]) {
        var fill = li.querySelector(".ach-progress__fill");
        requestAnimationFrame(function () { fill.style.width = a.progress + "%"; });
      }
    });
    totalCountEl.textContent = CATALOG.length;
    refreshCounts();
  }

  function refreshCounts() {
    var n = Object.keys(unlocked).length;
    unlockedCountEl.textContent = n;
  }

  /* ---------- count-up for score ---------- */
  function animateScore(target) {
    if (prefersReduced) { displayedScore = target; scoreEl.textContent = target.toLocaleString(); return; }
    var start = displayedScore;
    var diff = target - start;
    var dur = 700;
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(start + diff * eased);
      scoreEl.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else displayedScore = target;
    }
    requestAnimationFrame(step);
  }

  /* ---------- WebAudio unlock chime ---------- */
  var audioCtx = null;
  function chime(rarity) {
    if (muteToggle.checked) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      // higher-tier = brighter, longer arpeggio
      var tier = ORDER.indexOf(rarity);
      var base = 392 + tier * 60;
      var notes = [base, base * 1.25, base * 1.5];
      if (tier >= 3) notes.push(base * 2);
      var now = audioCtx.currentTime;
      notes.forEach(function (f, i) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = tier >= 3 ? "sawtooth" : "triangle";
        osc.frequency.value = f;
        var t = now + i * 0.07;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        osc.connect(g).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.34);
      });
    } catch (e) { /* audio unavailable — ignore */ }
  }

  /* ---------- toast queue ---------- */
  function enqueue(achievement) {
    queue.push(achievement);
    if (!playing) playNext();
  }

  function playNext() {
    if (!queue.length) { playing = false; return; }
    playing = true;
    var a = queue.shift();
    var r = RARITY[a.rarity];

    var toast = document.createElement("div");
    toast.className = "toast" + (muteToggle.checked ? " is-muted" : "");
    toast.style.setProperty("--tier", "var(" + r.cssVar + ")");
    toast.setAttribute("role", "alert");
    toast.innerHTML =
      '<span class="toast__icon">' + ICONS[r.icon] + '</span>' +
      '<div class="toast__body">' +
        '<p class="toast__kicker">' + r.kicker + '</p>' +
        '<p class="toast__name">' + a.name + '</p>' +
        '<p class="toast__sub">' + r.label + ' · Ashen Vanguard</p>' +
      '</div>' +
      '<span class="toast__pts">+' + r.points + 'G</span>' +
      '<span class="toast__timer"></span>';

    stackEl.appendChild(toast);
    chime(a.rarity);

    requestAnimationFrame(function () { toast.classList.add("is-in"); });

    var hold = prefersReduced ? 1600 : 3600;
    setTimeout(function () {
      toast.classList.remove("is-in");
      toast.classList.add("is-out");
      setTimeout(function () {
        toast.remove();
        playNext();
      }, prefersReduced ? 60 : 420);
    }, hold);
  }

  /* ---------- unlock logic ---------- */
  function flashRow(id) {
    var row = listEl.querySelector('.ach-row[data-id="' + id + '"]');
    if (!row) return;
    row.classList.add("is-unlocked", "just-unlocked");
    row.querySelector(".ach-state").textContent = "Unlocked";
    setTimeout(function () { row.classList.remove("just-unlocked"); }, 1200);
  }

  function unlockById(id) {
    if (unlocked[id]) return false;
    var a = CATALOG.find(function (x) { return x.id === id; });
    if (!a) return false;
    unlocked[id] = true;
    flashRow(id);
    refreshCounts();
    animateScore(displayedScore + RARITY[a.rarity].points);
    enqueue(a);
    return true;
  }

  // pick a not-yet-unlocked achievement of a given rarity; fall back to any of that rarity
  function unlockByRarity(rarity) {
    var pool = CATALOG.filter(function (a) { return a.rarity === rarity && !unlocked[a.id]; });
    if (pool.length) { unlockById(pool[0].id); return; }
    // none left of that rarity — synthesize a repeat unlock toast (no list change, no score double-count)
    var template = CATALOG.filter(function (a) { return a.rarity === rarity; })[0];
    if (template) {
      enqueue({ id: "_repeat", rarity: rarity, name: template.name });
    }
  }

  /* ---------- wire buttons ---------- */
  document.querySelectorAll(".rarity-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      unlockByRarity(btn.dataset.rarity);
    });
  });

  rollBtn.addEventListener("click", function () {
    // weighted toward common, but can roll anything still locked
    var locked = CATALOG.filter(function (a) { return !unlocked[a.id]; });
    if (!locked.length) {
      var any = CATALOG[Math.floor(Math.random() * CATALOG.length)];
      enqueue({ id: "_repeat", rarity: any.rarity, name: any.name });
      return;
    }
    var pick = locked[Math.floor(Math.random() * locked.length)];
    unlockById(pick.id);
  });

  /* ---------- init ---------- */
  renderList();
})();
