(function () {
  var wraps = Array.from(document.querySelectorAll(".popover-wrap"));

  function close(w) {
    w.classList.remove("is-open");
    var btn = w.querySelector("[aria-expanded]");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
  function open(w) {
    wraps.forEach(close);
    w.classList.add("is-open");
    var btn = w.querySelector("[aria-expanded]");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  wraps.forEach(function (w) {
    var trigger = w.querySelector("[data-placement]");
    if (trigger) {
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        w.classList.contains("is-open") ? close(w) : open(w);
      });
    }
    w.querySelectorAll(".popover-close").forEach(function (btn) {
      btn.addEventListener("click", function () { close(w); });
    });
  });

  document.addEventListener("click", function () { wraps.forEach(close); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") wraps.forEach(close); });
}());
