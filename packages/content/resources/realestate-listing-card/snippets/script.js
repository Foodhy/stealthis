(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ---------- Persistence ---------- */
  var STORE_KEY = "stealthis.realestate.favorites";
  function loadFavs() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveFavs(list) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (e) {
      /* storage may be unavailable (private mode) — state stays in-session */
    }
  }
  var favorites = loadFavs();

  /* ---------- Per-card wiring ---------- */
  var cards = document.querySelectorAll(".card");

  cards.forEach(function (card) {
    var id = card.getAttribute("data-id");
    var media = card.querySelector(".card__media");
    var photo = card.querySelector(".card__photo");
    var dotsWrap = card.querySelector(".dots");
    var heart = card.querySelector(".heart");

    /* --- Carousel: build dots from data-slides --- */
    var slides = (photo.getAttribute("data-slides") || "warm")
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    var current = 0;
    photo.setAttribute("data-current", slides[0]);

    function go(index) {
      current = (index + slides.length) % slides.length;
      photo.setAttribute("data-current", slides[current]);
      var btns = dotsWrap.querySelectorAll("button");
      btns.forEach(function (b, i) {
        b.setAttribute("aria-selected", i === current ? "true" : "false");
      });
    }

    slides.forEach(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.setAttribute("aria-label", "View photo " + (i + 1) + " of " + slides.length);
      dot.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(dot);
    });

    /* Click anywhere on the photo (not a control) advances to next slide */
    photo.addEventListener("click", function () {
      go(current + 1);
    });

    /* Keyboard arrows when media region is focused via heart/dots area */
    media.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(current + 1); }
      else if (e.key === "ArrowLeft") { go(current - 1); }
    });

    /* --- Favorite heart --- */
    var label = card.querySelector(".card__photolabel");
    var name = label ? label.textContent.trim() : "Listing";

    function reflect(isFav) {
      heart.setAttribute("aria-pressed", isFav ? "true" : "false");
    }

    reflect(favorites.indexOf(id) !== -1);

    heart.addEventListener("click", function () {
      var idx = favorites.indexOf(id);
      var nowFav;
      if (idx === -1) {
        favorites.push(id);
        nowFav = true;
      } else {
        favorites.splice(idx, 1);
        nowFav = false;
      }
      saveFavs(favorites);
      reflect(nowFav);

      heart.classList.remove("is-bump");
      /* force reflow so the animation can restart */
      void heart.offsetWidth;
      if (nowFav) heart.classList.add("is-bump");

      toast(
        nowFav
          ? "Saved <b>" + name + "</b> to favorites"
          : "Removed <b>" + name + "</b> from favorites"
      );
    });
  });

  /* ---------- Startup nudge ---------- */
  if (favorites.length) {
    toast(
      favorites.length +
        " saved " +
        (favorites.length === 1 ? "listing" : "listings") +
        " restored"
    );
  }
})();
