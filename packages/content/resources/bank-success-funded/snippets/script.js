(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toast-wrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="tdot" aria-hidden="true"></span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2400);
  }

  /* ---------- confetti ---------- */
  var canvas = document.getElementById("confetti");
  var ctx = canvas.getContext("2d");
  var pieces = [];
  var rafId = null;
  var colors = ["#3b6ef6", "#0fb5a6", "#7c5cff", "#1f9d62", "#f4a623", "#eb5e3d"];
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  function burst(count) {
    if (prefersReduced) return;
    var w = window.innerWidth;
    for (var i = 0; i < count; i++) {
      pieces.push({
        x: w / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight * 0.28,
        vx: (Math.random() - 0.5) * 9,
        vy: -8 - Math.random() * 7,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() > 0.5 ? "rect" : "circ",
        life: 1
      });
    }
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y > window.innerHeight + 30) { pieces.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (pieces.length) {
      rafId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rafId = null;
    }
  }

  // Initial celebration on load
  window.requestAnimationFrame(function () { burst(140); });

  document.getElementById("celebrate").addEventListener("click", function () {
    burst(120);
  });

  /* ---------- copy account number ---------- */
  var copyBtn = document.getElementById("copy-acct");
  var ACCT_FULL = "4821 0073"; // illustrative, fictional
  copyBtn.addEventListener("click", function () {
    var text = "Northbridge Everyday Checking •••• " + ACCT_FULL + " · Routing 021000089";
    var done = function () {
      copyBtn.classList.add("copied");
      copyBtn.setAttribute("aria-label", "Account number copied");
      toast("Account number copied");
      setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyBtn.setAttribute("aria-label", "Copy account number");
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove();
      done();
    }
  });

  /* ---------- reveal card ---------- */
  var revealBtn = document.getElementById("reveal-card");
  var vnum = document.getElementById("vcard-number");
  var MASKED = "5412 •••• •••• 7290";
  var FULL = "5412 8830 1147 7290";
  var revealed = false;
  var revealTimer = null;
  revealBtn.addEventListener("click", function () {
    revealed = !revealed;
    revealBtn.setAttribute("aria-pressed", String(revealed));
    if (revealed) {
      vnum.textContent = FULL;
      revealBtn.textContent = "Hide card details";
      toast("Card details revealed — auto-hides in 12s");
      clearTimeout(revealTimer);
      revealTimer = setTimeout(function () {
        if (revealed) revealBtn.click();
      }, 12000);
    } else {
      vnum.textContent = MASKED;
      revealBtn.textContent = "Reveal card details";
      clearTimeout(revealTimer);
    }
  });

  /* ---------- checklist ---------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var checks = Array.prototype.slice.call(document.querySelectorAll(".check"));
  var doneCount = document.getElementById("done-count");
  var barFill = document.getElementById("bar-fill");
  var ctaLabels = ["Direct deposit set up", "Card on the way", "Invite sent"];

  function refresh() {
    var n = checks.filter(function (c) { return c.getAttribute("aria-checked") === "true"; }).length;
    doneCount.textContent = n;
    barFill.style.width = (n / checks.length * 100) + "%";
    if (n === checks.length) {
      burst(110);
      toast("All set — welcome aboard!");
    }
  }

  function toggle(idx) {
    var c = checks[idx];
    var on = c.getAttribute("aria-checked") === "true";
    c.setAttribute("aria-checked", String(!on));
    steps[idx].classList.toggle("done", !on);
    if (!on) toast(ctaLabels[idx]);
    refresh();
  }

  checks.forEach(function (c, i) {
    c.addEventListener("click", function () { toggle(i); });
    c.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle(i);
      }
    });
  });

  /* ---------- footer actions ---------- */
  document.getElementById("go-dashboard").addEventListener("click", function () {
    toast("Opening your dashboard…");
  });
  document.getElementById("add-funds").addEventListener("click", function () {
    toast("Add funds — transfer flow coming up");
  });
})();
