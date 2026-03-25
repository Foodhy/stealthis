(function () {
  document.querySelectorAll(".msg-dismiss").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var msg = btn.closest(".msg");
      if (!msg) return;

      /* Lock current height so CSS can transition it */
      msg.style.maxHeight = msg.offsetHeight + "px";

      requestAnimationFrame(function () {
        msg.classList.add("msg--dismissing");
      });

      msg.addEventListener("transitionend", function handler(e) {
        if (e.propertyName === "opacity") {
          msg.remove();
        }
      });
    });
  });
}());
