(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
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

  /* ---------- Ingredient check-off ---------- */
  var checkboxes = Array.prototype.slice.call(
    document.querySelectorAll(".ing-check input[type='checkbox']")
  );
  var countEl = document.getElementById("ingCount");
  var total = checkboxes.length;

  function updateCount() {
    var done = checkboxes.filter(function (cb) {
      return cb.checked;
    }).length;
    if (countEl) {
      countEl.textContent = done + " of " + total + " gathered";
    }
    if (done === total && total > 0) {
      toast("All ingredients gathered — let's cook 🍳");
    }
  }

  checkboxes.forEach(function (cb) {
    cb.addEventListener("change", updateCount);
  });
  updateCount();

  /* ---------- Reset checklist ---------- */
  var clearBtn = document.getElementById("clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      checkboxes.forEach(function (cb) {
        cb.checked = false;
      });
      updateCount();
      toast("Checklist reset");
    });
  }

  /* ---------- Save (toggle) ---------- */
  var saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      var saved = saveBtn.getAttribute("aria-pressed") === "true";
      saved = !saved;
      saveBtn.setAttribute("aria-pressed", String(saved));
      var label = saveBtn.querySelector("span:last-child");
      if (label) label.textContent = saved ? "Saved" : "Save";
      toast(saved ? "Recipe saved to your book 🔖" : "Removed from saved");
    });
  }

  /* ---------- Print ---------- */
  var printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  /* ---------- Share ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: document.title,
        text: "Charred Tomato & Saffron Orzo — a 37-minute one-pan supper.",
        url: window.location.href,
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(data.url)
          .then(function () {
            toast("Link copied to clipboard 🔗");
          })
          .catch(function () {
            toast("Couldn't copy link");
          });
      } else {
        toast("Share: " + data.url);
      }
    });
  }
})();
