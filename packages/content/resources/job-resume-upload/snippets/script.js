(function () {
  "use strict";

  // ---- elements ----
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");

  const fileChip = document.getElementById("fileChip");
  const fcName = document.getElementById("fcName");
  const fcMeta = document.getElementById("fcMeta");
  const fcStatus = document.getElementById("fcStatus");
  const fcBar = document.getElementById("fcBar");
  const fcRemove = document.getElementById("fcRemove");
  const progressEl = fileChip.querySelector(".progress");

  const pvBadge = document.getElementById("pvBadge");
  const pvEmpty = document.getElementById("pvEmpty");
  const pvParsing = document.getElementById("pvParsing");
  const pvForm = document.getElementById("pvForm");
  const parseLabel = document.getElementById("parseLabel");
  const parseChecks = pvParsing.querySelectorAll("[data-check]");

  const fName = document.getElementById("fName");
  const fTitle = document.getElementById("fTitle");
  const fEmail = document.getElementById("fEmail");
  const fPhone = document.getElementById("fPhone");
  const fLocation = document.getElementById("fLocation");
  const skillBox = document.getElementById("skillBox");
  const skillInput = document.getElementById("skillInput");
  const skillCount = document.getElementById("skillCount");
  const expList = document.getElementById("expList");
  const reuploadBtn = document.getElementById("reuploadBtn");
  const toastWrap = document.getElementById("toastWrap");

  let timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; }

  // ---- toast ----
  function toast(msg, isErr) {
    const el = document.createElement("div");
    el.className = "toast" + (isErr ? " err" : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 240);
    }, 2400);
  }

  // ---- fictional parsed profiles (keyed loosely by file name) ----
  const PROFILES = {
    "Amara Okafor": {
      name: "Amara Okafor",
      title: "Senior Frontend Engineer",
      email: "amara.okafor@mailspring.dev",
      phone: "+1 (415) 555-0184",
      location: "Oakland, CA · Open to remote",
      skills: ["TypeScript", "React", "Astro", "CSS Architecture", "Accessibility", "Design Systems", "Vitest"],
      experience: [
        { role: "Senior Frontend Engineer", co: "Lumen Health", dates: "2022 — Present", color: "#2563eb" },
        { role: "Frontend Engineer", co: "Brightpath Labs", dates: "2019 — 2022", color: "#9333ea" },
        { role: "UI Developer", co: "Cobalt Studio", dates: "2017 — 2019", color: "#0891b2" }
      ]
    },
    "Diego Fuentes": {
      name: "Diego Fuentes",
      title: "Full-Stack Engineer",
      email: "d.fuentes@postbox.io",
      phone: "+34 612 55 0142",
      location: "Madrid, ES · Hybrid",
      skills: ["Node.js", "React", "PostgreSQL", "GraphQL", "AWS", "Docker"],
      experience: [
        { role: "Full-Stack Engineer", co: "Mercado Verde", dates: "2021 — Present", color: "#16a34a" },
        { role: "Backend Engineer", co: "Tarifa Tech", dates: "2018 — 2021", color: "#d97706" }
      ]
    }
  };
  const DEFAULT_KEY = "Amara Okafor";

  function pickProfile(fileName) {
    const lower = (fileName || "").toLowerCase();
    if (lower.includes("diego") || lower.includes("fuentes")) return PROFILES["Diego Fuentes"];
    return PROFILES[DEFAULT_KEY];
  }

  // ---- state view switching ----
  function showEmpty() {
    pvEmpty.hidden = false;
    pvParsing.hidden = true;
    pvForm.hidden = true;
    setBadge("Awaiting upload", "");
  }
  function showParsing() {
    pvEmpty.hidden = true;
    pvForm.hidden = true;
    pvParsing.hidden = false;
    parseChecks.forEach((c) => c.classList.remove("done"));
    setBadge("Parsing…", "parsing");
  }
  function showForm() {
    pvEmpty.hidden = true;
    pvParsing.hidden = true;
    pvForm.hidden = false;
    setBadge("Ready to review", "ready");
  }
  function setBadge(text, cls) {
    pvBadge.textContent = text;
    pvBadge.className = "badge-empty" + (cls ? " " + cls : "");
  }

  // ---- file size formatting ----
  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return "1.2 MB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
  function extOf(name) {
    const m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toUpperCase() : "PDF";
  }

  // ---- validation ----
  const ALLOWED = ["pdf", "doc", "docx"];
  function validFile(name, size) {
    const ext = (extOf(name) || "").toLowerCase();
    if (ALLOWED.indexOf(ext) === -1) {
      toast("Unsupported file — use PDF, DOC or DOCX", true);
      return false;
    }
    if (size && size > 5 * 1024 * 1024) {
      toast("File too large — 5 MB maximum", true);
      return false;
    }
    return true;
  }

  // ---- main flow ----
  function handleFile(meta) {
    clearTimers();
    const name = meta.name || "resume.pdf";
    const size = meta.size;

    if (!validFile(name, size)) return;

    // file chip
    fileChip.hidden = false;
    fcName.textContent = name;
    fcMeta.textContent = fmtSize(size);
    fileChip.querySelector(".fc-thumb").textContent = extOf(name);
    fcStatus.textContent = "Uploading…";
    fcStatus.classList.remove("done");
    fcBar.classList.remove("done");
    fcBar.style.width = "0%";

    // simulate upload progress
    let pct = 0;
    function step() {
      pct += Math.random() * 16 + 8;
      if (pct >= 100) {
        pct = 100;
        fcBar.style.width = "100%";
        progressEl.setAttribute("aria-valuenow", "100");
        fcStatus.textContent = "Uploaded";
        fcStatus.classList.add("done");
        fcBar.classList.add("done");
        later(() => runParse(name), 320);
        return;
      }
      fcBar.style.width = pct.toFixed(0) + "%";
      progressEl.setAttribute("aria-valuenow", pct.toFixed(0));
      later(step, 130);
    }
    later(step, 120);
  }

  function runParse(name) {
    showParsing();
    const labels = ["Reading document…", "Detecting sections…", "Extracting fields…"];
    let li = 0;
    function relabel() {
      if (li < labels.length) { parseLabel.textContent = labels[li++]; later(relabel, 520); }
    }
    relabel();

    const order = ["contact", "skills", "experience"];
    order.forEach((key, i) => {
      later(() => {
        const node = pvParsing.querySelector('[data-check="' + key + '"]');
        if (node) node.classList.add("done");
      }, 650 + i * 520);
    });

    later(() => {
      populate(pickProfile(name));
      showForm();
      toast("Resume parsed — review the details");
    }, 650 + order.length * 520 + 250);
  }

  // ---- populate preview ----
  let skills = [];
  function populate(p) {
    fName.value = p.name;
    fTitle.value = p.title;
    fEmail.value = p.email;
    fPhone.value = p.phone;
    fLocation.value = p.location;
    skills = p.skills.slice();
    renderSkills();
    renderExperience(p.experience);
  }

  function renderSkills() {
    skillBox.innerHTML = "";
    skills.forEach((s, idx) => {
      const el = document.createElement("span");
      el.className = "skill";
      el.innerHTML = '<span>' + escapeHtml(s) + '</span>';
      const x = document.createElement("button");
      x.type = "button";
      x.setAttribute("aria-label", "Remove " + s);
      x.textContent = "×";
      x.addEventListener("click", () => {
        skills.splice(idx, 1);
        renderSkills();
      });
      el.appendChild(x);
      skillBox.appendChild(el);
    });
    skillCount.textContent = "(" + skills.length + ")";
  }

  function renderExperience(items) {
    expList.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "exp-item";
      const initials = it.co.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      li.innerHTML =
        '<span class="exp-logo" style="background:' + it.color + '">' + initials + '</span>' +
        '<div class="exp-meta">' +
          '<div class="exp-role">' + escapeHtml(it.role) + '</div>' +
          '<div class="exp-co">' + escapeHtml(it.co) + '</div>' +
          '<div class="exp-dates">' + escapeHtml(it.dates) + '</div>' +
        '</div>';
      expList.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // ---- add skill ----
  skillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = skillInput.value.trim();
      if (!v) return;
      if (skills.some((s) => s.toLowerCase() === v.toLowerCase())) {
        toast("That skill is already listed", true);
        return;
      }
      skills.push(v);
      skillInput.value = "";
      renderSkills();
    }
  });

  // ---- reset / re-upload ----
  function reset() {
    clearTimers();
    fileChip.hidden = true;
    fileInput.value = "";
    skills = [];
    showEmpty();
  }
  fcRemove.addEventListener("click", () => { reset(); toast("File removed"); });
  reuploadBtn.addEventListener("click", () => {
    reset();
    dropzone.focus();
    toast("Ready for a new file");
  });

  // ---- form submit ----
  pvForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!fName.value.trim() || !fEmail.value.trim()) {
      toast("Name and email are required", true);
      return;
    }
    toast("Saved — continuing to review");
  });

  // ---- input triggers ----
  browseBtn.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("click", (e) => {
    if (e.target.closest(".linkbtn")) return;
    fileInput.click();
  });
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (f) handleFile({ name: f.name, size: f.size });
  });

  // ---- sample ----
  document.querySelectorAll("[data-sample]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const who = btn.getAttribute("data-sample");
      const file = who === "Diego Fuentes" ? "Diego_Fuentes_Resume.pdf" : "Amara_Okafor_Resume.pdf";
      handleFile({ name: file, size: 1.24 * 1024 * 1024 });
    });
  });

  // ---- drag & drop ----
  let dragDepth = 0;
  ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); });
  });
  dropzone.addEventListener("dragenter", () => { dragDepth++; dropzone.classList.add("dragging"); });
  dropzone.addEventListener("dragleave", () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) dropzone.classList.remove("dragging"); });
  dropzone.addEventListener("drop", (e) => {
    dragDepth = 0;
    dropzone.classList.remove("dragging");
    const dt = e.dataTransfer;
    const f = dt && dt.files && dt.files[0];
    if (f) {
      handleFile({ name: f.name, size: f.size });
    } else {
      // no real file (e.g. dragging text) — fall back to a sample so the demo still works
      handleFile({ name: "Amara_Okafor_Resume.pdf", size: 1.24 * 1024 * 1024 });
    }
  });
  // prevent the page from navigating when a file is dropped outside the zone
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => e.preventDefault());

  // init
  showEmpty();
})();
