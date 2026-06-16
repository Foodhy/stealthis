(function () {
  "use strict";

  // ---------- In-memory data ----------
  var chapters = [
    { n: 1, title: "Severance Chip", date: "2025-09-02", grad: "linear-gradient(135deg,#1b1140,#ff2e4d)", read: false },
    { n: 2, title: "Thirteen Districts", date: "2025-09-16", grad: "linear-gradient(135deg,#0d2b4d,#2e6bff)", read: false },
    { n: 3, title: "Firewall Blade", date: "2025-10-01", grad: "linear-gradient(135deg,#3a0f3f,#ffd23f)", read: false },
    { n: 4, title: "The Helix Debt", date: "2025-10-19", grad: "linear-gradient(135deg,#14233b,#ff2e4d)", read: false },
    { n: 5, title: "Rewritten Memory", date: "2025-11-04", grad: "linear-gradient(135deg,#2a0d2e,#2e6bff)", read: false },
    { n: 6, title: "Loyalty Subscription", date: "2025-11-23", grad: "linear-gradient(135deg,#10283f,#ffd23f)", read: false },
    { n: 7, title: "A Clean Death", date: "2025-12-08", grad: "linear-gradient(135deg,#1b1140,#ff2e4d)", read: false }
  ];

  var sortNewest = true;

  // ---------- Elements ----------
  var listEl = document.getElementById("chapterList");
  var sortBtn = document.getElementById("sortBtn");
  var libBtn = document.getElementById("libBtn");
  var startBtn = document.getElementById("startBtn");
  var topReadBtn = document.getElementById("topReadBtn");
  var readMoreBtn = document.getElementById("readMore");
  var synopsis = document.getElementById("synopsis");
  var progressFill = document.getElementById("progressFill");
  var progressLabel = document.getElementById("progressLabel");
  var statRead = document.getElementById("statRead");
  var statChapters = document.getElementById("statChapters");
  var statTotal = document.getElementById("statTotal");
  var toastEl = document.getElementById("toast");

  statChapters.textContent = chapters.length;
  statTotal.textContent = chapters.length;

  // ---------- Toast helper ----------
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // ---------- Render ----------
  function render() {
    var ordered = chapters.slice().sort(function (a, b) {
      return sortNewest ? b.n - a.n : a.n - b.n;
    });

    listEl.innerHTML = "";
    ordered.forEach(function (ch) {
      var li = document.createElement("li");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chapter";
      btn.dataset.n = String(ch.n);
      btn.dataset.read = String(ch.read);
      btn.setAttribute("aria-pressed", String(ch.read));

      var thumb = document.createElement("span");
      thumb.className = "chapter__thumb";
      thumb.setAttribute("aria-hidden", "true");
      thumb.style.backgroundImage = "var(--halftone)," + ch.grad;
      thumb.textContent = "#" + ch.n;

      var body = document.createElement("span");
      body.className = "chapter__body";
      var kicker = document.createElement("span");
      kicker.className = "chapter__kicker";
      kicker.textContent = "Chapter " + ch.n;
      var title = document.createElement("span");
      title.className = "chapter__title";
      title.textContent = ch.title;
      var date = document.createElement("span");
      date.className = "chapter__date";
      date.textContent = fmtDate(ch.date);
      body.appendChild(kicker);
      body.appendChild(title);
      body.appendChild(date);

      var state = document.createElement("span");
      state.className = "chapter__state";
      state.textContent = ch.read ? "✓ Read" : "Unread";

      btn.appendChild(thumb);
      btn.appendChild(body);
      btn.appendChild(state);
      btn.setAttribute("aria-label",
        "Chapter " + ch.n + ", " + ch.title + ", " + (ch.read ? "read" : "unread"));

      btn.addEventListener("click", function () {
        markRead(ch.n);
      });

      li.appendChild(btn);
      listEl.appendChild(li);
    });

    updateProgress();
  }

  function updateProgress() {
    var readCount = chapters.filter(function (c) { return c.read; }).length;
    var pct = Math.round((readCount / chapters.length) * 100);
    progressFill.style.width = pct + "%";
    progressLabel.textContent = pct + "%";
    statRead.textContent = readCount;
  }

  // ---------- Interactions ----------
  function markRead(n) {
    var ch = chapters.find(function (c) { return c.n === n; });
    if (!ch) return;
    if (ch.read) {
      toast("Already read — Chapter " + n);
      updateProgress();
      return;
    }
    ch.read = true;
    render();
    toast("Marked Chapter " + n + " as read");
  }

  sortBtn.addEventListener("click", function () {
    sortNewest = !sortNewest;
    sortBtn.textContent = sortNewest ? "↕ Newest" : "↕ Oldest";
    sortBtn.setAttribute("aria-label",
      "Sort chapters, currently " + (sortNewest ? "newest" : "oldest") + " first");
    render();
    toast("Sorted " + (sortNewest ? "newest first" : "oldest first"));
  });

  var inLibrary = false;
  libBtn.addEventListener("click", function () {
    inLibrary = !inLibrary;
    libBtn.setAttribute("aria-pressed", String(inLibrary));
    libBtn.textContent = inLibrary ? "✓ In library" : "＋ Add to library";
    toast(inLibrary ? "Added Neon Ronin to your library" : "Removed from library");
  });

  function continueReading() {
    // first unread by chapter number
    var next = chapters.slice().sort(function (a, b) { return a.n - b.n; })
      .find(function (c) { return !c.read; });
    if (!next) {
      toast("You're all caught up!");
      return;
    }
    markRead(next.n);
  }

  startBtn.addEventListener("click", continueReading);
  topReadBtn.addEventListener("click", continueReading);

  readMoreBtn.addEventListener("click", function () {
    var collapsed = synopsis.dataset.collapsed === "true";
    synopsis.dataset.collapsed = String(!collapsed);
    readMoreBtn.setAttribute("aria-expanded", String(collapsed));
    readMoreBtn.textContent = collapsed ? "Read less ▴" : "Read more ▾";
  });

  render();
})();
