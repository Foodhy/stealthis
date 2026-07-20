/* JSON Tree Viewer — vanilla, zero dependencies.
   Exposes window.JsonTreeViewer = { mount, attachShell } */
(function () {
  var INDENT = 18;

  function escHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function JsonViewer(container) {
    this.container = container;
    this.data = undefined;
    this.searchTerm = "";
    this._mi = 0;
    this.matchCount = 0;
    this.activeMatch = 0;
    this.onMatchesChanged = null;
  }

  JsonViewer.prototype.setData = function (data) {
    this.data = data;
    this.render();
  };

  JsonViewer.prototype.setSearch = function (term) {
    this.searchTerm = String(term || "").trim();
    this.activeMatch = 0;
    this.render();
  };

  /* Wrap every occurrence of the search term in <mark>, numbering them so
     navigation (prev/next) can address a specific hit. */
  JsonViewer.prototype._highlight = function (text) {
    var raw = String(text);
    if (!this.searchTerm) return escHtml(raw);
    var q = this.searchTerm.toLowerCase();
    var lower = raw.toLowerCase();
    var idx = lower.indexOf(q);
    if (idx === -1) return escHtml(raw);
    var out = "";
    var from = 0;
    while (idx !== -1) {
      out += escHtml(raw.slice(from, idx));
      out += '<mark class="jv-mark" data-mi="' + this._mi++ + '">' +
        escHtml(raw.slice(idx, idx + this.searchTerm.length)) + "</mark>";
      from = idx + this.searchTerm.length;
      idx = lower.indexOf(q, from);
    }
    return out + escHtml(raw.slice(from));
  };

  JsonViewer.prototype._matches = function (key, value) {
    if (!this.searchTerm) return false;
    var q = this.searchTerm.toLowerCase();
    if (key !== null && String(key).toLowerCase().indexOf(q) !== -1) return true;
    if (value === null || typeof value !== "object") {
      return String(value).toLowerCase().indexOf(q) !== -1;
    }
    return false;
  };

  JsonViewer.prototype._buildNode = function (key, value, depth, isLast) {
    var self = this;
    var node = document.createElement("div");
    node.className = "jv-node";

    var isObj = value !== null && typeof value === "object";
    var isArr = Array.isArray(value);
    var entries = isObj
      ? (isArr ? value.map(function (v, i) { return [i, v]; }) : Object.entries(value))
      : null;
    var isEmpty = isObj && entries.length === 0;
    var comma = isLast ? "" : '<span class="jv-comma">,</span>';

    var row = document.createElement("div");
    row.className = "jv-row" + (this._matches(key, value) ? " jv-highlight" : "");

    if (isObj && !isEmpty) {
      var indentEl = document.createElement("span");
      indentEl.className = "jv-indent";
      indentEl.style.width = depth * INDENT + "px";

      var toggle = document.createElement("span");
      toggle.className = "jv-toggle open";
      toggle.textContent = "▶";

      row.appendChild(indentEl);
      row.appendChild(toggle);
      row.appendChild(document.createTextNode(" "));

      if (key !== null) {
        var keyEl = document.createElement("span");
        keyEl.className = "jv-key";
        keyEl.innerHTML = '"' + this._highlight(key) + '"';
        var colonEl = document.createElement("span");
        colonEl.className = "jv-colon";
        colonEl.textContent = ":";
        row.appendChild(keyEl);
        row.appendChild(colonEl);
        row.appendChild(document.createTextNode(" "));
      }

      var bracketEl = document.createElement("span");
      bracketEl.className = "jv-bracket";
      bracketEl.textContent = isArr ? "[" : "{";
      row.appendChild(bracketEl);

      var collapsedEl = document.createElement("span");
      collapsedEl.className = "jv-collapsed";
      collapsedEl.hidden = true;
      collapsedEl.textContent = " … " + entries.length + " " +
        (isArr ? "items ]" : "keys }");
      row.appendChild(collapsedEl);

      var children = document.createElement("div");
      children.className = "jv-children";
      entries.forEach(function (pair, i) {
        children.appendChild(self._buildNode(pair[0], pair[1], depth + 1, i === entries.length - 1));
      });

      var closeRow = document.createElement("div");
      closeRow.className = "jv-row";
      closeRow.innerHTML =
        '<span class="jv-indent" style="width:' + depth * INDENT + 'px"></span>' +
        '<span class="jv-toggle-space"></span> <span class="jv-bracket">' +
        (isArr ? "]" : "}") + "</span>" + comma;

      row.style.cursor = "pointer";
      row.addEventListener("click", function () {
        var collapsed = children.classList.toggle("hidden");
        toggle.classList.toggle("open", !collapsed);
        collapsedEl.hidden = !collapsed;
        closeRow.hidden = collapsed;
      });

      node.appendChild(row);
      node.appendChild(children);
      node.appendChild(closeRow);
    } else {
      var valHtml;
      if (isEmpty) {
        valHtml = '<span class="jv-bracket">' + (isArr ? "[]" : "{}") + "</span>";
      } else if (value === null) {
        valHtml = '<span class="jv-val-null">null</span>';
      } else if (typeof value === "string") {
        valHtml = '<span class="jv-val-str">"' + this._highlight(value) + '"</span>';
      } else if (typeof value === "number") {
        valHtml = '<span class="jv-val-num">' + this._highlight(String(value)) + "</span>";
      } else if (typeof value === "boolean") {
        valHtml = '<span class="jv-val-bool">' + value + "</span>";
      } else {
        valHtml = escHtml(String(value));
      }
      var keyStr = key !== null
        ? '<span class="jv-key">"' + this._highlight(key) + '"</span><span class="jv-colon">:</span> '
        : "";
      row.innerHTML =
        '<span class="jv-indent" style="width:' + depth * INDENT + 'px"></span>' +
        '<span class="jv-toggle-space"></span> ' + keyStr + valHtml + comma;
      node.appendChild(row);
    }

    return node;
  };

  JsonViewer.prototype.render = function () {
    if (!this.container) return;
    this.container.innerHTML = "";
    this._mi = 0;
    if (this.data === undefined) {
      this.container.textContent = "—";
      this.matchCount = 0;
      if (this.onMatchesChanged) this.onMatchesChanged();
      return;
    }
    this.container.appendChild(this._buildNode(null, this.data, 0, true));
    this.matchCount = this._mi;
    if (this.activeMatch >= this.matchCount) this.activeMatch = 0;
    this._applyActiveMatch(false);
    if (this.onMatchesChanged) this.onMatchesChanged();
  };

  /* A hit can live inside collapsed branches — open every ancestor. */
  JsonViewer.prototype._revealAncestors = function (elm) {
    var childrenEl = elm.closest(".jv-children");
    while (childrenEl) {
      if (childrenEl.classList.contains("hidden")) {
        childrenEl.classList.remove("hidden");
        var row = childrenEl.previousElementSibling;
        if (row) {
          var t = row.querySelector(".jv-toggle");
          if (t) t.classList.add("open");
          var col = row.querySelector(".jv-collapsed");
          if (col) col.hidden = true;
        }
        var close = childrenEl.nextElementSibling;
        if (close) close.hidden = false;
      }
      childrenEl = childrenEl.parentElement ? childrenEl.parentElement.closest(".jv-children") : null;
    }
  };

  JsonViewer.prototype._applyActiveMatch = function (scroll) {
    if (!this.container) return;
    var marks = this.container.querySelectorAll("mark.jv-mark");
    marks.forEach(function (m) { m.classList.remove("jv-mark-active"); });
    if (!marks.length) return;
    if (this.activeMatch < 0) this.activeMatch = marks.length - 1;
    if (this.activeMatch >= marks.length) this.activeMatch = 0;
    var active = marks[this.activeMatch];
    if (!active) return;
    active.classList.add("jv-mark-active");
    this._revealAncestors(active);
    if (scroll) active.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  JsonViewer.prototype.gotoMatch = function (delta) {
    if (!this.matchCount) return;
    this.activeMatch = (this.activeMatch + delta + this.matchCount) % this.matchCount;
    this._applyActiveMatch(true);
    if (this.onMatchesChanged) this.onMatchesChanged();
  };

  JsonViewer.prototype.expandAll = function () {
    if (!this.container) return;
    this.container.querySelectorAll(".jv-children.hidden").forEach(function (c) {
      c.classList.remove("hidden");
      var row = c.previousElementSibling;
      if (row) {
        var t = row.querySelector(".jv-toggle");
        if (t) t.classList.add("open");
        var col = row.querySelector(".jv-collapsed");
        if (col) col.hidden = true;
      }
      var close = c.nextElementSibling;
      if (close) close.hidden = false;
    });
  };

  /* Collapse everything except the root node, so the shape stays readable. */
  JsonViewer.prototype.collapseAll = function () {
    if (!this.container) return;
    var rootTree = this.container;
    this.container.querySelectorAll(".jv-children").forEach(function (c) {
      var ownerNode = c.closest(".jv-node");
      if (ownerNode && ownerNode.parentElement === rootTree) return;
      c.classList.add("hidden");
      var row = c.previousElementSibling;
      if (row) {
        var t = row.querySelector(".jv-toggle");
        if (t) t.classList.remove("open");
        var col = row.querySelector(".jv-collapsed");
        if (col) col.hidden = false;
      }
      var close = c.nextElementSibling;
      if (close) close.hidden = true;
    });
  };

  function attachShell(shell, opts) {
    opts = opts || {};
    var treeEl = shell.querySelector("[data-jv-tree]");
    var rawEl = shell.querySelector("[data-jv-raw]");
    var searchEl = shell.querySelector("[data-jv-search]");
    var viewer = new JsonViewer(treeEl);
    var mode = "tree";

    function getText() {
      if (typeof opts.getText === "function") return opts.getText();
      return rawEl ? rawEl.value : "";
    }
    function hasText() {
      var t = getText();
      return !!(t && t.trim());
    }

    function renderTree() {
      if (!hasText()) {
        treeEl.innerHTML = '<div class="jv-empty">Nothing to display.</div>';
        return;
      }
      try {
        viewer.setData(JSON.parse(getText()));
        viewer.collapseAll();
        if (searchEl && searchEl.value.trim()) viewer.setSearch(searchEl.value.trim());
      } catch (e) {
        treeEl.innerHTML = '<div class="jv-empty jv-error">Invalid JSON — switch to Raw to fix it.</div>';
      }
    }

    function setMode(next) {
      mode = next;
      shell.querySelectorAll("[data-jv-mode]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-jv-mode") === next);
      });
      var rawMode = next === "raw";
      treeEl.hidden = rawMode;
      if (rawEl) rawEl.hidden = !rawMode;
      if (searchEl) searchEl.disabled = rawMode;
      if (!rawMode) renderTree();
    }

    function refresh() {
      if (mode === "tree" && rawEl && !rawEl.readOnly && !hasText()) setMode("raw");
      else setMode(mode);
    }

    var navCounter = null, navPrev = null, navNext = null;
    if (searchEl) {
      var nav = document.createElement("span");
      nav.className = "jv-search-nav";
      nav.innerHTML =
        '<span class="jv-search-counter"></span>' +
        '<button type="button" class="jv-nav-btn" data-jv-nav="prev" title="Previous (Shift+Enter)">▲</button>' +
        '<button type="button" class="jv-nav-btn" data-jv-nav="next" title="Next (Enter)">▼</button>';
      searchEl.insertAdjacentElement("afterend", nav);
      navCounter = nav.querySelector(".jv-search-counter");
      navPrev = nav.querySelector('[data-jv-nav="prev"]');
      navNext = nav.querySelector('[data-jv-nav="next"]');
      navPrev.addEventListener("click", function () { viewer.gotoMatch(-1); });
      navNext.addEventListener("click", function () { viewer.gotoMatch(1); });
    }

    function updateMatchNav() {
      if (!navCounter) return;
      var hasTerm = !!(searchEl && searchEl.value.trim());
      navCounter.textContent = viewer.matchCount
        ? viewer.activeMatch + 1 + "/" + viewer.matchCount
        : (hasTerm ? "0/0" : "");
      navPrev.disabled = navNext.disabled = viewer.matchCount === 0;
    }
    viewer.onMatchesChanged = updateMatchNav;

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        if (mode !== "tree") return;
        var term = searchEl.value.trim();
        if (term) {
          viewer.setSearch(term);
          viewer._applyActiveMatch(true);
        } else {
          viewer.setSearch("");
          viewer.collapseAll();
        }
        updateMatchNav();
      });
      searchEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          viewer.gotoMatch(e.shiftKey ? -1 : 1);
        }
      });
    }

    shell.querySelectorAll("[data-jv-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-jv-act");
        if (act === "expand") viewer.expandAll();
        else if (act === "collapse") viewer.collapseAll();
        else if (act === "copy") {
          if (navigator.clipboard) navigator.clipboard.writeText(getText());
          btn.classList.add("jv-copied");
          setTimeout(function () { btn.classList.remove("jv-copied"); }, 1200);
        }
      });
    });

    shell.querySelectorAll("[data-jv-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () { setMode(btn.getAttribute("data-jv-mode")); });
    });

    return {
      refresh: refresh,
      setMode: setMode,
      viewer: viewer,
      seed: function (text) {
        if (rawEl) rawEl.value = text || "";
        refresh();
      },
    };
  }

  window.JsonTreeViewer = {
    mount: function (container, data) {
      var v = new JsonViewer(container);
      v.setData(data);
      return v;
    },
    attachShell: attachShell,
  };

  /* ---- demo boot ---- */
  var DEMO = {
    profileId: "prof_8842himlox",
    locale: "en-US",
    plan: { tier: "PREMIUM", maxStreams: 4, resolution: "4K_HDR", adSupported: false },
    device: { type: "SMART_TV", os: "Tizen 7.0", drm: "widevine_l1", hdrCapable: true },
    homeRows: [
      {
        rowId: "row_continue_watching",
        title: "Continue Watching",
        rankingModel: "cw-recency-v3",
        items: [
          {
            id: 81234561,
            title: "Ashes of the Empire",
            type: "SERIES",
            genres: ["sci-fi", "drama"],
            maturityRating: "TV-MA",
            progress: { season: 2, episode: 5, positionSec: 1834, durationSec: 3120, percent: 58.8 },
            badges: ["NEW_EPISODES", "TOP_10"],
            artwork: {
              boxart: "https://img.example.cdn/boxart/81234561.jpg",
              titleLogo: "https://img.example.cdn/logo/81234561.png",
              billboard: null,
            },
          },
          {
            id: 70298731,
            title: "Midnight Recipe",
            type: "MOVIE",
            genres: ["thriller"],
            maturityRating: "R",
            progress: { positionSec: 421, durationSec: 6980, percent: 6.0 },
            badges: [],
            artwork: { boxart: "https://img.example.cdn/boxart/70298731.jpg", titleLogo: null, billboard: null },
          },
        ],
      },
      {
        rowId: "row_top_picks",
        title: "Top Picks for You",
        rankingModel: "personalized-rank-v12",
        items: [
          {
            id: 81990045,
            title: "The Last Cartographer",
            type: "SERIES",
            genres: ["adventure", "mystery"],
            maturityRating: "TV-14",
            matchScore: 0.97,
            isOriginal: true,
            badges: ["ORIGINAL", "AWARD_WINNER"],
            seasons: 3,
            audioLocales: ["en", "es", "fr", "ja"],
            subtitleLocales: ["en", "es", "pt-BR", "de"],
          },
        ],
      },
    ],
    playbackSession: {
      sessionId: "pbs_02fb7d1e",
      titleId: 81234561,
      cdn: { provider: "open-connect", pop: "bog01", throughputKbps: 42311 },
      stream: {
        videoCodec: "hevc",
        audioCodec: "eac3-atmos",
        bitrateLadder: [
          { resolution: "3840x2160", kbps: 15000 },
          { resolution: "1920x1080", kbps: 5800 },
          { resolution: "1280x720", kbps: 3000 },
        ],
        currentBitrateKbps: 15000,
        bufferSec: 26.4,
        droppedFrames: 2,
      },
      abTests: { skipIntroV2: "treatment", nextEpCountdown: "control" },
    },
    billing: {
      country: "US",
      currency: "USD",
      monthlyPrice: 22.99,
      nextBillingDate: "2026-08-05",
      paymentMethod: { type: "CARD", last4: "4821", expiring: false },
    },
  };

  document.querySelectorAll("[data-jv-shell]").forEach(function (shell) {
    attachShell(shell).seed(JSON.stringify(DEMO, null, 2));
  });
})();
