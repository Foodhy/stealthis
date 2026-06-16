(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Copy order number ---------- */
  var copyBtn = document.getElementById("copy-btn");
  var orderNumEl = document.getElementById("order-number");
  if (copyBtn && orderNumEl) {
    var revertTimer;
    var labelEl = copyBtn.querySelector(".copy-btn__text");
    copyBtn.addEventListener("click", function () {
      var text = orderNumEl.textContent.trim();

      var done = function () {
        copyBtn.classList.add("is-copied");
        if (labelEl) labelEl.textContent = "Copied";
        copyBtn.setAttribute("aria-label", "Order number copied");
        toast("Order number copied to clipboard");
        clearTimeout(revertTimer);
        revertTimer = setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          if (labelEl) labelEl.textContent = "Copy";
          copyBtn.setAttribute("aria-label", "Copy order number");
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch (e) {
          toast("Press Ctrl/Cmd + C to copy");
        }
      }
    });
  }

  /* ---------- Expandable item list ---------- */
  var toggle = document.getElementById("toggle-items");
  var list = document.getElementById("item-list");
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      list.classList.toggle("is-collapsed", expanded);
    });
  }

  /* ---------- Track order CTA (demo) ---------- */
  var trackBtn = document.getElementById("track-btn");
  if (trackBtn) {
    trackBtn.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Tracking opens once your order ships — we'll email you the link.");
    });
  }

  /* ---------- Confetti burst on load ---------- */
  var canvas = document.getElementById("confetti");
  if (canvas && canvas.getContext && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0;
    var H = 0;

    function resize() {
      W = canvas.clientWidth = window.innerWidth;
      H = canvas.clientHeight = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var colors = ["#3457ff", "#1f9d55", "#e0245e", "#ffb020", "#7c5cff"];
    var pieces = [];
    var originX = W / 2;
    var originY = H * 0.26;
    var count = W < 480 ? 70 : 130;

    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 4 + Math.random() * 8;
      pieces.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (3 + Math.random() * 4),
        size: 5 + Math.random() * 6,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        shape: Math.random() < 0.5 ? "rect" : "circle",
        life: 0
      });
    }

    var gravity = 0.32;
    var maxLife = 170;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var j = 0; j < pieces.length; j++) {
        var p = pieces[j];
        if (p.life > maxLife) continue;
        alive = true;
        p.life++;
        p.vy += gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        var fade = p.life > maxLife - 40 ? (maxLife - p.life) / 40 : 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, fade);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    }
    // small delay so it lands with the check animation
    setTimeout(function () {
      requestAnimationFrame(frame);
    }, 350);
  }
})();
