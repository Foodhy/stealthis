(function () {
  "use strict";

  var VALID_CODE = "481902";
  var RESEND_SECONDS = 30;

  var form = document.getElementById("otp-form");
  var boxesWrap = document.getElementById("otp-boxes");
  var boxes = Array.prototype.slice.call(
    boxesWrap.querySelectorAll(".otp__box")
  );
  var fieldset = boxesWrap.closest(".otp");
  var status = document.getElementById("otp-status");
  var maskToggle = document.getElementById("mask-toggle");
  var verifyBtn = document.getElementById("verify-btn");
  var resendBtn = document.getElementById("resend-btn");
  var resendText = document.getElementById("resend-text");
  var resendCount = document.getElementById("resend-count");
  var toastEl = document.getElementById("toast");

  var masked = false;
  var locked = false;
  var toastTimer;
  var resendTimer;

  /* ---------- toast helper ---------- */
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast is-show" + (kind ? " is-" + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast";
    }, 2600);
  }

  /* ---------- digits / display ---------- */
  function getCode() {
    return boxes
      .map(function (b) {
        return b.dataset.value || "";
      })
      .join("");
  }

  function render(box) {
    var v = box.dataset.value || "";
    box.value = v ? (masked && v ? "•" : v) : "";
    box.classList.toggle("is-filled", !!v);
    box.classList.toggle("is-mask", masked && !!v);
  }

  function renderAll() {
    boxes.forEach(render);
  }

  function setDigit(box, digit) {
    box.dataset.value = digit || "";
    render(box);
  }

  function clearStates() {
    fieldset.classList.remove("is-error", "is-success");
    status.className = "otp__status";
    status.textContent = "";
  }

  function focusBox(i) {
    if (i >= 0 && i < boxes.length) {
      boxes[i].focus();
      boxes[i].select();
    }
  }

  function firstEmptyIndex() {
    for (var i = 0; i < boxes.length; i++) {
      if (!boxes[i].dataset.value) return i;
    }
    return boxes.length - 1;
  }

  /* ---------- input handling ---------- */
  boxes.forEach(function (box, i) {
    box.addEventListener("input", function () {
      if (locked) {
        render(box);
        return;
      }
      clearStates();
      var raw = box.value.replace(/\D/g, "");
      if (!raw) {
        setDigit(box, "");
        return;
      }
      // take last typed digit (handles overwrite)
      var digit = raw.slice(-1);
      setDigit(box, digit);
      if (i < boxes.length - 1) focusBox(i + 1);
      maybeAutoSubmit();
    });

    box.addEventListener("keydown", function (e) {
      if (locked) {
        e.preventDefault();
        return;
      }
      if (e.key === "Backspace") {
        if (box.dataset.value) {
          setDigit(box, "");
        } else if (i > 0) {
          setDigit(boxes[i - 1], "");
          focusBox(i - 1);
        }
        e.preventDefault();
        clearStates();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusBox(i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusBox(i + 1);
      }
    });

    box.addEventListener("focus", function () {
      box.select();
    });
  });

  /* ---------- paste support ---------- */
  boxesWrap.addEventListener("paste", function (e) {
    if (locked) return;
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData("text") || "";
    var digits = text.replace(/\D/g, "").slice(0, boxes.length);
    if (!digits) return;
    clearStates();
    boxes.forEach(function (b, idx) {
      setDigit(b, digits[idx] || "");
    });
    var next = digits.length >= boxes.length ? boxes.length - 1 : digits.length;
    focusBox(next);
    toast("Code pasted from clipboard", "");
    maybeAutoSubmit();
  });

  function maybeAutoSubmit() {
    if (getCode().length === boxes.length) {
      // tiny delay so the last digit renders before validating
      setTimeout(function () {
        if (getCode().length === boxes.length && !locked) verify();
      }, 120);
    }
  }

  /* ---------- mask toggle ---------- */
  maskToggle.addEventListener("change", function () {
    masked = maskToggle.checked;
    renderAll();
  });

  /* ---------- verify ---------- */
  function verify() {
    var code = getCode();
    if (code.length < boxes.length) {
      fieldset.classList.add("is-error");
      status.className = "otp__status is-error";
      status.textContent = "Please enter all 6 digits.";
      focusBox(firstEmptyIndex());
      return;
    }

    verifyBtn.classList.add("is-loading");
    locked = true;

    setTimeout(function () {
      verifyBtn.classList.remove("is-loading");
      if (code === VALID_CODE) {
        fieldset.classList.add("is-success");
        status.className = "otp__status is-success";
        status.textContent = "Verified — your transfer is confirmed.";
        verifyBtn.classList.add("is-done");
        verifyBtn.querySelector(".btn__label").textContent = "Verified";
        toast("Identity verified successfully", "success");
        stopResend();
        resendBtn.disabled = true;
        resendText.textContent = "Verified";
      } else {
        locked = false;
        fieldset.classList.add("is-error");
        status.className = "otp__status is-error";
        status.textContent = "That code isn't right. Check and try again.";
        toast("Incorrect verification code", "error");
        // clear and refocus
        boxes.forEach(function (b) {
          setDigit(b, "");
        });
        focusBox(0);
      }
    }, 850);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!locked) verify();
  });

  /* ---------- resend countdown ---------- */
  function startResend() {
    var remaining = RESEND_SECONDS;
    resendBtn.disabled = true;
    resendCount.textContent = remaining;
    resendText.innerHTML =
      'Resend in <span id="resend-count">' + remaining + "</span>s";
    resendTimer = setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        stopResend();
        resendBtn.disabled = false;
        resendText.textContent = "Resend code";
        return;
      }
      var c = document.getElementById("resend-count");
      if (c) c.textContent = remaining;
    }, 1000);
  }

  function stopResend() {
    clearInterval(resendTimer);
  }

  resendBtn.addEventListener("click", function () {
    if (resendBtn.disabled || locked) return;
    boxes.forEach(function (b) {
      setDigit(b, "");
    });
    clearStates();
    focusBox(0);
    toast("A new code was sent to •••• 4291", "success");
    startResend();
  });

  /* ---------- init ---------- */
  renderAll();
  startResend();
  focusBox(0);
})();
