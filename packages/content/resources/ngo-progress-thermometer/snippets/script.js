(function () {
  "use strict";

  var GOAL = 60000;
  var START_RAISED = 21450;
  var START_DONORS = 312;

  var state = {
    raised: START_RAISED,
    donors: START_DONORS,
  };

  // Donor name pools (fictional)
  var FIRST = ["Maya", "Theo", "Priya", "Daniel", "Amara", "Noah", "Lena", "Ravi",
    "Sofia", "Marcus", "Yuki", "Elena", "Omar", "Grace", "Jonas", "Aisha"];
  var LAST = ["R.", "K.", "M.", "S.", "T.", "B.", "L.", "N.", "C.", "P."];
  var AVATAR_COLORS = ["#1f7a6d", "#e8743b", "#2f9e6f", "#155e54", "#cc5d28", "#5a7d9a"];

  var els = {
    thermoFill: document.getElementById("thermoFill"),
    thermoPct: document.getElementById("thermoPct"),
    thermoCard: document.querySelector(".thermo-card"),
    raisedVal: document.getElementById("raisedVal"),
    goalVal: document.getElementById("goalVal"),
    donorVal: document.getElementById("donorVal"),
    barFill: document.getElementById("barFill"),
    barPct: document.getElementById("barPct"),
    barRaised: document.getElementById("barRaised"),
    donorList: document.getElementById("donorList"),
    donorCount: document.getElementById("donorCount"),
    toastHost: document.getElementById("toastHost"),
  };

  var milestones = [
    { pct: 25, hit: false, label: "We're a quarter of the way — 3 villages funded!" },
    { pct: 50, hit: false, label: "Halfway there! Pumps ordered for 6 villages." },
    { pct: 75, hit: false, label: "75% reached — filter kits on the way!" },
    { pct: 100, hit: false, label: "Goal reached! Clean water for all 12 villages." },
  ];

  function fmtMoney(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function pct() {
    return Math.min(100, (state.raised / GOAL) * 100);
  }

  function toast(msg, opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "toast";
    var dot = document.createElement("span");
    dot.className = "toast-dot";
    if (opts.color) dot.style.background = opts.color;
    var text = document.createElement("span");
    text.textContent = msg;
    el.appendChild(dot);
    el.appendChild(text);
    els.toastHost.appendChild(el);
    var life = opts.duration || 3200;
    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, life);
  }

  function render(animateMilestones) {
    var p = pct();
    var pRound = Math.round(p);

    els.thermoFill.style.height = p + "%";
    els.thermoPct.textContent = pRound + "%";
    els.barFill.style.width = Math.max(p, 4) + "%";
    els.barPct.textContent = pRound + "%";

    els.raisedVal.textContent = fmtMoney(state.raised);
    els.barRaised.textContent = fmtMoney(state.raised);
    els.goalVal.textContent = fmtMoney(GOAL);
    els.donorVal.textContent = state.donors.toLocaleString("en-US");
    els.donorCount.textContent = state.donors.toLocaleString("en-US") + " gifts";

    if (animateMilestones) {
      milestones.forEach(function (m) {
        if (!m.hit && p >= m.pct) {
          m.hit = true;
          var isGoal = m.pct === 100;
          toast(m.label, {
            color: isGoal ? "#2f9e6f" : "#e8743b",
            duration: isGoal ? 5000 : 3600,
          });
          if (isGoal) {
            els.thermoCard.classList.add("goal-hit");
            setTimeout(function () {
              els.thermoCard.classList.remove("goal-hit");
            }, 800);
          }
        }
      });
    }
  }

  function addDonor(amount) {
    var name = FIRST[Math.floor(Math.random() * FIRST.length)] + " " +
      LAST[Math.floor(Math.random() * LAST.length)];
    var color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    var initials = name.charAt(0) + name.split(" ")[1].charAt(0);

    var empty = els.donorList.querySelector(".empty");
    if (empty) empty.remove();

    var li = document.createElement("li");
    li.className = "donor is-new";

    var av = document.createElement("span");
    av.className = "donor-av";
    av.style.background = color;
    av.textContent = initials;
    av.setAttribute("aria-hidden", "true");

    var info = document.createElement("div");
    info.className = "donor-info";
    var nm = document.createElement("div");
    nm.className = "donor-name";
    nm.textContent = name;
    var when = document.createElement("div");
    when.className = "donor-when";
    when.textContent = "just now · Clean Water Fund";
    info.appendChild(nm);
    info.appendChild(when);

    var amt = document.createElement("span");
    amt.className = "donor-amt";
    amt.textContent = fmtMoney(amount);

    li.appendChild(av);
    li.appendChild(info);
    li.appendChild(amt);

    els.donorList.insertBefore(li, els.donorList.firstChild);

    // Cap visible list at 6
    var items = els.donorList.querySelectorAll(".donor");
    if (items.length > 6) {
      els.donorList.removeChild(items[items.length - 1]);
    }
  }

  function give(amount) {
    if (!amount || amount < 1) return;
    if (pct() >= 100) {
      toast("The goal is already met — thank you! Reset the demo to give again.", {
        color: "#2f9e6f",
      });
      return;
    }
    state.raised += amount;
    state.donors += 1;
    addDonor(amount);
    render(true);
    toast("Thanks for your " + fmtMoney(amount) + " gift!", { color: "#e8743b" });
  }

  // Donation preset buttons
  var presetBtns = document.querySelectorAll(".give-btn");
  presetBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      give(parseInt(btn.getAttribute("data-amt"), 10));
    });
  });

  // Custom amount form
  var form = document.getElementById("customForm");
  var input = document.getElementById("customAmt");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = parseInt(input.value, 10);
    if (!val || val < 1) {
      toast("Please enter an amount of $1 or more.", { color: "#d4503e" });
      input.focus();
      return;
    }
    give(val);
    input.value = "";
  });

  // Reset demo
  document.getElementById("resetBtn").addEventListener("click", function () {
    state.raised = START_RAISED;
    state.donors = START_DONORS;
    milestones.forEach(function (m) { m.hit = false; });
    els.donorList.innerHTML = '<li class="donor empty">Be the first to give today.</li>';
    // Pre-mark milestones already passed at the starting point so they don't re-fire
    var p = pct();
    milestones.forEach(function (m) { if (p >= m.pct) m.hit = true; });
    render(false);
    toast("Demo reset to the campaign's current total.", { color: "#7a7368" });
  });

  // Initial paint — mark already-passed milestones, then animate from 0 to start.
  els.goalVal.textContent = fmtMoney(GOAL);
  var startPct = pct();
  milestones.forEach(function (m) { if (startPct >= m.pct) m.hit = true; });
  // Start visually at 0 so the fill animates up on load.
  els.thermoFill.style.height = "0%";
  els.barFill.style.width = "4%";
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      render(false);
    });
  });
})();
