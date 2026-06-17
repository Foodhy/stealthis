(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function cardTitle(card) {
    var t = card.querySelector(".title");
    return t ? t.textContent.trim() : "event";
  }

  // ----- save / heart toggle -----
  document.querySelectorAll(".save").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", pressed ? "false" : "true");
      btn.classList.remove("pulse");
      // reflow to restart animation
      void btn.offsetWidth;
      if (!pressed) btn.classList.add("pulse");

      var name = cardTitle(btn.closest(".card"));
      toast(pressed ? "Removed " + name + " from saved" : "Saved " + name);
    });
  });

  // ----- get tickets cta -----
  document.querySelectorAll(".cta").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (btn.disabled) return;
      var name = cardTitle(btn.closest(".card"));
      toast("Opening checkout for " + name + "…");
    });
  });

  // ----- card activation (Enter / Space on focused card) -----
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      // don't hijack when focus is on an inner control
      if (e.target !== card) return;
      e.preventDefault();
      if (card.classList.contains("is-soldout")) {
        toast(cardTitle(card) + " is sold out");
      } else {
        toast("Opening checkout for " + cardTitle(card) + "…");
      }
    });
  });
})();
