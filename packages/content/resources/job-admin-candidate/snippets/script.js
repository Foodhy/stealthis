(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastHost = document.getElementById("toastHost");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " t-" + kind : "");
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = {
    resume: document.getElementById("panel-resume"),
    scorecard: document.getElementById("panel-scorecard"),
    activity: document.getElementById("panel-activity"),
    notes: document.getElementById("panel-notes")
  };

  function activateTab(name) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.keys(panels).forEach(function (key) {
      var p = panels[key];
      var on = key === name;
      p.classList.toggle("is-active", on);
      if (on) { p.removeAttribute("hidden"); } else { p.setAttribute("hidden", ""); }
    });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { activateTab(t.dataset.tab); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var dir = e.key === "ArrowRight" ? 1 : -1;
        var next = (i + dir + tabs.length) % tabs.length;
        tabs[next].focus();
        activateTab(tabs[next].dataset.tab);
      }
    });
  });

  /* ---------- Scorecard sliders ---------- */
  var ranges = Array.prototype.slice.call(document.querySelectorAll('.criteria input[type="range"]'));
  var avgEl = document.getElementById("avgScore");

  function paintRange(input) {
    var pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.backgroundSize = pct + "% 100%";
    var out = document.getElementById("v-" + input.id.replace("c-", ""));
    if (out) out.textContent = input.value;
  }

  function recalcAvg() {
    var sum = ranges.reduce(function (a, r) { return a + Number(r.value); }, 0);
    var avg = ranges.length ? sum / ranges.length : 0;
    avgEl.textContent = avg.toFixed(1);

    // Reflect into the profile overall rating
    var overallNum = document.getElementById("overallNum");
    var stars = document.querySelectorAll("#overallStars .star");
    overallNum.textContent = avg.toFixed(1);
    var rounded = Math.round(avg);
    stars.forEach(function (s, idx) { s.classList.toggle("on", idx < rounded); });
    document.getElementById("overallStars").setAttribute(
      "aria-label", "Rated " + avg.toFixed(1) + " of 5"
    );
  }

  ranges.forEach(function (r) {
    paintRange(r);
    r.addEventListener("input", function () {
      paintRange(r);
      recalcAvg();
    });
  });
  recalcAvg();

  /* ---------- Recommendation segmented control ---------- */
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      segBtns.forEach(function (x) {
        x.classList.remove("is-on");
        x.setAttribute("aria-checked", "false");
      });
      b.classList.add("is-on");
      b.setAttribute("aria-checked", "true");
    });
  });

  document.getElementById("saveScore").addEventListener("click", function () {
    var rec = document.querySelector(".seg-btn.is-on");
    toast("Scorecard saved — avg " + avgEl.textContent + "/5 (" + (rec ? rec.textContent : "—") + ")");
  });

  /* ---------- Notes ---------- */
  var noteForm = document.getElementById("noteForm");
  var noteInput = document.getElementById("noteInput");
  var notesList = document.getElementById("notesList");

  noteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = noteInput.value.trim();
    if (!text) {
      toast("Note is empty", "warn");
      noteInput.focus();
      return;
    }
    var li = document.createElement("li");
    li.className = "note is-fresh";
    var time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    var head = document.createElement("div");
    head.className = "note-head";
    var who = document.createElement("strong");
    who.textContent = "You";
    var when = document.createElement("span");
    when.className = "note-time";
    when.textContent = "Just now · " + time;
    head.appendChild(who);
    head.appendChild(when);
    var p = document.createElement("p");
    p.textContent = text;
    li.appendChild(head);
    li.appendChild(p);
    notesList.appendChild(li);
    noteInput.value = "";
    toast("Note posted to the team");
  });

  /* ---------- Stage actions ---------- */
  var stagePill = document.getElementById("stagePill");
  var advanceBtn = document.getElementById("btnAdvance");

  function setStage(stage, label) {
    stagePill.dataset.stage = stage;
    stagePill.textContent = label;
  }

  function logActivity(text, fresh) {
    var list = document.getElementById("activityList");
    var li = document.createElement("li");
    li.className = "act" + (fresh ? " act-interview" : "");
    var dot = document.createElement("span");
    dot.className = "act-dot";
    dot.setAttribute("aria-hidden", "true");
    var body = document.createElement("div");
    body.className = "act-body";
    var strong = document.createElement("strong");
    strong.textContent = text;
    var time = document.createElement("span");
    time.className = "act-time";
    time.textContent = "Just now · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    body.appendChild(strong);
    body.appendChild(document.createTextNode(" by You"));
    body.appendChild(time);
    li.appendChild(dot);
    li.appendChild(body);
    list.insertBefore(li, list.firstChild);
  }

  advanceBtn.addEventListener("click", function () {
    var stage = stagePill.dataset.stage;
    if (stage === "interview") {
      setStage("offer", "Offer");
      advanceBtn.textContent = "Mark as Hired →";
      logActivity("Advanced to Offer", true);
      toast("Maya advanced to Offer");
    } else if (stage === "offer") {
      setStage("offer", "Hired");
      advanceBtn.disabled = true;
      advanceBtn.textContent = "Hired ✓";
      advanceBtn.style.opacity = ".7";
      logActivity("Marked as Hired", true);
      toast("Offer accepted — candidate hired");
    } else {
      setStage("interview", "Interview");
      toast("Moved back to Interview");
    }
  });

  document.getElementById("btnReject").addEventListener("click", function () {
    if (stagePill.dataset.stage === "rejected") {
      toast("Candidate already rejected", "warn");
      return;
    }
    setStage("rejected", "Rejected");
    advanceBtn.disabled = true;
    advanceBtn.style.opacity = ".5";
    logActivity("Rejected", false);
    toast("Maya moved to Rejected", "danger");
  });

  document.getElementById("btnSchedule").addEventListener("click", function () {
    activateTab("activity");
    toast("Interview invite drafted — opening calendar");
  });

  /* ---------- Prev / Next (demo) ---------- */
  document.getElementById("prevCand").addEventListener("click", function () {
    toast("No earlier candidate in this stage", "warn");
  });
  document.getElementById("nextCand").addEventListener("click", function () {
    toast("Next: Dario Velasco — Interview", undefined);
  });
})();
