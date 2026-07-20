/* Multi-step wizard: per-step validation, progress, keyboard-friendly focus. */
(() => {
  const form = document.getElementById("wizard");
  if (!form) return;

  const panels = [...form.querySelectorAll(".panel")];
  const stepEls = [...form.querySelectorAll(".step")];
  const barFill = document.getElementById("barFill");
  const bar = document.getElementById("bar");
  const backBtn = document.getElementById("back");
  const nextBtn = document.getElementById("next");
  const live = document.getElementById("live");
  const reviewList = document.getElementById("review");
  const doneMsg = document.getElementById("done");

  const LABELS = { email: "Email", pass: "Password", name: "Full name", phone: "Phone" };

  const RULES = {
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address."),
    pass: (v) => (v.length >= 8 ? "" : "Use at least 8 characters."),
    name: (v) => (v.trim().length >= 2 ? "" : "Tell us your name."),
    phone: (v) => (v.replace(/\D/g, "").length >= 7 ? "" : "Enter at least 7 digits."),
  };

  let index = 0; // 0-based current step
  const total = panels.length;

  function fieldsOf(step) {
    return [...panels[step].querySelectorAll("input")];
  }

  function validateField(input, silent) {
    const rule = RULES[input.name];
    const msg = rule ? rule(input.value) : "";
    const err = document.getElementById(`${input.id}-err`);
    if (!silent || msg === "") {
      if (err) err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    return msg === "";
  }

  function validateStep(step) {
    const fields = fieldsOf(step);
    let firstBad = null;
    fields.forEach((f) => {
      if (!validateField(f) && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      live.textContent = "Please fix the highlighted fields.";
      return false;
    }
    return true;
  }

  function buildReview() {
    const data = new FormData(form);
    reviewList.innerHTML = "";
    for (const key of ["email", "pass", "name", "phone"]) {
      const dt = document.createElement("dt");
      dt.textContent = LABELS[key];
      const dd = document.createElement("dd");
      const raw = String(data.get(key) ?? "");
      dd.textContent = key === "pass" ? "•".repeat(raw.length) : raw;
      reviewList.append(dt, dd);
    }
  }

  function render(focusFirst) {
    panels.forEach((p, i) => {
      p.hidden = i !== index;
    });
    stepEls.forEach((s, i) => {
      s.classList.toggle("is-current", i === index);
      s.classList.toggle("is-done", i < index);
      if (i === index) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });

    barFill.style.width = `${((index + 1) / total) * 100}%`;
    bar.setAttribute("aria-valuenow", String(index + 1));

    backBtn.disabled = index === 0;
    nextBtn.textContent = index === total - 1 ? "Submit" : "Next";
    live.textContent = `Step ${index + 1} of ${total}`;

    if (index === total - 1) buildReview();
    if (focusFirst) {
      const target = fieldsOf(index)[0] || panels[index];
      if (target.focus) target.focus();
    }
  }

  function go(next) {
    index = Math.min(total - 1, Math.max(0, next));
    doneMsg.textContent = "";
    render(true);
  }

  // live re-validation once a field has been marked invalid
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t instanceof HTMLInputElement && t.getAttribute("aria-invalid") === "true") {
      validateField(t, true);
    }
  });
  form.addEventListener(
    "blur",
    (e) => {
      const t = e.target;
      if (t instanceof HTMLInputElement && t.value !== "") validateField(t);
    },
    true
  );

  backBtn.addEventListener("click", () => go(index - 1));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (index < total - 1) {
      if (!validateStep(index)) return;
      go(index + 1);
      return;
    }
    // final step: re-check everything before "sending"
    for (let s = 0; s < total; s++) {
      if (!validateStep(s)) {
        go(s);
        return;
      }
    }
    doneMsg.textContent = "All set — payload validated and ready to submit.";
    live.textContent = "Wizard complete.";
    nextBtn.disabled = true;
  });

  // Ctrl/Cmd + arrows to move between steps without touching the mouse
  form.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "ArrowRight" && index < total - 1) {
      e.preventDefault();
      if (validateStep(index)) go(index + 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      go(index - 1);
    }
  });

  render(false);
})();
