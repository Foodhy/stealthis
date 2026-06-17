(function () {
  "use strict";

  // ---- Fictional donor data -------------------------------------------------
  var DONORS = [
    { name: "Marisol & Aren Vega", tier: "platinum", amount: 50000 },
    { name: "The Linwood Family Trust", tier: "platinum", amount: 42000 },
    { name: "Okonkwo Brothers Co.", tier: "platinum", amount: 38500 },
    { name: "Dr. Priya Raman", tier: "platinum", amount: 30000 },
    { name: "Harbor Light Collective", tier: "platinum", amount: 27500 },
    { name: "Tomás & Wren Castillo", tier: "gold", amount: 18000 },
    { name: "Nadia Fennimore", tier: "gold", amount: 14200 },
    { name: "Greenfield PTA", tier: "gold", amount: 12500 },
    { name: "Samuel Adeyemi", tier: "gold", amount: 11000 },
    { name: "Holloway & Quinn LLP", tier: "gold", amount: 9800 },
    { name: "Ingrid Sørensen", tier: "gold", amount: 8500 },
    { name: "The Marsh Bakery", tier: "gold", amount: 7600 },
    { name: "Devon Park Runners", tier: "gold", amount: 6900 },
    { name: "Aiko Tanaka", tier: "silver", amount: 3800 },
    { name: "Carlos & June Mbeki", tier: "silver", amount: 3200 },
    { name: "The Felder Household", tier: "silver", amount: 2750 },
    { name: "Renata Volkov", tier: "silver", amount: 2400 },
    { name: "Hassan Qureshi", tier: "silver", amount: 1900 },
    { name: "Maple Street Book Club", tier: "silver", amount: 1500 },
    { name: "Olu & Beth Adesanya", tier: "silver", amount: 1200 },
    { name: "Tessa Lindgren", tier: "silver", amount: 950 },
    { name: "The Pham Family", tier: "silver", amount: 700 },
    { name: "Gwen Mortimer", tier: "silver", amount: 500 },
    { name: "Anonymous Friend", tier: "silver", amount: 250 }
  ];

  var AVATAR_COLORS = [
    "#1f7a6d", "#cc5d28", "#3d6db0", "#8a5fb0", "#b04f6b",
    "#2f9e6f", "#c79224", "#5a7a4a", "#a05c3a", "#4a6b8a"
  ];

  // ---- DOM refs -------------------------------------------------------------
  var wall = document.getElementById("wall");
  var searchInput = document.getElementById("search");
  var tierBtns = Array.prototype.slice.call(document.querySelectorAll(".tier-btn"));
  var showAmounts = document.getElementById("show-amounts");
  var resultLine = document.getElementById("result-line");
  var emptyMsg = document.getElementById("empty");
  var donateBtn = document.getElementById("donate-btn");
  var toastEl = document.getElementById("toast");

  var state = { tier: "all", query: "", amounts: false };

  // ---- Helpers --------------------------------------------------------------
  function initials(name) {
    var clean = name.replace(/\b(The|&|Co\.|LLP|Trust|Family|Household|Collective|Brothers|Club|PTA)\b/gi, " ");
    var parts = clean.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) parts = name.trim().split(/\s+/);
    var a = parts[0] ? parts[0][0] : "";
    var b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }

  function colorFor(name) {
    var sum = 0;
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  // ---- Render ---------------------------------------------------------------
  function buildCard(d) {
    var card = document.createElement("article");
    card.className = "donor donor--" + d.tier;
    card.tabIndex = 0;
    card.dataset.tier = d.tier;
    card.dataset.name = d.name.toLowerCase();

    var avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.background = colorFor(d.name);
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initials(d.name);

    var body = document.createElement("div");
    body.className = "donor__body";

    var nm = document.createElement("p");
    nm.className = "donor__name";
    nm.textContent = d.name;

    var meta = document.createElement("div");
    meta.className = "donor__meta";

    var chip = document.createElement("span");
    chip.className = "tier-chip";
    chip.textContent = d.tier;

    var amt = document.createElement("span");
    amt.className = "donor__amount is-hidden";
    amt.dataset.amount = d.amount;
    amt.textContent = "Gift recognized";

    meta.appendChild(chip);
    meta.appendChild(amt);
    body.appendChild(nm);
    body.appendChild(meta);
    card.appendChild(avatar);
    card.appendChild(body);
    return card;
  }

  function render() {
    var frag = document.createDocumentFragment();
    DONORS.forEach(function (d) {
      frag.appendChild(buildCard(d));
    });
    wall.appendChild(frag);
  }

  // ---- Filtering ------------------------------------------------------------
  function applyFilters() {
    var q = state.query.trim().toLowerCase();
    var cards = wall.querySelectorAll(".donor");
    var visible = 0;

    cards.forEach(function (card) {
      var matchTier = state.tier === "all" || card.dataset.tier === state.tier;
      var matchQuery = !q || card.dataset.name.indexOf(q) !== -1;
      var show = matchTier && matchQuery;
      card.hidden = !show;
      if (show) visible++;
    });

    emptyMsg.hidden = visible !== 0;
    var label = state.tier === "all" ? "donors" : state.tier + " donors";
    resultLine.textContent = "Showing " + visible + " " + label +
      (q ? ' matching "' + state.query.trim() + '"' : "") + ".";
  }

  function setAmounts(on) {
    state.amounts = on;
    wall.querySelectorAll(".donor__amount").forEach(function (el) {
      if (on) {
        el.textContent = money(parseInt(el.dataset.amount, 10));
        el.classList.remove("is-hidden");
      } else {
        el.textContent = "Gift recognized";
        el.classList.add("is-hidden");
      }
    });
  }

  // ---- Hover highlight (dim others of different tier) ------------------------
  wall.addEventListener("mouseover", function (e) {
    var card = e.target.closest(".donor");
    if (!card || card.hidden) return;
    var tier = card.dataset.tier;
    wall.querySelectorAll(".donor").forEach(function (c) {
      if (!c.hidden) c.classList.toggle("is-dim", c.dataset.tier !== tier);
    });
  });
  wall.addEventListener("mouseleave", function () {
    wall.querySelectorAll(".donor").forEach(function (c) {
      c.classList.remove("is-dim");
    });
  });

  // ---- Events ---------------------------------------------------------------
  tierBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tierBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.tier = btn.dataset.tier;
      applyFilters();
    });
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    applyFilters();
  });

  showAmounts.addEventListener("change", function () {
    setAmounts(showAmounts.checked);
    toast(showAmounts.checked ? "Gift amounts visible" : "Gift amounts hidden");
  });

  donateBtn.addEventListener("click", function () {
    toast("Thank you! Redirecting to our secure donation page…");
  });

  // ---- Animated impact counters --------------------------------------------
  function animateCounters() {
    document.querySelectorAll(".impact__num").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var dur = 1100;
      var start = performance.now();
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ---- Init -----------------------------------------------------------------
  render();
  applyFilters();
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".impact__num").forEach(function (el) {
      el.textContent = parseInt(el.dataset.count, 10).toLocaleString("en-US");
    });
  } else {
    animateCounters();
  }
})();
