(function () {
  "use strict";

  const TOTAL_STEPS = 4;

  // ── State ──
  let currentStep = 0;
  const formData = {};

  // ── DOM refs ──
  const formCard = document.getElementById("formCard");
  const successScreen = document.getElementById("successScreen");
  const stepDots = document.querySelectorAll(".step-dot");
  const progressLine = document.getElementById("progressLine");
  const navBack = document.getElementById("navBack");
  const navContinue = document.getElementById("navContinue");
  const startOver = document.getElementById("startOver");
  const reviewCard = document.getElementById("reviewCard");

  if (!formCard) return;

  // ── Validation rules per step ──
  const validators = {
    0: () => {
      const email = document.getElementById("email");
      const pw = document.getElementById("password");
      const cpw = document.getElementById("confirmPassword");
      let valid = true;

      clearErrors();

      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        setError(email, "email-error", "Please enter a valid email address.");
        valid = false;
      }
      if (pw.value.length < 8) {
        setError(pw, "password-error", "Password must be at least 8 characters.");
        valid = false;
      }
      if (cpw.value !== pw.value) {
        setError(cpw, "confirmPassword-error", "Passwords do not match.");
        valid = false;
      }
      return valid;
    },
    1: () => {
      const first = document.getElementById("firstName");
      const last = document.getElementById("lastName");
      let valid = true;
      clearErrors();
      if (!first.value.trim()) {
        setError(first, "firstName-error", "First name is required.");
        valid = false;
      }
      if (!last.value.trim()) {
        setError(last, "lastName-error", "Last name is required.");
        valid = false;
      }
      return valid;
    },
    2: () => {
      const role = document.getElementById("role");
      const teamSize = document.querySelector('input[name="teamSize"]:checked');
      let valid = true;
      clearErrors();
      if (!role.value) {
        setError(role, "role-error", "Please select your role.");
        valid = false;
      }
      if (!teamSize) {
        const errEl = document.getElementById("teamSize-error");
        if (errEl) errEl.textContent = "Please select your team size.";
        valid = false;
      }
      return valid;
    },
    3: () => true,
  };

  function setError(input, errorId, msg) {
    input.classList.add("error");
    const el = document.getElementById(errorId);
    if (el) el.textContent = msg;
    input.addEventListener("input", function clearSelf() {
      input.classList.remove("error");
      const errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = "";
      input.removeEventListener("input", clearSelf);
    });
  }

  function clearErrors() {
    document.querySelectorAll(".field-input.error").forEach((el) => el.classList.remove("error"));
    document.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
  }

  // ── Collect form data ──
  function collectStepData(step) {
    switch (step) {
      case 0:
        formData.email = document.getElementById("email").value.trim();
        formData.password = document.getElementById("password").value;
        break;
      case 1:
        formData.firstName = document.getElementById("firstName").value.trim();
        formData.lastName = document.getElementById("lastName").value.trim();
        formData.phone = document.getElementById("phone").value.trim();
        formData.company = document.getElementById("company").value.trim();
        break;
      case 2:
        formData.role = document.getElementById("role").value;
        formData.teamSize =
          (document.querySelector('input[name="teamSize"]:checked') || {}).value || "";
        formData.darkMode = document.querySelector('input[name="darkMode"]').checked;
        formData.betaFeatures = document.querySelector('input[name="betaFeatures"]').checked;
        formData.analytics = document.querySelector('input[name="analytics"]').checked;
        formData.newsletter = document.getElementById("newsletter").checked;
        break;
    }
  }

  // ── Build review ──
  function buildReview() {
    const sections = [
      {
        title: "Account Info",
        step: 0,
        rows: [
          { label: "Email", value: formData.email || "—" },
          { label: "Password", value: "••••••••" },
        ],
      },
      {
        title: "Personal Details",
        step: 1,
        rows: [
          {
            label: "Full Name",
            value: [formData.firstName, formData.lastName].filter(Boolean).join(" ") || "—",
          },
          { label: "Phone", value: formData.phone || "Not provided" },
          { label: "Company", value: formData.company || "Not provided" },
        ],
      },
      {
        title: "Preferences",
        step: 2,
        rows: [
          { label: "Role", value: formData.role || "—" },
          { label: "Team Size", value: formData.teamSize || "—" },
          { label: "Dark Mode", value: formData.darkMode ? "Enabled" : "Disabled" },
          { label: "Beta Features", value: formData.betaFeatures ? "Enabled" : "Disabled" },
          { label: "Analytics", value: formData.analytics ? "Enabled" : "Disabled" },
          { label: "Newsletter", value: formData.newsletter ? "Yes" : "No" },
        ],
      },
    ];

    reviewCard.innerHTML = sections
      .map(
        (sec) => `
      <div class="review-section">
        <div class="review-section-header">
          <span class="review-section-title">${sec.title}</span>
          <button class="review-edit-btn" data-goto="${sec.step}">Edit</button>
        </div>
        ${sec.rows
          .map(
            (row) => `
          <div class="review-row">
            <span class="review-label">${row.label}</span>
            <span class="review-value">${row.value}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("");

    reviewCard.querySelectorAll(".review-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.dataset.goto);
        goToStep(target, "back");
      });
    });
  }

  // ── Step navigation ──
  function goToStep(next, direction) {
    const prev = currentStep;
    const prevEl = document.getElementById(`step${prev}`);
    const nextEl = document.getElementById(`step${next}`);

    if (!prevEl || !nextEl) return;

    // Outgoing animation
    const outClass = direction === "forward" ? "slide-out-left" : "slide-out-right";
    const inClass = direction === "forward" ? "active" : "slide-in-left";

    prevEl.classList.remove("active");
    prevEl.classList.add(outClass);

    prevEl.addEventListener(
      "animationend",
      () => {
        prevEl.classList.remove(outClass);
        prevEl.style.display = "none";
      },
      { once: true }
    );

    nextEl.style.display = "flex";
    nextEl.classList.add(direction === "forward" ? "active" : "slide-in-left");

    if (direction !== "forward") {
      nextEl.addEventListener(
        "animationend",
        () => {
          nextEl.classList.remove("slide-in-left");
          nextEl.classList.add("active");
        },
        { once: true }
      );
    }

    currentStep = next;
    updateProgress();
  }

  function updateProgress() {
    // Progress line width
    const pct = currentStep === 0 ? 0 : (currentStep / (TOTAL_STEPS - 1)) * 100;
    progressLine.style.width = `${pct}%`;

    // Dots
    stepDots.forEach((dot, i) => {
      dot.classList.remove("active", "completed");
      if (i === currentStep) dot.classList.add("active");
      else if (i < currentStep) dot.classList.add("completed");
    });

    // Nav buttons
    navBack.hidden = currentStep === 0;
    navContinue.textContent = currentStep === TOTAL_STEPS - 1 ? "Create Account" : "Continue";
  }

  // ── Navigation handlers ──
  navContinue.addEventListener("click", () => {
    if (currentStep < TOTAL_STEPS - 1) {
      const valid = (validators[currentStep] || (() => true))();
      if (!valid) return;
      collectStepData(currentStep);
      if (currentStep === TOTAL_STEPS - 2) buildReview();
      goToStep(currentStep + 1, "forward");
    } else {
      // Submit
      formCard.hidden = true;
      successScreen.hidden = false;
    }
  });

  navBack.addEventListener("click", () => {
    if (currentStep > 0) {
      clearErrors();
      goToStep(currentStep - 1, "back");
    }
  });

  // ── Start over ──
  startOver.addEventListener("click", () => {
    // Reset form inputs
    document.querySelectorAll(".field-input").forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
      } else el.value = "";
    });
    // Re-check defaults
    const darkModeEl = document.querySelector('input[name="darkMode"]');
    const analyticsEl = document.querySelector('input[name="analytics"]');
    if (darkModeEl) darkModeEl.checked = true;
    if (analyticsEl) analyticsEl.checked = true;

    Object.keys(formData).forEach((k) => delete formData[k]);
    clearErrors();
    currentStep = 0;
    updateProgress();

    // Reset all step panels
    document.querySelectorAll(".step-panel").forEach((el, i) => {
      el.classList.remove(
        "active",
        "slide-in-left",
        "slide-out-left",
        "slide-in-right",
        "slide-out-right"
      );
      el.style.display = "";
      if (i === 0) el.classList.add("active");
    });

    successScreen.hidden = true;
    formCard.hidden = false;
  });

  // ── Init ──
  updateProgress();
})();
