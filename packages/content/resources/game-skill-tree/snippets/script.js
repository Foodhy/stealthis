(function () {
  "use strict";

  // ---- Tree data: Ashen Vanguard tech tree -----------------------------
  // x/y are percentages of the board (0-100). tier drives left-to-right flow.
  var NODES = [
    // Tier I (roots, no prereqs)
    { id: "core",   name: "Vanguard Core",  icon: "⚡", tier: 0, x: 9,  y: 50, cost: 1, prereq: [], effect: "Base discipline. +5% stamina regen on all combat actions." },
    // Tier II
    { id: "blade",  name: "Ashen Edge",     icon: "⚔️", tier: 1, x: 33, y: 22, cost: 2, prereq: ["core"], effect: "Melee strikes deal +18% damage and ignore 10% armor." },
    { id: "guard",  name: "Bulwark",        icon: "⛨", tier: 1, x: 33, y: 50, cost: 1, prereq: ["core"], effect: "Block window widened by 0.2s; perfect-block reflects 30%." },
    { id: "spark",  name: "Static Coil",    icon: "✨", tier: 1, x: 33, y: 78, cost: 2, prereq: ["core"], effect: "Abilities apply Shock, chaining to 2 nearby enemies." },
    // Tier III
    { id: "rend",   name: "Cleaving Rend",  icon: "\u{1F300}", tier: 2, x: 60, y: 14, cost: 3, prereq: ["blade"], effect: "Heavy attacks become a wide arc hitting all front targets." },
    { id: "fury",   name: "Embered Fury",   icon: "\u{1F525}", tier: 2, x: 60, y: 36, cost: 3, prereq: ["blade", "guard"], effect: "On kill, gain +25% attack speed for 6s. Stacks twice." },
    { id: "ward",   name: "Aegis Ward",     icon: "\u{1F6E1}️", tier: 2, x: 60, y: 64, cost: 2, prereq: ["guard"], effect: "Deploy a 4s barrier absorbing 400 damage. 18s cooldown." },
    { id: "overld", name: "Overload",       icon: "\u{1F50B}", tier: 2, x: 60, y: 86, cost: 3, prereq: ["spark"], effect: "Shocked enemies detonate, dealing 120 arc damage in radius." },
    // Tier IV (capstones)
    { id: "exec",   name: "Executioner",    icon: "\u{1F480}", tier: 3, x: 88, y: 25, cost: 4, prereq: ["rend", "fury"], effect: "ULTIMATE: enemies below 22% HP are instantly executed." },
    { id: "titan",  name: "Titanfall",      icon: "\u{1F985}", tier: 3, x: 88, y: 52, cost: 4, prereq: ["fury", "ward"], effect: "ULTIMATE: slam the field, stunning all foes for 3s." },
    { id: "storm",  name: "Tempest Crown",  icon: "⛈️", tier: 3, x: 88, y: 79, cost: 4, prereq: ["ward", "overld"], effect: "ULTIMATE: summon a roaming storm dealing 80 dps for 10s." }
  ];

  var TOTAL_POINTS = 12;

  var byId = {};
  NODES.forEach(function (n) {
    n.unlocked = false;
    byId[n.id] = n;
  });

  // ---- DOM refs --------------------------------------------------------
  var board = document.getElementById("board");
  var nodesLayer = document.getElementById("nodes");
  var svg = document.getElementById("links");
  var tooltip = document.getElementById("tooltip");
  var toastStack = document.getElementById("toast-stack");

  var elPointsAvail = document.getElementById("points-available");
  var elPointsSpent = document.getElementById("points-spent");
  var elUnlocked = document.getElementById("nodes-unlocked");

  var nodeEls = {}; // id -> button element
  var linkEls = []; // { from, to, path }

  // ---- State helpers ---------------------------------------------------
  function prereqsMet(node) {
    return node.prereq.every(function (pid) {
      return byId[pid].unlocked;
    });
  }

  function stateOf(node) {
    if (node.unlocked) return "unlocked";
    if (prereqsMet(node)) return "available";
    return "locked";
  }

  function spentPoints() {
    return NODES.reduce(function (sum, n) {
      return sum + (n.unlocked ? n.cost : 0);
    }, 0);
  }

  function availablePoints() {
    return TOTAL_POINTS - spentPoints();
  }

  // ---- Build nodes -----------------------------------------------------
  NODES.forEach(function (node) {
    var btn = document.createElement("button");
    btn.className = "node";
    btn.type = "button";
    btn.setAttribute("role", "treeitem");
    btn.style.left = node.x + "%";
    btn.style.top = node.y + "%";
    btn.dataset.id = node.id;

    btn.innerHTML =
      '<div class="node-hex">' +
      '<span class="node-icon">' + node.icon + "</span>" +
      '<span class="node-rank">' + node.cost + " SP</span>" +
      "</div>" +
      '<span class="node-name">' + node.name + "</span>";

    btn.addEventListener("click", function () {
      onNodeClick(node);
    });
    btn.addEventListener("mouseenter", function (e) {
      showTooltip(node, e);
    });
    btn.addEventListener("mousemove", positionTooltip);
    btn.addEventListener("mouseleave", hideTooltip);
    btn.addEventListener("focus", function () {
      showTooltip(node, null, btn);
    });
    btn.addEventListener("blur", hideTooltip);

    nodesLayer.appendChild(btn);
    nodeEls[node.id] = btn;
  });

  // ---- Build links (SVG paths) ----------------------------------------
  function buildLinks() {
    svg.innerHTML = "";
    linkEls = [];
    var rect = board.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);

    NODES.forEach(function (node) {
      node.prereq.forEach(function (pid) {
        var from = byId[pid];
        var x1 = (from.x / 100) * rect.width;
        var y1 = (from.y / 100) * rect.height;
        var x2 = (node.x / 100) * rect.width;
        var y2 = (node.y / 100) * rect.height;
        var midX = (x1 + x2) / 2;

        var d =
          "M " + x1 + " " + y1 +
          " C " + midX + " " + y1 + ", " + midX + " " + y2 + ", " + x2 + " " + y2;

        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "link-line");
        svg.appendChild(path);
        linkEls.push({ from: pid, to: node.id, path: path });
      });
    });
  }

  // ---- Render ----------------------------------------------------------
  function render() {
    NODES.forEach(function (node) {
      var st = stateOf(node);
      var el = nodeEls[node.id];
      el.dataset.state = st;
      el.setAttribute("aria-pressed", node.unlocked ? "true" : "false");
      el.setAttribute(
        "aria-label",
        node.name + ", " + node.cost + " skill points, " + st
      );
    });

    linkEls.forEach(function (link) {
      var from = byId[link.from];
      var to = byId[link.to];
      link.path.classList.remove("is-available", "is-active");
      if (from.unlocked && to.unlocked) {
        link.path.classList.add("is-active");
      } else if (from.unlocked && prereqsMet(to)) {
        link.path.classList.add("is-available");
      }
    });

    var avail = availablePoints();
    elPointsAvail.textContent = avail;
    elPointsSpent.textContent = spentPoints();
    var unlockedCount = NODES.filter(function (n) {
      return n.unlocked;
    }).length;
    elUnlocked.textContent = unlockedCount + " / " + NODES.length;

    elPointsAvail.style.color = avail === 0 ? "var(--warn)" : "var(--accent)";
  }

  // ---- Interactions ----------------------------------------------------
  function onNodeClick(node) {
    if (node.unlocked) {
      toast(node.name + " is already unlocked.", "warn");
      return;
    }
    if (!prereqsMet(node)) {
      var missing = node.prereq
        .filter(function (pid) {
          return !byId[pid].unlocked;
        })
        .map(function (pid) {
          return byId[pid].name;
        });
      toast("Locked — requires " + missing.join(" + "), "danger");
      return;
    }
    if (node.cost > availablePoints()) {
      toast("Not enough skill points (" + node.cost + " needed).", "danger");
      return;
    }

    node.unlocked = true;

    var el = nodeEls[node.id];
    el.classList.add("just-unlocked");
    setTimeout(function () {
      el.classList.remove("just-unlocked");
    }, 600);

    render();
    toast(node.name + " unlocked — " + node.cost + " SP spent.", "success");

    // Highlight newly available children briefly via tooltip-less pulse.
    NODES.forEach(function (child) {
      if (child.prereq.indexOf(node.id) !== -1 && stateOf(child) === "available") {
        flashAvailable(child.id);
      }
    });
  }

  function flashAvailable(id) {
    var el = nodeEls[id];
    if (!el) return;
    el.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(1.6)" },
        { filter: "brightness(1)" }
      ],
      { duration: 700, iterations: 1 }
    );
  }

  function respec() {
    var spent = spentPoints();
    if (spent === 0) {
      toast("Nothing to respec yet.", "warn");
      return;
    }
    NODES.forEach(function (n) {
      n.unlocked = false;
    });
    render();
    toast(spent + " skill points refunded. Build reset.", "success");
  }

  document.getElementById("respec-btn").addEventListener("click", respec);

  document.getElementById("commit-btn").addEventListener("click", function () {
    var picks = NODES.filter(function (n) {
      return n.unlocked;
    });
    if (!picks.length) {
      toast("Pick at least one skill before confirming.", "warn");
      return;
    }
    toast(
      "Build confirmed — " + picks.length + " skills, " + spentPoints() + " SP committed.",
      "success"
    );
  });

  // ---- Tooltip ---------------------------------------------------------
  function showTooltip(node, evt, anchorEl) {
    var st = stateOf(node);
    var statusText = st === "unlocked" ? "Unlocked" : st === "available" ? "Available" : "Locked";

    var prereqHtml = "";
    if (node.prereq.length) {
      var names = node.prereq.map(function (pid) {
        var p = byId[pid];
        return p.unlocked ? p.name : "<b>" + p.name + "</b>";
      });
      prereqHtml = '<p class="tt-prereq">Requires: ' + names.join(" + ") + "</p>";
    }

    tooltip.innerHTML =
      '<div class="tt-head">' +
      '<span class="tt-name">' + node.name + "</span>" +
      '<span class="tt-cost">' + node.cost + " SP</span>" +
      "</div>" +
      '<p class="tt-effect">' + node.effect + "</p>" +
      '<span class="tt-status ' + st + '">' + statusText + "</span>" +
      prereqHtml;

    tooltip.classList.add("show");
    tooltip.setAttribute("aria-hidden", "false");

    if (evt) {
      positionTooltip(evt);
    } else if (anchorEl) {
      var r = anchorEl.getBoundingClientRect();
      placeTooltip(r.left + r.width / 2, r.top);
    }
  }

  function positionTooltip(evt) {
    placeTooltip(evt.clientX, evt.clientY);
  }

  function placeTooltip(x, y) {
    var tw = tooltip.offsetWidth || 240;
    var th = tooltip.offsetHeight || 120;
    var left = x + 16;
    var top = y + 16;
    if (left + tw > window.innerWidth - 12) left = x - tw - 16;
    if (top + th > window.innerHeight - 12) top = y - th - 16;
    tooltip.style.left = Math.max(8, left) + "px";
    tooltip.style.top = Math.max(8, top) + "px";
  }

  function hideTooltip() {
    tooltip.classList.remove("show");
    tooltip.setAttribute("aria-hidden", "true");
  }

  // ---- Toast helper ----------------------------------------------------
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        el.remove();
      }, 320);
    }, 2600);
  }

  // ---- Init & resize ---------------------------------------------------
  function init() {
    buildLinks();
    render();
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });

  init();
})();
