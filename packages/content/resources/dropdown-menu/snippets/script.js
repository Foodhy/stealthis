(function () {
  var dropdowns = Array.from(document.querySelectorAll(".dropdown"));

  function openDropdown(dd) {
    dd.classList.add("is-open");
    dd.querySelector(".dropdown-trigger").setAttribute("aria-expanded", "true");
    var items = dd.querySelectorAll(".menu-item:not([disabled])");
    if (items.length) items[0].focus();
  }

  function closeDropdown(dd) {
    dd.classList.remove("is-open");
    dd.querySelector(".dropdown-trigger").setAttribute("aria-expanded", "false");
    dd.querySelector(".dropdown-trigger").focus();
  }

  function closeAll() { dropdowns.forEach(function (d) { if (d.classList.contains("is-open")) closeDropdown(d); }); }

  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector(".dropdown-trigger");
    var menu    = dd.querySelector(".dropdown-menu");

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = dd.classList.contains("is-open");
      closeAll();
      if (!isOpen) openDropdown(dd);
    });

    menu.addEventListener("keydown", function (e) {
      var items = Array.from(menu.querySelectorAll(".menu-item:not([disabled])"));
      var idx   = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
      if (e.key === "Escape")    { closeDropdown(dd); }
    });

    // Select-style checkmarks
    if (dd.id === "dd-select") {
      menu.querySelectorAll(".menu-item--check").forEach(function (item) {
        item.addEventListener("click", function () {
          menu.querySelectorAll(".menu-item--check").forEach(function (i) { i.classList.remove("is-checked"); });
          item.classList.add("is-checked");
          var valEl = document.getElementById("dd-select-val");
          if (valEl) valEl.textContent = "Sort: " + item.dataset.val;
          closeDropdown(dd);
        });
      });
    }
  });

  document.addEventListener("click", closeAll);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
}());
