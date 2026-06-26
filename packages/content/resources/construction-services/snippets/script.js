(function () {
  "use strict";

  /* ---------- service filtering ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");

  function applyFilter(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-cat") === filter;
      card.hidden = !match;
      if (match) shown++;
    });
    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- estimate form ---------- */
  var form = document.getElementById("estimate-form");
  var note = document.getElementById("form-note");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var phone = form.elements.phone;
      var service = form.elements.service;
      var ok = true;

      [name, phone].forEach(function (input) {
        var valid = input.value.trim().length > 1;
        input.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid) ok = false;
      });

      if (!ok) {
        note.textContent = "Please add your name and a phone number.";
        note.className = "form-note err";
        return;
      }

      note.textContent =
        "Thanks, " +
        name.value.trim().split(" ")[0] +
        " — we'll call about your " +
        service.value.toLowerCase() +
        " job within 48 hours.";
      note.className = "form-note ok";
      form.reset();
      name.setAttribute("aria-invalid", "false");
      phone.setAttribute("aria-invalid", "false");
    });
  }
})();
