(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 320);
    }, 3400);
  }

  /* ---------- data ---------- */
  var films = [
    { title: "Mara & Jules", loc: "Blue Ridge, NC", cat: "cinematic", style: "Cinematic", run: "00:04:12", grad: "linear-gradient(135deg,#7a4a2b,#2a1810)" },
    { title: "Priya & Dev", loc: "Charleston, SC", cat: "documentary", style: "Documentary", run: "00:06:38", grad: "linear-gradient(135deg,#4a5a72,#181d28)" },
    { title: "Elena & Sam", loc: "Dolomites, IT", cat: "elopement", style: "Elopement", run: "00:03:05", grad: "linear-gradient(135deg,#6b7a5a,#1c2216)" },
    { title: "Noa & Theo", loc: "Big Sur, CA", cat: "cinematic", style: "Cinematic", run: "00:05:20", grad: "linear-gradient(135deg,#8a5a4a,#2a1712)" },
    { title: "Rosa & Cai", loc: "Savannah, GA", cat: "documentary", style: "Documentary", run: "00:07:01", grad: "linear-gradient(135deg,#5a4a6b,#1e1826)" },
    { title: "Ivy & Wren", loc: "Isle of Skye, UK", cat: "elopement", style: "Elopement", run: "00:02:48", grad: "linear-gradient(135deg,#4a6b6a,#16211f)" }
  ];

  var packages = [
    {
      name: "Highlight", once: 2400, desc: "A short, keepsake film for intimate days.",
      feat: ["6-hour coverage, one filmmaker", "3–4 min highlight film", "Licensed music + colour grade", "Delivery in 6 weeks"]
    },
    {
      name: "Signature", once: 3900, featured: true, desc: "Our most-booked — full-day story, beautifully told.",
      feat: ["10-hour coverage, two filmmakers", "6–8 min feature film", "60-sec teaser for socials", "Ceremony & speeches in full", "Delivery in 5 weeks"]
    },
    {
      name: "Heirloom", once: 6200, desc: "The complete cinematic archive of your weekend.",
      feat: ["Two days, two filmmakers", "10-min feature + full ceremony", "Drone + second-angle coverage", "Rehearsal-dinner short film", "Engraved USB + priority edit"]
    }
  ];

  var testimonials = [
    { text: "We ugly-cried the second we hit play. Aurelia caught moments we didn't even know happened.", name: "Mara & Jules", detail: "Married May 2027 · Blue Ridge", av: "linear-gradient(135deg,#c98a5a,#5a2f1c)" },
    { text: "Invisible all day, then handed us a film that felt like a memory more than a video.", name: "Priya & Dev", detail: "Married Apr 2027 · Charleston", av: "linear-gradient(135deg,#5a7ac9,#1c2f5a)" },
    { text: "Our elopement was just us and a mountain. The film makes it look like a feature.", name: "Elena & Sam", detail: "Eloped Sep 2026 · Dolomites", av: "linear-gradient(135deg,#7ac95a,#2f5a1c)" },
    { text: "Booking Aurelia was the single best decision of our whole planning process.", name: "Noa & Theo", detail: "Married Jun 2027 · Big Sur", av: "linear-gradient(135deg,#c95a9a,#5a1c3f)" }
  ];

  /* ---------- render films ---------- */
  var filmGrid = document.getElementById("filmGrid");
  function renderFilms(filter) {
    filmGrid.innerHTML = "";
    films
      .filter(function (f) { return filter === "all" || f.cat === filter; })
      .forEach(function (f, i) {
        var el = document.createElement("article");
        el.className = "film";
        el.tabIndex = 0;
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", "Play film: " + f.title);
        el.style.animationDelay = (i * 60) + "ms";
        el.innerHTML =
          '<div class="film-thumb" style="background-image:' + f.grad + '">' +
            '<span class="film-badge">' + f.style + '</span>' +
            '<span class="film-play"></span>' +
            '<span class="film-tc" data-run="' + f.run + '">' + f.run + '</span>' +
          '</div>' +
          '<div class="film-info">' +
            '<h3 class="film-title">' + f.title + '</h3>' +
            '<p class="film-meta"><span>' + f.loc + '</span><span class="dot"></span><span>' + f.run + '</span></p>' +
          '</div>';

        function open() { toast("▶ Opening “" + f.title + "” — " + f.run); }
        el.addEventListener("click", open);
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        });

        // hover scrub timecode
        var tc = el.querySelector(".film-tc");
        var scrub;
        el.addEventListener("mouseenter", function () {
          var t = 0;
          scrub = setInterval(function () {
            t += 7;
            var m = Math.floor(t / 60), s = t % 60;
            tc.textContent = "00:0" + m + ":" + String(s).padStart(2, "0");
            if (t > 240) t = 0;
          }, 90);
        });
        el.addEventListener("mouseleave", function () {
          clearInterval(scrub);
          tc.textContent = f.run;
        });

        filmGrid.appendChild(el);
      });
  }
  renderFilms("all");

  /* ---------- filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      renderFilms(chip.dataset.filter);
    });
  });

  /* ---------- packages ---------- */
  var pkgGrid = document.getElementById("pkgGrid");
  var currentPlan = "once";
  function money(n) { return n.toLocaleString("en-US"); }
  function renderPackages() {
    pkgGrid.innerHTML = "";
    packages.forEach(function (p) {
      var el = document.createElement("article");
      el.className = "pkg" + (p.featured ? " featured" : "");
      var num, per, sub;
      if (currentPlan === "installments") {
        num = money(Math.round(p.once / 12));
        per = "/mo";
        sub = "×12 months · $" + money(p.once) + " total, 0% APR";
      } else {
        num = money(p.once);
        per = "one-off";
        sub = "Save vs. monthly · locked at booking";
      }
      el.innerHTML =
        (p.featured ? '<span class="pkg-tag">Most booked</span>' : "") +
        '<p class="pkg-name">' + p.name + '</p>' +
        '<p class="pkg-desc">' + p.desc + '</p>' +
        '<div class="pkg-price"><span class="cur">$</span><span class="num">' + num + '</span><span class="per">' + per + '</span></div>' +
        '<p class="pkg-sub">' + sub + '</p>' +
        '<ul class="pkg-feat">' + p.feat.map(function (f) { return "<li>" + f + "</li>"; }).join("") + '</ul>' +
        '<button class="btn ' + (p.featured ? "btn-primary" : "btn-ghost") + ' btn-block" data-pkg="' + p.name + '">Enquire · ' + p.name + '</button>';
      el.querySelector("[data-pkg]").addEventListener("click", function () {
        openModal(p.name);
      });
      pkgGrid.appendChild(el);
    });
  }
  renderPackages();

  var planBtns = Array.prototype.slice.call(document.querySelectorAll(".toggle-opt"));
  planBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      planBtns.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      currentPlan = b.dataset.plan;
      renderPackages();
    });
  });

  /* ---------- testimonials carousel ---------- */
  var track = document.getElementById("carTrack");
  var dotsWrap = document.getElementById("carDots");
  var idx = 0, timer;
  testimonials.forEach(function (q, i) {
    var el = document.createElement("div");
    el.className = "quote";
    el.setAttribute("role", "group");
    el.setAttribute("aria-roledescription", "slide");
    el.setAttribute("aria-label", (i + 1) + " of " + testimonials.length);
    el.innerHTML =
      '<div class="stars" aria-label="5 out of 5 stars">★★★★★</div>' +
      '<p class="quote-text">“' + q.text + '”</p>' +
      '<div class="quote-by">' +
        '<span class="quote-av" style="background-image:' + q.av + '"></span>' +
        '<span><span class="quote-name">' + q.name + '</span><br><span class="quote-detail">' + q.detail + '</span></span>' +
      '</div>';
    track.appendChild(el);

    var d = document.createElement("button");
    d.className = "dot-btn" + (i === 0 ? " is-active" : "");
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", "Testimonial " + (i + 1));
    d.addEventListener("click", function () { go(i); });
    dotsWrap.appendChild(d);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function go(n) {
    idx = (n + testimonials.length) % testimonials.length;
    track.style.transform = "translateX(-" + (idx * 100) + "%)";
    dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); d.setAttribute("aria-selected", i === idx); });
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { go(idx + 1); }, 6000);
  }
  document.getElementById("carNext").addEventListener("click", function () { go(idx + 1); });
  document.getElementById("carPrev").addEventListener("click", function () { go(idx - 1); });
  var carousel = document.getElementById("carousel");
  carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
  carousel.addEventListener("mouseleave", restart);
  carousel.setAttribute("tabindex", "0");
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
  });
  restart();

  /* ---------- hero reel play toggle ---------- */
  var playBtn = document.getElementById("playReel");
  var reelTc = document.getElementById("reelTc");
  var playing = false, reelTimer, frame = 0;
  playBtn.addEventListener("click", function () {
    playing = !playing;
    playBtn.classList.toggle("is-playing", playing);
    playBtn.setAttribute("aria-pressed", String(playing));
    playBtn.querySelector(".play-label").textContent = playing ? "Pause reel" : "Watch the reel";
    if (playing) {
      toast("▶ Playing showreel · 02:14");
      reelTimer = setInterval(function () {
        frame++;
        var totalF = frame;
        var ff = totalF % 24;
        var secs = Math.floor(totalF / 24);
        var m = Math.floor(secs / 60), s = secs % 60;
        reelTc.textContent = "00:0" + m + ":" + String(s).padStart(2, "0") + ":" + String(ff).padStart(2, "0");
      }, 42);
    } else {
      clearInterval(reelTimer);
    }
  });

  /* ---------- scroll progress + topbar ---------- */
  var scrollbar = document.getElementById("scrollbar");
  var topbar = document.getElementById("topbar");
  function onScroll() {
    var h = document.documentElement;
    var pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    scrollbar.style.width = pct + "%";
    topbar.classList.toggle("scrolled", h.scrollTop > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- modal + form ---------- */
  var modal = document.getElementById("enquireModal");
  var modalCard = document.getElementById("modalCard");
  var form = document.getElementById("enquireForm");
  var pkgSelect = document.getElementById("fPkg");
  var dateInput = document.getElementById("fDate");
  var availLine = document.getElementById("availLine");
  var lastFocus = null;

  // min date = today
  var today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  function openModal(preselect) {
    lastFocus = document.activeElement;
    if (preselect && pkgSelect.querySelector('option[value="' + preselect + '"]')) {
      pkgSelect.value = preselect;
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { document.getElementById("fName").focus(); }, 40);
    document.addEventListener("keydown", onKeydown);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus) lastFocus.focus();
  }
  function onKeydown(e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var focusables = modalCard.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      focusables = Array.prototype.filter.call(focusables, function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-open-enquire]"), function (b) {
    b.addEventListener("click", function () { openModal(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-close-enquire]"), function (b) {
    b.addEventListener("click", closeModal);
  });

  /* ---- mock availability check ---- */
  var checkTimer;
  dateInput.addEventListener("change", function () {
    if (!dateInput.value) { availLine.hidden = true; return; }
    availLine.hidden = false;
    availLine.className = "avail check";
    availLine.textContent = "Checking availability…";
    clearTimeout(checkTimer);
    checkTimer = setTimeout(function () {
      var d = new Date(dateInput.value);
      // deterministic mock: some Saturdays already booked
      var busy = (d.getDate() % 7 === 3) || (d.getDay() === 0);
      if (busy) {
        availLine.className = "avail busy";
        availLine.textContent = "That date is on our waitlist — send an enquiry and we'll suggest nearby options.";
      } else {
        availLine.className = "avail ok";
        availLine.textContent = "Good news — " + d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + " looks open.";
      }
    }, 850);
  });

  /* ---- validation ---- */
  function setError(name, msg) {
    var field = form.querySelector('[name="' + name + '"]').closest(".field");
    var err = field.querySelector(".err");
    if (msg) { field.classList.add("invalid"); if (err) err.textContent = msg; }
    else { field.classList.remove("invalid"); }
  }
  ["name", "date", "email"].forEach(function (n) {
    form.querySelector('[name="' + n + '"]').addEventListener("input", function () { setError(n, ""); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var name = form.name.value.trim();
    var date = form.date.value;
    var email = form.email.value.trim();

    if (name.length < 2) { setError("name", "Please tell us your name."); ok = false; }
    if (!date) { setError("date", "Pick your wedding date."); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email address."); ok = false; }

    if (!ok) { toast("Please fix the highlighted fields."); return; }

    var btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Sending…";
    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = "Send enquiry";
      closeModal();
      form.reset();
      availLine.hidden = true;
      toast("Enquiry sent — we'll reply to " + email + " within 24h.");
    }, 1100);
  });
})();
