(function () {
  "use strict";

  var TOTAL = 5; // interactive steps (0..4); step 5 is the finish screen
  var current = 0;
  var phoneVerified = false;

  var state = {
    phone: "",
    name: "",
    dob: "",
    age: null,
    photos: [],        // indexes 0..5, true = filled
    interests: [],
    intent: ""
  };

  // ---------- helpers ----------
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  var steps = $$(".step");
  var dotsWrap = $("#dots");
  var backBtn = $("#backBtn");
  var nextBtn = $("#nextBtn");
  var footer = $("#footer");

  // ---------- progress dots ----------
  var dots = [];
  for (var i = 0; i < TOTAL; i++) {
    var d = document.createElement("button");
    d.type = "button";
    d.className = "dot";
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", "Step " + (i + 1) + " of " + TOTAL);
    (function (idx) {
      d.addEventListener("click", function () {
        if (idx < current) goTo(idx); // only jump back to completed steps
      });
    })(i);
    dotsWrap.appendChild(d);
    dots.push(d);
  }

  function renderDots() {
    dots.forEach(function (dot, idx) {
      dot.classList.toggle("active", idx === current);
      dot.classList.toggle("done", idx < current);
      dot.disabled = idx >= current;
      if (idx === current) dot.setAttribute("aria-selected", "true");
      else dot.removeAttribute("aria-selected");
    });
  }

  // ---------- navigation ----------
  var CTA = ["Continue", "Continue", "Continue", "Continue", "Create account"];

  function show(idx) {
    steps.forEach(function (s) {
      var n = Number(s.getAttribute("data-step"));
      var on = n === idx;
      s.classList.toggle("is-active", on);
      s.hidden = !on;
    });
  }

  function goTo(idx) {
    current = idx;
    show(idx);
    renderDots();
    backBtn.hidden = idx === 0;
    nextBtn.textContent = CTA[idx] || "Continue";
    $(".viewport").scrollTop = 0;
    // focus the first control for keyboard users
    var focusable = steps[idx].querySelector("input, button, .chip, .intent, .photo-slot");
    if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 60);
  }

  backBtn.addEventListener("click", function () {
    if (current > 0) goTo(current - 1);
  });

  nextBtn.addEventListener("click", function () {
    if (validate(current)) {
      if (current < TOTAL - 1) {
        goTo(current + 1);
      } else {
        finish();
      }
    }
  });

  // ============================================================
  // STEP 1 — Phone
  // ============================================================
  var phoneInput = $("#phone");
  var verifyBlock = $("#verifyBlock");
  var otpBoxes = $$(".otp-box");

  function formatPhone(raw) {
    var d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length > 6) return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    if (d.length > 3) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    if (d.length > 0) return "(" + d;
    return "";
  }

  phoneInput.addEventListener("input", function () {
    phoneInput.value = formatPhone(phoneInput.value);
    phoneInput.classList.remove("invalid");
    var digits = phoneInput.value.replace(/\D/g, "");
    if (digits.length === 10 && verifyBlock.hidden) {
      verifyBlock.hidden = false;
      toast("Code sent! Use 4821 for this demo.");
      setTimeout(function () { otpBoxes[0].focus(); }, 150);
    }
  });

  otpBoxes.forEach(function (box, i) {
    box.addEventListener("input", function () {
      box.value = box.value.replace(/\D/g, "");
      if (box.value && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
      checkOtp();
    });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !box.value && i > 0) otpBoxes[i - 1].focus();
    });
  });

  function checkOtp() {
    var code = otpBoxes.map(function (b) { return b.value; }).join("");
    if (code.length === 4) {
      if (code === "4821") {
        phoneVerified = true;
        toast("Number verified 🎉");
      } else {
        phoneVerified = false;
      }
    }
  }

  // ============================================================
  // STEP 2 — Name + age
  // ============================================================
  var nameInput = $("#name");
  var dobInput = $("#dob");
  var ageBadge = $("#ageBadge");

  // constrain the date picker to a plausible range
  (function () {
    var today = new Date();
    var max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    var min = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    dobInput.max = max.toISOString().slice(0, 10);
    dobInput.min = min.toISOString().slice(0, 10);
  })();

  function ageFrom(dobStr) {
    if (!dobStr) return null;
    var b = new Date(dobStr);
    if (isNaN(b)) return null;
    var t = new Date();
    var a = t.getFullYear() - b.getFullYear();
    var m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return a;
  }

  nameInput.addEventListener("input", function () { nameInput.classList.remove("invalid"); });

  dobInput.addEventListener("change", function () {
    dobInput.classList.remove("invalid");
    var a = ageFrom(dobInput.value);
    if (a != null && a >= 18 && a <= 100) {
      ageBadge.hidden = false;
      ageBadge.textContent = "You're " + a + " — you'll appear as " + a;
    } else {
      ageBadge.hidden = true;
    }
  });

  // ============================================================
  // STEP 3 — Photos
  // ============================================================
  var photoGrid = $("#photoGrid");
  var photoCount = $("#photoCount");
  var GRADS = [
    "linear-gradient(135deg,#ff5e6c,#ff8fb1)",
    "linear-gradient(135deg,#8b5cf6,#c4b5fd)",
    "linear-gradient(135deg,#ff8fb1,#8b5cf6)",
    "linear-gradient(135deg,#e63950,#7c3aed)",
    "linear-gradient(135deg,#ff5e6c,#7c3aed)",
    "linear-gradient(135deg,#ff8fb1,#ff5e6c)"
  ];
  var photoFilled = [false, false, false, false, false, false];

  for (var p = 0; p < 6; p++) {
    var slot = document.createElement("button");
    slot.type = "button";
    slot.className = "photo-slot";
    slot.dataset.idx = p;
    slot.setAttribute("aria-label", "Photo slot " + (p + 1) + ", empty");
    slot.textContent = "+";
    (function (idx, el) {
      el.addEventListener("click", function () { togglePhoto(idx, el); });
    })(p, slot);
    photoGrid.appendChild(slot);
  }

  function togglePhoto(idx, el) {
    photoFilled[idx] = !photoFilled[idx];
    if (photoFilled[idx]) {
      el.classList.add("filled");
      el.style.background = GRADS[idx];
      el.textContent = "";
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "Photo " + (idx + 1);
      el.appendChild(tag);
      el.setAttribute("aria-label", "Photo slot " + (idx + 1) + ", filled. Activate to remove.");
    } else {
      el.classList.remove("filled", "main-badge");
      el.style.background = "";
      el.textContent = "+";
      el.setAttribute("aria-label", "Photo slot " + (idx + 1) + ", empty");
    }
    updatePhotoState();
  }

  function updatePhotoState() {
    state.photos = [];
    photoFilled.forEach(function (f, i) { if (f) state.photos.push(i); });
    photoCount.textContent = state.photos.length;
    // mark the first filled slot as the main photo
    $$(".photo-slot").forEach(function (el) { el.classList.remove("main-badge"); });
    if (state.photos.length) {
      $$(".photo-slot")[state.photos[0]].classList.add("main-badge");
    }
  }

  // ============================================================
  // STEP 4 — Interests
  // ============================================================
  var INTERESTS = [
    "🎵 Live music", "🏔️ Hiking", "☕ Coffee", "🎨 Art", "🍜 Foodie",
    "📚 Reading", "🎮 Gaming", "🐶 Dogs", "✈️ Travel", "🧘 Yoga",
    "🎬 Film", "🌱 Plants", "🏄 Surfing", "🍷 Wine", "🎧 Podcasts",
    "📷 Photography", "🏀 Sports", "🍳 Cooking"
  ];
  var chipsWrap = $("#chips");
  var chipCount = $("#chipCount");

  INTERESTS.forEach(function (label) {
    var c = document.createElement("button");
    c.type = "button";
    c.className = "chip";
    c.textContent = label;
    c.setAttribute("aria-pressed", "false");
    c.addEventListener("click", function () {
      var on = c.getAttribute("aria-pressed") === "true";
      if (!on && state.interests.length >= 8) {
        toast("Pick up to 8 interests");
        return;
      }
      c.setAttribute("aria-pressed", String(!on));
      var name = label.replace(/^\S+\s/, "");
      if (!on) state.interests.push(name);
      else state.interests = state.interests.filter(function (x) { return x !== name; });
      chipCount.textContent = state.interests.length;
    });
    chipsWrap.appendChild(c);
  });

  // ============================================================
  // STEP 5 — Intentions
  // ============================================================
  var INTENTS = [
    { emo: "💕", title: "A relationship", desc: "Looking for something long-term" },
    { emo: "✨", title: "Something casual", desc: "Keeping it light and fun" },
    { emo: "🤝", title: "New friends", desc: "Expanding my circle" },
    { emo: "🤔", title: "Still figuring it out", desc: "Open to seeing where it goes" }
  ];
  var intentsWrap = $("#intents");

  INTENTS.forEach(function (it) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "intent";
    card.setAttribute("role", "radio");
    card.setAttribute("aria-checked", "false");
    card.innerHTML =
      '<span class="emo">' + it.emo + '</span>' +
      '<span class="txt"><strong>' + it.title + '</strong><small>' + it.desc + '</small></span>' +
      '<span class="radio" aria-hidden="true"></span>';
    card.addEventListener("click", function () {
      $$(".intent").forEach(function (c) { c.setAttribute("aria-checked", "false"); });
      card.setAttribute("aria-checked", "true");
      state.intent = it.title;
    });
    intentsWrap.appendChild(card);
  });

  // arrow-key navigation for the radiogroup
  intentsWrap.addEventListener("keydown", function (e) {
    var cards = $$(".intent");
    var idx = cards.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      cards[(idx + 1) % cards.length].focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      cards[(idx - 1 + cards.length) % cards.length].focus();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      document.activeElement.click();
    }
  });

  // ============================================================
  // Validation per step
  // ============================================================
  function validate(step) {
    if (step === 0) {
      var digits = phoneInput.value.replace(/\D/g, "");
      if (digits.length !== 10) {
        phoneInput.classList.add("invalid");
        toast("Enter a valid 10-digit number");
        phoneInput.focus();
        return false;
      }
      if (!phoneVerified) {
        toast("Enter the code 4821 to verify");
        if (!verifyBlock.hidden) otpBoxes[0].focus();
        return false;
      }
      state.phone = phoneInput.value;
      return true;
    }

    if (step === 1) {
      var nm = nameInput.value.trim();
      if (!/^[A-Za-zÀ-ſ' -]{2,20}$/.test(nm)) {
        nameInput.classList.add("invalid");
        toast("Enter your name (letters only)");
        nameInput.focus();
        return false;
      }
      var a = ageFrom(dobInput.value);
      if (a == null) {
        dobInput.classList.add("invalid");
        toast("Add your date of birth");
        dobInput.focus();
        return false;
      }
      if (a < 18) {
        dobInput.classList.add("invalid");
        toast("You must be 18 or older");
        return false;
      }
      state.name = nm;
      state.dob = dobInput.value;
      state.age = a;
      return true;
    }

    if (step === 2) {
      if (state.photos.length < 2) {
        toast("Add at least 2 photos");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (state.interests.length < 3) {
        toast("Pick at least 3 interests");
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!state.intent) {
        toast("Choose what you're looking for");
        return false;
      }
      return true;
    }
    return true;
  }

  // ============================================================
  // Finish
  // ============================================================
  function finish() {
    $("#finishName").textContent = state.name || "friend";
    var summary = $("#summary");
    var rows = [
      ["Name", state.name + ", " + state.age],
      ["Phone", state.phone],
      ["Photos", state.photos.length + " added"],
      ["Interests", state.interests.slice(0, 3).join(", ") + (state.interests.length > 3 ? " +" + (state.interests.length - 3) : "")],
      ["Looking for", state.intent]
    ];
    summary.innerHTML = rows.map(function (r) {
      return "<li><span>" + r[0] + "</span><span>" + r[1] + "</span></li>";
    }).join("");

    // hide the sticky footer, show finish step (step index 5)
    footer.style.display = "none";
    backBtn.hidden = true;
    steps.forEach(function (s) {
      var n = Number(s.getAttribute("data-step"));
      var on = n === 5;
      s.classList.toggle("is-active", on);
      s.hidden = !on;
    });
    dots.forEach(function (d) { d.classList.remove("active"); d.classList.add("done"); });
    launchConfetti();
    toast("Welcome to Spark, " + state.name + "!");
  }

  function launchConfetti() {
    var box = $("#confetti");
    box.innerHTML = "";
    var colors = ["#ff5e6c", "#8b5cf6", "#ff8fb1", "#7c3aed", "#e63950", "#ffd166"];
    for (var i = 0; i < 44; i++) {
      var piece = document.createElement("i");
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = (2.4 + Math.random() * 2) + "s";
      piece.style.animationDelay = (Math.random() * 0.6) + "s";
      piece.style.transform = "translateY(0) rotate(" + (Math.random() * 360) + "deg)";
      box.appendChild(piece);
    }
  }

  $("#enterBtn").addEventListener("click", function () {
    toast("Loading your matches… 💘");
  });

  // ---------- init ----------
  goTo(0);
})();
