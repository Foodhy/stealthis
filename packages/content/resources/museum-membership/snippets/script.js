(function () {
  "use strict";

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  var fmt = new Intl.NumberFormat("en-US");

  /* ---- Billing cycle toggle ---- */
  var cycleBtns = Array.prototype.slice.call(
    document.querySelectorAll(".cycle-btn")
  );
  var amounts = Array.prototype.slice.call(document.querySelectorAll(".amount"));
  var pers = Array.prototype.slice.call(document.querySelectorAll("[data-per]"));
  var billeds = Array.prototype.slice.call(
    document.querySelectorAll("[data-billed]")
  );

  var currentCycle = "monthly";

  function renderPrices(cycle, animate) {
    amounts.forEach(function (el) {
      var monthly = Number(el.getAttribute("data-price-monthly"));
      var annual = Number(el.getAttribute("data-price-annual"));
      var value = cycle === "annual" ? annual : monthly;
      var text = "$" + fmt.format(value);

      if (animate) {
        el.classList.add("is-flip");
        window.setTimeout(function () {
          el.textContent = text;
          el.classList.remove("is-flip");
        }, 160);
      } else {
        el.textContent = text;
      }
    });

    pers.forEach(function (el) {
      el.textContent = cycle === "annual" ? "/ year" : "/ month";
    });
    billeds.forEach(function (el) {
      el.textContent =
        cycle === "annual"
          ? "Billed annually — two months on us"
          : "Billed monthly";
    });
  }

  function setCycle(cycle) {
    if (cycle === currentCycle) return;
    currentCycle = cycle;
    cycleBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-cycle") === cycle;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    renderPrices(cycle, true);
    toast(
      cycle === "annual"
        ? "Showing annual pricing — two months free."
        : "Showing monthly pricing."
    );
  }

  cycleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setCycle(btn.getAttribute("data-cycle"));
    });
  });

  /* ---- Join CTAs ---- */
  var joinBtns = Array.prototype.slice.call(
    document.querySelectorAll(".join")
  );
  joinBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tier = btn.getAttribute("data-join");
      var card = btn.closest(".tier");
      var priceEl = card ? card.querySelector(".amount") : null;
      var price = priceEl ? priceEl.textContent : "";
      var cadence = currentCycle === "annual" ? "year" : "month";

      // Reset any previously selected card
      joinBtns.forEach(function (other) {
        if (other !== btn) {
          other.classList.remove("is-joined");
          other.textContent = other.getAttribute("data-label-default");
        }
      });

      btn.classList.add("is-joined");
      btn.textContent = "Selected ✓";

      toast(
        tier +
          " membership selected — " +
          price +
          " / " +
          cadence +
          ". Proceed to checkout."
      );
    });
  });

  // Cache default labels so we can restore them
  joinBtns.forEach(function (btn) {
    btn.setAttribute("data-label-default", btn.textContent);
  });

  /* ---- Init ---- */
  renderPrices(currentCycle, false);
})();
