/* Business Insurance Landing — vanilla JS, no libraries. */
(function () {
  "use strict";

  /* ---------- Industry tailoring tabs ---------- */
  var INDUSTRIES = {
    retail: {
      name: "Retail & e-commerce",
      desc: "Stock, storefronts and online orders covered. Most retailers start with a Business Owner's Policy plus cyber for card data.",
      lines: ["General liability", "Commercial property", "Cyber liability", "Product liability"],
      price: "$89",
    },
    construction: {
      name: "Construction & trades",
      desc: "Higher-risk work needs sturdier limits. Contractors bundle liability with workers' comp and tools coverage as standard.",
      lines: ["General liability", "Workers' compensation", "Tools & equipment", "Commercial auto"],
      price: "$162",
    },
    tech: {
      name: "Tech & startups",
      desc: "Your biggest exposure is data and contracts. Tech teams lean on cyber and professional liability over physical property.",
      lines: ["Cyber liability", "Professional liability (E&O)", "General liability", "Workers' compensation"],
      price: "$74",
    },
    hospitality: {
      name: "Food & hospitality",
      desc: "Foot traffic, food and staff all add risk. Restaurants and cafés pair a BOP with workers' comp and liquor liability.",
      lines: ["General liability", "Commercial property", "Workers' compensation", "Liquor liability"],
      price: "$118",
    },
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".ind-tab"));
  var indName = document.getElementById("ind-name");
  var indDesc = document.getElementById("ind-desc");
  var indLines = document.getElementById("ind-lines");
  var indPrice = document.getElementById("ind-price");

  function renderIndustry(key) {
    var data = INDUSTRIES[key];
    if (!data) return;
    indName.textContent = data.name;
    indDesc.textContent = data.desc;
    indPrice.textContent = data.price;
    indLines.innerHTML = "";
    data.lines.forEach(function (line) {
      var li = document.createElement("li");
      li.textContent = line;
      indLines.appendChild(li);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderIndustry(tab.dataset.ind);
    });
  });
  renderIndustry("retail");

  /* ---------- Bundle savings calculator ---------- */
  var checks = Array.prototype.slice.call(document.querySelectorAll(".calc-line input"));
  var totalEl = document.getElementById("calc-total");
  var saveEl = document.getElementById("calc-save");

  function recalc() {
    var selected = checks.filter(function (c) { return c.checked; });
    var raw = selected.reduce(function (sum, c) { return sum + Number(c.dataset.price); }, 0);
    // Tiered bundle discount: 2 lines 8%, 3 lines 15%, 4 lines 22%.
    var rate = selected.length >= 4 ? 0.22 : selected.length === 3 ? 0.15 : selected.length === 2 ? 0.08 : 0;
    var saved = Math.round(raw * rate);
    var total = raw - saved;
    totalEl.textContent = total;
    if (saved > 0) {
      saveEl.textContent = "Bundle discount " + Math.round(rate * 100) + "% applied · save $" + saved + "/mo";
      saveEl.style.visibility = "visible";
    } else {
      saveEl.textContent = "Add a second line to unlock bundle savings";
    }
  }
  checks.forEach(function (c) { c.addEventListener("change", recalc); });
  recalc();

  /* ---------- Quote form validation ---------- */
  var form = document.getElementById("quote-form");
  var ok = document.getElementById("form-ok");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, msg) {
    var field = input.closest(".field");
    var err = field.querySelector(".err");
    field.classList.toggle("invalid", !!msg);
    err.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    return !msg;
  }

  function validateField(input) {
    var v = input.value.trim();
    if (input.id === "q-name") return setError(input, v ? "" : "Please enter your name.");
    if (input.id === "q-email") {
      if (!v) return setError(input, "Please enter your business email.");
      return setError(input, emailRe.test(v) ? "" : "Enter a valid email address.");
    }
    if (input.id === "q-emp") return setError(input, v ? "" : "Select your team size.");
    return true;
  }

  ["q-name", "q-email", "q-emp"].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("blur", function () { validateField(el); });
    el.addEventListener("input", function () {
      if (el.closest(".field").classList.contains("invalid")) validateField(el);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = ["q-name", "q-email", "q-emp"].map(function (id) { return document.getElementById(id); });
    var valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      ok.hidden = true;
      var firstBad = form.querySelector(".field.invalid input, .field.invalid select");
      if (firstBad) firstBad.focus();
      return;
    }
    var name = document.getElementById("q-name").value.trim().split(" ")[0];
    ok.hidden = false;
    ok.textContent = "Thanks, " + name + "! An advisor will email your tailored quote within one business day.";
    form.reset();
    recalc();
  });
})();
