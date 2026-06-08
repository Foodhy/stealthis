(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  /* ============================================================
     TABS
  ============================================================ */
  var tabs = document.getElementById("tabs");
  var tabButtons = Array.prototype.slice.call(tabs.querySelectorAll(".tab"));
  var panels = {
    buy: document.getElementById("panel-buy"),
    redeem: document.getElementById("panel-redeem"),
  };

  function activateTab(name) {
    tabs.setAttribute("data-active", name);
    tabButtons.forEach(function (btn) {
      var on = btn.dataset.tab === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    });
    Object.keys(panels).forEach(function (key) {
      var p = panels[key];
      var on = key === name;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  }

  tabButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      activateTab(btn.dataset.tab);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = (i + dir + tabButtons.length) % tabButtons.length;
      tabButtons[next].focus();
      activateTab(tabButtons[next].dataset.tab);
    });
  });

  /* ============================================================
     BUY — live preview + summary
  ============================================================ */
  var state = { amount: 75 };

  var cardAmount = document.getElementById("cardAmount");
  var cardTo = document.getElementById("cardTo");
  var cardMessage = document.getElementById("cardMessage");
  var cardExpiry = document.getElementById("cardExpiry");
  var sumValue = document.getElementById("sumValue");
  var sumTotal = document.getElementById("sumTotal");

  var amountsWrap = document.getElementById("amounts");
  var presetBtns = Array.prototype.slice.call(
    amountsWrap.querySelectorAll(".amount[data-amount]")
  );
  var customInput = document.getElementById("customAmount");
  var amountHint = document.getElementById("amountHint");

  var recipient = document.getElementById("recipient");
  var deliveryDate = document.getElementById("deliveryDate");
  var message = document.getElementById("message");
  var msgCount = document.getElementById("msgCount");
  var email = document.getElementById("email");

  function bumpCard() {
    cardAmount.classList.remove("bump");
    void cardAmount.offsetWidth;
    cardAmount.classList.add("bump");
  }

  function renderAmount() {
    var valid = state.amount >= 25 && state.amount <= 2000;
    cardAmount.textContent = money(state.amount || 0);
    sumValue.textContent = money(valid ? state.amount : 0);
    sumTotal.textContent = money(valid ? state.amount : 0);
    bumpCard();
  }

  presetBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      presetBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      customInput.value = "";
      state.amount = Number(btn.dataset.amount);
      amountHint.textContent = "Between $25 and $2,000.";
      renderAmount();
    });
  });

  customInput.addEventListener("input", function () {
    var v = Number(customInput.value);
    presetBtns.forEach(function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-checked", "false");
    });
    if (!customInput.value) {
      state.amount = 0;
      amountHint.textContent = "Between $25 and $2,000.";
    } else if (v < 25 || v > 2000) {
      state.amount = 0;
      amountHint.textContent = "Please enter an amount between $25 and $2,000.";
    } else {
      state.amount = v;
      amountHint.textContent = "Lovely — " + money(v) + " gift card.";
    }
    renderAmount();
  });

  recipient.addEventListener("input", function () {
    var name = recipient.value.trim();
    cardTo.textContent = name || "A dear friend";
  });

  message.addEventListener("input", function () {
    var txt = message.value.trim();
    msgCount.textContent = String(message.value.length);
    cardMessage.textContent =
      txt || "Wishing you an afternoon of pure indulgence.";
  });

  // delivery date — default to today, set on the card as "valid until +1 year"
  function fmtDate(d) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  (function initDate() {
    var today = new Date();
    var iso = today.toISOString().slice(0, 10);
    deliveryDate.min = iso;
    deliveryDate.value = iso;
  })();

  function renderExpiry() {
    var base = deliveryDate.value ? new Date(deliveryDate.value) : new Date();
    var exp = new Date(base.getFullYear() + 2, base.getMonth(), base.getDate());
    cardExpiry.textContent = fmtDate(exp);
  }
  deliveryDate.addEventListener("change", renderExpiry);

  // initial paint
  renderAmount();
  renderExpiry();

  /* ---------- buy actions ---------- */
  function validateBuy() {
    if (!state.amount || state.amount < 25 || state.amount > 2000) {
      amountHint.textContent = "Choose an amount between $25 and $2,000.";
      amountsWrap.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    var em = email.value.trim();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      email.focus();
      toast("Add a valid recipient email to continue.");
      return false;
    }
    return true;
  }

  document.getElementById("addCart").addEventListener("click", function () {
    if (!validateBuy()) return;
    toast(money(state.amount) + " gift card added to cart.");
  });

  document.getElementById("buyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateBuy()) return;
    var to = recipient.value.trim() || "your recipient";
    toast(money(state.amount) + " gift card on its way to " + to + ".");
  });

  /* ============================================================
     REDEEM
  ============================================================ */
  var DEMO_CARDS = {
    "ML-2026-AURA": {
      balance: 180,
      issued: "Aria Vance",
      used: "May 2, 2026",
      status: "Active",
    },
    "ML-GLOW-7781": {
      balance: 42.5,
      issued: "Noor Haddad",
      used: "Apr 18, 2026",
      status: "Low balance",
    },
    "ML-LUXE-0099": {
      balance: 500,
      issued: "Celeste Moreau",
      used: "Never",
      status: "Active",
    },
  };

  var redeemForm = document.getElementById("redeemForm");
  var codeInput = document.getElementById("code");
  var codeMsg = document.getElementById("codeMsg");
  var balanceBox = document.getElementById("balance");
  var balanceAmount = document.getElementById("balanceAmount");
  var balIssued = document.getElementById("balIssued");
  var balUsed = document.getElementById("balUsed");
  var balStatus = document.getElementById("balStatus");

  document.querySelectorAll(".seed").forEach(function (s) {
    s.addEventListener("click", function () {
      codeInput.value = s.dataset.seed;
      codeInput.focus();
      codeMsg.textContent = "";
      codeMsg.className = "code-msg";
    });
  });

  codeInput.addEventListener("input", function () {
    codeInput.value = codeInput.value.toUpperCase();
  });

  function hideBalance() {
    balanceBox.hidden = true;
    balanceBox.setAttribute("aria-hidden", "true");
  }

  function showError(text) {
    codeMsg.textContent = text;
    codeMsg.className = "code-msg is-error";
    codeInput.classList.remove("shake");
    void codeInput.offsetWidth;
    codeInput.classList.add("shake");
    hideBalance();
  }

  function showBalance(card) {
    codeMsg.textContent = "Card verified.";
    codeMsg.className = "code-msg is-ok";
    balIssued.textContent = card.issued;
    balUsed.textContent = card.used;
    balStatus.textContent = card.status;
    balStatus.className = "pill" + (card.balance < 50 ? " is-low" : "");

    balanceBox.hidden = false;
    balanceBox.setAttribute("aria-hidden", "false");

    // count-up reveal
    var target = card.balance;
    var start = performance.now();
    var dur = 900;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      balanceAmount.textContent =
        "$" + (target % 1 ? val.toFixed(2) : Math.round(val).toLocaleString("en-US"));
      if (t < 1) requestAnimationFrame(tick);
      else
        balanceAmount.textContent =
          "$" +
          (target % 1
            ? target.toFixed(2)
            : target.toLocaleString("en-US"));
    }
    requestAnimationFrame(tick);
  }

  redeemForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var code = codeInput.value.trim().toUpperCase();
    if (!code) {
      showError("Please enter your gift card code.");
      return;
    }
    if (!/^ML-[A-Z0-9]{3,5}-[A-Z0-9]{3,5}$/.test(code)) {
      showError("That doesn't look like a Maison Lumière code (ML-XXXX-XXXX).");
      return;
    }
    var card = DEMO_CARDS[code];
    if (!card) {
      showError("We couldn't find a card with that code. Please check and retry.");
      return;
    }
    showBalance(card);
    toast("Balance retrieved · " + money(card.balance));
  });

  document.getElementById("applyBalance").addEventListener("click", function () {
    toast("Balance linked to your profile for your next visit.");
  });
})();
