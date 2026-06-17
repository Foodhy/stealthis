(function () {
  "use strict";

  var FULL_PAN = "5412 7634 9981 4242";
  var REAL_CVV = "318";

  var card = document.getElementById("bankCard");
  var cardFlip = document.getElementById("cardFlip");
  var cvvVal = document.getElementById("cvvVal");
  var revealBtn = document.getElementById("revealBtn");
  var copyBtn = document.getElementById("copyBtn");
  var virtualBtn = document.getElementById("virtualBtn");

  var freezeToggle = document.getElementById("freezeToggle");
  var freezePanel = document.getElementById("freezePanel");
  var freezeTitle = document.getElementById("freezeTitle");
  var freezeDesc = document.getElementById("freezeDesc");

  var slider = document.getElementById("limitSlider");
  var limitVal = document.getElementById("limitVal");
  var limitPct = document.getElementById("limitPct");
  var limitBarFill = document.getElementById("limitBarFill");
  var limitBar = limitBarFill.parentElement;

  var SPENT = 1842;

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " toast-" + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast";
    }, 2400);
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  /* ---- Card flip + reveal CVV ---- */
  function setRevealed(on) {
    card.classList.toggle("flipped", on);
    cvvVal.textContent = on ? REAL_CVV : "•••";
    revealBtn.setAttribute("aria-pressed", on ? "true" : "false");
    revealBtn.lastChild.textContent = on ? " Hide CVV" : " Reveal CVV";
  }
  function isRevealed() {
    return card.classList.contains("flipped");
  }
  cardFlip.addEventListener("click", function () {
    setRevealed(!isRevealed());
  });
  revealBtn.addEventListener("click", function () {
    setRevealed(!isRevealed());
  });

  /* ---- Copy card number ---- */
  copyBtn.addEventListener("click", function () {
    function done() {
      toast("Card number copied · •••• 4242", "ok");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(FULL_PAN).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = FULL_PAN;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  });

  /* ---- Freeze / unfreeze ---- */
  function setFrozen(frozen) {
    card.setAttribute("data-frozen", frozen ? "true" : "false");
    freezeToggle.setAttribute("aria-checked", frozen ? "true" : "false");
    freezePanel.classList.toggle("frozen", frozen);
    freezeTitle.textContent = frozen ? "Card is frozen" : "Card is active";
    freezeDesc.textContent = frozen
      ? "All payments are temporarily blocked. Unfreeze any time."
      : "Payments, ATM and online use are enabled.";
    document.querySelectorAll(".quick-btn").forEach(function (b) {
      if (b !== freezeToggle) {
        b.disabled = frozen && b === virtualBtn ? false : b.disabled;
      }
    });
    toast(frozen ? "Card frozen ❄" : "Card unfrozen — ready to use", frozen ? "warn" : "ok");
  }
  freezeToggle.addEventListener("click", function () {
    setFrozen(card.getAttribute("data-frozen") !== "true");
  });

  /* ---- Spending limit slider ---- */
  function updateLimit() {
    var limit = parseInt(slider.value, 10);
    limitVal.textContent = money(limit);

    var sliderPct = ((limit - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty("--fill", sliderPct.toFixed(1) + "%");

    var used = Math.min(100, Math.round((SPENT / limit) * 100));
    limitPct.textContent = used + "% used";
    limitBarFill.style.width = used + "%";
    var over = SPENT > limit;
    limitBar.classList.toggle("over", over || used >= 90);
    limitPct.style.color = over ? "var(--danger)" : "var(--ink-2)";
  }
  slider.addEventListener("input", updateLimit);
  slider.addEventListener("change", function () {
    toast("Monthly limit set to " + money(parseInt(slider.value, 10)), "ok");
  });

  /* ---- Card controls toggles ---- */
  document.querySelectorAll(".settings-list .toggle").forEach(function (tg) {
    tg.addEventListener("click", function () {
      var on = tg.getAttribute("aria-checked") !== "true";
      tg.setAttribute("aria-checked", on ? "true" : "false");
      tg.classList.toggle("on", on);
      var name = tg.closest(".setting").querySelector(".s-name").textContent;
      toast(name + (on ? " enabled" : " disabled"), on ? "ok" : "warn");
    });
  });

  /* ---- Create virtual card ---- */
  var virtualCount = 0;
  virtualBtn.addEventListener("click", function () {
    virtualCount++;
    var last4 = String(1000 + Math.floor(Math.random() * 8999)).slice(-4);
    toast("Virtual card •••• " + last4 + " created", "ok");
  });

  /* init */
  updateLimit();
})();
