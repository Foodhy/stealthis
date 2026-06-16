(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var toastEl = document.getElementById("toast");
  var tourCountEl = document.getElementById("tourCount");
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));

  /* simple in-memory state */
  var favorites = new Set();
  var tour = new Set();

  /* ---------- toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function titleOf(card) {
    var t = card.querySelector(".title");
    return t ? t.textContent.trim() : "this work";
  }

  function updateTourMeter() {
    tourCountEl.textContent = String(tour.size);
  }

  /* ---------- card / quick-action clicks ---------- */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".q-btn");
    if (!btn) return;
    var card = btn.closest(".card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    var act = btn.getAttribute("data-act");
    var name = titleOf(card);
    var pressed = btn.getAttribute("aria-pressed") === "true";
    var next = !pressed;
    btn.setAttribute("aria-pressed", String(next));

    if (act === "fav") {
      if (next) {
        favorites.add(id);
        toast("Saved <strong>" + name + "</strong> to favorites");
      } else {
        favorites.delete(id);
        toast("Removed <strong>" + name + "</strong> from favorites");
      }
    } else if (act === "tour") {
      if (next) {
        tour.add(id);
        toast("Added <strong>" + name + "</strong> to your tour");
      } else {
        tour.delete(id);
        toast("Removed <strong>" + name + "</strong> from your tour");
      }
      updateTourMeter();
    }
  });

  /* keyboard: pressing Enter/Space on a focused card adds to tour */
  grid.addEventListener("keydown", function (e) {
    var card = e.target.closest(".card");
    if (!card || e.target !== card) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      var tourBtn = card.querySelector('.q-btn[data-act="tour"]');
      if (tourBtn) tourBtn.click();
    }
  });

  /* ---------- size segmented control ---------- */
  function setSize(size, sourceBtn) {
    grid.setAttribute("data-size", size);
    segBtns.forEach(function (b) {
      var active = b === sourceBtn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }

  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setSize(b.getAttribute("data-size"), b);
    });
  });

  /* initialise default size */
  grid.setAttribute("data-size", "md");
  updateTourMeter();
})();
