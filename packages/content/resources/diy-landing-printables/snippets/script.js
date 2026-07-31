/* SPOOLYARD — fictional 3D model community landing. Vanilla JS only. */
(function () {
  "use strict";

  /* ---------------- toast helper ---------------- */
  var toastWrap = document.getElementById("toasts");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------------- data ---------------- */
  var MODELS = [
    { t: "Hex Cable Tray — modular 60 mm", a: "voxelwren", p: "fdm", m: "PETG", likes: 4820, dl: 18240, lh: 0.20, hrs: 3.5, shape: "hex" },
    { t: "Turntable Camera Rig, geared", a: "orbitmill", p: "fdm", m: "PLA", likes: 3110, dl: 9820, lh: 0.16, hrs: 7, shape: "gear" },
    { t: "Flex Wrist Rest, honeycomb infill", a: "softshellco", p: "fdm", m: "TPU", likes: 2740, dl: 7410, lh: 0.24, hrs: 5, shape: "wave" },
    { t: "Miniature Lighthouse, 32 mm scale", a: "tidecast", p: "resin", m: "Resin", likes: 6190, dl: 21400, lh: 0.04, hrs: 9, shape: "tower" },
    { t: "Filament Dry Box Latch Kit", a: "spoolsmith", p: "fdm", m: "PETG", likes: 1890, dl: 12030, lh: 0.20, hrs: 2, shape: "box" },
    { t: "Planetary Pen Silo, 4 slots", a: "gearpocket", p: "fdm", m: "PLA", likes: 5310, dl: 16880, lh: 0.16, hrs: 6, shape: "gear" },
    { t: "Vase-mode Lantern, twist shell", a: "lumenlathe", p: "fdm", m: "PLA", likes: 7420, dl: 26510, lh: 0.28, hrs: 4, shape: "vase" },
    { t: "Articulated Desk Dragon, print-in-place", a: "scalesmith", p: "fdm", m: "PLA", likes: 9840, dl: 41220, lh: 0.20, hrs: 11, shape: "chain" },
    { t: "Resin Bust — Wanderer, hollowed", a: "tidecast", p: "resin", m: "Resin", likes: 4460, dl: 13750, lh: 0.03, hrs: 14, shape: "tower" },
    { t: "TPU Camera Bumper, 3 mm shell", a: "softshellco", p: "fdm", m: "TPU", likes: 1320, dl: 4980, lh: 0.24, hrs: 3, shape: "box" },
    { t: "Headphone Arm, clamp mount", a: "voxelwren", p: "fdm", m: "PETG", likes: 3980, dl: 15640, lh: 0.20, hrs: 4, shape: "arm" },
    { t: "Micro Terrain Tiles, 24-pack", a: "orbitmill", p: "resin", m: "Resin", likes: 2210, dl: 8110, lh: 0.05, hrs: 8, shape: "hex" },
    { t: "Snap-fit Drawer Grid, 42 mm", a: "gearpocket", p: "fdm", m: "PLA", likes: 5620, dl: 29310, lh: 0.20, hrs: 2, shape: "box" },
    { t: "Bearing-free Fidget Spinner", a: "spoolsmith", p: "fdm", m: "PLA", likes: 2870, dl: 10240, lh: 0.16, hrs: 1, shape: "gear" },
    { t: "Wall Spool Cradle, 1 kg rated", a: "lumenlathe", p: "fdm", m: "PETG", likes: 3340, dl: 11760, lh: 0.24, hrs: 6, shape: "arm" }
  ];

  var PALETTES = {
    hex: ["#ff7a1a", "#ffb066"], gear: ["#22c8d8", "#7ae4ee"],
    wave: ["#ff9d4d", "#ffd0a3"], tower: ["#8fd6ff", "#d5efff"],
    box: ["#ff7a1a", "#ffcf9e"], vase: ["#22c8d8", "#b6f2f8"],
    chain: ["#ffa04d", "#ffd9b3"], arm: ["#5fd8e4", "#c9f4f8"]
  };

  var uid = 0;
  function plateSVG(shape, seed) {
    var pal = PALETTES[shape] || PALETTES.box;
    var id = "g" + (++uid);
    var body = {
      hex: '<path d="M0 -34 L30 -17 L30 17 L0 34 L-30 17 L-30 -17 Z" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.6"/><path d="M0 -34 L0 0 L-30 17 M0 0 L30 17" stroke="' + pal[1] + '" stroke-width="1.2" fill="none" opacity=".8"/>',
      gear: '<circle r="30" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.8"/><circle r="12" fill="none" stroke="' + pal[1] + '" stroke-width="1.6"/><g stroke="' + pal[0] + '" stroke-width="3">' +
        [0, 45, 90, 135, 180, 225, 270, 315].map(function (d) {
          var r = d * Math.PI / 180;
          return '<line x1="' + (Math.cos(r) * 30).toFixed(1) + '" y1="' + (Math.sin(r) * 30 * 0.55).toFixed(1) + '" x2="' + (Math.cos(r) * 38).toFixed(1) + '" y2="' + (Math.sin(r) * 38 * 0.55).toFixed(1) + '"/>';
        }).join("") + "</g>",
      wave: '<path d="M-38 12 C-20 -22 -6 26 8 -8 C20 -34 32 6 40 -6 L40 24 L-38 24 Z" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.6"/>',
      tower: '<path d="M-14 34 L-8 -30 L8 -30 L14 34 Z" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.6"/><path d="M-11 6 H11 M-9 -12 H9" stroke="' + pal[1] + '" stroke-width="1.4"/><circle cy="-36" r="7" fill="none" stroke="' + pal[1] + '" stroke-width="1.6"/>',
      box: '<path d="M0 -30 L34 -12 L34 16 L0 34 L-34 16 L-34 -12 Z" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.6"/><path d="M-34 -12 L0 6 L34 -12 M0 6 L0 34" stroke="' + pal[1] + '" stroke-width="1.3" fill="none"/>',
      vase: '<path d="M-16 34 C-30 6 -6 -6 -12 -32 L12 -32 C6 -6 30 6 16 34 Z" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.6"/><path d="M-18 18 H18 M-14 2 H14" stroke="' + pal[1] + '" stroke-width="1.1" opacity=".8"/>',
      chain: [0, 1, 2, 3].map(function (i) {
        return '<ellipse cx="' + (-27 + i * 18) + '" cy="' + (10 - i * 8) + '" rx="12" ry="8" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.5"/>';
      }).join(""),
      arm: '<path d="M-30 30 L-30 16 L-4 -6 L-4 -26" fill="none" stroke="' + pal[0] + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M-4 -26 L26 -26" stroke="' + pal[1] + '" stroke-width="5" stroke-linecap="round"/><rect x="-38" y="28" width="20" height="8" rx="3" fill="url(#f' + id + ')" stroke="' + pal[0] + '" stroke-width="1.4"/>'
    }[shape];

    return '<svg viewBox="0 0 200 150" role="img" aria-label="Isometric render of the model">' +
      '<defs>' +
      '<radialGradient id="p' + id + '" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#2b3542"/><stop offset="1" stop-color="#10141a"/></radialGradient>' +
      '<linearGradient id="f' + id + '" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="' + pal[1] + '" stop-opacity=".5"/><stop offset="1" stop-color="' + pal[0] + '" stop-opacity=".18"/></linearGradient>' +
      '</defs>' +
      '<rect width="200" height="150" fill="url(#p' + id + ')"/>' +
      '<g opacity=".35" stroke="#22c8d8" stroke-width=".5">' +
      '<path d="M0 108 L100 150 L200 108 M0 96 L100 138 L200 96 M0 120 L100 162 L200 120"/></g>' +
      '<ellipse cx="100" cy="112" rx="56" ry="16" fill="#000" opacity=".45"/>' +
      '<g transform="translate(100 ' + (72 + (seed % 5)) + ')">' + body + "</g>" +
      "</svg>";
  }

  function fmt(n) {
    return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);
  }
  function hue(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }
  function avatar(name, cls) {
    return '<span class="avatar ' + (cls || "") + '" aria-hidden="true" style="background:linear-gradient(150deg,hsl(' +
      hue(name) + ' 78% 62%),hsl(' + ((hue(name) + 48) % 360) + ' 78% 52%))">' +
      name.slice(0, 2).toUpperCase() + "</span>";
  }

  /* ---------------- render grid ---------------- */
  var grid = document.getElementById("grid");
  var emptyEl = document.getElementById("empty");
  var resultsEl = document.getElementById("results");

  MODELS.forEach(function (m, i) {
    var card = document.createElement("article");
    card.className = "card";
    card.dataset.printer = m.p;
    card.dataset.mat = m.m;
    card.dataset.hrs = String(m.hrs);
    card.dataset.title = m.t.toLowerCase() + " " + m.a.toLowerCase();
    card.innerHTML =
      '<div class="plate">' + plateSVG(m.shape, i) +
        '<div class="plate-badges"><span class="tag ' + m.p + '">' + m.p.toUpperCase() + '</span>' +
        '<span class="tag">' + m.m + "</span></div>" +
        '<div class="dl-layer"><button class="dl-btn" type="button">Download STL</button></div>' +
        '<i class="prog" aria-hidden="true"></i>' +
      "</div>" +
      '<div class="card-body">' +
        '<h3 class="card-title">' + m.t + "</h3>" +
        '<div class="author">' + avatar(m.a) + '<span class="author-name">@' + m.a + "</span></div>" +
        '<div class="metrics">' +
          '<button class="like" type="button" aria-pressed="false" aria-label="Like ' + m.t + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.65-7 9-7 9z" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
            '<b class="mono" style="font-weight:600">' + fmt(m.likes) + "</b></button>" +
          '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
            '<span class="mono">' + fmt(m.dl) + "</span></span>" +
          '<span class="spec">' + m.lh.toFixed(2) + "mm · " + m.hrs + "h</span>" +
        "</div>" +
      "</div>";
    grid.appendChild(card);
  });

  /* reveal on scroll */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px" });
    grid.querySelectorAll(".card").forEach(function (c) { io.observe(c); });
  } else {
    grid.querySelectorAll(".card").forEach(function (c) { c.classList.add("in"); });
  }

  /* ---------------- filtering ---------------- */
  var state = { printer: "all", mats: ["PLA", "PETG", "TPU", "Resin"], maxHrs: 24, q: "" };

  function apply() {
    var shown = 0;
    grid.querySelectorAll(".card").forEach(function (c) {
      var ok =
        (state.printer === "all" || c.dataset.printer === state.printer) &&
        state.mats.indexOf(c.dataset.mat) !== -1 &&
        Number(c.dataset.hrs) <= state.maxHrs &&
        (!state.q || c.dataset.title.indexOf(state.q) !== -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    resultsEl.textContent = "Showing " + shown + " of " + MODELS.length + " models";
    emptyEl.hidden = shown !== 0;
  }

  document.getElementById("printerPills").addEventListener("click", function (e) {
    var b = e.target.closest(".pill");
    if (!b) return;
    this.querySelectorAll(".pill").forEach(function (p) {
      p.classList.toggle("is-on", p === b);
      p.setAttribute("aria-pressed", String(p === b));
    });
    state.printer = b.dataset.printer;
    apply();
  });

  document.getElementById("matPills").addEventListener("click", function (e) {
    var b = e.target.closest(".pill");
    if (!b) return;
    var on = !b.classList.contains("is-on");
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-pressed", String(on));
    state.mats = Array.prototype.map.call(this.querySelectorAll(".pill.is-on"), function (p) { return p.dataset.mat; });
    apply();
  });

  var range = document.getElementById("timeRange");
  var timeVal = document.getElementById("timeVal");
  range.addEventListener("input", function () {
    state.maxHrs = Number(this.value);
    timeVal.textContent = state.maxHrs >= 24 ? "24 h" : state.maxHrs + " h";
    apply();
  });

  var q = document.getElementById("q");
  q.addEventListener("input", function () { state.q = this.value.trim().toLowerCase(); apply(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus(); }
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    state = { printer: "all", mats: ["PLA", "PETG", "TPU", "Resin"], maxHrs: 24, q: "" };
    q.value = ""; range.value = 24; timeVal.textContent = "24 h";
    document.querySelectorAll("#printerPills .pill").forEach(function (p) {
      var on = p.dataset.printer === "all";
      p.classList.toggle("is-on", on); p.setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll("#matPills .pill").forEach(function (p) {
      p.classList.add("is-on"); p.setAttribute("aria-pressed", "true");
    });
    apply();
    toast("Filters reset — all 15 models visible.", "cy");
  });

  /* ---------------- likes + downloads ---------------- */
  grid.addEventListener("click", function (e) {
    var like = e.target.closest(".like");
    if (like) {
      var b = like.querySelector("b");
      if (!b.dataset.orig) b.dataset.orig = b.textContent;
      var on = !like.classList.contains("on");
      like.classList.toggle("on", on);
      like.setAttribute("aria-pressed", String(on));
      b.textContent = on ? b.dataset.orig + " +1" : b.dataset.orig;
      if (on) toast("Saved to your likes.", "ok");
      return;
    }
    var dl = e.target.closest(".dl-btn");
    if (!dl) return;
    var card = dl.closest(".card");
    var bar = card.querySelector(".prog");
    if (dl.disabled) return;
    dl.disabled = true;
    var label = dl.textContent;
    var pct = 0;
    var tick = setInterval(function () {
      pct = Math.min(100, pct + 8 + Math.random() * 14);
      bar.style.width = pct + "%";
      dl.textContent = "Downloading " + Math.round(pct) + "%";
      if (pct >= 100) {
        clearInterval(tick);
        dl.textContent = "Done ✓";
        toast('"' + card.querySelector(".card-title").textContent + '" added to your plate queue.', "ok");
        setTimeout(function () {
          bar.style.width = "0%"; dl.textContent = label; dl.disabled = false;
        }, 1400);
      }
    }, 160);
  });

  document.getElementById("uploadBtn").addEventListener("click", function () {
    toast("Upload wizard is a demo stub — drop your STL and slicer profile here.", "cy");
  });
  document.querySelector(".chip-points").addEventListener("click", function () {
    toast("4,820 maker points · 180 more unlocks the Resin badge.", "cy");
  });
  document.getElementById("enterBtn").addEventListener("click", function () {
    toast("Entry slot reserved for the Desk Ecosystem Challenge.", "ok");
  });

  /* ---------------- countdown ---------------- */
  var deadline = Date.now() + (6 * 24 + 9) * 3600e3 + 42 * 60e3 + 18e3;
  var cd = document.getElementById("countdown");
  function pad(n) { return String(n).padStart(2, "0"); }
  function tickCd() {
    var ms = Math.max(0, deadline - Date.now());
    var s = Math.floor(ms / 1000);
    cd.querySelector('[data-cd="d"]').textContent = pad(Math.floor(s / 86400));
    cd.querySelector('[data-cd="h"]').textContent = pad(Math.floor(s / 3600) % 24);
    cd.querySelector('[data-cd="m"]').textContent = pad(Math.floor(s / 60) % 60);
    cd.querySelector('[data-cd="s"]').textContent = pad(s % 60);
  }
  tickCd();
  setInterval(tickCd, 1000);

  /* ---------------- fresh makes ---------------- */
  var MAKES = [
    { model: "Vase-mode Lantern", who: "printhaus_ana", cmt: "Ran it at 0.28 mm in translucent PLA — the twist catches an LED puck beautifully. Zero supports.", shape: "vase", meta: "PLA · 4h 12m · 2 h AGO" },
    { model: "Articulated Desk Dragon", who: "benchy_bram", cmt: "Print-in-place joints freed up with a gentle twist. Scaled to 140% and it still moves.", shape: "chain", meta: "PLA · 13h 40m · 5 h AGO" },
    { model: "Hex Cable Tray", who: "wattnest", cmt: "Six tiles under the desk, snapped together dry. PETG survived a hot room all summer.", shape: "hex", meta: "PETG · 3h 30m · 9 h AGO" },
    { model: "Micro Terrain Tiles", who: "tabletop_ivy", cmt: "Resin caught every chisel mark. Washed 6 min, cured 3 — no warping on the thin edges.", shape: "hex", meta: "RESIN · 8h 05m · 1 d AGO" }
  ];
  var makesRow = document.getElementById("makesRow");
  MAKES.forEach(function (mk, i) {
    var el = document.createElement("article");
    el.className = "make";
    el.innerHTML =
      '<div class="make-plate">' + plateSVG(mk.shape, i + 3) + "</div>" +
      '<div class="make-body"><h3>' + mk.model + "</h3>" +
      '<p class="who">@' + mk.who + "</p>" +
      '<p class="cmt">' + mk.cmt + "</p>" +
      '<p class="meta">' + mk.meta + "</p></div>";
    makesRow.appendChild(el);
  });

  /* ---------------- leaderboard ---------------- */
  var LEADERS = [
    { n: "voxelwren", pts: 42180, models: 96, makes: 3120 },
    { n: "gearpocket", pts: 38640, models: 74, makes: 2810 },
    { n: "tidecast", pts: 35110, models: 58, makes: 2440 },
    { n: "lumenlathe", pts: 29870, models: 61, makes: 1990 },
    { n: "softshellco", pts: 24350, models: 44, makes: 1520 },
    { n: "spoolsmith", pts: 21090, models: 39, makes: 1310 }
  ];
  var leaders = document.getElementById("leaders");
  var top = LEADERS[0].pts;
  LEADERS.forEach(function (l, i) {
    var medal = i < 3 ? ["gold", "silver", "bronze"][i] : "";
    var li = document.createElement("li");
    li.className = "leader";
    li.innerHTML =
      (medal
        ? '<span class="medal ' + medal + ' mono rank" style="width:26px;height:26px">' + (i + 1) + "</span>"
        : '<span class="rank">' + (i + 1) + "</span>") +
      avatar(l.n) +
      '<span><span class="lname">@' + l.n + '</span><br><span class="lmeta">' + l.models + " models · " + fmt(l.makes) + " makes</span></span>" +
      '<span class="bar" aria-hidden="true"><i style="width:' + Math.round((l.pts / top) * 100) + '%"></i></span>' +
      '<span class="lpts"><strong>' + l.pts.toLocaleString("en-US") + "</strong><span>PTS</span></span>";
    leaders.appendChild(li);
  });

  apply();
})();
