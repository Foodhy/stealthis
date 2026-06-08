// ─── Staff data ───
// shifts: array of 7 days, each day is array of shift codes:
//   "k:11-15" "k:17-23" "f:17-23" "b:18-1" or "" for off, "open:f:17-23" for open shift
const STAFF = [
  {
    id: "aitor",
    name: "Aitor M.",
    role: "kitchen",
    title: "Head chef",
    shifts: [
      "",
      "k:10-15:k:17-23",
      "k:17-23",
      "k:10-15:k:17-23",
      "k:17-23",
      "k:10-15:k:17-23",
      "k:10-15",
    ],
  },
  {
    id: "lina",
    name: "Lina M.",
    role: "kitchen",
    title: "Sous-chef",
    shifts: [
      "",
      "k:10-15:k:17-23",
      "k:17-23",
      "k:10-15:k:17-23",
      "k:17-23",
      "k:10-15:k:17-23",
      "k:10-15",
    ],
  },
  {
    id: "kenji",
    name: "Kenji T.",
    role: "kitchen",
    title: "Line · grill",
    shifts: ["", "", "k:17-23", "k:17-23", "k:17-23", "k:17-23", "k:10-15"],
  },
  {
    id: "marta",
    name: "Marta L.",
    role: "kitchen",
    title: "Pastry",
    shifts: ["", "k:14-22", "k:14-22", "k:14-22", "k:14-22", "k:14-22", ""],
  },
  {
    id: "santi",
    name: "Santi P.",
    role: "kitchen",
    title: "Prep",
    shifts: ["", "k:08-14", "k:08-14", "k:08-14", "k:08-14", "k:08-14", "k:08-14"],
  },

  {
    id: "iria",
    name: "Iria C.",
    role: "floor",
    title: "Floor lead · wine",
    shifts: ["", "f:17-23", "f:17-23", "f:17-23", "f:17-23", "f:17-23", "f:13-22"],
  },
  {
    id: "sofia",
    name: "Sofía R.",
    role: "floor",
    title: "Server",
    shifts: ["", "f:17-23", "f:17-23", "open:f:17-23", "f:17-23", "f:17-23", "f:13-22"],
  },
  {
    id: "marco",
    name: "Marco D.",
    role: "floor",
    title: "Server",
    shifts: ["", "f:17-23", "f:17-23", "f:17-23", "f:17-23", "f:17-23", "f:13-22"],
  },
  {
    id: "aitana",
    name: "Aitana V.",
    role: "floor",
    title: "Server (patio)",
    shifts: ["", "", "f:17-23", "f:17-23", "f:17-23", "open:f:11-15", ""],
  },
  {
    id: "diego",
    name: "Diego R.",
    role: "floor",
    title: "Host / runner",
    shifts: ["", "f:17-23", "f:17-23", "f:17-23", "f:17-23", "f:17-23", "f:13-22"],
  },

  {
    id: "theo",
    name: "Theo K.",
    role: "bar",
    title: "Bartender",
    shifts: ["", "b:17-1", "b:17-1", "b:17-1", "b:17-1", "b:17-1", ""],
  },
  {
    id: "sasha",
    name: "Sasha M.",
    role: "bar",
    title: "Barback",
    shifts: ["", "b:17-1", "b:17-1", "b:17-1", "b:17-1", "b:17-1", ""],
  },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shiftToObj(code) {
  if (!code) return null;
  if (code.startsWith("open:")) {
    const inner = code.slice(5);
    const obj = shiftToObj(inner);
    return obj ? { ...obj, open: true } : null;
  }
  const [role, range] = code.split(":");
  if (!range) return null;
  const [a, b] = range.split("-").map(Number);
  return { role, start: a, end: b, hours: b > a ? b - a : 24 - a + b };
}

function parseShifts(dayCode) {
  if (!dayCode) return [];
  return (
    dayCode.split(":").reduce((acc, part, i, arr) => {
      // Pair role:range halves. Each shift = 2 segments (role:range), unless "open:" prefixes.
      return acc;
    }, []) || []
  );
}

// Simpler parse: each shift is "role:start-end", entries separated by ":"
function splitShifts(dayCode) {
  if (!dayCode) return [];
  // tokens are pairs of "role" and "range"
  const tokens = dayCode.split(":");
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i] === "open") {
      // open:role:range
      out.push({ open: true, role: tokens[i + 1], range: tokens[i + 2] });
      i += 3;
    } else {
      // role:range
      out.push({ role: tokens[i], range: tokens[i + 1] });
      i += 2;
    }
  }
  return out;
}

