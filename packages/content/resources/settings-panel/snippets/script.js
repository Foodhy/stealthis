(() => {
  const panel = document.getElementById("settingsPanel");
  const backdrop = document.getElementById("panelBackdrop");
  const openBtn = document.getElementById("openBtn");
  const closeBtn = document.getElementById("closeBtn");

  // ── Open / Close ──
  function openPanel() {
    panel.classList.add("open");
    backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePanel() {
    panel.classList.remove("open");
    backdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);

  // Trap Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });

  // ── Tab switching ──
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(`tab-${btn.dataset.tab}`);
      if (target) target.classList.add("active");
    });
  });

  // ── Profile: save ──
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const saveSuccess = document.getElementById("saveSuccess");
  let saveTimer = null;

  saveProfileBtn.addEventListener("click", () => {
    clearTimeout(saveTimer);
    saveSuccess.classList.add("visible");
    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving…";

    saveTimer = setTimeout(() => {
      saveSuccess.classList.remove("visible");
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = "Save Changes";
    }, 3000);
  });

  // ── Appearance: accent color swatches ──
  const swatches = document.querySelectorAll(".swatch");
  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      swatches.forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      const color = swatch.dataset.color;
      document.documentElement.style.setProperty("--accent", color);
    });
  });

  // ── Appearance: font size slider ──
  const fontSizeRange = document.getElementById("fontSizeRange");
  const fontSizeVal = document.getElementById("fontSizeVal");
  if (fontSizeRange) {
    fontSizeRange.addEventListener("input", () => {
      fontSizeVal.textContent = `${fontSizeRange.value}px`;
    });
  }

  // ── Security: 2FA toggle ──
  const toggle2fa = document.getElementById("toggle2fa");
  const badge2fa = document.getElementById("badge2fa");
  if (toggle2fa) {
    toggle2fa.addEventListener("change", () => {
      if (toggle2fa.checked) {
        badge2fa.textContent = "Enabled";
        badge2fa.classList.add("enabled");
      } else {
        badge2fa.textContent = "Disabled";
        badge2fa.classList.remove("enabled");
      }
    });
  }

  // ── Security: session revoke ──
  document.querySelectorAll(".session-revoke").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".session-item");
      if (item) {
        item.style.transition = "opacity 0.3s, transform 0.3s";
        item.style.opacity = "0";
        item.style.transform = "translateX(12px)";
        setTimeout(() => item.remove(), 320);
      }
    });
  });
})();
