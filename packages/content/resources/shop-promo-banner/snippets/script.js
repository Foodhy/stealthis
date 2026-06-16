(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg, icon) {
    if (!toastEl) return;
    toastEl.innerHTML =
      '<span aria-hidden="true">' + (icon || "✓") + "</span><span></span>";
    toastEl.lastChild.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ---------- persistence (degrades gracefully) ---------- */
  var store = {
    get: function (k) {
      try {
        return window.localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        window.localStorage.setItem(k, v);
      } catch (e) {}
    },
    del: function (k) {
      try {
        window.localStorage.removeItem(k);
      } catch (e) {}
    },
  };
  var DISMISS_KEY = "stealthis_promo_announce_dismissed";

  /* ---------- announcement bar dismiss / restore ---------- */
  var announce = document.getElementById("announce");
  var closeBtn = document.getElementById("announceClose");
  var restoreBtn = document.getElementById("restoreBar");

  function setBar(hidden) {
    if (!announce) return;
    announce.classList.toggle("is-hidden", hidden);
    if (restoreBtn) restoreBtn.hidden = !hidden;
  }

  if (store.get(DISMISS_KEY) === "1") {
    setBar(true);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setBar(true);
      store.set(DISMISS_KEY, "1");
      toast("Banner hidden — preference saved", "🙈");
      if (restoreBtn) restoreBtn.focus();
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener("click", function () {
      setBar(false);
      store.del(DISMISS_KEY);
      if (closeBtn) closeBtn.focus();
    });
  }

  /* ---------- copy promo code ---------- */
  var copyBtn = document.getElementById("copyCode");
  var copyResetTimer = null;
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var code = "FREESHIP75";

      function done() {
        copyBtn.classList.add("is-copied");
        var icon = copyBtn.querySelector(".code-pill__icon");
        if (icon) icon.textContent = "✓";
        toast("Code " + code + " copied to clipboard", "🏷️");
        clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          if (icon) icon.textContent = "⧉";
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          var ta = document.createElement("textarea");
          ta.value = code;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch (e) {
          toast("Copy failed — code is FREESHIP75", "⚠️");
        }
      }
    });
  }

  /* ---------- live countdown ---------- */
  var els = {
    days: document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    mins: document.getElementById("cdMins"),
    secs: document.getElementById("cdSecs"),
  };
  var cdWrap = document.getElementById("countdown");

  // Target = a fixed-feeling deadline a few days out, recomputed per load.
  var DURATION_MS = 2 * 86400000 + 14 * 3600000 + 9 * 60000 + 33 * 1000;
  var target = Date.now() + DURATION_MS;

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function setNum(el, val) {
    if (el && el.textContent !== val) el.textContent = val;
  }

  var lastSec = -1;
  var cdInterval = null;

  function renderCountdown() {
    var diff = target - Date.now();
    if (diff <= 0) {
      setNum(els.days, "00");
      setNum(els.hours, "00");
      setNum(els.mins, "00");
      setNum(els.secs, "00");
      if (cdWrap) {
        cdWrap.classList.add("is-ended");
        cdWrap.setAttribute("aria-label", "Sale has ended");
      }
      if (cdInterval) {
        clearInterval(cdInterval);
        cdInterval = null;
        toast("Time's up — sale prices have ended", "⏰");
      }
      return;
    }
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var mins = Math.floor((s % 3600) / 60);
    var secs = s % 60;

    setNum(els.days, pad(days));
    setNum(els.hours, pad(hours));
    setNum(els.mins, pad(mins));
    setNum(els.secs, pad(secs));

    // subtle pulse once per second
    if (cdWrap && secs !== lastSec) {
      lastSec = secs;
      cdWrap.classList.remove("is-pulse");
      // force reflow to restart animation
      void cdWrap.offsetWidth;
      cdWrap.classList.add("is-pulse");
    }
  }

  renderCountdown();
  cdInterval = setInterval(renderCountdown, 1000);

  /* ---------- flash-deal stock meter ---------- */
  var STOCK_TOTAL = 60;
  var stockFill = document.getElementById("stockFill");
  var stockLeftEl = document.getElementById("stockLeft");
  var stockBar = stockFill ? stockFill.parentElement : null;
  var stockLeft = stockLeftEl ? parseInt(stockLeftEl.textContent, 10) || 9 : 9;

  function paintStock() {
    var pctSold = ((STOCK_TOTAL - stockLeft) / STOCK_TOTAL) * 100;
    if (stockFill) stockFill.style.width = pctSold.toFixed(1) + "%";
    if (stockLeftEl) stockLeftEl.textContent = stockLeft;
    if (stockBar) stockBar.setAttribute("aria-valuenow", String(stockLeft));
  }

  // animate the bar in after first paint
  if (stockFill) {
    requestAnimationFrame(function () {
      requestAnimationFrame(paintStock);
    });
  }

  /* ---------- add to cart (decrements live stock) ---------- */
  var addBtn = document.getElementById("addBtn");
  if (addBtn) {
    var addResetTimer = null;
    addBtn.addEventListener("click", function () {
      if (stockLeft <= 0) {
        toast("Sorry — this flash deal sold out", "🛑");
        return;
      }
      stockLeft -= 1;
      paintStock();

      addBtn.classList.add("is-added");
      var label = addBtn.firstChild;
      if (label) label.textContent = "Added to cart · ";

      if (stockLeft <= 0) {
        addBtn.disabled = true;
        addBtn.innerHTML = "Sold out";
        toast("Last pair claimed — sold out!", "🔥");
      } else {
        toast("Aero Knit Sneaker added · " + stockLeft + " left", "🛒");
        clearTimeout(addResetTimer);
        addResetTimer = setTimeout(function () {
          addBtn.classList.remove("is-added");
          if (addBtn.firstChild) addBtn.firstChild.textContent = "Add to cart · ";
        }, 1600);
      }
    });
  }

  /* ---------- hero "Shop the sale" ---------- */
  document.querySelectorAll("[data-shop]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Browsing the Mid-Season Sale", "🛍️");
    });
  });
})();
