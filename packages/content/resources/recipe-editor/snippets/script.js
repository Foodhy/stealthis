(function () {
  "use strict";

  var STORAGE_KEY = "cookbook.recipe-editor.draft.v1";

  var form = document.getElementById("recipeForm");
  var ingList = document.getElementById("ingList");
  var stepList = document.getElementById("stepList");
  var toastEl = document.getElementById("toast");
  var saveState = document.getElementById("saveState");

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast";
    }, 2600);
  }

  /* ---------- state ---------- */
  var defaults = {
    title: "Sun-Roasted Tomato & Basil Galette",
    desc: "A blistered, jammy tomato tart with a buttery rye crust and torn basil.",
    prep: 20,
    cook: 35,
    servings: 4,
    difficulty: "Medium",
    diet: "Vegetarian · Nut-free",
    ingredients: [
      { qty: "300", unit: "g", name: "rye + plain flour blend" },
      { qty: "150", unit: "g", name: "cold butter, cubed" },
      { qty: "6", unit: "", name: "ripe vine tomatoes" },
      { qty: "1", unit: "handful", name: "basil leaves, torn" },
      { qty: "2", unit: "tbsp", name: "olive oil" }
    ],
    steps: [
      "Rub butter into the flour until sandy, add iced water and rest the dough 30 min.",
      "Slice tomatoes, salt lightly and drain on a towel for 10 minutes.",
      "Roll the pastry, layer tomatoes, fold the rim and brush with oil.",
      "Bake at 200°C until the crust is deep gold, then scatter with basil."
    ]
  };

  var baseServings = defaults.servings;
  var scale = defaults.servings;
  var idSeq = 0;
  function uid() { return "r" + ++idSeq; }

  /* ---------- generic row builders ---------- */
  function makeIngRow(data) {
    var li = document.createElement("li");
    li.className = "row ing-row";
    li.draggable = false;
    li.dataset.id = uid();
    li.innerHTML =
      '<button type="button" class="handle" aria-label="Drag to reorder" title="Drag to reorder">⠿</button>' +
      '<input class="qty" type="text" inputmode="decimal" placeholder="Qty" aria-label="Quantity" />' +
      '<input class="unit" type="text" placeholder="Unit" aria-label="Unit" />' +
      '<input class="name" type="text" placeholder="Ingredient" aria-label="Ingredient name" />' +
      rowControls();
    li.querySelector(".qty").value = data.qty || "";
    li.querySelector(".unit").value = data.unit || "";
    li.querySelector(".name").value = data.name || "";
    wireRow(li, ingList);
    return li;
  }

  function makeStepRow(text) {
    var li = document.createElement("li");
    li.className = "row step-row";
    li.dataset.id = uid();
    li.innerHTML =
      '<button type="button" class="handle" aria-label="Drag to reorder" title="Drag to reorder">⠿</button>' +
      '<span class="step-num">1</span>' +
      '<textarea rows="2" placeholder="Describe this step…" aria-label="Step instruction"></textarea>' +
      rowControls();
    li.querySelector("textarea").value = text || "";
    wireRow(li, stepList);
    return li;
  }

  function rowControls() {
    return (
      '<div class="row-controls">' +
      '<button type="button" class="icon-btn up" aria-label="Move up" title="Move up">▲</button>' +
      '<button type="button" class="icon-btn down" aria-label="Move down" title="Move down">▼</button>' +
      '<button type="button" class="icon-btn remove" aria-label="Remove row" title="Remove">✕</button>' +
      '</div>'
    );
  }

  /* ---------- row wiring (input, move, remove, drag) ---------- */
  function wireRow(li, list) {
    li.addEventListener("input", function () { render(); persist(); });

    li.querySelector(".up").addEventListener("click", function () {
      if (li.previousElementSibling) {
        list.insertBefore(li, li.previousElementSibling);
        syncAfterMove(list);
      }
    });
    li.querySelector(".down").addEventListener("click", function () {
      if (li.nextElementSibling) {
        list.insertBefore(li.nextElementSibling, li);
        syncAfterMove(list);
      }
    });
    li.querySelector(".remove").addEventListener("click", function () {
      li.remove();
      syncAfterMove(list);
      toast("Row removed");
    });

    var handle = li.querySelector(".handle");
    handle.addEventListener("mousedown", function () { li.draggable = true; });
    handle.addEventListener("touchstart", function () { li.draggable = true; }, { passive: true });
    li.addEventListener("dragend", function () { li.draggable = false; });

    li.addEventListener("dragstart", function (e) {
      dragSrc = li;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", li.dataset.id); } catch (_) {}
    });
    li.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (dragSrc && dragSrc !== li && dragSrc.parentNode === list) {
        li.classList.add("drag-over");
        e.dataTransfer.dropEffect = "move";
      }
    });
    li.addEventListener("dragleave", function () { li.classList.remove("drag-over"); });
    li.addEventListener("drop", function (e) {
      e.preventDefault();
      li.classList.remove("drag-over");
      if (dragSrc && dragSrc !== li && dragSrc.parentNode === list) {
        var rect = li.getBoundingClientRect();
        var after = e.clientY > rect.top + rect.height / 2;
        list.insertBefore(dragSrc, after ? li.nextElementSibling : li);
        syncAfterMove(list);
      }
    });
    li.addEventListener("dragend", function () {
      li.classList.remove("dragging");
      li.draggable = false;
    });
  }

  var dragSrc = null;

  function syncAfterMove(list) {
    renumberSteps();
    updateMoveButtons(list);
    render();
    persist();
  }

  function renumberSteps() {
    var nums = stepList.querySelectorAll(".step-num");
    for (var i = 0; i < nums.length; i++) nums[i].textContent = i + 1;
  }

  function updateMoveButtons(list) {
    var rows = list.children;
    for (var i = 0; i < rows.length; i++) {
      rows[i].querySelector(".up").disabled = i === 0;
      rows[i].querySelector(".down").disabled = i === rows.length - 1;
    }
  }

  /* ---------- add buttons ---------- */
  document.getElementById("addIng").addEventListener("click", function () {
    ingList.appendChild(makeIngRow({}));
    updateMoveButtons(ingList);
    var inputs = ingList.lastElementChild.querySelectorAll("input");
    inputs[0].focus();
    render(); persist();
  });
  document.getElementById("addStep").addEventListener("click", function () {
    stepList.appendChild(makeStepRow(""));
    renumberSteps();
    updateMoveButtons(stepList);
    stepList.lastElementChild.querySelector("textarea").focus();
    render(); persist();
  });

  /* ---------- form fields ---------- */
  ["f-title", "f-desc", "f-prep", "f-cook", "f-servings", "f-diff", "f-diet"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      if (id === "f-servings") {
        var n = parseInt(document.getElementById("f-servings").value, 10);
        if (n > 0) { baseServings = n; scale = n; }
      }
      render(); persist();
    });
  });

  /* ---------- scaler ---------- */
  document.getElementById("scaleUp").addEventListener("click", function () {
    scale = Math.min(99, scale + 1); render(); persist();
  });
  document.getElementById("scaleDown").addEventListener("click", function () {
    scale = Math.max(1, scale - 1); render(); persist();
  });

  function scaleQty(qty) {
    if (baseServings <= 0) return qty;
    var num = parseFloat(qty);
    if (isNaN(num)) return qty;
    var scaled = (num * scale) / baseServings;
    var rounded = Math.round(scaled * 100) / 100;
    return (qty + "").replace(/^[\d.]+/, "" + rounded);
  }

  /* ---------- render preview ---------- */
  function val(id) { return document.getElementById(id).value.trim(); }

  function render() {
    var title = val("f-title") || "Untitled recipe";
    var desc = val("f-desc") || "A delicious dish waiting for its story.";
    var prep = parseInt(val("f-prep"), 10) || 0;
    var cook = parseInt(val("f-cook"), 10) || 0;
    var diff = val("f-diff") || "Medium";
    var diet = val("f-diet");

    document.getElementById("cardTitle").textContent = title;
    document.getElementById("cardDesc").textContent = desc;
    document.getElementById("cardPrep").textContent = prep + " min";
    document.getElementById("cardCook").textContent = cook + " min";
    document.getElementById("cardTotal").textContent = (prep + cook) + " min";
    document.getElementById("cardServes").textContent = scale;
    document.getElementById("cardDiff").textContent = diff;
    var dietEl = document.getElementById("cardDiet");
    dietEl.textContent = diet || "Cookbook recipe";
    document.getElementById("scaleVal").textContent =
      scale + " serving" + (scale === 1 ? "" : "s");

    // ingredients
    var ingsOut = document.getElementById("cardIngs");
    ingsOut.innerHTML = "";
    var ingRows = ingList.querySelectorAll(".ing-row");
    var any = false;
    ingRows.forEach(function (row) {
      var qty = row.querySelector(".qty").value.trim();
      var unit = row.querySelector(".unit").value.trim();
      var name = row.querySelector(".name").value.trim();
      if (!qty && !unit && !name) return;
      any = true;
      var li = document.createElement("li");
      var amt = document.createElement("span");
      amt.className = "amt";
      amt.textContent = [scaleQty(qty), unit].filter(Boolean).join(" ") || "—";
      var nm = document.createElement("span");
      nm.textContent = name || "(ingredient)";
      li.appendChild(amt);
      li.appendChild(nm);
      ingsOut.appendChild(li);
    });
    if (!any) ingsOut.innerHTML = '<li class="empty">Add ingredients to see them here.</li>';

    // steps
    var stepsOut = document.getElementById("cardSteps");
    stepsOut.innerHTML = "";
    var stepRows = stepList.querySelectorAll(".step-row textarea");
    var anyStep = false;
    stepRows.forEach(function (ta) {
      var t = ta.value.trim();
      if (!t) return;
      anyStep = true;
      var li = document.createElement("li");
      li.textContent = t;
      stepsOut.appendChild(li);
    });
    if (!anyStep) stepsOut.innerHTML = '<li class="empty">Write the method, step by step.</li>';
  }

  /* ---------- persistence ---------- */
  function collect() {
    var ings = [];
    ingList.querySelectorAll(".ing-row").forEach(function (row) {
      ings.push({
        qty: row.querySelector(".qty").value,
        unit: row.querySelector(".unit").value,
        name: row.querySelector(".name").value
      });
    });
    var steps = [];
    stepList.querySelectorAll(".step-row textarea").forEach(function (ta) {
      steps.push(ta.value);
    });
    return {
      title: val("f-title"), desc: val("f-desc"),
      prep: val("f-prep"), cook: val("f-cook"),
      servings: baseServings, difficulty: val("f-diff"), diet: val("f-diet"),
      ingredients: ings, steps: steps
    };
  }

  var persistTimer;
  function persist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collect()));
        saveState.textContent = "Draft saved · " +
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch (_) {
        saveState.textContent = "Draft not saved (storage off)";
      }
    }, 350);
  }

  /* ---------- load ---------- */
  function hydrate(data) {
    document.getElementById("f-title").value = data.title || "";
    document.getElementById("f-desc").value = data.desc || "";
    document.getElementById("f-prep").value = data.prep != null ? data.prep : "";
    document.getElementById("f-cook").value = data.cook != null ? data.cook : "";
    document.getElementById("f-servings").value = data.servings != null ? data.servings : "";
    document.getElementById("f-diff").value = data.difficulty || "Medium";
    document.getElementById("f-diet").value = data.diet || "";

    baseServings = parseInt(data.servings, 10) || 4;
    scale = baseServings;

    ingList.innerHTML = "";
    (data.ingredients && data.ingredients.length ? data.ingredients : [{}]).forEach(function (i) {
      ingList.appendChild(makeIngRow(i));
    });
    stepList.innerHTML = "";
    (data.steps && data.steps.length ? data.steps : [""]).forEach(function (s) {
      stepList.appendChild(makeStepRow(s));
    });
    renumberSteps();
    updateMoveButtons(ingList);
    updateMoveButtons(stepList);
    render();
  }

  function loadDraft() {
    var raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (_) {}
    if (raw) {
      try { hydrate(JSON.parse(raw)); saveState.textContent = "Draft restored"; return; }
      catch (_) {}
    }
    hydrate(defaults);
  }

  /* ---------- save with validation ---------- */
  document.getElementById("saveBtn").addEventListener("click", function () {
    var titleField = document.getElementById("f-title").closest(".field");
    var titleErr = document.getElementById("titleErr");
    var errors = [];

    if (!val("f-title")) {
      titleField.classList.add("invalid");
      titleErr.textContent = "Give your recipe a title.";
      errors.push("title");
    } else {
      titleField.classList.remove("invalid");
      titleErr.textContent = "";
    }

    var hasIng = false;
    ingList.querySelectorAll(".ing-row .name").forEach(function (n) {
      if (n.value.trim()) hasIng = true;
    });
    var hasStep = false;
    stepList.querySelectorAll(".step-row textarea").forEach(function (s) {
      if (s.value.trim()) hasStep = true;
    });

    if (!hasIng) errors.push("ingredients");
    if (!hasStep) errors.push("steps");

    if (errors.length) {
      var msg = errors.indexOf("title") > -1
        ? "Add a title before saving."
        : "Add at least one ingredient and one step.";
      toast(msg, "err");
      if (errors.indexOf("title") > -1) document.getElementById("f-title").focus();
      return;
    }

    persist();
    toast("Recipe saved 🍅", "ok");
  });

  /* ---------- reset ---------- */
  document.getElementById("resetBtn").addEventListener("click", function () {
    if (!confirm("Clear the editor and load the sample recipe?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    hydrate(defaults);
    document.getElementById("f-title").closest(".field").classList.remove("invalid");
    document.getElementById("titleErr").textContent = "";
    persist();
    toast("Reset to sample recipe");
  });

  loadDraft();
})();
