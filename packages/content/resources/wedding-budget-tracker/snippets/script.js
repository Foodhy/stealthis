(function () {
  "use strict";

  // --- Model -----------------------------------------------------------------
  var categories = [
    { id: "venue", name: "Venue & Rentals", note: "Vineyard hall, tables, tent", color: "#c98a86", estimated: 14000, actual: 12500 },
    { id: "catering", name: "Catering & Bar", note: "Dinner, drinks, cake", color: "#c9a24b", estimated: 11000, actual: 11800 },
    { id: "photo", name: "Photo & Video", note: "Full-day coverage", color: "#a8862f", estimated: 4500, actual: 4500 },
    { id: "florals", name: "Florals & Decor", note: "Bouquets, arch, centerpieces", color: "#e8b7b0", estimated: 3800, actual: 2100 },
    { id: "attire", name: "Attire & Beauty", note: "Dress, suit, hair, makeup", color: "#6b5555", estimated: 3200, actual: 2950 },
    { id: "music", name: "Music & Entertainment", note: "Band and DJ", color: "#9a8585", estimated: 2500, actual: 0 },
    { id: "stationery", name: "Stationery & Favors", note: "Invites, signage, gifts", color: "#c9a24b", estimated: 1600, actual: 640 },
  ];

  var budget = 42000;

  // --- Helpers ---------------------------------------------------------------
  var fmt = function (n) {
    var neg = n < 0;
    var s = "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
    return neg ? "-" + s : s;
  };

  var $ = function (id) { return document.getElementById(id); };

  var toastEl = $("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // --- Render categories -----------------------------------------------------
  var rowsEl = $("rows");
  var catSelect = $("catSelect");

  function buildSelect() {
    catSelect.innerHTML = "";
    categories.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      catSelect.appendChild(opt);
    });
  }

  function renderRows() {
    rowsEl.innerHTML = "";
    categories.forEach(function (c) {
      var remaining = c.estimated - c.actual;
      var over = c.actual > c.estimated;
      var li = document.createElement("li");
      li.className = "row";
      li.dataset.id = c.id;

      var status;
      if (c.actual === 0) {
        status = '<span class="badge empty">Unbooked</span>';
      } else if (over) {
        status = '<span class="badge warn-b">Over</span>';
      } else {
        status = '<span class="badge ok">On track</span>';
      }

      var remClass = over ? "rem-bad" : "rem-good";

      li.innerHTML =
        '<div class="cat-name"><span class="cat-dot" style="background:' + c.color + '"></span>' +
        '<span>' + c.name + '<span class="cat-sub">' + c.note + '</span></span></div>' +
        '<span class="num est" data-label="Estimated">' + fmt(c.estimated) + '</span>' +
        '<span class="num act" data-label="Actual">' + fmt(c.actual) + '</span>' +
        '<span class="num ' + remClass + '" data-label="Remaining">' + fmt(remaining) + '</span>' +
        '<span class="stat">' + status + '</span>';

      rowsEl.appendChild(li);
    });
  }

  // --- Totals + progress bar -------------------------------------------------
  var barTrack = $("barTrack");
  var barFill = $("barFill");

  function updateTotals() {
    var estTotal = 0, spent = 0;
    categories.forEach(function (c) {
      estTotal += c.estimated;
      spent += c.actual;
    });
    var remaining = budget - spent;
    var pct = budget > 0 ? (spent / budget) * 100 : 0;
    var over = spent > budget;

    barFill.style.width = Math.min(pct, 100) + "%";
    barTrack.classList.toggle("over", over);
    barTrack.setAttribute("aria-valuenow", Math.round(pct));

    $("pctLabel").textContent = Math.round(pct) + "% of budget used";
    $("spentTotal").textContent = fmt(spent);
    $("estTotal").textContent = fmt(estTotal);
    $("spentTile").textContent = fmt(spent);
    $("remainTile").textContent = fmt(remaining);

    var remainLabel = $("remainLabel");
    if (over) {
      remainLabel.textContent = fmt(Math.abs(remaining)) + " over budget";
      remainLabel.className = "remain-bad";
    } else {
      remainLabel.textContent = fmt(remaining) + " remaining";
      remainLabel.className = "remain-good";
    }

    var remTile = $("remainTile");
    remTile.style.color = over ? "#b0453f" : "";

    // Warning banner: overall over budget OR any category over.
    var overCats = categories.filter(function (c) { return c.actual > c.estimated; });
    var warn = $("warnBanner");
    var warnText = $("warnText");
    if (over) {
      warnText.textContent = "Heads up — you are " + fmt(Math.abs(remaining)) + " over your total budget.";
      warn.hidden = false;
    } else if (overCats.length) {
      var names = overCats.map(function (c) { return c.name; }).join(", ");
      warnText.textContent = overCats.length === 1
        ? names + " is over its estimate."
        : names + " are over their estimates.";
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }
  }

  // --- Add expense -----------------------------------------------------------
  var form = $("expenseForm");
  var itemInput = $("itemInput");
  var amountInput = $("amountInput");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var catId = catSelect.value;
    var item = itemInput.value.trim();
    var amount = parseFloat(amountInput.value);

    if (!item) {
      toast("Name the line item first");
      itemInput.focus();
      return;
    }
    if (!(amount > 0)) {
      toast("Enter an amount above zero");
      amountInput.focus();
      return;
    }

    var cat = categories.find(function (c) { return c.id === catId; });
    if (!cat) return;
    cat.actual += amount;

    renderRows();
    updateTotals();

    // Flash the affected row.
    var row = rowsEl.querySelector('.row[data-id="' + catId + '"]');
    if (row) {
      row.style.background = "var(--blush-50)";
      row.animate(
        [{ background: "#f6ddd6" }, { background: "rgba(251,238,236,0)" }],
        { duration: 900, easing: "ease-out" }
      );
    }

    toast(fmt(amount) + " logged to " + cat.name);

    form.reset();
    catSelect.value = catId;
    itemInput.focus();
  });

  // --- Editable budget -------------------------------------------------------
  $("budgetInput").addEventListener("input", function (e) {
    var v = parseFloat(e.target.value);
    budget = isNaN(v) || v < 0 ? 0 : v;
    updateTotals();
  });

  // --- Init ------------------------------------------------------------------
  buildSelect();
  renderRows();
  updateTotals();
})();
