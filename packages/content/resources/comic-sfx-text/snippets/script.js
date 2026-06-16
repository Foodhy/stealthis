(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  /* ---------- Replay the pop-in animation on an element ---------- */
  function pop(el) {
    if (!el) return;
    el.classList.remove("is-popping");
    // force reflow so the animation restarts even on rapid clicks
    void el.offsetWidth;
    el.classList.add("is-popping");
  }

  // Clean up the class once the animation ends (lets :hover transforms work again)
  document.addEventListener(
    "animationend",
    function (e) {
      if (e.animationName === "sfx-pop") {
        e.target.classList.remove("is-popping");
      }
    },
    true
  );

  /* ---------- Preset panels: click to re-pop ---------- */
  var panels = document.querySelectorAll("[data-sfx]");
  panels.forEach(function (panel) {
    panel.addEventListener("click", function () {
      var word = panel.querySelector("[data-word]");
      pop(word);
      var label = word ? word.textContent.trim() : "SFX";
      toast(label + " — re-lettered!");
    });
  });

  /* ---------- SFX maker ---------- */
  var burstColors = [
    "#ff2e4d", // accent
    "#ffd23f", // accent-2
    "#2e6bff", // accent-blue
    "#23232b", // ink-2
    "#11b886", // emerald
    "#ff7a18", // orange
    "#8e44ff", // violet
  ];
  var fillColors = ["#ff2e4d", "#ffd23f", "#2e6bff", "#fdfcf7", "#ff7a18"];

  var stage = document.getElementById("stage");
  var stageWord = document.getElementById("stage-word");
  var stageBurst = stage ? stage.querySelector(".burst") : null;
  var form = document.getElementById("maker");
  var input = document.getElementById("sfx-input");
  var shuffleBtn = document.getElementById("shuffle");

  function pick(arr, avoid) {
    var c;
    do {
      c = arr[Math.floor(Math.random() * arr.length)];
    } while (avoid && c === avoid && arr.length > 1);
    return c;
  }

  var lastFill = null;
  function randomizeColors() {
    var fill = pick(fillColors, lastFill);
    lastFill = fill;
    var burst = pick(burstColors);
    if (stageWord) stageWord.style.setProperty("--fill", fill);
    if (stageBurst) stageBurst.style.setProperty("--burst", burst);
  }

  function renderSfx(raw) {
    var word = (raw || "").trim();
    if (!word) {
      toast("Type a word first!");
      if (input) input.focus();
      return false;
    }
    word = word.slice(0, 14).toUpperCase();
    if (stageWord) {
      stageWord.textContent = word;
      randomizeColors();
      pop(stageWord);
    }
    return true;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (renderSfx(input ? input.value : "")) {
        toast("Lettered “" + stageWord.textContent + "”");
      }
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      randomizeColors();
      pop(stageWord);
      toast("New burst color");
    });
  }

  // Click the stage word itself to replay
  if (stageWord) {
    stageWord.style.cursor = "pointer";
    stageWord.setAttribute("role", "button");
    stageWord.setAttribute("tabindex", "0");
    stageWord.setAttribute("aria-label", "Replay sound-effect animation");
    stageWord.addEventListener("click", function () {
      pop(stageWord);
    });
    stageWord.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pop(stageWord);
      }
    });
  }

  // Initial flourish
  randomizeColors();
  pop(stageWord);
})();
