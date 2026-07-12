export function collectBlankValues(slide: HTMLElement): Record<string, string> {
  const values: Record<string, string> = {};

  slide.querySelectorAll<HTMLElement>(".blank-slot").forEach((slot) => {
    const key = slot.dataset.blankKey;
    if (!key) return;
    const mode = slot.dataset.blankMode;

    if (mode === "select") {
      values[key] = (slot as HTMLSelectElement).value.trim();
    } else if (mode === "type") {
      values[key] = (slot as HTMLInputElement).value.trim();
    } else {
      const hidden = slot.querySelector<HTMLInputElement>(".blank-value");
      values[key] = hidden?.value.trim() ?? slot.dataset.value?.trim() ?? "";
    }
  });

  return values;
}

export function allBlanksFilled(slide: HTMLElement): boolean {
  const slots = slide.querySelectorAll<HTMLElement>(".blank-slot");
  if (slots.length === 0) return false;
  const values = collectBlankValues(slide);
  return Object.values(values).every((v) => v.length > 0);
}

export function wireBlankInteractions(
  slide: HTMLElement,
  onChange: () => void
): void {
  slide.querySelectorAll<HTMLSelectElement>(".blank-slot[data-blank-mode='select']").forEach((sel) => {
    sel.addEventListener("change", onChange);
  });

  slide.querySelectorAll<HTMLInputElement>(".blank-slot[data-blank-mode='type']").forEach((input) => {
    input.addEventListener("input", onChange);
  });

  const bank = slide.querySelector<HTMLElement>("[data-word-bank]");
  if (bank) {
    let activeBlank: HTMLElement | null = null;

    slide.querySelectorAll<HTMLElement>(".blank-drop").forEach((drop) => {
      drop.addEventListener("click", () => {
        slide.querySelectorAll(".blank-drop").forEach((d) => d.removeAttribute("data-active"));
        drop.setAttribute("data-active", "true");
        activeBlank = drop;
      });

      drop.addEventListener("dragover", (e) => {
        e.preventDefault();
        drop.classList.add("ring-2", "ring-emerald-400/40");
      });
      drop.addEventListener("dragleave", () => {
        drop.classList.remove("ring-2", "ring-emerald-400/40");
      });
      drop.addEventListener("drop", (e) => {
        e.preventDefault();
        drop.classList.remove("ring-2", "ring-emerald-400/40");
        const value = e.dataTransfer?.getData("text/plain") ?? "";
        if (!value) return;
        fillDropSlot(drop, value);
        onChange();
      });
    });

    bank.querySelectorAll<HTMLButtonElement>(".word-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.dataset.chipValue ?? "";
        const target =
          activeBlank ??
          slide.querySelector<HTMLElement>(".blank-drop:not([data-filled='true'])") ??
          slide.querySelector<HTMLElement>(".blank-drop");
        if (target) fillDropSlot(target, value);
        onChange();
      });

      chip.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData("text/plain", chip.dataset.chipValue ?? "");
      });
    });
  }
}

function fillDropSlot(drop: HTMLElement, value: string): void {
  drop.dataset.filled = "true";
  drop.dataset.value = value;
  const display = drop.querySelector<HTMLElement>("[data-blank-display]");
  if (display) display.textContent = value;
  const hidden = drop.querySelector<HTMLInputElement>(".blank-value");
  if (hidden) hidden.value = value;
}

export function lockBlankSlots(slide: HTMLElement, results: Record<string, boolean>): void {
  slide.querySelectorAll<HTMLElement>(".blank-slot").forEach((slot) => {
    const key = slot.dataset.blankKey!;
    const ok = results[key];
    slot.dataset.result = ok ? "correct" : "incorrect";
    if (slot instanceof HTMLSelectElement || slot instanceof HTMLInputElement) {
      slot.disabled = true;
    } else {
      slot.setAttribute("aria-disabled", "true");
    }
  });
}

export function gradeBlanks(
  slide: HTMLElement,
  answers: Record<string, string>,
  caseSensitive: boolean
): { allCorrect: boolean; results: Record<string, boolean> } {
  const values = collectBlankValues(slide);
  const results: Record<string, boolean> = {};
  let allCorrect = true;

  for (const [key, expected] of Object.entries(answers)) {
    const actual = values[key] ?? "";
    const matches = caseSensitive
      ? actual === expected
      : actual.toLowerCase() === expected.toLowerCase();
    results[key] = matches;
    if (!matches) allCorrect = false;
  }

  return { allCorrect, results };
}
