(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Task checklist ---------- */
  var taskList = document.getElementById("taskList");
  var checkboxes = Array.prototype.slice.call(taskList.querySelectorAll('input[type="checkbox"]'));
  var taskCount = document.getElementById("taskCount");
  var progBar = document.getElementById("progBar");
  var completeBtn = document.getElementById("completeBtn");

  function refreshTasks() {
    var done = checkboxes.filter(function (c) { return c.checked; }).length;
    var total = checkboxes.length;
    taskCount.textContent = done + " / " + total;
    progBar.style.width = (done / total) * 100 + "%";
    var allDone = done === total;
    completeBtn.disabled = !allDone;
    if (allDone) {
      completeBtn.classList.add("ready");
      setTimeout(function () { completeBtn.classList.remove("ready"); }, 500);
    }
  }

  checkboxes.forEach(function (cb) {
    cb.addEventListener("change", function () {
      refreshTasks();
      if (cb.checked) {
        var txt = cb.closest(".task").querySelector(".task-txt").textContent;
        toast("✓ " + txt);
      }
    });
  });
  refreshTasks();

  /* ---------- Clock / labor timer ---------- */
  var clockBtn = document.getElementById("clockBtn");
  var clockLabel = document.getElementById("clockLabel");
  var clockState = document.getElementById("clockState");
  var timerDisplay = document.getElementById("timerDisplay");
  var elapsed = 0; // seconds
  var running = false;
  var tickId = null;

  function fmt(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    return pad(h) + ":" + pad(m) + ":" + pad(sec);
  }

  function render() {
    timerDisplay.textContent = fmt(elapsed);
  }

  function tick() {
    elapsed += 1;
    render();
  }

  clockBtn.addEventListener("click", function () {
    running = !running;
    if (running) {
      tickId = setInterval(tick, 1000);
      clockBtn.classList.add("on");
      clockBtn.setAttribute("aria-pressed", "true");
      clockLabel.textContent = "Clock Off";
      clockState.textContent = "Clocked on · live";
      clockState.classList.add("live");
      timerDisplay.classList.add("live");
      toast("Clocked on — timer running");
    } else {
      clearInterval(tickId);
      clockBtn.classList.remove("on");
      clockBtn.setAttribute("aria-pressed", "false");
      clockLabel.textContent = "Clock On";
      clockState.textContent = "Paused · " + fmt(elapsed);
      clockState.classList.remove("live");
      timerDisplay.classList.remove("live");
      toast("Clocked off — " + fmt(elapsed) + " logged");
    }
  });
  render();

  /* ---------- Parts request ---------- */
  var partsList = document.getElementById("partsList");
  var partsTotal = document.getElementById("partsTotal");
  var reqPartBtn = document.getElementById("reqPartBtn");
  var laborRow = partsList.querySelector(".part.labor");

  var catalog = [
    { name: "Brake Fluid <em>(DOT 4, 1L)</em>", price: 14.5 },
    { name: "Cabin Air Filter <em>(OEM)</em>", price: 22.0 },
    { name: "Wheel Bearing <em>(front)</em>", price: 89.0 },
    { name: "Serpentine Belt <em>(Gates)</em>", price: 31.75 },
    { name: "Spark Plug Set <em>(×4)</em>", price: 36.0 }
  ];
  var catIdx = 0;
  var total = 556.4;

  reqPartBtn.addEventListener("click", function () {
    var p = catalog[catIdx % catalog.length];
    catIdx += 1;
    total += p.price;

    var li = document.createElement("li");
    li.className = "part new";
    li.innerHTML =
      '<span class="part-name">' + p.name + "</span>" +
      '<span class="part-meta"><span class="qty">×1</span>' +
      '<span class="tab money">$' + p.price.toFixed(2) + "</span></span>";
    partsList.insertBefore(li, laborRow);

    partsTotal.textContent = "$" + total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var plain = p.name.replace(/<[^>]+>/g, "").trim();
    toast("Part requested: " + plain);
  });

  /* ---------- Photo capture ---------- */
  var captureGrid = document.getElementById("captureGrid");
  var addPhoto = document.getElementById("addPhoto");
  var gradients = [
    "linear-gradient(135deg,#3a3f47,#1a1c21)",
    "linear-gradient(135deg,#5b6470,#2a2d34)",
    "linear-gradient(135deg,#ff6a13,#e2540a)",
    "linear-gradient(135deg,#2b7fff,#1d5fd6)",
    "linear-gradient(135deg,#2f9e6f,#1f6f4c)"
  ];
  var labels = ["Pads", "Rotor", "Coil", "VIN", "Odo", "Tire"];
  var photoN = 0;

  addPhoto.addEventListener("click", function () {
    photoN += 1;
    var thumb = document.createElement("div");
    thumb.className = "cap-thumb";
    thumb.style.background = gradients[(photoN - 1) % gradients.length];
    thumb.innerHTML = "<span>" + labels[(photoN - 1) % labels.length] + "</span>";
    captureGrid.insertBefore(thumb, addPhoto);
    toast("Photo captured (" + photoN + ")");
  });

  /* ---------- Notes ---------- */
  var noteInput = document.getElementById("noteInput");
  var addNote = document.getElementById("addNote");
  var notesList = document.getElementById("notesList");

  function nowLabel() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }

  function saveNote() {
    var val = noteInput.value.trim();
    if (!val) { noteInput.focus(); return; }
    var li = document.createElement("li");
    li.className = "note";
    var span = document.createElement("span");
    span.textContent = val;
    var time = document.createElement("time");
    time.textContent = "Tech DM · " + nowLabel();
    li.appendChild(span);
    li.appendChild(time);
    notesList.insertBefore(li, notesList.firstChild);
    noteInput.value = "";
    toast("Note saved");
  }

  addNote.addEventListener("click", saveNote);
  noteInput.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveNote();
  });

  /* ---------- Complete job ---------- */
  var overlay = document.getElementById("overlay");
  var overlayClose = document.getElementById("overlayClose");
  var doneTime = document.getElementById("doneTime");
  var jobStatus = document.getElementById("jobStatus");
  var completeLabel = document.getElementById("completeLabel");

  completeBtn.addEventListener("click", function () {
    if (completeBtn.disabled) return;
    if (running) clockBtn.click(); // clock off automatically
    doneTime.textContent = "Logged " + fmt(elapsed);
    jobStatus.textContent = "Done";
    jobStatus.setAttribute("data-status", "done");
    completeLabel.textContent = "Completed";
    overlay.hidden = false;
  });

  overlayClose.addEventListener("click", function () {
    overlay.hidden = true;
    toast("Returning to job list…");
  });
})();
