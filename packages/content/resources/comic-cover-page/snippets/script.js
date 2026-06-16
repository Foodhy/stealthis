(function () {
  "use strict";

  var cover = document.getElementById("cover");
  var tagline = document.getElementById("tagline");
  var artist = document.getElementById("artist");
  var collectBtn = document.getElementById("collect");
  var variantBtns = Array.prototype.slice.call(document.querySelectorAll(".variant"));
  var toastEl = document.getElementById("toast");

  // ---- edition data ----
  var EDITIONS = {
    standard: {
      label: "Standard Edition",
      tagline: "No master. No mercy. One last blade.",
      artist: "R. Tanaka & L. Vega",
    },
    midnight: {
      label: "Midnight Foil Variant",
      tagline: "When the neon dies, the ronin rises.",
      artist: "Kira Sol · Midnight Foil",
    },
    goldfoil: {
      label: "1:25 Gold Incentive",
      tagline: "The legend, struck in 24-karat ink.",
      artist: "Dario Quell · 1:25 Incentive",
    },
  };

  // ---- toast helper ----
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  // ---- variant switching ----
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setVariant(key) {
    var data = EDITIONS[key];
    if (!data || cover.getAttribute("data-variant") === key) return;

    cover.setAttribute("data-variant", key);

    // swap tagline + credit with a quick fade
    tagline.style.opacity = "0";
    tagline.style.transform = "translateY(-4px)";
    setTimeout(function () {
      tagline.textContent = data.tagline;
      artist.textContent = data.artist;
      tagline.style.opacity = "";
      tagline.style.transform = "";
    }, 180);

    // flip-in animation
    if (!reduceMotion) {
      cover.classList.remove("is-flipping");
      // force reflow so the animation can replay
      void cover.offsetWidth;
      cover.classList.add("is-flipping");
    }

    // sync radio buttons
    variantBtns.forEach(function (b) {
      var active = b.getAttribute("data-variant") === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-checked", active ? "true" : "false");
    });

    toast("Now showing: " + data.label);
  }

  cover.addEventListener("animationend", function () {
    cover.classList.remove("is-flipping");
  });

  variantBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setVariant(btn.getAttribute("data-variant"));
    });
  });

  // keyboard: left/right arrows move between editions in the radiogroup
  var group = document.querySelector(".toolbar__group");
  if (group) {
    group.addEventListener("keydown", function (e) {
      var keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      var idx = variantBtns.indexOf(document.activeElement);
      if (idx === -1) idx = 0;
      var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      var next = (idx + dir + variantBtns.length) % variantBtns.length;
      variantBtns[next].focus();
      setVariant(variantBtns[next].getAttribute("data-variant"));
    });
  }

  // ---- save to collection toggle ----
  var saved = false;
  collectBtn.addEventListener("click", function () {
    saved = !saved;
    collectBtn.setAttribute("aria-pressed", saved ? "true" : "false");
    collectBtn.querySelector(".collect__text").textContent = saved
      ? "In your collection"
      : "Save to collection";
    var edition = EDITIONS[cover.getAttribute("data-variant")];
    toast(
      saved
        ? "Added Neon Ronin #42 (" + edition.label + ") to your pull list ★"
        : "Removed from your pull list"
    );
  });
})();
