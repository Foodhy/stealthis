(function () {
  "use strict";

  // ---------- Fictional dataset (~12 recipes) ----------
  var RECIPES = [
    {
      id: 1, title: "Charred Tomato Bucatini", cuisine: "Italian",
      diet: ["Vegetarian"], meal: "Dinner", time: 35, rating: 4.8, reviews: 214,
      serves: 4, emoji: "🍝", grad: "linear-gradient(135deg,#e8643c,#d6452b 70%)",
      desc: "Blistered cherry tomatoes, garlic confit, torn basil.", added: 1717200000000
    },
    {
      id: 2, title: "Street-Corn Tacos", cuisine: "Mexican",
      diet: ["Vegetarian", "Gluten-free"], meal: "Lunch", time: 25, rating: 4.7, reviews: 168,
      serves: 3, emoji: "🌮", grad: "linear-gradient(135deg,#e8a33d,#c8775a 75%)",
      desc: "Smoky charred corn, lime crema, cotija, chili.", added: 1718500000000
    },
    {
      id: 3, title: "Miso Salmon Donburi", cuisine: "Japanese",
      diet: ["High-protein"], meal: "Dinner", time: 30, rating: 4.9, reviews: 302,
      serves: 2, emoji: "🍣", grad: "linear-gradient(135deg,#c8775a,#7c8a6b 80%)",
      desc: "Glazed salmon, steamed rice, pickled ginger, scallion.", added: 1719000000000
    },
    {
      id: 4, title: "Golden Chana Masala", cuisine: "Indian",
      diet: ["Vegan", "Gluten-free", "High-protein"], meal: "Dinner", time: 40, rating: 4.6, reviews: 191,
      serves: 4, emoji: "🍛", grad: "linear-gradient(135deg,#e8a33d,#d6452b 78%)",
      desc: "Slow-spiced chickpeas, tomato, ginger, fresh cilantro.", added: 1716000000000
    },
    {
      id: 5, title: "Lemon-Herb Greek Bowl", cuisine: "Mediterranean",
      diet: ["Vegetarian", "Gluten-free"], meal: "Lunch", time: 20, rating: 4.5, reviews: 132,
      serves: 2, emoji: "🥗", grad: "linear-gradient(135deg,#7c8a6b,#e8a33d 85%)",
      desc: "Whipped feta, olives, cucumber, oregano-lemon dressing.", added: 1719500000000
    },
    {
      id: 6, title: "Buttermilk Stack Pancakes", cuisine: "American",
      diet: ["Vegetarian"], meal: "Breakfast", time: 18, rating: 4.7, reviews: 256,
      serves: 3, emoji: "🥞", grad: "linear-gradient(135deg,#e8a33d,#c8775a 70%)",
      desc: "Tall, fluffy stacks with maple butter and berries.", added: 1715000000000
    },
    {
      id: 7, title: "Forest Mushroom Risotto", cuisine: "Italian",
      diet: ["Vegetarian"], meal: "Dinner", time: 45, rating: 4.8, reviews: 178,
      serves: 4, emoji: "🍚", grad: "linear-gradient(135deg,#8a7f73,#5c534a 85%)",
      desc: "Creamy arborio, wild mushrooms, parmesan, thyme.", added: 1714000000000
    },
    {
      id: 8, title: "Crunchy Avocado Toast", cuisine: "American",
      diet: ["Vegan", "Vegetarian"], meal: "Breakfast", time: 12, rating: 4.4, reviews: 98,
      serves: 1, emoji: "🥑", grad: "linear-gradient(135deg,#7c8a6b,#a9b88e 85%)",
      desc: "Smashed avocado, chili crisp, radish, sea salt.", added: 1719800000000
    },
    {
      id: 9, title: "Spicy Tuna Onigiri", cuisine: "Japanese",
      diet: ["High-protein"], meal: "Lunch", time: 22, rating: 4.6, reviews: 144,
      serves: 2, emoji: "🍙", grad: "linear-gradient(135deg,#5c534a,#7c8a6b 80%)",
      desc: "Seasoned rice triangles, spicy tuna, toasted nori.", added: 1718000000000
    },
    {
      id: 10, title: "Salted Caramel Tartlets", cuisine: "Mediterranean",
      diet: ["Vegetarian"], meal: "Dessert", time: 55, rating: 4.9, reviews: 221,
      serves: 6, emoji: "🍮", grad: "linear-gradient(135deg,#c8775a,#e8a33d 80%)",
      desc: "Buttery shells, dark caramel, flaked Maldon salt.", added: 1713000000000
    },
    {
      id: 11, title: "Mango Sticky Rice", cuisine: "Mexican",
      diet: ["Vegan", "Vegetarian", "Gluten-free"], meal: "Dessert", time: 38, rating: 4.5, reviews: 87,
      serves: 4, emoji: "🥭", grad: "linear-gradient(135deg,#e8a33d,#7c8a6b 88%)",
      desc: "Coconut-sweet rice, ripe mango, toasted sesame.", added: 1717800000000
    },
    {
      id: 12, title: "Smoky Black Bean Chili", cuisine: "Mexican",
      diet: ["Vegan", "Gluten-free", "High-protein"], meal: "Dinner", time: 50, rating: 4.7, reviews: 203,
      serves: 6, emoji: "🌶️", grad: "linear-gradient(135deg,#d6452b,#b8351e 80%)",
      desc: "Three beans, smoked paprika, chipotle, lime finish.", added: 1716500000000
    }
  ];

  // ---------- State ----------
  var state = {
    q: "",
    cuisine: [], diet: [], meal: [],
    maxTime: 0,
    sort: "popular",
    saved: {}
  };

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  var grid = $("#grid");
  var empty = $("#empty");
  var countEl = $("#resultCount");
  var activeChips = $("#activeChips");

  var FACET_LABELS = { cuisine: "Cuisine", diet: "Diet", meal: "Meal" };

  // ---------- Toast ----------
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---------- Filtering + sort ----------
  function matches(r) {
    if (state.q) {
      var hay = (r.title + " " + r.cuisine + " " + r.desc + " " + r.diet.join(" ") + " " + r.meal).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    if (state.cuisine.length && state.cuisine.indexOf(r.cuisine) === -1) return false;
    if (state.meal.length && state.meal.indexOf(r.meal) === -1) return false;
    if (state.diet.length) {
      var ok = state.diet.every(function (d) { return r.diet.indexOf(d) !== -1; });
      if (!ok) return false;
    }
    if (state.maxTime && r.time > state.maxTime) return false;
    return true;
  }

  function sortList(list) {
    var copy = list.slice();
    if (state.sort === "popular") {
      copy.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
    } else if (state.sort === "quick") {
      copy.sort(function (a, b) { return a.time - b.time; });
    } else if (state.sort === "newest") {
      copy.sort(function (a, b) { return b.added - a.added; });
    }
    return copy;
  }

  function stars(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }

  function cardHTML(r) {
    var saved = !!state.saved[r.id];
    var badges = r.diet.map(function (d) { return '<span class="badge">' + d + "</span>"; }).join("");
    return (
      '<article class="card" data-id="' + r.id + '">' +
        '<div class="card-photo" style="background:' + r.grad + '">' +
          '<button class="heart" type="button" aria-pressed="' + saved + '" aria-label="Save ' + r.title + '">' +
            (saved ? "❤️" : "🤍") +
          "</button>" +
          '<span class="emoji" aria-hidden="true">' + r.emoji + "</span>" +
          '<span class="time-pill">⏱ ' + r.time + " min</span>" +
        "</div>" +
        '<div class="card-body">' +
          '<span class="card-cuisine">' + r.cuisine + "</span>" +
          '<h3 class="card-title">' + r.title + "</h3>" +
          '<p class="card-desc">' + r.desc + "</p>" +
          '<div class="badges">' + badges + "</div>" +
          '<div class="card-foot">' +
            '<span class="rating"><span class="stars" aria-hidden="true">' + stars(r.rating) + "</span>" +
              r.rating.toFixed(1) + ' <span class="num">(' + r.reviews + ")</span></span>" +
            '<span class="serves">Serves ' + r.serves + "</span>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var list = sortList(RECIPES.filter(matches));

    countEl.textContent =
      list.length + (list.length === 1 ? " recipe" : " recipes") +
      (hasFilters() ? " match your filters" : " in the cookbook");

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = list.map(cardHTML).join("");
    }
    renderActiveChips();
  }

  function hasFilters() {
    return !!(state.q || state.cuisine.length || state.diet.length || state.meal.length || state.maxTime);
  }

  function renderActiveChips() {
    var chips = [];
    if (state.q) chips.push({ facet: "q", value: state.q, label: '“' + state.q + '”' });
    ["cuisine", "diet", "meal"].forEach(function (f) {
      state[f].forEach(function (v) { chips.push({ facet: f, value: v, label: v }); });
    });
    if (state.maxTime) chips.push({ facet: "maxTime", value: state.maxTime, label: "≤ " + state.maxTime + " min" });

    activeChips.innerHTML = chips.map(function (c) {
      return '<span class="act-chip">' + c.label +
        '<button type="button" data-facet="' + c.facet + '" data-value="' + c.value +
        '" aria-label="Remove ' + c.label + '">✕</button></span>';
    }).join("");
  }

  // ---------- Active chip removal ----------
  activeChips.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var facet = btn.getAttribute("data-facet");
    var value = btn.getAttribute("data-value");
    if (facet === "q") {
      state.q = "";
      $("#searchInput").value = "";
      $("#searchClear").hidden = true;
    } else if (facet === "maxTime") {
      state.maxTime = 0;
      syncTimeChips();
    } else {
      state[facet] = state[facet].filter(function (v) { return v !== value; });
      syncCheckboxes(facet);
    }
    render();
  });

  // ---------- Save heart ----------
  grid.addEventListener("click", function (e) {
    var heart = e.target.closest(".heart");
    if (!heart) return;
    var id = +heart.closest(".card").getAttribute("data-id");
    state.saved[id] = !state.saved[id];
    heart.setAttribute("aria-pressed", String(!!state.saved[id]));
    heart.textContent = state.saved[id] ? "❤️" : "🤍";
    var r = RECIPES.filter(function (x) { return x.id === id; })[0];
    toast(state.saved[id] ? "Saved “" + r.title + "” to your recipe box" : "Removed from saved");
  });

  // ---------- Search ----------
  var searchInput = $("#searchInput");
  var searchClear = $("#searchClear");
  searchInput.addEventListener("input", function () {
    state.q = searchInput.value.trim();
    searchClear.hidden = !searchInput.value;
    render();
  });
  $("#searchForm").addEventListener("submit", function (e) { e.preventDefault(); });
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    state.q = "";
    searchClear.hidden = true;
    searchInput.focus();
    render();
  });

  // ---------- Checkbox facets ----------
  $$(".opts").forEach(function (group) {
    var facet = group.getAttribute("data-facet");
    group.addEventListener("change", function (e) {
      var cb = e.target;
      if (cb.checked) {
        if (state[facet].indexOf(cb.value) === -1) state[facet].push(cb.value);
      } else {
        state[facet] = state[facet].filter(function (v) { return v !== cb.value; });
      }
      render();
    });
  });

  function syncCheckboxes(facet) {
    $$('.opts[data-facet="' + facet + '"] input').forEach(function (cb) {
      cb.checked = state[facet].indexOf(cb.value) !== -1;
    });
  }

  // ---------- Time chips (radio) ----------
  var timeChips = $$('.chips[data-facet="maxTime"] .chip');
  timeChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var t = +chip.getAttribute("data-time");
      state.maxTime = t === state.maxTime ? 0 : t;
      syncTimeChips();
      render();
    });
  });

  function syncTimeChips() {
    timeChips.forEach(function (chip) {
      var on = +chip.getAttribute("data-time") === state.maxTime && state.maxTime !== 0;
      chip.setAttribute("aria-checked", String(on));
    });
  }

  // ---------- Sort ----------
  $("#sortSelect").addEventListener("change", function (e) {
    state.sort = e.target.value;
    render();
  });

  // ---------- Reset ----------
  function resetAll() {
    state.q = "";
    state.cuisine = [];
    state.diet = [];
    state.meal = [];
    state.maxTime = 0;
    searchInput.value = "";
    searchClear.hidden = true;
    $$(".opts input").forEach(function (cb) { cb.checked = false; });
    syncTimeChips();
    render();
    toast("Filters cleared");
  }
  $("#resetAll").addEventListener("click", resetAll);
  $("#emptyReset").addEventListener("click", function () { resetAll(); closeDrawer(); });

  // ---------- Mobile drawer ----------
  var sidebar = $("#filters");
  var scrim = $("#scrim");
  var drawerToggle = $("#drawerToggle");
  function openDrawer() {
    sidebar.classList.add("open");
    scrim.hidden = false;
    drawerToggle.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    sidebar.classList.remove("open");
    scrim.hidden = true;
    drawerToggle.setAttribute("aria-expanded", "false");
  }
  drawerToggle.addEventListener("click", openDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeDrawer();
  });

  // ---------- Init ----------
  syncTimeChips();
  render();
})();
