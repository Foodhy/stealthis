(function () {
  "use strict";

  var stream = document.getElementById("stream");
  var newBtn = document.getElementById("newUpdateBtn");
  var countEl = document.getElementById("streamCount");
  var toastEl = document.getElementById("toast");
  var keyboxTime = document.getElementById("keyboxTime");

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="toast__dot" aria-hidden="true"></span>' + msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2600);
  }

  /* ---------- Relative time ---------- */
  function relTime(date) {
    var diff = Math.round((Date.now() - date.getTime()) / 1000);
    if (diff < 5) return "just now";
    if (diff < 60) return diff + " sec ago";
    var mins = Math.round(diff / 60);
    if (mins < 60) return mins + " min ago";
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours + " hr ago";
    var days = Math.round(hours / 24);
    return days + (days === 1 ? " day ago" : " days ago");
  }

  function fmtClock(date) {
    var h = date.getHours();
    var m = date.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }

  /* ---------- Refresh all relative timestamps ---------- */
  function refreshRel() {
    var entries = stream.querySelectorAll(".entry");
    for (var i = 0; i < entries.length; i++) {
      var iso = entries[i].getAttribute("data-time");
      var relEl = entries[i].querySelector("[data-rel]");
      if (!iso || !relEl) continue;
      var d = new Date(iso);
      if (isNaN(d.getTime())) continue;
      relEl.textContent = relTime(d);
    }
    if (keyboxTime) {
      keyboxTime.textContent = "moments ago";
    }
  }

  /* ---------- Update count label ---------- */
  function updateCount() {
    var n = stream.querySelectorAll(".entry").length;
    countEl.textContent = n + (n === 1 ? " update" : " updates");
  }

  /* ---------- Pool of fictional new updates ---------- */
  var pool = [
    {
      kicker: "Bay County",
      headline: "Water reaches the first floor of the Wharf Row market",
      key: false,
      body: "Reporters at the scene say the historic market has taken on roughly a foot of water, with vendors moving stock to upper shelves. Police have closed the surrounding blocks to all but emergency vehicles.",
      author: "— Marcus Vellán, at the Old Wharf"
    },
    {
      kicker: "Schools",
      headline: "All coastal schools to remain closed Tuesday",
      key: false,
      body: "The Meridian district announced that every school east of the Pinewright ridge will stay closed tomorrow, with remote instruction suspended in areas expecting prolonged power outages."
    },
    {
      kicker: "Surge",
      headline: "Tide gauge at Cole Point hits a new daily record",
      key: true,
      body: "The Cole Point gauge has recorded its highest reading since the station opened, surpassing the mark set during last autumn's nor'easter. Forecasters warn the peak is still two hours away.",
      author: "— Dispatch Weather Desk"
    },
    {
      kicker: "Rescues",
      headline: "Swift-water teams pull six from stranded vehicles",
      key: false,
      body: "Fire officials confirm that swift-water rescue crews have helped six people from cars caught in flooded underpasses along Calder Street. No injuries have been reported.",
      author: "— Dana Okwu"
    },
    {
      kicker: "Power",
      headline: "Outage total climbs past 18,000 customers",
      key: false,
      body: "Meridian Power & Light now reports more than 18,000 homes and businesses without electricity, with the heaviest losses on the Cole County peninsula. Restoration crews remain grounded until winds ease."
    },
    {
      kicker: "Shelters",
      headline: "Fairgrounds shelter nears capacity; new site opening",
      key: false,
      body: "Officials say the Meridian Fairgrounds shelter is approaching its limit and that a fourth site will open within the hour at the Tasker County armory to absorb arriving families.",
      author: "— Dana Okwu"
    }
  ];
  var poolIdx = 0;

  /* ---------- Build a new entry element ---------- */
  function buildEntry(item, date) {
    var li = document.createElement("li");
    li.className = "entry entry--flash entry--new";
    li.setAttribute("data-time", date.toISOString());

    var rail = document.createElement("div");
    rail.className = "entry__rail";

    var time = document.createElement("time");
    time.className = "entry__time";
    time.setAttribute("datetime", date.toISOString());
    time.textContent = fmtClock(date);

    var rel = document.createElement("span");
    rel.className = "entry__rel";
    rel.setAttribute("data-rel", "");
    rel.textContent = "just now";

    rail.appendChild(time);
    rail.appendChild(rel);

    var body = document.createElement("div");
    body.className = "entry__body";

    var kick = document.createElement("p");
    if (item.key) {
      kick.className = "entry__kicker entry--key";
      kick.innerHTML =
        '<span class="key-flag">Key update</span> ' + escapeHtml(item.kicker);
    } else {
      kick.className = "entry__kicker";
      kick.textContent = item.kicker;
    }

    var h = document.createElement("h3");
    h.className = "entry__headline";
    h.textContent = item.headline;

    var p = document.createElement("p");
    p.textContent = item.body;

    body.appendChild(kick);
    body.appendChild(h);
    body.appendChild(p);

    if (item.author) {
      var au = document.createElement("p");
      au.className = "entry__author";
      au.textContent = item.author;
      body.appendChild(au);
    }

    li.appendChild(rail);
    li.appendChild(body);
    return li;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------- Prepend a fresh update ---------- */
  function postUpdate() {
    var item = pool[poolIdx % pool.length];
    poolIdx++;
    var now = new Date();
    var el = buildEntry(item, now);

    // Clear the "new" red accent from the previously-newest entry
    var prevNew = stream.querySelector(".entry--new");
    if (prevNew) prevNew.classList.remove("entry--new");

    stream.insertBefore(el, stream.firstElementChild);
    updateCount();
    refreshRel();

    // Remove the one-shot flash class after the animation settles
    setTimeout(function () {
      el.classList.remove("entry--flash");
    }, 1700);

    toast(item.key ? "Key update posted" : "New update posted");

    // Move focus to the new headline for keyboard/AT users
    var headline = el.querySelector(".entry__headline");
    if (headline) {
      headline.setAttribute("tabindex", "-1");
      headline.focus({ preventScroll: false });
    }
  }

  if (newBtn) newBtn.addEventListener("click", postUpdate);

  /* ---------- Init ---------- */
  refreshRel();
  updateCount();
  setInterval(refreshRel, 30000);
})();
