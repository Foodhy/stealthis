(function () {
  "use strict";

  // Fictional but realistic card data.
  var CARD = {
    pan: "4242 8810 5673 4242",
    cvv: "318",
    holder: "ANA M. REYES",
    expiry: "08 / 29"
  };

  var card = document.getElementById("card");
  var panEl = document.getElementById("pan");
  var cvvEl = document.getElementById("cvv");
  var flipBtn = document.getElementById("flip");
  var revealBtn = document.getElementById("reveal");
  var revealLabel = document.getElementById("reveal-label");
  var copyBtn = document.getElementById("copy");
  var themeGrid = document.getElementById("themeGrid");
  var toastEl = document.getElementById("toast");

  var revealed = false;
  var flipped = false;
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  var groups = CARD.pan.split(" ");

  function renderPan() {
    if (revealed) {
      panEl.innerHTML = groups
        .map(function (g) { return "<span>" + g + "</span>"; })
        .join("");
    } else {
      panEl.innerHTML =
        "<span>" + groups[0] + "</span>" +
        '<span class="mask">••••</span>' +
        '<span class="mask">••••</span>' +
        "<span>" + groups[3] + "</span>";
    }
  }

  function setRevealed(state) {
    revealed = state;
    renderPan();
    cvvEl.textContent = revealed ? CARD.cvv : "•••";
    revealBtn.setAttribute("aria-pressed", String(revealed));
    revealLabel.textContent = revealed ? "Hide number" : "Reveal number";
  }

  function setFlipped(state) {
    flipped = state;
    card.classList.toggle("is-flipped", flipped);
    card.setAttribute("aria-pressed", String(flipped));
  }

  // Flip on card tap.
  card.addEventListener("click", function () {
    setFlipped(!flipped);
  });

  flipBtn.addEventListener("click", function () {
    setFlipped(!flipped);
  });

  revealBtn.addEventListener("click", function () {
    setRevealed(!revealed);
    if (revealed) {
      toast("Card number revealed — keep it private");
    } else {
      toast("Card number hidden");
    }
  });

  copyBtn.addEventListener("click", function () {
    var text = CARD.pan.replace(/\s+/g, "");
    function done() { toast("Card number copied to clipboard"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { toast("Couldn't copy — please copy manually"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  });

  // Theme switching.
  var THEME_CLASSES = ["theme-metal", "theme-gradient", "theme-minimal"];
  var swatches = Array.prototype.slice.call(themeGrid.querySelectorAll(".swatch"));

  function applyTheme(theme, source) {
    THEME_CLASSES.forEach(function (c) { card.classList.remove(c); });
    card.classList.add("theme-" + theme);
    swatches.forEach(function (sw) {
      var active = sw.getAttribute("data-theme") === theme;
      sw.classList.toggle("is-active", active);
      sw.setAttribute("aria-checked", String(active));
    });
    if (source) toast(source.querySelector(".sw-name").textContent + " applied");
  }

  themeGrid.addEventListener("click", function (e) {
    var sw = e.target.closest(".swatch");
    if (!sw) return;
    applyTheme(sw.getAttribute("data-theme"), sw);
  });

  // Keyboard nav for the radiogroup (arrow keys).
  themeGrid.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var current = swatches.findIndex(function (s) {
      return s.classList.contains("is-active");
    });
    var next = e.key === "ArrowRight"
      ? (current + 1) % swatches.length
      : (current - 1 + swatches.length) % swatches.length;
    e.preventDefault();
    var sw = swatches[next];
    applyTheme(sw.getAttribute("data-theme"), sw);
    sw.focus();
  });

  // Init: start on the gradient theme to match initial markup class.
  applyTheme("gradient");
  document.getElementById("holder").textContent = CARD.holder;
  document.getElementById("expiry").textContent = CARD.expiry;
  setRevealed(false);
})();
