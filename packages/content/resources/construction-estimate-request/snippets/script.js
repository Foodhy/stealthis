(function () {
  "use strict";

  // ---- Pricing model (illustrative only) ----------------------------------
  // Base $/ft² and a fixed mobilization cost per project type.
  var TYPES = {
    kitchen:   { label: "Kitchen remodel", rate: 165, base: 6500 },
    bathroom:  { label: "Bathroom",        rate: 210, base: 4200 },
    addition:  { label: "Room addition",   rate: 235, base: 9000 },
    deck:      { label: "Deck / patio",    rate: 55,  base: 2200 },
    wholehome: { label: "Whole-home reno", rate: 145, base: 22000 }
  };

  var FINISH = {
    1: { label: "Builder-grade", mult: 0.82 },
    2: { label: "Mid-range",     mult: 1.0 },
    3: { label: "Premium",       mult: 1.32 },
    4: { label: "Luxury",        mult: 1.75 }
  };

  // ---- DOM ----------------------------------------------------------------
  var configForm = document.getElementById("config-form");
  var sqftInput  = document.getElementById("sqft");
  var finishRng  = document.getElementById("finish");
  var finishLbl  = document.getElementById("finish-label");
  var timelineEl = document.getElementById("timeline");

  var rangeOut   = document.getElementById("range-out");
  var metaType   = document.getElementById("meta-type");
  var metaSize   = document.getElementById("meta-size");
  var metaScope  = document.getElementById("meta-scope");

  var contactForm = document.getElementById("contact-form");
  var confirmBox  = document.getElementById("confirm");
  var resetBtn    = document.getElementById("reset-btn");

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function getType() {
    var checked = configForm.querySelector('input[name="ptype"]:checked');
    return TYPES[checked ? checked.value : "kitchen"];
  }

  function getScopeAddons() {
    var boxes = configForm.querySelectorAll('input[name="scope"]:checked');
    var total = 0;
    boxes.forEach(function (b) {
      total += Number(b.getAttribute("data-add")) || 0;
    });
    return { total: total, count: boxes.length };
  }

  function calc() {
    var type = getType();
    var sqft = Math.max(40, Math.min(6000, Number(sqftInput.value) || 0));
    var finish = FINISH[finishRng.value] || FINISH[2];
    var scope = getScopeAddons();
    var timeMult = Number(timelineEl.value) || 1;

    // Core build cost scaled by size and finish, plus selected scope add-ons.
    var core = (type.base + type.rate * sqft) * finish.mult;
    var mid = (core + scope.total) * timeMult;

    // Quote a +/- band that tightens for smaller jobs.
    var low = mid * 0.88;
    var high = mid * 1.16;

    rangeOut.textContent = money(low) + " – " + money(high);
    metaType.textContent = type.label;
    metaSize.textContent = sqft.toLocaleString("en-US") + " ft² · " + finish.label;
    metaScope.textContent =
      scope.count + " selected" +
      (scope.count ? " · +" + money(scope.total) : "");
    finishLbl.textContent = finish.label;

    return { low: low, high: high };
  }

  // Recalculate on any configurator change
  configForm.addEventListener("input", calc);
  configForm.addEventListener("change", calc);

  // ---- Validation ---------------------------------------------------------
  var fields = {
    name:  { el: document.getElementById("name"),  err: document.getElementById("err-name") },
    email: { el: document.getElementById("email"), err: document.getElementById("err-email") },
    phone: { el: document.getElementById("phone"), err: document.getElementById("err-phone") }
  };

  function validName(v) { return v.trim().length >= 2; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function validPhone(v) {
    var digits = v.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  var validators = { name: validName, email: validEmail, phone: validPhone };

  function check(key) {
    var f = fields[key];
    var ok = validators[key](f.el.value);
    f.el.classList.toggle("invalid", !ok);
    f.err.hidden = ok;
    if (!ok) f.el.setAttribute("aria-invalid", "true");
    else f.el.removeAttribute("aria-invalid");
    return ok;
  }

  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener("blur", function () { check(key); });
    fields[key].el.addEventListener("input", function () {
      if (fields[key].el.classList.contains("invalid")) check(key);
    });
  });

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    Object.keys(fields).forEach(function (key) {
      if (!check(key)) ok = false;
    });
    if (!ok) {
      var firstBad = contactForm.querySelector(".invalid");
      if (firstBad) firstBad.focus();
      return;
    }

    var range = calc();
    document.getElementById("confirm-name").textContent =
      fields.name.el.value.trim().split(/\s+/)[0] || "there";
    document.getElementById("confirm-phone").textContent = fields.phone.el.value.trim();
    document.getElementById("confirm-range").textContent =
      money(range.low) + " – " + money(range.high);

    contactForm.hidden = true;
    confirmBox.hidden = false;
    confirmBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", function () {
    contactForm.reset();
    Object.keys(fields).forEach(function (key) {
      fields[key].el.classList.remove("invalid");
      fields[key].el.removeAttribute("aria-invalid");
      fields[key].err.hidden = true;
    });
    confirmBox.hidden = true;
    contactForm.hidden = false;
    fields.name.el.focus();
  });

  // Initial paint
  calc();
})();
