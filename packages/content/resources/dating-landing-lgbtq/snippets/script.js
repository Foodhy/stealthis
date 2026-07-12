(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
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

  /* ---------- Match card carousel (phone) ---------- */
  var profiles = [
    { name: "Sam", pron: "they/them", loc: "Age 27 · 3 mi away", tags: ["Nonbinary", "Musician"], grad: "linear-gradient(135deg,#ff5e6c,#ff9f45)" },
    { name: "Priya", pron: "she/her", loc: "Age 29 · 5 mi away", tags: ["Bisexual", "Foodie"], grad: "linear-gradient(135deg,#8b5cf6,#ff8fb1)" },
    { name: "Devon", pron: "he/him", loc: "Age 31 · 2 mi away", tags: ["Gay", "Runner"], grad: "linear-gradient(135deg,#4ade80,#8b5cf6)" },
    { name: "Kai", pron: "ze/hir", loc: "Age 25 · 6 mi away", tags: ["Queer", "Artist"], grad: "linear-gradient(135deg,#ff8fb1,#7c3aed)" }
  ];
  var stack = document.getElementById("matchStack");
  var current = 0;

  function renderCard(idx) {
    var p = profiles[idx];
    var card = document.createElement("div");
    card.className = "match-card";
    card.style.background = p.grad;
    card.innerHTML =
      '<span class="match-verify">✓ Verified</span>' +
      '<div class="match-meta">' +
      '<div class="match-name">' + p.name + ' <span class="mp">' + p.pron + '</span></div>' +
      '<div class="match-sub">' + p.loc + '</div>' +
      '<div class="match-tags">' + p.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") + '</div>' +
      '</div>';
    return card;
  }

  function showCard() {
    if (!stack) return;
    stack.innerHTML = "";
    stack.appendChild(renderCard(current));
  }

  function advance(action) {
    if (!stack) return;
    var card = stack.querySelector(".match-card");
    if (card) {
      card.classList.add("leaving");
    }
    var name = profiles[current].name;
    current = (current + 1) % profiles.length;
    setTimeout(showCard, 320);
    if (action === "like") toast("💜 You liked " + name);
    else if (action === "star") toast("⭐ Super liked " + name + "!");
    else if (action === "pass") toast("Passed on " + name);
  }

  showCard();

  var likeBtn = document.getElementById("likeBtn");
  var passBtn = document.getElementById("passBtn");
  var starBtn = document.getElementById("starBtn");
  if (likeBtn) likeBtn.addEventListener("click", function () { advance("like"); });
  if (passBtn) passBtn.addEventListener("click", function () { advance("pass"); });
  if (starBtn) starBtn.addEventListener("click", function () { advance("star"); });

  /* Gently auto-rotate the deck */
  var autoRotate = setInterval(function () { advance(); }, 5200);
  if (stack) {
    stack.addEventListener("pointerdown", function () { clearInterval(autoRotate); });
  }

  /* ---------- Live online counter jitter ---------- */
  var onlineEl = document.getElementById("onlineCount");
  if (onlineEl) {
    var base = 1284;
    setInterval(function () {
      base += Math.floor(Math.random() * 9) - 4;
      if (base < 1200) base = 1200;
      onlineEl.textContent = base.toLocaleString() + " online";
    }, 3000);
  }

  /* ---------- Identity / pronoun picker ---------- */
  var pronounChips = document.getElementById("pronounChips");
  var identityChips = document.getElementById("identityChips");
  var customInput = document.getElementById("customPronoun");
  var previewPronoun = document.getElementById("previewPronoun");
  var previewTags = document.getElementById("previewTags");

  function updatePronounPreview(val) {
    if (previewPronoun) previewPronoun.textContent = val || "—";
  }

  if (pronounChips) {
    pronounChips.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      pronounChips.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var val = chip.getAttribute("data-pronoun");
      if (val === "custom") {
        customInput.hidden = false;
        customInput.focus();
        updatePronounPreview(customInput.value || "your pronouns");
      } else {
        customInput.hidden = true;
        updatePronounPreview(val);
        toast("Pronouns set to " + val);
      }
    });
  }

  if (customInput) {
    customInput.addEventListener("input", function () {
      updatePronounPreview(customInput.value || "your pronouns");
    });
  }

  /* Identity multi-select (up to 3) */
  var selectedIdentities = ["Queer"];
  function renderIdentityTags() {
    if (!previewTags) return;
    previewTags.innerHTML = selectedIdentities.length
      ? selectedIdentities.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("")
      : '<span class="tag">Add a label</span>';
  }

  if (identityChips) {
    identityChips.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      var val = chip.getAttribute("data-identity");
      var idx = selectedIdentities.indexOf(val);
      if (idx > -1) {
        selectedIdentities.splice(idx, 1);
        chip.classList.remove("is-active");
      } else {
        if (selectedIdentities.length >= 3) {
          toast("You can pick up to 3 labels");
          return;
        }
        selectedIdentities.push(val);
        chip.classList.add("is-active");
      }
      renderIdentityTags();
    });
  }

  /* ---------- Animated stat counters ---------- */
  function formatCount(n, suffix) {
    var out;
    if (suffix === "+" && n >= 1000000) {
      out = (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (suffix === "k") {
      out = n.toLocaleString();
    } else {
      out = n.toLocaleString();
    }
    if (suffix === "+" && n >= 1000000) return out + "+";
    if (suffix === "k") return out + "k";
    return out + (suffix === "%" ? "%" : suffix === "+" ? "+" : "");
  }

  function animateStat(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = 0;
    var dur = 1600;
    var t0 = performance.now();
    function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(start + (target - start) * eased);
      el.textContent = formatCount(val, suffix);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var statsRow = document.getElementById("statsRow");
  if (statsRow && "IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          statsRow.querySelectorAll(".stat-num").forEach(animateStat);
          statObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statObs.observe(statsRow);
  } else if (statsRow) {
    statsRow.querySelectorAll(".stat-num").forEach(animateStat);
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var ans = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---------- Signup form validation ---------- */
  var form = document.getElementById("joinForm");
  function setError(id, msg) {
    var field = document.getElementById(id).closest(".field");
    var err = document.querySelector('.err[data-for="' + id + '"]');
    if (msg) {
      field.classList.add("invalid");
      if (err) err.textContent = msg;
    } else {
      field.classList.remove("invalid");
      if (err) err.textContent = "";
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = document.getElementById("fName");
      var email = document.getElementById("fEmail");
      var pronoun = document.getElementById("fPronoun");
      var meet = document.getElementById("fMeet");
      var consent = document.getElementById("fConsent");

      if (!name.value.trim()) { setError("fName", "Please add your name"); ok = false; }
      else setError("fName", "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError("fEmail", "Enter a valid email"); ok = false; }
      else setError("fEmail", "");

      if (!pronoun.value) { setError("fPronoun", "Pick your pronouns"); ok = false; }
      else setError("fPronoun", "");

      if (!meet.value) { setError("fMeet", "Choose who you'd like to meet"); ok = false; }
      else setError("fMeet", "");

      if (!consent.checked) { toast("Please confirm you're 18+ to continue"); ok = false; }

      if (ok) {
        toast("🎉 Welcome to Spectrum, " + name.value.trim() + "!");
        form.reset();
        form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
      } else {
        toast("Please fix the highlighted fields");
      }
    });

    /* Clear errors as the user corrects them */
    ["fName", "fEmail", "fPronoun", "fMeet"].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("input", function () { setError(id, ""); });
      el.addEventListener("change", function () { setError(id, ""); });
    });
  }
})();
