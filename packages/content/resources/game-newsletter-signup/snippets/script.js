/* Hollow Reign — Closed Beta Signup Gate
   Vanilla JS: validation, fake submit flow, invite code reveal,
   copy-to-clipboard, live counter, toasts. Illustrative only. */

(() => {
  "use strict";

  // ---------- elements
  const form = document.getElementById("betaForm");
  const emailInput = document.getElementById("email");
  const platformSelect = document.getElementById("platform");
  const consentInput = document.getElementById("consent");
  const emailError = document.getElementById("emailError");
  const platformError = document.getElementById("platformError");
  const consentError = document.getElementById("consentError");
  const submitBtn = document.getElementById("submitBtn");
  const submitLabel = submitBtn.querySelector(".cta-label");

  const formState = document.getElementById("formState");
  const successState = document.getElementById("successState");
  const successEmail = document.getElementById("successEmail");
  const successPlatform = document.getElementById("successPlatform");
  const queuePos = document.getElementById("queuePos");
  const inviteCode = document.getElementById("inviteCode");
  const copyBtn = document.getElementById("copyBtn");
  const resetBtn = document.getElementById("resetBtn");

  const counterEl = document.getElementById("signupCounter");
  const toastEl = document.getElementById("toast");

  const PLATFORM_LABELS = {
    pc: "PC — Steam",
    ps5: "PlayStation 5",
    xbox: "Xbox Series X|S",
    cloud: "Cloud Streaming",
  };

  // ---------- toast helper
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  // ---------- live signup counter
  let count = 48217;

  function renderCount() {
    counterEl.textContent = count.toLocaleString("en-US");
    counterEl.classList.remove("tick");
    // restart the tick animation
    void counterEl.offsetWidth;
    counterEl.classList.add("tick");
  }

  function bumpCount(by) {
    count += by;
    renderCount();
  }

  // ambient ticking: other "hunters" enlisting every few seconds
  function scheduleAmbientTick() {
    const delay = 2600 + Math.random() * 4800;
    setTimeout(() => {
      bumpCount(1 + Math.floor(Math.random() * 3));
      scheduleAmbientTick();
    }, delay);
  }
  scheduleAmbientTick();

  // ---------- validation
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, errorEl, message) {
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      if (input) input.setAttribute("aria-invalid", "true");
    } else {
      errorEl.textContent = "";
      errorEl.hidden = true;
      if (input) input.removeAttribute("aria-invalid");
    }
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      setError(emailInput, emailError, "Enter your email to receive a beta key.");
      return false;
    }
    if (!EMAIL_RE.test(value)) {
      setError(emailInput, emailError, "That doesn't look like a valid email.");
      return false;
    }
    setError(emailInput, emailError, null);
    return true;
  }

  function validatePlatform() {
    if (!platformSelect.value) {
      setError(platformSelect, platformError, "Pick the platform you'll play on.");
      return false;
    }
    setError(platformSelect, platformError, null);
    return true;
  }

  function validateConsent() {
    if (!consentInput.checked) {
      setError(null, consentError, "You need to opt in so we can send your key.");
      return false;
    }
    setError(null, consentError, null);
    return true;
  }

  // live re-validation once a field has been flagged
  emailInput.addEventListener("input", () => {
    if (!emailError.hidden) validateEmail();
  });
  platformSelect.addEventListener("change", () => {
    if (!platformError.hidden) validatePlatform();
  });
  consentInput.addEventListener("change", () => {
    if (!consentError.hidden) validateConsent();
  });
  emailInput.addEventListener("blur", () => {
    if (emailInput.value.trim()) validateEmail();
  });

  // ---------- invite code generator (clearly fake)
  function generateInviteCode() {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
    const block = () =>
      Array.from({ length: 4 }, () =>
        alphabet[Math.floor(Math.random() * alphabet.length)]
      ).join("");
    return `HRGN-${block()}-${block()}`;
  }

  // ---------- submit flow
  let submitting = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitting) return;

    // validate all; focus first failing field
    const emailOk = validateEmail();
    const platformOk = validatePlatform();
    const consentOk = validateConsent();

    if (!emailOk) { emailInput.focus(); return; }
    if (!platformOk) { platformSelect.focus(); return; }
    if (!consentOk) { consentInput.focus(); return; }

    submitting = true;
    submitBtn.disabled = true;
    submitLabel.textContent = "TRANSMITTING…";

    // fake network round-trip
    setTimeout(() => {
      submitting = false;
      submitBtn.disabled = false;
      submitLabel.textContent = "REQUEST BETA ACCESS";

      bumpCount(1);

      successEmail.textContent = emailInput.value.trim();
      successPlatform.textContent =
        PLATFORM_LABELS[platformSelect.value] || platformSelect.value;
      queuePos.textContent = `#${count.toLocaleString("en-US")}`;
      inviteCode.textContent = generateInviteCode();

      formState.hidden = true;
      successState.hidden = false;
      copyBtn.classList.remove("copied");
      successState.querySelector(".card-title").setAttribute("tabindex", "-1");
      successState.querySelector(".card-title").focus();

      toast("ENLISTED — INVITE CODE ISSUED");
    }, 900);
  });

  // ---------- copy invite code
  copyBtn.addEventListener("click", async () => {
    const code = inviteCode.textContent.trim();
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard API unavailable (e.g. sandboxed iframe) — select fallback
      const range = document.createRange();
      range.selectNodeContents(inviteCode);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    copyBtn.classList.add("copied");
    setTimeout(() => copyBtn.classList.remove("copied"), 1600);
    toast(`COPIED ${code}`);
  });

  // ---------- reset to form state
  resetBtn.addEventListener("click", () => {
    form.reset();
    setError(emailInput, emailError, null);
    setError(platformSelect, platformError, null);
    setError(null, consentError, null);
    successState.hidden = true;
    formState.hidden = false;
    emailInput.focus();
  });

  // ---------- wishlist / share buttons
  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const platform = btn.dataset.platform || "your platform";
      toast(`WISHLISTED ON ${platform.toUpperCase()} ✦`);
    });
  });
})();
