(function () {
  "use strict";

  // ----- Goals -----
  const GOALS = { kcal: 2200, protein: 180, carbs: 200, fat: 65 };
  const WATER_TARGET = 8;

  // ----- Seed data (realistic, fictional) -----
  const MEALS = [
    {
      id: "breakfast",
      name: "Breakfast",
      sub: "7:10 AM",
      icon: "☀️",
      items: [
        { id: uid(), name: "Oats + whey scoop", kcal: 410, protein: 32, carbs: 52, fat: 8 },
        { id: uid(), name: "Banana", kcal: 105, protein: 1, carbs: 27, fat: 0 },
        { id: uid(), name: "Black coffee", kcal: 5, protein: 0, carbs: 1, fat: 0 },
      ],
    },
    {
      id: "lunch",
      name: "Lunch",
      sub: "12:45 PM",
      icon: "🍽️",
      items: [
        { id: uid(), name: "Grilled chicken breast", kcal: 280, protein: 52, carbs: 0, fat: 7 },
        { id: uid(), name: "Jasmine rice (1 cup)", kcal: 205, protein: 4, carbs: 45, fat: 0 },
        { id: uid(), name: "Mixed greens + olive oil", kcal: 120, protein: 2, carbs: 6, fat: 11 },
      ],
    },
    {
      id: "dinner",
      name: "Dinner",
      sub: "7:30 PM",
      icon: "🌙",
      items: [
        { id: uid(), name: "Salmon fillet", kcal: 360, protein: 40, carbs: 0, fat: 22 },
        { id: uid(), name: "Sweet potato", kcal: 180, protein: 4, carbs: 41, fat: 0 },
      ],
    },
    {
      id: "snacks",
      name: "Snacks",
      sub: "Anytime",
      icon: "🥜",
      items: [
        { id: uid(), name: "Greek yogurt", kcal: 130, protein: 18, carbs: 9, fat: 3 },
        { id: uid(), name: "Almonds (28g)", kcal: 164, protein: 6, carbs: 6, fat: 14 },
      ],
    },
  ];

  let water = 3;

  // ----- helpers -----
  function uid() {
    return "e" + Math.random().toString(36).slice(2, 9);
  }
  function num(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  const $ = (sel, root) => (root || document).querySelector(sel);

  // ----- Toast -----
  function toast(msg) {
    const wrap = $("#toastWrap");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 2200);
  }

  // ----- Totals -----
  function totals() {
    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    MEALS.forEach((m) =>
      m.items.forEach((it) => {
        t.kcal += it.kcal;
        t.protein += it.protein;
        t.carbs += it.carbs;
        t.fat += it.fat;
      })
    );
    return t;
  }

  // ----- Render summary (ring + bars) -----
  const RING_CIRC = 2 * Math.PI * 52; // r=52

  function renderSummary() {
    const t = totals();
    const remaining = GOALS.kcal - t.kcal;
    const over = remaining < 0;

    // ring
    const ratio = Math.min(t.kcal / GOALS.kcal, 1);
    const ring = $("#calRing");
    ring.style.strokeDashoffset = String(RING_CIRC * (1 - ratio));
    ring.classList.toggle("is-over", over);

    $("#calRemaining").textContent = over
      ? "+" + Math.abs(remaining)
      : remaining.toLocaleString();
    $("#calRemaining").nextElementSibling.textContent = over ? "kcal over" : "kcal left";
    $("#calGoal").textContent = GOALS.kcal.toLocaleString();
    $("#calFood").textContent = t.kcal.toLocaleString();

    const state = $("#calState");
    state.classList.toggle("is-over", over);
    if (over) state.textContent = "Over budget";
    else if (ratio >= 0.85) state.textContent = "Nearly there";
    else state.textContent = "On track";

    // macro bars
    ["protein", "carbs", "fat"].forEach((k) => {
      const cap = k.charAt(0).toUpperCase() + k.slice(1);
      const pct = Math.min(Math.round((t[k] / GOALS[k]) * 100), 100);
      const bar = $("#bar" + cap);
      bar.style.width = pct + "%";
      $("#pct" + cap).textContent = Math.round((t[k] / GOALS[k]) * 100) + "%";
      const card = bar.closest(".macro");
      card.querySelector(".macro__cur").textContent = t[k] + "g";
      card.querySelector(".macro__goal").textContent = "/ " + GOALS[k] + "g";
    });
  }

  // ----- Render meals -----
  function entryEl(mealId, it) {
    const li = document.createElement("li");
    li.className = "entry";
    li.dataset.id = it.id;
    li.innerHTML =
      '<div class="entry__main">' +
      '<div class="entry__name"></div>' +
      '<div class="entry__macros">' +
      '<span class="tag tag--p">P ' + it.protein + "</span>" +
      '<span class="tag tag--c">C ' + it.carbs + "</span>" +
      '<span class="tag tag--f">F ' + it.fat + "</span>" +
      "</div></div>" +
      '<span class="entry__kcal">' + it.kcal + " kcal</span>" +
      '<button class="entry__rm" type="button" aria-label="Remove ' +
      it.name.replace(/"/g, "") +
      '">×</button>';
    li.querySelector(".entry__name").textContent = it.name;
    li.querySelector(".entry__rm").addEventListener("click", () =>
      removeEntry(mealId, it.id, li)
    );
    return li;
  }

  function mealTotalKcal(meal) {
    return meal.items.reduce((s, it) => s + it.kcal, 0);
  }

  function renderMeals() {
    const root = $("#meals");
    root.innerHTML = "";
    MEALS.forEach((meal) => {
      const sec = document.createElement("section");
      sec.className = "meal";
      sec.dataset.id = meal.id;

      const head = document.createElement("div");
      head.className = "meal__head";
      head.innerHTML =
        '<span class="meal__icon" aria-hidden="true">' + meal.icon + "</span>" +
        '<span class="meal__title">' +
        '<span class="meal__name">' + meal.name + "</span>" +
        '<span class="meal__sub">' + meal.sub + "</span></span>" +
        '<span class="meal__kcal">' + mealTotalKcal(meal) + " <small>kcal</small></span>";
      sec.appendChild(head);

      const list = document.createElement("ul");
      list.className = "meal__items";
      if (meal.items.length === 0) {
        const empty = document.createElement("li");
        empty.className = "meal__empty";
        empty.textContent = "Nothing logged yet.";
        list.appendChild(empty);
      } else {
        meal.items.forEach((it) => list.appendChild(entryEl(meal.id, it)));
      }
      sec.appendChild(list);

      const foot = document.createElement("div");
      foot.className = "meal__foot";
      const addBtn = document.createElement("button");
      addBtn.className = "meal__add";
      addBtn.type = "button";
      addBtn.innerHTML = "<span aria-hidden='true'>+</span> Add food";
      addBtn.addEventListener("click", () => openForm(meal.id, foot, addBtn));
      foot.appendChild(addBtn);
      sec.appendChild(foot);

      root.appendChild(sec);
    });
  }

  function refreshMealKcal(mealId) {
    const meal = MEALS.find((m) => m.id === mealId);
    const sec = document.querySelector('.meal[data-id="' + mealId + '"]');
    if (!sec) return;
    sec.querySelector(".meal__kcal").innerHTML =
      mealTotalKcal(meal) + " <small>kcal</small>";
    // handle empty state
    const list = sec.querySelector(".meal__items");
    const hasEmpty = list.querySelector(".meal__empty");
    if (meal.items.length === 0 && !hasEmpty) {
      const empty = document.createElement("li");
      empty.className = "meal__empty";
      empty.textContent = "Nothing logged yet.";
      list.appendChild(empty);
    } else if (meal.items.length > 0 && hasEmpty) {
      hasEmpty.remove();
    }
  }

  // ----- Remove -----
  function removeEntry(mealId, entryId, li) {
    const meal = MEALS.find((m) => m.id === mealId);
    const idx = meal.items.findIndex((it) => it.id === entryId);
    if (idx === -1) return;
    const removed = meal.items.splice(idx, 1)[0];
    li.classList.add("is-removing");
    li.addEventListener(
      "animationend",
      () => {
        li.remove();
        refreshMealKcal(mealId);
      },
      { once: true }
    );
    renderSummary();
    toast("Removed " + removed.name);
  }

  // ----- Add form -----
  function openForm(mealId, foot, addBtn) {
    if (foot.querySelector(".addform")) {
      foot.querySelector(".addform input[name='name']").focus();
      return;
    }
    const tpl = $("#addFormTpl").content.cloneNode(true);
    const form = tpl.querySelector(".addform");
    addBtn.hidden = true;
    foot.appendChild(form);
    form.querySelector("input[name='name']").focus();

    function close() {
      form.remove();
      addBtn.hidden = false;
    }

    form.querySelector("[data-cancel]").addEventListener("click", close);
    form.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const kcal = num(fd.get("kcal"));
      if (!name) {
        form.querySelector("input[name='name']").focus();
        return;
      }
      const it = {
        id: uid(),
        name: name,
        kcal: kcal,
        protein: num(fd.get("protein")),
        carbs: num(fd.get("carbs")),
        fat: num(fd.get("fat")),
      };
      const meal = MEALS.find((m) => m.id === mealId);
      meal.items.push(it);

      const list = document.querySelector(
        '.meal[data-id="' + mealId + '"] .meal__items'
      );
      list.appendChild(entryEl(mealId, it));
      refreshMealKcal(mealId);
      renderSummary();
      toast("Added " + name + " (" + kcal + " kcal)");
      close();
    });
  }

  // ----- Water -----
  function renderWater() {
    const wrap = $("#waterGlasses");
    wrap.innerHTML = "";
    for (let i = 0; i < WATER_TARGET; i++) {
      const idx = i;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "glass";
      btn.setAttribute("aria-pressed", idx < water ? "true" : "false");
      btn.setAttribute("aria-label", "Glass " + (idx + 1));
      btn.innerHTML =
        '<svg viewBox="0 0 38 46" aria-hidden="true">' +
        '<path class="glass__water" d="M7 22 L31 22 L29 41 Q28.5 43 26 43 L12 43 Q9.5 43 9 41 Z"/>' +
        '<path class="glass__body" d="M6 5 L32 5 L29 41 Q28.5 43.5 26 43.5 L12 43.5 Q9.5 43.5 9 41 Z"/>' +
        "</svg>";
      updateGlass(btn, idx);
      btn.addEventListener("click", () => {
        // tapping a filled glass that's the last filled -> unfill it; else fill up to it
        water = idx + 1 === water ? idx : idx + 1;
        syncWater();
        toast(water + " of " + WATER_TARGET + " glasses logged");
      });
      wrap.appendChild(btn);
    }
    $("#waterCount").textContent = String(water);
  }

  function updateGlass(btn, idx) {
    const full = idx < water;
    btn.classList.toggle("is-full", full);
    btn.setAttribute("aria-pressed", full ? "true" : "false");
  }

  function syncWater() {
    const glasses = $("#waterGlasses").children;
    for (let i = 0; i < glasses.length; i++) updateGlass(glasses[i], i);
    $("#waterCount").textContent = String(water);
  }

  // ----- Init -----
  renderMeals();
  renderWater();
  renderSummary();
})();
