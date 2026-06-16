/* ============================================================
   Storybook — Animated Mascot Guide (Pip)
   Vanilla JS, no libraries.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- element refs ---- */
  var stage = document.getElementById("mascot-stage");
  var pip = document.getElementById("pip");
  var bubble = document.getElementById("bubble");
  var bubbleText = document.getElementById("bubbleText");
  var moodCaption = document.getElementById("moodCaption");
  var hugCountEl = document.getElementById("hugCount");
  var easyToggle = document.getElementById("easyReadToggle");
  var guideBtn = document.getElementById("guideBtn");
  var tipBtn = document.getElementById("tipBtn");
  var moodButtons = Array.prototype.slice.call(
    document.querySelectorAll(".mood-btn")
  );
  var toastEl = document.getElementById("toast");

  /* ============================================================
     Toast helper
     ============================================================ */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    /* force reflow so transition runs */
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 250);
    }, 2200);
  }

  /* ============================================================
     Mood data
     ============================================================ */
  var MOODS = {
    happy: {
      label: "Happy",
      caption: "Mood: Happy — Pip is bouncing with joy.",
      tips: [
        "Tap me anytime and I'll cheer you on!",
        "Reading just one page a day grows a big brain. 📖",
        "You're doing amazing. Keep turning those pages!"
      ]
    },
    curious: {
      label: "Curious",
      caption: "Mood: Curious — Pip is wondering what happens next.",
      tips: [
        "Ooh, what do YOU think happens next in the story?",
        "Curious readers ask lots of questions. Ask away!",
        "Try guessing the ending before you reach it. 🔎"
      ]
    },
    sleepy: {
      label: "Sleepy",
      caption: "Mood: Sleepy — Pip is ready for a bedtime tale.",
      tips: [
        "Bedtime stories are the coziest stories. 🌙",
        "A quiet voice makes sleepy tales feel magical.",
        "One more page... then sweet dreams. 💤"
      ]
    }
  };

  /* ============================================================
     Idle blinking (random, polite timing)
     ============================================================ */
  var blinkTimer;
  function scheduleBlink() {
    var delay = 2200 + Math.random() * 3200;
    blinkTimer = setTimeout(function () {
      /* don't blink while sleepy (eyes already closed) */
      if (stage.getAttribute("data-mood") !== "sleepy" && !prefersReduced) {
        pip.classList.add("blink");
        setTimeout(function () {
          pip.classList.remove("blink");
        }, 150);
      }
      scheduleBlink();
    }, delay);
  }
  if (!prefersReduced) scheduleBlink();

  /* ============================================================
     Speech bubble
     ============================================================ */
  var bubbleTimer;
  function showBubble(text, hold) {
    bubbleText.textContent = text;
    bubble.hidden = false;
    void bubble.offsetWidth;
    bubble.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () {
      hideBubble();
    }, hold || 3600);
  }
  function hideBubble() {
    bubble.classList.remove("show");
    setTimeout(function () {
      if (!bubble.classList.contains("show")) bubble.hidden = true;
    }, 260);
  }

  /* rotating tip index per mood so tips don't repeat back-to-back */
  var tipIndex = { happy: 0, curious: 0, sleepy: 0 };
  function nextTip(mood) {
    var list = MOODS[mood].tips;
    var i = tipIndex[mood] % list.length;
    tipIndex[mood]++;
    return list[i];
  }

  /* ============================================================
     React to clicks (wave + jump + giggle)
     ============================================================ */
  var hugs = 0;
  function reactToPip() {
    var mood = stage.getAttribute("data-mood");

    /* animation classes (skipped visually under reduced-motion via CSS) */
    pip.classList.add("reacting", "giggle");
    setTimeout(function () {
      pip.classList.remove("reacting", "giggle");
    }, 700);

    /* show a tip bubble */
    showBubble(nextTip(mood));

    /* count the hug */
    hugs++;
    hugCountEl.textContent = String(hugs);
    hugCountEl.classList.remove("pop");
    void hugCountEl.offsetWidth;
    hugCountEl.classList.add("pop");
  }

  pip.addEventListener("click", reactToPip);

  /* ============================================================
     Mood selection (radiogroup behaviour)
     ============================================================ */
  function setMood(mood, announce) {
    if (!MOODS[mood]) return;
    stage.setAttribute("data-mood", mood);
    moodButtons.forEach(function (btn) {
      var on = btn.getAttribute("data-mood") === mood;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    });
    moodCaption.textContent = MOODS[mood].caption;
    if (announce) {
      showBubble(MOODS[mood].tips[0], 3000);
    }
  }

  moodButtons.forEach(function (btn, idx) {
    btn.addEventListener("click", function () {
      setMood(btn.getAttribute("data-mood"), true);
      btn.focus();
    });
    /* arrow-key roving within the radiogroup */
    btn.addEventListener("keydown", function (e) {
      var dir = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") dir = 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") dir = -1;
      else return;
      e.preventDefault();
      var next =
        (idx + dir + moodButtons.length) % moodButtons.length;
      var target = moodButtons[next];
      setMood(target.getAttribute("data-mood"), true);
      target.focus();
    });
  });
  /* init roving tabindex */
  setMood("happy", false);

  /* manual "new tip" button */
  tipBtn.addEventListener("click", function () {
    var mood = stage.getAttribute("data-mood");
    showBubble(nextTip(mood));
    pip.classList.add("giggle");
    setTimeout(function () {
      pip.classList.remove("giggle");
    }, 600);
  });

  /* ============================================================
     Easy-read toggle
     ============================================================ */
  easyToggle.addEventListener("click", function () {
    var on = easyToggle.getAttribute("aria-checked") === "true";
    on = !on;
    easyToggle.setAttribute("aria-checked", on ? "true" : "false");
    document.body.classList.toggle("easy-read", on);
    toast(on ? "Easy-read font on" : "Easy-read font off");
  });

  /* ============================================================
     Guided tour
     ============================================================ */
  var tour = document.getElementById("tour");
  var tourSpot = document.getElementById("tourSpot");
  var tourCard = document.getElementById("tourCard");
  var tourTitle = document.getElementById("tourTitle");
  var tourBody = document.getElementById("tourBody");
  var tourStepLabel = document.getElementById("tourStepLabel");
  var tourNext = document.getElementById("tourNext");
  var tourSkip = document.getElementById("tourSkip");

  var STEPS = [
    {
      el: function () {
        return document.getElementById("moodGroup");
      },
      title: "Pick a mood",
      body: "Tap Happy, Curious, or Sleepy to change Pip's face and animation."
    },
    {
      el: function () {
        return pip;
      },
      title: "Tap Pip!",
      body: "Give Pip a tap. It'll wave, jump, giggle, and share a reading tip."
    },
    {
      el: function () {
        return tipBtn;
      },
      title: "Need a hint?",
      body: "Press New tip whenever you'd like Pip to say something helpful."
    },
    {
      el: function () {
        return easyToggle;
      },
      title: "Easy-read mode",
      body: "Flip this on for a friendlier font and roomier spacing. You're all set!"
    }
  ];

  var stepIdx = 0;
  var lastFocused = null;

  function placeTour(target) {
    var rect = target.getBoundingClientRect();
    var pad = 10;
    tourSpot.style.top = rect.top - pad + "px";
    tourSpot.style.left = rect.left - pad + "px";
    tourSpot.style.width = rect.width + pad * 2 + "px";
    tourSpot.style.height = rect.height + pad * 2 + "px";

    /* position the card below the target, clamped to viewport */
    var cardW = Math.min(340, window.innerWidth - 32);
    var top = rect.bottom + 16;
    var card = tourCard;
    /* if it would overflow the bottom, place above */
    if (top + 200 > window.innerHeight && rect.top - 16 > 200) {
      top = rect.top - 16 - card.offsetHeight;
    }
    var left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));
    card.style.top = Math.max(16, top) + "px";
    card.style.left = left + "px";
  }

  function renderStep() {
    var step = STEPS[stepIdx];
    var target = step.el();
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "center"
    });
    tourTitle.textContent = step.title;
    tourBody.textContent = step.body;
    tourStepLabel.textContent = "Step " + (stepIdx + 1) + " of " + STEPS.length;
    tourNext.textContent =
      stepIdx === STEPS.length - 1 ? "Done ✓" : "Next →";
    /* wait a tick for any scroll/layout then place */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        placeTour(target);
      });
    });
  }

  function openTour() {
    lastFocused = document.activeElement;
    stepIdx = 0;
    tour.hidden = false;
    renderStep();
    tourNext.focus();
    document.addEventListener("keydown", onTourKey);
    window.addEventListener("resize", onTourResize);
  }

  function closeTour(done) {
    tour.hidden = true;
    document.removeEventListener("keydown", onTourKey);
    window.removeEventListener("resize", onTourResize);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    if (done) {
      toast("Tour complete — have fun reading! 🦊");
      showBubble("That's the whole tour. Let's read together!", 3200);
    }
  }

  function advance() {
    if (stepIdx >= STEPS.length - 1) {
      closeTour(true);
      return;
    }
    stepIdx++;
    renderStep();
  }

  function onTourResize() {
    var step = STEPS[stepIdx];
    var target = step && step.el();
    if (target) placeTour(target);
  }

  function onTourKey(e) {
    if (e.key === "Escape") {
      closeTour(false);
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      /* let Enter on buttons work normally; only handle ArrowRight here */
      if (e.key === "ArrowRight") {
        e.preventDefault();
        advance();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (stepIdx > 0) {
        stepIdx--;
        renderStep();
      }
    } else if (e.key === "Tab") {
      /* simple focus trap inside the card */
      var focusables = tourCard.querySelectorAll("button");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  guideBtn.addEventListener("click", openTour);
  tourNext.addEventListener("click", advance);
  tourSkip.addEventListener("click", function () {
    closeTour(false);
  });

  /* ============================================================
     Friendly first-load greeting
     ============================================================ */
  setTimeout(function () {
    showBubble("Hi! I'm Pip. Tap me for a tip! 👋", 4200);
  }, 900);
})();
