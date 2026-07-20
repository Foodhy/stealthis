/* Inline Validation — validate on blur, re-validate live once touched. */
(() => {
  const form = document.querySelector(".iv-form");
  if (!form) return;

  const summary = form.querySelector("[data-summary]");
  const summaryList = form.querySelector("[data-summary-list]");
  const meter = form.querySelector("[data-meter]");
  const count = form.querySelector("[data-count]");
  const submit = form.querySelector("[data-submit]");
  const fields = [...form.querySelectorAll("[data-field]")].map((wrap) => ({
    wrap,
    input: wrap.querySelector("input"),
    msg: wrap.querySelector(".msg"),
    label: wrap.querySelector("label").textContent.trim(),
    touched: false,
  }));

  const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  const rules = {
    required: (v) => (v.trim().length >= 2 ? null : "Enter at least 2 characters."),
    email: (v) =>
      !v.trim() ? "Email is required." : EMAIL.test(v.trim()) ? null : "That doesn't look like a valid email.",
    phone: (v) => {
      const digits = v.replace(/\D/g, "");
      if (!digits) return "Phone is required.";
      return digits.length >= 7 && digits.length <= 15 ? null : "Use 7 to 15 digits.";
    },
    password: (v) => {
      if (v.length < 8) return "Use at least 8 characters.";
      if (!/[a-z]/.test(v) || !/[A-Z]/.test(v)) return "Mix upper and lower case letters.";
      if (!/\d/.test(v)) return "Include at least one number.";
      return null;
    },
    match: (v, input) => {
      const other = form.querySelector("#" + input.dataset.match);
      if (!v) return "Confirm your password.";
      return v === other.value ? null : "Passwords do not match.";
    },
  };

  const okText = {
    required: "Looks good.",
    email: "Email format is valid.",
    phone: "Phone number accepted.",
    password: "Strong enough.",
    match: "Passwords match.",
  };

  function validate(field, { show = true } = {}) {
    const { input } = field;
    const error = rules[input.dataset.rule](input.value, input);
    field.error = error;

    if (!show || (!field.touched && !error)) {
      // keep neutral until the field has been visited
    }

    if (!field.touched) {
      field.wrap.removeAttribute("data-state");
      field.msg.textContent = "";
      input.removeAttribute("aria-invalid");
    } else {
      field.wrap.dataset.state = error ? "invalid" : "valid";
      field.msg.textContent = error || okText[input.dataset.rule];
      input.setAttribute("aria-invalid", error ? "true" : "false");
    }
    return !error;
  }

  function refresh() {
    const valid = fields.filter((f) => !f.error).length;
    meter.style.width = (valid / fields.length) * 100 + "%";
    count.textContent = `${valid} of ${fields.length} fields valid`;
  }

  fields.forEach((field) => {
    field.input.addEventListener("blur", () => {
      field.touched = true;
      validate(field);
      refresh();
    });

    field.input.addEventListener("input", () => {
      // live re-validation only after the first blur (no premature yelling)
      if (field.touched) validate(field);
      else field.error = rules[field.input.dataset.rule](field.input.value, field.input);

      // confirm depends on password
      const confirm = fields.find((f) => f.input.dataset.match === field.input.id);
      if (confirm && confirm.touched) validate(confirm);
      refresh();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    fields.forEach((f) => {
      f.touched = true;
      validate(f);
    });
    refresh();

    const bad = fields.filter((f) => f.error);
    if (bad.length) {
      summaryList.replaceChildren(
        ...bad.map((f) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "#" + f.input.id;
          a.textContent = `${f.label}: ${f.error}`;
          a.addEventListener("click", (e) => {
            e.preventDefault();
            f.input.focus();
          });
          li.append(a);
          return li;
        })
      );
      summary.hidden = false;
      summary.focus();
      submit.removeAttribute("data-done");
      submit.textContent = "Create account";
      return;
    }

    summary.hidden = true;
    submit.dataset.done = "true";
    submit.textContent = "Account created";
  });

  fields.forEach((f) => validate(f, { show: false }));
  refresh();
})();
