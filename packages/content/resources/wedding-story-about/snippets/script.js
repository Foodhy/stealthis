(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- timeline reveal ---------- */
  var items = document.querySelectorAll(".tl-item");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- quote carousel ---------- */
  var quotes = [
    { text: "You are, and always have been, my home no matter the city.", by: "Julian, in his vows" },
    { text: "He laughs at my worst jokes and that is how I knew.", by: "Amara" },
    { text: "Two people, one umbrella, and not a single dry shoulder.", by: "Priya, maid of honor" },
    { text: "They finish each other's grocery lists. It is unbearably sweet.", by: "Theo, best man" },
    { text: "Love is the quiet 8:14 we always choose to miss together.", by: "Amara & Julian" }
  ];

  var qText = document.getElementById("q-text");
  var qBy = document.getElementById("q-by");
  var qCard = document.querySelector(".q-card");
  var dotsWrap = document.getElementById("q-dots");
  var qi = 0;
  var autoTimer;

  // build dots
  quotes.forEach(function (_, i) {
    var b = document.createElement("button");
    b.className = "q-dot" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Love note " + (i + 1));
    b.addEventListener("click", function () { goTo(i, true); });
    dotsWrap.appendChild(b);
  });
  var dots = dotsWrap.querySelectorAll(".q-dot");

  function render() {
    qCard.classList.add("fade");
    setTimeout(function () {
      qText.textContent = quotes[qi].text;
      qBy.textContent = quotes[qi].by;
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === qi); });
      qCard.classList.remove("fade");
    }, 200);
  }

  function goTo(i, userAction) {
    qi = (i + quotes.length) % quotes.length;
    render();
    if (userAction) restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { goTo(qi + 1, false); }, 6000);
  }

  document.querySelectorAll(".q-arrow").forEach(function (btn) {
    btn.addEventListener("click", function () {
      goTo(qi + (btn.dataset.q === "next" ? 1 : -1), true);
    });
  });

  // keyboard: left/right when quote section focused/hovered
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") goTo(qi + 1, true);
    else if (e.key === "ArrowLeft") goTo(qi - 1, true);
  });

  render();
  restartAuto();

  /* ---------- wedding party ---------- */
  var party = [
    { name: "Priya Anand", role: "Maid of Honor", side: "bride", note: "Amara's sister & keeper of secrets", initials: "PA", c: "#c98a86" },
    { name: "Delia Cross", role: "Bridesmaid", side: "bride", note: "College roommate, forever co-conspirator", initials: "DC", c: "#e8b7b0" },
    { name: "Mara Ito", role: "Bridesmaid", side: "bride", note: "The one who plans everything", initials: "MI", c: "#c9a24b" },
    { name: "Nina Vale", role: "Bridesmaid", side: "bride", note: "Champagne enthusiast & cheerleader", initials: "NV", c: "#a8862f" },
    { name: "Theo Brandt", role: "Best Man", side: "groom", note: "Julian's brother & worst golfer", initials: "TB", c: "#a8862f" },
    { name: "Sam Okoro", role: "Groomsman", side: "groom", note: "Met on the missed 8:14 train", initials: "SO", c: "#c9a24b" },
    { name: "Luca Reyes", role: "Groomsman", side: "groom", note: "Playlist curator for life", initials: "LR", c: "#c98a86" },
    { name: "Owen Hale", role: "Groomsman", side: "groom", note: "First to say I told you so", initials: "OH", c: "#e8b7b0" }
  ];

  var partyWrap = document.getElementById("party");
  party.forEach(function (m) {
    var card = document.createElement("article");
    card.className = "member";
    card.dataset.side = m.side;
    card.innerHTML =
      '<div class="avatar" style="background:' + m.c + '">' + m.initials + "</div>" +
      "<h3>" + m.name + "</h3>" +
      '<span class="role-badge ' + m.side + '">' + m.role + "</span>" +
      "<p>" + m.note + "</p>";
    partyWrap.appendChild(card);
  });

  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.dataset.filter;
      var shown = 0;
      partyWrap.querySelectorAll(".member").forEach(function (m) {
        var match = f === "all" || m.dataset.side === f;
        m.classList.toggle("hide", !match);
        if (match) shown++;
      });
      toast(f === "all" ? "Showing the whole party" : "Showing " + shown + " lovely people");
    });
  });

  /* ---------- guestbook ---------- */
  var form = document.getElementById("guestbook");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("gb-name").value.trim();
    if (!name) return;
    toast("Thank you, " + name + " — your note is saved");
    form.reset();
  });
})();
