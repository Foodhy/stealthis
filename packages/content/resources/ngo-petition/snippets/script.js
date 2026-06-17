(function () {
  "use strict";

  var GOAL = 10000;
  var signatures = 7431;

  var seedFeed = [
    { name: "Marisol Vega", city: "Rivertown", ago: "2 min ago", comment: "My kids learned to fish on the East Bank." },
    { name: "Dev Okafor", city: "Mill Creek", ago: "6 min ago", comment: "" },
    { name: "Hannah Brooks", city: "Rivertown", ago: "11 min ago", comment: "Clean water is not negotiable." },
    { name: "Theo Lindqvist", city: "Greenfield", ago: "18 min ago", comment: "" },
    { name: "Priya Nair", city: "Rivertown", ago: "24 min ago", comment: "Restore the wetlands before it's too late." }
  ];

  var AVATAR_COLORS = ["#1f7a6d", "#e8743b", "#2f9e6f", "#155e54", "#cc5d28", "#d98a2b"];

  var els = {
    count: document.getElementById("sigCount"),
    remain: document.getElementById("goalRemain"),
    barFill: document.getElementById("barFill"),
    bar: document.getElementById("bar"),
    thermoFill: document.getElementById("thermoFill"),
    feed: document.getElementById("feed"),
    form: document.getElementById("signForm"),
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    comment: document.getElementById("comment"),
    commentCount: document.getElementById("commentCount"),
    publicChk: document.getElementById("public"),
    signBtn: document.getElementById("signBtn"),
    nameErr: document.getElementById("nameErr"),
    emailErr: document.getElementById("emailErr"),
    toast: document.getElementById("toast"),
    donate: document.getElementById("donateBtn")
  };

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2600);
  }

  /* ---------- Helpers ---------- */
  function fmt(n) {
    return n.toLocaleString("en-US");
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/);
    var a = parts[0] ? parts[0][0] : "?";
    var b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }

  function colorFor(name) {
    var sum = 0;
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  }

  function renderProgress(animate) {
    var pct = Math.min(100, (signatures / GOAL) * 100);
    if (!animate) {
      els.barFill.style.transition = "none";
      els.thermoFill.style.transition = "none";
      requestAnimationFrame(function () {
        els.barFill.style.transition = "";
        els.thermoFill.style.transition = "";
      });
    }
    els.barFill.style.width = pct + "%";
    els.thermoFill.style.height = pct + "%";
    els.count.textContent = fmt(signatures);
    els.bar.setAttribute("aria-valuenow", String(signatures));
    var left = Math.max(0, GOAL - signatures);
    els.remain.textContent =
      left > 0
        ? fmt(left) + " more voices needed to hit our goal."
        : "Goal reached — thank you! Stretch goal: 15,000.";
  }

  function makeRow(sig, fresh) {
    var li = document.createElement("li");
    if (fresh) li.className = "fresh";

    var av = document.createElement("span");
    av.className = "avatar";
    av.style.background = colorFor(sig.name);
    av.textContent = initials(sig.name);
    av.setAttribute("aria-hidden", "true");

    var body = document.createElement("div");

    var nm = document.createElement("p");
    nm.className = "sig__name";
    nm.textContent = sig.name;

    var meta = document.createElement("p");
    meta.className = "sig__meta";
    meta.textContent = sig.city + " · " + sig.ago;

    body.appendChild(nm);
    body.appendChild(meta);

    if (sig.comment) {
      var c = document.createElement("p");
      c.className = "sig__comment";
      c.textContent = "“" + sig.comment + "”";
      body.appendChild(c);
    }

    li.appendChild(av);
    li.appendChild(body);
    return li;
  }

  function renderSeed() {
    seedFeed.forEach(function (sig) {
      els.feed.appendChild(makeRow(sig, false));
    });
  }

  /* ---------- Count-up impact stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var start = performance.now();
    var dur = 1100;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Validation ---------- */
  function setInvalid(fieldEl, errEl, on) {
    fieldEl.parentElement.classList.toggle("invalid", on);
    errEl.hidden = !on;
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* ---------- Sign flow ---------- */
  function handleSign(e) {
    e.preventDefault();
    var nameVal = els.name.value.trim();
    var emailVal = els.email.value.trim();
    var ok = true;

    if (!nameVal) {
      setInvalid(els.name, els.nameErr, true);
      ok = false;
    } else {
      setInvalid(els.name, els.nameErr, false);
    }

    if (!validEmail(emailVal)) {
      setInvalid(els.email, els.emailErr, true);
      ok = false;
    } else {
      setInvalid(els.email, els.emailErr, false);
    }

    if (!ok) {
      toast("Please fix the highlighted fields.");
      return;
    }

    signatures += 1;
    renderProgress(true);

    if (els.publicChk.checked) {
      var sig = {
        name: nameVal,
        city: "Just now",
        ago: "moments ago",
        comment: els.comment.value.trim()
      };
      var row = makeRow(sig, true);
      els.feed.insertBefore(row, els.feed.firstChild);
      setTimeout(function () {
        row.classList.remove("fresh");
      }, 1600);
    }

    els.signBtn.textContent = "✓ You signed — thank you!";
    els.signBtn.classList.add("signed");
    els.signBtn.disabled = true;
    toast("Thanks, " + nameVal.split(" ")[0] + "! You're signature #" + fmt(signatures) + ".");

    els.form.reset();
    els.commentCount.textContent = "0 / 140";
  }

  /* ---------- Share ---------- */
  function share(kind) {
    var url = "https://clearwaters.example/petition/rivertown";
    var text = "I just signed to protect the Rivertown watershed. Add your name:";
    if (kind === "link") {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { toast("Link copied to clipboard."); },
          function () { toast("Copy this: " + url); }
        );
      } else {
        toast("Copy this: " + url);
      }
    } else if (kind === "x") {
      toast("Opening a post… (demo)");
    } else if (kind === "mail") {
      toast("Opening your email app… (demo)");
    }
  }

  /* ---------- Wire up ---------- */
  els.comment.addEventListener("input", function () {
    els.commentCount.textContent = els.comment.value.length + " / 140";
  });

  els.name.addEventListener("input", function () {
    if (els.name.value.trim()) setInvalid(els.name, els.nameErr, false);
  });
  els.email.addEventListener("input", function () {
    if (validEmail(els.email.value.trim())) setInvalid(els.email, els.emailErr, false);
  });

  els.form.addEventListener("submit", handleSign);

  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      share(btn.getAttribute("data-share"));
    });
  });

  els.donate.addEventListener("click", function () {
    toast("Redirecting to our secure donation page… (demo)");
  });

  /* ---------- Boot ---------- */
  renderSeed();
  renderProgress(false);
  requestAnimationFrame(function () {
    renderProgress(true);
  });
  document.querySelectorAll(".impact strong[data-count]").forEach(countUp);
})();
