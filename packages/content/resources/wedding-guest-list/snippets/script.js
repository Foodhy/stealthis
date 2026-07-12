(function () {
  "use strict";

  var STATUSES = ["confirmed", "pending", "declined"];
  var STATUS_LABEL = {
    confirmed: "Confirmed",
    pending: "Pending",
    declined: "Declined"
  };

  var guests = [
    { id: 1, name: "Eleanor Whitmore", group: "Family of the Bride", party: 2, status: "confirmed" },
    { id: 2, name: "Theodore Ashby", group: "Family of the Groom", party: 1, status: "confirmed" },
    { id: 3, name: "Marguerite Vance", group: "College Friends", party: 2, status: "pending" },
    { id: 4, name: "Rupert Callahan", group: "Work & Colleagues", party: 1, status: "declined" },
    { id: 5, name: "Priya Sundaram", group: "College Friends", party: 2, status: "confirmed" },
    { id: 6, name: "Nathaniel Brooks", group: "Neighbours", party: 4, status: "pending" },
    { id: 7, name: "Clementine Rhodes", group: "Family of the Bride", party: 1, status: "confirmed" },
    { id: 8, name: "Oscar Delacroix", group: "Work & Colleagues", party: 2, status: "declined" }
  ];

  var nextId = 9;
  var currentFilter = "all";

  var body = document.getElementById("guestBody");
  var emptyState = document.getElementById("emptyState");
  var form = document.getElementById("addForm");
  var toastEl = document.getElementById("toast");
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/);
    var first = parts[0] ? parts[0][0] : "";
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateStats() {
    var counts = { total: 0, confirmed: 0, pending: 0, declined: 0 };
    guests.forEach(function (g) {
      counts.total += 1;
      counts[g.status] += 1;
    });
    Object.keys(counts).forEach(function (key) {
      var el = document.querySelector('[data-count="' + key + '"]');
      if (el) el.textContent = counts[key];
    });
  }

  function rowHtml(g, isNew) {
    return (
      '<tr data-id="' + g.id + '"' + (isNew ? ' class="row-in"' : "") + ">" +
        '<td class="cell-name" data-label="Guest">' +
          '<span class="g-name">' +
            '<span class="g-avatar" aria-hidden="true">' + escapeHtml(initials(g.name)) + "</span>" +
            "<b>" + escapeHtml(g.name) + "</b>" +
          "</span>" +
        "</td>" +
        '<td class="g-group" data-label="Group">' + escapeHtml(g.group) + "</td>" +
        '<td class="num" data-label="Party">' + g.party + "</td>" +
        '<td data-label="RSVP">' +
          '<button class="chip ' + g.status + '" data-action="cycle" ' +
            'aria-label="RSVP status: ' + STATUS_LABEL[g.status] + '. Click to change.">' +
            STATUS_LABEL[g.status] +
          "</button>" +
        "</td>" +
        '<td data-label="Remove">' +
          '<button class="g-remove" data-action="remove" ' +
            'aria-label="Remove ' + escapeHtml(g.name) + ' from list" title="Remove">&times;</button>' +
        "</td>" +
      "</tr>"
    );
  }

  function render(newId) {
    var visible = guests.filter(function (g) {
      return currentFilter === "all" || g.status === currentFilter;
    });

    body.innerHTML = visible
      .map(function (g) {
        return rowHtml(g, g.id === newId);
      })
      .join("");

    emptyState.hidden = visible.length !== 0;
    updateStats();
  }

  // Add guest
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = (data.get("name") || "").toString().trim();
    if (!name) {
      toast("Please enter a guest name.");
      return;
    }
    var g = {
      id: nextId++,
      name: name,
      group: (data.get("group") || "").toString(),
      party: parseInt(data.get("party"), 10) || 1,
      status: "pending"
    };
    guests.push(g);

    // if a filter would hide the new guest, jump back to All so it's visible
    if (currentFilter !== "all" && currentFilter !== "pending") {
      setFilter("all");
    }
    render(g.id);
    form.reset();
    document.getElementById("guestName").focus();
    toast(name + " added — awaiting reply.");
  });

  // Delegated actions: cycle status + remove
  body.addEventListener("click", function (e) {
    var actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;
    var row = e.target.closest("tr");
    if (!row) return;
    var id = parseInt(row.getAttribute("data-id"), 10);
    var guest = guests.find(function (g) {
      return g.id === id;
    });
    if (!guest) return;

    if (actionEl.getAttribute("data-action") === "cycle") {
      var idx = STATUSES.indexOf(guest.status);
      guest.status = STATUSES[(idx + 1) % STATUSES.length];
      render();
      toast(guest.name + " · " + STATUS_LABEL[guest.status]);
    } else if (actionEl.getAttribute("data-action") === "remove") {
      guests = guests.filter(function (g) {
        return g.id !== id;
      });
      render();
      toast(guest.name + " removed from the list.");
    }
  });

  // Filters
  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-filter") === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    render();
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFilter(btn.getAttribute("data-filter"));
    });
  });

  render();
})();
