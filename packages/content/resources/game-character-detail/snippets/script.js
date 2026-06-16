/* Game — Character Detail
   Interactions: ability expand/collapse, animated stat bars + counters,
   skin selector (re-tints page accent + splash), lore read-more, toasts. */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toasts");
  function toast(msg) {
    if (!toastWrap) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  /* ---------- data ---------- */
  var STATS = [
    { label: "HP", value: 8420, max: 10000 },
    { label: "ATK", value: 1960, max: 2200 },
    { label: "DEF", value: 1480, max: 2000 },
    { label: "SPD", value: 112, max: 160 },
    { label: "CRIT", value: 68, max: 100 }
  ];

  var ABILITIES = [
    {
      icon: "⚔", name: "Cleaving Vow", type: "Basic · Melee", cd: "0s",
      desc: "A wide arc strike that hits all enemies in front of the Vanguard, dealing 180% ATK physical damage and generating 1 Resolve per target struck.",
      chips: [["Damage", "180% ATK"], ["Targets", "All front"], ["Gen", "+1 Resolve"]]
    },
    {
      icon: "🛡", name: "Iron Bulwark", type: "Skill · Defensive", cd: "8s",
      desc: "Raises a fractured aegis for 6s, reducing damage taken by 40% and taunting the nearest 3 foes. Allies behind the Vanguard gain 15% DEF.",
      chips: [["DR", "40%"], ["Duration", "6s"], ["Ally DEF", "+15%"]]
    },
    {
      icon: "✶", name: "Ash Detonation", type: "Ultimate · Burst", cd: "22s",
      desc: "Consumes all Resolve to slam the ground, dealing 90% ATK per stack as area damage and stunning struck enemies for 1.5s. Heals the Vanguard for 30% of damage dealt.",
      chips: [["Damage", "90% / stack"], ["Stun", "1.5s"], ["Lifesteal", "30%"]]
    },
    {
      icon: "♾", name: "Last Warden", type: "Passive", cd: "—",
      desc: "While below 35% HP, the Vanguard cannot be reduced below 1 HP for 3s (once per battle) and gains 25% increased ATK until the effect ends.",
      chips: [["Trigger", "<35% HP"], ["Guard", "3s"], ["ATK", "+25%"]]
    }
  ];

  /* ---------- render stats ---------- */
  var statgrid = document.getElementById("statgrid");
  var statEls = [];
  STATS.forEach(function (s) {
    var pct = Math.round((s.value / s.max) * 100);
    var row = document.createElement("div");
    row.className = "stat";
    row.innerHTML =
      '<span class="stat__label">' + s.label + '</span>' +
      '<span class="stat__track"><span class="stat__fill"></span></span>' +
      '<span class="stat__val">0</span>';
    statgrid.appendChild(row);
    statEls.push({
      fill: row.querySelector(".stat__fill"),
      val: row.querySelector(".stat__val"),
      pct: pct,
      target: s.value
    });
  });

  function countUp(el, target, dur) {
    var start = performance.now();
    function step(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateStats() {
    statEls.forEach(function (s, i) {
      setTimeout(function () {
        s.fill.style.width = s.pct + "%";
        countUp(s.val, s.target, 1000);
      }, 120 * i);
    });
  }

  // animate when stats panel scrolls into view (or immediately if already visible)
  var fired = false;
  function maybeAnimate() {
    if (fired) return;
    fired = true;
    animateStats();
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { maybeAnimate(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(statgrid);
  } else {
    maybeAnimate();
  }
  // safety: fire shortly after load regardless
  window.addEventListener("load", function () { setTimeout(maybeAnimate, 400); });

  /* ---------- render abilities ---------- */
  var ablist = document.getElementById("ablist");
  ABILITIES.forEach(function (a, idx) {
    var li = document.createElement("li");
    li.className = "ability";
    var bodyId = "ab-body-" + idx;
    var chips = a.chips.map(function (c) {
      return '<span class="ability__chip">' + c[0] + ' <b>' + c[1] + '</b></span>';
    }).join("");
    li.innerHTML =
      '<button class="ability__btn" aria-expanded="false" aria-controls="' + bodyId + '">' +
        '<span class="ability__icon" aria-hidden="true">' + a.icon + '</span>' +
        '<span><span class="ability__name">' + a.name + '</span><br>' +
        '<span class="ability__type">' + a.type + '</span></span>' +
        '<span class="ability__meta">' +
          '<span class="ability__cd" data-cd="' + a.cd + '">' + (a.cd === "—" ? "Passive" : "CD " + a.cd) + '</span>' +
          '<span class="ability__chev" aria-hidden="true">▾</span>' +
        '</span>' +
      '</button>' +
      '<div class="ability__body" id="' + bodyId + '"><div class="ability__inner">' +
        '<p class="ability__desc">' + a.desc + '</p>' +
        '<div class="ability__stats">' + chips + '</div>' +
      '</div></div>';
    ablist.appendChild(li);
  });

  ablist.addEventListener("click", function (e) {
    var btn = e.target.closest(".ability__btn");
    if (!btn) return;
    var ability = btn.closest(".ability");
    var body = ability.querySelector(".ability__body");
    var open = ability.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  });

  /* ---------- read more ---------- */
  var readMore = document.getElementById("readMore");
  var loreBody = document.getElementById("loreBody");
  readMore.addEventListener("click", function () {
    var open = loreBody.getAttribute("data-open") !== "true";
    loreBody.setAttribute("data-open", String(open));
    readMore.setAttribute("aria-expanded", String(open));
    readMore.textContent = open ? "Read less" : "Read more";
  });

  /* ---------- skin selector ---------- */
  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    return (n >> 16 & 255) + ", " + (n >> 8 & 255) + ", " + (n & 255);
  }

  var skinrow = document.getElementById("skinrow");
  var skinName = document.getElementById("skinName");
  var root = document.documentElement;

  skinrow.addEventListener("click", function (e) {
    var chip = e.target.closest(".skinchip");
    if (!chip) return;
    var accent = chip.getAttribute("data-accent");
    var label = chip.getAttribute("data-label");

    root.style.setProperty("--skin", accent);
    root.style.setProperty("--skin-rgb", hexToRgb(accent));
    document.querySelector(".page").setAttribute("data-skin", chip.getAttribute("data-skin"));

    skinrow.querySelectorAll(".skinchip").forEach(function (c) {
      var on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", String(on));
    });
    if (skinName) skinName.textContent = label;
    toast("Skin equipped · " + label);
  });

  /* keyboard nav for the skin tablist */
  skinrow.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var chips = Array.prototype.slice.call(skinrow.querySelectorAll(".skinchip"));
    var i = chips.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    var next = e.key === "ArrowRight" ? (i + 1) % chips.length : (i - 1 + chips.length) % chips.length;
    chips[next].focus();
    chips[next].click();
  });

  /* ---------- CTAs ---------- */
  var inTeam = false;
  var addTeam = document.getElementById("addTeam");
  addTeam.addEventListener("click", function () {
    inTeam = !inTeam;
    addTeam.innerHTML = inTeam
      ? '<span class="btn__ic" aria-hidden="true">✓</span> In Team'
      : '<span class="btn__ic" aria-hidden="true">＋</span> Add to Team';
    toast(inTeam ? "Ashen Vanguard added to your team" : "Removed from team");
  });

  var wishlist = document.getElementById("wishlist");
  wishlist.addEventListener("click", function () {
    var on = wishlist.getAttribute("aria-pressed") !== "true";
    wishlist.setAttribute("aria-pressed", String(on));
    wishlist.innerHTML = on
      ? '<span class="btn__ic" aria-hidden="true">♥</span> Wishlisted'
      : '<span class="btn__ic" aria-hidden="true">♡</span> Wishlist';
    toast(on ? "Saved to wishlist" : "Removed from wishlist");
  });

  document.querySelector(".back").addEventListener("click", function (e) {
    e.preventDefault();
    toast("Returning to roster…");
  });
})();
