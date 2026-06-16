/* Web3 — Transaction History (UI-only simulation, mock data) */
(function () {
  "use strict";

  // ---- mock data ----------------------------------------------------------
  // dir: "sent" | "received" | "swap"  (used for filter chips)
  // type: visual/icon category
  const ICONS = {
    send: "↑",
    receive: "↓",
    swap: "⇄",
    approve: "✓",
    mint: "✦",
  };

  const TXNS = [
    {
      id: "t1",
      type: "swap",
      dir: "swap",
      label: "Swap NOVA → USDx",
      counter: "0x5e21…9f0a",
      counterFull: "0x5e21a4b9c7d3e8f1a2b6c4d5e9f0a1b29f0a",
      amount: "−420.00 NOVA",
      amountOut: "+619.84 USDx",
      sign: "neg",
      status: "pending",
      day: "today",
      time: "2 min ago",
      hash: "0x9c4f1d7a2e8b6035c9a1f4d2e7b8c0a35d6e2f91a4b7c8d09e1f23a4b5c6d7e80",
      block: "—",
      fee: "0.00214 LUM",
      nonce: "142",
    },
    {
      id: "t2",
      type: "receive",
      dir: "received",
      label: "Receive USDx",
      counter: "0xa11c…3d77",
      counterFull: "0xa11c5f9e2b7d4a0163e8c2f5b9d7a04e3d77",
      amount: "+1,250.00 USDx",
      sign: "pos",
      status: "confirmed",
      day: "today",
      time: "1h ago",
      hash: "0x3b8e2c9f1a6d4705e8b2c1f9d3a7e604b8c2d1f9a3e7b06c4d2f1a9e3b7c08d5f",
      block: "21,408,332",
      fee: "0.00098 LUM",
      nonce: "141",
    },
    {
      id: "t3",
      type: "send",
      dir: "sent",
      label: "Send LUM",
      counter: "0x7f44…b1e2",
      counterFull: "0x7f44d9c2e6a8b0157f3c9e2d6a8b0157f4b1e2",
      amount: "−3.5000 LUM",
      sign: "neg",
      status: "confirmed",
      day: "today",
      time: "4h ago",
      hash: "0x6f1d3b8a2e9c4705d1b8e2c9f3a6705d1b8e2c9f3a6d4705e1b8c2f9a3e7b06d4",
      block: "21,407,901",
      fee: "0.00102 LUM",
      nonce: "140",
    },
    {
      id: "t4",
      type: "approve",
      dir: "sent",
      label: "Approve ZephyrSwap",
      counter: "0xd0c4…42e1",
      counterFull: "0xd0c47b3e9f2a615c8d4b0e7a3f9c215842e1 (ZephyrSwap Router v2)",
      amount: "± unlimited NOVA",
      sign: "neg",
      status: "confirmed",
      day: "yesterday",
      time: "Jun 8 · 19:42",
      hash: "0x2a9e3b7c0d5f1a8e4b2c9f6d3a07e15b8c2d9f6a3e0b7c4d1f8a2e9b6c3d07f15",
      block: "21,402,118",
      fee: "0.00076 LUM",
      nonce: "139",
    },
    {
      id: "t5",
      type: "swap",
      dir: "swap",
      label: "Swap USDx → NOVA",
      counter: "0x5e21…9f0a",
      counterFull: "0x5e21a4b9c7d3e8f1a2b6c4d5e9f0a1b29f0a",
      amount: "−800.00 USDx",
      amountOut: "+541.22 NOVA",
      sign: "neg",
      status: "confirmed",
      day: "yesterday",
      time: "Jun 8 · 14:05",
      hash: "0x8c2d1f9a3e7b06c4d2f1a9e3b7c08d5f6e2c9f1a4b7d0e83a5c1f9b2e6d4a07c3",
      block: "21,401,664",
      fee: "0.00231 LUM",
      nonce: "138",
    },
    {
      id: "t6",
      type: "mint",
      dir: "received",
      label: "Mint Glyph #0427",
      counter: "0x4e8a…a55c",
      counterFull: "0x4e8a2d7f1c9b3065e8a2d7f1c9b30659a55c (Mint Garden Collection)",
      amount: "+1 GLYPH",
      sign: "pos",
      status: "confirmed",
      day: "yesterday",
      time: "Jun 8 · 09:18",
      hash: "0x1f9a3e7b06c4d2f1a9e3b7c08d5f6e2c9c4f1d7a2e8b6035c9a1f4d2e7b8c0a35",
      block: "21,399,802",
      fee: "0.00418 LUM",
      nonce: "137",
    },
    {
      id: "t7",
      type: "send",
      dir: "sent",
      label: "Send USDx",
      counter: "0xc903…12ab",
      counterFull: "0xc9035e7a1f8d2b609c4e3a1f8d2b609c712ab",
      amount: "−500.00 USDx",
      sign: "neg",
      status: "failed",
      day: "Jun 6",
      time: "Jun 6 · 22:51",
      hash: "0x4d2f1a9e3b7c08d5f6e2c9f1a4b7d0e83a5c1f9b2e6d4a07c8c2d1f9a3e7b06c4",
      block: "reverted",
      fee: "0.00057 LUM",
      nonce: "136",
    },
    {
      id: "t8",
      type: "receive",
      dir: "received",
      label: "Receive NOVA",
      counter: "0x0bf2…7d19",
      counterFull: "0x0bf2c9e6a3d8014b7f2c9e6a3d8014b77d19",
      amount: "+212.40 NOVA",
      sign: "pos",
      status: "confirmed",
      day: "Jun 6",
      time: "Jun 6 · 08:33",
      hash: "0x7c08d5f6e2c9f1a4b7d0e83a5c1f9b2e6d4a07c3b8e2c9f1a6d4705e8b2c1f9d3",
      block: "21,390,447",
      fee: "0.00089 LUM",
      nonce: "135",
    },
  ];

  // ---- dom refs -----------------------------------------------------------
  const listEl = document.getElementById("list");
  const emptyEl = document.getElementById("empty");
  const searchEl = document.getElementById("q");
  const chipEls = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  const toastEl = document.getElementById("toast");

  let activeFilter = "all";
  let query = "";
  const openRows = new Set();

  // ---- helpers ------------------------------------------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function copy(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast(okMsg); },
        function () { toast("Copy failed"); }
      );
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(okMsg); }
      catch (e) { toast("Copy failed"); }
      document.body.removeChild(ta);
    }
  }

  function matchesFilter(tx) {
    return activeFilter === "all" || tx.dir === activeFilter;
  }

  function matchesQuery(tx) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      tx.hash.toLowerCase().indexOf(q) !== -1 ||
      tx.counter.toLowerCase().indexOf(q) !== -1 ||
      tx.counterFull.toLowerCase().indexOf(q) !== -1 ||
      tx.label.toLowerCase().indexOf(q) !== -1
    );
  }

  function badge(status) {
    const labels = { pending: "Pending", confirmed: "Confirmed", failed: "Failed" };
    return (
      '<span class="badge badge--' + status + '">' + labels[status] + "</span>"
    );
  }

  function rowHtml(tx) {
    const isOpen = openRows.has(tx.id);
    const amountClass = tx.sign === "pos" ? "tx__amount--pos" : "tx__amount--neg";
    const swapOut = tx.amountOut
      ? '<span class="tx__amount tx__amount--pos">' + escapeHtml(tx.amountOut) + "</span>"
      : "";

    return (
      '<div class="tx' + (isOpen ? " is-open" : "") + '" data-id="' + tx.id + '">' +
        '<button class="tx__main" type="button" aria-expanded="' + isOpen + '">' +
          '<span class="tx__icon tx__icon--' + tx.type + '" aria-hidden="true">' + ICONS[tx.type] + "</span>" +
          '<span class="tx__body">' +
            '<span class="tx__label">' + escapeHtml(tx.label) + "</span>" +
            '<span class="tx__sub">' +
              '<span class="tx__counter">' + escapeHtml(tx.counter) + "</span>" +
              badge(tx.status) +
              '<span class="tx__time">' + escapeHtml(tx.time) + "</span>" +
            "</span>" +
          "</span>" +
          '<span class="tx__amounts">' +
            '<span class="tx__amount ' + amountClass + '">' + escapeHtml(tx.amount) + "</span>" +
            swapOut +
            '<span class="tx__caret" aria-hidden="true">▾</span>' +
          "</span>" +
        "</button>" +
        '<button class="explore" type="button" data-explore="' + escapeHtml(tx.hash) + '" aria-label="View transaction on explorer">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"></path><path d="M20 4 10 14"></path>' +
          '<path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"></path></svg>' +
        "</button>" +
        '<div class="tx__detail"><div class="tx__detail-inner">' +
          '<div class="detail">' +
            '<div class="detail__row detail__hash">' +
              '<span class="detail__k">Transaction hash</span>' +
              '<span class="detail__v">' + escapeHtml(tx.hash) + "</span>" +
            "</div>" +
            '<div class="detail__row"><span class="detail__k">Block</span>' +
              '<span class="detail__v">' + escapeHtml(tx.block) + "</span></div>" +
            '<div class="detail__row"><span class="detail__k">Network fee</span>' +
              '<span class="detail__v">' + escapeHtml(tx.fee) + "</span></div>" +
            '<div class="detail__row"><span class="detail__k">Nonce</span>' +
              '<span class="detail__v">' + escapeHtml(tx.nonce) + "</span></div>" +
            '<div class="detail__row"><span class="detail__k">Counterparty</span>' +
              '<span class="detail__v">' + escapeHtml(tx.counterFull) + "</span></div>" +
            '<div class="detail__actions">' +
              '<button class="btn btn--primary" data-copy="' + escapeHtml(tx.hash) + '">' +
                '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"></rect>' +
                '<path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>Copy hash</button>' +
              '<button class="btn explore-btn" data-explore="' + escapeHtml(tx.hash) + '">' +
                '<svg viewBox="0 0 24 24"><path d="M14 4h6v6"></path><path d="M20 4 10 14"></path>' +
                '<path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"></path></svg>' +
                "View on explorer</button>" +
            "</div>" +
          "</div>" +
        "</div></div>" +
      "</div>"
    );
  }

  function render() {
    const visible = TXNS.filter(function (tx) {
      return matchesFilter(tx) && matchesQuery(tx);
    });

    // counts for chips
    const counts = { all: 0, sent: 0, received: 0, swap: 0 };
    TXNS.forEach(function (tx) {
      counts.all++;
      if (tx.dir === "sent") counts.sent++;
      else if (tx.dir === "received") counts.received++;
      else if (tx.dir === "swap") counts.swap++;
    });
    Object.keys(counts).forEach(function (k) {
      const el = document.querySelector('[data-count-for="' + k + '"]');
      if (el) el.textContent = counts[k];
    });

    if (!visible.length) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    // group by day, preserving order
    const order = [];
    const groups = {};
    visible.forEach(function (tx) {
      if (!groups[tx.day]) {
        groups[tx.day] = [];
        order.push(tx.day);
      }
      groups[tx.day].push(tx);
    });

    const labelFor = { today: "Today", yesterday: "Yesterday" };
    let html = "";
    order.forEach(function (day) {
      html +=
        '<div class="group">' +
        '<div class="group__head">' + (labelFor[day] || day) + "</div>" +
        '<div class="group__rows">' +
        groups[day].map(rowHtml).join("") +
        "</div></div>";
    });
    listEl.innerHTML = html;
  }

  // ---- interactions -------------------------------------------------------
  chipEls.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chipEls.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      activeFilter = chip.getAttribute("data-filter");
      render();
    });
  });

  let searchTimer;
  searchEl.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      query = searchEl.value.trim();
      render();
    }, 90);
  });

  // "/" focuses search
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== searchEl) {
      e.preventDefault();
      searchEl.focus();
    }
    if (e.key === "Escape" && document.activeElement === searchEl) {
      searchEl.value = "";
      query = "";
      render();
      searchEl.blur();
    }
  });

  // delegated clicks on list
  listEl.addEventListener("click", function (e) {
    const copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      e.stopPropagation();
      copy(copyBtn.getAttribute("data-copy"), "Hash copied to clipboard");
      return;
    }
    const expBtn = e.target.closest("[data-explore]");
    if (expBtn) {
      e.stopPropagation();
      const h = expBtn.getAttribute("data-explore");
      toast("Opening explorer · " + h.slice(0, 10) + "…");
      return;
    }
    const main = e.target.closest(".tx__main");
    if (main) {
      const row = main.closest(".tx");
      const id = row.getAttribute("data-id");
      if (openRows.has(id)) openRows.delete(id);
      else openRows.add(id);
      row.classList.toggle("is-open");
      main.setAttribute("aria-expanded", openRows.has(id) ? "true" : "false");
    }
  });

  // ---- animated header numbers -------------------------------------------
  function animateCounts() {
    document.querySelectorAll(".num[data-count]").forEach(function (el) {
      const target = parseFloat(el.getAttribute("data-count"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const dur = 900;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = decimals
          ? val.toFixed(decimals)
          : Math.round(val).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ---- simulate the pending tx confirming --------------------------------
  function confirmPending() {
    const tx = TXNS.find(function (t) { return t.status === "pending"; });
    if (!tx) return;
    tx.status = "confirmed";
    tx.block = "21,408,701";
    tx.time = "just now";
    render();
    toast("Swap confirmed · " + tx.hash.slice(0, 10) + "…");
  }

  // ---- boot ---------------------------------------------------------------
  render();
  animateCounts();
  setTimeout(confirmPending, 4200);
})();
