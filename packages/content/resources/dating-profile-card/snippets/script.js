(function () {
  "use strict";

  // --- Data: a small deck of clearly-fictional profiles ---------------------
  var PROFILES = [
    {
      name: "Mara", age: 27, job: "Ceramicist", dist: "3 km away",
      status: "online", statusText: "Online now", verified: true,
      bio: "Weekend potter, weekday product designer. I make ugly mugs and excellent playlists. Looking for someone to split dumplings with and lose to at Mario Kart. Bonus points if you have strong opinions about the correct way to make coffee.",
      photos: ["#ff5e6c,#8b5cf6", "#8b5cf6,#7c3aed", "#ff8fb1,#ff5e6c"],
      interests: [
        { e: "\u{1F3FA}", t: "Pottery", shared: false },
        { e: "☕", t: "Coffee", shared: true },
        { e: "\u{1F3AE}", t: "Mario Kart", shared: false },
        { e: "\u{1F35C}", t: "Dumplings", shared: true },
        { e: "\u{1F3B5}", t: "Playlists", shared: false }
      ]
    },
    {
      name: "Dev", age: 31, job: "Trail runner", dist: "6 km away",
      status: "away", statusText: "Active 12m ago", verified: true,
      bio: "Software person who escapes to mountains on weekends. I will absolutely make you try my sourdough. Fluent in sarcasm and dog. Two cats named after Star Wars characters. Let's get lost on a trail and grab tacos after.",
      photos: ["#7c3aed,#ff8fb1", "#ff5e6c,#e63950", "#8b5cf6,#ff5e6c"],
      interests: [
        { e: "\u{1F3C3}", t: "Running", shared: false },
        { e: "\u{1F35E}", t: "Sourdough", shared: false },
        { e: "\u{1F32E}", t: "Tacos", shared: true },
        { e: "\u{1F408}", t: "Cats", shared: false },
        { e: "⛰️", t: "Hiking", shared: true }
      ]
    },
    {
      name: "Priya", age: 25, job: "Jazz pianist", dist: "1 km away",
      status: "online", statusText: "Online now", verified: false,
      bio: "I play piano in smoky bars and read too many novels at once. Seeking a partner in crime for late-night bookstores and vinyl hunting. I promise I'm funnier in person and I will steal fries off your plate.",
      photos: ["#ff8fb1,#8b5cf6", "#e63950,#ff5e6c", "#8b5cf6,#7c3aed"],
      interests: [
        { e: "\u{1F3B9}", t: "Jazz", shared: false },
        { e: "\u{1F4DA}", t: "Novels", shared: true },
        { e: "\u{1F4C0}", t: "Vinyl", shared: false },
        { e: "\u{1F35F}", t: "Fries", shared: true }
      ]
    }
  ];

  // --- Elements -------------------------------------------------------------
  var card = document.getElementById("card");
  var track = document.getElementById("track");
  var dotsWrap = document.getElementById("dots");
  var chipsWrap = document.getElementById("chips");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var carousel = document.getElementById("carousel");
  var bio = document.getElementById("bio");
  var bioToggle = document.getElementById("bioToggle");
  var toastEl = document.getElementById("toast");
  var matchCount = document.getElementById("matchCount");
  var statusEl = document.getElementById("status");

  var elName = document.getElementById("pName");
  var elAge = document.getElementById("pAge");
  var elJob = document.getElementById("pJob");
  var elDist = document.getElementById("pDist");
  var elStatusText = document.getElementById("statusText");
  var elVerified = document.getElementById("verified");

  var profileIndex = 0;
  var photoIndex = 0;
  var likes = 0;
  var toastTimer = null;

  // --- Toast helper ---------------------------------------------------------
  function toast(msg, variant) {
    toastEl.textContent = msg;
    toastEl.className = "toast is-show" + (variant ? " toast--" + variant : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1900);
  }

  // --- Render a profile -----------------------------------------------------
  function render(profile) {
    photoIndex = 0;

    // Photos as gradient slides
    track.innerHTML = "";
    dotsWrap.innerHTML = "";
    profile.photos.forEach(function (colors, i) {
      var pair = colors.split(",");
      var slide = document.createElement("div");
      slide.className = "slide";
      slide.style.background = "linear-gradient(135deg, " + pair[0] + ", " + pair[1] + ")";
      track.appendChild(slide);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Photo " + (i + 1) + " of " + profile.photos.length);
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    // Identity
    elName.textContent = profile.name;
    elAge.textContent = ", " + profile.age;
    elJob.textContent = profile.job;
    elDist.textContent = profile.dist;
    elStatusText.textContent = profile.statusText;
    elVerified.style.display = profile.verified ? "" : "none";

    // Status style
    statusEl.className = "status" + (profile.status === "away" ? " is-away" : profile.status === "offline" ? " is-offline" : "");

    // Bio
    bio.textContent = profile.bio;
    bio.classList.remove("is-open");
    bioToggle.textContent = "Read more";
    bioToggle.setAttribute("aria-expanded", "false");

    // Interests
    chipsWrap.innerHTML = "";
    profile.interests.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "chip" + (it.shared ? " chip--shared" : "");
      li.innerHTML = '<span class="chip__emoji" aria-hidden="true">' + it.e + "</span>" + it.t + (it.shared ? " • you too" : "");
      chipsWrap.appendChild(li);
    });

    updateTrack();
  }

  // --- Carousel logic -------------------------------------------------------
  function updateTrack() {
    track.style.transform = "translateX(" + (-photoIndex * 100) + "%)";
    var dots = dotsWrap.querySelectorAll(".dot");
    dots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === photoIndex);
    });
  }

  function goTo(i) {
    var total = PROFILES[profileIndex].photos.length;
    photoIndex = (i + total) % total;
    updateTrack();
  }

  function nextPhoto() { goTo(photoIndex + 1); }
  function prevPhoto() { goTo(photoIndex - 1); }

  prevBtn.addEventListener("click", prevPhoto);
  nextBtn.addEventListener("click", nextPhoto);

  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); nextPhoto(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prevPhoto(); }
  });

  // Touch swipe
  var touchX = null;
  carousel.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx < 0 ? nextPhoto() : prevPhoto(); }
    touchX = null;
  });

  // --- Bio expand -----------------------------------------------------------
  bioToggle.addEventListener("click", function () {
    var open = bio.classList.toggle("is-open");
    bioToggle.textContent = open ? "Show less" : "Read more";
    bioToggle.setAttribute("aria-expanded", String(open));
  });

  // --- Actions --------------------------------------------------------------
  function bump(btn) {
    btn.classList.remove("is-tapped");
    void btn.offsetWidth;
    btn.classList.add("is-tapped");
  }

  function advanceProfile(dir) {
    var leaving = "is-leaving-" + dir;
    card.classList.add(leaving);
    setTimeout(function () {
      profileIndex = (profileIndex + 1) % PROFILES.length;
      render(PROFILES[profileIndex]);
      card.classList.remove(leaving);
      card.classList.add("is-entering");
      setTimeout(function () { card.classList.remove("is-entering"); }, 500);
    }, 380);
  }

  function updateCount() {
    matchCount.textContent = likes + (likes === 1 ? " like sent" : " likes sent");
  }

  document.getElementById("likeBtn").addEventListener("click", function () {
    bump(this);
    likes++; updateCount();
    toast("You liked " + PROFILES[profileIndex].name + " ❤️", "like");
    advanceProfile("like");
  });

  document.getElementById("superBtn").addEventListener("click", function () {
    bump(this);
    likes++; updateCount();
    toast("Super liked " + PROFILES[profileIndex].name + "! ⭐", "super");
    advanceProfile("super");
  });

  document.getElementById("passBtn").addEventListener("click", function () {
    bump(this);
    toast("Passed — next up");
    advanceProfile("pass");
  });

  // --- Init -----------------------------------------------------------------
  render(PROFILES[0]);
  updateCount();
})();
