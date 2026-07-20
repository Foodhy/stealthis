/* Input masks — caret-safe formatting with raw-value extraction. Vanilla, no deps. */
(() => {
  "use strict";

  const digitsOf = (s) => s.replace(/\D+/g, "");

  /* ---------- formatters: raw digits -> display string ---------- */

  const CARD_BRANDS = [
    { id: "visa", test: /^4/, len: 16, groups: [4, 4, 4, 4] },
    { id: "amex", test: /^3[47]/, len: 15, groups: [4, 6, 5] },
    { id: "mastercard", test: /^(5[1-5]|2[2-7])/, len: 16, groups: [4, 4, 4, 4] },
    { id: "discover", test: /^6(?:011|5)/, len: 16, groups: [4, 4, 4, 4] },
    { id: "diners", test: /^3(?:0[0-5]|[68])/, len: 14, groups: [4, 6, 4] }
  ];

  const brandFor = (d) => CARD_BRANDS.find((b) => b.test.test(d)) || null;

  const group = (d, sizes, sep) => {
    const out = [];
    let i = 0;
    for (const size of sizes) {
      if (i >= d.length) break;
      out.push(d.slice(i, i + size));
      i += size;
    }
    if (i < d.length) out.push(d.slice(i));
    return out.join(sep);
  };

  const luhn = (d) => {
    let sum = 0;
    let dbl = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = d.charCodeAt(i) - 48;
      if (dbl) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      dbl = !dbl;
    }
    return d.length > 0 && sum % 10 === 0;
  };

  /* Clamp a 2-digit field as the user types, e.g. month "9" -> "09". */
  const clampPair = (pair, min, max) => {
    if (pair.length === 1) {
      // A leading digit that can't start a valid value gets zero-padded.
      return Number(pair) > Number(String(max).charAt(0)) ? "0" + pair : pair;
    }
    const n = Number(pair);
    if (n < min) return String(min).padStart(2, "0");
    if (n > max) return String(max).padStart(2, "0");
    return pair;
  };

  const daysInMonth = (m, y) => new Date(y, m, 0).getDate();

  const MASKS = {
    phone: {
      max: 10,
      format(d) {
        if (d.length <= 3) return d;
        if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
        return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
      },
      validate: (d) => (d.length === 0 ? [null, "US format · 10 digits"]
        : d.length < 10 ? [false, `${10 - d.length} digit${d.length === 9 ? "" : "s"} to go`]
        : /^[2-9]/.test(d) ? [true, "Looks like a valid US number"]
        : [false, "Area code cannot start with 0 or 1"])
    },

    card: {
      max: 19,
      limit: (d) => d.slice(0, (brandFor(d) || { len: 19 }).len),
      format(d) {
        const b = brandFor(d);
        return group(d, b ? b.groups : [4, 4, 4, 4, 3], " ");
      },
      validate(d) {
        if (!d) return [null, "Luhn-checked · brand detected live"];
        const b = brandFor(d);
        const target = b ? b.len : 16;
        if (d.length < target) return [false, `${target - d.length} digits remaining`];
        return luhn(d) ? [true, "Checksum OK"] : [false, "Failed the Luhn checksum"];
      }
    },

    expiry: {
      max: 4,
      format(d) {
        if (!d.length) return "";
        const mm = clampPair(d.slice(0, 2), 1, 12);
        const yy = d.slice(2);
        return yy || d.length > 2 ? `${mm}/${yy}` : mm;
      },
      validate(d) {
        if (!d) return [null, "Month 01–12"];
        if (d.length < 4) return [false, "MM/YY"];
        const mm = Number(d.slice(0, 2));
        const yy = 2000 + Number(d.slice(2, 4));
        if (mm < 1 || mm > 12) return [false, "Month must be 01–12"];
        const now = new Date();
        const end = new Date(yy, mm, 1);
        return end > now ? [true, "Card not expired"] : [false, "That date is in the past"];
      }
    },

    date: {
      max: 8,
      format(d) {
        if (!d.length) return "";
        const dd = clampPair(d.slice(0, 2), 1, 31);
        const mm = d.length > 2 ? clampPair(d.slice(2, 4), 1, 12) : "";
        const yyyy = d.slice(4);
        let out = dd;
        if (d.length > 2) out += "/" + mm;
        if (d.length > 4) out += "/" + yyyy;
        return out;
      },
      validate(d) {
        if (!d) return [null, "Calendar-validated"];
        if (d.length < 8) return [false, "DD/MM/YYYY"];
        const dd = Number(d.slice(0, 2));
        const mm = Number(d.slice(2, 4));
        const yyyy = Number(d.slice(4, 8));
        if (mm < 1 || mm > 12) return [false, "Month must be 01–12"];
        if (yyyy < 1900 || yyyy > new Date().getFullYear()) return [false, "Year out of range"];
        if (dd < 1 || dd > daysInMonth(mm, yyyy)) {
          return [false, `That month has ${daysInMonth(mm, yyyy)} days`];
        }
        const date = new Date(yyyy, mm - 1, dd);
        return date > new Date() ? [false, "Date is in the future"] : [true, "Valid date"];
      }
    }
  };

  /* ---------- caret-preserving apply ---------- */

  /* Count how many digits sit before `pos` in `value`. */
  const digitsBefore = (value, pos) => digitsOf(value.slice(0, pos)).length;

  /* Find the caret offset in `formatted` that sits after `n` digits. */
  const posAfterDigits = (formatted, n) => {
    if (n <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seen++;
        if (seen === n) return i + 1;
      }
    }
    return formatted.length;
  };

  const status = document.querySelector("[data-status]");
  const brandEl = document.querySelector("[data-brand]");

  const state = new Map(); // input -> raw digits

  function apply(input, opts) {
    const mask = MASKS[input.dataset.mask];
    const value = input.value;
    const selStart = input.selectionStart ?? value.length;

    let raw = digitsOf(value);
    let caretDigits = digitsBefore(value, selStart);

    /* Backspace on a separator should eat the digit before it, not just the
       separator (which the formatter would immediately re-insert). */
    if (opts && opts.deletingBackwardOverSeparator && caretDigits > 0) {
      raw = raw.slice(0, caretDigits - 1) + raw.slice(caretDigits);
      caretDigits--;
    }

    raw = raw.slice(0, mask.max);
    if (mask.limit) raw = mask.limit(raw);
    caretDigits = Math.min(caretDigits, raw.length);

    const formatted = mask.format(raw);
    input.value = formatted;
    state.set(input, raw);

    if (document.activeElement === input) {
      const pos = posAfterDigits(formatted, caretDigits);
      input.setSelectionRange(pos, pos);
    }

    const [ok, message] = mask.validate(raw);
    const hint = document.getElementById(input.getAttribute("aria-describedby"));
    if (hint) {
      hint.textContent = message;
      if (ok === null) hint.removeAttribute("data-tone");
      else hint.dataset.tone = ok ? "valid" : "invalid";
    }
    if (!raw) input.removeAttribute("data-state");
    else input.dataset.state = ok ? "valid" : "invalid";

    if (input.dataset.mask === "card" && brandEl) {
      const b = brandFor(raw);
      brandEl.textContent = b ? b.id : "card";
      brandEl.dataset.known = String(Boolean(b));
    }

    const rawCell = document.querySelector(`[data-raw-for="${input.name}"]`);
    if (rawCell) rawCell.textContent = raw || "—";
  }

  document.querySelectorAll("input[data-mask]").forEach((input) => {
    let pendingBackspaceOnSeparator = false;

    input.addEventListener("keydown", (e) => {
      pendingBackspaceOnSeparator = false;
      if (e.key !== "Backspace") return;
      const { selectionStart, selectionEnd, value } = input;
      if (selectionStart !== selectionEnd || selectionStart === 0) return;
      if (!/\d/.test(value[selectionStart - 1])) pendingBackspaceOnSeparator = true;
    });

    input.addEventListener("input", () => {
      apply(input, { deletingBackwardOverSeparator: pendingBackspaceOnSeparator });
      pendingBackspaceOnSeparator = false;
    });

    input.addEventListener("blur", () => apply(input));
    apply(input);
  });

  document.querySelector(".mask-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = [...document.querySelectorAll("input[data-mask]")];
    const bad = inputs.find((i) => MASKS[i.dataset.mask].validate(state.get(i) || "")[0] !== true);
    if (bad) {
      status.textContent = "Fix the highlighted field before saving.";
      status.dataset.tone = "invalid";
      bad.focus();
      return;
    }
    status.textContent = "Saved — raw values below are what a backend would receive.";
    status.dataset.tone = "valid";
  });
})();
