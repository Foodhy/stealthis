(function () {
  "use strict";

  // ── Mobile nav toggle ─────────────────────────────────────────────
  const toggle = document.querySelector(".nav-mobile-toggle");
  const links  = document.querySelector(".nav-links");

  if (toggle && links) {
    links.style.cssText = "display:none;position:absolute;top:100%;left:0;right:0;background:var(--warm);border-bottom:1px solid #e2ddd5;padding:1rem 3rem;flex-direction:column;gap:1rem;";
    let open = false;
    toggle.addEventListener("click", () => {
      open = !open;
      links.style.display = open ? "flex" : "none";
      toggle.setAttribute("aria-expanded", open);
    });
    // Close on link click
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => { open = false; links.style.display = "none"; });
    });
  }

  // ── Contact form validation ───────────────────────────────────────
  const form = document.getElementById("contact-form");
  if (!form) return;

  function showError(input, msg) {
    let err = input.nextElementSibling;
    if (!err || !err.classList.contains("field-error")) {
      err = document.createElement("span");
      err.className = "field-error";
      err.style.cssText = "font-size:0.72rem;color:#ef4444;margin-top:0.25rem;display:block;";
      input.parentNode.appendChild(err);
    }
    err.textContent = msg;
    input.style.borderColor = "#ef4444";
  }

  function clearError(input) {
    const err = input.parentNode.querySelector(".field-error");
    if (err) err.textContent = "";
    input.style.borderColor = "";
  }

  form.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => clearError(el));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const name    = document.getElementById("cf-name");
    const email   = document.getElementById("cf-email");
    const message = document.getElementById("cf-message");

    if (!name.value.trim()) { showError(name, "Please enter your full name."); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, "Please enter a valid email address."); valid = false;
    }
    if (!message.value.trim()) { showError(message, "Please briefly describe your matter."); valid = false; }

    if (!valid) return;

    // Success state
    const btn = form.querySelector(".btn-submit");
    btn.textContent = "Request Submitted ✓";
    btn.disabled = true;
    btn.style.background = "#22c55e";
    btn.style.cursor = "default";
  });
})();
