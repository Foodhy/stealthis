(function () {
  "use strict";

  /* ---------- Fictional member directory ---------- */
  var MEMBERS = {
    "1042": {
      name: "Marcus Vue",
      status: "active",
      streak: 14,
      class: "Olympic Lifting",
      time: "6:30 PM",
    },
    "2087": {
      name: "Priya Nakamura",
      status: "active",
      streak: 31,
      class: "HIIT Inferno",
      time: "7:00 PM",
    },
    "3310": {
      name: "Diego Santos",
      status: "expiring",
      streak: 6,
      class: "Mobility & Recovery",
      time: "5:45 PM",
    },
    "4521": {
      name: "Aisha Bello",
      status: "active",
      streak: 58,
      class: null,
      time: null,
    },
    "5099": {
      name: "Tom Friedrich",
      status: "frozen",
      streak: 0,
      class: null,
      time: null,
    },
    "6678": {
      name: "Lena Okafor",
      status: "active",
      streak: 9,
      class: "Spin Sprint",
      time: "6:00 PM",
    },
  };
  var MEMBER_IDS = Object.keys(MEMBERS);

  var STATUS_META = {
    active: {
      label: "Active",
      cls: "is-active",
      note: "Membership in good standing. Have a great session!",
    },
    expiring: {
      label: "Expiring soon",
      cls: "is-expiring",
      note: "Your membership renews in 4 days — visit the front desk to keep your streak alive.",
    },
    frozen: {
      label: "Frozen",
      cls: "is-frozen",
      note: "Your membership is currently frozen. Please see a team member to reactivate.",
    },
  };

  /* ---------- Element refs ---------- */
  var $ = function (id) {
    return document.getElementById(id);
  };
  var idleView = $("idleView");
  var successView = $("successView");
  var scanZone = $("scanZone");
  var keypad = $("keypad");
  var kpDisplay = $("kpDisplay");
  var enterBtn = $("enterBtn");
  var doneBtn = $("doneBtn");
  var toastEl = $("toast");
  var recentList = $("recentList");
  var todayCountEl = $("todayCount");

  var entered = "";
  var todayCount = 0;
  var recent = [];
  var resetTimer = null;
  var countdownTimer = null;
  var toastTimer = null;

  /* ---------- Helpers ---------- */
  function initials(name) {
    return name
      .split(" ")
      .map(function (p) {
        return p[0];
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Clock ---------- */
  function tickClock() {
    var d = new Date();
    $("clock").textContent = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    $("clockDate").textContent = d.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
  tickClock();
  setInterval(tickClock, 1000 * 15);

  /* ---------- Keypad ---------- */
  function renderDisplay() {
    if (!entered) {
      kpDisplay.textContent = "— — — —";
      return;
    }
    kpDisplay.textContent = entered.split("").join(" ");
  }

  keypad.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.act === "clear") {
      entered = "";
    } else if (btn.dataset.act === "del") {
      entered = entered.slice(0, -1);
    } else if (btn.dataset.k && entered.length < 4) {
      entered += btn.dataset.k;
    }
    renderDisplay();
  });

  document.addEventListener("keydown", function (e) {
    if (!successView.hidden) {
      if (e.key === "Enter" || e.key === "Escape") resetToIdle();
      return;
    }
    if (/^[0-9]$/.test(e.key) && entered.length < 4) {
      entered += e.key;
      renderDisplay();
    } else if (e.key === "Backspace") {
      entered = entered.slice(0, -1);
      renderDisplay();
    } else if (e.key === "Enter") {
      submitId();
    }
  });

  enterBtn.addEventListener("click", submitId);

  function submitId() {
    if (entered.length < 4) {
      toast("Enter your 4-digit member ID");
      return;
    }
    var member = MEMBERS[entered];
    if (!member) {
      toast("Member ID not found — try again or scan your QR");
      entered = "";
      renderDisplay();
      return;
    }
    checkIn(entered, member);
  }

  /* ---------- Scan zone (simulated) ---------- */
  scanZone.addEventListener("click", function () {
    var id = MEMBER_IDS[Math.floor(Math.random() * MEMBER_IDS.length)];
    checkIn(id, MEMBERS[id]);
  });

  /* ---------- Check-in flow ---------- */
  function checkIn(id, member) {
    var meta = STATUS_META[member.status];

    $("memberAvatar").textContent = initials(member.name);
    $("memberName").textContent = member.name;
    $("memberIdLine").textContent = "ID " + id;
    $("checkTime").textContent = "at " + nowTime();

    var badge = $("statusBadge");
    badge.textContent = meta.label;
    badge.className = "badge " + meta.cls;
    $("statusNote").textContent = meta.note;

    var streakLine = $("streakLine");
    if (member.streak > 0) {
      streakLine.textContent = "🔥 " + member.streak + " day streak";
      streakLine.style.display = "";
    } else {
      streakLine.style.display = "none";
    }

    var classBlock = $("classBlock");
    if (member.class) {
      classBlock.classList.remove("is-none");
      $("bookedClass").textContent = member.class;
      $("bookedTime").textContent = member.time;
    } else {
      classBlock.classList.add("is-none");
      $("bookedClass").textContent = "No class booked today";
      $("bookedTime").textContent = "Drop-in";
    }

    idleView.hidden = true;
    successView.hidden = false;

    recordCheckIn(member);
    entered = "";
    renderDisplay();
    startCountdown(8);

    if (member.status === "frozen") {
      toast("Heads up: membership frozen");
    } else {
      toast("Welcome back, " + member.name.split(" ")[0] + "!");
    }
  }

  function recordCheckIn(member) {
    todayCount += 1;
    todayCountEl.textContent = todayCount;
    todayCountEl.classList.remove("bump");
    void todayCountEl.offsetWidth; // reflow to restart animation
    todayCountEl.classList.add("bump");

    recent.unshift({ name: member.name, time: nowTime() });
    recent = recent.slice(0, 6);
    renderRecent();
  }

  function renderRecent() {
    recentList.innerHTML = "";
    recent.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "recent-item";
      li.innerHTML =
        '<span class="ri-avatar">' +
        initials(r.name) +
        "</span>" +
        '<span class="ri-name">' +
        r.name +
        "</span>" +
        '<span class="ri-time">' +
        r.time +
        "</span>";
      recentList.appendChild(li);
    });
  }

  /* ---------- Auto-reset ---------- */
  function startCountdown(seconds) {
    clearTimers();
    var remaining = seconds;
    var cdEl = $("countdown");
    cdEl.textContent = remaining;
    countdownTimer = setInterval(function () {
      remaining -= 1;
      cdEl.textContent = Math.max(remaining, 0);
      if (remaining <= 0) resetToIdle();
    }, 1000);
    resetTimer = setTimeout(resetToIdle, seconds * 1000 + 200);
  }

  function clearTimers() {
    clearInterval(countdownTimer);
    clearTimeout(resetTimer);
  }

  function resetToIdle() {
    clearTimers();
    successView.hidden = true;
    idleView.hidden = false;
  }

  doneBtn.addEventListener("click", resetToIdle);

  /* ---------- Seed some recent activity ---------- */
  (function seed() {
    var seedNames = ["Aisha Bello", "Lena Okafor", "Marcus Vue"];
    var t = new Date(Date.now() - 9 * 60000);
    seedNames.forEach(function (n) {
      t = new Date(t.getTime() + 3 * 60000);
      recent.push({
        name: n,
        time: t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      });
    });
    recent.reverse();
    todayCount = 47;
    todayCountEl.textContent = todayCount;
    renderRecent();
  })();

  renderDisplay();
})();
