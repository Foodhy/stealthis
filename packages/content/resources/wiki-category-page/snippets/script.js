(function () {
  "use strict";

  /* ---------- Data: fictional but real-feeling distributed-systems articles ---------- */
  var ARTICLES = [
    { t: "Aurora DB", tag: "system" },
    { t: "Acceptor Quorum", tag: "concept" },
    { t: "Anti-Entropy Repair", tag: "concept" },
    { t: "Append-Only Log", tag: "concept" },
    { t: "Bloom Filter Index", tag: "structure" },
    { t: "Byzantine Fault Tolerance", tag: "concept" },
    { t: "Backpressure Control", tag: "concept" },
    { t: "Bucket Sharding", tag: "concept" },
    { t: "CAP Theorem", tag: "theorem" },
    { t: "Causal Consistency", tag: "model" },
    { t: "Chandy–Lamport Snapshot", tag: "algorithm" },
    { t: "Consistent Hashing", tag: "algorithm" },
    { t: "Compaction Strategy", tag: "concept" },
    { t: "Distributed Lock", tag: "primitive" },
    { t: "Dynamo Replication", tag: "system" },
    { t: "Delta CRDT", tag: "structure" },
    { t: "Epoch Fencing", tag: "concept" },
    { t: "Eventual Consistency", tag: "model" },
    { t: "Exactly-Once Delivery", tag: "concept" },
    { t: "Failure Detector", tag: "primitive" },
    { t: "Flow-Control Window", tag: "concept" },
    { t: "Gossip Protocol", tag: "protocol" },
    { t: "Gray Failure", tag: "concept" },
    { t: "Hinted Handoff", tag: "concept" },
    { t: "Heartbeat Lease", tag: "primitive" },
    { t: "Idempotency Key", tag: "concept" },
    { t: "Invariant Confluence", tag: "theory" },
    { t: "Jepsen Test Harness", tag: "tooling" },
    { t: "Kafka Partition Log", tag: "system" },
    { t: "Lamport Timestamp", tag: "concept" },
    { t: "Leaderless Replication", tag: "concept" },
    { t: "Linearizability", tag: "model" },
    { t: "Log-Structured Merge Tree", tag: "structure" },
    { t: "Merkle Tree Sync", tag: "structure" },
    { t: "Multi-Paxos", tag: "algorithm" },
    { t: "Membership Protocol", tag: "protocol" },
    { t: "Network Partition", tag: "concept" },
    { t: "Nimbus Scheduler", tag: "system" },
    { t: "Optimistic Concurrency", tag: "concept" },
    { t: "Operation Transform", tag: "algorithm" },
    { t: "Paxos", tag: "algorithm" },
    { t: "Phi Accrual Detector", tag: "algorithm" },
    { t: "Primary-Backup Replication", tag: "concept" },
    { t: "Quorum Reads", tag: "concept" },
    { t: "Quiescent Consistency", tag: "model" },
    { t: "Raft Consensus", tag: "algorithm" },
    { t: "Read Repair", tag: "concept" },
    { t: "Replication Lag", tag: "concept" },
    { t: "Saga Pattern", tag: "pattern" },
    { t: "Sequential Consistency", tag: "model" },
    { t: "Split-Brain", tag: "concept" },
    { t: "State Machine Replication", tag: "concept" },
    { t: "Two-Phase Commit", tag: "protocol" },
    { t: "Tunable Consistency", tag: "concept" },
    { t: "Vector Clock", tag: "structure" },
    { t: "Verdant Stack", tag: "system" },
    { t: "View Synchrony", tag: "concept" },
    { t: "Write-Ahead Log", tag: "structure" },
    { t: "Witness Replica", tag: "concept" },
    { t: "Zab Protocol", tag: "protocol" },
    { t: "Zone-Aware Routing", tag: "concept" }
  ];

  var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  var groupsEl = document.getElementById("articleGroups");
  var azBar = document.getElementById("azBar");
  var filterInput = document.getElementById("articleFilter");
  var filterCount = document.getElementById("filterCount");
  var noResults = document.getElementById("noResults");
  var statArticles = document.getElementById("statArticles");

  /* ---------- Build grouped article lists ---------- */
  var byLetter = {};
  ALPHABET.forEach(function (l) { byLetter[l] = []; });
  ARTICLES.forEach(function (a) {
    var letter = a.t[0].toUpperCase();
    if (!byLetter[letter]) byLetter[letter] = [];
    byLetter[letter].push(a);
  });
  Object.keys(byLetter).forEach(function (l) {
    byLetter[l].sort(function (x, y) { return x.t.localeCompare(y.t); });
  });

  statArticles.textContent = String(ARTICLES.length);

  function buildGroups() {
    var frag = document.createDocumentFragment();
    ALPHABET.forEach(function (letter) {
      var items = byLetter[letter];
      if (!items || !items.length) return;

      var group = document.createElement("section");
      group.className = "letter-group";
      group.id = "letter-" + letter;
      group.setAttribute("aria-labelledby", "head-" + letter);

      var head = document.createElement("div");
      head.className = "letter-head";
      head.id = "head-" + letter;
      head.innerHTML =
        '<span class="letter">' + letter + "</span>" +
        '<span class="letter-meta">' + items.length +
        (items.length === 1 ? " page" : " pages") + "</span>";
      group.appendChild(head);

      var ul = document.createElement("ul");
      ul.className = "article-list";
      items.forEach(function (a) {
        var li = document.createElement("li");
        var link = document.createElement("a");
        link.href = "#";
        link.dataset.title = a.t.toLowerCase();
        link.innerHTML =
          escapeHtml(a.t) +
          '<span class="art-tag">' + escapeHtml(a.tag) + "</span>";
        link.addEventListener("click", function (e) {
          e.preventDefault();
          toast("Opening “" + a.t + "”");
        });
        li.appendChild(link);
        ul.appendChild(li);
      });
      group.appendChild(ul);
      frag.appendChild(group);
    });
    groupsEl.appendChild(frag);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- A–Z jump bar ---------- */
  function buildAzBar() {
    var frag = document.createDocumentFragment();
    var allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.textContent = "All";
    allBtn.style.width = "auto";
    allBtn.style.padding = "0 10px";
    allBtn.className = "is-active";
    allBtn.dataset.letter = "ALL";
    frag.appendChild(allBtn);

    ALPHABET.forEach(function (letter) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      if (!byLetter[letter] || !byLetter[letter].length) {
        btn.disabled = true;
      }
      frag.appendChild(btn);
    });
    azBar.appendChild(frag);

    azBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      setActiveLetter(btn.dataset.letter);
    });
  }

  function setActiveLetter(letter) {
    azBar.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.letter === letter);
    });
    if (letter === "ALL") {
      groupsEl.querySelector(".letter-group");
      window.scrollTo({ top: groupsEl.offsetTop - 100, behavior: "smooth" });
      return;
    }
    var target = document.getElementById("letter-" + letter);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.querySelector(".letter").animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
        { duration: 360, easing: "ease-out" }
      );
    }
  }

  /* ---------- Live filter ---------- */
  var filterTimer = null;
  function applyFilter(q) {
    q = q.trim().toLowerCase();
    var shown = 0;
    var groups = groupsEl.querySelectorAll(".letter-group");
    groups.forEach(function (group) {
      var visibleInGroup = 0;
      group.querySelectorAll(".article-list li").forEach(function (li) {
        var title = li.querySelector("a").dataset.title;
        var match = !q || title.indexOf(q) !== -1;
        li.classList.toggle("is-hidden", !match);
        if (match) { visibleInGroup++; shown++; }
      });
      group.classList.toggle("is-hidden", visibleInGroup === 0);
    });

    noResults.hidden = shown !== 0;

    if (q) {
      filterCount.textContent = shown + (shown === 1 ? " match" : " matches");
    } else {
      filterCount.textContent = "";
    }

    // disable A–Z buttons whose group is now empty
    azBar.querySelectorAll("button").forEach(function (b) {
      var letter = b.dataset.letter;
      if (letter === "ALL") return;
      var g = document.getElementById("letter-" + letter);
      var hasVisible = g && !g.classList.contains("is-hidden");
      var emptyData = !byLetter[letter] || !byLetter[letter].length;
      b.disabled = emptyData || !hasVisible;
    });
  }

  filterInput.addEventListener("input", function () {
    var v = filterInput.value;
    clearTimeout(filterTimer);
    filterTimer = setTimeout(function () { applyFilter(v); }, 80);
  });

  /* ---------- Density toggle ---------- */
  var viewList = document.getElementById("viewList");
  var viewGrid = document.getElementById("viewGrid");

  function setDensity(grid) {
    groupsEl.classList.toggle("is-grid", grid);
    viewGrid.classList.toggle("is-active", grid);
    viewList.classList.toggle("is-active", !grid);
    viewGrid.setAttribute("aria-pressed", String(grid));
    viewList.setAttribute("aria-pressed", String(!grid));
    toast(grid ? "Grid view" : "List view");
  }
  viewList.addEventListener("click", function () { setDensity(false); });
  viewGrid.addEventListener("click", function () { setDensity(true); });

  /* ---------- Sidebar drawer ---------- */
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");

  function openNav(open) {
    sidebar.classList.toggle("is-open", open);
    scrim.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
  }
  navToggle.addEventListener("click", function () {
    openNav(!sidebar.classList.contains("is-open"));
  });
  scrim.addEventListener("click", function () { openNav(false); });
  sidebar.addEventListener("click", function (e) {
    if (e.target.closest("a") && window.matchMedia("(max-width: 820px)").matches) {
      openNav(false);
    }
  });

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1800);
  }

  /* ---------- Keyboard shortcuts ---------- */
  var topSearch = document.getElementById("topSearch");
  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) {
      e.preventDefault();
      topSearch.focus();
      topSearch.select();
    } else if (e.key === "Escape") {
      if (sidebar.classList.contains("is-open")) openNav(false);
      if (document.activeElement === filterInput && filterInput.value) {
        filterInput.value = "";
        applyFilter("");
      }
    }
  });

  // mirror top search into the in-page filter for convenience
  topSearch.addEventListener("input", function () {
    filterInput.value = topSearch.value;
    applyFilter(topSearch.value);
    if (topSearch.value) {
      document.getElementById("articleFilter")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  /* ---------- Init ---------- */
  buildGroups();
  buildAzBar();
})();
