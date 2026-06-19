(function () {
  "use strict";

  // ---- fictional host directory ----
  var HOSTS = [
    { name: "Mara Lindqvist", team: "Design", area: "North Wing · Desk 12", status: "in", color: "#e8902b" },
    { name: "Dev Okafor", team: "Engineering", area: "Loft · Pod B", status: "in", color: "#5f7a52" },
    { name: "Priya Raman", team: "Product", area: "South Wing · Studio 3", status: "away", color: "#d4503e" },
    { name: "Theo Brandt", team: "Founders", area: "Glass Room", status: "in", color: "#2f9e6f" },
    { name: "Nina Castellano", team: "Community", area: "Front Desk", status: "in", color: "#cc7918" },
    { name: "Jules Moreau", team: "Marketing", area: "North Wing · Desk 4", status: "away", color: "#7b766c" },
    { name: "Sam Whitfield", team: "Operations", area: "Workshop", status: "in", color: "#26241f" },
    { name: "Aiko Tanaka", team: "Design", area: "Loft · Pod A", status: "in", color: "#5f7a52" }
  ];

  var FRONT_DESK = { name: "Front Desk", team: "Community", area: "Lobby", status: "in", color: "#1c1b19" };

  var state = { step: 1, purpose: null, host: null, photo: false, nda: false };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var screens = $$(".screen");
  var railItems = $$("#rail li");
  var nextBtn = $("#nextBtn");
  var backBtn = $("#backBtn");

  // ---- clock ----
  function tick() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    var hh = ((h + 11) % 12) + 1;
    $("#clock").textContent = hh + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }
  tick();
  setInterval(tick, 15000);

  // ---- toast ----
  var toastEl = $("#toast"), toastTimer;
  function toast(msg, icon) {
    toastEl.innerHTML = '<span class="t-ic">' + (icon || "✓") + "</span>" + msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 3200);
  }

  function initials(name) {
    return name.trim().split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
  }

  // ---- navigation ----
  function show(step) {
    state.step = step;
    screens.forEach(function (sc) {
      var n = +sc.getAttribute("data-screen");
      var on = n === step;
      sc.classList.toggle("is-on", on);
      sc.hidden = !on;
    });
    railItems.forEach(function (li) {
      var n = +li.getAttribute("data-step");
      li.classList.toggle("active", n === step);
      li.classList.toggle("complete", n < step);
    });
    backBtn.hidden = step === 1 || step === 4;
    nextBtn.style.display = step === 4 ? "none" : "";
    refreshNext();
    if (step === 3) syncBadge();
    if (step === 4) runSuccess();
    var search = $("#hostSearch");
    if (step === 2 && search) setTimeout(function () { search.focus(); }, 60);
  }

  function canAdvance() {
    if (state.step === 1) return !!state.purpose;
    if (state.step === 2) return !!state.host;
    if (state.step === 3) {
      var name = $("#vName").value.trim();
      return name.length >= 2 && state.nda;
    }
    return true;
  }

  function refreshNext() {
    nextBtn.disabled = !canAdvance();
    nextBtn.textContent = state.step === 3 ? "Print badge →" : "Continue →";
  }

  nextBtn.addEventListener("click", function () {
    if (!canAdvance()) return;
    if (state.step < 4) show(state.step + 1);
  });
  backBtn.addEventListener("click", function () {
    if (state.step > 1) show(state.step - 1);
  });

  // ---- step 1: purpose ----
  $$(".purpose").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".purpose").forEach(function (b) { b.classList.remove("sel"); });
      btn.classList.add("sel");
      state.purpose = btn.getAttribute("data-purpose");
      state.purposeEmoji = btn.getAttribute("data-emoji");
      refreshNext();
      toast(state.purpose + " selected — choose your host next", btn.getAttribute("data-emoji"));
    });
  });

  // ---- step 2: host search ----
  var searchInput = $("#hostSearch");
  var hostList = $("#hostList");
  var hostEmpty = $("#hostEmpty");
  var hostClear = $("#hostClear");

  function renderHosts(q) {
    q = (q || "").trim().toLowerCase();
    var matches = HOSTS.filter(function (h) {
      return !q || (h.name + " " + h.team + " " + h.area).toLowerCase().indexOf(q) > -1;
    });
    hostList.innerHTML = "";
    matches.forEach(function (h) {
      var li = document.createElement("button");
      li.className = "host" + (state.host && state.host.name === h.name ? " sel" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", state.host && state.host.name === h.name ? "true" : "false");
      li.innerHTML =
        '<span class="avatar" style="background:' + h.color + '">' + initials(h.name) + "</span>" +
        '<span class="host-info"><strong>' + h.name + "</strong><span>" + h.team + " · " + h.area + "</span></span>" +
        '<span class="host-status ' + (h.status === "in" ? "in" : "away") + '">' + (h.status === "in" ? "On-site" : "Away") + "</span>";
      li.addEventListener("click", function () { pickHost(h, li); });
      hostList.appendChild(li);
    });
    hostEmpty.hidden = matches.length > 0;
    hostClear.hidden = !q;
  }

  function pickHost(h, el) {
    state.host = h;
    $$(".host").forEach(function (n) { n.classList.remove("sel"); n.setAttribute("aria-selected", "false"); });
    if (el) { el.classList.add("sel"); el.setAttribute("aria-selected", "true"); }
    refreshNext();
    toast("Host set: " + h.name, "👤");
  }

  searchInput.addEventListener("input", function () { renderHosts(searchInput.value); });
  hostClear.addEventListener("click", function () { searchInput.value = ""; renderHosts(""); searchInput.focus(); });
  $("#frontDesk").addEventListener("click", function () { pickHost(FRONT_DESK); searchInput.value = "Front Desk"; renderHosts("front"); });
  renderHosts("");

  // ---- step 3: details + badge ----
  var vName = $("#vName"), vCompany = $("#vCompany");
  [vName, vCompany].forEach(function (inp) { inp.addEventListener("input", function () { syncBadge(); refreshNext(); }); });

  function syncBadge() {
    var name = vName.value.trim() || "Your name";
    var co = vCompany.value.trim() || "Company";
    $("#badgeName").textContent = name;
    $("#badgeCo").textContent = co;
    $("#badgeHost").textContent = "Host: " + (state.host ? state.host.name : "—");
    $("#badgeKind").textContent = (state.purpose || "VISITOR").toUpperCase();
    $("#photoInitials").textContent = vName.value.trim() ? initials(vName.value) : "?";
    $("#badgeDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  // photo mock
  $("#photoBtn").addEventListener("click", function (e) {
    e.preventDefault();
    var photo = $("#badgePhoto");
    photo.classList.add("has-photo");
    state.photo = true;
    $("#photoInitials").textContent = vName.value.trim() ? initials(vName.value) : "📸";
    $("#photoBtn").textContent = "✓ Photo captured";
    toast("Photo captured for your badge", "📷");
  });

  // NDA toggle
  var ndaToggle = $("#ndaToggle");
  ndaToggle.addEventListener("click", function () {
    state.nda = ndaToggle.getAttribute("aria-checked") !== "true";
    ndaToggle.setAttribute("aria-checked", String(state.nda));
    refreshNext();
    if (state.nda) toast("NDA accepted", "📝");
  });

  // NDA modal
  var ndaModal = $("#ndaModal");
  $("#ndaView").addEventListener("click", function () { ndaModal.hidden = false; });
  $("#ndaClose").addEventListener("click", function () { ndaModal.hidden = true; });
  ndaModal.addEventListener("click", function (e) { if (e.target === ndaModal) ndaModal.hidden = true; });

  // ---- step 4: success ----
  function runSuccess() {
    var name = vName.value.trim() || "Guest";
    var host = state.host ? state.host.name : "Front Desk";
    $("#doneSub").textContent = "Your badge is printing — please collect it from the lobby.";

    var facts = $("#doneFacts");
    facts.innerHTML = "";
    var rows = [
      ["Visitor", name],
      ["Purpose", state.purpose || "Visit"],
      ["Host", host],
      ["Checked in", new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })]
    ];
    rows.forEach(function (r) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + r[0] + "</span><span>" + r[1] + "</span>";
      facts.appendChild(li);
    });

    var printed = $("#printedBadge");
    printed.classList.remove("print");
    printed.style.background =
      "linear-gradient(135deg, " + (state.host ? state.host.color : "#e8902b") + ", #5f7a52)";
    setTimeout(function () { printed.classList.add("print"); }, 120);
    setTimeout(function () { toast("Badge printed — please take it from the slot", "🖨️"); }, 1000);
    setTimeout(function () { toast(host + " has been notified you've arrived", "🔔"); }, 2400);
  }

  $("#finishBtn").addEventListener("click", function () {
    // reset
    state = { step: 1, purpose: null, host: null, photo: false, nda: false };
    $$(".purpose").forEach(function (b) { b.classList.remove("sel"); });
    vName.value = ""; vCompany.value = ""; $("#vEmail").value = "";
    ndaToggle.setAttribute("aria-checked", "false");
    $("#badgePhoto").classList.remove("has-photo");
    $("#photoBtn").textContent = "📷 Take photo";
    searchInput.value = "";
    renderHosts("");
    show(1);
    toast("Welcome — ready for the next visitor", "👋");
  });

  // ---- start ----
  show(1);
})();
