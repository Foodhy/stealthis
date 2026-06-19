(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
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

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    menu.hidden = !open;
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  }
  burger.addEventListener("click", function () {
    setMenu(menu.hidden);
  });
  menu.querySelectorAll("a, .mm-cta").forEach(function (el) {
    el.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- Default date = today ---------- */
  var dateInput = document.getElementById("date");
  if (dateInput) {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    dateInput.value = d.toISOString().slice(0, 10);
    dateInput.min = new Date().toISOString().slice(0, 10);
  }

  /* ---------- Hero search ---------- */
  var form = document.getElementById("searchForm");
  var fromEl = document.getElementById("from");
  var toEl = document.getElementById("to");
  document.getElementById("swap").addEventListener("click", function () {
    var t = fromEl.value;
    fromEl.value = toEl.value;
    toEl.value = t;
    toast("Swapped — now flying " + fromEl.value + " → " + toEl.value);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!fromEl.value.trim() || !toEl.value.trim()) {
      toast("Pick a from and to airport first.");
      return;
    }
    if (fromEl.value.trim() === toEl.value.trim()) {
      toast("Origin and destination can't match.");
      return;
    }
    toast("Found 6 hops " + code(fromEl.value) + " → " + code(toEl.value) + " for " + (dateInput.value || "soon"));
  });
  function code(v) {
    var m = /\(([A-Z]{3})\)/.exec(v);
    return m ? m[1] : v;
  }

  /* ---------- Hero boarding countdown ---------- */
  var countEl = document.getElementById("heroCount");
  var heroStatus = document.getElementById("heroStatus");
  var secs = 4 * 60 + 32;
  setInterval(function () {
    if (secs <= 0) {
      countEl.textContent = "Now";
      heroStatus.textContent = "Final call";
      return;
    }
    secs--;
    var m = String(Math.floor(secs / 60)).padStart(2, "0");
    var s = String(secs % 60).padStart(2, "0");
    countEl.textContent = m + ":" + s;
  }, 1000);

  /* ---------- Routes data ---------- */
  var ROUTES = {
    HBR: {
      label: "Harbor Bay",
      spokes: [
        { code: "PNR", name: "Pine Ridge", min: 45, price: 49, daily: 5 },
        { code: "MPC", name: "Maple Cove", min: 35, price: 39, daily: 6 },
        { code: "WLC", name: "Willow Creek", min: 55, price: 59, daily: 3 },
        { code: "GRH", name: "Granite Hills", min: 50, price: 55, daily: 4 }
      ]
    },
    LKS: {
      label: "Lakeshore",
      spokes: [
        { code: "CDF", name: "Cedar Falls", min: 40, price: 45, daily: 5 },
        { code: "MPC", name: "Maple Cove", min: 30, price: 35, daily: 7 },
        { code: "HBR", name: "Harbor Bay", min: 48, price: 52, daily: 4 }
      ]
    },
    CDF: {
      label: "Cedar Falls",
      spokes: [
        { code: "LKS", name: "Lakeshore", min: 40, price: 45, daily: 5 },
        { code: "GRH", name: "Granite Hills", min: 38, price: 42, daily: 4 },
        { code: "PNR", name: "Pine Ridge", min: 60, price: 64, daily: 2 }
      ]
    }
  };

  var rowsEl = document.getElementById("routeRows");
  var tabsEl = document.getElementById("routeTabs");
  var activeHub = "HBR";

  function renderRows(hub) {
    var data = ROUTES[hub];
    rowsEl.innerHTML = "";
    data.spokes.forEach(function (sp) {
      var li = document.createElement("li");
      li.className = "route-row";
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.innerHTML =
        '<span class="route-pair tnum">' + hub + ' <span class="arr">→</span> ' + sp.code + "</span>" +
        '<span class="route-info"><span class="dest">' + sp.name + '</span>' +
        '<span class="det tnum">' + sp.min + " min · " + sp.daily + " hops/day</span></span>" +
        '<span class="route-price tnum">$' + sp.price + "<small>one way</small></span>";
      li.addEventListener("click", function () {
        toast("Hop " + hub + " → " + sp.code + " from $" + sp.price + " — opening times");
      });
      li.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); li.click(); }
      });
      rowsEl.appendChild(li);
    });
    drawMap(hub);
  }

  tabsEl.querySelectorAll(".rt-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabsEl.querySelectorAll(".rt-tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      activeHub = tab.dataset.hub;
      renderRows(activeHub);
    });
  });

  /* ---------- Map drawing ---------- */
  var COORDS = {
    HBR: { x: 110, y: 150 }, PNR: { x: 300, y: 70 }, MPC: { x: 250, y: 200 },
    WLC: { x: 330, y: 250 }, GRH: { x: 200, y: 280 }, LKS: { x: 90, y: 70 },
    CDF: { x: 200, y: 130 }
  };
  var linesG = document.getElementById("mapLines");
  var nodesG = document.getElementById("mapNodes");
  var SVGNS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function drawMap(hub) {
    linesG.innerHTML = "";
    nodesG.innerHTML = "";
    var hubC = COORDS[hub];
    var connected = ROUTES[hub].spokes.map(function (s) { return s.code; });

    // lines from hub to each spoke
    connected.forEach(function (sc) {
      var c = COORDS[sc];
      var ln = el("line", { x1: hubC.x, y1: hubC.y, x2: c.x, y2: c.y });
      linesG.appendChild(ln);
    });

    // all nodes
    Object.keys(COORDS).forEach(function (codeKey) {
      var c = COORDS[codeKey];
      var isHub = codeKey === hub;
      var isConn = connected.indexOf(codeKey) !== -1;
      var g = el("g", { class: "map-node " + (isHub ? "hub" : "spoke") + (!isHub && !isConn ? " dim" : "") });
      g.appendChild(el("circle", { cx: c.x, cy: c.y, r: isHub ? 11 : 7 }));
      var txt = el("text", { x: c.x, y: c.y - 14, "text-anchor": "middle" });
      txt.textContent = codeKey;
      g.appendChild(txt);
      if (!isHub) {
        g.style.cursor = "pointer";
        g.addEventListener("click", function () {
          if (isConn) toast("Hop " + hub + " → " + codeKey + " — see fares below");
          else toast("No direct hop yet — switch hubs to reach " + codeKey);
        });
      }
      nodesG.appendChild(g);
    });
  }

  renderRows(activeHub);

  /* ---------- Fare picker ---------- */
  document.querySelectorAll(".fare-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast(btn.dataset.fare + " selected — building your hop");
    });
  });

  /* ---------- Misc CTAs ---------- */
  document.getElementById("signin").addEventListener("click", function () {
    toast("Sign in — welcome back to SkyHop");
  });
  document.getElementById("bookNav").addEventListener("click", function () {
    document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
    setTimeout(function () { fromEl.focus(); }, 500);
  });
  document.querySelectorAll(".store").forEach(function (b) {
    b.addEventListener("click", function () { toast("App download link sent to your phone"); });
  });
})();
