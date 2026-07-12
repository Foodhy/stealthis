(function () {
  "use strict";

  var GOAL = 2100;

  var MEALS = [
    { id: "breakfast", label: "Breakfast", icon: "🌅" },
    { id: "lunch", label: "Lunch", icon: "🥗" },
    { id: "dinner", label: "Dinner", icon: "🍽️" },
    { id: "snack", label: "Snack", icon: "🍎" }
  ];

  var QUICKPICKS = [
    { name: "Oatmeal + berries", cal: 320, p: 11, c: 58, f: 6, meal: "breakfast" },
    { name: "Grilled chicken", cal: 280, p: 52, c: 0, f: 7, meal: "lunch" },
    { name: "Protein shake", cal: 160, p: 30, c: 6, f: 2, meal: "snack" },
    { name: "Brown rice cup", cal: 215, p: 5, c: 45, f: 2, meal: "lunch" },
    { name: "Greek yogurt", cal: 130, p: 17, c: 9, f: 3, meal: "snack" },
    { name: "Salmon fillet", cal: 360, p: 34, c: 0, f: 24, meal: "dinner" }
  ];

  // seed data
  var items = [
    { id: uid(), name: "Scrambled eggs + toast", cal: 380, p: 22, c: 30, f: 18, meal: "breakfast" },
    { id: uid(), name: "Black coffee", cal: 5, p: 0, c: 0, f: 0, meal: "breakfast" },
    { id: uid(), name: "Chicken & quinoa bowl", cal: 520, p: 45, c: 48, f: 14, meal: "lunch" }
  ];

  var displayCal = null; // for count-up animation

  // ---------- DOM refs ----------
  var $ = function (id) { return document.getElementById(id); };
  var mealsEl = $("meals");
  var form = $("foodForm");
  var quickEl = $("quickpicks");
  var toastEl = $("toast");
  var toastTimer;

  function uid() { return "f" + Math.random().toString(36).slice(2, 9); }

  // ---------- Build static meal sections ----------
  function buildSections() {
    MEALS.forEach(function (m) {
      var sec = document.createElement("section");
      sec.className = "meal-section";
      sec.innerHTML =
        '<div class="meal-head">' +
          '<div class="meal-title"><span class="meal-icon" aria-hidden="true">' + m.icon + '</span>' +
          '<h2>' + m.label + '</h2></div>' +
          '<span class="meal-subtotal empty" id="sub-' + m.id + '">0 kcal</span>' +
        '</div>' +
        '<ul class="rows" id="rows-' + m.id + '"></ul>';
      mealsEl.appendChild(sec);
    });
  }

  function buildQuickpicks() {
    QUICKPICKS.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qp";
      b.textContent = q.name;
      b.setAttribute("aria-label", "Add " + q.name + ", " + q.cal + " calories");
      b.addEventListener("click", function () {
        addItem({ name: q.name, cal: q.cal, p: q.p, c: q.c, f: q.f, meal: q.meal }, true);
      });
      quickEl.appendChild(b);
    });
  }

  // ---------- Render ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render(newId) {
    MEALS.forEach(function (m) {
      var ul = $("rows-" + m.id);
      var sub = $("sub-" + m.id);
      var list = items.filter(function (it) { return it.meal === m.id; });
      var total = list.reduce(function (a, it) { return a + it.cal; }, 0);

      sub.textContent = total + " kcal";
      sub.classList.toggle("empty", total === 0);

      ul.innerHTML = "";
      if (!list.length) {
        var li = document.createElement("li");
        li.className = "empty-row";
        li.textContent = "No food logged yet.";
        ul.appendChild(li);
        return;
      }
      list.forEach(function (it) {
        var li = document.createElement("li");
        li.className = "row" + (it.id === newId ? " enter" : "");
        var macros = "";
        if (it.p) macros += '<span class="chip p">' + it.p + 'g P</span>';
        if (it.c) macros += '<span class="chip c">' + it.c + 'g C</span>';
        if (it.f) macros += '<span class="chip f">' + it.f + 'g F</span>';
        li.innerHTML =
          '<div class="row-main">' +
            '<div class="row-name">' + esc(it.name) + '</div>' +
            (macros ? '<div class="row-macros">' + macros + '</div>' : '') +
          '</div>' +
          '<div class="row-cal">' + it.cal + '<small>kcal</small></div>' +
          '<button class="row-del" aria-label="Remove ' + esc(it.name) + '" data-id="' + it.id + '">&times;</button>';
        ul.appendChild(li);
      });
    });
    updateSummary();
  }

  // ---------- Summary ----------
  function updateSummary() {
    var food = items.reduce(function (a, it) { return a + it.cal; }, 0);
    var p = items.reduce(function (a, it) { return a + (it.p || 0); }, 0);
    var c = items.reduce(function (a, it) { return a + (it.c || 0); }, 0);
    var f = items.reduce(function (a, it) { return a + (it.f || 0); }, 0);
    var remain = GOAL - food;
    var over = remain < 0;

    $("calGoal").textContent = GOAL;
    $("calFood").textContent = food;

    var remEl = $("calRemain");
    remEl.classList.toggle("over", over);
    remEl.textContent = over ? "+" + Math.abs(remain) : remain;
    remEl.nextElementSibling.textContent = over ? "kcal over" : "kcal left";

    // goal bar
    var pct = Math.min(100, Math.round((food / GOAL) * 100));
    var bar = $("goalbar");
    var fill = $("goalFill");
    fill.style.width = pct + "%";
    fill.setAttribute("aria-valuenow", food);
    bar.classList.toggle("over", over);

    var note = $("goalNote");
    note.classList.toggle("over", over);
    if (food === 0) note.textContent = "Let's fuel up — nothing logged yet.";
    else if (over) note.textContent = "Over goal by " + Math.abs(remain) + " kcal — ease up on the next meal.";
    else if (pct >= 85) note.textContent = pct + "% of goal — dialed in. Great work!";
    else note.textContent = pct + "% of goal logged · " + remain + " kcal to go.";

    // macros (approx targets for fills)
    setMacro("Protein", p, 160);
    setMacro("Carbs", c, 230);
    setMacro("Fat", f, 70);
  }

  function setMacro(key, val, target) {
    $("m" + key).textContent = val + "g";
    $("m" + key + "Fill").style.width = Math.min(100, Math.round((val / target) * 100)) + "%";
  }

  // ---------- Actions ----------
  function addItem(data, quick) {
    var it = {
      id: uid(),
      name: data.name.trim(),
      cal: Math.max(0, Math.round(+data.cal || 0)),
      p: Math.max(0, Math.round(+data.p || 0)),
      c: Math.max(0, Math.round(+data.c || 0)),
      f: Math.max(0, Math.round(+data.f || 0)),
      meal: data.meal
    };
    if (!it.name) { toast("Give the food a name.", true); return; }
    items.push(it);
    render(it.id);
    var mealLabel = MEALS.filter(function (m) { return m.id === it.meal; })[0].label;
    toast((quick ? "Quick-added " : "Logged ") + it.name + " → " + mealLabel);
  }

  function removeItem(id) {
    var it = items.filter(function (x) { return x.id === id; })[0];
    items = items.filter(function (x) { return x.id !== id; });
    render();
    if (it) toast("Removed " + it.name + " · −" + it.cal + " kcal", true);
  }

  // ---------- Toast ----------
  function toast(msg, warn) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.toggle("warn", !!warn);
    toastEl.classList.add("show");
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  // ---------- Events ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    addItem({
      name: fd.get("name"),
      cal: fd.get("cal"),
      p: fd.get("p"),
      c: fd.get("c"),
      f: fd.get("f"),
      meal: fd.get("meal")
    }, false);
    form.reset();
    $("fName").focus();
  });

  mealsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".row-del");
    if (btn) removeItem(btn.getAttribute("data-id"));
  });

  // ---------- Init ----------
  buildSections();
  buildQuickpicks();
  render();
})();
