(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  var state = {
    points: 320,
    stamps: 5,
    stampGoal: 8,
    invitesSent: 7,
    invitesJoined: 3,
    refCode: "ARIA-LUM50",
  };

  var TIERS = [
    { name: "Petal", at: 0 },
    { name: "Gilded", at: 250 },
    { name: "Aurum", at: 500 },
    { name: "Lumière", at: 900 },
  ];

  var REWARDS = [
    { id: "blowdry", icon: "💨", name: "Free blow-dry & style", desc: "Glossy finish with our signature serum", cost: 500 },
    { id: "treatment", icon: "🧴", name: "Bond-repair treatment", desc: "Deep-conditioning ritual add-on", cost: 350 },
    { id: "manicure", icon: "💅", name: "Express gel manicure", desc: "Shape, buff and a season shade", cost: 280 },
    { id: "facial", icon: "🌿", name: "15-min glow facial", desc: "Cleanse, mask and lift", cost: 220 },
  ];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  var $ = function (sel) { return document.querySelector(sel); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  function currentTierIndex(pts) {
    var idx = 0;
    for (var i = 0; i < TIERS.length; i++) {
      if (pts >= TIERS[i].at) idx = i;
    }
    return idx;
  }

  function nextTier(pts) {
    for (var i = 0; i < TIERS.length; i++) {
      if (pts < TIERS[i].at) return TIERS[i];
    }
    return null; // maxed out
  }

  function cheapestUnlockableReward(pts) {
    var affordable = REWARDS.filter(function (r) { return r.cost > pts; })
      .sort(function (a, b) { return a.cost - b.cost; });
    return affordable.length ? affordable[0] : REWARDS.slice().sort(function (a, b) { return a.cost - b.cost; })[0];
  }

  // ---------------------------------------------------------------------------
  // Renderers
  // ---------------------------------------------------------------------------
  function renderProgress() {
    var pts = state.points;
    $("#ptsValue").textContent = pts;

    var cur = TIERS[currentTierIndex(pts)];
    $("#tierName").textContent = cur.name;

    var next = nextTier(pts);
    var floor = cur.at;
    var ceil = next ? next.at : cur.at;
    var span = ceil - floor || 1;
    var pct = next ? Math.min(100, Math.round(((pts - floor) / span) * 100)) : 100;

    var fill = $("#barFill");
    fill.style.width = pct + "%";

    var bar = $("#bar");
    bar.setAttribute("aria-valuemin", String(floor));
    bar.setAttribute("aria-valuemax", String(ceil));
    bar.setAttribute("aria-valuenow", String(pts));

    var remaining = next ? next.at - pts : 0;
    $("#ptsRemaining").textContent = remaining;

    // Reward goal label — the cheapest reward still out of reach.
    var goal = cheapestUnlockableReward(pts);
    $("#goalName").textContent = goal.name.replace(/^Free /, "");

    var caption = $(".bar__caption");
    if (next) {
      caption.innerHTML = '<span>' + remaining + '</span> pts to ' + next.name + ' · ' +
        '<span>' + Math.max(0, goal.cost - pts) + '</span> to ' + goal.name.toLowerCase();
    } else {
      caption.innerHTML = "You've reached <span>Lumière</span> — our highest tier. Merci!";
    }

    // Tier badge states
    var curIdx = currentTierIndex(pts);
    var nodes = document.querySelectorAll(".tier");
    nodes.forEach(function (node, i) {
      node.classList.remove("is-done", "is-current");
      if (i < curIdx) node.classList.add("is-done");
      else if (i === curIdx) node.classList.add("is-current");
    });
  }

  function renderStamps(animateLast) {
    var row = $("#stampRow");
    row.innerHTML = "";
    for (var i = 1; i <= state.stampGoal; i++) {
      var li = document.createElement("li");
      li.className = "stamp";
      if (i === state.stampGoal) {
        li.classList.add("is-free");
        li.setAttribute("aria-label", "Visit " + i + " — free");
      } else if (i <= state.stamps) {
        li.classList.add("is-punched");
        li.innerHTML = "✦";
        li.setAttribute("aria-label", "Visit " + i + " — stamped");
        if (animateLast && i === state.stamps) li.classList.add("just-punched");
      } else {
        li.textContent = i;
        li.setAttribute("aria-label", "Visit " + i + " — upcoming");
      }
      row.appendChild(li);
    }
    $("#stampCount").textContent = state.stamps;
  }

  function renderRewards() {
    var list = $("#rewardList");
    list.innerHTML = "";
    REWARDS.forEach(function (r) {
      var locked = state.points < r.cost;
      var li = document.createElement("li");
      li.className = "reward" + (locked ? " is-locked" : "");
      li.innerHTML =
        '<span class="reward__icon" aria-hidden="true">' + r.icon + "</span>" +
        '<div class="reward__body">' +
          '<p class="reward__name">' + r.name + "</p>" +
          '<p class="reward__desc">' + r.desc + "</p>" +
        "</div>" +
        '<div class="reward__cost">' + r.cost + "<small>points</small></div>";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reward__redeem";
      btn.textContent = locked ? "Locked" : "Redeem";
      btn.disabled = locked;
      btn.setAttribute("aria-label", (locked ? "Locked — " : "Redeem ") + r.name + " for " + r.cost + " points");
      btn.addEventListener("click", function () { redeem(r); });

      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  function redeem(reward) {
    if (state.points < reward.cost) {
      toast("You need " + (reward.cost - state.points) + " more points for " + reward.name + ".");
      return;
    }
    state.points -= reward.cost;
    renderProgress();
    renderRewards();
    toast(reward.name + " redeemed — see you at the chair!");
  }

  function copyCode() {
    var code = state.refCode;
    var btn = $("#copyBtn");

    function done() {
      btn.classList.add("is-copied");
      var txt = btn.querySelector(".copy__txt");
      if (txt) txt.textContent = "Copied";
      toast("Referral code " + code + " copied to clipboard.");
      setTimeout(function () {
        btn.classList.remove("is-copied");
        if (txt) txt.textContent = "Copy";
      }, 1900);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var ta = document.createElement("textarea");
      ta.value = code;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
      done();
    }
  }

  function sendInvite() {
    state.invitesSent += 1;
    $("#invitesSent").textContent = state.invitesSent;
    // Simulate one in three invites converting to a booking + reward.
    if (state.invitesSent % 3 === 0) {
      state.invitesJoined += 1;
      state.points += 50;
      $("#invitesJoined").textContent = state.invitesJoined;
      renderProgress();
      renderRewards();
      renderStamps(false);
      toast("A friend booked! +50 points added to your balance.");
    } else {
      toast("Invite sent — they'll get 20% off their first visit.");
    }
  }

  // ---------------------------------------------------------------------------
  // Wire up
  // ---------------------------------------------------------------------------
  function init() {
    renderProgress();
    renderStamps(false);
    renderRewards();
    $("#copyBtn").addEventListener("click", copyCode);
    $("#inviteBtn").addEventListener("click", sendInvite);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
