(function () {
  "use strict";

  var AGENTS = [
    { name: "Marisol Vega", specialties: ["auto", "home", "life"], rating: 4.9, reviews: 218, distance: 1.2, langs: ["English", "Spanish"], from: 36, color: "#2563eb", x: 30, y: 32 },
    { name: "David Okafor", specialties: ["health", "life"], rating: 4.8, reviews: 174, distance: 2.4, langs: ["English"], from: 42, color: "#15a06b", x: 64, y: 24 },
    { name: "Priya Nair", specialties: ["home", "business"], rating: 4.9, reviews: 301, distance: 3.1, langs: ["English", "Hindi"], from: 51, color: "#7c3aed", x: 46, y: 58 },
    { name: "Caleb Brooks", specialties: ["auto", "business"], rating: 4.6, reviews: 96, distance: 0.8, langs: ["English"], from: 29, color: "#f59e0b", x: 22, y: 66 },
    { name: "Yuki Tanaka", specialties: ["life", "health", "home"], rating: 4.7, reviews: 142, distance: 4.5, langs: ["English", "Japanese"], from: 39, color: "#0ea5e9", x: 74, y: 62 },
    { name: "Renata Costa", specialties: ["auto", "home", "health"], rating: 4.8, reviews: 188, distance: 5.6, langs: ["English", "Portuguese"], from: 33, color: "#db2777", x: 58, y: 40 }
  ];

  var SPEC_LABEL = { auto: "Auto", home: "Home", life: "Life", health: "Health", business: "Business" };

  var listEl = document.getElementById("agentList");
  var countEl = document.getElementById("resultCount");
  var emptyEl = document.getElementById("emptyState");
  var mapEl = document.getElementById("map");
  var locInput = document.getElementById("location");
  var specSelect = document.getElementById("specialty");
  var sortSelect = document.getElementById("sort");
  var form = document.getElementById("searchbar");

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function getFiltered() {
    var spec = specSelect.value;
    var rows = AGENTS.filter(function (a) {
      return spec === "all" || a.specialties.indexOf(spec) !== -1;
    });
    var sort = sortSelect.value;
    rows.sort(function (a, b) {
      if (sort === "distance") return a.distance - b.distance;
      if (sort === "reviews") return b.reviews - a.reviews;
      return b.rating - a.rating;
    });
    return rows;
  }

  function render() {
    var rows = getFiltered();
    var loc = locInput.value.trim() || "your area";

    countEl.textContent = rows.length + (rows.length === 1 ? " agent" : " agents") + " in " + loc;
    emptyEl.hidden = rows.length !== 0;

    listEl.innerHTML = rows.map(function (a, i) {
      var chips = a.specialties.map(function (s) {
        return '<span class="chip">' + SPEC_LABEL[s] + "</span>";
      }).join("");
      return (
        '<li class="agent" data-idx="' + i + '">' +
          '<span class="avatar" style="background:' + a.color + '">' + initials(a.name) + "</span>" +
          '<div class="agent__body">' +
            '<div class="agent__name">' + a.name +
              '<span class="agent__verify">' +
                '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>Licensed</span>' +
            "</div>" +
            '<div class="agent__line">' +
              '<span class="stars">&#9733; <b>' + a.rating.toFixed(1) + "</b> (" + a.reviews + ")</span>" +
              "<span>&#128205; " + a.distance.toFixed(1) + " mi</span>" +
              "<span>&#128172; " + a.langs.join(", ") + "</span>" +
            "</div>" +
            '<div class="chips">' + chips + "</div>" +
          "</div>" +
          '<div class="agent__actions">' +
            '<p class="agent__price">from <b>$' + a.from + "/mo</b></p>" +
            '<button type="button" class="btn btn--primary" data-contact="' + i + '">Contact</button>' +
            '<button type="button" class="btn btn--ghost" data-call="' + i + '">Call</button>' +
          "</div>" +
        "</li>"
      );
    }).join("");

    renderPins(rows);
    wireCards(rows);
  }

  function renderPins(rows) {
    mapEl.querySelectorAll(".pin").forEach(function (p) { p.remove(); });
    rows.forEach(function (a, i) {
      var pin = document.createElement("button");
      pin.type = "button";
      pin.className = "pin";
      pin.style.left = a.x + "%";
      pin.style.top = a.y + "%";
      pin.setAttribute("data-pin", i);
      pin.setAttribute("aria-label", "Show " + a.name + " on list");
      pin.innerHTML = "<span>" + (i + 1) + "</span>";
      mapEl.appendChild(pin);
    });
  }

  function setHot(idx, on) {
    var card = listEl.querySelector('.agent[data-idx="' + idx + '"]');
    var pin = mapEl.querySelector('.pin[data-pin="' + idx + '"]');
    if (card) card.classList.toggle("is-hot", on);
    if (pin) pin.classList.toggle("is-hot", on);
  }

  function wireCards(rows) {
    listEl.querySelectorAll(".agent").forEach(function (card) {
      var idx = card.getAttribute("data-idx");
      card.addEventListener("mouseenter", function () { setHot(idx, true); });
      card.addEventListener("mouseleave", function () { setHot(idx, false); });
    });
    mapEl.querySelectorAll(".pin").forEach(function (pin) {
      var idx = pin.getAttribute("data-pin");
      pin.addEventListener("mouseenter", function () { setHot(idx, true); });
      pin.addEventListener("mouseleave", function () { setHot(idx, false); });
      pin.addEventListener("click", function () {
        var card = listEl.querySelector('.agent[data-idx="' + idx + '"]');
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    listEl.querySelectorAll("[data-contact]").forEach(function (btn) {
      btn.addEventListener("click", function () { openDrawer(rows[+btn.getAttribute("data-contact")]); });
    });
    listEl.querySelectorAll("[data-call]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var a = rows[+btn.getAttribute("data-call")];
        btn.textContent = "(512) 555-0" + (100 + Math.floor(Math.random() * 800));
        setTimeout(function () { btn.textContent = "Call"; }, 4000);
      });
    });
  }

  /* ---- Drawer / contact form ---- */
  var drawer = document.getElementById("drawer");
  var dAvatar = document.getElementById("drawerAvatar");
  var dTitle = document.getElementById("drawerTitle");
  var dMeta = document.getElementById("drawerMeta");
  var cForm = document.getElementById("contactForm");
  var dDone = document.getElementById("drawerDone");
  var doneMsg = document.getElementById("doneMsg");
  var current = null;

  function openDrawer(agent) {
    current = agent;
    dAvatar.textContent = initials(agent.name);
    dAvatar.style.background = agent.color;
    dTitle.textContent = "Contact " + agent.name;
    dMeta.textContent = agent.specialties.map(function (s) { return SPEC_LABEL[s]; }).join(" · ") + " specialist";
    cForm.hidden = false;
    dDone.hidden = true;
    cForm.reset();
    clearErrors();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.getElementById("cName").focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function clearErrors() {
    cForm.querySelectorAll(".formrow").forEach(function (r) { r.classList.remove("has-error"); });
    cForm.querySelectorAll(".err").forEach(function (e) { e.textContent = ""; });
  }

  function setError(field, msg) {
    var input = cForm.querySelector('[name="' + field + '"]');
    var errEl = cForm.querySelector('[data-err="' + field + '"]');
    if (input) input.closest(".formrow").classList.add("has-error");
    if (errEl) errEl.textContent = msg;
  }

  cForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var name = cForm.name.value.trim();
    var email = cForm.email.value.trim();
    var msg = cForm.message.value.trim();
    var ok = true;

    if (name.length < 2) { setError("name", "Please enter your name."); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email address."); ok = false; }
    if (msg.length < 8) { setError("message", "Add a short note (at least 8 characters)."); ok = false; }
    if (!ok) return;

    cForm.hidden = true;
    dDone.hidden = false;
    doneMsg.textContent = (current ? current.name : "Your agent") + " will reach out to " + email + " within 1 business day.";
  });

  drawer.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ---- Wiring ---- */
  form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
  specSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  locInput.addEventListener("change", render);

  render();
})();
