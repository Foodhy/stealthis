"use strict";

/* ---------------- Data (fictional) ---------------- */

const ASSIGNMENTS = [
  { id: "a1", title: "HTML Basics", short: "HTML", weight: 10 },
  { id: "a2", title: "Flexbox Lab", short: "Flexbox", weight: 15 },
  { id: "a3", title: "JS Functions", short: "JS Fns", weight: 20 },
  { id: "a4", title: "Fetch & APIs", short: "APIs", weight: 25 },
  { id: "a5", title: "Capstone App", short: "Capstone", weight: 30 },
];

const RUBRIC = [
  { id: "r1", name: "Correctness", desc: "Meets the spec and runs without errors.", max: 4 },
  { id: "r2", name: "Code quality", desc: "Readable, well-named, no dead code.", max: 3 },
  { id: "r3", name: "Accessibility", desc: "Semantic markup, labels, keyboard usable.", max: 2 },
  { id: "r4", name: "Polish", desc: "Visual care and edge-case handling.", max: 1 },
];
const RUBRIC_MAX = RUBRIC.reduce((s, r) => s + r.max, 0); // 10

const AVATAR_TONES = [
  "linear-gradient(140deg,#5b5bd6,#4444c2)",
  "linear-gradient(140deg,#13b981,#0c9a6f)",
  "linear-gradient(140deg,#f59e0b,#e07a16)",
  "linear-gradient(140deg,#e05656,#c23b6e)",
  "linear-gradient(140deg,#3aa0ff,#5b5bd6)",
  "linear-gradient(140deg,#9b5bd6,#6b3bc2)",
];

// score: number 0-100 | "pending" (submitted, ungraded) | null (missing)
const STUDENTS = [
  { id: "s1", name: "Mara Velez", email: "mara.v@northbridge.edu", cohort: "A", scores: { a1: 92, a2: 88, a3: 95, a4: 81, a5: "pending" } },
  { id: "s2", name: "Theo Okonkwo", email: "theo.o@northbridge.edu", cohort: "A", scores: { a1: 78, a2: 71, a3: 64, a4: "pending", a5: null } },
  { id: "s3", name: "Lena Hoffmann", email: "lena.h@northbridge.edu", cohort: "B", scores: { a1: 100, a2: 96, a3: 91, a4: 94, a5: 89 } },
  { id: "s4", name: "Darius Cole", email: "darius.c@northbridge.edu", cohort: "B", scores: { a1: 58, a2: 62, a3: 55, a4: null, a5: null } },
  { id: "s5", name: "Aiko Tanaka", email: "aiko.t@northbridge.edu", cohort: "C", scores: { a1: 84, a2: 79, a3: 87, a4: 90, a5: "pending" } },
  { id: "s6", name: "Samir Haddad", email: "samir.h@northbridge.edu", cohort: "C", scores: { a1: 67, a2: 73, a3: "pending", a4: null, a5: null } },
  { id: "s7", name: "Priya Nair", email: "priya.n@northbridge.edu", cohort: "A", scores: { a1: 95, a2: 90, a3: 98, a4: 92, a5: 96 } },
  { id: "s8", name: "Gabriel Reyes", email: "gabriel.r@northbridge.edu", cohort: "B", scores: { a1: 49, a2: 58, a3: 61, a4: "pending", a5: null } },
  { id: "s9", name: "Noor Farah", email: "noor.f@northbridge.edu", cohort: "C", scores: { a1: 88, a2: 85, a3: 80, a4: 83, a5: "pending" } },
];

const SUBMISSION_NOTES = {
  pending: "Submitted on time. Includes a live demo link and a short write-up. Awaiting your review.",
  graded: "Graded. Feedback was shared with the student.",
  missing: "No submission received. The deadline has passed.",
};

/* ---------------- State ---------------- */

let cohortFilter = "all";
let searchTerm = "";
const drawerState = { studentId: null, assignmentId: null, rubricScores: {} };

/* ---------------- Helpers ---------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const toneFor = (id) => AVATAR_TONES[(id.charCodeAt(1) || 0) % AVATAR_TONES.length];

function band(score) {
  if (score === null) return "missing";
  if (score === "pending") return "pending";
  if (score >= 85) return "ok";
  if (score >= 60) return "mid";
  return "low";
}

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function filteredStudents() {
  return STUDENTS.filter((s) => {
    if (cohortFilter !== "all" && s.cohort !== cohortFilter) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm)) return false;
    return true;
  });
}

function assignmentAverage(assignmentId, students) {
  const vals = students
    .map((s) => s.scores[assignmentId])
    .filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function classAverage(students) {
  const vals = [];
  students.forEach((s) =>
    ASSIGNMENTS.forEach((a) => {
      const v = s.scores[a.id];
      if (typeof v === "number") vals.push(v);
    })
  );
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/* ---------------- Render ---------------- */

