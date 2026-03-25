(function () {
  document.querySelectorAll("[data-btn-group]").forEach(function (group) {
    var buttons = group.querySelectorAll(".btn-group-item");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
    });
  });
}());
