// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2800);
}

const form = document.getElementById("intake-form");

// ── Reason character counter ──────────────────────────────────────────────
const reason = document.getElementById("reason");
const reasonCount = document.getElementById("reason-count");
reason.addEventListener("input", () => {
  reasonCount.textContent = reason.value.length;
});

// ── Severity slider (live label + colour) ─────────────────────────────────
const severity = document.getElementById("severity");
const sevPill = document.getElementById("sev-pill");

const SEV_BANDS = [
  { max: 3, label: "Mild", track: "#2f9e6f", bg: "rgba(47,158,111,0.14)", fg: "#2f9e6f" },
  { max: 6, label: "Moderate", track: "#d98a2b", bg: "rgba(217,138,43,0.16)", fg: "#b9741f" },
  { max: 8, label: "High", track: "#ff7a66", bg: "#ffe6df", fg: "#b8412e" },
  { max: 10, label: "Severe", track: "#d4503e", bg: "rgba(212,80,62,0.14)", fg: "#d4503e" },
];
function bandFor(v) {
  return SEV_BANDS.find((b) => v <= b.max);
}
function paintSeverity() {
  const v = Number(severity.value);
  const band = bandFor(v);
  const pct = ((v - 1) / 9) * 100;
  severity.style.setProperty("--sev-pct", pct + "%");
  severity.style.setProperty("--sev-track", band.track);
  sevPill.style.setProperty("--sev-bg", band.bg);
  sevPill.style.setProperty("--sev-fg", band.fg);
  sevPill.textContent = v + " · " + band.label;
}
severity.addEventListener("input", paintSeverity);
paintSeverity();

// ── Chip inputs (meds + allergies) ────────────────────────────────────────
function makeChipGroup(inputId, listId, opts) {
  opts = opts || {};
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const items = [];

  function render() {
    list.innerHTML = "";
    items.forEach((text, i) => {
      const li = document.createElement("li");
      li.className = "chip";
      const span = document.createElement("span");
      span.textContent = text;
      const x = document.createElement("button");
      x.type = "button";
      x.setAttribute("aria-label", "Remove " + text);
      x.textContent = "×";
      x.addEventListener("click", () => {
        items.splice(i, 1);
        render();
        if (opts.onChange) opts.onChange(items);
      });
      li.append(span, x);
      list.appendChild(li);
    });
    if (opts.onChange) opts.onChange(items);
  }

  function add(raw) {
    const text = raw.trim().replace(/\s+/g, " ");
    if (!text) return false;
    const dup = items.some((t) => t.toLowerCase() === text.toLowerCase());
    if (dup) {
      showToast('"' + text + '" is already on the list.');
      return false;
    }
    items.push(text);
    render();
    return true;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (add(input.value)) input.value = "";
    } else if (e.key === "Backspace" && input.value === "" && items.length) {
      items.pop();
      render();
    }
  });
  input.addEventListener("blur", () => {
    if (add(input.value)) input.value = "";
  });

  return { items, add: (t) => { if (add(t)) return true; return false; }, focus: () => input.focus() };
}

const meds = makeChipGroup("med-input", "meds-chips");
const allergies = makeChipGroup("allergy-input", "allergies-chips", {
  onChange(items) {
    // Hide quick-add buttons that are already present.
    document.querySelectorAll("#allergy-quick .quick").forEach((b) => {
      const taken = items.some((t) => t.toLowerCase() === b.dataset.add.toLowerCase());
      b.hidden = taken;
    });
  },
});

document.getElementById("allergy-quick").addEventListener("click", (e) => {
  const b = e.target.closest(".quick");
  if (!b) return;
  allergies.add(b.dataset.add);
  allergies.focus();
});

// ── Progress / active-section tracking ────────────────────────────────────
const sections = [
  { id: "sec-about", step: "about" },
  { id: "sec-visit", step: "visit" },
  { id: "sec-history", step: "history" },
  { id: "sec-consent", step: "consent" },
];
const stepEls = {};
document.querySelectorAll(".step").forEach((el) => (stepEls[el.dataset.step] = el));
const barFill = document.getElementById("bar-fill");

