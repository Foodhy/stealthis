/* Lumina Learn — Course Catalog (vanilla JS) */
(function () {
  "use strict";

  const COURSES = [
    { id: 1, title: "Foundations of UX Research", instructor: "Priya Nandakumar", cat: "Design", level: "Beginner", hours: 4.5, rating: 4.8, students: 12840, price: 0, emoji: "🔍", grad: "linear-gradient(135deg,#eef0ff,#dfe4ff)", added: 12, progress: 35 },
    { id: 2, title: "Modern JavaScript from Scratch", instructor: "Diego Salazar", cat: "Development", level: "Beginner", hours: 9, rating: 4.9, students: 31205, price: 49, emoji: "⚡", grad: "linear-gradient(135deg,#fff5e0,#ffe9bf)", added: 30, progress: 0 },
    { id: 3, title: "Data Visualization with D3", instructor: "Hana Okafor", cat: "Data", level: "Intermediate", hours: 7.5, rating: 4.6, students: 8410, price: 59, emoji: "📊", grad: "linear-gradient(135deg,#e3fbf0,#c6f3df)", added: 5, progress: 0 },
    { id: 4, title: "Architecting Scalable APIs", instructor: "Marcus Feld", cat: "Development", level: "Advanced", hours: 14, rating: 4.7, students: 6720, price: 89, emoji: "🛠️", grad: "linear-gradient(135deg,#ffe9ec,#ffd6db)", added: 18, progress: 0 },
    { id: 5, title: "Design Systems in Figma", instructor: "Lena Brandt", cat: "Design", level: "Intermediate", hours: 6, rating: 4.9, students: 15330, price: 39, emoji: "🎨", grad: "linear-gradient(135deg,#f0eaff,#e2d7ff)", added: 2, progress: 68 },
    { id: 6, title: "Intro to Machine Learning", instructor: "Wei Zhang", cat: "Data", level: "Intermediate", hours: 16, rating: 4.5, students: 22190, price: 0, emoji: "🤖", grad: "linear-gradient(135deg,#e6f1ff,#d2e6ff)", added: 22, progress: 0 },
    { id: 7, title: "Brand Storytelling Essentials", instructor: "Amara Cole", cat: "Marketing", level: "Beginner", hours: 3.5, rating: 4.4, students: 5980, price: 29, emoji: "📣", grad: "linear-gradient(135deg,#fff0e8,#ffe0cf)", added: 9, progress: 0 },
    { id: 8, title: "Advanced CSS & Motion", instructor: "Theo Marchetti", cat: "Development", level: "Advanced", hours: 8.5, rating: 4.8, students: 11250, price: 45, emoji: "🌀", grad: "linear-gradient(135deg,#ecfbff,#d6f3ff)", added: 1, progress: 0 },
    { id: 9, title: "Product Analytics Playbook", instructor: "Sofia Adeyemi", cat: "Data", level: "Beginner", hours: 4, rating: 4.3, students: 4310, price: 0, emoji: "📈", grad: "linear-gradient(135deg,#eafbef,#d2f3dc)", added: 14, progress: 12 },
    { id: 10, title: "Cloud Infrastructure with K8s", instructor: "Raj Mehrotra", cat: "Development", level: "Advanced", hours: 18, rating: 4.6, students: 9870, price: 99, emoji: "☁️", grad: "linear-gradient(135deg,#eef0ff,#dbe0ff)", added: 26, progress: 0 },
    { id: 11, title: "Color Theory for Screens", instructor: "Lena Brandt", cat: "Design", level: "Beginner", hours: 2.5, rating: 4.7, students: 7640, price: 0, emoji: "🌈", grad: "linear-gradient(135deg,#fff0f6,#ffd9ec)", added: 7, progress: 0 },
    { id: 12, title: "Growth Marketing Tactics", instructor: "Amara Cole", cat: "Marketing", level: "Intermediate", hours: 5.5, rating: 4.5, students: 6420, price: 55, emoji: "🚀", grad: "linear-gradient(135deg,#fff6e0,#ffe7b3)", added: 11, progress: 0 }
  ];

  // ----- state -----
  const state = {
    q: "",
    level: "all",
    categories: new Set(),
    duration: "all",
    price: "all",
    enrolledOnly: false,
    sort: "popular"
  };
  // track enrolled ids (seed from any with progress > 0)
  const enrolled = new Set(COURSES.filter(c => c.progress > 0).map(c => c.id));

  // ----- el refs -----
  const $ = (s, r = document) => r.querySelector(s);
  const grid = $("#grid");
  const empty = $("#empty");
  const resultCount = $("#resultCount");
  const activeChips = $("#activeChips");
  const toastEl = $("#toast");

  // ----- toast helper -----
  let toastTimer;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  // ----- build category checkboxes -----
  const cats = [...new Set(COURSES.map(c => c.cat))].sort();
  const catBox = $("#categoryChecks");
  cats.forEach(cat => {
    const n = COURSES.filter(c => c.cat === cat).length;
    const label = document.createElement("label");
    label.innerHTML =
      `<input type="checkbox" value="${cat}" /> <span>${cat}</span><span class="count">${n}</span>`;
    label.querySelector("input").addEventListener("change", e => {
      e.target.checked ? state.categories.add(cat) : state.categories.delete(cat);
      render();
    });
    catBox.appendChild(label);
  });

  // ----- helpers -----
  const fmtPrice = p => (p === 0 ? "Free" : "$" + p);
  const fmtStudents = n => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : "" + n);
  const inDuration = h =>
    state.duration === "all" ||
    (state.duration === "short" && h < 5) ||
    (state.duration === "mid" && h >= 5 && h <= 12) ||
    (state.duration === "long" && h > 12);

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = COURSES.filter(c => {
      if (q && !(c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q))) return false;
      if (state.level !== "all" && c.level !== state.level) return false;
      if (state.categories.size && !state.categories.has(c.cat)) return false;
      if (!inDuration(c.hours)) return false;
      if (state.price === "free" && c.price !== 0) return false;
      if (state.price === "paid" && c.price === 0) return false;
      if (state.enrolledOnly && !enrolled.has(c.id)) return false;
      return true;
    });

    list.sort((a, b) => {
      switch (state.sort) {
        case "rating": return b.rating - a.rating;
        case "newest": return a.added - b.added;
        case "duration": return a.hours - b.hours;
        case "price": return a.price - b.price;
        default: return b.students - a.students; // popular
      }
    });
    return list;
  }

  function initials(name) {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  function cardHTML(c) {
    const isEnrolled = enrolled.has(c.id);
    const prog = isEnrolled && c.progress > 0
      ? `<div class="progress">
           <div class="progress__label"><span>In progress</span><span>${c.progress}%</span></div>
           <div class="bar"><i style="width:${c.progress}%"></i></div>
         </div>`
      : "";
    const cta = isEnrolled
      ? `<button class="btn btn--enrolled" disabled>Enrolled ✓</button>`
      : `<button class="btn btn--primary" data-enroll="${c.id}">Enroll</button>`;
    return `
      <article class="card" data-id="${c.id}">
        <div class="thumb" style="background:${c.grad}">
          <span class="thumb__emoji" aria-hidden="true">${c.emoji}</span>
          <span class="level-pill" data-level="${c.level}">${c.level}</span>
        </div>
        <div class="card__body">
          <span class="card__cat">${c.cat}</span>
          <h3 class="card__title">${c.title}</h3>
          <p class="card__instr"><span class="dot" aria-hidden="true">${initials(c.instructor)}</span>${c.instructor}</p>
          <div class="card__meta">
            <span class="rating"><span class="star">★</span>${c.rating.toFixed(1)}</span>
            <span class="sep">·</span>
            <span>${fmtStudents(c.students)} learners</span>
            <span class="sep">·</span>
            <span>${c.hours} hrs</span>
          </div>
          ${prog}
          <div class="card__foot">
            <span class="price ${c.price === 0 ? "free" : ""}">${fmtPrice(c.price)}</span>
            ${cta}
          </div>
        </div>
      </article>`;
  }

  function chipsHTML() {
    const chips = [];
    if (state.q.trim()) chips.push(["q", `“${state.q.trim()}”`]);
    if (state.level !== "all") chips.push(["level", state.level]);
    state.categories.forEach(c => chips.push(["cat:" + c, c]));
    if (state.duration !== "all") {
      const map = { short: "Under 5 hrs", mid: "5–12 hrs", long: "12 hrs+" };
      chips.push(["duration", map[state.duration]]);
    }
    if (state.price !== "all") chips.push(["price", state.price === "free" ? "Free" : "Paid"]);
    if (state.enrolledOnly) chips.push(["enrolled", "Enrolled only"]);

    activeChips.innerHTML = chips
      .map(([key, label]) => `<span class="chip">${label}<button type="button" data-chip="${key}" aria-label="Remove ${label} filter">×</button></span>`)
      .join("");
  }

  function clearChip(key) {
    if (key === "q") { state.q = ""; $("#search").value = ""; }
    else if (key === "level") { state.level = "all"; syncLevelPills(); }
    else if (key.startsWith("cat:")) {
      const cat = key.slice(4);
      state.categories.delete(cat);
      const cb = [...catBox.querySelectorAll("input")].find(i => i.value === cat);
      if (cb) cb.checked = false;
    }
    else if (key === "duration") { state.duration = "all"; checkRadio("duration", "all"); }
    else if (key === "price") { state.price = "all"; checkRadio("price", "all"); }
    else if (key === "enrolled") { state.enrolledOnly = false; $("#enrolledOnly").checked = false; }
    render();
  }

  function render() {
    const list = filtered();
    resultCount.textContent = list.length;
    chipsHTML();
    if (list.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = list.map(cardHTML).join("");
    }
  }

  // ----- sync UI helpers -----
  function syncLevelPills() {
    document.querySelectorAll('[data-filter="level"] .pill').forEach(p => {
      const on = p.dataset.value === state.level;
      p.classList.toggle("is-on", on);
      p.setAttribute("aria-pressed", String(on));
    });
  }
  function checkRadio(name, value) {
    const r = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (r) r.checked = true;
  }

  // ----- events -----
  let searchTimer;
  $("#search").addEventListener("input", e => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => { state.q = v; render(); }, 120);
  });

  document.querySelectorAll('[data-filter="level"] .pill').forEach(p => {
    p.addEventListener("click", () => { state.level = p.dataset.value; syncLevelPills(); render(); });
  });

  document.querySelectorAll('[data-filter="duration"] input').forEach(r =>
    r.addEventListener("change", e => { state.duration = e.target.value; render(); }));
  document.querySelectorAll('[data-filter="price"] input').forEach(r =>
    r.addEventListener("change", e => { state.price = e.target.value; render(); }));

  $("#enrolledOnly").addEventListener("change", e => { state.enrolledOnly = e.target.checked; render(); });

  $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

  function resetAll() {
    state.q = ""; state.level = "all"; state.categories.clear();
    state.duration = "all"; state.price = "all"; state.enrolledOnly = false;
    $("#search").value = "";
    syncLevelPills();
    checkRadio("duration", "all");
    checkRadio("price", "all");
    $("#enrolledOnly").checked = false;
    catBox.querySelectorAll("input").forEach(i => (i.checked = false));
    render();
  }
  $("#clearFilters").addEventListener("click", resetAll);
  $("#emptyReset").addEventListener("click", resetAll);

  // delegated: enroll buttons + chip removal
  grid.addEventListener("click", e => {
    const btn = e.target.closest("[data-enroll]");
    if (!btn) return;
    const id = Number(btn.dataset.enroll);
    const course = COURSES.find(c => c.id === id);
    enrolled.add(id);
    if (course.progress === 0) course.progress = 0; // freshly enrolled, not started
    toast(`Enrolled in <strong>${course.title}</strong> — happy learning!`);
    render();
  });

  activeChips.addEventListener("click", e => {
    const btn = e.target.closest("[data-chip]");
    if (btn) clearChip(btn.dataset.chip);
  });

  // ----- init -----
  render();
})();
