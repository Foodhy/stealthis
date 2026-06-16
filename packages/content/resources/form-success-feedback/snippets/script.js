(function () {
  "use strict";

  var form = document.getElementById("contact");
  var submitBtn = document.getElementById("submit");
  var submitLabel = submitBtn.querySelector(".submit__label");
  var successPanel = document.getElementById("success");
  var errorBanner = document.getElementById("error-banner");
  var statusRegion = document.getElementById("status");
  var toastEl = document.getElementById("toast");

  var MESSAGE_MAX = 600;
  var MESSAGE_MIN = 12;

  // Field definitions: each knows how to read + validate itself.
  var FIELDS = {
    name: {
      el: document.getElementById("name"),
      help: document.getElementById("name-help"),
      defaultHelp: "So we know who we're replying to.",
      validate: function (v) {
        if (!v.trim()) return "Please tell us your name.";
        if (v.trim().length < 2) return "That looks a little short.";
        return "";
      },
    },
    email: {
      el: document.getElementById("email"),
      help: document.getElementById("email-help"),
      defaultHelp: "We'll send the confirmation here.",
      validate: function (v) {
        if (!v.trim()) return "An email lets us reply.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
          return "Enter a valid email, like name@site.com.";
        return "";
      },
    },
    topic: {
      el: document.getElementById("topic"),
      help: document.getElementById("topic-help"),
      defaultHelp: "Helps us route you to the right people.",
      validate: function (v) {
        if (!v) return "Pick the closest topic.";
        return "";
      },
    },
    message: {
      el: document.getElementById("message"),
      help: document.getElementById("message-help"),
      defaultHelp: "A sentence or two is plenty. Min 12 characters.",
      validate: function (v) {
        var t = v.trim();
        if (!t) return "Don't forget your message.";
        if (t.length < MESSAGE_MIN)
          return "A few more words, please (at least " + MESSAGE_MIN + " characters).";
        if (v.length > MESSAGE_MAX) return "That's over the " + MESSAGE_MAX + " character limit.";
        return "";
      },
    },
  };

  var touched = {};

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast is-show" + (kind ? " is-" + kind : "");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast";
    }, 3400);
  }

  /* ---------- Per-field rendering ---------- */
  function fieldWrap(key) {
    return FIELDS[key].el.closest(".field");
  }

  function applyState(key, message) {
    var def = FIELDS[key];
    var wrap = fieldWrap(key);
    var value = (def.el.value || "").toString();
    var isEmpty = !value.trim();

    if (message) {
      wrap.classList.add("is-error");
      wrap.classList.remove("is-valid");
      def.el.setAttribute("aria-invalid", "true");
      def.help.textContent = message;
    } else {
      wrap.classList.remove("is-error");
      def.el.removeAttribute("aria-invalid");
      def.help.textContent = def.defaultHelp;
      // Only mark valid once there's actual content.
      wrap.classList.toggle("is-valid", !isEmpty);
    }
  }

  function checkField(key, force) {
    var def = FIELDS[key];
    if (!force && !touched[key]) return def.validate(def.el.value) === "";
    var msg = def.validate(def.el.value);
    applyState(key, msg);
    return msg === "";
  }

  function isFormValid() {
    return Object.keys(FIELDS).every(function (key) {
      return FIELDS[key].validate(FIELDS[key].el.value) === "";
    });
  }

  /* ---------- Wire up field events ---------- */
  Object.keys(FIELDS).forEach(function (key) {
    var def = FIELDS[key];
    var evt = def.el.tagName === "SELECT" ? "change" : "input";

    def.el.addEventListener("blur", function () {
      touched[key] = true;
      checkField(key, true);
    });

    def.el.addEventListener(evt, function () {
      // Re-validate live only after the field has been touched once.
      if (touched[key]) checkField(key, true);
    });
  });

  /* ---------- Character counter ---------- */
  var msgEl = FIELDS.message.el;
  var counter = document.getElementById("message-count");
  function updateCount() {
    var len = msgEl.value.length;
    counter.textContent = len + " / " + MESSAGE_MAX;
    counter.classList.toggle("is-near", len > MESSAGE_MAX * 0.85 && len <= MESSAGE_MAX);
    counter.classList.toggle("is-over", len > MESSAGE_MAX);
  }
  msgEl.addEventListener("input", updateCount);
  updateCount();

  /* ---------- Reference number ---------- */
  function makeRef() {
    var part = function (n) {
      var s = "";
      var chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      for (var i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };
    return "REQ-" + part(4) + "-" + part(4);
  }

  /* ---------- State transitions ---------- */
  function setLoading(on) {
    submitBtn.classList.toggle("is-loading", on);
    submitBtn.disabled = on;
    submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    submitLabel.textContent = on ? "Sending…" : "Send message";
  }

  function showError() {
    errorBanner.hidden = false;
    statusRegion.textContent = "Submission failed. The request timed out. Please retry.";
    toast("Couldn't send — give it another go.", "error");
    errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    errorBanner.querySelector("[data-retry]").focus();
  }

  function showSuccess(data, ref) {
    form.hidden = true;
    errorBanner.hidden = true;
    successPanel.hidden = false;

    document.getElementById("success-name").textContent =
      data.name.trim().split(/\s+/)[0] || "there";
    document.getElementById("success-email").textContent = data.email.trim();
    document.getElementById("success-ref").textContent = ref;

    statusRegion.textContent =
      "Message sent successfully. Your reference number is " + ref + ".";
    toast("Message sent — reference " + ref, "ok");

    // Move focus to the heading so screen-reader + keyboard users land here.
    var title = successPanel.querySelector(".success__title");
    requestAnimationFrame(function () {
      title.focus();
    });
  }

  /* ---------- Fake network round-trip ---------- */
  // We deliberately fail once per page load so the error/retry path is
  // demonstrable, then succeed on the retry.
  var attempts = 0;
  function send(data) {
    return new Promise(function (resolve, reject) {
      attempts++;
      var willFail = attempts === 1; // first attempt fails, retry succeeds
      setTimeout(
        function () {
          if (willFail) reject(new Error("timeout"));
          else resolve(makeRef());
        },
        900 + Math.random() * 500
      );
    });
  }

  function collect() {
    return {
      name: FIELDS.name.el.value,
      email: FIELDS.email.el.value,
      topic: FIELDS.topic.el.value,
      message: FIELDS.message.el.value,
    };
  }

  function attemptSubmit() {
    // Full validation pass; focus first invalid field if any.
    var firstInvalid = null;
    Object.keys(FIELDS).forEach(function (key) {
      touched[key] = true;
      var ok = checkField(key, true);
      if (!ok && !firstInvalid) firstInvalid = FIELDS[key].el;
    });

    if (firstInvalid) {
      statusRegion.textContent = "Please fix the highlighted fields before sending.";
      toast("Please complete the highlighted fields.", "error");
      firstInvalid.focus();
      return;
    }

    errorBanner.hidden = true;
    var data = collect();
    setLoading(true);
    statusRegion.textContent = "Sending your message…";

    send(data)
      .then(function (ref) {
        setLoading(false);
        showSuccess(data, ref);
      })
      .catch(function () {
        setLoading(false);
        showError();
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    attemptSubmit();
  });

  /* ---------- Retry from error banner ---------- */
  errorBanner.querySelector("[data-retry]").addEventListener("click", function () {
    attemptSubmit();
  });

  /* ---------- Reset / submit another ---------- */
  document.getElementById("reset").addEventListener("click", function () {
    form.reset();
    touched = {};
    Object.keys(FIELDS).forEach(function (key) {
      var wrap = fieldWrap(key);
      wrap.classList.remove("is-error", "is-valid");
      FIELDS[key].el.removeAttribute("aria-invalid");
      FIELDS[key].help.textContent = FIELDS[key].defaultHelp;
    });
    updateCount();
    successPanel.hidden = true;
    errorBanner.hidden = true;
    form.hidden = false;
    setLoading(false);
    statusRegion.textContent = "Form reset. Ready for a new message.";
    FIELDS.name.el.focus();
  });
})();
