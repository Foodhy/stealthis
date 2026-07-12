(function () {
  "use strict";

  var STEPS = ["personal", "history", "insurance", "consent"];
  var current = 0;
  var hasInsurance = true;

  var form = document.getElementById("intakeForm");
  var sections = {};
  STEPS.concat(["done"]).forEach(function (s) {
    sections[s] = form.querySelector('[data-section="' + s + '"]');
  });
  var stepItems = Array.prototype.slice.call(document.querySelectorAll("#stepList li"));
  var progressFill = document.getElementById("progressFill");
  var progressBar = document.querySelector(".progress");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  /* ---------- Toast ---------- */
  function toast(msg, warn) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (warn ? " toast--warn" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast" + (warn ? " toast--warn" : "");
    }, 2600);
  }

  /* ---------- Validation ---------- */
  function fieldWrap(el) {
    return el.closest(".field");
  }
  function setError(el, msg) {
    var wrap = fieldWrap(el);
    if (!wrap) return;
    var err = wrap.querySelector("[data-err]");
    if (msg) {
      wrap.classList.add("invalid");
      if (err) err.textContent = msg;
    } else {
      wrap.classList.remove("invalid");
      if (err) err.textContent = "";
    }
  }
  function validateField(el) {
    if (el.disabled || el.offsetParent === null) return true;
    var v = (el.value || "").trim();
    if (el.hasAttribute("required") && !v) {
      setError(el, "This field is required");
      return false;
    }
    if (el.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(el, "Enter a valid email address");
      return false;
    }
    if (el.type === "tel" && v && v.replace(/\D/g, "").length < 10) {
      setError(el, "Enter a full phone number");
      return false;
    }
    if (el.id === "memberId" && v && v.replace(/\D/g, "").length < 6) {
      setError(el, "Member ID looks too short");
      return false;
    }
    setError(el, "");
    return true;
  }

  function sectionFields(step) {
    var sec = sections[step];
    return Array.prototype.slice.call(
      sec.querySelectorAll("input, select, textarea")
    ).filter(function (el) {
      return el.type !== "checkbox" && el.hasAttribute("required") && el.offsetParent !== null;
    });
  }

  function validateSection(step) {
    var ok = true;
    var first = null;
    sectionFields(step).forEach(function (el) {
      if (!validateField(el)) {
        ok = false;
        if (!first) first = el;
      }
    });
    // consent special-case
    if (step === "consent") {
      var consent = document.getElementById("consent");
      var cErr = document.getElementById("consentErr");
      if (!consent.checked) {
        cErr.textContent = "Please provide consent to continue";
        cErr.classList.add("show");
        ok = false;
        if (!first) first = consent;
      } else {
        cErr.classList.remove("show");
        cErr.textContent = "";
      }
    }
    if (first && first.focus) first.focus();
    return ok;
  }

  /* ---------- Navigation ---------- */
  function completion() {
    // percentage across the 4 real steps
    return Math.round(((current) / STEPS.length) * 100);
  }
  function setProgress(pct) {
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(pct));
  }

  function show(index, opts) {
    opts = opts || {};
    var step = typeof index === "string" ? index : STEPS[index];
    STEPS.concat(["done"]).forEach(function (s) {
      sections[s].classList.toggle("is-active", s === step);
    });

    if (step === "done") {
      setProgress(100);
      stepItems.forEach(function (li) {
        li.classList.remove("is-active");
        li.classList.add("is-done");
      });
      return;
    }

    current = STEPS.indexOf(step);
    stepItems.forEach(function (li, i) {
      li.classList.toggle("is-active", i === current);
      li.classList.toggle("is-done", i < current);
    });
    setProgress(Math.round((current / STEPS.length) * 100));

    if (!opts.silent) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function goNext() {
    var step = STEPS[current];
    if (!validateSection(step)) {
      toast("Please fix the highlighted fields", true);
      return;
    }
    if (current < STEPS.length - 1) {
      show(current + 1);
      updateReview();
      var labels = ["", "History next — almost there", "Nice — now your coverage", "Last step: review & sign"];
      toast(labels[current] || "Saved");
    }
  }
  function goPrev() {
    if (current > 0) show(current - 1);
  }

  form.querySelectorAll("[data-next]").forEach(function (b) {
    b.addEventListener("click", goNext);
  });
  form.querySelectorAll("[data-prev]").forEach(function (b) {
    b.addEventListener("click", goPrev);
  });

  // Stepper clicks — only allow going to visited/next
  stepItems.forEach(function (li, i) {
    li.addEventListener("click", function () {
      if (i <= current) {
        show(i);
      } else if (i === current + 1) {
        goNext();
      } else {
        toast("Finish the current section first", true);
      }
    });
  });

  /* ---------- Live validation on blur ---------- */
  form.addEventListener(
    "blur",
    function (e) {
      var el = e.target;
      if (el.matches("input, select, textarea") && el.hasAttribute("required")) {
        validateField(el);
      }
    },
    true
  );
  form.addEventListener("input", function (e) {
    var el = e.target;
    if (el.closest(".field.invalid")) validateField(el);
  });

  /* ---------- Phone formatting ---------- */
  var phone = document.getElementById("phone");
  phone.addEventListener("input", function () {
    var d = phone.value.replace(/\D/g, "").slice(0, 10);
    var out = d;
    if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
    else if (d.length > 0) out = "(" + d;
    phone.value = out;
  });

  /* ---------- Member ID formatting ---------- */
  var memberId = document.getElementById("memberId");
  memberId.addEventListener("input", function () {
    var d = memberId.value.replace(/\D/g, "").slice(0, 12);
    memberId.value = d.replace(/(.{4})/g, "$1 ").trim();
  });

  /* ---------- Condition chips: "None" is exclusive ---------- */
  var condWrap = document.getElementById("conditionChips");
  condWrap.addEventListener("change", function (e) {
    var box = e.target;
    if (box.dataset.none !== undefined && box.checked) {
      condWrap.querySelectorAll('input[type="checkbox"]').forEach(function (c) {
        if (c !== box) c.checked = false;
      });
    } else if (box.checked) {
      var none = condWrap.querySelector("[data-none]");
      if (none) none.checked = false;
    }
  });

  /* ---------- Allergy "Other" reveals note ---------- */
  var allergyWrap = document.getElementById("allergyChips");
  var noteWrap = document.getElementById("allergyNoteWrap");
  var noteInput = document.getElementById("allergyNote");
  allergyWrap.addEventListener("change", function (e) {
    if (e.target.dataset.other === undefined) return;
    var on = e.target.checked;
    noteWrap.hidden = !on;
    noteInput.toggleAttribute("required", on);
    if (on) setTimeout(function () { noteInput.focus(); }, 60);
    else setError(noteInput, "");
  });

  /* ---------- Insurance toggle ---------- */
  var insFields = document.getElementById("insFields");
  var insBtns = document.querySelectorAll(".toggle__opt");
  var selfpayNote = null;
  insBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hasInsurance = btn.dataset.ins === "yes";
      insBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      insFields.classList.toggle("hide", !hasInsurance);
      insFields.querySelectorAll("[required]").forEach(function (el) {
        // keep original required intent only when visible
      });
      // toggle required on carrier/memberId/holder
      ["carrier", "memberId", "holder"].forEach(function (id) {
        var el = document.getElementById(id);
        if (hasInsurance) el.setAttribute("required", "");
        else { el.removeAttribute("required"); setError(el, ""); }
      });
      if (!hasInsurance && !selfpayNote) {
        selfpayNote = document.createElement("div");
        selfpayNote.className = "selfpay-note";
        selfpayNote.textContent = "No problem — we'll review self-pay options and payment plans with you at check-in.";
        insFields.after(selfpayNote);
      }
      if (selfpayNote) selfpayNote.style.display = hasInsurance ? "none" : "block";
      updateReview();
    });
  });

  /* ---------- Review + summary ---------- */
  function val(id) {
    var el = document.getElementById(id);
    return el && el.value ? el.value.trim() : "";
  }
  function updateReview() {
    var name = [val("firstName"), val("lastName")].filter(Boolean).join(" ") || "—";
    var reason = val("reason") || "—";
    var ins = hasInsurance ? (val("carrier") || "Insured") : "Self-pay";
    document.getElementById("rvName").textContent = name;
    document.getElementById("rvReason").textContent = reason;
    document.getElementById("rvIns").textContent = ins;

    document.getElementById("sumName").textContent = name;
    document.getElementById("sumReason").textContent = reason;
    document.getElementById("sumVisit").textContent = val("lastVisit") || "—";
    document.getElementById("sumIns").textContent = ins === "—" ? "—" : ins;
  }
  form.addEventListener("input", updateReview);
  form.addEventListener("change", updateReview);

  /* ---------- Submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateSection("consent")) {
      toast("Please review the highlighted items", true);
      return;
    }
    var name = val("firstName") || "friend";
    document.getElementById("doneName").textContent = name;
    show("done");
    toast("Intake submitted — thank you!");
  });

  document.getElementById("restartBtn").addEventListener("click", function () {
    form.reset();
    noteWrap.hidden = true;
    noteInput.removeAttribute("required");
    form.querySelectorAll(".field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
    document.getElementById("consentErr").classList.remove("show");
    hasInsurance = true;
    insBtns[0].click();
    updateReview();
    show(0);
    toast("Fresh form ready");
  });

  // init
  updateReview();
  setProgress(0);
})();
