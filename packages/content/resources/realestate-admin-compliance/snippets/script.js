(function () {
  "use strict";

  // ---- Data: fictional transactions, each with a required-document checklist ----
  var STATUSES = {
    missing: { label: "Missing", cls: "s-missing" },
    pending: { label: "Pending Review", cls: "s-pending" },
    approved: { label: "Approved", cls: "s-approved" },
    expired: { label: "Expired", cls: "s-expired" }
  };

  var DOC_TEMPLATE = [
    { key: "listing", name: "Listing Agreement" },
    { key: "disclosures", name: "Seller Disclosures" },
    { key: "inspection", name: "Inspection Report" },
    { key: "appraisal", name: "Appraisal" },
    { key: "closing", name: "Closing Statement" }
  ];

  var transactions = [
    {
      id: "tx-1",
      address: "412 Juniper Hollow Rd",
      city: "Asheton Heights, CT",
      price: "$1.24M",
      tags: ["4 bd", "3 ba", "3,180 sqft"],
      label: "Under Contract",
      docs: [
        { key: "listing", status: "approved", due: "Closed 04/02" },
        { key: "disclosures", status: "approved", due: "Closed 04/05" },
        { key: "inspection", status: "pending", due: "Due Jun 11" },
        { key: "appraisal", status: "missing", due: "Due Jun 14" },
        { key: "closing", status: "missing", due: "Due Jun 27" }
      ]
    },
    {
      id: "tx-2",
      address: "88 Wren Court",
      city: "Lake Marlowe, CT",
      price: "$685K",
      tags: ["3 bd", "2 ba", "1,940 sqft"],
      label: "Active",
      docs: [
        { key: "listing", status: "approved", due: "Closed 05/19" },
        { key: "disclosures", status: "pending", due: "Due Jun 09" },
        { key: "inspection", status: "missing", due: "Due Jun 16" },
        { key: "appraisal", status: "missing", due: "Due Jun 21" },
        { key: "closing", status: "missing", due: "Due Jul 02" }
      ]
    },
    {
      id: "tx-3",
      address: "1207 Cedar Bluff Ave",
      city: "Harlow Park, CT",
      price: "$2.05M",
      tags: ["5 bd", "4 ba", "4,610 sqft"],
      label: "Closing Soon",
      docs: [
        { key: "listing", status: "approved", due: "Closed 03/28" },
        { key: "disclosures", status: "approved", due: "Closed 04/02" },
        { key: "inspection", status: "approved", due: "Closed 05/30" },
        { key: "appraisal", status: "expired", due: "Expired Jun 04" },
        { key: "closing", status: "pending", due: "Due Jun 10" }
      ]
    },
    {
      id: "tx-4",
      address: "26 Saffron Lane",
      city: "Edenfield, CT",
      price: "$540K",
      tags: ["2 bd", "2 ba", "1,310 sqft"],
      label: "Active",
      docs: [
        { key: "listing", status: "approved", due: "Closed 05/26" },
        { key: "disclosures", status: "approved", due: "Closed 05/29" },
        { key: "inspection", status: "approved", due: "Closed 06/03" },
        { key: "appraisal", status: "approved", due: "Closed 06/05" },
        { key: "closing", status: "approved", due: "Closed 06/06" }
      ]
    }
  ];

  var RING_C = 2 * Math.PI * 26; // r = 26
  var currentFilter = "all";

  var board = document.getElementById("board");
  var emptyState = document.getElementById("emptyState");
  var toolbarNote = document.getElementById("toolbarNote");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  // ---- Helpers ----
  function docName(key) {
    for (var i = 0; i < DOC_TEMPLATE.length; i++) {
      if (DOC_TEMPLATE[i].key === key) return DOC_TEMPLATE[i].name;
    }
    return key;
  }

  function findTxn(id) {
    return transactions.filter(function (t) { return t.id === id; })[0];
  }

  function approvedCount(txn) {
    return txn.docs.filter(function (d) { return d.status === "approved"; }).length;
  }

  function isComplete(txn) {
    return approvedCount(txn) === txn.docs.length;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // ---- Rendering ----
  function render() {
    board.innerHTML = "";
    var shown = 0;

    transactions.forEach(function (txn) {
      if (currentFilter === "incomplete" && isComplete(txn)) return;
      shown++;
      board.appendChild(buildCard(txn));
    });

    emptyState.hidden = shown > 0;
    updateSummary();
  }

  function buildCard(txn) {
    var done = approvedCount(txn);
    var total = txn.docs.length;
    var pct = Math.round((done / total) * 100);
    var complete = done === total;

    var card = document.createElement("article");
    card.className = "txn";
    card.setAttribute("aria-label", txn.address);

    var photo =
      '<div class="txn-photo">' +
        '<span class="price-badge">' + txn.price + "</span>" +
        '<span class="ph-label">' + txn.label + "</span>" +
      "</div>";

    var head =
      '<div class="txn-head">' +
        '<div class="txn-meta">' +
          "<h2>" + txn.address + "</h2>" +
          '<p class="txn-sub">' + txn.city + "</p>" +
          '<div class="tags">' +
            txn.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("") +
          "</div>" +
        "</div>" +
        buildRing(txn.id, pct, complete) +
      "</div>";

    var list = document.createElement("ul");
    list.className = "docs";
    txn.docs.forEach(function (doc) {
      list.appendChild(buildDocRow(txn.id, doc));
    });

    var foot =
      '<div class="txn-foot">' +
        "<span>" + done + " of " + total + " documents approved</span>" +
        (complete
          ? '<span class="done-flag">✓ Compliant</span>'
          : '<span>' + (total - done) + ' outstanding</span>') +
      "</div>";

    card.innerHTML = photo + head;
    card.appendChild(list);
    card.insertAdjacentHTML("beforeend", foot);
    return card;
  }

  function buildRing(id, pct, complete) {
    var offset = RING_C * (1 - pct / 100);
    return (
      '<div class="ring' + (complete ? " is-complete" : "") + '" data-ring="' + id + '" ' +
        'role="img" aria-label="' + pct + ' percent compliant">' +
        '<svg viewBox="0 0 62 62" aria-hidden="true">' +
          '<circle class="track" cx="31" cy="31" r="26"></circle>' +
          '<circle class="bar" cx="31" cy="31" r="26" ' +
            'stroke-dasharray="' + RING_C.toFixed(1) + '" ' +
            'stroke-dashoffset="' + offset.toFixed(1) + '"></circle>' +
        "</svg>" +
        '<span class="ring-pct">' + pct + "%</span>" +
      "</div>"
    );
  }

  function buildDocRow(txnId, doc) {
    var meta = STATUSES[doc.status];
    var overdue = /Expired/.test(doc.due);

    var li = document.createElement("li");
    li.className = "doc";
    li.dataset.txn = txnId;
    li.dataset.doc = doc.key;

    li.innerHTML =
      '<span class="doc-name">' + docName(doc.key) + "</span>" +
      '<span class="status ' + meta.cls + '"><span class="dot" aria-hidden="true"></span>' + meta.label + "</span>" +
      '<span class="doc-due' + (overdue ? " is-overdue" : "") + '">' + doc.due + "</span>";

    var actions = document.createElement("div");
    actions.className = "doc-actions";

    if (doc.status === "missing" || doc.status === "expired") {
      actions.appendChild(makeBtn("Upload", "primary", function () {
        setStatus(txnId, doc.key, "pending", "Due Jun 30");
        toast(docName(doc.key) + " uploaded — sent for review.");
      }));
    } else if (doc.status === "pending") {
      actions.appendChild(makeBtn("Approve", "primary", function () {
        setStatus(txnId, doc.key, "approved", "Closed " + today());
        toast(docName(doc.key) + " approved.");
      }));
      actions.appendChild(makeBtn("Request changes", "", function () {
        setStatus(txnId, doc.key, "missing", "Re-upload required");
        toast("Changes requested on " + docName(doc.key) + ".");
      }));
    } else if (doc.status === "approved") {
      actions.appendChild(makeBtn("Mark expired", "", function () {
        setStatus(txnId, doc.key, "expired", "Expired " + today());
        toast(docName(doc.key) + " marked expired.");
      }));
    }

    li.appendChild(actions);
    return li;
  }

  function makeBtn(text, variant, onClick) {
    var b = document.createElement("button");
    b.className = "btn" + (variant ? " " + variant : "");
    b.type = "button";
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }

  function today() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return mm + "/" + dd;
  }

  // ---- State mutation ----
  function setStatus(txnId, docKey, status, due) {
    var txn = findTxn(txnId);
    if (!txn) return;
    txn.docs.forEach(function (d) {
      if (d.key === docKey) {
        d.status = status;
        if (due) d.due = due;
      }
    });
    render();
  }

  function updateSummary() {
    var approved = 0, pending = 0, open = 0;
    transactions.forEach(function (txn) {
      txn.docs.forEach(function (d) {
        if (d.status === "approved") approved++;
        else if (d.status === "pending") pending++;
        else open++; // missing or expired
      });
    });
    document.getElementById("statApproved").textContent = approved;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statOpen").textContent = open;
  }

  // ---- Filters ----
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      currentFilter = chip.dataset.filter;
      toolbarNote.textContent =
        currentFilter === "incomplete"
          ? "Showing transactions with outstanding documents."
          : "Showing all open transactions.";
      render();
    });
  });

  render();
})();
