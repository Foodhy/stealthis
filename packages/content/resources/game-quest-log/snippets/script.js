(function () {
  "use strict";

  /* ---------------- data ---------------- */
  var TYPE_META = {
    main: { label: "Main Quest", icon: "❖", color: "#00e5ff" },
    side: { label: "Side Quest", icon: "✦", color: "#7c4dff" },
    bounty: { label: "Bounty", icon: "☠", color: "#ff3d71" },
  };

  var quests = [
    {
      id: "q-ashfall",
      kind: "main",
      tab: "main",
      title: "The Ashfall Reckoning",
      zone: "Cinderhold Keep",
      giver: "Warden Sela Voryn",
      desc:
        "The Ashen Vanguard has fallen to the Hollow Reign. Breach Cinderhold Keep, recover the Emberglass Sigil, and confront the renegade commander before the rift fully opens over Nullspire.",
      tracked: true,
      objectives: [
        { text: "Infiltrate the outer ramparts", done: true },
        { text: "Disable the three rift-anchors", done: true },
        { text: "Recover the Emberglass Sigil", done: false },
        { text: "Defeat Commander Drael", done: false },
      ],
      rewards: [
        { type: "xp", val: "4,500", name: "Experience" },
        { type: "gold", val: "1,200", name: "Gold" },
        { type: "item", val: "Emberglass Blade", name: "Legendary" },
      ],
    },
    {
      id: "q-tidewatch",
      kind: "main",
      tab: "main",
      title: "Echoes of the Tidewatch",
      zone: "Drowned Causeway",
      giver: "Oracle Myrren",
      desc:
        "Strange signals pulse beneath the Drowned Causeway. Restore the ancient Tidewatch beacons and uncover what the deep is trying to warn the Vanguard about.",
      tracked: false,
      objectives: [
        { text: "Speak with Oracle Myrren", done: true },
        { text: "Reignite the western beacon", done: false },
        { text: "Reignite the eastern beacon", done: false },
        { text: "Descend into the Tidewatch vault", done: false },
      ],
      rewards: [
        { type: "xp", val: "3,200", name: "Experience" },
        { type: "gold", val: "800", name: "Gold" },
        { type: "item", val: "Tidewoven Cloak", name: "Epic" },
      ],
    },
    {
      id: "q-neondrift",
      kind: "side",
      tab: "side",
      title: "Neon Drift Circuit",
      zone: "Lower Nullspire",
      giver: "Racer 'Vex' Okonel",
      desc:
        "The Neon Drift street league is recruiting. Win three sanctioned races through the Lower Nullspire grid to earn the trust of the Drift crew.",
      tracked: false,
      objectives: [
        { text: "Win the Coolant Run", done: true },
        { text: "Win the Spire Loop", done: true },
        { text: "Win the Blackout Sprint", done: false },
      ],
      rewards: [
        { type: "xp", val: "1,600", name: "Experience" },
        { type: "gold", val: "650", name: "Gold" },
        { type: "item", val: "Pulse Engine Mk II", name: "Rare" },
      ],
    },
    {
      id: "q-herbalist",
      kind: "side",
      tab: "side",
      title: "The Glasswort Gatherer",
      zone: "Verdant Hollows",
      giver: "Herbalist Tomik",
      desc:
        "Tomik needs rare glasswort blossoms that only bloom under moonlight in the Verdant Hollows. Gather them before the frost takes the last of the season.",
      tracked: false,
      objectives: [
        { text: "Collect 5 glasswort blossoms", done: false },
        { text: "Return to Herbalist Tomik", done: false },
      ],
      rewards: [
        { type: "xp", val: "900", name: "Experience" },
        { type: "gold", val: "300", name: "Gold" },
        { type: "item", val: "Healing Draughts ×3", name: "Common" },
      ],
    },
    {
      id: "q-bounty-grell",
      kind: "bounty",
      tab: "side",
      title: "Bounty: The Grell Marauder",
      zone: "Rustwild Expanse",
      giver: "Bounty Board",
      desc:
        "A Grell marauder has been raiding caravans along the Rustwild trade road. The Vanguard has posted a bounty for its head — dead, preferably.",
      tracked: false,
      objectives: [
        { text: "Track the marauder's lair", done: true },
        { text: "Slay the Grell Marauder", done: false },
        { text: "Claim the bounty", done: false },
      ],
      rewards: [
        { type: "gold", val: "1,500", name: "Gold" },
        { type: "item", val: "Marauder Trophy", name: "Rare" },
      ],
    },
    {
      id: "q-firstlight",
      kind: "main",
      tab: "completed",
      title: "First Light at Nullspire",
      zone: "Nullspire Gates",
      giver: "Warden Sela Voryn",
      desc:
        "Your arrival at Nullspire marked the dawn of the Vanguard's last stand. The gates are secured and the watch is set.",
      tracked: false,
      objectives: [
        { text: "Reach the Nullspire Gates", done: true },
        { text: "Light the signal brazier", done: true },
        { text: "Report to Warden Voryn", done: true },
      ],
      rewards: [
        { type: "xp", val: "1,200", name: "Experience" },
        { type: "gold", val: "400", name: "Gold" },
      ],
    },
  ];

  var REWARD_META = {
    xp: { icon: "✸", color: "#00e5ff" },
    gold: { icon: "◉", color: "#ffc857" },
    item: { icon: "▣", color: "#7c4dff" },
  };

  /* ---------------- state ---------------- */
  var activeTab = "main";
  var selectedId = null;

  /* ---------------- dom ---------------- */
  var qlistEl = document.getElementById("qlist");
  var qlistEmpty = document.getElementById("qlistEmpty");
  var detailEl = document.getElementById("detail");
  var tabsEl = document.querySelectorAll(".tab");

  var trackerEl = document.getElementById("tracker");
  var trackerTitle = document.getElementById("trackerTitle");
  var trackerObjs = document.getElementById("trackerObjs");
  var trackerFill = document.getElementById("trackerFill");
  var trackerPct = document.getElementById("trackerPct");
  var trackerClose = document.getElementById("trackerClose");

  var toastWrap = document.getElementById("toastWrap");

  /* ---------------- helpers ---------------- */
  function byId(id) {
    for (var i = 0; i < quests.length; i++) if (quests[i].id === id) return quests[i];
    return null;
  }

  function progress(q) {
    var done = 0;
    for (var i = 0; i < q.objectives.length; i++) if (q.objectives[i].done) done++;
    return { done: done, total: q.objectives.length, pct: Math.round((done / q.objectives.length) * 100) };
  }

  function trackedQuest() {
    for (var i = 0; i < quests.length; i++) if (quests[i].tracked && quests[i].tab !== "completed") return quests[i];
    return null;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast";
    var icon = kind === "track" ? "◈" : "✓";
    el.innerHTML = '<span class="toast__icon">' + icon + "</span><span>" + esc(msg) + "</span>";
    toastWrap.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2900);
  }

  /* ---------------- render: list ---------------- */
  function renderTabCounts() {
    var counts = { main: 0, side: 0, completed: 0 };
    quests.forEach(function (q) {
      if (counts[q.tab] !== undefined) counts[q.tab]++;
    });
    document.querySelectorAll(".tab__count").forEach(function (c) {
      c.textContent = counts[c.getAttribute("data-count")] || 0;
    });
  }

  function renderList() {
    qlistEl.innerHTML = "";
    var rows = quests.filter(function (q) {
      return q.tab === activeTab;
    });

    qlistEmpty.hidden = rows.length > 0;

    rows.forEach(function (q) {
      var meta = TYPE_META[q.kind];
      var p = progress(q);
      var li = document.createElement("li");

      var btn = document.createElement("button");
      btn.className = "qcard" + (q.id === selectedId ? " is-active" : "") + (q.tab === "completed" ? " is-done" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", q.id === selectedId ? "true" : "false");
      btn.style.setProperty("--qcol", meta.color);
      btn.dataset.id = q.id;

      btn.innerHTML =
        (q.tracked && q.tab !== "completed" ? '<span class="qcard__track-flag" title="Tracked">◈</span>' : "") +
        '<span class="qcard__icon">' + meta.icon + "</span>" +
        '<span class="qcard__body">' +
        '<span class="qcard__type">' + meta.label + "</span>" +
        '<span class="qcard__title">' + esc(q.title) + "</span>" +
        '<span class="qcard__prog">' +
        '<span class="qcard__bar"><i style="width:' + p.pct + '%"></i></span>' +
        '<span class="qcard__count">' + p.done + "/" + p.total + "</span>" +
        "</span>" +
        "</span>";

      btn.addEventListener("click", function () {
        selectQuest(q.id);
      });

      li.appendChild(btn);
      qlistEl.appendChild(li);
    });

    renderTabCounts();
  }

  /* ---------------- render: detail ---------------- */
  function renderDetail() {
    var q = selectedId ? byId(selectedId) : null;

    if (!q) {
      detailEl.innerHTML =
        '<div class="detail__empty"><div><span>❖</span>Select a quest from the log to view its objectives and rewards.</div></div>';
      return;
    }

    var meta = TYPE_META[q.kind];
    var p = progress(q);

    var objsHtml = q.objectives
      .map(function (o, i) {
        return (
          '<li class="obj' +
          (o.done ? " is-done" : "") +
          '" role="checkbox" tabindex="0" aria-checked="' +
          (o.done ? "true" : "false") +
          '" data-idx="' +
          i +
          '">' +
          '<span class="obj__box">✓</span>' +
          '<span class="obj__text">' +
          esc(o.text) +
          "</span></li>"
        );
      })
      .join("");

    var rewardsHtml = q.rewards
      .map(function (r) {
        var rm = REWARD_META[r.type] || REWARD_META.item;
        return (
          '<div class="reward" style="--rcol:' +
          rm.color +
          '"><span class="reward__icon">' +
          rm.icon +
          '</span><span class="reward__txt"><span class="reward__val">' +
          esc(r.val) +
          '</span><span class="reward__name">' +
          esc(r.name) +
          "</span></span></div>"
        );
      })
      .join("");

    var isCompleted = q.tab === "completed";
    var trackBtn = isCompleted
      ? ""
      : '<button class="track-btn' +
        (q.tracked ? " is-on" : "") +
        '" id="trackBtn" aria-pressed="' +
        (q.tracked ? "true" : "false") +
        '">◈ ' +
        (q.tracked ? "Tracking" : "Track Quest") +
        "</button>";

    detailEl.style.setProperty("--qcol", meta.color);
    detailEl.innerHTML =
      '<div class="d-head"><div>' +
      '<div class="d-eyebrow">' + meta.icon + " " + meta.label + (isCompleted ? " · Completed" : "") + "</div>" +
      '<h2 class="d-title">' + esc(q.title) + "</h2>" +
      '<div class="d-meta"><span>Zone: <b>' + esc(q.zone) + "</b></span><span>Given by: <b>" + esc(q.giver) + "</b></span></div>" +
      "</div>" + trackBtn + "</div>" +
      '<p class="d-desc">' + esc(q.desc) + "</p>" +
      '<div class="d-progress"><span class="d-progress__label">Progress</span>' +
      '<div class="d-progress__bar"><i style="width:' + p.pct + '%"></i></div>' +
      '<span class="d-progress__pct">' + p.pct + "%</span></div>" +
      '<h3 class="section-h">Objectives</h3><ul class="objs">' + objsHtml + "</ul>" +
      '<h3 class="section-h">Rewards</h3><div class="rewards">' + rewardsHtml + "</div>";

    // wire objectives
    if (!isCompleted) {
      detailEl.querySelectorAll(".obj").forEach(function (el) {
        function toggle() {
          toggleObjective(q.id, parseInt(el.dataset.idx, 10));
        }
        el.addEventListener("click", toggle);
        el.addEventListener("keydown", function (e) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        });
      });

      var tb = document.getElementById("trackBtn");
      if (tb) tb.addEventListener("click", function () { toggleTrack(q.id); });
    }
  }

  /* ---------------- render: tracker ---------------- */
  function renderTracker() {
    var q = trackedQuest();
    if (!q) {
      trackerEl.hidden = true;
      return;
    }
    trackerEl.hidden = false;
    var meta = TYPE_META[q.kind];
    trackerEl.style.borderLeftColor = meta.color;
    trackerTitle.textContent = q.title;

    trackerObjs.innerHTML = q.objectives
      .map(function (o) {
        return '<li class="tracker__obj' + (o.done ? " is-done" : "") + '"><span>' + esc(o.text) + "</span></li>";
      })
      .join("");

    var p = progress(q);
    trackerFill.style.width = p.pct + "%";
    trackerPct.textContent = p.pct + "%";
  }

  /* ---------------- actions ---------------- */
  function selectQuest(id) {
    selectedId = id;
    renderList();
    renderDetail();
  }

  function toggleTrack(id) {
    var q = byId(id);
    if (!q) return;
    if (q.tracked) {
      q.tracked = false;
      toast("Quest untracked", "track");
    } else {
      quests.forEach(function (x) { x.tracked = false; });
      q.tracked = true;
      toast("Now tracking: " + q.title, "track");
    }
    renderList();
    renderDetail();
    renderTracker();
  }

  function toggleObjective(id, idx) {
    var q = byId(id);
    if (!q || q.tab === "completed") return;
    q.objectives[idx].done = !q.objectives[idx].done;

    var p = progress(q);
    if (p.done === p.total) {
      // complete the quest
      q.tab = "completed";
      var wasTracked = q.tracked;
      q.tracked = false;
      toast("Quest Complete: " + q.title);
      if (wasTracked) {
        // re-render keeps tracker hidden since completed quests aren't tracked
      }
    }

    renderList();
    renderDetail();
    renderTracker();
  }

  /* ---------------- tabs ---------------- */
  tabsEl.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeTab = tab.dataset.tab;
      tabsEl.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      // keep selection visible only if it belongs to this tab
      var sel = selectedId ? byId(selectedId) : null;
      if (!sel || sel.tab !== activeTab) selectedId = null;
      renderList();
      renderDetail();
    });
  });

  trackerClose.addEventListener("click", function () {
    var q = trackedQuest();
    if (q) toggleTrack(q.id);
  });

  /* ---------------- init ---------------- */
  var firstTracked = trackedQuest();
  selectedId = firstTracked ? firstTracked.id : (quests[0] ? quests[0].id : null);
  renderList();
  renderDetail();
  renderTracker();
})();
