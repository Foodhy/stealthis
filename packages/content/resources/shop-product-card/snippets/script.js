(function () {
  "use strict";

  var TINTS = ["indigo", "teal", "rose", "amber", "slate"];

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2400);
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /* ---------- cart badge ---------- */
  var bagCountEl = document.getElementById("bagCount");
  var bagCount = 0;
  function addToBag(qty) {
    bagCount += qty || 1;
    bagCountEl.textContent = String(bagCount);
    bagCountEl.classList.remove("is-pop");
    /* reflow to restart the pop animation */
    void bagCountEl.offsetWidth;
    bagCountEl.classList.add("is-pop");
  }
  document.getElementById("bagBtn").addEventListener("click", function () {
    toast(bagCount === 0 ? "Your bag is empty." : "Bag · " + bagCount + " item" + (bagCount === 1 ? "" : "s"));
  });

  /* ---------- per-card wiring ---------- */
  var cards = document.querySelectorAll(".card");

  cards.forEach(function (card) {
    var name = card.getAttribute("data-product");
    var price = Number(card.getAttribute("data-price"));
    var soldOut = card.classList.contains("is-soldout");
    var shot = card.querySelector(".shot");
    var swatches = card.querySelectorAll(".dot");

    /* swatch: hover previews the tint, click locks it in */
    var lockedColor = card.getAttribute("data-color");

    function applyTint(color) {
      if (!shot || TINTS.indexOf(color) === -1) return;
      TINTS.forEach(function (c) { shot.classList.remove("shot--" + c); });
      shot.classList.add("shot--" + color);
    }

    swatches.forEach(function (dot) {
      var color = dot.getAttribute("data-color");

      dot.addEventListener("mouseenter", function () { applyTint(color); });
      dot.addEventListener("focus", function () { applyTint(color); });
      dot.addEventListener("mouseleave", function () { applyTint(lockedColor); });
      dot.addEventListener("blur", function () { applyTint(lockedColor); });

      dot.addEventListener("click", function () {
        lockedColor = color;
        card.setAttribute("data-color", color);
        applyTint(color);
        swatches.forEach(function (d) { d.setAttribute("aria-pressed", "false"); });
        dot.setAttribute("aria-pressed", "true");
        toast(name + " — " + dot.getAttribute("data-name"));
      });
    });

    /* roving arrow-key navigation across swatches */
    card.querySelector(".swatches").addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      var list = Array.prototype.slice.call(swatches);
      var i = list.indexOf(document.activeElement);
      if (i === -1) i = 0;
      var next = e.key === "ArrowRight"
        ? (i + 1) % list.length
        : (i - 1 + list.length) % list.length;
      list[next].focus();
    });

    /* wishlist heart toggle */
    var wish = card.querySelector(".wish");
    if (wish) {
      wish.addEventListener("click", function () {
        var on = wish.getAttribute("aria-pressed") === "true";
        wish.setAttribute("aria-pressed", String(!on));
        wish.classList.remove("is-burst");
        void wish.offsetWidth;
        if (!on) wish.classList.add("is-burst");
        toast(!on ? "Saved " + name + " to wishlist" : "Removed " + name + " from wishlist");
      });
    }

    /* quick-add size buttons */
    var sizeBtns = card.querySelectorAll(".size:not([disabled])");
    sizeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (soldOut) return;
        var size = btn.getAttribute("data-size");
        var colorName = card.querySelector('.dot[aria-pressed="true"]');
        var colorLabel = colorName ? colorName.getAttribute("data-name") : "";
        addToBag(1);
        toast("Added " + name + " · " + colorLabel + " · " + size + " — " + money(price));
      });
    });

    /* sold-out: notify-me */
    if (soldOut) {
      var notify = card.querySelector(".quick__label");
      if (notify) {
        notify.style.cursor = "pointer";
        notify.setAttribute("role", "button");
        notify.setAttribute("tabindex", "0");
        var doNotify = function () { toast("We'll email you when " + name + " is back in stock."); };
        notify.addEventListener("click", doNotify);
        notify.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doNotify(); }
        });
      }
    }
  });
})();
