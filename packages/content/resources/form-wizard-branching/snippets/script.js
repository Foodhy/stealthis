(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * Branching wizard
   * The set of steps shown depends on the user's answers. State tracks the
   * collected answers plus a computed `sequence` (the active branch), so the
   * progress count, crumbs and Back button always reflect the real path.
   * ------------------------------------------------------------------- */

  var form = document.getElementById("wizardForm");
  var stage = document.getElementById("stage");
  var steps = Array.prototype.slice.call(stage.querySelectorAll(".step"));

  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var nextLabel = document.getElementById("nextLabel");

  var crumbsEl = document.getElementById("crumbs");
  var trackFill = document.getElementById("trackFill");
  var track = document.getElementById("track");
  var stepNowEl = document.getElementById("stepNow");
  var stepTotalEl = document.getElementById("stepTotal");
  var railPathEl = document.getElementById("railPath");
  var liveStatus = document.getElementById("liveStatus");

  var doneEl = document.getElementById("done");
  var doneMsg = document.getElementById("doneMsg");
  var restartBtn = document.getElementById("restartBtn");
  var toastHost = document.getElementById("toastHost");

  /* Step metadata. `branch: "business"` steps only appear on the business path. */
  var META = {
    "account-type": { label: "Account", branch: "all" },
    profile: { label: "Profile", branch: "all" },
    company: { label: "Company", branch: "business" },
    tax: { label: "Tax", branch: "business" },
    review: { label: "Review", branch: "all" }
  };

  var state = {
    answers: {},
    sequence: [],
    index: 0
  };

  /* --------------------------- step sequence --------------------------- */

  function computeSequence() {
    var business = state.answers.accountType === "business";
    var seq = [];
    Object.keys(META).forEach(function (key) {
      var b = META[key].branch;
      if (b === "all" || (b === "business" && business)) seq.push(key);
    });
    return seq;
  }

  /* Keep index pointed at the same step key when the branch changes length. */
  function rebuildSequence(currentKey) {
    state.sequence = computeSequence();
    var i = state.sequence.indexOf(currentKey);
    state.index = i === -1 ? Math.min(state.index, state.sequence.length - 1) : i;
  }

  function currentKey() {
    return state.sequence[state.index];
  }

  function getStep(key) {
    return steps.filter(function (s) {
      return s.getAttribute("data-step") === key;
    })[0];
  }

  /* ------------------------------- render ------------------------------ */

  function render() {
    var key = currentKey();
    var total = state.sequence.length;

    steps.forEach(function (s) {
      s.hidden = s.getAttribute("data-step") !== key;
    });

    stepNowEl.textContent = String(state.index + 1);
    stepTotalEl.textContent = String(total);
    railPathEl.textContent =
      state.answers.accountType === "business" ? "Business path" : "Personal path";

    var pct = total <= 1 ? 0 : (state.index / (total - 1)) * 100;
    trackFill.style.width = pct + "%";
    track.setAttribute("aria-valuenow", String(Math.round(pct)));

    renderCrumbs();

    backBtn.hidden = state.index === 0;
    var isLast = state.index === total - 1;
    nextLabel.textContent = isLast ? "Create account" : "Continue";

    if (key === "review") buildSummary();

    /* Focus the first sensible target on the new step for keyboard users. */
    var stepEl = getStep(key);
    var focusable = stepEl.querySelector(
      "input:not([type=hidden]), select, textarea, button"
    );
    if (focusable) {
      // Defer so the step's enter animation doesn't fight the scroll.
      window.requestAnimationFrame(function () {
        focusable.focus({ preventScroll: false });
      });
    }
  }

  function renderCrumbs() {
    crumbsEl.innerHTML = "";
    state.sequence.forEach(function (key, i) {
      var li = document.createElement("li");
      if (i < state.index) li.className = "done";
      else if (i === state.index) {
        li.className = "current";
        li.setAttribute("aria-current", "step");
      }
      var num = document.createElement("span");
      num.className = "num";
      num.textContent = i < state.index ? "✓" : String(i + 1);
      var label = document.createTextNode(META[key].label);
      li.appendChild(num);
      li.appendChild(label);
      crumbsEl.appendChild(li);
    });
  }

  /* ----------------------------- summary ------------------------------- */

  function buildSummary() {
    var a = state.answers;
    var business = a.accountType === "business";
    document.getElementById("reviewPathName").textContent = business
      ? "business account"
      : "personal account";

    var rows = [];
    rows.push({ head: "Account" });
    rows.push(["Type", business ? "Business" : "Personal"]);
    rows.push(["Name", a.fullName || "—"]);
    rows.push(["Email", a.email || "—"]);
    rows.push(["Password", a.password ? "•".repeat(Math.min(a.password.length, 12)) : "—"]);

    if (business) {
      rows.push({ head: "Company" });
      rows.push(["Legal name", a.companyName || "—"]);
      rows.push(["Team size", a.companySize || "—"]);
      rows.push(["Country", countryName(a.country)]);
      rows.push({ head: "Tax & billing" });
      rows.push(["VAT-registered", a.vatRegistered === "yes" ? "Yes" : "No"]);
      if (a.vatRegistered === "yes") rows.push(["VAT number", a.vatNumber || "—"]);
      rows.push(["Billing email", a.billingEmail || a.email || "—"]);
    }

    var dl = document.getElementById("summary");
    dl.innerHTML = "";
    rows.forEach(function (r) {
      if (r.head) {
        var h = document.createElement("div");
        h.className = "group-head";
        h.textContent = r.head;
        dl.appendChild(h);
        return;
      }
      var row = document.createElement("div");
      row.className = "row";
      var dt = document.createElement("dt");
      dt.textContent = r[0];
      var dd = document.createElement("dd");
      dd.textContent = r[1];
      row.appendChild(dt);
      row.appendChild(dd);
      dl.appendChild(row);
    });
  }

  function countryName(code) {
    var map = {
      DE: "Germany",
      FR: "France",
      ES: "Spain",
      GB: "United Kingdom",
      US: "United States"
    };
    return map[code] || "—";
  }

  function isEU(code) {
    return ["DE", "FR", "ES"].indexOf(code) !== -1;
  }

  /* ---------------------------- validation ----------------------------- */

  function setError(name, msg) {
    var field = form.elements[name];
    var errEl = document.getElementById(name + "-err");
    if (errEl) {
      errEl.textContent = msg || "";
      errEl.classList.toggle("show", !!msg);
    }
    if (field && field.setAttribute && field.classList) {
      if (msg) {
        field.setAttribute("aria-invalid", "true");
        field.classList.remove("is-valid");
        var dn = errEl ? errEl.id : null;
        if (dn) {
          var existing = (field.getAttribute("aria-describedby") || "")
            .split(" ")
            .filter(function (x) { return x && x !== dn; });
          existing.push(dn);
          field.setAttribute("aria-describedby", existing.join(" "));
        }
      } else {
        field.setAttribute("aria-invalid", "false");
        field.classList.add("is-valid");
      }
    }
  }

  function clearError(name) {
    var field = form.elements[name];
    var errEl = document.getElementById(name + "-err");
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.remove("show");
    }
    if (field && field.setAttribute) field.setAttribute("aria-invalid", "false");
  }

  var validators = {
    "account-type": function () {
      if (!state.answers.accountType) {
        return { accountType: "Choose an account type to continue." };
      }
      return null;
    },
    profile: function () {
      var e = {};
      var name = (form.elements.fullName.value || "").trim();
      var email = (form.elements.email.value || "").trim();
      var pass = form.elements.password.value || "";
      if (name.length < 2) e.fullName = "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
      if (pass.length < 8) e.password = "Password must be at least 8 characters.";
      else if (!/\d/.test(pass)) e.password = "Include at least one number.";
      return Object.keys(e).length ? e : null;
    },
    company: function () {
      var e = {};
      var cn = (form.elements.companyName.value || "").trim();
      if (cn.length < 2) e.companyName = "Enter your registered company name.";
      if (!form.elements.companySize.value) e.companySize = "Select your team size.";
      if (!form.elements.country.value) e.country = "Select your country of registration.";
      return Object.keys(e).length ? e : null;
    },
    tax: function () {
      var e = {};
      var reg = (form.elements.vatRegistered || {}).value;
      if (!reg) {
        e.vatRegistered = "Let us know if you're VAT-registered.";
      } else if (reg === "yes") {
        var vat = (form.elements.vatNumber.value || "").trim().toUpperCase();
        if (!/^[A-Z]{2}[0-9A-Z]{8,12}$/.test(vat)) {
          e.vatNumber = "Enter a valid VAT number (e.g. DE123456789).";
        }
      }
      var be = (form.elements.billingEmail.value || "").trim();
      if (be && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(be)) {
        e.billingEmail = "Enter a valid billing email, or leave it blank.";
      }
      return Object.keys(e).length ? e : null;
    },
    review: function () {
      if (!form.elements.terms.checked) {
        return { terms: "Please accept the terms to finish." };
      }
      return null;
    }
  };

  function collectStep(key) {
    var a = state.answers;
    if (key === "account-type") {
      var t = form.elements.accountType;
      a.accountType = t ? t.value : a.accountType;
    } else if (key === "profile") {
      a.fullName = form.elements.fullName.value.trim();
      a.email = form.elements.email.value.trim();
      a.password = form.elements.password.value;
    } else if (key === "company") {
      a.companyName = form.elements.companyName.value.trim();
      a.companySize = form.elements.companySize.value;
      a.country = form.elements.country.value;
    } else if (key === "tax") {
      a.vatRegistered = (form.elements.vatRegistered || {}).value || "";
      a.vatNumber = form.elements.vatNumber.value.trim().toUpperCase();
      a.billingEmail = form.elements.billingEmail.value.trim();
    } else if (key === "review") {
      a.terms = form.elements.terms.checked;
    }
  }

  function validateStep(key) {
    var fn = validators[key];
    var errors = fn ? fn() : null;
    if (errors) {
      var first = null;
      Object.keys(errors).forEach(function (name) {
        setError(name, errors[name]);
        if (!first) first = name;
      });
      var n = Object.keys(errors).length;
      liveStatus.textContent =
        n + (n === 1 ? " field needs" : " fields need") + " attention on this step.";
      var firstEl = form.elements[first];
      if (firstEl && firstEl.focus) {
        var node = firstEl.length ? firstEl[0] : firstEl;
        if (node && node.focus) node.focus();
      }
      toast(n === 1 ? "Fix the highlighted field." : "Fix " + n + " highlighted fields.", "warn");
      return false;
    }
    liveStatus.textContent = "";
    return true;
  }

  /* ----------------------------- navigation ---------------------------- */

  function goNext() {
    var key = currentKey();
    collectStep(key);
    if (!validateStep(key)) return;

    /* The account-type answer reshapes the rest of the journey. */
    if (key === "account-type") rebuildSequence(key);

    if (state.index >= state.sequence.length - 1) {
      finish();
      return;
    }
    state.index += 1;
    render();
    liveStatus.textContent =
      "Step " + (state.index + 1) + " of " + state.sequence.length + ": " + META[currentKey()].label;
  }

  function goBack() {
    if (state.index === 0) return;
    collectStep(currentKey());
    state.index -= 1;
    render();
    liveStatus.textContent =
      "Returned to step " + (state.index + 1) + ": " + META[currentKey()].label;
  }

  function finish() {
    form.hidden = true;
    backBtn.hidden = true;
    var business = state.answers.accountType === "business";
    doneMsg.textContent = business
      ? "Your business account for " +
        (state.answers.companyName || "your company") +
        " is ready. We've emailed a confirmation link to " +
        (state.answers.email || "your inbox") +
        "."
      : "Welcome aboard, " +
        (state.answers.fullName.split(" ")[0] || "there") +
        ". We've emailed a confirmation link to " +
        (state.answers.email || "your inbox") +
        ".";
    doneEl.hidden = false;
    trackFill.style.width = "100%";
    track.setAttribute("aria-valuenow", "100");
    crumbsEl.querySelectorAll("li").forEach(function (li) {
      li.className = "done";
    });
    liveStatus.textContent = "Account created successfully.";
    toast("Account created", "ok");
    restartBtn.focus();
  }

  function restart() {
    form.reset();
    steps.forEach(function (s) {
      s.querySelectorAll(".field-err").forEach(function (e) {
        e.textContent = "";
        e.classList.remove("show");
      });
      s.querySelectorAll(".inp").forEach(function (i) {
        i.setAttribute("aria-invalid", "false");
        i.classList.remove("is-valid");
      });
    });
    state.answers = {};
    state.index = 0;
    state.sequence = computeSequence();
    document.getElementById("vatNumberField").hidden = true;
    doneEl.hidden = true;
    form.hidden = false;
    render();
    toast("Wizard reset");
  }

  /* ------------------------------- toast ------------------------------- */

  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "warn" ? " warn" : "");
    var dot = document.createElement("span");
    dot.className = "dot";
    el.appendChild(dot);
    el.appendChild(document.createTextNode(msg));
    toastHost.appendChild(el);
    var t = setTimeout(function () {
      el.classList.add("is-out");
      el.addEventListener("animationend", function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }, 2600);
    el.addEventListener("click", function () {
      clearTimeout(t);
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  /* ------------------------------ wiring ------------------------------- */

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    goNext();
  });

  backBtn.addEventListener("click", goBack);
  restartBtn.addEventListener("click", restart);

  /* Account-type cards: live-update the rail count as the path changes. */
  Array.prototype.forEach.call(form.elements.accountType, function (radio) {
    radio.addEventListener("change", function () {
      state.answers.accountType = radio.value;
      clearError("accountType");
      var key = currentKey();
      rebuildSequence(key);
      render();
      liveStatus.textContent =
        radio.value === "business"
          ? "Business selected. The wizard now has 5 steps."
          : "Personal selected. The wizard now has 3 steps.";
    });
  });

  /* VAT toggle: reveal/hide the conditional VAT number field within a step. */
  Array.prototype.forEach.call(form.elements.vatRegistered, function (radio) {
    radio.addEventListener("change", function () {
      var field = document.getElementById("vatNumberField");
      var show = radio.value === "yes";
      field.hidden = !show;
      clearError("vatRegistered");
      if (!show) {
        form.elements.vatNumber.value = "";
        clearError("vatNumber");
      } else {
        window.requestAnimationFrame(function () {
          form.elements.vatNumber.focus();
        });
      }
    });
  });

  /* Clear a field's error as soon as the user starts correcting it. */
  ["fullName", "email", "password", "companyName", "vatNumber", "billingEmail"].forEach(
    function (name) {
      var el = form.elements[name];
      if (el) el.addEventListener("input", function () { clearError(name); });
    }
  );
  ["companySize", "country"].forEach(function (name) {
    var el = form.elements[name];
    if (el) el.addEventListener("change", function () { clearError(name); });
  });
  form.elements.terms.addEventListener("change", function () { clearError("terms"); });

  /* Smart default: prefill billing email placeholder hint based on country. */
  form.elements.country.addEventListener("change", function () {
    var help = document.getElementById("vatNumber-help");
    if (isEU(form.elements.country.value)) {
      help.textContent = "EU businesses must provide a valid VAT number.";
    } else {
      help.textContent = "Country prefix followed by 8–12 digits.";
    }
  });

  /* ------------------------------- init -------------------------------- */
  state.sequence = computeSequence();
  state.index = 0;
  render();
})();
