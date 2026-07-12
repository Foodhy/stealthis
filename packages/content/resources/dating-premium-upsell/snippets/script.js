(function () {
  "use strict";

  var TIER_RANK = { plus: 1, gold: 2, platinum: 3 };

  var state = { cycle: "monthly", plan: "gold" };

  var plans = Array.prototype.slice.call(document.querySelectorAll(".plan"));
  var toggle = document.getElementById("billingToggle");
  var toggleOpts = Array.prototype.slice.call(toggle.querySelectorAll(".toggle-opt"));
  var thumb = toggle.querySelector(".toggle-thumb");
  var perks = Array.prototype.slice.call(document.querySelectorAll(".perk"));
  var perkPlanName = document.getElementById("perkPlanName");
  var ctaTotal = document.getElementById("ctaTotal");
  var ctaSub = document.getElementById("ctaSub");
  var ctaPlanName = document.getElementById("ctaPlanName");
  var subscribeBtn = document.getElementById("subscribeBtn");
  var toastEl = document.getElementById("toast");

  function money(n) {
    return "$" + Number(n).toFixed(2);
  }

  function planData(el) {
    return {
      key: el.getAttribute("data-plan"),
      name: el.getAttribute("data-name"),
      monthly: parseFloat(el.getAttribute("data-monthly")),
      yearly: parseFloat(el.getAttribute("data-yearly"))
    };
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* Move sliding thumb under the active toggle option */
  function positionThumb() {
    var active = toggle.querySelector(".toggle-opt.is-active");
    if (!active) return;
    thumb.style.width = active.offsetWidth + "px";
    thumb.style.transform = "translateX(" + (active.offsetLeft - 5) + "px)";
  }

  /* Update every plan card's displayed price for the current cycle */
  function renderPrices() {
    plans.forEach(function (el) {
      var d = planData(el);
      var price = state.cycle === "yearly" ? d.yearly : d.monthly;
      el.querySelector(".amount").textContent = money(price);
      el.querySelector(".per").textContent = "/mo";
    });
  }

  /* Highlight selected plan + toggle unlocked perks */
  function renderSelection() {
    plans.forEach(function (el) {
      var selected = el.getAttribute("data-plan") === state.plan;
      el.classList.toggle("is-selected", selected);
      el.setAttribute("aria-checked", selected ? "true" : "false");
    });

    var current = plans.filter(function (el) {
      return el.getAttribute("data-plan") === state.plan;
    })[0];
    var d = planData(current);
    var rank = TIER_RANK[state.plan];

    perkPlanName.textContent = d.name;
    ctaPlanName.textContent = d.name;

    perks.forEach(function (li) {
      var included = TIER_RANK[li.getAttribute("data-tier")] <= rank;
      li.classList.toggle("is-included", included);
      li.classList.toggle("is-locked", !included);
    });

    renderCta(d);
  }

  function renderCta(d) {
    var price = state.cycle === "yearly" ? d.yearly : d.monthly;
    ctaTotal.innerHTML = money(price) + "<small>/mo</small>";
    if (state.cycle === "yearly") {
      var annual = money(d.yearly * 12);
      var saved = money((d.monthly - d.yearly) * 12);
      ctaSub.textContent = annual + "/yr · save " + saved + " · cancel anytime";
    } else {
      ctaSub.textContent = "Billed monthly · cancel anytime";
    }
  }

  /* ---- Events ---- */
  toggleOpts.forEach(function (opt) {
    opt.addEventListener("click", function () {
      state.cycle = opt.getAttribute("data-cycle");
      toggleOpts.forEach(function (o) {
        var on = o === opt;
        o.classList.toggle("is-active", on);
        o.setAttribute("aria-pressed", on ? "true" : "false");
      });
      positionThumb();
      renderPrices();
      renderSelection();
    });
  });

  plans.forEach(function (el, i) {
    el.addEventListener("click", function () {
      state.plan = el.getAttribute("data-plan");
      renderSelection();
    });
    /* Arrow-key navigation across the radiogroup */
    el.addEventListener("keydown", function (e) {
      var dir = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") dir = 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") dir = -1;
      else return;
      e.preventDefault();
      var next = plans[(i + dir + plans.length) % plans.length];
      state.plan = next.getAttribute("data-plan");
      renderSelection();
      next.focus();
    });
  });

  subscribeBtn.addEventListener("click", function () {
    var current = plans.filter(function (el) {
      return el.getAttribute("data-plan") === state.plan;
    })[0];
    var d = planData(current);
    var cadence = state.cycle === "yearly" ? "yearly" : "monthly";
    toast("You're on Spark " + d.name + " — " + cadence + " ✦");
    subscribeBtn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.96)" }, { transform: "scale(1)" }],
      { duration: 240, easing: "ease-out" }
    );
  });

  document.querySelector(".close").addEventListener("click", function () {
    toast("Maybe next time 💜");
  });

  window.addEventListener("resize", positionThumb);

  /* ---- Init ---- */
  renderPrices();
  renderSelection();
  positionThumb();
  /* re-run once fonts settle so thumb width is accurate */
  window.setTimeout(positionThumb, 120);
})();
