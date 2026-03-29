(() => {
  const status = document.getElementById("status");

  const getTextFromTarget = (target) => {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return target.value;
    }
    return target.textContent?.trim() ?? "";
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  };

  const copyText = async (text) => {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return fallbackCopy(text);
  };

  const clearState = () => {
    const cards = document.querySelectorAll(".copy-card");
    for (const card of cards) {
      card.classList.remove("success", "error");
    }
  };

  const buttons = document.querySelectorAll("button[data-copy-target]");
  for (const button of buttons) {
    button.addEventListener("click", async () => {
      const selector = button.getAttribute("data-copy-target");
      if (!selector) return;
      const target = document.querySelector(selector);
      if (!target) return;

      const text = getTextFromTarget(target);
      clearState();

      try {
        const ok = await copyText(text);
        const card = button.closest(".copy-card");
        if (!ok) throw new Error("Copy failed");
        card?.classList.add("success");
        status.textContent = `Copied: ${text}`;
      } catch (_error) {
        const card = button.closest(".copy-card");
        card?.classList.add("error");
        status.textContent = "Copy failed. Clipboard permissions may be blocked.";
      }
    });
  }
})();
