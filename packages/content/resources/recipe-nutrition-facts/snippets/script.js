(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Base recipe nutrition data.
   * All amounts are TOTALS for the whole pot at the BASE serving count.
   * The panel derives per-serving / per-100g values from these.
   * ------------------------------------------------------------- */
  var BASE_SERVINGS = 4;
  var TOTAL_WEIGHT_G = 1280; // whole pot, grams

  // Macros in grams (totals for whole pot) + energy per gram.
  var MACRO_KCAL = { carbs: 4, protein: 4, fat: 9 };
  var MACROS = {
    carbs: { name: "Carbohydrate", grams: 188 },
    protein: { name: "Protein", grams: 64 },
    fat: { name: "Fat", grams: 56 },
  };

  // Detailed nutrients: totals for whole pot. unit + Daily Value reference.
  // dv = recommended daily amount in the same unit (0 = no %DV shown).
  var NUTRIENTS = [
    { key: "fat", name: "Total Fat", grams: 56, unit: "g", dv: 78 },
    { key: "satfat", name: "Saturated Fat", grams: 11.2, unit: "g", dv: 20, sub: true },
    { key: "transfat", name: "Trans Fat", grams: 0, unit: "g", dv: 0, sub: true },
    { key: "chol", name: "Cholesterol", grams: 0.024, unit: "mg", dv: 300, scale: 1000 },
    { key: "sodium", name: "Sodium", grams: 2.28, unit: "mg", dv: 2300, scale: 1000 },
    { key: "carbs", name: "Total Carbohydrate", grams: 188, unit: "g", dv: 275 },
    { key: "fiber", name: "Dietary Fiber", grams: 44, unit: "g", dv: 28, sub: true },
    { key: "sugar", name: "Total Sugars", grams: 24, unit: "g", dv: 0, sub: true },
    { key: "addsugar", name: "Added Sugars", grams: 6, unit: "g", dv: 50, sub: true },
    { key: "protein", name: "Protein", grams: 64, unit: "g", dv: 50 },
    { key: "vitd", name: "Vitamin D", grams: 0.0000024, unit: "mcg", dv: 20, scale: 1000000 },
    { key: "calcium", name: "Calcium", grams: 0.62, unit: "mg", dv: 1300, scale: 1000 },
    { key: "iron", name: "Iron", grams: 0.0148, unit: "mg", dv: 18, scale: 1000 },
    { key: "potassium", name: "Potassium", grams: 3.52, unit: "mg", dv: 4700, scale: 1000 },
  ];

  /* ---------------- State ---------------- */
  var state = {
    servings: BASE_SERVINGS,
    basis: "serving", // "serving" | "100g"
  };

  /* ---------------- Helpers ---------------- */
  function totalKcal() {
    return (
      MACROS.carbs.grams * MACRO_KCAL.carbs +
      MACROS.protein.grams * MACRO_KCAL.protein +
      MACROS.fat.grams * MACRO_KCAL.fat
    );
  }

  // Fraction of the whole pot represented by ONE display unit.
  function portionFraction() {
    if (state.basis === "100g") {
      return 100 / TOTAL_WEIGHT_G;
    }
    return 1 / state.servings;
  }

  function fmt(n) {
    if (n === 0) return "0";
    var abs = Math.abs(n);
    if (abs >= 100) return Math.round(n).toString();
    if (abs >= 10) return (Math.round(n * 10) / 10).toString();
    if (abs >= 1) return (Math.round(n * 10) / 10).toString();
    return (Math.round(n * 100) / 100).toString();
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2000);
  }

  /* ---------------- Render ---------------- */
  function render() {
    var frac = portionFraction();

    // Servings readout + portion weight
    var servReadout = document.getElementById("serv-readout");
    var weightReadout = document.getElementById("weight-readout");
    servReadout.textContent =
      state.servings + (state.servings === 1 ? " serving" : " servings");
    var perServingG = Math.round(TOTAL_WEIGHT_G / state.servings);
    weightReadout.textContent = "≈ " + perServingG + " g per serving";

    // Calories
    var cal = Math.round(totalKcal() * frac);
    document.getElementById("cal-value").textContent = cal.toLocaleString();
    document.getElementById("cal-unit").textContent =
      state.basis === "100g" ? "per 100 g" : "per serving";

    // Macro bars — share of energy (independent of basis)
    var energy = {
      carbs: MACROS.carbs.grams * MACRO_KCAL.carbs,
      protein: MACROS.protein.grams * MACRO_KCAL.protein,
      fat: MACROS.fat.grams * MACRO_KCAL.fat,
    };
    var energyTotal = energy.carbs + energy.protein + energy.fat;

    document.querySelectorAll(".macro").forEach(function (li) {
      var key = li.getAttribute("data-macro");
      var grams = MACROS[key].grams * frac;
      var pct = Math.round((energy[key] / energyTotal) * 100);
      li.querySelector("[data-grams]").textContent = fmt(grams) + " g";
      li.querySelector("[data-pct]").textContent = pct + "%";
      li.querySelector("[data-fill]").style.width = pct + "%";
      var bar = li.querySelector(".bar");
      bar.setAttribute(
        "aria-label",
        MACROS[key].name + ": " + pct + " percent of energy, " + fmt(grams) + " grams"
      );
    });

    // Detailed table
    var tbody = document.getElementById("nf-rows");
    tbody.innerHTML = "";
    NUTRIENTS.forEach(function (n) {
      var displayGrams = n.grams * frac; // grams of the base nutrient store
      var scale = n.scale || 1;
      var amount = displayGrams * scale; // converted to display unit (mg/mcg)

      var tr = document.createElement("tr");
      if (n.sub) tr.className = "is-sub";

      var nameTd = document.createElement("td");
      nameTd.className = "row-name";
      nameTd.textContent = n.name;

      var amtTd = document.createElement("td");
      amtTd.className = "cell-amt";
      amtTd.textContent = fmt(amount) + " " + n.unit;

      var dvTd = document.createElement("td");
      dvTd.className = "cell-dv";
      if (n.dv > 0) {
        // %DV uses the same display unit; dv stored in display unit already.
        var dvPct = Math.round((amount / n.dv) * 100);
        var pill = document.createElement("span");
        pill.className = "dv-pill";
        if (dvPct >= 20) pill.classList.add("is-high");
        else if (dvPct < 5) pill.classList.add("is-low");
        pill.textContent = dvPct + "%";
        dvTd.appendChild(pill);
      } else {
        dvTd.textContent = "—";
      }

      tr.appendChild(nameTd);
      tr.appendChild(amtTd);
      tr.appendChild(dvTd);
      tbody.appendChild(tr);
    });
  }

  /* ---------------- Events ---------------- */
  var servInput = document.getElementById("servings");

  function setServings(v) {
    v = Math.max(1, Math.min(24, Math.round(v) || 1));
    state.servings = v;
    servInput.value = v;
    render();
  }

  servInput.addEventListener("input", function () {
    var v = parseInt(servInput.value, 10);
    if (!isNaN(v)) {
      state.servings = Math.max(1, Math.min(24, v));
      render();
    }
  });

  servInput.addEventListener("blur", function () {
    setServings(parseInt(servInput.value, 10));
  });

  document.getElementById("serv-minus").addEventListener("click", function () {
    setServings(state.servings - 1);
    toast("Scaled to " + state.servings + " servings");
  });

  document.getElementById("serv-plus").addEventListener("click", function () {
    setServings(state.servings + 1);
    toast("Scaled to " + state.servings + " servings");
  });

  document.querySelectorAll(".basis-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var basis = btn.getAttribute("data-basis");
      if (basis === state.basis) return;
      state.basis = basis;
      document.querySelectorAll(".basis-btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
      toast(basis === "100g" ? "Showing per 100 g" : "Showing per serving");
    });
  });

  /* ---------------- Init ---------------- */
  render();
})();
