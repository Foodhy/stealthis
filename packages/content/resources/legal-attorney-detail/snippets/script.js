(function () {
  "use strict";

  var ctaBtn = document.getElementById("ctaBtn");
  var form = document.getElementById("consultForm");
  var cancelBtn = document.getElementById("cancelBtn");
  var status = document.getElementById("formStatus");

  if (!ctaBtn || !form) return;

  function openForm() {
    form.hidden = false;
    ctaBtn.setAttribute("aria-expanded", "true");
    ctaBtn.hidden = true;
    var first = document.getElementById("cf-name");
    if (first) first.focus();
  }

  function closeForm() {
    form.hidden = true;
    ctaBtn.hidden = false;
    ctaBtn.setAttribute("aria-expanded", "false");
    ctaBtn.focus();
  }

  ctaBtn.addEventListener("click", openForm);

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      setStatus("", "");
      closeForm();
    });
  }

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.classList.remove("is-ok", "is-err");
    if (kind) status.classList.add(kind);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cf-name");
    var email = document.getElementById("cf-email");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.value.trim()) {
      setStatus("Please enter your name.", "is-err");
      name.focus();
      return;
    }
    if (!emailRe.test(email.value.trim())) {
      setStatus("Please enter a valid email address.", "is-err");
      email.focus();
      return;
    }

    var first = name.value.trim().split(/\s+/)[0];
    setStatus(
      "Thank you, " + first + ". Eleanor's office will reply within one business day.",
      "is-ok"
    );
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.value = "";
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !form.hidden) closeForm();
  });
})();
