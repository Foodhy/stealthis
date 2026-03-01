(function () {
  "use strict";

  // Init all otp-group elements on the page
  document.querySelectorAll(".otp-group").forEach(function (group) {
    initOTP(group);
  });

  function initOTP(group) {
    const len     = parseInt(group.dataset.length, 10) || 6;
    const prefill = group.dataset.prefill || "";

    // Build boxes (with optional separator for 6-digit at position 3)
    for (let i = 0; i < len; i++) {
      if (len === 6 && i === 3) {
        const sep = document.createElement("span");
        sep.className = "otp-sep";
        sep.setAttribute("aria-hidden", "true");
        group.appendChild(sep);
      }

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.pattern = "[0-9]";
      input.className = "otp-box";
      input.setAttribute("aria-label", "Digit " + (i + 1));
      input.setAttribute("autocomplete", i === 0 ? "one-time-code" : "off");
      input.placeholder = "·";
      group.appendChild(input);
    }

    const boxes = Array.from(group.querySelectorAll(".otp-box"));

    // Pre-fill
    if (prefill) {
      boxes.forEach(function (box, i) {
        box.value = prefill[i] || "";
      });
    }

    // ── Keydown ────────────────────────────────────────────────────────────

    boxes.forEach(function (box, i) {
      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace") {
          if (box.value) {
            box.value = "";
          } else if (i > 0) {
            boxes[i - 1].focus();
            boxes[i - 1].value = "";
          }
          e.preventDefault();
          return;
        }

        if (e.key === "ArrowLeft" && i > 0)  { boxes[i - 1].focus(); e.preventDefault(); return; }
        if (e.key === "ArrowRight" && i < boxes.length - 1) { boxes[i + 1].focus(); e.preventDefault(); return; }

        // Block non-digit printable characters before input fires
        if (e.key.length === 1 && !/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      });

      // ── Input ──────────────────────────────────────────────────────────────

      box.addEventListener("input", function () {
        const val = box.value.replace(/\D/g, "").slice(0, 1);
        box.value = val;
        if (val && i < boxes.length - 1) boxes[i + 1].focus();
        checkComplete(group, boxes);
      });

      // ── Focus: select existing value ──────────────────────────────────────

      box.addEventListener("focus", function () {
        box.select();
      });

      // ── Paste ─────────────────────────────────────────────────────────────

      box.addEventListener("paste", function (e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        const chars = text.slice(0, boxes.length - i).split("");
        chars.forEach(function (ch, j) {
          if (boxes[i + j]) boxes[i + j].value = ch;
        });
        const next = Math.min(i + chars.length, boxes.length - 1);
        boxes[next].focus();
        checkComplete(group, boxes);
      });
    });
  }

  // ── Completion handler ──────────────────────────────────────────────────────

  function checkComplete(group, boxes) {
    const value = boxes.map(function (b) { return b.value; }).join("");
    if (value.length === boxes.length && !/[^0-9]/.test(value)) {
      group.classList.add("otp-group--filled");
      // Dispatch custom event
      group.dispatchEvent(new CustomEvent("otp:complete", { detail: { value: value }, bubbles: true }));
      console.log("[OTP complete]", value);
    } else {
      group.classList.remove("otp-group--filled");
    }
  }

  // Listen globally for demonstration
  document.addEventListener("otp:complete", function (e) {
    console.log("OTP/PIN entered:", e.detail.value);
  });
})();
