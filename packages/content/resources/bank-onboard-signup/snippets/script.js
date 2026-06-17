(function () {
  "use strict";

  var form = document.getElementById("wizard");
  var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
  var stepperItems = Array.prototype.slice.call(
    document.querySelectorAll("#stepper .stepper__item")
  );
  var progressBar = document.getElementById("progressBar");
  var stepCount = document.getElementById("stepCount");
  var nextBtn = document.getElementById("nextBtn");
  var backBtn = document.getElementById("backBtn");
  var reviewEl = document.getElementById("review");
  var toaster = document.getElementById("toaster");

  var LAST_FORM_STEP = 3; // index of review step
  var current = 0;

  // ---------- Toast helper ----------
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    el.textContent = msg;
    toaster.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 2600);
  }

  // ---------- Validation ----------
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[+()\d][\d\s()-]{6,}$/;

  function setError(field, message) {
    if (!field) return;
    field.classList.toggle("is-invalid", !!message);
    var err = field.querySelector("[data-err]");
    if (err) err.textContent = message || "";
  }

  function validateControl(ctrl) {
    var field = ctrl.closest(".field");
    var value = (ctrl.value || "").trim();
    var name = ctrl.name;
    var label = field
      ? (field.querySelector(".field__label") || {}).textContent || "This field"
      : "This field";

    if (!value && ctrl.hasAttribute("required")) {
      setError(field, label + " is required.");
      return false;
    }
    if (name === "email" && value && !EMAIL_RE.test(value)) {
      setError(field, "Enter a valid email address.");
      return false;
    }
    if (name === "phone" && value && !PHONE_RE.test(value)) {
      setError(field, "Enter a valid phone number.");
      return false;
    }
    if (name === "dob" && value) {
      var age = (Date.now() - new Date(value).getTime()) / 31557600000;
      if (age < 18) {
        setError(field, "You must be at least 18 years old.");
        return false;
      }
    }
    if (name === "postcode" && value && value.length < 3) {
      setError(field, "Enter a valid postal code.");
      return false;
    }
    setError(field, "");
    return true;
  }

  function validateStep(index) {
    var section = steps[index];
    var ok = true;

    // standard inputs/selects
    var controls = section.querySelectorAll("input:not([type=checkbox]), select");
    Array.prototype.forEach.call(controls, function (ctrl) {
      if (!validateControl(ctrl)) ok = false;
    });

    // identity uploads (step 2)
    if (index === 2) {
      ["id", "selfie"].forEach(function (key) {
        var btn = section.querySelector('[data-upload="' + key + '"]');
        var err = section.querySelector('[data-err="' + key + '"]');
        var done = btn.classList.contains("is-done");
        if (err) err.textContent = done ? "" : "Please complete this upload.";
        if (!done) ok = false;
      });
    }

    // terms (step 3)
    if (index === 3) {
      var terms = section.querySelector('input[name="terms"]');
      var termsErr = section.querySelector('[data-err="terms"]');
      if (!terms.checked) {
        if (termsErr) termsErr.textContent = "You must accept the terms to continue.";
        ok = false;
      } else if (termsErr) {
        termsErr.textContent = "";
      }
    }

    return ok;
  }

  // Clear error as the user fixes a field
  form.addEventListener("input", function (e) {
    var ctrl = e.target;
    if (ctrl.matches("input:not([type=checkbox]), select")) {
      var field = ctrl.closest(".field");
      if (field && field.classList.contains("is-invalid")) validateControl(ctrl);
    }
    if (ctrl.name === "terms") {
      var termsErr = document.querySelector('[data-err="terms"]');
      if (ctrl.checked && termsErr) termsErr.textContent = "";
    }
  });

  // ---------- Step rendering ----------
  function showStep(index) {
    steps.forEach(function (s, i) {
      var active = i === index;
      s.classList.toggle("is-active", active);
      s.hidden = !active;
    });

    stepperItems.forEach(function (item, i) {
      item.classList.toggle("is-active", i === index);
      item.classList.toggle("is-done", i < index && index <= LAST_FORM_STEP);
      if (index > LAST_FORM_STEP) item.classList.add("is-done");
    });

    var pct;
    if (index > LAST_FORM_STEP) {
      pct = 100;
      stepCount.textContent = "Application complete";
    } else {
      pct = ((index + 1) / (LAST_FORM_STEP + 1)) * 100;
      stepCount.textContent = "Step " + (index + 1) + " of " + (LAST_FORM_STEP + 1);
    }
    progressBar.style.width = pct + "%";

    backBtn.hidden = index === 0 || index > LAST_FORM_STEP;
    nextBtn.hidden = index > LAST_FORM_STEP;
    nextBtn.textContent = index === LAST_FORM_STEP ? "Submit application" : "Continue";

    // focus first control of the new step
    var firstCtrl = steps[index].querySelector("input, select, button");
    if (firstCtrl) {
      setTimeout(function () {
        firstCtrl.focus({ preventScroll: true });
      }, 60);
    }
    current = index;
  }

  function goNext() {
    if (current <= LAST_FORM_STEP && !validateStep(current)) {
      toast("Please fix the highlighted fields.", "err");
      var firstBad = steps[current].querySelector(".is-invalid input, .is-invalid select");
      if (firstBad) firstBad.focus();
      return;
    }

    if (current < LAST_FORM_STEP) {
      if (current === 2) buildReview();
      showStep(current + 1);
      return;
    }

    if (current === LAST_FORM_STEP) {
      submit();
    }
  }

  function submit() {
    nextBtn.disabled = true;
    nextBtn.textContent = "Submitting…";
    toast("Encrypting & sending your application…");
    setTimeout(function () {
      var data = collect();
      document.getElementById("successName").textContent = data.firstName || "there";
      document.getElementById("appRef").textContent =
        "NB-" + Math.floor(100000 + Math.random() * 899999);
      showStep(LAST_FORM_STEP + 1);
      nextBtn.disabled = false;
      toast("Account application submitted!", "ok");
    }, 1400);
  }

  // ---------- Data collection ----------
  function collect() {
    var fd = new FormData(form);
    var obj = {};
    fd.forEach(function (v, k) {
      obj[k] = v;
    });
    return obj;
  }

  var COUNTRIES = {
    us: "United States",
    gb: "United Kingdom",
    ca: "Canada",
    de: "Germany",
    ng: "Nigeria",
    au: "Australia"
  };
  var DOCS = { passport: "Passport", license: "Driver's licence", id: "National ID card" };

  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function esc(s) {
    return String(s || "—").replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function buildReview() {
    var d = collect();
    var groups = [
      {
        step: 0,
        title: "Personal details",
        rows: [
          ["Name", esc((d.firstName || "") + " " + (d.lastName || "")).trim() || "—"],
          ["Email", esc(d.email)],
          ["Mobile", esc(d.phone)],
          ["Date of birth", fmtDate(d.dob)]
        ]
      },
      {
        step: 1,
        title: "Home address",
        rows: [
          ["Street", esc(d.street)],
          ["City", esc(d.city)],
          ["Postal code", esc(d.postcode)],
          ["Country", esc(COUNTRIES[d.country] || "—")]
        ]
      },
      {
        step: 2,
        title: "Identity",
        rows: [
          ["Document", esc(DOCS[d.docType] || "—")],
          ["ID upload", "✓ Verified"],
          ["Selfie", "✓ Verified"]
        ]
      }
    ];

    reviewEl.innerHTML = groups
      .map(function (g) {
        var rows = g.rows
          .map(function (r) {
            return (
              '<div class="review__row"><span class="review__k">' +
              r[0] +
              '</span><span class="review__v">' +
              r[1] +
              "</span></div>"
            );
          })
          .join("");
        return (
          '<div class="review__group">' +
          '<div class="review__head"><h2>' +
          g.title +
          '</h2><button type="button" class="review__edit" data-edit="' +
          g.step +
          '">Edit</button></div>' +
          rows +
          "</div>"
        );
      })
      .join("");
  }

  reviewEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-edit]");
    if (btn) showStep(parseInt(btn.getAttribute("data-edit"), 10));
  });

  // ---------- Upload mock ----------
  form.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-upload]");
    if (!btn || btn.classList.contains("is-uploading")) return;

    var sub = btn.querySelector("[data-upload-sub]");
    var state = btn.querySelector("[data-upload-state]");
    var origSub = btn.dataset.origSub || (btn.dataset.origSub = sub.textContent);

    btn.classList.remove("is-done");
    btn.classList.add("is-uploading");
    var pct = 0;
    state.textContent = "0%";
    sub.textContent = "Uploading & scanning…";

    var timer = setInterval(function () {
      pct += Math.floor(8 + Math.random() * 22);
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        btn.classList.remove("is-uploading");
        btn.classList.add("is-done");
        state.textContent = "✓ Verified";
        sub.textContent = origSub;
        var err = btn.parentNode.querySelector(
          '[data-err="' + btn.getAttribute("data-upload") + '"]'
        );
        if (err) err.textContent = "";
        toast("Document verified securely.", "ok");
      } else {
        state.textContent = pct + "%";
      }
    }, 280);
  });

  // ---------- Nav ----------
  nextBtn.addEventListener("click", goNext);
  backBtn.addEventListener("click", function () {
    if (current > 0) showStep(current - 1);
  });

  // Enter key advances (but not from inside selects/textareas opening)
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "BUTTON" && current <= LAST_FORM_STEP) {
      e.preventDefault();
      goNext();
    }
  });

  showStep(0);
})();
