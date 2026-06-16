(function () {
  "use strict";

  /* ---- Mock signing requests (fictional, UI only) ---- */
  var REQUESTS = {
    swap: {
      title: "Swap request",
      label: "You are about to swap",
      net: "Lumen Chain",
      from: { icon: "Ξ", cls: "tok--eth", amt: "1.5 ETH", fiat: "$4,218.00" },
      to: { icon: "$", cls: "tok--usdc", amt: "4,210 USDC", fiat: "$4,210.00" },
      arrow: "→",
      fromAddr: "0x4e9a…1b07",
      toAddr: "0x7a3f…c41d",
      fee: "0.00214 ETH · $6.02",
      total: "$4,224.02",
      confirmLabel: "Confirm",
      danger: false,
    },
    send: {
      title: "Send request",
      label: "You are about to send",
      net: "Nova Network",
      from: { icon: "◆", cls: "tok--nova", amt: "250 NOVA", fiat: "$1,062.50" },
      to: { icon: "↑", cls: "tok--usdc", amt: "0x7a3f…c41d", fiat: "Recipient" },
      arrow: "→",
      fromAddr: "0x4e9a…1b07",
      toAddr: "0x7a3f…c41d",
      fee: "0.0008 NOVA · $0.34",
      total: "250.0008 NOVA · $1,062.84",
      confirmLabel: "Confirm send",
      danger: false,
    },
    approve: {
      title: "Token approval",
      label: "You are granting spend access",
      net: "Lumen Chain",
      from: { icon: "$", cls: "tok--usdc", amt: "USDC", fiat: "Unlimited" },
      to: { icon: "◎", cls: "tok--nova", amt: "NovaSwap", fiat: "Spender" },
      arrow: "→",
      fromAddr: "0x4e9a…1b07",
      toAddr: "0x9d12…ab44",
      fee: "0.00061 ETH · $1.71",
      total: "$1.71",
      confirmLabel: "Approve anyway",
      danger: true,
      risk: {
        title: "Unlimited approval",
        text: "This contract can spend any amount of USDC until you revoke it.",
      },
    },
  };

  /* ---- Elements ---- */
  var overlay = document.getElementById("overlay");
  var sheet = document.getElementById("sheet");
  var toastEl = document.getElementById("toast");

  var stateReview = document.getElementById("stateReview");
  var stateSigning = document.getElementById("stateSigning");
  var stateSuccess = document.getElementById("stateSuccess");
  var sheetFoot = document.getElementById("sheetFoot");

  var confirmBtn = document.getElementById("confirmBtn");
  var rejectBtn = document.getElementById("rejectBtn");
  var closeBtn = document.getElementById("closeBtn");

  var detailsToggle = document.getElementById("detailsToggle");
  var detailsPanel = document.getElementById("detailsPanel");

  var lastFocus = null;
  var signTimer = null;

  /* ---- Toast helper ---- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function setText(sel, value) {
    var el = sheet.querySelector(sel);
    if (el) el.textContent = value;
  }

  function randHash() {
    var hex = "0123456789abcdef";
    var s = "";
    for (var i = 0; i < 4; i++) s += hex[Math.floor(Math.random() * 16)];
    var e = "";
    for (var j = 0; j < 4; j++) e += hex[Math.floor(Math.random() * 16)];
    return "0x" + s + "…" + e;
  }

  /* ---- Populate sheet from a request ---- */
  function populate(req) {
    setText("[data-net]", req.net);
    setText("[data-net2]", req.net);
    setText("#sheetTitle", req.title);
    setText("#sheetSummary", req.label);

    var fromIcon = sheet.querySelector("[data-from-icon]");
    var toIcon = sheet.querySelector("[data-to-icon]");
    fromIcon.textContent = req.from.icon;
    fromIcon.className = "tok " + req.from.cls;
    toIcon.textContent = req.to.icon;
    toIcon.className = "tok " + req.to.cls;

    setText("[data-from-amt]", req.from.amt);
    setText("[data-from-fiat]", req.from.fiat);
    setText("[data-to-amt]", req.to.amt);
    setText("[data-to-fiat]", req.to.fiat);
    sheet.querySelector(".swap-visual__arrow").textContent = req.arrow;

    setText("[data-from-addr]", req.fromAddr);
    setText("[data-to-addr]", req.toAddr);
    setText("[data-fee]", req.fee);
    setText("[data-total]", req.total);

    var risk = document.getElementById("riskBanner");
    if (req.risk) {
      setText("[data-risk-title]", req.risk.title);
      setText("[data-risk-text]", req.risk.text);
      risk.hidden = false;
    } else {
      risk.hidden = true;
    }

    confirmBtn.textContent = req.confirmLabel;
    confirmBtn.classList.toggle("is-danger", !!req.danger);
  }

  /* ---- State machine ---- */
  function showState(name) {
    stateReview.hidden = name !== "review";
    stateSigning.hidden = name !== "signing";
    stateSuccess.hidden = name !== "success";

    if (name === "review") {
      sheetFoot.hidden = false;
      rejectBtn.textContent = "Reject";
      rejectBtn.classList.remove("btn--full");
      confirmBtn.style.display = "";
    } else if (name === "signing") {
      sheetFoot.hidden = true;
    } else if (name === "success") {
      sheetFoot.hidden = false;
      confirmBtn.style.display = "none";
      rejectBtn.textContent = "Done";
      rejectBtn.classList.add("btn--full");
    }
  }

  /* ---- Open / close ---- */
  function openSheet(key) {
    var req = REQUESTS[key];
    if (!req) return;
    lastFocus = document.activeElement;
    populate(req);
    collapseDetails();
    showState("review");

    overlay.hidden = false;
    /* force reflow so transition runs */
    void overlay.offsetWidth;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown, true);
    setTimeout(function () {
      confirmBtn.focus();
    }, 60);
  }

  function closeSheet() {
    clearTimeout(signTimer);
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown, true);
    setTimeout(function () {
      overlay.hidden = true;
    }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---- Sign flow ---- */
  function confirmTx() {
    showState("signing");
    clearTimeout(signTimer);
    signTimer = setTimeout(function () {
      var h = randHash();
      setText("#txHash", h);
      showState("success");
      toast("Transaction submitted");
      setTimeout(function () {
        var done = document.getElementById("explorerLink");
        if (done) done.focus();
      }, 60);
    }, 1900);
  }

  function rejectTx() {
    if (!stateSuccess.hidden) {
      closeSheet();
      return;
    }
    toast("Request rejected");
    closeSheet();
  }

  /* ---- Details expander ---- */
  function collapseDetails() {
    detailsToggle.setAttribute("aria-expanded", "false");
    detailsPanel.hidden = true;
  }
  function toggleDetails() {
    var open = detailsToggle.getAttribute("aria-expanded") === "true";
    detailsToggle.setAttribute("aria-expanded", String(!open));
    detailsPanel.hidden = open;
  }

  /* ---- Focus trap + Esc ---- */
  function focusables() {
    return Array.prototype.filter.call(
      sheet.querySelectorAll(
        'button:not([disabled]):not([style*="display: none"]), a[href], [tabindex]:not([tabindex="-1"])'
      ),
      function (el) {
        return el.offsetParent !== null;
      }
    );
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      rejectTx();
      return;
    }
    if (e.key === "Tab") {
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ---- Copy calldata ---- */
  function copyCalldata() {
    var pre = document.getElementById("calldata");
    var text = pre ? pre.textContent.replace(/\s+/g, "") : "";
    var done = function () {
      toast("Calldata copied");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      done();
    }
  }

  /* ---- Wire events ---- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-open]"), function (btn) {
    btn.addEventListener("click", function () {
      openSheet(btn.getAttribute("data-open"));
    });
  });

  confirmBtn.addEventListener("click", confirmTx);
  rejectBtn.addEventListener("click", rejectTx);
  closeBtn.addEventListener("click", function () {
    rejectTx();
  });
  detailsToggle.addEventListener("click", toggleDetails);
  document.getElementById("copyData").addEventListener("click", copyCalldata);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) rejectTx();
  });

  var explorer = document.getElementById("explorerLink");
  explorer.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Opening block explorer (demo)");
  });
})();