function renderHead(students) {
  const head = $("#matrixHead");
  let cols = ASSIGNMENTS.map((a) => {
    const avg = assignmentAverage(a.id, students);
    return `<th scope="col">
      <div class="col-head">
        <span class="col-head__title">${a.short}</span>
        <span class="col-head__meta"><span class="weight-pill">${a.weight}%</span></span>
        <span class="col-avg" data-avg="${a.id}">avg <b>${avg === null ? "—" : avg}</b></span>
      </div>
    </th>`;
  }).join("");
  head.innerHTML = `<tr>
    <th scope="col" class="stu-head">Student</th>
    ${cols}
  </tr>`;
}

function cellMarkup(student, assignment) {
  const v = student.scores[assignment.id];
  const b = band(v);
  let score = "", tag = "";
  if (v === null) { score = "—"; tag = "Missing"; }
  else if (v === "pending") { score = "•••"; tag = "To grade"; }
  else { score = v; tag = ""; }
  return `<td class="score-cell">
    <button class="cell cell--${b}" data-student="${student.id}" data-assignment="${assignment.id}"
      aria-label="${student.name}, ${assignment.title}: ${v === null ? "missing" : v === "pending" ? "awaiting grade" : v}. Open to grade.">
      <span class="cell__score">${score}</span>
      ${tag ? `<span class="cell__tag">${tag}</span>` : ""}
    </button>
  </td>`;
}

function renderBody(students) {
  const body = $("#matrixBody");
  const empty = $("#emptyState");
  if (!students.length) {
    body.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.innerHTML = students.map((s) => {
    const cells = ASSIGNMENTS.map((a) => cellMarkup(s, a)).join("");
    return `<tr>
      <td class="stu-cell">
        <div class="stu">
          <span class="stu__avatar" style="background:${toneFor(s.id)}" aria-hidden="true">${initials(s.name)}</span>
          <span class="stu__info">
            <span class="stu__name">${s.name}<span class="cohort-tag">${s.cohort}</span></span>
            <span class="stu__meta">${s.email}</span>
          </span>
        </div>
      </td>
      ${cells}
    </tr>`;
  }).join("");
}

function renderStats(students) {
  let graded = 0, pending = 0, missing = 0;
  students.forEach((s) => ASSIGNMENTS.forEach((a) => {
    const v = s.scores[a.id];
    if (v === null) missing++;
    else if (v === "pending") pending++;
    else graded++;
  }));
  $("#stats").innerHTML = `
    <span class="stat"><b>${students.length}</b><span>students</span></span>
    <span class="stat"><b>${graded}</b><span>graded</span></span>
    <span class="stat"><b>${pending}</b><span>to grade</span></span>
    <span class="stat"><b>${missing}</b><span>missing</span></span>`;
}

function renderClassAvg(students) {
  const avg = classAverage(students);
  $("#classAvg").textContent = avg === null ? "—" : avg + "%";
}

function renderAll() {
  const students = filteredStudents();
  renderHead(students);
  renderBody(students);
  renderStats(students);
  renderClassAvg(students);
}

/* Update only the averages without rebuilding the whole table */
function refreshAverages() {
  const students = filteredStudents();
  ASSIGNMENTS.forEach((a) => {
    const el = $(`.col-avg[data-avg="${a.id}"] b`);
    if (el) {
      const avg = assignmentAverage(a.id, students);
      el.textContent = avg === null ? "—" : avg;
    }
  });
  renderStats(students);
  renderClassAvg(students);
}

/* ---------------- Drawer ---------------- */

function statusOf(v) {
  if (v === null) return "missing";
  if (v === "pending") return "submitted";
  return "graded";
}

function openDrawer(studentId, assignmentId) {
  const student = STUDENTS.find((s) => s.id === studentId);
  const assignment = ASSIGNMENTS.find((a) => a.id === assignmentId);
  if (!student || !assignment) return;

  drawerState.studentId = studentId;
  drawerState.assignmentId = assignmentId;
  drawerState.rubricScores = {};

  const v = student.scores[assignmentId];
  const status = statusOf(v);

  $("#drawerEyebrow").textContent = `${assignment.title} · ${assignment.weight}% of grade`;
  $("#drawerTitle").textContent = student.name;

  const submittedDates = { pending: "Apr 18, 11:42 PM", graded: "Apr 12, 9:05 PM", missing: "—" };
  $("#submission").innerHTML = `
    <div class="submission__row"><span>Cohort</span><b>${student.cohort} · ${student.email}</b></div>
    <div class="submission__row"><span>Submitted</span><b>${submittedDates[status] || "—"}</b></div>
    <div class="submission__row"><span>Status</span>
      <span class="status-pill status-pill--${status}">${status}</span></div>
    <p class="submission__note">${SUBMISSION_NOTES[status === "submitted" ? "pending" : status]}</p>`;

  renderRubric();

  const fb = $("#feedback");
  fb.value = status === "graded"
    ? "Solid work overall — strong logic. Tighten variable names next time."
    : "";

  const gradeInput = $("#gradeInput");
  gradeInput.value = typeof v === "number" ? v : "";

  $("#scrim").hidden = false;
  const drawer = $("#drawer");
  drawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => drawer.classList.add("open"));
  $("#closeDrawer").focus();
}

