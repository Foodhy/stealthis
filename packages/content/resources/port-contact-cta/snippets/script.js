/* =================================================================
   Portfolio — Contact / Hire-me CTA + Form
   Vanilla JS: inline validation, copy-email, success state, toast.
   ================================================================= */

(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------------- Copy email ---------------- */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    var hint = copyBtn.querySelector(".copy-email__hint");
    var defaultHint = hint ? hint.textContent : "Copy";

    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email") || "";

      function done() {
        copyBtn.classList.add("is-copied");
        if (hint) hint.textContent = "Copied";
        toast("Email copied — " + email);
        window.setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          if (hint) hint.textContent = defaultHint;
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          var ta = document.createElement("textarea");
          ta.value = email;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch (err) {
          toast("Couldn’t copy — " + email);
        }
      }
    });
  }

  /* ---------------- Form validation ---------------- */
  var form = document.getElementById("contactForm");
  if (!form) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var validators = {
    name: function (v) {
      if (!v.trim()) return "Please add your name.";
      if (v.trim().length < 2) return "That name looks a little short.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "An email so I can reply.";
      if (!EMAIL_RE.test(v.trim())) return "That doesn’t look like an email.";
      return "";
    },
    ptype: function (v) {
      if (!v) return "Pick the kind of project.";
      return "";
    },
    message: function (v) {
      if (!v.trim()) return "Tell me a little about it.";
      if (v.trim().length < 12) return "A few more words would help.";
      return "";
    }
  };

  var fields = ["name", "email", "ptype", "message"].map(function (id) {
    var input = document.getElementById(id);
    return {
      id: id,
      input: input,
      wrap: input ? input.closest(".field") : null,
      error: document.getElementById(id + "-err")
    };
  });

  function setState(field, message) {
    if (!field.wrap) return Boolean(message);
    var invalid = Boolean(message);
    field.wrap.classList.toggle("is-invalid", invalid);
    field.wrap.classList.toggle("is-valid", !invalid && field.input.value !== "");
    if (field.error) {
      field.error.textContent = message;
      field.error.hidden = !invalid;
    }
    if (field.input) {
      field.input.setAttribute("aria-invalid", invalid ? "true" : "false");
    }
    return invalid;
  }

  function validateField(field) {
    var fn = validators[field.id];
    var msg = fn ? fn(field.input.value) : "";
    return setState(field, msg);
  }

  // Validate on blur; clear errors live once a field becomes valid again.
  fields.forEach(function (field) {
    if (!field.input) return;
    field.input.addEventListener("blur", function () {
      validateField(field);
    });
    field.input.addEventListener("input", function () {
      if (field.wrap && field.wrap.classList.contains("is-invalid")) {
        validateField(field);
      }
    });
    if (field.id === "ptype") {
      field.input.addEventListener("change", function () {
        validateField(field);
      });
    }
  });

  /* ---------------- Character counter ---------------- */
  var message = document.getElementById("message");
  var count = document.getElementById("count");
  if (message && count) {
    var max = message.getAttribute("maxlength") || 600;
    var update = function () {
      count.textContent = message.value.length + " / " + max;
    };
    message.addEventListener("input", update);
    update();
  }

  /* ---------------- Submit ---------------- */
  var submitBtn = document.getElementById("submitBtn");
  var success = document.getElementById("success");
  var successText = document.getElementById("successText");
  var resetBtn = document.getElementById("resetBtn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (field) {
      var invalid = validateField(field);
      if (invalid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      if (firstInvalid.input) firstInvalid.input.focus();
      toast("Please fix the highlighted fields.");
      return;
    }

    // Simulate a send.
    if (submitBtn) {
      submitBtn.classList.add("is-loading");
      var label = submitBtn.querySelector(".form__submit-label");
      if (label) label.textContent = "Sending";
    }

    window.setTimeout(function () {
      var name = (document.getElementById("name").value || "").trim();
      var first = name.split(/\s+/)[0] || "there";
      if (successText) {
        successText.textContent =
          "Got it, " + first + " — your message is on its way. I’ll reply within 24 hours.";
      }
      if (success) success.hidden = false;
      form.style.visibility = "hidden";
      toast("Message sent — thanks!");
      if (success) {
        var title = success.querySelector(".success__title");
        if (title) title.setAttribute("tabindex", "-1");
        if (title) title.focus();
      }
    }, 700);
  });

  /* ---------------- Reset / send another ---------------- */
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      fields.forEach(function (field) {
        if (field.wrap) field.wrap.classList.remove("is-invalid", "is-valid");
        if (field.error) field.error.hidden = true;
        if (field.input) field.input.setAttribute("aria-invalid", "false");
      });
      if (success) success.hidden = true;
      form.style.visibility = "";
      if (submitBtn) {
        submitBtn.classList.remove("is-loading");
        var label = submitBtn.querySelector(".form__submit-label");
        if (label) label.textContent = "Send message";
      }
      if (count && message) {
        count.textContent = "0 / " + (message.getAttribute("maxlength") || 600);
      }
      var nameInput = document.getElementById("name");
      if (nameInput) nameInput.focus();
    });
  }
})();
