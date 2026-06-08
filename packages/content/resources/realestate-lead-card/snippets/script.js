(function () {
  "use strict";

  /* ---- Status cycle definition ---- */
  var STATUS_ORDER = ["new", "contacted", "touring", "offer"];
  var STATUS_LABEL = {
    new: "New",
    contacted: "Contacted",
    touring: "Touring",
    offer: "Offer",
  };

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function leadName(card) {
    var n = card.querySelector(".lead__name");
    return n ? n.textContent.trim() : "Lead";
  }

  /* ---- Status cycling ---- */
  function cycleStatus(card) {
    var current = card.getAttribute("data-status") || "new";
    var idx = STATUS_ORDER.indexOf(current);
    var next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    card.setAttribute("data-status", next);

    var pill = card.querySelector(".pill");
    var text = card.querySelector(".pill__text");
    if (text) text.textContent = STATUS_LABEL[next];
    if (pill) {
      pill.classList.remove("flash");
      // reflow to restart animation
      void pill.offsetWidth;
      pill.classList.add("flash");
    }
    toast(leadName(card) + " moved to " + STATUS_LABEL[next]);
  }

  /* ---- Star / priority toggle ---- */
  function toggleStar(btn, card) {
    var on = btn.classList.toggle("is-on");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    card.setAttribute("data-priority", on ? "true" : "false");
    btn.classList.remove("bump");
    void btn.offsetWidth;
    btn.classList.add("bump");
    toast(
      on
        ? leadName(card) + " flagged as priority"
        : "Priority removed for " + leadName(card)
    );
  }

  /* ---- Add note inline ---- */
  function nowStamp() {
    var d = new Date();
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var h = d.getHours();
    var ampm = h >= 12 ? "PM" : "AM";
    var hr = h % 12 || 12;
    var min = ("0" + d.getMinutes()).slice(-2);
    return days[d.getDay()] + " · " + hr + ":" + min + " " + ampm;
  }

  function appendNote(notesEl, value) {
    var note = document.createElement("div");
    note.className = "note";
    var time = document.createElement("span");
    time.className = "note__time";
    time.textContent = nowStamp();
    note.appendChild(time);
    note.appendChild(document.createTextNode(value));
    notesEl.appendChild(note);
  }

  function openNoteForm(card) {
    var notesEl = card.querySelector("[data-notes]");
    if (!notesEl) return;
    notesEl.hidden = false;

    // avoid duplicate composer
    if (card.querySelector(".note-form")) {
      var existing = card.querySelector(".note-form input");
      if (existing) existing.focus();
      return;
    }

    var form = document.createElement("form");
    form.className = "note-form";

    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Quick note about this lead…";
    input.setAttribute("aria-label", "Note for " + leadName(card));
    input.maxLength = 160;

    var submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Save";

    form.appendChild(input);
    form.appendChild(submit);
    notesEl.insertAdjacentElement("afterend", form);
    input.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) {
        input.focus();
        return;
      }
      appendNote(notesEl, v);
      form.remove();
      toast("Note added to " + leadName(card));
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        form.remove();
      }
    });
  }

  /* ---- Event delegation ---- */
  var list = document.getElementById("leadList");
  if (!list) return;

  list.addEventListener("click", function (e) {
    var card = e.target.closest(".lead");
    if (!card) return;

    var star = e.target.closest(".star");
    if (star) {
      e.preventDefault();
      toggleStar(star, card);
      return;
    }

    var statusBtn = e.target.closest('[data-action="status"]');
    if (statusBtn) {
      e.preventDefault();
      cycleStatus(card);
      return;
    }

    var noteBtn = e.target.closest('[data-action="note"]');
    if (noteBtn) {
      e.preventDefault();
      openNoteForm(card);
      return;
    }

    // Let real tel:/mailto: links and contact rows behave naturally,
    // but surface a toast for the in-card quick actions.
    var act = e.target.closest("a.act");
    if (act) {
      var label = act.textContent.trim();
      toast(label + " · " + leadName(card));
    }
  });
})();
