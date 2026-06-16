(function () {
  "use strict";

  // ---- mock state (UI simulation only — no real wallet/RPC) ----
  var ADDRESS = "0x7a3f9e2bC44102d8aBcD0099f1ee77b321aFc41d";
  var SHORT = "0x7a3f…c41d";
  var state = { connected: false, wallet: null, balance: 0 };

  var connectTimer = null;

  // ---- elements ----
  var walletZone = document.getElementById("walletZone");
  var connectBtn = document.getElementById("connectBtn");
  var heroConnect = document.getElementById("heroConnect");
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");
  var walletList = document.getElementById("walletList");
  var connecting = document.getElementById("connecting");
  var connectingName = document.getElementById("connectingName");
  var connectingCancel = document.getElementById("connectingCancel");
  var toastWrap = document.getElementById("toastWrap");

  var lastFocused = null;

  // ---- toast helper ----
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.innerHTML = '<span class="t-dot"></span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 2600);
  }

  // ---- focus trap ----
  function focusable() {
    return Array.prototype.filter.call(
      modal.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      ),
      function (el) {
        return el.offsetParent !== null && !el.disabled;
      }
    );
  }
  function trap(e) {
    if (e.key !== "Tab") return;
    var items = focusable();
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

  // ---- modal open / close ----
  function openModal() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    resetModal();
    document.addEventListener("keydown", onKeydown);
    var first = walletList.querySelector(".wallet-row");
    if (first) first.focus();
  }
  function closeModal() {
    overlay.hidden = true;
    if (connectTimer) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function resetModal() {
    walletList.hidden = false;
    connecting.hidden = true;
  }
  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    } else {
      trap(e);
    }
  }

  // ---- connect simulation ----
  function startConnect(name, balance) {
    connectingName.textContent = name;
    walletList.hidden = true;
    connecting.hidden = false;
    connectingCancel.focus();

    connectTimer = setTimeout(function () {
      connectTimer = null;
      state.connected = true;
      state.wallet = name;
      state.balance = balance;
      renderConnected();
      closeModal();
      toast("Connected to " + name, "ok");
    }, 1700);
  }
  function cancelConnect() {
    if (connectTimer) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
    resetModal();
    var first = walletList.querySelector(".wallet-row");
    if (first) first.focus();
    toast("Connection cancelled", "warn");
  }

  // ---- connected chip + dropdown ----
  function renderConnected() {
    walletZone.innerHTML = "";

    var account = document.createElement("div");
    account.className = "account";

    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.setAttribute("aria-haspopup", "menu");
    chip.setAttribute("aria-expanded", "false");
    chip.innerHTML =
      '<span class="chip-bal mono">' +
      state.balance.toFixed(3) +
      " NOVA</span>" +
      '<span class="chip-sep"></span>' +
      '<span class="chip-addr"><span class="dot dot-live"></span><span class="mono">' +
      SHORT +
      "</span></span>" +
      '<span class="chip-caret">▾</span>';

    var dd = document.createElement("div");
    dd.className = "dropdown";
    dd.setAttribute("role", "menu");
    dd.hidden = true;
    dd.innerHTML =
      '<div class="dd-head">' +
      '<span class="dd-avatar"></span>' +
      '<div class="dd-id"><div class="dd-addr mono">' +
      SHORT +
      '</div><div class="dd-bal mono">' +
      state.balance.toFixed(3) +
      " NOVA · " +
      state.wallet +
      "</div></div>" +
      "</div>" +
      '<button class="dd-item" role="menuitem" data-act="copy"><span class="ic">⧉</span>Copy address</button>' +
      '<button class="dd-item" role="menuitem" data-act="explorer"><span class="ic">↗</span>View on Lumen Scan</button>' +
      '<button class="dd-item danger" role="menuitem" data-act="disconnect"><span class="ic">⏻</span>Disconnect</button>';

    account.appendChild(chip);
    account.appendChild(dd);
    walletZone.appendChild(account);

    function setOpen(open) {
      dd.hidden = !open;
      chip.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        document.addEventListener("click", onOutside, true);
        document.addEventListener("keydown", onDdKey);
        var f = dd.querySelector(".dd-item");
        if (f) f.focus();
      } else {
        document.removeEventListener("click", onOutside, true);
        document.removeEventListener("keydown", onDdKey);
      }
    }
    function onOutside(e) {
      if (!account.contains(e.target)) setOpen(false);
    }
    function onDdKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        chip.focus();
      }
    }

    chip.addEventListener("click", function () {
      setOpen(dd.hidden);
    });

    dd.addEventListener("click", function (e) {
      var item = e.target.closest(".dd-item");
      if (!item) return;
      var act = item.getAttribute("data-act");
      if (act === "copy") {
        copyAddress();
      } else if (act === "explorer") {
        toast("Opening Lumen Scan (simulated)");
      } else if (act === "disconnect") {
        disconnect();
      }
      setOpen(false);
    });
  }

  function copyAddress() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ADDRESS).then(
        function () {
          toast("Address copied", "ok");
        },
        function () {
          toast("Copy failed", "warn");
        }
      );
    } else {
      toast("Address copied", "ok");
    }
  }

  function disconnect() {
    state.connected = false;
    state.wallet = null;
    state.balance = 0;
    walletZone.innerHTML = "";
    var btn = document.createElement("button");
    btn.className = "btn-connect";
    btn.id = "connectBtn";
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.innerHTML =
      '<span class="bolt" aria-hidden="true">⚡</span><span>Connect Wallet</span>';
    walletZone.appendChild(btn);
    btn.addEventListener("click", openModal);
    btn.focus();
    toast("Wallet disconnected", "warn");
  }

  // ---- animated numbers ----
  function animateCounts() {
    var nodes = document.querySelectorAll("[data-count]");
    nodes.forEach(function (node) {
      var target = parseFloat(node.getAttribute("data-count"));
      var dec = parseInt(node.getAttribute("data-dec") || "0", 10);
      var start = performance.now();
      var dur = 1100;
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        node.textContent =
          dec > 0
            ? val.toFixed(dec)
            : Math.round(val).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ---- wire up ----
  connectBtn.addEventListener("click", openModal);
  heroConnect.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  connectingCancel.addEventListener("click", cancelConnect);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  walletList.addEventListener("click", function (e) {
    var row = e.target.closest(".wallet-row");
    if (!row) return;
    startConnect(row.getAttribute("data-wallet"), parseFloat(row.getAttribute("data-balance")));
  });

  animateCounts();
})();
