(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = "✓ " + msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  var money = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ---------- Smooth-scroll for data-scroll buttons ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* ---------- Comparison segmented toggle ---------- */
  var segBtns = document.querySelectorAll(".seg-btn");
  var cmpCards = document.querySelectorAll(".cmp-card");
  function setCompare(opt) {
    segBtns.forEach(function (b) {
      var on = b.getAttribute("data-opt") === opt;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    cmpCards.forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-card") === opt);
    });
  }
  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setCompare(b.getAttribute("data-opt"));
    });
  });
  setCompare("aligners");

  /* ---------- "Choose" buttons prefill the form ---------- */
  var treatSelect = document.getElementById("c-treat");
  document.querySelectorAll(".cmp-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = btn.getAttribute("data-pick");
      if (treatSelect) {
        for (var i = 0; i < treatSelect.options.length; i++) {
          if (treatSelect.options[i].value === val) treatSelect.selectedIndex = i;
        }
      }
      // sync financing plan too
      var planKey = val.indexOf("aligner") > -1 ? "aligners" : "braces";
      selectPlan(document.querySelector('.plan[data-plan="' + planKey + '"]'));
      var consult = document.getElementById("consult");
      if (consult) consult.scrollIntoView({ behavior: "smooth", block: "center" });
      toast(val + " selected — tell us where to reach you");
    });
  });

  /* ---------- Range fill visual ---------- */
  function paintRange(input) {
    var pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--fill", pct + "%");
  }

  /* ---------- Financing estimator ---------- */
  var plans = document.querySelectorAll(".plan");
  var down = document.getElementById("down");
  var budget = document.getElementById("budget");
  var downOut = document.getElementById("down-out");
  var budgetOut = document.getElementById("budget-out");
  var mMonthly = document.getElementById("m-monthly");
  var mTerm = document.getElementById("m-term");
  var mFinanced = document.getElementById("m-financed");
  var mTotal = document.getElementById("m-total");
  var finFill = document.getElementById("fin-fill");
  var finNote = document.getElementById("fin-note");

  var currentPrice = 3400;
  var MAX_TERM = 36; // months cap for in-house 0% plan

  function selectPlan(el) {
    if (!el) return;
    plans.forEach(function (p) {
      var on = p === el;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-checked", on ? "true" : "false");
    });
    currentPrice = parseInt(el.getAttribute("data-price"), 10);
    recalc();
  }

  plans.forEach(function (p) {
    p.addEventListener("click", function () {
      selectPlan(p);
    });
  });

  function recalc() {
    var d = Math.min(parseInt(down.value, 10), currentPrice);
    var financed = Math.max(currentPrice - d, 0);
    var perMonth = parseInt(budget.value, 10);

    var term, monthly;
    if (financed <= 0) {
      term = 0;
      monthly = 0;
    } else {
      term = Math.ceil(financed / perMonth);
      if (term > MAX_TERM) {
        term = MAX_TERM;
        monthly = Math.ceil(financed / MAX_TERM);
      } else {
        monthly = perMonth;
        // even out last payment across the term
        monthly = Math.ceil(financed / term);
      }
    }

    downOut.textContent = money(d);
    budgetOut.textContent = money(perMonth) + "/mo";
    mMonthly.textContent = term === 0 ? money(0) : money(monthly);
    mTerm.textContent = term + " mo";
    mFinanced.textContent = money(financed);
    mTotal.textContent = money(currentPrice);

    // progress bar = how much the down payment covers
    var covered = currentPrice > 0 ? (d / currentPrice) * 100 : 0;
    finFill.style.width = Math.max(covered, 3) + "%";

    if (term === 0) {
      finNote.textContent = "Paid in full up front — you're all set!";
    } else if (parseInt(budget.value, 10) < monthly) {
      finNote.textContent =
        "Capped at " + MAX_TERM + " months, so we've nudged it to " + money(monthly) + "/mo. No interest, ever.";
    } else {
      finNote.textContent = "Paid off in " + term + " months. No interest, ever.";
    }
  }

  [down, budget].forEach(function (input) {
    paintRange(input);
    input.addEventListener("input", function () {
      paintRange(input);
      recalc();
    });
  });
  recalc();

  /* ---------- Consult form validation ---------- */
  var form = document.getElementById("consult-form");
  function setError(id, msg) {
    var input = document.getElementById(id);
    var wrap = input.closest(".field");
    var err = document.querySelector('.err[data-for="' + id + '"]');
    if (msg) {
      wrap.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      if (err) err.textContent = msg;
    } else {
      wrap.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("c-name");
    var email = document.getElementById("c-email");
    var ok = true;

    if (!name.value.trim()) {
      setError("c-name", "Please enter your name");
      ok = false;
    } else setError("c-name", "");

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) {
      setError("c-email", "Enter a valid email address");
      ok = false;
    } else setError("c-email", "");

    if (!ok) {
      var firstBad = form.querySelector(".field.invalid input");
      if (firstBad) firstBad.focus();
      return;
    }

    var treat = document.getElementById("c-treat").value;
    toast("Thanks, " + name.value.trim().split(" ")[0] + "! We'll confirm your " +
      (treat === "Not sure yet" ? "consult" : treat.toLowerCase()) + " within a day.");
    form.reset();
    [down, budget].forEach(paintRange);
  });

  // clear errors as the user types
  ["c-name", "c-email"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      setError(id, "");
    });
  });
})();
