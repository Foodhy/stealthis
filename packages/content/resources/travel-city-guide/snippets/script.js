(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var HOODS = [
    { id: "all", name: "All Porto Lumera" },
    { id: "marina", name: "Old Marina", x: 56, y: 230 },
    { id: "azulejo", name: "Azulejo Quarter", x: 150, y: 150 },
    { id: "miradouro", name: "Miradouro Heights", x: 262, y: 80 },
    { id: "mercado", name: "Mercado Sul", x: 110, y: 70 },
    { id: "praia", name: "Praia Dourada", x: 300, y: 270 }
  ];

  var CATS = [
    { id: "eat", label: "Eat", icon: "🍽" },
    { id: "drink", label: "Drink", icon: "🍷" },
    { id: "see", label: "See", icon: "🏛" },
    { id: "stay", label: "Stay", icon: "🛏" },
    { id: "shop", label: "Shop", icon: "🛍" }
  ];

  var SPOTS = [
    { id: "s1", name: "Casa Sardinha", hood: "marina", cat: "eat", rating: 4.8, price: 2, time: "Dinner", grad: "linear-gradient(135deg,#e8623f,#9c5a52)", desc: "Charcoal-grilled sardines on a quay that smells of salt and citrus." },
    { id: "s2", name: "Doca Vermelha", hood: "marina", cat: "drink", rating: 4.6, price: 2, time: "Sunset", grad: "linear-gradient(135deg,#f0a374,#d97a57)", desc: "Vermouth bar in a former net store; harbour light pours through the doors." },
    { id: "s3", name: "Farol Velho", hood: "marina", cat: "see", rating: 4.5, price: 1, time: "Morning", grad: "linear-gradient(135deg,#1f8a8a,#166a6a)", desc: "Climb the old lighthouse for the cleanest view of the working docks." },
    { id: "s4", name: "Tile & Lime Atelier", hood: "azulejo", cat: "shop", rating: 4.7, price: 2, time: "Afternoon", grad: "linear-gradient(135deg,#1aa0a0,#1f8a8a)", desc: "Hand-painted azulejo tiles fired on-site; ship a single square home." },
    { id: "s5", name: "Pátio das Letras", hood: "azulejo", cat: "drink", rating: 4.4, price: 1, time: "Anytime", grad: "linear-gradient(135deg,#caa477,#9c7a4f)", desc: "Leafy courtyard café for galão and almond cake between bookshops." },
    { id: "s6", name: "Igreja do Sal", hood: "azulejo", cat: "see", rating: 4.9, price: 1, time: "Morning", grad: "linear-gradient(135deg,#6b6259,#241f1a)", desc: "A blue-tiled nave where every wall tells a sailor's story." },
    { id: "s7", name: "Mirador do Vento", hood: "miradouro", cat: "see", rating: 5.0, price: 1, time: "Sunset", grad: "linear-gradient(135deg,#f6c89a,#e8623f)", desc: "The terrace locals swear by — the whole bay turns copper at dusk." },
    { id: "s8", name: "Refúgio Heights", hood: "miradouro", cat: "stay", rating: 4.8, price: 3, time: "Stay", grad: "linear-gradient(135deg,#9c7a4f,#caa477)", desc: "Seven cliff rooms with shutters that frame the lighthouse beam." },
    { id: "s9", name: "Vinho & Vista", hood: "miradouro", cat: "drink", rating: 4.6, price: 2, time: "Sunset", grad: "linear-gradient(135deg,#d97a57,#9c5a52)", desc: "Rooftop wine room pouring crisp greens from the inland hills." },
    { id: "s10", name: "Mercado Sul Hall", hood: "mercado", cat: "eat", rating: 4.7, price: 1, time: "Lunch", grad: "linear-gradient(135deg,#e8623f,#d9a441)", desc: "Twelve stalls under iron arches — start with the octopus rice." },
    { id: "s11", name: "Forno da Avó", hood: "mercado", cat: "eat", rating: 4.9, price: 1, time: "Morning", grad: "linear-gradient(135deg,#d9a441,#caa477)", desc: "Wood-fired bakery; the custard tarts sell out by ten sharp." },
    { id: "s12", name: "Praça Verde", hood: "mercado", cat: "shop", rating: 4.3, price: 1, time: "Afternoon", grad: "linear-gradient(135deg,#a9cf9b,#1f8a8a)", desc: "Saturday flower-and-spice market spilling across the green square." },
    { id: "s13", name: "Areia Beach Club", hood: "praia", cat: "drink", rating: 4.5, price: 2, time: "Afternoon", grad: "linear-gradient(135deg,#bfe3df,#1aa0a0)", desc: "Striped loungers, cold ginja, and a DJ who reads the tide." },
    { id: "s14", name: "Dunas Guesthouse", hood: "praia", cat: "stay", rating: 4.6, price: 2, time: "Stay", grad: "linear-gradient(135deg,#f6c89a,#caa477)", desc: "Whitewashed rooms a barefoot walk from the golden strand." },
    { id: "s15", name: "Cabana do Polvo", hood: "praia", cat: "eat", rating: 4.8, price: 2, time: "Lunch", grad: "linear-gradient(135deg,#1f8a8a,#e8623f)", desc: "Sand-floor shack serving the day's catch with charred lemon." }
  ];

  /* ---------- State ---------- */
  var state = { hood: "all", cat: "all", trip: [] };

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function hoodName(id) {
    for (var i = 0; i < HOODS.length; i++) if (HOODS[i].id === id) return HOODS[i].name;
    return id;
  }
  function priceMark(n) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? "" : "off") + '">€</span>';
    return s;
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  function filtered() {
    return SPOTS.filter(function (s) {
      var okHood = state.hood === "all" || s.hood === state.hood;
      var okCat = state.cat === "all" || s.cat === state.cat;
      return okHood && okCat;
    });
  }

  /* ---------- Build chips ---------- */
  function buildHoods() {
    var box = $("#hoods");
    HOODS.forEach(function (h) {
      var b = el("button", "chip");
      b.type = "button";
      b.textContent = h.name;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", h.id === state.hood ? "true" : "false");
      b.dataset.hood = h.id;
      b.addEventListener("click", function () { setHood(h.id); });
      box.appendChild(b);
    });
  }

  function buildCats() {
    var box = $("#cats");
    var all = el("button", "cat");
    all.type = "button";
    all.innerHTML = "All";
    all.dataset.cat = "all";
    all.setAttribute("aria-pressed", "true");
    all.addEventListener("click", function () { setCat("all"); });
    box.appendChild(all);

    CATS.forEach(function (c) {
      var b = el("button", "cat");
      b.type = "button";
      b.innerHTML = '<span aria-hidden="true">' + c.icon + "</span> " + c.label;
      b.dataset.cat = c.id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { setCat(c.id); });
      box.appendChild(b);
    });
  }

  /* ---------- Build map pins ---------- */
  function buildPins() {
    var g = $("#pins");
    HOODS.filter(function (h) { return h.id !== "all"; }).forEach(function (h) {
      var pg = document.createElementNS("http://www.w3.org/2000/svg", "g");
      pg.setAttribute("class", "pin");
      pg.dataset.hood = h.id;
      pg.setAttribute("tabindex", "0");
      pg.setAttribute("role", "button");
      pg.setAttribute("aria-label", h.name);

      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", h.x);
      c.setAttribute("cy", h.y);
      c.setAttribute("r", "10");
      c.setAttribute("fill", "#1f8a8a");
      c.setAttribute("stroke", "#fff");
      c.setAttribute("stroke-width", "2");

      var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", h.x);
      t.setAttribute("y", h.y + 4);
      t.setAttribute("text-anchor", "middle");
      t.textContent = String(SPOTS.filter(function (s) { return s.hood === h.id; }).length);

      pg.appendChild(c);
      pg.appendChild(t);

      function activate() { setHood(state.hood === h.id ? "all" : h.id); }
      pg.addEventListener("click", activate);
      pg.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      });
      g.appendChild(pg);
    });
  }

  /* ---------- Render ---------- */
  function renderChips() {
    Array.prototype.forEach.call($("#hoods").children, function (b) {
      b.setAttribute("aria-selected", b.dataset.hood === state.hood ? "true" : "false");
    });
    Array.prototype.forEach.call($("#cats").children, function (b) {
      b.setAttribute("aria-pressed", b.dataset.cat === state.cat ? "true" : "false");
    });
  }

  function renderPins() {
    Array.prototype.forEach.call($("#pins").children, function (p) {
      var on = state.hood === "all" || p.dataset.hood === state.hood;
      p.classList.toggle("active", state.hood !== "all" && p.dataset.hood === state.hood);
      p.classList.toggle("dim", state.hood !== "all" && p.dataset.hood !== state.hood);
      p.setAttribute("aria-pressed", state.hood === p.dataset.hood ? "true" : "false");
      void on;
    });
  }

  function spotCard(s) {
    var li = el("li");
    var card = el("article", "card");

    var photo = el("div", "card__photo");
    photo.style.background = s.grad;
    photo.appendChild(el("span", "card__cat", catLabel(s.cat)));
    card.appendChild(photo);

    var body = el("div", "card__body");
    var top = el("div", "card__top");
    var nameWrap = el("div");
    nameWrap.appendChild(el("h3", "card__name", s.name));
    nameWrap.appendChild(el("p", "card__hood", "📍 " + hoodName(s.hood)));
    top.appendChild(nameWrap);

    var heart = el("button", "heart");
    heart.type = "button";
    var saved = state.trip.indexOf(s.id) > -1;
    heart.setAttribute("aria-pressed", saved ? "true" : "false");
    heart.setAttribute("aria-label", (saved ? "Remove " : "Add ") + s.name + " to your trip");
    heart.addEventListener("click", function () { toggleTrip(s.id); });
    top.appendChild(heart);
    body.appendChild(top);

    body.appendChild(el("p", "card__desc", s.desc));

    var meta = el("div", "card__meta");
    meta.appendChild(el("span", "rating", '<span class="star" aria-hidden="true">★</span> ' + s.rating.toFixed(1)));
    meta.appendChild(el("span", "price", priceMark(s.price)));
    meta.appendChild(el("span", "badge-time", s.time));
    var mapBtn = el("button", "card__maplink", "View on map →");
    mapBtn.type = "button";
    mapBtn.addEventListener("click", function () {
      setHood(s.hood);
      pulsePin(s.hood);
      toast("Highlighted " + hoodName(s.hood) + " on the map");
      var mapEl = $(".map");
      if (mapEl && mapEl.scrollIntoView) mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    meta.appendChild(mapBtn);
    body.appendChild(meta);

    card.appendChild(body);
    li.appendChild(card);
    return li;
  }

  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label;
    return id;
  }

  function pulsePin(hood) {
    var p = $('#pins [data-hood="' + hood + '"]');
    if (!p) return;
    p.classList.add("active");
  }

  function renderList() {
    var list = $("#poiList");
    list.innerHTML = "";
    var rows = filtered();
    $("#count").textContent = rows.length + (rows.length === 1 ? " spot" : " spots");
    $("#empty").hidden = rows.length > 0;
    rows.forEach(function (s) { list.appendChild(spotCard(s)); });
  }

  function renderRail() {
    var rail = $("#rail");
    rail.innerHTML = "";
    var rows = filtered().slice().sort(function (a, b) { return b.rating - a.rating; }).slice(0, 5);
    if (!rows.length) {
      rail.appendChild(el("li", "rail__sub", "Nothing to rank here yet."));
      return;
    }
    rows.forEach(function (s) {
      var li = el("li");
      var b = el("button", "rail__item");
      b.type = "button";
      b.innerHTML =
        '<span class="rail__rank" aria-hidden="true"></span>' +
        '<span class="rail__info">' +
        '<span class="rail__name">' + s.name + "</span>" +
        '<span class="rail__sub">' + hoodName(s.hood) + " · " + catLabel(s.cat) + "</span>" +
        "</span>" +
        '<span class="rail__score">★ ' + s.rating.toFixed(1) + "</span>";
      b.setAttribute("aria-label", s.name + ", " + s.rating.toFixed(1) + " stars, view on map");
      b.addEventListener("click", function () { setHood(s.hood); pulsePin(s.hood); });
      li.appendChild(b);
      rail.appendChild(li);
    });
  }

  function renderTrip() {
    var list = $("#tripList");
    var empty = $("#tripEmpty");
    list.innerHTML = "";
    empty.hidden = state.trip.length > 0;
    state.trip.forEach(function (id) {
      var s = SPOTS.filter(function (x) { return x.id === id; })[0];
      if (!s) return;
      var li = el("li", "trip__row");
      li.innerHTML =
        '<span class="nm">' + s.name + "</span>" +
        '<span class="hd">' + hoodName(s.hood) + "</span>";
      var rm = el("button", "trip__remove", "✕");
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + s.name + " from your trip");
      rm.addEventListener("click", function () { toggleTrip(id); });
      li.appendChild(rm);
      list.appendChild(li);
    });
  }

  /* ---------- Actions ---------- */
  function setHood(id) {
    state.hood = id;
    renderChips();
    renderPins();
    renderList();
    renderRail();
  }

  function setCat(id) {
    state.cat = id;
    renderChips();
    renderList();
    renderRail();
  }

  function toggleTrip(id) {
    var i = state.trip.indexOf(id);
    var s = SPOTS.filter(function (x) { return x.id === id; })[0];
    if (i > -1) {
      state.trip.splice(i, 1);
      toast("Removed " + (s ? s.name : "spot") + " from your trip");
    } else {
      state.trip.push(id);
      toast("Added " + (s ? s.name : "spot") + " to your trip");
    }
    renderList();
    renderTrip();
  }

  /* ---------- Init ---------- */
  buildHoods();
  buildCats();
  buildPins();
  renderChips();
  renderPins();
  renderList();
  renderRail();
  renderTrip();
})();
