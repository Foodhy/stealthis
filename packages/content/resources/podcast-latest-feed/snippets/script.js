(function () {
  "use strict";

  var EPISODES = [
    {
      id: "e1",
      title: "The Quiet Collapse of Group Chats",
      show: "Signal & Noise",
      date: "2h ago",
      duration: "42:18",
      isNew: true,
      grad: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
      initials: "SN"
    },
    {
      id: "e2",
      title: "Deep Work in a World That Won't Shut Up",
      show: "Deep Focus",
      date: "5h ago",
      duration: "58:04",
      isNew: true,
      grad: "linear-gradient(135deg,#f472b6,#7c3aed)",
      initials: "DF"
    },
    {
      id: "e3",
      title: "Field Recording: 3AM in the Server Room",
      show: "Night Static",
      date: "Yesterday",
      duration: "31:47",
      isNew: true,
      grad: "linear-gradient(135deg,#22d3ee,#7c3aed)",
      initials: "NS"
    },
    {
      id: "e4",
      title: "How We Almost Sold the Company Twice",
      show: "Founders Raw",
      date: "Yesterday",
      duration: "1:12:09",
      isNew: false,
      grad: "linear-gradient(135deg,#7c3aed,#f472b6)",
      initials: "FR"
    },
    {
      id: "e5",
      title: "Everything Is a Recommendation Engine Now",
      show: "Signal & Noise",
      date: "2 days ago",
      duration: "47:33",
      isNew: false,
      grad: "linear-gradient(135deg,#8b5cf6,#f472b6)",
      initials: "SN"
    },
    {
      id: "e6",
      title: "The 90-Minute Ritual That Rewired My Week",
      show: "Deep Focus",
      date: "3 days ago",
      duration: "39:52",
      isNew: false,
      grad: "linear-gradient(135deg,#22d3ee,#8b5cf6)",
      initials: "DF"
    }
  ];

  var feed = document.getElementById("feed");
  var empty = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var toastEl = document.getElementById("toast");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  var nowbar = document.getElementById("nowbar");
  var npArt = document.getElementById("npArt");
  var npTitle = document.getElementById("npTitle");
  var npShow = document.getElementById("npShow");
  var npPlay = document.getElementById("npPlay");
  var npFill = document.getElementById("npFill");

  var activeFilter = "all";
  var currentId = null;
  var isPlaying = false;
  var progress = 0;
  var timer = null;
  var played = Object.create(null);

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  function render() {
    var list = EPISODES.filter(function (ep) {
      return activeFilter === "all" || ep.show === activeFilter;
    });

    feed.innerHTML = "";
    empty.hidden = list.length > 0;

    var newCount = 0;

    list.forEach(function (ep) {
      if (ep.isNew) newCount++;

      var li = document.createElement("li");
      li.className = "row";
      if (ep.id === currentId) li.classList.add("is-playing");
      if (played[ep.id]) li.classList.add("is-played");
      li.dataset.id = ep.id;

      var badge = ep.isNew
        ? '<span class="badge">New</span>'
        : "";

      li.innerHTML =
        '<div class="art" style="background:' + ep.grad + '">' + ep.initials + "</div>" +
        '<div class="info">' +
          '<div class="eyebrow"><span class="show">' + ep.show + "</span>" + badge + "</div>" +
          '<h3 class="title">' + ep.title + "</h3>" +
          '<p class="meta"><span>' + ep.date + '</span><span class="dot"></span><span class="dur">' + ep.duration + "</span></p>" +
        "</div>" +
        '<button class="play" type="button" aria-label="Play ' + ep.title.replace(/"/g, "") + '">' +
          '<svg class="i-play" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7Z"/></svg>' +
          '<svg class="i-pause" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' +
        "</button>";

      li.querySelector(".play").addEventListener("click", function () {
        onPlay(ep);
      });

      feed.appendChild(li);
    });

    countEl.textContent = String(newCount);
  }

  function getEp(id) {
    for (var i = 0; i < EPISODES.length; i++) {
      if (EPISODES[i].id === id) return EPISODES[i];
    }
    return null;
  }

  function onPlay(ep) {
    if (ep.id === currentId) {
      togglePlay();
      return;
    }
    currentId = ep.id;
    played[ep.id] = true;
    progress = 0;
    startPlayback(ep);
    render();
  }

  function startPlayback(ep) {
    nowbar.hidden = false;
    npArt.style.background = ep.grad;
    npTitle.textContent = ep.title;
    npShow.textContent = ep.show;
    setPlaying(true);
    toast("Now playing · " + ep.show);
  }

  function setPlaying(state) {
    isPlaying = state;
    nowbar.classList.toggle("playing", state);
    var iPlay = npPlay.querySelector(".i-play");
    var iPause = npPlay.querySelector(".i-pause");
    iPlay.hidden = state;
    iPause.hidden = !state;
    npPlay.setAttribute("aria-label", state ? "Pause" : "Play");

    var row = feed.querySelector('.row[data-id="' + currentId + '"]');
    if (row) row.classList.toggle("is-playing", state);

    clearInterval(timer);
    if (state) {
      timer = setInterval(tick, 500);
    }
  }

  function togglePlay() {
    setPlaying(!isPlaying);
  }

  function tick() {
    progress += 1.4;
    if (progress >= 100) {
      progress = 100;
      npFill.style.width = "100%";
      setPlaying(false);
      toast("Episode finished");
      return;
    }
    npFill.style.width = progress + "%";
  }

  npPlay.addEventListener("click", function () {
    if (!currentId) return;
    togglePlay();
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      activeFilter = chip.dataset.show;
      render();
    });
  });

  document.getElementById("markBtn").addEventListener("click", function () {
    EPISODES.forEach(function (ep) {
      played[ep.id] = true;
      ep.isNew = false;
    });
    render();
    toast("Marked all as played");
  });

  render();
})();
