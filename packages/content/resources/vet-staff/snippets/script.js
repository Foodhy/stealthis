(function () {
  "use strict";

  var grid = document.getElementById("grid");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
  var countNum = document.getElementById("count-num");
  var emptyMsg = document.getElementById("empty");

  var active = { role: "all", specialty: "all" };

  // ---- Filtering ----
  function matches(card) {
    var roleOk = active.role === "all" || card.dataset.role === active.role;
    var specOk =
      active.specialty === "all" ||
      (card.dataset.specialty || "").split(/\s+/).indexOf(active.specialty) !== -1;
    return roleOk && specOk;
  }

  function applyFilters() {
    var shown = 0;
    cards.forEach(function (card) {
      var ok = matches(card);
      card.hidden = !ok;
      if (ok) shown++;
    });
    if (countNum) countNum.textContent = String(shown);
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  // ---- Chip groups ----
  var groups = document.querySelectorAll(".chips[data-filter]");
  Array.prototype.forEach.call(groups, function (group) {
    var key = group.getAttribute("data-filter");
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn || !group.contains(btn)) return;

      group.querySelectorAll(".chip").forEach(function (c) {
        var on = c === btn;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });

      active[key] = btn.getAttribute("data-value");
      applyFilters();
    });
  });

  // ---- Bio expand / collapse ----
  grid.addEventListener("click", function (e) {
    var toggle = e.target.closest(".bio-toggle");
    if (!toggle) return;

    var bio = toggle.parentElement.querySelector(".bio");
    if (!bio) return;

    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    toggle.textContent = open ? "Read bio" : "Hide bio";
    bio.hidden = open;
  });

  applyFilters();
})();
