/* ==========================================================================
   LMS — Instructor Dashboard
   Vanilla JS. Fictional data. Timeframe toggle, SVG chart, course drill,
   recent-enrollment feed, student-question replies, toasts.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------- Data ----------------------------------- */
  var AVATAR_COLORS = ["#5b5bd6", "#13b981", "#f59e0b", "#e05656", "#8a6df0", "#0ea5b7", "#d6588a"];
  function colorFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }
  function initials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  // KPI base values + multipliers per timeframe
  var RANGES = {
    "7d":  { label: "Last 7 days",   enroll: 412,   rev: 9840,   comp: 68, rate: 4.78, pts: 7,  axis: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    "30d": { label: "Last 30 days",  enroll: 1830,  rev: 41200,  comp: 66, rate: 4.80, pts: 10, axis: ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10"] },
    "90d": { label: "Last 90 days",  enroll: 5240,  rev: 121500, comp: 64, rate: 4.79, pts: 12, axis: ["Jan","","Feb","","Mar","","Apr","","May","","Jun",""] },
    "12m": { label: "Last 12 months",enroll: 21800, rev: 498000, comp: 65, rate: 4.81, pts: 12, axis: ["J","F","M","A","M","J","J","A","S","O","N","D"] }
  };

  // deterministic pseudo-random series so each range looks distinct but stable
  function seriesFor(range) {
    var cfg = RANGES[range];
    var seed = range.charCodeAt(0) * 7 + range.length * 13;
    var out = [], base = cfg.rev / cfg.pts;
    for (var i = 0; i < cfg.pts; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var noise = (seed / 0x7fffffff - 0.5) * 0.5;
      var trend = 0.7 + (i / cfg.pts) * 0.7;
      out.push(Math.max(base * 0.4, base * trend * (1 + noise)));
    }
    return out;
  }

  var COURSES = [
    { id: "c1", title: "Modern JavaScript: From Zero to Pro", cat: "Web Development", icon: "⚛", color: "#5b5bd6", level: "Intermediate",
      students: 9420, rev: 184300, comp: 71, rate: 4.84,
      lessons: [["Setup & tooling",true],["Variables & scope",true],["Async / await",true],["DOM patterns",false],["Testing basics",false]] },
    { id: "c2", title: "UX Foundations for Developers", cat: "Design", icon: "✎", color: "#13b981", level: "Beginner",
      students: 6180, rev: 121800, comp: 64, rate: 4.79,
      lessons: [["Design thinking",true],["Wireframing",true],["Color & type",false],["Usability testing",false]] },
    { id: "c3", title: "Data Visualization with D3", cat: "Data Science", icon: "▣", color: "#f59e0b", level: "Advanced",
      students: 4055, rev: 98700, comp: 58, rate: 4.72,
      lessons: [["SVG primer",true],["Scales & axes",true],["Transitions",false],["Force layouts",false],["Maps",false]] },
    { id: "c4", title: "Practical Python for Automation", cat: "Programming", icon: "🐍", color: "#0ea5b7", level: "Beginner",
      students: 7740, rev: 142600, comp: 69, rate: 4.81,
      lessons: [["Syntax tour",true],["Files & paths",true],["Web scraping",true],["Schedulers",false]] },
    { id: "c5", title: "System Design Interview Crash Course", cat: "Engineering", icon: "▤", color: "#e05656", level: "Advanced",
      students: 3210, rev: 88900, comp: 52, rate: 4.69,
      lessons: [["Estimation",true],["Load balancing",false],["Caching",false],["Sharding",false]] }
  ];

  var QUESTIONS = [
    { id: "q1", who: "Priya Raman", course: "Modern JavaScript", time: "12m ago", text: "In the async lesson, why does the await inside the loop block each iteration? Should I use Promise.all instead?", answered: false },
    { id: "q2", who: "Diego Salas", course: "Practical Python", time: "48m ago", text: "My scraper returns an empty list on the pagination example — is the selector outdated?", answered: false },
    { id: "q3", who: "Hana Ito", course: "Data Visualization with D3", time: "1h ago", text: "How do I keep the axis labels from overlapping when the dataset is dense?", answered: false },
    { id: "q4", who: "Marcus Bell", course: "UX Foundations", time: "3h ago", text: "Loved module 2! Quick one — is there a recommended Figma plugin for the contrast checks you showed?", answered: true },
    { id: "q5", who: " Feng Liang", course: "System Design", time: "5h ago", text: "Could you clarify when to pick consistent hashing over a simple modulo strategy?", answered: false }
  ];

  var FIRST = ["Amara","Leo","Sofia","Noah","Yuki","Omar","Ingrid","Tariq","Lucia","Mateo","Nadia","Ravi","Elena","Kwame","Ana"];
  var LAST = ["Okafor","Nguyen","Costa","Schmidt","Tanaka","Haddad","Berg","Khan","Moreno","Silva","Petrov","Mehta","Rossi","Mensah","Cruz"];

  /* ----------------------------- State ---------------------------------- */
  var current = "7d";

  /* ----------------------------- Toast ---------------------------------- */
  function toast(msg) {
    var stack = document.getElementById("toastStack");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* --------------------------- KPI counters ----------------------------- */
  function animateValue(el, to) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var from = 0, start = null, dur = 750;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = from + (to - from) * eased;
      var txt = dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US");
      el.textContent = prefix + txt + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderKPIs() {
    var cfg = RANGES[current];
    animateValue(document.querySelector('[data-kpi="enroll"]'), cfg.enroll);
    animateValue(document.querySelector('[data-kpi="rev"]'), cfg.rev);
    animateValue(document.querySelector('[data-kpi="comp"]'), cfg.comp);
    animateValue(document.querySelector('[data-kpi="rate"]'), cfg.rate);
    requestAnimationFrame(function () {
      document.getElementById("compBar").style.width = cfg.comp + "%";
    });
    var full = Math.round(cfg.rate);
    document.getElementById("rateStars").textContent =
      "★".repeat(full) + "☆".repeat(5 - full) + "  ·  from " + (4200 + cfg.pts * 51).toLocaleString("en-US") + " reviews";
  }

  /* ----------------------------- Chart ---------------------------------- */
  var W = 640, H = 230, PAD_L = 8, PAD_R = 8, PAD_T = 18, PAD_B = 18;

  function drawChart() {
    var svg = document.getElementById("chart");
    var data = seriesFor(current);
    var cfg = RANGES[current];
    var max = Math.max.apply(null, data) * 1.12;
    var min = 0;
    var innerW = W - PAD_L - PAD_R;
    var innerH = H - PAD_T - PAD_B;

    function x(i) { return PAD_L + (innerW * i) / (data.length - 1); }
    function y(v) { return PAD_T + innerH - ((v - min) / (max - min)) * innerH; }

    var parts = [];
    // gridlines
    for (var g = 0; g <= 3; g++) {
      var gy = PAD_T + (innerH * g) / 3;
      parts.push('<line class="chart-grid" x1="' + PAD_L + '" y1="' + gy + '" x2="' + (W - PAD_R) + '" y2="' + gy + '"/>');
    }
    // area gradient
    parts.push('<defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#5b5bd6" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="#5b5bd6" stop-opacity="0"/></linearGradient></defs>');

    var linePts = data.map(function (v, i) { return x(i) + "," + y(v); });
    var area = "M" + linePts[0] + " L" + linePts.join(" L") +
      " L" + x(data.length - 1) + "," + (PAD_T + innerH) + " L" + PAD_L + "," + (PAD_T + innerH) + " Z";
    parts.push('<path d="' + area + '" fill="url(#areaFill)"/>');
    parts.push('<path class="chart-line" d="M' + linePts.join(" L") + '"/>');

    // dots
    data.forEach(function (v, i) {
      parts.push('<circle class="chart-dot" cx="' + x(i) + '" cy="' + y(v) + '" r="4" ' +
        'data-i="' + i + '" data-v="' + Math.round(v) + '" data-x="' + (x(i) / W * 100) + '" data-y="' + (y(v) / H * 100) + '"/>');
    });

    svg.innerHTML = parts.join("");
    document.getElementById("chartSub").textContent = cfg.label;

    // axis labels
    var axis = document.getElementById("chartAxis");
    axis.innerHTML = cfg.axis.map(function (a) { return "<span>" + a + "</span>"; }).join("");

    // tooltips
    var tip = document.getElementById("chartTip");
    var wrap = svg.parentElement;
    Array.prototype.forEach.call(svg.querySelectorAll(".chart-dot"), function (dot) {
      dot.addEventListener("mouseenter", function () {
        var rect = wrap.getBoundingClientRect();
        var px = parseFloat(dot.getAttribute("data-x")) / 100 * rect.width;
        var py = parseFloat(dot.getAttribute("data-y")) / 100 * rect.height;
        tip.hidden = false;
        tip.innerHTML = money(dot.getAttribute("data-v")) + " <span>· " + (cfg.axis[dot.getAttribute("data-i")] || "") + "</span>";
        tip.style.left = px + "px";
        tip.style.top = py + "px";
      });
      dot.addEventListener("mouseleave", function () { tip.hidden = true; });
    });
  }

  /* --------------------------- Course table ----------------------------- */
  function renderCourses() {
    var body = document.getElementById("courseBody");
    body.innerHTML = "";
    COURSES.slice().sort(function (a, b) { return b.rev - a.rev; }).forEach(function (c) {
      var tr = document.createElement("tr");
      tr.setAttribute("tabindex", "0");
      tr.setAttribute("role", "button");
      tr.innerHTML =
        '<td><div class="c-name">' +
          '<span class="c-thumb" style="background:' + c.color + '">' + c.icon + '</span>' +
          '<span><span class="c-title">' + c.title + '</span><br><span class="c-cat">' + c.cat + '</span></span>' +
        '</div></td>' +
        '<td class="num">' + c.students.toLocaleString("en-US") + '</td>' +
        '<td class="num">' + money(c.rev) + '</td>' +
        '<td class="num">' + c.comp + '%<span class="mini-bar"><i style="width:' + c.comp + '%"></i></span></td>' +
        '<td class="num"><span class="c-rate">' + c.rate.toFixed(2) + '</span></td>';
      tr.addEventListener("click", function () { openDrawer(c); });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(c); }
      });
      body.appendChild(tr);
    });
  }

  /* ------------------------------ Drawer -------------------------------- */
  var drawer = document.getElementById("drawer");
  var backdrop = document.getElementById("drawerBackdrop");

  function openDrawer(c) {
    document.getElementById("drawerTitle").textContent = c.title;
    document.getElementById("drawerLevel").textContent = c.level;
    var done = c.lessons.filter(function (l) { return l[1]; }).length;
    var pct = Math.round((done / c.lessons.length) * 100);
    var circ = 2 * Math.PI * 38;

    var body = document.getElementById("drawerBody");
    body.innerHTML =
      '<div class="dstat-grid">' +
        '<div class="dstat"><div class="dstat-label">Students</div><div class="dstat-value">' + c.students.toLocaleString("en-US") + '</div></div>' +
        '<div class="dstat"><div class="dstat-label">Revenue</div><div class="dstat-value">' + money(c.rev) + '</div></div>' +
        '<div class="dstat"><div class="dstat-label">Avg rating</div><div class="dstat-value">' + c.rate.toFixed(2) + ' ★</div></div>' +
        '<div class="dstat"><div class="dstat-label">Category</div><div class="dstat-value" style="font-size:15px">' + c.cat + '</div></div>' +
      '</div>' +
      '<div class="ring-wrap">' +
        '<svg class="ring" viewBox="0 0 90 90">' +
          '<circle class="ring-bg" cx="45" cy="45" r="38"/>' +
          '<circle class="ring-fg" cx="45" cy="45" r="38" stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ + '" id="dRing"/>' +
          '<text class="ring-txt" x="45" y="51" text-anchor="middle">' + c.comp + '%</text>' +
        '</svg>' +
        '<div><div class="ring-cap-title">Completion rate</div>' +
        '<div class="ring-cap-sub">' + Math.round(c.students * c.comp / 100).toLocaleString("en-US") + ' learners finished the course.</div></div>' +
      '</div>' +
      '<div class="dsection-title">Curriculum · ' + done + '/' + c.lessons.length + ' published</div>' +
      '<div id="lessonList"></div>';

    var list = document.getElementById("lessonList");
    c.lessons.forEach(function (l, i) {
      var row = document.createElement("div");
      row.className = "lesson" + (l[1] ? " done" : "");
      var durs = ["8 min", "14 min", "11 min", "22 min", "9 min", "17 min"];
      row.innerHTML =
        '<span class="lesson-check' + (l[1] ? " done" : "") + '" role="checkbox" tabindex="0" aria-checked="' + l[1] + '">' + (l[1] ? "✓" : "") + '</span>' +
        '<span class="lesson-name">' + l[0] + '</span>' +
        '<span class="lesson-dur">' + durs[i % durs.length] + '</span>';
      var chk = row.querySelector(".lesson-check");
      function toggle() {
        var on = chk.classList.toggle("done");
        row.classList.toggle("done", on);
        chk.textContent = on ? "✓" : "";
        chk.setAttribute("aria-checked", String(on));
        toast(on ? "Lesson published" : "Lesson unpublished");
      }
      chk.addEventListener("click", toggle);
      chk.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      list.appendChild(row);
    });

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      var ring = document.getElementById("dRing");
      ring.style.strokeDashoffset = circ * (1 - c.comp / 100);
    });
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
  }
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  /* ---------------------------- Questions ------------------------------- */
  function renderQuestions() {
    var list = document.getElementById("qList");
    list.innerHTML = "";
    QUESTIONS.forEach(function (q) {
      var li = document.createElement("li");
      li.className = "q-item" + (q.answered ? " answered" : "");
      li.innerHTML =
        '<div class="q-top">' +
          '<span class="q-ava" style="background:' + colorFor(q.who) + '">' + initials(q.who) + '</span>' +
          '<span><span class="q-who">' + q.who + '</span><br><span class="q-course">' + q.course + '</span></span>' +
          '<span class="q-time">' + q.time + '</span>' +
        '</div>' +
        '<p class="q-text">' + q.text + '</p>' +
        '<div class="q-actions"></div>';
      var actions = li.querySelector(".q-actions");
      if (q.answered) {
        actions.innerHTML = '<span class="q-answered-tag">✓ Replied</span>';
      } else {
        var replyBtn = document.createElement("button");
        replyBtn.className = "btn-sm primary";
        replyBtn.textContent = "Reply";
        var laterBtn = document.createElement("button");
        laterBtn.className = "btn-sm";
        laterBtn.textContent = "Mark later";
        actions.appendChild(replyBtn);
        actions.appendChild(laterBtn);

        replyBtn.addEventListener("click", function () { showReplyBox(li, q); });
        laterBtn.addEventListener("click", function () { toast("Saved to follow-up list"); });
      }
      list.appendChild(li);
    });
    updateQStats();
  }

  function showReplyBox(li, q) {
    var actions = li.querySelector(".q-actions");
    if (li.querySelector(".q-reply-box")) { li.querySelector("textarea").focus(); return; }
    actions.style.display = "none";
    var box = document.createElement("div");
    box.className = "q-reply-box";
    box.innerHTML = '<textarea placeholder="Reply to ' + q.who.split(" ")[0] + '…" aria-label="Reply"></textarea>' +
      '<button class="btn-sm primary" type="button">Send</button>';
    var ta = box.querySelector("textarea");
    var send = box.querySelector("button");
    li.appendChild(box);
    ta.focus();
    function submit() {
      if (!ta.value.trim()) { ta.focus(); toast("Write a reply first"); return; }
      q.answered = true;
      box.remove();
      li.classList.add("answered");
      actions.style.display = "";
      actions.innerHTML = '<span class="q-answered-tag">✓ Replied</span>';
      toast("Reply sent to " + q.who.split(" ")[0]);
      updateQStats();
    }
    send.addEventListener("click", submit);
    ta.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
    });
  }

  function updateQStats() {
    var open = QUESTIONS.filter(function (q) { return !q.answered; }).length;
    var answered = QUESTIONS.length - open;
    document.getElementById("qOpen").textContent = open;
    var rate = Math.round((answered / QUESTIONS.length) * 100);
    document.getElementById("qReplyRate").textContent = rate + "% reply rate";
  }

  /* -------------------------- Recent enrollments ------------------------ */
  function makeEnrollment() {
    var name = FIRST[Math.floor(Math.random() * FIRST.length)] + " " + LAST[Math.floor(Math.random() * LAST.length)];
    var course = COURSES[Math.floor(Math.random() * COURSES.length)];
    var prices = [19, 24, 29, 39, 49];
    var amt = prices[Math.floor(Math.random() * prices.length)];
    return { name: name, course: course.title, amt: amt };
  }

  function renderEnrollItem(e, isNew) {
    var li = document.createElement("li");
    li.className = "enroll-item";
    li.innerHTML =
      '<span class="enroll-ava" style="background:' + colorFor(e.name) + '">' + initials(e.name) + '</span>' +
      '<div class="enroll-main"><div class="enroll-who">' + e.name + '</div>' +
      '<div class="enroll-course">' + e.course + '</div></div>' +
      '<div class="enroll-meta"><div class="enroll-amt">+' + money(e.amt) + '</div>' +
      '<div class="enroll-time">' + (isNew ? "just now" : "") + '</div></div>';
    return li;
  }

  function seedEnrollments() {
    var list = document.getElementById("enrollList");
    var seed = [
      { name: "Amara Okafor", course: "Modern JavaScript: From Zero to Pro", amt: 49, t: "2 min ago" },
      { name: "Leo Nguyen", course: "Practical Python for Automation", amt: 29, t: "6 min ago" },
      { name: "Sofia Costa", course: "UX Foundations for Developers", amt: 24, t: "11 min ago" },
      { name: "Noah Schmidt", course: "Data Visualization with D3", amt: 39, t: "18 min ago" },
      { name: "Yuki Tanaka", course: "System Design Interview Crash Course", amt: 49, t: "25 min ago" }
    ];
    seed.forEach(function (e) {
      var li = renderEnrollItem(e, false);
      li.querySelector(".enroll-time").textContent = e.t;
      list.appendChild(li);
    });
  }

  function startEnrollFeed() {
    var list = document.getElementById("enrollList");
    setInterval(function () {
      var e = makeEnrollment();
      var li = renderEnrollItem(e, true);
      list.insertBefore(li, list.firstChild);
      while (list.children.length > 8) list.removeChild(list.lastChild);
      // age previous "just now" labels
      Array.prototype.slice.call(list.children, 1).forEach(function (row) {
        var t = row.querySelector(".enroll-time");
        if (t.textContent === "just now") t.textContent = "1 min ago";
      });
    }, 6500);
  }

  /* --------------------------- Timeframe toggle ------------------------- */
  document.querySelectorAll(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".seg-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      current = btn.getAttribute("data-range");
      renderKPIs();
      drawChart();
      toast("Showing " + RANGES[current].label.toLowerCase());
    });
  });

  /* --------------------------- Mobile menu ------------------------------ */
  document.getElementById("menuBtn").addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("open");
  });

  /* ------------------------------- Init --------------------------------- */
  renderKPIs();
  drawChart();
  renderCourses();
  renderQuestions();
  seedEnrollments();
  startEnrollFeed();

  window.addEventListener("resize", function () {
    clearTimeout(window.__rcTimer);
    window.__rcTimer = setTimeout(drawChart, 180);
  });
})();
