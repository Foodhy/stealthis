(function () {
  "use strict";

  /* ---------- data ---------- */
  var SEASONS = [
    {
      n: 1,
      year: 2024,
      label: "Season 1",
      episodes: [
        { n: 1, t: "Carrier Wave", dur: "52m", air: "Mar 8, 2024", code: "S1E1", progress: 100, downloaded: true,
          syn: "A decommissioned listening post in northern Norway transmits a forty-year-old distress call. Cryptographer Iris Calder is dragged out of early retirement to confirm what everyone hopes is a hoax." },
        { n: 2, t: "Static Bloom", dur: "49m", air: "Mar 8, 2024", code: "S1E2", progress: 100, downloaded: true,
          syn: "Iris isolates a second layer buried inside the signal. The agency wants it buried with it. A storm strands the team on the island for the night." },
        { n: 3, t: "The Long Echo", dur: "55m", air: "Mar 15, 2024", code: "S1E3", progress: 0, downloaded: false,
          syn: "An old colleague resurfaces with a tape that should not exist. Iris begins to suspect the voice on the wire is reading from her own case files." },
        { n: 4, t: "Dead Air", dur: "47m", air: "Mar 22, 2024", code: "S1E4", progress: 0, downloaded: false,
          syn: "The investigation splinters as the team disagrees about who is really listening. A power cut leaves them deciphering by hand for thirty-six hours." }
      ]
    },
    {
      n: 2,
      year: 2025,
      label: "Season 2",
      episodes: [
        { n: 1, t: "Cold Open", dur: "58m", air: "Jan 10, 2025", code: "S2E1", progress: 100, downloaded: true,
          syn: "One year on, Iris hears the same frequency leaking from a children's radio in Lisbon. What was supposed to be a single anomaly has started to spread across the map." },
        { n: 2, t: "Ground Loop", dur: "51m", air: "Jan 17, 2025", code: "S2E2", progress: 100, downloaded: false,
          syn: "A rival analyst claims the signal is man-made and points the finger at Iris's own department. Trust on the team frays to a single thread." },
        { n: 3, t: "Sidebands", dur: "53m", air: "Jan 24, 2025", code: "S2E3", progress: 100, downloaded: true,
          syn: "Decoding the Lisbon recording reveals coordinates that lead somewhere impossible. Iris makes a call she can never take back." },
        { n: 4, t: "The Quiet Hour", dur: "61m", air: "Jan 31, 2025", code: "S2E4", progress: 38, downloaded: true, nowPlaying: true,
          syn: "Iris and Marlowe go off the books to reach the coordinates before the agency does. For sixty silent minutes, the only thing transmitting is them." },
        { n: 5, t: "Harmonics", dur: "49m", air: "Feb 7, 2025", code: "S2E5", progress: 0, downloaded: false,
          syn: "The consequences of the quiet hour ripple outward. A familiar voice offers Iris a deal that sounds exactly like surrender." },
        { n: 6, t: "Null Point", dur: "57m", air: "Feb 14, 2025", code: "S2E6", progress: 0, downloaded: false,
          syn: "Season finale. Everything Iris believed about the source of the signal collapses into a single, devastating frequency." }
      ]
    },
    {
      n: 3,
      year: 2026,
      label: "Season 3",
      episodes: [
        { n: 1, t: "Open Channel", dur: "54m", air: "Mar 6, 2026", code: "S3E1", progress: 0, downloaded: false,
          syn: "A new season begins with Iris on the wrong side of an inquiry. The signal has gone silent — and its absence is somehow louder than it ever was." },
        { n: 2, t: "Phantom Power", dur: "50m", air: "Mar 13, 2026", code: "S3E2", progress: 0, downloaded: false,
          syn: "A junior tech stumbles onto a pattern in the silence. Iris must decide whether to mentor her or warn her away from the wire entirely." },
        { n: 3, t: "Standing Wave", dur: "56m", air: "Mar 20, 2026", code: "S3E3", progress: 0, downloaded: false,
          syn: "Old allies become liabilities as the inquiry closes in. The frequency returns, and this time it is asking for Iris by name." }
      ]
    }
  ];

  /* ---------- elements ---------- */
  var select = document.getElementById("season");
  var tabsEl = document.querySelector(".season-tabs");
  var listEl = document.getElementById("ep-list");
  var toastEl = document.getElementById("toast");

  var defaultSeasonIndex = 1; // Season 2 (latest with in-progress)
  var current = defaultSeasonIndex;

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------- build season controls ---------- */
  SEASONS.forEach(function (s, i) {
    var opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = s.label + " · " + s.year;
    select.appendChild(opt);

    var tab = document.createElement("button");
    tab.className = "season-tab";
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.dataset.index = String(i);
    tab.textContent = s.label;
    tabsEl.appendChild(tab);
  });

  var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  var DL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- render ---------- */
  function render(index) {
    current = index;
    var season = SEASONS[index];
    listEl.innerHTML = "";

    season.episodes.forEach(function (ep) {
      var li = document.createElement("li");
      li.className = "ep";
      if (ep.nowPlaying) li.classList.add("is-playing");
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", "Play " + season.label + " episode " + ep.n + ", " + ep.t);

      var nowTag = ep.nowPlaying ? '<span class="ep__nowtag">Now playing</span>' : "";
      var dl = ep.downloaded
        ? '<span class="chip-dl">' + DL_ICON + "Downloaded</span>"
        : "";
      var prog = ep.progress > 0
        ? '<div class="ep__progress"><span style="width:' + ep.progress + '%"></span></div>'
        : "";

      li.innerHTML =
        '<div class="ep__num">' + ep.n + "</div>" +
        '<div class="ep__thumb">' +
          '<div class="ep__thumb-art">' + ep.code + "</div>" +
          '<div class="ep__play">' + PLAY_ICON + "</div>" +
          '<span class="ep__dur">' + ep.dur + "</span>" +
          prog +
        "</div>" +
        '<div class="ep__body">' +
          '<div class="ep__topline">' +
            '<h3 class="ep__title">' + ep.t + "</h3>" +
            nowTag +
            '<div class="ep__chips">' + dl + "</div>" +
          "</div>" +
          '<p class="ep__air">' + ep.air + "</p>" +
          '<p class="ep__syn">' + ep.syn + "</p>" +
          '<button class="ep__more" type="button" aria-expanded="false">Read more</button>' +
        "</div>";

      // expand synopsis
      var more = li.querySelector(".ep__more");
      more.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = li.classList.toggle("is-open");
        more.textContent = open ? "Read less" : "Read more";
        more.setAttribute("aria-expanded", String(open));
      });

      // select / play episode
      function pickEpisode() {
        listEl.querySelectorAll(".ep").forEach(function (el) {
          el.classList.remove("is-playing");
          var tag = el.querySelector(".ep__nowtag");
          if (tag) tag.remove();
        });
        li.classList.add("is-playing");
        var topline = li.querySelector(".ep__topline");
        if (!topline.querySelector(".ep__nowtag")) {
          var tag = document.createElement("span");
          tag.className = "ep__nowtag";
          tag.textContent = "Now playing";
          topline.querySelector(".ep__title").insertAdjacentElement("afterend", tag);
        }
        toast("Playing " + season.label.replace("Season ", "S") + " · E" + ep.n + " — " + ep.t);
      }

      li.addEventListener("click", pickEpisode);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pickEpisode();
        }
      });

      listEl.appendChild(li);
    });

    // sync controls
    select.value = String(index);
    tabsEl.querySelectorAll(".season-tab").forEach(function (t) {
      var on = Number(t.dataset.index) === index;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
  }

  /* ---------- events ---------- */
  select.addEventListener("change", function () {
    render(Number(select.value));
  });

  tabsEl.addEventListener("click", function (e) {
    var tab = e.target.closest(".season-tab");
    if (!tab) return;
    render(Number(tab.dataset.index));
  });

  // keyboard nav across tabs
  tabsEl.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var next = current + (e.key === "ArrowRight" ? 1 : -1);
    if (next < 0 || next >= SEASONS.length) return;
    render(next);
    tabsEl.querySelectorAll(".season-tab")[next].focus();
  });

  // hero actions
  document.querySelectorAll("[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.dataset.action;
      if (action === "resume") {
        render(1);
        toast("Resuming The Hollow Signal — S2 · E4");
      } else if (action === "mylist") {
        var on = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", String(!on));
        toast(on ? "Removed from My List" : "Added to My List");
      }
    });
  });

  render(defaultSeasonIndex);
})();
