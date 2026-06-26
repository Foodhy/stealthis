(function () {
  "use strict";

  var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat"];
  var TODAY = "tue";

  var CREWS = [
    { id: "c1", name: "Crew A", lead: "Foreman: Marcus Hale", trade: "Framing" },
    { id: "c2", name: "Crew B", lead: "Foreman: Tariq Osei", trade: "Concrete" },
    { id: "c3", name: "Crew C", lead: "Foreman: Lena Petrov", trade: "Electrical" },
    { id: "c4", name: "Crew D", lead: "Foreman: Diego Ramos", trade: "Roofing" }
  ];

  // status cycle: scheduled -> progress -> done -> scheduled
  var STATUS = {
    scheduled: { label: "Scheduled", next: "progress" },
    progress: { label: "In Progress", next: "done" },
    done: { label: "Done", next: "scheduled" }
  };

  // jobs already placed on the board
  var jobs = [
    { id: "j1", crew: "c1", day: "mon", site: "Maple Ridge Lot 12", hours: "07:00–15:30", size: 5, status: "done" },
    { id: "j2", crew: "c1", day: "tue", site: "Maple Ridge Lot 12", hours: "07:00–15:30", size: 5, status: "progress" },
    { id: "j3", crew: "c1", day: "wed", site: "Harbor St. Annex", hours: "08:00–16:00", size: 4, status: "scheduled" },
    { id: "j4", crew: "c2", day: "tue", site: "Civic Center Foundation", hours: "06:30–14:30", size: 6, status: "progress" },
    { id: "j5", crew: "c2", day: "thu", site: "Civic Center Foundation", hours: "06:30–14:30", size: 6, status: "scheduled" },
    { id: "j6", crew: "c3", day: "mon", site: "Birchwood Tower 3F", hours: "08:00–16:30", size: 3, status: "done" },
    { id: "j7", crew: "c3", day: "wed", site: "Birchwood Tower 4F", hours: "08:00–16:30", size: 3, status: "scheduled" },
    { id: "j8", crew: "c3", day: "fri", site: "Old Mill Rewire", hours: "09:00–17:00", size: 2, status: "scheduled" },
    { id: "j9", crew: "c4", day: "tue", site: "Westgate Plaza Roof", hours: "07:00–15:00", size: 4, status: "progress" },
    { id: "j10", crew: "c4", day: "thu", site: "Westgate Plaza Roof", hours: "07:00–15:00", size: 4, status: "scheduled" },
    { id: "j11", crew: "c2", day: "sat", site: "Riverside Pour Cleanup", hours: "07:00–12:00", size: 3, status: "scheduled" }
  ];

  var unassigned = [
    { id: "u1", site: "Sunset Blvd Curbing", hours: "07:30–15:30", size: 4 },
    { id: "u2", site: "Lakeshore Demo Phase 1", hours: "06:00–14:00", size: 6 },
    { id: "u3", site: "Depot Drainage Trench", hours: "08:00–16:00", size: 3 }
  ];

  var seq = 100;
  var armed = null; // currently armed unassigned job id

  var grid = document.getElementById("grid");
  var unassignedEl = document.getElementById("unassigned");
  var hintEl = document.getElementById("hint");

  function jobBlock(job) {
    var st = STATUS[job.status];
    var el = document.createElement("div");
    el.className = "job s-" + job.status;
    el.innerHTML =
      '<span class="site"></span>' +
      '<span class="meta"><span class="hrs"></span><span class="crew">◆ ' +
      job.size +
      "</span></span>" +
      '<button type="button" class="badge b-' +
      job.status +
      '">' +
      st.label +
      "</button>";
    el.querySelector(".site").textContent = job.site;
    el.querySelector(".hrs").textContent = job.hours;

    var badge = el.querySelector(".badge");
    badge.setAttribute("aria-label", "Status " + st.label + ", click to advance");
    badge.addEventListener("click", function (e) {
      e.stopPropagation();
      job.status = STATUS[job.status].next;
      render();
    });
    return el;
  }

  function render() {
    // clear everything except the 7 header cells
    var heads = grid.querySelectorAll(".grid-head");
    grid.innerHTML = "";
    heads.forEach(function (h) {
      grid.appendChild(h);
    });

    CREWS.forEach(function (crew) {
      var cell = document.createElement("div");
      cell.className = "crew-cell";
      cell.innerHTML =
        '<span class="name"></span><span class="lead"></span><span class="trade"></span>';
      cell.querySelector(".name").textContent = crew.name;
      cell.querySelector(".lead").textContent = crew.lead;
      cell.querySelector(".trade").textContent = crew.trade;
      grid.appendChild(cell);

      DAYS.forEach(function (day) {
        var dc = document.createElement("div");
        dc.className = "day-cell";
        if (day === TODAY) dc.classList.add("today-col");
        dc.dataset.crew = crew.id;
        dc.dataset.day = day;

        jobs
          .filter(function (j) {
            return j.crew === crew.id && j.day === day;
          })
          .forEach(function (j) {
            dc.appendChild(jobBlock(j));
          });

        if (armed) {
          dc.classList.add("droppable");
        }
        dc.addEventListener("click", function () {
          if (armed) assign(crew.id, day);
        });
        grid.appendChild(dc);
      });
    });

    renderUnassigned();
    updateStats();
  }

  function renderUnassigned() {
    unassignedEl.innerHTML = "";
    if (!unassigned.length) {
      var li = document.createElement("li");
      li.className = "u-empty";
      li.textContent = "All jobs assigned. Crews are loaded for the week.";
      unassignedEl.appendChild(li);
      return;
    }
    unassigned.forEach(function (job) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "u-job" + (armed === job.id ? " armed" : "");
      btn.setAttribute("aria-pressed", armed === job.id ? "true" : "false");
      btn.innerHTML =
        '<span class="site"></span><span class="meta"><span></span><span>◆ ' +
        job.size +
        " crew</span></span>";
      btn.querySelector(".site").textContent = job.site;
      btn.querySelector(".meta span").textContent = job.hours;
      btn.addEventListener("click", function () {
        armed = armed === job.id ? null : job.id;
        render();
        updateHint();
      });
      li.appendChild(btn);
      unassignedEl.appendChild(li);
    });
  }

  function assign(crewId, day) {
    var idx = unassigned.findIndex(function (j) {
      return j.id === armed;
    });
    if (idx === -1) return;
    var job = unassigned.splice(idx, 1)[0];
    jobs.push({
      id: "j" + ++seq,
      crew: crewId,
      day: day,
      site: job.site,
      hours: job.hours,
      size: job.size,
      status: "scheduled"
    });
    armed = null;
    render();
    updateHint();
  }

  function updateHint() {
    if (armed) {
      hintEl.textContent = "Job armed — tap any highlighted day cell to assign it.";
      hintEl.classList.add("active");
    } else {
      hintEl.textContent = "Tip: click a job card to arm it.";
      hintEl.classList.remove("active");
    }
  }

  function updateStats() {
    var sched = jobs.filter(function (j) {
      return j.status === "scheduled";
    }).length;
    var prog = jobs.filter(function (j) {
      return j.status === "progress";
    }).length;
    document.getElementById("statScheduled").textContent = sched;
    document.getElementById("statProgress").textContent = prog;
    document.getElementById("statUnassigned").textContent = unassigned.length;
  }

  // Esc disarms
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && armed) {
      armed = null;
      render();
      updateHint();
    }
  });

  render();
})();
