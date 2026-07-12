(function () {
  "use strict";

  var form = document.getElementById("briefForm");
  var summary = document.getElementById("summary");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---- Running timecode in hero ---- */
  var tcEl = document.getElementById("timecode");
  var frame = 0;
  setInterval(function () {
    frame = (frame + 1) % (60 * 60 * 24);
    var f = frame % 24;
    var totalSec = Math.floor(frame / 24);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600) % 24;
    tcEl.textContent = [h, m, s, f].map(function (n) {
      return String(n).padStart(2, "0");
    }).join(":");
  }, 1000 / 24);

  /* ---- Goal character counter ---- */
  var goal = document.getElementById("goal");
  var goalCount = document.getElementById("goalCount");
  goal.addEventListener("input", function () {
    goalCount.textContent = goal.value.length;
  });

  /* ---- Deliverables tally ---- */
  var delCount = document.getElementById("delCount");
  function updateTally() {
    var n = form.querySelectorAll('input[name="deliverable"]:checked').length;
    delCount.textContent = n;
  }
  form.querySelectorAll('input[name="deliverable"]').forEach(function (cb) {
    cb.addEventListener("change", updateTally);
  });

  /* ---- Project type -> estimate chip ---- */
  var estChip = document.getElementById("estChip");
  var estVal = document.getElementById("estVal");
  form.querySelectorAll('input[name="ptype"]').forEach(function (r) {
    r.addEventListener("change", function () {
      estVal.textContent = r.getAttribute("data-est");
      estChip.hidden = false;
      clearError("ptype");
    });
  });

  /* ---- Reference link add / remove ---- */
  var refList = document.getElementById("refList");
  document.getElementById("addRef").addEventListener("click", function () {
    if (refList.children.length >= 6) {
      toast("Up to 6 references — that's plenty!");
      return;
    }
    var row = document.createElement("div");
    row.className = "ref-row";
    row.innerHTML =
      '<input type="url" name="reference" placeholder="https://… another reference" />' +
      '<button type="button" class="ref-del" aria-label="Remove reference">✕</button>';
    refList.appendChild(row);
    row.querySelector("input").focus();
  });
  refList.addEventListener("click", function (e) {
    if (e.target.classList.contains("ref-del")) {
      if (refList.children.length > 1) {
        e.target.closest(".ref-row").remove();
      } else {
        e.target.previousElementSibling.value = "";
        toast("Cleared the reference field.");
      }
    }
  });

  /* ---- Validation helpers ---- */
  function setError(name, show) {
    var msg = form.querySelector('.err[data-for="' + name + '"]');
    if (msg) msg.hidden = !show;
    var field = form.querySelector('[name="' + name + '"]');
    if (field) {
      var wrap = field.closest(".field");
      if (wrap) wrap.classList.toggle("invalid", show);
    }
  }
  function clearError(name) { setError(name, false); }

  ["goal", "audience", "name", "email", "budget", "deadline"].forEach(function (n) {
    var el = form.querySelector('[name="' + n + '"]');
    if (el) el.addEventListener("input", function () { clearError(n); });
    if (el) el.addEventListener("change", function () { clearError(n); });
  });

  function validate() {
    var ok = true;
    var firstBad = null;

    function fail(name) {
      setError(name, true);
      ok = false;
      if (!firstBad) firstBad = form.querySelector('[name="' + name + '"]') ||
        form.querySelector('.err[data-for="' + name + '"]');
    }

    if (!form.querySelector('input[name="ptype"]:checked')) fail("ptype");
    if (!goal.value.trim()) fail("goal");
    if (!form.audience.value.trim()) fail("audience");
    if (!form.budget.value) fail("budget");
    if (!form.deadline.value) fail("deadline");
    if (!form.name.value.trim()) fail("name");
    var email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email");

    if (!ok && firstBad) {
      firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      if (firstBad.focus) firstBad.focus({ preventScroll: true });
    }
    return ok;
  }

  /* ---- Build summary ---- */
  var lastSummaryText = "";

  function row(label, valueHTML) {
    return '<div class="sum-row"><dt>' + label + "</dt><dd>" + valueHTML + "</dd></div>";
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function buildSummary() {
    var ptype = form.querySelector('input[name="ptype"]:checked');
    var deliverables = Array.prototype.map.call(
      form.querySelectorAll('input[name="deliverable"]:checked'),
      function (c) { return c.value; }
    );
    var refs = Array.prototype.map.call(
      form.querySelectorAll('input[name="reference"]'),
      function (i) { return i.value.trim(); }
    ).filter(Boolean);

    var id = "#BR-" + String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById("sumId").textContent = id;

    var deadline = form.deadline.value
      ? new Date(form.deadline.value + "T00:00").toLocaleDateString(undefined, {
          year: "numeric", month: "long", day: "numeric"
        })
      : "—";

    var badgesHTML = deliverables.length
      ? '<div class="badges">' + deliverables.map(function (d) {
          return '<span class="badge">' + esc(d) + "</span>";
        }).join("") + "</div>"
      : '<span style="color:var(--muted)">None selected</span>';

    var refsHTML = refs.length
      ? refs.map(function (r) {
          return '<a href="' + esc(r) + '" target="_blank" rel="noopener">' + esc(r) + "</a>";
        }).join("<br>")
      : '<span style="color:var(--muted)">—</span>';

    var html = "";
    html += row("Project type", esc(ptype.value) + ' <span class="badge">' + esc(ptype.getAttribute("data-est")) + "</span>");
    html += row("Goal", esc(goal.value.trim()));
    html += row("Audience", esc(form.audience.value.trim()));
    html += row("Deliverables", badgesHTML);
    html += row("Budget", esc(form.budget.value));
    html += row("Deadline", esc(deadline));
    html += row("References", refsHTML);
    html += row("Contact", esc(form.name.value.trim()) + " · " + esc(form.email.value.trim()));

    document.getElementById("sumGrid").innerHTML = html;

    lastSummaryText =
      "PROJECT BRIEF " + id + "\n" +
      "Type: " + ptype.value + " (" + ptype.getAttribute("data-est") + ")\n" +
      "Goal: " + goal.value.trim() + "\n" +
      "Audience: " + form.audience.value.trim() + "\n" +
      "Deliverables: " + (deliverables.join(", ") || "None") + "\n" +
      "Budget: " + form.budget.value + "\n" +
      "Deadline: " + deadline + "\n" +
      "References: " + (refs.join(", ") || "None") + "\n" +
      "Contact: " + form.name.value.trim() + " <" + form.email.value.trim() + ">";
  }

  /* ---- Submit ---- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields.");
      return;
    }
    buildSummary();
    form.hidden = true;
    summary.hidden = false;
    summary.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Brief sent — we'll reply within 24h.");
  });

  /* ---- Summary actions ---- */
  document.getElementById("editBtn").addEventListener("click", function () {
    summary.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("copyBtn").addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastSummaryText).then(function () {
        toast("Summary copied to clipboard.");
      }, function () {
        toast("Copy failed — select the text manually.");
      });
    } else {
      toast("Clipboard not available in this browser.");
    }
  });
})();
