(function () {
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.closest(".input-group");
      if (!group) return;
      var input = group.querySelector(".input-field");
      if (!input) return;

      navigator.clipboard.writeText(input.value).then(function () {
        var original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = original;
        }, 1500);
      });
    });
  });
}());
