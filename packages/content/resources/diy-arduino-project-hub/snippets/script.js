/* CIRCUITO Project Hub — community gallery interactions (vanilla JS) */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ data */
  var BOARDS = {
    nova:  { label: "Nova",  hue: "#00979d" },
    pulse: { label: "Pulse", hue: "#2f6ea8" },
    mote:  { label: "Mote",  hue: "#7b5cc4" },
    tiny:  { label: "Tiny",  hue: "#cf7a1b" }
  };

  var PROJECTS = [
    { id:1,  title:"Greenhouse humidity logger with e-paper readout", author:"Mira Solvang", board:"nova",  diff:"Beginner",     time:"3 h", respect:412, days:4,  trend:96, parts:["DHT22 sensor","2.9\" e-paper","SD card module","RTC clock","Li-ion shield"] },
    { id:2,  title:"Six-axis desktop arm driven by closed-loop steppers", author:"Tobias Renk", board:"pulse", diff:"Advanced",  time:"22 h", respect:1284, days:11, trend:88, parts:["NEMA17 stepper","A4988 driver","Rotary encoder","24V PSU","Limit switch"] },
    { id:3,  title:"Conductive-thread jacket with breathing LED spine", author:"Alia Norrbom", board:"tiny", diff:"Intermediate", time:"7 h", respect:733, days:2, trend:99, parts:["WS2812 strip","Conductive thread","LiPo 400mAh","Tilt switch"] },
    { id:4,  title:"Mesh soil network for a community allotment", author:"Devan Roque", board:"mote", diff:"Intermediate", time:"9 h", respect:508, days:18, trend:71, parts:["LoRa radio","Capacitive soil probe","Solar panel 5V","TP4056 charger","Antenna 868"] },
    { id:5,  title:"Retro seven-segment word clock in a walnut frame", author:"Hana Peltier", board:"nova", diff:"Beginner", time:"5 h", respect:964, days:30, trend:64, parts:["TM1637 display","DS3231 RTC","Rotary encoder","Walnut panel"] },
    { id:6,  title:"Line-following robot tuned with a PID web console", author:"Iker Vasquez", board:"pulse", diff:"Intermediate", time:"12 h", respect:851, days:7, trend:85, parts:["IR array x5","TB6612 driver","Wi-Fi module","N20 motors","Li-ion 18650"] },
    { id:7,  title:"Pocket theremin with capacitive antenna and speaker", author:"Rune Ashby", board:"nova", diff:"Intermediate", time:"6 h", respect:376, days:14, trend:58, parts:["Copper antenna","PAM8403 amp","8Ω speaker","Potentiometer x2"] },
    { id:8,  title:"Battery-free NFC door tag reader for a maker space", author:"Sofia Lindqvist", board:"mote", diff:"Advanced", time:"15 h", respect:642, days:25, trend:49, parts:["PN532 NFC","Relay module","OLED 0.96\"","Buzzer","EEPROM"] },
    { id:9,  title:"Sourdough proofing box with PID heat and fan curve", author:"Nils Baumann", board:"nova", diff:"Intermediate", time:"8 h", respect:1109, days:5, trend:93, parts:["Thermistor NTC","SSR 40A","Blower fan","OLED 0.96\"","Heating pad"] },
    { id:10, title:"Wearable posture buzzer stitched into a collar", author:"Yara Mbeki", board:"tiny", diff:"Beginner", time:"2 h", respect:288, days:1, trend:97, parts:["MPU6050 IMU","Vibration motor","LiPo 150mAh","Snap connectors"] },
    { id:11, title:"Ambient air-quality lamp that shifts colour by PM2.5", author:"Elias Fontaine", board:"mote", diff:"Beginner", time:"4 h", respect:721, days:9, trend:80, parts:["PMS5003 sensor","WS2812 ring","Wi-Fi module","Diffuser dome"] },
    { id:12, title:"CNC pen plotter built from two salvaged scanners", author:"Petra Nowak", board:"pulse", diff:"Advanced", time:"26 h", respect:1573, days:21, trend:76, parts:["NEMA17 stepper","GT2 belt","A4988 driver","Servo SG90","Limit switch"] },
    { id:13, title:"Split ortholinear keyboard with rotary volume knob", author:"Callum Ferris", board:"pulse", diff:"Advanced", time:"18 h", respect:1342, days:16, trend:74, parts:["Hot-swap sockets","Rotary encoder","OLED 0.96\"","TRRS jack","Diode 1N4148"] },
    { id:14, title:"Tide clock that pulls harmonics from a coastal feed", author:"Marit Haugen", board:"mote", diff:"Intermediate", time:"10 h", respect:497, days:3, trend:90, parts:["Wi-Fi module","Stepper 28BYJ-48","DS3231 RTC","Acrylic dial"] },
    { id:15, title:"Sewable turn-signal backpack for night commuting", author:"Owen Delacroix", board:"tiny", diff:"Beginner", time:"3 h", respect:655, days:12, trend:69, parts:["WS2812 strip","Conductive thread","Tilt switch","LiPo 400mAh","Snap connectors"] },
    { id:16, title:"Reflow hotplate with thermocouple safety cutoff", author:"Ines Bardales", board:"nova", diff:"Advanced", time:"14 h", respect:1021, days:27, trend:55, parts:["MAX6675 thermocouple","SSR 40A","Heating pad","Buzzer","Rotary encoder"] },
    { id:17, title:"Rain-gauge weather node with a tipping bucket", author:"Jonas Kittel", board:"mote", diff:"Intermediate", time:"11 h", respect:389, days:33, trend:41, parts:["Reed switch","LoRa radio","Solar panel 5V","BME280 sensor","Antenna 868"] },
    { id:18, title:"Interactive LED chess board with reed-switch sensing", author:"Lucia Ferrand", board:"pulse", diff:"Advanced", time:"30 h", respect:1866, days:6, trend:92, parts:["Reed switch","WS2812 strip","Multiplexer 74HC","Wi-Fi module","Acrylic dial"] }
  ];

  var PAGE = 12;

  /* --------------------------------------------------------------- helpers */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var toastEl = $("#toast");
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }
  $$("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
  });

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function avatarColor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return "hsl(" + h + " 42% 42%)";
  }
  function ago(d) { return d === 1 ? "1 day ago" : d + " days ago"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  /* -------------------------------------------------------- thumbnail art */
  function thumb(p) {
    var hue = BOARDS[p.board].hue;
    var seed = p.id * 7;
    var bars = "";
    for (var i = 0; i < 7; i++) {
      var x = 12 + i * 26 + (seed % 5);
      var h = 18 + ((seed * (i + 3)) % 46);
      bars += '<rect x="' + x + '" y="' + (108 - h) + '" width="12" height="' + h + '" rx="3" fill="' + hue + '" opacity="' + (0.16 + (i % 4) * 0.14).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 200 125" role="img" aria-label="Abstract circuit illustration">' +
      '<defs><linearGradient id="g' + p.id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + hue + '" stop-opacity=".16"/>' +
      '<stop offset="1" stop-color="' + hue + '" stop-opacity=".02"/></linearGradient></defs>' +
      '<rect width="200" height="125" fill="url(#g' + p.id + ')"/>' +
      bars +
      '<path d="M8 ' + (34 + (seed % 20)) + ' h44 l14 -14 h52 l12 12 h62" fill="none" stroke="' + hue + '" stroke-width="1.6" opacity=".55"/>' +
      '<circle cx="' + (56 + (seed % 60)) + '" cy="' + (34 + (seed % 20)) + '" r="4" fill="' + hue + '"/>' +
      '<rect x="72" y="44" width="56" height="34" rx="5" fill="#1a2b34" opacity=".9"/>' +
      '<text x="100" y="65" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#cfe9ea">' + BOARDS[p.board].label.toUpperCase() + '</text>' +
      '</svg>';
  }

  /* --------------------------------------------------------------- filters */
  var state = { boards: [], diff: "all", comps: [], sort: "trending", shown: PAGE };

  var ALL_COMPS = (function () {
    var m = {};
    PROJECTS.forEach(function (p) { p.parts.forEach(function (c) { m[c] = (m[c] || 0) + 1; }); });
    return Object.keys(m).sort().map(function (c) { return { name: c, n: m[c] }; });
  })();

  function matches(p) {
    if (state.boards.length && state.boards.indexOf(p.board) === -1) return false;
    if (state.diff !== "all" && p.diff !== state.diff) return false;
    for (var i = 0; i < state.comps.length; i++) {
      if (p.parts.indexOf(state.comps[i]) === -1) return false;
    }
    return true;
  }

  function sorted(list) {
    var l = list.slice();
    if (state.sort === "newest") l.sort(function (a, b) { return a.days - b.days; });
    else if (state.sort === "respect") l.sort(function (a, b) { return b.respect - a.respect; });
    else l.sort(function (a, b) { return b.trend - a.trend; });
    return l;
  }

  /* ----------------------------------------------------------- card render */
  var respected = {};

  function cardHTML(p, idx) {
    var on = !!respected[p.id];
    var shownParts = p.parts.slice(0, 3).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    var extra = p.parts.length - 3;
    if (extra > 0) shownParts += '<li class="more">' + extra + " more component" + (extra > 1 ? "s" : "") + "</li>";
    return '<article class="card in" style="animation-delay:' + Math.min(idx, 11) * 35 + 'ms">' +
      '<div class="thumb"><span class="tag tag-' + p.board + '">' + BOARDS[p.board].label + '</span>' + thumb(p) + '</div>' +
      '<div class="cbody">' +
        '<h3 class="ctitle">' + esc(p.title) + "</h3>" +
        '<span class="author"><span class="avatar" style="background:' + avatarColor(p.author) + '">' + initials(p.author) + "</span>" + esc(p.author) + "</span>" +
        '<div class="meta"><span class="badge b-' + p.diff + '">' + p.diff + '</span><span class="time">⏱ ' + p.time + "</span></div>" +
        '<ul class="parts">' + shownParts + "</ul>" +
        '<div class="cfoot">' +
          '<button class="respect" type="button" data-id="' + p.id + '" aria-pressed="' + on + '" aria-label="Respect this project">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20s-7-4.5-7-9.2A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.8C19 15.5 12 20 12 20z" stroke-linejoin="round"/></svg>' +
            "<span>" + (p.respect + (on ? 1 : 0)) + "</span>" +
          "</button>" +
          '<span class="stamp">' + ago(p.days) + "</span>" +
        "</div>" +
      "</div></article>";
  }

  var grid = $("#grid"), emptyEl = $("#empty"), countLine = $("#countLine"), moreBtn = $("#loadMore");

  function render(keepShown) {
    var list = sorted(PROJECTS.filter(matches));
    if (!keepShown) state.shown = PAGE;
    var visible = list.slice(0, state.shown);

    grid.innerHTML = visible.map(cardHTML).join("");
    emptyEl.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    moreBtn.parentElement.hidden = list.length <= state.shown;

    countLine.innerHTML = list.length
      ? "Showing <b>" + visible.length + "</b> of <b>" + list.length + "</b> projects"
      : "No projects match your filters";

    renderActive();
    renderBoardCounts();
  }

  function renderBoardCounts() {
    Object.keys(BOARDS).forEach(function (b) {
      var el = $('[data-count-board="' + b + '"]');
      if (!el) return;
      var save = state.boards;
      state.boards = [];
      var n = PROJECTS.filter(function (p) { return p.board === b && matches(p); }).length;
      state.boards = save;
      el.textContent = n;
    });
  }

  /* ------------------------------------------------------- active chip row */
  var activeBar = $("#activeBar"), activeChips = $("#activeChips");

  function chip(label, kind, value) {
    return '<span class="chip">' + esc(label) +
      '<button type="button" data-kind="' + kind + '" data-value="' + esc(value) + '" aria-label="Remove filter ' + esc(label) + '">×</button></span>';
  }

  function renderActive() {
    var html = "";
    state.boards.forEach(function (b) { html += chip(BOARDS[b].label + " board", "board", b); });
    if (state.diff !== "all") html += chip(state.diff, "diff", state.diff);
    state.comps.forEach(function (c) { html += chip(c, "comp", c); });
    activeChips.innerHTML = html;
    activeBar.hidden = html === "";
  }

  activeChips.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-kind]");
    if (!b) return;
    removeFilter(b.dataset.kind, b.dataset.value);
  });

  function removeFilter(kind, value) {
    if (kind === "board") {
      state.boards = state.boards.filter(function (x) { return x !== value; });
      var cb = $('[data-board="' + value + '"]');
      if (cb) cb.checked = false;
    } else if (kind === "diff") {
      state.diff = "all";
      $('input[name="diff"][value="all"]').checked = true;
    } else {
      state.comps = state.comps.filter(function (x) { return x !== value; });
      renderChips();
      renderComps();
    }
    state.shown = PAGE;
    render();
  }

  /* -------------------------------------------------------- component list */
  var compSearch = $("#compSearch"), compList = $("#compList"), compChips = $("#compChips");

  function renderComps() {
    var q = compSearch.value.trim().toLowerCase();
    var list = ALL_COMPS.filter(function (c) { return c.name.toLowerCase().indexOf(q) !== -1; });
    if (!list.length) {
      compList.innerHTML = '<p class="copt-none">No part named “' + esc(compSearch.value) + '”</p>';
      return;
    }
    compList.innerHTML = list.map(function (c) {
      var sel = state.comps.indexOf(c.name) !== -1;
      return '<button class="copt" type="button" role="option" aria-selected="' + sel + '" data-comp="' + esc(c.name) + '">' +
        "<span>" + (sel ? "✓ " : "") + esc(c.name) + '</span><span class="n">' + c.n + "</span></button>";
    }).join("");
  }

  function renderChips() {
    compChips.innerHTML = state.comps.map(function (c) {
      return '<span class="chip">' + esc(c) + '<button type="button" data-comp-rm="' + esc(c) + '" aria-label="Remove ' + esc(c) + '">×</button></span>';
    }).join("");
  }

  compList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-comp]");
    if (!b) return;
    var name = b.dataset.comp;
    var i = state.comps.indexOf(name);
    if (i === -1) state.comps.push(name); else state.comps.splice(i, 1);
    state.shown = PAGE;
    renderChips(); renderComps(); render();
  });

  compChips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-comp-rm]");
    if (!b) return;
    removeFilter("comp", b.dataset.compRm);
  });

  compSearch.addEventListener("input", renderComps);

  /* ----------------------------------------------------------- board/diff */
  $$("[data-board]").forEach(function (cb) {
    cb.addEventListener("change", function () {
      var b = cb.dataset.board;
      if (cb.checked) { if (state.boards.indexOf(b) === -1) state.boards.push(b); }
      else state.boards = state.boards.filter(function (x) { return x !== b; });
      state.shown = PAGE;
      render();
    });
  });

  $$('input[name="diff"]').forEach(function (r) {
    r.addEventListener("change", function () {
      state.diff = r.value;
      state.shown = PAGE;
      render();
    });
  });

  $("#sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    render(true);
    toast("Sorted by " + e.target.selectedOptions[0].textContent.toLowerCase());
  });

  /* --------------------------------------------------------------- respect */
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".respect");
    if (!b) return;
    var id = Number(b.dataset.id);
    var on = b.getAttribute("aria-pressed") === "true";
    respected[id] = !on;
    b.setAttribute("aria-pressed", String(!on));
    var base = PROJECTS.filter(function (p) { return p.id === id; })[0].respect;
    b.querySelector("span").textContent = base + (!on ? 1 : 0);
    toast(!on ? "Respect sent to the maker." : "Respect removed.");
  });

  /* ------------------------------------------------------------- load more */
  moreBtn.addEventListener("click", function () {
    var before = state.shown;
    state.shown += PAGE;
    render(true);
    var total = PROJECTS.filter(matches).length;
    toast("Loaded " + Math.min(PAGE, total - before) + " more projects.");
  });

  /* ----------------------------------------------------------- clear/reset */
  function clearAll() {
    state.boards = []; state.diff = "all"; state.comps = []; state.shown = PAGE;
    $$("[data-board]").forEach(function (cb) { cb.checked = false; });
    $('input[name="diff"][value="all"]').checked = true;
    compSearch.value = "";
    renderChips(); renderComps(); render();
    toast("All filters cleared.");
  }
  $("#clearAll").addEventListener("click", clearAll);
  $("#clearAll2").addEventListener("click", clearAll);
  $("#resetBtn").addEventListener("click", clearAll);

  $$(".colcard").forEach(function (c) {
    var open = function () { toast(c.querySelector("h3").textContent + " collection — demo only."); };
    c.addEventListener("click", open);
    c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  /* ------------------------------------------------------------------ boot */
  renderComps();
  renderChips();
  render();
})();
