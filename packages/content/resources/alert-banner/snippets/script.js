(function () {
  document.querySelectorAll(".alert-dismiss").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var alert = btn.closest(".alert");
      if (!alert) return;
      alert.style.maxHeight = alert.offsetHeight + "px";
      requestAnimationFrame(function () {
        alert.classList.add("alert--dismissing");
      });
      alert.addEventListener("transitionend", function () {
        alert.remove();
      }, { once: true });
    });
  });
}());
