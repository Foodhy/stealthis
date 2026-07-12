(function () {
  "use strict";

  // ---- Data (base prices in USD) ----
  var BASE = {
    half: { day: 1200, hour: 340, label: "Half Day" },
    full: { day: 2150, hour: 275, label: "Full Day" },
    project: { day: 6800, hour: 0, label: "Project" }
  };
  // approximate hours used to derive hourly totals for day-rate display parity
  var TIER_HOURS = { half: 4, full: 9, project: 0 };
  var RUSH_RATE = 0.2; // 20% surcharge in hourly/rush mode

  var ADDONS = [
    { id: "second", title: "Second shooter", price: 650, desc: "Extra camera op for multi-angle coverage.", badge: "" },
    { id: "drone", title: "Drone / aerial", price: 480, desc: "Licensed FPV & cinematic aerial passes.", badge: "Popular" },
    { id: "grade", title: "Advanced color grade", price: 350, desc: "Per-scene look development + LUTs.", badge: "" },
    { id: "rush", title: "Same-week delivery", price: 500, desc: "Guaranteed turnaround under 5 days.", badge: "" },
    { id: "audio", title: "On-site audio kit", price: 220, desc: "Lav mics, boom & recorded scratch.", badge: "" },
    { id: "captions", title: "Captions & subtitles", price: 160, desc: "SRT + burned-in social versions.", badge: "" }
  ];

  var CUR = {
    USD: { sign: "$", rate: 1 },
    EUR: { sign: "€", rate: 0.92 },
    GBP: { sign: "£", rate: 0.79 }
  };

  var state = {
    billing: "day",
    currency: "USD",
    tier: "full",
    addons: {}
  };

  // ---- Helpers ----
  function fmt(n) {
    return Math.round(n).toLocaleString("en-US");
  }
  function conv(usd) {
    return usd * CUR[state.currency].rate;
  }
  function sign() {
    return CUR[state.currency].sign;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // Compute the displayed base price for a tier under current billing mode
  function tierDisplayPrice(tier) {
    var b = BASE[tier];
    if (tier === "project") return b.day; // project always fixed "from"
    if (state.billing === "hour") {
      return b.hour * TIER_HOURS[tier] * (1 + RUSH_RATE);
    }
    return b.day;
  }

  // ---- Render add-ons ----
  var addonsWrap = document.getElementById("addons");
  var checkSVG =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4.5 4.5L19 7" stroke="#16110a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  ADDONS.forEach(function (a) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "addon";
    el.setAttribute("aria-pressed", "false");
    el.dataset.addon = a.id;
    el.innerHTML =
      '<span class="addon-check">' + checkSVG + "</span>" +
      '<span class="addon-body">' +
        '<span class="addon-title"><span>' + a.title + "</span>" +
          '<span class="addon-price">+' + sign() + '<span class="amt" data-addon-amt="' + a.id + '">' + fmt(conv(a.price)) + "</span></span></span>" +
        '<span class="addon-desc">' + a.desc + "</span>" +
        (a.badge ? '<span class="badge">' + a.badge + "</span>" : "") +
      "</span>";
    el.addEventListener("click", function () {
      state.addons[a.id] = !state.addons[a.id];
      el.classList.toggle("is-on", state.addons[a.id]);
      el.setAttribute("aria-pressed", state.addons[a.id] ? "true" : "false");
      update();
    });
    addonsWrap.appendChild(el);
  });

  // ---- Currency signs everywhere ----
  function refreshSigns() {
    document.querySelectorAll("[data-cur-sign]").forEach(function (s) {
      s.textContent = sign();
    });
  }

  // ---- Update all prices & estimate ----
  function update() {
    refreshSigns();

    // Rate card prices
    ["half", "full", "project"].forEach(function (tier) {
      var amtEl = document.querySelector('[data-price="' + tier + '"]');
      if (amtEl) amtEl.textContent = fmt(conv(tierDisplayPrice(tier)));
    });
    // "per" label
    document.querySelectorAll("[data-per]").forEach(function (p) {
      p.textContent = state.billing === "hour" ? "/ shoot" : "/ day";
    });

    // Add-on prices
    ADDONS.forEach(function (a) {
      var el = document.querySelector('[data-addon-amt="' + a.id + '"]');
      if (el) el.textContent = fmt(conv(a.price));
    });

    // Estimate
    var base = tierDisplayPrice(state.tier);
    var addTotal = 0;
    var count = 0;
    ADDONS.forEach(function (a) {
      if (state.addons[a.id]) {
        addTotal += a.price;
        count++;
      }
    });
    var subtotal = base + addTotal;

    document.getElementById("estTier").textContent =
      BASE[state.tier].label +
      (state.billing === "hour" && state.tier !== "project" ? " (rush)" : "");
    document.getElementById("estAddons").textContent =
      count === 0 ? "None selected" : count + (count === 1 ? " add-on" : " add-ons") + " · +" + sign() + fmt(conv(addTotal));
    document.getElementById("estTotal").textContent = fmt(conv(subtotal));

    var fine;
    if (state.tier === "project") {
      fine = "Project bids are fixed-scope; total shown is a starting estimate.";
    } else if (state.billing === "hour") {
      fine = "Hourly + rush mode: 20% surcharge applied to on-site time.";
    } else {
      fine = "Standard day rate. Rush surcharge not applied.";
    }
    document.getElementById("estFine").textContent = fine;
  }

  // ---- Segmented controls ----
  function wireSeg(id, key, cb) {
    var seg = document.getElementById(id);
    seg.addEventListener("click", function (e) {
      var btn = e.target.closest(".seg-btn");
      if (!btn) return;
      seg.querySelectorAll(".seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      cb(btn);
    });
  }
  wireSeg("billingSeg", "billing", function (btn) {
    state.billing = btn.dataset.billing;
    update();
    toast(state.billing === "hour" ? "Switched to hourly + rush pricing" : "Switched to standard day rates");
  });
  wireSeg("currencySeg", "currency", function (btn) {
    state.currency = btn.dataset.cur;
    update();
    toast("Prices shown in " + state.currency);
  });

  // ---- Tier selection ----
  var cards = document.getElementById("cards");
  function selectTier(tier, announce) {
    state.tier = tier;
    cards.querySelectorAll(".card").forEach(function (c) {
      c.classList.toggle("is-selected", c.dataset.tier === tier);
    });
    cards.querySelectorAll(".pick-btn").forEach(function (b) {
      var on = b.dataset.pick === tier;
      b.textContent = on ? "Selected ✓" : "Select " + BASE[b.dataset.pick].label;
    });
    update();
    if (announce) toast(BASE[tier].label + " selected");
  }
  cards.addEventListener("click", function (e) {
    var btn = e.target.closest(".pick-btn");
    if (btn) {
      selectTier(btn.dataset.pick, true);
      return;
    }
  });
  // keyboard: Enter/Space on focused card selects it
  cards.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTier(card.dataset.tier, true);
      }
    });
  });

  // ---- Quote form ----
  var form = document.getElementById("quoteForm");
  function setErr(fieldEl, on) {
    fieldEl.classList.toggle("err", on);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("qName");
    var email = document.getElementById("qEmail");
    var ok = true;

    if (!name.value.trim()) { setErr(name.parentElement, true); ok = false; }
    else setErr(name.parentElement, false);

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { setErr(email.parentElement, true); ok = false; }
    else setErr(email.parentElement, false);

    if (!ok) {
      toast("Please add your name and a valid email.");
      (name.value.trim() ? email : name).focus();
      return;
    }
    var total = document.getElementById("estTotal").textContent;
    toast("Quote request sent — est. " + sign() + total + ". We'll reply within a day.");
    form.reset();
  });

  // clear error on input
  form.querySelectorAll("input").forEach(function (inp) {
    inp.addEventListener("input", function () { setErr(inp.parentElement, false); });
  });

  // ---- Running timecode in hero (25fps) ----
  var tcEl = document.getElementById("timecode");
  var frame = 0;
  function pad(n) { return String(n).padStart(2, "0"); }
  setInterval(function () {
    frame = (frame + 1) % (25 * 60 * 60 * 24);
    var f = frame % 25;
    var totalSec = Math.floor(frame / 25);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600) % 24;
    tcEl.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }, 40);

  // ---- Init ----
  selectTier("full", false);
  update();
})();
