(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-toast");
    if (t) {
      e.preventDefault();
      toast(t.getAttribute("data-msg") || "Demo action.");
    }
  });

  /* ---------- Nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 12) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    },
    { passive: true }
  );

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Typewriter helpers ---------- */
  function typeText(el, text, speed, done) {
    var i = 0;
    el.textContent = "";
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (done) {
        done();
      }
    })();
  }

  /* ---------- Hero animated chat ---------- */
  var heroPrompt = document.getElementById("heroPrompt");
  var heroBody = document.getElementById("heroChatBody");
  if (heroPrompt && heroBody) {
    if (reduceMotion) {
      heroPrompt.textContent = "Ask Lumio anything…";
      var done = document.createElement("div");
      done.className = "msg msg--bot";
      done.innerHTML =
        "<p><strong>Done.</strong> Standup summarized and a follow-up draft is ready for the design team.</p>";
      heroBody.appendChild(done);
    } else {
      setTimeout(function () {
        typeText(heroPrompt, "Drafting your follow-up", 38, function () {
          var bot = document.createElement("div");
          bot.className = "msg msg--bot";
          var p = document.createElement("p");
          bot.appendChild(p);
          heroBody.appendChild(bot);
          heroPrompt.textContent = "";
          streamReply(
            p,
            "Pulled 3 action items from standup. Draft to the design team is ready — want me to send it? 🚀",
            22
          );
        });
      }, 700);
    }
  }

  /* ---------- Streaming reply (token-by-token) ---------- */
  function streamReply(p, text, speed, done) {
    var words = text.split(" ");
    var i = 0;
    var cursor = document.createElement("span");
    cursor.className = "cursor";
    p.appendChild(cursor);
    (function step() {
      if (i < words.length) {
        cursor.insertAdjacentText("beforebegin", (i ? " " : "") + words[i]);
        i++;
        setTimeout(step, speed + Math.random() * 40);
      } else {
        cursor.remove();
        if (done) done();
      }
    })();
  }

  /* ---------- Live demo ---------- */
  var demoForm = document.getElementById("demoForm");
  var demoInput = document.getElementById("demoInput");
  var demoBody = document.getElementById("demoBody");
  var demoSend = document.getElementById("demoSend");
  var demoBusy = false;

  var replies = {
    "plan a launch":
      "Here's a 3-day beta launch plan: — Day 1: warm up your waitlist with a teaser + changelog. Day 2: open access in waves and watch activation. Day 3: ship a recap, gather quotes, and invite referrals. Want me to draft the Day 1 email?",
    "write a changelog":
      "**Changelog · v3.0** — Added persistent long-term memory, parallel tool calls, and 12 new integrations. Fixed streaming latency on slow networks. Shall I post this to your release notes?",
    "spot sprint risks":
      "I spot 2 risks: the auth refactor has no owner, and the API migration overlaps QA week. Suggested fixes: assign auth to Devon and stagger the migration by 3 days. Want me to open the tickets?"
  };

  function defaultReply(prompt) {
    return (
      "Got it — working on: “" +
      prompt +
      "”. I'd pull the relevant context from your connected apps, plan the steps, and check in before acting. (This is a front-end demo — no real tools are called.)"
    );
  }

  function addMsg(role, withCursor) {
    var div = document.createElement("div");
    div.className = "msg msg--" + role;
    var p = document.createElement("p");
    div.appendChild(p);
    demoBody.appendChild(div);
    demoBody.scrollTop = demoBody.scrollHeight;
    return p;
  }

  function runDemo(prompt) {
    if (demoBusy || !prompt.trim()) return;
    demoBusy = true;
    demoSend.disabled = true;

    var up = addMsg("user");
    up.textContent = prompt;

    var key = prompt.trim().toLowerCase();
    var text = replies[key] || defaultReply(prompt.trim());

    // typing indicator pause, then stream
    setTimeout(function () {
      var p = addMsg("bot");
      if (reduceMotion) {
        p.innerHTML = renderBold(text);
        demoBody.scrollTop = demoBody.scrollHeight;
        finish();
      } else {
        streamBold(p, text, 20, function () {
          finish();
        });
      }
    }, 420);

    function finish() {
      demoBusy = false;
      demoSend.disabled = false;
      demoBody.scrollTop = demoBody.scrollHeight;
    }
  }

  function renderBold(text) {
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  // stream while keeping **bold** rendering at the end
  function streamBold(p, text, speed, done) {
    var plain = text.replace(/\*\*(.+?)\*\*/g, "$1");
    var words = plain.split(" ");
    var i = 0;
    var cursor = document.createElement("span");
    cursor.className = "cursor";
    p.appendChild(cursor);
    (function step() {
      if (i < words.length) {
        cursor.insertAdjacentText("beforebegin", (i ? " " : "") + words[i]);
        i++;
        demoBody.scrollTop = demoBody.scrollHeight;
        setTimeout(step, speed + Math.random() * 45);
      } else {
        cursor.remove();
        p.innerHTML = renderBold(text);
        if (done) done();
      }
    })();
  }

  if (demoForm) {
    demoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = demoInput.value;
      if (!val.trim()) return;
      runDemo(val);
      demoInput.value = "";
    });
  }

  var demoChips = document.getElementById("demoChips");
  if (demoChips) {
    demoChips.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (chip) runDemo(chip.getAttribute("data-prompt"));
    });
  }

  /* ---------- Pricing toggle ---------- */
  var billingToggle = document.getElementById("billingToggle");
  var amounts = document.querySelectorAll(".plan__amount");
  if (billingToggle) {
    billingToggle.addEventListener("click", function () {
      var yearly = billingToggle.getAttribute("aria-checked") === "true";
      yearly = !yearly;
      billingToggle.setAttribute("aria-checked", String(yearly));
      amounts.forEach(function (el) {
        var v = el.getAttribute(yearly ? "data-yearly" : "data-monthly");
        el.textContent = "$" + v;
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  var faqList = document.getElementById("faqList");
  if (faqList) {
    faqList.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__q");
      if (!btn) return;
      var item = btn.parentElement;
      var ans = item.querySelector(".faq__a");
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0";
    });
  }

  /* ---------- Waitlist form ---------- */
  var waitForm = document.getElementById("waitForm");
  if (waitForm) {
    waitForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("waitEmail");
      toast("🎉 You're on the list, " + email.value.split("@")[0] + "! (demo)");
      email.value = "";
    });
  }
})();
