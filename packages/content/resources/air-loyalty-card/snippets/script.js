(function () {
  "use strict";

  var TIERS = {
    gold: {
      label: "Gold",
      next: "Platinum",
      miles: 58420,
      goal: 75000,
      from: "#b88a2e",
      to: "#e6c878",
      ink: "#3a2c08",
      benefits: [
        "Priority check-in & boarding (Zone 1)",
        "2 free checked bags, up to 32 kg each",
        "Lounge access on international routes",
        "25% bonus miles on every flight",
        "Complimentary seat selection",
      ],
    },
    platinum: {
      label: "Platinum",
      next: "Diamond",
      miles: 96750,
      goal: 125000,
      from: "#4b5563",
      to: "#aeb8c6",
      ink: "#10151c",
      benefits: [
        "Guaranteed seat on sold-out flights",
        "3 free checked bags, up to 32 kg each",
        "Unlimited lounge access worldwide",
        "75% bonus miles on every flight",
        "Two annual upgrade-to-Business awards",
        "Dedicated 24/7 concierge line",
      ],
    },
  };

  var ACTIVITY = [
    { type: "flight", title: "SK 218 · JFK → LHR", meta: "18 Jun 2026 · Business", amt: 4120, plus: true },
    { type: "flight", title: "SK 661 · LHR → SIN", meta: "02 Jun 2026 · Economy", amt: 1880, plus: true },
    { type: "redeem", title: "Lounge day pass", meta: "21 May 2026 · CDG Terminal 2E", amt: 5000, plus: false },
    { type: "flight", title: "SK 110 · NRT → SFO", meta: "08 May 2026 · Premium Economy", amt: 2640, plus: true },
    { type: "redeem", title: "Seat upgrade · 14A", meta: "30 Apr 2026 · SK 218", amt: 8000, plus: false },
  ];

  var REDEEM_COST = 25000;

  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };

  var state = { tier: "gold" };

  /* ---------- toast ---------- */
  var toastWrap = $("toastWrap");
  function toast(msg, ok) {
    var el = document.createElement("div");
    el.className = "toast" + (ok ? " ok" : "");
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------- count-up ---------- */
  function countUp(el, to, dur) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = fmt(to); return; }
    var start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- QR (deterministic faux pattern) ---------- */
  function buildQR() {
    var qr = $("qr");
    qr.innerHTML = "";
    var n = 11;
    var seed = 0x9e3779b9;
    function rnd() {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return ((seed >>> 0) % 1000) / 1000;
    }
    function finder(r, c) {
      return (r < 3 && c < 3) || (r < 3 && c > n - 4) || (r > n - 4 && c < 3);
    }
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var cell = document.createElement("i");
        var on;
        if (finder(r, c)) {
          on = (r === 0 || r === 2 || c === 0 || c === 2 || (r === 1 && c === 1) ||
            (r === 0 || r === 2 || c === 0 || c === 2));
        } else {
          on = rnd() > 0.5;
        }
        cell.style.background = on ? "var(--ink)" : "transparent";
        qr.appendChild(cell);
      }
    }
  }

  /* ---------- render ---------- */
  function setProgress(t) {
    var pct = Math.min(100, Math.round((t.miles / t.goal) * 100));
    var bar = $("bar");
    $("nextTierName").textContent = t.next;
    $("progGoal").textContent = fmt(t.goal);
    $("progGoal").classList.add("tnum");
    bar.setAttribute("aria-valuenow", String(pct));
    countUp($("progNow"), t.miles, 1000);
    countUp($("progRemain"), Math.max(0, t.goal - t.miles), 1000);
    // animate fill after a tick so transition fires
    var fill = $("barFill");
    fill.style.width = "0%";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fill.style.width = pct + "%"; });
    });
  }

  function renderBenefits(t) {
    var ul = $("benefitList");
    ul.innerHTML = "";
    t.benefits.forEach(function (b) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="chk" aria-hidden="true">✓</span><span></span>';
      li.querySelector("span:last-child").textContent = b;
      ul.appendChild(li);
    });
  }

  function renderActivity() {
    var ul = $("actList");
    ul.innerHTML = "";
    ACTIVITY.forEach(function (a) {
      var li = document.createElement("li");
      var icon = a.type === "redeem" ? "★" : "✈";
      var cls = a.type === "redeem" ? "act-icon redeem" : "act-icon";
      var amtCls = a.plus ? "act-amt plus tnum" : "act-amt minus tnum";
      var sign = a.plus ? "+" : "−";
      li.innerHTML =
        '<span class="' + cls + '" aria-hidden="true">' + icon + "</span>" +
        '<div class="act-main"><p class="act-title"></p><p class="act-meta"></p></div>' +
        '<span class="' + amtCls + '">' + sign + " " + fmt(a.amt) + "</span>";
      li.querySelector(".act-title").textContent = a.title;
      li.querySelector(".act-meta").textContent = a.meta;
      ul.appendChild(li);
    });
  }

  function applyTier(key) {
    var t = TIERS[key];
    state.tier = key;
    document.documentElement.style.setProperty("--tier-a", t.from);
    document.documentElement.style.setProperty("--tier-b", t.to);
    document.documentElement.style.setProperty("--tier-ink", t.ink);
    $("frontTier").textContent = t.label;
    $("backTier").textContent = t.label;
    $("milesNum").parentNode; // keep ref
    countUp($("milesNum"), t.miles, 1100);
    setProgress(t);
    renderBenefits(t);

    // toggle buttons
    document.querySelectorAll(".tt-btn").forEach(function (b) {
      var active = b.dataset.tier === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    // redeem availability
    var btn = $("redeemBtn");
    if (t.miles < REDEEM_COST) {
      btn.disabled = true;
      btn.firstChild; // no-op
    } else {
      btn.disabled = false;
    }
  }

  /* ---------- events ---------- */
  document.querySelectorAll(".tt-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.tier === state.tier) return;
      applyTier(b.dataset.tier);
      toast(TIERS[b.dataset.tier].label + " status loaded", true);
    });
  });

  var flip = $("flip");
  var flipInner = $("flipInner");
  flipInner.addEventListener("click", function () {
    var on = flip.classList.toggle("flipped");
    flipInner.setAttribute("aria-pressed", String(on));
    flipInner.setAttribute(
      "aria-label",
      on ? "Flip card to view membership details" : "Flip card to view membership QR"
    );
  });

  $("redeemBtn").addEventListener("click", function (e) {
    if (e.currentTarget.disabled) return;
    var t = TIERS[state.tier];
    var remaining = t.miles - REDEEM_COST;
    countUp($("milesNum"), remaining, 800);
    t.miles = remaining;
    setProgress(t);
    toast("Reward redeemed · " + fmt(REDEEM_COST) + " mi spent", true);
    if (t.miles < REDEEM_COST) e.currentTarget.disabled = true;
  });

  /* ---------- init ---------- */
  buildQR();
  renderActivity();
  applyTier("gold");
})();
