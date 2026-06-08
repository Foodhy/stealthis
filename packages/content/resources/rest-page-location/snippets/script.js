// shape: [open] in minutes, [close] in minutes; null = closed
const HOURS = [
  { day: "Monday", windows: null },
  { day: "Tuesday", windows: [[19 * 60, 23 * 60]] },
  {
    day: "Wednesday",
    windows: [[19 * 60, 23 * 60 + 30]],
  },
  {
    day: "Thursday",
    windows: [[19 * 60, 23 * 60 + 30]],
  },
  {
    day: "Friday",
    windows: [[19 * 60, 23 * 60 + 30]],
  },
  {
    day: "Saturday",
    windows: [
      [13 * 60, 16 * 60],
      [19 * 60, 23 * 60 + 30],
    ],
  },
  {
    day: "Sunday",
    windows: [[13 * 60, 16 * 60]],
  },
];

const JS_DOW_TO_INDEX = [6, 0, 1, 2, 3, 4, 5]; // Sunday → 6 (last row), Mon → 0
const tbody = document.getElementById("hoursBody");
const status = document.getElementById("status");
const statusText = document.getElementById("statusText");

function fmt(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function describeWindows(windows) {
  if (!windows) return "Closed";
  return windows.map(([a, b]) => `${fmt(a)} – ${fmt(b)}`).join(" · ");
}

function buildHours() {
  const todayIdx = JS_DOW_TO_INDEX[new Date().getDay()];
  tbody.innerHTML = HOURS.map((row, idx) => {
    const cls = [idx === todayIdx ? "is-today" : "", !row.windows ? "is-closed" : ""]
      .filter(Boolean)
      .join(" ");
    return `<tr class="${cls}">
      <td>${row.day}</td>
      <td>${describeWindows(row.windows)}</td>
    </tr>`;
  }).join("");
}

function statusNow() {
  const now = new Date();
  const todayIdx = JS_DOW_TO_INDEX[now.getDay()];
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const today = HOURS[todayIdx];

  if (today.windows) {
    const open = today.windows.find(([a, b]) => minutesNow >= a && minutesNow < b);
    if (open) {
      status.classList.remove("is-closed");
      status.classList.add("is-open");
      statusText.textContent = `Open now · closes ${fmt(open[1])}`;
      return;
    }
    const upcoming = today.windows.find(([a]) => minutesNow < a);
    if (upcoming) {
      status.classList.remove("is-open");
      status.classList.add("is-closed");
      statusText.textContent = `Closed · opens today ${fmt(upcoming[0])}`;
      return;
    }
  }
  // Find the next day that has hours
  for (let i = 1; i <= 7; i++) {
    const next = HOURS[(todayIdx + i) % 7];
    if (next.windows) {
      status.classList.remove("is-open");
      status.classList.add("is-closed");
      statusText.textContent = `Closed · opens ${next.day.slice(0, 3)} ${fmt(next.windows[0][0])}`;
      return;
    }
  }
}

document.getElementById("copyAddr").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  const text = "Casa Olivar, 42 Calle del Olivar, 28012 Madrid, Spain";
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = "Copied ✓";
  } catch {
    btn.textContent = "Copy failed";
  }
  setTimeout(() => (btn.textContent = "Copy address"), 1600);
});

document.getElementById("printDir").addEventListener("click", () => {
  window.print();
});

const form = document.getElementById("contactForm");
const ok = document.getElementById("contactOk");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  ok.hidden = false;
  form.querySelector("button").disabled = true;
  setTimeout(() => {
    ok.hidden = true;
    form.querySelector("button").disabled = false;
    form.reset();
  }, 3000);
});

buildHours();
statusNow();
