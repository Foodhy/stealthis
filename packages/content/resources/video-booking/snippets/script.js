(function () {
  "use strict";

  var form = document.getElementById("bookingForm");
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var stepEls = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var btnBack = document.getElementById("btnBack");
  var btnNext = document.getElementById("btnNext");
  var btnConfirm = document.getElementById("btnConfirm");
  var TOTAL = panels.length; // 5
  var current = 1;

  var state = {
    ptype: null, ptypePrice: 0,
    date: null,
    pkg: null, pkgPrice: 0,
    addons: [] // {name, price}
  };

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, isErr) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("err", !!isErr);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  /* ---------- hero timecode clock ---------- */
  var clock = document.getElementById("heroClock");
  var frame = 0;
  setInterval(function () {
    frame = (frame + 1) % (24 * 60 * 60 * 24);
    var f = frame % 24;
    var totalSec = Math.floor(frame / 24);
    var s = totalSec % 60, m = Math.floor(totalSec / 60) % 60, h = Math.floor(totalSec / 3600) % 24;
    function p(x) { return String(x).padStart(2, "0"); }
    clock.textContent = p(h) + ":" + p(m) + ":" + p(s) + ":" + p(f);
  }, 42);

  /* ---------- step navigation ---------- */
  function showStep(n) {
    current = n;
    panels.forEach(function (p) {
      var pn = +p.getAttribute("data-panel");
      var active = pn === n;
      p.hidden = !active;
      p.classList.toggle("is-active", active);
    });
    stepEls.forEach(function (el) {
      var sn = +el.getAttribute("data-step");
      el.classList.toggle("is-active", sn === n);
      el.classList.toggle("is-done", sn < n);
    });
    btnBack.hidden = n === 1;
    btnNext.hidden = n === TOTAL;
    btnConfirm.hidden = n !== TOTAL;
    if (n === TOTAL) buildReview();
    document.querySelector(".panelwrap").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ---------- validation per step ---------- */
  function validateStep(n) {
    if (n === 1) {
      if (!state.ptype) { toast("Pick a project type to continue.", true); return false; }
      return true;
    }
    if (n === 2) {
      if (!state.date) { toast("Choose an available shoot date.", true); return false; }
      return true;
    }
    if (n === 3) {
      if (!state.pkg) { toast("Select a production package.", true); return false; }
      return true;
    }
    if (n === 4) return validateForm();
    return true;
  }

  function validateForm() {
    var reqs = [
      { id: "fName", msg: "Enter your name." },
      { id: "fEmail", msg: "Enter a valid email.", email: true },
      { id: "fLocation", msg: "Where's the shoot?" },
      { id: "fRuntime", msg: "Pick a runtime." }
    ];
    var firstBad = null;
    reqs.forEach(function (r) {
      var el = document.getElementById(r.id);
      var wrap = el.closest(".field");
      var errEl = wrap.querySelector(".err");
      var val = (el.value || "").trim();
      var bad = !val;
      if (!bad && r.email) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      wrap.classList.toggle("invalid", bad);
      errEl.textContent = bad ? r.msg : "";
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); toast("Fix the highlighted fields.", true); return false; }
    return true;
  }

  btnNext.addEventListener("click", function () {
    if (!validateStep(current)) return;
    if (current < TOTAL) showStep(current + 1);
  });
  btnBack.addEventListener("click", function () {
    if (current > 1) showStep(current - 1);
  });

  // allow clicking rail to jump backward to completed steps
  stepEls.forEach(function (el) {
    el.addEventListener("click", function () {
      var n = +el.getAttribute("data-step");
      if (n < current) showStep(n);
    });
  });

  /* ---------- step 1 : project type ---------- */
  form.querySelectorAll('input[name="ptype"]').forEach(function (r) {
    r.addEventListener("change", function () {
      state.ptype = r.value;
      state.ptypePrice = +r.getAttribute("data-price");
      updateSummary();
    });
  });

  /* ---------- step 3 : package + addons ---------- */
  form.querySelectorAll('input[name="pkg"]').forEach(function (r) {
    r.addEventListener("change", function () {
      state.pkg = r.value;
      state.pkgPrice = +r.getAttribute("data-price");
      updateSummary();
    });
  });
  form.querySelectorAll('input[name="addon"]').forEach(function (c) {
    c.addEventListener("change", function () {
      state.addons = [];
      form.querySelectorAll('input[name="addon"]:checked').forEach(function (x) {
        state.addons.push({ name: x.value, price: +x.getAttribute("data-price") });
      });
      updateSummary();
    });
  });

  /* live-clear field errors */
  form.querySelectorAll(".field input, .field select, .field textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      var wrap = el.closest(".field");
      if (wrap.classList.contains("invalid")) {
        wrap.classList.remove("invalid");
        wrap.querySelector(".err").textContent = "";
      }
    });
  });

  /* ---------- calendar ---------- */
  var calGrid = document.getElementById("calGrid");
  var calMonth = document.getElementById("calMonth");
  var calPrev = document.getElementById("calPrev");
  var calNext = document.getElementById("calNext");
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  // deterministic blackout days per month (studio booked out)
  function blackoutSet(y, m) {
    var seed = (y * 12 + m);
    var a = ((seed * 7) % 26) + 2;
    var b = ((seed * 13) % 26) + 2;
    return { a: a, b: b };
  }

  function renderCal() {
    calGrid.innerHTML = "";
    var y = view.getFullYear(), m = view.getMonth();
    calMonth.textContent = MONTHS[m] + " " + y;
    // Monday-first offset
    var firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
    var days = new Date(y, m + 1, 0).getDate();
    var bo = blackoutSet(y, m);
    for (var i = 0; i < firstDow; i++) {
      var e = document.createElement("div");
      e.className = "cal-cell empty";
      calGrid.appendChild(e);
    }
    for (var d = 1; d <= days; d++) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-cell";
      cell.textContent = d;
      var cellDate = new Date(y, m, d); cellDate.setHours(0, 0, 0, 0);
      var iso = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      cell.setAttribute("data-iso", iso);
      var past = cellDate < today;
      var weekend = [0, 6].indexOf(cellDate.getDay()) !== -1;
      var blocked = (d === bo.a || d === bo.b) && !past;
      if (past || weekend) {
        cell.disabled = true;
        cell.setAttribute("aria-disabled", "true");
      } else if (blocked) {
        cell.disabled = true;
        cell.classList.add("blocked");
        cell.title = "Booked out";
      } else {
        cell.setAttribute("aria-label", MONTHS[m] + " " + d + ", " + y + ", available");
        cell.addEventListener("click", function () { pickDate(this); });
      }
      if (state.date && state.date.iso === iso) cell.classList.add("sel");
      calGrid.appendChild(cell);
    }
    // disable prev nav if at/ before current month
    calPrev.disabled = (y === today.getFullYear() && m === today.getMonth());
  }

  function pickDate(cell) {
    calGrid.querySelectorAll(".cal-cell.sel").forEach(function (c) { c.classList.remove("sel"); });
    cell.classList.add("sel");
    var iso = cell.getAttribute("data-iso");
    var parts = iso.split("-");
    var dt = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var pretty = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    state.date = { iso: iso, pretty: pretty };
    updateSummary();
    toast("Shoot date locked: " + pretty);
  }

  calPrev.addEventListener("click", function () {
    view.setMonth(view.getMonth() - 1); renderCal();
  });
  calNext.addEventListener("click", function () {
    view.setMonth(view.getMonth() + 1); renderCal();
  });

  /* ---------- summary + totals ---------- */
  var TAX = 0.0875;
  function subtotal() {
    var addonSum = state.addons.reduce(function (a, x) { return a + x.price; }, 0);
    return state.ptypePrice + state.pkgPrice + addonSum;
  }
  function grandTotal() {
    var sub = subtotal();
    return sub + sub * TAX;
  }

  function updateSummary() {
    document.getElementById("sProject").textContent = state.ptype
      ? state.ptype + " · " + money(state.ptypePrice) : "—";
    document.getElementById("sDate").textContent = state.date ? state.date.pretty : "—";
    document.getElementById("sPkg").textContent = state.pkg
      ? state.pkg + (state.pkgPrice ? " · +" + money(state.pkgPrice) : " · included") : "—";

    var addWrap = document.getElementById("sAddons");
    addWrap.innerHTML = "";
    state.addons.forEach(function (x) {
      var row = document.createElement("div");
      row.className = "sum-row addon-line";
      row.innerHTML = "<dt>+ " + x.name + "</dt><dd>" + money(x.price) + "</dd>";
      addWrap.appendChild(row);
    });

    var sub = subtotal();
    document.getElementById("sTax").textContent = money(sub * TAX);
    document.getElementById("sTotal").textContent = money(grandTotal());
  }

  /* ---------- review ---------- */
  function buildReview() {
    var list = document.getElementById("reviewList");
    var name = (document.getElementById("fName").value || "—").trim() || "—";
    var email = (document.getElementById("fEmail").value || "—").trim() || "—";
    var company = (document.getElementById("fCompany").value || "").trim();
    var loc = (document.getElementById("fLocation").value || "—").trim() || "—";
    var runtime = document.getElementById("fRuntime").value || "—";
    var rows = [
      ["Project", state.ptype || "—"],
      ["Shoot date", state.date ? state.date.pretty : "—"],
      ["Package", state.pkg || "—"],
      ["Add-ons", state.addons.length ? state.addons.map(function (a) { return a.name; }).join(", ") : "None"],
      ["Client", name + (company ? " · " + company : "")],
      ["Email", email],
      ["Location", loc],
      ["Runtime", runtime]
    ];
    list.innerHTML = "";
    rows.forEach(function (r) {
      var div = document.createElement("div");
      div.className = "rrow";
      div.innerHTML = "<dt>" + r[0] + "</dt><dd>" + escapeHtml(r[1]) + "</dd>";
      list.appendChild(div);
    });
    var tot = document.createElement("div");
    tot.className = "rrow tot";
    tot.innerHTML = "<dt>Total (incl. tax)</dt><dd>" + money(grandTotal()) + "</dd>";
    list.appendChild(tot);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- confirm ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!document.getElementById("agree").checked) {
      toast("Please accept the deposit policy.", true);
      return;
    }
    var ref = "AG-" + Math.random().toString(36).slice(2, 6).toUpperCase() +
      "-" + (100 + Math.floor(Math.random() * 899));
    document.getElementById("cRef").textContent = ref;
    document.getElementById("cDate").textContent = state.date ? state.date.pretty : "—";
    document.getElementById("cPkg").textContent = state.pkg || "—";
    document.getElementById("cTotal").textContent = money(grandTotal());

    document.querySelector(".wrap").style.display = "none";
    var conf = document.getElementById("confirm");
    conf.hidden = false;
    conf.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Booking confirmed · " + ref);
  });

  document.getElementById("btnAgain").addEventListener("click", function () {
    form.reset();
    state = { ptype: null, ptypePrice: 0, date: null, pkg: null, pkgPrice: 0, addons: [] };
    document.querySelectorAll(".field.invalid").forEach(function (w) {
      w.classList.remove("invalid");
      var er = w.querySelector(".err"); if (er) er.textContent = "";
    });
    view = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCal();
    updateSummary();
    document.getElementById("confirm").hidden = true;
    document.querySelector(".wrap").style.display = "";
    showStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- init ---------- */
  renderCal();
  updateSummary();
  showStep(1);
})();
