(function () {
  "use strict";

  // ── Tab Switching ──────────────────────────────
  const tabs = document.querySelectorAll(".sidebar-tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const target = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      panels.forEach(function (p) {
        p.classList.remove("active");
      });
      var panel = document.getElementById("panel-" + target);
      if (panel) {
        panel.classList.add("active");
      }
    });
  });

  // ── Toggle Switches ───────────────────────────
  document.querySelectorAll(".toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var isActive = toggle.classList.toggle("active");
      toggle.setAttribute("aria-checked", String(isActive));
    });
  });

  // ── 2FA Toggle ─────────────────────────────────
  var tfaToggle = document.getElementById("tfa-toggle");
  var tfaQr = document.getElementById("tfa-qr");

  if (tfaToggle && tfaQr) {
    tfaToggle.addEventListener("click", function () {
      var enabled = tfaToggle.classList.contains("active");
      var statusEl = document.querySelector(".tfa-status strong");
      if (enabled) {
        tfaQr.hidden = false;
        if (statusEl) statusEl.textContent = "Enabled";
      } else {
        tfaQr.hidden = true;
        if (statusEl) statusEl.textContent = "Disabled";
      }
    });
  }

  // ── Theme Selector ─────────────────────────────
  var themeCards = document.querySelectorAll(".theme-card");

  themeCards.forEach(function (card) {
    card.addEventListener("click", function () {
      themeCards.forEach(function (c) {
        c.classList.remove("selected");
      });
      card.classList.add("selected");

      var theme = card.getAttribute("data-theme");
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      }
    });
  });

  // ── Color Picker ───────────────────────────────
  var colorCircles = document.querySelectorAll(".color-circle");

  colorCircles.forEach(function (circle) {
    circle.addEventListener("click", function () {
      colorCircles.forEach(function (c) {
        c.classList.remove("selected");
      });
      circle.classList.add("selected");

      var color = circle.getAttribute("data-color");
      document.documentElement.style.setProperty("--accent", color);

      // Derive a lighter version for accent-light
      var r = parseInt(color.slice(1, 3), 16);
      var g = parseInt(color.slice(3, 5), 16);
      var b = parseInt(color.slice(5, 7), 16);
      var light = "rgba(" + r + "," + g + "," + b + ",0.1)";
      document.documentElement.style.setProperty("--accent-light", light);
    });
  });

  // ── Font Size Slider ───────────────────────────
  var slider = document.getElementById("font-size-slider");
  var fsValue = document.getElementById("fs-value");
  var fsPreview = document.getElementById("fs-preview");

  if (slider) {
    slider.addEventListener("input", function () {
      var size = slider.value;
      document.documentElement.style.setProperty("--font-size", size + "px");
      if (fsValue) fsValue.textContent = size;
      if (fsPreview) fsPreview.style.fontSize = size + "px";
    });
  }

  // ── Avatar Upload ──────────────────────────────
  var avatar = document.getElementById("avatar");
  var avatarInput = document.getElementById("avatar-input");

  if (avatar && avatarInput) {
    avatar.addEventListener("click", function () {
      avatarInput.click();
    });

    avatarInput.addEventListener("change", function () {
      var file = avatarInput.files && avatarInput.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast("File too large. Maximum size is 2MB.");
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        // Remove initials, add image
        var initials = avatar.querySelector(".avatar-initials");
        if (initials) initials.remove();

        var existing = avatar.querySelector("img");
        if (existing) existing.remove();

        var img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Avatar";
        avatar.insertBefore(img, avatar.firstChild);

        showToast("Avatar updated successfully.");
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Profile Form Validation ────────────────────
  var profileForm = document.getElementById("profile-form");

  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(profileForm);

      var valid = true;
      var firstName = document.getElementById("first-name");
      var lastName = document.getElementById("last-name");
      var email = document.getElementById("email");

      if (firstName && !firstName.value.trim()) {
        showError(firstName, "first-name", "First name is required.");
        valid = false;
      }
      if (lastName && !lastName.value.trim()) {
        showError(lastName, "last-name", "Last name is required.");
        valid = false;
      }
      if (email) {
        if (!email.value.trim()) {
          showError(email, "email", "Email is required.");
          valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          showError(email, "email", "Please enter a valid email address.");
          valid = false;
        }
      }

      if (valid) {
        showToast("Settings saved successfully.");
      }
    });
  }

  // ── Password Form Validation ───────────────────
  var passwordForm = document.getElementById("password-form");

  if (passwordForm) {
    passwordForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(passwordForm);

      var valid = true;
      var current = document.getElementById("current-password");
      var newPass = document.getElementById("new-password");
      var confirm = document.getElementById("confirm-password");

      if (current && !current.value) {
        showError(current, "current-password", "Current password is required.");
        valid = false;
      }
      if (newPass && !newPass.value) {
        showError(newPass, "new-password", "New password is required.");
        valid = false;
      } else if (newPass && newPass.value.length < 8) {
        showError(newPass, "new-password", "Password must be at least 8 characters.");
        valid = false;
      }
      if (confirm && !confirm.value) {
        showError(confirm, "confirm-password", "Please confirm your new password.");
        valid = false;
      } else if (newPass && confirm && newPass.value !== confirm.value) {
        showError(confirm, "confirm-password", "Passwords do not match.");
        valid = false;
      }

      if (valid) {
        passwordForm.reset();
        showToast("Password changed successfully.");
      }
    });
  }

  // ── Cancel Button ──────────────────────────────
  var cancelBtn = document.getElementById("profile-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      var form = document.getElementById("profile-form");
      if (form) {
        form.reset();
        clearErrors(form);
      }
    });
  }

  // ── Revoke Session ─────────────────────────────
  document.querySelectorAll(".btn-danger-sm").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".session-item");
      if (item) {
        item.style.transition = "opacity 0.3s, transform 0.3s";
        item.style.opacity = "0";
        item.style.transform = "translateX(20px)";
        setTimeout(function () {
          item.remove();
        }, 300);
        showToast("Session revoked.");
      }
    });
  });

  // ── Helpers ────────────────────────────────────
  function showError(input, name, message) {
    input.classList.add("error");
    var errorEl = document.querySelector('[data-error="' + name + '"]');
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll(".error").forEach(function (el) {
      el.classList.remove("error");
    });
    form.querySelectorAll(".form-error").forEach(function (el) {
      el.textContent = "";
    });
  }

  var toastTimeout;
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimeout = setTimeout(function () {
      toast.classList.remove("visible");
    }, 3000);
  }
})();
