(function () {
  "use strict";

  /* ---------------- Data (fictional) ---------------- */
  var RECIPES = [
    { id: "shak", title: "Saffron Shakshuka", emoji: "🍳", ph: "ph-tomato", time: 25, serves: 2,
      items: ["Eggs", "Crushed tomatoes", "Bell pepper", "Saffron", "Feta"] },
    { id: "ribo", title: "Tuscan Ribollita", emoji: "🥘", ph: "ph-sage", time: 50, serves: 4,
      items: ["Cannellini beans", "Kale", "Stale bread", "Carrots", "Onion"] },
    { id: "gnoc", title: "Brown-Butter Gnocchi", emoji: "🍝", ph: "ph-saffron", time: 30, serves: 3,
      items: ["Potato gnocchi", "Butter", "Sage", "Parmesan"] },
    { id: "tagi", title: "Apricot Lamb Tagine", emoji: "🍲", ph: "ph-clay", time: 75, serves: 4,
      items: ["Lamb shoulder", "Dried apricots", "Onion", "Cumin", "Almonds"] },
    { id: "porr", title: "Maple Oat Porridge", emoji: "🥣", ph: "ph-saffron", time: 12, serves: 1,
      items: ["Rolled oats", "Milk", "Maple syrup", "Walnuts"] },
    { id: "ceas", title: "Charred Caesar", emoji: "🥗", ph: "ph-sage", time: 18, serves: 2,
      items: ["Romaine", "Sourdough", "Parmesan", "Anchovy", "Lemon"] },
    { id: "ramn", title: "Miso Mushroom Ramen", emoji: "🍜", ph: "ph-ocean", time: 35, serves: 2,
      items: ["Ramen noodles", "Miso paste", "Shiitake", "Scallion", "Soft egg"] },
    { id: "pana", title: "Vanilla Panna Cotta", emoji: "🍮", ph: "ph-clay", time: 20, serves: 4,
      items: ["Cream", "Gelatin", "Vanilla", "Sugar"] },
    { id: "taco", title: "Charred Corn Tacos", emoji: "🌮", ph: "ph-tomato", time: 22, serves: 3,
      items: ["Corn tortillas", "Sweetcorn", "Lime", "Cotija", "Cilantro"] },
    { id: "berr", title: "Berry Yogurt Bowl", emoji: "🫐", ph: "ph-plum", time: 6, serves: 1,
      items: ["Greek yogurt", "Blueberries", "Granola", "Honey"] }
  ];
  function recipeById(id) {
    for (var i = 0; i < RECIPES.length; i++) if (RECIPES[i].id === id) return RECIPES[i];
    return null;
  }

  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var MEALS = [
    { id: "breakfast", label: "Breakfast", emoji: "☀️" },
    { id: "lunch", label: "Lunch", emoji: "🥪" },
    { id: "dinner", label: "Dinner", emoji: "🌙" }
  ];
  var STORE_KEY = "stealthis.mealPlanner.v1";

  /* ---------------- State ---------------- */
  // plan[dayIndex][mealId] = recipeId | null
  var plan = load();
  var picked = null; // keyboard "pick up" state: recipe id

  function emptyPlan() {
    return DAYS.map(function () {
      var d = {};
      MEALS.forEach(function (m) { d[m.id] = null; });
      return d;
    });
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return emptyPlan();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== DAYS.length) return emptyPlan();
      return parsed;
    } catch (e) {
      return emptyPlan();
    }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(plan)); } catch (e) {}
  }

  /* ---------------- DOM refs ---------------- */
  var trayEl = document.getElementById("tray");
  var gridEl = document.getElementById("grid");
  var toastEl = document.getElementById("toast");
  var liveEl = document.getElementById("liveRegion");

  /* ---------------- Helpers ---------------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2200);
  }
  function announce(msg) { liveEl.textContent = ""; liveEl.textContent = msg; }

  /* ---------------- Render tray ---------------- */
  function renderTray() {
    trayEl.innerHTML = "";
    RECIPES.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "card";
      li.tabIndex = 0;
      li.setAttribute("draggable", "true");
      li.dataset.recipe = r.id;
      li.setAttribute("role", "button");
      li.setAttribute("aria-label",
        r.title + ", " + r.time + " minutes, serves " + r.serves + ". Press Enter to pick up.");
      li.innerHTML =
        '<span class="card__photo ' + r.ph + '" aria-hidden="true">' + r.emoji + "</span>" +
        '<span class="card__body">' +
          '<span class="card__title">' + r.title + "</span>" +
          '<span class="card__meta"><span>⏱ ' + r.time + " min</span>" +
          '<span class="dot">🍽 serves ' + r.serves + "</span></span>" +
        "</span>";

      li.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", r.id);
        e.dataTransfer.effectAllowed = "copy";
        li.classList.add("is-dragging");
      });
      li.addEventListener("dragend", function () { li.classList.remove("is-dragging"); });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pickUp(r.id, li);
        }
      });
      trayEl.appendChild(li);
    });
  }

  /* ---------------- Render grid ---------------- */
  function renderGrid() {
    var thead = gridEl.querySelector("thead tr");
    // remove existing day headers (keep corner)
    while (thead.children.length > 1) thead.removeChild(thead.lastChild);
    DAYS.forEach(function (day, di) {
      var th = document.createElement("th");
      th.scope = "col";
      th.className = "day-th";
      th.id = "day-" + di;
      th.innerHTML =
        '<div class="day-th__name">' + day + "</div>" +
        '<div class="day-th__sum" id="sum-' + di + '"></div>';
      thead.appendChild(th);
    });

    var tbody = gridEl.querySelector("tbody");
    tbody.innerHTML = "";
    MEALS.forEach(function (meal) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.scope = "row";
      th.className = "meal-th";
      th.id = "meal-" + meal.id;
      th.innerHTML = '<span class="emoji" aria-hidden="true">' + meal.emoji + "</span>" + meal.label;
      tr.appendChild(th);

      DAYS.forEach(function (day, di) {
        var td = document.createElement("td");
        td.className = "slot";
        var drop = document.createElement("div");
        drop.className = "slot__drop";
        drop.dataset.day = di;
        drop.dataset.meal = meal.id;
        drop.setAttribute("role", "button");
        drop.tabIndex = 0;
        drop.setAttribute("aria-labelledby", "day-" + di + " meal-" + meal.id);
        wireDrop(drop);
        td.appendChild(drop);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    renderAllSlots();
  }

  function wireDrop(drop) {
    drop.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      drop.classList.add("is-over");
    });
    drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      drop.classList.remove("is-over");
      var id = e.dataTransfer.getData("text/plain");
      if (id) place(+drop.dataset.day, drop.dataset.meal, id);
    });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (picked) {
          place(+drop.dataset.day, drop.dataset.meal, picked);
          clearPicked();
        } else {
          var cur = plan[+drop.dataset.day][drop.dataset.meal];
          if (cur) {
            // pick up the placed recipe to move it
            pickUp(cur, drop);
            announce("Moving " + recipeById(cur).title + ". Choose a destination slot and press Enter.");
          } else {
            toast("Pick a recipe from the pantry first (press Enter on a card).");
          }
        }
      } else if ((e.key === "Delete" || e.key === "Backspace") &&
                 plan[+drop.dataset.day][drop.dataset.meal]) {
        e.preventDefault();
        remove(+drop.dataset.day, drop.dataset.meal);
      }
    });
  }

  /* ---------------- Pick-up (keyboard) ---------------- */
  function pickUp(id, fromEl) {
    clearPicked();
    picked = id;
    if (fromEl && fromEl.classList) fromEl.classList.add("is-picked");
    var r = recipeById(id);
    announce(r.title + " picked up. Move to a slot and press Enter to place, Escape to cancel.");
    toast("Picked up " + r.title + " — choose a slot.");
  }
  function clearPicked() {
    picked = null;
    var p = document.querySelectorAll(".is-picked");
    for (var i = 0; i < p.length; i++) p[i].classList.remove("is-picked");
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (picked) { clearPicked(); announce("Cancelled."); } closeSheet(); }
  });

  /* ---------------- Place / remove ---------------- */
  function place(dayIdx, mealId, recipeId) {
    if (!recipeById(recipeId)) return;
    plan[dayIdx][mealId] = recipeId;
    save();
    renderSlot(dayIdx, mealId);
    renderDaySummary(dayIdx);
    var r = recipeById(recipeId);
    toast(r.title + " → " + DAYS[dayIdx] + " " + mealLabel(mealId));
    announce(r.title + " placed in " + DAYS[dayIdx] + " " + mealLabel(mealId) + ".");
  }
  function remove(dayIdx, mealId) {
    var prev = plan[dayIdx][mealId];
    plan[dayIdx][mealId] = null;
    save();
    renderSlot(dayIdx, mealId);
    renderDaySummary(dayIdx);
    if (prev) toast("Removed " + recipeById(prev).title);
    var drop = dropEl(dayIdx, mealId);
    if (drop) drop.focus();
  }
  function mealLabel(mealId) {
    for (var i = 0; i < MEALS.length; i++) if (MEALS[i].id === mealId) return MEALS[i].label;
    return mealId;
  }
  function dropEl(dayIdx, mealId) {
    return gridEl.querySelector('.slot__drop[data-day="' + dayIdx + '"][data-meal="' + mealId + '"]');
  }

  /* ---------------- Render a single slot ---------------- */
  function renderSlot(dayIdx, mealId) {
    var drop = dropEl(dayIdx, mealId);
    if (!drop) return;
    drop.innerHTML = "";
    var id = plan[dayIdx][mealId];
    if (!id) {
      drop.setAttribute("aria-label", DAYS[dayIdx] + " " + mealLabel(mealId) + ", empty. Press Enter to place a picked recipe.");
      return;
    }
    var r = recipeById(id);
    drop.removeAttribute("aria-label");
    drop.setAttribute("aria-labelledby", "day-" + dayIdx + " meal-" + mealId);

    var chip = document.createElement("div");
    chip.className = "placed";
    chip.setAttribute("draggable", "true");
    chip.dataset.recipe = id;
    chip.innerHTML =
      '<span class="placed__photo ' + r.ph + '" aria-hidden="true">' + r.emoji + "</span>" +
      '<span class="placed__body">' +
        '<span class="placed__title">' + r.title + "</span>" +
        '<span class="placed__meta">⏱ ' + r.time + " min</span>" +
      "</span>" +
      '<button type="button" class="placed__remove" aria-label="Remove ' + r.title + '">✕</button>';

    chip.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      chip.classList.add("is-dragging");
      // moving: clear origin once dropped elsewhere
      chip._origin = { day: dayIdx, meal: mealId };
    });
    chip.addEventListener("dragend", function () {
      chip.classList.remove("is-dragging");
      // if recipe still here AND was placed elsewhere, the drop handler placed a copy;
      // turn move into a real move by clearing the source if target differs.
    });
    chip.querySelector(".placed__remove").addEventListener("click", function (ev) {
      ev.stopPropagation();
      remove(dayIdx, mealId);
    });

    // Support move semantics: when this chip is dropped on a different slot,
    // clear this source slot. We detect via a custom listener on document.
    chip.addEventListener("dragstart", function () {
      window.__movingFrom = { day: dayIdx, meal: mealId, id: id };
    });

    drop.appendChild(chip);
  }

  function renderAllSlots() {
    DAYS.forEach(function (_, di) {
      MEALS.forEach(function (m) { renderSlot(di, m.id); });
      renderDaySummary(di);
    });
  }

  /* ---------------- Day summary ---------------- */
  function renderDaySummary(dayIdx) {
    var el = document.getElementById("sum-" + dayIdx);
    if (!el) return;
    var time = 0, serves = 0, count = 0;
    MEALS.forEach(function (m) {
      var id = plan[dayIdx][m.id];
      if (id) {
        var r = recipeById(id);
        time += r.time;
        serves = Math.max(serves, r.serves);
        count++;
      }
    });
    if (count === 0) {
      el.innerHTML = "<span style='color:var(--muted)'>No meals yet</span>";
    } else {
      el.innerHTML = "<b>" + time + " min</b> total · serves <b>" + serves + "</b>";
    }
  }

  /* ---------------- Move semantics (clear source on cross-slot drop) ----------------
     HTML5 DnD copies the id into the target; to make a *move* we clear the original
     source slot after a successful cross-slot drop. We hook the grid's drop. */
  gridEl.addEventListener("drop", function (e) {
    var src = window.__movingFrom;
    if (!src) return;
    var dropTarget = e.target.closest ? e.target.closest(".slot__drop") : null;
    window.__movingFrom = null;
    if (!dropTarget) return;
    var tDay = +dropTarget.dataset.day, tMeal = dropTarget.dataset.meal;
    if (tDay === src.day && tMeal === src.meal) return; // same slot, no-op
    // target was filled by place(); now clear source
    plan[src.day][src.meal] = null;
    save();
    renderSlot(src.day, src.meal);
    renderDaySummary(src.day);
  }, true);

  /* ---------------- Clear week ---------------- */
  document.getElementById("clearBtn").addEventListener("click", function () {
    var any = plan.some(function (d) { return MEALS.some(function (m) { return d[m.id]; }); });
    if (!any) { toast("Your week is already empty."); return; }
    plan = emptyPlan();
    save();
    renderAllSlots();
    toast("Cleared the whole week.");
    announce("Week cleared.");
  });

  /* ---------------- Shopping list ---------------- */
  var overlay = document.getElementById("overlay");
  var sheetBody = document.getElementById("sheetBody");
  document.getElementById("listBtn").addEventListener("click", buildShoppingList);
  document.getElementById("sheetClose").addEventListener("click", closeSheet);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSheet(); });

  function buildShoppingList() {
    var counts = {};
    var meals = 0;
    plan.forEach(function (d) {
      MEALS.forEach(function (m) {
        var id = d[m.id];
        if (!id) return;
        meals++;
        recipeById(id).items.forEach(function (it) {
          counts[it] = (counts[it] || 0) + 1;
        });
      });
    });
    var keys = Object.keys(counts).sort();
    if (!keys.length) {
      sheetBody.innerHTML = '<p class="shop-empty">No meals planned yet — drag some recipes into the week, then come back.</p>';
    } else {
      var html = '<ul class="shop-list">';
      keys.forEach(function (k) {
        var n = counts[k];
        html += "<li><span>" + k + "</span><span class='qty'>×" + n + "</span></li>";
      });
      html += "</ul>";
      html += '<p class="shop-total">' + keys.length + " ingredients across " + meals + " planned meals.</p>";
      sheetBody.innerHTML = html;
    }
    overlay.hidden = false;
    document.getElementById("sheetClose").focus();
  }
  function closeSheet() { overlay.hidden = true; }

  /* ---------------- Boot ---------------- */
  renderTray();
  renderGrid();
})();
