(function () {
  "use strict";

  /* ----------------------------- Data ----------------------------- */
  // status order used for "advance": draft -> review -> scheduled -> published
  var FLOW = ["draft", "review", "scheduled", "published"];
  var STATUS_LABEL = {
    draft: "Draft",
    review: "In review",
    scheduled: "Scheduled",
    published: "Published",
  };

  var stories = [
    {
      id: "s1",
      headline: "City Council clears funding for the harbour seawall",
      sub: "Eleven-hour session ends with a 6–3 vote",
      author: "Daniela Brun",
      desk: "Politics",
      status: "review",
      time: "11:00",
      rel: "in 1h 48m",
      breaking: false,
    },
    {
      id: "s2",
      headline: "Storm surge swamps the lower harbour overnight",
      sub: "Wire copy filed; awaiting confirmation on casualties",
      author: "Marcus Okonkwo",
      desk: "Politics",
      status: "review",
      time: "—",
      rel: "needs sign-off",
      breaking: true,
    },
    {
      id: "s3",
      headline: "Quarterly earnings surprise lifts Meridian Rail shares",
      sub: "Up 9% in pre-market trading",
      author: "Priya Anand",
      desk: "Business",
      status: "scheduled",
      time: "12:30",
      rel: "in 3h 18m",
      breaking: false,
    },
    {
      id: "s4",
      headline: "Inside the warehouse turning yesterday’s bread into beer",
      sub: "A feature on the city’s zero-waste brewers",
      author: "Theo Vance",
      desk: "Culture",
      status: "draft",
      time: "—",
      rel: "no slot yet",
      breaking: false,
    },
    {
      id: "s5",
      headline: "Astronomers trace a stray comet to the outer belt",
      sub: "Findings published in this morning’s journal",
      author: "Lena Castellanos",
      desk: "Science",
      status: "published",
      time: "08:05",
      rel: "1h 7m ago",
      breaking: false,
    },
    {
      id: "s6",
      headline: "Meridian United edge the derby in stoppage time",
      sub: "Match report and reaction",
      author: "Owen Fitzgerald",
      desk: "Sports",
      status: "published",
      time: "07:40",
      rel: "1h 32m ago",
      breaking: false,
    },
    {
      id: "s7",
      headline: "The mayor’s budget, line by line: where the money goes",
      sub: "An interactive breakdown for subscribers",
      author: "Daniela Brun",
      desk: "Politics",
      status: "scheduled",
      time: "14:00",
      rel: "in 4h 48m",
      breaking: false,
    },
    {
      id: "s8",
      headline: "A small press bets the city still reads poetry",
      sub: "Profile of the Lamplight imprint",
      author: "Theo Vance",
      desk: "Culture",
      status: "draft",
      time: "—",
      rel: "no slot yet",
      breaking: false,
    },
    {
      id: "s9",
      headline: "Regulators open inquiry into ferry operator’s safety record",
      sub: "Documents obtained by the Ledger",
      author: "Priya Anand",
      desk: "Business",
      status: "review",
      time: "—",
      rel: "needs legal read",
      breaking: false,
    },
    {
      id: "s10",
      headline: "Lab-grown coral gives the bay’s reef a fighting chance",
      sub: "Scientists report first signs of recovery",
      author: "Lena Castellanos",
      desk: "Science",
      status: "scheduled",
      time: "16:30",
      rel: "in 7h 18m",
      breaking: false,
    },
    {
      id: "s11",
      headline: "Veteran striker calls time on a sixteen-year career",
      sub: "Exclusive sit-down interview",
      author: "Owen Fitzgerald",
      desk: "Sports",
      status: "draft",
      time: "—",
      rel: "no slot yet",
      breaking: false,
    },
    {
      id: "s12",
      headline: "Opinion: The seawall vote is only the first bill we’ll pay",
      sub: "Editorial board",
      author: "Rosalind Hale",
      desk: "Politics",
      status: "published",
      time: "06:15",
      rel: "2h 57m ago",
      breaking: false,
    },
    {
      id: "s13",
      headline: "How the night markets reshaped the old textile quarter",
      sub: "Photo essay",
      author: "Theo Vance",
      desk: "Culture",
      status: "published",
      time: "07:00",
      rel: "2h 12m ago",
      breaking: false,
    },
    {
      id: "s14",
      headline: "Rail unions and operator return to the table",
      sub: "Talks resume after a week of silence",
      author: "Priya Anand",
      desk: "Business",
      status: "scheduled",
      time: "10:45",
      rel: "in 1h 33m",
      breaking: false,
    },
  ];

  var attention = [
    {
      kind: "breaking",
      title: "Storm surge swamps the lower harbour overnight",
      meta: "Marcus Okonkwo · Politics desk",
      time: "08:54",
      cta: "Open for review",
      target: "s2",
    },
    {
      kind: "review",
      title: "Ferry operator inquiry — pending legal read",
      meta: "Priya Anand · Business desk",
      time: "08:31",
      cta: "Send to copy",
      target: "s9",
    },
    {
      kind: "review",
      title: "Seawall funding vote — fact-check the tally",
      meta: "Daniela Brun · Politics desk",
      time: "08:10",
      cta: "Assign checker",
      target: "s1",
    },
  ];

  var feed = [
    { dot: "ok", html: "<strong>Lena Castellanos</strong> published “Astronomers trace a stray comet to the outer belt.”", time: "08:05 · Science desk" },
    { dot: "red", html: "<strong>Marcus Okonkwo</strong> filed a breaking wire from the harbour district.", time: "08:54 · Politics desk" },
    { dot: "warn", html: "<strong>Copy desk</strong> flagged two figures for verification on the seawall story.", time: "08:22 · Standards" },
    { dot: "", html: "<strong>Priya Anand</strong> moved “Quarterly earnings surprise” to the noon slot.", time: "07:58 · Business desk" },
    { dot: "ok", html: "<strong>Owen Fitzgerald</strong> published the derby match report.", time: "07:40 · Sports desk" },
    { dot: "", html: "<strong>Rosalind Hale</strong> scheduled the budget breakdown for 14:00.", time: "07:31 · Editor" },
  ];

  /* --------------------------- Helpers --------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* --------------------------- State ---------------------------- */
  var filters = { status: "all", section: "all", query: "" };

  /* ----------------------- Render: queue ------------------------ */
  var queueBody = $("#queueBody");
  var emptyState = $("#emptyState");

  function matches(story) {
    if (filters.status !== "all" && story.status !== filters.status) return false;
    if (filters.section !== "all" && story.desk !== filters.section) return false;
    if (filters.query) {
      var hay = (story.headline + " " + story.author + " " + story.desk + " " + story.sub).toLowerCase();
      if (hay.indexOf(filters.query) === -1) return false;
    }
    return true;
  }

  function renderQueue() {
    queueBody.innerHTML = "";
    var shown = 0;

    stories.forEach(function (story) {
      if (!matches(story)) return;
      shown++;

      var tr = el("tr");
      tr.dataset.id = story.id;

      // headline
      var tdHead = el("td");
      var breakingTag = story.breaking ? '<span class="breaking-tag">Breaking</span>' : "";
      tdHead.innerHTML =
        '<div class="story-head">' + breakingTag + escapeHtml(story.headline) + "</div>" +
        '<div class="story-sub">' + escapeHtml(story.sub) + "</div>";
      tr.appendChild(tdHead);

      // author / desk
      var tdAuthor = el("td", "col-author");
      tdAuthor.innerHTML =
        '<span class="author-cell">' +
        '<span class="author-name">' + escapeHtml(story.author) + "</span>" +
        '<span class="author-desk">' + escapeHtml(story.desk) + "</span></span>";
      tr.appendChild(tdAuthor);

      // status pill
      var tdStatus = el("td", "col-status");
      tdStatus.innerHTML =
        '<span class="status-pill" data-s="' + story.status + '">' + STATUS_LABEL[story.status] + "</span>";
      tr.appendChild(tdStatus);

      // time
      var tdTime = el("td", "col-time");
      tdTime.innerHTML =
        '<span class="time-cell">' + escapeHtml(story.time) +
        '<span class="time-rel">' + escapeHtml(story.rel) + "</span></span>";
      tr.appendChild(tdTime);

      // actions
      var tdAct = el("td", "col-act");
      var isLast = story.status === "published";
      var nextLabel = isLast ? "Published" : "Advance →";
      tdAct.innerHTML =
        '<div class="row-actions">' +
        '<button class="act" type="button" data-action="open">Open</button>' +
        '<button class="act act--advance" type="button" data-action="advance"' +
        (isLast ? " disabled" : "") + ">" + nextLabel + "</button>" +
        "</div>";
      tr.appendChild(tdAct);

      queueBody.appendChild(tr);
    });

    emptyState.hidden = shown !== 0;
  }

  function advance(story, rowEl) {
    var idx = FLOW.indexOf(story.status);
    if (idx === -1 || idx >= FLOW.length - 1) return;
    story.status = FLOW[idx + 1];

    if (story.status === "published") {
      story.time = nowHM();
      story.rel = "just now";
      story.breaking = false;
    } else if (story.status === "scheduled" && story.time === "—") {
      story.time = "soon";
      story.rel = "slot pending";
    }

    toast("Moved to " + STATUS_LABEL[story.status] + ": “" + truncate(story.headline, 42) + "”");
    renderQueue();
    flashRow(story.id);
    pushActivity(story);
    bumpKpisForStatus(story.status);
  }

  function flashRow(id) {
    var row = queueBody.querySelector('tr[data-id="' + id + '"]');
    if (!row) return;
    row.animate(
      [{ background: "rgba(180,41,31,0.14)" }, { background: "transparent" }],
      { duration: 700, easing: "ease-out" }
    );
  }

  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function nowHM() {
    var d = new Date();
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }

  // delegated clicks on queue
  queueBody.addEventListener("click", function (e) {
    var btn = e.target.closest("button.act");
    if (!btn) return;
    var row = e.target.closest("tr");
    var story = stories.filter(function (s) { return s.id === row.dataset.id; })[0];
    if (!story) return;

    if (btn.dataset.action === "advance") {
      advance(story, row);
    } else if (btn.dataset.action === "open") {
      toast("Opening “" + truncate(story.headline, 46) + "” in the editor…");
    }
  });

  /* --------------------- Render: attention ---------------------- */
  function renderAttention() {
    var list = $("#attnList");
    list.innerHTML = "";
    attention.forEach(function (a) {
      var li = el("li", "attn-item");
      var flagCls = a.kind === "breaking" ? "attn-flag--breaking" : "attn-flag--review";
      var flagText = a.kind === "breaking" ? "Breaking" : "Awaiting review";
      li.innerHTML =
        '<div class="attn-top">' +
        '<span class="attn-flag ' + flagCls + '">' + flagText + "</span>" +
        '<span class="attn-time">' + a.time + "</span></div>" +
        '<div class="attn-title">' + escapeHtml(a.title) + "</div>" +
        '<div class="attn-meta">' + escapeHtml(a.meta) + "</div>" +
        '<button class="attn-cta" type="button" data-target="' + a.target + '">' + a.cta + "</button>";
      list.appendChild(li);
    });

    list.addEventListener("click", function (e) {
      var cta = e.target.closest(".attn-cta");
      if (!cta) return;
      var story = stories.filter(function (s) { return s.id === cta.dataset.target; })[0];
      if (story) {
        // surface the story in the queue and advance it
        setStatusFilter("all");
        $("#sectionFilter").value = "all";
        filters.section = "all";
        advance(story, null);
        var row = queueBody.querySelector('tr[data-id="' + story.id + '"]');
        if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast("Handled — item cleared from the desk.");
      }
    });
  }

  /* ----------------------- Render: feed ------------------------- */
  function renderFeed() {
    var list = $("#feedList");
    list.innerHTML = "";
    feed.forEach(function (f) { list.appendChild(feedNode(f)); });
  }
  function feedNode(f) {
    var li = el("li", "feed-item");
    var dotCls = "feed-dot" + (f.dot ? " feed-dot--" + f.dot : "");
    li.innerHTML =
      '<span class="' + dotCls + '" aria-hidden="true"></span>' +
      '<div class="feed-body"><div class="feed-text">' + f.html + "</div>" +
      '<div class="feed-time">' + f.time + "</div></div>";
    return li;
  }
  function pushActivity(story) {
    var dot = story.status === "published" ? "ok" : story.status === "review" ? "warn" : "";
    var verb = {
      review: "sent to review",
      scheduled: "scheduled",
      published: "published",
    }[story.status] || "updated";
    var node = feedNode({
      dot: dot,
      html: "<strong>You</strong> " + verb + " “" + escapeHtml(truncate(story.headline, 48)) + ".”",
      time: nowHM() + " · " + story.desk + " desk",
    });
    var list = $("#feedList");
    list.insertBefore(node, list.firstChild);
    node.animate(
      [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 320, easing: "ease-out" }
    );
  }

  /* --------------------------- KPIs ----------------------------- */
  function formatNum(n, compact) {
    if (compact && n >= 1000) {
      return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K";
    }
    return n.toLocaleString("en-US");
  }

  function animateKpi(node) {
    var target = parseInt(node.getAttribute("data-count"), 10) || 0;
    var compact = node.getAttribute("data-format") === "compact";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.textContent = formatNum(target, compact);
      return;
    }
    var dur = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      node.textContent = formatNum(Math.round(target * eased), compact);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = formatNum(target, compact);
    }
    requestAnimationFrame(step);
  }

  function animateAllKpis() {
    document.querySelectorAll(".kpi-num").forEach(animateKpi);
  }

  // map status changes to a KPI label so the strip stays believable
  function bumpKpisForStatus(status) {
    var labelMap = {
      review: "In review",
      scheduled: "Scheduled",
      published: "Published today",
    };
    var label = labelMap[status];
    if (!label) return;
    document.querySelectorAll(".kpi").forEach(function (kpi) {
      var l = kpi.querySelector(".kpi-label");
      if (l && l.textContent.trim() === label) {
        var num = kpi.querySelector(".kpi-num");
        var cur = parseInt(num.getAttribute("data-count"), 10) || 0;
        num.setAttribute("data-count", cur + 1);
        animateKpi(num);
        kpi.animate(
          [{ background: "rgba(180,41,31,0.10)" }, { background: getComputedStyle(kpi).backgroundColor }],
          { duration: 600, easing: "ease-out" }
        );
      }
    });
  }

  /* ------------------------- Filters UI ------------------------- */
  function setStatusFilter(status) {
    filters.status = status;
    document.querySelectorAll('[data-filter-group="status"] .chip').forEach(function (chip) {
      var on = chip.dataset.status === status;
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderQueue();
  }

  document.querySelectorAll('[data-filter-group="status"] .chip').forEach(function (chip) {
    chip.addEventListener("click", function () {
      setStatusFilter(chip.dataset.status);
    });
  });

  $("#sectionFilter").addEventListener("change", function (e) {
    filters.section = e.target.value;
    renderQueue();
  });

  $("#globalSearch").addEventListener("input", function (e) {
    filters.query = e.target.value.trim().toLowerCase();
    renderQueue();
  });

  /* ----------------------- Topbar buttons ----------------------- */
  $("#newStoryBtn").addEventListener("click", function () {
    var draft = {
      id: "s" + (stories.length + 1) + "-" + Date.now(),
      headline: "Untitled story — assign a desk to begin",
      sub: "New draft · started just now",
      author: "Rosalind Hale",
      desk: "Politics",
      status: "draft",
      time: "—",
      rel: "no slot yet",
      breaking: false,
    };
    stories.unshift(draft);
    setStatusFilter("all");
    $("#sectionFilter").value = "all";
    filters.section = "all";
    filters.query = "";
    $("#globalSearch").value = "";
    renderQueue();
    flashRow(draft.id);
    // bump the "In draft" KPI to reflect the new item entering production
    document.querySelectorAll(".kpi").forEach(function (kpi) {
      var l = kpi.querySelector(".kpi-label");
      if (l && l.textContent.trim() === "In draft") {
        var num = kpi.querySelector(".kpi-num");
        num.setAttribute("data-count", (parseInt(num.getAttribute("data-count"), 10) || 0) + 1);
        animateKpi(num);
      }
    });
    toast("New draft created — top of the queue.");
  });

  $("#refreshBtn").addEventListener("click", function () {
    animateAllKpis();
    toast("Feed refreshed · " + nowHM());
  });

  /* ------------------------- Init ------------------------------- */
  renderQueue();
  renderAttention();
  renderFeed();

  // animate KPIs once the strip is in view (or immediately if already visible)
  var kpiStrip = $(".kpis");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateAllKpis();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(kpiStrip);
  } else {
    animateAllKpis();
  }
})();
