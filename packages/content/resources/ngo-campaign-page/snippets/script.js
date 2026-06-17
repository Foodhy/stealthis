(function () {
  "use strict";

  /* ---------- campaign state ---------- */
  var GOAL = 85000;
  var COST_PER_WELL = 7000;
  var raised = 61840;       // current raised
  var donors = 1284;        // current donor count
  var selectedAmount = 450; // default tier
  var frequency = "once";

  var fmt = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------- animated thermometer ---------- */
  var thermoFill = document.getElementById("thermoFill");
  var thermoBar = document.getElementById("thermoBar");
  var raisedAmt = document.getElementById("raisedAmt");
  var pctLabel = document.getElementById("pctLabel");
  var donorCount = document.getElementById("donorCount");
  var wellsCount = document.getElementById("wellsCount");
  var donorsFoot = document.getElementById("donorsFoot");

  function renderThermo(animate) {
    var pct = Math.min(100, (raised / GOAL) * 100);
    thermoFill.style.width = pct.toFixed(1) + "%";
    pctLabel.textContent = Math.round(pct) + "%";
    thermoBar.setAttribute("aria-valuenow", String(Math.round(raised)));
    wellsCount.textContent = String(Math.floor(raised / COST_PER_WELL));
    if (donorsFoot) {
      donorsFoot.innerHTML = "Join <strong>" + donors.toLocaleString("en-US") + "</strong> generous people.";
    }
    if (!animate) {
      raisedAmt.textContent = fmt(raised);
      donorCount.textContent = donors.toLocaleString("en-US");
    }
  }

  // count-up animation on first paint
  function countUp(el, target, fmtFn, dur) {
    var start = performance.now();
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmtFn(target * eased);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmtFn(target);
    }
    requestAnimationFrame(step);
  }

  function intro() {
    countUp(raisedAmt, raised, fmt, 1100);
    countUp(donorCount, donors, function (n) { return Math.round(n).toLocaleString("en-US"); }, 1100);
    requestAnimationFrame(function () { renderThermo(true); });
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    renderThermo(false);
  } else {
    setTimeout(intro, 180);
  }

  /* ---------- tier selection ---------- */
  var tierGrid = document.getElementById("tierGrid");
  var tiers = Array.prototype.slice.call(tierGrid.querySelectorAll(".tier"));
  var customAmt = document.getElementById("customAmt");
  var summaryAmt = document.getElementById("summaryAmt");
  var matchNote = document.getElementById("matchNote");
  var donateBtn = document.getElementById("donateBtn");

  function updateSummary() {
    summaryAmt.textContent = fmt(selectedAmount);
    matchNote.innerHTML = "Matched to <strong>" + fmt(selectedAmount * 2) + "</strong> by the Marigold Trust.";
    var label = "Donate " + fmt(selectedAmount);
    if (frequency === "monthly") label += "/mo";
    donateBtn.textContent = label;
  }

  function selectTier(btn) {
    tiers.forEach(function (t) { t.setAttribute("aria-checked", t === btn ? "true" : "false"); });
    selectedAmount = parseInt(btn.getAttribute("data-amount"), 10);
    customAmt.value = "";
    updateSummary();
  }

  tiers.forEach(function (btn) {
    btn.addEventListener("click", function () { selectTier(btn); });
    btn.addEventListener("keydown", function (e) {
      var idx = tiers.indexOf(btn);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        var next = tiers[(idx + 1) % tiers.length];
        next.focus(); selectTier(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var prev = tiers[(idx - 1 + tiers.length) % tiers.length];
        prev.focus(); selectTier(prev);
      }
    });
  });

  customAmt.addEventListener("input", function () {
    var v = parseFloat(customAmt.value);
    if (!isNaN(v) && v > 0) {
      selectedAmount = v;
      tiers.forEach(function (t) { t.setAttribute("aria-checked", "false"); });
      updateSummary();
    }
  });

  document.querySelectorAll('input[name="freq"]').forEach(function (r) {
    r.addEventListener("change", function () {
      if (r.checked) { frequency = r.value; updateSummary(); }
    });
  });

  /* ---------- donate submit ---------- */
  document.getElementById("giveForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedAmount || selectedAmount <= 0) {
      toast("Please choose or enter a valid amount.");
      customAmt.focus();
      return;
    }
    addDonor("You", selectedAmount, true);
    raised += selectedAmount;
    donors += 1;
    renderThermo(false);
    var word = frequency === "monthly" ? "monthly gift" : "gift";
    toast("Thank you! Your " + word + " of " + fmt(selectedAmount) + " brings Loma Verde closer.", "ok");
  });

  /* ---------- live donor feed ---------- */
  var donorFeed = document.getElementById("donorFeed");
  var FIRST = ["Inés", "Marcus", "Priya", "Dao", "Lena", "Tomás", "Aisha", "Noah", "Yuki", "Sofia", "Kwame", "Mei", "Diego", "Hana"];
  var LAST = ["C.", "R.", "M.", "Okafor", "Nguyen", "Patel", "Lund", "Ortiz", "Bauer", "Reyes", "Santos", "Adeyemi"];
  var WHERE = ["Portland, US", "Lyon, FR", "Mumbai, IN", "Berlin, DE", "Bogotá, CO", "Osaka, JP", "Nairobi, KE", "Toronto, CA", "anonymous donor"];
  var COLORS = ["#1f7a6d", "#e8743b", "#2f9e6f", "#d98a2b", "#155e54", "#cc5d28"];
  var AMOUNTS = [25, 35, 50, 75, 100, 120, 150, 200, 250, 450, 500];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function avatar(name) {
    var s = document.createElement("span");
    s.className = "av";
    s.style.background = pick(COLORS);
    s.textContent = name.charAt(0).toUpperCase();
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  function addDonor(name, amount, isYou) {
    var li = document.createElement("li");
    var av = avatar(name);
    var info = document.createElement("div");
    info.className = "d-info";
    var place = isYou ? "just now · thank you!" : pick(WHERE) + " · " + (Math.floor(Math.random() * 9) + 1) + "m ago";
    info.innerHTML = '<div class="d-name">' + name + '</div><div class="d-meta">' + place + "</div>";
    var amt = document.createElement("span");
    amt.className = "d-amt";
    amt.textContent = fmt(amount);
    li.appendChild(av);
    li.appendChild(info);
    li.appendChild(amt);
    donorFeed.insertBefore(li, donorFeed.firstChild);
    while (donorFeed.children.length > 6) {
      donorFeed.removeChild(donorFeed.lastChild);
    }
  }

  // seed initial feed
  var seed = [
    ["Priya Patel", 250], ["Marcus R.", 50], ["anonymous donor", 35], ["Sofia Reyes", 120], ["Noah Lund", 75]
  ];
  seed.forEach(function (d) { addDonor(d[0], d[1], false); });

  // simulated live donations
  function liveTick() {
    var name = pick(FIRST) + " " + pick(LAST);
    if (Math.random() < 0.18) name = "anonymous donor";
    var amount = pick(AMOUNTS);
    addDonor(name, amount, false);
    raised = Math.min(GOAL, raised + amount);
    donors += 1;
    renderThermo(false);
  }
  var feedTimer = setInterval(liveTick, 6500);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { clearInterval(feedTimer); }
    else { feedTimer = setInterval(liveTick, 6500); }
  });

  /* ---------- sharing ---------- */
  var SHARE_URL = "https://brightfutures.example/clean-water-now";
  var SHARE_TEXT = "Help build 12 wells for Loma Verde — clean water changes everything.";

  function openShare(net) {
    var u = encodeURIComponent(SHARE_URL);
    var t = encodeURIComponent(SHARE_TEXT);
    var map = {
      x: "https://twitter.com/intent/tweet?text=" + t + "&url=" + u,
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + u,
      whatsapp: "https://wa.me/?text=" + t + "%20" + u
    };
    if (map[net]) {
      window.open(map[net], "_blank", "noopener,width=620,height=520");
      toast("Opening share window — thank you for spreading the word!", "ok");
    }
  }

  function copyLink() {
    var done = function () { toast("Campaign link copied to clipboard!", "ok"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SHARE_URL).then(done, function () { toast("Copy failed — link: " + SHARE_URL); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = SHARE_URL;
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy this link: " + SHARE_URL); }
      ta.remove();
    }
  }

  document.querySelectorAll(".share-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var net = b.getAttribute("data-net");
      if (net === "copy") copyLink();
      else openShare(net);
    });
  });

  document.getElementById("shareTop").addEventListener("click", function () {
    if (navigator.share) {
      navigator.share({ title: "Clean Water Now", text: SHARE_TEXT, url: SHARE_URL })
        .then(function () { toast("Thanks for sharing!", "ok"); })
        .catch(function () {});
    } else {
      copyLink();
    }
  });

  /* init */
  updateSummary();
})();
