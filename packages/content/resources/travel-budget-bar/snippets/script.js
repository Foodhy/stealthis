(function () {
  "use strict";

  /* ---------- Data ---------- */
  var categories = [
    { id: "flights", label: "Flights", icon: "✈️", amount: 2100, accent: "var(--c-flights)" },
    { id: "stay", label: "Stay", icon: "🏨", amount: 1860, accent: "var(--c-stay)" },
    { id: "food", label: "Food", icon: "🍜", amount: 1080, accent: "var(--c-food)" },
    { id: "activities", label: "Activities", icon: "⛩️", amount: 760, accent: "var(--c-activities)" },
    { id: "transport", label: "Transport", icon: "🚅", amount: 400, accent: "var(--c-transport)" }
  ];

  // immutable copy of the suggested defaults for "reset"
  var defaults = categories.map(function (c) {
    return c.amount;
  });

  var TRIP_DAYS = 12;
  var TRAVELLERS = 2;

  /* ---------- Helpers ---------- */
  var fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
  function money(n) {
    return fmt.format(Math.round(n));
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  /* ---------- Elements ---------- */
  var totalInput = document.getElementById("total");
  var bar = document.getElementById("bar");
  var legend = document.getElementById("legend");
  var rowsEl = document.getElementById("rows");
  var scaleMid = document.getElementById("scale-mid");
  var scaleEnd = document.getElementById("scale-end");

  var sumAllocated = document.getElementById("sum-allocated");
  var sumRemaining = document.getElementById("sum-remaining");
  var sumPerday = document.getElementById("sum-perday");
  var sumPerperson = document.getElementById("sum-perperson");
  var remainingItem = document.getElementById("remaining-item");
  var remainingLabel = document.getElementById("remaining-label");

  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg, warn) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("toast--warn", !!warn);
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  function getTotal() {
    var v = parseFloat(totalInput.value);
    return isNaN(v) || v < 0 ? 0 : v;
  }

  /* ---------- Build rows ---------- */
  // Slider range adapts to budget so categories can span a useful range.
  function sliderMax() {
    return Math.max(getTotal(), 1000);
  }

  categories.forEach(function (cat) {
    var li = document.createElement("li");
    li.className = "row";
    li.style.setProperty("--accent", cat.accent);
    li.dataset.id = cat.id;

    li.innerHTML =
      '<div class="row__head">' +
      '<span class="row__icon" aria-hidden="true">' + cat.icon + "</span>" +
      '<span class="row__name">' +
      '<span class="row__title">' + cat.label + "</span>" +
      '<span class="row__pct" data-pct>0% of budget</span>' +
      "</span>" +
      "</div>" +
      '<input class="row__slider" type="range" min="0" step="20" ' +
      'aria-label="' + cat.label + ' amount" />' +
      '<span class="row__amount">' +
      '<span class="money-input">' +
      '<span class="money-input__sym" aria-hidden="true">$</span>' +
      '<input class="money-input__field" type="number" min="0" step="20" inputmode="numeric" ' +
      'aria-label="' + cat.label + ' amount in dollars" />' +
      "</span>" +
      "</span>";

    rowsEl.appendChild(li);

    cat._row = li;
    cat._slider = li.querySelector(".row__slider");
    cat._number = li.querySelector(".money-input__field");
    cat._pct = li.querySelector("[data-pct]");

    // slider drag → update amount live
    cat._slider.addEventListener("input", function () {
      cat.amount = clamp(parseFloat(cat._slider.value) || 0, 0, sliderMax());
      render();
    });

    // number field → update amount (allow exceeding slider max)
    cat._number.addEventListener("input", function () {
      var v = parseFloat(cat._number.value);
      cat.amount = isNaN(v) || v < 0 ? 0 : v;
      render();
    });
    // normalise on blur (no negatives / NaN left behind)
    cat._number.addEventListener("blur", function () {
      cat._number.value = Math.round(cat.amount);
    });
  });

  // build legend chips once
  categories.forEach(function (cat) {
    var item = document.createElement("span");
    item.className = "legend__item";
    item.innerHTML =
      '<span class="legend__dot" style="background:' + cat.accent + '"></span>' +
      cat.label +
      ' <strong data-leg="' + cat.id + '" style="margin-left:.15rem">$0</strong>';
    legend.appendChild(item);
  });

  /* ---------- Render ---------- */
  function render() {
    var total = getTotal();
    var allocated = categories.reduce(function (s, c) {
      return s + c.amount;
    }, 0);
    var remaining = total - allocated;
    var over = remaining < 0;

    // denominator for segment widths: stretch to allocated when over budget so
    // every category stays visible; the budget line then sits before the end.
    var scaleTotal = Math.max(total, allocated, 1);

    // rebuild stacked bar
    bar.innerHTML = "";
    categories.forEach(function (cat) {
      var pctOfScale = (cat.amount / scaleTotal) * 100;
      var seg = document.createElement("span");
      seg.className = "seg";
      seg.style.width = pctOfScale + "%";
      seg.style.background = cat.accent;
      seg.title = cat.label + " · " + money(cat.amount);
      bar.appendChild(seg);

      // sliders/pcts
      var max = sliderMax();
      cat._slider.max = max;
      cat._slider.value = Math.min(cat.amount, max);
      cat._slider.style.setProperty("--fill", ((Math.min(cat.amount, max) / max) * 100).toFixed(2));
      if (document.activeElement !== cat._number) {
        cat._number.value = Math.round(cat.amount);
      }
      var pctOfBudget = total > 0 ? (cat.amount / total) * 100 : 0;
      cat._pct.textContent = Math.round(pctOfBudget) + "% of budget";

      var legVal = legend.querySelector('[data-leg="' + cat.id + '"]');
      if (legVal) legVal.textContent = money(cat.amount);
    });

    // when over budget, the five segments fill the bar (scaled to allocated);
    // drop a "budget line" marker showing where the limit falls, plus stripe the
    // portion of each segment beyond it via the bar's over state.
    if (over) {
      var marker = document.createElement("span");
      marker.className = "bar__limit";
      marker.style.left = (total / scaleTotal) * 100 + "%";
      marker.title = "Budget limit · " + money(total);
      bar.appendChild(marker);
    }
    bar.classList.toggle("is-over", over);
    bar.setAttribute(
      "aria-label",
      "Budget bar. Allocated " +
        money(allocated) +
        " of " +
        money(total) +
        ". " +
        (over ? "Over budget by " + money(Math.abs(remaining)) : money(remaining) + " remaining")
    );

    // scale labels
    scaleMid.textContent = money(scaleTotal / 2);
    scaleEnd.textContent = money(scaleTotal);

    // summary
    sumAllocated.textContent = money(allocated);
    sumPerday.textContent = money(allocated / TRIP_DAYS);
    sumPerperson.textContent = money(allocated / TRIP_DAYS / TRAVELLERS);

    if (over) {
      remainingLabel.textContent = "Over budget";
      sumRemaining.textContent = "−" + money(Math.abs(remaining));
      remainingItem.classList.add("is-over");
    } else {
      remainingLabel.textContent = "Remaining";
      sumRemaining.textContent = money(remaining);
      remainingItem.classList.remove("is-over");
    }
  }

  /* ---------- Total budget input ---------- */
  var wasOver = false;
  totalInput.addEventListener("input", function () {
    render();
    var total = getTotal();
    var allocated = categories.reduce(function (s, c) {
      return s + c.amount;
    }, 0);
    var nowOver = allocated > total;
    if (nowOver && !wasOver) {
      toast("Over budget by " + money(allocated - total), true);
    }
    wasOver = nowOver;
  });
  totalInput.addEventListener("blur", function () {
    if (getTotal() === 0) toast("Set a budget to see remaining per day");
  });

  /* ---------- Reset ---------- */
  document.getElementById("reset").addEventListener("click", function () {
    categories.forEach(function (cat, i) {
      cat.amount = defaults[i];
    });
    totalInput.value = 6400;
    wasOver = false;
    render();
    toast("Reset to suggested split");
  });

  /* ---------- Warn-once when a slider drag tips over budget ---------- */
  categories.forEach(function (cat) {
    cat._slider.addEventListener("change", function () {
      var total = getTotal();
      var allocated = categories.reduce(function (s, c) {
        return s + c.amount;
      }, 0);
      if (allocated > total && !wasOver) {
        toast("That tips you " + money(allocated - total) + " over budget", true);
      }
      wasOver = allocated > total;
    });
  });

  /* ---------- Init ---------- */
  render();
})();
