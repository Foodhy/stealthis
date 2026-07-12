(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Hero timecode ---------- */
  var heroTc = document.getElementById("heroTc");
  var frame = 0;
  function pad(n) { return String(n).padStart(2, "0"); }
  setInterval(function () {
    frame = (frame + 1) % (24 * 60 * 60 * 24);
    var f = frame % 24;
    var totalSec = Math.floor(frame / 24);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600) % 24;
    heroTc.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }, 42);

  document.getElementById("playLockup").addEventListener("click", function () {
    toast("▶ Showreel preview — 90 seconds of pure listing gold");
  });

  /* ---------- Package data ---------- */
  var PACKAGES = {
    tour: {
      name: "Signature Tour",
      desc: "A polished 2-minute walkthrough that stages every room like a film set.",
      price: 690,
      runtime: "RUNTIME 02:00",
      badge: "Most booked",
      turn: "48h turnaround",
      deliver: "6 deliverables",
      thumb: "linear-gradient(150deg, #23262e, #0e0f13)",
      feats: [
        "Gimbal-stabilized room-to-room flow",
        "Agent voiceover or on-camera intro",
        "Licensed cinematic soundtrack",
        "16:9 master + MLS compression"
      ]
    },
    drone: {
      name: "Drone Aerials",
      desc: "FAA-licensed aerial reveals showing lot lines, roofline, and the neighborhood story.",
      price: 940,
      runtime: "RUNTIME 01:30",
      badge: "Premium",
      turn: "72h turnaround",
      deliver: "8 deliverables",
      thumb: "linear-gradient(150deg, #1b2733, #0a0f14)",
      feats: [
        "4K aerial orbit + rising reveal shots",
        "Property boundary & acreage graphics",
        "Combined ground + air edit",
        "Twilight aerial option available"
      ]
    },
    social: {
      name: "Social Cutdowns",
      desc: "Fast, punchy vertical edits engineered for Reels, TikTok, and paid listing ads.",
      price: 380,
      runtime: "RUNTIME 00:30",
      badge: "Best value",
      turn: "24h turnaround",
      deliver: "5 deliverables",
      thumb: "linear-gradient(150deg, #2b2038, #100b16)",
      feats: [
        "Three 9:16 vertical cuts",
        "Captioned hooks & price reveal",
        "Trending-audio ready exports",
        "Story + feed aspect variants"
      ]
    }
  };

  var current = "tour";

  var el = {
    thumb: document.getElementById("pkgThumb"),
    badge: document.getElementById("pkgBadge"),
    runtime: document.getElementById("pkgRuntime"),
    name: document.getElementById("pkgName"),
    desc: document.getElementById("pkgDesc"),
    price: document.getElementById("pkgPrice"),
    feats: document.getElementById("pkgFeats"),
    turn: document.getElementById("pkgTurn"),
    deliver: document.getElementById("pkgDeliver"),
    panel: document.getElementById("pkgPanel"),
    obPkg: document.getElementById("obPkg")
  };

  function money(n) { return "$" + n.toLocaleString("en-US"); }

  function renderPackage(key) {
    var p = PACKAGES[key];
    current = key;
    el.thumb.style.background = p.thumb;
    el.badge.textContent = p.badge;
    el.runtime.textContent = p.runtime;
    el.name.textContent = p.name;
    el.desc.textContent = p.desc;
    el.price.textContent = money(p.price);
    el.turn.textContent = p.turn;
    el.deliver.textContent = p.deliver;
    el.feats.innerHTML = "";
    p.feats.forEach(function (f) {
      var li = document.createElement("li");
      li.textContent = f;
      el.feats.appendChild(li);
    });
    el.panel.setAttribute("aria-labelledby", "tab-" + key);
    el.panel.classList.remove("fade");
    void el.panel.offsetWidth;
    el.panel.classList.add("fade");
    el.obPkg.textContent = p.name + " · " + money(p.price);
    computeEstimate();
  }

  var tabs = document.querySelectorAll(".pkg-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderPackage(tab.dataset.pkg);
    });
  });

  document.getElementById("selectPkg").addEventListener("click", function () {
    toast(PACKAGES[current].name + " selected — scroll down to order");
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Estimator ---------- */
  var sqft = document.getElementById("sqft");
  var sqftOut = document.getElementById("sqftOut");
  var estDate = document.getElementById("estDate");
  var estShoot = document.getElementById("estShoot");
  var estTotal = document.getElementById("estTotal");
  var estNote = document.getElementById("estNote");
  var addDrone = document.getElementById("addDrone");
  var addTwilight = document.getElementById("addTwilight");
  var addFloor = document.getElementById("addFloor");

  var RUSH = {
    standard: { days: 2, mult: 1, label: "Standard grade, delivered in 48 hours." },
    priority: { days: 1, mult: 1.25, label: "Priority edit — bumped to the front of the queue." },
    overnight: { days: 0, mult: 1.6, label: "Overnight rush — delivered by 9am next business day." }
  };

  function getRush() {
    var checked = document.querySelector('input[name="rush"]:checked');
    return checked ? checked.value : "standard";
  }

  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function addBusinessDays(start, days) {
    var d = new Date(start);
    var added = 0;
    if (days === 0) { // overnight = next calendar day
      d.setDate(d.getDate() + 1);
      return d;
    }
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  }

  function fmtDate(d) {
    return DAY_NAMES[d.getDay()] + " " + MON[d.getMonth()] + " " + d.getDate();
  }

  var lastEstimate = { total: 690, turn: "48h", date: "—" };

  function computeEstimate() {
    var size = parseInt(sqft.value, 10);
    sqftOut.textContent = size.toLocaleString("en-US") + " sq ft";

    var base = PACKAGES[current].price;
    var sizeUp = size > 4000 ? Math.round((size - 4000) / 1000) * 90 : 0;
    var addons = 0;
    if (addDrone.checked) addons += 240;
    if (addTwilight.checked) addons += 180;
    if (addFloor.checked) addons += 120;

    var rush = RUSH[getRush()];
    var subtotal = base + sizeUp + addons;
    var total = Math.round(subtotal * rush.mult);

    // shoot date: 2 business days out; delivery: shoot + rush days
    var shootDay = addBusinessDays(new Date(), 2);
    var extraForSize = size > 5000 ? 1 : 0;
    var deliveryDay = addBusinessDays(shootDay, rush.days + extraForSize);

    var turnLabel = rush.days === 0 ? "24h" : (rush.days + extraForSize) * 24 + "h";

    estTotal.textContent = money(total);
    estShoot.textContent = fmtDate(shootDay);
    estDate.textContent = fmtDate(deliveryDay);
    estNote.textContent = rush.label + (sizeUp ? " Large property surcharge applied." : "");

    lastEstimate = { total: money(total), turn: turnLabel, date: fmtDate(deliveryDay) };
  }

  sqft.addEventListener("input", computeEstimate);
  [addDrone, addTwilight, addFloor].forEach(function (c) {
    c.addEventListener("change", computeEstimate);
  });
  document.querySelectorAll('input[name="rush"]').forEach(function (r) {
    r.addEventListener("change", computeEstimate);
  });

  /* ---------- Compare slider ---------- */
  var cmpRange = document.getElementById("cmpRange");
  var cmpBefore = document.getElementById("cmpBefore");
  var cmpHandle = document.getElementById("cmpHandle");
  function updateCompare() {
    var v = cmpRange.value;
    cmpBefore.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    cmpHandle.style.left = v + "%";
  }
  cmpRange.addEventListener("input", updateCompare);
  updateCompare();

  /* ---------- Testimonials ---------- */
  var QUOTES = [
    {
      text: "The twilight tour had three showings booked before it even hit the MLS. Fastest offer I've written this year.",
      name: "Marisol Vega",
      role: "Broker · Vega & Co. Realty"
    },
    {
      text: "Aperture turned my $1.2M listing into a scroll-stopping reel. Full-price offer in nine days flat.",
      name: "Devon Okafor",
      role: "Luxury Specialist · Harbor Line"
    },
    {
      text: "The drone reveal sold the lot as much as the house. Buyers finally understood the acreage.",
      name: "Priya Raman",
      role: "Land & Estates · Cedar Grove"
    }
  ];
  var qText = document.getElementById("quoteText");
  var qName = document.getElementById("quoteName");
  var qRole = document.getElementById("quoteRole");
  var dotsWrap = document.getElementById("quoteDots");
  var qi = 0;
  var qTimer;

  QUOTES.forEach(function (_, i) {
    var b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Testimonial " + (i + 1));
    b.addEventListener("click", function () { showQuote(i, true); });
    dotsWrap.appendChild(b);
  });
  var dots = dotsWrap.querySelectorAll("button");

  function showQuote(i, manual) {
    qi = i;
    var q = QUOTES[i];
    qText.textContent = q.text;
    qName.textContent = q.name;
    qRole.textContent = q.role;
    dots.forEach(function (d, di) { d.classList.toggle("is-active", di === i); });
    var stage = qText.closest(".quote");
    stage.classList.remove("fade");
    void stage.offsetWidth;
    stage.classList.add("fade");
    if (manual) restartQuoteTimer();
  }
  function nextQuote() { showQuote((qi + 1) % QUOTES.length, false); }
  function restartQuoteTimer() {
    clearInterval(qTimer);
    qTimer = setInterval(nextQuote, 5500);
  }
  showQuote(0, false);
  restartQuoteTimer();

  /* ---------- Order sheet ---------- */
  var sheetWrap = document.getElementById("sheetWrap");
  var lastFocus = null;

  function openSheet() {
    document.getElementById("sumPkg").textContent = PACKAGES[current].name;
    document.getElementById("sumTurn").textContent = lastEstimate.turn;
    document.getElementById("sumDate").textContent = lastEstimate.date;
    document.getElementById("sumTotal").textContent = lastEstimate.total;
    lastFocus = document.activeElement;
    sheetWrap.hidden = false;
    document.getElementById("sheetClose").focus();
    document.body.style.overflow = "hidden";
  }
  function closeSheet() {
    sheetWrap.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.getElementById("orderBtn").addEventListener("click", openSheet);
  document.getElementById("sheetClose").addEventListener("click", closeSheet);
  document.getElementById("sheetOverlay").addEventListener("click", closeSheet);
  document.getElementById("confirmBtn").addEventListener("click", function () {
    closeSheet();
    toast("Slot held ✓ We'll email your shoot confirmation shortly");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheetWrap.hidden) closeSheet();
  });

  /* ---------- Init ---------- */
  renderPackage("tour");
  computeEstimate();
})();
