(function () {
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function openModal(backdrop) {
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var first = backdrop.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeModal(backdrop) {
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // Open
  document.querySelectorAll("[data-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.dataset.modal);
      if (target) openModal(target);
    });
  });

  // Close on × and Cancel
  document.querySelectorAll(".modal-close, .modal-cancel").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var backdrop = btn.closest(".modal-backdrop");
      if (backdrop) closeModal(backdrop);
    });
  });

  // Close on backdrop click
  document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  // Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = document.querySelector(".modal-backdrop.is-open");
      if (open) closeModal(open);
    }
  });

  // Focus trap
  document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
    backdrop.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = Array.from(backdrop.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
}());
