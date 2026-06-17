(function () {
  "use strict";

  /* ---------- State ---------- */
  var state = {
    streak: 7,
    best: 21,
    checkedIn: false,
    xp: 1840,
    levelFloor: 1500,
    levelCeil: 2000,
    level: 6,
    goalDone: 40,
    goalTarget: 50,
  };

  var ringCircumference = 2 * Math.PI * 34; // r = 34

  var badges = [
    { id: "first-lesson", icon: "🎓", name: "First Lesson", meta: "Unlocked Apr 3", state: "unlocked" },
    { id: "night-owl", icon: "🦉", name: "Night Owl", meta: "Study after 10pm", state: "unlocked" },
    { id: "quiz-ace", icon: "🎯", name: "Quiz Ace", meta: "100% on a quiz", state: "unlocked" },
    { id: "week-warrior", icon: "🔥", name: "Week Warrior", meta: "7-day streak", state: "unlocked" },
    { id: "marathon", icon: "🏅", name: "Marathon", meta: "Claim your badge", state: "claimable" },
    { id: "polyglot", icon: "🌍", name: "Polyglot", meta: "3 courses done", state: "locked" },
    { id: "mentor", icon: "🤝", name: "Mentor", meta: "Help 5 peers", state: "locked" },
    { id: "perfectionist", icon: "💎", name: "Perfect Month", meta: "30-day streak", state: "locked" },
  ];

  /* ---------- Helpers ---------- */
  var $ = function (sel) { return document.querySelector(sel); };

  function toast(msg, kind, icon) {
    var wrap = $("#toastWrap");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.innerHTML = '<span class="t-ico" aria-hidden="true">' + (icon || "✅") + "</span><span>" + msg + "</span>";
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  function fmt(n) { return n.toLocaleString("en-US"); }

  function burstConfetti() {
    var layer = $("#confetti");
    var colors = ["#5b5bd6", "#13b981", "#f59e0b", "#f0708e", "#8b8bf0"];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.4 + Math.random() * 1.4).toFixed(2) + "s";
      p.style.animationDelay = (Math.random() * 0.3).toFixed(2) + "s";
      p.style.width = (6 + Math.random() * 6).toFixed(0) + "px";
      layer.appendChild(p);
      (function (node) {
        setTimeout(function () { node.remove(); }, 3000);
      })(p);
    }
  }

  /* ---------- XP bar ---------- */
  function renderXp() {
    var span = state.levelCeil - state.levelFloor;
    var into = state.xp - state.levelFloor;
    var pct = Math.max(0, Math.min(100, (into / span) * 100));
    var fill = $("#xpFill");
    fill.style.width = pct + "%";
    fill.parentElement.setAttribute("aria-valuenow", String(state.xp));
    $("#xpCurrent").textContent = fmt(state.xp);
    $("#xpToGo").textContent = fmt(Math.max(0, state.levelCeil - state.xp));
    $("#levelPill").textContent = "Level " + state.level;
  }

  function awardXp(amount, reason) {
    state.xp += amount;
    // level up
    while (state.xp >= state.levelCeil) {
      state.level += 1;
      state.levelFloor = state.levelCeil;
      state.levelCeil += 500;
      $("#rankNum").textContent = String(state.level);
      var titles = { 6: "Scholar", 7: "Mentor", 8: "Master", 9: "Sage" };
      $("#rankTitle").textContent = titles[state.level] || "Legend";
      toast("Level up! You're now Level " + state.level, "xp", "⬆️");
      burstConfetti();
    }
    renderXp();
    if (reason) toast("+" + amount + " XP · " + reason, "xp", "✨");
  }

  /* ---------- Daily goal ring ---------- */
  function renderRing() {
    var pct = Math.min(100, Math.round((state.goalDone / state.goalTarget) * 100));
    var arc = $("#ringArc");
    arc.style.strokeDashoffset = String(ringCircumference * (1 - pct / 100));
    $("#ringLabel").textContent = pct + "%";
    $("#goalRing").setAttribute("aria-label", "Daily goal " + pct + " percent complete");
    $("#goalDone").textContent = String(state.goalDone);
  }

  /* ---------- Streak check-in ---------- */
  function checkIn() {
    if (state.checkedIn) return;
    state.checkedIn = true;
    state.streak += 1;

    var countEl = $("#streakCount");
    countEl.textContent = String(state.streak);

    var flame = $("#flame");
    flame.classList.remove("pulse");
    void flame.offsetWidth;
    flame.classList.add("pulse");

    var today = $("#todayDot");
    today.classList.add("done", "pop");
    setTimeout(function () { today.classList.remove("pop"); }, 420);

    var btn = $("#checkInBtn");
    btn.textContent = "Checked in ✓";
    btn.classList.add("is-done");
    btn.disabled = true;

    var sub = $("#streakSub");
    if (state.streak > state.best) {
      state.best = state.streak;
      $("#streakBest").textContent = "Best · " + state.best + " days";
      sub.textContent = "New personal best — " + state.streak + " days in a row!";
      burstConfetti();
    } else {
      sub.textContent = state.best - state.streak + " more day(s) to beat your best of " + state.best + ".";
    }

    // goal + xp rewards
    state.goalDone = Math.min(state.goalTarget, state.goalDone + 10);
    renderRing();
    toast(state.streak + "-day streak secured!", "ok", "🔥");
    awardXp(20, "daily check-in");
  }

  /* ---------- Badges ---------- */
  function renderBadges() {
    var grid = $("#badgeGrid");
    grid.innerHTML = "";
    var unlocked = 0;
    badges.forEach(function (b) {
      if (b.state === "unlocked") unlocked++;
      var el = document.createElement(b.state === "claimable" ? "button" : "div");
      el.className = "badge " + (b.state === "unlocked" ? "unlocked" : b.state === "claimable" ? "locked claimable" : "locked");
      el.dataset.id = b.id;
      if (b.state === "claimable") el.type = "button";
      el.innerHTML =
        '<span class="badge-ico" aria-hidden="true">' + b.icon + "</span>" +
        '<span class="badge-name">' + b.name + "</span>" +
        '<span class="badge-meta">' + b.meta + "</span>";
      if (b.state === "claimable") {
        el.setAttribute("aria-label", "Claim badge: " + b.name);
        el.addEventListener("click", function () { claimBadge(b.id, el); });
      }
      grid.appendChild(el);
    });
    $("#unlockedCount").textContent = String(unlocked);
  }

  function claimBadge(id, el) {
    var b = badges.find(function (x) { return x.id === id; });
    if (!b || b.state === "unlocked") return;
    b.state = "unlocked";
    b.meta = "Just earned!";
    el.className = "badge unlocked just-unlocked";
    el.replaceWith(el.cloneNode(true)); // strip click listener
    renderBadges();
    burstConfetti();
    toast("Badge unlocked: " + b.name, "ok", b.icon);
    awardXp(50, b.name + " badge");
  }

  /* ---------- Study mode ---------- */
  function bindStudyToggle() {
    var btn = $("#studyToggle");
    btn.addEventListener("click", function () {
      var on = document.body.classList.toggle("study");
      btn.setAttribute("aria-pressed", String(on));
      toast(on ? "Study mode on — easy on the eyes" : "Study mode off", "", on ? "🌙" : "☀️");
    });
  }

  /* ---------- Init ---------- */
  function init() {
    renderXp();
    renderRing();
    renderBadges();
    bindStudyToggle();
    $("#checkInBtn").addEventListener("click", checkIn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
