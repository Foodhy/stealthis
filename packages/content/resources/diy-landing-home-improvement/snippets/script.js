/* Weekend Reno — DIY home improvement landing (vanilla JS) */
(function () {
  "use strict";

  /* ---------- toast ---------- */
  var host = document.getElementById("toastHost");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "err" ? " err" : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 300);
    }, 3400);
  }

  var usd = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ---------- before / after slider ---------- */
  var frame = document.getElementById("baFrame");
  var before = document.getElementById("baBefore");
  var divider = document.getElementById("baDivider");
  var handle = document.getElementById("baHandle");
  var pos = 52;

  function setPos(p) {
    pos = Math.max(0, Math.min(100, p));
    before.style.clipPath = "inset(0 " + (100 - pos) + "% 0 0)";
    divider.style.left = pos + "%";
    handle.setAttribute("aria-valuenow", Math.round(pos));
    handle.setAttribute("aria-valuetext", Math.round(pos) + "% after");
  }
  setPos(pos);

  function fromEvent(e) {
    var r = frame.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setPos((x / r.width) * 100);
  }

  var dragging = false;
  function down(e) { dragging = true; frame.setPointerCapture && e.pointerId != null && frame.setPointerCapture(e.pointerId); fromEvent(e); }
  function move(e) { if (dragging) { fromEvent(e); e.preventDefault(); } }
  function up() { dragging = false; }

  frame.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move, { passive: false });
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);

  handle.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 2;
    var map = { ArrowLeft: -step, ArrowRight: step, Home: -100, End: 100, PageDown: -10, PageUp: 10 };
    if (e.key in map) { setPos(e.key === "Home" ? 0 : e.key === "End" ? 100 : pos + map[e.key]); e.preventDefault(); }
  });

  /* ---------- categories ---------- */
  var ICONS = {
    paint: '<path d="M4 5h13a2 2 0 0 1 2 2v3H4z"/><path d="M15 10v3a2 2 0 0 1-2 2h-2v6" fill="none" stroke="currentColor" stroke-width="2"/>',
    tile: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    deck: '<rect x="2" y="5" width="20" height="3" rx="1"/><rect x="2" y="10.5" width="20" height="3" rx="1"/><rect x="2" y="16" width="20" height="3" rx="1"/>',
    bath: '<path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M7 12V6a2 2 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="2"/>',
    kitchen: '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M8 5.5v2.5" stroke="currentColor" stroke-width="2" fill="none"/>',
    electrical: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>'
  };
  var CATS = [
    { id: "paint", name: "Paint", n: 96 },
    { id: "tile", name: "Tile", n: 54 },
    { id: "deck", name: "Deck", n: 38 },
    { id: "bath", name: "Bath", n: 71 },
    { id: "kitchen", name: "Kitchen", n: 83 },
    { id: "electrical", name: "Electrical", n: 70 }
  ];
  var catList = document.getElementById("cats");
  CATS.forEach(function (c) {
    var li = document.createElement("li");
    li.className = "cat";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", c.name + " — " + c.n + " guides");
    li.innerHTML =
      '<span class="cat-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">' + ICONS[c.id] + "</svg></span>" +
      '<span class="cat-name">' + c.name + "</span>" +
      '<span class="cat-count">' + c.n + " guides</span>";
    function open() { toast(c.name + ": " + c.n + " guides ready to browse."); }
    li.addEventListener("click", open);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    catList.appendChild(li);
  });

  /* ---------- materials calculator ---------- */
  var PRICES = {
    paint: { gal: 42, primer: 34, tape: 7.5, drop: 12, roller: 16 },
    tile: { sqft: 4.6, thinset: 24, grout: 18, spacers: 9, trowel: 14 },
    deck: { board: 11.4, joist: 15.2, post: 22, hardware: 96, stain: 46 }
  };
  var els = {
    form: document.getElementById("calcForm"),
    len: document.getElementById("fLen"),
    wid: document.getElementById("fWid"),
    hgt: document.getElementById("fHgt"),
    qual: document.getElementById("fQual"),
    hField: document.getElementById("hField"),
    label: document.getElementById("roLabel"),
    value: document.getElementById("roValue"),
    sub: document.getElementById("roSub"),
    cost: document.getElementById("roCost"),
    hours: document.getElementById("roHours"),
    body: document.getElementById("brkBody"),
    total: document.getElementById("brkTotal")
  };
  function num(input, fallback) {
    var v = parseFloat(input.value);
    if (!isFinite(v) || v <= 0) return fallback;
    return Math.min(v, parseFloat(input.max) || v);
  }
  function proj() {
    var r = document.querySelector('input[name="proj"]:checked');
    return r ? r.value : "paint";
  }

  function compute() {
    var p = proj();
    var L = num(els.len, 16), W = num(els.wid, 12), H = num(els.hgt, 9);
    var q = parseFloat(els.qual.value) || 1;
    var area = L * W;
    var rows = [], headline = "", sub = "", hours = 0;

    els.hField.style.display = p === "paint" ? "" : "none";

    if (p === "paint") {
      var wall = 2 * (L + W) * H;
      var paintArea = wall * 2;              // two coats
      var gal = Math.ceil(paintArea / 350);
      var primerGal = Math.ceil(wall / 400);
      headline = gal + " gal";
      els.label.textContent = "Paint needed";
      sub = "2 coats · " + Math.round(wall) + " sq ft of wall";
      hours = Math.round(wall / 55 + 3);
      rows = [
        ["Interior paint · eggshell", gal, PRICES.paint.gal * q, "gal"],
        ["Bonding primer", primerGal, PRICES.paint.primer * q, "gal"],
        ["Painter's tape 1.88in", Math.ceil(2 * (L + W) / 60), PRICES.paint.tape, "roll"],
        ["Canvas drop cloth", Math.ceil(area / 90), PRICES.paint.drop, "ea"],
        ["Roller + tray kit", 1, PRICES.paint.roller, "kit"]
      ];
    } else if (p === "tile") {
      var tiles = Math.ceil((area * 1.1) / 1); // 12x12 tile = 1 sq ft, +10% waste
      headline = tiles + " tiles";
      els.label.textContent = "Tiles (12×12)";
      sub = Math.round(area) + " sq ft + 10% waste";
      hours = Math.round(area * 0.32 + 4);
      rows = [
        ["Porcelain tile 12×12", tiles, PRICES.tile.sqft * q, "ea"],
        ["Modified thinset 50 lb", Math.ceil(area / 80), PRICES.tile.thinset, "bag"],
        ["Sanded grout 25 lb", Math.ceil(area / 110), PRICES.tile.grout, "bag"],
        ["Spacers 1/8in (200 ct)", Math.ceil(tiles / 200), PRICES.tile.spacers, "bag"],
        ["Notched trowel + float", 1, PRICES.tile.trowel, "kit"]
      ];
    } else {
      var boards = Math.ceil((L * 12) / 5.5 * 1.1);  // 5.5in deck boards + 10% waste
      var joists = Math.ceil((L * 12) / 16) + 1;
      var posts = Math.max(4, Math.ceil(L / 6) * 2);
      headline = boards + " boards";
      els.label.textContent = "Deck boards";
      sub = Math.round(area) + " sq ft frame · " + joists + " joists @ 16in OC";
      hours = Math.round(area * 0.26 + 14);
      rows = [
        ["Deck board 5/4×6×" + Math.ceil(W) + "ft", boards, PRICES.deck.board * q, "ea"],
        ["Joist 2×8×" + Math.ceil(W) + "ft PT", joists, PRICES.deck.joist * q, "ea"],
        ["Post 4×4×8ft PT", posts, PRICES.deck.post, "ea"],
        ["Joist hangers + screws", 1, PRICES.deck.hardware + joists * 2.2, "lot"],
        ["Sealer / stain 1 gal", Math.ceil(area / 200), PRICES.deck.stain, "gal"]
      ];
    }

    var total = 0;
    els.body.innerHTML = "";
    rows.forEach(function (r) {
      var qty = r[1], unit = r[2], sum = qty * unit;
      total += sum;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + r[0] + "</td>" +
        "<td>" + qty + " " + r[3] + "</td>" +
        "<td>" + usd(unit) + "</td>" +
        "<td>" + usd(sum) + "</td>";
      els.body.appendChild(tr);
    });

    els.value.textContent = headline;
    els.sub.textContent = sub;
    els.cost.textContent = usd(total);
    els.hours.textContent = hours + " h";
    els.total.textContent = usd(total);
  }

  els.form.addEventListener("input", compute);
  els.form.addEventListener("change", compute);
  els.form.addEventListener("submit", function (e) { e.preventDefault(); });
  compute();

  /* ---------- guide cards ---------- */
  var GUIDES = [
    { t: "Repaint a bedroom in one weekend", d: "Cut in like a pro, roll a flawless second coat and get crisp ceiling lines without tape.", skill: "easy", cost: "$180–$310", time: "9 h", permit: false, g: "linear-gradient(135deg,#f26522,#f5c518)" },
    { t: "Lay a herringbone tile entry", d: "Layout math, a dry run, and the thinset trick that keeps 45° cuts from creeping.", skill: "med", cost: "$340–$520", time: "14 h", permit: false, g: "linear-gradient(135deg,#2c4258,#7ba8c7)" },
    { t: "Build a 12×16 ground-level deck", d: "Footings, ledger flashing, joist spacing and the inspection stages you can't skip.", skill: "hard", cost: "$2,400–$3,100", time: "48 h", permit: true, g: "linear-gradient(135deg,#a86f3c,#c98f56)" },
    { t: "Swap a vanity and faucet", d: "Shut-offs, supply lines, silicone bead — and how to not crack the drain trap.", skill: "med", cost: "$420–$680", time: "7 h", permit: false, g: "linear-gradient(135deg,#3f9e5c,#a8dcbb)" },
    { t: "Install peel-and-stick backsplash", d: "The cheapest kitchen upgrade that still looks intentional two years later.", skill: "easy", cost: "$95–$160", time: "4 h", permit: false, g: "linear-gradient(135deg,#f5c518,#ffe9de)" },
    { t: "Add a dedicated 20A kitchen circuit", d: "Panel capacity, cable runs and why this one usually ends with a licensed hand.", skill: "hard", cost: "$150–$240", time: "6 h", permit: true, g: "linear-gradient(135deg,#1b2b3a,#3f5266)" }
  ];
  var SKILL = { easy: ["Beginner", "badge-easy"], med: ["Intermediate", "badge-med"], hard: ["Advanced", "badge-hard"] };
  var list = document.getElementById("guides-list");
  GUIDES.forEach(function (g) {
    var li = document.createElement("li");
    li.className = "guide";
    var s = SKILL[g.skill];
    li.innerHTML =
      '<div class="guide-art" style="background:' + g.g + '"></div>' +
      '<div class="guide-body">' +
      '<div class="badges"><span class="badge ' + s[1] + '">' + s[0] + "</span>" +
      (g.permit ? '<span class="badge badge-permit">Permit required</span>' : "") + "</div>" +
      "<h3>" + g.t + "</h3><p>" + g.d + "</p>" +
      '<ul class="guide-meta"><li>Cost <b>' + g.cost + "</b></li><li>Time <b>" + g.time + "</b></li></ul>" +
      "</div>";
    list.appendChild(li);
  });

  /* ---------- safety checklist ---------- */
  var TASKS = [
    ["Safety glasses and hearing protection on hand", "ANSI Z87.1 rated, not sunglasses"],
    ["Work area cleared and well lit", "Two light sources beats one bright one"],
    ["Breaker off and tested at the outlet", "Non-contact tester, then confirm"],
    ["Water shut-off located and turned", "Know where the main valve is too"],
    ["Utilities located before any digging", "Free locate call, 3 business days"],
    ["Ladder on level ground, 4:1 angle", "Belt buckle stays between the rails"],
    ["Dust mask or respirator for sanding", "N95 minimum; P100 for old finishes"],
    ["Permit checked with the local office", "Structural, electrical and gas work"]
  ];
  var checks = document.getElementById("checks");
  var fill = document.getElementById("meterFill");
  var count = document.getElementById("meterCount");
  var msg = document.getElementById("meterMsg");
  var MSGS = ["Let's get set up.", "Good start — keep going.", "Halfway there.", "Almost cleared for work.", "All clear. Go make sawdust."];

  TASKS.forEach(function (t, i) {
    var li = document.createElement("li");
    li.className = "check";
    var id = "chk" + i;
    li.innerHTML =
      '<input type="checkbox" id="' + id + '">' +
      '<label class="check-txt" for="' + id + '">' + t[0] + '<span class="check-sub">' + t[1] + "</span></label>";
    checks.appendChild(li);
  });

  function refreshMeter() {
    var boxes = checks.querySelectorAll('input[type="checkbox"]');
    var done = 0;
    boxes.forEach(function (b) {
      b.closest(".check").classList.toggle("done", b.checked);
      if (b.checked) done++;
    });
    var pct = (done / boxes.length) * 100;
    fill.style.width = pct + "%";
    count.textContent = done + " of " + boxes.length;
    msg.textContent = MSGS[Math.min(MSGS.length - 1, Math.floor(pct / 25))];
    if (done === boxes.length) toast("Checklist complete — you're cleared to start.");
  }
  checks.addEventListener("change", refreshMeter);
  refreshMeter();

  /* ---------- pro finder ---------- */
  var proForm = document.getElementById("proForm");
  var zip = document.getElementById("zip");
  var PROS = ["Hollis & Vane Contracting", "Marlow Brothers Build", "Cedarline Home Services", "Ridgeway Trades Co."];
  proForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = zip.value.trim();
    if (!/^\d{5}$/.test(v)) {
      zip.setAttribute("aria-invalid", "true");
      zip.focus();
      toast("Enter a valid 5-digit ZIP code.", "err");
      return;
    }
    zip.removeAttribute("aria-invalid");
    var a = PROS[Math.floor(Math.random() * PROS.length)];
    toast("3 licensed pros near " + v + " — starting with " + a + ".");
    zip.value = "";
  });
  zip.addEventListener("input", function () {
    zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
    zip.removeAttribute("aria-invalid");
  });
})();
