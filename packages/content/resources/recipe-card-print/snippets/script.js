(function () {
  "use strict";

  var card = document.getElementById("card");
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  var printBtn = document.getElementById("printBtn");
  var hint = document.getElementById("hint");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  var SIZES = {
    "3x5": { cls: "card--3x5", label: "3×5 index card" },
    "4x6": { cls: "card--4x6", label: "4×6 recipe card" },
    full: { cls: "card--full", label: "Full page" }
  };

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function setSize(size) {
    if (!SIZES[size]) return;
    Object.keys(SIZES).forEach(function (key) {
      card.classList.remove(SIZES[key].cls);
    });
    card.classList.add(SIZES[size].cls);

    segBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-size") === size;
      btn.classList.toggle("is-active", active);
      if (active) {
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.removeAttribute("aria-pressed");
      }
    });

    if (hint) {
      hint.textContent =
        "Size: " + SIZES[size].label + " — press Print to fit one page.";
    }
  }

  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var size = btn.getAttribute("data-size");
      setSize(size);
      toast("Card sized to " + SIZES[size].label);
    });
  });

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      toast("Opening print dialog…");
      // let the toast paint before the blocking print() call
      setTimeout(function () {
        window.print();
      }, 120);
    });
  }

  // default
  setSize("4x6");
})();
