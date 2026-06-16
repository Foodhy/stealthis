(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var empty = document.getElementById("empty");
  var createBtn = document.getElementById("createBtn");
  var importBtn = document.getElementById("importBtn");
  var form = document.getElementById("createForm");
  var projName = document.getElementById("projName");
  var swatches = document.getElementById("swatches");
  var formCreate = document.getElementById("formCreate");
  var formCancel = document.getElementById("formCancel");
  var cancelCreate = document.getElementById("cancelCreate");
  var list = document.getElementById("projectList");
  var toastWrap = document.getElementById("toastWrap");

  var accent = "#5b5bf0";

  /* ---------- Toast helper ---------- */
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast";
    var ico = kind === "info"
      ? '<path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>'
      : '<path d="M5 12l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    t.innerHTML =
      '<span class="t-ico"><svg viewBox="0 0 24 24" width="18" height="18" fill="none">' +
      ico + "</svg></span><span>" + msg + "</span>";
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      setTimeout(function () { t.remove(); }, 260);
    }, 2400);
  }

  /* ---------- Variant + layout switcher ---------- */
  function bindSeg(attr, ariaKey) {
    var btns = document.querySelectorAll("[data-" + attr + "]");
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest(".seg");
        Array.prototype.forEach.call(group.querySelectorAll(".seg-btn"), function (b) {
          b.classList.remove("is-active");
          if (ariaKey) b.setAttribute(ariaKey, "false");
        });
        btn.classList.add("is-active");
        if (ariaKey) btn.setAttribute(ariaKey, "true");
        stage.setAttribute("data-" + attr, btn.getAttribute("data-" + attr));
      });
    });
  }
  bindSeg("variant", "aria-selected");
  bindSeg("layout", "aria-pressed");

  /* ---------- Reveal create form ---------- */
  function openForm() {
    empty.style.display = "none";
    form.hidden = false;
    projName.value = "";
    setAccent("#5b5bf0", swatches.querySelector(".swatch"));
    requestAnimationFrame(function () { projName.focus(); });
  }
  function closeForm(refocus) {
    form.hidden = true;
    empty.style.display = "";
    if (refocus) createBtn.focus();
  }

  createBtn.addEventListener("click", openForm);
  cancelCreate.addEventListener("click", function () { closeForm(true); });
  formCancel.addEventListener("click", function () { closeForm(true); });

  importBtn.addEventListener("click", function () {
    toast("Import wizard would open here", "info");
  });

  /* ---------- Accent swatches ---------- */
  function setAccent(color, el) {
    accent = color;
    Array.prototype.forEach.call(swatches.querySelectorAll(".swatch"), function (s) {
      s.classList.remove("is-active");
      s.setAttribute("aria-checked", "false");
    });
    if (el) { el.classList.add("is-active"); el.setAttribute("aria-checked", "true"); }
  }
  swatches.addEventListener("click", function (e) {
    var sw = e.target.closest(".swatch");
    if (!sw) return;
    setAccent(sw.getAttribute("data-color"), sw);
  });

  /* ---------- Initials helper ---------- */
  function initials(name) {
    var parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "P";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  /* ---------- Create a project (faux) ---------- */
  function addProject(name, color) {
    list.hidden = false;
    var li = document.createElement("li");
    li.className = "project-card";
    li.innerHTML =
      '<span class="pc-mark" style="background:' + color + '">' + initials(name) + "</span>" +
      '<span class="pc-body">' +
        '<span class="pc-name"></span>' +
        '<span class="pc-meta"><span class="pc-badge">Active</span> Just now &middot; 0 boards</span>' +
      "</span>";
    li.querySelector(".pc-name").textContent = name;
    list.insertBefore(li, list.firstChild);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = projName.value.trim();
    if (!name) {
      projName.focus();
      projName.style.borderColor = "var(--danger)";
      toast("Give your project a name first", "info");
      return;
    }
    projName.style.borderColor = "";
    addProject(name, accent);
    form.hidden = true;
    empty.style.display = "";
    toast('Created "' + name + '"');
    createBtn.focus();
  });

  projName.addEventListener("input", function () {
    if (projName.value.trim()) projName.style.borderColor = "";
  });

  /* ---------- Esc closes the form ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !form.hidden) {
      closeForm(true);
    }
  });
})();
