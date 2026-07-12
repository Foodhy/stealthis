(function () {
  "use strict";

  var AV = "https://images.unsplash.com/";
  var P = "?auto=format&fit=crop&w=140&h=140&q=70";

  // Fictional but realistic notification data.
  var data = [
    { id: 1, type: "match", name: "Mara", unread: true, mins: 3,
      photo: AV + "photo-1544005313-94ddf0286df2" + P,
      text: "It's a match! You and <strong>Mara</strong> liked each other 💘", chip: "New match" },
    { id: 2, type: "message", name: "Diego", unread: true, mins: 11,
      photo: AV + "photo-1500648767791-00dcc994a43e" + P,
      text: "<strong>Diego</strong> sent you a message: “Coffee this weekend?”" },
    { id: 3, type: "like", name: "Priya", unread: true, mins: 26,
      photo: AV + "photo-1534528741775-53994a69daeb" + P,
      text: "<strong>Priya</strong> liked your profile" },
    { id: 4, type: "match", name: "Noah", unread: true, mins: 48,
      photo: AV + "photo-1502823403499-6ccfcf4fb453" + P,
      text: "You matched with <strong>Noah</strong> — say hi first!", chip: "New match" },
    { id: 5, type: "like", name: "Aisha", unread: true, mins: 92,
      photo: AV + "photo-1531123897727-8f129e1688ce" + P,
      text: "<strong>Aisha</strong> and 3 others liked you" },
    { id: 6, type: "message", name: "Leo", unread: false, mins: 180,
      photo: AV + "photo-1506794778202-cad84cf45f1d" + P,
      text: "<strong>Leo</strong>: “Loved your hiking photos 🏔️”" },
    { id: 7, type: "like", name: "Sofia", unread: false, mins: 320,
      photo: AV + "photo-1524504388940-b1c1722653e1" + P,
      text: "<strong>Sofia</strong> super-liked your profile ⭐" },
    { id: 8, type: "match", name: "Kenji", unread: false, mins: 1440,
      photo: AV + "photo-1507003211169-0a1dd7228f2d" + P,
      text: "You matched with <strong>Kenji</strong> yesterday" },
    { id: 9, type: "message", name: "Yara", unread: false, mins: 2880,
      photo: AV + "photo-1508214751196-bcfd4ca60f91" + P,
      text: "<strong>Yara</strong>: “Haha same! See you Friday”" }
  ];

  var ICONS = {
    like: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.7-9.1C.9 8.9 2.3 5.6 5.4 5.1c1.9-.3 3.6.7 4.6 2.1 1-1.4 2.7-2.4 4.6-2.1 3.1.5 4.5 3.8 3.1 6.8C19.5 16.4 12 21 12 21z"/></svg>',
    match: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.7-9.1C.9 8.9 2.3 5.6 5.4 5.1c1.9-.3 3.6.7 4.6 2.1 1-1.4 2.7-2.4 4.6-2.1 3.1.5 4.5 3.8 3.1 6.8C19.5 16.4 12 21 12 21z"/></svg>',
    message: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16v12H7l-3 3V4z"/></svg>'
  };

  var TYPE_LABEL = { like: "Likes", match: "Matches", message: "Messages" };

  var feed = document.getElementById("feed");
  var feedEmpty = document.getElementById("feedEmpty");
  var unreadLine = document.getElementById("unreadLine");
  var markAll = document.getElementById("markAll");
  var toastEl = document.getElementById("toast");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var currentFilter = "all";
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function relTime(mins) {
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    var h = Math.round(mins / 60);
    if (h < 24) return h + "h ago";
    var d = Math.round(h / 24);
    return d === 1 ? "yesterday" : d + "d ago";
  }

  function groupOf(mins) {
    if (mins <= 60) return "New";
    if (mins <= 1440) return "Today";
    return "Earlier";
  }

  function countUnread(type) {
    return data.filter(function (n) {
      return n.unread && (!type || type === "all" || n.type === type);
    }).length;
  }

  function updateCounts() {
    document.querySelectorAll(".tab-count").forEach(function (el) {
      var type = el.getAttribute("data-count");
      var c = countUnread(type);
      el.textContent = c;
      el.setAttribute("data-empty", c === 0 ? "true" : "false");
    });
    var total = countUnread("all");
    unreadLine.textContent = total === 0
      ? "You're all caught up ✨"
      : "You have " + total + " new update" + (total === 1 ? "" : "s");
    markAll.disabled = total === 0;
  }

  function render() {
    var rows = data.filter(function (n) {
      return currentFilter === "all" || n.type === currentFilter;
    });

    feed.innerHTML = "";

    if (rows.length === 0) {
      feedEmpty.hidden = false;
      updateCounts();
      return;
    }
    feedEmpty.hidden = true;

    var lastGroup = null;
    rows.forEach(function (n, i) {
      var g = groupOf(n.mins);
      if (g !== lastGroup) {
        lastGroup = g;
        var lbl = document.createElement("div");
        lbl.className = "group-label";
        lbl.textContent = g;
        feed.appendChild(lbl);
      }

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "row" + (n.unread ? " is-unread" : "");
      btn.style.animationDelay = (i * 0.035) + "s";
      btn.setAttribute("data-id", String(n.id));
      btn.setAttribute("aria-label",
        n.name + ", " + TYPE_LABEL[n.type] + ", " + relTime(n.mins) +
        (n.unread ? ", unread" : ""));

      btn.innerHTML =
        '<span class="avatar">' +
          '<img class="avatar-img" src="' + n.photo + '" alt="" loading="lazy" ' +
            'onerror="this.style.visibility=&quot;hidden&quot;">' +
          '<span class="type-badge ' + n.type + '">' + ICONS[n.type] + '</span>' +
        '</span>' +
        '<span class="row-body">' +
          '<p class="row-text">' + n.text + '</p>' +
          '<p class="row-time">' + relTime(n.mins) + '</p>' +
        '</span>' +
        '<span class="row-end">' +
          (n.chip ? '<span class="chip">' + n.chip + '</span>' : '') +
          '<span class="dot" aria-hidden="true"></span>' +
        '</span>';

      feed.appendChild(btn);
    });

    updateCounts();
  }

  // Read a single row on tap.
  feed.addEventListener("click", function (e) {
    var row = e.target.closest(".row");
    if (!row) return;
    var id = parseInt(row.getAttribute("data-id"), 10);
    var item = data.find(function (n) { return n.id === id; });
    if (!item) return;

    if (item.unread) {
      item.unread = false;
      row.classList.remove("is-unread");
      updateCounts();
      toast("Marked as read");
    } else {
      toast("Opening chat with " + item.name + "…");
    }
  });

  // Mark all read.
  markAll.addEventListener("click", function () {
    var any = data.some(function (n) { return n.unread; });
    if (!any) return;
    data.forEach(function (n) { n.unread = false; });
    document.querySelectorAll(".row.is-unread").forEach(function (r) {
      r.classList.remove("is-unread");
    });
    updateCounts();
    toast("All caught up! 💌");
  });

  // Filter tabs.
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      currentFilter = tab.getAttribute("data-filter");
      render();
    });
  });

  render();
})();