function setActiveStep(idx) {
  sections.forEach((s, i) => {
    const el = stepEls[s.step];
    el.classList.toggle("is-active", i === idx);
    el.classList.toggle("is-done", i < idx);
  });
  barFill.style.width = ((idx + 1) / sections.length) * 100 + "%";
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = sections.findIndex((s) => s.id === entry.target.id);
        if (idx > -1) setActiveStep(idx);
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);
sections.forEach((s) => observer.observe(document.getElementById(s.id)));

// ── Inline validation ─────────────────────────────────────────────────────
function fieldOf(input) {
  return input.closest(".field");
}
function clearError(input) {
  const f = fieldOf(input);
  if (f) f.classList.remove("invalid");
}
form.querySelectorAll("input, textarea").forEach((el) => {
  el.addEventListener("input", () => clearError(el));
});
document.getElementById("consent").addEventListener("change", () => {
  document.getElementById("sec-consent").classList.remove("invalid");
});

function validate() {
  let firstBad = null;
  const fail = (el, container) => {
    (container || fieldOf(el)).classList.add("invalid");
    if (!firstBad) firstBad = container || el;
  };

  ["firstName", "lastName", "dob", "phone", "reason"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el.value.trim()) fail(el);
  });

  const email = document.getElementById("email");
  if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    fail(email);
  }

  const consentSec = document.getElementById("sec-consent");
  if (!document.getElementById("consent").checked) fail(null, consentSec);

  return firstBad;
}

// ── Submit → review summary ───────────────────────────────────────────────
function val(id) {
  return document.getElementById(id).value.trim();
}
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function buildReview() {
  const grid = document.getElementById("review-grid");
  const sevVal = Number(severity.value);
  const band = bandFor(sevVal);

  const tags = (items, danger) =>
    items.length
      ? '<div class="tag-row">' +
        items
          .map((t) => '<span class="tag' + (danger ? " danger" : "") + '">' + esc(t) + "</span>")
          .join("") +
        "</div>"
      : '<dd class="empty">None listed</dd>';

  const rows = [
    { dt: "Name", dd: esc(val("firstName") + " " + val("lastName")) },
    { dt: "Date of birth", dd: esc(fmtDate(val("dob"))) },
    { dt: "Mobile phone", dd: esc(val("phone")) },
    { dt: "Email", dd: val("email") ? esc(val("email")) : '<span class="empty">Not provided</span>' },
    {
      dt: "Reason for visit",
      dd: esc(val("reason")),
      full: true,
    },
    {
      dt: "Symptom severity",
      dd:
        '<span class="sev-chip"><span class="swatch" style="background:' +
        band.track +
        '"></span>' +
        sevVal +
        " / 10 · " +
        band.label +
        "</span>",
    },
    { dt: "Consent", dd: "Confirmed" },
    { dt: "Current medications", ddHtml: tags(meds.items, false), full: true },
    { dt: "Known allergies", ddHtml: tags(allergies.items, true), full: true },
  ];

  grid.innerHTML = rows
    .map((r) => {
      const body = r.ddHtml
        ? (r.ddHtml.startsWith("<dd") ? r.ddHtml : "<dd>" + r.ddHtml + "</dd>")
        : "<dd>" + r.dd + "</dd>";
      return '<div class="row' + (r.full ? " full" : "") + '"><dt>' + r.dt + "</dt>" + body + "</div>";
    })
    .join("");
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

const review = document.getElementById("review");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const bad = validate();
  if (bad) {
    showToast("Please complete the highlighted fields.");
    bad.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = bad.querySelector("input, textarea") || bad;
    if (focusable.focus) setTimeout(() => focusable.focus(), 300);
    return;
  }

  buildReview();
  form.hidden = true;
  review.hidden = false;
  setActiveStep(sections.length - 1);
  review.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Intake submitted — your care team has it.");
});

document.getElementById("edit-btn").addEventListener("click", () => {
  review.hidden = true;
  form.hidden = false;
  document.getElementById("sec-about").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("done-btn").addEventListener("click", () => {
  showToast("All set — see you at your appointment.");
});
