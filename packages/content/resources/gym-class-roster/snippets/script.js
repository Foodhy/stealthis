(function () {
  "use strict";

  var CAPACITY = 20;

  // Member states: "expected" | "present" | "noshow" | "promoted"
  var members = [
    { id: 1, name: "Diego Salcedo", tier: "Elite", state: "present" },
    { id: 2, name: "Priya Raman", tier: "Plus", state: "expected" },
    { id: 3, name: "Tomás Bianchi", tier: "Core", state: "present" },
    { id: 4, name: "Hannah Okafor", tier: "Elite", state: "expected" },
    { id: 5, name: "Wei Lin", tier: "Core", state: "noshow" },
    { id: 6, name: "Sofía Marín", tier: "Plus", state: "expected" },
    { id: 7, name: "Marcus Hale", tier: "Core", state: "present" },
    { id: 8, name: "Yuki Tanaka", tier: "Elite", state: "expected" },
    { id: 9, name: "Olivia Brandt", tier: "Day Pass", state: "expected" },
    { id: 10, name: "Kwame Asante", tier: "Plus", state: "promoted" },
    { id: 11, name: "Renata Cardoso", tier: "Core", state: "expected" },
    { id: 12, name: "Felix Norberg", tier: "Core", state: "present" },
  ];

  var TIER_COLORS = {
    Elite: ["#c6ff3a", "#a6e016"],
    Plus: ["#ff6a2b", "#ff8a5a"],
    Core: ["#5e9bff", "#7fb2ff"],
    "Day Pass": ["#8b929c", "#aeb4bd"],
  };

  var STATE_LABEL = {
    expected: "Expected",
    present: "Present",
    noshow: "No-show",
    promoted: "Waitlist · promoted",
  };

  var $ = function (sel) {
    return document.querySelector(sel);
  };

  var rosterEl = $("#roster");
  var searchEl = $("#search");
  var filterBtn = $("#filterToggle");
  var checkAllBtn = $("#checkAll");
  var toastEl = $("#toast");
  var nextId = 100;
  var pendingOnly = false;

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function initials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (p) {
        return p.charAt(0).toUpperCase();
      })
      .join("");
  }

  /* ---------- render ---------- */
  function render() {
    rosterEl.innerHTML = "";
    var q = searchEl.value.trim().toLowerCase();
    var shown = 0;

    members.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "row";
      li.dataset.id = String(m.id);
      applyStateClass(li, m.state);

      var matchesQ =
        !q || m.name.toLowerCase().indexOf(q) > -1 || m.tier.toLowerCase().indexOf(q) > -1;
      var matchesFilter = !pendingOnly || m.state === "expected";
      if (!matchesQ || !matchesFilter) {
        li.hidden = true;
      } else {
        shown++;
      }

      var colors = TIER_COLORS[m.tier] || TIER_COLORS["Day Pass"];

      var avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.style.background = "linear-gradient(135deg," + colors[0] + "," + colors[1] + ")";
      avatar.textContent = initials(m.name);
      avatar.setAttribute("aria-hidden", "true");

      var who = document.createElement("div");
      who.className = "who";
      var nm = document.createElement("div");
      nm.className = "who__name";
      nm.textContent = m.name;
      var sub = document.createElement("div");
      sub.className = "who__sub";
      var tier = document.createElement("span");
      tier.className = "tier tier--" + m.tier.replace(/\s+/g, "");
      tier.textContent = m.tier;
      var tag = document.createElement("span");
      tag.className = "state-tag";
      tag.textContent = STATE_LABEL[m.state];
      sub.appendChild(tier);
      sub.appendChild(tag);
      who.appendChild(nm);
      who.appendChild(sub);

      var actions = document.createElement("div");
      actions.className = "actions";

      var present = m.state === "present" || m.state === "promoted";
      var presentBtn = document.createElement("button");
      presentBtn.type = "button";
      presentBtn.className = "tog" + (present ? " tog--present" : "");
      presentBtn.textContent = present ? "Checked in" : "Check in";
      presentBtn.setAttribute("aria-pressed", present ? "true" : "false");
      presentBtn.addEventListener("click", function () {
        togglePresent(m.id);
      });

      var missBtn = document.createElement("button");
      missBtn.type = "button";
      missBtn.className = "tog tog--miss";
      missBtn.textContent = "No-show";
      missBtn.dataset.active = m.state === "noshow" ? "true" : "false";
      missBtn.setAttribute("aria-pressed", m.state === "noshow" ? "true" : "false");
      missBtn.addEventListener("click", function () {
        toggleNoShow(m.id);
      });

      actions.appendChild(presentBtn);
      actions.appendChild(missBtn);

      li.appendChild(avatar);
      li.appendChild(who);
      li.appendChild(actions);
      rosterEl.appendChild(li);
    });

    if (shown === 0) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = pendingOnly
        ? "No pending members — everyone's accounted for."
        : "No members match your search.";
      rosterEl.appendChild(empty);
    }

    updateStats();
  }

  function applyStateClass(li, state) {
    li.classList.toggle("is-present", state === "present");
    li.classList.toggle("is-noshow", state === "noshow");
    li.classList.toggle("is-promoted", state === "promoted");
  }

  function find(id) {
    for (var i = 0; i < members.length; i++) {
      if (members[i].id === id) return members[i];
    }
    return null;
  }

  function flash(id) {
    var row = rosterEl.querySelector('.row[data-id="' + id + '"]');
    if (!row) return;
    row.classList.remove("flash");
    void row.offsetWidth; // reflow to restart animation
    row.classList.add("flash");
  }

  /* ---------- actions ---------- */
  function togglePresent(id) {
    var m = find(id);
    if (!m) return;
    if (m.state === "present" || m.state === "promoted") {
      m.state = "expected";
      toast(m.name + " set back to expected");
    } else {
      m.state = "present";
      toast('<span class="toast__accent">✓</span> ' + m.name + " checked in");
    }
    render();
    flash(id);
  }

  function toggleNoShow(id) {
    var m = find(id);
    if (!m) return;
    if (m.state === "noshow") {
      m.state = "expected";
      toast(m.name + " cleared");
    } else {
      m.state = "noshow";
      toast(m.name + " marked no-show");
    }
    render();
    flash(id);
  }

  /* ---------- stats ---------- */
  function updateStats() {
    var present = 0,
      expected = 0,
      noshow = 0,
      wait = 0;
    members.forEach(function (m) {
      if (m.state === "present") present++;
      else if (m.state === "promoted") {
        present++;
        wait++;
      } else if (m.state === "noshow") noshow++;
      else expected++;
    });

    $("#statPresent").textContent = present;
    $("#statExpected").textContent = expected;
    $("#statNoShow").textContent = noshow;
    $("#statWait").textContent = wait;

    var enrolled = members.length;
    $("#capCurrent").textContent = enrolled;
    var pct = Math.min(100, Math.round((enrolled / CAPACITY) * 100));
    $("#capFill").style.width = pct + "%";
    var bar = $("#capBar");
    bar.setAttribute("aria-valuenow", String(enrolled));
    bar.setAttribute("aria-valuemax", String(CAPACITY));
  }

  /* ---------- toolbar ---------- */
  searchEl.addEventListener("input", render);

  filterBtn.addEventListener("click", function () {
    pendingOnly = !pendingOnly;
    filterBtn.setAttribute("aria-pressed", pendingOnly ? "true" : "false");
    render();
  });

  checkAllBtn.addEventListener("click", function () {
    var changed = 0;
    members.forEach(function (m) {
      if (m.state === "expected" || m.state === "noshow") {
        m.state = "present";
        changed++;
      }
    });
    render();
    if (changed === 0) {
      toast("Everyone's already checked in");
    } else {
      toast('<span class="toast__accent">✓</span> Checked in ' + changed + " member" + (changed === 1 ? "" : "s"));
    }
  });

  /* ---------- walk-in ---------- */
  $("#walkinForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = $("#walkinName");
    var name = nameEl.value.trim();
    if (!name) {
      nameEl.focus();
      toast("Enter a name for the walk-in");
      return;
    }
    if (members.length >= CAPACITY) {
      toast("Class is at capacity (" + CAPACITY + ")");
      return;
    }
    var tier = $("#walkinTier").value;
    var id = nextId++;
    members.push({ id: id, name: name, tier: tier, state: "present" });
    nameEl.value = "";
    pendingOnly = false;
    filterBtn.setAttribute("aria-pressed", "false");
    searchEl.value = "";
    render();
    flash(id);
    toast('<span class="toast__accent">+</span> ' + name + " added and checked in");
  });

  render();
})();
