(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- Currency formatting ---------- */
  var fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function renderAmount(card) {
    var el = card.querySelector("[data-amount]");
    if (!el) return;
    var raw = parseFloat(card.getAttribute("data-balance")) || 0;
    // Credit balances are stored negative but shown as the absolute amount owed.
    el.textContent = fmt.format(Math.abs(raw));
  }

  /* ---------- Sparkline builder ---------- */
  function buildSpark(svg) {
    var raw = svg.getAttribute("data-points");
    if (!raw) return;
    var coords = raw.trim().split(/\s+/).map(function (p) {
      var xy = p.split(",");
      return { x: parseFloat(xy[0]), y: parseFloat(xy[1]) };
    });
    if (coords.length < 2) return;

    var line = coords
      .map(function (c, i) {
        return (i === 0 ? "M" : "L") + c.x + " " + c.y;
      })
      .join(" ");

    var first = coords[0];
    var last = coords[coords.length - 1];
    var area = "M" + first.x + " 64 L" + line.slice(1) + " L" + last.x + " 64 Z";

    var NS = "http://www.w3.org/2000/svg";
    var areaEl = document.createElementNS(NS, "path");
    areaEl.setAttribute("class", "spark-area");
    areaEl.setAttribute("d", area);

    var lineEl = document.createElementNS(NS, "path");
    lineEl.setAttribute("class", "spark-line");
    lineEl.setAttribute("d", line);

    var dotEl = document.createElementNS(NS, "circle");
    dotEl.setAttribute("class", "spark-dot");
    dotEl.setAttribute("cx", last.x);
    dotEl.setAttribute("cy", last.y);
    dotEl.setAttribute("r", "3.2");

    svg.appendChild(areaEl);
    svg.appendChild(lineEl);
    svg.appendChild(dotEl);

    // Draw-in animation on the line.
    var len = lineEl.getTotalLength ? lineEl.getTotalLength() : 0;
    if (len) {
      lineEl.style.strokeDasharray = len;
      lineEl.style.strokeDashoffset = len;
      lineEl.getBoundingClientRect(); // reflow
      lineEl.style.transition = "stroke-dashoffset 0.9s ease 0.1s";
      lineEl.style.strokeDashoffset = "0";
    }
  }

  /* ---------- Per-card hide/show ---------- */
  var STORAGE_KEY = "nw-balances-hidden";
  var cards = Array.prototype.slice.call(document.querySelectorAll(".bal-card"));

  function setHidden(card, hidden) {
    card.classList.toggle("is-hidden", hidden);
    var amt = card.querySelector("[data-amount]");
    if (amt) amt.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function allHidden() {
    return cards.length > 0 && cards.every(function (c) {
      return c.classList.contains("is-hidden");
    });
  }

  /* ---------- Global toggle ---------- */
  var globalBtn = document.getElementById("globalToggle");
  var globalLabel = document.getElementById("globalToggleLabel");

  function syncGlobalToggle() {
    if (!globalBtn) return;
    var hidden = allHidden();
    globalBtn.setAttribute("aria-pressed", hidden ? "true" : "false");
    if (globalLabel) globalLabel.textContent = hidden ? "Show balances" : "Hide balances";
  }

  if (globalBtn) {
    globalBtn.addEventListener("click", function () {
      var hideAll = !allHidden();
      cards.forEach(function (c) {
        setHidden(c, hideAll);
      });
      syncGlobalToggle();
      saveState();
      toast(hideAll ? "Balances hidden" : "Balances visible");
    });
  }

  /* ---------- Persistence ---------- */
  function saveState() {
    try {
      var state = cards.map(function (c) {
        return c.classList.contains("is-hidden") ? 1 : 0;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — ignore */
    }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var state = JSON.parse(raw);
      cards.forEach(function (c, i) {
        if (state[i]) setHidden(c, true);
      });
    } catch (e) {
      /* malformed — ignore */
    }
  }

  /* ---------- Quick actions ---------- */
  var actionMessages = {
    send: "Send money — enter a recipient to continue",
    request: "Request created — share the link to get paid",
    deposit: "Schedule a deposit to High-Yield Savings",
    goals: "Open savings goals",
    pay: "Pay card — choose an amount and date",
    statement: "Opening your latest statement (PDF)",
    request_money: "Request created",
  };

  cards.forEach(function (card) {
    renderAmount(card);

    var spark = card.querySelector(".spark");
    if (spark) buildSpark(spark);

    var nameEl = card.querySelector(".bal-name");
    var accountName = nameEl ? nameEl.textContent.trim() : "account";

    card.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        if (action === "more") {
          // Quick "more" = toggle this single card's visibility.
          var nowHidden = !card.classList.contains("is-hidden");
          setHidden(card, nowHidden);
          syncGlobalToggle();
          saveState();
          toast(
            (nowHidden ? "Hidden: " : "Showing: ") + accountName
          );
          return;
        }
        // Brief flash on the amount as feedback.
        card.classList.remove("is-flash");
        void card.offsetWidth;
        card.classList.add("is-flash");
        toast(actionMessages[action] || "Action: " + action);
      });
    });

    // Keyboard affordance: Space/Enter on focused card body toggles via "more".
  });

  loadState();
  syncGlobalToggle();
})();
