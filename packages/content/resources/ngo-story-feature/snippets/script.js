(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ---------- reading progress ---------- */
  var readFill = document.getElementById("readFill");
  var readbar = document.querySelector(".readbar");
  function updateProgress() {
    var h = document.documentElement;
    var scrollable = h.scrollHeight - h.clientHeight;
    var pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    pct = Math.max(0, Math.min(100, pct));
    readFill.style.width = pct + "%";
    readbar.setAttribute("aria-valuenow", Math.round(pct));
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- before / after slider ---------- */
  var baRange = document.getElementById("baRange");
  var baAfter = document.getElementById("baAfter");
  var baHandle = document.getElementById("baHandle");
  function setBa(v) {
    baAfter.style.clipPath = "inset(0 0 0 " + v + "%)";
    baHandle.style.left = v + "%";
  }
  if (baRange) {
    baRange.addEventListener("input", function () {
      setBa(this.value);
    });
    setBa(baRange.value);
  }

  /* ---------- gallery + lightbox ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var current = 0;
  var gradients = [
    "linear-gradient(150deg, #3a93c9, #1f6aa0)",
    "linear-gradient(150deg, #2a8f7f, #155e54)",
    "linear-gradient(150deg, #e8a14b, #cc5d28)",
    "linear-gradient(150deg, #9a6fc0, #6b4690)"
  ];

  function showShot(i) {
    current = (i + shots.length) % shots.length;
    lbImg.style.background = gradients[current];
    lbCap.textContent = shots[current].getAttribute("data-cap");
    lbImg.setAttribute("aria-label", shots[current].getAttribute("data-cap"));
  }
  function openLightbox(i) {
    showShot(i);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    if (shots[current]) shots[current].focus();
  }
  shots.forEach(function (s, i) {
    s.addEventListener("click", function () {
      openLightbox(i);
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { showShot(current - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { showShot(current + 1); });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showShot(current - 1);
    else if (e.key === "ArrowRight") showShot(current + 1);
  });

  /* ---------- share ---------- */
  var shareSheet = document.getElementById("shareSheet");
  var shareBtn = document.getElementById("shareBtn");
  var sheetClose = document.getElementById("sheetClose");
  var storyUrl = "https://brightwells.example/stories/amara";
  var storyTitle = "Amara walked 6 hours for water. Now it's 6 minutes.";

  function openSheet() {
    if (navigator.share) {
      navigator.share({ title: storyTitle, url: storyUrl }).catch(function () {});
      return;
    }
    shareSheet.classList.add("is-open");
    shareSheet.setAttribute("aria-hidden", "false");
  }
  function closeSheet() {
    shareSheet.classList.remove("is-open");
    shareSheet.setAttribute("aria-hidden", "true");
  }
  if (shareBtn) shareBtn.addEventListener("click", openSheet);
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  if (shareSheet) {
    shareSheet.addEventListener("click", function (e) {
      if (e.target === shareSheet) closeSheet();
    });
  }

  function handleShare(net) {
    if (net === "link") {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(storyUrl).then(function () {
          toast("Link copied to clipboard");
        }, function () {
          toast("Link: " + storyUrl);
        });
      } else {
        toast("Link: " + storyUrl);
      }
    } else if (net === "x") {
      toast("Opening a draft post…");
    } else if (net === "wa") {
      toast("Opening WhatsApp…");
    } else if (net === "mail") {
      toast("Opening your email app…");
    }
    closeSheet();
  }
  document.querySelectorAll(".ishare").forEach(function (b) {
    b.addEventListener("click", function () {
      handleShare(this.getAttribute("data-net"));
    });
  });

  /* ---------- donate amounts ---------- */
  var amts = Array.prototype.slice.call(document.querySelectorAll(".amt"));
  var giveHint = document.getElementById("giveHint");
  var donateAmt = document.getElementById("donateAmt");
  var donateBtn = document.getElementById("donateBtn");
  var selected = 60;

  var hints = {
    25: "$25 keeps a single tap running for a month.",
    60: "$60 funds a metre of new pipe to the school.",
    120: "$120 trains a village committee member on upkeep.",
    custom: "Every amount is pooled toward Tank II."
  };

  function selectAmt(btn) {
    amts.forEach(function (a) { a.classList.remove("is-active"); });
    btn.classList.add("is-active");
    var val = btn.getAttribute("data-amt");
    if (val === "custom") {
      var raw = window.prompt("Enter a custom amount in USD:", "75");
      var n = parseInt((raw || "").replace(/[^0-9]/g, ""), 10);
      if (!n || n < 1) {
        selectAmt(document.querySelector('.amt[data-amt="60"]'));
        return;
      }
      selected = n;
      giveHint.textContent = "Thank you — your $" + n + " goes straight to the field.";
      donateAmt.textContent = "$" + n;
      btn.textContent = "$" + n;
    } else {
      selected = parseInt(val, 10);
      giveHint.textContent = hints[selected] || hints.custom;
      donateAmt.textContent = "$" + selected;
    }
  }
  amts.forEach(function (a) {
    a.addEventListener("click", function () { selectAmt(this); });
  });

  /* ---------- donate flow + live thermometer ---------- */
  var thermoFill = document.getElementById("thermoFill");
  var raisedEl = document.getElementById("raised");
  var backersEl = document.getElementById("backers");
  var donorList = document.getElementById("donorList");
  var raised = 13640;
  var goal = 20000;
  var backers = 284;
  var firstNames = ["Aïsha", "Marco", "Lena", "Kwame", "Sofía", "Yusuf", "Mei", "Tomás", "Priya"];

  function refreshThermo() {
    var pct = Math.min(100, (raised / goal) * 100);
    thermoFill.style.width = pct.toFixed(1) + "%";
    raisedEl.textContent = "$" + raised.toLocaleString("en-US");
    backersEl.textContent = backers;
  }

  function addDonor(name, amt, note) {
    var li = document.createElement("li");
    li.className = "is-new";
    var initials = name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    li.innerHTML =
      '<span class="av" aria-hidden="true">' + initials + "</span>" +
      "<div><b>" + name + "</b><small>$" + amt + (note ? " · " + note : "") + "</small></div>";
    donorList.insertBefore(li, donorList.firstChild);
    while (donorList.children.length > 5) {
      donorList.removeChild(donorList.lastChild);
    }
  }

  if (donateBtn) {
    donateBtn.addEventListener("click", function () {
      raised += selected;
      backers += 1;
      refreshThermo();
      addDonor("You", selected, "thank you!");
      toast("Thank you! $" + selected + " toward Tank II 💧");
    });
  }

  // simulate other donors arriving while you read
  setInterval(function () {
    if (Math.random() > 0.55) {
      var amt = [25, 30, 60, 100][Math.floor(Math.random() * 4)];
      var name = firstNames[Math.floor(Math.random() * firstNames.length)];
      raised += amt;
      backers += 1;
      refreshThermo();
      addDonor(name + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".", amt, "just now");
    }
  }, 9000);

  refreshThermo();

  /* ---------- count-up stats ---------- */
  var counted = false;
  function runCounts() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat b[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var start = null;
      var dur = 1400;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = val.toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var statsSection = document.querySelector(".stats");
  if ("IntersectionObserver" in window && statsSection) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) runCounts(); });
    }, { threshold: 0.4 });
    io.observe(statsSection);
  } else {
    runCounts();
  }
})();
