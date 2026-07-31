(function () {
  "use strict";

  /* ---------------- toast ---------------- */
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

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------------- data ---------------- */
  var PROJECTS = [
    { t: "Reflow hot plate from a thrifted griddle", a: "pixelbramble", ini: "PB", ch: "circuits", views: 41230, favs: 1880, art: "art-a", steps: 12, tall: true, badge: "Editor pick", q: "PID control, thermocouple mount, and a firmware profile for lead-free paste." },
    { t: "Folding workbench that hides in a doorway", a: "benchgrit", ini: "BG", ch: "workshop", views: 68410, favs: 3120, art: "art-b", steps: 9, q: "Two hinges, one torsion box, and a wall cleat rated for 90 kg." },
    { t: "Block-printed tea towels with a carved lino set", a: "kilnkate", ini: "KK", ch: "craft", views: 22740, favs: 1410, art: "art-c", steps: 7, q: "Registration jig keeps the second colour from drifting." },
    { t: "Cast iron focaccia with a 24-hour cold ferment", a: "sourdotto", ini: "SD", ch: "cooking", views: 91020, favs: 5240, art: "art-d", steps: 8, tall: true, badge: "Contest", q: "Hydration table, dimple technique, and a rosemary-brine finish." },
    { t: "Balcony rain barrel with a first-flush diverter", a: "greenjoist", ini: "GJ", ch: "living", views: 30110, favs: 1220, art: "art-e", steps: 11, q: "Mosquito screen, overflow routing, and a winter drain valve." },
    { t: "Nixie-style clock using seven-segment filaments", a: "marloreef", ini: "MR", ch: "circuits", views: 55340, favs: 2760, art: "art-f", steps: 15, q: "High-voltage warning notes plus a safer 12V filament alternative." },
    { t: "Hand-cut dovetail box from offcut walnut", a: "benchgrit", ini: "BG", ch: "workshop", views: 27890, favs: 1640, art: "art-g", steps: 10, tall: true, q: "Saw angle guide printed on card stock — no expensive jig." },
    { t: "Punch-needle wall hanging in three yarn weights", a: "kilnkate", ini: "KK", ch: "craft", views: 18420, favs: 990, art: "art-h", steps: 6, q: "Frame tensioning trick that stops monk's cloth from sagging." },
    { t: "Sheet-pan gnocchi with charred lemon", a: "sourdotto", ini: "SD", ch: "cooking", views: 47660, favs: 2980, art: "art-c", steps: 5, q: "One pan, 22 minutes, and a browning order that actually works." },
    { t: "Under-stair pull-out pantry on drawer slides", a: "greenjoist", ini: "GJ", ch: "living", views: 74210, favs: 4010, art: "art-b", steps: 14, badge: "Featured", q: "Load math for full-extension slides and a face-frame template." },
    { t: "Solar sensor node that sleeps for 11 months", a: "pixelbramble", ini: "PB", ch: "circuits", views: 36980, favs: 2210, art: "art-f", steps: 13, q: "Deep-sleep current budget measured with a shunt and a cheap meter." },
    { t: "Router sled to flatten a live-edge slab", a: "benchgrit", ini: "BG", ch: "workshop", views: 52400, favs: 2870, art: "art-g", steps: 8, tall: true, q: "Rails, shims, and a dust hood that keeps the shop breathable." },
    { t: "Marbled clay coasters fired in a tabletop kiln", a: "kilnkate", ini: "KK", ch: "craft", views: 20960, favs: 1180, art: "art-c", steps: 9, q: "Wedging pattern for clean veins and a cone-06 firing schedule." },
    { t: "Window herb ladder with wicking reservoirs", a: "greenjoist", ini: "GJ", ch: "living", views: 25330, favs: 1345, art: "art-e", steps: 7, q: "Capillary rope sizing so basil never sits in standing water." },
    { t: "Miso caramel popcorn in a stovetop kettle", a: "sourdotto", ini: "SD", ch: "cooking", views: 33770, favs: 2090, art: "art-d", steps: 6, q: "Sugar-stage temps and a stir rhythm that avoids scorching." },
    { t: "USB-C bench supply from a laptop brick", a: "marloreef", ini: "MR", ch: "circuits", views: 61250, favs: 3540, art: "art-a", steps: 16, badge: "Editor pick", q: "PD trigger board, fused output, and a printed banana-jack panel." }
  ];

  var CH_COLOR = {
    circuits: "var(--ch-circuits)",
    workshop: "var(--ch-workshop)",
    craft: "var(--ch-craft)",
    cooking: "var(--ch-cooking)",
    living: "var(--ch-living)"
  };
  var AVA = { circuits: "#6b4fd8", workshop: "#c8701f", craft: "#e8552d", cooking: "#0f8a8a", living: "#3d8a3d" };

  function fmt(n) { return n.toLocaleString("en-US"); }

  var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  var STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8Z"/></svg>';

  var grid = document.getElementById("grid");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("chanCount");
  var state = { channel: "all", sort: "recent", query: "" };

  function current() {
    var list = PROJECTS.filter(function (p) {
      if (state.channel !== "all" && p.ch !== state.channel) return false;
      if (state.query) {
        var hay = (p.t + " " + p.a + " " + p.ch).toLowerCase();
        if (hay.indexOf(state.query) === -1) return false;
      }
      return true;
    });
    if (state.sort === "views") list.sort(function (a, b) { return b.views - a.views; });
    else if (state.sort === "favs") list.sort(function (a, b) { return b.favs - a.favs; });
    return list;
  }

  function render() {
    var list = current();
    grid.innerHTML = "";
    emptyEl.hidden = list.length !== 0;
    countEl.textContent = list.length + (list.length === 1 ? " project" : " projects");

    list.forEach(function (p, i) {
      var el = document.createElement("article");
      el.className = "card" + (p.tall ? " tall" : "");
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", p.t + " by " + p.a);
      el.innerHTML =
        '<div class="strip" style="--c:' + CH_COLOR[p.ch] + '"></div>' +
        (p.badge ? '<span class="badge">' + p.badge + "</span>" : "") +
        '<div class="art ' + p.art + '">' +
          '<div class="quick"><p>' + p.q + "</p>" +
          '<span class="qbtn">' + p.steps + " steps · quick view</span></div>" +
        "</div>" +
        '<div class="card-body">' +
          "<h3>" + p.t + "</h3>" +
          '<div class="card-by"><span class="ava" style="--a:' + AVA[p.ch] + '">' + p.ini + "</span>@" + p.a + "</div>" +
          '<div class="card-foot mono">' +
            "<span>" + EYE + fmt(p.views) + "</span>" +
            "<span>" + STAR + fmt(p.favs) + "</span>" +
          "</div>" +
        "</div>";

      function open() { toast("Opening “" + p.t + "” — " + p.steps + " steps."); }
      el.addEventListener("click", open);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      grid.appendChild(el);
      // staggered reveal
      setTimeout(function () { el.classList.add("in"); }, Math.min(i, 14) * 45);
    });
  }

  /* ---------------- channel tabs ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".chan"), function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".chan").forEach(function (o) {
        o.classList.toggle("is-on", o === b);
        o.setAttribute("aria-selected", o === b ? "true" : "false");
      });
      state.channel = b.getAttribute("data-channel");
      render();
    });
  });

  /* ---------------- sorts ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".sort"), function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".sort").forEach(function (o) { o.classList.toggle("is-on", o === b); });
      state.sort = b.getAttribute("data-sort");
      render();
    });
  });

  /* ---------------- search ---------------- */
  var q = document.getElementById("q");
  var qTimer;
  q.addEventListener("input", function () {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () {
      state.query = q.value.trim().toLowerCase();
      render();
    }, 140);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus(); }
    if (e.key === "Escape" && document.activeElement === q) { q.value = ""; state.query = ""; render(); q.blur(); }
  });

  /* ---------------- hero favorite ---------------- */
  var fav = document.querySelector("[data-fav]");
  fav.setAttribute("aria-pressed", "false");
  fav.addEventListener("click", function () {
    var on = fav.getAttribute("aria-pressed") === "true";
    fav.setAttribute("aria-pressed", on ? "false" : "true");
    fav.textContent = on ? "Favorite" : "Favorited";
    toast(on ? "Removed from your locker." : "Added to your locker.");
  });

  /* ---------------- contest countdowns ---------------- */
  var counters = Array.prototype.map.call(document.querySelectorAll(".count"), function (el) {
    var parts = el.getAttribute("data-deadline").split(":").map(Number);
    var secs = parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
    return { el: el, secs: secs };
  });
  function unit(v, label) {
    return "<span><b>" + String(v).padStart(2, "0") + "</b><i>" + label + "</i></span>";
  }
  function tick() {
    counters.forEach(function (c) {
      if (c.secs > 0) c.secs -= 1;
      var s = c.secs;
      var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
          m = Math.floor((s % 3600) / 60), sec = s % 60;
      c.el.innerHTML = unit(d, "days") + unit(h, "hrs") + unit(m, "min") + unit(sec, "sec");
    });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- trending makers ---------------- */
  var MAKERS = [
    { n: "marloreef", i: "MR", c: "#0f8a8a", s: "312k views" },
    { n: "benchgrit", i: "BG", c: "#c8701f", s: "268k views" },
    { n: "sourdotto", i: "SD", c: "#8a5a2b", s: "244k views" },
    { n: "kilnkate", i: "KK", c: "#e8552d", s: "191k views" },
    { n: "pixelbramble", i: "PB", c: "#6b4fd8", s: "177k views" },
    { n: "greenjoist", i: "GJ", c: "#3d8a3d", s: "160k views" },
    { n: "tinbending", i: "TB", c: "#4a4642", s: "142k views" },
    { n: "glassnoodle", i: "GN", c: "#b0407a", s: "128k views" }
  ];
  var trendRow = document.getElementById("trendRow");
  MAKERS.forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tchip";
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = '<span class="ava" style="--a:' + m.c + '">' + m.i + "</span><span><b>@" + m.n + "</b><i>" + m.s + "</i></span>";
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", on ? "false" : "true");
      toast(on ? "Unfollowed @" + m.n + "." : "Following @" + m.n + ".");
    });
    trendRow.appendChild(b);
  });

  /* ---------------- newsletter validation ---------------- */
  var form = document.getElementById("newsForm");
  var email = document.getElementById("email");
  var err = document.getElementById("emailErr");
  var RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function validate(silent) {
    var v = email.value.trim();
    var msg = "";
    if (!v) msg = "Enter an email so we know where to send it.";
    else if (!RE.test(v)) msg = "That does not look like a valid address.";
    err.classList.remove("ok");
    err.textContent = silent && !v ? "" : msg;
    email.classList.toggle("bad", !!msg && !(silent && !v));
    email.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  email.addEventListener("input", function () { validate(true); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(false)) { email.focus(); return; }
    err.textContent = "You are in — first issue lands Thursday.";
    err.classList.add("ok");
    email.classList.remove("bad");
    email.value = "";
    toast("Subscribed to the MAKELOG weekly.");
  });

  render();
})();
