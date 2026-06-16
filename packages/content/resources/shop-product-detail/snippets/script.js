(function () {
  "use strict";

  /* ---------- state ---------- */
  var BASE_PRICE = 149;        // base price for 32L / cobalt
  var COMPARE_AT = 194;        // strike-through compare-at
  var state = {
    color: "Cobalt",
    tone: "cobalt",
    size: "32L",
    sizeDelta: 0,
    qty: 1,
    wished: false,
    cart: 0
  };

  // per-size stock so variant selection can update the stock chip
  var STOCK = { "22L": 28, "32L": 14, "40L": 6, "55L": 0 };

  /* ---------- helpers ---------- */
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function unitPrice() {
    var p = BASE_PRICE + state.sizeDelta;
    return p < 0 ? 0 : p;
  }
  function unitCompare() {
    // keep the same discount ratio on the compare-at price
    var ratio = COMPARE_AT / BASE_PRICE;
    return Math.round(unitPrice() * ratio);
  }

  /* ---------- toast ---------- */
  var toastWrap = $("#toastWrap");
  var CHECK = '<span class="toast-ico"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg></span>';
  function toast(title, sub) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = CHECK + '<div class="toast-text"><strong>' + title + "</strong>" +
      (sub ? "<span>" + sub + "</span>" : "") + "</div>";
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* ---------- price / stock rendering ---------- */
  var elPrice = $("#price");
  var elWas = $("#priceWas");
  var elSave = $("#priceSave");
  var elAddPrice = $("#addPrice");
  var elBadge = $("#discountBadge");
  var stockChip = $("#stockChip");
  var stockNote = $("#stockNote");
  var addBtn = $("#addToCart");
  var buyBtn = $("#buyNow");

  function renderPrice() {
    var unit = unitPrice();
    var was = unitCompare();
    var save = was - unit;
    var pct = Math.round((save / was) * 100);

    elPrice.textContent = money(unit);
    elWas.textContent = money(was);
    elSave.textContent = "Save " + money(save);
    elAddPrice.textContent = money(unit * state.qty);
    elBadge.textContent = "−" + pct + "%";
  }

  function renderStock() {
    var left = STOCK[state.size];
    stockChip.classList.remove("in-stock", "low", "out");
    var soldOut = left <= 0;

    if (soldOut) {
      stockChip.classList.add("out");
      stockChip.textContent = "Sold out";
      stockNote.textContent = "Notify me when " + state.size + " is back";
    } else if (left <= 8) {
      stockChip.classList.add("low");
      stockChip.textContent = "Low stock";
      stockNote.textContent = "Ships today · only " + left + " left at this price";
    } else {
      stockChip.classList.add("in-stock");
      stockChip.textContent = "In stock";
      stockNote.textContent = "Ships today · " + left + " available";
    }

    addBtn.disabled = soldOut;
    buyBtn.disabled = soldOut;
    if (soldOut) {
      addBtn.querySelector(".btn-add-label").textContent = "Sold out";
      $("#addPrice").textContent = "";
    } else {
      addBtn.querySelector(".btn-add-label").textContent = "Add to cart ·";
      renderPrice();
    }
  }

  /* ---------- gallery ---------- */
  var stage = $("#stage");
  function setView(view) {
    stage.dataset.view = view;
    $all(".thumb").forEach(function (t) {
      var on = t.dataset.view === view;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  $all(".thumb").forEach(function (t) {
    t.addEventListener("click", function () { setView(t.dataset.view); });
  });

  function setTone(tone) {
    state.tone = tone;
    document.documentElement.style.setProperty("--tone", "");
    stage.dataset.tone = tone;
    // map tone to its palette by toggling a data-tone on the gallery
    var galleryMain = $(".gallery-main");
    galleryMain.setAttribute("data-tone", tone);
    stage.setAttribute("data-tone", tone);
    // thumbs share tone
    $all(".thumb").forEach(function (t) { t.setAttribute("data-tone", tone); });
  }

  /* ---------- color swatches ---------- */
  var colorValue = $("#colorValue");
  $all(".swatch").forEach(function (sw) {
    sw.addEventListener("click", function () { selectColor(sw); });
    sw.addEventListener("keydown", arrowNav(".swatch", selectColor));
  });
  function selectColor(sw) {
    $all(".swatch").forEach(function (s) {
      var on = s === sw;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-checked", on ? "true" : "false");
    });
    state.color = sw.dataset.color;
    colorValue.textContent = state.color;
    setTone(sw.dataset.tone);
    sw.focus();
  }

  /* ---------- size chips ---------- */
  $all(".chip").forEach(function (chip) {
    if (chip.classList.contains("is-disabled")) {
      chip.addEventListener("click", function () {
        toast("We'll let you know", state.color + " " + chip.dataset.size + " is sold out — tap to be notified.");
      });
      return;
    }
    chip.addEventListener("click", function () { selectSize(chip); });
    chip.addEventListener("keydown", arrowNav(".chip:not(.is-disabled)", selectSize));
  });
  function selectSize(chip) {
    $all(".chip").forEach(function (c) {
      var on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-checked", on ? "true" : "false");
    });
    state.size = chip.dataset.size;
    state.sizeDelta = parseInt(chip.dataset.delta, 10) || 0;
    renderStock();
    chip.focus();
  }

  /* roving arrow-key navigation for radio groups */
  function arrowNav(selector, choose) {
    return function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      var items = $all(selector);
      var i = items.indexOf(e.currentTarget);
      var fwd = e.key === "ArrowRight" || e.key === "ArrowDown";
      var next = items[(i + (fwd ? 1 : -1) + items.length) % items.length];
      if (next) choose(next);
    };
  }

  /* ---------- quantity stepper ---------- */
  var qtyInput = $("#qtyInput");
  var qtyMinus = $("#qtyMinus");
  var qtyPlus = $("#qtyPlus");
  var MAX_QTY = 12;

  function setQty(n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > MAX_QTY) { n = MAX_QTY; toast("Max reached", "Limited to " + MAX_QTY + " per order."); }
    state.qty = n;
    qtyInput.value = n;
    qtyMinus.disabled = n <= 1;
    qtyPlus.disabled = n >= MAX_QTY;
    renderPrice();
  }
  qtyMinus.addEventListener("click", function () { setQty(state.qty - 1); });
  qtyPlus.addEventListener("click", function () { setQty(state.qty + 1); });
  qtyInput.addEventListener("input", function () { qtyInput.value = qtyInput.value.replace(/[^0-9]/g, ""); });
  qtyInput.addEventListener("change", function () { setQty(qtyInput.value); });

  /* ---------- cart ---------- */
  var cartCount = $("#cartCount");
  function addToCart(qty, label) {
    state.cart += qty;
    cartCount.textContent = state.cart;
    cartCount.classList.add("show");
    cartCount.classList.remove("pop");
    void cartCount.offsetWidth; // reflow to restart animation
    cartCount.classList.add("pop");
    $("#cartButton").setAttribute("aria-label", "Cart, " + state.cart + " item" + (state.cart === 1 ? "" : "s"));
    toast("Added to cart", label);
  }

  addBtn.addEventListener("click", function () {
    if (addBtn.disabled) return;
    var label = state.qty + " × " + state.color + " Aurora Field Pack " + state.size +
      " — " + money(unitPrice() * state.qty);
    addToCart(state.qty, label);
  });

  buyBtn.addEventListener("click", function () {
    if (buyBtn.disabled) return;
    addToCart(state.qty, "Heading to secure checkout…");
    toast("Secure checkout", "Encrypted · this is a demo, no real payment.");
  });

  /* "you may also like" quick-add */
  $all(".card-add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".card");
      var name = card.getAttribute("data-name");
      var price = parseFloat(card.getAttribute("data-price"));
      addToCart(1, "1 × " + name + " — " + money(price));
    });
  });

  /* ---------- wishlist ---------- */
  var wishBtn = $("#wishBtn");
  var stageWish = $("#stageWish");
  function toggleWish() {
    state.wished = !state.wished;
    [wishBtn, stageWish].forEach(function (b) {
      b.setAttribute("aria-pressed", state.wished ? "true" : "false");
    });
    toast(state.wished ? "Saved to wishlist" : "Removed from wishlist",
      state.wished ? state.color + " Aurora Field Pack " + state.size : null);
  }
  wishBtn.addEventListener("click", toggleWish);
  stageWish.addEventListener("click", toggleWish);

  /* ---------- accordions ---------- */
  $all(".acc-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".acc-item");
      var open = item.classList.toggle("is-open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- review helpful votes ---------- */
  $all(".rev-help").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var span = btn.querySelector("span");
      var voted = btn.classList.toggle("voted");
      var n = parseInt(span.textContent.replace(/[^0-9]/g, ""), 10) || 0;
      span.textContent = "(" + (voted ? n + 1 : n - 1) + ")";
    });
  });

  $("#writeReview").addEventListener("click", function () {
    toast("Thanks!", "Review form would open here in a real store.");
  });

  /* ---------- init ---------- */
  setQty(1);
  setView("default");
  renderStock();
  renderPrice();
})();
