(function () {
  "use strict";

  var form = document.getElementById("inquiry-form");
  var success = document.getElementById("success");
  var summary = document.getElementById("summary");
  var successText = document.getElementById("success-text");
  var againBtn = document.getElementById("again");

  var budget = document.getElementById("budget");
  var budgetOut = document.getElementById("budget-out");
  var message = document.getElementById("message");
  var counter = document.getElementById("count");
  var dateInput = document.getElementById("date");

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- currency formatting for budget ---------- */
  function fmtMoney(n) {
    n = Number(n);
    var label = "$" + n.toLocaleString("en-US");
    if (n >= 10000) label = "$10,000+";
    return label;
  }
  function paintRange() {
    var min = Number(budget.min);
    var max = Number(budget.max);
    var pct = ((Number(budget.value) - min) / (max - min)) * 100;
    budget.style.backgroundSize = pct + "% 100%";
    budgetOut.textContent = fmtMoney(budget.value);
  }
  budget.addEventListener("input", paintRange);
  paintRange();

  /* ---------- min date = tomorrow ---------- */
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split("T")[0];

  /* ---------- char counter ---------- */
  function updateCount() {
    var len = message.value.length;
    var max = Number(message.getAttribute("maxlength")) || 600;
    counter.textContent = len + " / " + max;
    counter.classList.toggle("is-near", len > max - 60);
  }
  message.addEventListener("input", updateCount);
  updateCount();

  /* ---------- validation ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(name, msg) {
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if (el) el.textContent = msg || "";
    var field = null;
    var input = form.elements[name];
    if (input && input.closest) field = input.closest(".field");
    if (field) field.classList.toggle("field--invalid", !!msg);
  }

  var validators = {
    session: function () {
      return form.session.value ? "" : "Pick a session type.";
    },
    name: function () {
      var v = form.name.value.trim();
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "That name looks too short.";
      return "";
    },
    email: function () {
      var v = form.email.value.trim();
      if (!v) return "Email is required.";
      if (!emailRe.test(v)) return "Enter a valid email address.";
      return "";
    },
    date: function () {
      var v = form.date.value;
      if (!v) return "Choose a preferred date.";
      if (v < dateInput.min) return "Please pick a future date.";
      return "";
    },
    message: function () {
      var v = form.message.value.trim();
      if (!v) return "Tell us a little about the shoot.";
      if (v.length < 12) return "A few more details, please.";
      return "";
    },
    consent: function () {
      return form.consent.checked ? "" : "Please agree to be contacted.";
    }
  };

  function validateField(name) {
    if (!validators[name]) return true;
    var msg = validators[name]();
    setError(name, msg);
    return !msg;
  }

  ["name", "email", "date", "message"].forEach(function (name) {
    form.elements[name].addEventListener("blur", function () {
      validateField(name);
    });
    form.elements[name].addEventListener("input", function () {
      var el = form.querySelector('[data-error-for="' + name + '"]');
      if (el && el.textContent) validateField(name);
    });
  });

  Array.prototype.forEach.call(form.session, function (r) {
    r.addEventListener("change", function () { validateField("session"); });
  });
  form.consent.addEventListener("change", function () { validateField("consent"); });

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var order = ["session", "name", "email", "date", "message", "consent"];
    var ok = true;
    var firstBad = null;
    order.forEach(function (name) {
      var valid = validateField(name);
      if (!valid && ok) firstBad = name;
      ok = ok && valid;
    });

    if (!ok) {
      toast("Please fix the highlighted fields.");
      if (firstBad && form.elements[firstBad]) {
        var el = form.elements[firstBad];
        (el.focus ? el : el[0]).focus();
      }
      return;
    }

    var data = {
      session: form.session.value,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      date: form.date.value,
      budget: fmtMoney(budget.value)
    };

    // build summary
    var niceDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "long", day: "numeric", year: "numeric"
    });
    summary.innerHTML =
      row("Session", data.session) +
      row("Date", niceDate) +
      row("Budget", data.budget) +
      row("Reply to", data.email);
    successText.textContent =
      "Thanks, " + data.name.split(" ")[0] +
      " — your " + data.session.toLowerCase() +
      " request is in. We'll email you within one business day.";

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Inquiry sent ✦");
  });

  function row(label, value) {
    return "<dt>" + label + "</dt><dd>" + escapeHtml(value) + "</dd>";
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- reset / send another ---------- */
  form.addEventListener("reset", function () {
    setTimeout(function () {
      ["session", "name", "email", "date", "message", "consent"].forEach(function (n) {
        setError(n, "");
      });
      paintRange();
      updateCount();
    }, 0);
    toast("Form cleared.");
  });

  againBtn.addEventListener("click", function () {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    ["session", "name", "email", "date", "message", "consent"].forEach(function (n) {
      setError(n, "");
    });
    paintRange();
    updateCount();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.session[0].focus();
  });
})();
