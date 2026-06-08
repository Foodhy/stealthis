(function () {
  "use strict";

  var THUMBS = ["thumb-a", "thumb-b", "thumb-c", "thumb-d", "thumb-e"];
  var TAGS = ["New build", "Waterfront", "Period home", "Garden", "City view"];

  var seed = [
    {
      id: "s1",
      name: "Cedar Hill — Family",
      area: "Cedar Hill",
      type: "House",
      beds: "3+ beds",
      price: "≤ $850k",
      freq: "Instant",
      muted: false,
      newCount: 4,
      thumb: 0,
      tag: 0,
    },
    {
      id: "s2",
      name: "Harbor Point Lofts",
      area: "Harbor Point",
      type: "Loft",
      beds: "2+ beds",
      price: "≤ $1.2M",
      freq: "Daily",
      muted: false,
      newCount: 1,
      thumb: 1,
      tag: 1,
    },
    {
      id: "s3",
      name: "Old Meridian Estate",
      area: "Old Meridian",
      type: "Estate",
      beds: "4+ beds",
      price: "≤ $3M",
      freq: "Weekly",
      muted: true,
      newCount: 0,
      thumb: 2,
      tag: 2,
    },
    {
      id: "s4",
      name: "Ashbourne Townhouse",
      area: "Ashbourne",
      type: "Townhouse",
      beds: "3+ beds",
      price: "≤ $1.8M",
      freq: "Daily",
      muted: false,
      newCount: 2,
      thumb: 3,
      tag: 3,
    },
  ];

  var listEl = document.getElementById("searches");
  var tpl = document.getElementById("row-tpl");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var newTotalEl = document.getElementById("newtotal");
  var toastEl = document.getElementById("toast");
  var form = document.getElementById("create-form");

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  function setFreq(segEl, freq) {
    var btns = segEl.querySelectorAll(".seg__btn");
    btns.forEach(function (b) {
      var active = b.dataset.freq === freq;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function renderRow(data) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = data.id;

    var thumb = node.querySelector(".search__thumb");
    thumb.classList.add(THUMBS[data.thumb % THUMBS.length]);
    node.querySelector(".search__tag").textContent = TAGS[data.tag % TAGS.length];

    node.querySelector(".search__name").textContent = data.name;

    var chips = node.querySelector(".search__chips");
    var defs = [
      { t: data.area, c: "chip" },
      { t: data.type, c: "chip" },
      { t: data.beds, c: "chip chip--beds" },
      { t: data.price, c: "chip chip--price" },
    ];
    defs.forEach(function (d) {
      var s = document.createElement("span");
      s.className = d.c;
      s.textContent = d.t;
      chips.appendChild(s);
    });

    var seg = node.querySelector(".seg");
    setFreq(seg, data.freq);

    node.querySelector(".search__sub").textContent = subText(data);

    var muteBtn = node.querySelector('[data-act="mute"]');
    applyMute(node, muteBtn, data.muted, true);

    updateBadge(node, data.newCount);

    listEl.appendChild(node);
  }

  function subText(data) {
    if (data.muted) return "Alerts muted";
    if (data.newCount > 0) {
      return data.newCount + " new since last visit · " + data.freq.toLowerCase() + " alerts";
    }
    return "Up to date · " + data.freq.toLowerCase() + " alerts";
  }

  function refreshSub(node) {
    var d = getData(node.dataset.id);
    node.querySelector(".search__sub").textContent = subText(d);
  }

  function updateBadge(node, n) {
    var badge = node.querySelector("[data-new]");
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n + " new";
    } else {
      badge.hidden = true;
    }
  }

  function applyMute(node, btn, muted, silent) {
    node.classList.toggle("is-muted", muted);
    btn.setAttribute("aria-pressed", muted ? "true" : "false");
    btn.textContent = muted ? "Muted" : "Mute";
    if (!silent) refreshSub(node);
  }

  function getData(id) {
    return seed.filter(function (s) { return s.id === id; })[0];
  }

  function updateTotals() {
    var visible = seed.length;
    countEl.textContent = String(visible);
    var totalNew = seed.reduce(function (acc, s) {
      return acc + (s.muted ? 0 : s.newCount);
    }, 0);
    newTotalEl.textContent = totalNew + (totalNew === 1 ? " new match" : " new matches");
    newTotalEl.setAttribute("data-zero", totalNew === 0 ? "true" : "false");
    emptyEl.hidden = visible !== 0;
  }

  // ----- Row interactions (event delegation) -----
  listEl.addEventListener("click", function (e) {
    var freqBtn = e.target.closest(".seg__btn");
    var actBtn = e.target.closest("[data-act]");
    var row = e.target.closest(".search");
    if (!row) return;
    var data = getData(row.dataset.id);
    if (!data) return;

    if (freqBtn) {
      data.freq = freqBtn.dataset.freq;
      setFreq(row.querySelector(".seg"), data.freq);
      refreshSub(row);
      toast('"' + data.name + '" set to ' + data.freq.toLowerCase() + " alerts");
      return;
    }

    if (actBtn) {
      var act = actBtn.dataset.act;
      if (act === "clear") {
        if (data.newCount === 0) {
          toast("No new matches to clear");
          return;
        }
        data.newCount = 0;
        updateBadge(row, 0);
        refreshSub(row);
        updateTotals();
        toast("Cleared new matches for " + data.name);
      } else if (act === "mute") {
        data.muted = !data.muted;
        applyMute(row, actBtn, data.muted, false);
        updateTotals();
        toast(data.muted ? data.name + " muted" : data.name + " unmuted");
      } else if (act === "delete") {
        row.classList.add("is-removing");
        var id = data.id;
        setTimeout(function () {
          seed = seed.filter(function (s) { return s.id !== id; });
          row.remove();
          updateTotals();
        }, 260);
        toast("Deleted " + data.name);
      }
    }
  });

  // ----- Create-form frequency segmented control -----
  var createSeg = form.querySelector(".seg");
  var createFreq = "Instant";
  createSeg.addEventListener("click", function (e) {
    var btn = e.target.closest(".seg__btn");
    if (!btn) return;
    createFreq = btn.dataset.freq;
    setFreq(createSeg, createFreq);
  });

  // ----- Create new alert -----
  var idCounter = 100;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameInput = form.elements.name;
    var name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      toast("Give your search a name first");
      return;
    }

    var data = {
      id: "s" + ++idCounter,
      name: name,
      area: form.elements.area.value,
      type: form.elements.type.value,
      beds: form.elements.beds.value,
      price: form.elements.price.value,
      freq: createFreq,
      muted: false,
      newCount: 0,
      thumb: idCounter % THUMBS.length,
      tag: idCounter % TAGS.length,
    };

    seed.unshift(data);
    // render at top
    var node = renderAtTop(data);
    updateTotals();
    nameInput.value = "";
    createFreq = "Instant";
    setFreq(createSeg, createFreq);
    toast("Saved “" + name + "” — " + createFreqLabel(data.freq));
    if (node) node.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  function createFreqLabel(freq) {
    return freq.toLowerCase() + " alerts on";
  }

  function renderAtTop(data) {
    renderRow(data);
    var node = listEl.lastElementChild;
    listEl.insertBefore(node, listEl.firstElementChild);
    return node;
  }

  // ----- Initial render -----
  seed.forEach(renderRow);
  updateTotals();
})();
