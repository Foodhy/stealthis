(function () {
  "use strict";

  // --- Currency model. rate is relative to USD (fictional, fixed demo rates). ---
  var CURRENCIES = {
    USD: { symbol: "$", rate: 1, decimals: 2, prefix: true },
    EUR: { symbol: "€", rate: 0.92, decimals: 2, prefix: true },
    GBP: { symbol: "£", rate: 0.79, decimals: 2, prefix: true },
    JPY: { symbol: "¥", rate: 156, decimals: 0, prefix: true }
  };

  var state = {
    currency: "USD",
    member: false,
    saleOn: true
  };

  // ---------- Money formatting ----------
  function formatMoney(usd) {
    var c = CURRENCIES[state.currency];
    var value = usd * c.rate;
    var parts = value.toFixed(c.decimals);
    var intPart = parts.split(".")[0];
    var frac = c.decimals > 0 ? "." + parts.split(".")[1] : "";
    // group thousands
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return c.symbol + intPart + frac;
  }

  // ---------- Toast ----------
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // ---------- Render all prices ----------
  function effectiveBase(el) {
    // returns the USD price honoring member toggle when a member value exists
    var base = parseFloat(el.getAttribute("data-base"));
    var member = el.getAttribute("data-member");
    if (state.member && member !== null && member !== "") {
      return { value: parseFloat(member), isMember: true };
    }
    return { value: base, isMember: false };
  }

  function renderPrice(el) {
    var eff = effectiveBase(el);
    var compareAttr = el.getAttribute("data-compare");
    var hasSale = el.classList.contains("price-sale") && state.saleOn && compareAttr;

    el.textContent = formatMoney(eff.value);

    // member visual + tag (only on active, non-sold-out prices)
    el.classList.toggle("is-member", eff.isMember && !el.classList.contains("price-muted"));
    var row = el.closest(".price-row");
    if (row) {
      var existingTag = row.querySelector(".member-tag");
      if (eff.isMember && !el.classList.contains("price-muted")) {
        if (!existingTag) {
          var tag = document.createElement("span");
          tag.className = "member-tag";
          tag.textContent = "Member";
          row.appendChild(tag);
        }
      } else if (existingTag) {
        existingTag.remove();
      }
    }
  }

  function renderCompare() {
    document.querySelectorAll(".compare").forEach(function (el) {
      var usd = parseFloat(el.getAttribute("data-compare"));
      el.textContent = formatMoney(usd);
    });
  }

  function renderOffBadges() {
    document.querySelectorAll("[data-off]").forEach(function (badge) {
      var card = badge.closest(".card");
      var priceEl = card.querySelector(".price");
      var compareEl = card.querySelector(".compare");
      if (!priceEl || !compareEl) return;
      var current = effectiveBase(priceEl).value;
      var compare = parseFloat(compareEl.getAttribute("data-compare"));
      var pct = Math.round((1 - current / compare) * 100);
      badge.textContent = pct + "% off";
    });
  }

  function renderUnits() {
    document.querySelectorAll("[data-unit]").forEach(function (el) {
      var baseUnit = parseFloat(el.getAttribute("data-base-unit"));
      var memberUnit = el.getAttribute("data-member-unit");
      var total = baseUnit;
      if (state.member && memberUnit) total = parseFloat(memberUnit);
      var qty = parseFloat(el.getAttribute("data-qty")) || 1;
      var per = total / qty;
      var suffix = el.textContent.indexOf("each") > -1 ? " each" : (el.textContent.indexOf("/ L") > -1 ? " / L" : "");
      // keep the unit label after the price
      if (suffix === " each") {
        el.textContent = formatMoney(per) + " each";
      } else if (suffix === " / L") {
        el.textContent = formatMoney(per) + " / L";
      } else {
        el.textContent = formatMoney(per);
      }
    });
  }

  function renderInstallments() {
    document.querySelectorAll("[data-installment]").forEach(function (el) {
      var base = parseFloat(el.getAttribute("data-base"));
      var member = el.getAttribute("data-member");
      var n = parseInt(el.getAttribute("data-n"), 10) || 4;
      var total = (state.member && member) ? parseFloat(member) : base;
      var per = total / n;
      var strong = el.querySelector("strong");
      if (strong) strong.textContent = formatMoney(per);
      // update the count prefix text node ("or 4× ")
      el.childNodes[0].nodeValue = "or " + n + "× ";
    });
  }

  function renderDropNotes() {
    document.querySelectorAll("[data-drop]").forEach(function (el) {
      var card = el.closest(".card");
      var priceEl = card.querySelector(".price");
      var compareEl = card.querySelector(".compare");
      if (!priceEl || !compareEl) return;
      var diff = parseFloat(compareEl.getAttribute("data-compare")) - effectiveBase(priceEl).value;
      el.textContent = "↓ Price dropped " + formatMoney(diff) + " — lowest in 30 days";
    });
  }

  function renderAll() {
    document.querySelectorAll(".price").forEach(renderPrice);
    renderCompare();
    renderOffBadges();
    renderUnits();
    renderInstallments();
    renderDropNotes();
  }

  // ---------- Currency switcher ----------
  var currencySelect = document.getElementById("currency");
  currencySelect.addEventListener("change", function () {
    state.currency = currencySelect.value;
    renderAll();
    toast("Prices shown in " + state.currency);
  });

  // ---------- Member toggle ----------
  var memberToggle = document.getElementById("member-toggle");
  function setMember(on) {
    state.member = on;
    memberToggle.setAttribute("aria-checked", on ? "true" : "false");
    renderAll();
  }
  memberToggle.addEventListener("click", function () {
    setMember(!state.member);
    toast(state.member ? "Member pricing applied" : "Member pricing off");
  });
  memberToggle.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      memberToggle.click();
    }
  });

  // ---------- Toggle sale demo ----------
  var saleBtn = document.getElementById("toggle-sale");
  var saleCard = document.getElementById("sale-card");

  function applySaleState() {
    var priceEl = saleCard.querySelector(".price");
    var compareEl = saleCard.querySelector(".compare");
    var badgeEl = saleCard.querySelector("[data-off]");
    var dropEl = saleCard.querySelector("[data-drop]");
    var chipEl = document.getElementById("low-stock");

    if (state.saleOn) {
      saleCard.setAttribute("data-state", "sale");
      priceEl.classList.add("price-sale");
      compareEl.style.display = "";
      badgeEl.style.display = "";
      if (dropEl) dropEl.style.display = "";
      chipEl.textContent = "Only 4 left";
      chipEl.className = "chip chip-low";
      saleBtn.setAttribute("aria-pressed", "true");
      saleBtn.textContent = "End flash sale";
    } else {
      saleCard.setAttribute("data-state", "regular");
      priceEl.classList.remove("price-sale");
      compareEl.style.display = "none";
      badgeEl.style.display = "none";
      if (dropEl) dropEl.style.display = "none";
      chipEl.textContent = "In stock";
      chipEl.className = "chip chip-stock";
      saleBtn.setAttribute("aria-pressed", "false");
      saleBtn.textContent = "Start flash sale";
    }
    renderAll();
  }

  saleBtn.addEventListener("click", function () {
    state.saleOn = !state.saleOn;
    applySaleState();
    toast(state.saleOn ? "Flash sale started — 33% off" : "Sale ended — regular price restored");
  });

  // ---------- Add to cart / notify ----------
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".card");
      var title = card.querySelector(".title").textContent;
      var price = card.querySelector(".price").textContent;
      var verb = card.getAttribute("data-state") === "preorder" ? "Reserved" : "Added";
      toast(verb + " · " + title + " — " + price);
    });
  });

  document.querySelectorAll("[data-notify]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".card");
      var title = card.querySelector(".title").textContent;
      toast("We'll email you when " + title + " is back");
    });
  });

  // ---------- Init ----------
  applySaleState(); // also calls renderAll()
})();