function rangeHours(range) {
  const [a, b] = range.split("-").map(Number);
  return b > a ? b - a : 24 - a + b;
}

const ROLE_RATE = { kitchen: 22, floor: 19, bar: 21 };
const ROLE_CLASS = { kitchen: "shift-kitchen", floor: "shift-floor", bar: "shift-bar" };
const ROLE_LABEL = { kitchen: "Kitchen", floor: "Floor", bar: "Bar" };

// ─── Week header ───
const schedHead = document.getElementById("schedHead");
const weekLabel = document.getElementById("weekLabel");
const rowsEl = document.getElementById("rows");
const totalHoursEl = document.getElementById("totalHours");
const totalCostEl = document.getElementById("totalCost");
const toast = document.getElementById("toast");
const chips = document.getElementById("chips");

let weekOffset = 0;
let activeRole = "all";

function weekDates() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday=0
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function isToday(d) {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && weekOffset === 0;
}

function renderHead() {
  const dates = weekDates();
  weekLabel.textContent = `${dates[0].getDate()} – ${dates[6].getDate()} ${dates[6].toLocaleString(undefined, { month: "long" })}`;
  schedHead.innerHTML = `
    <div>Staff</div>
    ${dates
      .map(
        (d, i) => `<div class="h-day ${isToday(d) ? "is-today" : ""}">
          <span>${DAY_NAMES[i]}</span>
          <span class="h-num">${d.getDate()}</span>
        </div>`
      )
      .join("")}
    <div>Hours</div>`;
}

function renderRows() {
  let total = 0;
  let cost = 0;
  rowsEl.innerHTML = STAFF.map((s) => {
    let personHours = 0;
    const cells = s.shifts
      .map((dayCode) => {
        const shifts = splitShifts(dayCode);
        if (shifts.length === 0) {
          return `<div class="r-cell"><span class="shift-off">— off —</span></div>`;
        }
        const cellHtml = shifts
          .map((sh) => {
            const h = rangeHours(sh.range);
            if (!sh.open) personHours += h;
            const cls = sh.open ? "shift-open" : ROLE_CLASS[sh.role];
            const label = sh.open ? "OPEN" : ROLE_LABEL[sh.role];
            return `<div class="shift ${cls}" data-role="${sh.role}" data-staff="${s.name}">
              <span class="s-when">${sh.range.replace("-", "–")}</span>
              <span>${label}${sh.open ? " · fill" : ""}</span>
            </div>`;
          })
          .join("");
        return `<div class="r-cell">${cellHtml}</div>`;
      })
      .join("");
    total += personHours;
    cost += personHours * ROLE_RATE[s.role];
    return `<li class="row row-${s.role}" data-role="${s.role}">
      <div class="r-person">
        <span class="r-avatar">${s.name[0]}</span>
        <div>
          <p class="r-name">${s.name}</p>
          <p class="r-role">${s.title}</p>
        </div>
      </div>
      ${cells}
      <div class="r-total">${personHours} h</div>
    </li>`;
  }).join("");
  totalHoursEl.textContent = `${total} h`;
  totalCostEl.textContent = `$${cost.toLocaleString()}`;
  document.getElementById("cKit").textContent = STAFF.filter((s) => s.role === "kitchen").length;
  document.getElementById("cFlo").textContent = STAFF.filter((s) => s.role === "floor").length;
  document.getElementById("cBar").textContent = STAFF.filter((s) => s.role === "bar").length;
  applyFilter();
}

function applyFilter() {
  rowsEl.querySelectorAll(".row").forEach((r) => {
    const show = activeRole === "all" || r.dataset.role === activeRole;
    r.classList.toggle("row-hidden", !show);
  });
}

chips.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-role]");
  if (!btn) return;
  activeRole = btn.dataset.role;
  chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === btn));
  applyFilter();
});

rowsEl.addEventListener("click", (e) => {
  const shift = e.target.closest(".shift");
  if (!shift) return;
  if (shift.classList.contains("shift-open")) {
    showToast(`Open shift · ${shift.dataset.role} · drag a name onto it to fill`);
  } else {
    showToast(`Edit shift · ${shift.dataset.staff} · ${ROLE_LABEL[shift.dataset.role]}`);
  }
});

document.getElementById("prevWk").addEventListener("click", () => {
  weekOffset -= 1;
  renderHead();
  renderRows();
});
document.getElementById("nextWk").addEventListener("click", () => {
  weekOffset += 1;
  renderHead();
  renderRows();
});
document.getElementById("publish").addEventListener("click", () => {
  showToast("Schedule published · team notified via email");
});

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

renderHead();
renderRows();
