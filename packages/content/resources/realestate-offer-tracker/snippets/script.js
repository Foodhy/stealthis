(function () {
  "use strict";

  var LIST_PRICE = 1285000;

  /** @type {Array} */
  var offers = [
    {
      id: 1,
      buyer: "Marisol & Devin Okafor",
      agent: "Repped by Hartwell & Vane Realty",
      amount: 1310000,
      financing: "cash",
      terms: ["Inspection waived", "Close in 18 days"],
      status: "submitted",
      ts: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: 2,
      buyer: "The Castellano Trust",
      agent: "Repped by Linden Grove Properties",
      amount: 1342000,
      financing: "financed",
      terms: ["20% down", "Appraisal contingency", "Close in 35 days"],
      status: "countered",
      ts: Date.now() - 1000 * 60 * 60 * 26,
    },
    {
      id: 3,
      buyer: "Priya Ramanathan",
      agent: "Repped by Coast & Key Brokerage",
      amount: 1268000,
      financing: "financed",
      terms: ["10% down", "Inspection contingency", "Seller credit $8k"],
      status: "submitted",
      ts: Date.now() - 1000 * 60 * 60 * 49,
    },
    {
      id: 4,
      buyer: "Aldous Penhaligon",
      agent: "Repped by Meridian House Group",
      amount: 1255000,
      financing: "cash",
      terms: ["As-is", "Close in 14 days"],
      status: "rejected",
      ts: Date.now() - 1000 * 60 * 60 * 72,
    },
  ];

  var nextId = 5;

  var STATUS_LABEL = {
    submitted: "Submitted",
    countered: "Countered",
    accepted: "Accepted",
    rejected: "Rejected",
  };

  // ---- helpers --------------------------------------------------------------
  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };

  function usd(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function initials(name) {
    var parts = name.replace(/[^A-Za-z& ]/g, "").trim().split(/\s+/);
    var first = parts[0] ? parts[0][0] : "?";
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  function relTime(ts) {
    var diff = Date.now() - ts;
    var h = Math.floor(diff / 3600000);
    if (h < 1) return "moments ago";
    if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
    var d = Math.floor(h / 24);
    return d + (d === 1 ? " day ago" : " days ago");
  }

  function parseAmount(str) {
    var n = parseInt(String(str).replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.innerHTML = msg;
    el.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("toast--show");
    }, 2600);
  }

  // Offers still "in play" for leading calculation.
  function liveOffers() {
    return offers.filter(function (o) {
      return o.status !== "rejected";
    });
  }

  function leadingOffer() {
    var live = liveOffers();
    if (!live.length) return null;
    // An accepted offer always leads; otherwise the highest live amount.
    var accepted = live.filter(function (o) {
      return o.status === "accepted";
    });
    var pool = accepted.length ? accepted : live;
    return pool.reduce(function (best, o) {
      return o.amount > best.amount ? o : best;
    });
  }

  // ---- rendering ------------------------------------------------------------
  function render() {
    var list = $("#offerList");
    var lead = leadingOffer();

    list.innerHTML = "";
    offers
      .slice()
      .sort(function (a, b) {
        return b.amount - a.amount;
      })
      .forEach(function (o) {
        list.appendChild(offerEl(o, lead));
      });

    updateSummary(lead);
    updateComposerTargets();
  }

  function offerEl(o, lead) {
    var isLead = lead && o.id === lead.id;
    var li = document.createElement("li");
    li.className = "offer" + (isLead ? " offer--lead" : "");
    li.dataset.id = o.id;

    var delta = o.amount - LIST_PRICE;
    var deltaCls = delta >= 0 ? "offer__delta--up" : "offer__delta--down";
    var deltaTxt =
      (delta >= 0 ? "+" : "−") +
      usd(Math.abs(delta)).slice(1) +
      (delta >= 0 ? " over ask" : " under ask");

    var finBadge =
      o.financing === "cash"
        ? '<span class="badge badge--cash">All cash</span>'
        : '<span class="badge badge--financed">Financed</span>';

    var termBadges = o.terms
      .map(function (t) {
        return '<span class="badge badge--term">' + esc(t) + "</span>";
      })
      .join("");

    var leadBadge = isLead ? '<span class="badge badge--lead">Leading</span>' : "";

    li.innerHTML =
      '<div class="offer__top">' +
      '<div class="offer__buyer">' +
      '<span class="avatar" aria-hidden="true">' +
      initials(o.buyer) +
      "</span>" +
      "<span>" +
      '<span class="offer__name">' +
      esc(o.buyer) +
      "</span><br>" +
      '<span class="offer__agent">' +
      esc(o.agent) +
      "</span>" +
      "</span>" +
      "</div>" +
      '<div class="offer__amount">' +
      "<b>" +
      usd(o.amount) +
      "</b>" +
      '<span class="offer__delta ' +
      deltaCls +
      '">' +
      deltaTxt +
      "</span>" +
      "</div>" +
      "</div>" +
      '<div class="offer__meta">' +
      finBadge +
      termBadges +
      leadBadge +
      '<span class="status status--' +
      o.status +
      '">' +
      STATUS_LABEL[o.status] +
      "</span>" +
      "</div>" +
      '<div class="offer__foot">' +
      '<span class="offer__time">Updated ' +
      relTime(o.ts) +
      "</span>" +
      '<span class="offer__actions">' +
      actionBtns(o) +
      "</span>" +
      "</div>";

    return li;
  }

  function actionBtns(o) {
    if (o.status === "accepted") {
      return '<button class="btn" data-act="reopen" type="button">Reopen</button>';
    }
    if (o.status === "rejected") {
      return '<button class="btn" data-act="reopen" type="button">Restore</button>';
    }
    return (
      '<button class="btn btn--accept" data-act="accept" type="button">Accept</button>' +
      '<button class="btn btn--reject" data-act="reject" type="button">Reject</button>'
    );
  }

  function updateSummary(lead) {
    var live = liveOffers();
    var high = live.reduce(function (m, o) {
      return Math.max(m, o.amount);
    }, 0);
    var cash = offers.filter(function (o) {
      return o.financing === "cash" && o.status !== "rejected";
    }).length;

    $("#statCount").textContent = String(live.length);
    $("#statHigh").textContent = high ? usd(high) : "—";

    if (high) {
      var spread = high - LIST_PRICE;
      var pct = ((spread / LIST_PRICE) * 100).toFixed(1);
      $("#statSpread").textContent =
        (spread >= 0 ? "+" : "−") + Math.abs(pct) + "%";
    } else {
      $("#statSpread").textContent = "—";
    }
    $("#statCash").textContent = String(cash);

    if (lead) {
      $("#leadAmount").textContent = usd(lead.amount);
      $("#leadBy").textContent =
        (lead.status === "accepted" ? "Accepted · " : "Leading · ") + lead.buyer;
    } else {
      $("#leadAmount").textContent = "—";
      $("#leadBy").textContent = "No active offers";
    }
  }

  function updateComposerTargets() {
    var sel = $("#counterTarget");
    var prev = sel.value;
    sel.innerHTML = "";
    var targets = offers.filter(function (o) {
      return o.status === "submitted" || o.status === "countered";
    });
    if (!targets.length) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No open offers to counter";
      opt.disabled = true;
      sel.appendChild(opt);
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    targets.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = String(o.id);
      opt.textContent = o.buyer + " — " + usd(o.amount);
      sel.appendChild(opt);
    });
    if (prev && sel.querySelector('option[value="' + prev + '"]')) {
      sel.value = prev;
    }
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function findById(id) {
    return offers.filter(function (o) {
      return o.id === id;
    })[0];
  }

  // ---- interactions ---------------------------------------------------------
  $("#offerList").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var card = btn.closest(".offer");
    var o = findById(parseInt(card.dataset.id, 10));
    if (!o) return;

    var act = btn.dataset.act;
    if (act === "accept") {
      offers.forEach(function (x) {
        if (x.status === "accepted") x.status = "submitted";
      });
      o.status = "accepted";
      o.ts = Date.now();
      toast("Accepted <span class='toast__accent'>" + esc(o.buyer) + "</span> at " + usd(o.amount));
    } else if (act === "reject") {
      o.status = "rejected";
      o.ts = Date.now();
      toast("Rejected offer from " + esc(o.buyer));
    } else if (act === "reopen") {
      o.status = "submitted";
      o.ts = Date.now();
      toast(esc(o.buyer) + " moved back to Submitted");
    }
    render();
  });

  $("#counterForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var sel = $("#counterTarget");
    var target = findById(parseInt(sel.value, 10));
    var amount = parseAmount($("#counterAmount").value);

    if (!target) {
      toast("Select an offer to counter.");
      return;
    }
    if (amount < 50000) {
      toast("Enter a valid counter amount.");
      $("#counterAmount").focus();
      return;
    }

    var terms = [];
    Array.prototype.forEach.call(
      document.querySelectorAll('#counterForm .chips input:checked'),
      function (c) {
        terms.push(c.value);
      }
    );
    if (!terms.length) terms.push("Standard terms");

    // Mark the buyer's offer as countered, then log the seller's counter as a new row.
    target.status = "countered";
    target.ts = Date.now();

    offers.push({
      id: nextId++,
      buyer: "Seller counter → " + target.buyer,
      agent: "Listing side · 14 Marlow Crescent",
      amount: amount,
      financing: target.financing,
      terms: terms,
      status: "submitted",
      ts: Date.now(),
    });

    $("#counterForm").reset();
    render();
    toast("Counter of <span class='toast__accent'>" + usd(amount) + "</span> sent to " + esc(target.buyer));
  });

  // Live thousands-format the counter amount input.
  $("#counterAmount").addEventListener("input", function () {
    var n = parseAmount(this.value);
    this.value = n ? n.toLocaleString("en-US") : "";
  });

  $("#listPrice").textContent = usd(LIST_PRICE);
  render();
})();
