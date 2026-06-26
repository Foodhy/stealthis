(function () {
  "use strict";

  var LABELS = {
    liability: "Liability",
    collision: "Collision",
    comprehensive: "Comprehensive",
    roadside: "Roadside assistance",
    rental: "Rental reimbursement",
  };

  var modules = Array.prototype.slice.call(document.querySelectorAll(".module"));
  var summaryList = document.getElementById("summaryList");
  var totalMonthlyEl = document.getElementById("totalMonthly");
  var totalAnnualEl = document.getElementById("totalAnnual");
  var continueBtn = document.getElementById("continueBtn");

  var checkIcon =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 6L9 17l-5-5"/></svg>';

  function fmt(n) {
    return n.toLocaleString("en-US");
  }

  // Returns { price, metaText } for one module's current state.
  function readModule(mod) {
    var flat = mod.querySelector(".opts__price");
    if (flat) {
      return { price: parseInt(flat.dataset.price, 10) || 0, meta: "24/7 nationwide" };
    }
    var active = mod.querySelector(".chip.is-on");
    if (!active) return { price: 0, meta: "" };
    var price = parseInt(active.dataset.price, 10) || 0;
    var label = mod.querySelector(".opts__label");
    var meta = (label ? label.textContent.trim() + ": " : "") + active.textContent.trim();
    return { price: price, meta: meta };
  }

  function recalc() {
    var total = 0;
    var rows = [];

    modules.forEach(function (mod) {
      var input = mod.querySelector('input[type="checkbox"]');
      var on = input.checked;
      mod.classList.toggle("is-active", on);
      mod.classList.toggle("is-off", !on);

      var opts = mod.querySelector(".module__opts");
      if (opts) opts.style.display = on ? "" : "none";

      if (!on) return;
      var id = mod.dataset.id;
      var info = readModule(mod);
      total += info.price;
      rows.push({ id: id, price: info.price, meta: info.meta });
    });

    // Render summary
    summaryList.innerHTML = "";
    if (rows.length === 0) {
      var li = document.createElement("li");
      li.className = "summary__empty";
      li.textContent = "No coverage selected yet.";
      summaryList.appendChild(li);
    } else {
      rows.forEach(function (r) {
        var li = document.createElement("li");
        li.className = "summary__row";
        li.innerHTML =
          '<span class="name">' + checkIcon +
          "<span>" + LABELS[r.id] +
          (r.meta ? '<br><span class="meta">' + r.meta + "</span>" : "") +
          "</span></span>" +
          '<span class="cost">$' + r.price + "</span>";
        summaryList.appendChild(li);
      });
    }

    animateNumber(totalMonthlyEl, total);
    totalAnnualEl.textContent = "$" + fmt(total * 12);

    // reset CTA state if user changes things after "confirming"
    if (continueBtn.classList.contains("is-done")) {
      continueBtn.classList.remove("is-done");
      continueBtn.textContent = "Continue to checkout";
    }
  }

  // Small count-up so the big number feels responsive.
  function animateNumber(el, target) {
    var current = parseInt(el.textContent.replace(/[^0-9]/g, ""), 10) || 0;
    if (current === target) {
      el.textContent = fmt(target);
      return;
    }
    var steps = 12;
    var step = (target - current) / steps;
    var i = 0;
    clearInterval(el._timer);
    el._timer = setInterval(function () {
      i++;
      current += step;
      if (i >= steps) {
        clearInterval(el._timer);
        current = target;
      }
      el.textContent = fmt(Math.round(current));
    }, 16);
  }

  // Toggle handlers
  modules.forEach(function (mod) {
    var input = mod.querySelector('input[type="checkbox"]');
    if (!input.disabled) {
      input.addEventListener("change", recalc);
    }

    // Chip (limit / deductible) handlers
    var chipGroup = mod.querySelector(".chips");
    if (chipGroup) {
      chipGroup.addEventListener("click", function (e) {
        var chip = e.target.closest(".chip");
        if (!chip) return;
        chipGroup.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("is-on");
          c.setAttribute("aria-checked", "false");
        });
        chip.classList.add("is-on");
        chip.setAttribute("aria-checked", "true");
        recalc();
      });

      // Arrow-key support within a radiogroup
      chipGroup.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var chips = Array.prototype.slice.call(chipGroup.querySelectorAll(".chip"));
        var idx = chips.indexOf(document.activeElement);
        if (idx === -1) return;
        e.preventDefault();
        var next = e.key === "ArrowRight" ? idx + 1 : idx - 1;
        next = (next + chips.length) % chips.length;
        chips[next].focus();
        chips[next].click();
      });
    }
  });

  continueBtn.addEventListener("click", function () {
    continueBtn.classList.add("is-done");
    continueBtn.textContent = "Coverage saved ✓";
  });

  recalc();
})();
