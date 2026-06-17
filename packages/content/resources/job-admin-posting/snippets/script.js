(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.innerHTML =
      '<span class="t-ico" aria-hidden="true">' +
      (kind === "ok" ? "✓" : "ℹ") +
      "</span><span>" +
      msg +
      "</span>";
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        el.remove();
      }, 260);
    }, 2600);
  }

  /* ---------- Elements ---------- */
  var form = document.getElementById("jobForm");
  var qList = document.getElementById("qList");
  var qEmpty = document.getElementById("qEmpty");
  var addQBtn = document.getElementById("addQBtn");

  var fTitle = document.getElementById("f-title");
  var fDept = document.getElementById("f-dept");
  var fType = document.getElementById("f-type");
  var fLocation = document.getElementById("f-location");
  var fRemote = document.getElementById("f-remote");
  var fSalMin = document.getElementById("f-salmin");
  var fSalMax = document.getElementById("f-salmax");
  var fSalPer = document.getElementById("f-salper");
  var fDesc = document.getElementById("f-desc");

  var pvTitle = document.getElementById("pv-title");
  var pvChips = document.getElementById("pv-chips");
  var pvDesc = document.getElementById("pv-desc");
  var pvScreening = document.getElementById("pv-screening");
  var pvQList = document.getElementById("pv-qlist");
  var pvStatus = document.getElementById("pv-status");
  var pvFoot = pvStatus.closest(".job-foot");
  var statusPill = document.getElementById("statusPill");

  var published = false;
  var qSeed = ["Why do you want to join Northbridge?", ""];
  var qCounter = 0;

  /* ---------- Screening questions ---------- */
  function syncQEmpty() {
    var has = qList.children.length > 0;
    qEmpty.hidden = has;
  }

  function addQuestion(text, required, type) {
    qCounter++;
    var li = document.createElement("li");
    li.className = "q-item";
    var idx = qList.children.length + 1;
    li.innerHTML =
      '<span class="q-handle" aria-hidden="true">' + idx + "</span>" +
      '<input class="q-text" type="text" value="" placeholder="Type your question…" aria-label="Question text" />' +
      '<button type="button" class="q-remove" aria-label="Remove question" title="Remove">×</button>' +
      '<div class="q-meta">' +
        '<select class="q-type" aria-label="Answer type">' +
          '<option value="short">Short answer</option>' +
          '<option value="long">Paragraph</option>' +
          '<option value="yesno">Yes / No</option>' +
        "</select>" +
        '<label class="q-required"><input type="checkbox" /> Required</label>' +
      "</div>";
    li.querySelector(".q-text").value = text || "";
    if (required) li.querySelector(".q-required input").checked = true;
    if (type) li.querySelector(".q-type").value = type;

    li.querySelector(".q-remove").addEventListener("click", function () {
      li.style.animation = "none";
      li.remove();
      renumber();
      syncQEmpty();
      renderPreview();
      toast("Question removed");
    });
    qList.appendChild(li);
    renumber();
    syncQEmpty();
    return li;
  }

  function renumber() {
    Array.prototype.forEach.call(qList.children, function (li, i) {
      li.querySelector(".q-handle").textContent = i + 1;
    });
  }

  addQBtn.addEventListener("click", function () {
    if (qList.children.length >= 8) {
      toast("Up to 8 screening questions");
      return;
    }
    var li = addQuestion("", false, "short");
    li.querySelector(".q-text").focus();
    renderPreview();
  });

  // live preview on edits inside question list
  qList.addEventListener("input", renderPreview);
  qList.addEventListener("change", renderPreview);

  /* ---------- Rich text mock ---------- */
  document.querySelectorAll(".rt-btn").forEach(function (btn) {
    btn.addEventListener("mousedown", function (e) {
      e.preventDefault(); // keep selection
    });
    btn.addEventListener("click", function () {
      var cmd = btn.dataset.cmd;
      var val = btn.dataset.val || null;
      fDesc.focus();
      try {
        document.execCommand(cmd, false, val);
      } catch (err) {
        /* no-op */
      }
      renderPreview();
    });
  });
  fDesc.addEventListener("input", renderPreview);

  /* ---------- Salary formatting ---------- */
  function fmtMoney(n) {
    return new Intl.NumberFormat("en-US").format(n);
  }
  function salaryText() {
    var min = parseInt(fSalMin.value, 10);
    var max = parseInt(fSalMax.value, 10);
    var per = fSalPer.value === "mo" ? "/mo" : "/yr";
    if (isNaN(min) && isNaN(max)) return "";
    if (isNaN(max) || max === min) return "€" + fmtMoney(min) + " " + per;
    if (isNaN(min)) return "Up to €" + fmtMoney(max) + " " + per;
    return "€" + fmtMoney(min) + "–€" + fmtMoney(max) + " " + per;
  }

  var icons = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    dept: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V8l8-5 8 5v12"/><path d="M9 20v-6h6v6"/></svg>',
  };

  function chip(cls, ico, text) {
    return '<span class="chip ' + cls + '">' + (ico ? icons[ico] || "" : "") + text + "</span>";
  }

  /* ---------- Render preview ---------- */
  function renderPreview() {
    pvTitle.textContent = fTitle.value.trim() || "Untitled role";

    var c = "";
    if (fLocation.value.trim()) c += chip("", "pin", fLocation.value.trim());
    if (fRemote.checked) c += chip("remote", null, "● Remote OK");
    c += chip("", "dept", fDept.value);
    c += chip("", "type", fType.value);
    var sal = salaryText();
    if (sal) c += chip("salary", null, sal);
    pvChips.innerHTML = c;

    pvDesc.innerHTML = fDesc.innerHTML;

    var rows = Array.prototype.map.call(qList.children, function (li) {
      return {
        text: li.querySelector(".q-text").value.trim(),
        required: li.querySelector(".q-required input").checked,
      };
    }).filter(function (q) { return q.text; });

    if (rows.length) {
      pvScreening.hidden = false;
      pvQList.innerHTML = rows.map(function (q) {
        return "<li>" + escapeHtml(q.text) + (q.required ? ' <span class="req">*</span>' : "") + "</li>";
      }).join("");
    } else {
      pvScreening.hidden = true;
      pvQList.innerHTML = "";
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  // live preview on all standard inputs
  [fTitle, fDept, fType, fLocation, fRemote, fSalMin, fSalMax, fSalPer].forEach(function (el) {
    el.addEventListener("input", renderPreview);
    el.addEventListener("change", renderPreview);
  });

  /* ---------- Bookmark toggle ---------- */
  var bookmark = document.getElementById("pvBookmark");
  bookmark.addEventListener("click", function () {
    var on = bookmark.getAttribute("aria-pressed") === "true";
    bookmark.setAttribute("aria-pressed", String(!on));
    toast(on ? "Removed from saved" : "Saved to your jobs");
  });

  document.getElementById("pvApply").addEventListener("click", function () {
    toast("This is a preview — applications are disabled");
  });

  /* ---------- Status / publish / draft ---------- */
  function setStatus(isPublished) {
    published = isPublished;
    if (isPublished) {
      statusPill.dataset.state = "published";
      statusPill.textContent = "Published";
      pvStatus.textContent = "Live — visible to candidates";
      pvFoot.classList.add("live");
    } else {
      statusPill.dataset.state = "draft";
      statusPill.textContent = "Draft";
      pvStatus.textContent = "Draft — not visible to candidates";
      pvFoot.classList.remove("live");
    }
  }

  document.getElementById("publishBtn").addEventListener("click", function () {
    if (!fTitle.value.trim()) {
      toast("Add a job title before publishing");
      fTitle.focus();
      return;
    }
    setStatus(true);
    toast("“" + fTitle.value.trim() + "” is now live", "ok");
  });

  document.getElementById("saveDraftBtn").addEventListener("click", function () {
    setStatus(false);
    toast("Draft saved", "ok");
  });

  /* ---------- Init ---------- */
  qSeed.forEach(function (t, i) {
    addQuestion(t, i === 0, i === 0 ? "long" : "short");
  });
  // remove the empty seed placeholder if blank
  Array.prototype.slice.call(qList.children).forEach(function (li) {
    if (!li.querySelector(".q-text").value.trim()) li.remove();
  });
  renumber();
  syncQEmpty();
  renderPreview();
})();