function renderRubric() {
  const wrap = $("#rubric");
  wrap.innerHTML = RUBRIC.map((r) => {
    const pts = Array.from({ length: r.max + 1 }, (_, i) => i)
      .map((p) => `<button type="button" class="pt-btn" data-rubric="${r.id}" data-pts="${p}">${p}</button>`)
      .join("");
    return `<div class="rubric__item">
      <div class="rubric__top">
        <span class="rubric__name">${r.name}</span>
        <span class="rubric__max">/ ${r.max} pts</span>
      </div>
      <p class="rubric__desc">${r.desc}</p>
      <div class="rubric__pts">${pts}</div>
    </div>`;
  }).join("");
  updateRubricTotal();
}

function updateRubricTotal() {
  const total = Object.values(drawerState.rubricScores).reduce((a, b) => a + b, 0);
  $("#rubricTotal").textContent = `${total} / ${RUBRIC_MAX}`;
}

function closeDrawer() {
  const drawer = $("#drawer");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  setTimeout(() => { $("#scrim").hidden = true; }, 240);
}

/* Apply a new score into the data + the matrix cell */
function applyScore(studentId, assignmentId, newScore) {
  const student = STUDENTS.find((s) => s.id === studentId);
  if (!student) return;
  student.scores[assignmentId] = newScore;

  const cell = $(`.cell[data-student="${studentId}"][data-assignment="${assignmentId}"]`);
  if (cell) {
    const td = cell.closest("td");
    const fresh = document.createElement("template");
    fresh.innerHTML = cellMarkup(student, ASSIGNMENTS.find((a) => a.id === assignmentId)).trim();
    const newTd = fresh.content.firstChild;
    td.replaceWith(newTd);
    const newCell = newTd.querySelector(".cell");
    newCell.classList.add("cell--flash");
    setTimeout(() => newCell.classList.remove("cell--flash"), 600);
  }
  refreshAverages();
}

/* ---------------- Events ---------------- */

function init() {
  renderAll();

  $("#cohort").addEventListener("change", (e) => {
    cohortFilter = e.target.value;
    renderAll();
  });

  $("#search").addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderAll();
  });

  // open drawer from any cell
  $("#matrix").addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (cell) openDrawer(cell.dataset.student, cell.dataset.assignment);
  });

  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#scrim").hidden) closeDrawer();
  });

  // rubric point buttons (delegated)
  $("#rubric").addEventListener("click", (e) => {
    const btn = e.target.closest(".pt-btn");
    if (!btn) return;
    const rid = btn.dataset.rubric;
    const pts = Number(btn.dataset.pts);
    drawerState.rubricScores[rid] = pts;
    btn.parentElement.querySelectorAll(".pt-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateRubricTotal();
  });

  // use rubric total as a suggested grade (scaled to 100)
  $("#useRubric").addEventListener("click", () => {
    const total = Object.values(drawerState.rubricScores).reduce((a, b) => a + b, 0);
    if (!total) { toast("Score the rubric first"); return; }
    const grade = Math.round((total / RUBRIC_MAX) * 100);
    $("#gradeInput").value = grade;
    toast(`Suggested grade: ${grade}`);
  });

  // save grade
  $("#saveGrade").addEventListener("click", () => {
    const raw = $("#gradeInput").value;
    const grade = Number(raw);
    if (raw === "" || Number.isNaN(grade) || grade < 0 || grade > 100) {
      toast("Enter a grade from 0 to 100");
      $("#gradeInput").focus();
      return;
    }
    applyScore(drawerState.studentId, drawerState.assignmentId, Math.round(grade));
    const name = STUDENTS.find((s) => s.id === drawerState.studentId).name.split(" ")[0];
    closeDrawer();
    toast(`Saved ${Math.round(grade)} for ${name}`);
  });

  // mark missing
  $("#markMissing").addEventListener("click", () => {
    applyScore(drawerState.studentId, drawerState.assignmentId, null);
    closeDrawer();
    toast("Marked as missing");
  });
}

document.addEventListener("DOMContentLoaded", init);
