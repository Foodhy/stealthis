// Podcast — Host Bios
// Vanilla JS: renders host cards, role filtering, copy-handle, tooltips.

(function () {
  "use strict";

  var HOSTS = [
    {
      name: "Maya Okonkwo",
      role: "host",
      roleLabel: "Host",
      handle: "@mayaonair",
      live: true,
      photo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      bio: "Founding host and lead interviewer. Ten years chasing the story between the pauses — she can pull a confession out of dead air.",
    },
    {
      name: "Dev Ramachandran",
      role: "host",
      roleLabel: "Host",
      handle: "@devtalksback",
      live: false,
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      bio: "Co-host and resident skeptic. Turns every hot take into a two-way debate and keeps the segment honest when the mics get warm.",
    },
    {
      name: "Priya Anand",
      role: "producer",
      roleLabel: "Producer",
      handle: "@priyacuts",
      live: false,
      photo:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
      bio: "Senior producer and sound designer. She shapes the arc, layers the score, and decides which 40 seconds actually make the cut.",
    },
    {
      name: "Marcus Bell",
      role: "producer",
      roleLabel: "Producer",
      handle: "@bellonthebeat",
      live: false,
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Field producer and booker. If a guest is worth hearing, Marcus already has their number saved and a car booked to the studio.",
    },
    {
      name: "Sofia Reyes",
      role: "guest",
      roleLabel: "Guest Voice",
      handle: "@sofiareyes",
      live: false,
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Recurring guest voice and culture critic. Drops in each month to argue about the internet and leave everyone rethinking their timeline.",
    },
    {
      name: "Theo Nakamura",
      role: "guest",
      roleLabel: "Guest Voice",
      handle: "@theonakamura",
      live: false,
      photo:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      bio: "Guest correspondent from the tech beat. Explains the unexplainable in plain language and never once says the word disrupt.",
    },
  ];

  var SOCIALS = {
    twitter: {
      tip: "X / Twitter",
      path:
        "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    instagram: {
      tip: "Instagram",
      path:
        "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 1.62a3.68 3.68 0 1 0 0 7.36 3.68 3.68 0 0 0 0-7.36zm5.5-1.44a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z",
    },
    linkedin: {
      tip: "LinkedIn",
      path:
        "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z",
    },
    mic: {
      tip: "Listen",
      path:
        "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 0 1 2 0 7 7 0 0 1-6 6.93V22a1 1 0 0 1-2 0v-1.07A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0z",
    },
  };

  var grid = document.getElementById("grid");
  var toastEl = document.getElementById("toast");
  var shownEl = document.getElementById("shown");
  var totalEl = document.getElementById("total");
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function icon(path) {
    return (
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' +
      path +
      '"/></svg>'
    );
  }

  function socialButton(kind, name) {
    var s = SOCIALS[kind];
    return (
      '<button class="social" type="button" data-tip="' +
      s.tip +
      '" aria-label="' +
      s.tip +
      " — " +
      name +
      '" data-social="' +
      kind +
      '">' +
      icon(s.path) +
      "</button>"
    );
  }

  function wave() {
    var bars = "";
    for (var i = 0; i < 7; i++) bars += "<span></span>";
    return '<div class="wave" aria-hidden="true">' + bars + "</div>";
  }

  function cardHTML(h, idx) {
    return (
      '<article class="card" data-role="' +
      h.role +
      '" style="animation-delay:' +
      idx * 60 +
      'ms">' +
      '<div class="avatar-wrap">' +
      '<img class="avatar" src="' +
      h.photo +
      '" alt="Portrait of ' +
      h.name +
      '" loading="lazy" />' +
      (h.live ? '<span class="live">On air</span>' : "") +
      "</div>" +
      wave() +
      '<div class="name-row">' +
      '<h2 class="name">' +
      h.name +
      "</h2>" +
      '<span class="badge" data-role="' +
      h.role +
      '">' +
      h.roleLabel +
      "</span>" +
      "</div>" +
      '<button class="handle" type="button" data-handle="' +
      h.handle +
      '" aria-label="Copy handle ' +
      h.handle +
      '">' +
      icon(
        "M16 1H4a2 2 0 0 0-2 2v12h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11z"
      ) +
      "<span>" +
      h.handle +
      "</span>" +
      "</button>" +
      '<p class="bio">' +
      h.bio +
      "</p>" +
      '<div class="socials">' +
      socialButton("twitter", h.name) +
      socialButton("instagram", h.name) +
      socialButton("linkedin", h.name) +
      socialButton("mic", h.name) +
      "</div>" +
      "</article>"
    );
  }

  function render() {
    grid.innerHTML = HOSTS.map(cardHTML).join("");
    totalEl.textContent = String(HOSTS.length);
    shownEl.textContent = String(HOSTS.length);
  }

  function applyFilter(filter) {
    var cards = grid.querySelectorAll(".card");
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-role") === filter;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    shownEl.textContent = String(shown);
  }

  function copyHandle(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          toast("Copied " + text + " to clipboard");
        },
        function () {
          toast("Handle: " + text);
        }
      );
    } else {
      toast("Handle: " + text);
    }
  }

  // ----- Events -----
  render();

  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  grid.addEventListener("click", function (e) {
    var handleBtn = e.target.closest(".handle");
    if (handleBtn) {
      copyHandle(handleBtn.getAttribute("data-handle"));
      return;
    }
    var social = e.target.closest(".social");
    if (social) {
      var card = social.closest(".card");
      var name = card.querySelector(".name").textContent;
      toast(SOCIALS[social.getAttribute("data-social")].tip + " · " + name);
    }
  });
})();
