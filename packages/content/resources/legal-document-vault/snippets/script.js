(function () {
  "use strict";

  var docs = [
    { name: "Stock Purchase Agreement", sub: "v4 — executed", type: "Agreement", ext: "pdf", matter: "Series B Financing", date: "2026-06-18", status: "Signed" },
    { name: "Investor Rights Agreement", sub: "Counsel review", type: "Agreement", ext: "doc", matter: "Series B Financing", date: "2026-06-15", status: "Pending" },
    { name: "Cap Table — Post Series B", sub: "Schedule A", type: "Schedule", ext: "xls", matter: "Series B Financing", date: "2026-06-12", status: "Shared" },
    { name: "Patent Assignment — Filing 8842", sub: "USPTO confirmation", type: "Filing", ext: "pdf", matter: "IP Portfolio", date: "2026-06-09", status: "Signed" },
    { name: "Trademark Application — MERIDIAN", sub: "Class 9, 42", type: "Filing", ext: "doc", matter: "IP Portfolio", date: "2026-06-04", status: "Pending" },
    { name: "Executive Offer Letter — D. Okafor", sub: "VP Engineering", type: "Letter", ext: "sig", matter: "Employment", date: "2026-05-29", status: "Signed" },
    { name: "Employee Handbook 2026", sub: "Final draft", type: "Policy", ext: "pdf", matter: "Employment", date: "2026-05-22", status: "Shared" },
    { name: "Master Services Agreement — Lumio", sub: "Redline 3", type: "Agreement", ext: "doc", matter: "Vendor Contracts", date: "2026-05-19", status: "Pending" },
    { name: "NDA — Greystone Partners", sub: "Mutual", type: "Agreement", ext: "sig", matter: "Vendor Contracts", date: "2026-05-11", status: "Signed" },
    { name: "Board Consent — May 2026", sub: "Unanimous written", type: "Resolution", ext: "pdf", matter: "Corporate Governance", date: "2026-05-06", status: "Signed" },
    { name: "Bylaws — Amended & Restated", sub: "Exhibit C", type: "Policy", ext: "doc", matter: "Corporate Governance", date: "2026-04-28", status: "Shared" }
  ];

  var rows = document.getElementById("rows");
  var empty = document.getElementById("empty");
  var search = document.getElementById("search");
  var matter = document.getElementById("matter");
  var sortBtns = document.querySelectorAll(".sort");
  var drop = document.getElementById("drop");
  var fileInput = document.getElementById("file");

  var sortKey = "date";
  var sortDir = -1; // newest first
  var statusOrder = { Pending: 0, Shared: 1, Signed: 2 };

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  var viewIco = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  var dlIco = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 21h14"/></svg>';

  function render() {
    var q = search.value.trim().toLowerCase();
    var m = matter.value;

    var list = docs.filter(function (d) {
      var matchQ = !q || (d.name + " " + d.matter + " " + d.type).toLowerCase().indexOf(q) !== -1;
      var matchM = !m || d.matter === m;
      return matchQ && matchM;
    });

    list.sort(function (a, b) {
      var av, bv;
      if (sortKey === "name") { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (sortKey === "status") { av = statusOrder[a.status]; bv = statusOrder[b.status]; }
      else { av = a.date; bv = b.date; }
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });

    rows.innerHTML = "";
    list.forEach(function (d) {
      var tr = document.createElement("tr");
      var st = d.status.toLowerCase();
      tr.innerHTML =
        '<td><div class="doc-cell">' +
          '<span class="ftype ' + d.ext + '">' + d.ext.toUpperCase() + '</span>' +
          '<span><span class="doc-name">' + d.name + '</span><br>' +
          '<span class="doc-sub">' + d.sub + '</span></span>' +
        '</div></td>' +
        '<td class="col-type">' + d.type + '</td>' +
        '<td class="col-matter">' + d.matter + '</td>' +
        '<td>' + fmtDate(d.date) + '</td>' +
        '<td><span class="badge ' + st + '">' + d.status + '</span></td>' +
        '<td class="col-act"><div class="actions">' +
          '<button class="act" type="button" aria-label="View ' + d.name + '">' + viewIco + '</button>' +
          '<button class="act" type="button" aria-label="Download ' + d.name + '">' + dlIco + '</button>' +
        '</div></td>';
      rows.appendChild(tr);
    });

    empty.hidden = list.length !== 0;
    updateStats();
  }

  function updateStats() {
    document.getElementById("stat-total").textContent = docs.length;
    document.getElementById("stat-signed").textContent = docs.filter(function (d) { return d.status === "Signed"; }).length;
    document.getElementById("stat-pending").textContent = docs.filter(function (d) { return d.status === "Pending"; }).length;
  }

  function setArrows() {
    sortBtns.forEach(function (b) {
      var arr = b.querySelector(".arr");
      if (b.dataset.key === sortKey) arr.textContent = sortDir === 1 ? "▲" : "▼";
      else arr.textContent = "";
    });
  }

  // events
  search.addEventListener("input", render);
  matter.addEventListener("change", render);

  sortBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.dataset.key;
      if (sortKey === key) sortDir *= -1;
      else { sortKey = key; sortDir = key === "date" ? -1 : 1; }
      setArrows();
      render();
    });
  });

  // view / download feedback (event delegation)
  rows.addEventListener("click", function (e) {
    var btn = e.target.closest(".act");
    if (!btn) return;
    var orig = btn.getAttribute("aria-label");
    btn.style.borderColor = "var(--gold)";
    btn.style.background = "var(--gold-soft)";
    setTimeout(function () { btn.style.borderColor = ""; btn.style.background = ""; }, 320);
    void orig;
  });

  // upload dropzone (UI only)
  function addUpload(name) {
    var ext = /\.pdf$/i.test(name) ? "pdf" : /\.xls/i.test(name) ? "xls" : "doc";
    docs.unshift({
      name: name.replace(/\.[^.]+$/, ""),
      sub: "Uploaded just now",
      type: "Upload",
      ext: ext,
      matter: matter.value || "Series B Financing",
      date: new Date().toISOString().slice(0, 10),
      status: "Pending"
    });
    render();
  }

  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("drag"); });
  });
  drop.addEventListener("drop", function (e) {
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length) {
      Array.prototype.forEach.call(files, function (f) { addUpload(f.name); });
    } else {
      addUpload("New Document.pdf");
    }
  });
  fileInput.addEventListener("change", function () {
    Array.prototype.forEach.call(fileInput.files, function (f) { addUpload(f.name); });
    fileInput.value = "";
  });

  setArrows();
  render();
})();
