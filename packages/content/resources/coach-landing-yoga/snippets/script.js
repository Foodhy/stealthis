(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- class filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".class-card"));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");

      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });

      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-cat") || "").split(/\s+/);
        var match = filter === "all" || cats.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });

      if (filter !== "all") {
        toast(shown + " " + (shown === 1 ? "class" : "classes") + " in this style");
      }
    });
  });

  /* ---------- schedule reservations ---------- */
  var rows = Array.prototype.slice.call(document.querySelectorAll(".sch-row"));

  rows.forEach(function (row) {
    var spotsEl = row.querySelector(".sch-spots");
    var btn = row.querySelector(".sch-book");
    var classEl = row.querySelector(".sch-class strong");

    function paint() {
      var n = parseInt(spotsEl.getAttribute("data-spots"), 10);
      spotsEl.classList.toggle("is-low", n > 0 && n <= 2);
      spotsEl.classList.toggle("is-full", n <= 0);
      if (n <= 0) {
        spotsEl.textContent = "Class full";
        row.classList.add("is-full");
        btn.textContent = "Waitlist";
      } else {
        spotsEl.textContent = n + (n === 1 ? " spot left" : " spots left");
      }
    }
    paint();

    btn.addEventListener("click", function () {
      var n = parseInt(spotsEl.getAttribute("data-spots"), 10);
      var name = classEl ? classEl.textContent : "class";
      if (n <= 0) {
        toast("Added to the waitlist for " + name);
        return;
      }
      n -= 1;
      spotsEl.setAttribute("data-spots", String(n));
      paint();
      btn.textContent = "Reserved ✓";
      setTimeout(function () {
        if (parseInt(spotsEl.getAttribute("data-spots"), 10) > 0) {
          btn.textContent = "Reserve";
        }
      }, 1600);
      toast("Spot reserved for " + name);
    });
  });

  /* ---------- join form ---------- */
  var form = document.getElementById("joinForm");
  if (form) {
    var emailInput = document.getElementById("email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (emailInput.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        emailInput.classList.add("is-error");
        emailInput.focus();
        toast("Please enter a valid email");
        return;
      }
      emailInput.classList.remove("is-error");
      var goal = document.getElementById("goal");
      var label = goal.options[goal.selectedIndex].text;
      form.reset();
      toast("Welcome to SoraFlow — pass sent for " + label.toLowerCase());
    });

    emailInput.addEventListener("input", function () {
      emailInput.classList.remove("is-error");
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
