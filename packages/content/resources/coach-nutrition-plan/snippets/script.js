(function () {
  "use strict";

  // ---------- Goals ----------
  var GOAL = { kcal: 2200, p: 180, c: 210, f: 70 };

  // ---------- Meal data (each meal has swap alternatives) ----------
  var MEALS = [
    {
      slot: "Breakfast",
      options: [
        { name: "Greek Yogurt & Berry Bowl", kcal: 420, p: 34, c: 48, f: 10 },
        { name: "Spinach Egg-White Omelette", kcal: 380, p: 38, c: 12, f: 18 },
        { name: "Overnight Oats & Whey", kcal: 440, p: 32, c: 55, f: 9 }
      ]
    },
    {
      slot: "Lunch",
      options: [
        { name: "Grilled Chicken & Quinoa", kcal: 610, p: 52, c: 58, f: 16 },
        { name: "Turkey Rice Power Bowl", kcal: 590, p: 48, c: 62, f: 14 },
        { name: "Tuna & Sweet Potato Plate", kcal: 560, p: 50, c: 52, f: 13 }
      ]
    },
    {
      slot: "Dinner",
      options: [
        { name: "Salmon, Greens & Rice", kcal: 640, p: 46, c: 50, f: 24 },
        { name: "Lean Beef Stir-Fry", kcal: 620, p: 50, c: 45, f: 22 },
        { name: "Tofu & Soba Noodles", kcal: 540, p: 30, c: 68, f: 15 }
      ]
    },
    {
      slot: "Snack",
      options: [
        { name: "Protein Shake & Almonds", kcal: 300, p: 30, c: 14, f: 13 },
        { name: "Cottage Cheese & Peach", kcal: 240, p: 26, c: 20, f: 6 },
        { name: "Rice Cakes & Peanut Butter", kcal: 280, p: 12, c: 32, f: 12 }
      ]
    }
  ];

  var state = MEALS.map(function () { return { idx: 0, logged: false }; });

  var GROCERY = [
    { name: "Chicken breast", qty: "1 kg", done: false },
    { name: "Greek yogurt", qty: "500 g", done: false },
    { name: "Quinoa", qty: "400 g", done: false },
    { name: "Salmon fillet", qty: "300 g", done: false },
    { name: "Mixed berries", qty: "250 g", done: false },
    { name: "Baby spinach", qty: "200 g", done: false },
    { name: "Sweet potato", qty: "6 pcs", done: false },
    { name: "Almonds", qty: "150 g", done: false }
  ];

  var WATER_GLASSES = 8, WATER_ML = 250;
  var water = 0;

  // ---------- Helpers ----------
  var $ = function (id) { return document.getElementById(id); };
  function fmt(n) { return n.toLocaleString("en-US"); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var toastEl = $("toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("toast--show"); }, 2200);
  }

  // ---------- Totals ----------
  function totals() {
    var t = { kcal: 0, p: 0, c: 0, f: 0 };
    state.forEach(function (s, i) {
      if (!s.logged) return;
      var m = MEALS[i].options[s.idx];
      t.kcal += m.kcal; t.p += m.p; t.c += m.c; t.f += m.f;
    });
    return t;
  }

  // ---------- Render ring + macros ----------
  function renderRing() {
    var t = totals();
    var pct = clamp(Math.round((t.kcal / GOAL.kcal) * 100), 0, 100);
    var ring = $("ring");
    ring.style.setProperty("--pct", pct);
    ring.classList.toggle("ring--over", t.kcal > GOAL.kcal);

    $("calNum").textContent = fmt(t.kcal);
    var left = GOAL.kcal - t.kcal;
    var leftEl = $("calLeft");
    if (left >= 0) { leftEl.textContent = fmt(left) + " left"; leftEl.style.color = "var(--lime)"; }
    else { leftEl.textContent = fmt(-left) + " over"; leftEl.style.color = "var(--orange)"; }

    setMacro("p", t.p, GOAL.p);
    setMacro("c", t.c, GOAL.c);
    setMacro("f", t.f, GOAL.f);

    var loggedCount = state.filter(function (s) { return s.logged; }).length;
    $("loggedBadge").textContent = loggedCount + " / 4 logged";
  }

  function setMacro(key, val, goal) {
    $(key + "Val").textContent = val;
    $(key + "Goal").textContent = "/ " + goal + "g";
    $(key + "Bar").style.width = clamp((val / goal) * 100, 0, 100) + "%";
  }

  // ---------- Render meals ----------
  function renderMeals() {
    var ul = $("meals");
    ul.innerHTML = "";
    MEALS.forEach(function (meal, i) {
      var s = state[i];
      var m = meal.options[s.idx];
      var li = document.createElement("li");
      li.className = "meal" + (s.logged ? " meal--logged" : "");
      li.innerHTML =
        '<div class="meal__top">' +
          '<span class="meal__slot">' + meal.slot + '</span>' +
          '<span class="meal__kcal">' + m.kcal + ' kcal</span>' +
        '</div>' +
        '<h3 class="meal__name">' + m.name + '</h3>' +
        '<div class="meal__macros">' +
          '<span class="tag">P ' + m.p + 'g</span>' +
          '<span class="tag">C ' + m.c + 'g</span>' +
          '<span class="tag">F ' + m.f + 'g</span>' +
        '</div>' +
        '<div class="meal__actions">' +
          '<button class="btn btn--swap" data-act="swap" data-i="' + i + '" type="button">↺ Swap</button>' +
          '<button class="btn btn--log ' + (s.logged ? '' : 'btn--lime') + '" data-act="log" data-i="' + i + '" type="button">' +
            (s.logged ? "✓ Logged" : "Log meal") +
          '</button>' +
        '</div>';
      ul.appendChild(li);
    });
  }

  $("meals").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var i = +btn.dataset.i, s = state[i], meal = MEALS[i];
    if (btn.dataset.act === "swap") {
      s.idx = (s.idx + 1) % meal.options.length;
      toast("Swapped " + meal.slot + " → " + meal.options[s.idx].name);
    } else {
      s.logged = !s.logged;
      toast(s.logged ? meal.slot + " logged 🔥" : meal.slot + " un-logged");
    }
    renderMeals();
    renderRing();
  });

  // ---------- Water ----------
  function renderWater() {
    var box = $("water");
    box.innerHTML = "";
    for (var i = 0; i < WATER_GLASSES; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "glass" + (i < water ? " glass--full" : "");
      b.dataset.i = i;
      b.setAttribute("aria-label", "Glass " + (i + 1) + (i < water ? ", full" : ", empty"));
      b.setAttribute("aria-pressed", i < water ? "true" : "false");
      box.appendChild(b);
    }
    $("waterBadge").textContent = water + " / " + WATER_GLASSES + " glasses";
    $("waterMl").textContent = water * WATER_ML;
  }

  function setWater(n, announce) {
    var prev = water;
    water = clamp(n, 0, WATER_GLASSES);
    renderWater();
    if (announce && water !== prev) {
      if (water === WATER_GLASSES) toast("Hydration goal smashed! 💧");
      else toast(water + " glasses · " + (water * WATER_ML) + " ml");
    }
  }

  $("water").addEventListener("click", function (e) {
    var g = e.target.closest(".glass");
    if (!g) return;
    var i = +g.dataset.i;
    // tapping the highest full glass empties it, otherwise fill up to that glass
    setWater(i + 1 === water ? i : i + 1, true);
  });
  $("waterPlus").addEventListener("click", function () { setWater(water + 1, true); });
  $("waterMinus").addEventListener("click", function () { setWater(water - 1, true); });

  // ---------- Grocery ----------
  function renderGrocery() {
    var ul = $("grocery");
    ul.innerHTML = "";
    GROCERY.forEach(function (item, i) {
      var li = document.createElement("li");
      li.className = "groc" + (item.done ? " groc--done" : "");
      li.innerHTML =
        '<label class="groc" style="all:unset;display:contents">' +
          '<input type="checkbox" ' + (item.done ? "checked" : "") + ' data-i="' + i + '" />' +
          '<span class="groc__box"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4L19 6" stroke="#10130a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
          '<span class="groc__name">' + item.name + '</span>' +
          '<span class="groc__qty">' + item.qty + '</span>' +
        '</label>';
      ul.appendChild(li);
    });
    var left = GROCERY.filter(function (x) { return !x.done; }).length;
    $("groceryBadge").textContent = left === 0 ? "All set ✓" : left + " to buy";
  }

  $("grocery").addEventListener("change", function (e) {
    var cb = e.target.closest("input[type=checkbox]");
    if (!cb) return;
    var i = +cb.dataset.i;
    GROCERY[i].done = cb.checked;
    renderGrocery();
    if (GROCERY.every(function (x) { return x.done; })) toast("Grocery list complete! 🛒");
  });

  $("resetGrocery").addEventListener("click", function () {
    GROCERY.forEach(function (x) { x.done = false; });
    renderGrocery();
    toast("Grocery list reset");
  });

  // ---------- Init ----------
  renderMeals();
  renderGrocery();
  renderWater();
  // pre-log breakfast + lunch for a realistic starting state, animate ring after paint
  state[0].logged = true;
  state[1].logged = true;
  renderMeals();
  setWater(3, false);
  requestAnimationFrame(function () {
    requestAnimationFrame(renderRing);
  });
})();
